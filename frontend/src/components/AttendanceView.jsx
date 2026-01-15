import React, { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, XCircle, Clock, TrendingUp, ChevronLeft, ChevronRight, Plus, X, Edit3, Trash2 } from 'lucide-react';

const AttendanceView = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [attendanceStats, setAttendanceStats] = useState({
    totalClasses: 0,
    attended: 0,
    absent: 0,
    late: 0,
    percentage: 0
  });

  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Fetch real attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');

        if (!token || userType !== 'Student') {
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/student/auth/attendance`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Attendance data received:', data);

          // Update stats
          setAttendanceStats({
            totalClasses: data.summary.totalClasses,
            attended: data.summary.presentDays,
            absent: data.summary.absentDays,
            late: data.summary.leaveDays,
            percentage: data.summary.attendancePercentage
          });

          // Transform attendance data for the component
          const records = data.attendance.map((record, index) => ({
            id: index + 1,
            date: new Date(record.date).toISOString().split('T')[0],
            course: record.subject || 'General',
            status: record.status || 'present',
            time: record.time || 'N/A',
            description: record.notes || ''
          }));

          setAttendanceRecords(records);
        } else {
          console.error('Failed to fetch attendance:', response.status);
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);
  const [newRecord, setNewRecord] = useState({
    course: '',
    date: '',
    time: '',
    status: 'present',
    description: ''
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const courseOptions = [
    "JavaScript Fundamentals",
    "React Development", 
    "Database Design",
    "UI/UX Design",
    "Node.js Backend",
    "Python Programming"
  ];

  const statusOptions = [
    { value: 'present', label: 'Present', color: 'bg-green-500', textColor: 'text-green-800', bgColor: 'bg-green-100' },
    { value: 'absent', label: 'Absent', color: 'bg-red-500', textColor: 'text-red-800', bgColor: 'bg-red-100' },
    { value: 'late', label: 'Late', color: 'bg-yellow-500', textColor: 'text-yellow-800', bgColor: 'bg-yellow-100' }
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.toDateString() === current.toDateString();
      });
      
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === new Date().toDateString(),
        records: dayRecords
      });
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };
  
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDateClick = (day) => {
    setSelectedDate(day.date);
    const formattedDate = day.date.toISOString().split('T')[0];
    setNewRecord(prev => ({ ...prev, date: formattedDate }));
  };

  const handleAddRecord = () => {
    setShowEventModal(true);
    setEditingEvent(null);
    setNewRecord({
      course: '',
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      time: '',
      status: 'present',
      description: ''
    });
  };

  const handleEditRecord = (record) => {
    setEditingEvent(record);
    setNewRecord({ ...record });
    setShowEventModal(true);
  };

  const handleDeleteRecord = (recordId) => {
    setAttendanceRecords(attendanceRecords.filter(record => record.id !== recordId));
  };

  const handleSaveRecord = () => {
    if (!newRecord.course || !newRecord.date || !newRecord.time) return;

    const recordData = {
      ...newRecord,
      id: editingEvent ? editingEvent.id : Date.now()
    };

    if (editingEvent) {
      setAttendanceRecords(attendanceRecords.map(record => 
        record.id === editingEvent.id ? recordData : record
      ));
    } else {
      setAttendanceRecords([...attendanceRecords, recordData]);
    }

    setShowEventModal(false);
    setNewRecord({
      course: '',
      date: '',
      time: '',
      status: 'present',
      description: ''
    });
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'absent':
        return <XCircle className="text-red-500" size={20} />;
      case 'late':
        return <Clock className="text-yellow-500" size={20} />;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    if (!statusConfig) return null;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}>
        {statusConfig.label}
      </span>
    );
  };

  const getRecentRecords = () => {
    const today = new Date();
    return attendanceRecords
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  };

  const days = getDaysInMonth(currentDate);
  const recentRecords = getRecentRecords();

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-6 bg-gray-50 min-h-screen w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Attendance Tracker</h1>
            <p className="text-gray-600 text-sm sm:text-base">Track your class attendance and patterns</p>
          </div>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mt-2 sm:mt-0"
        >
          <option value="thisWeek">This Week</option>
          <option value="thisMonth">This Month</option>
          <option value="semester">This Semester</option>
        </select>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceStats.totalClasses}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="text-blue-600" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Attended</p>
              <p className="text-2xl font-bold text-green-600">{attendanceStats.attended}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Absent</p>
              <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="text-red-600" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
              <p className="text-2xl font-bold text-indigo-600">{attendanceStats.percentage}%</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <TrendingUp className="text-indigo-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-400">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="text-indigo-500" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Attendance Calendar</h2>
            </div>
            {/* <button
              onClick={handleAddRecord}
              className="flex items-center space-x-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
            >
              <Plus size={16} />
              <span>Add Record</span>
            </button> */}
          </div>
        </div>
        
        <div className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>
          </div>
          
          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 mb-6">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                className={`
                  aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-colors relative p-1
                  ${day.isCurrentMonth 
                    ? day.isToday 
                      ? 'bg-indigo-500 text-white font-semibold hover:bg-indigo-600' 
                      : 'text-gray-900 hover:bg-gray-100'
                    : 'text-gray-300 hover:bg-gray-50'
                  }
                  ${selectedDate && day.date.toDateString() === selectedDate.toDateString() 
                    ? 'ring-2 ring-indigo-400' 
                    : ''
                  }
                `}
              >
                <span className="text-xs">{day.date.getDate()}</span>
                {day.records.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                    {day.records.slice(0, 3).map((record, i) => {
                      const statusConfig = statusOptions.find(s => s.value === record.status);
                      return (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${statusConfig?.color || 'bg-gray-400'}`}
                          title={`${record.course} - ${statusConfig?.label}`}
                        />
                      );
                    })}
                    {day.records.length > 3 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" title={`+${day.records.length - 3} more`} />
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recent Attendance Records */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-400">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Recent Attendance</h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {recentRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(record.status)}
                  <div>
                    <h3 className="font-medium text-gray-900">{record.course}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {record.time}
                    </p>
                    {record.description && (
                      <p className="text-xs text-gray-400 mt-1">{record.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {getStatusBadge(record.status)}
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditRecord(record)}
                      className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Record Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingEvent ? 'Edit Attendance Record' : 'Add Attendance Record'}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  value={newRecord.course}
                  onChange={(e) => setNewRecord({ ...newRecord, course: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">Select a course</option>
                  {courseOptions.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newRecord.time}
                    onChange={(e) => setNewRecord({ ...newRecord, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attendance Status
                </label>
                <select
                  value={newRecord.status}
                  onChange={(e) => setNewRecord({ ...newRecord, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  rows="3"
                  placeholder="Enter class topic or notes"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRecord}
                className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                {editingEvent ? 'Update Record' : 'Add Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceView;