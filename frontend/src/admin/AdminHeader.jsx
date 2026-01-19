import React, { useEffect, useState } from 'react';
import {
  Bell,
  Search,
  Globe,
  ChevronDown,
  MessageSquare,
  Settings,
  LogOut,
  Clock,
  Users,
  GraduationCap,
  UserCheck,
  Activity
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
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="border-b  border-gray-200 shadow-sm bg-white">
      <header className=" w-full box-border p-[13px]">
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden md:flex items-center flex-1">
              <div className="relative w-full max-w-md flex items-center">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-24 py-2 border border-gray-200 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-50"
                />
                <button
                  className="absolute right-2 px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-xl transition-colors"
                  aria-label="Search"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
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
            <div className="relative">
              <button 
                className="p-3 hover:bg-gray-100 rounded-xl text-gray-600 relative border border-gray-100"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
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

            <button className="p- hover:bg-gray-100 rounded-xl text-gray-600 relative border border-gray-100">
              <MessageSquare size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
            </button>

            <div className="relative">
              <button
                className="flex items-center gap-2 hover:bg-gray-50 rounded-2xl py-2 px-3 border border-gray-100"
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
                  <p className="text-xs text-gray-500">{adminUser?.role || 'Administrator'}</p>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
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
