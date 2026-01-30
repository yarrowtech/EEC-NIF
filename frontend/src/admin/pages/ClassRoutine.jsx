import React, { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import { Calendar, Clock, Filter, Download, Plus, Edit3, Trash2, Search, MapPin, Users } from 'lucide-react';
import { academicApi, timetableApi, convertTo12Hour } from '../utils/timetableApi';

const ClassRoutine = () => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
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

  const filterEntries = (entries) => {
    return (entries || []).filter((entry) => {
      const classOk = selectedClass === 'all' || String(entry.classId) === String(selectedClass);
      const sectionOk = selectedSection === 'all' || String(entry.sectionId) === String(selectedSection);
      return classOk && sectionOk;
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

  const getSubjectColor = (subject) => {
    const colors = {
      'Mathematics': 'bg-blue-100 border-blue-300 text-blue-800',
      'Physics': 'bg-purple-100 border-purple-300 text-purple-800',
      'English': 'bg-green-100 border-green-300 text-green-800',
      'Chemistry': 'bg-orange-100 border-orange-300 text-orange-800',
      'Biology': 'bg-pink-100 border-pink-300 text-pink-800'
    };
    return colors[subject] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

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
    <div className="h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 flex flex-col">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full bg-white/90 rounded-2xl shadow-2xl m-4 border border-yellow-200 overflow-hidden">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 p-8 bg-white/90 border-b border-yellow-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-yellow-700">Class Routine</h1>
              <p className="text-gray-600 mt-2">Manage and view class schedules</p>
            </div>
            <div className="flex items-center space-x-4">
              <Calendar className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search routine..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </select>

              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">All Sections</option>
                {sections
                  .filter((sec) => selectedClass === 'all' || String(sec.classId) === String(selectedClass))
                  .map((sec) => (
                    <option key={sec._id} value={sec._id}>{sec.name}</option>
                  ))}
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Add Schedule</span>
              </button>
              <button 
                onClick={exportRoutineToPDF}
                className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            {loading && (
              <div className="p-6 text-sm text-gray-600">Loading routines...</div>
            )}
            {!loading && error && (
              <div className="p-6 text-sm text-red-600">{error}</div>
            )}
            {!loading && !error && (
              <table className="min-w-full border-collapse table-fixed">
                <thead className="bg-yellow-50">
                  <tr>
                    <th className="sticky top-0 left-0 z-20 bg-yellow-50 px-6 py-4 text-left text-sm font-medium text-yellow-800 w-32">Time</th>
                    {weekDays.map(day => (
                      <th key={day} className="sticky top-0 z-10 px-4 py-4 text-left text-sm font-medium text-yellow-800 min-w-[250px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {timeSlots.map((slot) => (
                    <tr key={slot.key} className="hover:bg-yellow-50/50">
                      <td className="sticky left-0 z-10 bg-yellow-50 px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{slot.label}</span>
                        </div>
                      </td>
                      {weekDays.map(day => {
                        const entries = filterEntries(routineData[day]?.[slot.key]);
                        const classData = entries[0];
                        const extraCount = entries.length > 1 ? entries.length - 1 : 0;
                        return (
                          <td key={`${day}-${slot.key}`} className="px-4 py-4">
                            {classData ? (
                              <div className={`p-3 rounded-lg border ${getSubjectColor(classData.subject)} group hover:shadow-md transition-all cursor-pointer`}>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-sm mb-1">{classData.subject}</h4>
                                    <div className="space-y-1">
                                      <div className="flex items-center space-x-1 text-xs">
                                        <Users className="w-3 h-3" />
                                        <span>{classData.teacher}</span>
                                      </div>
                                      <div className="flex items-center space-x-1 text-xs">
                                        <MapPin className="w-3 h-3" />
                                        <span>{classData.room}</span>
                                      </div>
                                      {extraCount > 0 && (
                                        <div className="text-[10px] text-gray-600">
                                          +{extraCount} more
                                        </div>
                                      )}
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
                            ) : (
                              <div className="p-3 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-400 hover:border-yellow-300 hover:text-yellow-500 transition-colors cursor-pointer">
                                <Plus className="w-4 h-4 mx-auto mb-1" />
                                <span className="text-xs">Add Class</span>
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
