const mongoose = require('mongoose');
const lineItemSchema = require('./lineItemSchema');

const purchaseReturnSchema = new mongoose.Schema({
  returnNo: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase', required: true },
  partyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
  godownId: { type: mongoose.Schema.Types.ObjectId, ref: 'Godown', required: true },
  items: [lineItemSchema], // each line references batchId to return against a specific batch
  netAmount: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseReturn', purchaseReturnSchema);
