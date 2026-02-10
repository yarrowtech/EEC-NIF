import React, { useMemo, useState } from 'react';
import { Bell, Search, Menu, CalendarDays, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudentDashboard } from './StudentDashboardContext';
import { useNotifications } from '../hooks/useNotifications';

const Header = ({ sidebarOpen, setSidebarOpen, onOpenProfile }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { profile } = useStudentDashboard();

  // Use real notifications hook
  const {
    notifications: allNotifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    dismissNotification
  } = useNotifications();

  // Get only recent 5 notifications for header dropdown
  const recentNotifications = allNotifications.slice(0, 5);
  const studentData = profile || {
    name: 'Student',
    grade: '',
    section: '',
    roll: '',
    className: '',
    sectionName: '',
    rollNumber: '',
    campusName: '',
    campusType: '',
    schoolName: '',
    schoolLogo: null,
    profilePic: null,
  };
  const displayClass = studentData.className || studentData.grade;
  const displaySection = studentData.sectionName || studentData.section;
  const displayRoll = studentData.rollNumber || studentData.roll;
  const displayCampus = studentData.campusName
    ? studentData.campusType
      ? `${studentData.campusName} (${studentData.campusType})`
      : studentData.campusName
    : '';
  const profileImage = studentData.profilePic || studentData.avatar || '';
  const hasProfileImage = typeof profileImage === 'string' && profileImage.trim() !== '';
  const nameParts = (studentData.name || '').trim().split(/\s+/).filter(Boolean);
  const initials = nameParts.length >= 2
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
    : (nameParts[0]?.[0] || 'S');
  const initialsLabel = initials.toUpperCase();

  // Greeting and date
  const { greeting, dateLabel } = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const dateLabel = now.toLocaleDateString(undefined, {
      weekday: 'long', month: 'short', day: 'numeric'
    });
    return { greeting, dateLabel };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/');
  };

  // Get notification type styling
  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'assignment': return 'bg-yellow-500';
      case 'exam': return 'bg-blue-500';
      case 'result': return 'bg-green-500';
      case 'fee': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
  };

  // Handle dismiss
  const handleDismiss = async (e, notificationId) => {
    e.stopPropagation();
    await dismissNotification(notificationId);
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/80 border-b border-gray-200">
      <div className="px-2 sm:px-4">
        <div className="flex items-center justify-between gap-3 py-2 sm:py-3">
          {/* Left: Sidebar toggle + Greeting */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-yellow-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu size={22} className="text-gray-700" />
            </button>
            <div className="hidden xs:block">
                <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                  {greeting}, {studentData.name?.split(' ')[0] || 'Student'}
                </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <CalendarDays size={14} />
                <span>{dateLabel}</span>
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {displayClass
                  ? `Class ${displayClass}${displaySection ? ` | Section ${displaySection}` : ''}`
                  : 'Class not assigned'}
                {displayRoll ? ` | Roll ${displayRoll}` : ''}
                {displayCampus ? ` | Campus ${displayCampus}` : ''}
              </div>
            </div>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search courses, assignments, or results"
                className="w-full pl-9 pr-24 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm"
              />
              <button
                className="absolute right-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors"
                aria-label="Search"
              >
                Search
              </button>
            </div>
          </div>

          {/* Right: Notifications + Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {(studentData.schoolName || studentData.schoolLogo) && (
              <div className="hidden lg:flex items-center gap-2 bg-white/70 backdrop-blur px-3 py-2 rounded-xl border border-gray-200">
                <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                  {studentData.schoolLogo ? (
                    <img
                      src={studentData.schoolLogo}
                      alt="School Logo"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="text-gray-500 text-xs font-semibold">
                      {(studentData.schoolName || 'School').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="leading-tight">
                  <p className="text-[11px] uppercase text-gray-400 tracking-wide">School</p>
                  <p className="text-sm font-semibold text-gray-800">{studentData.schoolName || 'Not assigned'}</p>
                </div>
              </div>
            )}
            <div className="relative">
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                onClick={() => setShowNotifications((prev) => !prev)}
                aria-label="Show notifications"
              >
                <Bell size={20} className="text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 max-w-xs bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b bg-gray-50 font-semibold text-gray-800 flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                    {notificationsLoading ? (
                      <li className="p-4 text-gray-500 text-sm text-center">Loading...</li>
                    ) : recentNotifications.length === 0 ? (
                      <li className="p-4 text-gray-500 text-sm text-center">No new notifications</li>
                    ) : (
                      recentNotifications.map((notification) => (
                        <li
                          key={notification._id}
                          className={`px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                            !notification.isRead ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <span
                            className={`mt-1 w-2 h-2 rounded-full ${
                              getNotificationTypeColor(notification.type)
                            }`}
                          ></span>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm truncate ${
                              !notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-800'
                            }`}>
                              {notification.title}
                            </div>
                            <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {formatTimeAgo(notification.createdAt)}
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDismiss(e, notification._id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            aria-label="Dismiss"
                          >
                            <X size={14} className="text-gray-400" />
                          </button>
                        </li>
                      ))
                    )}
                  </ul>

                  {recentNotifications.length > 0 && (
                    <div className="p-2 border-t bg-gray-50">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/student/notifications');
                        }}
                        className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-100"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="Open profile menu"
              >
                {hasProfileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-9 h-9 rounded-full border-2 border-gray-200 object-cover"
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full border-2 border-gray-200 bg-yellow-100 text-yellow-900 flex items-center justify-center text-sm font-semibold">
                    {initialsLabel}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-gray-900 leading-tight">
                    {studentData.name || 'Student'}
                  </div>
                  <div className="text-[11px] text-gray-500 -mt-0.5">Student</div>
                </div>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b">
                    <div className="text-sm font-semibold text-gray-900">{studentData.name || 'Student'}</div>
                    <div className="text-xs text-gray-500">Student</div>
                  </div>
                  <div className="py-1">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        if (onOpenProfile) onOpenProfile();
                        setProfileOpen(false);
                      }}
                    >
                      Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</button>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 border-t"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
