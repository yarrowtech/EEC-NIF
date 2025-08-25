import React, { useState } from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  Award, 
  Calendar,
  Users,
  FileText,
  BarChart3,
  PieChart,
  Target,
  ArrowUp,
  ArrowDown,
  Eye,
  Filter,
  Download
} from 'lucide-react';

const AcademicAnalytics = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('current_term');
  const [selectedGrade, setSelectedGrade] = useState('all');

  const academicOverview = {
    averageGPA: '95%',
    passRate: 94.8,
    honorsStudents: 234,
    improvementRate: 12.5,
    attendanceRate: 94.2,
    homeworkCompletion: 89.7
  };

  const gradeDistribution = [
    { grade: 'A+', count: 187, percentage: 23.4, color: 'emerald' },
    { grade: 'A', count: 234, percentage: 29.3, color: 'green' },
    { grade: 'B+', count: 156, percentage: 19.5, color: 'blue' },
    { grade: 'B', count: 123, percentage: 15.4, color: 'yellow' },
    { grade: 'C+', count: 67, percentage: 8.4, color: 'orange' },
    { grade: 'C', count: 23, percentage: 2.9, color: 'red' },
    { grade: 'Below C', count: 9, percentage: 1.1, color: 'gray' }
  ];

  const subjectPerformance = [
    { 
      subject: 'Mathematics', 
      avgScore: 87.5, 
      improvement: +3.2, 
      studentsAbove80: 234, 
      totalStudents: 289,
      teacherRating: 4.6,
      trend: 'up'
    },
    { 
      subject: 'Science', 
      avgScore: 84.7, 
      improvement: +2.8, 
      studentsAbove80: 198, 
      totalStudents: 289,
      teacherRating: 4.4,
      trend: 'up'
    },
    { 
      subject: 'English Language', 
      avgScore: 82.3, 
      improvement: +1.9, 
      studentsAbove80: 187, 
      totalStudents: 289,
      teacherRating: 4.5,
      trend: 'up'
    },
    { 
      subject: 'Social Studies', 
      avgScore: 79.8, 
      improvement: -0.5, 
      studentsAbove80: 156, 
      totalStudents: 289,
      teacherRating: 4.2,
      trend: 'down'
    },
    { 
      subject: 'Arts & Crafts', 
      avgScore: 91.2, 
      improvement: +4.1, 
      studentsAbove80: 267, 
      totalStudents: 289,
      teacherRating: 4.8,
      trend: 'up'
    },
    { 
      subject: 'Physical Education', 
      avgScore: 88.9, 
      improvement: +2.3, 
      studentsAbove80: 245, 
      totalStudents: 289,
      teacherRating: 4.7,
      trend: 'up'
    }
  ];

  const classAnalytics = [
    { grade: 'Grade 6', totalStudents: 120, avgGPA: 3.8, topPerformers: 28, needsSupport: 8 },
    { grade: 'Grade 7', totalStudents: 125, avgGPA: 3.7, topPerformers: 31, needsSupport: 12 },
    { grade: 'Grade 8', totalStudents: 118, avgGPA: 3.6, topPerformers: 25, needsSupport: 15 },
    { grade: 'Grade 9', totalStudents: 132, avgGPA: 3.8, topPerformers: 35, needsSupport: 10 },
    { grade: 'Grade 10', totalStudents: 128, avgGPA: 3.9, topPerformers: 42, needsSupport: 7 },
    { grade: 'Grade 11', totalStudents: 115, avgGPA: 3.7, topPerformers: 29, needsSupport: 11 },
    { grade: 'Grade 12', totalStudents: 109, avgGPA: 3.8, topPerformers: 38, needsSupport: 6 }
  ];

  const examSchedule = [
    { exam: 'Mid-Term Exams', date: '2024-03-15', status: 'upcoming', subjects: 5 },
    { exam: 'Unit Test 3', date: '2024-02-28', status: 'completed', subjects: 3 },
    { exam: 'Practical Exams', date: '2024-04-10', status: 'scheduled', subjects: 4 },
    { exam: 'Final Exams', date: '2024-05-20', status: 'scheduled', subjects: 6 }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Academic Analytics</h1>
            <p className="text-yellow-100">Comprehensive academic performance insights</p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/70"
            >
              <option value="current_term">Current Term</option>
              <option value="last_term">Last Term</option>
              <option value="academic_year">Academic Year</option>
            </select>
            <select 
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white"
            >
              <option value="all">All Grades</option>
              <option value="6">Grade 6</option>
              <option value="7">Grade 7</option>
              <option value="8">Grade 8</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
          </div>
        </div>
      </div>

      {/* Academic Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-900">{academicOverview.averageGPA}</div>
              <div className="text-sm text-amber-600">Average Percentage</div>
            </div>
          </div>
          <div className="w-full bg-yellow-200 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full" 
              style={{ width: `${(academicOverview.averageGPA / 4.0) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Target className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-900">{academicOverview.passRate}%</div>
              <div className="text-sm text-amber-600">Pass Rate</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-amber-600 text-sm">
            <ArrowUp className="w-4 h-4" />
            <span>+2.3% from last term</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-yellow-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-900">{academicOverview.honorsStudents}</div>
              <div className="text-sm text-amber-600">Honor Students</div>
            </div>
          </div>
          <div className="text-xs text-amber-600">18.8% of total students</div>
        </div>
      </div>

      {/* Grade Distribution & Subject Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-yellow-100">
          <div className="p-6 border-b border-yellow-100">
            <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-yellow-500" />
              Grade Distribution
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {gradeDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      item.color === 'emerald' ? 'bg-emerald-500' :
                      item.color === 'green' ? 'bg-green-500' :
                      item.color === 'blue' ? 'bg-blue-500' :
                      item.color === 'yellow' ? 'bg-yellow-500' :
                      item.color === 'orange' ? 'bg-orange-500' :
                      item.color === 'red' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`}></div>
                    <span className="font-medium text-gray-900">{item.grade}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{item.count} students</div>
                      <div className="text-xs text-gray-500">{item.percentage}%</div>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.color === 'emerald' ? 'bg-emerald-500' :
                          item.color === 'green' ? 'bg-green-500' :
                          item.color === 'blue' ? 'bg-blue-500' :
                          item.color === 'yellow' ? 'bg-yellow-500' :
                          item.color === 'orange' ? 'bg-orange-500' :
                          item.color === 'red' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}
                        style={{ width: `${item.percentage * 3}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-500" />
              Subject Performance
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {subjectPerformance.slice(0, 4).map((subject, index) => (
                <div key={index} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{subject.subject}</h4>
                    <div className={`flex items-center gap-1 text-sm ${
                      subject.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {subject.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      {subject.improvement > 0 ? '+' : ''}{subject.improvement}%
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Average Score</div>
                      <div className="font-bold text-gray-900">{subject.avgScore}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Above 80%</div>
                      <div className="font-bold text-gray-900">{subject.studentsAbove80}/{subject.totalStudents}</div>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${subject.avgScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Class Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-yellow-100">
        <div className="p-6 border-b border-yellow-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              Grade-wise Analytics
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-yellow-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-amber-800">Grade</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-amber-800">Total Students</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-amber-800">Average GPA</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-amber-800">Top Performers</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-amber-800">Needs Support</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-amber-800">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-200">
              {classAnalytics.map((classData, index) => (
                <tr key={index} className="hover:bg-yellow-50">
                  <td className="px-6 py-4 font-medium text-amber-900">{classData.grade}</td>
                  <td className="px-6 py-4 text-amber-700">{classData.totalStudents}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-amber-900">{classData.avgGPA}</span>
                    <div className="w-16 bg-yellow-200 rounded-full h-1 mt-1">
                      <div 
                        className="bg-yellow-500 h-1 rounded-full"
                        style={{ width: `${(classData.avgGPA / 4.0) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      {classData.topPerformers} students
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                      {classData.needsSupport} students
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          classData.avgGPA >= 3.5 ? 'bg-purple-500' :
                          classData.avgGPA >= 3.0 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${(classData.avgGPA / 4.0) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Exams */}
      <div className="bg-white rounded-xl shadow-sm border border-yellow-100">
        <div className="p-6 border-b border-yellow-100">
          <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            Examination Schedule
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examSchedule.map((exam, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{exam.exam}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    exam.status === 'upcoming' ? 'bg-orange-100 text-orange-700' :
                    exam.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {exam.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(exam.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {exam.subjects} subjects
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicAnalytics;