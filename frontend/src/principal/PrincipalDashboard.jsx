import React, { useState } from 'react';
import { 
  School, Users, GraduationCap, BookOpen, TrendingUp,
  AlertTriangle, Calendar, DollarSign, UserCheck, FileText,
  Bell, Settings, BarChart3, PieChart, Activity, Clock,
  Award, Target, Zap, Eye, ChevronRight, ArrowUp,
  ArrowDown, Filter, Download, RefreshCw, MessageSquare,
  Phone, Maximize2, ChevronDown, Search, MoreHorizontal
} from 'lucide-react';
import PrincipalSidebar from './PrincipalSidebar';
import PrincipalHeader from './PrincipalHeader';
import SchoolOverview from './SchoolOverview';
import AcademicAnalytics from './AcademicAnalytics';
import StudentAnalytics from './StudentAnalytics';
import StaffManagement from './StaffManagement';
import FinancialDashboard from './FinancialDashboard';
import NotificationCenter from './NotificationCenter';
import QuickActions from './QuickActions';

const PrincipalDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // School data
  const schoolStats = {
    totalStudents: 1247,
    totalTeachers: 89,
    totalStaff: 34,
    totalClasses: 45,
    activeParents: 1180,
    graduationRate: 96.5,
    attendanceRate: 94.2,
    satisfactionScore: 4.7,
    currentRevenue: 2.4,
    monthlyGrowth: 8.3,
    budgetUtilization: 78.5,
    infrastructureScore: 92
  };

  // Critical notifications
  const criticalNotifications = [
    {
      id: 1,
      type: 'urgent',
      title: 'Fire Safety Inspection Due',
      message: 'Annual fire safety inspection scheduled for next week',
      timestamp: '10 minutes ago',
      priority: 'high',
      department: 'Safety'
    },
    {
      id: 2,
      type: 'academic',
      title: 'Exam Results Available',
      message: 'Mid-term examination results ready for review',
      timestamp: '1 hour ago',
      priority: 'medium',
      department: 'Academic'
    },
    {
      id: 3,
      type: 'financial',
      title: 'Budget Approval Required',
      message: 'Q2 budget proposal awaiting principal approval',
      timestamp: '2 hours ago',
      priority: 'high',
      department: 'Finance'
    }
  ];

  // Recent activities
  const recentActivities = [
    { id: 1, action: 'New teacher application approved', time: '5 min ago', type: 'staff' },
    { id: 2, action: 'Student disciplinary meeting scheduled', time: '15 min ago', type: 'student' },
    { id: 3, action: 'Budget report generated', time: '30 min ago', type: 'finance' },
    { id: 4, action: 'Parent-teacher meeting confirmed', time: '1 hour ago', type: 'academic' }
  ];

  // Performance metrics
  const performanceMetrics = [
    {
      title: 'Academic Excellence',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      color: 'bg-emerald-100 text-emerald-800',
      icon: Award,
      description: 'Students achieving above 85%'
    },
    {
      title: 'Teacher Satisfaction',
      value: '4.6/5',
      change: '+0.2',
      trend: 'up',
      color: 'bg-blue-100 text-blue-800',
      icon: UserCheck,
      description: 'Based on quarterly survey'
    },
    {
      title: 'Parent Engagement',
      value: '89.3%',
      change: '+5.7%',
      trend: 'up',
      color: 'bg-purple-100 text-purple-800',
      icon: Users,
      description: 'Active participation rate'
    },
    {
      title: 'Infrastructure Score',
      value: '92/100',
      change: '+3',
      trend: 'up',
      color: 'bg-amber-100 text-amber-800',
      icon: School,
      description: 'Facility condition rating'
    }
  ];

  // Quick stats cards data
  const quickStats = [
    {
      title: 'Total Students',
      value: schoolStats.totalStudents.toLocaleString(),
      change: '+47',
      changeType: 'increase',
      icon: GraduationCap,
      color: 'bg-blue-600',
      drillDown: 'students'
    },
    {
      title: 'Faculty & Staff',
      value: (schoolStats.totalTeachers + schoolStats.totalStaff).toLocaleString(),
      change: '+3',
      changeType: 'increase',
      icon: Users,
      color: 'bg-green-600',
      drillDown: 'staff'
    },
    {
      title: 'Active Classes',
      value: schoolStats.totalClasses.toString(),
      change: '+2',
      changeType: 'increase',
      icon: BookOpen,
      color: 'bg-purple-600',
      drillDown: 'academics'
    },
    {
      title: 'Attendance Rate',
      value: `${schoolStats.attendanceRate}%`,
      change: '+1.2%',
      changeType: 'increase',
      icon: UserCheck,
      color: 'bg-orange-600',
      drillDown: 'attendance'
    },
    {
      title: 'Revenue (M)',
      value: `$${schoolStats.currentRevenue}M`,
      change: `+${schoolStats.monthlyGrowth}%`,
      changeType: 'increase',
      icon: DollarSign,
      color: 'bg-indigo-600',
      drillDown: 'finance'
    },
    {
      title: 'Satisfaction Score',
      value: `${schoolStats.satisfactionScore}/5`,
      change: '+0.3',
      changeType: 'increase',
      icon: Award,
      color: 'bg-yellow-500',
      drillDown: 'satisfaction'
    }
  ];

  // Chart data (mock)
  const attendanceTrend = [
    { month: 'Jan', value: 92.4 },
    { month: 'Feb', value: 93.1 },
    { month: 'Mar', value: 94.2 },
    { month: 'Apr', value: 94.8 },
    { month: 'May', value: 95.3 },
    { month: 'Jun', value: 94.7 }
  ];

  const studentPerformance = [
    { grade: 'A', students: 420 },
    { grade: 'B', students: 380 },
    { grade: 'C', students: 280 },
    { grade: 'D', students: 120 },
    { grade: 'F', students: 47 }
  ];

  const renderQuickStatsCard = (stat, index) => {
    const Icon = stat.icon;
    return (
      <div 
        key={index}
        className={`relative rounded-xl p-6 shadow-lg overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl`}
        onClick={() => setActiveView(stat.drillDown)}
      >
        {/* Color accent bar */}
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
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                stat.changeType === 'increase' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {stat.changeType === 'increase' ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                {stat.change}
              </div>
            </div>
          </div>
        </div>
        
        {/* Hover effect */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity"></div>
      </div>
    );
  };

  const renderPerformanceMetric = (metric, index) => {
    const Icon = metric.icon;
    return (
      <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${metric.color.split(' ')[0]} ${metric.color.split(' ')[1].replace('800', '600')}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{metric.title}</h3>
              <p className="text-sm text-gray-500">{metric.description}</p>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metric.trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              {metric.change}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <PrincipalSidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'ml-80' : 'ml-20'
      }`}>
        {/* Header */}
        <div className="sticky top-0 z-30">
          <PrincipalHeader 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            notifications={criticalNotifications}
          />
        </div>
        
        {/* Main Dashboard Content */}
        <main className="p-6 bg-gray-50 min-h-screen">
          {activeView === 'overview' ? (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-6 text-white relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-geometric.png')] opacity-10"></div>
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold mb-1">Principal Dashboard</h1>
                      <p className="text-blue-100 opacity-90">Comprehensive analytics for Educational Excellence Center</p>
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
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors">
                      <Filter className="w-4 h-4" />
                      Filters
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors">
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  {quickStats.map((stat, index) => renderQuickStatsCard(stat, index))}
                </div>
              </div>

              {/* Charts and Metrics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Metrics */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
                    <div className="space-y-4">
                      {performanceMetrics.map((metric, index) => renderPerformanceMetric(metric, index))}
                    </div>
                  </div>
                </div>
                
                {/* Main Chart Area */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Attendance Trend Chart */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Attendance Trend</h3>
                      <div className="flex items-center gap-2">
                        <button className="text-gray-500 hover:text-gray-700">
                          <Maximize2 className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <select className="appearance-none bg-gray-100 border-none rounded-lg pl-3 pr-8 py-1 text-sm focus:ring-2 focus:ring-blue-500">
                            <option>Last 6 Months</option>
                            <option>Last Year</option>
                            <option>Last 3 Years</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Chart Placeholder */}
                    <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-10 h-10 mx-auto text-blue-400 mb-2" />
                        <p className="text-gray-500">Attendance trend visualization</p>
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Attendance Rate</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Target</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Student Performance */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Student Performance Distribution</h3>
                      <div className="flex items-center gap-2">
                        <button className="text-gray-500 hover:text-gray-700">
                          <Maximize2 className="w-4 h-4" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Chart Placeholder */}
                    <div className="h-64 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <PieChart className="w-10 h-10 mx-auto text-purple-400 mb-2" />
                        <p className="text-gray-500">Grade distribution visualization</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications and Activities */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Critical Notifications */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Critical Alerts
                    </h3>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                      View All
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {criticalNotifications.map((notification) => (
                      <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 flex-shrink-0 p-2 rounded-full ${
                            notification.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            <Bell className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900">{notification.title}</p>
                              <span className="text-xs text-gray-500">{notification.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                notification.department === 'Safety' ? 'bg-red-100 text-red-700' :
                                notification.department === 'Academic' ? 'bg-blue-100 text-blue-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {notification.department}
                              </span>
                              <button className="text-xs text-blue-600 hover:text-blue-700">Take Action</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            activity.type === 'staff' ? 'bg-green-500' :
                            activity.type === 'student' ? 'bg-blue-500' :
                            activity.type === 'finance' ? 'bg-purple-500' :
                            'bg-orange-500'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-500">{activity.time}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                activity.type === 'staff' ? 'bg-green-100 text-green-700' :
                                activity.type === 'student' ? 'bg-blue-100 text-blue-700' :
                                activity.type === 'finance' ? 'bg-purple-100 text-purple-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : activeView === 'academics' ? (
            <AcademicAnalytics />
          ) : activeView === 'students' ? (
            <StudentAnalytics />
          ) : activeView === 'staff' ? (
            <StaffManagement />
          ) : activeView === 'finance' ? (
            <FinancialDashboard />
          ) : activeView === 'notifications' ? (
            <NotificationCenter notifications={criticalNotifications} />
          ) : activeView === 'facilities' ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Facilities & Resources</h1>
                    <p className="text-yellow-100">Infrastructure management and maintenance oversight</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold">98%</div>
                      <div className="text-xs text-yellow-100">Operational</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Facility Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-amber-900">45</div>
                      <div className="text-sm text-amber-600">Classrooms</div>
                    </div>
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <School className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-amber-600">42 Active, 3 Under Maintenance</div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-amber-900">8</div>
                      <div className="text-sm text-amber-600">Laboratories</div>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Activity className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-amber-600">All Operational</div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-amber-900">12</div>
                      <div className="text-sm text-amber-600">Buses</div>
                    </div>
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-amber-600">11 Active, 1 In Service</div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-amber-900">95%</div>
                      <div className="text-sm text-amber-600">HVAC Systems</div>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Settings className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-amber-600">Optimal Performance</div>
                </div>
              </div>
              
              {/* Maintenance Schedule */}
              <div className="bg-white rounded-xl shadow-sm border border-yellow-100">
                <div className="p-6 border-b border-yellow-100">
                  <h3 className="text-lg font-semibold text-amber-900">Upcoming Maintenance</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { task: 'HVAC System Inspection', date: '2024-08-10', location: 'Main Building', priority: 'high' },
                      { task: 'Fire Safety Equipment Check', date: '2024-08-12', location: 'All Buildings', priority: 'high' },
                      { task: 'Playground Equipment Maintenance', date: '2024-08-15', location: 'Sports Complex', priority: 'medium' },
                      { task: 'Library Carpet Cleaning', date: '2024-08-18', location: 'Library Wing', priority: 'low' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div>
                          <p className="font-medium text-amber-900">{item.task}</p>
                          <p className="text-sm text-amber-600">{item.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-amber-700">{item.date}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.priority === 'high' ? 'bg-red-100 text-red-700' :
                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : activeView === 'communications' ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Communications</h1>
                    <p className="text-yellow-100">Announcements and messaging center</p>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/20 rounded-lg p-3">
                        <div className="text-2xl font-bold">247</div>
                        <div className="text-xs text-yellow-100">Messages</div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-3">
                        <div className="text-2xl font-bold">12</div>
                        <div className="text-xs text-yellow-100">Announcements</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-900">Send Announcement</h3>
                      <p className="text-sm text-amber-600">Broadcast to all staff & students</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <Mail className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-900">Email Parents</h3>
                      <p className="text-sm text-amber-600">Send updates to parent groups</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Phone className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-900">Emergency Alert</h3>
                      <p className="text-sm text-amber-600">Send urgent notifications</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Communications */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-yellow-100">
                  <div className="p-6 border-b border-yellow-100">
                    <h3 className="text-lg font-semibold text-amber-900">Recent Announcements</h3>
                  </div>
                  <div className="divide-y divide-yellow-100">
                    {[
                      { title: 'Parent-Teacher Conference Schedule', time: '2 hours ago', type: 'general' },
                      { title: 'New Lunch Menu Updates', time: '5 hours ago', type: 'cafeteria' },
                      { title: 'Sports Day Event Details', time: '1 day ago', type: 'events' },
                      { title: 'Library Hours Extension', time: '2 days ago', type: 'academic' }
                    ].map((item, index) => (
                      <div key={index} className="p-4 hover:bg-yellow-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-amber-900">{item.title}</p>
                            <p className="text-sm text-amber-600 mt-1">{item.time}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.type === 'general' ? 'bg-purple-100 text-purple-700' :
                            item.type === 'cafeteria' ? 'bg-orange-100 text-orange-700' :
                            item.type === 'events' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {item.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-yellow-100">
                  <div className="p-6 border-b border-yellow-100">
                    <h3 className="text-lg font-semibold text-amber-900">Message Stats</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-amber-900">Email Delivery Rate</span>
                      <span className="font-bold text-amber-900">98.5%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-amber-900">SMS Delivery Rate</span>
                      <span className="font-bold text-amber-900">99.2%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-amber-900">Average Response Time</span>
                      <span className="font-bold text-amber-900">2.5 hrs</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-amber-900">Parent Engagement</span>
                      <span className="font-bold text-amber-900">87%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeView === 'reports' ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
                    <p className="text-yellow-100">Detailed insights and performance reports</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold">24</div>
                      <div className="text-xs text-yellow-100">Reports Generated</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Report Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Updated</span>
                  </div>
                  <h3 className="font-semibold text-amber-900">Academic Reports</h3>
                  <p className="text-sm text-amber-600 mt-1">Student performance & grades</p>
                  <div className="mt-3 text-xs text-amber-700">Last updated: 2 hours ago</div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-amber-600" />
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Pending</span>
                  </div>
                  <h3 className="font-semibold text-amber-900">Financial Reports</h3>
                  <p className="text-sm text-amber-600 mt-1">Budget & revenue analysis</p>
                  <div className="mt-3 text-xs text-amber-700">Due: Tomorrow</div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Users className="w-6 h-6 text-yellow-600" />
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Ready</span>
                  </div>
                  <h3 className="font-semibold text-amber-900">Staff Reports</h3>
                  <p className="text-sm text-amber-600 mt-1">Teacher performance & HR</p>
                  <div className="mt-3 text-xs text-amber-700">Available for download</div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">In Progress</span>
                  </div>
                  <h3 className="font-semibold text-amber-900">Trend Analysis</h3>
                  <p className="text-sm text-amber-600 mt-1">Multi-year comparisons</p>
                  <div className="mt-3 text-xs text-amber-700">Generating report...</div>
                </div>
              </div>
              
              {/* Recent Reports and Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-yellow-100">
                  <div className="p-6 border-b border-yellow-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-amber-900">Recent Reports</h3>
                      <button className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
                        View All
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="divide-y divide-yellow-100">
                    {[
                      { name: 'Monthly Academic Performance Report', date: '2024-08-05', type: 'Academic', size: '2.4 MB', status: 'completed' },
                      { name: 'Q2 Financial Summary', date: '2024-08-03', type: 'Financial', size: '1.8 MB', status: 'completed' },
                      { name: 'Teacher Evaluation Report', date: '2024-08-01', type: 'HR', size: '3.1 MB', status: 'completed' },
                      { name: 'Student Attendance Analysis', date: '2024-07-28', type: 'Academic', size: '1.2 MB', status: 'completed' },
                      { name: 'Facility Maintenance Report', date: '2024-07-25', type: 'Operations', size: '980 KB', status: 'completed' }
                    ].map((report, index) => (
                      <div key={index} className="p-4 hover:bg-yellow-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-amber-600" />
                              <div>
                                <p className="font-medium text-amber-900">{report.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-amber-600">{report.date}</span>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-amber-600">{report.size}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              report.type === 'Academic' ? 'bg-blue-100 text-blue-700' :
                              report.type === 'Financial' ? 'bg-green-100 text-green-700' :
                              report.type === 'HR' ? 'bg-purple-100 text-purple-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {report.type}
                            </span>
                            <button className="p-1 hover:bg-yellow-100 rounded text-amber-600">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-yellow-100">
                  <div className="p-6 border-b border-yellow-100">
                    <h3 className="text-lg font-semibold text-amber-900">Report Statistics</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-900">847</div>
                      <div className="text-sm text-amber-600">Total Reports Generated</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-amber-700">This Month</span>
                        <span className="font-semibold text-amber-900">24</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-amber-700">Automated</span>
                        <span className="font-semibold text-amber-900">18</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-amber-700">Custom</span>
                        <span className="font-semibold text-amber-900">6</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-amber-700">Avg. Generation Time</span>
                        <span className="font-semibold text-amber-900">2.3 min</span>
                      </div>
                    </div>
                    
                    <button className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                      Generate New Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeView === 'calendar' ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">School Calendar</h1>
                    <p className="text-yellow-100">Events, schedules, and important dates</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold">8</div>
                      <div className="text-xs text-yellow-100">Upcoming Events</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Calendar Navigation */}
              <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-yellow-100">
                <div className="flex items-center gap-4">
                  <button className="p-2 hover:bg-yellow-50 rounded-lg">
                    <ChevronRight className="w-5 h-5 rotate-180 text-amber-600" />
                  </button>
                  <h2 className="text-xl font-bold text-amber-900">August 2024</h2>
                  <button className="p-2 hover:bg-yellow-50 rounded-lg">
                    <ChevronRight className="w-5 h-5 text-amber-600" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Add Event
                  </button>
                  <button className="px-4 py-2 border border-yellow-300 text-amber-700 rounded-lg hover:bg-yellow-50 transition-colors">
                    View All
                  </button>
                </div>
              </div>
              
              {/* Calendar Grid and Events */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Grid */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-yellow-100">
                  <div className="p-6">
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-2 text-center text-sm font-medium text-amber-700">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({length: 35}, (_, i) => {
                        const date = i - 3; // Adjust for month start
                        const isCurrentMonth = date > 0 && date <= 31;
                        const hasEvent = [8, 12, 15, 18, 22, 25].includes(date);
                        const isToday = date === 6;
                        
                        return (
                          <div key={i} className={`p-2 h-16 border border-yellow-100 rounded ${
                            isCurrentMonth ? 'bg-white hover:bg-yellow-50' : 'bg-gray-50 text-gray-400'
                          } ${isToday ? 'bg-purple-100 border-purple-300' : ''} cursor-pointer transition-colors`}>
                            <div className={`text-sm ${isToday ? 'font-bold text-purple-700' : ''}`}>
                              {isCurrentMonth ? date : ''}
                            </div>
                            {hasEvent && (
                              <div className="mt-1">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Upcoming Events */}
                <div className="bg-white rounded-xl shadow-sm border border-yellow-100">
                  <div className="p-6 border-b border-yellow-100">
                    <h3 className="text-lg font-semibold text-amber-900">Upcoming Events</h3>
                  </div>
                  <div className="divide-y divide-yellow-100">
                    {[
                      { title: 'Parent-Teacher Conference', date: 'Aug 8', time: '9:00 AM', type: 'meeting' },
                      { title: 'Science Fair Preparation', date: 'Aug 12', time: '2:00 PM', type: 'academic' },
                      { title: 'Staff Training Session', date: 'Aug 15', time: '8:00 AM', type: 'training' },
                      { title: 'Sports Day Practice', date: 'Aug 18', time: '3:30 PM', type: 'sports' },
                      { title: 'Board Meeting', date: 'Aug 22', time: '10:00 AM', type: 'meeting' },
                      { title: 'Library Week Opening', date: 'Aug 25', time: '11:00 AM', type: 'event' }
                    ].map((event, index) => (
                      <div key={index} className="p-4 hover:bg-yellow-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`w-3 h-3 rounded-full mt-2 ${
                            event.type === 'meeting' ? 'bg-purple-500' :
                            event.type === 'academic' ? 'bg-blue-500' :
                            event.type === 'training' ? 'bg-green-500' :
                            event.type === 'sports' ? 'bg-orange-500' :
                            'bg-amber-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="font-medium text-amber-900 text-sm">{event.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-amber-600">{event.date}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-amber-600">{event.time}</span>
                            </div>
                            <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                              event.type === 'meeting' ? 'bg-purple-100 text-purple-700' :
                              event.type === 'academic' ? 'bg-blue-100 text-blue-700' :
                              event.type === 'training' ? 'bg-green-100 text-green-700' :
                              event.type === 'sports' ? 'bg-orange-100 text-orange-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {event.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Calendar Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-amber-900">23</div>
                      <div className="text-sm text-amber-600">Events This Month</div>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-amber-900">156</div>
                      <div className="text-sm text-amber-600">Total Attendees</div>
                    </div>
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <Users className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-amber-900">8</div>
                      <div className="text-sm text-amber-600">Pending Approvals</div>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-amber-900">94%</div>
                      <div className="text-sm text-amber-600">Event Success Rate</div>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-6">
                {activeView.charAt(0).toUpperCase() + activeView.slice(1)} View
              </h2>
              <div className="h-96 bg-yellow-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <School className="w-12 h-12 mx-auto text-amber-400 mb-4" />
                  <p className="text-amber-600">{activeView} dashboard content will appear here</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PrincipalDashboard;