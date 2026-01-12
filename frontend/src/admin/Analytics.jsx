import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  DollarSign,
  Download,
  Calendar,
  Activity,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const Analytics = ({ setShowAdminHeader }) => {
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');

  useEffect(() => {
    setShowAdminHeader(true);
  }, []);

  // Key Metrics
  const keyMetrics = [
    {
      title: 'Total Students',
      value: '1,245',
      change: '+5.2%',
      trend: 'up',
      icon: Users,
      color: 'blue',
      description: 'Active students'
    },
    {
      title: 'Attendance Rate',
      value: '85%',
      change: '+2.1%',
      trend: 'up',
      icon: CheckCircle,
      color: 'green',
      description: 'This month'
    },
    {
      title: 'Course Completion',
      value: '72%',
      change: '-1.3%',
      trend: 'down',
      icon: GraduationCap,
      color: 'purple',
      description: 'Average across all'
    },
    {
      title: 'Fees Collected',
      value: '₹7.8L',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'orange',
      description: 'Last 6 months'
    },
  ];

  // Performance data
  const performanceData = [
    { month: 'Jan', class10A: 75, class9B: 68, class11C: 80 },
    { month: 'Feb', class10A: 78, class9B: 72, class11C: 82 },
    { month: 'Mar', class10A: 80, class9B: 75, class11C: 79 },
    { month: 'Apr', class10A: 82, class9B: 78, class11C: 85 },
    { month: 'May', class10A: 85, class9B: 80, class11C: 87 },
    { month: 'Jun', class10A: 88, class9B: 82, class11C: 90 },
  ];

  // Fees data
  const getSeed = (cls, sec) => {
    const s = (cls + '-' + sec).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return s % 97 + 3;
  };

  const feesData = (() => {
    const seed = getSeed(selectedClass, selectedSection);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, i) => ({
      month,
      paid: Math.round(50 + ((seed * (i + 1)) % 40)),
      pending: Math.round(20 + ((seed * (i + 3)) % 30)),
    }));
  })();

  // Attendance breakdown
  const attendanceData = [
    { name: 'Present', value: 85, color: '#10b981' },
    { name: 'Absent', value: 8, color: '#ef4444' },
    { name: 'Late', value: 4, color: '#f59e0b' },
    { name: 'Excused', value: 3, color: '#6b7280' },
  ];

  // Course progress
  const courseProgressData = [
    { subject: 'Math', completion: 85 },
    { subject: 'Science', completion: 70 },
    { subject: 'History', completion: 65 },
    { subject: 'English', completion: 90 },
    { subject: 'Art', completion: 60 },
  ];

  // Grade distribution
  const gradeDistributionData = [
    { grade: 'A', students: 120, color: '#10b981' },
    { grade: 'B', students: 185, color: '#3b82f6' },
    { grade: 'C', students: 210, color: '#f59e0b' },
    { grade: 'D', students: 95, color: '#ef4444' },
    { grade: 'F', students: 40, color: '#6b7280' },
  ];

  // Assignment status
  const assignmentStats = [
    { label: 'Submitted', value: 72, color: '#10b981' },
    { label: 'Pending', value: 15, color: '#f59e0b' },
    { label: 'Late', value: 8, color: '#ef4444' },
    { label: 'Not Submitted', value: 5, color: '#6b7280' },
  ];

  // Recent activity
  const recentActivity = [
    { id: 1, teacher: 'Ms. Johnson', action: 'Created Lesson', subject: 'Algebra Basics', time: '2 hours ago', color: 'blue' },
    { id: 2, teacher: 'Mr. Patel', action: 'Graded Exam', subject: 'Midterm Science', time: '5 hours ago', color: 'green' },
    { id: 3, teacher: 'Ms. Smith', action: 'Updated Timetable', subject: 'History Session', time: '1 day ago', color: 'purple' },
    { id: 4, teacher: 'Mr. Davis', action: 'Uploaded Resources', subject: 'Chemistry Lab', time: '2 days ago', color: 'orange' },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        icon: 'text-blue-500',
        gradient: 'from-blue-500 to-blue-600',
        light: 'bg-blue-100'
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        icon: 'text-green-500',
        gradient: 'from-green-500 to-green-600',
        light: 'bg-green-100'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        icon: 'text-purple-500',
        gradient: 'from-purple-500 to-purple-600',
        light: 'bg-purple-100'
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        icon: 'text-orange-500',
        gradient: 'from-orange-500 to-orange-600',
        light: 'bg-orange-100'
      }
    };
    return colors[color] || colors.blue;
  };

  const exportAnalyticsToPDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const currentDate = new Date().toLocaleDateString();

    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('Analytics Report', 105, 20, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Generated on: ${currentDate}`, 105, 30, { align: 'center' });

    let yPos = 50;

    // Key Metrics
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Key Metrics', 20, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    keyMetrics.forEach(metric => {
      pdf.text(`${metric.title}: ${metric.value} (${metric.change})`, 25, yPos);
      yPos += 7;
    });

    pdf.save(`analytics-report-${currentDate.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">Comprehensive insights and performance metrics</p>
          </div>
          <button
            onClick={exportAnalyticsToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyMetrics.map((metric, idx) => {
            const Icon = metric.icon;
            const colors = getColorClasses(metric.color);
            const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;

            return (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colors.bg}`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    metric.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    <TrendIcon className="w-3 h-3" />
                    {metric.change}
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</p>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            );
          })}
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Performance Trend */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-700" />
                Performance Trend
              </h2>
              <p className="text-sm text-gray-600 mt-1">Average scores by class over time</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorClass10A" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClass9B" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClass11C" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="class10A" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorClass10A)" name="Class 10-A" />
                <Area type="monotone" dataKey="class9B" stroke="#10b981" fillOpacity={1} fill="url(#colorClass9B)" name="Class 9-B" />
                <Area type="monotone" dataKey="class11C" stroke="#f59e0b" fillOpacity={1} fill="url(#colorClass11C)" name="Class 11-C" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Fees Collection */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-700" />
                  Fees Collection
                </h2>
                <p className="text-sm text-gray-600 mt-1">Paid vs Pending by month</p>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['A', 'B', 'C', 'D'].map(s => (
                    <option key={s} value={s}>Sec {s}</option>
                  ))}
                </select>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={feesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [`₹${value}k`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="paid" fill="#10b981" radius={[8, 8, 0, 0]} name="Paid" />
                <Bar dataKey="pending" fill="#ef4444" radius={[8, 8, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Secondary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Attendance Breakdown */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Attendance</h2>
            <p className="text-sm text-gray-600 mb-6">Distribution breakdown</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {attendanceData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-gray-600">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Progress */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Course Progress</h2>
            <p className="text-sm text-gray-600 mb-4">Completion rates</p>
            <div className="space-y-4">
              {courseProgressData.map((course, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{course.subject}</span>
                    <span className="text-sm font-semibold text-gray-900">{course.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.completion}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grade Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Grade Distribution</h2>
            <p className="text-sm text-gray-600 mb-6">Student grades</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={gradeDistributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis type="category" dataKey="grade" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="students" radius={[0, 4, 4, 0]}>
                  {gradeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Assignment Status & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Assignment Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-700" />
              Assignment Status
            </h2>
            <p className="text-sm text-gray-600 mb-6">Current submission rates</p>
            <div className="grid grid-cols-2 gap-4">
              {assignmentStats.map((stat, idx) => (
                <div key={idx} className="p-4 rounded-lg border-2" style={{ borderColor: stat.color, backgroundColor: stat.color + '10' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">{stat.label}</span>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }}></div>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-700" />
              Recent Activity
            </h2>
            <p className="text-sm text-gray-600 mb-4">Latest teacher actions</p>
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const colors = getColorClasses(activity.color);
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <Activity className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.teacher}</p>
                      <p className="text-xs text-gray-600">{activity.action}: {activity.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Analytics;
