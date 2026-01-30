import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Users, MapPin, Filter, Download, Plus, Edit3, Trash2, X, ChevronLeft, ChevronRight, User, BookOpen, Grid, List } from 'lucide-react';
import jsPDF from 'jspdf';
import { academicApi, timetableApi, convertTo12Hour } from '../utils/timetableApi';

const TeacherTimetable = ({ setShowAdminHeader }) => {
  useEffect(() => {
    setShowAdminHeader(true);
  }, [setShowAdminHeader]);
  
  const [currentView, setCurrentView] = useState('week');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTeacher, setModalTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const DEFAULT_TIME_SLOTS = [
    { key: '08:00-08:45', label: '8:00 AM - 8:45 AM' },
    { key: '08:45-09:30', label: '8:45 AM - 9:30 AM' },
    { key: '09:30-10:15', label: '9:30 AM - 10:15 AM' },
    { key: '10:15-10:45', label: '10:15 AM - 10:45 AM' },
    { key: '10:45-11:30', label: '10:45 AM - 11:30 AM' },
    { key: '11:30-12:15', label: '11:30 AM - 12:15 PM' },
  ];

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

  const slotLabelByKey = useMemo(() => {
    const map = new Map();
    timeSlots.forEach((slot) => {
      map.set(slot.key, slot.label);
    });
    return map;
  }, [timeSlots]);

  const routineData = useMemo(() => {
    const data = {};
    weekDays.forEach((day) => {
      data[day] = {};
    });

    timetables.forEach((tt) => {
      const className = tt.classId?.name || '';
      const sectionName = tt.sectionId?.name || '';
      (tt.entries || []).forEach((entry) => {
        if (!entry.dayOfWeek || !entry.startTime || !entry.endTime) return;
        const day = entry.dayOfWeek;
        if (!data[day]) data[day] = {};
        const key = `${entry.startTime}-${entry.endTime}`;
        if (!data[day][key]) data[day][key] = [];
        data[day][key].push({
          teacher: entry.teacherId?.name || 'TBA',
          teacherId: entry.teacherId?._id || entry.teacherId || null,
          subject: entry.subjectId?.name || 'Unknown',
          className,
          sectionName,
          room: entry.room || '',
        });
      });
    });

    return data;
  }, [timetables]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teacherData, timetableData] = await Promise.all([
        academicApi.getTeachers().catch(() => []),
        timetableApi.getAll().catch(() => []),
      ]);
      setTeachers(Array.isArray(teacherData) ? teacherData : []);
      setTimetables(Array.isArray(timetableData) ? timetableData : []);
    } catch (err) {
      setError(err.message || 'Failed to load timetable data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getSubjectColor = (subject) => {
    const colors = {
      'Mathematics': 'bg-blue-100 border-blue-300 text-blue-800',
      'Physics': 'bg-purple-100 border-purple-300 text-purple-800',
      'English': 'bg-green-100 border-green-300 text-green-800',
      'Chemistry': 'bg-orange-100 border-orange-300 text-orange-800',
      'Biology': 'bg-pink-100 border-pink-300 text-pink-800'
    };
    
    for (const [key, value] of Object.entries(colors)) {
      if (subject.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return 'bg-gray-100 border-gray-300 text-gray-800';
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const openModal = (teacher) => {
    setModalTeacher(teacher);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalTeacher(null);
  };

  const getCurrentWeekDates = () => {
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    return weekDays.map((_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return date;
    });
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const getFilteredTimetableData = () => {
    if (selectedTeacher === 'all') return routineData;

    const filteredData = {};
    Object.keys(routineData).forEach(day => {
      filteredData[day] = {};
      Object.entries(routineData[day]).forEach(([time, entries]) => {
        const matches = (entries || []).filter((entry) => (
          String(entry.teacherId) === String(selectedTeacher)
        ));
        if (matches.length > 0) {
          filteredData[day][time] = matches;
        }
      });
    });
    return filteredData;
  };

  const getTeacherSchedule = (teacherId) => {
    const schedule = {};
    weekDays.forEach(day => {
      schedule[day] = [];
      Object.entries(routineData[day] || {}).forEach(([slot, entries]) => {
        (entries || [])
          .filter((entry) => String(entry.teacherId) === String(teacherId))
          .forEach((entry) => {
            schedule[day].push({
              slot: slotLabelByKey.get(slot) || slot,
              ...entry,
            });
          });
      });
    });
    return schedule;
  };

  const timetableData = useMemo(() => {
    return getFilteredTimetableData();
  }, [routineData, selectedTeacher]);

  const exportTimetableToPDF = () => {
    const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
    const pageWidth = pdf.internal.pageSize.width;
    const currentDate = new Date().toLocaleDateString();
    let yPosition = 20;
    
    // Title
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text('Teacher Timetable', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    if (selectedTeacher !== 'all') {
      const teacher = teachers.find(t => String(t._id) === String(selectedTeacher));
      if (teacher) {
        pdf.text(`Teacher: ${teacher.name} - ${teacher.subject || ''}`, pageWidth / 2, yPosition, { align: 'center' });
      }
    } else {
      pdf.text('All Teachers Schedule', pageWidth / 2, yPosition, { align: 'center' });
    }
    
    yPosition += 8;
    pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;

    if (currentView === 'week') {
      // Weekly timetable
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Weekly Timetable', 20, yPosition);
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
          const entries = timetableData[day]?.[slot.key] || [];
          const classData = entries[0];
          if (classData) {
            const classLabel = `${classData.className}${classData.sectionName ? `-${classData.sectionName}` : ''}`;
            const text = `${classData.subject}\n${classLabel}\n${classData.room}\n${classData.teacher}`;
            pdf.text(text.split('\n')[0], xPosition, yPosition - 2);
            pdf.text(text.split('\n')[1], xPosition, yPosition + 2);
            pdf.text(text.split('\n')[2], xPosition, yPosition + 6);
          }
          xPosition += 45;
        });
        
        yPosition += 12;
      });
    }

    // Teacher-wise breakdown
    yPosition += 10;
    if (yPosition > 160) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Teacher Schedule Summary', 20, yPosition);
    yPosition += 12;

    const teachersToShow = selectedTeacher === 'all'
      ? teachers
      : [teachers.find(t => String(t._id) === String(selectedTeacher))].filter(Boolean);
    
    teachersToShow.forEach(teacher => {
      if (yPosition > 180) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text(`${teacher.name} (${teacher.subject || ''})`, 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      
      const schedule = getTeacherSchedule(teacher._id);
      Object.entries(schedule).forEach(([day, classes]) => {
        if (classes.length > 0) {
          pdf.setFont(undefined, 'bold');
          pdf.text(`${day}:`, 25, yPosition);
          pdf.setFont(undefined, 'normal');
          yPosition += 5;
          
          classes.forEach(classInfo => {
            const classLabel = `${classInfo.className}${classInfo.sectionName ? `-${classInfo.sectionName}` : ''}`;
            pdf.text(`  ${classInfo.slot}: ${classInfo.subject} - ${classLabel} (${classInfo.room})`, 25, yPosition);
            yPosition += 4;
          });
          yPosition += 2;
        }
      });
      yPosition += 5;
    });

    // Footer
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'italic');
    pdf.text('Generated by School Management System - Teacher Timetable Module', pageWidth / 2, pdf.internal.pageSize.height - 10, { align: 'center' });

    const teacherSuffix = selectedTeacher === 'all'
      ? 'all-teachers'
      : (teachers.find(t => String(t._id) === String(selectedTeacher))?.name || 'teacher').replace(/ /g, '-');
    pdf.save(`teacher-timetable-${teacherSuffix}-${currentDate.replace(/\//g, '-')}.pdf`);
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
              <h1 className="text-2xl font-bold text-gray-900">
                Teacher Timetable
              </h1>
              <p className="text-gray-600">Manage and view teaching schedules</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Schedule</span>
            </button>
            <button 
              onClick={exportTimetableToPDF}
              className="flex items-center space-x-2 border border-purple-400 text-black  px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls inspired by RoutineView */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-400 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Teacher Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select 
                value={selectedTeacher} 
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Teachers</option>
                {teachers.map(teacher => (
                  <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                ))}
              </select>
            </div>
            
            {/* View Toggle matching RoutineView style */}
            <div className="flex bg-white rounded-lg shadow-sm border border-purple-400 p-1">
              <button
                onClick={() => setCurrentView('week')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'week' 
                    ? 'bg-indigo-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid size={16} className="inline mr-1" />
                Week
              </button>
              <button
                onClick={() => setCurrentView('day')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'day' 
                    ? 'bg-indigo-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List size={16} className="inline mr-1" />
                Day
              </button>
            </div>
          </div>

          {/* Week Navigation */}
          {currentView === 'week' && (
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-purple-400">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => navigateWeek('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Week of</div>
                  <div className="font-semibold text-gray-900">
                    {getCurrentWeekDates()[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                    {getCurrentWeekDates()[weekDays.length - 1].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <button 
                  onClick={() => navigateWeek('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Day Selection for Day View */}
          {currentView === 'day' && (
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-purple-400">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {weekDays.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Week View with RoutineView styling */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-purple-400 p-6 mb-6 text-sm text-gray-600">
          Loading timetable...
        </div>
      )}
      {!loading && error && (
        <div className="bg-white rounded-xl shadow-sm border border-red-300 p-6 mb-6 text-sm text-red-600">
          {error}
        </div>
      )}
      {!loading && !error && currentView === 'week' && (
        <div className="bg-white rounded-xl shadow-sm border border-purple-400 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedTeacher === 'all'
                ? 'All Teachers'
                : (teachers.find(t => String(t._id) === String(selectedTeacher))?.name || 'Teacher') + "'s"} Weekly Schedule
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-3 bg-gray-50 font-medium text-gray-700 text-center">Time</th>
                  {weekDays.map((day, index) => {
                    const date = getCurrentWeekDates()[index];
                    const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day.toLowerCase();
                    return (
                      <th key={day} className={`p-3 font-medium text-center ${
                        isToday ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-50 text-gray-700'
                      }`}>
                        <div className="text-sm">{day.substring(0, 3)}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot.key} className="hover:bg-gray-50 transition-colors min-h-16">
                    <td className="p-3 bg-gray-50 text-sm text-gray-600 text-center border-r border-gray-200">
                      {timeSlot.label}
                    </td>
                    {weekDays.map(day => {
                      const entries = timetableData[day]?.[timeSlot.key] || [];
                      const classData = entries[0];
                      const extraCount = entries.length > 1 ? entries.length - 1 : 0;
                      
                      if (classData) {
                        return (
                          <td key={`${day}-${timeSlot.key}`} className="px-4 py-4">
                            <div className={`p-3 rounded-lg border-l-4 ${getSubjectColor(classData.subject)} group hover:shadow-md transition-all cursor-pointer`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-bold text-sm mb-2 line-clamp-1">{classData.subject}</h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-xs">
                                      <User className="w-3 h-3 text-gray-500" />
                                      <span className="text-gray-600 font-medium">{classData.teacher}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs">
                                      <Users className="w-3 h-3 text-gray-500" />
                                      <span className="text-gray-600">
                                        {classData.className}{classData.sectionName ? `-${classData.sectionName}` : ''}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs">
                                      <MapPin className="w-3 h-3 text-gray-500" />
                                      <span className="text-gray-600">{classData.room}</span>
                                    </div>
                                    {extraCount > 0 && (
                                      <div className="text-[10px] text-gray-500">+{extraCount} more</div>
                                    )}
                                  </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col space-y-1">
                                  <button className="p-2 hover:bg-white hover:bg-opacity-70 rounded-lg transition-all">
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button className="p-2 hover:bg-white hover:bg-opacity-70 rounded-lg transition-all">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        );
                      } else {
                        return (
                          <td key={`${day}-${timeSlot.key}`} className="px-4 py-4">
                            <div className="p-3 border border-dashed border-gray-200 rounded-lg text-center text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors cursor-pointer">
                              <Plus className="w-4 h-4 mx-auto mb-1" />
                              <span className="text-xs">Add Class</span>
                            </div>
                          </td>
                        );
                      }
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Day Selector (RoutineView style) */}
      {!loading && !error && currentView === 'day' && (
        <div className="bg-white rounded-xl shadow-sm border border-purple-400 p-6 mb-6">
          <div className="grid grid-cols-5 gap-2">
            {weekDays.map((day) => {
              const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day.toLowerCase();
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
                    {Object.values(timetableData[day] || {}).length} items
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Enhanced Day View with RoutineView styling */}
      {!loading && !error && currentView === 'day' && (
        <div className="bg-white rounded-xl shadow-sm border border-purple-400">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedDay} Schedule
                {new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === selectedDay.toLowerCase() && (
                  <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">Today</span>
                )}
              </h2>
              <div className="text-sm text-gray-500">
                {Object.values(timetableData[selectedDay] || {}).length} items
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {Object.values(timetableData[selectedDay] || {}).length > 0 ? (
              <div className="space-y-4">
                {timeSlots.map((timeSlot) => {
                  const entries = timetableData[selectedDay]?.[timeSlot.key] || [];
                  const classData = entries[0];
                  const extraCount = entries.length > 1 ? entries.length - 1 : 0;
                  
                  if (!classData) return null;
                  
                  return (
                    <div key={timeSlot.key} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all hover:border-indigo-300">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-lg ${getSubjectColor(classData.subject).includes('blue') ? 'bg-blue-500' : 
                          getSubjectColor(classData.subject).includes('green') ? 'bg-green-500' :
                          getSubjectColor(classData.subject).includes('orange') ? 'bg-orange-500' :
                          getSubjectColor(classData.subject).includes('purple') ? 'bg-purple-500' :
                          getSubjectColor(classData.subject).includes('pink') ? 'bg-pink-500' :
                          'bg-indigo-500'} flex items-center justify-center text-white flex-shrink-0`}>
                          <BookOpen size={16} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{classData.subject}</h3>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getSubjectColor(classData.subject)} flex-shrink-0 ml-2`}>
                              Lecture
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Clock size={16} className="text-gray-400 flex-shrink-0" />
                              <span className="truncate">{timeSlot.label}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                              <span className="truncate">{classData.room}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <User size={16} className="text-gray-400 flex-shrink-0" />
                              <span className="truncate">{classData.teacher}</span>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Users size={16} className="text-gray-400 flex-shrink-0" />
                              <span className="truncate">
                                {classData.className}{classData.sectionName ? `-${classData.sectionName}` : ''}
                              </span>
                            </div>
                            {extraCount > 0 && (
                              <div className="mt-1 text-xs text-gray-500">+{extraCount} more</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedule Today</h3>
                <p className="text-gray-500">No classes scheduled for {selectedDay}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Teacher Statistics (RoutineView style) */}
      {!loading && !error && selectedTeacher === 'all' && currentView === 'week' && (
        <div className="bg-white rounded-xl shadow-sm border border-purple-400">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Teacher Statistics</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {teachers.length}
                </div>
                <div className="text-sm text-blue-800">Total Teachers</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(timetableData)
                    .flatMap(day => Object.values(day))
                    .reduce((total, entries) => total + entries.length, 0)}
                </div>
                <div className="text-sm text-green-800">Total Classes</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(Object.values(timetableData)
                    .flatMap(day => Object.values(day))
                    .flatMap(entries => entries.map(c => `${c.className}${c.sectionName ? `-${c.sectionName}` : ''}`))
                  ).size}
                </div>
                <div className="text-sm text-purple-800">Unique Classes</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(Object.values(timetableData)
                    .flatMap(day => Object.values(day))
                    .flatMap(entries => entries.map(c => c.room))
                  ).size}
                </div>
                <div className="text-sm text-orange-800">Rooms Used</div>
              </div>
              
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">
                  {new Set(Object.values(timetableData)
                    .flatMap(day => Object.values(day))
                    .flatMap(entries => entries.map(c => c.subject))
                  ).size}
                </div>
                <div className="text-sm text-pink-800">Subjects</div>
              </div>
            </div>
            
            {/* Teacher Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map(teacher => {
                const teacherClasses = Object.values(timetableData)
                  .flatMap(day => Object.values(day))
                  .flatMap(entries => entries.filter(classData => String(classData.teacherId) === String(teacher._id)));
                
                return (
                  <div key={teacher._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-indigo-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                        <p className="text-sm text-gray-600">{teacher.subject || ''}</p>
                      </div>
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Weekly Classes</span>
                        <span className="font-medium">{teacherClasses.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Unique Classes</span>
                        <span className="font-medium">
                          {new Set(teacherClasses.map(c => `${c.className}${c.sectionName ? `-${c.sectionName}` : ''}`)).size}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 transition-colors"
                      onClick={() => openModal(teacher)}
                    >
                      View Schedule
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal with RoutineView styling */}
      {modalOpen && modalTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-lg border border-purple-400">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{modalTeacher.name}</h2>
                  <p className="text-gray-600">{modalTeacher.subject || ''} - Weekly Schedule</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {weekDays.map(day => {
                  const daySchedule = getTeacherSchedule(modalTeacher._id)[day];
                  
                  return (
                    <div key={day} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                          {day}
                        </h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {daySchedule.length} class{daySchedule.length !== 1 ? 'es' : ''}
                        </span>
                      </div>
                      
                      {daySchedule.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No classes scheduled</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {daySchedule.map((classInfo, index) => (
                            <div key={index} className={`p-4 rounded-lg border-l-4 ${getSubjectColor(classInfo.subject)} flex items-center justify-between hover:shadow-sm transition-shadow`}>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-sm">{classInfo.subject}</h4>
                                  <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                                    {classInfo.slot}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                  <div className="flex items-center space-x-1">
                                    <Users className="w-3 h-3 text-gray-500" />
                                    <span className="text-gray-600">Class:</span>
                                    <span className="font-medium">
                                      {classInfo.className}{classInfo.sectionName ? `-${classInfo.sectionName}` : ''}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="w-3 h-3 text-gray-500" />
                                    <span className="text-gray-600">Room:</span>
                                    <span className="font-medium">{classInfo.room}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <button className="p-2 hover:bg-white hover:bg-opacity-50 rounded transition-colors">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-white hover:bg-opacity-50 rounded transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Total weekly classes: {Object.values(getTeacherSchedule(modalTeacher._id)).flat().length}
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-100 transition-colors">
                    Export Schedule
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherTimetable;
