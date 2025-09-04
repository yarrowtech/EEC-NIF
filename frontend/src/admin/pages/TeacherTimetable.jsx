import React, { useState } from 'react';
import { Calendar, Clock, Users, MapPin, Filter, Download, Plus, Edit3, Trash2, X, ChevronLeft, ChevronRight, User, BookOpen, Grid, List } from 'lucide-react';

const TeacherTimetable = ({ setShowAdminHeader }) => {
  setShowAdminHeader(true);
  
  const [currentView, setCurrentView] = useState('week');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTeacher, setModalTeacher] = useState(null);

  // Sample data
  const teachers = [
  { id: 1, name: 'Dr. Rakesh Sharma', subject: 'Mathematics' },
  { id: 2, name: 'Prof. Priya Verma', subject: 'Physics' },
  { id: 3, name: 'Ms. Anjali Mehra', subject: 'English Literature' },
  { id: 4, name: 'Mr. Arjun Singh', subject: 'Chemistry' },
  { id: 5, name: 'Dr. Kavita Rao', subject: 'Biology' }
  ];

  const timeSlots = [
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:30 - 11:30',
    '11:30 - 12:30',
    '13:30 - 14:30',
    '14:30 - 15:30',
    '15:30 - 16:30'
  ];

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const timetableData = {
    'Monday': {
  '08:00 - 09:00': { teacher: 'Dr. Rakesh Sharma', subject: 'Advanced Mathematics', class: 'Class 12A', room: 'Room 101' },
  '09:00 - 10:00': { teacher: 'Prof. Priya Verma', subject: 'Physics Lab', class: 'Class 11B', room: 'Lab 201' },
  '10:30 - 11:30': { teacher: 'Ms. Anjali Mehra', subject: 'English Literature', class: 'Class 10A', room: 'Room 205' },
  '11:30 - 12:30': { teacher: 'Dr. Rakesh Sharma', subject: 'Calculus', class: 'Class 12B', room: 'Room 101' },
  '13:30 - 14:30': { teacher: 'Mr. Arjun Singh', subject: 'Organic Chemistry', class: 'Class 11A', room: 'Lab 301' },
  '14:30 - 15:30': { teacher: 'Dr. Kavita Rao', subject: 'Biology', class: 'Class 10B', room: 'Room 105' }
    },
    'Tuesday': {
  '08:00 - 09:00': { teacher: 'Prof. Priya Verma', subject: 'Quantum Physics', class: 'Class 12A', room: 'Room 202' },
  '09:00 - 10:00': { teacher: 'Ms. Anjali Mehra', subject: 'Creative Writing', class: 'Class 11A', room: 'Room 205' },
  '10:30 - 11:30': { teacher: 'Dr. Kavita Rao', subject: 'Molecular Biology', class: 'Class 12B', room: 'Lab 105' },
  '11:30 - 12:30': { teacher: 'Mr. Arjun Singh', subject: 'Chemical Analysis', class: 'Class 11B', room: 'Lab 301' },
  '13:30 - 14:30': { teacher: 'Dr. Rakesh Sharma', subject: 'Statistics', class: 'Class 10A', room: 'Room 101' },
  '15:30 - 16:30': { teacher: 'Prof. Priya Verma', subject: 'Physics Tutorial', class: 'Class 10B', room: 'Room 202' }
    },
    'Wednesday': {
  '08:00 - 09:00': { teacher: 'Ms. Anjali Mehra', subject: 'Shakespeare Studies', class: 'Class 12A', room: 'Room 205' },
  '09:00 - 10:00': { teacher: 'Dr. Kavita Rao', subject: 'Genetics Lab', class: 'Class 11A', room: 'Lab 105' },
  '10:30 - 11:30': { teacher: 'Mr. Arjun Singh', subject: 'Inorganic Chemistry', class: 'Class 12B', room: 'Room 301' },
  '11:30 - 12:30': { teacher: 'Dr. Rakesh Sharma', subject: 'Trigonometry', class: 'Class 11B', room: 'Room 101' },
  '13:30 - 14:30': { teacher: 'Prof. Priya Verma', subject: 'Mechanics', class: 'Class 10A', room: 'Room 202' },
  '14:30 - 15:30': { teacher: 'Ms. Anjali Mehra', subject: 'Poetry Analysis', class: 'Class 10B', room: 'Room 205' }
    },
    'Thursday': {
  '08:00 - 09:00': { teacher: 'Dr. Kavita Rao', subject: 'Ecology', class: 'Class 12A', room: 'Room 105' },
  '09:00 - 10:00': { teacher: 'Mr. Arjun Singh', subject: 'Analytical Chemistry', class: 'Class 12B', room: 'Lab 301' },
  '10:30 - 11:30': { teacher: 'Dr. Rakesh Sharma', subject: 'Geometry', class: 'Class 10A', room: 'Room 101' },
  '11:30 - 12:30': { teacher: 'Prof. Priya Verma', subject: 'Thermodynamics', class: 'Class 11A', room: 'Room 202' },
  '13:30 - 14:30': { teacher: 'Ms. Anjali Mehra', subject: 'Grammar & Composition', class: 'Class 11B', room: 'Room 205' },
  '15:30 - 16:30': { teacher: 'Dr. Kavita Rao', subject: 'Biology Lab', class: 'Class 10B', room: 'Lab 105' }
    },
    'Friday': {
  '08:00 - 09:00': { teacher: 'Mr. Arjun Singh', subject: 'Physical Chemistry', class: 'Class 12A', room: 'Lab 301' },
  '09:00 - 10:00': { teacher: 'Dr. Rakesh Sharma', subject: 'Algebra Review', class: 'Class 11A', room: 'Room 101' },
  '10:30 - 11:30': { teacher: 'Prof. Priya Verma', subject: 'Wave Physics', class: 'Class 12B', room: 'Room 202' },
  '11:30 - 12:30': { teacher: 'Ms. Anjali Mehra', subject: 'Literature Discussion', class: 'Class 11B', room: 'Room 205' },
  '13:30 - 14:30': { teacher: 'Dr. Kavita Rao', subject: 'Human Anatomy', class: 'Class 10A', room: 'Room 105' },
  '14:30 - 15:30': { teacher: 'Mr. Arjun Singh', subject: 'Chemistry Review', class: 'Class 10B', room: 'Room 301' }
    }
  };

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
    if (selectedTeacher === 'all') return timetableData;
    
    const teacherName = teachers.find(t => t.id === Number(selectedTeacher))?.name;
    if (!teacherName) return timetableData;
    
    const filteredData = {};
    Object.keys(timetableData).forEach(day => {
      filteredData[day] = {};
      Object.entries(timetableData[day]).forEach(([time, classData]) => {
        if (classData.teacher === teacherName) {
          filteredData[day][time] = classData;
        }
      });
    });
    return filteredData;
  };

  const getTeacherSchedule = (teacherName) => {
    const schedule = {};
    weekDays.forEach(day => {
      schedule[day] = Object.entries(timetableData[day] || {})
        .filter(([slot, classData]) => classData.teacher === teacherName)
        .map(([slot, classData]) => ({ slot, ...classData }));
    });
    return schedule;
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
            <button className="flex items-center space-x-2 border border-purple-400 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
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
                  <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
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
                    {getCurrentWeekDates()[4].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
      {currentView === 'week' && (
        <div className="bg-white rounded-xl shadow-sm border border-purple-400 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedTeacher === 'all' ? 'All Teachers' : teachers.find(t => t.id === Number(selectedTeacher))?.name + "'s"} Weekly Schedule
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
                {timeSlots.map(timeSlot => (
                  <tr key={timeSlot} className="hover:bg-gray-50 transition-colors min-h-16">
                    <td className="p-3 bg-gray-50 text-sm text-gray-600 text-center border-r border-gray-200">
                      {timeSlot}
                    </td>
                    {weekDays.map(day => {
                      const filteredData = getFilteredTimetableData();
                      const classData = filteredData[day]?.[timeSlot];
                      
                      if (classData) {
                        return (
                          <td key={`${day}-${timeSlot}`} className="px-4 py-4">
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
                                      <span className="text-gray-600">{classData.class}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs">
                                      <MapPin className="w-3 h-3 text-gray-500" />
                                      <span className="text-gray-600">{classData.room}</span>
                                    </div>
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
                          <td key={`${day}-${timeSlot}`} className="px-4 py-4">
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
      {currentView === 'day' && (
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
                    {Object.values(getFilteredTimetableData()[day] || {}).length} items
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Enhanced Day View with RoutineView styling */}
      {currentView === 'day' && (
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
                {Object.values(getFilteredTimetableData()[selectedDay] || {}).length} items
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {Object.values(getFilteredTimetableData()[selectedDay] || {}).length > 0 ? (
              <div className="space-y-4">
                {timeSlots.map(timeSlot => {
                  const filteredData = getFilteredTimetableData();
                  const classData = filteredData[selectedDay]?.[timeSlot];
                  
                  if (!classData) return null;
                  
                  return (
                    <div key={timeSlot} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all hover:border-indigo-300">
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
                              <span className="truncate">{timeSlot}</span>
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
                              <span className="truncate">{classData.class}</span>
                            </div>
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
      {selectedTeacher === 'all' && currentView === 'week' && (
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
                  {Object.values(timetableData).flatMap(day => Object.values(day)).length}
                </div>
                <div className="text-sm text-green-800">Total Classes</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(Object.values(timetableData).flatMap(day => Object.values(day)).map(c => c.class)).size}
                </div>
                <div className="text-sm text-purple-800">Unique Classes</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(Object.values(timetableData).flatMap(day => Object.values(day)).map(c => c.room)).size}
                </div>
                <div className="text-sm text-orange-800">Rooms Used</div>
              </div>
              
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">
                  {new Set(Object.values(timetableData).flatMap(day => Object.values(day)).map(c => c.subject)).size}
                </div>
                <div className="text-sm text-pink-800">Subjects</div>
              </div>
            </div>
            
            {/* Teacher Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map(teacher => {
                const teacherClasses = Object.values(timetableData).flatMap(day => 
                  Object.values(day).filter(classData => classData.teacher === teacher.name)
                );
                
                return (
                  <div key={teacher.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-indigo-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                        <p className="text-sm text-gray-600">{teacher.subject}</p>
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
                        <span className="font-medium">{new Set(teacherClasses.map(c => c.class)).size}</span>
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
                  <p className="text-gray-600">{modalTeacher.subject} - Weekly Schedule</p>
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
                  const daySchedule = getTeacherSchedule(modalTeacher.name)[day];
                  
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
                                    <span className="font-medium">{classInfo.class}</span>
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
                  Total weekly classes: {Object.values(getTeacherSchedule(modalTeacher.name)).flat().length}
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
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