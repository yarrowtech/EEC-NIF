const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const normalizeIp = (value) => {
  if (!isNonEmptyString(value)) return undefined;
  const trimmed = value.trim();
  return trimmed.startsWith('::ffff:') ? trimmed.slice(7) : trimmed;
};

const parseForwardedChain = (req) => {
  const forwarded = req?.headers?.['x-forwarded-for'];
  if (!isNonEmptyString(forwarded)) return [];
  return forwarded
    .split(',')
    .map((part) => normalizeIp(part))
    .filter(Boolean);
};

const getRequestNetworkContext = (req) => {
  const forwardedChain = parseForwardedChain(req);
  const remoteIp = normalizeIp(
    req?.socket?.remoteAddress || req?.connection?.remoteAddress || req?.info?.remoteAddress
  );
  const trustedIp = normalizeIp(req?.ip) || remoteIp;

  const clientIp = trustedIp || forwardedChain[0] || remoteIp;
  const source = trustedIp ? 'trusted_proxy_or_socket' : (forwardedChain.length ? 'x_forwarded_for' : 'socket');

  const hasForwarded = forwardedChain.length > 0;
  const spoofSignal =
    (hasForwarded && remoteIp && forwardedChain[0] && forwardedChain[0] !== remoteIp) ||
    forwardedChain.length > 1;

  return {
    clientIp,
    source,
    remoteIp,
    forwardedChain,
    forwardedCount: forwardedChain.length,
    spoofSignal: Boolean(spoofSignal),
  };
};

const getClientIp = (req) => getRequestNetworkContext(req).clientIp;

module.exports = { getClientIp, getRequestNetworkContext };
