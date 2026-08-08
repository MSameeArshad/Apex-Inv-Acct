const mongoose = require('mongoose');

const withholdingTaxSchema = new mongoose.Schema({
  transactionType: { type: String, enum: ['Purchase', 'Payment', 'Service'], required: true },
  refId: { type: mongoose.Schema.Types.ObjectId, required: true },
  partyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
  date: { type: Date, required: true },
  grossAmount: { type: Number, required: true },
  witholdingRate: { type: Number, required: true },
  taxDeducted: { type: Number, required: true },
  netPayable: { type: Number, required: true },
  section: String,
  challanNo: String,
  depositedToFBR: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('WithholdingTaxLedger', withholdingTaxSchema);
