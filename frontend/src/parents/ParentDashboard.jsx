import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CreditCard,
  Video,
  Clock,
  Users,
  Sparkles,
  Star,
  Sun,
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const ParentDashboard = ({ parentName, childrenNames = [] }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [attendanceRes, meetingsRes] = await Promise.all([
          fetch(`${API_BASE}/api/attendance/parent/children`, { headers: authHeader() }),
          fetch(`${API_BASE}/api/meeting/parent/my-meetings`, { headers: authHeader() }),
        ]);
        if (attendanceRes.ok) {
          const data = await attendanceRes.json();
          setAttendanceData(data);
        }
        if (meetingsRes.ok) {
          const data = await meetingsRes.json();
          setMeetings(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getAttendanceRate = () => {
    if (!attendanceData?.children?.length) return 'N/A';
    const pct = attendanceData.children[0]?.summary?.attendancePercentage;
    return pct != null ? `${Math.round(pct)}%` : 'N/A';
  };

  const upcomingMeetings = meetings
    .filter(m => new Date(m.meetingDate) >= new Date())
    .sort((a, b) => new Date(a.meetingDate) - new Date(b.meetingDate))
    .slice(0, 3);

  const quickStats = [
    {
      label: 'Attendance Rate',
      value: loading ? '...' : getAttendanceRate(),
      icon: Calendar,
      color: 'green',
    },
    {
      label: 'Upcoming PTMs',
      value: loading ? '...' : String(upcomingMeetings.length),
      icon: Video,
      color: 'blue',
    },
    {
      label: 'Pending Fees',
      value: 'N/A',
      icon: CreditCard,
      color: 'yellow',
    },
  ];

  const formatMeetingDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full px-2 sm:px-3 md:px-3 lg:px-3 py-4 sm:py-5 lg:py-6">

        {/* Welcome Header */}
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-2xl mb-8 lg:mb-10 border border-gray-100">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl" />
            <div
              className="absolute inset-0 opacity-5"
              style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />
          </div>

          <div className="relative z-10">
            <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600" />
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-8">
                <div className="flex-1">
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full px-4 py-2 mb-4 shadow-sm border border-indigo-200/50">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {getGreeting()}, {parentName || 'Parent'}! 👋
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 leading-tight">
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Welcome to
                    </span>
                    <br />
                    <span className="text-gray-800">Parent Portal</span>
                  </h1>

                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mb-6">
                    Stay connected with your child's journey, track their progress, and celebrate their achievements together.
                  </p>

                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-xl px-4 py-2.5 shadow-sm">
                      <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">
                        {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles className="w-12 h-12 text-white animate-pulse" />
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {childrenNames.length > 0 && (
                <div className="flex flex-wrap gap-2 sm:gap-3 pt-6 border-t border-gray-100">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/50 rounded-full px-4 py-2.5 shadow-sm">
                    <div className="p-1 bg-cyan-500 rounded-full">
                      <Users className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-700">
                      {childrenNames.join(', ')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-8 lg:mb-10">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className="group bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 sm:p-6 border border-gray-100 hover:border-gray-200 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br shadow-md group-hover:scale-110 transition-transform duration-300 ${
                  stat.color === 'green' ? 'from-green-100 to-green-200' :
                  stat.color === 'blue'  ? 'from-blue-100 to-blue-200' :
                                           'from-yellow-100 to-yellow-200'
                }`}>
                  <stat.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'blue'  ? 'text-blue-600' :
                                             'text-yellow-600'
                  }`} />
                </div>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{stat.label}</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 sm:p-6 lg:p-7 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-md">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Upcoming Parent-Teacher Meetings</h2>
            </div>
          </div>

          <div className="p-5 sm:p-6 lg:p-7">
            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : upcomingMeetings.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming meetings scheduled.</p>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting._id}
                    className="flex items-start space-x-4 p-4 sm:p-5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-300"
                  >
                    <div className="p-2.5 bg-blue-100 rounded-xl flex-shrink-0">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-semibold text-gray-800">
                        {meeting.title || meeting.topic || 'Meeting'}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatMeetingDate(meeting.meetingDate)}
                          {meeting.meetingTime ? ` · ${meeting.meetingTime}` : ''}
                        </span>
                        {meeting.teacherId?.name && (
                          <span className="text-xs text-gray-500">Teacher: {meeting.teacherId.name}</span>
                        )}
                        {meeting.studentId?.name && (
                          <span className="text-xs text-gray-500">Student: {meeting.studentId.name}</span>
                        )}
                      </div>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full ${
                      meeting.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {(meeting.status || 'scheduled').toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ParentDashboard;
