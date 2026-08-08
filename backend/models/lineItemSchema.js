// Shared sub-schema used by Sale / Purchase line items
const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  qty: { type: Number, required: true },
  rate: { type: Number, required: true },
  retailPrice: Number, // MRP snapshot for Third Schedule items
  isThirdSchedule: { type: Boolean, default: false },
  salesTaxAmount: { type: Number, default: 0 },
  cogs: { type: Number, default: 0 }, // filled by FIFO consumption on Sale
  amount: { type: Number, required: true }
}, { _id: false });

module.exports = lineItemSchema;
