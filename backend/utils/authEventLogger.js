const { logger } = require('./logger');
const { getClientIp } = require('./request');

const asString = (value) => {
  if (value === undefined || value === null) return undefined;
  return String(value);
};

const isAdminPortalPath = (req) => {
  const url = String(req?.originalUrl || '');
  return url.startsWith('/api/admin') || url.startsWith('/api/super-admin');
};

const isAdminUserType = (userType) => {
  const normalized = String(userType || '').toLowerCase();
  return normalized === 'admin' || normalized === 'super_admin' || normalized === 'superadmin';
};

const logAuthEvent = (req, payload = {}) => {
  const {
    action = 'auth.unknown',
    outcome = 'success',
    userType = 'unknown',
    identifier,
    userId,
    schoolId,
    campusId,
    reason,
    statusCode,
    ...extra
  } = payload;

  if (!isAdminPortalPath(req) && !isAdminUserType(userType)) {
    return;
  }

  const level = outcome === 'failure' ? 'warn' : 'info';

  logger.log({
    level,
    message: 'Auth event',
    event: 'auth_event',
    action,
    outcome,
    userType,
    identifier: asString(identifier),
    userId: asString(userId),
    schoolId: asString(schoolId),
    campusId: asString(campusId),
    reason: asString(reason),
    statusCode,
    requestId: req?.requestId || undefined,
    method: req?.method,
    path: req?.originalUrl,
    ip: getClientIp(req),
    ...extra,
  });
};

module.exports = { logAuthEvent };
