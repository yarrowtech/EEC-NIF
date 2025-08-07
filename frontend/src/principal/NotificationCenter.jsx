import React, { useState } from 'react';
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
  DollarSign
} from 'lucide-react';

const NotificationCenter = ({ notifications = [] }) => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extended notifications for demonstration
  const allNotifications = [
    ...notifications,
    {
      id: 5,
      type: 'info',
      title: 'New Student Enrollment',
      message: '15 new students enrolled for the upcoming semester',
      timestamp: '4 hours ago',
      priority: 'low',
      department: 'Admission',
      read: false
    },
    {
      id: 6,
      type: 'success',
      title: 'Infrastructure Upgrade Complete',
      message: 'Science lab renovation completed successfully',
      timestamp: '6 hours ago',
      priority: 'medium',
      department: 'Facility',
      read: true
    },
    {
      id: 7,
      type: 'warning',
      title: 'Maintenance Schedule',
      message: 'Library maintenance scheduled for this weekend',
      timestamp: '8 hours ago',
      priority: 'medium',
      department: 'Maintenance',
      read: false
    },
    {
      id: 8,
      type: 'urgent',
      title: 'Parent Complaint',
      message: 'Urgent complaint regarding cafeteria food quality',
      timestamp: '12 hours ago',
      priority: 'high',
      department: 'Administration',
      read: false
    },
    {
      id: 9,
      type: 'academic',
      title: 'Teacher Conference Request',
      message: 'Ms. Johnson requests conference about curriculum changes',
      timestamp: '1 day ago',
      priority: 'medium',
      department: 'Academic',
      read: true
    },
    {
      id: 10,
      type: 'financial',
      title: 'Monthly Budget Report',
      message: 'February budget report is now available for review',
      timestamp: '1 day ago',
      priority: 'low',
      department: 'Finance',
      read: true
    }
  ];

  const priorityStats = {
    high: allNotifications.filter(n => n.priority === 'high').length,
    medium: allNotifications.filter(n => n.priority === 'medium').length,
    low: allNotifications.filter(n => n.priority === 'low').length,
    unread: allNotifications.filter(n => !n.read).length
  };

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
    if (priority === 'high') return 'red';
    switch (type) {
      case 'urgent': return 'red';
      case 'warning': return 'yellow';
      case 'success': return 'green';
      case 'financial': return 'emerald';
      case 'academic': return 'blue';
      case 'staff': return 'purple';
      default: return 'gray';
    }
  };

  const getDepartmentIcon = (department) => {
    switch (department.toLowerCase()) {
      case 'academic': return FileText;
      case 'finance': return DollarSign;
      case 'hr': return User;
      case 'safety': return AlertTriangle;
      case 'administration': return User;
      default: return Bell;
    }
  };

  const filteredNotifications = allNotifications.filter(notification => {
    if (filter !== 'all' && notification.priority !== filter && filter !== 'unread') return false;
    if (filter === 'unread' && notification.read) return false;
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notification Center</h1>
            <p className="text-yellow-100">Manage all school notifications and alerts</p>
          </div>
          <div className="text-right">
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
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-amber-900">{allNotifications.length}</div>
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

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-600">{priorityStats.unread}</div>
              <div className="text-sm text-gray-500">Unread</div>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Notifications</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
              <option value="unread">Unread Only</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Mark All Read
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Archive All
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="divide-y divide-gray-100">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const DeptIcon = getDepartmentIcon(notification.department);
              const color = getNotificationColor(notification.type, notification.priority);
              
              return (
                <div 
                  key={notification.id} 
                  className={`p-6 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg flex-shrink-0 ${
                      color === 'red' ? 'bg-red-100' :
                      color === 'yellow' ? 'bg-yellow-100' :
                      color === 'green' ? 'bg-green-100' :
                      color === 'emerald' ? 'bg-emerald-100' :
                      color === 'blue' ? 'bg-blue-100' :
                      color === 'purple' ? 'bg-purple-100' :
                      'bg-gray-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        color === 'red' ? 'text-red-600' :
                        color === 'yellow' ? 'text-yellow-600' :
                        color === 'green' ? 'text-green-600' :
                        color === 'emerald' ? 'text-emerald-600' :
                        color === 'blue' ? 'text-blue-600' :
                        color === 'purple' ? 'text-purple-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                            )}
                          </h4>
                          <p className="text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                            notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {notification.priority}
                          </span>
                          <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {notification.timestamp}
                          </div>
                          <div className="flex items-center gap-1">
                            <DeptIcon className="w-4 h-4" />
                            {notification.department}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Archive">
                            <Archive className="w-4 h-4 text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Flag">
                            <Flag className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
        
        {filteredNotifications.length > 10 && (
          <div className="p-6 bg-gray-50 text-center">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Load More Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;