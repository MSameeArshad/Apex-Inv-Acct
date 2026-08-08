const axios = require('axios');

// Sends a credit-stock delivery confirmation to the client via Meta WhatsApp Cloud API
const sendCreditConfirmation = async ({ toNumber, clientName, invoiceNo, amount, salesmanName }) => {
  if (!process.env.WA_ACCESS_TOKEN || !process.env.WA_PHONE_NUMBER_ID) {
    throw new Error('WhatsApp API not configured (WA_ACCESS_TOKEN / WA_PHONE_NUMBER_ID missing)');
  }

  const message = `Hi ${clientName}, this confirms delivery of stock on CREDIT.\n\n` +
    `Invoice: ${invoiceNo}\nAmount: Rs. ${amount}\nDelivered by: ${salesmanName}\n\n` +
    `Please reply CONFIRM to acknowledge receipt, or contact us for any discrepancy.`;

  const response = await axios.post(
    `https://graph.facebook.com/v20.0/${process.env.WA_PHONE_NUMBER_ID}/messages`,
    { messaging_product: 'whatsapp', to: toNumber, type: 'text', text: { body: message } },
    { headers: { Authorization: `Bearer ${process.env.WA_ACCESS_TOKEN}` } }
  );

  return response.data;
};

module.exports = { sendCreditConfirmation };
