const { logger } = require('./logger');
const { getRequestNetworkContext } = require('./request');

const asString = (value) => {
  if (value === undefined || value === null) return undefined;
  return String(value);
};

const logBusinessEvent = (req, payload = {}) => {
  const {
    action = 'business.unknown',
    outcome = 'success',
    entity,
    entityId,
    statusCode,
    level,
    ...extra
  } = payload;

  const net = getRequestNetworkContext(req);
  logger.log({
    level: level || (outcome === 'failure' ? 'warn' : 'info'),
    message: 'Business event',
    type: 'business_event',
    event: 'business_event',
    action,
    outcome,
    entity: asString(entity),
    entityId: asString(entityId),
    statusCode,
    requestId: req?.requestId || undefined,
    traceId: req?.traceId || undefined,
    method: req?.method,
    path: req?.originalUrl,
    ip: net.clientIp,
    remoteIp: net.remoteIp,
    ipSource: net.source,
    forwardedForChain: net.forwardedChain,
    forwardedForCount: net.forwardedCount,
    userAgent: req?.get?.('user-agent') || req?.headers?.['user-agent'] || undefined,
    ...extra,
  });
};

module.exports = { logBusinessEvent };
