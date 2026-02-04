import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle, XCircle, TrendingUp, Loader2, Clock } from 'lucide-react';

const AttendanceView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
          setLoading(false);
          return;
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
        setAttendanceStats({
          totalClasses: summary.totalClasses || 0,
          attended: summary.presentDays || 0,
          absent: summary.absentDays || 0,
          percentage: summary.attendancePercentage || 0,
        });

        const records = Array.isArray(data?.attendance)
          ? data.attendance.map((record) => ({
            id: record._id,
            date: new Date(record.date).toISOString().slice(0, 10),
            subject: record.subject || 'General',
            status: record.status || 'present',
          }))
          : [];
        setAttendanceRecords(records);
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
      const dayRecord = attendanceRecords.find((r) => r.date === key) || null;
      days.push({
        key,
        date: new Date(cursor),
        isCurrentMonth: cursor.getMonth() === month,
        status: dayRecord?.status || null,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }, [currentDate, attendanceRecords]);

  const monthlyRecords = useMemo(() => {
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    return attendanceRecords.filter((item) => item.date.startsWith(monthKey));
  }, [attendanceRecords, currentDate]);

  const monthlyPresent = monthlyRecords.filter((item) => item.status === 'present').length;
  const monthlyAbsent = monthlyRecords.filter((item) => item.status === 'absent').length;
  const monthlyPercentage = monthlyRecords.length ? Math.round((monthlyPresent / monthlyRecords.length) * 100) : 0;

  return (
    <div className="space-y-5 p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600 text-sm">Read-only attendance report for your account</p>
        {error ? <p className="text-red-600 text-sm mt-2">{error}</p> : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-600">Total Classes</p>
          <p className="text-2xl font-bold text-gray-900">{attendanceStats.totalClasses}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-600">Present</p>
          <p className="text-2xl font-bold text-green-600">{attendanceStats.attended}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-600">Absent</p>
          <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-600">Overall %</p>
          <p className="text-2xl font-bold text-blue-600">{attendanceStats.percentage}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <button onClick={() => navigateMonth(-1)} className="px-3 py-1 rounded-md hover:bg-gray-100">{'<'}</button>
          <h2 className="font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={() => navigateMonth(1)} className="px-3 py-1 rounded-md hover:bg-gray-100">{'>'}</button>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="py-8 text-center text-gray-500">
              <Loader2 className="w-5 h-5 inline mr-2 animate-spin" /> Loading...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => (
                  <div
                    key={day.key}
                    className={`aspect-square p-1 rounded-lg border text-xs ${
                      day.isCurrentMonth ? 'border-gray-200 text-gray-900' : 'border-gray-100 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{day.date.getDate()}</span>
                      {day.status === 'present' ? <CheckCircle className="w-3 h-3 text-green-600" /> : null}
                      {day.status === 'absent' ? <XCircle className="w-3 h-3 text-red-600" /> : null}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-600">This Month Classes</p>
          <p className="text-2xl font-bold text-gray-900">{monthlyRecords.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-600">This Month Present</p>
          <p className="text-2xl font-bold text-green-600">{monthlyPresent}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <p className="text-sm text-gray-600">This Month %</p>
          <p className="text-2xl font-bold text-indigo-600">{monthlyPercentage}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Recent Attendance
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {attendanceRecords.slice(0, 10).map((record) => (
            <div key={record.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{record.subject}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(record.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {record.status === 'present' ? 'Present' : 'Absent'}
              </span>
            </div>
          ))}
          {!attendanceRecords.length && !loading ? (
            <p className="p-4 text-gray-500">No attendance records found.</p>
          ) : null}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          Attendance is view-only for students. Contact teacher for corrections.
        </p>
      </div>
    </div>
  );
};

export default AttendanceView;
