import React from 'react';
import { Users, UserCheck, UserPlus, Award } from 'lucide-react';
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

const StaffManagement = () => {
  // Static staff data
  const staffRoles = [
    { role: 'Teachers', count: 89 },
    { role: 'Support Staff', count: 34 },
    { role: 'Admin', count: 12 },
    { role: 'HR', count: 6 },
    { role: 'New Hires', count: 5 }
  ];
  const satisfactionScores = [
    { name: 'Teachers', score: 4.7 },
    { name: 'Support Staff', score: 4.5 },
    { name: 'Admin', score: 4.2 },
    { name: 'HR', score: 4.6 }
  ];

  // ChartJS data for staff roles
  const staffRolesChartData = {
    labels: staffRoles.map((d) => d.role),
    datasets: [
      {
        label: 'Staff Count',
        data: staffRoles.map((d) => d.count),
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

  const staffRolesChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Staff Roles Distribution',
      },
    },
  };

  // ChartJS data for satisfaction scores
  const satisfactionChartData = {
    labels: satisfactionScores.map((d) => d.name),
    datasets: [
      {
        label: 'Satisfaction Score',
        data: satisfactionScores.map((d) => d.score),
        backgroundColor: 'rgba(139, 92, 246, 0.7)', // purple
        borderRadius: 8,
      }
    ]
  };

  const satisfactionChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Staff Satisfaction Scores',
      },
    },
    scales: {
      y: {
        min: 3.5,
        max: 5,
        title: {
          display: true,
          text: 'Score (out of 5)',
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Staff Management</h1>
        <p className="text-purple-100">Manage teachers, staff performance, and HR operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* ...existing summary cards... */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">89</div>
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
              <div className="text-2xl font-bold text-gray-900">34</div>
              <div className="text-sm text-gray-500">Support Staff</div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">4.6/5</div>
              <div className="text-sm text-gray-500">Satisfaction</div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">5</div>
              <div className="text-sm text-gray-500">New Hires</div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Staff Roles Chart & Table */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Roles Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-center">
            <Pie data={staffRolesChartData} options={staffRolesChartOptions} />
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

      {/* Satisfaction Chart & Table */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Satisfaction Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-center">
            <Bar data={satisfactionChartData} options={satisfactionChartOptions} />
          </div>
          <div>
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  <th className="py-2 px-4 text-gray-600">Role</th>
                  <th className="py-2 px-4 text-gray-600">Satisfaction Score</th>
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
    </div>
  );
};

export default StaffManagement;