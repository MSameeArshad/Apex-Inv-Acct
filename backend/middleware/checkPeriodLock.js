const FiscalPeriod = require('../models/FiscalPeriod');

const checkPeriodLock = async (req, res, next) => {
  try {
    const txDate = new Date(req.body.date || req.body.invoiceDate);
    if (isNaN(txDate)) return next();
    const lockedPeriod = await FiscalPeriod.findOne({
      startDate: { $lte: txDate },
      endDate: { $gte: txDate },
      status: 'Closed'
    });
    if (lockedPeriod) {
      return res.status(423).json({ success: false, message: `Period ${lockedPeriod.name} is locked. Cannot modify transactions in this date range.` });
    }
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = checkPeriodLock;
