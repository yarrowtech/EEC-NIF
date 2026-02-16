export const AUTH_NOTICE_KEY = 'auth_notice';

export const AUTH_NOTICE = Object.freeze({
  EXPIRED: 'expired',
  LOGGED_OUT: 'logged_out',
});

export const clearAuthData = ({ clearAllLocalStorage = false } = {}) => {
  if (clearAllLocalStorage) {
    localStorage.clear();
    return;
  }
  localStorage.removeItem('token');
  localStorage.removeItem('userType');
};

export const parseJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch (_error) {
    return null;
  }
};

export const getTokenExpiryMs = (token) => {
  const payload = parseJwtPayload(token);
  const exp = Number(payload?.exp);
  if (!Number.isFinite(exp) || exp <= 0) return null;
  return exp * 1000;
};

export const setAuthNotice = (notice) => {
  if (!notice) return;
  sessionStorage.setItem(AUTH_NOTICE_KEY, notice);
};

export const consumeAuthNotice = () => {
  const notice = sessionStorage.getItem(AUTH_NOTICE_KEY);
  if (notice) {
    sessionStorage.removeItem(AUTH_NOTICE_KEY);
  }
  return notice;
};

export const logoutAndRedirect = ({
  navigate,
  notice = AUTH_NOTICE.LOGGED_OUT,
  clearAllLocalStorage = false,
  replace = true,
} = {}) => {
  clearAuthData({ clearAllLocalStorage });
  setAuthNotice(notice);
  if (typeof navigate === 'function') {
    navigate('/', { replace, state: { authNotice: notice } });
  }
};
