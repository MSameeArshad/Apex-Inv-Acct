const mongoose = require('mongoose');
const lineItemSchema = require('./lineItemSchema');

const saleSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  invoiceDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  partyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
  godownId: { type: mongoose.Schema.Types.ObjectId, ref: 'Godown', required: true },
  items: [lineItemSchema],
  paymentType: { type: String, enum: ['Cash', 'Credit'], default: 'Cash' },
  deliveredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // salesman
  grossAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  salesTaxTotal: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  balanceDue: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Unpaid', 'Partial', 'Paid'], default: 'Unpaid' },
  whatsappStatus: {
    sent: { type: Boolean, default: false },
    sentAt: Date,
    messageId: String
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
