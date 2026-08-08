const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/checkPermission');
const checkPeriodLock = require('../middleware/checkPeriodLock');
const { createVoucher, getVouchers, allocatePayment } = require('../controllers/voucherController');

router.use(authenticate);
router.post('/', checkPermission('voucher', 'create'), checkPeriodLock, createVoucher);
router.get('/', checkPermission('voucher', 'view'), getVouchers);
router.post('/allocate-payment', checkPermission('voucher', 'create'), allocatePayment);

module.exports = router;
