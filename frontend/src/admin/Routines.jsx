import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import {
  Plus, Edit2, Trash2, Clock, Calendar, ChevronLeft, ChevronRight,
  Grid, Loader2, AlertCircle, Sparkles, Download, BookOpen,
  Users, CheckCircle2, XCircle, X, Save, Copy, RotateCcw,
  ChevronDown, Layers, ArrowRight
} from 'lucide-react';
import {
  timetableApi, academicApi, transformTimetablesToRoutines,
  convertTo24Hour, convertTo12Hour
} from './utils/timetableApi';

/* ─────────────────────── constants ─────────────────────── */
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat' };

const TIMES = [
  '8:00 AM - 8:45 AM',
  '8:45 AM - 9:30 AM',
  '9:30 AM - 10:15 AM',
  '10:15 AM - 10:45 AM',
  '10:45 AM - 11:30 AM',
  '11:30 AM - 12:15 PM',
];
const DEFAULT_BREAK_TIMES = ['10:15 AM - 10:45 AM'];
const DEFAULT_START_TIME = '08:00';
const DEFAULT_PERIOD_MINUTES = 45;

const ROUTINE_TEMPLATES = [
  { id: 'balanced', name: 'Balanced', pattern: ['Mathematics', 'English', 'Science', 'Social Science', 'Computer', 'Hindi'] },
  { id: 'stem',     name: 'STEM',     pattern: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer', 'Mathematics'] },
  { id: 'revision', name: 'Revision', pattern: ['English', 'Mathematics', 'Science', 'Social Science', 'Computer', 'English'] },
];

const TEACHERS = {
  Mathematics: 'Dr. Rakesh Sharma', Physics: 'Prof. Priya Verma', Chemistry: 'Mr. Arjun Singh',
  Biology: 'Dr. Kavita Rao', English: 'Ms. Anjali Mehra', 'Social Science': 'Mr. Suresh Patel',
  Science: 'Dr. Kavita Rao', Hindi: 'Mr. Rohan Gupta', Computer: 'Ms. Nidhi Kapoor',
};

/* ─────────────────────── helpers ─────────────────────── */
const getId = (v) => (v && typeof v === 'object' ? v._id : v);

const addMinutesToTime = (time24, minutes) => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return '';
  const t = ((h * 60 + m + minutes) % 1440 + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

const parseTimeRange = (range) => {
  if (!range || typeof range !== 'string') return { start: '', end: '' };
  const [s, e] = range.split('-').map(p => p.trim());
  return { start: s ? convertTo24Hour(s) : '', end: e ? convertTo24Hour(e) : '' };
};

const formatTimeRange = (s24, e24) => (!s24 || !e24) ? '' : `${convertTo12Hour(s24)} - ${convertTo12Hour(e24)}`;

const isBreakSlot = (time) => DEFAULT_BREAK_TIMES.includes(time);

const normalizeDayLabel = (v = '') => {
  const raw = String(v).trim().toLowerCase();
  const map = { mon:'Monday',monday:'Monday',tue:'Tuesday',tues:'Tuesday',tuesday:'Tuesday',wed:'Wednesday',wednesday:'Wednesday',thu:'Thursday',thur:'Thursday',thurs:'Thursday',thursday:'Thursday',fri:'Friday',friday:'Friday',sat:'Saturday',saturday:'Saturday',sun:'Sunday',sunday:'Sunday' };
  return map[raw] || String(v).trim();
};

const getDefaultSlots = () =>
  TIMES.map(time => {
    const p = parseTimeRange(time);
    return { time, startTime: p.start, endTime: p.end, isBreak: DEFAULT_BREAK_TIMES.includes(time), subject: DEFAULT_BREAK_TIMES.includes(time) ? 'Break' : '', teacher: DEFAULT_BREAK_TIMES.includes(time) ? '-' : '', subjectId: null, teacherId: null, roomId: null, room: '' };
  });

const buildScheduleForDay = (existing = []) => {
  if (Array.isArray(existing) && existing.length > 0) {
    const norm = existing.map(e => {
      const p = parseTimeRange(e.time); const isBreak = e.subject === 'Break' || e.isBreak;
      const st = e.startTime || p.start || ''; const et = e.endTime || p.end || '';
      return { time: e.time || formatTimeRange(st, et), startTime: st, endTime: et, isBreak, subject: isBreak ? 'Break' : (e.subject||''), teacher: isBreak ? '-' : (e.teacher||''), subjectId: e.subjectId||null, teacherId: e.teacherId||null, roomId: e.roomId||null, room: e.room||'' };
    });
    const byKey = new Map(norm.map(e => [`${e.startTime}-${e.endTime}`, e]));
    const missing = getDefaultSlots().filter(s => s.isBreak && !byKey.has(`${s.startTime}-${s.endTime}`));
    return [...norm, ...missing].sort((a,b) => (a.startTime||'').localeCompare(b.startTime||''));
  }
  return getDefaultSlots();
};

const pruneEmptySlots = (schedule = []) =>
  schedule.filter(s => s?.isBreak || (String(s?.subject||'').trim() && String(s?.teacher||'').trim()));

/* ─────────────────────── sub-components ─────────────────────── */

const Toast = ({ show, message, type }) => {
  if (!show) return null;
  return (
    <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-medium transition-all ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      {message}
    </div>
  );
};

const DayCard = ({ day, routine, onEdit, isSelected, onClick }) => {
  const periods = routine?.schedule?.filter(s => !s.isBreak && s.subject) || [];
  const hasData = periods.length > 0;
  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl border-2 cursor-pointer transition-all duration-200 overflow-hidden group ${isSelected ? 'border-indigo-500 shadow-lg shadow-indigo-100' : 'border-gray-100 hover:border-indigo-200 hover:shadow-md'} bg-white`}
    >
      {/* color strip */}
      <div className={`h-1.5 w-full ${hasData ? 'bg-gradient-to-r from-indigo-400 to-violet-400' : 'bg-gray-100'}`} />

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-bold text-gray-900 text-sm">{day}</p>
            <p className="text-xs text-gray-400">{periods.length} period{periods.length !== 1 ? 's' : ''}</p>
          </div>
          {hasData && (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50">
              <CheckCircle2 size={14} className="text-indigo-500" />
            </span>
          )}
        </div>

        {hasData ? (
          <div className="space-y-1 mb-3">
            {periods.slice(0, 3).map((p, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-300 shrink-0" />
                <span className="truncate text-gray-600">{p.subject}</span>
              </div>
            ))}
            {periods.length > 3 && <p className="text-xs text-gray-400 pl-3">+{periods.length - 3} more</p>}
          </div>
        ) : (
          <p className="text-xs text-gray-400 mb-3 italic">No schedule yet</p>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className={`w-full py-1.5 rounded-xl text-xs font-semibold transition-colors ${hasData ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
        >
          {hasData ? '✎ Edit' : '+ Add'}
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────── main component ─────────────────────── */
const Routines = ({ setShowAdminHeader }) => {
  /* data */
  const [routines, setRoutines]   = useState([]);
  const [years, setYears]         = useState([]);
  const [classes, setClasses]     = useState([]);
  const [sections, setSections]   = useState([]);
  const [subjects, setSubjects]   = useState([]);
  const [teachers, setTeachers]   = useState([]);
  const [floors, setFloors]       = useState([]);
  const [rooms, setRooms]         = useState([]);

  /* ui */
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [saving, setSaving]       = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState('');
  const [toast, setToast]         = useState({ show: false, message: '', type: 'success' });

  /* filters */
  const [selectedYearId, setSelectedYearId]   = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedDay, setSelectedDay]         = useState('Monday');

  /* modal */
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [form, setForm]                     = useState({ class: '', section: '', day: 'Monday', schedule: [] });
  const [formYearId, setFormYearId]         = useState('');
  const [showAdvanced, setShowAdvanced]     = useState(false);
  const [selectedCopyRoutine, setSelectedCopyRoutine] = useState('');

  /* conflicts */
  const [conflicts, setConflicts]               = useState([]);
  const [showConflictModal, setShowConflictModal] = useState(false);

  /* ── toast ── */
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 3500);
  };

  /* ── load ── */
  const loadInitialData = async () => {
    try {
      setLoading(true); setError(null);
      const [ttData, yrData, clsData, secData, subData, tchData, flData, rmData] = await Promise.allSettled([
        timetableApi.getAll(), academicApi.getYears(), academicApi.getClasses(), academicApi.getSections(),
        academicApi.getSubjects(), academicApi.getTeachers(), academicApi.getFloors(), academicApi.getRooms(),
      ]);
      const safe = (r, fallback = []) => r.status === 'fulfilled' ? (Array.isArray(r.value) ? r.value : fallback) : fallback;
      const yearItems = safe(yrData);
      setRoutines(transformTimetablesToRoutines(safe(ttData)));
      setYears(yearItems);
      setClasses(safe(clsData)); setSections(safe(secData)); setSubjects(safe(subData));
      setTeachers(safe(tchData)); setFloors(safe(flData)); setRooms(safe(rmData));
      const activeYear = yearItems.find((y) => y?.isActive);
      if (activeYear?._id) {
        setSelectedYearId(String(activeYear._id));
      } else if (yearItems[0]?._id) {
        setSelectedYearId(String(yearItems[0]._id));
      }
    } catch (err) { setError(err.message || 'Failed to load'); showToast(err.message || 'Failed to load', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { setShowAdminHeader?.(false); }, []);
  useEffect(() => { loadInitialData(); }, []);
  useEffect(() => { if (!isModalOpen) { setSelectedCopyRoutine(''); setShowAdvanced(false); } }, [isModalOpen]);
  useEffect(() => {
    if (!isModalOpen) return;
    if (formYearId) return;
    if (selectedYearId) setFormYearId(selectedYearId);
  }, [isModalOpen, formYearId, selectedYearId]);

  /* ── derived ── */
  const selectedClassDoc = useMemo(
    () =>
      classes.find(
        (c) =>
          String(c.name) === String(form.class) &&
          (!formYearId || String(c.academicYearId || '') === String(formYearId))
      ) || null,
    [classes, form.class, formYearId]
  );

  const classFilteredSubjects = useMemo(() =>
    selectedClassDoc?._id ? subjects.filter(s => String(s.classId) === String(selectedClassDoc._id)) : subjects,
    [subjects, selectedClassDoc]
  );

  const modalClasses = useMemo(() => {
    if (!formYearId) return [];
    return classes.filter((c) => String(c.academicYearId || '') === String(formYearId));
  }, [classes, formYearId]);

  const modalSections = useMemo(() => {
    const clsDoc =
      classes.find(
        (c) =>
          String(c.name) === String(form.class) &&
          (!formYearId || String(c.academicYearId || '') === String(formYearId))
      ) || null;
    if (!clsDoc) return [];
    return sections.filter((s) => String(getId(s.classId) || '') === String(clsDoc._id));
  }, [classes, form.class, formYearId, sections]);

  const roomsById = useMemo(() => { const m = new Map(); rooms.forEach(r => r?._id && m.set(String(r._id), r)); return m; }, [rooms]);

  const roomOptions = useMemo(() =>
    rooms.map(r => ({
      id: r._id,
      label: `${r.floorId?.buildingId?.name || 'Bldg'} / ${r.floorId?.name || 'Floor'} (${r.floorId?.floorCode || '-'}) / ${r.roomNumber}`,
      roomNumber: r.roomNumber || '',
    })).sort((a, b) => a.label.localeCompare(b.label)),
    [rooms]
  );

  const copyableRoutines = useMemo(() =>
    routines.map(r => ({ id: String(r.id), label: `Class ${r.class}-${r.section} • ${normalizeDayLabel(r.day)}` })),
    [routines]
  );

  const filteredClasses = useMemo(() => {
    if (!selectedYearId) return [];
    return classes.filter((c) => String(c.academicYearId || '') === String(selectedYearId));
  }, [classes, selectedYearId]);

  const activeYears = useMemo(
    () => years.filter((year) => year?.isActive),
    [years]
  );

  useEffect(() => {
    if (!activeYears.length) return;
    const hasSelected = activeYears.some((year) => String(year._id) === String(selectedYearId));
    if (!hasSelected) {
      setSelectedYearId(String(activeYears[0]._id));
      setSelectedClassId('');
      setSelectedSectionId('');
    }
  }, [activeYears, selectedYearId]);

  const filteredSections = useMemo(() => {
    if (!selectedClassId) return [];
    return sections.filter((s) => String(getId(s.classId) || '') === String(selectedClassId));
  }, [sections, selectedClassId]);

  const selectedClassDocByFilter = useMemo(
    () => classes.find((c) => String(c._id) === String(selectedClassId)) || null,
    [classes, selectedClassId]
  );
  const selectedSectionDocByFilter = useMemo(
    () => sections.find((s) => String(s._id) === String(selectedSectionId)) || null,
    [sections, selectedSectionId]
  );
  const selectedClassName = selectedClassDocByFilter?.name || '';
  const selectedSectionName = selectedSectionDocByFilter?.name || '';

  const getRoutineForDay = (day, classId = selectedClassId, sectionId = selectedSectionId) =>
    routines.find(
      (r) =>
        String(r.classId || '') === String(classId || '') &&
        String(r.sectionId || '') === String(sectionId || '') &&
        normalizeDayLabel(r.day) === normalizeDayLabel(day)
    );

  /* ── auto generate ── */
  const handleAutoGenerate = async () => {
    const confirm = await Swal.fire({
      icon: 'question',
      title: 'Generate routines?',
      text: 'This will overwrite existing timetables.',
      showCancelButton: true,
      confirmButtonText: 'Yes, Generate',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
    });
    if (!confirm.isConfirmed) return;
    try {
      setGenerating(true);
      const result = await timetableApi.autoGenerate({ overwriteExisting: true });
      const total = result?.totalGenerated || 0;
      const msg = `Generated ${total} timetable${total !== 1 ? 's' : ''}.`;
      setGenerateMessage(msg); showToast(msg);
      await loadInitialData();
    } catch (err) { showToast(err.message || 'Auto-generation failed.', 'error'); }
    finally { setGenerating(false); }
  };

  /* ── open editor ── */
  const openRoutineEditor = ({ day = 'Monday', className, sectionName } = {}) => {
    const clsDoc =
      classes.find((c) => String(c._id) === String(selectedClassId || '')) ||
      classes.find((c) => c.name === className) ||
      filteredClasses[0] ||
      classes[0] ||
      null;
    const cls = className || clsDoc?.name || '';
    const avail = sections.filter(s => !clsDoc || getId(s.classId) === clsDoc._id);
    const secDoc =
      sections.find((s) => String(s._id) === String(selectedSectionId || '')) ||
      avail.find((s) => s.name === sectionName) ||
      avail[0] ||
      null;
    const sec = sectionName || secDoc?.name || '';
    const nextYearId = String(clsDoc?.academicYearId || selectedYearId || '');
    const existing = routines.find(
      (r) =>
        String(r.classId || '') === String(clsDoc?._id || '') &&
        String(r.sectionId || '') === String(secDoc?._id || '') &&
        normalizeDayLabel(r.day) === normalizeDayLabel(day)
    );
    setFormYearId(nextYearId);
    setForm({ class: cls, section: sec, day, schedule: buildScheduleForDay(existing?.schedule || []) });
    setEditingRoutine(existing || null);
    setIsModalOpen(true);
  };

  /* ── helpers inside form ── */
  const getClassDoc = () =>
    classes.find(
      (c) =>
        c.name === form.class &&
        (!formYearId || String(c.academicYearId || '') === String(formYearId))
    );
  const getSectionDoc = (cd) => sections.find(s => s.name === form.section && getId(s.classId) === cd?._id);

  const updateRowTimeField = (idx, field, value) => {
    setForm(prev => {
      const schedule = [...prev.schedule];
      const cur = schedule[idx]; if (!cur) return prev;
      const p = parseTimeRange(cur.time);
      const ns = field === 'start' ? value : (cur.startTime || p.start || '');
      const ne = field === 'end'   ? value : (cur.endTime   || p.end   || '');
      schedule[idx] = { ...cur, startTime: ns, endTime: ne, time: (ns && ne) ? formatTimeRange(ns, ne) : cur.time };
      return { ...prev, schedule };
    });
  };

  const handleAddTimeSlot = () => {
    setForm(prev => {
      const last = prev.schedule[prev.schedule.length - 1];
      const st = last?.endTime || DEFAULT_START_TIME;
      const et = addMinutesToTime(st, DEFAULT_PERIOD_MINUTES);
      return { ...prev, schedule: [...prev.schedule, { time: formatTimeRange(st, et), startTime: st, endTime: et, isBreak: false, subject: '', teacher: '', subjectId: null, teacherId: null, roomId: null, room: '' }] };
    });
  };

  const handleRemoveTimeSlot = (idx) => {
    setForm(prev => prev.schedule.length <= 1 ? prev : { ...prev, schedule: prev.schedule.filter((_, i) => i !== idx) });
  };

  const handleApplyTemplate = (templateId) => {
    const t = ROUTINE_TEMPLATES.find(x => x.id === templateId); if (!t) return;
    setForm(prev => ({
      ...prev,
      schedule: prev.schedule.map((slot, idx) =>
        slot.isBreak ? { ...slot, subject: 'Break', teacher: '-', roomId: null, room: '' }
          : { ...slot, subject: t.pattern[idx % t.pattern.length] || slot.subject, teacher: TEACHERS[t.pattern[idx % t.pattern.length]] || slot.teacher }
      )
    }));
    showToast(`Applied "${t.name}" template`);
  };

  const handleCopyFromExistingRoutine = () => {
    const r = routines.find(x => String(x.id) === String(selectedCopyRoutine)); if (!r) return;
    setForm(prev => ({ ...prev, schedule: buildScheduleForDay(r.schedule) }));
    setSelectedCopyRoutine(''); showToast('Schedule copied');
  };

  const handleResetSchedule = () => setForm(prev => ({ ...prev, schedule: buildScheduleForDay() }));
  const handleClearSubjects = () => setForm(prev => ({
    ...prev,
    schedule: prev.schedule.map(s => s.isBreak ? { ...s, subject: 'Break', teacher: '-', roomId: null, room: '' } : { ...s, subject: '', teacher: '', roomId: null, room: '' })
  }));

  /* ── save ── */
  const handleSave = async () => {
    try {
      setSaving(true); setConflicts([]);
      const classDoc = getClassDoc();
      const sectionDoc = getSectionDoc(classDoc);
      if (!formYearId) { showToast('Select a session', 'error'); return; }
      if (!classDoc) { showToast('Select a class', 'error'); return; }
      const incomplete = form.schedule.filter(p => !p.isBreak && (!p.subject || !p.teacher));
      if (incomplete.length) { showToast('Fill subject and teacher for all periods', 'error'); return; }
      const timingIssues = form.schedule.filter(p => !p.isBreak && (!p.startTime || !p.endTime || p.startTime >= p.endTime));
      if (timingIssues.length) { showToast('Fix period timings', 'error'); return; }

      const entries = form.schedule.filter(p => !p.isBreak && p.subject).map((p, idx) => {
        const parsed = parseTimeRange(p.time);
        const subject = subjects.find(s => s.name === p.subject && (!classDoc || String(s.classId) === String(classDoc._id)));
        const teacher = teachers.find(t => t.name === p.teacher);
        const roomDoc = p.roomId ? roomsById.get(String(p.roomId)) : null;
        return { dayOfWeek: form.day, period: idx + 1, subjectId: subject?._id || null, teacherId: teacher?._id || null, roomId: roomDoc?._id || p.roomId || null, startTime: p.startTime || parsed.start, endTime: p.endTime || parsed.end, room: roomDoc?.roomNumber || p.room || '' };
      });
      if (!entries.length) { showToast('Add at least one period', 'error'); return; }

      const conflictResult = await timetableApi.validateConflicts({ classId: classDoc._id, sectionId: sectionDoc?._id || null, dayOfWeek: form.day, entries, excludeTimetableId: editingRoutine?.timetableId });
      if (conflictResult.hasConflicts) { setConflicts(conflictResult.conflicts); setShowConflictModal(true); setSaving(false); return; }

      await timetableApi.saveDay({ classId: classDoc._id, sectionId: sectionDoc?._id || null, dayOfWeek: form.day, entries });
      showToast('Routine saved successfully!'); setIsModalOpen(false); setEditingRoutine(null);
      await loadInitialData();
    } catch (err) { showToast(err.message || 'Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  /* ── export ── */
  const weeklyGrid = useMemo(() => {
    if (!selectedClassId || !selectedSectionId) return null;
    const byDay = new Map();
    routines.forEach(r => {
      if (
        String(r.classId || '') === String(selectedClassId) &&
        String(r.sectionId || '') === String(selectedSectionId)
      ) {
        byDay.set(r.day, r);
      }
    });
    const headers = ['Time', ...DAYS];
    const rows = TIMES.map(time => {
      const cells = DAYS.map(day => { const e = byDay.get(day); const p = e?.schedule.find(x => x.time === time); return p ? (p.subject === 'Break' ? 'Break' : `${p.subject} — ${p.teacher}`) : ''; });
      return [time, ...cells];
    });
    return { headers, rows };
  }, [selectedClassId, selectedSectionId, routines]);

  const exportCSV = () => {
    if (!weeklyGrid) return;
    const lines = [weeklyGrid.headers.join(','), ...weeklyGrid.rows.map(r => r.map(c => { const s = String(c||''); return s.includes(',') ? `"${s.replace(/"/g,'""')}"` : s; }).join(','))];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `routine_${selectedClassName}_${selectedSectionName}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!Array.isArray(routines) || routines.length === 0) {
      showToast('No routines available to export', 'error');
      return;
    }

    const dayIndex = new Map(DAYS.map((d, i) => [d, i]));
    const sortedRoutines = [...routines].sort((a, b) => {
      const classCmp = String(a.class || '').localeCompare(String(b.class || ''), undefined, { numeric: true, sensitivity: 'base' });
      if (classCmp !== 0) return classCmp;
      const secCmp = String(a.section || '').localeCompare(String(b.section || ''), undefined, { numeric: true, sensitivity: 'base' });
      if (secCmp !== 0) return secCmp;
      const dayCmp = (dayIndex.get(normalizeDayLabel(a.day)) ?? 99) - (dayIndex.get(normalizeDayLabel(b.day)) ?? 99);
      return dayCmp;
    });

    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 36;
    const tableW = pageW - margin * 2;
    const cols = [
      { key: 'time', label: 'Time', w: 118 },
      { key: 'subject', label: 'Subject', w: 150 },
      { key: 'teacher', label: 'Teacher', w: 148 },
      { key: 'room', label: 'Room', w: tableW - (118 + 150 + 148) },
    ];

    let y = margin;

    const ensureSpace = (h) => {
      if (y + h <= pageH - margin) return;
      doc.addPage();
      y = margin;
    };

    doc.setFontSize(15);
    doc.setFont(undefined, 'bold');
    doc.text('All Class Routines', margin, y);
    y += 16;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
    doc.setTextColor(20);
    y += 18;

    sortedRoutines.forEach((routine, idx) => {
      const schedule = Array.isArray(routine.schedule)
        ? [...routine.schedule].sort((a, b) => {
            const aKey = (a.startTime || parseTimeRange(a.time).start || '');
            const bKey = (b.startTime || parseTimeRange(b.time).start || '');
            return aKey.localeCompare(bKey);
          })
        : [];

      const title = `Class ${routine.class || '-'} - Section ${routine.section || '-'} - ${normalizeDayLabel(routine.day || '')}`;
      ensureSpace(24);
      doc.setFillColor(245, 247, 255);
      doc.rect(margin, y, tableW, 20, 'F');
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(title, margin + 8, y + 14);
      y += 20;

      ensureSpace(22);
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, tableW, 18, 'F');
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      let x = margin;
      cols.forEach((c) => {
        doc.text(c.label, x + 6, y + 12);
        x += c.w;
      });
      y += 18;

      doc.setFont(undefined, 'normal');
      schedule.forEach((row) => {
        ensureSpace(18);
        let cx = margin;
        const values = {
          time: row.time || `${convertTo12Hour(row.startTime || '')} - ${convertTo12Hour(row.endTime || '')}`.trim(),
          subject: row.isBreak ? 'Break' : (row.subject || '-'),
          teacher: row.isBreak ? '-' : (row.teacher || '-'),
          room: row.isBreak ? '-' : (row.room || '-'),
        };
        cols.forEach((c) => {
          doc.setDrawColor(230);
          doc.rect(cx, y, c.w, 18);
          const text = doc.splitTextToSize(String(values[c.key] || '-'), c.w - 10)[0] || '-';
          doc.text(text, cx + 6, y + 12);
          cx += c.w;
        });
        y += 18;
      });

      if (idx < sortedRoutines.length - 1) y += 10;
    });

    doc.save(`all_routines_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  /* ════════════════════ RENDER ════════════════════ */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Loading routines…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-slate-700 font-medium">{error}</p>
        <button onClick={loadInitialData} className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700">Retry</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toast {...toast} />

      {/* ──────── HEADER ──────── */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
              <Calendar size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Class Routines</h1>
              <p className="text-xs text-slate-500">Manage weekly timetables</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* <button onClick={exportCSV} disabled={!weeklyGrid}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <Download size={14} /> CSV
            </button> */}
            <button onClick={exportPDF} disabled={routines.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <Download size={14} /> PDF
            </button>
            {/* <button onClick={handleAutoGenerate} disabled={generating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-sm text-indigo-700 hover:bg-indigo-100 disabled:opacity-60 transition-colors">
              <Sparkles size={14} /> {generating ? 'Generating…' : 'Auto Generate'}
            </button> */}
            <button onClick={() => openRoutineEditor({ day: selectedDay || 'Monday' })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors">
              <Plus size={14} /> New Routine
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ──────── FILTERS ──────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Filter by Session, Class & Section</p>
          <div className="flex flex-wrap gap-3 items-center">
            <select value={selectedYearId} onChange={e => { setSelectedYearId(e.target.value); setSelectedClassId(''); setSelectedSectionId(''); }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 min-w-[160px]">
              <option value="">Select Active Session</option>
              {activeYears.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
            </select>
            <ChevronRight size={14} className="text-slate-300" />
            <select value={selectedClassId} onChange={e => { setSelectedClassId(e.target.value); setSelectedSectionId(''); }}
              disabled={!selectedYearId}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 min-w-[140px]">
              <option value="">All Classes</option>
              {filteredClasses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <ChevronRight size={14} className="text-slate-300" />
            <select value={selectedSectionId} onChange={e => setSelectedSectionId(e.target.value)}
              disabled={!selectedClassId}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 min-w-[140px]">
              <option value="">All Sections</option>
              {filteredSections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            {selectedClassId && selectedSectionId && (
              <span className="ml-auto text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl font-semibold border border-indigo-100">
                Class {selectedClassName} — {selectedSectionName}
              </span>
            )}
          </div>
          {generateMessage && (
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
              <CheckCircle2 size={13} /> {generateMessage}
            </div>
          )}
        </div>

        {/* ──────── EMPTY STATE ──────── */}
        {routines.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar size={28} className="text-indigo-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">No routines yet</h3>
            <p className="text-sm text-slate-400 mb-6">Create your first class timetable to get started.</p>
            <button onClick={() => openRoutineEditor({ day: 'Monday' })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-200">
              <Plus size={16} /> Create First Routine
            </button>
          </div>
        )}

        {/* ──────── SELECT PROMPT ──────── */}
        {routines.length > 0 && (!selectedClassId || !selectedSectionId) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">Select Session, Class & Section</h3>
            <p className="text-sm text-slate-400">Choose session first, then class and section to view the weekly schedule.</p>
          </div>
        )}

        {/* ──────── WEEKLY DAY CARDS ──────── */}
        {selectedClassId && selectedSectionId && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">Weekly Overview</h2>
                <p className="text-xs text-slate-400 mt-0.5">Click a day to preview, or use the edit button</p>
              </div>
              <button onClick={() => openRoutineEditor({ day: selectedDay })}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                <Plus size={13} /> Add / Edit Day
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {DAYS.map(day => (
                <DayCard
                  key={day}
                  day={day}
                  routine={getRoutineForDay(day)}
                  isSelected={selectedDay === day}
                  onClick={() => setSelectedDay(day)}
                  onEdit={() => openRoutineEditor({ day })}
                />
              ))}
            </div>
          </div>
        )}

        {/* ──────── DAY DETAIL VIEW ──────── */}
        {selectedClassId && selectedSectionId && (() => {
          const routine = getRoutineForDay(selectedDay);
          const periods = routine?.schedule || [];
          if (!routine) return null;
          return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-indigo-400" />
                  <h2 className="text-sm font-bold text-slate-800">{selectedDay} Schedule</h2>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg font-medium">
                    {periods.filter(p => !p.isBreak && p.subject).length} periods
                  </span>
                </div>
                <button onClick={() => openRoutineEditor({ day: selectedDay })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors">
                  <Edit2 size={12} /> Edit {selectedDay}
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {periods.map((p, i) => (
                  <div key={i} className={`flex items-center gap-4 px-5 py-3.5 ${p.isBreak ? 'bg-slate-50/80' : ''}`}>
                    <div className="w-36 shrink-0">
                      <p className="text-xs font-mono text-slate-500">{p.time || '—'}</p>
                    </div>
                    {p.isBreak ? (
                      <span className="text-xs font-semibold text-slate-400 italic">Break</span>
                    ) : (
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                          <BookOpen size={13} className="text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{p.subject}</p>
                          <p className="text-xs text-slate-400 truncate">{p.teacher}{p.room ? ` · ${p.room}` : ''}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ──────── ALL ROUTINES TABLE (when no class/section selected) ──────── */}
        {routines.length > 0 && selectedClassId && selectedSectionId && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">All Days Summary</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Day</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Periods</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Subjects</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {DAYS.map(day => {
                    const r = getRoutineForDay(day);
                    const periods = r?.schedule?.filter(p => !p.isBreak && p.subject) || [];
                    return (
                      <tr key={day} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${periods.length > 0 ? 'bg-indigo-400' : 'bg-slate-200'}`} />
                            <span className="font-semibold text-slate-800">{day}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">{periods.length > 0 ? `${periods.length} periods` : <span className="italic text-slate-300">Not set</span>}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {periods.slice(0, 4).map((p, i) => (
                              <span key={i} className="text-[11px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-medium">{p.subject}</span>
                            ))}
                            {periods.length > 4 && <span className="text-[11px] text-slate-400">+{periods.length - 4}</span>}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button onClick={() => openRoutineEditor({ day })}
                            className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all">
                            <Edit2 size={11} /> {periods.length > 0 ? 'Edit' : 'Add'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════ EDIT MODAL ══════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full sm:max-w-3xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">

            {/* modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/95">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
                  <Calendar size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">{editingRoutine ? 'Edit Routine' : 'Create Routine'}</h3>
                  {form.class && form.section && (
                    <p className="text-xs text-slate-400">
                      {years.find((y) => String(y._id) === String(formYearId))?.name || 'Session'} · Class {form.class} – {form.section} · {form.day}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Step 1: Session / Class / Section / Day */}
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Step 1 — Select Session, Class, Section & Day</p>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Session</label>
                    <select
                      value={formYearId}
                      onChange={(e) => {
                        setFormYearId(e.target.value);
                        setForm((f) => ({ ...f, class: '', section: '' }));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">Session</option>
                      {activeYears.map((y) => (
                        <option key={y._id} value={y._id}>{y.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Class</label>
                    <select
                      value={form.class}
                      onChange={(e) => setForm((f) => ({ ...f, class: e.target.value, section: '' }))}
                      disabled={!formYearId}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                    >
                      <option value="">Class</option>
                      {modalClasses.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Section</label>
                    <select
                      value={form.section}
                      onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                      disabled={!form.class}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                    >
                      <option value="">Section</option>
                      {modalSections.map((s) => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Day</label>
                    <select
                      value={form.day}
                      onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      {DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Quick tools */}
              <div className="rounded-2xl bg-indigo-50/60 border border-indigo-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Step 2 — Quick Tools</p>
                  <button type="button" onClick={() => setShowAdvanced(p => !p)}
                    className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-800">
                    {showAdvanced ? 'Hide' : 'Show'} advanced <ChevronDown size={12} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ROUTINE_TEMPLATES.map(t => (
                    <button key={t.id} type="button" onClick={() => handleApplyTemplate(t.id)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm">
                      ⚡ {t.name}
                    </button>
                  ))}
                  <button type="button" onClick={handleClearSubjects}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors shadow-sm">
                    Clear
                  </button>
                  <button type="button" onClick={handleResetSchedule}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                    Reset
                  </button>
                </div>
                {showAdvanced && (
                  <div className="mt-3 pt-3 border-t border-indigo-100 flex gap-2">
                    <select value={selectedCopyRoutine} onChange={e => setSelectedCopyRoutine(e.target.value)}
                      className="flex-1 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none">
                      <option value="">Copy from existing routine…</option>
                      {copyableRoutines.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                    <button type="button" onClick={handleCopyFromExistingRoutine} disabled={!selectedCopyRoutine}
                      className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1">
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                )}
              </div>

              {/* Step 3: Schedule table */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Step 3 — Configure Periods</p>
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="grid grid-cols-[1fr_auto_1.5fr_1.5fr_1.2fr_auto] gap-0 bg-slate-50 border-b border-slate-200">
                    {['Timing', 'Break', 'Subject', 'Teacher', 'Room', ''].map((h, i) => (
                      <div key={i} className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{h}</div>
                    ))}
                  </div>
                  <div className="divide-y divide-slate-50">
                    {form.schedule.map((row, idx) => (
                      <div key={`${row.time}-${idx}`} className={`grid grid-cols-[1fr_auto_1.5fr_1.5fr_1.2fr_auto] gap-0 items-start ${row.isBreak ? 'bg-slate-50/80' : 'bg-white hover:bg-indigo-50/30'} transition-colors`}>
                        {/* timing */}
                        <div className="px-3 py-3">
                          <p className="text-[11px] font-mono text-slate-500 mb-1.5 truncate">{row.time || '–'}</p>
                          <div className="grid grid-cols-2 gap-1">
                            <input type="time" value={row.startTime || parseTimeRange(row.time).start || ''}
                              onChange={e => updateRowTimeField(idx, 'start', e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-1.5 py-1 text-[11px] text-slate-700 bg-slate-50 focus:outline-none focus:border-indigo-300" />
                            <input type="time" value={row.endTime || parseTimeRange(row.time).end || ''}
                              onChange={e => updateRowTimeField(idx, 'end', e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-1.5 py-1 text-[11px] text-slate-700 bg-slate-50 focus:outline-none focus:border-indigo-300" />
                          </div>
                        </div>
                        {/* break checkbox */}
                        <div className="px-3 py-3 flex items-center justify-center pt-5">
                          <input type="checkbox" checked={row.isBreak}
                            onChange={e => {
                              const ib = e.target.checked;
                              const next = [...form.schedule];
                              next[idx] = ib ? {...row, isBreak: true, subject: 'Break', teacher: '-', roomId: null, room: ''} : {...row, isBreak: false, subject: '', teacher: '', roomId: null, room: ''};
                              setForm(f => ({...f, schedule: next}));
                            }}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer" />
                        </div>
                        {/* subject */}
                        <div className="px-2 py-3 pt-5">
                          {row.isBreak ? <span className="text-xs text-slate-400 italic">Break</span> : (
                            <select value={row.subject}
                              onChange={e => { const next = [...form.schedule]; next[idx] = {...row, subject: e.target.value}; setForm(f => ({...f, schedule: next})); }}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-300">
                              <option value="">Subject</option>
                              {classFilteredSubjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                            </select>
                          )}
                        </div>
                        {/* teacher */}
                        <div className="px-2 py-3 pt-5">
                          {row.isBreak ? <span className="text-xs text-slate-400 italic">—</span> : (
                            <select value={row.teacher}
                              onChange={e => { const next = [...form.schedule]; next[idx] = {...row, teacher: e.target.value}; setForm(f => ({...f, schedule: next})); }}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-300">
                              <option value="">Teacher</option>
                              {teachers.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                            </select>
                          )}
                        </div>
                        {/* room */}
                        <div className="px-2 py-3 pt-5 space-y-1">
                          {row.isBreak ? <span className="text-xs text-slate-400 italic">—</span> : (
                            <>
                              <select value={row.roomId || ''}
                                onChange={e => { const rid = e.target.value; const opt = roomOptions.find(o => String(o.id) === String(rid)); const next = [...form.schedule]; next[idx] = {...row, roomId: rid||null, room: opt?.roomNumber||row.room||''}; setForm(f => ({...f, schedule: next})); }}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-300">
                                <option value="">Room</option>
                                {roomOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                              </select>
                              <input type="text" value={row.room||''} placeholder="Custom room"
                                onChange={e => { const next = [...form.schedule]; next[idx] = {...row, roomId: null, room: e.target.value}; setForm(f => ({...f, schedule: next})); }}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-300" />
                            </>
                          )}
                        </div>
                        {/* remove */}
                        <div className="px-2 py-3 pt-5 flex items-start justify-center">
                          <button type="button" onClick={() => handleRemoveTimeSlot(idx)} disabled={form.schedule.length <= 1}
                            className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={handleAddTimeSlot}
                  className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-indigo-300 text-indigo-600 text-xs font-semibold hover:bg-indigo-50 transition-colors">
                  <Plus size={13} /> Add Period
                </button>
              </div>
            </div>

            {/* modal footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-white/95">
              <div className="text-xs text-slate-400">
                {form.schedule.filter(s => !s.isBreak && s.subject).length} of {form.schedule.filter(s => !s.isBreak).length} periods filled
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 shadow-md shadow-indigo-200 transition-colors">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? 'Saving…' : 'Save Routine'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ CONFLICT MODAL ══════════════════ */}
      {showConflictModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConflictModal(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-red-100 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-red-50 bg-red-50/80">
              <div className="h-9 w-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle size={16} className="text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-sm">Schedule Conflicts</h3>
                <p className="text-xs text-slate-400">Please resolve before saving</p>
              </div>
              <button onClick={() => setShowConflictModal(false)} className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-2 max-h-72 overflow-y-auto">
              {conflicts.map((c, i) => (
                <div key={i} className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-700">
                  <XCircle size={14} className="shrink-0 mt-0.5 text-red-400" />
                  {c.message}
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => { setShowConflictModal(false); setConflicts([]); }}
                className="px-5 py-2 rounded-xl bg-slate-700 text-white text-sm font-semibold hover:bg-slate-800 transition-colors">
                Close & Fix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Routines;
