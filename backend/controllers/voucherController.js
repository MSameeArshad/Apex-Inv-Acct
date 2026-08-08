const asyncHandler = require('express-async-handler');
const Voucher = require('../models/Voucher');
const PaymentAllocation = require('../models/PaymentAllocation');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');

exports.createVoucher = asyncHandler(async (req, res) => {
  const voucher = await Voucher.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, data: voucher });
});

exports.getVouchers = asyncHandler(async (req, res) => {
  const vouchers = await Voucher.find().populate('entries.accountId', 'name').sort('-date');
  res.json({ success: true, data: vouchers });
});

// Allocate a Payment/Receipt voucher against outstanding Sale/Purchase invoices (updates aging balances)
exports.allocatePayment = asyncHandler(async (req, res) => {
  const { voucherId, invoiceType, invoiceId, amount, partyId, date } = req.body;
  const Model = invoiceType === 'Sale' ? Sale : Purchase;
  const invoice = await Model.findById(invoiceId);
  if (!invoice) { res.status(404); throw new Error('Invoice not found'); }
  if (amount > invoice.balanceDue) { res.status(400); throw new Error('Allocation exceeds balance due'); }

  invoice.amountPaid += amount;
  invoice.balanceDue -= amount;
  invoice.paymentStatus = invoice.balanceDue === 0 ? 'Paid' : 'Partial';
  await invoice.save();

  const allocation = await PaymentAllocation.create({
    paymentVoucherId: voucherId, invoiceType, invoiceId, partyId,
    amountAllocated: amount, allocationDate: date || new Date()
  });

  res.status(201).json({ success: true, data: allocation });
});
