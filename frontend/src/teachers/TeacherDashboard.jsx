import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Activity,
  Calendar,
  FileText,
  ClipboardCheck,
  Bell,
  TrendingUp,
  BookOpen,
  MessageSquare,
  Award,
  BarChart3,
  Download,
  Clock,
  Eye,
  Plus,
  ChevronRight,
  Search,
  Filter,
  AlertTriangle,
  LogOut
} from 'lucide-react';

const TeacherDashboard = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [unreadNotifications] = useState(5);
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardError, setDashboardError] = useState('');
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const navigate = useNavigate();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/');
  };

  const timeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    if (Number.isNaN(diffMs)) return 'Just now';
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      setDashboardLoading(true);
      setDashboardError('');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/teacher/dashboard`, {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || 'Unable to load dashboard data');
        }
        setDashboardData(data);
      } catch (error) {
        setDashboardError(error.message || 'Unable to load dashboard data');
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Format date and time
  const formatDateTime = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const dateStr = date.toLocaleDateString('en-US', options);
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    return { dateStr, timeStr };
  };

  const { dateStr, timeStr } = formatDateTime(currentDateTime);

  const stats = dashboardData?.stats || {};
  const quickStats = [
    { 
      label: 'Total Students', 
      value: stats.totalStudents ?? 0, 
      icon: Users, 
      color: 'blue',
      change: 'Campus total',
      trend: 'neutral'
    },
    { 
      label: 'Attendance Today', 
      value: `${stats.attendanceRate ?? 0}%`, 
      icon: Activity, 
      color: 'green',
      change: 'Marked today',
      trend: 'neutral'
    },
    { 
      label: 'Pending Evaluations', 
      value: stats.pendingEvaluations ?? 0, 
      icon: FileText, 
      color: 'orange',
      change: 'Submissions pending',
      trend: 'neutral'
    },
    { 
      label: 'Upcoming Events', 
      value: stats.upcomingEvents ?? 0, 
      icon: Calendar, 
      color: 'purple',
      change: 'Scheduled today',
      trend: 'neutral'
    }
  ];

  const activityIconMap = {
    assignment: { icon: FileText, color: 'blue' },
    meeting: { icon: Calendar, color: 'purple' },
    attendance: { icon: ClipboardCheck, color: 'green' },
    announcement: { icon: Bell, color: 'yellow' },
    performance: { icon: Award, color: 'green' },
  };

  const recentActivities = (dashboardData?.recentActivities || []).map((activity) => {
    const config = activityIconMap[activity.type] || activityIconMap.assignment;
    return {
      ...activity,
      icon: config.icon,
      color: config.color,
      time: timeAgo(activity.time),
    };
  });

  const upcomingClasses = dashboardData?.upcomingClasses || [];
  const performanceMetrics = dashboardData?.performanceMetrics || [];

  // Quick Actions Data
  const quickActions = [
    {
      id: 1,
      label: 'Mark Attendance',
      description: 'Take today\'s attendance',
      icon: ClipboardCheck,
      color: 'green'
    },
    {
      id: 2,
      label: 'Create Assignment',
      description: 'New homework or project',
      icon: FileText,
      color: 'blue'
    },
    {
      id: 3,
      label: 'Schedule Meeting',
      description: 'With parents or staff',
      icon: Calendar,
      color: 'purple'
    },
    {
      id: 4,
      label: 'Post Announcement',
      description: 'Class updates or news',
      icon: Bell,
      color: 'yellow'
    },
    {
      id: 5,
      label: 'View Progress',
      description: 'Student performance tracking',
      icon: BarChart3,
      color: 'purple'
    },
    {
      id: 6,
      label: 'Identify Weak Students',
      description: 'AI-powered intervention',
      icon: AlertTriangle,
      color: 'red'
    }
  ];

  // Student Performance Data
  const topStudents = dashboardData?.topStudents || [];
  const upcomingDeadlines = dashboardData?.upcomingDeadlines || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Good Morning, {dashboardData?.teacher?.name || 'Teacher'}
            </h1>
            <p className="text-blue-100">Here's your teaching overview for {dateStr}</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Notification Icon */}
            <div className="relative">
              <button className="bg-blue-500 hover:bg-blue-400 p-3 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>
            {/* Real-time Date and Time */}
            <div className="bg-blue-500 px-4 py-2 rounded-lg flex flex-col items-center space-y-1">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">{timeStr}</span>
              </div>
              <span className="text-xs text-blue-100">{currentDateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {dashboardError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {dashboardError}
        </div>
      )}

      {dashboardLoading && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Loading campus dashboard data...
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {quickStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                  <IconComponent className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                {stat.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                <p className={`text-xs mt-2 ${stat.trend === 'up' ? 'text-green-600' : 'text-gray-500'}`}>
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Upcoming Classes */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Today's Schedule
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {upcomingClasses.map((classItem) => (
                <div key={classItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{classItem.subject}</h3>
                    <p className="text-sm text-gray-500">{classItem.class} • {classItem.room}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">{classItem.time}</p>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                      {classItem.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 flex items-center justify-center space-x-2 py-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <span>View Full Schedule</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-blue-600" />
              Recent Activities
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`p-2 rounded-lg bg-${activity.color}-100`}>
                      <IconComponent className={`w-5 h-5 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <ClipboardCheck className="w-5 h-5 mr-2 text-blue-600" />
              Quick Actions
            </h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                const ButtonContent = () => (
                  <>
                    <div className={`p-3 rounded-xl bg-${action.color}-100 mb-3 group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`w-6 h-6 text-${action.color}-600`} />
                    </div>
                    <span className="text-sm font-medium text-gray-800 text-center">{action.label}</span>
                    <span className="text-xs text-gray-500 mt-1">{action.description}</span>
                  </>
                );

                if (action.id === 5) {
                  return (
                    <Link
                      key={action.id}
                      to="/teachers/progress"
                      className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <ButtonContent />
                    </Link>
                  );
                }

                if (action.id === 6) {
                  return (
                    <Link
                      key={action.id}
                      to="/teachers/weak-students"
                      className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <ButtonContent />
                    </Link>
                  );
                }

                return (
                  <button
                    key={action.id}
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <ButtonContent />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Performance Overview
            </h2>
            <div className="flex items-center space-x-2">
              <select className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Semester</option>
              </select>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subject Performance */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Subject Averages</h3>
                <div className="space-y-4">
                  {performanceMetrics.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{subject.subject}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${subject.average}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-800 w-8">{subject.average}%</span>
                        {subject.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : subject.trend === 'down' ? (
                          <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performers */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Top Students</h3>
                <div className="space-y-3">
                  {topStudents.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.grade}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">{student.score}%</p>
                        <p className="text-xs text-green-600">{student.improvement}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Upcoming Deadlines
          </h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingDeadlines.length === 0 && (
              <div className="col-span-full text-sm text-gray-500">
                No upcoming deadlines available for this campus.
              </div>
            )}
            {upcomingDeadlines.map((item, idx) => (
              <div key={`${item.title}-${idx}`} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">Upcoming</span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'TBA'}
                  </span>
                </div>
                <h3 className="font-medium text-blue-900">{item.title}</h3>
                <p className="text-sm text-blue-700 mt-1">
                  {item.class || '-'} {item.subject ? ` - ${item.subject}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
