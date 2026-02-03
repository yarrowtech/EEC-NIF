import React, { useState, useEffect } from 'react';
import { Calendar, Search, Check, X, ChevronLeft, ChevronRight, Users, TrendingUp, BarChart3, Download, Filter, UserCheck, UserX, AlertCircle } from 'lucide-react';

const AttendanceManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/teacher/dashboard/students`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load students');
        }

        const data = await response.json();

        // Format students with attendance data
        const formattedStudents = (data.students || []).map(student => {
          // Convert attendance array to object by date
          const attendanceByDate = {};
          (student.attendance || []).forEach(record => {
            const dateStr = new Date(record.date).toISOString().split('T')[0];
            attendanceByDate[dateStr] = record.status;
          });

          return {
            id: student._id,
            name: student.name,
            rollNumber: student.rollNumber,
            class: student.classLabel || `${student.className || student.grade}${student.sectionName || student.section ? `-${student.sectionName || student.section}` : ''}`,
            avatar: student.profilePic || '👤',
            attendance: attendanceByDate
          };
        });

        setStudents(formattedStudents);

        // Extract unique classes
        const uniqueClasses = [...new Set(formattedStudents.map(s => s.class))].filter(Boolean);
        setClasses(uniqueClasses);

        // Set first class as selected if available
        if (uniqueClasses.length > 0 && selectedClass === 'all') {
          setSelectedClass(uniqueClasses[0]);
        }

      } catch (err) {
        setError(err.message);
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Initialize attendance data when students change
  const [attendanceData, setAttendanceData] = useState({});

  // Update attendance data when students or date changes
  useEffect(() => {
    if (students.length > 0) {
      const initialData = students.reduce((acc, student) => ({
        ...acc,
        [student.id]: student.attendance[selectedDate] || 'present'
      }), {});
      setAttendanceData(initialData);
    }
  }, [students, selectedDate]);

  const getLastWeekDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const getLastMonthDates = () => {
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const getAttendanceStatus = (studentId, date) => {
    const student = students.find(s => s.id === studentId);
    return student?.attendance[date] || '-';
  };

  const toggleAttendance = (studentId) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/teacher/dashboard/attendance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: selectedDate,
          attendanceData: attendanceData
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save attendance');
      }

      const result = await response.json();
      alert(`✓ Attendance saved successfully! ${result.count} students marked.`);

      // Update local students data
      setStudents(prevStudents =>
        prevStudents.map(student => ({
          ...student,
          attendance: {
            ...student.attendance,
            [selectedDate]: attendanceData[student.id] || 'present'
          }
        }))
      );

    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
      console.error('Error saving attendance:', err);
    } finally {
      setSaving(false);
    }
  };

  const exportAttendance = () => {
    // In a real application, this would generate a CSV or PDF
    alert('Exporting attendance data...');
  };

  // Calculate statistics
  const filteredStudents = students.filter(student =>
    (selectedClass === 'all' || student.class === selectedClass) &&
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = Object.values(attendanceData).filter(status => status === 'present').length;
  const absentCount = Object.values(attendanceData).filter(status => status === 'absent').length;
  const attendanceRate = Math.round((presentCount / (presentCount + absentCount)) * 100);

  // Calculate monthly attendance for each student
  const monthlyAttendance = students.map(student => {
    const lastMonthDates = getLastMonthDates();
    const presentDays = lastMonthDates.filter(date => 
      student.attendance[date] === 'present'
    ).length;
    return {
      ...student,
      monthlyRate: Math.round((presentDays / lastMonthDates.length) * 100)
    };
  });

  // Filter students based on search and class
  const classStudents = selectedClass === 'all' ? filteredStudents : filteredStudents.filter(student => student.class === selectedClass);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 mb-6 text-white shadow-md animate-pulse">
          <div className="h-8 bg-white/20 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-white/20 rounded w-1/2"></div>
        </div>
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 mb-6 text-white shadow-md">
        <h1 className="text-3xl font-bold mb-2">Attendance Management</h1>
        <p className="text-yellow-100">Track and manage student attendance records</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-wrap gap-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="all">All Classes</option>
                {classes.map((className) => (
                  <option key={className} value={className}>
                    Class {className}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button 
              onClick={exportAttendance}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={saveAttendance}
              disabled={saving}
              className={`flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors shadow-sm ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Today's Attendance */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-yellow-500" />
              Today's Attendance - {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {classStudents.length > 0 ? (
                classStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{student.avatar}</span>
                      <div>
                        <h3 className="font-medium text-gray-800">{student.name}</h3>
                        <p className="text-sm text-gray-500">Roll No: {student.rollNumber}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAttendance(student.id)}
                      className={`p-2 rounded-full transition-colors ${
                        attendanceData[student.id] === 'present'
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      {attendanceData[student.id] === 'present' ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No students found in this class.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-yellow-500" />
              Weekly Overview
            </h2>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Student</th>
                    {getLastWeekDates().map((date) => (
                      <th key={date} className="px-3 py-2 text-center text-sm font-medium text-gray-500">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                        <br />
                        <span className="text-xs">{new Date(date).getDate()}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {classStudents.slice(0, 4).map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-800">
                        <div className="flex items-center">
                          <span className="mr-2">{student.avatar}</span>
                          {student.name}
                        </div>
                      </td>
                      {getLastWeekDates().map((date) => (
                        <td key={date} className="px-3 py-2 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                            getAttendanceStatus(student.id, date) === 'present'
                              ? 'bg-green-100 text-green-600'
                              : getAttendanceStatus(student.id, date) === 'absent'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {getAttendanceStatus(student.id, date) === 'present' ? 'P' : 
                             getAttendanceStatus(student.id, date) === 'absent' ? 'A' : '-'}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {classStudents.length > 4 && (
              <div className="mt-4 text-center text-sm text-gray-500">
                + {classStudents.length - 4} more students
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Today's Attendance</h3>
              <Users className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-500">Present</p>
                <p className="text-2xl font-semibold text-green-600">{presentCount}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-2">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-sm text-gray-500">Absent</p>
                <p className="text-2xl font-semibold text-red-600">{absentCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Attendance Rate</h3>
              <TrendingUp className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-3">
                <span className="text-2xl font-bold text-blue-600">{attendanceRate}%</span>
              </div>
              <p className="text-sm text-gray-500">Today's Rate</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Monthly Average</h3>
              <BarChart3 className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-3">
                <span className="text-2xl font-bold text-green-600">92%</span>
              </div>
              <p className="text-sm text-gray-500">Class Average</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Trend</h3>
              <TrendingUp className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-50 rounded-full mb-3">
                <span className="text-2xl font-bold text-purple-600">↑ 3%</span>
              </div>
              <p className="text-sm text-gray-500">vs Last Week</p>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Top Attendees</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {monthlyAttendance
                .filter(student => student.class === selectedClass)
                .sort((a, b) => b.monthlyRate - a.monthlyRate)
                .slice(0, 5)
                .map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{student.avatar}</span>
                      <div>
                        <h3 className="font-medium text-gray-800">{student.name}</h3>
                        <p className="text-sm text-gray-500">Roll No: {student.rollNumber}</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-green-600">{student.monthlyRate}%</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Students Needing Attention */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Needing Attention</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {monthlyAttendance
                .filter(student => student.class === selectedClass && student.monthlyRate < 85)
                .sort((a, b) => a.monthlyRate - b.monthlyRate)
                .slice(0, 5)
                .map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{student.avatar}</span>
                      <div>
                        <h3 className="font-medium text-gray-800">{student.name}</h3>
                        <p className="text-sm text-gray-500">Roll No: {student.rollNumber}</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-red-600">{student.monthlyRate}%</span>
                  </div>
                ))}
              {monthlyAttendance.filter(student => student.class === selectedClass && student.monthlyRate < 85).length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  All students have good attendance records!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;