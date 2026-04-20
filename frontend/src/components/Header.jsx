import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  BellRing,
  Search,
  Menu,
  CalendarDays,
  X,
  ChevronDown,
  User,
  LogOut,
  ArrowRight,
  CheckCheck,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  Megaphone,
  Sparkles,
  Filter,
  Trash2,
  Archive,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudentDashboard } from './StudentDashboardContext';
import { useNotifications } from '../hooks/useNotifications';
import { AUTH_NOTICE, logoutAndRedirect } from '../utils/authSession';

const Header = ({ sidebarOpen, setSidebarOpen, onOpenProfile }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('all');
  const [hoveredNotificationId, setHoveredNotificationId] = useState(null);
  const { profile } = useStudentDashboard();

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleProfile = useCallback(() => {
    setProfileOpen((prev) => !prev);
    setShowNotifications(false);
  }, []);

  // Use real notifications hook
  const {
    notifications: allNotifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    dismissNotification,
    markAllAsRead
  } = useNotifications();

  // Toggle one dropdown, close the other
  const toggleNotifications = useCallback(async () => {
    const nextOpen = !showNotifications;
    if (nextOpen && unreadCount > 0) {
      await markAllAsRead();
    }
    setShowNotifications(nextOpen);
    setProfileOpen(false);
  }, [markAllAsRead, showNotifications, unreadCount]);

  // Filter notifications by type
  const filteredNotifications = useMemo(() => {
    if (notificationFilter === 'all') return allNotifications;
    return allNotifications.filter(n => n.type?.toLowerCase() === notificationFilter);
  }, [allNotifications, notificationFilter]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups = { today: [], yesterday: [], earlier: [] };
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    filteredNotifications.forEach(notification => {
      const notifDate = new Date(notification.createdAt);
      if (notifDate >= todayStart) {
        groups.today.push(notification);
      } else if (notifDate >= yesterdayStart) {
        groups.yesterday.push(notification);
      } else {
        groups.earlier.push(notification);
      }
    });

    return groups;
  }, [filteredNotifications]);

  // Get only recent notifications for header dropdown
  const recentNotifications = filteredNotifications.slice(0, 10);
  const latestNotification = allNotifications[0] || null;
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
    logoutAndRedirect({ navigate, notice: AUTH_NOTICE.LOGGED_OUT });
  };

  const runSearch = () => {
    const query = searchText.trim();
    if (!query) return;
    const q = query.toLowerCase();

    if (q.includes('attendance') || q.includes('present') || q.includes('absent')) {
      const filter = q.includes('present') ? 'present' : q.includes('absent') ? 'absent' : 'all';
      navigate(`/student/attendance?filter=${filter}`);
      return;
    }
    if (q.includes('journal')) {
      navigate('/student/assignments-journal');
      return;
    }
    if (q.includes('assignment') || q.includes('homework')) {
      navigate(`/student/assignments?q=${encodeURIComponent(query)}`);
      return;
    }
    if (q.includes('result')) {
      navigate('/student/results');
      return;
    }
    if (q.includes('notice')) {
      navigate('/student/noticeboard');
      return;
    }
    if (q.includes('excuse') || q.includes('leave')) {
      navigate('/student/excuse-letter');
      return;
    }
    if (q.includes('routine') || q.includes('schedule')) {
      navigate('/student/routine');
      return;
    }
    if (q.includes('profile')) {
      navigate('/student/profile');
      return;
    }
    if (q.includes('chat') || q.includes('message')) {
      navigate('/student/chat');
      return;
    }
    if (q.includes('wellbeing') || q.includes('wellness')) {
      navigate('/student/wellbeing');
      return;
    }
    if (q.includes('achievement')) {
      navigate('/student/achievements');
      return;
    }
    if (q.includes('course')) {
      navigate('/student/courses');
      return;
    }

    navigate(`/student/assignments?q=${encodeURIComponent(query)}`);
  };

  const searchSuggestions = useMemo(() => ([
    { label: 'Assignments', hint: 'View all assignments', action: () => navigate('/student/assignments') },
    { label: 'Attendance (All)', hint: 'Daily attendance overview', action: () => navigate('/student/attendance?filter=all') },
    { label: 'Attendance (Present)', hint: 'Only present days', action: () => navigate('/student/attendance?filter=present') },
    { label: 'Attendance (Absent)', hint: 'Only absent days', action: () => navigate('/student/attendance?filter=absent') },
    { label: 'Journal', hint: 'My Learning Journal', action: () => navigate('/student/assignments-journal') },
    { label: 'Results', hint: 'Academic results', action: () => navigate('/student/results') },
    { label: 'Notice Board', hint: 'School notices', action: () => navigate('/student/noticeboard') },
    { label: 'Excuse Letter', hint: 'Leave application', action: () => navigate('/student/excuse-letter') },
    { label: 'Routine', hint: 'Weekly routine', action: () => navigate('/student/routine') },
    { label: 'Profile', hint: 'Update your profile', action: () => navigate('/student/profile') },
  ]), [navigate]);

  const filteredSuggestions = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return searchSuggestions.slice(0, 5);
    return searchSuggestions
      .filter((s) => s.label.toLowerCase().includes(q) || s.hint.toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchText, searchSuggestions]);

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

  const getNotificationTypeMeta = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'assignment':
        return {
          icon: BookOpen,
          label: 'Assignment',
          accent: 'from-amber-500 to-yellow-400',
          chip: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'exam':
        return {
          icon: ClipboardCheck,
          label: 'Exam',
          accent: 'from-sky-500 to-blue-500',
          chip: 'bg-sky-50 text-sky-700 border-sky-200',
        };
      case 'result':
        return {
          icon: Sparkles,
          label: 'Result',
          accent: 'from-emerald-500 to-green-400',
          chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'fee':
        return {
          icon: CreditCard,
          label: 'Fees',
          accent: 'from-rose-500 to-red-400',
          chip: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'notice':
      case 'announcement':
        return {
          icon: Megaphone,
          label: 'Notice',
          accent: 'from-violet-500 to-indigo-500',
          chip: 'bg-violet-50 text-violet-700 border-violet-200',
        };
      default:
        return {
          icon: BellRing,
          label: 'Update',
          accent: 'from-slate-500 to-slate-400',
          chip: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Close notification dropdown
    setShowNotifications(false);

    // Navigate based on notification type
    const type = notification.type?.toLowerCase();
    const relatedEntity = notification.relatedEntity?.entityType?.toLowerCase();
    const notificationText = `${notification?.title || ''} ${notification?.message || ''} ${notification?.typeLabel || ''}`.toLowerCase();

    if (notificationText.includes('achievement')) {
      navigate('/student/achievements');
    } else if (relatedEntity === 'assignment' || type === 'assignment') {
      navigate('/student/assignments');
    } else if (relatedEntity === 'exam' || type === 'exam') {
      navigate('/student/exams');
    } else if (relatedEntity === 'result' || type === 'result') {
      navigate('/student/results');
    } else if (relatedEntity === 'fee' || type === 'fee') {
      navigate('/student/fees');
    } else if (type === 'notice' || type === 'announcement') {
      navigate('/student/noticeboard');
    } else if (type === 'class_note') {
      navigate('/student/assignments-journal');
    } else {
      // For general notifications or unknown types, go to home
      navigate('/student/home');
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
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="px-3 sm:px-5">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">

          {/* Left: Sidebar toggle + Greeting */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
            <div className="hidden sm:block min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {greeting}, <span className="text-indigo-600">{studentData.name?.split(' ')[0] || 'Student'}</span>
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <CalendarDays size={12} />
                <span>{dateLabel}</span>
                {displayClass && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span>Class {displayClass}{displaySection ? `-${displaySection}` : ''}</span>
                  </>
                )}
                {displayRoll && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span>Roll {displayRoll}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-lg mx-2">
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3 text-gray-400 pointer-events-none" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onFocus={() => setShowSearchSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 150)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); runSearch(); }
                  }}
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition-all"
                />
                {searchText && (
                  <button
                    type="button"
                    onClick={() => { setSearchText(''); setShowSearchSuggestions(true); }}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Clear"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {showSearchSuggestions && (
                <div className="absolute left-0 right-0 mt-2 rounded-xl border border-gray-100 bg-white shadow-2xl z-50 overflow-hidden">
                  {filteredSuggestions.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400">No results found</div>
                  ) : (
                    <ul>
                      {filteredSuggestions.map((s, i) => (
                        <li key={s.label}>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { setShowSearchSuggestions(false); s.action(); }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-indigo-50/50 transition-colors flex items-center gap-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}
                          >
                            <Search size={14} className="text-gray-300 shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-gray-800">{s.label}</div>
                              <div className="text-[11px] text-gray-400">{s.hint}</div>
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

          {/* Right: School + Bell + Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* School badge - desktop only */}
            {(studentData.schoolName || studentData.schoolLogo) && (
              <div className="hidden xl:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                  {studentData.schoolLogo ? (
                    <img src={studentData.schoolLogo} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400">
                      {(studentData.schoolName || 'S').slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-600 max-w-[120px] truncate">{studentData.schoolName}</span>
              </div>
            )}

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                className="relative p-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
                onClick={toggleNotifications}
                aria-label="Notifications"
              >
                <Bell size={19} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-[min(28rem,calc(100vw-1rem))] overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-[0_20px_60px_rgba(99,102,241,0.15)] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Modern Header */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-5 py-4">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                          <BellRing size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Notifications</h3>
                          <p className="text-xs text-white/80">
                            {allNotifications.length > 0
                              ? `${allNotifications.length} total • ${unreadCount > 0 ? `${unreadCount} new` : 'All caught up'}`
                              : 'No notifications'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
                        aria-label="Close"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  {allNotifications.length > 0 && (
                    <div className="border-b border-gray-100 bg-gray-50/50 px-3 py-2">
                      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                        {[
                          { value: 'all', label: 'All', icon: Bell },
                          { value: 'assignment', label: 'Assignments', icon: BookOpen },
                          { value: 'exam', label: 'Exams', icon: ClipboardCheck },
                          { value: 'result', label: 'Results', icon: Sparkles },
                          { value: 'fee', label: 'Fees', icon: CreditCard },
                          { value: 'notice', label: 'Notices', icon: Megaphone },
                        ].map((filter) => {
                          const FilterIcon = filter.icon;
                          const isActive = notificationFilter === filter.value;
                          const count = filter.value === 'all'
                            ? allNotifications.length
                            : allNotifications.filter(n => n.type?.toLowerCase() === filter.value).length;

                          return (
                            <button
                              key={filter.value}
                              onClick={() => setNotificationFilter(filter.value)}
                              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
                                isActive
                                  ? 'bg-indigo-500 text-white shadow-sm'
                                  : 'bg-white text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <FilterIcon size={13} />
                              {filter.label}
                              {count > 0 && (
                                <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                  isActive ? 'bg-white/25' : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Notification List */}
                  <div className="bg-gradient-to-b from-gray-50/50 to-white">
                    {notificationsLoading ? (
                      <div className="px-5 py-16 text-center">
                        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100">
                          <div className="h-6 w-6 animate-spin rounded-full border-3 border-indigo-200 border-t-indigo-600" />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-gray-800">Loading notifications</p>
                        <p className="mt-1 text-xs text-gray-500">Just a moment...</p>
                      </div>
                    ) : filteredNotifications.length === 0 ? (
                      <div className="px-5 py-16 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                          <BellRing size={28} />
                        </div>
                        <p className="mt-4 text-sm font-bold text-gray-800">
                          {notificationFilter === 'all' ? 'No notifications yet' : `No ${notificationFilter} notifications`}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-500 max-w-xs mx-auto">
                          {notificationFilter === 'all'
                            ? 'New updates from your teachers and school will appear here.'
                            : `You'll see ${notificationFilter} related notifications here.`}
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-[28rem] overflow-y-auto px-3 py-3 space-y-4">
                        {/* Today */}
                        {groupedNotifications.today.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 px-2">
                              <Clock size={12} className="text-indigo-500" />
                              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Today</p>
                              <div className="h-px flex-1 bg-gradient-to-r from-indigo-200 to-transparent" />
                            </div>
                            {groupedNotifications.today.map((notification) => {
                              const meta = getNotificationTypeMeta(notification.type);
                              const Icon = meta.icon;
                              const isHovered = hoveredNotificationId === notification._id;

                              return (
                                <div
                                  key={notification._id}
                                  onMouseEnter={() => setHoveredNotificationId(notification._id)}
                                  onMouseLeave={() => setHoveredNotificationId(null)}
                                  className="group relative"
                                >
                                  <div
                                    className={`relative overflow-hidden rounded-2xl border bg-white p-3.5 transition-all duration-200 ${
                                      isHovered
                                        ? 'border-indigo-200 shadow-lg shadow-indigo-100/50 -translate-y-0.5'
                                        : 'border-gray-200 shadow-sm hover:border-gray-300'
                                    }`}
                                  >
                                    {!notification.isRead && (
                                      <div className="absolute top-3 right-3">
                                        <span className="relative flex h-2.5 w-2.5">
                                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
                                        </span>
                                      </div>
                                    )}

                                    <button
                                      type="button"
                                      className="w-full text-left"
                                      onClick={() => handleNotificationClick(notification)}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.accent} text-white shadow-md`}>
                                          <Icon size={20} />
                                        </div>
                                        <div className="min-w-0 flex-1 pr-6">
                                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                            <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.chip}`}>
                                              {meta.label}
                                            </span>
                                            <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                              <Clock size={11} />
                                              {formatTimeAgo(notification.createdAt)}
                                            </span>
                                          </div>
                                          <p className="text-sm font-bold leading-snug text-gray-900 mb-1">
                                            {notification.title}
                                          </p>
                                          <p className="line-clamp-2 text-xs leading-relaxed text-gray-600">
                                            {notification.message}
                                          </p>
                                        </div>
                                      </div>
                                    </button>

                                    {/* Quick actions on hover */}
                                    <div className={`mt-2 flex items-center gap-2 transition-all duration-200 ${
                                      isHovered ? 'opacity-100 max-h-10' : 'opacity-0 max-h-0 overflow-hidden'
                                    }`}>
                                      <button
                                        type="button"
                                        onClick={(e) => handleDismiss(e, notification._id)}
                                        className="flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-100"
                                      >
                                        <Trash2 size={12} />
                                        Dismiss
                                      </button>
                                      {!notification.isRead && (
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); markAsRead(notification._id); }}
                                          className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-600 transition hover:bg-indigo-100"
                                        >
                                          <CheckCheck size={12} />
                                          Mark read
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Yesterday */}
                        {groupedNotifications.yesterday.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 px-2">
                              <Clock size={12} className="text-purple-500" />
                              <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Yesterday</p>
                              <div className="h-px flex-1 bg-gradient-to-r from-purple-200 to-transparent" />
                            </div>
                            {groupedNotifications.yesterday.map((notification) => {
                              const meta = getNotificationTypeMeta(notification.type);
                              const Icon = meta.icon;
                              const isHovered = hoveredNotificationId === notification._id;

                              return (
                                <div
                                  key={notification._id}
                                  onMouseEnter={() => setHoveredNotificationId(notification._id)}
                                  onMouseLeave={() => setHoveredNotificationId(null)}
                                  className="group relative"
                                >
                                  <div
                                    className={`relative overflow-hidden rounded-2xl border bg-white p-3.5 transition-all duration-200 ${
                                      isHovered
                                        ? 'border-purple-200 shadow-lg shadow-purple-100/50 -translate-y-0.5'
                                        : 'border-gray-200 shadow-sm hover:border-gray-300'
                                    }`}
                                  >
                                    {!notification.isRead && (
                                      <div className="absolute top-3 right-3">
                                        <span className="relative flex h-2.5 w-2.5">
                                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
                                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-purple-500" />
                                        </span>
                                      </div>
                                    )}

                                    <button
                                      type="button"
                                      className="w-full text-left"
                                      onClick={() => handleNotificationClick(notification)}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.accent} text-white shadow-md`}>
                                          <Icon size={20} />
                                        </div>
                                        <div className="min-w-0 flex-1 pr-6">
                                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                            <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.chip}`}>
                                              {meta.label}
                                            </span>
                                            <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                              <Clock size={11} />
                                              {formatTimeAgo(notification.createdAt)}
                                            </span>
                                          </div>
                                          <p className="text-sm font-bold leading-snug text-gray-900 mb-1">
                                            {notification.title}
                                          </p>
                                          <p className="line-clamp-2 text-xs leading-relaxed text-gray-600">
                                            {notification.message}
                                          </p>
                                        </div>
                                      </div>
                                    </button>

                                    {/* Quick actions on hover */}
                                    <div className={`mt-2 flex items-center gap-2 transition-all duration-200 ${
                                      isHovered ? 'opacity-100 max-h-10' : 'opacity-0 max-h-0 overflow-hidden'
                                    }`}>
                                      <button
                                        type="button"
                                        onClick={(e) => handleDismiss(e, notification._id)}
                                        className="flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-100"
                                      >
                                        <Trash2 size={12} />
                                        Dismiss
                                      </button>
                                      {!notification.isRead && (
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); markAsRead(notification._id); }}
                                          className="flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1.5 text-[11px] font-semibold text-purple-600 transition hover:bg-purple-100"
                                        >
                                          <CheckCheck size={12} />
                                          Mark read
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Earlier */}
                        {groupedNotifications.earlier.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 px-2">
                              <Archive size={12} className="text-gray-400" />
                              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Earlier</p>
                              <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
                            </div>
                            {groupedNotifications.earlier.map((notification) => {
                              const meta = getNotificationTypeMeta(notification.type);
                              const Icon = meta.icon;
                              const isHovered = hoveredNotificationId === notification._id;

                              return (
                                <div
                                  key={notification._id}
                                  onMouseEnter={() => setHoveredNotificationId(notification._id)}
                                  onMouseLeave={() => setHoveredNotificationId(null)}
                                  className="group relative"
                                >
                                  <div
                                    className={`relative overflow-hidden rounded-2xl border bg-white p-3.5 transition-all duration-200 ${
                                      isHovered
                                        ? 'border-gray-300 shadow-lg shadow-gray-100/50 -translate-y-0.5'
                                        : 'border-gray-200 shadow-sm hover:border-gray-300'
                                    }`}
                                  >
                                    {!notification.isRead && (
                                      <div className="absolute top-3 right-3">
                                        <span className="relative flex h-2.5 w-2.5">
                                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gray-400 opacity-75" />
                                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gray-500" />
                                        </span>
                                      </div>
                                    )}

                                    <button
                                      type="button"
                                      className="w-full text-left"
                                      onClick={() => handleNotificationClick(notification)}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.accent} text-white shadow-md`}>
                                          <Icon size={20} />
                                        </div>
                                        <div className="min-w-0 flex-1 pr-6">
                                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                            <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.chip}`}>
                                              {meta.label}
                                            </span>
                                            <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                              <Clock size={11} />
                                              {formatTimeAgo(notification.createdAt)}
                                            </span>
                                          </div>
                                          <p className="text-sm font-bold leading-snug text-gray-900 mb-1">
                                            {notification.title}
                                          </p>
                                          <p className="line-clamp-2 text-xs leading-relaxed text-gray-600">
                                            {notification.message}
                                          </p>
                                        </div>
                                      </div>
                                    </button>

                                    {/* Quick actions on hover */}
                                    <div className={`mt-2 flex items-center gap-2 transition-all duration-200 ${
                                      isHovered ? 'opacity-100 max-h-10' : 'opacity-0 max-h-0 overflow-hidden'
                                    }`}>
                                      <button
                                        type="button"
                                        onClick={(e) => handleDismiss(e, notification._id)}
                                        className="flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-100"
                                      >
                                        <Trash2 size={12} />
                                        Dismiss
                                      </button>
                                      {!notification.isRead && (
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); markAsRead(notification._id); }}
                                          className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-200"
                                        >
                                          <CheckCheck size={12} />
                                          Mark read
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer Actions */}
                    {allNotifications.length > 0 && (
                      <div className="border-t border-gray-100 bg-white px-3 py-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowNotifications(false);
                            navigate('/student/noticeboard');
                          }}
                          className="flex w-full items-center justify-between rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 text-left transition hover:border-indigo-300 hover:from-indigo-100 hover:to-purple-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                              <Megaphone size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">View all notifications</p>
                              <p className="text-xs text-gray-500">See complete history in notice board</p>
                            </div>
                          </div>
                          <ArrowRight size={18} className="text-indigo-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-gray-200" />

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-gray-100 active:scale-95 transition-all"
                onClick={toggleProfile}
                aria-label="Profile menu"
              >
                {hasProfileImage ? (
                  <img
                    src={profileImage}
                    alt=""
                    className="w-8 h-8 rounded-lg border border-gray-200 object-cover"
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {initialsLabel}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-gray-800 leading-tight">{studentData.name?.split(' ')[0] || 'Student'}</p>
                  <p className="text-[10px] text-gray-400">Student</p>
                </div>
                <ChevronDown size={14} className={`hidden md:block text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  {/* Profile card */}
                  <div className="px-4 py-3 bg-linear-to-br from-indigo-50 to-purple-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      {hasProfileImage ? (
                        <img src={profileImage} alt="" className="w-10 h-10 rounded-lg border-2 border-white object-cover shadow-sm" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                          {initialsLabel}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{studentData.name || 'Student'}</p>
                        <p className="text-[11px] text-gray-500">
                          {displayClass ? `Class ${displayClass}${displaySection ? `-${displaySection}` : ''}` : 'Student'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => { if (onOpenProfile) onOpenProfile(); setProfileOpen(false); }}
                    >
                      <User size={15} className="text-gray-400" />
                      My Profile
                    </button>
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} className="text-red-400" />
                      Sign out
                    </button>
                  </div>
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
