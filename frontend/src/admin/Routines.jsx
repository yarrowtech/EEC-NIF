import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import { Plus, Edit2, Trash2, Clock, Calendar, LayoutGrid, ChevronLeft, ChevronRight, Grid, List, User, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { timetableApi, academicApi, transformTimetablesToRoutines, convertTo24Hour, convertTo12Hour } from './utils/timetableApi';

// Weekly builder for static routines
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIMES = [
  '8:00 AM - 8:45 AM',
  '8:45 AM - 9:30 AM',
  '9:30 AM - 10:15 AM',
  '10:15 AM - 10:45 AM', // Break
  '10:45 AM - 11:30 AM',
  '11:30 AM - 12:15 PM',
];

const SUBJECTS = {
  X: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer'],
  IX: ['Mathematics', 'English', 'Science', 'Social Science', 'Hindi', 'Computer'],
  XI: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer'],
};

const TEACHERS = {
  Mathematics: 'Dr. Rakesh Sharma',
  Physics: 'Prof. Priya Verma',
  Chemistry: 'Mr. Arjun Singh',
  Biology: 'Dr. Kavita Rao',
  English: 'Ms. Anjali Mehra',
  'Social Science': 'Mr. Suresh Patel',
  Science: 'Dr. Kavita Rao',
  Hindi: 'Mr. Rohan Gupta',
  Computer: 'Ms. Nidhi Kapoor',
};

const getId = (value) => (value && typeof value === 'object' ? value._id : value);

const buildScheduleForDay = (existingSchedule = []) => {
  const byTime = new Map(existingSchedule.map((entry) => [entry.time, entry]));
  return TIMES.map((time) => {
    const match = byTime.get(time);
    if (match) {
      const isBreak = match.subject === 'Break';
      return {
        time,
        isBreak,
        subject: isBreak ? 'Break' : (match.subject || ''),
        teacher: isBreak ? '-' : (match.teacher || ''),
        subjectId: match.subjectId || null,
        teacherId: match.teacherId || null,
        room: match.room || '',
      };
    }
    const isBreak = time.includes('10:15');
    return {
      time,
      isBreak,
      subject: isBreak ? 'Break' : '',
      teacher: isBreak ? '-' : '',
      subjectId: null,
      teacherId: null,
      room: '',
    };
  });
};

const isBreakSlot = (time) => time.includes('10:15');

const Routines = ({setShowAdminHeader}) => {
  // Data state
  const [routines, setRoutines] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [draftSaving, setDraftSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState('');

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Conflict state
  const [conflicts, setConflicts] = useState([]);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [viewMode, setViewMode] = useState('daily');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null); // routine or null
  const [form, setForm] = useState({
    class: '',
    section: '',
    day: 'Monday',
    schedule: [], // [{time, subject, teacher, isBreak}]
  });
  const [blockDraft, setBlockDraft] = useState({ subject: '', teacher: '', room: '' });
  const [paletteBlocks, setPaletteBlocks] = useState([]);
  const [weeklyDraft, setWeeklyDraft] = useState({});

  const filteredRoutines = routines.filter(routine =>
    (!selectedClass || routine.class === selectedClass) &&
    (!selectedSection || routine.section === selectedSection) &&
    (viewMode === 'weekly' || !selectedDay || routine.day === selectedDay)
  );

  // Toast notification helpers
  const showSuccessToast = (message) => {
    setToast({ show: true, message, type: 'success' });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const showErrorToast = (message) => {
    setToast({ show: true, message, type: 'error' });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 5000);
  };

  // Load initial data from API
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data one by one to identify which endpoint fails
      console.log('Fetching timetables...');
      const timetablesData = await timetableApi.getAll().catch(err => {
        console.error('Timetables API failed:', err);
        return [];
      });

      console.log('Fetching classes...');
      const classesData = await academicApi.getClasses().catch(err => {
        console.error('Classes API failed:', err);
        return [];
      });

      console.log('Fetching sections...');
      const sectionsData = await academicApi.getSections().catch(err => {
        console.error('Sections API failed:', err);
        return [];
      });

      console.log('Fetching subjects...');
      const subjectsData = await academicApi.getSubjects().catch(err => {
        console.error('Subjects API failed:', err);
        return [];
      });

      console.log('Fetching teachers...');
      const teachersData = await academicApi.getTeachers().catch(err => {
        console.error('Teachers API failed:', err);
        return [];
      });

      console.log('Data fetched:', {
        timetables: timetablesData,
        classes: classesData,
        sections: sectionsData,
        subjects: subjectsData,
        teachers: teachersData
      });

      // Transform timetables to routine format
      const transformed = transformTimetablesToRoutines(timetablesData);
      console.log('Transformed routines:', transformed);

      setRoutines(transformed);
      setClasses(classesData);
      setSections(sectionsData);
      setSubjects(subjectsData);
      setTeachers(teachersData);

      console.log('State updated with data');

      // If no timetables exist, show info message
      if (transformed.length === 0) {
        console.log('No routines found in database');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load routines');
      showErrorToast(err.message || 'Failed to load routines');
    } finally {
      setLoading(false);
    }
  };

  // making the admin header invisible
  useEffect(() => {
    setShowAdminHeader(false);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const handleAutoGenerate = async () => {
    if (!selectedClass) {
      const ok = window.confirm('Generate routines for all classes? This will overwrite existing timetables.');
      if (!ok) return;
    }

    try {
      setGenerating(true);
      setGenerateMessage('');
      const classDoc = getClassDoc();
      const sectionDoc = classDoc ? getSectionDoc(classDoc) : null;
      const payload = {
        overwriteExisting: true,
      };
      if (classDoc?._id) payload.classId = classDoc._id;
      if (sectionDoc?._id) payload.sectionId = sectionDoc._id;

      const result = await timetableApi.autoGenerate(payload);
      const total = result?.totalGenerated || 0;
      const failed = result?.totalErrors || 0;
      const firstError = result?.errors?.[0];
      const errorLabel = firstError
        ? ` First error: ${firstError.className || firstError.classId}${firstError.sectionName ? `-${firstError.sectionName}` : ''} — ${firstError.error}`
        : '';
      const message = `Generated ${total} timetable${total !== 1 ? 's' : ''}.${failed ? ` ${failed} failed.` : ''}${errorLabel}`;
      setGenerateMessage(message);
      showSuccessToast(message);
      await loadInitialData();
    } catch (err) {
      const message = err.message || 'Auto-generation failed.';
      setGenerateMessage(message);
      showErrorToast(message);
    } finally {
      setGenerating(false);
    }
  };

  const getClassDoc = () => classes.find(c => c.name === selectedClass);
  const getSectionDoc = (classDoc) =>
    sections.find(s => s.name === selectedSection && getId(s.classId) === classDoc?._id);

  const getRoutineForDay = (day) =>
    routines.find(r => r.class === selectedClass && r.section === selectedSection && r.day === day);

  const getBaseCell = (day, time) => {
    const routine = getRoutineForDay(day);
    return routine?.schedule.find(p => p.time === time) || null;
  };

  const getCellBlock = (day, time) => {
    const draft = weeklyDraft[day]?.[time];
    if (draft === null) return null;
    if (draft) return draft;
    const base = getBaseCell(day, time);
    if (!base || base.subject === 'Break') return null;
    return {
      subject: base.subject,
      teacher: base.teacher,
      subjectId: base.subjectId || null,
      teacherId: base.teacherId || null,
      room: base.room || '',
    };
  };

  const buildDayScheduleMap = (day, overrides = {}) => {
    const scheduleMap = {};
    const routine = getRoutineForDay(day);
    routine?.schedule.forEach((p) => {
      if (p.subject === 'Break') return;
      scheduleMap[p.time] = {
        subject: p.subject,
        teacher: p.teacher,
        subjectId: p.subjectId || null,
        teacherId: p.teacherId || null,
        room: p.room || '',
      };
    });
    const draftForDay = { ...(weeklyDraft[day] || {}), ...overrides };
    Object.keys(draftForDay).forEach((time) => {
      if (draftForDay[time] === null) {
        delete scheduleMap[time];
      } else if (draftForDay[time]) {
        scheduleMap[time] = draftForDay[time];
      }
    });
    return scheduleMap;
  };

  const buildEntriesFromScheduleMap = (day, scheduleMap) => {
    return TIMES.map((time, index) => {
      if (isBreakSlot(time)) return null;
      const slot = scheduleMap[time];
      if (!slot) return null;
      const [startTime, endTime] = time.split(' - ').map(t => t.trim());
      const subject = slot.subjectId
        ? subjects.find(s => String(s._id) === String(slot.subjectId))
        : subjects.find(s => s.name === slot.subject);
      const teacher = slot.teacherId
        ? teachers.find(t => String(t._id) === String(slot.teacherId))
        : teachers.find(t => t.name === slot.teacher);
      return {
        dayOfWeek: day,
        period: index + 1,
        subjectId: subject?._id || slot.subjectId || null,
        teacherId: teacher?._id || slot.teacherId || null,
        startTime: convertTo24Hour(startTime),
        endTime: convertTo24Hour(endTime),
        room: slot.room || ''
      };
    }).filter(Boolean);
  };

  const validateDayConflicts = async (day, scheduleMap) => {
    const classDoc = getClassDoc();
    const sectionDoc = getSectionDoc(classDoc);
    if (!classDoc) {
      showErrorToast('Select class and section first');
      return false;
    }
    const entries = buildEntriesFromScheduleMap(day, scheduleMap);
    if (entries.length === 0) {
      showErrorToast('Please add at least one class period');
      return false;
    }
    if (entries.some((entry) => !entry.subjectId || !entry.teacherId)) {
      showErrorToast('Invalid subject or teacher selection');
      return false;
    }
    const routine = getRoutineForDay(day);
    const conflictResult = await timetableApi.validateConflicts({
      classId: classDoc._id,
      sectionId: sectionDoc?._id || null,
      entries,
      excludeTimetableId: routine?.timetableId
    });
    if (conflictResult.hasConflicts) {
      setConflicts(conflictResult.conflicts);
      setShowConflictModal(true);
      return false;
    }
    return true;
  };

  const handleDropOnCell = async (day, time, payload) => {
    if (!selectedClass || !selectedSection) {
      showErrorToast('Select class and section first');
      return;
    }
    if (isBreakSlot(time)) {
      showErrorToast('Break slots are locked');
      return;
    }

    let block = null;
    let source = null;
    if (payload.type === 'palette') {
      block = payload.block;
    } else if (payload.type === 'cell') {
      source = payload;
      block = getCellBlock(payload.day, payload.time);
    }

    if (!block || !block.subject || !block.teacher) {
      showErrorToast('Select subject and teacher first');
      return;
    }

    if (source && source.day === day && source.time === time) {
      return;
    }

    const overrides = { [time]: block };
    if (source) {
      overrides[source.time] = null;
    }
    const scheduleMap = buildDayScheduleMap(day, overrides);
    const ok = await validateDayConflicts(day, scheduleMap);
    if (!ok) return;

    setWeeklyDraft((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        ...overrides,
      },
    }));
  };

  const handleDragStart = (event, payload) => {
    event.dataTransfer.setData('application/json', JSON.stringify(payload));
    event.dataTransfer.setData('text/plain', JSON.stringify(payload));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleClearCell = (day, time) => {
    if (isBreakSlot(time)) return;
    setWeeklyDraft((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        [time]: null,
      },
    }));
  };

  const handleSaveDay = async (day, options = {}) => {
    const { silent = false } = options;
    const classDoc = getClassDoc();
    const sectionDoc = getSectionDoc(classDoc);
    if (!classDoc) {
      if (!silent) showErrorToast('Select class and section first');
      return;
    }

    const scheduleMap = buildDayScheduleMap(day);
    const entries = buildEntriesFromScheduleMap(day, scheduleMap);
    if (entries.length === 0) {
      if (!silent) showErrorToast('Please add at least one class period');
      return;
    }

    const ok = await validateDayConflicts(day, scheduleMap);
    if (!ok) return;

    if (!silent) setDraftSaving(true);
    try {
      await timetableApi.saveDay({
        classId: classDoc._id,
        sectionId: sectionDoc?._id || null,
        dayOfWeek: day,
        entries,
      });
      setWeeklyDraft((prev) => {
        const next = { ...prev };
        delete next[day];
        return next;
      });
      if (!silent) showSuccessToast(`Saved ${day} routine`);
      await loadInitialData();
    } catch (err) {
      if (!silent) showErrorToast(err.message || 'Failed to save routine');
    } finally {
      if (!silent) setDraftSaving(false);
    }
  };

  const handleSaveWeek = async () => {
    if (!selectedClass || !selectedSection) {
      showErrorToast('Select class and section first');
      return;
    }
    const daysToSave = Object.keys(weeklyDraft);
    if (daysToSave.length === 0) {
      showErrorToast('No changes to save');
      return;
    }
    setDraftSaving(true);
    try {
      for (const day of daysToSave) {
        await handleSaveDay(day, { silent: true });
      }
      showSuccessToast('Saved weekly routine');
      await loadInitialData();
    } finally {
      setDraftSaving(false);
    }
  };

  const handleAddBlock = () => {
    if (!blockDraft.subject || !blockDraft.teacher) {
      showErrorToast('Select subject and teacher first');
      return;
    }
    const subject = subjects.find((s) => s.name === blockDraft.subject);
    const teacher = teachers.find((t) => t.name === blockDraft.teacher);
    const nextBlock = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      subject: blockDraft.subject,
      teacher: blockDraft.teacher,
      subjectId: subject?._id || null,
      teacherId: teacher?._id || null,
      room: blockDraft.room || '',
    };
    setPaletteBlocks((prev) => [...prev, nextBlock]);
    setBlockDraft({ subject: '', teacher: '', room: '' });
  };

  const handleRemoveBlock = (id) => {
    setPaletteBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  // Delete handler
  const handleDelete = async (routine) => {
    if (!window.confirm(`Are you sure you want to delete the routine for ${routine.class}-${routine.section} on ${routine.day}?`)) {
      return;
    }

    try {
      await timetableApi.deleteDay({
        classId: routine.classId,
        sectionId: routine.sectionId,
        dayOfWeek: routine.day
      });
      showSuccessToast('Routine deleted successfully!');
      await loadInitialData();
    } catch (err) {
      console.error('Error deleting routine:', err);
      showErrorToast(err.message || 'Failed to delete routine');
    }
  };

  // Save/Update handler
  const handleSave = async () => {
    try {
      setSaving(true);
      setConflicts([]);

      // Find class and section IDs
      const classDoc = classes.find(c => c.name === form.class);
      const sectionDoc = sections.find(s => s.name === form.section && getId(s.classId) === classDoc?._id);

      if (!classDoc) {
        showErrorToast('Selected class not found');
        return;
      }

      // Transform form data to timetable format
      const incompleteRows = form.schedule.filter(
        (period) => !period.isBreak && (!period.subject || !period.teacher)
      );
      if (incompleteRows.length > 0) {
        showErrorToast('Please select subject and teacher for all class periods');
        return;
      }

      const entries = form.schedule
        .filter(period => !period.isBreak)
        .filter(period => period.subject && period.time)
        .map((period, index) => {
          const [startTime, endTime] = period.time.split(' - ').map(t => t.trim());
          const subject = subjects.find(s => s.name === period.subject);
          const teacher = teachers.find(t => t.name === period.teacher);

          return {
            dayOfWeek: form.day,
            period: index + 1,
            subjectId: subject?._id || null,
            teacherId: teacher?._id || null,
            startTime: convertTo24Hour(startTime),
            endTime: convertTo24Hour(endTime),
            room: period.room || ''
          };
        });

      if (entries.length === 0) {
        showErrorToast('Please add at least one class period before saving');
        return;
      }

      const timetableData = {
        classId: classDoc._id,
        sectionId: sectionDoc?._id || null,
        dayOfWeek: form.day,
        entries
      };

      // Validate conflicts
      const conflictResult = await timetableApi.validateConflicts({
        ...timetableData,
        excludeTimetableId: editingRoutine?.timetableId
      });

      if (conflictResult.hasConflicts) {
        setConflicts(conflictResult.conflicts);
        setShowConflictModal(true);
        setSaving(false);
        return;
      }

      // Save timetable
      await timetableApi.saveDay(timetableData);

      showSuccessToast('Routine saved successfully!');
      setIsModalOpen(false);
      setEditingRoutine(null);

      // Reload data
      await loadInitialData();
    } catch (err) {
      console.error('Error saving routine:', err);
      showErrorToast(err.message || 'Failed to save routine');
    } finally {
      setSaving(false);
    }
  };

  // Build weekly grid for selected class/section
  const weeklyGrid = useMemo(() => {
    if (!selectedClass || !selectedSection) return null;
    // Map entries by day for quick lookup
    const byDay = new Map();
    routines.forEach((r) => {
      if (r.class === selectedClass && r.section === selectedSection) {
        byDay.set(r.day, r);
      }
    });
    const headers = ['Time', ...DAYS];
    const rows = TIMES.map((time) => {
      const cells = DAYS.map((day) => {
        const entry = byDay.get(day);
        const period = entry?.schedule.find((p) => p.time === time);
        if (!period) return '';
        if (period.subject === 'Break') return 'Break';
        return `${period.subject} — ${period.teacher}`;
      });
      return [time, ...cells];
    });
    return { headers, rows };
  }, [selectedClass, selectedSection]);

  const exportCSV = () => {
    if (!weeklyGrid) return;
    const lines = [weeklyGrid.headers.join(',')];
    weeklyGrid.rows.forEach((r) => {
      const escaped = r.map((c) => {
        const s = String(c || '');
        return s.includes(',') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
      });
      lines.push(escaped.join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `routine_${selectedClass}_${selectedSection}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!weeklyGrid) return;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const margin = 36;
    const startY = margin + 20;
    doc.setFontSize(14);
    doc.text(`Class ${selectedClass} - Section ${selectedSection} | Weekly Routine`, margin, margin);
    // Compute column widths
    const pageWidth = doc.internal.pageSize.getWidth();
    const tableWidth = pageWidth - margin * 2;
    const colCount = weeklyGrid.headers.length;
    const colWidth = tableWidth / colCount;
    const rowHeight = 28;
    let y = startY;
    // Header row
    doc.setFillColor(243, 244, 246); // gray-100
    doc.rect(margin, y, tableWidth, rowHeight, 'F');
    doc.setFontSize(10);
    weeklyGrid.headers.forEach((h, i) => {
      const x = margin + i * colWidth + 6;
      doc.text(String(h), x, y + 18);
    });
    y += rowHeight;
    // Rows
    doc.setFontSize(9);
    weeklyGrid.rows.forEach((row) => {
      // cell backgrounds alternating
      doc.setDrawColor(229, 231, 235); // gray-200
      row.forEach((cell, i) => {
        const x = margin + i * colWidth;
        doc.rect(x, y, colWidth, rowHeight);
        const text = String(cell || '');
        const lines = doc.splitTextToSize(text, colWidth - 10);
        doc.text(lines, x + 6, y + 18);
      });
      y += rowHeight;
      if (y + rowHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
    });
    doc.save(`routine_${selectedClass}_${selectedSection}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
          <p className="text-gray-600">Loading routines...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-3">
            <AlertCircle className="text-red-500" size={24} />
            <h3 className="text-lg font-semibold text-red-800">Error Loading Routines</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadInitialData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content - Only show if not loading and no error */}
      {!loading && !error && (
        <>
          {/* Header inspired by RoutineView */}
          <div className="bg-white rounded-xl shadow-sm border border-purple-400 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Calendar className="text-indigo-600 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Class Routines</h1>
              <p className="text-gray-600">Manage weekly schedules across classes and sections</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportCSV}
              disabled={!weeklyGrid}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                weeklyGrid ? 'border-purple-400 text-gray-700 hover:bg-gray-50' : 'border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
            >
              CSV
            </button>
            <button
              onClick={exportPDF}
              disabled={!weeklyGrid}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                weeklyGrid ? 'border-purple-400 text-gray-700 hover:bg-gray-50' : 'border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
            >
              PDF
            </button>
            <button
              onClick={() => {
                const defClass = selectedClass || (classes.length > 0 ? classes[0].name : '');
                const defSection = selectedSection || (sections.length > 0 ? sections[0].name : '');
                const defDay = selectedDay || 'Monday';
                const schedule = buildScheduleForDay();
                setForm({ class: defClass, section: defSection, day: defDay, schedule });
                setEditingRoutine(null);
                setIsModalOpen(true);
              }}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Routine</span>
            </button>
            <button
              onClick={handleAutoGenerate}
              disabled={generating}
              className="border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Sparkles size={16} />
              <span>{generating ? 'Generating...' : 'Auto Generate'}</span>
            </button>
          </div>
        </div>
        {generateMessage && (
          <div className="mt-4 rounded-lg border border-purple-100 bg-purple-50 px-4 py-2 text-sm text-purple-700">
            {generateMessage}
          </div>
        )}
      </div>

      {/* Enhanced Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-400 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

            {/* Class and Section Filters */}
            <div className="flex items-center space-x-3">
              <select
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls.name}>{cls.name}</option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                <option value="">All Sections</option>
                    {sections
                      .filter(s => {
                        if (!selectedClass) return true;
                        const classDoc = classes.find(c => c.name === selectedClass);
                        return classDoc && getId(s.classId) === classDoc._id;
                      })
                  .map((sec) => (
                    <option key={sec._id} value={sec.name}>{sec.name}</option>
                  ))}
              </select>
            </div>
            
            {/* View Toggle matching RoutineView style */}
            <div className="flex bg-white rounded-lg shadow-sm border border-purple-400 p-1">
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'weekly' 
                    ? 'bg-indigo-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid size={16} className="inline mr-1" />
                Week
              </button>
              <button
                onClick={() => setViewMode('daily')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'daily' 
                    ? 'bg-indigo-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List size={16} className="inline mr-1" />
                Daily
              </button>
            </div>
          </div>

          {/* Day Selection for Daily View */}
          {viewMode === 'daily' && (
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-purple-400">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <select 
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                >
                  {DAYS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Enhanced Weekly Grid inspired by RoutineView */}
        {viewMode === 'weekly' && weeklyGrid && (
          <div className="bg-white rounded-xl shadow-sm border border-purple-400 overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Class {selectedClass} - Section {selectedSection} Weekly Overview
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Drag blocks into cells. Break slots are locked.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-500">
                    Draft days: {Object.keys(weeklyDraft).length}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {DAYS.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleSaveDay(selectedDay)}
                      disabled={draftSaving}
                      className="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      Save Day
                    </button>
                    <button
                      onClick={handleSaveWeek}
                      disabled={draftSaving}
                      className="px-3 py-2 rounded-lg bg-indigo-500 text-white text-sm hover:bg-indigo-600 disabled:opacity-50"
                    >
                      Save Week
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Period Builder</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                      value={blockDraft.subject}
                      onChange={(e) => setBlockDraft((prev) => ({ ...prev, subject: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject._id} value={subject.name}>{subject.name}</option>
                      ))}
                    </select>
                    <select
                      value={blockDraft.teacher}
                      onChange={(e) => setBlockDraft((prev) => ({ ...prev, teacher: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher.name}>{teacher.name}</option>
                      ))}
                    </select>
                    <input
                      value={blockDraft.room}
                      onChange={(e) => setBlockDraft((prev) => ({ ...prev, room: e.target.value }))}
                      placeholder="Room (optional)"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={handleAddBlock}
                      className="px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600"
                    >
                      Add Block
                    </button>
                    <button
                      onClick={() => setPaletteBlocks([])}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Clear Palette
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Drag Blocks</h3>
                  {paletteBlocks.length === 0 ? (
                    <div className="text-sm text-gray-500">No blocks yet. Add one from the builder.</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {paletteBlocks.map((block) => (
                        <div
                          key={block.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, { type: 'palette', block })}
                          className="px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-xs cursor-move"
                        >
                          <div className="font-medium text-indigo-800 truncate">{block.subject}</div>
                          <div className="text-indigo-600 truncate">{block.teacher}</div>
                          {block.room && <div className="text-indigo-500 truncate">{block.room}</div>}
                          <button
                            onClick={() => handleRemoveBlock(block.id)}
                            className="mt-2 text-[10px] text-red-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-7 border-b border-purple-100">
                  <div className="p-3 bg-gray-50 font-medium text-gray-700 text-center border-r border-gray-200">Time</div>
                  {DAYS.map((day) => {
                    const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
                    return (
                      <div key={day} className={`p-3 font-medium text-center border-r border-gray-200 last:border-r-0 ${
                        isToday ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-50 text-gray-700'
                      }`}>
                        <div className="text-sm">{day.substring(0, 3)}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {routines.find(r => r.class === selectedClass && r.section === selectedSection && r.day === day)?.schedule.length || 0} periods
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Time slots with enhanced styling */}
                <div className="relative">
                  {TIMES.map((time, timeIndex) => (
                    <div key={time} className="grid grid-cols-7 border-b border-purple-100 min-h-20">
                      <div className="p-3 bg-gray-50 text-sm text-gray-600 text-center border-r border-gray-200 flex items-center justify-center">
                        <div>
                          <Clock className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                          <div className="text-xs">{time}</div>
                        </div>
                      </div>
                      {DAYS.map((day) => {
                        const basePeriod = getBaseCell(day, time);
                        const block = getCellBlock(day, time);
                        const isBreak = basePeriod?.subject === 'Break' || isBreakSlot(time);
                        
                        return (
                          <div
                            key={day}
                            className="relative p-2 border-r border-gray-100 last:border-r-0"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const raw =
                                e.dataTransfer.getData('application/json') ||
                                e.dataTransfer.getData('text/plain') ||
                                '{}';
                              let payload = {};
                              try {
                                payload = JSON.parse(raw);
                              } catch (err) {
                                payload = {};
                              }
                              handleDropOnCell(day, time, payload);
                            }}
                          >
                            {isBreak ? (
                              <div className="h-full p-3 rounded-lg bg-gray-200 text-gray-700 text-xs flex items-center justify-center border border-gray-300">
                                Break
                              </div>
                            ) : block ? (
                              <div
                                className="h-full p-3 rounded-lg text-white text-xs overflow-hidden bg-indigo-500 cursor-move"
                                draggable
                                onDragStart={(e) => handleDragStart(e, { type: 'cell', day, time })}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="font-medium truncate">{block.subject}</div>
                                    <div className="text-xs opacity-90 truncate mt-1">{block.teacher}</div>
                                    {block.room && <div className="text-[10px] opacity-80 truncate">{block.room}</div>}
                                  </div>
                                  <button
                                    onClick={() => handleClearCell(day, time)}
                                    className="text-white/80 hover:text-white text-xs"
                                    title="Clear"
                                  >
                                    x
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer">
                                <Plus className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Statistics */}
        {viewMode === 'weekly' && selectedClass && selectedSection && (
          <div className="bg-white rounded-xl shadow-sm border border-purple-400 mb-6">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Weekly Statistics</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {routines.filter(r => r.class === selectedClass && r.section === selectedSection)
                      .reduce((total, r) => total + r.schedule.filter(p => p.subject !== 'Break').length, 0)}
                  </div>
                  <div className="text-sm text-blue-800">Total Periods</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {new Set(routines.filter(r => r.class === selectedClass && r.section === selectedSection)
                      .flatMap(r => r.schedule.filter(p => p.subject !== 'Break').map(p => p.subject))).size}
                  </div>
                  <div className="text-sm text-green-800">Subjects</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(routines.filter(r => r.class === selectedClass && r.section === selectedSection)
                      .flatMap(r => r.schedule.filter(p => p.subject !== 'Break').map(p => p.teacher))).size}
                  </div>
                  <div className="text-sm text-purple-800">Teachers</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {routines.filter(r => r.class === selectedClass && r.section === selectedSection).length}
                  </div>
                  <div className="text-sm text-orange-800">Days</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {routines.filter(r => r.class === selectedClass && r.section === selectedSection)
                      .reduce((total, r) => total + r.schedule.filter(p => p.subject === 'Break').length, 0)}
                  </div>
                  <div className="text-sm text-gray-800">Breaks</div>
                </div>
                
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">
                    {Math.round((routines.filter(r => r.class === selectedClass && r.section === selectedSection)
                      .reduce((total, r) => total + r.schedule.filter(p => p.subject !== 'Break').length, 0) / 
                      (routines.filter(r => r.class === selectedClass && r.section === selectedSection).length * TIMES.length)) * 100) || 0}%
                  </div>
                  <div className="text-sm text-pink-800">Utilization</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Daily View */}
        {viewMode === 'daily' && (
          <div>
            {/* Day Selector for Daily View */}
            <div className="bg-white rounded-xl shadow-sm border border-purple-400 p-6 mb-6">
              <div className="grid grid-cols-6 gap-2">
                {DAYS.map((day) => {
                  const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
                  const dayRoutines = routines.filter(r => 
                    r.day === day && 
                    (!selectedClass || r.class === selectedClass) && 
                    (!selectedSection || r.section === selectedSection)
                  );
                  
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`p-3 rounded-lg text-center transition-all relative ${
                        selectedDay === day
                          ? 'bg-indigo-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isToday && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                      )}
                      <div className="text-sm font-medium">{day.substring(0, 3)}</div>
                      <div className="text-xs mt-1 opacity-75">
                        {dayRoutines.length} routines
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Daily Routines */}
            {filteredRoutines.map(routine => (
              <div key={routine.id} className="bg-white rounded-xl shadow-sm border border-purple-400 mb-6">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Class {routine.class} - Section {routine.section}
                        {new Date().toLocaleDateString('en-US', { weekday: 'long' }) === routine.day && (
                          <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Today</span>
                        )}
                      </h3>
                      <div className="flex items-center space-x-2 text-gray-600 mt-1">
                        <Calendar size={16} />
                        <span>{routine.day}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        onClick={() => {
                          const schedule = buildScheduleForDay(routine.schedule);
                          setForm({ class: routine.class, section: routine.section, day: routine.day, schedule });
                          setEditingRoutine(routine);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => handleDelete(routine)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {routine.schedule.map((period, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-indigo-300">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0 ${
                            period.subject === 'Break' ? 'bg-gray-400' :
                            period.subject.includes('Mathematics') ? 'bg-blue-500' :
                            period.subject.includes('Physics') ? 'bg-purple-500' :
                            period.subject.includes('Chemistry') ? 'bg-orange-500' :
                            period.subject.includes('Biology') ? 'bg-green-500' :
                            period.subject.includes('English') ? 'bg-pink-500' :
                            period.subject.includes('Science') ? 'bg-green-500' :
                            period.subject.includes('Social') ? 'bg-yellow-500' :
                            period.subject.includes('Hindi') ? 'bg-red-500' :
                            period.subject.includes('Computer') ? 'bg-indigo-500' :
                            'bg-gray-500'
                          }`}>
                            {period.subject === 'Break' ? <Clock size={16} /> : <Calendar size={16} />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-semibold text-gray-900 truncate">{period.subject}</h4>
                              <span className={`px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${
                                period.subject === 'Break' ? 'bg-gray-100 text-gray-800' :
                                period.subject.includes('Mathematics') ? 'bg-blue-100 text-blue-800' :
                                period.subject.includes('Physics') ? 'bg-purple-100 text-purple-800' :
                                period.subject.includes('Chemistry') ? 'bg-orange-100 text-orange-800' :
                                period.subject.includes('Biology') ? 'bg-green-100 text-green-800' :
                                period.subject.includes('English') ? 'bg-pink-100 text-pink-800' :
                                'bg-indigo-100 text-indigo-800'
                              }`}>
                                {period.subject === 'Break' ? 'Break' : 'Lecture'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <Clock size={16} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate">{period.time}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <User size={16} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate">{period.teacher}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Data State */}
        {routines.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-purple-400 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-purple-500" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No routines created yet
              </h3>
              <p className="text-gray-500 mb-6">
                Get started by creating your first class routine. You can add schedules for different classes, sections, and days.
              </p>
              <button
                onClick={() => {
                  const defClass = classes.length > 0 ? classes[0].name : '';
                  const defSection = sections.length > 0 ? sections[0].name : '';
                  const defDay = 'Monday';
                  const schedule = buildScheduleForDay();
                  setForm({ class: defClass, section: defSection, day: defDay, schedule });
                  setEditingRoutine(null);
                  setIsModalOpen(true);
                }}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Create First Routine</span>
              </button>
            </div>
          </div>
        )}

        {/* Weekly View - No Selection State */}
        {routines.length > 0 && viewMode === 'weekly' && (!selectedClass || !selectedSection) && (
          <div className="bg-white rounded-xl shadow-sm border border-purple-400 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-purple-500" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select Class and Section
              </h3>
              <p className="text-gray-500">
                Please select both class and section from the filters above to view the weekly schedule
              </p>
            </div>
          </div>
        )}

        {/* Daily View - No Results State */}
        {routines.length > 0 && viewMode === 'daily' && filteredRoutines.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-purple-400 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-purple-500" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No routines for selected filters
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or create a new routine for this class/section/day
              </p>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-white w-full max-w-4xl rounded-xl shadow-lg border border-purple-400 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingRoutine ? 'Edit Routine' : 'Add Routine'}
                </h3>
                <button 
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors" 
                  onClick={() => setIsModalOpen(false)}
                >
                  x
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <select
                    value={form.class}
                    onChange={(e) => {
                      const cls = e.target.value;
                      setForm((f) => ({ ...f, class: cls }));
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls.name}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                  <select
                    value={form.section}
                    onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Section</option>
                    {sections
                      .filter(s => {
                        const classDoc = classes.find(c => c.name === form.class);
                        return !classDoc || getId(s.classId) === classDoc._id;
                      })
                      .map((s) => (
                        <option key={s._id} value={s.name}>{s.name}</option>
                      ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                  <select 
                    value={form.day} 
                    onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto mb-6">
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Time</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Break</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Subject</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.schedule.map((row, idx) => (
                      <tr key={row.time} className="even:bg-white odd:bg-gray-50 border-b border-gray-100">
                        <td className="px-4 py-3 text-sm text-gray-800">{row.time}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={row.isBreak}
                            onChange={(e) => {
                              const isBreak = e.target.checked;
                              const next = [...form.schedule];
                              next[idx] = isBreak
                                ? { ...row, isBreak: true, subject: 'Break', teacher: '-' }
                                : { ...row, isBreak: false, subject: '', teacher: '' };
                              setForm((f) => ({ ...f, schedule: next }));
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          {row.isBreak ? (
                            <span className="text-gray-500 italic">Break</span>
                          ) : (
                            <select
                              value={row.subject}
                              onChange={(e) => {
                                const subj = e.target.value;
                                const next = [...form.schedule];
                                next[idx] = { ...row, subject: subj };
                                setForm((f) => ({ ...f, schedule: next }));
                              }}
                              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                            >
                              <option value="">Select Subject</option>
                              {subjects.map((s) => (
                                <option key={s._id} value={s.name}>{s.name}</option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {row.isBreak ? (
                            <span className="text-gray-500 italic">-</span>
                          ) : (
                            <select
                              value={row.teacher}
                              onChange={(e) => {
                                const next = [...form.schedule];
                                next[idx] = { ...row, teacher: e.target.value };
                                setForm((f) => ({ ...f, schedule: next }));
                              }}
                              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                            >
                              <option value="">Select Teacher</option>
                              {teachers.map((t) => (
                                <option key={t._id} value={t.name}>{t.name}</option>
                              ))}
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  <span>{saving ? 'Saving...' : 'Save Routine'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Conflict Modal */}
        {showConflictModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowConflictModal(false)} />
            <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-lg border border-red-400 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="text-red-600" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Schedule Conflicts Detected</h3>
                </div>
                <button
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setShowConflictModal(false)}
                >
                  x
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 mb-3">
                  The following conflicts were found. Please resolve them before saving:
                </p>
                <ul className="space-y-2">
                  {conflicts.map((conflict, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <span className="text-yellow-600 mt-0.5">•</span>
                      <span className="text-yellow-900">{conflict.message}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  onClick={() => {
                    setShowConflictModal(false);
                    setConflicts([]);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
};

export default Routines; 
