import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Search,
  X,
  ChevronDown,
  Settings,
  LogOut,
  CheckCheck,
  AlertCircle,
  Menu,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AUTH_NOTICE, logoutAndRedirect } from '../utils/authSession';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const AdminHeader = ({ adminUser, onOpenMobileSidebar }) => {
  const [showProfileMenu, setShowProfileMenu]       = useState(false);
  const [showNotifications, setShowNotifications]   = useState(false);
  const [showSearch, setShowSearch]                 = useState(false);
  const [searchQuery, setSearchQuery]               = useState('');
  const [searchFeedback, setSearchFeedback]         = useState('');
  const [showSuggestions, setShowSuggestions]       = useState(false);
  const [notifications, setNotifications]           = useState([]);
  const [notifLoading, setNotifLoading]             = useState(false);
  const [notifError, setNotifError]                 = useState('');
  const [readIds, setReadIds]                       = useState([]);
  const [now, setNow]                               = useState(new Date());
  const navigate = useNavigate();

  const isSuperAdmin  = String(adminUser?.role || '').toLowerCase() === 'super admin';
  const schoolLogoSrc = adminUser?.schoolLogo || adminUser?.avatar || '';
  const schoolName    = adminUser?.schoolName || '';
  const profileName   = adminUser?.name || 'Admin';
  const profileRole   = adminUser?.role || 'Administrator';
  const profileInit   = profileName.charAt(0).toUpperCase();

  /* Clock */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* Read-IDs persistence */
  const readKey = useMemo(() => {
    const r = String(adminUser?.role || 'admin').toLowerCase().replace(/\s+/g, '_');
    const u = String(adminUser?.name || 'user').toLowerCase().replace(/\s+/g, '_');
    return `admin_read_notifications_v1_${r}_${u}`;
  }, [adminUser?.role, adminUser?.name]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(readKey) || '[]');
      setReadIds(Array.isArray(stored) ? stored : []);
    } catch { setReadIds([]); }
  }, [readKey]);

  const persistReadIds = (ids) => {
    const deduped = Array.from(new Set(ids.filter(Boolean)));
    setReadIds(deduped);
    localStorage.setItem(readKey, JSON.stringify(deduped));
  };

  /* Fetch notifications */
  useEffect(() => {
    const fetch_ = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setNotifications([]); return; }
      setNotifLoading(true);
      setNotifError('');
      try {
        const res  = await fetch(`${API_BASE}/api/notifications`, {
          headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data?.error || 'Failed to load notifications');
        const all = Array.isArray(data) ? data : [];
        const filtered = all
          .filter((n) => {
            if (isSuperAdmin) return true;
            const aud = String(n?.audience || 'All').toLowerCase();
            return aud === 'all' || aud === 'student' || aud === 'admin';
          })
          .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
          .slice(0, 20);
        setNotifications(filtered);
      } catch (err) {
        setNotifError(err.message || 'Failed to load');
        setNotifications([]);
      } finally { setNotifLoading(false); }
    };
    fetch_();
    const poll = setInterval(fetch_, 45000);
    return () => clearInterval(poll);
  }, [isSuperAdmin]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !readIds.includes(String(n?._id || n?.id || ''))).length,
    [notifications, readIds]
  );

  const markRead = (id) => { if (id) persistReadIds([...readIds, String(id)]); };
  const markAllRead = () => persistReadIds(notifications.map((n) => String(n?._id || n?.id || '')));

  const resolveNotifPath = (n) => {
    const title = String(n?.title || '').toLowerCase();
    const type  = String(n?.typeLabel || '').toLowerCase();
    if (type.includes('leave request') || title.includes('leave request')) return '/admin/hr?tab=leaves';
    return '/admin/notices';
  };

  const timeAgo = (val) => {
    if (!val) return '';
    const ts = new Date(val);
    if (isNaN(ts)) return '';
    const min = Math.floor((Date.now() - ts) / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.floor(hr / 24);
    if (d < 7) return `${d}d ago`;
    return ts.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  /* Search */
  const SEARCH_TARGETS = useMemo(() => [
    { label: 'Dashboard',       hint: 'Overview',                      path: '/admin/dashboard',      keys: ['dashboard', 'home', 'overview'] },
    { label: 'Analytics',       hint: 'Reports & charts',              path: '/admin/analytics',      keys: ['analytics', 'report', 'chart'] },
    { label: 'Academic Setup',  hint: 'Classes, sections, subjects',   path: '/admin/academics',      keys: ['academic', 'class', 'section', 'subject'] },
    { label: 'Teachers',        hint: 'Manage teachers',               path: '/admin/teachers',       keys: ['teacher', 'faculty'] },
    { label: 'Students',        hint: 'Manage students',               path: '/admin/students',       keys: ['student', 'pupil'] },
    { label: 'Routines',        hint: 'Schedules & timetables',        path: '/admin/routine',        keys: ['routine', 'schedule', 'timetable'] },
    { label: 'Attendance',      hint: 'Daily attendance',              path: '/admin/attendance',     keys: ['attendance', 'present', 'absent'] },
    { label: 'Examination',     hint: 'Exams & papers',                path: '/admin/examination',    keys: ['exam', 'examination', 'test'] },
    { label: 'Results',         hint: 'Marks & results',               path: '/admin/result',         keys: ['result', 'marks'] },
    { label: 'Report Cards',    hint: 'Generate report cards',         path: '/admin/report-cards',   keys: ['report card'] },
    { label: 'Fees Collection', hint: 'Collect & track fees',          path: '/admin/fees/collection',keys: ['fees', 'payment', 'collection'] },
    { label: 'HR',              hint: 'Staff & leave management',      path: '/admin/hr',             keys: ['hr', 'leave', 'staff'] },
    { label: 'Parents',         hint: 'Parent records',                path: '/admin/parents',        keys: ['parent'] },
    { label: 'Notices',         hint: 'Notifications & notices',       path: '/admin/notices',        keys: ['notice', 'notification'] },
    { label: 'Holidays',        hint: 'Holiday calendar',              path: '/admin/holidays',       keys: ['holiday'] },
    { label: 'Settings',        hint: 'Account & app settings',        path: '/admin/settings',       keys: ['setting', 'profile'] },
  ], []);

  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SEARCH_TARGETS.slice(0, 6);
    return SEARCH_TARGETS.filter((t) =>
      t.label.toLowerCase().includes(q) ||
      t.hint.toLowerCase().includes(q) ||
      t.keys.some((k) => k.includes(q) || q.includes(k))
    ).slice(0, 8);
  }, [SEARCH_TARGETS, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    const match = SEARCH_TARGETS.find(({ keys }) => keys.some((k) => k.includes(q) || q.includes(k)));
    if (!match) { setSearchFeedback('No module found'); return; }
    setSearchFeedback('');
    setShowSuggestions(false);
    setShowSearch(false);
    navigate(match.path);
  };

  useEffect(() => {
    if (!searchFeedback) return;
    const t = setTimeout(() => setSearchFeedback(''), 2200);
    return () => clearTimeout(t);
  }, [searchFeedback]);

  const handleLogout = () => logoutAndRedirect({ navigate, notice: AUTH_NOTICE.LOGGED_OUT });

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('[data-dropdown]')) {
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm z-30">
      <div className="flex items-center gap-3 px-4 py-3 h-[60px]">

        {/* ── Mobile hamburger ── */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-all shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* ── School branding (mobile) ── */}
        <div className="flex items-center gap-2 lg:hidden min-w-0 flex-1">
          {schoolLogoSrc && (
            <img src={schoolLogoSrc} alt={schoolName} className="w-7 h-7 rounded-lg object-cover shrink-0" />
          )}
          {schoolName && (
            <span className="text-sm font-bold text-gray-800 truncate">{schoolName}</span>
          )}
        </div>

        {/* ── Desktop search ── */}
        <div className="hidden lg:flex flex-1 max-w-md relative">
          <form className="relative w-full flex items-center" onSubmit={handleSearch}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search modules…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="w-full pl-9 pr-24 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all placeholder-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setShowSuggestions(true); }}
                className="absolute right-[72px] text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Search
            </button>
          </form>

          {/* Search suggestions dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl border border-gray-100 bg-white shadow-xl z-50 overflow-hidden">
              {suggestions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400">No results</div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {suggestions.map((item) => (
                    <li key={item.path}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSearchQuery(item.label);
                          setShowSuggestions(false);
                          navigate(item.path);
                        }}
                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-indigo-50/60 transition-colors"
                      >
                        <Search size={13} className="text-gray-300 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{item.label}</p>
                          <p className="text-[11px] text-gray-400">{item.hint}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {searchFeedback && (
            <span className="absolute -bottom-6 left-0 text-xs text-amber-600 font-medium">{searchFeedback}</span>
          )}
        </div>

        {/* ── Right section ── */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Live clock — desktop only */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100">
            <Clock size={14} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500 font-medium tabular-nums">
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-xs text-gray-400">
              {now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </div>

          {/* Mobile search toggle */}
          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-all"
            onClick={() => setShowSearch((p) => !p)}
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* Notification bell */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => { setShowNotifications((p) => !p); setShowProfileMenu(false); }}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 border border-gray-100 transition-all"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-indigo-500" />
                    <span className="text-sm font-bold text-gray-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      <CheckCheck size={12} />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {notifLoading && (
                    <div className="px-4 py-6 text-sm text-gray-400 text-center">Loading…</div>
                  )}
                  {!notifLoading && notifError && (
                    <div className="px-4 py-4 text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle size={14} />{notifError}
                    </div>
                  )}
                  {!notifLoading && !notifError && notifications.length === 0 && (
                    <div className="px-4 py-8 text-sm text-gray-400 text-center">
                      <Bell size={24} className="mx-auto text-gray-200 mb-2" />
                      No notifications yet
                    </div>
                  )}
                  {!notifLoading && !notifError && notifications.map((n) => {
                    const id = String(n?._id || n?.id || '');
                    const isRead = readIds.includes(id);
                    return (
                      <button
                        key={id || n?.title}
                        type="button"
                        onClick={() => { markRead(id); setShowNotifications(false); navigate(resolveNotifPath(n)); }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${isRead ? '' : 'bg-indigo-50/50'}`}
                      >
                        <div className="flex items-start gap-2">
                          {!isRead && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                          <div className={!isRead ? '' : 'ml-3.5'}>
                            <p className="text-sm font-medium text-gray-800 line-clamp-1">{n?.title || 'Notification'}</p>
                            {n?.message && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>}
                            <p className="text-[11px] text-gray-400 mt-1">{timeAgo(n?.createdAt)}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-50 px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => { setShowNotifications(false); navigate('/admin/notices'); }}
                    className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-semibold text-center py-1"
                  >
                    View all notices →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => { setShowProfileMenu((p) => !p); setShowNotifications(false); }}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                {!isSuperAdmin && schoolLogoSrc ? (
                  <img src={schoolLogoSrc} alt={schoolName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-indigo-700 font-bold text-sm">{profileInit}</span>
                )}
              </div>
              {/* Name — desktop */}
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-800 leading-tight">{profileName}</p>
                <p className="text-[11px] text-gray-400 leading-tight">{profileRole}</p>
              </div>
              <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                {/* User card */}
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-sm font-bold text-gray-900 truncate">{profileName}</p>
                  <p className="text-xs text-gray-400 truncate">{profileRole}</p>
                  {schoolName && (
                    <p className="text-[11px] text-indigo-600 font-medium truncate mt-0.5">{schoolName}</p>
                  )}
                </div>
                <div className="py-1">
                  <button
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                    onClick={() => { setShowProfileMenu(false); navigate('/admin/settings'); }}
                  >
                    <Settings size={15} className="text-gray-400" />
                    Settings
                  </button>
                  <div className="border-t border-gray-50 my-0.5" />
                  <button
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile search bar (expanded) ── */}
      {showSearch && (
        <div className="lg:hidden px-4 pb-3">
          <form className="relative flex items-center" onSubmit={handleSearch}>
            <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search modules…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
            />
            <button
              type="button"
              onClick={() => { setShowSearch(false); setSearchQuery(''); }}
              className="absolute right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </form>
          {searchQuery && suggestions.length > 0 && (
            <div className="mt-1.5 rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
              <ul className="divide-y divide-gray-50">
                {suggestions.map((item) => (
                  <li key={item.path}>
                    <button
                      type="button"
                      onClick={() => { setShowSearch(false); setSearchQuery(''); navigate(item.path); }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-indigo-50/60 transition-colors"
                    >
                      <Search size={13} className="text-gray-300 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.label}</p>
                        <p className="text-[11px] text-gray-400">{item.hint}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default AdminHeader;
