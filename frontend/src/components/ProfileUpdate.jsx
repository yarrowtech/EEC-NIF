import React, { useEffect, useState, useRef } from 'react';
import { 
  User, Mail, AtSign, Lock, Camera, Check, AlertCircle, 
  Phone, MapPin, Calendar, BookOpen, Shield, CreditCard, Coins
} from 'lucide-react';
import { getPoints } from '../utils/points';

const initialProfile = {
  name: 'Koushik Bala',
  email: 'koushik@example.com',
  username: 'koushikb',
  password: '',
  phone: '+91 98765 43210',
  address: 'Park Street, Kolkata, India',
  dob: '2000-01-01',
  education: 'Masters of Science',
  studentId: 'STU001',
  semester: 'Spring 2025',
  profilePic: '',
};

const ProfileUpdate = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [preview, setPreview] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('personal');
  const fileInputRef = useRef(null);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    setPoints(getPoints());
    const onUpdate = (e) => setPoints(e?.detail?.total ?? getPoints());
    window.addEventListener('points:update', onUpdate);
    return () => window.removeEventListener('points:update', onUpdate);
  }, []);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (value.length < 2) {
          newErrors[name] = 'Name must be at least 2 characters';
        } else {
          delete newErrors[name];
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[name] = 'Please enter a valid email address';
        } else {
          delete newErrors[name];
        }
        break;
      case 'username':
        if (value.length < 3) {
          newErrors[name] = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors[name] = 'Username can only contain letters, numbers, and underscores';
        } else {
          delete newErrors[name];
        }
        break;
      case 'password':
        if (value && value.length < 6) {
          newErrors[name] = 'Password must be at least 6 characters';
        } else {
          delete newErrors[name];
        }
        break;
      case 'phone':
        const phoneRegex = /^\+?[\d\s()-]+$/;
        if (!phoneRegex.test(value)) {
          newErrors[name] = 'Please enter a valid phone number';
        } else {
          delete newErrors[name];
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePic: 'Image size must be less than 5MB' }));
        return;
      }
      
      setProfile((prev) => ({ ...prev, profilePic: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      
      if (errors.profilePic) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.profilePic;
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    Object.keys(profile).forEach(key => {
      if (key !== 'profilePic') {
        validateField(key, profile[key]);
      }
    });
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setLoading(true);
    setSuccess(false);
    
    // Simulate API call
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  const inputClasses = (fieldName) =>
    `w-full pl-12 pr-4 py-3 border rounded-xl shadow-sm transition-all duration-200 outline-none ${
      errors[fieldName]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
        : 'border-gray-300 hover:border-yellow-400 focus:border-yellow-500 focus:ring-yellow-100'
    } focus:ring-4 bg-white`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Student Portal</h1>
          </div>
          <nav className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-yellow-600 transition-colors">Dashboard</a>
            <a href="#" className="text-gray-600 hover:text-yellow-600 transition-colors">Messages</a>
            <a href="#" className="text-gray-600 hover:text-yellow-600 transition-colors">Settings</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-2xl border border-yellow-100 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-amber-400 px-8 py-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">Profile Settings</h2>
              <p className="text-yellow-100">Manage your personal and account information</p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-200/80 text-amber-900 font-semibold shadow-sm">
              <Coins className="w-5 h-5 text-amber-700" />
              <span>{points} Points</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row w-full overflow-x-hidden">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-4 md:p-6">
              <div className="flex flex-col items-center space-y-4 mb-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-300 shadow-lg bg-gray-100">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-100 to-amber-100">
                        <User className="w-16 h-16 text-yellow-600" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                    title="Change profile picture"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{profile.name}</h3>
                <p className="text-gray-500 text-sm">Student Account</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'personal' 
                      ? 'bg-yellow-100 text-yellow-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Personal Information
                </button>
                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'account' 
                      ? 'bg-yellow-100 text-yellow-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Account Settings
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'security' 
                      ? 'bg-yellow-100 text-yellow-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Security
                </button>
              </nav>
            </div>

            {/* Main Form Content */}
            <div className="flex-1 w-full p-4 md:p-8">
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-gray-800 border-b pb-3">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="name"
                          value={profile.name}
                          onChange={handleChange}
                          className={inputClasses('name')}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Student ID Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Student ID
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="studentId"
                          value={profile.studentId}
                          onChange={handleChange}
                          className={inputClasses('studentId')}
                          placeholder="Enter your student ID"
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          name="email"
                          value={profile.email}
                          onChange={handleChange}
                          className={inputClasses('email')}
                          placeholder="Enter your email address"
                          required
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Semester Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Semester
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="semester"
                          value={profile.semester}
                          onChange={handleChange}
                          className={inputClasses('semester')}
                          placeholder="e.g. Spring 2025"
                        />
                      </div>
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          name="phone"
                          value={profile.phone}
                          onChange={handleChange}
                          className={inputClasses('phone')}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Address Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="address"
                          value={profile.address}
                          onChange={handleChange}
                          className={inputClasses('address')}
                          placeholder="Enter your address"
                        />
                      </div>
                    </div>

                    {/* Date of Birth Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          name="dob"
                          value={profile.dob}
                          onChange={handleChange}
                          className={inputClasses('dob')}
                        />
                      </div>
                    </div>

                    {/* Education Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Education Level
                      </label>
                      <div className="relative">
                        <BookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          name="education"
                          value={profile.education}
                          onChange={handleChange}
                          className={inputClasses('education')}
                        >
                          <option value="">Select education level</option>
                          <option value="High School">High School</option>
                          <option value="Bachelor's Degree">Bachelor's Degree</option>
                          <option value="Master's Degree">Master's Degree</option>
                          <option value="Doctorate">Doctorate</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-gray-800 border-b pb-3">Account Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Username Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Username *
                      </label>
                      <div className="relative">
                        <AtSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="username"
                          value={profile.username}
                          onChange={handleChange}
                          className={inputClasses('username')}
                          placeholder="Choose a unique username"
                          required
                        />
                      </div>
                      {errors.username && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.username}
                        </p>
                      )}
                    </div>

                    {/* Language Preference */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Language Preference
                      </label>
                      <div className="relative">
                        <select
                          className={inputClasses('language')}
                        >
                          <option value="en">English</option>
                          <option value="es">Bengali</option>
                          <option value="fr">Hindi</option>
                          <option value="de">Tamil</option>
                        </select>
                      </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Notification Preferences
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="email-notifications"
                            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                            defaultChecked
                          />
                          <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700">
                            Email Notifications
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="sms-notifications"
                            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                          />
                          <label htmlFor="sms-notifications" className="ml-2 block text-sm text-gray-700">
                            SMS Notifications
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="push-notifications"
                            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                            defaultChecked
                          />
                          <label htmlFor="push-notifications" className="ml-2 block text-sm text-gray-700">
                            Push Notifications
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-gray-800 border-b pb-3">Security Settings</h3>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {/* Password Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Change Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="password"
                          name="password"
                          value={profile.password}
                          onChange={handleChange}
                          className={inputClasses('password')}
                          placeholder="Enter new password"
                          autoComplete="new-password"
                        />
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="password"
                          className={inputClasses('confirmPassword')}
                          placeholder="Confirm your new password"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Two-Factor Authentication</h4>
                      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">SMS Authentication</p>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors">
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button (shown on all tabs except children) */}
              {activeTab !== 'children' && (
                <div className="pt-6 mt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={loading || Object.keys(errors).length > 0}
                    className="w-full md:w-auto px-8 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving Changes...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>

                  {/* Success Message */}
                  {success && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                      <div className="bg-green-500 rounded-full p-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-green-800 font-semibold">Profile Updated Successfully!</p>
                        <p className="text-green-700 text-sm">Your changes have been saved.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <p className="text-gray-600">© 2025 Student Portal. All rights reserved to EEC.</p>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-600 hover:text-yellow-600 transition-colors">Terms</a>
              <a href="#" className="text-gray-600 hover:text-yellow-600 transition-colors">Privacy</a>
              <a href="#" className="text-gray-600 hover:text-yellow-600 transition-colors">Help Center</a>
              <a href="#" className="text-gray-600 hover:text-yellow-600 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProfileUpdate;
