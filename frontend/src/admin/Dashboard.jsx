import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  Bus,
  Users,
  UserCheck,
  User,
  Calendar as CalendarIcon,
  FileText,
  School,
  TrendingUp,
  BookOpen,
  GraduationCap,
  UsersRound,
  Plus,
  Bell,
  FileBarChart,
  AlertCircle,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Quick actions
const quickActions = [
  { title: 'Add Student', action: 'student', icon: Plus, color: 'blue' },
  { title: 'Create Course', action: 'course', icon: BookOpen, color: 'green' },
  { title: 'Send Notification', action: 'notification', icon: Bell, color: 'purple' },
  { title: 'Generate Report', action: 'report', icon: FileBarChart, color: 'orange' },
];

// Fees data
const feesData = [
  { month: 'Jan', collected: 120000, due: 30000 },
  { month: 'Feb', collected: 110000, due: 25000 },
  { month: 'Mar', collected: 130000, due: 20000 },
  { month: 'Apr', collected: 125000, due: 28000 },
  { month: 'May', collected: 140000, due: 22000 },
  { month: 'Jun', collected: 135000, due: 25000 },
];

// Upcoming events
const upcomingEvents = [
  { date: '2025-07-05', title: 'Annual Sports Day', desc: 'All students and staff participate in sports events.', type: 'sports' },
  { date: '2025-07-12', title: 'Parent-Teacher Meeting', desc: 'Meetings for all classes.', type: 'meeting' },
  { date: '2025-07-20', title: 'Science Exhibition', desc: 'Student science projects on display.', type: 'academic' },
];

// Recent activity
const recentActivity = [
  { time: '10 mins ago', activity: 'New student enrollment completed', type: 'info' },
  { time: '1 hour ago', activity: 'Fee payment received from Class 10-A', type: 'success' },
  { time: '2 hours ago', activity: 'Teacher leave request pending approval', type: 'warning' },
];

const Dashboard = ({ setShowAdminHeader }) => {
  const [selectedAction, setSelectedAction] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  const handleActionClick = (action) => {
    setSelectedAction(action);
    setTimeout(() => setSelectedAction(null), 2000);
  };

  useEffect(() => {
    setShowAdminHeader(true);
  }, [setShowAdminHeader]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/dashboard-stats`, {
          headers: {
            authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load dashboard stats');
        }
        setDashboardStats(data);
      } catch (err) {
        setStatsError(err.message || 'Failed to load dashboard stats');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        icon: 'text-blue-500',
        hover: 'hover:bg-blue-100',
        progress: 'bg-blue-500'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-600',
        icon: 'text-green-500',
        hover: 'hover:bg-green-100',
        progress: 'bg-green-500'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600',
        icon: 'text-purple-500',
        hover: 'hover:bg-purple-100',
        progress: 'bg-purple-500'
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-600',
        icon: 'text-orange-500',
        hover: 'hover:bg-orange-100',
        progress: 'bg-orange-500'
      }
    };
    return colors[color] || colors.blue;
  };

  const totalStudents = dashboardStats?.students?.total || 0;
  const recentStudents = dashboardStats?.students?.recent || 0;
  const totalTeachers = dashboardStats?.teachers?.total || 0;
  const recentTeachers = dashboardStats?.teachers?.recent || 0;
  const totalParents = dashboardStats?.parents?.total || 0;
  const recentParents = dashboardStats?.parents?.recent || 0;
  const totalUsers = dashboardStats?.totalUsers || 0;

  const getPercent = (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  const keyMetrics = [
    {
      label: 'Students',
      value: totalStudents,
      total: totalStudents,
      percentage: getPercent(recentStudents, totalStudents),
      icon: Users,
      color: 'blue',
      trend: `${recentStudents} new in 30 days`
    },
    {
      label: 'Teachers',
      value: totalTeachers,
      total: totalTeachers,
      percentage: getPercent(recentTeachers, totalTeachers),
      icon: UserCheck,
      color: 'green',
      trend: `${recentTeachers} new in 30 days`
    },
    {
      label: 'Parents',
      value: totalParents,
      total: totalParents,
      percentage: getPercent(recentParents, totalParents),
      icon: UsersRound,
      color: 'purple',
      trend: `${recentParents} new in 30 days`
    },
    {
      label: 'Total Users',
      value: totalUsers,
      total: totalUsers,
      percentage: getPercent(dashboardStats?.recentTotal || 0, totalUsers),
      icon: Users,
      color: 'orange',
      trend: `${dashboardStats?.recentTotal || 0} new in 30 days`
    },
  ];

  const statsOverview = [
    { label: 'Total Teachers', value: totalTeachers, icon: GraduationCap, change: `+${recentTeachers}`, color: 'blue' },
    { label: 'Total Students', value: totalStudents, icon: Users, change: `+${recentStudents}`, color: 'green' },
    { label: 'Total Parents', value: totalParents, icon: UsersRound, change: `+${recentParents}`, color: 'orange' },
    { label: 'Total Users', value: totalUsers, icon: Users, change: `+${dashboardStats?.recentTotal || 0}`, color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here is what is happening today.</p>
        </div>

        {statsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            {statsError}
          </div>
        )}

        {/* Key Metrics - Attendance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyMetrics.map((metric) => {
            const Icon = metric.icon;
            const colors = getColorClasses(metric.color);
            return (
              <div key={metric.label} className={`bg-white rounded-xl p-6 shadow-sm border ${colors.border} hover:shadow-md transition-shadow duration-200`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colors.bg}`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                    {metric.percentage}%
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
                    <span className="text-sm text-gray-500">/ {metric.total}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className={`${colors.progress} h-2 rounded-full transition-all duration-300`} style={{ width: `${metric.percentage}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {statsLoading ? 'Loading...' : metric.trend}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsOverview.map((stat) => {
            const Icon = stat.icon;
            const colors = getColorClasses(stat.color);
            return (
              <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : stat.value}
                    </h3>
                    <p className={`text-xs ${colors.text} font-medium mt-2 flex items-center gap-1`}>
                      <TrendingUp className="w-3 h-3" />
                      {statsLoading ? 'Loading...' : `${stat.change} this month`}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${colors.bg}`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fees Collection & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Fees Collection Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-gray-700" />
                  Fees Collection
                </h2>
                <p className="text-sm text-gray-600 mt-1">Last 6 months overview</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total Collected</p>
                <p className="text-xl font-bold text-gray-900">
                  ₹{(feesData.reduce((a, b) => a + b.collected, 0) / 100000).toFixed(1)}L
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={feesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="collected" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Collected" />
                <Bar dataKey="due" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Due" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const colors = getColorClasses(action.color);
                return (
                  <button
                    key={action.action}
                    onClick={() => handleActionClick(action.action)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${
                      selectedAction === action.action
                        ? `${colors.bg} ${colors.border} scale-95`
                        : `border-gray-200 hover:border-${action.color}-300 ${colors.hover}`
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                      <Icon className={`w-4 h-4 ${colors.icon}`} />
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{action.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-gray-700" />
              Upcoming Events
            </h2>
            <div className="space-y-4">
              {upcomingEvents.map((event, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center min-w-[60px] p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-lg font-bold text-blue-600">{new Date(event.date).getDate()}</span>
                    <span className="text-xs text-blue-600 font-medium">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-700" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((item, idx) => (
                <div key={idx} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className={`mt-1 p-1.5 rounded-full ${
                    item.type === 'success' ? 'bg-green-100' :
                    item.type === 'warning' ? 'bg-orange-100' : 'bg-blue-100'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      item.type === 'success' ? 'bg-green-500' :
                      item.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                    }`}></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 mb-1">{item.activity}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bus Schedule & Classroom Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Bus Schedule */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bus className="w-5 h-5 text-gray-700" />
              Bus Schedule
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Bus</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Route</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Departure</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Arrival</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-2 font-medium text-gray-900">Bus 1</td>
                    <td className="py-3 px-2 text-gray-600">Sector 5 - School</td>
                    <td className="py-3 px-2 text-gray-600">7:15 AM</td>
                    <td className="py-3 px-2 text-gray-600">1:45 PM</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 font-medium text-gray-900">Bus 2</td>
                    <td className="py-3 px-2 text-gray-600">Salt Lake - School</td>
                    <td className="py-3 px-2 text-gray-600">7:30 AM</td>
                    <td className="py-3 px-2 text-gray-600">2:00 PM</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Classroom Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <School className="w-5 h-5 text-gray-700" />
              Classroom Status
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { room: 'Room 101', status: 'Occupied' },
                { room: 'Room 102', status: 'Empty' },
                { room: 'Room 103', status: 'Occupied' },
                { room: 'Room 104', status: 'Empty' },
              ].map((room, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${
                    room.status === 'Occupied'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h4 className="font-semibold text-gray-900 mb-1">{room.room}</h4>
                  <p className={`text-sm font-medium ${
                    room.status === 'Occupied' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {room.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Emergency Contacts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="text-3xl">🚔</div>
              <div>
                <h4 className="font-semibold text-gray-900">Police</h4>
                <p className="text-sm text-gray-600">Phone: 100</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-orange-50 border border-orange-200">
              <div className="text-3xl">🔥</div>
              <div>
                <h4 className="font-semibold text-gray-900">Fire</h4>
                <p className="text-sm text-gray-600">Phone: 101</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-3xl">🏥</div>
              <div>
                <h4 className="font-semibold text-gray-900">Hospital</h4>
                <p className="text-sm text-gray-600">Phone: 102</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {selectedAction && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-900">
              Processing {selectedAction} action...
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
