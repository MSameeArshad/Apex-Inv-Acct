const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/checkPermission');
const { createPeriod, getPeriods, closePeriod } = require('../controllers/fiscalPeriodController');

router.use(authenticate);
router.post('/', checkPermission('fiscalPeriod', 'create'), createPeriod);
router.get('/', checkPermission('fiscalPeriod', 'view'), getPeriods);
router.post('/:periodId/close', checkPermission('fiscalPeriod', 'edit'), closePeriod);

module.exports = router;
