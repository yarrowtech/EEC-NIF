import React, { useState } from 'react';
import {
  BookOpen,
  Award,
  TrendingUp,
  Download,
  Filter,
  ChevronDown,
  User,
  Calendar,
  BarChart3,
  Target,
  Bookmark,
  CheckCircle,
  FileText,
  MoreVertical,
  Star,
  Sparkles,
  GraduationCap,
  Brain,
  Activity,
  Clock,
  ArrowUp,
  ArrowDown,
  Eye,
  Share2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const AcademicReport = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const academicData = {
    studentName: "Koushik Bala",
    class: "10-A",
    studentId: "STU-2024-1085",
    currentPercentage: 97,
    rank: 5,
    totalStudents: 120,
    attendance: 94,
    improvement: "+5.2%",
    subjects: [
      {
        name: "Mathematics",
        grade: "A",
        percentage: 92,
        teacher: "Dr. Sarah Johnson",
        assignments: { completed: 15, total: 15 },
        tests: { completed: 4, total: 5 },
        trend: [85, 88, 90, 92],
        color: "#8b5cf6"
      },
      {
        name: "Physics",
        grade: "A-",
        percentage: 88,
        teacher: "Prof. Michael Chen",
        assignments: { completed: 12, total: 12 },
        tests: { completed: 3, total: 4 },
        trend: [80, 82, 85, 88],
        color: "#10b981"
      },
      {
        name: "English",
        grade: "B+",
        percentage: 85,
        teacher: "Ms. Emily Davis",
        assignments: { completed: 18, total: 18 },
        tests: { completed: 4, total: 4 },
        trend: [78, 80, 82, 85],
        color: "#3b82f6"
      },
      {
        name: "Chemistry",
        grade: "A",
        percentage: 90,
        teacher: "Dr. Robert Kim",
        assignments: { completed: 14, total: 14 },
        tests: { completed: 3, total: 3 },
        trend: [82, 85, 88, 90],
        color: "#f59e0b"
      },
      {
        name: "History",
        grade: "B+",
        percentage: 87,
        teacher: "Mr. James Wilson",
        assignments: { completed: 10, total: 10 },
        tests: { completed: 2, total: 2 },
        trend: [80, 83, 85, 87],
        color: "#ec4899"
      },
      {
        name: "Computer Science",
        grade: "A+",
        percentage: 95,
        teacher: "Ms. Lisa Anderson",
        assignments: { completed: 16, total: 16 },
        tests: { completed: 3, total: 3 },
        trend: [88, 90, 92, 95],
        color: "#06b6d4"
      }
    ],
    upcomingAssignments: [
      { subject: "Physics", title: "Project Submission", dueDate: "Jun 25, 2023" },
      { subject: "English", title: "Essay Writing", dueDate: "Jun 28, 2023" },
      { subject: "Mathematics", title: "Problem Set 6", dueDate: "Jun 30, 2023" }
    ],
    performanceTrend: [
      { month: 'Jan', percentage: 88 },
      { month: 'Feb', percentage: 90 },
      { month: 'Mar', percentage: 92 },
      { month: 'Apr', percentage: 93 },
      { month: 'May', percentage: 95 },
      { month: 'Jun', percentage: 97 }
    ]
  };

  const progressData = academicData.subjects.map(subject => ({
    subject: subject.name,
    percentage: subject.percentage,
    fill: subject.color
  }));

  const gradeDistribution = [
    { name: 'A', value: 45, color: '#10b981' },
    { name: 'B', value: 30, color: '#3b82f6' },
    { name: 'C', value: 15, color: '#f59e0b' },
    { name: 'D', value: 7, color: '#ef4444' },
    { name: 'F', value: 3, color: '#6b7280' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">
            Score: <span className="font-medium">{payload[0].value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl mb-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full transform -translate-x-48 translate-y-48"></div>
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-yellow-300 rounded-full transform -translate-x-20 -translate-y-20"></div>
          </div>
          
          <div className="relative z-10 p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h1 className="text-4xl font-bold text-white">Academic Report</h1>
                      <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                        <span className="text-white text-xs font-bold">DETAILED</span>
                      </div>
                    </div>
                    <p className="text-white/90 text-lg mt-2">Comprehensive academic performance analysis for {academicData.studentName}</p>
                  </div>
                </div>
                
                {/* Quick Achievement Highlights */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <Star className="w-4 h-4 text-yellow-300" />
                    <span className="text-white text-sm font-medium">Rank #{academicData.rank}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <TrendingUp className="w-4 h-4 text-green-300" />
                    <span className="text-white text-sm font-medium">{academicData.improvement} Growth</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <Award className="w-4 h-4 text-blue-300" />
                    <span className="text-white text-sm font-medium">{academicData.currentPercentage}% Overall</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-6 lg:mt-0">
                <div className="relative">
                  <select 
                    className="appearance-none bg-white/20 backdrop-blur-sm border-0 rounded-xl pl-4 pr-10 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 min-w-[150px]"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="all" className="text-gray-800">All Subjects</option>
                    {academicData.subjects.map((subject, index) => (
                      <option key={index} value={subject.name.toLowerCase()} className="text-gray-800">{subject.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70 pointer-events-none" />
                </div>
                
                <button className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30">
                  <Share2 className="h-4 w-4" />
                  <span className="font-medium">Share</span>
                </button>
                
                <button className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg">
                  <Download className="h-4 w-4" />
                  <span className="font-medium">Export PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Student Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">ACTIVE</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{academicData.studentName}</h3>
            <p className="text-sm text-gray-600">Class {academicData.class} • ID: {academicData.studentId}</p>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Profile Status</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                <ArrowUp className="h-3 w-3 text-green-600" />
                <span className="text-xs font-bold text-green-600">{academicData.improvement}</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{academicData.currentPercentage}%</h3>
            <p className="text-sm text-gray-600 mb-3">Overall Performance</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 transition-all duration-500"
                style={{ width: `${academicData.currentPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-amber-500 fill-current" />
                <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full">TOP 5</span>
              </div>
            </div>
            <div className="flex items-baseline space-x-1 mb-1">
              <h3 className="text-3xl font-bold text-gray-800">#{academicData.rank}</h3>
              <span className="text-lg text-gray-500">/{academicData.totalStudents}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">Class Ranking</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Percentile</span>
              <span className="font-bold text-amber-600">{Math.round((1 - academicData.rank / academicData.totalStudents) * 100)}th</span>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">EXCELLENT</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{academicData.attendance}%</h3>
            <p className="text-sm text-gray-600 mb-3">Attendance Rate</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${academicData.attendance}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 mb-8 shadow-xl border border-white/20">
          <div className="flex space-x-2">
            <button 
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'overview' 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transform scale-105' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button 
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'subjects' 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg transform scale-105' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('subjects')}
            >
              <BookOpen className="w-4 h-4" />
              <span>Subjects</span>
            </button>
            <button 
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'assignments' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-105' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('assignments')}
            >
              <FileText className="w-4 h-4" />
              <span>Assignments</span>
            </button>
          </div>
        </div>

        {/* Enhanced Overview Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enhanced Performance Trend */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Performance Trend</h3>
                      <p className="text-sm text-gray-600">6-month academic progression</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
                    <ArrowUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-bold text-green-600">+9% Growth</span>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={academicData.performanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={{ stroke: '#d1d5db' }}
                      />
                      <YAxis 
                        domain={[85, 100]} 
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={{ stroke: '#d1d5db' }}
                      />
                      <Tooltip 
                        content={<CustomTooltip />}
                        cursor={{ stroke: '#8b5cf6', strokeWidth: 1 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="percentage" 
                        stroke="url(#colorGradient)" 
                        strokeWidth={3} 
                        dot={{ r: 5, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} 
                        activeDot={{ r: 7, fill: '#8b5cf6', strokeWidth: 3, stroke: '#fff' }} 
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Enhanced Grade Distribution */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Grade Distribution</h3>
                      <p className="text-sm text-gray-600">Class performance breakdown</p>
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 font-medium bg-blue-100 px-3 py-1 rounded-full">
                    CLASS ANALYTICS
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gradeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {gradeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Students']}
                        labelStyle={{ color: '#1f2937' }}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Enhanced Subject Performance */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Subject Performance Analysis</h3>
                    <p className="text-sm text-gray-600">Detailed performance across all subjects</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Eye className="h-4 w-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Download className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="subject" 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                      cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                    />
                    <Bar 
                      dataKey="percentage" 
                      radius={[8, 8, 0, 0]} 
                      name="Performance %"
                    >
                      {progressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                      ))}
                    </Bar>
                    <defs>
                      {progressData.map((entry, index) => (
                        <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={entry.fill} stopOpacity={0.8}/>
                          <stop offset="100%" stopColor={entry.fill} stopOpacity={0.3}/>
                        </linearGradient>
                      ))}
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Subjects Content */}
        {activeTab === 'subjects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {academicData.subjects.map((subject, index) => (
              <div key={index} className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:scale-105 transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div 
                        className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${subject.color}20` }}
                      >
                        <BookOpen className="h-7 w-7" style={{ color: subject.color }} />
                      </div>
                      <div className="absolute -top-1 -right-1">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{subject.name}</h3>
                      <p className="text-sm text-gray-600">{subject.teacher}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                      subject.grade.startsWith("A") ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white" :
                      subject.grade.startsWith("B") ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white" :
                      "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                    }`}>
                      {subject.grade}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-500 font-medium">Grade</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-gray-700">Performance Score</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold" style={{ color: subject.color }}>{subject.percentage}%</span>
                        <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600 font-bold">+{subject.trend[subject.trend.length-1] - subject.trend[0]}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                      <div 
                        className="h-3 rounded-full shadow-sm transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${subject.percentage}%`, 
                          background: `linear-gradient(90deg, ${subject.color}aa, ${subject.color})`
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Assignments</span>
                        <FileText className="h-4 w-4 text-gray-500" />
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {subject.assignments.completed}<span className="text-lg text-gray-500">/{subject.assignments.total}</span>
                      </p>
                      <div className="w-full bg-gray-300 rounded-full h-1.5 mt-2">
                        <div 
                          className="h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                          style={{ width: `${(subject.assignments.completed / subject.assignments.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tests</span>
                        <Target className="h-4 w-4 text-gray-500" />
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {subject.tests.completed}<span className="text-lg text-gray-500">/{subject.tests.total}</span>
                      </p>
                      <div className="w-full bg-gray-300 rounded-full h-1.5 mt-2">
                        <div 
                          className="h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"
                          style={{ width: `${(subject.tests.completed / subject.tests.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Progress Trend</span>
                      <Activity className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex items-end h-12 gap-1">
                      {subject.trend.map((value, i) => (
                        <div 
                          key={i} 
                          className="flex-1 rounded-t-lg transition-all duration-500 ease-out group-hover:scale-110"
                          style={{ 
                            height: `${((value - 70) / 30) * 100}%`, 
                            background: `linear-gradient(180deg, ${subject.color}, ${subject.color}80)`,
                            opacity: 0.6 + (i * 0.1)
                          }}
                        ></div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Q1</span>
                      <span>Q2</span>
                      <span>Q3</span>
                      <span>Q4</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Assignments Content */}
        {activeTab === 'assignments' && (
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Upcoming Assignments</h3>
                    <p className="text-sm text-gray-600">Tasks due in the coming weeks</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 bg-orange-100 px-3 py-1 rounded-full">
                  <Clock className="h-3 w-3 text-orange-600" />
                  <span className="text-xs font-bold text-orange-600">{academicData.upcomingAssignments.length} Pending</span>
                </div>
              </div>
              <div className="space-y-4">
                {academicData.upcomingAssignments.map((assignment, index) => (
                  <div key={index} className="group flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-lg hover:scale-102 transition-all duration-200">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <FileText className="h-7 w-7 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1">
                          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">!</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800 mb-1">{assignment.title}</h4>
                        <div className="flex items-center space-x-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{assignment.subject}</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-amber-600 font-medium">High Priority</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm font-medium">{assignment.dueDate}</span>
                        </div>
                        <span className="text-xs text-red-600 font-semibold bg-red-100 px-2 py-1 rounded-full">Due Soon</span>
                      </div>
                      <button className="group/btn h-10 w-10 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <MoreVertical className="h-5 w-5 text-gray-500 group-hover/btn:text-gray-700" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Assignment Completion Analysis</h3>
                    <p className="text-sm text-gray-600">Subject-wise completion tracking</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-bold text-green-600">98% Overall</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {academicData.subjects.map((subject, index) => (
                  <div key={index} className="group bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="h-10 w-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: `${subject.color}20` }}
                        >
                          <BookOpen className="h-5 w-5" style={{ color: subject.color }} />
                        </div>
                        <h4 className="font-bold text-gray-800">{subject.name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold" style={{ color: subject.color }}>
                          {Math.round((subject.assignments.completed / subject.assignments.total) * 100)}%
                        </span>
                        <p className="text-xs text-gray-500 font-medium">Completion</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                        <div 
                          className="h-3 rounded-full shadow-sm transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${(subject.assignments.completed / subject.assignments.total) * 100}%`, 
                            background: `linear-gradient(90deg, ${subject.color}aa, ${subject.color})`
                          }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">
                          {subject.assignments.completed} of {subject.assignments.total} completed
                        </span>
                        <div className="flex items-center space-x-1">
                          {subject.assignments.completed === subject.assignments.total ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-500" />
                          )}
                          <span className={`text-xs font-semibold ${
                            subject.assignments.completed === subject.assignments.total ? 'text-green-600' : 'text-amber-600'
                          }`}>
                            {subject.assignments.completed === subject.assignments.total ? 'Complete' : 'In Progress'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Remaining: {subject.assignments.total - subject.assignments.completed}</span>
                          <span>Grade Impact: {subject.grade}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicReport;