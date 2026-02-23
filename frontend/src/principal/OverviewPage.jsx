import React from 'react';
import {
  Calendar, Download, Filter, RefreshCw, ArrowUp, ArrowDown,
  Bell, Activity, BarChart3, PieChart
} from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';

const OverviewPage = ({ overview, isLoading, loadError, schoolStats, quickStats, attendanceTrend, studentPerformance, criticalNotifications, recentActivities, monthlyGrowth }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // ChartJS data for Attendance Trend
  const attendanceChartData = {
    labels: attendanceTrend.map((d) => d.month),
    datasets: [
      {
        label: 'Attendance Rate (%)',
        data: attendanceTrend.map((d) => d.value),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 8,
      },
      {
        label: 'Target (%)',
        data: Array(attendanceTrend.length).fill(95),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderRadius: 8,
      }
    ]
  };

  const attendanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Attendance Trend (Last 6 Months)' },
    },
    scales: {
      y: {
        min: 85,
        max: 100,
        ticks: { stepSize: 1 },
        title: { display: true, text: 'Attendance (%)' },
      },
    },
  };

  // ChartJS data for Student Performance Distribution
  const performanceChartData = {
    labels: studentPerformance.map((d) => d.grade),
    datasets: [
      {
        label: 'Students',
        data: studentPerformance.map((d) => d.students),
        backgroundColor: [
          'rgba(251, 191, 36, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(107, 114, 128, 0.7)'
        ],
        borderColor: [
          'rgba(251, 191, 36, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(107, 114, 128, 1)'
        ],
        borderWidth: 2,
      }
    ]
  };

  const performanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Student Performance Distribution' },
    },
  };

  const renderQuickStatsCard = (stat, index) => {
    const Icon = stat.icon;
    return (
      <div
        key={index}
        className={`relative rounded-xl p-6 shadow-lg overflow-hidden bg-white`}
      >
        <div className={`absolute top-0 left-0 w-full h-1 ${stat.color}`}></div>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
            <div className={`p-2 rounded-lg ${stat.color.replace('600', '100')} text-white`}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              {stat.change && (
                <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                  stat.changeType === 'increase'
                    ? 'text-green-600'
                    : stat.changeType === 'decrease'
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}>
                  {stat.changeType === 'increase' && <ArrowUp className="w-3 h-3" />}
                  {stat.changeType === 'decrease' && <ArrowDown className="w-3 h-3" />}
                  {stat.change}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-xl p-6 text-black relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-geometric.png')] opacity-10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">{getGreeting()}, Principal</h1>
              <p className="text-black opacity-90">Comprehensive analytics for Electronic Educare Center</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                <Calendar className="w-5 h-5" />
                <span>{new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">School Overview</h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-black hover:bg-gray-200 rounded-lg text-sm transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-black hover:bg-gray-200 rounded-lg text-sm transition-colors">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {quickStats.map((stat, index) => renderQuickStatsCard(stat, index))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend</h3>
          <div className="h-64">
            {attendanceTrend.length > 0 ? (
              <Bar data={attendanceChartData} options={attendanceChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No attendance data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Student Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Performance Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            {studentPerformance.length > 0 ? (
              <Pie data={performanceChartData} options={performanceChartOptions} />
            ) : (
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No performance data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Notifications */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-500" />
              Critical Alerts
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {criticalNotifications.length > 0 ? (
              criticalNotifications.map((notification) => (
                <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 flex-shrink-0 p-2 rounded-full ${notification.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{notification.title}</p>
                        <span className="text-xs text-gray-500">{notification.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No critical notifications</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Recent Activities
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${activity.type === 'staff' ? 'bg-green-500' : activity.type === 'student' ? 'bg-blue-500' : activity.type === 'finance' ? 'bg-purple-500' : 'bg-orange-500'}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Activity className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
