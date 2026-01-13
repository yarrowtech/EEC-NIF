import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const LoginForm = () => {
  const [showPass, setShowPass] = useState(false);
  const [userType, setUserType] = useState('Student');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
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
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      let url = "";
      switch (userType) {
        case "Student":
          url = "/api/student/auth/login";
          break;
        case "Teacher":
          url = "/api/teacher/auth/login";
          break;
        case "Parent":
          url = "/api/parent/auth/login";
          break;
        case "Principal":
          url = "/api/principal/auth/login";
          break;
        case "Admin":
          url = "/api/admin/auth/login";
          break;
        default:
          break;
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      })
      if (!res.ok) {
        throw new Error('Login failed');
      }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', userType);
      switch (userType) {
        case "Student":
          navigate('/dashboard');
          break;
        case "Teacher":
          navigate('/teachers');
          break;
        case "Parent":
          navigate('/parents');
          break;
        case "Principal":
          navigate('/principal');
          break;
        case "Admin":
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/dashboard');
          break;
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[url('/xavier.jpeg')] bg-no-repeat bg-cover bg-center">
      <div className="bg-white/90  backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto space-y-6 border border-purple-600">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h4 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
            Welcome to EEC
          </h4>
          <p className="text-gray-600">Please sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Type Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">User Type</label>
            <select
              name="userType"
              value={userType}
              onChange={e => setUserType(e.target.value)}
              className="w-full pl-3 pr-4 py-3 border rounded-xl shadow-sm transition-all duration-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none border-gray-300 hover:border-gray-400 focus:bg-white"
            >
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Parent">Parent</option>
              <option value="Principal">Principal</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Username Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm transition-all duration-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none ${
                  errors.username 
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
                className={`w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm transition-all duration-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none ${
                  errors.password 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400 focus:bg-white'
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-1 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm ">{errors.password}</p>
            )}
          </div>

          {/* Remember Me */}
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

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white py-3 rounded-xl hover:from-yellow-600 hover:to-amber-600 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          
        </form>

      </div>
    </div>
  );
};

export default LoginForm;
