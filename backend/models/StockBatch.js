const mongoose = require('mongoose');

// FIFO batch tracking - every stock receipt creates a batch, issues consume oldest-first
const stockBatchSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  godownId: { type: mongoose.Schema.Types.ObjectId, ref: 'Godown', required: true },
  batchNo: { type: String, required: true },
  receivedDate: { type: Date, required: true },
  sourceType: { type: String, enum: ['Purchase', 'PurchaseReturn', 'Adjustment', 'OpeningStock'], required: true },
  sourceRefId: { type: mongoose.Schema.Types.ObjectId },
  rate: { type: Number, required: true },
  qtyReceived: { type: Number, required: true },
  qtyRemaining: { type: Number, required: true },
  isExhausted: { type: Boolean, default: false }
}, { timestamps: true });

stockBatchSchema.index({ itemId: 1, godownId: 1, receivedDate: 1 });

module.exports = mongoose.model('StockBatch', stockBatchSchema);
