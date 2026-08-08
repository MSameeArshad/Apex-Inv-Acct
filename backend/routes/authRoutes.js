const express = require('express');
const router = express.Router();
const { login, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/profile', authenticate, getProfile);

module.exports = router;
