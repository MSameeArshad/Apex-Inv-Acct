const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const AccountGroup = require('../models/AccountGroup');
const Voucher = require('../models/Voucher');
const FiscalPeriod = require('../models/FiscalPeriod');

exports.createPeriod = asyncHandler(async (req, res) => {
  const period = await FiscalPeriod.create(req.body);
  res.status(201).json({ success: true, data: period });
});

exports.getPeriods = asyncHandler(async (req, res) => {
  const periods = await FiscalPeriod.find().sort('-startDate');
  res.json({ success: true, data: periods });
});

const sumBalance = async (accounts, startDate, endDate, session) => {
  let total = 0;
  for (const acc of accounts) {
    const agg = await Voucher.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$entries' },
      { $match: { 'entries.accountId': acc._id } },
      { $group: { _id: null, credit: { $sum: '$entries.credit' }, debit: { $sum: '$entries.debit' } } }
    ]).session(session);
    if (agg[0]) total += (agg[0].credit - agg[0].debit);
  }
  return total;
};

exports.closePeriod = asyncHandler(async (req, res) => {
  const { periodId } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const period = await FiscalPeriod.findById(periodId).session(session);
    if (!period || period.status === 'Closed') throw new Error('Invalid or already-closed period');

    const unbalanced = await Voucher.find({
      date: { $gte: period.startDate, $lte: period.endDate },
      $expr: { $ne: ['$totalDebit', '$totalCredit'] }
    }).session(session);
    if (unbalanced.length > 0) throw new Error(`${unbalanced.length} unbalanced voucher(s) found - cannot close`);

    const incomeAccounts = await AccountGroup.find({ natureType: 'Income', isLeaf: true }).session(session);
    const expenseAccounts = await AccountGroup.find({ natureType: 'Expense', isLeaf: true }).session(session);

    const totalIncome = await sumBalance(incomeAccounts, period.startDate, period.endDate, session);
    const totalExpense = -(await sumBalance(expenseAccounts, period.startDate, period.endDate, session));
    const netProfitLoss = totalIncome - totalExpense;

    const retainedEarnings = await AccountGroup.findOne({ name: 'Retained Earnings', isLeaf: true }).session(session);
    if (!retainedEarnings) throw new Error('Retained Earnings ledger account not found - create it under Capital before closing');

    const closingVoucher = await Voucher.create([{
      voucherNo: `CLOSE-${period.name}-${Date.now()}`,
      type: 'Closing', date: period.endDate,
      entries: [{
        accountId: retainedEarnings._id,
        debit: netProfitLoss < 0 ? Math.abs(netProfitLoss) : 0,
        credit: netProfitLoss > 0 ? netProfitLoss : 0
      }],
      totalDebit: netProfitLoss < 0 ? Math.abs(netProfitLoss) : 0,
      totalCredit: netProfitLoss > 0 ? netProfitLoss : 0,
      narration: `Period closing for ${period.name}`,
      isClosingEntry: true,
      createdBy: req.user._id
    }], { session });

    period.status = 'Closed';
    period.netProfitLoss = netProfitLoss;
    period.closedBy = req.user._id;
    period.closedAt = new Date();
    period.closingVoucherId = closingVoucher[0]._id;
    await period.save({ session });

    await session.commitTransaction();
    res.json({ success: true, data: { period, netProfitLoss } });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});
