import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Activity,
  Calendar,
  FileText,
  ClipboardCheck,
  Bell,
  TrendingUp,
  BookOpen,
  BarChart3,
  Clock,
  Eye,
  ChevronRight,
  AlertTriangle,
  Award,
  Sparkles,
} from 'lucide-react';

const TeacherDashboard = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(null);
  const [classTeacherAllocations, setClassTeacherAllocations] = useState([]);
  const [dashboardError, setDashboardError] = useState('');
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    if (Number.isNaN(diffMs)) return 'Just now';
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      setDashboardLoading(true);
      setDashboardError('');
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        };
        const [dashboardRes, allocationRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/teacher/dashboard`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/teacher/dashboard/allocations`, { headers }),
        ]);

        const dashboardPayload = await dashboardRes.json().catch(() => ({}));
        if (!dashboardRes.ok) {
          throw new Error(dashboardPayload?.error || 'Unable to load dashboard data');
        }
        setDashboardData(dashboardPayload);

        const allocationPayload = await allocationRes.json().catch(() => []);
        if (allocationRes.ok && Array.isArray(allocationPayload)) {
          const classTeacherOnly = allocationPayload.filter((item) => Boolean(item?.isClassTeacher));
          setClassTeacherAllocations(classTeacherOnly);
        } else {
          setClassTeacherAllocations([]);
        }
      } catch (error) {
        setDashboardError(error.message || 'Unable to load dashboard data');
      } finally {
        setDashboardLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getGreeting = () => {
    const hour = currentDateTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const dateStr = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const timeStr = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const classTeacherLabel = classTeacherAllocations.length
    ? classTeacherAllocations
        .map((item) => {
          const className = item?.classId?.name || item?.className || 'Class';
          const sectionName = item?.sectionId?.name || item?.sectionName || 'Section';
          return `${className}-${sectionName}`;
        })
        .join(', ')
    : '';

  const stats = dashboardData?.stats || {};
  const quickStats = [
    { label: 'Total Students', value: stats.totalStudents ?? 0, icon: Users, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-600', change: 'Campus total' },
    { label: 'Attendance Today', value: `${stats.attendanceRate ?? 0}%`, icon: Activity, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-600', change: 'Marked today' },
    { label: 'Pending Evaluations', value: stats.pendingEvaluations ?? 0, icon: FileText, gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-600', change: 'Submissions pending' },
    { label: 'Upcoming Events', value: stats.upcomingEvents ?? 0, icon: Calendar, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-600', change: 'Scheduled today' },
  ];

  const activityIconMap = {
    assignment: { icon: FileText, bg: 'bg-blue-50', text: 'text-blue-600' },
    meeting: { icon: Calendar, bg: 'bg-purple-50', text: 'text-purple-600' },
    attendance: { icon: ClipboardCheck, bg: 'bg-emerald-50', text: 'text-emerald-600' },
    announcement: { icon: Bell, bg: 'bg-amber-50', text: 'text-amber-600' },
    performance: { icon: Award, bg: 'bg-green-50', text: 'text-green-600' },
  };

  const recentActivities = (dashboardData?.recentActivities || []).map((activity) => {
    const config = activityIconMap[activity.type] || activityIconMap.assignment;
    return { ...activity, icon: config.icon, bg: config.bg, text: config.text, time: timeAgo(activity.time) };
  });

  const upcomingClasses = dashboardData?.upcomingClasses || [];
  const performanceMetrics = dashboardData?.performanceMetrics || [];
  const topStudents = dashboardData?.topStudents || [];
  const upcomingDeadlines = dashboardData?.upcomingDeadlines || [];

  const quickActions = [
    { id: 1, label: 'Mark Attendance', desc: "Take today's attendance", icon: ClipboardCheck, gradient: 'from-emerald-500 to-teal-600', path: '/teacher/attendance' },
    { id: 2, label: 'Assignments', desc: 'Manage & create', icon: FileText, gradient: 'from-blue-500 to-indigo-600', path: '/teacher/assignments' },
    { id: 3, label: 'Parent Meetings', desc: 'Schedule meetings', icon: Calendar, gradient: 'from-violet-500 to-purple-600', path: '/teacher/parent-meetings' },
    { id: 4, label: 'Student Progress', desc: 'Performance tracking', icon: BarChart3, gradient: 'from-cyan-500 to-blue-600', path: '/teacher/progress' },
    { id: 5, label: 'Weak Students', desc: 'AI-powered insight', icon: AlertTriangle, gradient: 'from-rose-500 to-red-600', path: '/teacher/weak-students' },
    { id: 6, label: 'AI Teaching', desc: 'Smart tools', icon: Sparkles, gradient: 'from-amber-500 to-orange-600', path: '/teacher/ai-powered-teaching' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-indigo-600 to-violet-700 p-5 sm:p-7 text-white">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-60 h-32 bg-white/5 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {getGreeting()}, {dashboardData?.teacher?.name || 'Teacher'}
            </h1>
            <p className="mt-1 text-sm text-white/70">{dateStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
              <Clock size={16} className="text-white/70" />
              <span className="font-semibold tabular-nums">{timeStr}</span>
            </div>
          </div>
        </div>
        {classTeacherLabel && (
          <div className="relative mt-4 inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white/95">
            Class Teacher Of: {classTeacherLabel}
          </div>
        )}
      </div>

      {dashboardError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {dashboardError}
        </div>
      )}

      {dashboardLoading && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          Loading dashboard data...
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {quickStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="group relative bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-linear-to-br ${stat.gradient} shadow-lg`}>
                  <Icon size={18} className="text-white" />
                </div>
              </div>
              <p className="text-[22px] sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-gray-400 mt-1">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                to={action.path}
                className="group flex flex-col items-center gap-2.5 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className={`p-3 rounded-xl bg-linear-to-br ${action.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-800">{action.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Schedule + Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50">
                <Clock size={16} className="text-blue-600" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Today's Schedule</h2>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2.5">
              {upcomingClasses.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-3 rounded-full bg-gray-50 mb-3">
                    <Calendar size={24} className="text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400">No classes scheduled</p>
                </div>
              )}
              {upcomingClasses.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors group">
                  <div className="w-1 h-10 rounded-full bg-linear-to-b from-blue-500 to-indigo-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{c.subject}</p>
                    <p className="text-[11px] text-gray-400">{c.class} &middot; {c.room}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-gray-700">{c.time}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700">
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/teacher/class-routine"
              className="mt-4 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            >
              View Full Schedule
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50">
                <Bell size={16} className="text-amber-600" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Recent Activities</h2>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2.5">
              {recentActivities.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-3 rounded-full bg-gray-50 mb-3">
                    <Bell size={24} className="text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400">No recent activity</p>
                </div>
              )}
              {recentActivities.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className={`p-2 rounded-xl ${a.bg} shrink-0`}>
                      <Icon size={16} className={a.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{a.message}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{a.time}</p>
                    </div>
                    <button className="shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all">
                      <Eye size={14} className="text-gray-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Performance + Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

        {/* Performance Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-50">
                <BarChart3 size={16} className="text-violet-600" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Performance Overview</h2>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subject Averages */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Subject Averages</h3>
                <div className="space-y-3">
                  {performanceMetrics.length === 0 && (
                    <div className="flex flex-col items-center py-6 text-center">
                      <div className="p-2.5 rounded-full bg-gray-50 mb-2">
                        <BarChart3 size={20} className="text-gray-300" />
                      </div>
                      <p className="text-xs text-gray-400">Data appears after grading</p>
                    </div>
                  )}
                  {performanceMetrics.map((s, i) => (
                    <div key={i} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">{s.subject}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-800">{s.average}%</span>
                          {s.trend === 'up' && <TrendingUp size={12} className="text-emerald-500" />}
                          {s.trend === 'down' && <TrendingUp size={12} className="text-red-500 rotate-180" />}
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                          style={{ width: `${s.average}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Students */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Top Students</h3>
                <div className="space-y-2">
                  {topStudents.length === 0 && (
                    <div className="flex flex-col items-center py-6 text-center">
                      <div className="p-2.5 rounded-full bg-gray-50 mb-2">
                        <Award size={20} className="text-gray-300" />
                      </div>
                      <p className="text-xs text-gray-400">Appears after grading</p>
                    </div>
                  )}
                  {topStudents.map((st, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{st.name}</p>
                        <p className="text-[10px] text-gray-400">{st.grade}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{st.score}%</p>
                        <p className="text-[10px] text-emerald-600 font-medium">{st.improvement}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-50">
                <Calendar size={16} className="text-rose-600" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Deadlines</h2>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2.5">
              {upcomingDeadlines.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-3 rounded-full bg-gray-50 mb-3">
                    <Calendar size={24} className="text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400">No upcoming deadlines</p>
                </div>
              )}
              {upcomingDeadlines.map((item, idx) => (
                <div key={`${item.title}-${idx}`} className="p-3.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Upcoming</span>
                    <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'TBA'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {item.class || '-'}{item.subject ? ` · ${item.subject}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
