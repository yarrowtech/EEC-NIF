const { logger } = require('./logger');

const asString = (value) => {
  if (value === undefined || value === null) return undefined;
  return String(value);
};

const getClientIp = (req) => {
  const forwarded = req?.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req?.ip || req?.socket?.remoteAddress || undefined;
};

const logSecurityEvent = (req, payload = {}) => {
  const {
    action = 'security.unknown',
    outcome = 'observed',
    severity = 'medium',
    level,
    reason,
    statusCode,
    ...extra
  } = payload;

  logger.log({
    level: level || (outcome === 'blocked' ? 'warn' : 'info'),
    message: 'Security event',
    event: 'security_event',
    action,
    outcome,
    severity,
    reason: asString(reason),
    statusCode,
    requestId: req?.requestId || undefined,
    traceId: req?.traceId || undefined,
    method: req?.method,
    path: req?.originalUrl,
    ip: getClientIp(req),
    userAgent: req?.get?.('user-agent') || req?.headers?.['user-agent'] || undefined,
    ...extra,
  });
};

module.exports = { logSecurityEvent };
