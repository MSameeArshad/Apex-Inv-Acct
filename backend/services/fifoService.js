const StockBatch = require('../models/StockBatch');
const StockConsumption = require('../models/StockConsumption');

/**
 * Consumes qtyNeeded from oldest batches first (FIFO) for a given item/godown.
 * Must be called inside a Mongoose session/transaction.
 */
const consumeFIFO = async ({ itemId, godownId, qtyNeeded, issueType, issueRefId, session }) => {
  const batches = await StockBatch.find({
    itemId, godownId, qtyRemaining: { $gt: 0 }
  }).sort({ receivedDate: 1, createdAt: 1 }).session(session);

  let remaining = qtyNeeded;
  const consumptionRecords = [];
  let totalCost = 0;

  for (const batch of batches) {
    if (remaining <= 0) break;
    const qtyFromBatch = Math.min(batch.qtyRemaining, remaining);
    batch.qtyRemaining -= qtyFromBatch;
    batch.isExhausted = batch.qtyRemaining === 0;
    await batch.save({ session });

    consumptionRecords.push({
      issueType, issueRefId, itemId,
      batchId: batch._id,
      qtyConsumed: qtyFromBatch,
      rateAtConsumption: batch.rate,
      amount: qtyFromBatch * batch.rate
    });

    totalCost += qtyFromBatch * batch.rate;
    remaining -= qtyFromBatch;
  }

  if (remaining > 0) {
    throw new Error(`Insufficient stock for item ${itemId}. Short by ${remaining} units.`);
  }

  await StockConsumption.insertMany(consumptionRecords, { session });
  return { totalCost, avgRate: totalCost / qtyNeeded, consumptionRecords };
};

const receiveBatch = async ({ itemId, godownId, batchNo, receivedDate, sourceType, sourceRefId, rate, qty, session }) => {
  const batch = await StockBatch.create([{
    itemId, godownId,
    batchNo: batchNo || `AUTO-${Date.now()}-${itemId}`,
    receivedDate, sourceType, sourceRefId, rate,
    qtyReceived: qty,
    qtyRemaining: qty
  }], { session });
  return batch[0];
};

module.exports = { consumeFIFO, receiveBatch };
