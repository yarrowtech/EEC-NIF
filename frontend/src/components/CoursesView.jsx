import React, { useEffect, useState } from 'react';
import { Book, Clock, Calendar, TrendingUp, Layers, GraduationCap } from 'lucide-react';

const CoursesView = () => {
  const [course, setCourse] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');

        if (!token || userType !== 'Student') {
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/student/auth/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Unable to load course overview.');
        }

        const data = await response.json();
        setCourse(data.course || null);
        setStats(data.stats || null);
        setRecentAttendance((data.recentAttendance || []).slice(0, 5));
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Failed to fetch course data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const summaryCards = [
    {
      title: 'Active Courses',
      value: stats?.activeCourses ?? 0,
      icon: Book,
      description: course?.name || 'No active course',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Attendance',
      value: `${stats?.attendancePercentage ?? 0}%`,
      icon: Clock,
      description: `${stats?.presentDays ?? 0}/${stats?.totalClasses ?? 0} classes`,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Classes Attended',
      value: stats?.presentDays ?? 0,
      icon: Calendar,
      description: `Absent ${stats?.absentDays ?? 0} days`,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Overall Progress',
      value: `${stats?.overallProgress ?? 0}%`,
      icon: TrendingUp,
      description: 'Based on attendance',
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ];

  const statusBadgeStyles = course?.status === 'Active'
    ? 'bg-green-100 text-green-700'
    : 'bg-gray-100 text-gray-700';

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
        <div className="flex flex-col gap-3 mb-4">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-64 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-32 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl h-64 border border-gray-100 animate-pulse" />
          <div className="bg-white rounded-xl h-64 border border-gray-100 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 text-sm sm:text-base">Current academic overview synced from your dashboard</p>
        </div>
        {lastUpdated && (
          <span className="text-sm text-gray-500">Updated {lastUpdated.toLocaleDateString()}</span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                </div>
                <div className={`p-3 rounded-full ${card.bg}`}>
                  <Icon className={card.color} />
                </div>
              </div>
              <p className="text-sm text-gray-500">{card.description}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-purple-400 p-6 lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Current Course</h2>
              <p className="text-sm text-gray-500">Details pulled from the NIF student record</p>
            </div>
            {course && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeStyles}`}>
                {course.status || 'Active'}
              </span>
            )}
          </div>

          {course ? (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500">Course Name</p>
                <p className="text-2xl font-bold text-gray-900">{course.name}</p>
                <p className="text-sm text-gray-500 mt-1">Batch Code: {course.batchCode || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Grade', value: course.grade || '-' },
                  { label: 'Section', value: course.section || '-' },
                  { label: 'Duration', value: course.duration || 'TBD' },
                  { label: 'Status', value: course.status || 'Active' }
                ].map((item) => (
                  <div key={item.label} className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-lg font-semibold text-purple-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <GraduationCap size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium">No course assigned</p>
              <p className="text-sm text-gray-400 mt-1">Please contact your administrator for enrollment details</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Layers size={18} className="text-purple-500" />
              Recent Attendance
            </h3>
            <span className="text-xs text-gray-500">Last 5 records</span>
          </div>

          {recentAttendance.length > 0 ? (
            <div className="space-y-3">
              {recentAttendance.map((entry, idx) => (
                <div key={entry._id || idx} className="flex items-center justify-between border border-purple-100 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {entry.subject || 'Class'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    entry.status === 'present'
                      ? 'bg-green-100 text-green-700'
                      : entry.status === 'absent'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {entry.status?.charAt(0).toUpperCase() + entry.status?.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No attendance records available.</p>
          )}
        </div>
      </div> */}
      <div className="bg-white shadow-sm p-6 h-[90vh]">
        <div className="text-center flex justify-center items-center h-full">
          <p className="text-gray-600">AI Courses comming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default CoursesView;
