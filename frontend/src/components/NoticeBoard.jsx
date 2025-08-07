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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [notices, setNotices] = useState([
    {
      id: 1,
      title: 'Important: Mid-Term Examination Schedule',
      message: 'Mid-term examinations will begin from August 15th, 2024. Please check your individual timetables on the student portal. Make sure to bring all required materials and arrive 15 minutes before each exam.',
      date: '2024-08-05',
      priority: 'high',
      category: 'academic',
      author: 'Academic Office',
      pinned: true,
      views: 247,
      attachments: ['exam_schedule.pdf']
    },
    {
      id: 2,
      title: 'Sports Day Event - August 22nd',
      message: 'Annual Sports Day will be held on August 22nd at the main playground. Students can register for various events through the sports department. Parents are invited to attend.',
      date: '2024-08-03',
      priority: 'medium',
      category: 'events',
      author: 'Sports Department',
      pinned: false,
      views: 156,
      attachments: []
    },
    {
      id: 3,
      title: 'Library Hours Extended',
      message: 'Library hours have been extended during examination period. New timings: 7:00 AM to 9:00 PM on weekdays, 8:00 AM to 6:00 PM on weekends.',
      date: '2024-08-02',
      priority: 'medium',
      category: 'academic',
      author: 'Library Staff',
      pinned: false,
      views: 89,
      attachments: []
    },
    {
      id: 4,
      title: 'New Cafeteria Menu',
      message: 'Updated cafeteria menu is now available! We have added healthy options and regional cuisine. Special dietary requirements can be accommodated upon request.',
      date: '2024-08-01',
      priority: 'low',
      category: 'general',
      author: 'Cafeteria Management',
      pinned: false,
      views: 203,
      attachments: ['new_menu.pdf']
    },
    {
      id: 5,
      title: 'Parent-Teacher Conference',
      message: 'Parent-Teacher conferences are scheduled for August 18th and 19th. Please book your slots through the parent portal or contact the front office.',
      date: '2024-07-30',
      priority: 'high',
      category: 'events',
      author: 'Administration',
      pinned: true,
      views: 312,
      attachments: ['conference_schedule.pdf']
    },
    {
      id: 6,
      title: 'Science Fair 2024',
      message: 'Prepare your projects for the annual Science Fair! Submission deadline is August 25th. Judging will take place on August 28th. Exciting prizes await!',
      date: '2024-07-28',
      priority: 'medium',
      category: 'academic',
      author: 'Science Department',
      pinned: false,
      views: 134,
      attachments: ['science_fair_guidelines.pdf']
    },
    {
      id: 7,
      title: 'Transport Route Changes',
      message: 'Due to road construction on Main Street, Bus Route 3 will be temporarily modified. New pickup points and timings are attached. Please check your route.',
      date: '2024-07-25',
      priority: 'high',
      category: 'transport',
      author: 'Transport Department',
      pinned: false,
      views: 178,
      attachments: ['route_changes.pdf']
    },
    {
      id: 8,
      title: 'Summer Reading Program Results',
      message: 'Congratulations to all participants in our Summer Reading Program! Results and certificates are now available. Top performers will be recognized in the morning assembly.',
      date: '2024-07-22',
      priority: 'low',
      category: 'academic',
      author: 'English Department',
      pinned: false,
      views: 95,
      attachments: ['reading_program_results.pdf']
    }
  ]);
  const [showDetails, setShowDetails] = useState(null);
  
  // Filter notices based on search query and filters
  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notice.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notice.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || notice.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || notice.category === filterCategory;
    
    return matchesSearch && matchesPriority && matchesCategory;
  });
  
  // Sort notices: pinned first, then by date
  const sortedNotices = filteredNotices.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date) - new Date(a.date);
  });
  
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
              <div className="text-3xl font-bold">{notices.length}</div>
              <div className="text-sm text-yellow-100">Total Notices</div>
            </div>
          </div>
        </div>
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
                {notices.filter(n => n.priority === 'high').length}
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
                {notices.filter(n => n.pinned).length}
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
                {notices.reduce((sum, notice) => sum + notice.views, 0)}
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
        {sortedNotices.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-yellow-100">
            <Bell className="w-16 h-16 mx-auto text-amber-300 mb-4" />
            <h3 className="text-xl font-semibold text-amber-900 mb-2">No notices found</h3>
            <p className="text-amber-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          sortedNotices.map(notice => {
            const PriorityIcon = getPriorityIcon(notice.priority);
            const isBookmarked = bookmarkedNotices.includes(notice.id);
            
            return (
              <div
                key={notice.id}
                className={`bg-white rounded-xl shadow-lg border transition-all duration-200 hover:shadow-xl ${
                  notice.pinned ? 'border-purple-200 ring-2 ring-purple-100' : 'border-yellow-100'
                } hover:border-amber-200`}
              >
                <div className="p-6">
                  {/* Notice Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {notice.pinned && (
                          <div className="flex items-center gap-1 text-purple-600">
                            <Pin className="w-4 h-4" />
                            <span className="text-xs font-medium">Pinned</span>
                          </div>
                        )}
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${
                          getPriorityColor(notice.priority)
                        }`}>
                          <PriorityIcon className="w-3 h-3" />
                          {notice.priority.toUpperCase()}
                        </div>
                        <div className={`px-2 py-1 rounded-full border text-xs font-medium ${
                          getCategoryColor(notice.category)
                        }`}>
                          {notice.category.toUpperCase()}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-amber-900 mb-2 leading-tight">
                        {notice.title}
                      </h3>
                      
                      <p className="text-amber-700 leading-relaxed mb-4">
                        {notice.message}
                      </p>
                      
                      {/* Attachments */}
                      {notice.attachments && notice.attachments.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {notice.attachments.map((attachment, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-yellow-100 transition-colors"
                              >
                                <Download className="w-4 h-4 text-amber-600" />
                                <span className="text-amber-800">{attachment}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => toggleBookmark(notice.id)}
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
                        <span>{notice.author}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(notice.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{notice.views} views</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => markAsRead(notice.id)}
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
      
      {/* Load More Button */}
      {sortedNotices.length > 0 && sortedNotices.length < notices.length && (
        <div className="text-center mt-8">
          <button className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
            Load More Notices
          </button>
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;