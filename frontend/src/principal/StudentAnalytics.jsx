import React from 'react';
import { GraduationCap, TrendingUp, Users, Award } from 'lucide-react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const StudentAnalytics = () => {
  // Static data
  const performanceDistribution = [
    { grade: 'A', students: 420 },
    { grade: 'B', students: 380 },
    { grade: 'C', students: 280 },
    { grade: 'D', students: 120 },
    { grade: 'F', students: 47 }
  ];
  const topStudents = [
    { name: 'Amit Sharma', grade: 'A', attendance: '98%' },
    { name: 'Priya Singh', grade: 'A', attendance: '97%' },
    { name: 'Rahul Das', grade: 'A', attendance: '96%' },
    { name: 'Sneha Roy', grade: 'B', attendance: '95%' },
    { name: 'Vikram Patel', grade: 'B', attendance: '94%' }
  ];

  // ChartJS data for Performance Distribution
  const performanceChartData = {
    labels: performanceDistribution.map((d) => d.grade),
    datasets: [
      {
        label: 'Students',
        data: performanceDistribution.map((d) => d.students),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)', // blue
          'rgba(34, 197, 94, 0.7)', // green
          'rgba(251, 191, 36, 0.7)', // yellow
          'rgba(239, 68, 68, 0.7)', // red
          'rgba(107, 114, 128, 0.7)' // gray
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(107, 114, 128, 1)'
        ],
        borderWidth: 2,
      }
    ]
  };

  const performanceChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Student Performance Distribution',
      },
    },
  };

  // ChartJS data for Top Students
  const topStudentsChartData = {
    labels: topStudents.map((d) => d.name),
    datasets: [
      {
        label: 'Attendance (%)',
        data: topStudents.map((d) => parseInt(d.attendance)),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 8,
      }
    ]
  };

  const topStudentsChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top Students Attendance',
      },
    },
    scales: {
      y: {
        min: 90,
        max: 100,
        title: {
          display: true,
          text: 'Attendance (%)',
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Student Analytics</h1>
        <p className="text-blue-100">Comprehensive student enrollment, attendance, and progress analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* ...existing summary cards... */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">1,247</div>
              <div className="text-sm text-gray-500">Total Students</div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">94.2%</div>
              <div className="text-sm text-gray-500">Attendance Rate</div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">96.5%</div>
              <div className="text-sm text-gray-500">Graduation Rate</div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">+4.2%</div>
              <div className="text-sm text-gray-500">Growth Rate</div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Distribution Chart & Table */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Performance Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-center">
            <Pie data={performanceChartData} options={performanceChartOptions} />
          </div>
          <div>
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  <th className="py-2 px-4 text-gray-600">Grade</th>
                  <th className="py-2 px-4 text-gray-600">Number of Students</th>
                </tr>
              </thead>
              <tbody>
                {performanceDistribution.map((row, idx) => (
                  <tr key={row.grade} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-2 px-4 font-medium text-gray-800">{row.grade}</td>
                    <td className="py-2 px-4 text-gray-700">{row.students}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Students Chart & Table */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Students</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-center">
            <Bar data={topStudentsChartData} options={topStudentsChartOptions} />
          </div>
          <div>
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  <th className="py-2 px-4 text-gray-600">Name</th>
                  <th className="py-2 px-4 text-gray-600">Grade</th>
                  <th className="py-2 px-4 text-gray-600">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((student, idx) => (
                  <tr key={student.name} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-2 px-4 font-medium text-gray-800">{student.name}</td>
                    <td className="py-2 px-4 text-gray-700">{student.grade}</td>
                    <td className="py-2 px-4 text-gray-700">{student.attendance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;