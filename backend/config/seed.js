require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');
const Role = require('../models/Role');
const User = require('../models/User');
const AccountGroup = require('../models/AccountGroup');

const MODULES = ['sale', 'purchase', 'saleReturn', 'purchaseReturn', 'item', 'party', 'godown', 'account', 'voucher', 'report', 'user', 'fiscalPeriod'];

const allTrue = () => Object.fromEntries(MODULES.map(m => [m, { view: true, create: true, edit: true, delete: true }]));

const roleDefs = [
  { name: 'Admin', description: 'Full system access', isSystemRole: true, perms: allTrue() },
  { name: 'Accountant', description: 'Vouchers, ledgers, tax & financial reports', isSystemRole: true,
    perms: { voucher: { view: true, create: true, edit: true, delete: false }, account: { view: true, create: true, edit: true, delete: false },
      report: { view: true, create: false, edit: false, delete: false }, party: { view: true, create: true, edit: true, delete: false },
      fiscalPeriod: { view: true, create: true, edit: true, delete: false } } },
  { name: 'Inventory Manager', description: 'Item, Godown, Purchase, stock reports', isSystemRole: true,
    perms: { item: { view: true, create: true, edit: true, delete: false }, godown: { view: true, create: true, edit: true, delete: false },
      purchase: { view: true, create: true, edit: true, delete: false }, purchaseReturn: { view: true, create: true, edit: true, delete: false },
      report: { view: true, create: false, edit: false, delete: false } } },
  { name: 'Salesman', description: 'Sale and Sale Return only, restricted to assigned parties', isSystemRole: true,
    perms: { sale: { view: true, create: true, edit: false, delete: false }, saleReturn: { view: true, create: true, edit: false, delete: false },
      party: { view: true, create: false, edit: false, delete: false }, item: { view: true, create: false, edit: false, delete: false } } },
  { name: 'Cashier', description: 'Billing only', isSystemRole: true,
    perms: { sale: { view: true, create: true, edit: false, delete: false }, item: { view: true, create: false, edit: false, delete: false } } },
  { name: 'Viewer', description: 'Read-only across reports/ledgers', isSystemRole: true,
    perms: Object.fromEntries(MODULES.map(m => [m, { view: true, create: false, edit: false, delete: false }])) }
];

const toPermArray = (perms) => MODULES.map(m => ({
  module: m,
  actions: perms[m] || { view: false, create: false, edit: false, delete: false }
}));

const coaSeed = [
  { name: 'Assets', level: 1, natureType: 'Asset' },
  { name: 'Liabilities', level: 1, natureType: 'Liability' },
  { name: 'Income', level: 1, natureType: 'Income' },
  { name: 'Expenses', level: 1, natureType: 'Expense' },
  { name: 'Capital', level: 1, natureType: 'Capital' }
];

const run = async () => {
  await connectDB();

  console.log('Seeding roles...');
  const roleIds = {};
  for (const r of roleDefs) {
    const doc = await Role.findOneAndUpdate(
      { name: r.name },
      { name: r.name, description: r.description, isSystemRole: r.isSystemRole, permissions: toPermArray(r.perms) },
      { upsert: true, new: true }
    );
    roleIds[r.name] = doc._id;
  }

  console.log('Seeding starter Chart of Accounts (Level 1)...');
  const level1Ids = {};
  for (const a of coaSeed) {
    const doc = await AccountGroup.findOneAndUpdate(
      { name: a.name, level: 1 },
      { ...a, parent: null },
      { upsert: true, new: true }
    );
    level1Ids[a.name] = doc._id;
  }

  // A couple of essential level 2-4 accounts so the system is usable immediately
  const capitalSub = await AccountGroup.findOneAndUpdate(
    { name: 'Reserves & Surplus', level: 2 },
    { name: 'Reserves & Surplus', level: 2, parent: level1Ids['Capital'] },
    { upsert: true, new: true }
  );
  const retainedHead = await AccountGroup.findOneAndUpdate(
    { name: 'Retained Earnings Head', level: 3 },
    { name: 'Retained Earnings Head', level: 3, parent: capitalSub._id },
    { upsert: true, new: true }
  );
  await AccountGroup.findOneAndUpdate(
    { name: 'Retained Earnings', level: 4 },
    { name: 'Retained Earnings', level: 4, parent: retainedHead._id, isLeaf: true, balanceType: 'Credit' },
    { upsert: true, new: true }
  );

  console.log('Seeding default Admin user...');
  const adminEmail = 'admin@example.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({ name: 'Administrator', email: adminEmail, password: 'ChangeMe123!', role: roleIds['Admin'] });
    console.log(`Admin created: ${adminEmail} / ChangeMe123!  -- CHANGE THIS PASSWORD IMMEDIATELY`);
  } else {
    console.log('Admin user already exists, skipping.');
  }

  console.log('Seed complete.');
  await mongoose.connection.close();
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
