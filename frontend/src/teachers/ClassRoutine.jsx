import React, { useState } from 'react';
import { Clock, MapPin, Users, BookOpen, Calendar, ChevronLeft, ChevronRight, Filter, Search, Bell, Info, Sparkles } from 'lucide-react';
import { timetableApi } from '../admin/utils/timetableApi';

const ClassRoutine = () => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // week, day
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 1 : new Date().getDay());
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState('');

  // Sample teacher schedule data
  const teacherSchedule = {
    teacherName: "John Smith",
    teacherId: "T001",
    subject: "Mathematics",
    classes: {
      1: [ // Monday
        {
          id: 1,
          time: "08:00 - 08:45",
          subject: "Mathematics",
          class: "10-A",
          room: "Room 101",
          topic: "Quadratic Equations",
          students: 32,
          type: "regular"
        },
        {
          id: 2,
          time: "09:00 - 09:45",
          subject: "Mathematics",
          class: "10-B",
          room: "Room 101",
          topic: "Trigonometry Basics",
          students: 28,
          type: "regular"
        },
        {
          id: 3,
          time: "11:00 - 11:45",
          subject: "Mathematics",
          class: "9-A",
          room: "Room 203",
          topic: "Linear Equations",
          students: 30,
          type: "regular"
        },
        {
          id: 4,
          time: "14:00 - 14:45",
          subject: "Extra Classes",
          class: "10-A",
          room: "Room 101",
          topic: "Problem Solving Session",
          students: 15,
          type: "extra"
        }
      ],
      2: [ // Tuesday
        {
          id: 5,
          time: "08:00 - 08:45",
          subject: "Mathematics",
          class: "9-B",
          room: "Room 102",
          topic: "Geometry Fundamentals",
          students: 29,
          type: "regular"
        },
        {
          id: 6,
          time: "10:00 - 10:45",
          subject: "Mathematics",
          class: "10-A",
          room: "Room 101",
          topic: "Quadratic Equations - Practice",
          students: 32,
          type: "regular"
        },
        {
          id: 7,
          time: "11:00 - 11:45",
          subject: "Mathematics",
          class: "10-B",
          room: "Room 101",
          topic: "Trigonometry - Advanced",
          students: 28,
          type: "regular"
        },
        {
          id: 8,
          time: "15:00 - 15:45",
          subject: "Tutorial",
          class: "Mixed",
          room: "Library",
          topic: "Doubt Clearing Session",
          students: 12,
          type: "tutorial"
        }
      ],
      3: [ // Wednesday
        {
          id: 9,
          time: "08:00 - 08:45",
          subject: "Mathematics",
          class: "10-A",
          room: "Room 101",
          topic: "Functions and Graphs",
          students: 32,
          type: "regular"
        },
        {
          id: 10,
          time: "09:00 - 09:45",
          subject: "Mathematics",
          class: "9-A",
          room: "Room 203",
          topic: "Linear Equations - Advanced",
          students: 30,
          type: "regular"
        },
        {
          id: 11,
          time: "10:00 - 10:45",
          subject: "Free Period",
          class: "-",
          room: "Staff Room",
          topic: "Preparation Time",
          students: 0,
          type: "free"
        },
        {
          id: 12,
          time: "14:00 - 14:45",
          subject: "Mathematics",
          class: "10-B",
          room: "Room 101",
          topic: "Statistics Introduction",
          students: 28,
          type: "regular"
        }
      ],
      4: [ // Thursday
        {
          id: 13,
          time: "08:00 - 08:45",
          subject: "Mathematics",
          class: "9-B",
          room: "Room 102",
          topic: "Geometry - Circles",
          students: 29,
          type: "regular"
        },
        {
          id: 14,
          time: "09:00 - 09:45",
          subject: "Mathematics",
          class: "10-A",
          room: "Room 101",
          topic: "Functions - Practice",
          students: 32,
          type: "regular"
        },
        {
          id: 15,
          time: "11:00 - 11:45",
          subject: "Mathematics",
          class: "10-B",
          room: "Room 101",
          topic: "Statistics - Data Analysis",
          students: 28,
          type: "regular"
        },
        {
          id: 16,
          time: "13:00 - 13:45",
          subject: "Faculty Meeting",
          class: "All Teachers",
          room: "Conference Room",
          topic: "Monthly Review",
          students: 0,
          type: "meeting"
        }
      ],
      5: [ // Friday
        {
          id: 17,
          time: "08:00 - 08:45",
          subject: "Mathematics",
          class: "9-A",
          room: "Room 203",
          topic: "Revision Session",
          students: 30,
          type: "regular"
        },
        {
          id: 18,
          time: "09:00 - 09:45",
          subject: "Mathematics",
          class: "9-B",
          room: "Room 102",
          topic: "Test Preparation",
          students: 29,
          type: "regular"
        },
        {
          id: 19,
          time: "10:00 - 10:45",
          subject: "Mathematics",
          class: "10-A",
          room: "Room 101",
          topic: "Weekly Test",
          students: 32,
          type: "test"
        },
        {
          id: 20,
          time: "11:00 - 11:45",
          subject: "Mathematics",
          class: "10-B",
          room: "Room 101",
          topic: "Weekly Test",
          students: 28,
          type: "test"
        }
      ],
      6: [ // Saturday
        {
          id: 21,
          time: "08:00 - 08:45",
          subject: "Extra Classes",
          class: "10-A & 10-B",
          room: "Room 101",
          topic: "Competitive Exam Prep",
          students: 20,
          type: "extra"
        },
        {
          id: 22,
          time: "10:00 - 10:45",
          subject: "Mathematics",
          class: "9-A",
          room: "Room 203",
          topic: "Project Discussion",
          students: 30,
          type: "project"
        }
      ]
    }
  };

  const timeSlots = [
    "08:00 - 08:45",
    "09:00 - 09:45",
    "10:00 - 10:45",
    "11:00 - 11:45",
    "12:00 - 12:45", // Lunch break typically
    "13:00 - 13:45",
    "14:00 - 14:45",
    "15:00 - 15:45"
  ];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getClassTypeColor = (type) => {
    switch (type) {
      case 'regular':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'extra':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'tutorial':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'test':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'project':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'meeting':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'free':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(selectedWeek.getDate() + (direction * 7));
    setSelectedWeek(newDate);
  };

  const weekDates = getWeekDates(selectedWeek);
  const currentDay = new Date().getDay();
  const todayClasses = teacherSchedule.classes[currentDay === 0 ? 7 : currentDay] || [];
  const upcomingClass = todayClasses.find(cls => {
    const now = new Date();
    const classTime = cls.time.split(' - ')[0];
    const [hours, minutes] = classTime.split(':').map(Number);
    const classDateTime = new Date();
    classDateTime.setHours(hours, minutes, 0, 0);
    return classDateTime > now;
  });

  const handleAutoGenerate = async () => {
    const ok = window.confirm('Auto-generate routines for all classes? This overwrites existing timetables.');
    if (!ok) return;

    try {
      setGenerating(true);
      setGenerateMessage('');
      const result = await timetableApi.autoGenerate({ overwriteExisting: true });
      const total = result?.totalGenerated || 0;
      const failed = result?.totalErrors || 0;
      const firstError = result?.errors?.[0];
      const errorLabel = firstError
        ? ` First error: ${firstError.className || firstError.classId}${firstError.sectionName ? `-${firstError.sectionName}` : ''} — ${firstError.error}`
        : '';
      setGenerateMessage(`Generated ${total} timetable${total !== 1 ? 's' : ''}.${failed ? ` ${failed} failed.` : ''}${errorLabel}`);
    } catch (err) {
      setGenerateMessage(err.message || 'Auto-generation failed (admin access required).');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 mb-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Class Routine</h1>
            <p className="text-indigo-100">View your teaching schedule and upcoming classes</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={handleAutoGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Sparkles className="h-4 w-4" />
                {generating ? 'Generating...' : 'Auto Generate (Admin)'}
              </button>
              <a
                href="/admin/routines"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Customize / Edit
              </a>
            </div>
            {generateMessage && (
              <div className="mt-3 rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-xs text-white">
                {generateMessage}
              </div>
            )}
            <div className="flex items-center mt-2 space-x-4">
              <span className="text-indigo-200">Teacher: {teacherSchedule.teacherName}</span>
              <span className="text-indigo-200">•</span>
              <span className="text-indigo-200">Subject: {teacherSchedule.subject}</span>
            </div>
          </div>
          {upcomingClass && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Bell className="w-4 h-4" />
                <span className="text-sm font-medium">Next Class</span>
              </div>
              <div className="text-sm">
                <p className="font-medium">{upcomingClass.class} - {upcomingClass.subject}</p>
                <p className="text-indigo-200">{upcomingClass.time} • {upcomingClass.room}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Classes</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{todayClasses.length}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Weekly Classes</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {Object.values(teacherSchedule.classes).flat().length}
              </h3>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {Object.values(teacherSchedule.classes).flat()
                  .reduce((total, cls) => total + cls.students, 0)}
              </h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Classes Today</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {todayClasses.filter(cls => cls.type === 'regular').length}
              </h3>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-lg font-semibold text-gray-800">
                Week of {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
              </h2>
              <button
                onClick={() => navigateWeek(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'week' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'day' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Day View
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'week' ? (
        /* Weekly Schedule View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-8 gap-px bg-gray-200">
                <div className="bg-gray-50 p-4 font-medium text-gray-700">Time</div>
                {weekDates.slice(1).map((date, index) => {
                  const dayIndex = index + 1;
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={dayIndex}
                      className={`p-4 text-center font-medium ${
                        isToday ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div>{shortDayNames[dayIndex]}</div>
                      <div className="text-sm text-gray-500">{date.getDate()}</div>
                    </div>
                  );
                })}
              </div>

              {/* Time slots */}
              <div className="divide-y divide-gray-200">
                {timeSlots.map((timeSlot) => (
                  <div key={timeSlot} className="grid grid-cols-8 gap-px bg-gray-200 min-h-[80px]">
                    <div className="bg-white p-4 flex items-center">
                      <span className="text-sm font-medium text-gray-600">{timeSlot}</span>
                    </div>
                    {[1, 2, 3, 4, 5, 6].map((dayIndex) => {
                      const dayClasses = teacherSchedule.classes[dayIndex] || [];
                      const classForSlot = dayClasses.find(cls => cls.time === timeSlot);
                      
                      return (
                        <div key={dayIndex} className="bg-white p-2">
                          {classForSlot ? (
                            <div className={`p-3 rounded-lg border-l-4 h-full ${getClassTypeColor(classForSlot.type)}`}>
                              <div className="text-sm font-medium">{classForSlot.class}</div>
                              <div className="text-xs text-gray-600 mt-1">{classForSlot.topic}</div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {classForSlot.room}
                                </span>
                                <span className="text-xs flex items-center">
                                  <Users className="w-3 h-3 mr-1" />
                                  {classForSlot.students}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center">
                              <span className="text-gray-400 text-xs">Free</span>
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
      ) : (
        /* Day View */
        <div className="space-y-6">
          {/* Day Selector */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {weekDates.slice(1).map((date, index) => {
                const dayIndex = index + 1;
                const isSelected = selectedDay === dayIndex;
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <button
                    key={dayIndex}
                    onClick={() => setSelectedDay(dayIndex)}
                    className={`flex-shrink-0 px-4 py-3 rounded-lg text-center transition-colors ${
                      isSelected
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : isToday
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{shortDayNames[dayIndex]}</div>
                    <div className="text-sm">{date.getDate()}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {dayNames[selectedDay]} Schedule
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {(teacherSchedule.classes[selectedDay] || []).length > 0 ? (
                  teacherSchedule.classes[selectedDay].map((classItem) => (
                    <div
                      key={classItem.id}
                      className={`p-4 rounded-lg border-l-4 ${getClassTypeColor(classItem.type)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-800">{classItem.time}</span>
                            <span className="px-2 py-1 bg-white/50 rounded text-xs font-medium">
                              {classItem.type.charAt(0).toUpperCase() + classItem.type.slice(1)}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {classItem.class} - {classItem.subject}
                          </h3>
                          <p className="text-gray-600 mb-3">{classItem.topic}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {classItem.room}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {classItem.students} students
                            </div>
                          </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Info className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No classes scheduled for this day</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassRoutine;
