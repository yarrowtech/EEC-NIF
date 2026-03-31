const { randomUUID } = require('crypto');
const { logger } = require('../utils/logger');
const { getClientIp } = require('../utils/request');

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

const isAdminPortalPath = (req) => {
  const url = String(req?.originalUrl || '');
  return url.startsWith('/api/admin') || url.startsWith('/api/super-admin');
};

const requestLogger = (req, res, next) => {
  if (!isAdminPortalPath(req)) {
    return next();
  }

  const start = Date.now();
  const headerRequestId = req.headers['x-request-id'];
  const requestId = (typeof headerRequestId === 'string' && headerRequestId.trim())
    ? headerRequestId.trim()
    : randomUUID();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  logger.info('HTTP request started', {
    event: 'http_request_start',
    requestId,
    method: req.method,
    path: req.originalUrl,
    ip: getClientIp(req),
    userAgent: req.get('user-agent') || '',
  });

  res.on('finish', () => {
    const actor = resolveActor(req);
    logger.info('HTTP request completed', {
      event: 'http_request_complete',
      requestId,
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
