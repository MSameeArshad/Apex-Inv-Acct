const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Purchase = require('../models/Purchase');
const Party = require('../models/Party');
const Item = require('../models/Item');
const SalesTaxLedger = require('../models/SalesTaxLedger');
const WithholdingTaxLedger = require('../models/WithholdingTaxLedger');
const { receiveBatch } = require('../services/fifoService');
const { computeLineTax, computeWithholdingTax } = require('../services/taxService');

exports.createPurchase = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { invoiceNo, date, partyId, godownId, items, applyWithholding = false } = req.body;
    const party = await Party.findById(partyId).session(session);
    if (!party) throw new Error('Party not found');

    let grossAmount = 0, salesTaxTotal = 0;
    const lineItems = [];

    for (const line of items) {
      const item = await Item.findById(line.itemId).session(session);
      if (!item) throw new Error(`Item not found: ${line.itemId}`);

      const batchDoc = await receiveBatch({
        itemId: item._id, godownId, batchNo: line.batchNo, receivedDate: date,
        sourceType: 'Purchase', sourceRefId: new mongoose.Types.ObjectId(),
        rate: line.rate, qty: line.qty, session
      });

      const tax = computeLineTax(line, item);
      const amount = line.qty * line.rate;
      grossAmount += amount;
      salesTaxTotal += tax.salesTaxAmount;

      lineItems.push({
        itemId: item._id, qty: line.qty, rate: line.rate,
        retailPrice: item.retailPrice, isThirdSchedule: item.isThirdSchedule,
        salesTaxAmount: tax.salesTaxAmount, amount
      });
    }

    let withholdingTaxTotal = 0;
    if (applyWithholding) {
      const wht = computeWithholdingTax(grossAmount, party.taxStatus, 'goods');
      withholdingTaxTotal = wht.taxDeducted;
    }

    const netAmount = grossAmount + salesTaxTotal - withholdingTaxTotal;

    const purchase = await Purchase.create([{
      invoiceNo, date, partyId, godownId, items: lineItems,
      grossAmount, salesTaxTotal, withholdingTaxTotal, netAmount,
      balanceDue: netAmount, paymentStatus: 'Unpaid', createdBy: req.user._id
    }], { session });

    for (const line of lineItems) {
      if (line.salesTaxAmount > 0) {
        await SalesTaxLedger.create([{
          transactionType: 'Purchase', refId: purchase[0]._id, refModel: 'Purchase', partyId,
          date, taxableAmount: line.amount, taxRate: 0, taxAmount: line.salesTaxAmount,
          taxCategory: 'Input', isThirdSchedule: line.isThirdSchedule
        }], { session });
      }
    }

    if (withholdingTaxTotal > 0) {
      await WithholdingTaxLedger.create([{
        transactionType: 'Purchase', refId: purchase[0]._id, partyId, date,
        grossAmount, witholdingRate: (withholdingTaxTotal / grossAmount) * 100,
        taxDeducted: withholdingTaxTotal, netPayable: grossAmount - withholdingTaxTotal
      }], { session });
    }

    await session.commitTransaction();
    res.status(201).json({ success: true, data: purchase[0] });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});

exports.getPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find().populate('partyId', 'name').sort('-date');
  res.json({ success: true, data: purchases });
});
