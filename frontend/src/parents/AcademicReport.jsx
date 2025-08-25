import React from 'react';
import {
  BookOpen,
  Award,
  TrendingUp,
  Download,
  Filter,
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
} from 'recharts';

const AcademicReport = () => {
  const academicData = {
    studentName: "Sarah Smith",
    class: "10-A",
    currentGPA: '97%',
    rank: 5,
    totalStudents: 120,
    subjects: [
      {
        name: "Mathematics",
        grade: "A",
        percentage: 92,
        teacher: "Dr. Sarah Johnson",
        assignments: 15,
        tests: 4,
      },
      {
        name: "Physics",
        grade: "A-",
        percentage: 88,
        teacher: "Prof. Michael Chen",
        assignments: 12,
        tests: 3,
      },
      {
        name: "English",
        grade: "B+",
        percentage: 85,
        teacher: "Ms. Emily Davis",
        assignments: 18,
        tests: 4,
      },
    ],
  };

  const progressData = academicData.subjects.map(subject => ({
    subject: subject.name,
    percentage: subject.percentage,
  }));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Academic Report</h1>
        <p className="text-yellow-100">
          View academic performance and progress
        </p>
      </div>

      {/* Student Info & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Student Info
          </h3>
          <div className="space-y-2">
            <p className="text-gray-600">Name: {academicData.studentName}</p>
            <p className="text-gray-600">Class: {academicData.class}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <h3 className="text-2xl font-bold text-yellow-600">
            {academicData.currentGPA}
          </h3>
          <p className="text-gray-600">Current Percetange</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <h3 className="text-2xl font-bold text-blue-600">
            {academicData.rank}
          </h3>
          <p className="text-gray-600">Class Rank</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <h3 className="text-2xl font-bold text-green-600">
            {academicData.totalStudents}
          </h3>
          <p className="text-gray-600">Total Students</p>
        </div>
      </div>

      {/* Filter + Export */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                <option value="all">All Subjects</option>
                <option value="math">Mathematics</option>
                <option value="physics">Physics</option>
                <option value="english">English</option>
              </select>
            </div>
          </div>

          <button className="flex items-center space-x-2 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 📊 Subject-wise Progress Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Subject-wise Progress</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={progressData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="percentage" fill="#facc15" name="Percentage Score" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Subject Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {academicData.subjects.map((subject, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {subject.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Teacher: {subject.teacher}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    subject.grade.startsWith("A")
                      ? "bg-green-100 text-green-800"
                      : subject.grade.startsWith("B")
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  Grade {subject.grade}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-yellow-600">
                    Performance
                  </span>
                  <span className="text-xs font-semibold text-yellow-600">
                    {subject.percentage}%
                  </span>
                </div>
                <div className="overflow-hidden h-2 mt-1 flex rounded bg-yellow-100">
                  <div
                    style={{ width: `${subject.percentage}%` }}
                    className="shadow-none flex text-white justify-center bg-yellow-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Assignments</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {subject.assignments}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Tests</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {subject.tests}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AcademicReport;