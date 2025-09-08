import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Award,
  Target,
  Calendar,
  Download,
  Eye,
  Edit,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Minus,
  ChevronRight
} from 'lucide-react';

const StudentProgress = () => {
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filters, setFilters] = useState({
    grade: '',
    section: '',
    subject: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for development - replace with API calls
  useEffect(() => {
    fetchStudentsProgress();
    fetchAnalytics();
  }, [filters]);

  const fetchStudentsProgress = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      const response = await fetch(`/api/progress/students?${new URLSearchParams(filters)}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        // Mock data for development
        setStudents(mockStudentsData);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents(mockStudentsData);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/progress/analytics?${new URLSearchParams(filters)}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        // Mock data for development
        setAnalytics(mockAnalyticsData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(mockAnalyticsData);
    }
  };

  const filteredStudents = students.filter(student =>
    student.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId?.roll?.toString().includes(searchTerm)
  );

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'text-green-600 bg-green-100',
      'A': 'text-green-600 bg-green-100',
      'B+': 'text-blue-600 bg-blue-100',
      'B': 'text-blue-600 bg-blue-100',
      'C+': 'text-yellow-600 bg-yellow-100',
      'C': 'text-yellow-600 bg-yellow-100',
      'D': 'text-orange-600 bg-orange-100',
      'F': 'text-red-600 bg-red-100'
    };
    return colors[grade] || 'text-gray-600 bg-gray-100';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Student Progress Tracking</h1>
            <p className="text-purple-100">Monitor and analyze student performance across subjects</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-purple-500 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-purple-600 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.grade}
            onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Grades</option>
            <option value="9">Grade 9</option>
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
            <option value="12">Grade 12</option>
          </select>
          <select
            value={filters.section}
            onChange={(e) => setFilters({ ...filters, section: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
          <select
            value={filters.subject}
            onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
          </select>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Students</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{analytics.totalStudents}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Average Score</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{analytics.averageScore}%</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-yellow-100">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{analytics.attendanceRate}%</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-100">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Improving Students</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{analytics.improvementTrends?.improving || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Student Performance
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'overview' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('detailed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'detailed' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Detailed View
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' ? (
            <div className="space-y-4">
              {filteredStudents.map((student) => {
                const overallScore = student.progressMetrics?.length > 0
                  ? Math.round(student.progressMetrics.reduce((sum, metric) => sum + metric.averageScore, 0) / student.progressMetrics.length)
                  : 0;

                return (
                  <div key={student._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {student.studentId?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{student.studentId?.name || 'Unknown'}</h3>
                        <p className="text-sm text-gray-500">
                          Grade {student.studentId?.grade}-{student.studentId?.section} • Roll {student.studentId?.roll}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Overall Score</p>
                        <p className={`font-bold ${getPerformanceColor(overallScore)}`}>{overallScore}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Grade</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(student.overallGrade)}`}>
                          {student.overallGrade}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Trend</p>
                        <div className="flex justify-center">
                          {getTrendIcon(student.improvementTrend)}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Mathematics</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Physics</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Chemistry</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Attendance</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Grade</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                            {student.studentId?.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{student.studentId?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">Roll {student.studentId?.roll}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${getPerformanceColor(student.progressMetrics?.find(m => m.subject === 'Mathematics')?.averageScore || 0)}`}>
                          {student.progressMetrics?.find(m => m.subject === 'Mathematics')?.averageScore || 0}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${getPerformanceColor(student.progressMetrics?.find(m => m.subject === 'Physics')?.averageScore || 0)}`}>
                          {student.progressMetrics?.find(m => m.subject === 'Physics')?.averageScore || 0}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${getPerformanceColor(student.progressMetrics?.find(m => m.subject === 'Chemistry')?.averageScore || 0)}`}>
                          {student.progressMetrics?.find(m => m.subject === 'Chemistry')?.averageScore || 0}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-700">
                          {Math.round((student.progressMetrics?.reduce((sum, m) => sum + m.attendanceRate, 0) || 0) / (student.progressMetrics?.length || 1))}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(student.overallGrade)}`}>
                          {student.overallGrade}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-semibold">
                    {selectedStudent.studentId?.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedStudent.studentId?.name}</h2>
                    <p className="text-gray-600">Grade {selectedStudent.studentId?.grade}-{selectedStudent.studentId?.section} • Roll {selectedStudent.studentId?.roll}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Subject-wise Performance */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Subject Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedStudent.progressMetrics?.map((metric, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">{metric.subject}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Average Score</span>
                          <span className={`font-medium ${getPerformanceColor(metric.averageScore)}`}>
                            {metric.averageScore}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Assignments</span>
                          <span className="text-sm text-gray-800">
                            {metric.completedAssignments}/{metric.totalAssignments}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Attendance</span>
                          <span className="text-sm text-gray-800">{metric.attendanceRate}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Submissions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Submissions</h3>
                <div className="space-y-3">
                  {selectedStudent.submissions?.slice(0, 5).map((submission, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Assignment {index + 1}</p>
                          <p className="text-sm text-gray-500">
                            Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getPerformanceColor(submission.score || 0)}`}>
                          {submission.score || 0}%
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                          submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          submission.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {submission.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock data for development
const mockStudentsData = [
  {
    _id: '1',
    studentId: { name: 'Emma Johnson', grade: '10', section: 'A', roll: 1 },
    overallGrade: 'A+',
    improvementTrend: 'improving',
    progressMetrics: [
      { subject: 'Mathematics', averageScore: 95, attendanceRate: 98, totalAssignments: 10, completedAssignments: 10 },
      { subject: 'Physics', averageScore: 92, attendanceRate: 96, totalAssignments: 8, completedAssignments: 8 },
      { subject: 'Chemistry', averageScore: 88, attendanceRate: 94, totalAssignments: 9, completedAssignments: 8 }
    ],
    submissions: [
      { submittedAt: '2024-01-15', score: 95, status: 'graded' },
      { submittedAt: '2024-01-10', score: 92, status: 'graded' }
    ]
  },
  {
    _id: '2',
    studentId: { name: 'Michael Brown', grade: '11', section: 'B', roll: 5 },
    overallGrade: 'A',
    improvementTrend: 'stable',
    progressMetrics: [
      { subject: 'Mathematics', averageScore: 87, attendanceRate: 92, totalAssignments: 10, completedAssignments: 9 },
      { subject: 'Physics', averageScore: 89, attendanceRate: 94, totalAssignments: 8, completedAssignments: 7 },
      { subject: 'Chemistry', averageScore: 85, attendanceRate: 90, totalAssignments: 9, completedAssignments: 9 }
    ],
    submissions: [
      { submittedAt: '2024-01-14', score: 87, status: 'graded' },
      { submittedAt: '2024-01-09', score: 89, status: 'graded' }
    ]
  }
];

const mockAnalyticsData = {
  totalStudents: 45,
  averageScore: 87,
  attendanceRate: 94,
  improvementTrends: { improving: 15, stable: 22, declining: 8 },
  gradeDistribution: { 'A+': 8, 'A': 12, 'B+': 10, 'B': 8, 'C+': 4, 'C': 2, 'D': 1, 'F': 0 }
};

export default StudentProgress;