const { getClientIp } = require('../utils/request');

const buckets = new Map();
const { logSecurityEvent } = require('../utils/securityEventLogger');

const getIpForLimit = (req, useForwardedFor = true) => {
  if (useForwardedFor) {
    return getClientIp(req) || 'unknown';
  }
  return req?.ip || req?.connection?.remoteAddress || req?.socket?.remoteAddress || 'unknown';
};

const getKey = (req, { useForwardedFor = true, keyGenerator } = {}) => {
  if (typeof keyGenerator === 'function') {
    return String(keyGenerator(req));
  }
  const ip = getIpForLimit(req, useForwardedFor);
  const routePath = `${req.baseUrl || ''}${req.path || req.originalUrl || ''}`;
  return `${ip}:${routePath}`;
};

const rateLimit = ({
  windowMs = 60 * 1000,
  max = 10,
  onLimit,
  useForwardedFor = true,
  keyGenerator,
} = {}) => {
  return (req, res, next) => {
    const key = getKey(req, { useForwardedFor, keyGenerator });
    const now = Date.now();
    const entry = buckets.get(key) || { count: 0, start: now };

    if (now - entry.start > windowMs) {
      entry.count = 0;
      entry.start = now;
    }

    entry.count += 1;
    buckets.set(key, entry);

    if (entry.count > max) {
      logSecurityEvent(req, {
        action: 'security.rate_limit_triggered',
        outcome: 'blocked',
        severity: 'medium',
        statusCode: 429,
        limiterKey: key,
        currentCount: entry.count,
        maxRequests: max,
        windowMs,
      });

      if (typeof onLimit === 'function') {
        try {
          onLimit({ req, res, key, windowMs, max, currentCount: entry.count });
        } catch (_err) {
          // Keep rate-limiter fail-safe.
        }
      }
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }

    return next();
  };
};

module.exports = rateLimit;
