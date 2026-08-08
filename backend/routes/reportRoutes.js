const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/checkPermission');
const r = require('../controllers/reportController');

router.use(authenticate);
router.get('/trial-balance', checkPermission('report', 'view'), r.trialBalance);
router.get('/income-statement', checkPermission('report', 'view'), r.incomeStatement);
router.get('/stock-valuation', checkPermission('report', 'view'), r.stockValuation);
router.get('/sales-tax-summary', checkPermission('report', 'view'), r.salesTaxSummary);
router.get('/withholding-statement', checkPermission('report', 'view'), r.withholdingStatement);
router.get('/aging', checkPermission('report', 'view'), r.aging);

module.exports = router;
