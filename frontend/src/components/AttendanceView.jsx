import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle2, XCircle, TrendingUp, Loader2, Clock, ChevronLeft, ChevronRight, Target } from 'lucide-react';

const STATUS_COLORS = {
  present: 'bg-emerald-500',
  absent: 'bg-rose-500',
};

const normalizeStatus = (value) => {
  const text = String(value || '').toLowerCase();
  return text === 'absent' ? 'absent' : 'present';
};

const AttendanceView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [attendanceStats, setAttendanceStats] = useState({
    totalClasses: 0,
    attended: 0,
    absent: 0,
    percentage: 0,
  });
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        if (!token || userType !== 'Student') {
          throw new Error('Student session not found. Please login again.');
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/student/auth/attendance`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to fetch attendance');
        }

        const summary = data?.summary || {};
        const normalizedRecords = Array.isArray(data?.attendance)
          ? data.attendance.map((record) => ({
              id: record._id || `${record.date}-${record.subject}`,
              date: new Date(record.date).toISOString().slice(0, 10),
              subject: record.subject || 'General',
              status: normalizeStatus(record.status),
            }))
          : [];

        setAttendanceStats({
          totalClasses: summary.totalClasses || normalizedRecords.length || 0,
          attended: summary.presentDays || normalizedRecords.filter((r) => r.status === 'present').length || 0,
          absent: summary.absentDays || normalizedRecords.filter((r) => r.status === 'absent').length || 0,
          percentage: summary.attendancePercentage || 0,
        });
        setAttendanceRecords(normalizedRecords);
      } catch (err) {
        setError(err.message || 'Unable to fetch attendance');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const recordsByDate = useMemo(() => {
    const map = {};
    attendanceRecords.forEach((record) => {
      if (!map[record.date]) map[record.date] = [];
      map[record.date].push(record);
    });
    return map;
  }, [attendanceRecords]);

  const navigateMonth = (direction) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + direction);
    setCurrentDate(next);
  };

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const start = new Date(firstDay);
    start.setDate(start.getDate() - firstDay.getDay());

    const days = [];
    const cursor = new Date(start);
    for (let i = 0; i < 42; i += 1) {
      const key = cursor.toISOString().slice(0, 10);
      const dayRecords = recordsByDate[key] || [];
      const hasAbsent = dayRecords.some((entry) => entry.status === 'absent');
      const hasPresent = dayRecords.some((entry) => entry.status === 'present');
      days.push({
        key,
        date: new Date(cursor),
        isCurrentMonth: cursor.getMonth() === month,
        status: hasAbsent ? 'absent' : hasPresent ? 'present' : null,
        count: dayRecords.length,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }, [currentDate, recordsByDate]);

  const monthlyRecords = useMemo(() => {
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    return attendanceRecords.filter((item) => item.date.startsWith(monthKey));
  }, [attendanceRecords, currentDate]);

  const monthlyPresent = monthlyRecords.filter((item) => item.status === 'present').length;
  const monthlyAbsent = monthlyRecords.filter((item) => item.status === 'absent').length;
  const monthlyPercentage = monthlyRecords.length ? Math.round((monthlyPresent / monthlyRecords.length) * 100) : 0;

  const filteredRecentRecords = useMemo(() => {
    if (filter === 'all') return attendanceRecords;
    return attendanceRecords.filter((item) => item.status === filter);
  }, [attendanceRecords, filter]);

  const selectedDateRecords = selectedDate ? recordsByDate[selectedDate] || [] : [];

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Attendance</h1>
              <p className="mt-1 text-sm text-slate-500">Track daily attendance, monthly trend and recent records.</p>
            </div>
            <div className={`rounded-full px-3 py-1 text-xs font-semibold ${
              attendanceStats.percentage >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {attendanceStats.percentage >= 75 ? 'On Track' : 'Needs Attention'}
            </div>
          </div>
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Total Classes</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{attendanceStats.totalClasses}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Present</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{attendanceStats.attended}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Absent</p>
            <p className="mt-1 text-2xl font-bold text-rose-600">{attendanceStats.absent}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Overall Percentage</p>
            <p className="mt-1 text-2xl font-bold text-indigo-600">{attendanceStats.percentage}%</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <button onClick={() => navigateMonth(-1)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Previous month">
              <ChevronLeft className="h-4 w-4 text-slate-700" />
            </button>
            <h2 className="font-semibold text-slate-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={() => navigateMonth(1)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Next month">
              <ChevronRight className="h-4 w-4 text-slate-700" />
            </button>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="py-10 text-center text-slate-500">
                <Loader2 className="mr-2 inline h-5 w-5 animate-spin" />
                Loading attendance...
              </div>
            ) : (
              <>
                <div className="mb-2 grid grid-cols-7 gap-1">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="py-1 text-center text-xs font-semibold text-slate-500">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day) => (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => day.count && setSelectedDate(day.key)}
                      className={`relative aspect-square rounded-lg border p-1 text-left transition ${
                        selectedDate === day.key ? 'border-indigo-500 ring-2 ring-indigo-100' : ''
                      } ${
                        day.isCurrentMonth ? 'border-slate-200 text-slate-900 hover:bg-slate-50' : 'border-slate-100 text-slate-300'
                      }`}
                    >
                      <span className="text-[11px] font-medium">{day.date.getDate()}</span>
                      {day.status ? (
                        <span className={`absolute bottom-1 right-1 h-2 w-2 rounded-full ${STATUS_COLORS[day.status]}`} />
                      ) : null}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Present</div>
                  <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Absent</div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">This Month Classes</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{monthlyRecords.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">This Month Present</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{monthlyPresent}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">This Month Attendance</p>
            <p className="mt-1 text-2xl font-bold text-indigo-600">{monthlyPercentage}%</p>
          </div>
        </div>

        {selectedDateRecords.length > 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </h3>
            <div className="space-y-2">
              {selectedDateRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <p className="text-sm font-medium text-slate-800">{record.subject}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    record.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {record.status === 'present' ? 'Present' : 'Absent'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-600" />
              Recent Attendance
            </h2>
            <div className="flex rounded-lg border border-slate-200 p-1 text-xs">
              {['all', 'present', 'absent'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-md px-2 py-1 font-semibold ${
                    filter === value ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {value === 'all' ? 'All' : value === 'present' ? 'Present' : 'Absent'}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredRecentRecords.slice(0, 14).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-slate-900">{record.subject}</p>
                  <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(record.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {record.status === 'present' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> Present
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
                    <XCircle className="h-3 w-3" /> Absent
                  </span>
                )}
              </div>
            ))}
            {!filteredRecentRecords.length && !loading ? (
              <p className="p-4 text-sm text-slate-500">No attendance records found.</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600 flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-600" />
            Aim to maintain 75%+ attendance. If any entry looks incorrect, contact your class teacher.
          </p>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
            Attendance is read-only in student portal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceView;
