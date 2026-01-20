const axios = require('axios');
const crypto = require('crypto');

/**
 * Send webhook notification to Super Admin Portal
 * @param {string} event - Event type (e.g., 'school.registered', 'school.approved')
 * @param {object} data - Event data
 * @returns {Promise<object>} Response from webhook
 */
const sendWebhook = async (event, data) => {
  const webhookUrl = process.env.SUPER_ADMIN_WEBHOOK_URL;
  const apiKey = process.env.SUPER_ADMIN_API_KEY;
  const webhookSecret = process.env.WEBHOOK_SECRET;

  // Skip if webhook not configured
  if (!webhookUrl) {
    console.warn('Super Admin webhook URL not configured. Skipping webhook...');
    return null;
  }

  try {
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      source: 'eec_platform'
    };

    // Generate signature for webhook verification (optional but recommended)
    let signature = null;
    if (webhookSecret) {
      signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');
    }

    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    };

    if (signature) {
      headers['X-Webhook-Signature'] = signature;
    }

    console.log(`Sending webhook: ${event} to ${webhookUrl}`);

    const response = await axios.post(webhookUrl, payload, {
      headers,
      timeout: 10000 // 10 second timeout
    });

    console.log(`Webhook sent successfully: ${event}`, response.data);
    return response.data;

  } catch (error) {
    console.error(`Webhook failed for event ${event}:`, error.message);

    // Log error but don't throw - webhook failures shouldn't break the main flow
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }

    // TODO: Implement retry logic or queue for failed webhooks
    return null;
  }
};

/**
 * Webhook event types
 */
const WEBHOOK_EVENTS = {
  SCHOOL_REGISTERED: 'school.registered',
  SCHOOL_VERIFIED: 'school.verified',
  SCHOOL_APPROVED: 'school.approved',
  SCHOOL_REJECTED: 'school.rejected',
  SCHOOL_ACTIVATED: 'school.activated',
  PAYMENT_RECEIVED: 'school.payment_received',
  SUBSCRIPTION_UPDATED: 'school.subscription_updated',
  SCHOOL_SUSPENDED: 'school.suspended',
  SCHOOL_REACTIVATED: 'school.reactivated'
};

module.exports = {
  sendWebhook,
  WEBHOOK_EVENTS
};
