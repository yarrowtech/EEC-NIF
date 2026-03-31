const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const getClientIp = (req) => {
  if (!req) {
    return undefined;
  }

  const forwarded = req.headers?.['x-forwarded-for'];
  if (isNonEmptyString(forwarded)) {
    return forwarded.split(',')[0].trim();
  }

  return (
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.info?.remoteAddress ||
    undefined
  );
};

module.exports = { getClientIp };
