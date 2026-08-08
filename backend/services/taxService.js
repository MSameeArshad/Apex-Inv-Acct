// Third Schedule (Pakistan FMCG Sales Tax) line-level tax computation
const computeLineTax = (line, item) => {
  if (item.isThirdSchedule) {
    return { salesTaxAmount: 0, taxBase: item.retailPrice, note: 'Third Schedule item - tax pre-paid upstream, no further tax charged' };
  }
  const taxAmount = line.rate * line.qty * ((item.salesTaxRate || 0) / 100);
  return { salesTaxAmount: taxAmount, taxBase: line.rate * line.qty };
};

// Withholding (income) tax - illustrative slabs, confirm current FBR rates before production use
const rateSlabs = {
  Filer: { goods: 4.5, services: 8 },
  'Non-Filer': { goods: 9, services: 16 }
};

const computeWithholdingTax = (grossAmount, taxStatus, category) => {
  const status = rateSlabs[taxStatus] ? taxStatus : 'Non-Filer';
  const rate = rateSlabs[status][category] ?? rateSlabs[status].goods;
  const taxDeducted = grossAmount * (rate / 100);
  return { rate, taxDeducted, netPayable: grossAmount - taxDeducted };
};

module.exports = { computeLineTax, computeWithholdingTax };
