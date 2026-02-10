import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  Clock,
  Pin,
  Eye,
  MessageSquare,
  Download,
  Share2,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

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

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');

        if (!token || userType !== 'Student') {
          setLoading(false);
          return;
        }

        const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
          .replace(/\/$/, '')
          .replace(/\/api$/, '');
        const response = await fetch(`${API_BASE}/api/notifications/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Unable to load notices at the moment.');
        }

        const data = await response.json();
        setNotices(Array.isArray(data) ? data : []);
        setLastUpdated(new Date());

        setTeacherLoading(true);
        const teacherRes = await fetch(`${API_BASE}/api/student/auth/class-teacher`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (teacherRes.ok) {
          const teacherData = await teacherRes.json().catch(() => ({}));
          setClassTeacher(teacherData?.teacher || null);
        } else {
          setClassTeacher(null);
        }
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
  const toggleBookmark = (noticeId) => {
    setBookmarkedNotices(prev => 
      prev.includes(noticeId) 
        ? prev.filter(id => id !== noticeId)
        : [...prev, noticeId]
    );
  };

  const markAsRead = (noticeId) => {
    // In a real app, this would update the backend
    console.log(`Marked notice ${noticeId} as read`);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };
  
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return AlertCircle;
      case 'medium': return Info;
      case 'low': return CheckCircle;
      default: return Bell;
    }
  };
  
  const getCategoryColor = (category) => {
    switch (category) {
      case 'academic': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'events': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'transport': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'general': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const resolvePriority = (notice) => (notice?.priority || 'general').toLowerCase();
  const resolveCategory = (notice) => (notice?.category || notice?.audience || 'general').toLowerCase();
  const resolveDate = (notice) => notice?.date || notice?.createdAt || notice?.updatedAt || null;
  const looksLikeUserId = (value) => {
    const v = String(value || '').trim();
    if (!v) return false;
    return /^[A-Z0-9-]{6,}$/.test(v);
  };

  const resolveAuthor = (notice) => {
    const rawName = notice?.createdByName || '';
    const safeName = rawName && !looksLikeUserId(rawName) ? rawName : '';
    if (notice?.createdByType === 'admin') {
      const name = safeName ? ` · ${safeName}` : '';
      return `School Admin${name}`;
    }
    if (notice?.createdByType === 'teacher') {
      const name = safeName ? ` · ${safeName}` : '';
      return `Teacher${name}`;
    }
    return notice?.author || 'School Administration';
  };
  const resolveId = (notice) => notice?._id || notice?.id;

  // Filter notices based on search query and filters
  const filteredNotices = notices.filter(notice => {
    const title = (notice.title || '').toLowerCase();
    const message = (notice.message || '').toLowerCase();
    const author = resolveAuthor(notice).toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase()) ||
                         message.includes(searchQuery.toLowerCase()) ||
                         author.includes(searchQuery.toLowerCase());

    const priority = resolvePriority(notice);
    const category = resolveCategory(notice);
    const matchesPriority = filterPriority === 'all' || priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || category === filterCategory;
    
    return matchesSearch && matchesPriority && matchesCategory;
  });
  
  // Sort notices: pinned first, then by date
  const sortedNotices = [...filteredNotices].sort((a, b) => {
    const aPinned = Boolean(a.pinned);
    const bPinned = Boolean(b.pinned);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return new Date(resolveDate(b) || 0) - new Date(resolveDate(a) || 0);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-purple-50 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Bell className="w-8 h-8" />
              Notice Board
            </h1>
            <p className="text-yellow-100 text-lg">Stay updated with latest school announcements and important notices</p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 rounded-lg p-4">
              <div className="text-3xl font-bold">{loading ? '...' : notices.length}</div>
              <div className="text-sm text-yellow-100">Total Notices</div>
            </div>
            {lastUpdated && !loading && (
              <p className="text-xs text-yellow-100 mt-2">Updated {lastUpdated.toLocaleDateString()}</p>
            )}
          </div>
        </div>

        <div className="mt-5">
          <div className="inline-flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 text-sm text-white">
            <User className="w-4 h-4" />
            {teacherLoading ? (
              <span>Loading class teacher…</span>
            ) : classTeacher ? (
              <span>
                Class Teacher: <span className="font-semibold">{classTeacher.name}</span>
                {classTeacher.subject ? ` • ${classTeacher.subject}` : ''}
                {classTeacher.className ? ` • ${classTeacher.className}` : ''}
                {classTeacher.sectionName ? `-${classTeacher.sectionName}` : ''}
              </span>
            ) : (
              <span>Class Teacher: Not assigned</span>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-white/10 border border-red-200/30 text-white px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-yellow-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-400" />
            <input
              type="text"
              placeholder="Search notices by title, content, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-500" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="pl-10 pr-8 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              <option value="academic">Academic</option>
              <option value="events">Events</option>
              <option value="transport">Transport</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notice Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-amber-900">
                {loading ? '—' : notices.filter(n => resolvePriority(n) === 'high').length}
              </div>
              <div className="text-sm text-amber-600">High Priority</div>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-amber-900">
                {loading ? '—' : notices.filter(n => Boolean(n.pinned)).length}
              </div>
              <div className="text-sm text-amber-600">Pinned Notices</div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Pin className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-amber-900">
                {bookmarkedNotices.length}
              </div>
              <div className="text-sm text-amber-600">Bookmarked</div>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Bookmark className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-amber-900">
                {loading ? '—' : notices.reduce((sum, notice) => sum + (Number(notice.views) || 0), 0)}
              </div>
              <div className="text-sm text-amber-600">Total Views</div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Eye className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Notices Grid */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="h-40 bg-white rounded-xl shadow-lg border border-yellow-100 animate-pulse" />
            ))}
          </div>
        ) : sortedNotices.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-yellow-100">
            <Bell className="w-16 h-16 mx-auto text-amber-300 mb-4" />
            <h3 className="text-xl font-semibold text-amber-900 mb-2">No notices found</h3>
            <p className="text-amber-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          sortedNotices.map(notice => {
            const noticeId = resolveId(notice);
            const priority = resolvePriority(notice);
            const category = resolveCategory(notice);
            const subjectLabel = notice.subjectName || notice.subject || '';
            const displayDate = resolveDate(notice);
            const author = resolveAuthor(notice);
            const views = Number(notice.views) || 0;
            const attachments = Array.isArray(notice.attachments) ? notice.attachments : [];
            const PriorityIcon = getPriorityIcon(priority);
            const isBookmarked = bookmarkedNotices.includes(noticeId);
            const isPinned = Boolean(notice.pinned);
            
            return (
              <div
                key={noticeId}
                className={`bg-white rounded-xl shadow-lg border transition-all duration-200 hover:shadow-xl ${
                  isPinned ? 'border-purple-200 ring-2 ring-purple-100' : 'border-yellow-100'
                } hover:border-amber-200`}
              >
                <div className="p-6">
                  {/* Notice Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {isPinned && (
                          <div className="flex items-center gap-1 text-purple-600">
                            <Pin className="w-4 h-4" />
                            <span className="text-xs font-medium">Pinned</span>
                          </div>
                        )}
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${
                          getPriorityColor(priority)
                        }`}>
                          <PriorityIcon className="w-3 h-3" />
                          {priority.toUpperCase()}
                        </div>
                        <div className={`px-2 py-1 rounded-full border text-xs font-medium ${
                          getCategoryColor(category)
                        }`}>
                          {category.toUpperCase()}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-amber-900 mb-2 leading-tight">
                        {notice.title}
                      </h3>
                      
                      <p className="text-amber-700 leading-relaxed mb-4">
                        {notice.message}
                      </p>
                      {subjectLabel && (
                        <p className="text-xs text-amber-600 mb-3">
                          Subject: {subjectLabel}
                        </p>
                      )}
                      
                      {/* Attachments */}
                      {attachments.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {attachments.map((attachment, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-yellow-100 transition-colors"
                              >
                                <Download className="w-4 h-4 text-amber-600" />
                                {attachment?.url ? (
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-amber-800 hover:underline"
                                  >
                                    {attachment.name || 'Attachment'}
                                  </a>
                                ) : (
                                  <span className="text-amber-800">{String(attachment)}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => toggleBookmark(noticeId)}
                        className={`p-2 rounded-lg transition-colors ${
                          isBookmarked 
                            ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                      >
                        {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                      </button>
                      
                      <button
                        className="p-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                        title="Share notice"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Notice Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-yellow-100">
                    <div className="flex items-center gap-4 text-sm text-amber-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{author}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{displayDate ? new Date(displayDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'Date TBA'}</span>
                      </div>
                      
                      {/* <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{views} views</span>
                      </div> */}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => markAsRead(noticeId)}
                        className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm font-medium"
                      >
                        Mark as Read
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
    </div>
  );
};

export default NoticeBoard;
