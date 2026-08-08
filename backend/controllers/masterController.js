const asyncHandler = require('express-async-handler');
const AccountGroup = require('../models/AccountGroup');
const Party = require('../models/Party');
const Item = require('../models/Item');
const Godown = require('../models/Godown');

// ---- Account Group (4-level Chart of Accounts) ----
exports.createAccountGroup = asyncHandler(async (req, res) => {
  if (req.body.level > 1) {
    const parent = await AccountGroup.findById(req.body.parent);
    if (!parent) { res.status(400); throw new Error('Parent account not found'); }
    if (parent.level !== req.body.level - 1) { res.status(400); throw new Error('Parent must be exactly one level above'); }
  }
  const acc = await AccountGroup.create(req.body);
  res.status(201).json({ success: true, data: acc });
});

exports.getAccountTree = asyncHandler(async (req, res) => {
  const all = await AccountGroup.find({ isActive: true }).lean();
  const byId = {};
  all.forEach(a => { a.children = []; byId[a._id] = a; });
  const roots = [];
  all.forEach(a => {
    if (a.parent && byId[a.parent]) byId[a.parent].children.push(a);
    else if (!a.parent) roots.push(a);
  });
  res.json({ success: true, data: roots });
});

exports.getLeafAccounts = asyncHandler(async (req, res) => {
  const leaves = await AccountGroup.find({ isLeaf: true, isActive: true });
  res.json({ success: true, data: leaves });
});

// ---- Party ----
exports.createParty = asyncHandler(async (req, res) => {
  const party = await Party.create(req.body);
  res.status(201).json({ success: true, data: party });
});
exports.getParties = asyncHandler(async (req, res) => {
  const parties = await Party.find({ isActive: true });
  res.json({ success: true, data: parties });
});
exports.updateParty = asyncHandler(async (req, res) => {
  const party = await Party.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: party });
});

// ---- Item ----
exports.createItem = asyncHandler(async (req, res) => {
  const item = await Item.create(req.body);
  res.status(201).json({ success: true, data: item });
});
exports.getItems = asyncHandler(async (req, res) => {
  const items = await Item.find({ isActive: true });
  res.json({ success: true, data: items });
});
exports.updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: item });
});

// ---- Godown ----
exports.createGodown = asyncHandler(async (req, res) => {
  const godown = await Godown.create(req.body);
  res.status(201).json({ success: true, data: godown });
});
exports.getGodowns = asyncHandler(async (req, res) => {
  const godowns = await Godown.find({ isActive: true });
  res.json({ success: true, data: godowns });
});
