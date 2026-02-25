import React, { useEffect, useState } from 'react';
import { Users, UserCheck, UserPlus, Award, Loader, AlertCircle } from 'lucide-react';
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

const StaffManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [staffData, setStaffData] = useState(null);

  useEffect(() => {
    const fetchStaffData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/principal/staff/analytics`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`
          }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load staff analytics');
        }
        setStaffData(data);
      } catch (err) {
        console.error('Staff analytics error:', err);
        setError(err.message || 'Unable to load staff analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, []);

  const summary = staffData?.summary || {};
  const staffRoles = Array.isArray(staffData?.staffRoles) ? staffData.staffRoles : [];
  const satisfactionScores = Array.isArray(staffData?.satisfactionScores) ? staffData.satisfactionScores : [];
  const teacherBySubject = Array.isArray(staffData?.teacherBySubject) ? staffData.teacherBySubject : [];

  const staffRolesChartData = {
    labels: staffRoles.map((d) => d.role),
    datasets: [
      {
        label: 'Staff Count',
        data: staffRoles.map((d) => d.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(251, 191, 36, 0.7)',
          'rgba(239, 68, 68, 0.7)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
      }
    ]
  };

  const satisfactionChartData = {
    labels: satisfactionScores.map((d) => d.name),
    datasets: [
      {
        label: 'Score',
        data: satisfactionScores.map((d) => Number(d.score || 0)),
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
        borderRadius: 8,
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Staff Management</h1>
        <p className="text-purple-100">Live teacher and staff insights from your school records</p>
      </div>

      {loading && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-purple-600 mr-2" />
          <span className="text-gray-600">Loading staff analytics...</span>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{summary.totalTeachers || 0}</div>
                  <div className="text-sm text-gray-500">Total Teachers</div>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{summary.activeTeachers || 0}</div>
                  <div className="text-sm text-gray-500">Active Teachers (30d)</div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{summary.onLeaveTeachers || 0}</div>
                  <div className="text-sm text-gray-500">Inactive Teachers</div>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{summary.supportStaff || 0}</div>
                  <div className="text-sm text-gray-500">Support Staff</div>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <UserPlus className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{summary.admins || 0}</div>
                  <div className="text-sm text-gray-500">Admins</div>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Roles Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-center justify-center">
                {staffRoles.length ? <Pie data={staffRolesChartData} /> : <p className="text-sm text-gray-500">No role data.</p>}
              </div>
              <div>
                <table className="min-w-full text-left">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 text-gray-600">Role</th>
                      <th className="py-2 px-4 text-gray-600">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffRoles.map((row, idx) => (
                      <tr key={row.role} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-2 px-4 font-medium text-gray-800">{row.role}</td>
                        <td className="py-2 px-4 text-gray-700">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-Wise Teacher Distribution</h3>
            {teacherBySubject.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 text-gray-600">Subject</th>
                      <th className="py-2 px-4 text-gray-600">Teachers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherBySubject.map((row, idx) => (
                      <tr key={row.subject} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-2 px-4 font-medium text-gray-800">{row.subject}</td>
                        <td className="py-2 px-4 text-gray-700">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No teacher subject mapping found.</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Satisfaction Scores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-center justify-center">
                {satisfactionScores.length ? (
                  <Bar
                    data={satisfactionChartData}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: {
                          min: 0,
                          max: 5,
                          title: { display: true, text: 'Score (out of 5)' },
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="text-sm text-gray-500">No satisfaction score data.</p>
                )}
              </div>
              <div>
                <table className="min-w-full text-left">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 text-gray-600">Role</th>
                      <th className="py-2 px-4 text-gray-600">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {satisfactionScores.map((row, idx) => (
                      <tr key={row.name} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-2 px-4 font-medium text-gray-800">{row.name}</td>
                        <td className="py-2 px-4 text-gray-700">{row.score}</td>
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

export default StaffManagement;
