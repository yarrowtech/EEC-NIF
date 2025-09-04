import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import { Plus, Edit2, Trash2, Clock, Calendar, LayoutGrid, ChevronLeft, ChevronRight, Grid, List, User } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 p-6">
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
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Routine</span>
            </button>
          </div>
        </div>
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
                <option value="X">Class X</option>
                <option value="IX">Class IX</option>
                <option value="XI">Class XI</option>
              </select>
              
              <select 
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                <option value="">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
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
              <h2 className="text-xl font-semibold text-gray-900">
                Class {selectedClass} - Section {selectedSection} Weekly Overview
              </h2>
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
                        const routine = routines.find(r => r.class === selectedClass && r.section === selectedSection && r.day === day);
                        const period = routine?.schedule.find(p => p.time === time);
                        
                        return (
                          <div key={day} className="relative p-2 border-r border-gray-100 last:border-r-0">
                            {period ? (
                              <div className={`h-full p-3 rounded-lg text-white text-xs overflow-hidden ${
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
                                <div className="font-medium truncate">{period.subject}</div>
                                <div className="text-xs opacity-90 truncate mt-1">{period.teacher}</div>
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
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
        {((viewMode === 'daily' && filteredRoutines.length === 0) || 
          (viewMode === 'weekly' && (!selectedClass || !selectedSection))) && (
          <div className="bg-white rounded-xl shadow-sm border border-purple-400 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-purple-500" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {viewMode === 'weekly' ? 'Select Class and Section' : 'No routines found'}
              </h3>
              <p className="text-gray-500">
                {viewMode === 'weekly' 
                  ? 'Please select both class and section to view the weekly schedule'
                  : 'Try adjusting your filters or create a new routine'
                }
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
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {Object.keys(SUBJECTS).map((cls) => (
                      <option key={cls} value={cls}>Class {cls}</option>
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
                    {['A','B','C'].map((s) => (
                      <option key={s} value={s}>Section {s}</option>
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
                                : { ...row, isBreak: false, subject: SUBJECTS[form.class][0], teacher: TEACHERS[SUBJECTS[form.class][0]] || '-' };
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
                                next[idx] = { ...row, subject: subj, teacher: TEACHERS[subj] || '-' };
                                setForm((f) => ({ ...f, schedule: next }));
                              }}
                              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                            >
                              {SUBJECTS[form.class].map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {row.isBreak ? (
                            <span className="text-gray-500 italic">-</span>
                          ) : (
                            <input
                              value={row.teacher}
                              onChange={(e) => {
                                const next = [...form.schedule];
                                next[idx] = { ...row, teacher: e.target.value };
                                setForm((f) => ({ ...f, schedule: next }));
                              }}
                              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                            />
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
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
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
  );
};

export default Routines; 
