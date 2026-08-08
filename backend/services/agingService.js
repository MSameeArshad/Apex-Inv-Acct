const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');

const AGING_BUCKETS = [
  { label: '0-30', min: 0, max: 30 },
  { label: '31-60', min: 31, max: 60 },
  { label: '61-90', min: 61, max: 90 },
  { label: '91-120', min: 91, max: 120 },
  { label: '120+', min: 121, max: Infinity }
];

const getBucket = (daysOverdue) => AGING_BUCKETS.find(b => daysOverdue >= b.min && daysOverdue <= b.max)?.label || '120+';

const generateAgingReport = async ({ type, asOfDate = new Date(), partyId }) => {
  const Model = type === 'Receivable' ? Sale : Purchase;
  const filter = { balanceDue: { $gt: 0 } };
  if (partyId) filter.partyId = partyId;

  const invoices = await Model.find(filter).populate('partyId', 'name');

  const detail = invoices.map(inv => {
    const daysOverdue = Math.max(0, Math.floor((asOfDate - inv.dueDate) / (1000 * 60 * 60 * 24)));
    return {
      partyName: inv.partyId?.name || 'Unknown',
      invoiceNo: inv.invoiceNo,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      balanceDue: inv.balanceDue,
      daysOverdue,
      bucket: getBucket(daysOverdue)
    };
  });

  const summary = {};
  for (const row of detail) {
    if (!summary[row.partyName]) {
      summary[row.partyName] = Object.fromEntries(AGING_BUCKETS.map(b => [b.label, 0]));
      summary[row.partyName].total = 0;
    }
    summary[row.partyName][row.bucket] += row.balanceDue;
    summary[row.partyName].total += row.balanceDue;
  }

  return { detail, summary };
};

module.exports = { generateAgingReport, getBucket, AGING_BUCKETS };
