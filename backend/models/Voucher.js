const mongoose = require('mongoose');

const voucherEntrySchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'AccountGroup', required: true },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  narration: String
}, { _id: false });

const voucherSchema = new mongoose.Schema({
  voucherNo: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Journal', 'Payment', 'Receipt', 'Contra', 'Closing', 'Opening'], required: true },
  date: { type: Date, required: true },
  entries: [voucherEntrySchema],
  totalDebit: { type: Number, required: true },
  totalCredit: { type: Number, required: true },
  narration: String,
  isClosingEntry: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

voucherSchema.pre('validate', function (next) {
  const debitSum = this.entries.reduce((s, e) => s + (e.debit || 0), 0);
  const creditSum = this.entries.reduce((s, e) => s + (e.credit || 0), 0);
  if (Math.abs(debitSum - creditSum) > 0.01) {
    return next(new Error('Voucher entries are not balanced: total debit must equal total credit'));
  }
  this.totalDebit = debitSum;
  this.totalCredit = creditSum;
  next();
});

module.exports = mongoose.model('Voucher', voucherSchema);
