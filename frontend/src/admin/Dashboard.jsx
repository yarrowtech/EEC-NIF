import React, { useState, useEffect } from 'react';
import { BarChart2, Bus, Users, UserCheck, User, Calendar as CalendarIcon, FileText, PhoneCall, School } from 'lucide-react';

const stats = [
  { label: 'Teachers', value: 12, icon: '👨‍🏫', trend: '+2' },
  { label: 'Students', value: 120, icon: '👨‍🎓', trend: '+15' },
  { label: 'Courses', value: 18, icon: '📚', trend: '+3' },
  { label: 'Parents', value: 110, icon: '👥', trend: '+8' },
];

const quickActions = [
  { title: 'Add New Student', action: 'student', icon: '➕' },
  { title: 'Create Course', action: 'course', icon: '📝' },
  { title: 'Send Notification', action: 'notification', icon: '📢' },
  { title: 'Generate Report', action: 'report', icon: '📊' },
];

// Derived attendance figures (aligned with Analytics)
const totalStudentsCount = 1245;
const presentPercentage = 85; // same as Analytics attendanceData present slice
const presentStudentsCount = Math.round(totalStudentsCount * (presentPercentage / 100));

const totalTeachersCount = 82;
const presentTeachersPercent = 92; // demo percent, matches Analytics
const presentTeachersCount = Math.round(totalTeachersCount * (presentTeachersPercent / 100));

const attendanceStats = [
  { label: 'Teachers Present', value: presentTeachersCount, icon: <UserCheck className="w-7 h-7 text-yellow-700" /> },
  { label: 'Students Present', value: presentStudentsCount, icon: <Users className="w-7 h-7 text-yellow-700" /> },
  { label: 'Staff Present', value: 8, icon: <User className="w-7 h-7 text-yellow-700" /> },
  { label: 'Buses Available', value: 6, icon: <Bus className="w-7 h-7 text-yellow-700" /> },
];

const feesData = [
  { month: 'Jan', collected: 120000 },
  { month: 'Feb', collected: 110000 },
  { month: 'Mar', collected: 130000 },
  { month: 'Apr', collected: 125000 },
  { month: 'May', collected: 140000 },
  { month: 'Jun', collected: 135000 },
];
const feesDue = 25000;

const upcomingEvents = [
  { date: '2025-07-05', title: 'Annual Sports Day', desc: 'All students and staff participate in sports events.' },
  { date: '2025-07-12', title: 'Parent-Teacher Meeting', desc: 'Meetings for all classes.' },
  { date: '2025-07-20', title: 'Science Exhibition', desc: 'Student science projects on display.' },
];

const busSchedule = [
  { bus: 'Bus 1', route: 'Sector 5 - School', departure: '7:15 AM', arrival: '1:45 PM' },
  { bus: 'Bus 2', route: 'Salt Lake - School', departure: '7:30 AM', arrival: '2:00 PM' },
];

const classroomStatus = [
  { room: 'Room 101', status: 'Occupied' },
  { room: 'Room 102', status: 'Empty' },
  { room: 'Room 103', status: 'Occupied' },
  { room: 'Room 104', status: 'Empty' },
];

const documents = [
  'Annual Report 2024-25',
  'Safety Compliance Certificate',
  'Accreditation Documents',
];

const Dashboard = ({ setShowAdminHeader }) => {
  const [selectedAction, setSelectedAction] = useState(null);

  const handleActionClick = (action) => {
    setSelectedAction(action);
    setTimeout(() => setSelectedAction(null), 2000);
  };

  useEffect(() => {
    setShowAdminHeader(true);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="mx-auto bg-yellow-50/95 shadow-2xl p-2">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-yellow-800 mb-2">Admin Dashboard</h1>
          <p className="text-yellow-700 text-lg">Overview of the institution's key statistics and quick actions.</p>
        </div>

        {/* Attendance Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {attendanceStats.map((stat) => (
            <div key={stat.label} className="bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-xl p-6 flex flex-col items-center shadow-md border border-yellow-400">
              {stat.icon}
              <span className="text-2xl font-bold mb-1 text-yellow-900">{stat.value}</span>
              <span className="text-lg font-semibold text-yellow-800 mb-2">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Fees Chart */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center gap-2"><BarChart2 className="w-6 h-6" /> Fees Collection (Last 6 Months)</h2>
          <div className="bg-white rounded-xl p-6 shadow-md border border-yellow-300 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 w-full">
              <div className="flex items-end h-40 gap-4">
                {feesData.map((d) => (
                  <div key={d.month} className="flex flex-col items-center w-12">
                    <div className="bg-yellow-400 rounded-t-lg" style={{ height: `${d.collected / 1500}px`, width: '100%' }} title={`₹${d.collected.toLocaleString()}`}></div>
                    <span className="text-xs mt-2 text-yellow-900 font-semibold">{d.month}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-yellow-800 font-medium">
                Total Collected: ₹{feesData.reduce((a, b) => a + b.collected, 0).toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center min-w-[180px]">
              <div className="text-lg font-bold text-red-600">Due: ₹{feesDue.toLocaleString()}</div>
              <div className="text-xs text-yellow-700">as of {feesData[feesData.length - 1].month} 2025</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-xl p-6 flex flex-col items-center shadow-md hover:shadow-lg transition-shadow duration-300 border border-yellow-500">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <span className="text-3xl font-bold mb-1 text-yellow-900">{stat.value}</span>
              <span className="text-lg font-semibold text-yellow-800 mb-2">{stat.label}</span>
              <span className="text-sm text-yellow-700 font-medium">{stat.trend} this month</span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button key={action.action} onClick={() => handleActionClick(action.action)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${selectedAction === action.action
                  ? 'bg-yellow-400 border-yellow-600 scale-95'
                  : 'bg-yellow-200 border-yellow-500 hover:bg-yellow-300 hover:border-yellow-600 hover:scale-105'
                }`}>
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="font-semibold text-yellow-900">{action.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center gap-2"><CalendarIcon className="w-6 h-6" /> Upcoming Events</h2>
          <div className="bg-white rounded-xl p-6 shadow-md border border-yellow-300">
            <ul className="divide-y divide-yellow-100">
              {upcomingEvents.map(ev => (
                <li key={ev.date} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="font-semibold text-yellow-900">{ev.title}</div>
                    <div className="text-sm text-yellow-700">{ev.desc}</div>
                  </div>
                  <div className="text-sm text-yellow-700 font-bold flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> {ev.date}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">Emergency Contacts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border border-yellow-300">
              <h4 className="font-bold text-yellow-900">🚔 Police</h4>
              <p className="text-sm text-yellow-700">Phone: 100</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-yellow-300">
              <h4 className="font-bold text-yellow-900">🔥 Fire</h4>
              <p className="text-sm text-yellow-700">Phone: 101</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-yellow-300">
              <h4 className="font-bold text-yellow-900">🏥 Hospital</h4>
              <p className="text-sm text-yellow-700">Phone: 102</p>
            </div>
          </div>
        </div>

        {/* Documents and Reports */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center gap-2"><FileText className="w-6 h-6" /> Documents & Reports</h2>
          <div className="bg-white p-4 rounded-lg shadow border border-yellow-300">
            <ul className="list-disc pl-6 text-yellow-800">
              {documents.map((doc, idx) => <li key={idx}>{doc}</li>)}
            </ul>
            <button className="mt-4 px-4 py-2 bg-yellow-500 text-yellow-900 font-semibold rounded hover:bg-yellow-600">Upload New Document</button>
          </div>
        </div>

        {/* Bus Timetable */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center gap-2"><Bus className="w-6 h-6" /> Bus Timetable</h2>
          <table className="w-full bg-white border border-yellow-300 rounded-lg shadow text-sm">
            <thead className="bg-yellow-200 text-yellow-900">
              <tr>
                <th className="p-2">Bus No.</th>
                <th className="p-2">Route</th>
                <th className="p-2">Departure</th>
                <th className="p-2">Arrival</th>
              </tr>
            </thead>
            <tbody>
              {busSchedule.map((bus, i) => (
                <tr key={i} className="text-center border-t">
                  <td className="p-2">{bus.bus}</td>
                  <td className="p-2">{bus.route}</td>
                  <td className="p-2">{bus.departure}</td>
                  <td className="p-2">{bus.arrival}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Classroom Status */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center gap-2"><School className="w-6 h-6" /> Classroom Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {classroomStatus.map((room, idx) => (
              <div key={idx} className={`p-4 rounded-lg shadow border ${room.status === 'Occupied' ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-100 border-red-300 text-red-800'}`}>
                <h4 className="font-bold text-lg">{room.room}</h4>
                <p>Status: {room.status}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-xl p-6 text-yellow-900 text-center shadow-md border border-yellow-500">
          <h3 className="font-bold text-xl mb-2 text-yellow-900">Welcome to EEC Admin Dashboard!</h3>
          <p className="font-medium">
            {selectedAction
              ? `Processing ${selectedAction} action...`
              : 'Use the quick actions above or the sidebar to manage teachers, students, courses, and more.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
