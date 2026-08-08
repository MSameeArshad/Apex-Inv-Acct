const mongoose = require('mongoose');

// 4-level Chart of Accounts: 1=Group, 2=Sub-Group, 3=Ledger Head, 4=Ledger (leaf/transactional)
const accountGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, unique: true, sparse: true },
  level: { type: Number, required: true, min: 1, max: 4 },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'AccountGroup', default: null },
  natureType: {
    type: String,
    enum: ['Asset', 'Liability', 'Income', 'Expense', 'Capital'],
    required: function () { return this.level === 1; }
  },
  isLeaf: { type: Boolean, default: false },
  openingBalance: { type: Number, default: 0 },
  balanceType: { type: String, enum: ['Debit', 'Credit'], default: 'Debit' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

accountGroupSchema.pre('validate', function (next) {
  if (this.level < 4 && this.isLeaf) {
    return next(new Error('Only level 4 accounts can be marked as leaf/transactional'));
  }
  if (this.level > 1 && !this.parent) {
    return next(new Error('Levels 2-4 require a parent account'));
  }
  next();
});

module.exports = mongoose.model('AccountGroup', accountGroupSchema);
