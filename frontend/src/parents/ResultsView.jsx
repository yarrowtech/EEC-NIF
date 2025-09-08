import React from 'react';
import { FileText, Award, TrendingUp, Download } from 'lucide-react';

const ResultsView = () => {
  const resultsData = {
    studentName: "Koushik Bala",
    class: "10-A",
    currentGPA: "89%",
    rank: 5,
    totalStudents: 120,
    examResults: [
      {
        examName: "Mid-Term Examination",
        date: "2024-02-15",
        subjects: [
          { name: "Mathematics", marks: 92, grade: "A", maxMarks: 100 },
          { name: "Physics", marks: 88, grade: "A-", maxMarks: 100 },
          { name: "Chemistry", marks: 85, grade: "B+", maxMarks: 100 },
          { name: "English", marks: 90, grade: "A", maxMarks: 100 }
        ]
      },
      {
        examName: "Unit Test 2",
        date: "2024-01-20",
        subjects: [
          { name: "Mathematics", marks: 95, grade: "A", maxMarks: 100 },
          { name: "Physics", marks: 87, grade: "B+", maxMarks: 100 },
          { name: "Chemistry", marks: 88, grade: "B+", maxMarks: 100 },
          { name: "English", marks: 92, grade: "A", maxMarks: 100 }
        ]
      }
    ]
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Results</h1>
        <p className="text-yellow-100">View your child's academic results</p>
      </div>

      {/* Student Info & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Info</h3>
          <div className="space-y-2">
            <p className="text-gray-600">Name: {resultsData.studentName}</p>
            <p className="text-gray-600">Class: {resultsData.class}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-yellow-600">{resultsData.currentGPA}</h3>
            <p className="text-gray-600">Current Marks</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-blue-600">{resultsData.rank}</h3>
            <p className="text-gray-600">Class Rank</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-green-600">{resultsData.totalStudents}</h3>
            <p className="text-gray-600">Total Students</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gray-500" />
              <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                <option value="all">All Exams</option>
                <option value="midterm">Mid-Term</option>
                <option value="unit">Unit Tests</option>
              </select>
            </div>
          </div>

          <button className="flex items-center space-x-2 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* Exam Results */}
      {resultsData.examResults.map((exam, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{exam.examName}</h3>
                <p className="text-sm text-gray-500">Date: {new Date(exam.date).toLocaleDateString()}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Marks</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Grade</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {exam.subjects.map((subject, subIndex) => (
                  <tr key={subIndex} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{subject.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {subject.marks}/{subject.maxMarks}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        subject.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                        subject.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {subject.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${(subject.marks / subject.maxMarks) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultsView; 