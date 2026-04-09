import React, { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  Award,
  Loader,
  AlertCircle,
  Briefcase,
  Activity,
  Target
} from 'lucide-react';
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

  const totalTeachers = summary.totalTeachers || 0;
  const activeTeachers = summary.activeTeachers || 0;
  const onLeaveTeachers = summary.onLeaveTeachers || 0;
  const supportStaff = summary.supportStaff || 0;
  const admins = summary.admins || 0;
  const totalTeamMembers = totalTeachers + supportStaff + admins;

  const activeRate = totalTeachers
    ? Number(((activeTeachers / totalTeachers) * 100).toFixed(1))
    : 0;
  const inactiveRate = totalTeachers
    ? Number(((onLeaveTeachers / totalTeachers) * 100).toFixed(1))
    : 0;
  const coverageShare = totalTeamMembers
    ? Number((((supportStaff + admins) / totalTeamMembers) * 100).toFixed(1))
    : 0;
  const satisfactionAverage = satisfactionScores.length
    ? Number(
        (
          satisfactionScores.reduce((sum, row) => sum + Number(row.score || 0), 0) /
          satisfactionScores.length
        ).toFixed(1)
      )
    : 0;

  const roleColors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-rose-500',
    'bg-slate-500'
  ];
  const normalizedRoles = staffRoles.map((role, idx) => ({
    ...role,
    percent: totalTeamMembers
      ? Number(((Number(role.count || 0) / totalTeamMembers) * 100).toFixed(1))
      : 0,
    colorClass: roleColors[idx % roleColors.length],
  }));
  const subjectLeaders = teacherBySubject
    .slice()
    .sort((a, b) => Number(b.count) - Number(a.count))
    .slice(0, 5);
  const totalSubjectAssignments = teacherBySubject.reduce(
    (sum, item) => sum + Number(item.count || 0),
    0
  );

  const highlightCards = [
    {
      key: 'teachers',
      label: 'Teachers on roster',
      value: totalTeachers.toLocaleString(),
      helper: `${activeTeachers} active · ${onLeaveTeachers} inactive`,
      icon: Users,
      accent: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      key: 'active',
      label: 'Activation (30d)',
      value: `${activeRate.toFixed(1)}%`,
      helper: `${activeTeachers} checked in`,
      icon: UserCheck,
      accent: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      key: 'support',
      label: 'Support staff',
      value: supportStaff.toLocaleString(),
      helper: `${coverageShare}% of total workforce`,
      icon: UserPlus,
      accent: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      key: 'admins',
      label: 'Admins',
      value: admins.toLocaleString(),
      helper: admins ? 'Campus operations covered' : 'Assign an admin',
      icon: Briefcase,
      accent: 'bg-purple-50 text-purple-600 border-purple-100',
    },
  ];

  const staffHealthMetrics = [
    {
      label: 'Teacher activation',
      value: `${activeRate.toFixed(1)}%`,
      detail: `${activeTeachers}/${totalTeachers || 0} active`,
    },
    {
      label: 'Inactive teachers',
      value: `${inactiveRate.toFixed(1)}%`,
      detail: `${onLeaveTeachers} currently away`,
    },
    {
      label: 'Support coverage',
      value: `${coverageShare.toFixed(1)}%`,
      detail: `${supportStaff + admins} support/admin`,
    },
    {
      label: 'Avg satisfaction',
      value: `${satisfactionAverage.toFixed(1)}/5`,
      detail: `${satisfactionScores.length || 0} cohorts surveyed`,
    },
  ];

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
          'rgba(139, 92, 246, 0.7)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(139, 92, 246, 1)'
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
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderRadius: 8,
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">Faculty operations</p>
            <h1 className="text-3xl font-bold mt-2">Staff Management</h1>
            <p className="text-white/80 mt-2">
              Keep track of teachers, support staff, and administrative coverage with real-time signals.
            </p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 min-w-[220px] backdrop-blur">
            <p className="text-sm text-white/70">Total workforce</p>
            <p className="text-3xl font-bold">{totalTeamMembers.toLocaleString()}</p>
            <p className="text-xs text-white/70 mt-1">
              {totalTeachers.toLocaleString()} teachers · {supportStaff.toLocaleString()} support · {admins.toLocaleString()} admins
            </p>
          </div>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {highlightCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.key}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-start gap-4"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.accent}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{card.helper}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 xl:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Composition</p>
                  <h3 className="text-xl font-semibold text-gray-900">Staff roles distribution</h3>
                </div>
                {totalTeamMembers > 0 && (
                  <span className="text-sm text-gray-500">{totalTeamMembers.toLocaleString()} total members</span>
                )}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex items-center justify-center h-64">
                  {staffRoles.length ? (
                    <Pie data={staffRolesChartData} />
                  ) : (
                    <p className="text-sm text-gray-500">No role data available.</p>
                  )}
                </div>
                <div className="space-y-4">
                  {normalizedRoles.length ? (
                    normalizedRoles.map((row) => (
                      <div key={row.role}>
                        <div className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${row.colorClass}`} />
                            {row.role}
                          </div>
                          <span>{row.count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={`${row.colorClass} h-2 rounded-full`}
                            style={{ width: `${row.percent}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{row.percent}% of staff</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Roles will appear once assigned.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Engagement</p>
                  <h3 className="text-lg font-semibold text-gray-900">Team health snapshot</h3>
                </div>
                <Target className="w-5 h-5 text-purple-500" />
              </div>
              <div className="space-y-4">
                {staffHealthMetrics.map((metric) => (
                  <div key={metric.label} className="p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">{metric.label}</p>
                      <span className="text-lg font-bold text-gray-900">{metric.value}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{metric.detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-4">
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Updated live from staff records
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Academics</p>
                  <h3 className="text-lg font-semibold text-gray-900">Subject-wise teacher coverage</h3>
                </div>
                {totalSubjectAssignments > 0 && (
                  <span className="text-sm text-gray-500">{totalSubjectAssignments} assignments</span>
                )}
              </div>
              {teacherBySubject.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="py-2 pr-4 font-medium">Subject</th>
                          <th className="py-2 pr-4 font-medium text-right">Teachers</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teacherBySubject.map((row) => (
                          <tr key={row.subject} className="border-t border-gray-100">
                            <td className="py-3 pr-4 text-gray-900 font-medium">{row.subject}</td>
                            <td className="py-3 pr-4 text-gray-600 text-right">{row.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Top subjects</p>
                    {subjectLeaders.length ? (
                      <div className="flex flex-wrap gap-2">
                        {subjectLeaders.map((subject) => (
                          <span
                            key={subject.subject}
                            className="px-3 py-1 rounded-full bg-white border border-gray-200 text-sm text-gray-700"
                          >
                            {subject.subject}: {subject.count}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No subjects ranked yet.</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">No teacher subject mapping found.</p>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Well-being</p>
                  <h3 className="text-lg font-semibold text-gray-900">Staff satisfaction</h3>
                </div>
                {satisfactionScores.length > 0 && (
                  <span className="text-sm text-gray-500">{satisfactionAverage.toFixed(1)}/5 avg score</span>
                )}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex items-center justify-center min-h-[220px]">
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
                <div className="space-y-3">
                  {satisfactionScores.length ? (
                    satisfactionScores.map((row) => (
                      <div key={row.name} className="p-3 bg-gray-50 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">{row.name}</p>
                          <span className="text-lg font-bold text-gray-900">{row.score}</span>
                        </div>
                        <p className="text-xs text-gray-500">Average satisfaction score</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Survey results will appear here.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StaffManagement;
