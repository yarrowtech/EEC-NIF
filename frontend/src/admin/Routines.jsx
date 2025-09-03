import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import { Plus, Edit2, Trash2, Clock, Calendar, LayoutGrid } from 'lucide-react';

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

const buildRoutineData = () => {
  const list = [];
  const classes = [
    { cls: 'X', sections: ['A', 'B'] },
    { cls: 'IX', sections: ['A', 'B'] },
    { cls: 'XI', sections: ['A', 'B'] },
  ];
  let id = 1;
  classes.forEach(({ cls, sections }) => {
    sections.forEach((sec, sIdx) => {
      DAYS.forEach((day, dIdx) => {
        const schedule = TIMES.map((t, i) => {
          if (t.includes('10:15')) return { time: t, subject: 'Break', teacher: '-' };
          const subj = SUBJECTS[cls][(i + dIdx + sIdx) % SUBJECTS[cls].length];
          return { time: t, subject: subj, teacher: TEACHERS[subj] || '-' };
        });
        list.push({ id: id++, class: cls, section: sec, day, schedule });
      });
    });
  });
  return list;
};

const routineData = buildRoutineData();

const Routines = ({setShowAdminHeader}) => {
  const [routines, setRoutines] = useState(routineData);
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

  const filteredRoutines = routines.filter(routine => 
    (!selectedClass || routine.class === selectedClass) &&
    (!selectedSection || routine.section === selectedSection) &&
    (viewMode === 'weekly' || !selectedDay || routine.day === selectedDay)
  );

  // making the admin header invisible
    useEffect(() => {
      setShowAdminHeader(false)
    }, [])

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
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Class Routines</h1>
            <p className="text-gray-600 mt-1">Manage weekly schedules across classes and sections</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'daily' ? 'weekly' : 'daily')}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2"
            >
              <LayoutGrid size={18} /> {viewMode === 'daily' ? 'Weekly View' : 'Daily View'}
            </button>
            <button
              onClick={exportCSV}
              disabled={!weeklyGrid}
              className={`px-3 py-2 rounded-lg border inline-flex items-center gap-2 ${weeklyGrid ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
              title={!weeklyGrid ? 'Select Class and Section to export' : 'Export as CSV'}
            >
              CSV
            </button>
            <button
              onClick={exportPDF}
              disabled={!weeklyGrid}
              className={`px-3 py-2 rounded-lg border inline-flex items-center gap-2 ${weeklyGrid ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
              title={!weeklyGrid ? 'Select Class and Section to export' : 'Export as PDF'}
            >
              PDF
            </button>
            <button
              onClick={() => {
                const defClass = selectedClass || 'X';
                const defSection = selectedSection || 'A';
                const defDay = selectedDay || 'Monday';
                const schedule = TIMES.map((t) => ({
                  time: t,
                  isBreak: t.includes('10:15'),
                  subject: t.includes('10:15') ? 'Break' : SUBJECTS[defClass][0],
                  teacher: t.includes('10:15') ? '-' : (TEACHERS[SUBJECTS[defClass][0]] || '-')
                }));
                setForm({ class: defClass, section: defSection, day: defDay, schedule });
                setEditingRoutine(null);
                setIsModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 shadow-sm"
            >
              <Plus size={20} />
              Add Routine
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">All Classes</option>
            <option value="X">Class X</option>
            <option value="IX">Class IX</option>
            {/* Add more class options */}
          </select>
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            {/* Add more section options */}
          </select>
          {viewMode === 'daily' && (
            <select 
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              {DAYS.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          )}
        </div>

        {/* Weekly grid */}
        {viewMode === 'weekly' && weeklyGrid && (
          <div className="mb-6 overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  {weeklyGrid.headers.map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeklyGrid.rows.map((row, ri) => (
                  <tr key={ri} className="even:bg-white odd:bg-gray-50">
                    {row.map((cell, ci) => (
                      <td key={ci} className="align-top px-3 py-2 text-sm text-gray-800 border-b border-gray-100 whitespace-pre-wrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Routines */}
        {(viewMode === 'daily' ? filteredRoutines : routines.filter(r => (!selectedClass || r.class === selectedClass) && (!selectedSection || r.section === selectedSection))).map(routine => (
          <div key={routine.id} className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="bg-gray-50 px-5 py-4 flex flex-col sm:flex-row justify-between items-center border-b border-gray-200">
              <div className="flex items-center gap-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Class {routine.class} <span className='font-normal'>- Section {routine.section}</span></h3>
                  <div className="flex items-center gap-2 text-gray-600 mt-1 text-sm">
                    <Calendar size={20} />
                    <span>{routine.day}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <button
                  className="text-indigo-600 hover:text-indigo-700 p-2 rounded-full hover:bg-indigo-50"
                  title="Edit"
                  onClick={() => {
                    const schedule = routine.schedule.map((p) => ({
                      time: p.time,
                      isBreak: p.subject === 'Break',
                      subject: p.subject,
                      teacher: p.teacher,
                    }));
                    setForm({ class: routine.class, section: routine.section, day: routine.day, schedule });
                    setEditingRoutine(routine);
                    setIsModalOpen(true);
                  }}
                >
                  <Edit2 size={18} />
                </button>
                <button className="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-50" title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {routine.schedule.map((period, index) => (
                <div key={index} className="px-5 py-4 flex flex-col sm:flex-row items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-5 w-full">
                    <div className="flex items-center gap-2 text-gray-700 min-w-[180px] text-sm font-medium">
                      <Clock size={20} />
                      <span>{period.time}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-base sm:text-lg">{period.subject}</div>
                      <div className="text-sm text-gray-600">{period.teacher}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <button className="text-indigo-600 hover:text-indigo-700 p-2 rounded-full hover:bg-indigo-50" title="Edit Period">
                      <Edit2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {(viewMode === 'daily' ? filteredRoutines : routines).filter(r => (!selectedClass || r.class === selectedClass) && (!selectedSection || r.section === selectedSection)).length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No routines found</h3>
            <p className="text-gray-600 mt-1">Try adjusting your filters or create a new routine.</p>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-7">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{editingRoutine ? 'Edit Routine' : 'Add Routine'}</h3>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => setIsModalOpen(false)}>✕</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 min-w-16">Class</label>
                  <select
                    value={form.class}
                    onChange={(e) => {
                      const cls = e.target.value;
                      const newSchedule = form.schedule.map((row) => row.isBreak ? row : {
                        ...row,
                        subject: SUBJECTS[cls][0],
                        teacher: TEACHERS[SUBJECTS[cls][0]] || '-',
                      });
                      setForm((f) => ({ ...f, class: cls, schedule: newSchedule }));
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {Object.keys(SUBJECTS).map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 min-w-16">Section</label>
                  <select value={form.section} onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    {['A','B','C'].map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 min-w-16">Day</label>
                  <select value={form.day} onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    {DAYS.map((d) => (<option key={d} value={d}>{d}</option>))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-left border-b border-gray-200">Time</th>
                      <th className="px-2 py-2 text-left border-b border-gray-200">Break</th>
                      <th className="px-2 py-2 text-left border-b border-gray-200">Subject</th>
                      <th className="px-2 py-2 text-left border-b border-gray-200">Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.schedule.map((row, idx) => (
                      <tr key={row.time} className="even:bg-white odd:bg-gray-50">
                        <td className="px-2 py-2 border-b border-gray-100 whitespace-nowrap">{row.time}</td>
                        <td className="px-2 py-2 border-b border-gray-100">
                          <input
                            type="checkbox"
                            checked={row.isBreak}
                            onChange={(e) => {
                              const isBreak = e.target.checked;
                              const next = [...form.schedule];
                              next[idx] = isBreak
                                ? { ...row, isBreak: true, subject: 'Break', teacher: '-' }
                                : { ...row, isBreak: false, subject: SUBJECTS[form.class][0], teacher: TEACHERS[SUBJECTS[form.class][0]] || '-' };
                              setForm((f) => ({ ...f, schedule: next }));
                            }}
                          />
                        </td>
                        <td className="px-2 py-2 border-b border-gray-100">
                          {row.isBreak ? (
                            <span className="text-gray-500">Break</span>
                          ) : (
                            <select
                              value={row.subject}
                              onChange={(e) => {
                                const subj = e.target.value;
                                const next = [...form.schedule];
                                next[idx] = { ...row, subject: subj, teacher: TEACHERS[subj] || '-' };
                                setForm((f) => ({ ...f, schedule: next }));
                              }}
                              className="w-full border border-gray-300 rounded-lg px-2 py-1"
                            >
                              {SUBJECTS[form.class].map((s) => (<option key={s} value={s}>{s}</option>))}
                            </select>
                          )}
                        </td>
                        <td className="px-2 py-2 border-b border-gray-100">
                          {row.isBreak ? (
                            <span className="text-gray-500">-</span>
                          ) : (
                            <input
                              value={row.teacher}
                              onChange={(e) => {
                                const next = [...form.schedule];
                                next[idx] = { ...row, teacher: e.target.value };
                                setForm((f) => ({ ...f, schedule: next }));
                              }}
                              className="w-full border border-gray-300 rounded-lg px-2 py-1"
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => {
                    const normalized = {
                      id: editingRoutine?.id ?? (routines.reduce((m, r) => Math.max(m, r.id), 0) + 1),
                      class: form.class,
                      section: form.section,
                      day: form.day,
                      schedule: form.schedule.map((r) => r.isBreak ? { time: r.time, subject: 'Break', teacher: '-' } : { time: r.time, subject: r.subject, teacher: r.teacher }),
                    };
                    setRoutines((prev) => {
                      const idx = prev.findIndex((r) => r.id === editingRoutine?.id);
                      if (idx >= 0) {
                        const next = [...prev];
                        next[idx] = normalized;
                        return next;
                      }
                      // if routine with same class/section/day exists, replace
                      const existingIdx = prev.findIndex((r) => r.class === normalized.class && r.section === normalized.section && r.day === normalized.day);
                      if (existingIdx >= 0) {
                        const next = [...prev];
                        next[existingIdx] = { ...normalized, id: prev[existingIdx].id };
                        return next;
                      }
                      return [...prev, normalized];
                    });
                    setIsModalOpen(false);
                  }}
                >
                  Save Routine
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Routines; 
