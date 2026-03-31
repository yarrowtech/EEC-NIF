const { getClientIp } = require('../utils/request');

const buckets = new Map();
const { logSecurityEvent } = require('../utils/securityEventLogger');

<<<<<<< HEAD
const getClientIp = (req, useForwardedFor = true) => {
  const forwarded = req?.headers?.['x-forwarded-for'];
  if (useForwardedFor && typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
=======
const getKey = (req) => {
  const ip = getClientIp(req) || 'unknown';
  const path = req.originalUrl || req.url || '/';
  return `${ip}:${path}`;
>>>>>>> 486e48fd558e37241102017daa47d6c334e68414
};

const getKey = (req, { useForwardedFor = true, keyGenerator } = {}) => {
  if (typeof keyGenerator === 'function') {
    return String(keyGenerator(req));
  }
  const ip = getClientIp(req, useForwardedFor);
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
<<<<<<< HEAD
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
=======
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
>>>>>>> 486e48fd558e37241102017daa47d6c334e68414
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }

    return next();
  };
};

module.exports = rateLimit;
