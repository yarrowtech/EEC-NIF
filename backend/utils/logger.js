const fs = require('fs');
const path = require('path');
const util = require('util');
const pino = require('pino');

const logDir = path.join(__dirname, '..', 'logs');
fs.mkdirSync(logDir, { recursive: true });

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const isProd = process.env.NODE_ENV === 'production';

const errorDestination = pino.destination({
  dest: path.join(logDir, 'error.log'),
  sync: false,
});
const combinedDestination = pino.destination({
  dest: path.join(logDir, 'combined.log'),
  sync: false,
});
const exceptionDestination = pino.destination({
  dest: path.join(logDir, 'exceptions.log'),
  sync: false,
});
const rejectionDestination = pino.destination({
  dest: path.join(logDir, 'rejections.log'),
  sync: false,
});

const streams = [
  { level: LOG_LEVEL, stream: combinedDestination },
  { level: 'error', stream: errorDestination },
];

if (!isProd) {
  streams.push({ level: LOG_LEVEL, stream: process.stdout });
}

const pinoLogger = pino(
  {
    level: LOG_LEVEL,
    base: { service: 'backend' },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        'headers.authorization',
        'authorization',
        'token',
        '*.token',
        '*.password',
        'password',
        'req.headers.authorization',
        'requestBody.password',
        'body.password',
      ],
      remove: true,
    },
  },
  pino.multistream(streams)
);

const parseLevel = (level) => {
  const normalized = String(level || '').toLowerCase();
  if (['fatal', 'error', 'warn', 'info', 'debug', 'trace'].includes(normalized)) {
    return normalized;
  }
  return 'info';
};

const toMessage = (args) => {
  if (!args || args.length === 0) return '';
  const [first, ...rest] = args;
  if (typeof first === 'string') {
    return rest.length ? util.format(first, ...rest) : first;
  }
  return util.format(...args);
};

const write = (level, ...args) => {
  const resolvedLevel = parseLevel(level);

  if (args.length === 1 && args[0] instanceof Error) {
    pinoLogger[resolvedLevel]({ err: args[0] }, args[0].message);
    return;
  }

  const [first, second, ...rest] = args;

  if (typeof first === 'string' && second && typeof second === 'object' && !Array.isArray(second)) {
    pinoLogger[resolvedLevel](second, first);
    return;
  }

  if (first && typeof first === 'object' && !Array.isArray(first) && typeof second === 'string') {
    pinoLogger[resolvedLevel](first, second, ...rest);
    return;
  }

  if (first && typeof first === 'object' && !Array.isArray(first) && rest.length === 0 && second === undefined) {
    const { message = '', ...obj } = first;
    if (message) {
      pinoLogger[resolvedLevel](obj, String(message));
    } else {
      pinoLogger[resolvedLevel](obj);
    }
    return;
  }

  pinoLogger[resolvedLevel](toMessage(args));
};

const logger = {
  trace: (...args) => write('trace', ...args),
  debug: (...args) => write('debug', ...args),
  info: (...args) => write('info', ...args),
  warn: (...args) => write('warn', ...args),
  error: (...args) => write('error', ...args),
  fatal: (...args) => write('fatal', ...args),
  log: (entry = {}) => {
    if (entry instanceof Error) {
      write('error', entry);
      return;
    }
    if (typeof entry === 'string') {
      write('info', entry);
      return;
    }
    if (!entry || typeof entry !== 'object') {
      write('info', String(entry));
      return;
    }
    const { level = 'info', message = '', ...meta } = entry;
    write(level, meta, message || undefined);
  },
  child: (bindings = {}) => pinoLogger.child(bindings),
};

const rawConsole = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};

const forward = (level, args) => {
  write(level, ...args);
};

const bindConsoleToLogger = () => {
  if (global.__PINO_CONSOLE_BOUND__) return;
  global.__PINO_CONSOLE_BOUND__ = true;
  console.log = (...args) => forward('info', args);
  console.info = (...args) => forward('info', args);
  console.warn = (...args) => forward('warn', args);
  console.error = (...args) => forward('error', args);
};

process.on('unhandledRejection', (reason) => {
  if (reason instanceof Error) {
    pinoLogger.error({ err: reason }, 'Unhandled promise rejection');
    rejectionDestination.write(
      JSON.stringify({
        level: 'error',
        time: new Date().toISOString(),
        message: reason.message,
        stack: reason.stack,
      }) + '\n'
    );
    return;
  }
  pinoLogger.error({ reason }, 'Unhandled promise rejection');
  rejectionDestination.write(
    JSON.stringify({
      level: 'error',
      time: new Date().toISOString(),
      message: 'Unhandled promise rejection',
      reason,
    }) + '\n'
  );
});

process.on('uncaughtException', (err) => {
  pinoLogger.fatal({ err }, 'Uncaught exception');
  exceptionDestination.write(
    JSON.stringify({
      level: 'fatal',
      time: new Date().toISOString(),
      message: err?.message || 'Uncaught exception',
      stack: err?.stack,
    }) + '\n'
  );
});

module.exports = {
  logger,
  bindConsoleToLogger,
  rawConsole,
};
