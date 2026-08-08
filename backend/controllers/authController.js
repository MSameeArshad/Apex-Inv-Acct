const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).populate('role');
  if (user && (await user.matchPassword(password))) {
    user.lastLogin = new Date();
    await user.save();
    res.json({
      success: true,
      data: {
        _id: user._id, name: user.name, email: user.email, role: user.role,
        token: generateToken(user._id)
      }
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').populate('role');
  res.json({ success: true, data: user });
});
