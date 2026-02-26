import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Search,
  Users,
  TrendingUp,
  BarChart3,
  Save,
  Loader2,
  Download,
} from 'lucide-react';
import jsPDF from 'jspdf';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const STATUS = Object.freeze({
  PRESENT: 'present',
  ABSENT: 'absent',
});

const parseRollForSort = (roll) => {
  if (roll === null || roll === undefined) return Number.POSITIVE_INFINITY;
  const text = String(roll).trim();
  if (!text) return Number.POSITIVE_INFINITY;
  const direct = Number(text);
  if (Number.isFinite(direct)) return direct;
  const match = text.match(/\d+/);
  return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
};

const AttendanceManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [subject, setSubject] = useState('');
  const [isSubstituteMode, setIsSubstituteMode] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [students, setStudents] = useState([]);
  const [sessionOptions, setSessionOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [lessonPlanContext, setLessonPlanContext] = useState(null);

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
      if (subject.trim()) query.set('subject', subject.trim());
      if (isSubstituteMode) query.set('substitute', 'true');
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
      const sortedStudents = [...nextStudents].sort((a, b) => {
        const rollA = parseRollForSort(a?.roll);
        const rollB = parseRollForSort(b?.roll);
        if (rollA !== rollB) return rollA - rollB;
        return String(a?.name || '').localeCompare(String(b?.name || ''), undefined, { numeric: true });
      });
      setStudents(sortedStudents);
      setSessionOptions(Array.isArray(data?.options?.sessions) ? data.options.sessions : []);
      setClassOptions(Array.isArray(data?.options?.classes) ? data.options.classes : []);
      setSectionOptions(Array.isArray(data?.options?.sections) ? data.options.sections : []);
      setSubjectOptions(Array.isArray(data?.options?.subjects) ? data.options.subjects : []);
      setLessonPlanContext(data?.lessonPlanContext || null);

      const nextState = {};
      sortedStudents.forEach((student) => {
        nextState[student._id] = student?.selectedDateRecord?.status || STATUS.ABSENT;
      });
      setAttendanceData(nextState);
    } catch (err) {
      setError(err.message || 'Unable to load attendance data');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedDate, selectedSession, selectedClass, selectedSection, subject, isSubstituteMode, searchTerm]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  useEffect(() => {
    if (subject && !subjectOptions.includes(subject)) {
      setSubject('');
    }
  }, [subject, subjectOptions]);

  const toggleStudentPresent = (studentId, checked) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: checked ? STATUS.PRESENT : STATUS.ABSENT,
    }));
  };

  const saveAttendance = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (isSubstituteMode && (!selectedSession || !selectedClass || !selectedSection)) {
      setError('For substitute attendance, please select session, class and section first.');
      setSuccess('');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        date: selectedDate,
        subject: subject.trim(),
        substitute: isSubstituteMode,
        session: selectedSession,
        className: selectedClass,
        section: selectedSection,
        entries: students.map((student) => ({
          studentId: student._id,
          status: attendanceData[student._id] || STATUS.ABSENT,
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

      const matched = Number(data?.lessonPlansMatched || 0);
      const completed = Number(data?.lessonPlansCompleted || 0);
      const outcome = matched > 0
        ? `${completed} lesson plan${completed !== 1 ? 's' : ''} auto-marked completed`
        : 'No lesson plan matched for auto-completion';
      const substituteNote = isSubstituteMode ? ' Saved as substitute attendance (subject shown as General for students).' : '';
      setSuccess(`Saved (${data.created || 0} new, ${data.updated || 0} updated). ${outcome}.${substituteNote}`);
      await loadAttendance();
    } catch (err) {
      setError(err.message || 'Could not save attendance');
    } finally {
      setSaving(false);
    }
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const currentDate = new Date().toLocaleDateString();

    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.text('Attendance Report', pageWidth / 2, 20, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Date: ${selectedDate}`, 14, 30);

    let y = 40;
    pdf.setFont(undefined, 'bold');
    pdf.text('Name', 14, y);
    pdf.text('Class', 74, y);
    pdf.text('Section', 104, y);
    pdf.text('Status', 134, y);

    pdf.setFont(undefined, 'normal');
    y += 8;
    students.forEach((student) => {
      pdf.text(String(student.name || ''), 14, y);
      pdf.text(String(student.className || student.grade || ''), 74, y);
      pdf.text(String(student.section || ''), 104, y);
      pdf.text(String(attendanceData[student._id] || STATUS.ABSENT).toUpperCase(), 134, y);
      y += 7;
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }
    });

    pdf.save(`attendance-${selectedDate}.pdf`);
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

  const inputClass = 'w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors';

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Filters */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
          <div className="relative sm:col-span-2 xl:col-span-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
            />
          </div>
          <select
            value={selectedSession}
            onChange={(e) => { setSelectedSession(e.target.value); setSelectedClass(''); setSelectedSection(''); }}
            className={inputClass}
          >
            <option value="">All Sessions</option>
            {sessionOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={selectedClass}
            onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(''); }}
            className={inputClass}
          >
            <option value="">All Classes</option>
            {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className={inputClass}
          >
            <option value="">All Sections</option>
            {sectionOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2 px-0.5">
          <input
            id="substitute-mode"
            type="checkbox"
            checked={isSubstituteMode}
            onChange={(e) => setIsSubstituteMode(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="substitute-mode" className="text-xs font-medium text-gray-700">
            Mark as Substitute Attendance
          </label>
          {isSubstituteMode && (
            <span className="text-[11px] text-indigo-600">
              Use session, class and section filters. Students will see subject as General.
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
            />
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
          />
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 min-w-[140px] px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
          >
            <option value="">All Subjects</option>
            {subjectOptions.map((subj) => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={exportToPDF}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Download size={14} />
              Export
            </button>
            <button
              type="button"
              onClick={saveAttendance}
              disabled={saving || loading || students.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-linear-to-r from-indigo-600 to-violet-600 rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-xs text-emerald-600 font-medium">{success}</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Present', value: presentCount, icon: Users, gradient: 'from-emerald-500 to-green-500' },
          { label: 'Absent', value: absentCount, icon: Users, gradient: 'from-red-500 to-rose-500' },
          { label: 'Attendance', value: `${attendanceRate}%`, icon: TrendingUp, gradient: 'from-blue-500 to-indigo-500' },
          { label: 'Students', value: students.length, icon: BarChart3, gradient: 'from-amber-500 to-orange-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!isSubstituteMode && selectedClass && selectedSection && subject.trim()) && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-5 py-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Lesson Plan for selected date</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {selectedDate} · {selectedClass} · {selectedSection} · {subject.trim()}
            </p>
          </div>
          <div className="p-4 sm:p-5">
            {!lessonPlanContext || !Array.isArray(lessonPlanContext.plans) || lessonPlanContext.plans.length === 0 ? (
              <p className="text-xs text-gray-500">No lesson plan found for this date/subject.</p>
            ) : (
              <div className="space-y-2.5">
                {lessonPlanContext.plans.map((plan) => (
                  <div key={plan.id} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{plan.title || 'Untitled Lesson Plan'}</p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {(plan.date || selectedDate || '').toString().slice(0, 10)} · {plan.subject || subject.trim()}
                      </p>
                    </div>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      plan.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : plan.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {plan.status === 'completed' ? 'Completed' : plan.status === 'in_progress' ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Mark Attendance</h2>
          <span className="text-[11px] text-gray-400 font-medium">{selectedDate}</span>
        </div>
        <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-14">
              <Loader2 size={24} className="animate-spin text-indigo-500 mb-3" />
              <p className="text-sm text-gray-500">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                <Users size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">No students found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            students.map((student, index) => {
              const status = attendanceData[student._id] || STATUS.ABSENT;
              const isPresent = status === STATUS.PRESENT;
              return (
                <div
                  key={student._id}
                  className={`flex items-center justify-between gap-3 px-4 sm:px-5 py-3 transition-colors ${
                    isPresent ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isPresent
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {student.roll || (index + 1)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{student.name}</p>
                      <p className="text-[11px] text-gray-400">
                        {student.className || '-'}{student.section ? ` · ${student.section}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="checkbox"
                      checked={isPresent}
                      onChange={(e) => toggleStudentPresent(student._id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className={`text-[11px] font-semibold ${isPresent ? 'text-emerald-700' : 'text-red-600'}`}>
                      {isPresent ? 'Present' : 'Absent'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
