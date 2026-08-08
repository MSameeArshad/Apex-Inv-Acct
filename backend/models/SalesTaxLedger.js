const mongoose = require('mongoose');

const salesTaxLedgerSchema = new mongoose.Schema({
  transactionType: { type: String, enum: ['Sale', 'Purchase', 'SaleReturn', 'PurchaseReturn'], required: true },
  refId: { type: mongoose.Schema.Types.ObjectId, required: true },
  refModel: { type: String, required: true },
  partyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Party' },
  date: { type: Date, required: true },
  taxableAmount: { type: Number, required: true },
  taxRate: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  taxCategory: { type: String, enum: ['Output', 'Input'], required: true },
  isThirdSchedule: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('SalesTaxLedger', salesTaxLedgerSchema);
