const axios = require('axios');
const crypto = require('crypto');

const normalizeEnvValue = (value) =>
  String(value || '')
    .trim()
    .replace(/^['"]|['"]$/g, '');

const getRazorpayConfig = () => {
  const keyId = normalizeEnvValue(process.env.RAZORPAY_KEY_ID);
  const keySecret = normalizeEnvValue(process.env.RAZORPAY_KEY_SECRET);
  if (!keyId || !keySecret) {
    throw new Error('Razorpay is not configured');
  }
  return { keyId, keySecret };
};

const buildRazorpayReceipt = (prefix, invoiceId) => {
  const normalizedPrefix = String(prefix || 'fee').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 10) || 'fee';
  const invoicePart = String(invoiceId || '').replace(/[^a-zA-Z0-9]/g, '').slice(-12) || 'invoice';
  const timePart = Date.now().toString(36).slice(-8);
  return `${normalizedPrefix}_${invoicePart}_${timePart}`.slice(0, 40);
};

const createRazorpayOrder = async ({ amountPaise, receipt, notes }) => {
  const { keyId, keySecret } = getRazorpayConfig();
  const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  try {
    const response = await axios.post(
      'https://api.razorpay.com/v1/orders',
      {
        amount: amountPaise,
        currency: 'INR',
        receipt,
        notes,
      },
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return { order: response.data, keyId };
  } catch (err) {
    const gatewayError =
      err?.response?.data?.error?.description ||
      err?.response?.data?.error?.reason ||
      err?.response?.data?.error?.code ||
      err?.message ||
      'Unable to create Razorpay order';
    throw new Error(`Razorpay order error: ${gatewayError}`);
  }
};

const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const { keySecret } = getRazorpayConfig();
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expectedSignature === signature;
};

const buildTransactionId = (prefix = 'PAY') => {
  const normalizedPrefix = String(prefix || 'PAY').replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase() || 'PAY';
  const timePart = Date.now().toString(36).toUpperCase();
  const randPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${normalizedPrefix}-${timePart}-${randPart}`;
};

module.exports = {
  getRazorpayConfig,
  buildRazorpayReceipt,
  createRazorpayOrder,
  verifyRazorpaySignature,
  buildTransactionId,
};
