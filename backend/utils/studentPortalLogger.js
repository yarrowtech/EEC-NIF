const { logger } = require('./logger');
const { getRequestNetworkContext } = require('./request');
const { logBusinessEvent } = require('./businessEventLogger');
const { logSecurityEvent } = require('./securityEventLogger');

const asString = (value) => {
  if (value === undefined || value === null) return undefined;
  return String(value);
};

const resolveActor = (req) => {
  const actorUserType = String(req?.userType || req?.user?.userType || '').toLowerCase();
  const userId = req?.user?.id || req?.user?._id || null;
  return {
    studentId: actorUserType === 'student' ? asString(userId) : undefined,
    userId: asString(userId),
    userType: actorUserType || undefined,
    schoolId: asString(req?.schoolId || req?.user?.schoolId),
    campusId: asString(req?.campusId || req?.user?.campusId),
  };
};

const normalizeCategory = (value) => {
  const normalized = String(value || '').toLowerCase();
  if (['telemetry', 'audit', 'security'].includes(normalized)) return normalized;
  return 'telemetry';
};

const inferCategory = (payload = {}) => {
  if (payload.category) return normalizeCategory(payload.category);
  const action = String(payload.action || '').toLowerCase();
  if (payload.level === 'error' || payload.outcome === 'failure') return 'audit';
  if (action.includes('login') || action.includes('logout') || action.includes('submit') || action.includes('create') || action.includes('update') || action.includes('delete') || action.includes('mark_read')) {
    return 'audit';
  }
  return 'telemetry';
};

const studentPortalSurfaceMap = [
  { prefix: '/api/student/auth/dashboard', area: 'dashboard', frontendPath: '/student' },
  { prefix: '/api/student/auth/profile', area: 'profile', frontendPath: '/student/profile' },
  { prefix: '/api/student/profile/update', area: 'profile', frontendPath: '/student/profile' },
  { prefix: '/api/student/auth/attendance', area: 'attendance', frontendPath: '/student/attendance' },
  { prefix: '/api/student/auth/schedule', area: 'schedule', frontendPath: '/student/schedule' },
  { prefix: '/api/student/auth/journal', area: 'assignments_journal', frontendPath: '/student/assignments-journal' },
  { prefix: '/api/student/auth/teacher-feedback', area: 'teacher_feedback', frontendPath: '/student/teacherfeedback' },
  { prefix: '/api/assignment/student/assignments', area: 'assignments', frontendPath: '/student/assignments' },
  { prefix: '/api/assignment/submit', area: 'assignments', frontendPath: '/student/assignments' },
  { prefix: '/api/assignment/my-submissions', area: 'assignments', frontendPath: '/student/assignments' },
  { prefix: '/api/practice', area: 'practice', frontendPath: '/student/assignments' },
  { prefix: '/api/alcove', area: 'academic_alcove', frontendPath: '/student/assignments-academic-alcove' },
  { prefix: '/api/reports', area: 'results', frontendPath: '/student/results' },
  { prefix: '/api/holidays', area: 'holidays', frontendPath: '/student/holidays' },
  { prefix: '/api/notifications', area: 'noticeboard', frontendPath: '/student/noticeboard' },
  { prefix: '/api/chat', area: 'communication', frontendPath: '/student/chat' },
  { prefix: '/api/excuse-letters', area: 'excuse_letters', frontendPath: '/student/excuse-letter' },
  { prefix: '/api/fees', area: 'fees', frontendPath: '/student/fees' },
  { prefix: '/api/lesson-plans/student/status', area: 'lesson_plan_status', frontendPath: '/student/lesson-plan-status' },
  { prefix: '/api/student-ai-learning', area: 'ai_learning', frontendPath: '/student/ai-learning' },
  { prefix: '/api/student/allocated-subjects', area: 'tryouts', frontendPath: '/student/tryouts' },
  { prefix: '/api/exams', area: 'results', frontendPath: '/student/results' },
];

const resolveSurface = (req) => {
  const path = String(req?.originalUrl || '');
  const match = studentPortalSurfaceMap.find((item) => path.startsWith(item.prefix));
  return {
    portalArea: match?.area || 'student_portal',
    frontendPath: match?.frontendPath || '/student',
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
    category,
    statusCode,
    resultCount,
    targetType,
    targetId,
    reason,
    severity,
    mirrorBusinessEvent = false,
    mirrorSecurityEvent = false,
    force,
    ...extra
  } = payload;

  const write = req?.log || logger;
  const actor = resolveActor(req);
  const net = getRequestNetworkContext(req);
  const surface = resolveSurface(req);
  const resolvedCategory = inferCategory({ ...payload, category });
  const entry = {
    level,
    message: 'Student portal event',
    event: 'student_portal_event',
    type: 'student_portal_event',
    category: resolvedCategory,
    feature,
    portalArea: surface.portalArea,
    frontendPath: surface.frontendPath,
    action,
    outcome,
    severity: asString(severity),
    statusCode,
    resultCount: Number.isFinite(Number(resultCount)) ? Number(resultCount) : undefined,
    targetType: asString(targetType),
    targetId: asString(targetId),
    reason: asString(reason),
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

  if (resolvedCategory === 'audit' || mirrorBusinessEvent) {
    logBusinessEvent(req, {
      action,
      outcome,
      entity: targetType || feature,
      entityId: targetId,
      statusCode,
      level,
      reason,
      portalArea: surface.portalArea,
      frontendPath: surface.frontendPath,
      ...actor,
      ...extra,
    });
  }

  if (resolvedCategory === 'security' || mirrorSecurityEvent) {
    logSecurityEvent(req, {
      action: `student_portal.${action}`,
      outcome: outcome === 'failure' ? 'blocked' : 'observed',
      severity: severity || (outcome === 'failure' ? 'medium' : 'low'),
      statusCode,
      reason,
      targetType,
      targetId,
      portalArea: surface.portalArea,
      frontendPath: surface.frontendPath,
      studentId: actor.studentId,
      ...extra,
    });
  }
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

const logStudentPortalAudit = (req, payload = {}) => {
  logStudentPortalEvent(req, {
    category: 'audit',
    ...payload,
  });
};

const logStudentPortalSecurity = (req, payload = {}) => {
  logStudentPortalEvent(req, {
    category: 'security',
    level: payload.level || 'warn',
    ...payload,
  });
};

module.exports = {
  logStudentPortalEvent,
  logStudentPortalError,
  logStudentPortalAudit,
  logStudentPortalSecurity,
};
