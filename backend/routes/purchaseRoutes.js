const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/checkPermission');
const checkPeriodLock = require('../middleware/checkPeriodLock');
const { createPurchase, getPurchases } = require('../controllers/purchaseController');

router.use(authenticate);
router.post('/', checkPermission('purchase', 'create'), checkPeriodLock, createPurchase);
router.get('/', checkPermission('purchase', 'view'), getPurchases);

module.exports = router;
