import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  ChevronDown, 
  Download, 
  Filter,
  User,
  CheckCircle,
  XCircle,
  Coffee,
  TrendingUp,
  BarChart3,
  Eye,
  Share2,
  Star,
  Sparkles,
  Sun,
  Home,
  Activity,
  Target,
  Award,
  Users
} from 'lucide-react';

const AttendanceReport = () => {
  const [selectedMonth, setSelectedMonth] = useState('march');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentTime] = useState(new Date());
  
  const attendanceData = {
    studentName: "Koushik Bala",
    class: "10-A",
    totalPresent: 85,
    totalAbsent: 5,
    totalLeaves: 2,
    attendancePercentage: 94.4,
    averageCheckIn: "08:28 AM",
    totalDays: 92,
    punctualityScore: 98,
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

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-purple-100">
      <div className="p-6">
        {/* Enhanced Header with Yellow-Purple Theme */}
        <div className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-amber-500 to-purple-600 rounded-2xl shadow-2xl mb-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full transform -translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full transform translate-x-48 translate-y-48"></div>
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-purple-300 rounded-full transform -translate-x-20 -translate-y-20"></div>
          </div>
          
          <div className="relative z-10 p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h1 className="text-4xl font-bold text-white">Attendance Report</h1>
                      <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full">
                        <span className="text-white text-xs font-bold">LIVE TRACKING</span>
                      </div>
                    </div>
                    <p className="text-white/90 text-lg mt-2">{getGreeting()}! Track {attendanceData.studentName}'s attendance journey</p>
                  </div>
                </div>
                
                {/* Quick Achievement Highlights */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <Award className="w-4 h-4 text-yellow-300" />
                    <span className="text-white text-sm font-medium">{attendanceData.attendancePercentage}% Attendance</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <Target className="w-4 h-4 text-purple-300" />
                    <span className="text-white text-sm font-medium">{attendanceData.punctualityScore}% Punctual</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <Sun className="w-4 h-4 text-amber-300" />
                    <span className="text-white text-sm font-medium">{attendanceData.totalDays} School Days</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-6 lg:mt-0">
                <button className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30">
                  <Share2 className="h-4 w-4" />
                  <span className="font-medium">Share</span>
                </button>
                
                <button className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg">
                  <Download className="h-4 w-4" />
                  <span className="font-medium">Export Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Student Info & Stats with Yellow-Purple Theme */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-yellow-500" />
                <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">STUDENT</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Student Profile</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Name:</span>
                <span className="text-sm font-bold text-gray-800">{attendanceData.studentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Class:</span>
                <span className="text-sm font-bold text-gray-800">{attendanceData.class}</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs font-bold text-green-600">EXCELLENT</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-green-600 mb-1">{attendanceData.attendancePercentage}%</h3>
            <p className="text-sm text-gray-600 mb-3">Overall Attendance</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${attendanceData.attendancePercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Present: {attendanceData.totalPresent} days</span>
              <span>Total: {attendanceData.totalDays} days</span>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                <Activity className="h-4 w-4 text-red-500" />
                <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">TRACKED</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-red-600 mb-1">{attendanceData.totalAbsent}</h3>
            <p className="text-sm text-gray-600 mb-3">Absent Days</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-red-400 to-pink-500 transition-all duration-500"
                style={{ width: `${(attendanceData.totalAbsent / attendanceData.totalDays) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Absent: {attendanceData.totalAbsent} days</span>
              <span>{((attendanceData.totalAbsent / attendanceData.totalDays) * 100).toFixed(1)}% of total</span>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <Coffee className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">APPROVED</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-purple-600 mb-1">{attendanceData.totalLeaves}</h3>
            <p className="text-sm text-gray-600 mb-3">Approved Leaves</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-violet-500 transition-all duration-500"
                style={{ width: `${(attendanceData.totalLeaves / attendanceData.totalDays) * 100 * 5}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Leaves: {attendanceData.totalLeaves} days</span>
              <span>Well planned</span>
            </div>
          </div>
        </div>

        {/* Enhanced Controls with Yellow-Purple Theme */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-xl border border-white/20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="relative">
                  <select 
                    className="appearance-none bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl px-4 py-3 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-medium"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value="march">March 2024</option>
                    <option value="february">February 2024</option>
                    <option value="january">January 2024</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-yellow-600 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div className="relative">
                  <select 
                    className="appearance-none bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200 rounded-xl px-4 py-3 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="leave">Leave</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-600 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-2 rounded-full border border-yellow-200">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">Filtered View</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-6 py-3 rounded-xl hover:from-yellow-500 hover:to-amber-600 transition-all duration-200 shadow-lg font-medium">
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
              
              <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all duration-200 shadow-lg font-medium">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Attendance Table with Yellow-Purple Theme */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Attendance Records</h3>
                  <p className="text-white/90 text-sm">Daily attendance tracking with detailed timestamps</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                <Activity className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">{attendanceData.attendance.length} Records</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {attendanceData.attendance.map((record, index) => (
                  <tr key={index} className="hover:bg-gradient-to-r hover:from-yellow-50 hover:to-purple-50 transition-all duration-200">
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="p-2 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-lg mr-3">
                          <Calendar className="w-4 h-4 text-yellow-700" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {new Date(record.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(record.date).getFullYear()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        {record.status === 'Present' ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        ) : record.status === 'Absent' ? (
                          <XCircle className="w-4 h-4 text-red-500 mr-2" />
                        ) : (
                          <Coffee className="w-4 h-4 text-purple-500 mr-2" />
                        )}
                        <span className={`inline-block px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${
                          record.status === 'Present'
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                            : record.status === 'Absent'
                            ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                            : 'bg-gradient-to-r from-purple-400 to-violet-500 text-white'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-200 rounded-lg mr-3">
                          <Clock className="w-4 h-4 text-green-700" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{record.checkIn}</div>
                          <div className="text-xs text-gray-500">
                            {record.checkIn !== '-' ? 'On Time' : 'No Check-in'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="p-2 bg-gradient-to-br from-purple-100 to-violet-200 rounded-lg mr-3">
                          <Clock className="w-4 h-4 text-purple-700" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{record.checkOut}</div>
                          <div className="text-xs text-gray-500">
                            {record.checkOut !== '-' ? 'Full Day' : 'No Check-out'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-all duration-200 shadow-sm">
                          <Eye className="w-4 h-4 text-white" />
                        </button>
                        <button className="p-2 bg-gradient-to-r from-purple-400 to-violet-500 rounded-lg hover:from-purple-500 hover:to-violet-600 transition-all duration-200 shadow-sm">
                          <Download className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Summary */}
          <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-purple-50 p-6 border-t border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Present: {attendanceData.totalPresent} days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-pink-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Absent: {attendanceData.totalAbsent} days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-violet-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Leaves: {attendanceData.totalLeaves} days</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-purple-100 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-bold text-purple-700">Excellent Attendance Record!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport; 