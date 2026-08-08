const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Party = require('../models/Party');
const User = require('../models/User');
const Item = require('../models/Item');
const SalesTaxLedger = require('../models/SalesTaxLedger');
const { consumeFIFO } = require('../services/fifoService');
const { computeLineTax } = require('../services/taxService');
const { sendCreditConfirmation } = require('../services/whatsappService');

exports.createSale = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { invoiceNo, invoiceDate, partyId, godownId, items, paymentType, deliveredBy, discount = 0 } = req.body;

    const party = await Party.findById(partyId).session(session);
    if (!party) throw new Error('Party not found');

    let grossAmount = 0, salesTaxTotal = 0;
    const lineItems = [];

    for (const line of items) {
      const item = await Item.findById(line.itemId).session(session);
      if (!item) throw new Error(`Item not found: ${line.itemId}`);

      if (item.isThirdSchedule && line.rate > item.retailPrice) {
        throw new Error(`Cannot sell ${item.name} above MRP of ${item.retailPrice}`);
      }

      const { consumeFIFOResult } = {};
      const { totalCost } = await consumeFIFO({
        itemId: item._id, godownId, qtyNeeded: line.qty,
        issueType: 'Sale', issueRefId: new mongoose.Types.ObjectId(), session
      });

      const tax = computeLineTax(line, item);
      const amount = line.qty * line.rate;
      grossAmount += amount;
      salesTaxTotal += tax.salesTaxAmount;

      lineItems.push({
        itemId: item._id, qty: line.qty, rate: line.rate,
        retailPrice: item.retailPrice, isThirdSchedule: item.isThirdSchedule,
        salesTaxAmount: tax.salesTaxAmount, cogs: totalCost, amount
      });
    }

    const netAmount = grossAmount - discount + salesTaxTotal;
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + (party.creditTermDays || 0));

    const sale = await Sale.create([{
      invoiceNo, invoiceDate, dueDate, partyId, godownId, items: lineItems,
      paymentType, deliveredBy, grossAmount, discount, salesTaxTotal, netAmount,
      balanceDue: paymentType === 'Credit' ? netAmount : 0,
      paymentStatus: paymentType === 'Credit' ? 'Unpaid' : 'Paid',
      amountPaid: paymentType === 'Credit' ? 0 : netAmount,
      createdBy: req.user._id
    }], { session });

    // Sales tax output ledger entries
    for (const line of lineItems) {
      if (line.salesTaxAmount > 0) {
        await SalesTaxLedger.create([{
          transactionType: 'Sale', refId: sale[0]._id, refModel: 'Sale', partyId,
          date: invoiceDate, taxableAmount: line.amount, taxRate: 0,
          taxAmount: line.salesTaxAmount, taxCategory: 'Output', isThirdSchedule: line.isThirdSchedule
        }], { session });
      }
    }

    await session.commitTransaction();

    // WhatsApp confirmation for credit invoices - fire after commit, never rolls back the sale
    if (sale[0].paymentType === 'Credit') {
      try {
        const salesman = deliveredBy ? await User.findById(deliveredBy) : null;
        const waResult = await sendCreditConfirmation({
          toNumber: party.whatsappNumber || party.phone,
          clientName: party.name,
          invoiceNo: sale[0].invoiceNo,
          amount: sale[0].netAmount,
          salesmanName: salesman?.name || 'N/A'
        });
        sale[0].whatsappStatus = { sent: true, sentAt: new Date(), messageId: waResult.messages?.[0]?.id };
      } catch (waErr) {
        sale[0].whatsappStatus = { sent: false };
        console.error('WhatsApp send failed:', waErr.message);
      }
      await sale[0].save();
    }

    res.status(201).json({ success: true, data: sale[0] });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});

exports.getSales = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role?.name === 'Salesman') filter.partyId = { $in: req.user.assignedParties };
  const sales = await Sale.find(filter).populate('partyId', 'name').populate('deliveredBy', 'name').sort('-invoiceDate');
  res.json({ success: true, data: sales });
});

exports.getSaleById = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id).populate('partyId').populate('deliveredBy', 'name').populate('items.itemId', 'name sku');
  if (!sale) { res.status(404); throw new Error('Sale not found'); }
  res.json({ success: true, data: sale });
});

exports.resendWhatsapp = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id).populate('partyId').populate('deliveredBy', 'name');
  if (!sale) { res.status(404); throw new Error('Sale not found'); }
  const waResult = await sendCreditConfirmation({
    toNumber: sale.partyId.whatsappNumber || sale.partyId.phone,
    clientName: sale.partyId.name, invoiceNo: sale.invoiceNo,
    amount: sale.netAmount, salesmanName: sale.deliveredBy?.name || 'N/A'
  });
  sale.whatsappStatus = { sent: true, sentAt: new Date(), messageId: waResult.messages?.[0]?.id };
  await sale.save();
  res.json({ success: true, data: sale });
});
