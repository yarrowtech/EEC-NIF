import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_NOTICE, getTokenExpiryMs, logoutAndRedirect } from '../utils/authSession';

const AuthSessionManager = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const runExpiryCheck = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const expiryMs = getTokenExpiryMs(token);
      if (import.meta.env.DEV) {
        if (!expiryMs) {
          // console.debug('[auth-debug] Token has no exp claim or cannot be parsed.');
        } else {
          const remainingSeconds = Math.max(Math.ceil((expiryMs - Date.now()) / 1000), 0);
          // console.debug(`[auth-debug] Token expires in ${remainingSeconds}s`);
        }
      }
      if (!expiryMs || expiryMs <= Date.now()) {
        logoutAndRedirect({
          navigate,
          notice: AUTH_NOTICE.EXPIRED,
          clearAllLocalStorage: true,
        });
      }
    };

    // Check immediately, then continuously so logout does not depend on navigation.
    runExpiryCheck();
    const intervalId = window.setInterval(runExpiryCheck, 1000);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        runExpiryCheck();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [navigate]);

  return null;
};

export default AuthSessionManager;
