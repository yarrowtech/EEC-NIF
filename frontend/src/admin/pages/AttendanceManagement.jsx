import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { UserCheck, Search, Calendar, Download, Users, Clock, Check, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const formatStatus = (value) => {
  if (value === 'present') return 'Present';
  if (value === 'absent') return 'Absent';
  return 'Not Marked';
};

const getCheckInTime = (recordDate) => {
  if (!recordDate) return '-';
  const date = new Date(recordDate);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const AttendanceManagement = ({ setShowAdminHeader }) => {
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingStudentId, setSavingStudentId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setShowAdminHeader(false);
  }, [setShowAdminHeader]);

  const loadAttendance = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Login required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({
        date: selectedDate,
        month: selectedMonth,
      });

      const response = await fetch(`${API_BASE}/api/attendance/admin/students?${query.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load attendance');
      }

      const rows = Array.isArray(data?.students)
        ? data.students.map((student) => {
            const status = student?.selectedDateRecord?.status || '';
            return {
              id: student._id,
              name: student.name || 'Student',
              session: student.session || '',
              className: student.className || '',
              section: student.section || '',
              status,
              statusLabel: formatStatus(status),
              checkInTime: getCheckInTime(student?.selectedDateRecord?.date),
            };
          })
        : [];

      setAllRows(rows);
    } catch (err) {
      setError(err.message || 'Unable to load attendance data');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedMonth]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const sessionOptions = useMemo(
    () => [...new Set(allRows.map((item) => item.session).filter(Boolean))],
    [allRows]
  );

  const classOptions = useMemo(() => {
    const source = selectedSession ? allRows.filter((item) => item.session === selectedSession) : allRows;
    return [...new Set(source.map((item) => item.className).filter(Boolean))];
  }, [allRows, selectedSession]);

  const sectionOptions = useMemo(() => {
    const source = allRows.filter(
      (item) => (!selectedSession || item.session === selectedSession) && (!selectedClass || item.className === selectedClass)
    );
    return [...new Set(source.map((item) => item.section).filter(Boolean))];
  }, [allRows, selectedClass, selectedSession]);

  const studentOptions = useMemo(() => {
    const source = allRows.filter(
      (item) =>
        (!selectedSession || item.session === selectedSession) &&
        (!selectedClass || item.className === selectedClass) &&
        (!selectedSection || item.section === selectedSection)
    );
    return source
      .map((item) => ({ id: item.id, name: item.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allRows, selectedClass, selectedSection, selectedSession]);

  const filteredRows = useMemo(
    () =>
      allRows.filter((item) => {
        if (selectedSession && item.session !== selectedSession) return false;
        if (selectedClass && item.className !== selectedClass) return false;
        if (selectedSection && item.section !== selectedSection) return false;
        if (selectedStudent && item.id !== selectedStudent) return false;
        if (searchTerm.trim() && !item.name.toLowerCase().includes(searchTerm.trim().toLowerCase())) return false;
        return true;
      }),
    [allRows, searchTerm, selectedClass, selectedSection, selectedSession, selectedStudent]
  );

  const presentStudents = useMemo(
    () => filteredRows.filter((item) => item.status === 'present').length,
    [filteredRows]
  );

  const upsertAttendance = async (studentId, status) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setSavingStudentId(studentId);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE}/api/attendance/admin/bulk-upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          entries: [{ studentId, status }],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to save attendance');
      }

      setAllRows((prev) =>
        prev.map((item) =>
          item.id === studentId
            ? {
                ...item,
                status,
                statusLabel: formatStatus(status),
                checkInTime: status === 'present' ? getCheckInTime(new Date().toISOString()) : '-',
              }
            : item
        )
      );
      setSuccess('Attendance updated');
    } catch (err) {
      setError(err.message || 'Could not update attendance');
    } finally {
      setSavingStudentId('');
    }
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const currentDate = new Date().toLocaleDateString();

    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text('Student Attendance Report', pageWidth / 2, 30, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, 45, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    const startY = 70;
    const rowHeight = 12;

    pdf.text('Student Name', 14, startY);
    pdf.text('Session', 52, startY);
    pdf.text('Class', 80, startY);
    pdf.text('Section', 102, startY);
    pdf.text('Status', 126, startY);
    pdf.text('In Time', 153, startY);

    pdf.line(12, startY + 4, pageWidth - 12, startY + 4);

    pdf.setFont(undefined, 'normal');
    filteredRows.forEach((student, index) => {
      const y = startY + rowHeight + index * rowHeight;
      pdf.text(student.name, 14, y);
      pdf.text(student.session || '-', 52, y);
      pdf.text(student.className || '-', 80, y);
      pdf.text(student.section || '-', 102, y);
      pdf.text(student.statusLabel, 126, y);
      pdf.text(student.checkInTime, 153, y);
    });

    const summaryY = startY + rowHeight + filteredRows.length * rowHeight + 15;
    pdf.setFont(undefined, 'bold');
    pdf.text('Summary', 14, summaryY);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Total Students: ${filteredRows.length}`, 14, summaryY + 12);
    pdf.text(`Present Today: ${presentStudents}`, 14, summaryY + 22);
    pdf.text(`Absent Today: ${filteredRows.length - presentStudents}`, 14, summaryY + 32);

    pdf.save(`attendance-report-${currentDate.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Student Attendance</h1>
            <p className="text-yellow-100">Session, class, section and student from database</p>
          </div>
          <UserCheck className="w-12 h-12 text-yellow-200" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
          <div className="relative xl:col-span-2">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedSession}
            onChange={(e) => {
              setSelectedSession(e.target.value);
              setSelectedClass('');
              setSelectedSection('');
              setSelectedStudent('');
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="">Session</option>
            {sessionOptions.map((session) => (
              <option key={session} value={session}>{session}</option>
            ))}
          </select>

          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSection('');
              setSelectedStudent('');
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="">Class</option>
            {classOptions.map((className) => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>

          <select
            value={selectedSection}
            onChange={(e) => {
              setSelectedSection(e.target.value);
              setSelectedStudent('');
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="">Section</option>
            {sectionOptions.map((section) => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>

          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="">Student</option>
            {studentOptions.map((student) => (
              <option key={student.id} value={student.id}>{student.name}</option>
            ))}
          </select>

          <div className="md:col-span-2 xl:col-span-6 flex flex-wrap items-center justify-between gap-3 mt-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={exportToPDF}
              className="flex items-center space-x-2 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
        {error ? <p className="text-sm text-red-600 mt-3">{error}</p> : null}
        {success ? <p className="text-sm text-green-700 mt-3">{success}</p> : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">{filteredRows.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Present</p>
          <p className="text-2xl font-bold text-green-600">{presentStudents}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Absent/Unmarked</p>
          <p className="text-2xl font-bold text-red-600">{filteredRows.length - presentStudents}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 border border-gray-200">Student</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 border border-gray-200">Session</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 border border-gray-200">Class</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 border border-gray-200">Section</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 border border-gray-200">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 border border-gray-200">Check-in</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 border border-gray-200">Tick</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 border border-gray-200">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading attendance...
                    </span>
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 border border-gray-200">
                    No students found for selected filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((student) => (
                  <tr key={student.id} className="hover:bg-yellow-50">
                    <td className="px-4 py-3 border border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Users className="h-4 w-4 text-yellow-700" />
                        </div>
                        <span className="font-medium text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border border-gray-200">{student.session || '-'}</td>
                    <td className="px-4 py-3 border border-gray-200">{student.className || '-'}</td>
                    <td className="px-4 py-3 border border-gray-200">{student.section || '-'}</td>
                    <td className="px-4 py-3 border border-gray-200">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          student.status === 'present'
                            ? 'bg-green-100 text-green-700'
                            : student.status === 'absent'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {student.statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 border border-gray-200">
                      <div className="flex items-center gap-1 text-gray-700">
                        <Clock className="w-4 h-4" />
                        <span>{student.checkInTime}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border border-gray-200 text-right">
                      <button
                        type="button"
                        onClick={() => upsertAttendance(student.id, 'present')}
                        disabled={savingStudentId === student.id}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-60"
                        title="Mark present"
                      >
                        {savingStudentId === student.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
