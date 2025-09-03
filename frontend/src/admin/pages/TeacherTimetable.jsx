import React, { useState } from 'react';
import { Calendar, Clock, Users, MapPin, Filter, Download, Plus, Edit3, Trash2, X } from 'lucide-react';

const TeacherTimetable = () => {
  const [currentView, setCurrentView] = useState('week');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [teacherDetailView, setTeacherDetailView] = useState(null);
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
  '08:00 - 09:00': { teacher: 'Dr. Rakesh Sharma', subject: 'Advanced Mathematics', class: 'Grade 12A', room: 'Room 101' },
  '09:00 - 10:00': { teacher: 'Prof. Priya Verma', subject: 'Physics Lab', class: 'Grade 11B', room: 'Lab 201' },
  '10:30 - 11:30': { teacher: 'Ms. Anjali Mehra', subject: 'English Literature', class: 'Grade 10A', room: 'Room 205' },
  '11:30 - 12:30': { teacher: 'Dr. Rakesh Sharma', subject: 'Calculus', class: 'Grade 12B', room: 'Room 101' },
  '13:30 - 14:30': { teacher: 'Mr. Arjun Singh', subject: 'Organic Chemistry', class: 'Grade 11A', room: 'Lab 301' },
  '14:30 - 15:30': { teacher: 'Dr. Kavita Rao', subject: 'Biology', class: 'Grade 10B', room: 'Room 105' }
    },
    'Tuesday': {
  '08:00 - 09:00': { teacher: 'Prof. Priya Verma', subject: 'Quantum Physics', class: 'Grade 12A', room: 'Room 202' },
  '09:00 - 10:00': { teacher: 'Ms. Anjali Mehra', subject: 'Creative Writing', class: 'Grade 11A', room: 'Room 205' },
  '10:30 - 11:30': { teacher: 'Dr. Kavita Rao', subject: 'Molecular Biology', class: 'Grade 12B', room: 'Lab 105' },
  '11:30 - 12:30': { teacher: 'Mr. Arjun Singh', subject: 'Chemical Analysis', class: 'Grade 11B', room: 'Lab 301' },
  '13:30 - 14:30': { teacher: 'Dr. Rakesh Sharma', subject: 'Statistics', class: 'Grade 10A', room: 'Room 101' },
  '15:30 - 16:30': { teacher: 'Prof. Priya Verma', subject: 'Physics Tutorial', class: 'Grade 10B', room: 'Room 202' }
    },
    'Wednesday': {
  '08:00 - 09:00': { teacher: 'Ms. Anjali Mehra', subject: 'Shakespeare Studies', class: 'Grade 12A', room: 'Room 205' },
  '09:00 - 10:00': { teacher: 'Dr. Kavita Rao', subject: 'Genetics Lab', class: 'Grade 11A', room: 'Lab 105' },
  '10:30 - 11:30': { teacher: 'Mr. Arjun Singh', subject: 'Inorganic Chemistry', class: 'Grade 12B', room: 'Room 301' },
  '11:30 - 12:30': { teacher: 'Dr. Rakesh Sharma', subject: 'Trigonometry', class: 'Grade 11B', room: 'Room 101' },
  '13:30 - 14:30': { teacher: 'Prof. Priya Verma', subject: 'Mechanics', class: 'Grade 10A', room: 'Room 202' },
  '14:30 - 15:30': { teacher: 'Ms. Anjali Mehra', subject: 'Poetry Analysis', class: 'Grade 10B', room: 'Room 205' }
    },
    'Thursday': {
  '08:00 - 09:00': { teacher: 'Dr. Kavita Rao', subject: 'Ecology', class: 'Grade 12A', room: 'Room 105' },
  '09:00 - 10:00': { teacher: 'Mr. Arjun Singh', subject: 'Analytical Chemistry', class: 'Grade 12B', room: 'Lab 301' },
  '10:30 - 11:30': { teacher: 'Dr. Rakesh Sharma', subject: 'Geometry', class: 'Grade 10A', room: 'Room 101' },
  '11:30 - 12:30': { teacher: 'Prof. Priya Verma', subject: 'Thermodynamics', class: 'Grade 11A', room: 'Room 202' },
  '13:30 - 14:30': { teacher: 'Ms. Anjali Mehra', subject: 'Grammar & Composition', class: 'Grade 11B', room: 'Room 205' },
  '15:30 - 16:30': { teacher: 'Dr. Kavita Rao', subject: 'Biology Lab', class: 'Grade 10B', room: 'Lab 105' }
    },
    'Friday': {
  '08:00 - 09:00': { teacher: 'Mr. Arjun Singh', subject: 'Physical Chemistry', class: 'Grade 12A', room: 'Lab 301' },
  '09:00 - 10:00': { teacher: 'Dr. Rakesh Sharma', subject: 'Algebra Review', class: 'Grade 11A', room: 'Room 101' },
  '10:30 - 11:30': { teacher: 'Prof. Priya Verma', subject: 'Wave Physics', class: 'Grade 12B', room: 'Room 202' },
  '11:30 - 12:30': { teacher: 'Ms. Anjali Mehra', subject: 'Literature Discussion', class: 'Grade 11B', room: 'Room 205' },
  '13:30 - 14:30': { teacher: 'Dr. Kavita Rao', subject: 'Human Anatomy', class: 'Grade 10A', room: 'Room 105' },
  '14:30 - 15:30': { teacher: 'Mr. Arjun Singh', subject: 'Chemistry Review', class: 'Grade 10B', room: 'Room 301' }
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
      {/* Header */}
      <div className="bg-gradient-to-r from-red-400 to-red-500 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Teacher Timetable</h1>
            <p className="text-red-100">Manage and view teaching schedules</p>
          </div>
          <div className="flex items-center space-x-4">
            <Calendar className="w-12 h-12 text-red-200" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select 
                value={selectedTeacher} 
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Teachers</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentView('week')}
                className={`px-4 py-2 rounded-md transition-all ${
                  currentView === 'week' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Week View
              </button>
              <button
                onClick={() => setCurrentView('day')}
                className={`px-4 py-2 rounded-md transition-all ${
                  currentView === 'day' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Day View
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 bg-blue-600 text-black px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Schedule</span>
            </button>
            <button className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Timetable */}
      {currentView === 'week' && selectedTeacher !== 'all' && !teacherDetailView && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">{teachers.find(t => t.id === Number(selectedTeacher))?.name}'s Weekly Schedule</h2>
            <p className="text-gray-600">{formatDate(currentWeek)} - Week View</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 w-32">Time</th>
                  {weekDays.map(day => (
                    <th key={day} className="px-4 py-4 text-left text-sm font-medium text-gray-500 min-w-48">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timeSlots.map(timeSlot => (
                  <tr key={timeSlot} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{timeSlot}</span>
                      </div>
                    </td>
                    {weekDays.map(day => {
                      const classData = timetableData[day]?.[timeSlot];
                      if (classData && classData.teacher === teachers.find(t => t.id === Number(selectedTeacher))?.name) {
                        return (
                          <td key={`${day}-${timeSlot}`} className="px-4 py-4">
                            <div className={`p-3 rounded-lg border-l-4 ${getSubjectColor(classData.subject)} group hover:shadow-md transition-all cursor-pointer`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm mb-1">{classData.subject}</h4>
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-1 text-xs">
                                      <Users className="w-3 h-3" />
                                      <span>{classData.class}</span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-xs">
                                      <MapPin className="w-3 h-3" />
                                      <span>{classData.room}</span>
                                    </div>
                                    <p className="text-xs font-medium">{classData.teacher}</p>
                                  </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                  <button className="p-1 hover:bg-white hover:bg-opacity-50 rounded">
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button className="p-1 hover:bg-white hover:bg-opacity-50 rounded">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        );
                      } else {
                        return (
                          <td key={`${day}-${timeSlot}`} className="px-4 py-4">
                            <div className="p-3 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors cursor-pointer">
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

      {/* Teacher Detail View (Teacher-wise List) */}
      {teacherDetailView && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{teachers.find(t => t.id === teacherDetailView)?.name}'s Classes</h2>
              <p className="text-gray-600">All classes for the week, grouped by day</p>
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setTeacherDetailView(null)}
            >
              Weekly Grid View
            </button>
          </div>
          <div className="p-6">
            {weekDays.map(day => {
              const classes = Object.entries(timetableData[day] || {}).filter(
                ([slot, classData]) => classData.teacher === teachers.find(t => t.id === teacherDetailView)?.name
              );
              return (
                <div key={day} className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">{day}</h3>
                  {classes.length === 0 ? (
                    <div className="text-gray-400 text-sm mb-2">No classes</div>
                  ) : (
                    <ul className="space-y-2">
                      {classes.map(([slot, classData]) => (
                        <li key={slot} className={`p-4 rounded-lg border-l-4 ${getSubjectColor(classData.subject)} flex items-center justify-between`}>
                          <div>
                            <div className="font-semibold text-sm">{classData.subject}</div>
                            <div className="text-xs text-gray-600">{slot} | {classData.class} | {classData.room}</div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="p-1 hover:bg-white hover:bg-opacity-50 rounded">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button className="p-1 hover:bg-white hover:bg-opacity-50 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Teacher Summary Cards */}
      {selectedTeacher === 'all' && !teacherDetailView && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map(teacher => {
            const teacherClasses = Object.values(timetableData).flatMap(day => 
              Object.values(day).filter(classData => classData.teacher === teacher.name)
            );
            return (
              <div key={teacher.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                    <p className="text-sm text-gray-600">{teacher.subject}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Weekly Classes</span>
                    <span className="font-medium">{teacherClasses.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subjects</span>
                    <span className="font-medium">{new Set(teacherClasses.map(c => c.subject)).size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Classes</span>
                    <span className="font-medium">{new Set(teacherClasses.map(c => c.class)).size}</span>
                  </div>
                </div>
                <button
                  className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => openModal(teacher)}
                >
                  View Full Schedule
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && modalTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div>
                <h2 className="text-2xl font-bold">{modalTeacher.name}</h2>
                <p className="text-blue-100">{modalTeacher.subject} - Weekly Schedule</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* ...existing code... */}
              <div className="space-y-6">
                {weekDays.map(day => {
                  const daySchedule = getTeacherSchedule(modalTeacher.name)[day];
                  return (
                    <div key={day} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-blue-500" />
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
            <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
              <div className="flex flex-col md:flex-row w-full md:justify-between md:items-center gap-4 sticky bottom-0 left-0 bg-gray-50 z-10">
                <div className="text-sm text-gray-600">
                  Total weekly classes: {Object.values(getTeacherSchedule(modalTeacher.name)).flat().length}
                </div>
                <div className="flex flex-row gap-3 md:justify-end md:items-center">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                    Export Schedule
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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