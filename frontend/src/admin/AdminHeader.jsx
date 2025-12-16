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
  const [showLiveStats, setShowLiveStats] = useState(false);
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [liveStats, setLiveStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch live statistics
  const fetchLiveStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/admin/dashboard-stats`, {
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLiveStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch live stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStats();
    // Auto-refresh every 30 seconds
    const statsInterval = setInterval(fetchLiveStats, 30000);
    return () => clearInterval(statsInterval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="border-b border-gray-200 shadow-sm bg-white">
      <header className="py-4 px-6 w-full box-border">
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden md:flex items-center flex-1">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Live Stats Widget */}
            <div className="relative">
              <button
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 border border-yellow-200 transition-all cursor-pointer"
                onClick={() => setShowLiveStats(!showLiveStats)}
              >
                <Activity size={18} className="text-yellow-600 animate-pulse" />
                <span className="text-sm font-semibold text-yellow-800">
                  Live Stats
                </span>
                {liveStats && (
                  <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full font-bold">
                    {liveStats.totalUsers}
                  </span>
                )}
                <ChevronDown size={16} className="text-yellow-600" />
              </button>

              {showLiveStats && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 py-3 z-50 overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Activity size={18} className="text-yellow-600" />
                      Live User Statistics
                    </h3>
                    {liveStats && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated: {new Date(liveStats.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>

                  {statsLoading ? (
                    <div className="px-4 py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading stats...</p>
                    </div>
                  ) : liveStats ? (
                    <div className="p-4 space-y-3">
                      {/* Total Users */}
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users size={20} className="text-blue-600" />
                            <span className="font-semibold text-gray-800">Total Users</span>
                          </div>
                          <span className="text-2xl font-bold text-blue-600">
                            {liveStats.totalUsers}
                          </span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          +{liveStats.recentTotal} in last 30 days
                        </p>
                      </div>

                      {/* Students */}
                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GraduationCap size={18} className="text-green-600" />
                            <span className="font-medium text-gray-800">Students</span>
                          </div>
                          <span className="text-xl font-bold text-green-600">
                            {liveStats.students.total}
                          </span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          +{liveStats.students.recent} recent
                        </p>
                      </div>

                      {/* Teachers */}
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UserCheck size={18} className="text-purple-600" />
                            <span className="font-medium text-gray-800">Teachers</span>
                          </div>
                          <span className="text-xl font-bold text-purple-600">
                            {liveStats.teachers.total}
                          </span>
                        </div>
                        <p className="text-xs text-purple-600 mt-1">
                          +{liveStats.teachers.recent} recent
                        </p>
                      </div>

                      {/* Parents */}
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users size={18} className="text-orange-600" />
                            <span className="font-medium text-gray-800">Parents</span>
                          </div>
                          <span className="text-xl font-bold text-orange-600">
                            {liveStats.parents.total}
                          </span>
                        </div>
                        <p className="text-xs text-orange-600 mt-1">
                          +{liveStats.parents.recent} recent
                        </p>
                      </div>

                      {/* Refresh Button */}
                      <button
                        onClick={fetchLiveStats}
                        className="w-full mt-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <Activity size={16} />
                        Refresh Now
                      </button>
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <p className="text-sm">Failed to load statistics</p>
                    </div>
                  )}
                </div>
              )}
            </div>

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
            <div className="hidden md:flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-xl cursor-pointer border border-gray-100">
              <Globe size={20} className="text-gray-500" />
              <span className="text-sm text-gray-600 font-medium">English</span>
              <ChevronDown size={16} className="text-gray-400" />
            </div>

            <div className="relative">
              <button 
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 relative border border-gray-100"
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

            <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 relative border border-gray-100">
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
                  <p className="text-xs text-gray-500">Administrator</p>
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
