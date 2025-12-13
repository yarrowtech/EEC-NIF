import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  Search, 
  Globe,
  ChevronDown,
  MessageSquare,
  Settings,
  LogOut,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminHeader = ({ adminUser }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => {
    // Clear any auth tokens or user data here if needed
    localStorage.removeItem('token'); // Example: remove JWT token
    // Redirect to login page
    navigate('/');
  };

  return (
    <div className={`border-b border-gray-200 max-w-[95vw] box-border`}>
      <header className="bg-white py-3 px-6 w-full box-border">
        <div className="flex items-center justify-between w-full">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-[300px] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Current Date & Time */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg">
              <Clock size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {now.toLocaleDateString(undefined, { weekday: 'long' })}
              </span>
              <span className="text-sm text-gray-500">
                {now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-sm text-gray-500">
                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            {/* Language Selector */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <Globe size={20} className="text-gray-500" />
              <span className="text-sm text-gray-600 font-medium">English</span>
              <ChevronDown size={16} className="text-gray-400" />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {/* Sample Notifications */}
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm text-gray-800">New student registration request</p>
                      <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <p className="text-sm text-gray-800">Teacher leave application</p>
                      <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 relative">
              <MessageSquare size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                className="flex items-center gap-2 hover:bg-gray-50 rounded-lg py-2 px-3"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="text-yellow-700 font-semibold text-sm">
                    {adminUser?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-700">
                    {adminUser?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Settings size={16} className="text-gray-400" />
                    Settings
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

    </div>
  );
};

export default AdminHeader;
