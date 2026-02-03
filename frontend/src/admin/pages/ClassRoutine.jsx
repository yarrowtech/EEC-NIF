import React, { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import { BookOpen, Calendar, CalendarRange, Clock, Download, MapPin, Plus, Search, Sparkles, Users } from 'lucide-react';
import { academicApi, timetableApi, convertTo12Hour } from '../utils/timetableApi';

const ClassRoutine = () => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState('');

  const DEFAULT_TIME_SLOTS = [
    { key: '08:00-08:45', label: '8:00 AM - 8:45 AM' },
    { key: '08:45-09:30', label: '8:45 AM - 9:30 AM' },
    { key: '09:30-10:15', label: '9:30 AM - 10:15 AM' },
    { key: '10:15-10:45', label: '10:15 AM - 10:45 AM' },
    { key: '10:45-11:30', label: '10:45 AM - 11:30 AM' },
    { key: '11:30-12:15', label: '11:30 AM - 12:15 PM' },
  ];

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getId = (value) => (value && typeof value === 'object' ? value._id : value);
  const timeToMinutes = (value) => {
    if (!value) return 0;
    const [h, m] = value.split(':').map(Number);
    return (h * 60) + (m || 0);
  };

  const timeSlots = useMemo(() => {
    const slots = new Map();
    timetables.forEach((tt) => {
      (tt.entries || []).forEach((entry) => {
        if (!entry.startTime || !entry.endTime) return;
        const key = `${entry.startTime}-${entry.endTime}`;
        if (!slots.has(key)) {
          slots.set(key, {
            key,
            startTime: entry.startTime,
            endTime: entry.endTime,
            label: `${convertTo12Hour(entry.startTime)} - ${convertTo12Hour(entry.endTime)}`,
          });
        }
      });
    });

    if (slots.size === 0) return DEFAULT_TIME_SLOTS;

    return Array.from(slots.values()).sort((a, b) => {
      const startDiff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
      if (startDiff !== 0) return startDiff;
      return timeToMinutes(a.endTime) - timeToMinutes(b.endTime);
    });
  }, [timetables]);

  const routineData = useMemo(() => {
    const data = {};
    weekDays.forEach((day) => {
      data[day] = {};
    });

    timetables.forEach((tt) => {
      const className = tt.classId?.name || '';
      const sectionName = tt.sectionId?.name || '';
      const classId = getId(tt.classId);
      const sectionId = getId(tt.sectionId);

      (tt.entries || []).forEach((entry) => {
        if (!entry.dayOfWeek || !entry.startTime || !entry.endTime) return;
        const day = entry.dayOfWeek;
        if (!data[day]) data[day] = {};
        const key = `${entry.startTime}-${entry.endTime}`;
        if (!data[day][key]) data[day][key] = [];
        data[day][key].push({
          subject: entry.subjectId?.name || 'Unknown',
          teacher: entry.teacherId?.name || 'TBA',
          room: entry.room || '',
          className,
          sectionName,
          classId,
          sectionId,
        });
      });
    });

    return data;
  }, [timetables]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filterEntries = (entries) => {
    return (entries || []).filter((entry) => {
      const classOk = selectedClass === 'all' || String(entry.classId) === String(selectedClass);
      const sectionOk = selectedSection === 'all' || String(entry.sectionId) === String(selectedSection);
      const searchOk = !normalizedSearch || [
        entry.subject,
        entry.teacher,
        entry.room,
        entry.className,
        entry.sectionName,
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(normalizedSearch));
      return classOk && sectionOk && searchOk;
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [timetablesData, classesData, sectionsData] = await Promise.all([
        timetableApi.getAll().catch(() => []),
        academicApi.getClasses().catch(() => []),
        academicApi.getSections().catch(() => []),
      ]);
      setTimetables(Array.isArray(timetablesData) ? timetablesData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
      setSections(Array.isArray(sectionsData) ? sectionsData : []);
    } catch (err) {
      setError(err.message || 'Failed to load routine data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAutoGenerate = async () => {
    const generateAll = selectedClass === 'all';
    if (generateAll && !window.confirm('Generate routines for all classes? This will overwrite existing timetables.')) {
      return;
    }

    try {
      setGenerating(true);
      setGenerateMessage('');
      const payload = {};
      if (selectedClass !== 'all') payload.classId = selectedClass;
      if (selectedSection !== 'all') payload.sectionId = selectedSection;
      payload.overwriteExisting = true;

      const result = await timetableApi.autoGenerate(payload);
      const total = result?.totalGenerated || 0;
      const failed = result?.totalErrors || 0;
      const firstError = result?.errors?.[0];
      const errorLabel = firstError
        ? ` First error: ${firstError.className || firstError.classId}${firstError.sectionName ? `-${firstError.sectionName}` : ''} — ${firstError.error}`
        : '';
      setGenerateMessage(`Generated ${total} timetable${total !== 1 ? 's' : ''}.${failed ? ` ${failed} failed.` : ''}${errorLabel}`);
      await loadData();
    } catch (err) {
      setGenerateMessage(err.message || 'Auto-generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const subjectPalette = [
    'bg-sky-100 border-sky-200 text-sky-900',
    'bg-emerald-100 border-emerald-200 text-emerald-900',
    'bg-amber-100 border-amber-200 text-amber-900',
    'bg-rose-100 border-rose-200 text-rose-900',
    'bg-teal-100 border-teal-200 text-teal-900',
    'bg-lime-100 border-lime-200 text-lime-900',
  ];

  const getSubjectColor = (subject) => {
    if (!subject) return 'bg-slate-100 border-slate-200 text-slate-900';
    let hash = 0;
    for (let i = 0; i < subject.length; i += 1) {
      hash = (hash + subject.charCodeAt(i) * (i + 1)) % subjectPalette.length;
    }
    return subjectPalette[hash];
  };

  const selectedClassLabel = useMemo(() => {
    if (selectedClass === 'all') return 'All Classes';
    return classes.find((cls) => String(cls._id) === String(selectedClass))?.name || 'Class';
  }, [selectedClass, classes]);

  const selectedSectionLabel = useMemo(() => {
    if (selectedSection === 'all') return 'All Sections';
    return sections.find((sec) => String(sec._id) === String(selectedSection))?.name || 'Section';
  }, [selectedSection, sections]);

  const summary = useMemo(() => {
    let total = 0;
    const subjects = new Set();
    const teachers = new Set();
    const rooms = new Set();

    weekDays.forEach((day) => {
      timeSlots.forEach((slot) => {
        const entries = filterEntries(routineData[day]?.[slot.key]);
        entries.forEach((entry) => {
          total += 1;
          if (entry.subject) subjects.add(entry.subject);
          if (entry.teacher) teachers.add(entry.teacher);
          if (entry.room) rooms.add(entry.room);
        });
      });
    });

    return {
      total,
      subjects: subjects.size,
      teachers: teachers.size,
      rooms: rooms.size,
    };
  }, [routineData, timeSlots, selectedClass, selectedSection, normalizedSearch]);

  const exportRoutineToPDF = () => {
    const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
    const pageWidth = pdf.internal.pageSize.width;
    const currentDate = new Date().toLocaleDateString();
    let yPosition = 20;
    
    // Title
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text('Class Routine Schedule', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    
    const selectedClassLabel = selectedClass === 'all'
      ? 'All Classes'
      : (classes.find((cls) => String(cls._id) === String(selectedClass))?.name || 'Class');
    const selectedSectionLabel = selectedSection === 'all'
      ? 'All Sections'
      : (sections.find((sec) => String(sec._id) === String(selectedSection))?.name || 'Section');
    const filterInfo = [];
    if (selectedClass !== 'all') filterInfo.push(`Class: ${selectedClassLabel}`);
    if (selectedSection !== 'all') filterInfo.push(`Section: ${selectedSectionLabel}`);
    
    if (filterInfo.length > 0) {
      pdf.text(`Filter: ${filterInfo.join(', ')}`, pageWidth / 2, yPosition, { align: 'center' });
    } else {
      pdf.text('All Classes and Sections', pageWidth / 2, yPosition, { align: 'center' });
    }
    
    yPosition += 8;
    pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;

    // Weekly Schedule Table
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Weekly Schedule', 20, yPosition);
    yPosition += 12;

    // Table headers
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'bold');
    let xPosition = 20;
    pdf.text('Time', xPosition, yPosition);
    xPosition += 45;
    
    weekDays.forEach(day => {
      pdf.text(day, xPosition, yPosition);
      xPosition += 45;
    });
    
    pdf.line(15, yPosition + 2, pageWidth - 15, yPosition + 2);
    yPosition += 8;

    // Timetable data
    pdf.setFont(undefined, 'normal');
    timeSlots.forEach(slot => {
      if (yPosition > 180) {
        pdf.addPage();
        yPosition = 20;
      }
      
      xPosition = 20;
      pdf.text(slot.label, xPosition, yPosition);
      xPosition += 45;
      
      weekDays.forEach(day => {
        const entries = filterEntries(routineData[day]?.[slot.key]);
        const classData = entries[0];
        if (classData) {
          const text = `${classData.subject}\n${classData.teacher}\n${classData.room}`;
          pdf.text(text.split('\n')[0], xPosition, yPosition - 2);
          pdf.text(text.split('\n')[1], xPosition, yPosition + 2);
          pdf.text(text.split('\n')[2], xPosition, yPosition + 6);
        }
        xPosition += 45;
      });
      
      yPosition += 12;
    });

    // Subject-wise breakdown
    yPosition += 10;
    if (yPosition > 160) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Subject Summary', 20, yPosition);
    yPosition += 12;

    // Collect all subjects and their schedules
    const subjectSchedule = {};
    weekDays.forEach(day => {
      timeSlots.forEach(slot => {
        const entries = filterEntries(routineData[day]?.[slot.key]);
        entries.forEach((classData) => {
          if (!subjectSchedule[classData.subject]) {
            subjectSchedule[classData.subject] = [];
          }
          subjectSchedule[classData.subject].push({
            day,
            time: slot.label,
            teacher: classData.teacher,
            room: classData.room,
            class: `${classData.className}${classData.sectionName ? `-${classData.sectionName}` : ''}`,
          });
        });
      });
    });

    // Print subject breakdown
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    
    Object.entries(subjectSchedule).forEach(([subject, sessions]) => {
      if (yPosition > 200) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFont(undefined, 'bold');
      pdf.text(`${subject}:`, 20, yPosition);
      yPosition += 6;
      
      pdf.setFont(undefined, 'normal');
      sessions.forEach(session => {
        pdf.text(`  ${session.day} ${session.time} - ${session.teacher} (${session.room})`, 25, yPosition);
        yPosition += 5;
      });
      yPosition += 3;
    });

    // Footer
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'italic');
    pdf.text('Generated by School Management System - Class Routine Module', pageWidth / 2, pdf.internal.pageSize.height - 10, { align: 'center' });

    const classSuffix = selectedClass !== 'all'
      ? selectedClassLabel.replace(/ /g, '-')
      : 'all-classes';
    pdf.save(`class-routine-${classSuffix}-${currentDate.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="min-h-screen routine-shell relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 left-10 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl routine-pulse" />
      <div className="pointer-events-none absolute -bottom-24 right-16 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl routine-pulse" />

      <div className="relative z-10 mx-auto flex max-w-[1400px] flex-col gap-6 px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="routine-card rounded-3xl p-6 md:p-8 routine-animate">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                Routine Dashboard
              </div>
              <h1 className="routine-title text-3xl font-semibold text-slate-900 sm:text-4xl">
                Class Routine Control Room
              </h1>
              <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
                Explore weekly schedules, track room allocations, and keep every class perfectly aligned.
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-700">
                <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
                  {selectedClassLabel}
                </span>
                <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
                  {selectedSectionLabel}
                </span>
                {normalizedSearch && (
                  <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
                    Search: {searchQuery}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">
                <Plus className="h-4 w-4" />
                Add Schedule
              </button>
              <button
                onClick={handleAutoGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Sparkles className="h-4 w-4" />
                {generating ? 'Generating...' : 'Auto Generate'}
              </button>
              <button
                onClick={exportRoutineToPDF}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </button>
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-medium text-slate-600 lg:flex">
                <Calendar className="h-4 w-4 text-slate-500" />
                Weekly view synced
              </div>
            </div>
          </div>
          {generateMessage && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-xs font-medium text-slate-600">
              {generateMessage}
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-xs font-medium text-slate-600">
            <span>Need custom edits after auto-generation?</span>
            <a
              href="/admin/routine"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              Open Customize / Edit
            </a>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 routine-animate routine-animate-delay-1">
          <div className="routine-glass rounded-2xl p-5">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Total Sessions</span>
              <CalendarRange className="h-4 w-4 text-sky-600" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{summary.total}</div>
            <p className="mt-1 text-xs text-slate-500">Across all visible slots</p>
          </div>
          <div className="routine-glass rounded-2xl p-5">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Subjects</span>
              <BookOpen className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{summary.subjects}</div>
            <p className="mt-1 text-xs text-slate-500">Unique subjects tracked</p>
          </div>
          <div className="routine-glass rounded-2xl p-5">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Teachers</span>
              <Users className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{summary.teachers}</div>
            <p className="mt-1 text-xs text-slate-500">Educators in the grid</p>
          </div>
          <div className="routine-glass rounded-2xl p-5">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Rooms</span>
              <MapPin className="h-4 w-4 text-rose-600" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-slate-900">{summary.rooms}</div>
            <p className="mt-1 text-xs text-slate-500">Active room usage</p>
          </div>
        </div>

        <div className="routine-card rounded-3xl p-5 md:p-6 routine-animate routine-animate-delay-2">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subject, teacher, room..."
                  className="w-full rounded-full border border-slate-200 bg-white/80 py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="all">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </select>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="all">All Sections</option>
                {sections
                  .filter((sec) => selectedClass === 'all' || String(sec.classId) === String(selectedClass))
                  .map((sec) => (
                    <option key={sec._id} value={sec._id}>{sec.name}</option>
                  ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
                Slots: {timeSlots.length}
              </span>
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
                Days: {weekDays.length}
              </span>
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1">
                Results: {summary.total}
              </span>
            </div>
          </div>
        </div>

        <div className="routine-card rounded-3xl p-4 md:p-6 routine-animate routine-animate-delay-3">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Weekly Overview</h2>
              <p className="text-xs text-slate-500">Hover a slot to focus, scroll horizontally on smaller screens.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="h-4 w-4 text-slate-400" />
              {timeSlots[0]?.label || 'Time slots'}
            </div>
          </div>

          <div className="relative overflow-auto">
            {loading && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-sm text-slate-600">
                Loading routines...
              </div>
            )}
            {!loading && error && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-600">
                {error}
              </div>
            )}
            {!loading && !error && summary.total === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-8 text-center">
                <p className="text-sm font-semibold text-slate-700">No sessions match your filters.</p>
                <p className="mt-1 text-xs text-slate-500">Try a different class, section, or search keyword.</p>
              </div>
            )}
            {!loading && !error && summary.total > 0 && (
              <table className="min-w-full border-separate border-spacing-y-2 table-fixed">
                <thead className="text-left text-xs uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="sticky left-0 top-0 z-20 w-36 bg-white/90 px-4 py-3 backdrop-blur">
                      Time
                    </th>
                    {weekDays.map(day => (
                      <th key={day} className="sticky top-0 z-10 min-w-[240px] bg-white/90 px-4 py-3 backdrop-blur">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot) => (
                    <tr key={slot.key} className="align-top">
                      <td className="sticky left-0 z-10 bg-white/90 px-4 py-4 text-sm font-semibold text-slate-700 backdrop-blur">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>{slot.label}</span>
                        </div>
                      </td>
                      {weekDays.map(day => {
                        const entries = filterEntries(routineData[day]?.[slot.key]);
                        const showClassInfo = selectedClass === 'all' || selectedSection === 'all';
                        return (
                          <td key={`${day}-${slot.key}`} className="px-4 py-4">
                            {entries.length > 0 ? (
                              <div className="space-y-2">
                                {entries.slice(0, 2).map((classData, idx) => (
                                  <div
                                    key={`${classData.subject}-${idx}`}
                                    className={`rounded-2xl border px-3 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${getSubjectColor(classData.subject)}`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                          {showClassInfo ? `${classData.className}${classData.sectionName ? ` · ${classData.sectionName}` : ''}` : 'Class'}
                                        </p>
                                        <p className="mt-1 text-sm font-semibold">{classData.subject}</p>
                                      </div>
                                      <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                        {day.slice(0, 3)}
                                      </span>
                                    </div>
                                    <div className="mt-2 space-y-1 text-xs text-slate-700">
                                      <div className="flex items-center gap-1">
                                        <Users className="h-3.5 w-3.5" />
                                        <span>{classData.teacher}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>{classData.room || 'Room TBA'}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {entries.length > 2 && (
                                  <div className="text-xs font-semibold text-slate-500">
                                    +{entries.length - 2} more sessions
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-4 text-center text-xs text-slate-400">
                                <Plus className="mx-auto mb-1 h-4 w-4" />
                                Add session
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassRoutine; 
