import React, { useMemo, useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Filter,
  Search,
  MoreVertical,
  Archive,
  Flag,
  User,
  Calendar,
  FileText,
  DollarSign,
  RefreshCw,
  Loader2
} from 'lucide-react';

const NotificationCenter = ({
  notifications = [],
  loading = false,
  error = '',
  onRefresh,
}) => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const sortedNotifications = useMemo(() => {
    const list = Array.isArray(notifications) ? [...notifications] : [];
    return list.sort((a, b) => {
      const aTime = new Date(a.createdAt || a.timestamp || 0).getTime();
      const bTime = new Date(b.createdAt || b.timestamp || 0).getTime();
      return bTime - aTime;
    });
  }, [notifications]);

  const priorityStats = useMemo(() => ({
    high: sortedNotifications.filter(n => (n.priority || '').toLowerCase() === 'high').length,
    medium: sortedNotifications.filter(n => (n.priority || '').toLowerCase() === 'medium').length,
    low: sortedNotifications.filter(n => (n.priority || '').toLowerCase() === 'low').length,
    unread: sortedNotifications.filter(n => !n.read).length,
  }), [sortedNotifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'urgent':
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      case 'info':
        return Info;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type, priority) => {
    if ((priority || '').toLowerCase() === 'high') return 'red';
    switch (type) {
      case 'urgent':
      case 'warning':
        return 'yellow';
      case 'success':
        return 'green';
      case 'financial':
        return 'emerald';
      case 'academic':
        return 'blue';
      case 'staff':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const getDepartmentIcon = (department = '') => {
    switch (department.toLowerCase()) {
      case 'academic': return FileText;
      case 'finance': return DollarSign;
      case 'hr': return User;
      case 'events': return Calendar;
      case 'safety': return AlertTriangle;
      default: return Bell;
    }
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 60_000) return 'Just now';
    if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
    if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const filteredNotifications = useMemo(() => sortedNotifications.filter((notification) => {
    const priority = (notification.priority || '').toLowerCase();
    if (filter !== 'all' && filter !== 'unread' && priority !== filter) return false;
    if (filter === 'unread' && notification.read) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = (notification.title || '').toLowerCase().includes(q);
      const messageMatch = (notification.message || '').toLowerCase().includes(q);
      if (!titleMatch && !messageMatch) return false;
    }
    return true;
  }), [sortedNotifications, filter, searchQuery]);

  const handleRefresh = () => {
    if (typeof onRefresh === 'function') {
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notification Center</h1>
            <p className="text-yellow-100">Manage all school notifications and alerts</p>
          </div>
          <div className="text-right space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-2xl font-bold">{priorityStats.unread}</div>
                <div className="text-xs text-yellow-100">Unread</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <div className="text-2xl font-bold">{priorityStats.high}</div>
                <div className="text-xs text-yellow-100">Urgent</div>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/40 text-white hover:bg-white/10 disabled:opacity-70"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-amber-900">{sortedNotifications.length}</div>
              <div className="text-sm text-amber-600">Total Notifications</div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Bell className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{priorityStats.high}</div>
              <div className="text-sm text-amber-600">High Priority</div>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-amber-600">{priorityStats.medium}</div>
              <div className="text-sm text-amber-600">Medium Priority</div>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Flag className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{priorityStats.low}</div>
              <div className="text-sm text-amber-600">Low Priority</div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${filter === 'all' ? 'bg-yellow-100 text-amber-800 border-yellow-300' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <Filter className="w-4 h-4" />
              All
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${filter === 'high' ? 'bg-red-100 text-red-700 border-red-300' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <AlertTriangle className="w-4 h-4" />
              High
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${filter === 'unread' ? 'bg-purple-100 text-purple-700 border-purple-300' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <Bell className="w-4 h-4" />
              Unread
            </button>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Search notifications"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 overflow-hidden">
        <div className="divide-y divide-yellow-50">
          {loading && (
            <div className="p-8 text-center text-amber-700 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading notifications...
            </div>
          )}

          {!loading && filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const DeptIcon = getDepartmentIcon(notification.department || notification.category || '');
            const color = getNotificationColor(notification.type, notification.priority);
            const timestampLabel = formatRelativeTime(notification.createdAt || notification.timestamp);

            return (
              <div key={notification.id} className="p-4 sm:p-6 hover:bg-yellow-50/60 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl bg-${color}-100 text-${color}-700`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-amber-500">{notification.type || 'GENERAL'}</span>
                          {notification.priority && (
                            <span className={`text-xs font-semibold text-${color}-600`}>
                              {notification.priority}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-amber-900 mt-1">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-amber-700 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-amber-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timestampLabel || 'Recently'}
                          </span>
                          {notification.department && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-${color}-50 text-${color}-700`}>
                              <DeptIcon className="w-3 h-3" />
                              {notification.department}
                            </span>
                          )}
                          {notification.audience && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                              <User className="w-3 h-3" />
                              {notification.audience}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-2 text-amber-600 hover:bg-yellow-100 rounded-lg" title="Archive">
                          <Archive className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-amber-600 hover:bg-yellow-100 rounded-lg" title="More actions">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {!loading && filteredNotifications.length === 0 && (
            <div className="p-8 text-center text-amber-700">
              No notifications match the current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
