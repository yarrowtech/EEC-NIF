import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  Search,
  Filter,
  Calendar,
  User,
  AlertCircle,
  Info,
  CheckCircle,
  Pin,
  Download,
  Share2,
  Bookmark,
  BookmarkCheck,
  File,
  FileText,
  Image as ImageIcon,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Megaphone,
  MessageSquare,
} from 'lucide-react';
import { fetchCachedJson } from '../utils/studentApiCache';

/* ─── Helpers ─── */
const looksLikeUserId = (value) => {
  const v = String(value || '').trim();
  if (!v) return false;
  return /^[A-Z0-9-]{6,}$/.test(v);
};

const resolvePriority = (notice) => (notice?.priority || 'general').toLowerCase();
const resolveCategory = (notice) => (notice?.category || notice?.audience || 'general').toLowerCase();
const resolveType = (notice) => {
  const explicit = String(notice?.typeLabel || '').trim();
  if (explicit) return explicit;
  const raw = String(notice?.type || 'notice').trim().toLowerCase();
  if (!raw) return 'Notice';
  return raw
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
};
const resolveDate = (notice) => notice?.date || notice?.createdAt || notice?.updatedAt || null;
const resolveId = (notice) => notice?._id || notice?.id;

const resolveAuthor = (notice) => {
  const rawName = notice?.createdByName || '';
  const safeName = rawName && !looksLikeUserId(rawName) ? rawName : '';
  if (notice?.createdByType === 'admin') return safeName ? `School Admin · ${safeName}` : 'School Admin';
  if (notice?.createdByType === 'teacher') return safeName ? `Teacher · ${safeName}` : 'Teacher';
  return notice?.author || 'School Administration';
};

const PRIORITY_META = {
  high:    { label: 'High',    badge: 'bg-red-100 text-red-700 border-red-200',       bar: 'bg-red-500',    icon: AlertCircle },
  medium:  { label: 'Medium',  badge: 'bg-amber-100 text-amber-700 border-amber-200', bar: 'bg-amber-400',  icon: Info },
  low:     { label: 'Low',     badge: 'bg-green-100 text-green-700 border-green-200', bar: 'bg-green-500',  icon: CheckCircle },
  general: { label: 'General', badge: 'bg-gray-100 text-gray-600 border-gray-200',    bar: 'bg-gray-300',   icon: Bell },
};

const CATEGORY_META = {
  academic:  'bg-blue-100 text-blue-700 border-blue-200',
  events:    'bg-purple-100 text-purple-700 border-purple-200',
  transport: 'bg-orange-100 text-orange-700 border-orange-200',
  general:   'bg-gray-100 text-gray-600 border-gray-200',
};

const getFileIcon = (type) => {
  if (type?.startsWith('image/')) return ImageIcon;
  if (type === 'application/pdf') return FileText;
  return File;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const formatDate = (raw) => {
  if (!raw) return 'Date TBA';
  return new Date(raw).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

/* ─── Skeleton ─── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="flex">
      <div className="w-1.5 bg-gray-200 shrink-0" />
      <div className="flex-1 p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
          <div className="h-5 w-20 bg-gray-200 rounded-full" />
        </div>
        <div className="h-5 w-2/3 bg-gray-200 rounded-lg" />
        <div className="h-4 w-full bg-gray-100 rounded-lg" />
        <div className="h-4 w-4/5 bg-gray-100 rounded-lg" />
        <div className="flex gap-4 pt-2">
          <div className="h-4 w-24 bg-gray-100 rounded" />
          <div className="h-4 w-20 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  </div>
);

/* ─── Notice card ─── */
const NoticeCard = ({ notice, isBookmarked, onBookmark }) => {
  const [expanded, setExpanded] = useState(false);

  const noticeId = resolveId(notice);
  const priority = resolvePriority(notice);
  const category = resolveCategory(notice);
  const meta = PRIORITY_META[priority] || PRIORITY_META.general;
  const PriorityIcon = meta.icon;
  const catClass = CATEGORY_META[category] || CATEGORY_META.general;
  const isPinned = Boolean(notice.pinned);
  const author = resolveAuthor(notice);
  const displayDate = resolveDate(notice);
  const subjectLabel = notice.subjectName || notice.subject || '';
  const attachments = Array.isArray(notice.attachments) ? notice.attachments : [];
  const message = notice.message || '';
  const isLong = message.length > 200;

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
        isPinned ? 'border-purple-200 ring-2 ring-purple-100' : 'border-gray-100'
      }`}
    >
      <div className="flex">
        {/* Priority accent bar */}
        <div className={`w-1.5 shrink-0 ${meta.bar}`} />

        <div className="flex-1 p-5">
          {/* Badges + actions */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              {isPinned && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 text-xs font-medium">
                  <Pin className="w-3 h-3" /> Pinned
                </span>
              )}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${meta.badge}`}>
                <PriorityIcon className="w-3 h-3" /> {meta.label}
              </span>
              <span className={`px-2 py-0.5 rounded-full border text-xs font-medium capitalize ${catClass}`}>
                {category}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onBookmark(noticeId)}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                className={`p-1.5 rounded-lg transition-colors ${
                  isBookmarked
                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}
              >
                {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
              <button
                title="Share"
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 leading-snug mb-2">{notice.title}</h3>

          {/* Message */}
          <div className="text-sm text-gray-600 leading-relaxed">
            <p className={!expanded && isLong ? 'line-clamp-3' : ''}>{message}</p>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-0.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 mt-1 transition-colors"
              >
                {expanded
                  ? (<><ChevronUp className="w-3 h-3" /> Show less</>)
                  : (<><ChevronDown className="w-3 h-3" /> Read more</>)}
              </button>
            )}
          </div>

          {subjectLabel && (
            <p className="text-xs text-gray-400 mt-1.5">Subject: {subjectLabel}</p>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-600">
                  Attachments ({attachments.length})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {attachments.map((att, idx) => {
                  const FileIcon = getFileIcon(att?.type);
                  return (
                    <a
                      key={idx}
                      href={att?.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
                    >
                      <div className="p-1.5 bg-white rounded-lg border border-gray-100 shadow-sm group-hover:border-indigo-200 transition-colors">
                        <FileIcon className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-medium truncate text-xs group-hover:text-indigo-700">
                          {att?.name || `File ${idx + 1}`}
                        </p>
                        {att?.size && <p className="text-gray-400 text-xs">{formatFileSize(att.size)}</p>}
                      </div>
                      <Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500 shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
            <span className="inline-flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> {author}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {formatDate(displayDate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Stat card ─── */
const StatCard = ({ icon: Icon, iconBg, iconColor, value, label }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
    <div className={`p-2.5 rounded-xl ${iconBg}`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  </div>
);

/* ─── Main ─── */
const NoticeBoard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [bookmarkedNotices, setBookmarkedNotices] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [classTeacher, setClassTeacher] = useState(null);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedTypes, setExpandedTypes] = useState({});

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        if (!token || userType !== 'Student') { setLoading(false); return; }

        const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
          .replace(/\/$/, '').replace(/\/api$/, '');

        const { data } = await fetchCachedJson(`${API_BASE}/api/notifications/user`, {
          ttlMs: 2 * 60 * 1000,
          fetchOptions: { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
        });
        setNotices(Array.isArray(data) ? data : []);
        setLastUpdated(new Date());

        setTeacherLoading(true);
        const { data: teacherData } = await fetchCachedJson(`${API_BASE}/api/student/auth/class-teacher`, {
          ttlMs: 5 * 60 * 1000,
          fetchOptions: { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
        });
        setClassTeacher(teacherData?.teacher || null);
      } catch (err) {
        console.error('Failed to fetch notices:', err);
        setError(err.message);
      } finally {
        setLoading(false);
        setTeacherLoading(false);
      }
    };
    fetchNotices();
  }, []);

  const toggleBookmark = (id) =>
    setBookmarkedNotices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const filteredNotices = notices.filter(notice => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (notice.title || '').toLowerCase().includes(q) ||
      (notice.message || '').toLowerCase().includes(q) ||
      resolveAuthor(notice).toLowerCase().includes(q);
    const matchesPriority = filterPriority === 'all' || resolvePriority(notice) === filterPriority;
    const matchesCategory = filterCategory === 'all' || resolveCategory(notice) === filterCategory;
    return matchesSearch && matchesPriority && matchesCategory;
  });

  const sortedNotices = [...filteredNotices].sort((a, b) => {
    if (Boolean(a.pinned) && !Boolean(b.pinned)) return -1;
    if (!Boolean(a.pinned) && Boolean(b.pinned)) return 1;
    return new Date(resolveDate(b) || 0) - new Date(resolveDate(a) || 0);
  });

  const groupedNotices = useMemo(() => {
    const categoryMap = new Map();
    sortedNotices.forEach((notice) => {
      const categoryKey = resolveCategory(notice) || 'general';
      const typeKey = resolveType(notice) || 'Notice';
      if (!categoryMap.has(categoryKey)) categoryMap.set(categoryKey, new Map());
      const typeMap = categoryMap.get(categoryKey);
      if (!typeMap.has(typeKey)) typeMap.set(typeKey, []);
      typeMap.get(typeKey).push(notice);
    });

    const categoryOrder = ['academic', 'events', 'transport', 'general'];
    const orderedCategories = Array.from(categoryMap.keys()).sort((a, b) => {
      const ia = categoryOrder.indexOf(a);
      const ib = categoryOrder.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

    return orderedCategories.map((categoryKey) => {
      const typeMap = categoryMap.get(categoryKey);
      const types = Array.from(typeMap.keys())
        .sort((a, b) => a.localeCompare(b))
        .map((typeKey) => ({
          key: typeKey,
          notices: typeMap.get(typeKey) || [],
        }));
      return {
        key: categoryKey,
        label: categoryKey.replace(/\b\w/g, (ch) => ch.toUpperCase()),
        total: types.reduce((sum, t) => sum + t.notices.length, 0),
        types,
      };
    });
  }, [sortedNotices]);

  const categorySubtitleMap = {
    academic: 'Study, exams, and class updates',
    events: 'Programs, activities, and celebrations',
    transport: 'Bus, route, and travel notices',
    general: 'Important school announcements',
  };

  useEffect(() => {
    if (!groupedNotices.length) return;
    setExpandedCategories((prev) => {
      const next = { ...prev };
      groupedNotices.forEach((group) => {
        if (typeof next[group.key] !== 'boolean') next[group.key] = true;
      });
      return next;
    });
    setExpandedTypes((prev) => {
      const next = { ...prev };
      groupedNotices.forEach((group) => {
        group.types.forEach((typeGroup) => {
          const key = `${group.key}::${typeGroup.key}`;
          if (typeof next[key] !== 'boolean') next[key] = true;
        });
      });
      return next;
    });
  }, [groupedNotices]);

  const hasActiveFilters = filterPriority !== 'all' || filterCategory !== 'all' || searchQuery;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* Header */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-2xl p-6 md:p-8 text-white mb-6 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -left-6 w-36 h-36 bg-white/5 rounded-full pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 text-xs font-medium mb-3">
              <Megaphone className="w-3.5 h-3.5" />
              School Announcements
            </div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">Notice Board</h1>
            <p className="text-indigo-200 text-sm mt-1">
              Stay updated with the latest school notices &amp; announcements
            </p>
            {lastUpdated && !loading && (
              <p className="text-indigo-300 text-xs mt-2">
                Last updated {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 text-center min-w-[90px] shrink-0">
            <div className="text-3xl font-bold">{loading ? '—' : notices.length}</div>
            <div className="text-xs text-indigo-200 mt-0.5">Total</div>
          </div>
        </div>

        {/* Class teacher */}
        <div className="relative mt-5">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm">
            <User className="w-4 h-4 text-indigo-200" />
            {teacherLoading ? (
              <span className="text-indigo-200">Loading class teacher…</span>
            ) : classTeacher ? (
              <span>
                Class Teacher:{' '}
                <span className="font-semibold">{classTeacher.name}</span>
                {classTeacher.subject ? ` · ${classTeacher.subject}` : ''}
                {classTeacher.className ? ` · ${classTeacher.className}` : ''}
                {classTeacher.sectionName ? `-${classTeacher.sectionName}` : ''}
              </span>
            ) : (
              <span className="text-indigo-200">Class Teacher: Not assigned</span>
            )}
          </div>
        </div>

        {error && (
          <div className="relative mt-4 flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-white text-sm rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Bell}        iconBg="bg-indigo-50"  iconColor="text-indigo-500"  value={loading ? '—' : notices.length}                                          label="All Notices" />
        <StatCard icon={AlertCircle} iconBg="bg-red-50"     iconColor="text-red-500"     value={loading ? '—' : notices.filter(n => resolvePriority(n) === 'high').length} label="High Priority" />
        <StatCard icon={Pin}         iconBg="bg-purple-50"  iconColor="text-purple-500"  value={loading ? '—' : notices.filter(n => Boolean(n.pinned)).length}             label="Pinned" />
        <StatCard icon={Bookmark}    iconBg="bg-amber-50"   iconColor="text-amber-500"   value={bookmarkedNotices.length}                                                  label="Bookmarked" />
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notices…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none bg-white appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="academic">Academic</option>
              <option value="events">Events</option>
              <option value="transport">Transport</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400 self-center">Active:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-200">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="ml-0.5 hover:text-indigo-900 font-bold">×</button>
              </span>
            )}
            {filterPriority !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-200 capitalize">
                {filterPriority} priority
                <button onClick={() => setFilterPriority('all')} className="ml-0.5 hover:text-indigo-900 font-bold">×</button>
              </span>
            )}
            {filterCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-200 capitalize">
                {filterCategory}
                <button onClick={() => setFilterCategory('all')} className="ml-0.5 hover:text-indigo-900 font-bold">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Notices */}
      <div className="space-y-4">
        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : groupedNotices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">No notices found</h3>
            <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 px-1">
              Showing {sortedNotices.length} of {notices.length} notice{notices.length !== 1 ? 's' : ''}
            </p>
            {groupedNotices.map((categoryGroup) => {
              const isCategoryOpen = expandedCategories[categoryGroup.key] !== false;
              return (
                <div key={categoryGroup.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedCategories((prev) => ({
                        ...prev,
                        [categoryGroup.key]: !(prev[categoryGroup.key] !== false),
                      }))
                    }
                    className="w-full px-4 py-3.5 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-white to-indigo-50/40 hover:from-indigo-50 hover:to-indigo-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <div className="text-left min-w-0">
                        {/* <p className="text-[11px] uppercase tracking-wide text-indigo-500 font-semibold">Category</p> */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold capitalize ${CATEGORY_META[categoryGroup.key] || CATEGORY_META.general}`}>
                            {categoryGroup.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {categoryGroup.total} notice{categoryGroup.total !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {categorySubtitleMap[categoryGroup.key] || 'School announcements'}
                        </p>
                      </div>
                    </div>
                    {isCategoryOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </button>

                  {isCategoryOpen && (
                    <div className="p-3 space-y-3">
                      {categoryGroup.types.map((typeGroup) => {
                        const typeKey = `${categoryGroup.key}::${typeGroup.key}`;
                        const isTypeOpen = expandedTypes[typeKey] !== false;
                        return (
                          <div key={typeKey} className="rounded-xl border border-gray-100 overflow-hidden">
                          <button
                            type="button"
                              onClick={() =>
                                setExpandedTypes((prev) => ({
                                  ...prev,
                                  [typeKey]: !(prev[typeKey] !== false),
                                }))
                              }
                            className="w-full px-4 py-2.5 flex items-center justify-between border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors"
                          >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-7 w-7 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-left min-w-0">
                                  {/* <p className="text-[11px] uppercase tracking-wide text-violet-500 font-semibold">Type</p> */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-gray-700">{typeGroup.key}</span>
                                    <span className="text-xs text-gray-500">
                                      {typeGroup.notices.length} item{typeGroup.notices.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {isTypeOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                            </button>

                            {isTypeOpen && (
                              <div className="p-3 space-y-3 bg-white">
                                {typeGroup.notices.map((notice) => (
                                  <NoticeCard
                                    key={resolveId(notice)}
                                    notice={notice}
                                    isBookmarked={bookmarkedNotices.includes(resolveId(notice))}
                                    onBookmark={toggleBookmark}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;
