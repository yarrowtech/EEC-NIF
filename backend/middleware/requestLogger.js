const { randomUUID } = require('crypto');
const { logger } = require('../utils/logger');
const { logSecurityEvent } = require('../utils/securityEventLogger');
const { getRequestNetworkContext } = require('../utils/request');

const resolveActor = (req) => {
  if (req?.user?.id) {
    return {
      userId: String(req.user.id),
      userType: req.userType || req.user.userType || req.user.type || 'user',
      schoolId: req.schoolId || req.user.schoolId,
      campusId: req.campusId || req.user.campusId,
    };
  }
  if (req?.admin?.id) {
    return {
      userId: String(req.admin.id),
      userType: req.isSuperAdmin ? 'super_admin' : 'admin',
      schoolId: req.schoolId || req.admin.schoolId,
      campusId: req.campusId || req.admin.campusId,
    };
  }
  if (req?.principal?.id || req?.principal?._id) {
    return {
      userId: String(req.principal.id || req.principal._id),
      userType: 'principal',
      schoolId: req.schoolId || req.principal.schoolId,
      campusId: req.campusId || req.principal.campusId,
    };
  }
  return {};
};

const isLoggedPath = (req) => {
  const url = String(req?.originalUrl || '');
  return url.startsWith('/api/');
};

const isSuspiciousForwarding = (req) => {
  const net = getRequestNetworkContext(req);
  if (net.spoofSignal) return true;
  const candidate = String(net.forwardedChain?.[0] || '');
  return candidate === '127.0.0.1' || candidate === '::1';
};

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const headerRequestId = req.headers['x-request-id'];
  const headerTraceId = req.headers['x-trace-id'];
  const requestId = (typeof headerRequestId === 'string' && headerRequestId.trim())
    ? headerRequestId.trim()
    : randomUUID();
  const traceId = (typeof headerTraceId === 'string' && headerTraceId.trim())
    ? headerTraceId.trim()
    : randomUUID();

  req.requestId = requestId;
  req.traceId = traceId;
  req.log = logger.child({ requestId, traceId });
  res.setHeader('x-request-id', requestId);
  res.setHeader('x-trace-id', traceId);

  if (!isLoggedPath(req)) {
    return next();
  }

  const net = getRequestNetworkContext(req);
  logger.info('HTTP request started', {
    event: 'http_request_start',
    requestId,
    traceId,
    method: req.method,
    path: req.originalUrl,
    ip: net.clientIp,
    remoteIp: net.remoteIp,
    ipSource: net.source,
    forwardedForChain: net.forwardedChain,
    forwardedForCount: net.forwardedCount,
    userAgent: req.get('user-agent') || '',
  });

  if (isSuspiciousForwarding(req)) {
    logSecurityEvent(req, {
      action: 'security.header_forwarding_suspicious',
      outcome: 'observed',
      severity: 'medium',
      reason: 'Suspicious x-forwarded-for header pattern',
      forwardedFor: req.headers['x-forwarded-for'],
      remoteIp: net.remoteIp,
      ipSource: net.source,
    });
  }

  res.on('finish', () => {
    const actor = resolveActor(req);
    const finishedNet = getRequestNetworkContext(req);
    logger.info('HTTP request completed', {
      event: 'http_request_complete',
      requestId,
      traceId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      ip: finishedNet.clientIp,
      remoteIp: finishedNet.remoteIp,
      ipSource: finishedNet.source,
      forwardedForChain: finishedNet.forwardedChain,
      forwardedForCount: finishedNet.forwardedCount,
      userAgent: req.get('user-agent') || '',
      ...actor,
    });
  });

  next();
};

module.exports = requestLogger;
