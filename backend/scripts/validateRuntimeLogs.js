const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const env = dotenv.parse(fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8'));
const logPath = path.join(__dirname, '..', 'logs', 'combined.log');

const out = {
  setup: {
    envKeys: {
      MONGODB_URL: Boolean(env.MONGODB_URL),
      JWT_SECRET: Boolean(env.JWT_SECRET),
      TRUST_PROXY: Boolean(env.TRUST_PROXY),
    },
    logFileExists: fs.existsSync(logPath),
  },
  logs: {
    total: 0,
    parsed: 0,
    httpStart: 0,
    httpComplete: 0,
    missingRequestId: 0,
    missingTraceId: 0,
    missingMethodPath: 0,
    missingNetwork: 0,
    missingDurationOnComplete: 0,
    events: {
      auth_event: 0,
      business_event: 0,
      security_event: 0,
    },
    sensitiveLeaks: {
      tokenLike: 0,
      passwordKey: 0,
    },
    missingTraceByEvent: {},
    missingRequestByEvent: {},
  },
  pairing: {
    startsWithoutComplete: 0,
  },
};

if (!fs.existsSync(logPath)) {
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}

const raw = fs.readFileSync(logPath, 'utf8').trim().split(/\r?\n/);
out.logs.total = raw.length;
const sampleSize = Number(process.env.LOG_SAMPLE_SIZE || 4000);
const recent = raw.slice(-sampleSize);
const starts = new Map();
const completes = new Set();

for (const line of recent) {
  let entry;
  try {
    entry = JSON.parse(line);
  } catch {
    continue;
  }

  out.logs.parsed += 1;
  const isRelevantEvent =
    entry.event === 'http_request_start' ||
    entry.event === 'http_request_complete' ||
    entry.event === 'auth_event' ||
    entry.event === 'business_event' ||
    entry.event === 'security_event';
  const hasReq = Boolean(entry.requestId);
  const hasTrace = Boolean(entry.traceId);
  if (isRelevantEvent && !hasReq) {
    out.logs.missingRequestId += 1;
    out.logs.missingRequestByEvent[entry.event] = (out.logs.missingRequestByEvent[entry.event] || 0) + 1;
  }
  if (isRelevantEvent && !hasTrace) {
    out.logs.missingTraceId += 1;
    out.logs.missingTraceByEvent[entry.event] = (out.logs.missingTraceByEvent[entry.event] || 0) + 1;
  }

  if (entry.event === 'auth_event') out.logs.events.auth_event += 1;
  if (entry.event === 'business_event') out.logs.events.business_event += 1;
  if (entry.event === 'security_event') out.logs.events.security_event += 1;

  const isHttp =
    entry.event === 'http_request_start' ||
    entry.event === 'http_request_complete' ||
    entry.event === 'http_request';
  const hasMethodPath = Boolean(entry.method) && (Boolean(entry.route) || Boolean(entry.path));
  if (isHttp && !hasMethodPath) out.logs.missingMethodPath += 1;

  const hasNetwork =
    Object.prototype.hasOwnProperty.call(entry, 'ip') &&
    Object.prototype.hasOwnProperty.call(entry, 'remoteIp') &&
    Object.prototype.hasOwnProperty.call(entry, 'ipSource') &&
    Array.isArray(entry.forwardedForChain);
  if (isHttp && !hasNetwork) out.logs.missingNetwork += 1;

  if (entry.event === 'http_request_start') {
    out.logs.httpStart += 1;
    if (hasReq && hasTrace) starts.set(entry.requestId, entry.traceId);
  }
  if (entry.event === 'http_request_complete') {
    out.logs.httpComplete += 1;
    if (typeof entry.durationMs !== 'number') out.logs.missingDurationOnComplete += 1;
    if (hasReq && hasTrace) completes.add(entry.requestId);
  }

  if (line.toLowerCase().includes('"token":"eyj') || line.toLowerCase().includes('bearer eyj')) {
    out.logs.sensitiveLeaks.tokenLike += 1;
  }
  if (line.toLowerCase().includes('"password":"') && !line.includes('"password":"***"')) {
    out.logs.sensitiveLeaks.passwordKey += 1;
  }
}

for (const reqId of starts.keys()) {
  if (!completes.has(reqId)) out.pairing.startsWithoutComplete += 1;
}

console.log(JSON.stringify(out, null, 2));
