const { getClientIp } = require('../utils/request');

const buckets = new Map();

const getKey = (req) => {
  const ip = getClientIp(req) || 'unknown';
  const path = req.originalUrl || req.url || '/';
  return `${ip}:${path}`;
};

const rateLimit = ({ windowMs = 60 * 1000, max = 10 } = {}) => {
  return (req, res, next) => {
    const key = getKey(req);
    const now = Date.now();
    const entry = buckets.get(key) || { count: 0, start: now };

    if (now - entry.start > windowMs) {
      entry.count = 0;
      entry.start = now;
    }

    entry.count += 1;
    buckets.set(key, entry);

    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }

    return next();
  };
};

module.exports = rateLimit;
