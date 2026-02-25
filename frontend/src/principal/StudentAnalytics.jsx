import React, { useEffect, useMemo, useState } from 'react';
import { GraduationCap, TrendingUp, Users, Award, Loader, AlertCircle } from 'lucide-react';
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

const API_BASE = import.meta.env.VITE_API_URL;

const StudentAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchStudentAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/principal/students/analytics`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`
          }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load student analytics');
        }
        setAnalytics(data);
      } catch (err) {
        console.error('Student analytics error:', err);
        setError(err.message || 'Unable to load student analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAnalytics();
  }, []);

  const summary = analytics?.summary || {};
  const performanceDistribution = Array.isArray(analytics?.gradeDistribution) ? analytics.gradeDistribution : [];
  const topStudents = useMemo(
    () => (Array.isArray(analytics?.topStudents) ? analytics.topStudents.slice(0, 5) : []),
    [analytics]
  );

  const performanceChartData = {
    labels: performanceDistribution.map((d) => d.grade),
    datasets: [
      {
        label: 'Students',
        data: performanceDistribution.map((d) => d.students),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(251, 191, 36, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(107, 114, 128, 0.7)'
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

  const topStudentsChartData = {
    labels: topStudents.map((d) => d.name),
    datasets: [
      {
        label: 'Attendance (%)',
        data: topStudents.map((d) => Number(d.attendanceRate || 0)),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 8,
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Student Analytics</h1>
        <p className="text-blue-100">Live enrollment, attendance, and performance from your database</p>
      </div>

      {loading && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Loading student analytics...</span>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{summary.totalStudents || 0}</div>
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
                  <div className="text-2xl font-bold text-gray-900">{Number(summary.attendanceRate || 0).toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">Attendance Rate (30d)</div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{summary.gradedStudents || 0}</div>
                  <div className="text-sm text-gray-500">Graded Students</div>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{summary.highPerformers || 0}</div>
                  <div className="text-sm text-gray-500">High Performers (A/A+)</div>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Performance Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-center justify-center">
                {performanceDistribution.length ? (
                  <Pie data={performanceChartData} />
                ) : (
                  <p className="text-sm text-gray-500">No grade distribution available.</p>
                )}
              </div>
              <div>
                <table className="min-w-full text-left">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 text-gray-600">Grade</th>
                      <th className="py-2 px-4 text-gray-600">Students</th>
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

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Students by Attendance (30d)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-center justify-center">
                {topStudents.length ? (
                  <Bar
                    data={topStudentsChartData}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: {
                          min: 0,
                          max: 100,
                          title: { display: true, text: 'Attendance (%)' },
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-sm text-gray-500">No attendance leaderboard available.</p>
                )}
              </div>
              <div>
                <table className="min-w-full text-left">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 text-gray-600">Name</th>
                      <th className="py-2 px-4 text-gray-600">Class</th>
                      <th className="py-2 px-4 text-gray-600">Grade</th>
                      <th className="py-2 px-4 text-gray-600">Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStudents.map((student, idx) => (
                      <tr key={student.id || student.name} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-2 px-4 font-medium text-gray-800">{student.name}</td>
                        <td className="py-2 px-4 text-gray-700">{student.grade}</td>
                        <td className="py-2 px-4 text-gray-700">{student.overallGrade || '-'}</td>
                        <td className="py-2 px-4 text-gray-700">{Number(student.attendanceRate || 0).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentAnalytics;
