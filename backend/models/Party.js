const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Customer', 'Supplier', 'Both'], default: 'Customer' },
  phone: String,
  whatsappNumber: String,
  email: String,
  address: String,
  ledgerAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'AccountGroup' }, // level-4 ledger for this party
  creditLimit: { type: Number, default: 0 },
  creditTermDays: { type: Number, default: 30 },
  ntn: String,
  strn: String,
  taxStatus: { type: String, enum: ['Filer', 'Non-Filer'], default: 'Non-Filer' },
  isSalesTaxRegistered: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Party', partySchema);
