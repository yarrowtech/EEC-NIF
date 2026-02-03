import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const LoginForm = () => {
  const [showPass, setShowPass] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetUserType, setResetUserType] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [resetNotice, setResetNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (loginError) {
      setLoginError('');
    }
    if (resetNotice) {
      setResetNotice('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'User ID is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateReset = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/[a-z]/.test(formData.newPassword)
      || !/[A-Z]/.test(formData.newPassword)
      || !/[0-9]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Include uppercase, lowercase, and a number';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sanitizedUsername = formData.username.trim();
    if (resetMode) {
      if (!validateReset()) return;
    } else if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    setLoginError('');
    setResetNotice('');
    try {
      if (resetMode) {
        const isTeacherReset = resetUserType === 'Teacher';
        const resetEndpoint = isTeacherReset
          ? '/api/teacher/auth/reset-first-password'
          : '/api/admin/auth/reset-first-password';
        const loginEndpoint = isTeacherReset ? '/api/teacher/auth/login' : '/api/admin/auth/login';
        const loginRedirect = isTeacherReset ? '/teacher' : '/admin/dashboard';

        const resetRes = await fetch(`${API_BASE}${resetEndpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: sanitizedUsername,
            newPassword: formData.newPassword
          })
        });

        if (!resetRes.ok) {
          const data = await resetRes.json().catch(() => ({}));
          throw new Error(data?.error || 'Unable to reset password');
        }

        const loginRes = await fetch(`${API_BASE}${loginEndpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: sanitizedUsername,
            password: formData.newPassword
          })
        });

        if (!loginRes.ok) {
          throw new Error('Login failed after reset. Please sign in again.');
        }

        const loginData = await loginRes.json();
        localStorage.setItem('token', loginData.token);
        if (isTeacherReset) {
          localStorage.setItem('userType', 'Teacher');
          navigate(loginRedirect);
          return;
        }

        localStorage.setItem('userType', 'Admin');
        navigate(loginRedirect);
        return;
      }

      const loginOptions = [
        { userType: 'Student', url: '/api/student/auth/login', redirect: '/student' },
        { userType: 'Teacher', url: '/api/teacher/auth/login', redirect: '/teacher' },
        { userType: 'Parent', url: '/api/parent/auth/login', redirect: '/parent' },
        { userType: 'Principal', url: '/api/principal/auth/login', redirect: '/principal' },
        { userType: 'Admin', url: '/api/admin/auth/login', redirect: '/admin/dashboard' }
      ];

      let loggedIn = false;
      let lastErrorMessage = '';
      for (const option of loginOptions) {
        const res = await fetch(`${API_BASE}${option.url}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: sanitizedUsername,
            password: formData.password
          })
        });

        if (!res.ok) {
          if (option.userType === 'Admin' && res.status === 403) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data?.error || 'Account inactive. Contact EEC admin.');
          }
          const data = await res.json().catch(() => ({}));
          if (data?.error || data?.message) {
            lastErrorMessage = data.error || data.message;
          }
          continue;
        }

        const data = await res.json();
        if ((option.userType === 'Admin' || option.userType === 'Teacher') && data?.requiresPasswordReset) {
          setResetMode(true);
          setResetUserType(option.userType);
          setFormData((prev) => ({
            ...prev,
            username: data.username || prev.username,
            password: '',
            newPassword: '',
            confirmPassword: ''
          }));
          setResetNotice('First login detected. Please reset your password.');
          loggedIn = true;
          break;
        }
        localStorage.setItem('token', data.token);
        if (option.userType === 'Admin') {
          let resolvedUserType = option.userType;
          let redirectTo = option.redirect;
          try {
            const profileRes = await fetch(`${API_BASE}/api/admin/auth/profile`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${data.token}`,
              },
            });
            if (profileRes.ok) {
              const profile = await profileRes.json();
              if (profile?.role === 'super_admin') {
                resolvedUserType = 'SuperAdmin';
                redirectTo = '/super-admin/overview';
              }
            }
          } catch (profileError) {
            console.error('Failed to load admin profile', profileError);
          }
          localStorage.setItem('userType', resolvedUserType);
          navigate(redirectTo);
        } else {
          localStorage.setItem('userType', option.userType);
          navigate(option.redirect);
        }
        loggedIn = true;
        break;
      }

      if (!loggedIn) {
        throw new Error(lastErrorMessage || 'Invalid credentials. Please check your User ID and password.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setLoginError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[url('/xavier.jpeg')] bg-no-repeat bg-cover bg-center px-4 py-8 sm:px-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-auto space-y-6 border border-purple-600">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h4 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
            Welcome to EEC
          </h4>
          <p className="text-sm sm:text-base text-gray-600">
            {resetMode ? 'Reset your password to continue' : 'Please sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {resetNotice && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {resetNotice}
            </div>
          )}
          {loginError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loginError}
            </div>
          )}
          {/* Username Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">User ID</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your User ID"
                className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border rounded-xl shadow-sm transition-all duration-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none ${errors.username
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400 focus:bg-white'
                  }`}
              />
            </div>
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username}</p>
            )}
          </div>

          {/* Password Field */}
          {!resetMode && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <button
                type="button"
                className="text-sm text-yellow-600 hover:text-amber-700 transition-colors duration-200"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={`w-full pl-10 pr-12 py-2.5 sm:py-3 border rounded-xl shadow-sm transition-all duration-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none ${errors.password
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400 focus:bg-white'
                  }`}
              />
              <div className='flex justify-center items-center'>
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm ">{errors.password}</p>
            )}
          </div>
          )}

          {resetMode && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Create a strong password"
                    className={`w-full pl-10 pr-12 py-2.5 sm:py-3 border rounded-xl shadow-sm transition-all duration-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none ${errors.newPassword
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400 focus:bg-white'
                      }`}
                  />
                  <div className='flex justify-center items-center'>
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-sm ">{errors.newPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter your password"
                    className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border rounded-xl shadow-sm transition-all duration-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none ${errors.confirmPassword
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400 focus:bg-white'
                      }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm ">{errors.confirmPassword}</p>
                )}
              </div>
            </>
          )}

          {/* Remember Me */}
          {!resetMode && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
              Remember me for 30 days
            </label>
          </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white py-2.5 sm:py-3 rounded-xl hover:from-yellow-600 hover:to-amber-600 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {resetMode ? 'Resetting...' : 'Signing in...'}
              </>
            ) : (
              resetMode ? 'Reset Password & Sign In' : 'Sign In'
            )}
          </button>


        </form>

      </div>
    </div>
  );
};

export default LoginForm;
