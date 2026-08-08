const mongoose = require('mongoose');

const paymentAllocationSchema = new mongoose.Schema({
  paymentVoucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', required: true },
  invoiceType: { type: String, enum: ['Sale', 'Purchase'], required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  partyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
  amountAllocated: { type: Number, required: true },
  allocationDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('PaymentAllocation', paymentAllocationSchema);
