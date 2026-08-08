const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Role = require('../models/Role');

exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, assignedParties } = req.body;
  const exists = await User.findOne({ email });
  if (exists) { res.status(400); throw new Error('User with this email already exists'); }
  const user = await User.create({ name, email, password, role, assignedParties });
  res.status(201).json({ success: true, data: user });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').populate('role', 'name');
  res.json({ success: true, data: users });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  Object.assign(user, req.body);
  await user.save();
  res.json({ success: true, data: user });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'User deactivated' });
});

exports.createRole = asyncHandler(async (req, res) => {
  const role = await Role.create(req.body);
  res.status(201).json({ success: true, data: role });
});

exports.getRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find();
  res.json({ success: true, data: roles });
});

exports.updateRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) { res.status(404); throw new Error('Role not found'); }
  if (role.isSystemRole) { res.status(400); throw new Error('Cannot modify a system role'); }
  Object.assign(role, req.body);
  await role.save();
  res.json({ success: true, data: role });
});
