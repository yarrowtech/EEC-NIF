const fs = require('fs');
const path = require('path');
const util = require('util');
const winston = require('winston');

const logDir = path.join(__dirname, '..', 'logs');
fs.mkdirSync(logDir, { recursive: true });

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'backend' },
  format: jsonFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} ${level}: ${stack || message}`;
        })
      ),
    })
  );
}

const rawConsole = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};

const toMessage = (args) => {
  if (!args || args.length === 0) return '';
  const [first, ...rest] = args;
  if (typeof first === 'string') {
    return rest.length ? util.format(first, ...rest) : first;
  }
  return util.format(...args);
};

const forward = (level, args) => {
  if (args.length === 1 && args[0] instanceof Error) {
    logger.log({ level, message: args[0].message, stack: args[0].stack });
    return;
  }
  logger.log({ level, message: toMessage(args) });
};

const bindConsoleToLogger = () => {
  if (global.__WINSTON_CONSOLE_BOUND__) return;
  global.__WINSTON_CONSOLE_BOUND__ = true;
  console.log = (...args) => forward('info', args);
  console.info = (...args) => forward('info', args);
  console.warn = (...args) => forward('warn', args);
  console.error = (...args) => forward('error', args);
};

module.exports = {
  logger,
  bindConsoleToLogger,
  rawConsole,
};
