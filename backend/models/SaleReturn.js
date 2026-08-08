const mongoose = require('mongoose');
const lineItemSchema = require('./lineItemSchema');

const saleReturnSchema = new mongoose.Schema({
  returnNo: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  partyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
  godownId: { type: mongoose.Schema.Types.ObjectId, ref: 'Godown', required: true },
  items: [lineItemSchema],
  netAmount: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('SaleReturn', saleReturnSchema);
