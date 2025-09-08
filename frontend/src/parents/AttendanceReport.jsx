import React from 'react';
import { Calendar, Clock, ChevronDown, Download, Filter } from 'lucide-react';

const AttendanceReport = () => {
  const attendanceData = {
    studentName: "Koushik Bala",
    class: "10-A",
    totalPresent: 85,
    totalAbsent: 5,
    totalLeaves: 2,
    attendance: [
      {
        date: "2024-03-01",
        status: "Present",
        checkIn: "08:30 AM",
        checkOut: "03:30 PM"
      },
      {
        date: "2024-03-02",
        status: "Present",
        checkIn: "08:25 AM",
        checkOut: "03:30 PM"
      },
      {
        date: "2024-03-03",
        status: "Absent",
        checkIn: "-",
        checkOut: "-"
      }
    ]
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Attendance Report</h1>
        <p className="text-yellow-100">View detailed attendance records</p>
      </div>

      {/* Student Info & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Info</h3>
          <div className="space-y-2">
            <p className="text-gray-600">Name: {attendanceData.studentName}</p>
            <p className="text-gray-600">Class: {attendanceData.class}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-green-600">{attendanceData.totalPresent}%</h3>
            <p className="text-gray-600">Present</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-red-600">{attendanceData.totalAbsent}</h3>
            <p className="text-gray-600">Absent</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-blue-600">{attendanceData.totalLeaves}</h3>
            <p className="text-gray-600">Leaves</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                <option value="march">March 2024</option>
                <option value="february">February 2024</option>
                <option value="january">January 2024</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="leave">Leave</option>
              </select>
            </div>
          </div>

          <button className="flex items-center space-x-2 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Check In</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Check Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceData.attendance.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      record.status === 'Present'
                        ? 'bg-green-100 text-green-800'
                        : record.status === 'Absent'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {record.checkIn}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {record.checkOut}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport; 