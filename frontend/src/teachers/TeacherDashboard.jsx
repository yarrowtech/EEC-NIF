import React from 'react';
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
  Filter
} from 'lucide-react';

const TeacherDashboard = () => {
  // Quick Stats Data
  const quickStats = [
    { 
      label: 'Total Students', 
      value: '184', 
      icon: Users, 
      color: 'blue',
      change: '+12 this month',
      trend: 'up'
    },
    { 
      label: 'Attendance Today', 
      value: '94.2%', 
      icon: Activity, 
      color: 'green',
      change: '+2.5% from yesterday',
      trend: 'up'
    },
    { 
      label: 'Pending Evaluations', 
      value: '23', 
      icon: FileText, 
      color: 'orange',
      change: '5 urgent',
      trend: 'neutral'
    },
    { 
      label: 'Upcoming Events', 
      value: '7', 
      icon: Calendar, 
      color: 'purple',
      change: '2 today',
      trend: 'neutral'
    }
  ];

  // Recent Activities Data
  const recentActivities = [
    {
      id: 1,
      type: 'assignment',
      message: '12 new submissions for Mathematics Assignment',
      time: '15 minutes ago',
      icon: FileText,
      color: 'blue'
    },
    {
      id: 2,
      type: 'meeting',
      message: 'Parent-Teacher meeting scheduled with Sarah\'s parents',
      time: '45 minutes ago',
      icon: Calendar,
      color: 'purple'
    },
    {
      id: 3,
      type: 'attendance',
      message: 'Attendance marked for Grade 10-B (92% present)',
      time: '2 hours ago',
      icon: ClipboardCheck,
      color: 'green'
    },
    {
      id: 4,
      type: 'announcement',
      message: 'School holiday announced for next Friday',
      time: '3 hours ago',
      icon: Bell,
      color: 'yellow'
    },
    {
      id: 5,
      type: 'performance',
      message: 'Emma Johnson scored 98% in Physics test',
      time: '5 hours ago',
      icon: Award,
      color: 'green'
    }
  ];

  // Upcoming Classes Data
  const upcomingClasses = [
    {
      id: 1,
      subject: 'Mathematics',
      class: 'Grade 10-A',
      time: '09:00 - 09:45',
      room: 'Room 302',
      status: 'upcoming'
    },
    {
      id: 2,
      subject: 'Physics',
      class: 'Grade 11-B',
      time: '10:00 - 10:45',
      room: 'Lab 101',
      status: 'upcoming'
    },
    {
      id: 3,
      subject: 'Mathematics',
      class: 'Grade 9-C',
      time: '11:30 - 12:15',
      room: 'Room 302',
      status: 'upcoming'
    },
    {
      id: 4,
      subject: 'Consultation',
      class: 'Grade 12-A',
      time: '14:00 - 14:30',
      room: 'Staff Room',
      status: 'upcoming'
    }
  ];

  // Performance Metrics Data
  const performanceMetrics = [
    { subject: 'Mathematics', average: 87, trend: 'up' },
    { subject: 'Physics', average: 92, trend: 'up' },
    { subject: 'Chemistry', average: 78, trend: 'down' },
    { subject: 'Biology', average: 85, trend: 'neutral' }
  ];

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
    }
  ];

  // Student Performance Data
  const topStudents = [
    { name: 'Emma Johnson', grade: '10-A', score: 98, improvement: '+5%' },
    { name: 'Michael Brown', grade: '11-B', score: 96, improvement: '+3%' },
    { name: 'Sophia Williams', grade: '9-C', score: 94, improvement: '+7%' },
    { name: 'James Wilson', grade: '12-A', score: 92, improvement: '+2%' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Good Morning, Dr. Roomit Beed</h1>
            <p className="text-blue-100">Here's your teaching overview for today, August 1th, 2025</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 px-4 py-2 rounded-lg flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>08:45 AM</span>
            </div>
          </div>
        </div>
      </div>

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
                return (
                  <button
                    key={action.id}
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className={`p-3 rounded-xl bg-${action.color}-100 mb-3 group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`w-6 h-6 text-${action.color}-600`} />
                    </div>
                    <span className="text-sm font-medium text-gray-800 text-center">{action.label}</span>
                    <span className="text-xs text-gray-500 mt-1">{action.description}</span>
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
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-800">Urgent</span>
                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">Tomorrow</span>
              </div>
              <h3 className="font-medium text-red-900">Physics Project Submission</h3>
              <p className="text-sm text-red-700 mt-1">Grade 11-B • 24 submissions pending</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-800">Upcoming</span>
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">2 days</span>
              </div>
              <h3 className="font-medium text-orange-900">Math Quiz Papers</h3>
              <p className="text-sm text-orange-700 mt-1">Grade 10-A • Evaluation needed</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Planning</span>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">5 days</span>
              </div>
              <h3 className="font-medium text-blue-900">Term Exam Preparation</h3>
              <p className="text-sm text-blue-700 mt-1">Syllabus completion required</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;