import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Search,
  Check,
  X,
  Users,
  TrendingUp,
  BarChart3,
  Save,
  Filter,
  Loader2,
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const STATUS = Object.freeze({
  PRESENT: 'present',
  ABSENT: 'absent',
});

const AttendanceManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [subject, setSubject] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [students, setStudents] = useState([]);
  const [sessionOptions, setSessionOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});

  const loadAttendance = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Login required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const query = new URLSearchParams({
        month: selectedMonth,
        date: selectedDate,
      });
      if (selectedSession) query.set('session', selectedSession);
      if (selectedClass) query.set('className', selectedClass);
      if (selectedSection) query.set('section', selectedSection);
      if (searchTerm.trim()) query.set('search', searchTerm.trim());

      const res = await fetch(`${API_BASE}/api/attendance/teacher/students?${query.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load attendance');
      }

      const nextStudents = Array.isArray(data.students) ? data.students : [];
      setStudents(nextStudents);
      setSessionOptions(Array.isArray(data?.options?.sessions) ? data.options.sessions : []);
      setClassOptions(Array.isArray(data?.options?.classes) ? data.options.classes : []);
      setSectionOptions(Array.isArray(data?.options?.sections) ? data.options.sections : []);

      const nextState = {};
      nextStudents.forEach((student) => {
        nextState[student._id] = student?.selectedDateRecord?.status || STATUS.PRESENT;
      });
      setAttendanceData(nextState);
    } catch (err) {
      setError(err.message || 'Unable to load attendance data');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedDate, selectedSession, selectedClass, selectedSection, searchTerm]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const setStudentStatus = (studentId, status) => {
    setAttendanceData((prev) => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        date: selectedDate,
        entries: students.map((student) => ({
          studentId: student._id,
          status: attendanceData[student._id] || STATUS.PRESENT,
          subject: subject.trim(),
        })),
      };

      const res = await fetch(`${API_BASE}/api/attendance/teacher/bulk-upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to save attendance');
      }

      setSuccess(`Saved (${data.created || 0} new, ${data.updated || 0} updated)`);
      await loadAttendance();
    } catch (err) {
      setError(err.message || 'Could not save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = useMemo(
    () => Object.values(attendanceData).filter((status) => status === STATUS.PRESENT).length,
    [attendanceData]
  );
  const absentCount = useMemo(
    () => Object.values(attendanceData).filter((status) => status === STATUS.ABSENT).length,
    [attendanceData]
  );
  const attendanceRate = useMemo(() => {
    const total = presentCount + absentCount;
    return total > 0 ? Math.round((presentCount / total) * 100) : 0;
  }, [presentCount, absentCount]);

  const weekDates = useMemo(() => {
    const dates = [];
    const base = new Date(selectedDate);
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(base);
      day.setDate(base.getDate() - i);
      dates.push(day.toISOString().slice(0, 10));
    }
    return dates;
  }, [selectedDate]);

  const topAttendees = useMemo(
    () =>
      [...students]
        .sort((a, b) => (b?.monthlySummary?.attendancePercentage || 0) - (a?.monthlySummary?.attendancePercentage || 0))
        .slice(0, 5),
    [students]
  );

  const lowAttendance = useMemo(
    () =>
      [...students]
        .filter((student) => (student?.monthlySummary?.attendancePercentage || 0) < 85)
        .sort((a, b) => (a?.monthlySummary?.attendancePercentage || 0) - (b?.monthlySummary?.attendancePercentage || 0))
        .slice(0, 5),
    [students]
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl p-6 mb-6 text-white shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Student Attendance Management</h1>
        <p className="text-yellow-100">Teacher can create, update, and correct attendance by day</p>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 mb-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student name"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedSession}
              onChange={(e) => {
                setSelectedSession(e.target.value);
                setSelectedClass('');
                setSelectedSection('');
              }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Sessions</option>
              {sessionOptions.map((session) => (
                <option key={session} value={session}>{session}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection('');
              }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Classes</option>
              {classOptions.map((className) => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Sections</option>
              {sectionOptions.map((section) => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (optional, saved for all)"
            className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={saveAttendance}
            disabled={saving || loading || students.length === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-600 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Attendance
          </button>
        </div>
        {error ? <p className="text-sm text-red-600 mt-2">{error}</p> : null}
        {success ? <p className="text-sm text-green-700 mt-2">{success}</p> : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-sm text-gray-600">Present</h3>
            <Users className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600 mt-2">{presentCount}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-sm text-gray-600">Absent</h3>
            <Users className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600 mt-2">{absentCount}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-sm text-gray-600">Attendance %</h3>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600 mt-2">{attendanceRate}%</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-sm text-gray-600">Students</h3>
            <BarChart3 className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-amber-600 mt-2">{students.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800">Mark Attendance ({selectedDate})</h2>
          </div>
          <div className="p-4 space-y-3 max-h-[460px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading students...
              </div>
            ) : students.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No students found for selected filters.</p>
            ) : (
              students.map((student) => {
                const status = attendanceData[student._id] || STATUS.PRESENT;
                return (
                  <div key={student._id} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">
                          {student.className || '-'} {student.section ? `- ${student.section}` : ''} {student.roll ? `| Roll ${student.roll}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setStudentStatus(student._id, STATUS.PRESENT)}
                          className={`px-3 py-1.5 rounded-md text-sm inline-flex items-center gap-1 ${
                            status === STATUS.PRESENT ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentStatus(student._id, STATUS.ABSENT)}
                          className={`px-3 py-1.5 rounded-md text-sm inline-flex items-center gap-1 ${
                            status === STATUS.ABSENT ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <X className="w-4 h-4" />
                          Absent
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800">Last 7 Days Overview</h2>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2">Student</th>
                  {weekDates.map((day) => (
                    <th key={day} className="text-center py-2">{new Date(day).getDate()}</th>
                  ))}
                  <th className="text-right py-2">Month %</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 10).map((student) => (
                  <tr key={student._id} className="border-t border-gray-100">
                    <td className="py-2">{student.name}</td>
                    {weekDates.map((day) => {
                      const status = student?.attendanceByDate?.[day]?.status || '-';
                      return (
                        <td key={day} className="text-center">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                              status === STATUS.PRESENT
                                ? 'bg-green-100 text-green-700'
                                : status === STATUS.ABSENT
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {status === STATUS.PRESENT ? 'P' : status === STATUS.ABSENT ? 'A' : '-'}
                          </span>
                        </td>
                      );
                    })}
                    <td className="text-right py-2 font-semibold text-blue-700">
                      {student?.monthlySummary?.attendancePercentage || 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 bg-gray-50 font-semibold text-gray-800">Top Attendance</div>
          <div className="p-4 space-y-3">
            {topAttendees.map((student) => (
              <div key={student._id} className="flex justify-between items-center">
                <span className="text-gray-800">{student.name}</span>
                <span className="font-semibold text-green-700">{student?.monthlySummary?.attendancePercentage || 0}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 bg-gray-50 font-semibold text-gray-800">Needs Attention (&lt; 85%)</div>
          <div className="p-4 space-y-3">
            {lowAttendance.length === 0 ? (
              <p className="text-gray-500">All students are above 85% this month.</p>
            ) : (
              lowAttendance.map((student) => (
                <div key={student._id} className="flex justify-between items-center">
                  <span className="text-gray-800">{student.name}</span>
                  <span className="font-semibold text-red-700">{student?.monthlySummary?.attendancePercentage || 0}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
