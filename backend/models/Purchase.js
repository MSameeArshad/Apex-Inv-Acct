const mongoose = require('mongoose');
const lineItemSchema = require('./lineItemSchema');

const purchaseSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  partyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
  godownId: { type: mongoose.Schema.Types.ObjectId, ref: 'Godown', required: true },
  items: [lineItemSchema],
  grossAmount: { type: Number, required: true },
  salesTaxTotal: { type: Number, default: 0 },
  withholdingTaxTotal: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  balanceDue: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Unpaid', 'Partial', 'Paid'], default: 'Unpaid' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
