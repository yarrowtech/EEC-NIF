import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Search, 
  Menu,
  User,
  Settings,
  LogOut,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ChevronDown,
  X,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrincipalHeader = ({ sidebarOpen, setSidebarOpen, notifications }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const urgentNotifications = notifications.filter(n => n.priority === 'high');
  const totalNotifications = notifications.length;

  const principalInfo = {
    name: "Dr. Sarah Johnson",
    title: "School Principal",
    email: "principal@eec.edu",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/');
  };

  const quickSearchSuggestions = [
    { type: 'student', title: 'John Smith - Grade 10A', icon: User },
    { type: 'teacher', title: 'Ms. Johnson - Mathematics', icon: User },
    { type: 'report', title: 'Monthly Performance Report', icon: Download },
    { type: 'event', title: 'Parent-Teacher Meeting', icon: Calendar }
  ];

  const filteredSuggestions = quickSearchSuggestions.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Search Bar */}
          <div className="relative" ref={searchRef}>
            <div className="flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Search students, teachers, reports..."
                  className="pl-10 pr-8 py-2 w-48 sm:w-64 md:w-80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Search Suggestions */}
            {searchFocused && filteredSuggestions.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="py-2">
                  <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">Quick Results</div>
                  {filteredSuggestions.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                      >
                        <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{item.title}</span>
                        <span className={`ml-auto text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                          item.type === 'student' ? 'bg-blue-50 text-blue-600' :
                          item.type === 'teacher' ? 'bg-green-50 text-green-600' :
                          item.type === 'report' ? 'bg-purple-50 text-purple-600' :
                          'bg-orange-50 text-orange-600'
                        }`}>
                          {item.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Section - Current Time & Date */}
        <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Actions */}
          <div className="hidden lg:flex items-center gap-1">
            <button 
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700"
              title="Refresh Data"
              aria-label="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700"
              title="Send Message"
              aria-label="Send Message"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button 
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700"
              title="Emergency Contact"
              aria-label="Emergency Contact"
            >
              <Phone className="w-5 h-5" />
            </button>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {totalNotifications > 9 ? '9+' : totalNotifications}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {urgentNotifications.length > 0 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          {urgentNotifications.length} urgent
                        </span>
                      )}
                      <button 
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        onClick={() => setShowNotifications(false)}
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification) => (
                      <div 
                        key={notification.id} 
                        className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          // Handle notification click
                          setShowNotifications(false);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full flex-shrink-0 mt-0.5 ${
                            notification.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{notification.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                notification.department === 'Safety' ? 'bg-red-50 text-red-700' :
                                notification.department === 'Academic' ? 'bg-blue-50 text-blue-700' :
                                notification.department === 'Finance' ? 'bg-green-50 text-green-700' :
                                'bg-gray-50 text-gray-700'
                              }`}>
                                {notification.department}
                              </span>
                              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No new notifications</p>
                      <p className="text-xs mt-1 text-gray-400">You're all caught up!</p>
                    </div>
                  )}
                </div>
                
                {notifications.length > 5 && (
                  <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                    <button 
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1 w-full"
                      onClick={() => {
                        // Navigate to full notifications page
                        setShowNotifications(false);
                      }}
                    >
                      View All Notifications
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Profile menu"
            >
              <img
                src={principalInfo.avatar}
                alt="Principal"
                className="w-8 h-8 rounded-full border-2 border-gray-100 object-cover"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";
                }}
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{principalInfo.name}</p>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">{principalInfo.title}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfile ? 'transform rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <img
                      src={principalInfo.avatar}
                      alt="Principal"
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";
                      }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{principalInfo.name}</p>
                      <p className="text-sm text-gray-500">{principalInfo.title}</p>
                      <p className="text-xs text-gray-400 truncate">{principalInfo.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="py-1">
                  <button 
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                    onClick={() => {
                      // Navigate to profile
                      setShowProfile(false);
                    }}
                  >
                    <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">View Profile</span>
                  </button>
                  <button 
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                    onClick={() => {
                      // Navigate to settings
                      setShowProfile(false);
                    }}
                  >
                    <Settings className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Settings</span>
                  </button>
                  <button 
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                    onClick={() => {
                      // Navigate to messages
                      setShowProfile(false);
                    }}
                  >
                    <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Messages</span>
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors text-left text-red-600"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default PrincipalHeader;