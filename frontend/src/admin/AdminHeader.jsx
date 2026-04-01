import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Search,
  X,
  ChevronDown,
  Settings,
  LogOut,
  Clock,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AUTH_NOTICE, logoutAndRedirect } from '../utils/authSession';

const AdminHeader = ({ adminUser }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFeedback, setSearchFeedback] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const isSuperAdmin = String(adminUser?.role || '').toLowerCase() === 'super admin';
  const schoolLogoSrc = adminUser?.schoolLogo || '';
  const schoolName = adminUser?.schoolName || '';
  const profileInitial = adminUser?.name?.charAt(0) || 'A';

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const readStorageKey = useMemo(() => {
    const roleKey = String(adminUser?.role || 'admin').toLowerCase().replace(/\s+/g, '_');
    const userKey = String(adminUser?.name || 'user').trim().toLowerCase().replace(/\s+/g, '_');
    return `admin_read_notifications_v1_${roleKey}_${userKey}`;
  }, [adminUser?.role, adminUser?.name]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(readStorageKey) || '[]');
      setReadNotificationIds(Array.isArray(stored) ? stored : []);
    } catch {
      setReadNotificationIds([]);
    }
  }, [readStorageKey]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setNotifications([]);
        return;
      }

      setNotificationLoading(true);
      setNotificationError('');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data?.error || 'Failed to load notifications');

        const allNotifications = Array.isArray(data) ? data : [];
        const normalized = allNotifications
          .filter((item) => {
            if (isSuperAdmin) return true;
            const audience = String(item?.audience || 'All').toLowerCase();
            return audience === 'all' || audience === 'student' || audience === 'admin';
          })
          .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));

        setNotifications(normalized.slice(0, 20));
      } catch (err) {
        setNotificationError(err.message || 'Failed to load notifications');
        setNotifications([]);
      } finally {
        setNotificationLoading(false);
      }
    };

    fetchNotifications();
    const poll = setInterval(fetchNotifications, 45000);
    return () => clearInterval(poll);
  }, [isSuperAdmin]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !readNotificationIds.includes(String(n?._id || n?.id || ''))).length,
    [notifications, readNotificationIds]
  );

  const persistReadIds = (ids) => {
    const deduped = Array.from(new Set(ids.filter(Boolean)));
    setReadNotificationIds(deduped);
    localStorage.setItem(readStorageKey, JSON.stringify(deduped));
  };

  const markNotificationRead = (notificationId) => {
    if (!notificationId) return;
    persistReadIds([...readNotificationIds, String(notificationId)]);
  };

  const resolveNotificationPath = (notice) => {
    const title = String(notice?.title || '').toLowerCase();
    const typeLabel = String(notice?.typeLabel || '').toLowerCase();
    const looksLikeLeaveRequest =
      typeLabel.includes('leave request') || title.includes('leave request');
    if (looksLikeLeaveRequest) {
      return '/admin/hr?tab=leaves';
    }
    return '/admin/notices';
  };

  const markAllNotificationsRead = () => {
    const allIds = notifications.map((n) => String(n?._id || n?.id || '')).filter(Boolean);
    persistReadIds(allIds);
  };

  const formatTimeAgo = (value) => {
    if (!value) return '';
    const ts = new Date(value);
    if (Number.isNaN(ts.getTime())) return '';
    const diffMs = Date.now() - ts.getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hr ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day} day ago`;
    return ts.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const headerSearchTargets = useMemo(
    () => [
      { label: 'Dashboard', hint: 'Overview and highlights', path: '/admin/dashboard', keys: ['dashboard', 'home', 'overview'] },
      { label: 'Analytics', hint: 'Performance and reports', path: '/admin/analytics', keys: ['analytics', 'analysis', 'report', 'reports'] },
      { label: 'Academic Setup', hint: 'Classes, sections, and subjects', path: '/admin/academics', keys: ['academic', 'academics', 'setup', 'class', 'section', 'subject'] },
      { label: 'Teachers', hint: 'Manage teachers', path: '/admin/teachers', keys: ['teacher', 'teachers', 'faculty'] },
      { label: 'Students', hint: 'Manage students', path: '/admin/students', keys: ['student', 'students', 'pupil'] },
      { label: 'Routines', hint: 'Class routines and schedules', path: '/admin/routine', keys: ['routine', 'routines', 'schedule', 'timetable'] },
      { label: 'Attendance', hint: 'Student attendance records', path: '/admin/attendance', keys: ['attendance', 'present', 'absent'] },
      { label: 'Examination', hint: 'Exam management', path: '/admin/examination', keys: ['exam', 'examination', 'test'] },
      { label: 'Results', hint: 'Result management', path: '/admin/result', keys: ['result', 'results', 'marks'] },
      { label: 'Report Cards', hint: 'Report card templates and publish', path: '/admin/report-cards', keys: ['report card', 'report cards'] },
      { label: 'Fees Collection', hint: 'Collect and track fees', path: '/admin/fees/collection', keys: ['fees', 'fee', 'payment', 'collection'] },
      { label: 'Parents', hint: 'Parent records', path: '/admin/parents', keys: ['parent', 'parents'] },
      { label: 'Notices', hint: 'School and student notifications', path: '/admin/notices', keys: ['notice', 'notices', 'notification', 'notifications'] },
      { label: 'Holiday List', hint: 'Manage holidays', path: '/admin/holidays', keys: ['holiday', 'holidays'] },
      { label: 'Support', hint: 'Support tools', path: '/admin/support', keys: ['support', 'help'] },
      { label: 'Settings', hint: 'Account and app settings', path: '/admin/settings', keys: ['setting', 'settings', 'profile'] },
    ],
    []
  );

  const filteredSearchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return headerSearchTargets.slice(0, 6);
    return headerSearchTargets
      .filter((item) =>
        item.label.toLowerCase().includes(q) ||
        item.hint.toLowerCase().includes(q) ||
        item.keys.some((key) => key.includes(q) || q.includes(key))
      )
      .slice(0, 8);
  }, [headerSearchTargets, searchQuery]);

  const handleHeaderSearch = (event) => {
    event.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    const match = headerSearchTargets.find(({ keys }) =>
      keys.some((key) => key.includes(q) || q.includes(key))
    );

    if (!match) {
      setSearchFeedback('No matching module found.');
      return;
    }

    setSearchFeedback('');
    setShowSearchSuggestions(false);
    navigate(match.path);
  };

  useEffect(() => {
    if (!searchFeedback) return undefined;
    const timeout = setTimeout(() => setSearchFeedback(''), 2200);
    return () => clearTimeout(timeout);
  }, [searchFeedback]);

  const handleLogout = () => {
    logoutAndRedirect({ navigate, notice: AUTH_NOTICE.LOGGED_OUT });
  };

  return (
    <div className="border-b  border-gray-200 shadow-sm bg-white">
      <header className=" w-full box-border p-[13px]">
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden md:flex items-center flex-1">
              <div className="relative w-full max-w-md">
                <form className="relative w-full flex items-center" onSubmit={handleHeaderSearch}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search modules (students, teachers, fees...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSearchSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 150)}
                    className="pl-10 pr-24 py-2 border border-gray-200 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-50"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setShowSearchSuggestions(true);
                      }}
                      className="absolute right-[74px] text-gray-400 hover:text-gray-600"
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="absolute right-2 px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-xl transition-colors"
                    aria-label="Search"
                  >
                    Search
                  </button>
                </form>

                {showSearchSuggestions && (
                  <div className="absolute left-0 right-0 mt-2 rounded-xl border border-gray-100 bg-white shadow-2xl z-50 overflow-hidden">
                    {filteredSearchSuggestions.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-400">No results found</div>
                    ) : (
                      <ul>
                        {filteredSearchSuggestions.map((item, index) => (
                          <li key={item.path}>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setSearchQuery(item.label);
                                setShowSearchSuggestions(false);
                                setSearchFeedback('');
                                navigate(item.path);
                              }}
                              className={`w-full px-4 py-2.5 text-left hover:bg-yellow-50/60 transition-colors flex items-center gap-3 ${index > 0 ? 'border-t border-gray-50' : ''}`}
                            >
                              <Search size={14} className="text-gray-300 shrink-0" />
                              <div>
                                <div className="text-sm font-medium text-gray-800">{item.label}</div>
                                <div className="text-[11px] text-gray-400">{item.hint}</div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
            {searchFeedback && (
              <span className="hidden md:inline-block text-xs text-amber-600 font-medium">{searchFeedback}</span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
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
            </div> */}

            {/* {!isSuperAdmin && (schoolLogoSrc || schoolName) && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
                  {schoolLogoSrc ? (
                    <img src={schoolLogoSrc} alt={schoolName || 'School logo'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold text-gray-500">
                      {(schoolName || 'SC').slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[180px] truncate">{schoolName}</span>
              </div>
            )} */}

            <div className="relative">
              <button 
                className="p-3 hover:bg-gray-100 rounded-xl text-gray-600 relative border border-gray-100"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] text-white font-semibold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {isSuperAdmin ? 'Notifications' : 'Student Notifications'}
                    </h3>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <CheckCheck size={13} />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notificationLoading && (
                      <div className="px-4 py-4 text-sm text-gray-500">Loading notifications...</div>
                    )}
                    {!notificationLoading && notificationError && (
                      <div className="px-4 py-4 text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle size={14} />
                        {notificationError}
                      </div>
                    )}
                    {!notificationLoading && !notificationError && notifications.length === 0 && (
                      <div className="px-4 py-4 text-sm text-gray-500">No notifications yet.</div>
                    )}
                    {!notificationLoading && !notificationError && notifications.map((notice) => {
                      const id = String(notice?._id || notice?.id || '');
                      const isRead = readNotificationIds.includes(id);
                      return (
                        <button
                          key={id || `${notice?.title}-${notice?.createdAt}`}
                          type="button"
                          onClick={() => {
                            markNotificationRead(id);
                            setShowNotifications(false);
                            navigate(resolveNotificationPath(notice));
                          }}
                          className={`w-full text-left px-4 py-3 cursor-pointer border-b border-gray-50 hover:bg-gray-50 ${isRead ? 'bg-white' : 'bg-blue-50/60'}`}
                        >
                          <p className="text-sm text-gray-800 line-clamp-1">{notice?.title || 'Notification'}</p>
                          {notice?.message && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notice.message}</p>
                          )}
                          <p className="text-[11px] text-gray-400 mt-1">
                            {formatTimeAgo(notice?.createdAt)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  <div className="px-4 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/admin/notices');
                      }}
                      className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
                    >
                      View all notices
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className="flex items-center gap-2 hover:bg-gray-50 rounded-2xl py-2 px-3 border border-gray-100"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center overflow-hidden border border-white">
                  {!isSuperAdmin && schoolLogoSrc ? (
                    <img
                      src={schoolLogoSrc}
                      alt={schoolName || 'School logo'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-yellow-700 font-semibold text-sm">
                      {profileInitial}
                    </span>
                  )}
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
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/admin/settings');
                    }}
                  >
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
