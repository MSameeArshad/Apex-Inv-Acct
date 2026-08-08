const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/checkPermission');
const checkPeriodLock = require('../middleware/checkPeriodLock');
const { createSale, getSales, getSaleById, resendWhatsapp } = require('../controllers/saleController');

router.use(authenticate);
router.post('/', checkPermission('sale', 'create'), checkPeriodLock, createSale);
router.get('/', checkPermission('sale', 'view'), getSales);
router.get('/:id', checkPermission('sale', 'view'), getSaleById);
router.post('/:id/resend-whatsapp', checkPermission('sale', 'edit'), resendWhatsapp);

module.exports = router;
