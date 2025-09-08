import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  User,
  Bell,
  FileText,
  DollarSign,
  Check,
  X,
  Plus,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  UserCircle,
  CalendarDays,
  BellRing,
  Receipt,
  Edit,
  Save,
  Camera
} from 'lucide-react';

const MyWorkPortal = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('2025-01');

  // Comprehensive attendance data for multiple months
  const allAttendanceData = {
    '2025-01': [
      { date: '2025-01-31', checkIn: '08:25', checkOut: '17:35', status: 'Present' },
      { date: '2025-01-30', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2025-01-29', checkIn: '08:40', checkOut: '17:20', status: 'Present' },
      { date: '2025-01-28', checkIn: '08:35', checkOut: '17:25', status: 'Present' },
      { date: '2025-01-27', checkIn: '09:15', checkOut: '17:15', status: 'Late' },
      { date: '2025-01-26', checkIn: '-', checkOut: '-', status: 'Holiday' },
      { date: '2025-01-25', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2025-01-24', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2025-01-23', checkIn: '08:45', checkOut: '17:15', status: 'Present' },
      { date: '2025-01-22', checkIn: '08:20', checkOut: '17:40', status: 'Present' },
      { date: '2025-01-21', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2025-01-20', checkIn: '08:35', checkOut: '17:25', status: 'Present' },
      { date: '2025-01-19', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2025-01-18', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2025-01-17', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2025-01-16', checkIn: '-', checkOut: '-', status: 'Sick Leave' },
      { date: '2025-01-15', checkIn: '-', checkOut: '-', status: 'Sick Leave' },
      { date: '2025-01-14', checkIn: '08:25', checkOut: '17:35', status: 'Present' },
      { date: '2025-01-13', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2025-01-12', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2025-01-11', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2025-01-10', checkIn: '08:40', checkOut: '17:20', status: 'Present' },
      { date: '2025-01-09', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2025-01-08', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2025-01-07', checkIn: '08:45', checkOut: '17:15', status: 'Present' },
      { date: '2025-01-06', checkIn: '09:00', checkOut: '17:00', status: 'Late' },
      { date: '2025-01-05', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2025-01-04', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2025-01-03', checkIn: '08:35', checkOut: '17:25', status: 'Present' },
      { date: '2025-01-02', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2025-01-01', checkIn: '-', checkOut: '-', status: 'Holiday' }
    ],
    '2024-12': [
      { date: '2024-12-31', checkIn: '08:30', checkOut: '15:00', status: 'Half Day' },
      { date: '2024-12-30', checkIn: '08:25', checkOut: '17:35', status: 'Present' },
      { date: '2024-12-29', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2024-12-28', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2024-12-27', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2024-12-26', checkIn: '08:40', checkOut: '17:20', status: 'Present' },
      { date: '2024-12-25', checkIn: '-', checkOut: '-', status: 'Holiday' },
      { date: '2024-12-24', checkIn: '08:30', checkOut: '15:00', status: 'Half Day' },
      { date: '2024-12-23', checkIn: '08:35', checkOut: '17:25', status: 'Present' },
      { date: '2024-12-22', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2024-12-21', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2024-12-20', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2024-12-19', checkIn: '08:45', checkOut: '17:15', status: 'Present' },
      { date: '2024-12-18', checkIn: '08:20', checkOut: '17:40', status: 'Present' },
      { date: '2024-12-17', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2024-12-16', checkIn: '09:10', checkOut: '17:10', status: 'Late' },
      { date: '2024-12-15', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2024-12-14', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2024-12-13', checkIn: '08:35', checkOut: '17:25', status: 'Present' },
      { date: '2024-12-12', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2024-12-11', checkIn: '08:25', checkOut: '17:35', status: 'Present' },
      { date: '2024-12-10', checkIn: '08:40', checkOut: '17:20', status: 'Present' },
      { date: '2024-12-09', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2024-12-08', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2024-12-07', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2024-12-06', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2024-12-05', checkIn: '08:45', checkOut: '17:15', status: 'Present' },
      { date: '2024-12-04', checkIn: '08:35', checkOut: '17:25', status: 'Present' },
      { date: '2024-12-03', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2024-12-02', checkIn: '08:25', checkOut: '17:35', status: 'Present' },
      { date: '2024-12-01', checkIn: '-', checkOut: '-', status: 'Weekend' }
    ],
    '2024-11': [
      { date: '2024-11-30', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2024-11-29', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2024-11-28', checkIn: '08:40', checkOut: '17:20', status: 'Present' },
      { date: '2024-11-27', checkIn: '08:25', checkOut: '17:35', status: 'Present' },
      { date: '2024-11-26', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2024-11-25', checkIn: '09:05', checkOut: '17:05', status: 'Late' },
      { date: '2024-11-24', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2024-11-23', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2024-11-22', checkIn: '08:35', checkOut: '17:25', status: 'Present' },
      { date: '2024-11-21', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2024-11-20', checkIn: '08:45', checkOut: '17:15', status: 'Present' },
      { date: '2024-11-19', checkIn: '08:20', checkOut: '17:40', status: 'Present' },
      { date: '2024-11-18', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2024-11-17', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2024-11-16', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2024-11-15', checkIn: '-', checkOut: '-', status: 'Casual Leave' },
      { date: '2024-11-14', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2024-11-13', checkIn: '08:35', checkOut: '17:25', status: 'Present' },
      { date: '2024-11-12', checkIn: '08:25', checkOut: '17:35', status: 'Present' },
      { date: '2024-11-11', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2024-11-10', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2024-11-09', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2024-11-08', checkIn: '08:40', checkOut: '17:20', status: 'Present' },
      { date: '2024-11-07', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2024-11-06', checkIn: '08:45', checkOut: '17:15', status: 'Present' },
      { date: '2024-11-05', checkIn: '08:35', checkOut: '17:25', status: 'Present' },
      { date: '2024-11-04', checkIn: '08:30', checkOut: '17:30', status: 'Present' },
      { date: '2024-11-03', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2024-11-02', checkIn: '-', checkOut: '-', status: 'Weekend' },
      { date: '2024-11-01', checkIn: '08:25', checkOut: '17:35', status: 'Present' }
    ]
  };

  // Get current month's attendance data
  const attendanceData = allAttendanceData[selectedMonth] || [];

  // Available months for dropdown
  const availableMonths = [
    { value: '2025-01', label: 'January 2025' },
    { value: '2024-12', label: 'December 2024' },
    { value: '2024-11', label: 'November 2024' }
  ];

  // Calculate attendance statistics for selected month
  const calculateAttendanceStats = (data) => {
    const totalDays = data.length;
    const presentDays = data.filter(d => d.status === 'Present').length;
    const lateDays = data.filter(d => d.status === 'Late').length;
    const absentDays = data.filter(d => ['Absent', 'Sick Leave', 'Casual Leave'].includes(d.status)).length;
    const weekendHolidays = data.filter(d => ['Weekend', 'Holiday', 'Half Day'].includes(d.status)).length;
    const workingDays = totalDays - weekendHolidays;
    const attendanceRate = workingDays > 0 ? Math.round(((presentDays + lateDays) / workingDays) * 100) : 0;

    return {
      presentDays,
      lateDays,
      absentDays,
      attendanceRate
    };
  };

  const attendanceStats = calculateAttendanceStats(attendanceData);

  const [leaveData, setLeaveData] = useState([
    { id: 1, type: 'Sick Leave', startDate: '2025-01-15', endDate: '2025-01-16', status: 'Approved', reason: 'Medical appointment' },
    { id: 2, type: 'Casual Leave', startDate: '2025-01-20', endDate: '2025-01-20', status: 'Pending', reason: 'Personal work' },
    { id: 3, type: 'Annual Leave', startDate: '2025-02-01', endDate: '2025-02-05', status: 'Rejected', reason: 'Family vacation' }
  ]);

  const [profileData, setProfileData] = useState({
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@eec.edu',
    phone: '+1 (555) 123-4567',
    department: 'Mathematics',
    employeeId: 'EEC2024001',
    joinDate: '2020-08-15',
    address: '123 Main St, City, State 12345',
    emergencyContact: 'John Johnson - +1 (555) 987-6543'
  });

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Leave Request Approved', message: 'Your sick leave for Jan 15-16 has been approved', type: 'success', read: false, timestamp: '2 hours ago' },
    { id: 2, title: 'Expense Claim Update', message: 'Your expense claim #EC001 needs additional documentation', type: 'warning', read: false, timestamp: '5 hours ago' },
    { id: 3, title: 'Profile Update Required', message: 'Please update your emergency contact information', type: 'info', read: true, timestamp: '1 day ago' },
    { id: 4, title: 'Holiday Notice', message: 'School will be closed on Jan 26th for Republic Day', type: 'info', read: true, timestamp: '2 days ago' }
  ]);

  const [documents, setDocuments] = useState([
    { id: 1, name: 'Employee Handbook 2025', type: 'PDF', size: '2.5 MB', category: 'Policy', uploadDate: '2025-01-01' },
    { id: 2, name: 'Salary Certificate', type: 'PDF', size: '150 KB', category: 'Personal', uploadDate: '2024-12-15' },
    { id: 3, name: 'Tax Declaration Form', type: 'PDF', size: '300 KB', category: 'Financial', uploadDate: '2024-11-30' },
    { id: 4, name: 'Performance Review 2024', type: 'PDF', size: '500 KB', category: 'Performance', uploadDate: '2024-12-31' }
  ]);

  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Travel', amount: 150, description: 'Conference travel expenses', date: '2025-01-05', status: 'Approved', receipt: 'receipt_001.pdf' },
    { id: 2, category: 'Supplies', amount: 75, description: 'Teaching materials', date: '2025-01-03', status: 'Pending', receipt: 'receipt_002.pdf' },
    { id: 3, category: 'Training', amount: 200, description: 'Professional development course', date: '2024-12-28', status: 'Rejected', receipt: 'receipt_003.pdf' }
  ]);

  const tabs = [
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leave Management', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'expenses', label: 'Expenses', icon: DollarSign }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': case 'present': return 'text-green-600 bg-green-100';
      case 'pending': case 'late': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': case 'absent': case 'sick leave': case 'casual leave': return 'text-red-600 bg-red-100';
      case 'weekend': case 'holiday': return 'text-gray-600 bg-gray-100';
      case 'half day': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const renderAttendance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Attendance Overview</h3>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Month:</label>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                {availableMonths.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{attendanceStats.presentDays}</div>
              <div className="text-sm text-green-700">Days Present</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{attendanceStats.lateDays}</div>
              <div className="text-sm text-yellow-700">Days Late</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{attendanceStats.absentDays}</div>
              <div className="text-sm text-red-700">Days Absent</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{attendanceStats.attendanceRate}%</div>
              <div className="text-sm text-blue-700">Attendance Rate</div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="pb-3 font-medium text-gray-900">Date</th>
                  <th className="pb-3 font-medium text-gray-900">Check In</th>
                  <th className="pb-3 font-medium text-gray-900">Check Out</th>
                  <th className="pb-3 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((record, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3">{record.date}</td>
                    <td className="py-3">{record.checkIn}</td>
                    <td className="py-3">{record.checkOut}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLeaveManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Leave Management</h3>
        <button
          onClick={() => setShowLeaveForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Apply Leave</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">15</div>
          <div className="text-sm text-green-700">Available Days</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">3</div>
          <div className="text-sm text-yellow-700">Used Days</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">1</div>
          <div className="text-sm text-blue-700">Pending Requests</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="space-y-4">
            {leaveData.map((leave) => (
              <div key={leave.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{leave.type}</h4>
                    <p className="text-sm text-gray-600 mt-1">{leave.startDate} to {leave.endDate}</p>
                    <p className="text-sm text-gray-700 mt-2">{leave.reason}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                    {leave.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showLeaveForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Apply for Leave</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Sick Leave</option>
                  <option>Casual Leave</option>
                  <option>Annual Leave</option>
                  <option>Maternity Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" rows="3"></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowLeaveForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Profile Management</h3>
        <button
          onClick={() => setEditProfile(!editProfile)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          {editProfile ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          <span>{editProfile ? 'Save' : 'Edit'}</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                <UserCircle className="w-16 h-16 text-gray-500" />
              </div>
              {editProfile && (
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div>
              <h4 className="text-xl font-medium text-gray-900">{profileData.name}</h4>
              <p className="text-gray-600">{profileData.department}</p>
              <p className="text-sm text-gray-500">Employee ID: {profileData.employeeId}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                disabled={!editProfile}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={profileData.email}
                disabled={!editProfile}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={profileData.phone}
                disabled={!editProfile}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <input
                type="text"
                value={profileData.department}
                disabled={!editProfile}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Join Date</label>
              <input
                type="date"
                value={profileData.joinDate}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Employee ID</label>
              <input
                type="text"
                value={profileData.employeeId}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                value={profileData.address}
                disabled={!editProfile}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50"
                rows="3"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
              <input
                type="text"
                value={profileData.emergencyContact}
                disabled={!editProfile}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Notifications & Alerts</h3>
        <div className="text-sm text-gray-600">
          {notifications.filter(n => !n.read).length} unread
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {notification.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                  {notification.type === 'info' && <BellRing className="w-5 h-5 text-blue-500" />}
                  <h4 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                    {notification.title}
                  </h4>
                </div>
                <p className={`mt-1 text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                  {notification.message}
                </p>
                <p className="mt-2 text-xs text-gray-400">{notification.timestamp}</p>
              </div>
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Document Access</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                    <p className="text-sm text-gray-600">{doc.type} • {doc.size}</p>
                    <p className="text-xs text-gray-500">{doc.category} • {doc.uploadDate}</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderExpenses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Expense Claims</h3>
        <button
          onClick={() => setShowExpenseForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Claim</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">$150</div>
          <div className="text-sm text-green-700">Approved Claims</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">$75</div>
          <div className="text-sm text-yellow-700">Pending Claims</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">$200</div>
          <div className="text-sm text-red-700">Rejected Claims</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-3">
                      <Receipt className="w-5 h-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900">{expense.category}</h4>
                        <p className="text-sm text-gray-600">{expense.description}</p>
                        <p className="text-xs text-gray-500">{expense.date}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">${expense.amount}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                      {expense.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Submit Expense Claim</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Travel</option>
                  <option>Supplies</option>
                  <option>Training</option>
                  <option>Entertainment</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" rows="3"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Receipt</label>
                <input type="file" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowExpenseForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Work Portal</h1>
          <p className="text-gray-600 mt-2">Manage your work-related activities and information</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'attendance' && renderAttendance()}
          {activeTab === 'leave' && renderLeaveManagement()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'documents' && renderDocuments()}
          {activeTab === 'expenses' && renderExpenses()}
        </div>
      </div>
    </div>
  );
};

export default MyWorkPortal;