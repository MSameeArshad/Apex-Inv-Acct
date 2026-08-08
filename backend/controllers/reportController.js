const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const AccountGroup = require('../models/AccountGroup');
const Voucher = require('../models/Voucher');
const StockBatch = require('../models/StockBatch');
const SalesTaxLedger = require('../models/SalesTaxLedger');
const WithholdingTaxLedger = require('../models/WithholdingTaxLedger');
const { generateAgingReport } = require('../services/agingService');

// Trial Balance - rolls up leaf-account balances via parent references
exports.trialBalance = asyncHandler(async (req, res) => {
  const { asOf } = req.query;
  const cutoff = asOf ? new Date(asOf) : new Date();
  const leaves = await AccountGroup.find({ isLeaf: true, isActive: true });

  const rows = [];
  for (const acc of leaves) {
    const agg = await Voucher.aggregate([
      { $match: { date: { $lte: cutoff } } },
      { $unwind: '$entries' },
      { $match: { 'entries.accountId': acc._id } },
      { $group: { _id: null, debit: { $sum: '$entries.debit' }, credit: { $sum: '$entries.credit' } } }
    ]);
    const debit = (agg[0]?.debit || 0) + (acc.balanceType === 'Debit' ? acc.openingBalance : 0);
    const credit = (agg[0]?.credit || 0) + (acc.balanceType === 'Credit' ? acc.openingBalance : 0);
    if (debit !== 0 || credit !== 0) {
      rows.push({ account: acc.name, debit, credit, balance: debit - credit });
    }
  }
  const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0);
  res.json({ success: true, data: { rows, totalDebit, totalCredit } });
});

// Income Statement (P&L)
exports.incomeStatement = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const startDate = new Date(from);
  const endDate = new Date(to);

  const buildSection = async (natureType, sign) => {
    const accounts = await AccountGroup.find({ natureType, isLeaf: true, isActive: true });
    const rows = [];
    for (const acc of accounts) {
      const agg = await Voucher.aggregate([
        { $match: { date: { $gte: startDate, $lte: endDate } } },
        { $unwind: '$entries' },
        { $match: { 'entries.accountId': acc._id } },
        { $group: { _id: null, debit: { $sum: '$entries.debit' }, credit: { $sum: '$entries.credit' } } }
      ]);
      const amount = sign * ((agg[0]?.credit || 0) - (agg[0]?.debit || 0)) * (sign === -1 ? -1 : 1);
      if (amount) rows.push({ account: acc.name, amount: Math.abs(amount) });
    }
    return rows;
  };

  const income = await buildSection('Income', 1);
  const expense = await buildSection('Expense', -1);
  const totalIncome = income.reduce((s, r) => s + r.amount, 0);
  const totalExpense = expense.reduce((s, r) => s + r.amount, 0);

  res.json({ success: true, data: { income, expense, totalIncome, totalExpense, netProfitLoss: totalIncome - totalExpense } });
});

// Stock valuation - FIFO closing value per item
exports.stockValuation = asyncHandler(async (req, res) => {
  const batches = await StockBatch.find({ qtyRemaining: { $gt: 0 } }).populate('itemId', 'name sku unit');
  const byItem = {};
  for (const b of batches) {
    const key = b.itemId._id;
    if (!byItem[key]) byItem[key] = { item: b.itemId.name, sku: b.itemId.sku, unit: b.itemId.unit, qty: 0, value: 0, batches: [] };
    byItem[key].qty += b.qtyRemaining;
    byItem[key].value += b.qtyRemaining * b.rate;
    byItem[key].batches.push({ batchNo: b.batchNo, receivedDate: b.receivedDate, rate: b.rate, qtyRemaining: b.qtyRemaining });
  }
  res.json({ success: true, data: Object.values(byItem) });
});

// Sales Tax Summary (Output - Input), split by Third Schedule vs Standard
exports.salesTaxSummary = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const filter = from && to ? { date: { $gte: new Date(from), $lte: new Date(to) } } : {};
  const entries = await SalesTaxLedger.find(filter);
  const output = entries.filter(e => e.taxCategory === 'Output').reduce((s, e) => s + e.taxAmount, 0);
  const input = entries.filter(e => e.taxCategory === 'Input').reduce((s, e) => s + e.taxAmount, 0);
  const thirdScheduleSales = entries.filter(e => e.isThirdSchedule && e.taxCategory === 'Output').reduce((s, e) => s + e.taxableAmount, 0);
  res.json({ success: true, data: { outputTax: output, inputTax: input, netPayable: output - input, thirdScheduleSalesValue: thirdScheduleSales } });
});

// Withholding Tax statement
exports.withholdingStatement = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const filter = from && to ? { date: { $gte: new Date(from), $lte: new Date(to) } } : {};
  const entries = await WithholdingTaxLedger.find(filter).populate('partyId', 'name ntn');
  res.json({ success: true, data: entries });
});

// Aging - Receivables / Payables
exports.aging = asyncHandler(async (req, res) => {
  const { type = 'Receivable', asOf, partyId } = req.query;
  const result = await generateAgingReport({ type, asOfDate: asOf ? new Date(asOf) : new Date(), partyId });
  res.json({ success: true, data: result });
});
