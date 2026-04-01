const { logger } = require('./logger');
const { getRequestNetworkContext } = require('./request');

const asString = (value) => {
  if (value === undefined || value === null) return undefined;
  return String(value);
};

const scoreBySeverity = {
  low: 25,
  medium: 50,
  high: 75,
  critical: 90,
};

const inferAttackType = (action = '') => {
  const normalized = String(action || '').toLowerCase();
  if (normalized.includes('token_replay')) return 'token_replay';
  if (normalized.includes('rate_limit')) return 'api_flood';
  if (normalized.includes('header_forwarding')) return 'xff_spoofing';
  if (normalized.includes('injection')) return 'injection';
  if (normalized.includes('malformed_json')) return 'malformed_json';
  if (normalized.includes('rbac')) return 'rbac_violation';
  if (normalized.includes('idor')) return 'idor_attempt';
  if (normalized.includes('auth')) return 'bruteforce_or_auth_abuse';
  return 'unknown';
};

const logSecurityEvent = (req, payload = {}) => {
  const {
    action = 'security.unknown',
    outcome = 'observed',
    severity = 'medium',
    attack_type,
    riskScore,
    level,
    reason,
    statusCode,
    ...extra
  } = payload;

  const net = getRequestNetworkContext(req);
  const resolvedAttackType = attack_type || inferAttackType(action);
  const resolvedRiskScore = Number.isFinite(Number(riskScore))
    ? Number(riskScore)
    : (scoreBySeverity[String(severity).toLowerCase()] || 50);

  logger.log({
    level: level || (outcome === 'blocked' ? 'warn' : 'info'),
    message: 'Security event',
    type: 'security_event',
    event: 'security_event',
    action,
    outcome,
    severity,
    attack_type: resolvedAttackType,
    riskScore: resolvedRiskScore,
    reason: asString(reason),
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

module.exports = { logSecurityEvent };
