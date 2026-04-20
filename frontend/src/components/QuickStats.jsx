import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Trophy, Clock, TrendingUp, FileText, ChevronRight } from 'lucide-react';
import { useStudentDashboard } from './StudentDashboardContext';
import { fetchCachedJson } from '../utils/studentApiCache';

/* Thin linear progress bar */
const Bar = ({ pct, colorClass = 'bg-white' }) => (
  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
    <div
      className={`h-full rounded-full ${colorClass} transition-all duration-700`}
      style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
    />
  </div>
);

const CARD_THEMES = [
  {
    bg: 'from-sky-500 to-blue-600',
    shadow: 'shadow-blue-200/60',
    iconBg: 'bg-white/20',
    badge: 'bg-white/20 text-white',
  },
  {
    bg: 'from-amber-400 to-yellow-500',
    shadow: 'shadow-amber-200/60',
    iconBg: 'bg-white/20',
    badge: 'bg-white/20 text-white',
  },
  {
    bg: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-200/60',
    iconBg: 'bg-white/20',
    badge: 'bg-white/20 text-white',
  },
  {
    bg: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-200/60',
    iconBg: 'bg-white/20',
    badge: 'bg-white/20 text-white',
  },
];

const StatCard = ({ stat, theme, loading }) => {
  const Icon = stat.icon;
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${theme.bg} p-4 sm:p-5 shadow-lg ${theme.shadow} transition-transform hover:-translate-y-0.5`}
    >
      {/* Decorative circle */}
      <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />

      <div className="relative z-10">
        {/* Icon + badge */}
        <div className="flex items-start justify-between mb-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.iconBg} backdrop-blur-sm`}>
            <Icon size={20} className="text-white" />
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${theme.badge} max-w-22.5 truncate`}>
            {loading ? '…' : stat.change}
          </span>
        </div>

        {/* Value */}
        <p className="text-2xl font-black text-white leading-none">
          {loading ? <span className="inline-block h-7 w-14 rounded-lg bg-white/30 animate-pulse" /> : stat.value}
        </p>
        <p className="mt-1 text-xs font-semibold text-white/80">{stat.title}</p>

        {/* Progress bar for attendance / progress */}
        {!loading && stat.progress !== undefined && <Bar pct={stat.progress} />}
      </div>
    </div>
  );
};

const QuickStats = () => {
  const { stats: dashboardStats, course, loading } = useStudentDashboard();
  const [assignmentSummary, setAssignmentSummary] = useState({ total: 0, pending: 0, evaluated: 0, loading: false });

  useEffect(() => {
    const activeCourses = dashboardStats?.activeCourses ?? 0;
    if (loading || activeCourses > 0) return;

    const fetchAssignments = async () => {
      try {
        setAssignmentSummary(prev => ({ ...prev, loading: true }));
        const token = localStorage.getItem('token');
        if (!token) { setAssignmentSummary({ total: 0, pending: 0, evaluated: 0, loading: false }); return; }
        const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
        const { data } = await fetchCachedJson(`${API_BASE}/api/assignment/student/assignments`, {
          ttlMs: 5 * 60 * 1000,
          fetchOptions: { headers: { Authorization: `Bearer ${token}` } },
        });
        const list = Array.isArray(data) ? data : Array.isArray(data?.assignments) ? data.assignments : [];
        setAssignmentSummary({
          total: list.length,
          pending: list.filter(a => a?.submissionStatus === 'not_submitted' || !a?.submissionStatus).length,
          evaluated: list.filter(a => a?.submissionStatus === 'graded').length,
          loading: false,
        });
      } catch {
        setAssignmentSummary({ total: 0, pending: 0, evaluated: 0, loading: false });
      }
    };
    fetchAssignments();
  }, [dashboardStats, loading]);

  const stats = useMemo(() => {
    if (!dashboardStats) {
      return [
        { title: 'Active Courses', value: loading ? '…' : '0', change: loading ? 'Loading…' : 'No course', icon: BookOpen },
        { title: 'Achievements',   value: loading ? '…' : '0', change: loading ? 'Loading…' : 'Keep going!', icon: Trophy },
        { title: 'Attendance',     value: loading ? '…' : '0%', change: loading ? 'Loading…' : '0/0 days', icon: Clock, progress: 0 },
        { title: 'Overall Progress', value: loading ? '…' : '0%', change: loading ? 'Loading…' : 'Focus on class', icon: TrendingUp, progress: 0 },
      ];
    }

    const attPct = dashboardStats.attendancePercentage ?? 0;
    const attLabel = attPct >= 75 ? 'Good attendance' : attPct >= 50 ? 'Needs improvement' : 'Low attendance';

    const base = [
      {
        title: 'Active Courses',
        value: String(dashboardStats.activeCourses),
        change: course ? course.name : 'No course assigned',
        icon: BookOpen,
      },
      {
        title: 'Achievements',
        value: String(dashboardStats.achievements),
        change: 'Keep learning!',
        icon: Trophy,
      },
      {
        title: 'Attendance',
        value: `${attPct}%`,
        change: `${dashboardStats.presentDays}/${dashboardStats.totalClasses} days`,
        icon: Clock,
        progress: attPct,
      },
      {
        title: 'Overall Progress',
        value: `${dashboardStats.overallProgress}%`,
        change: attLabel,
        icon: TrendingUp,
        progress: dashboardStats.overallProgress ?? 0,
      },
    ];

    if (dashboardStats.activeCourses === 0) {
      base[0] = {
        title: 'Assignments',
        value: assignmentSummary.loading ? '…' : String(assignmentSummary.total),
        change: assignmentSummary.loading ? 'Loading…' : assignmentSummary.total > 0 ? `Evaluated ${assignmentSummary.evaluated}` : 'No assignments',
        icon: FileText,
      };
    }

    return base;
  }, [dashboardStats, course, loading, assignmentSummary]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, i) => (
        <StatCard key={i} stat={stat} theme={CARD_THEMES[i]} loading={loading} />
      ))}
    </div>
  );
};

export default QuickStats;
