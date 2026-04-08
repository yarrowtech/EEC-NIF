const { logger } = require('./logger');

const asString = (value) => {
  if (value === undefined || value === null) return undefined;
  return String(value);
};

const resolveActor = (req) => {
  const actorUserType = String(req?.userType || req?.user?.userType || '').toLowerCase();
  const userId = req?.user?.id || req?.user?._id || null;
  return {
    userId: asString(userId),
    userType: actorUserType || undefined,
    schoolId: asString(req?.schoolId || req?.user?.schoolId),
    campusId: asString(req?.campusId || req?.user?.campusId),
  };
};

const shouldLogStudentPortalEvent = (req, options = {}) => {
  if (options.force === true) return true;
  const actor = String(req?.userType || req?.user?.userType || '').toLowerCase();
  return actor === 'student';
};

const logStudentPortalEvent = (req, payload = {}) => {
  if (!shouldLogStudentPortalEvent(req, payload)) return;

  const {
    level = 'info',
    feature = 'student_portal',
    action = 'unknown',
    outcome = 'success',
    statusCode,
    resultCount,
    targetType,
    targetId,
    reason,
    force,
    ...extra
  } = payload;

  const write = req?.log || logger;
  const actor = resolveActor(req);
  const entry = {
    level,
    message: 'Student portal event',
    event: 'student_portal_event',
    feature,
    action,
    outcome,
    statusCode,
    resultCount: Number.isFinite(Number(resultCount)) ? Number(resultCount) : undefined,
    targetType: asString(targetType),
    targetId: asString(targetId),
    reason: asString(reason),
    requestId: req?.requestId || undefined,
    traceId: req?.traceId || undefined,
    method: req?.method,
    path: req?.originalUrl,
    ...actor,
    ...extra,
  };

  if (write && typeof write.log === 'function') {
    write.log(entry);
    return;
  }

  const levelMethod = String(level || 'info').toLowerCase();
  const fallbackMethod = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(levelMethod)
    ? levelMethod
    : 'info';

  if (write && typeof write[fallbackMethod] === 'function') {
    write[fallbackMethod](entry, entry.message);
    return;
  }

  logger.log(entry);
};

const logStudentPortalError = (req, payload = {}) => {
  const err = payload?.err;
  const reason = payload?.reason || err?.message;
  logStudentPortalEvent(req, {
    level: 'error',
    outcome: 'failure',
    ...payload,
    reason,
    err,
  });
};

module.exports = {
  logStudentPortalEvent,
  logStudentPortalError,
};
