const { randomUUID } = require('crypto');
const { logger } = require('../utils/logger');
<<<<<<< HEAD
const { logSecurityEvent } = require('../utils/securityEventLogger');

const getClientIp = (req) => {
  const forwarded = req?.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req?.ip || req?.socket?.remoteAddress || undefined;
};
=======
const { getClientIp } = require('../utils/request');
>>>>>>> 486e48fd558e37241102017daa47d6c334e68414

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
  return (
    url.startsWith('/api/admin') ||
    url.startsWith('/api/super-admin') ||
    url.startsWith('/api/school-registration')
  );
};

const isSuspiciousForwarding = (req) => {
  const forwarded = req?.headers?.['x-forwarded-for'];
  if (typeof forwarded !== 'string' || !forwarded.trim()) return false;
  const parts = forwarded.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) return true;
  const candidate = parts[0] || '';
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
  res.setHeader('x-request-id', requestId);
  res.setHeader('x-trace-id', traceId);

  if (!isLoggedPath(req)) {
    return next();
  }

  logger.info('HTTP request started', {
    event: 'http_request_start',
    requestId,
    traceId,
    method: req.method,
    path: req.originalUrl,
    ip: getClientIp(req),
    userAgent: req.get('user-agent') || '',
  });

  if (isSuspiciousForwarding(req)) {
    logSecurityEvent(req, {
      action: 'security.header_forwarding_suspicious',
      outcome: 'observed',
      severity: 'medium',
      reason: 'Suspicious x-forwarded-for header pattern',
      forwardedFor: req.headers['x-forwarded-for'],
    });
  }

  res.on('finish', () => {
    const actor = resolveActor(req);
    logger.info('HTTP request completed', {
      event: 'http_request_complete',
      requestId,
      traceId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      ip: getClientIp(req),
      ...actor,
    });
  });

  next();
};

module.exports = requestLogger;
