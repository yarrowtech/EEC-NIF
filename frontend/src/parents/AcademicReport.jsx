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
  MoreVertical
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Academic Report</h1>
            <p className="text-gray-600">Detailed overview of academic performance and progress</p>
          </div>
          <div className="flex items-center gap-3 mt-4 lg:mt-0">
            <div className="relative">
              <select 
                className="appearance-none bg-gray-100 border-0 rounded-xl pl-4 pr-10 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="all">All Subjects</option>
                {academicData.subjects.map((subject, index) => (
                  <option key={index} value={subject.name.toLowerCase()}>{subject.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
            <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{academicData.studentName}</h3>
          <p className="text-sm text-gray-500">Class {academicData.class} • ID: {academicData.studentId}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-green-600">{academicData.improvement}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{academicData.currentPercentage}%</h3>
          <p className="text-sm text-gray-500">Overall Percentage</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">#{academicData.rank}</h3>
          <p className="text-sm text-gray-500">Rank of {academicData.totalStudents} students</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{academicData.attendance}%</h3>
          <p className="text-sm text-gray-500">Attendance Rate</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-1 mb-6 shadow-sm flex">
        <button 
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${activeTab === 'subjects' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('subjects')}
        >
          Subjects
        </button>
        <button 
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${activeTab === 'assignments' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
      </div>

      {/* Overview Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trend */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={academicData.performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[85, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="percentage" 
                      stroke="#8b5cf6" 
                      strokeWidth={2} 
                      dot={{ r: 4, fill: '#8b5cf6' }} 
                      activeDot={{ r: 6, fill: '#8b5cf6' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grade Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Grade Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Subject Performance */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Subject Performance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="percentage" radius={[4, 4, 0, 0]} name="Percentage">
                    {progressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Subjects Content */}
      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {academicData.subjects.map((subject, index) => (
            <div key={index} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${subject.color}20` }}>
                    <BookOpen className="h-5 w-5" style={{ color: subject.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{subject.name}</h3>
                    <p className="text-sm text-gray-500">{subject.teacher}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  subject.grade.startsWith("A") ? "bg-green-100 text-green-800" :
                  subject.grade.startsWith("B") ? "bg-blue-100 text-blue-800" :
                  "bg-amber-100 text-amber-800"
                }`}>
                  {subject.grade}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Performance</span>
                    <span className="text-sm font-medium text-gray-700">{subject.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${subject.percentage}%`, 
                        backgroundColor: subject.color 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Assignments</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {subject.assignments.completed}/{subject.assignments.total}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Tests</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {subject.tests.completed}/{subject.tests.total}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Progress Trend</p>
                  <div className="flex items-end h-8 gap-p5">
                    {subject.trend.map((value, i) => (
                      <div 
                        key={i} 
                        className="flex-1 rounded-t-sm" 
                        style={{ 
                          height: `${value - 70}%`, 
                          backgroundColor: subject.color,
                          opacity: 0.7 + (i * 0.1)
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignments Content */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Assignments</h3>
            <div className="space-y-4">
              {academicData.upcomingAssignments.map((assignment, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{assignment.title}</h4>
                      <p className="text-sm text-gray-500">{assignment.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{assignment.dueDate}</span>
                    </div>
                    <button className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-200">
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Assignment Completion Rate</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {academicData.subjects.map((subject, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-800">{subject.name}</h4>
                    <span className="text-sm font-medium text-gray-500">
                      {Math.round((subject.assignments.completed / subject.assignments.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${(subject.assignments.completed / subject.assignments.total) * 100}%`, 
                        backgroundColor: subject.color 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicReport;