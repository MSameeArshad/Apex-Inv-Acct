const mongoose = require('mongoose');

// Audit trail: records exactly which batches an issue (sale/return/adjustment) drew from
const stockConsumptionSchema = new mongoose.Schema({
  issueType: { type: String, enum: ['Sale', 'PurchaseReturn', 'Adjustment'], required: true },
  issueRefId: { type: mongoose.Schema.Types.ObjectId, required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'StockBatch', required: true },
  qtyConsumed: { type: Number, required: true },
  rateAtConsumption: { type: Number, required: true },
  amount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('StockConsumption', stockConsumptionSchema);
