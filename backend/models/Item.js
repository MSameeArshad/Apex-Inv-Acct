const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, unique: true, sparse: true },
  barcode: String,
  category: String,
  unit: { type: String, default: 'PCS' },
  reorderLevel: { type: Number, default: 0 },
  purchaseRate: { type: Number, default: 0 },
  saleRate: { type: Number, default: 0 },
  // Third Schedule (Pakistan FMCG Sales Tax) fields
  isThirdSchedule: { type: Boolean, default: false },
  retailPrice: { type: Number }, // MRP - tax base for Third Schedule items
  salesTaxRate: { type: Number, default: 17 },
  taxIncludedInMRP: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
