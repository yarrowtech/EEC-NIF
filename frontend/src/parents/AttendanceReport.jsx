import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle, XCircle, TrendingUp, Loader2, Users } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const AttendanceReport = () => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [children, setChildren] = useState([]);

  useEffect(() => {
    const loadAttendance = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Login required');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const query = new URLSearchParams({ month });

        const res = await fetch(`${API_BASE}/api/attendance/parent/children?${query.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load attendance report');
        }

        const list = Array.isArray(data.children) ? data.children : [];
        setChildren(list);
        if (!selectedStudentId && list.length === 1) {
          setSelectedStudentId(list[0]?.student?._id || '');
        }
      } catch (err) {
        setError(err.message || 'Could not load attendance');
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [month]);

  const selectedChild = useMemo(() => {
    if (!children.length) return null;
    if (!selectedStudentId) return children[0];
    return children.find((child) => child?.student?._id === selectedStudentId) || children[0];
  }, [children, selectedStudentId]);

  const records = Array.isArray(selectedChild?.attendance) ? selectedChild.attendance : [];
  const monthlySummary = selectedChild?.monthlySummary || {
    totalClasses: 0,
    presentDays: 0,
    absentDays: 0,
    attendancePercentage: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl p-6 mb-6 text-white shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Attendance Report</h1>
        <p className="text-yellow-100">Read-only monthly attendance for your child</p>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 mb-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Select Child</option>
            {children.map((child) => (
              <option key={child?.student?._id} value={child?.student?._id}>
                {child?.student?.name} ({child?.student?.grade || '-'} {child?.student?.section || ''})
              </option>
            ))}
          </select>
        </div>
        {error ? <p className="text-sm text-red-600 mt-2">{error}</p> : null}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-8 border border-gray-100 flex items-center justify-center text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading attendance...
        </div>
      ) : !selectedChild ? (
        <div className="bg-white rounded-xl p-8 border border-gray-100 text-gray-500 text-center">
          No child attendance found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="text-sm text-gray-600">Total Classes</h3>
                <Users className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-2">{monthlySummary.totalClasses}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="text-sm text-gray-600">Present</h3>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600 mt-2">{monthlySummary.presentDays}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="text-sm text-gray-600">Absent</h3>
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-600 mt-2">{monthlySummary.absentDays}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="text-sm text-gray-600">Attendance %</h3>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600 mt-2">{monthlySummary.attendancePercentage}%</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                Daily Records ({selectedChild?.student?.name})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Subject</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-gray-500" colSpan={3}>No attendance records for this month.</td>
                    </tr>
                  ) : (
                    records.map((entry) => (
                      <tr key={entry._id} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-gray-800">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            entry.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {entry.status === 'present' ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{entry.subject || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceReport;
