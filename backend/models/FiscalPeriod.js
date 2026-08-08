const mongoose = require('mongoose');

const fiscalPeriodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['Open', 'Closing', 'Closed'], default: 'Open' },
  closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  closedAt: Date,
  netProfitLoss: Number,
  closingVoucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' }
}, { timestamps: true });

module.exports = mongoose.model('FiscalPeriod', fiscalPeriodSchema);
