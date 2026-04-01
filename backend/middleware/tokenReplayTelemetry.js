const { createHash } = require('crypto');
const { logSecurityEvent } = require('../utils/securityEventLogger');
const { getRequestNetworkContext } = require('../utils/request');

const DEFAULT_WINDOW_MS = Number(process.env.TOKEN_REPLAY_WINDOW_MS || 10 * 60 * 1000);
const MAX_TRACKED_TOKENS = Number(process.env.TOKEN_REPLAY_MAX_TRACKED || 5000);
const MAX_TOKEN_AGE_MS = Number(process.env.TOKEN_REPLAY_MAX_TOKEN_AGE_MS || 60 * 60 * 1000);

const tokenUsage = new Map();

const compactUserAgent = (ua) => String(ua || '').trim().slice(0, 160);

const hashToken = (token) => createHash('sha256').update(String(token)).digest('hex');

const decodeJwtPayload = (token) => {
  const parts = String(token || '').split('.');
  if (parts.length < 2) return {};
  try {
    const decoded = Buffer.from(parts[1], 'base64url').toString('utf8');
    const payload = JSON.parse(decoded);
    return payload && typeof payload === 'object' ? payload : {};
  } catch (_err) {
    return {};
  }
};

const pruneOldEntries = (now) => {
  for (const [tokenHash, entry] of tokenUsage.entries()) {
    if (now - entry.lastSeenAt > MAX_TOKEN_AGE_MS) {
      tokenUsage.delete(tokenHash);
    }
  }
};

const trimIfNeeded = () => {
  if (tokenUsage.size <= MAX_TRACKED_TOKENS) return;
  const ordered = Array.from(tokenUsage.entries()).sort((a, b) => a[1].lastSeenAt - b[1].lastSeenAt);
  const removeCount = Math.max(1, ordered.length - MAX_TRACKED_TOKENS);
  for (let i = 0; i < removeCount; i += 1) {
    tokenUsage.delete(ordered[i][0]);
  }
};

const tokenReplayTelemetry = (req, _res, next) => {
  const authHeader = req?.headers?.authorization;
  if (!authHeader || !String(authHeader).startsWith('Bearer ')) {
    return next();
  }

  const token = String(authHeader).slice('Bearer '.length).trim();
  if (!token) {
    return next();
  }

  const now = Date.now();
  pruneOldEntries(now);
  trimIfNeeded();

  const net = getRequestNetworkContext(req);
  const userAgent = compactUserAgent(req?.get?.('user-agent') || req?.headers?.['user-agent']);
  const sourceFingerprint = `${net.clientIp || 'unknown'}|${userAgent || 'unknown'}`;

  const tokenHash = hashToken(token);
  const payload = decodeJwtPayload(token);
  const tokenId = String(payload?.jti || '');
  const tokenSub = String(payload?.sub || payload?.id || '');

  const existing = tokenUsage.get(tokenHash);
  if (!existing || now - existing.firstSeenAt > DEFAULT_WINDOW_MS) {
    tokenUsage.set(tokenHash, {
      firstSeenAt: now,
      lastSeenAt: now,
      jti: tokenId || undefined,
      sub: tokenSub || undefined,
      issuer: payload?.iss ? String(payload.iss) : undefined,
      audience: payload?.aud ? String(payload.aud) : undefined,
      sources: new Map([[sourceFingerprint, now]]),
    });
    return next();
  }

  existing.lastSeenAt = now;
  existing.sources.set(sourceFingerprint, now);

  for (const [fingerprint, ts] of existing.sources.entries()) {
    if (now - ts > DEFAULT_WINDOW_MS) {
      existing.sources.delete(fingerprint);
    }
  }

  if (existing.sources.size >= 2) {
    logSecurityEvent(req, {
      action: 'security.token_replay_suspected',
      outcome: 'observed',
      severity: 'high',
      reason: 'Same bearer token observed from multiple source fingerprints in short window',
      tokenHash: tokenHash.slice(0, 20),
      tokenId: existing.jti,
      tokenSubject: existing.sub,
      tokenIssuer: existing.issuer,
      tokenAudience: existing.audience,
      replayWindowMs: DEFAULT_WINDOW_MS,
      distinctSourceCount: existing.sources.size,
      observedSources: Array.from(existing.sources.keys()).slice(0, 5),
      firstSeenAt: new Date(existing.firstSeenAt).toISOString(),
      lastSeenAt: new Date(existing.lastSeenAt).toISOString(),
    });
  }

  return next();
};

module.exports = tokenReplayTelemetry;
