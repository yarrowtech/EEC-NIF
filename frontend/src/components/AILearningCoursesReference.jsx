import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Clock,
  Megaphone,
  Sparkles,
  Star,
  Upload,
} from 'lucide-react';
import { fetchCachedJson } from '../utils/studentApiCache';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const DASHBOARD_ENDPOINT = `${API_BASE}/api/student/auth/dashboard`;
const FEEDBACK_CONTEXT_ENDPOINT = `${API_BASE}/api/student/auth/teacher-feedback/context`;
const EXAMS_ENDPOINT = `${API_BASE}/api/exam/groups/student-schedule`;

const formatDateLabel = (value) => {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return 'DATE TBD';
  return dt
    .toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .toUpperCase();
};

const AILearningCoursesReference = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [course, setCourse] = useState(null);
  const [contexts, setContexts] = useState([]);
  const [examGroups, setExamGroups] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        if (!token || userType !== 'Student') return;

        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const [dashRes, contextRes, examsRes] = await Promise.all([
          fetchCachedJson(DASHBOARD_ENDPOINT, { ttlMs: 2 * 60 * 1000, fetchOptions: { headers } }),
          fetchCachedJson(FEEDBACK_CONTEXT_ENDPOINT, { ttlMs: 2 * 60 * 1000, fetchOptions: { headers } }),
          fetchCachedJson(EXAMS_ENDPOINT, { ttlMs: 2 * 60 * 1000, fetchOptions: { headers } }),
        ]);

        setStats(dashRes?.data?.stats || null);
        setProfile(dashRes?.data?.profile || null);
        setCourse(dashRes?.data?.course || null);
        setContexts(Array.isArray(contextRes?.data?.teachers) ? contextRes.data.teachers : []);
        setExamGroups(Array.isArray(examsRes?.data) ? examsRes.data : []);
      } catch (err) {
        setError(err?.message || 'Failed to load learning data');
      }
    };

    load();
  }, []);

  const assignedSubjects = useMemo(() => {
    const names = new Set();
    contexts.forEach((ctx) => {
      const subject = String(ctx?.subjectName || '').trim();
      if (subject) names.add(subject);
    });
    return Array.from(names);
  }, [contexts]);

  const featuredTitle = course?.name || assignedSubjects[0] || 'Assigned Learning Track';
  const featuredDescription = profile?.className
    ? `Continue your class ${profile.className}${profile?.sectionName ? `-${profile.sectionName}` : ''} learning path with guided topics and practice.`
    : 'Continue your assigned learning path with guided topics and practice.';
  const overallProgress = Math.max(0, Math.min(100, Number(stats?.overallProgress || 0)));

  const insights = useMemo(() => {
    const attendancePct = Number(stats?.attendancePercentage || 0);
    const present = Number(stats?.presentDays || 0);
    const total = Number(stats?.totalClasses || 0);
    const teacherCount = new Set(contexts.map((c) => String(c?.teacherId || '')).filter(Boolean)).size;

    return [
      {
        id: 1,
        title: 'Attendance Progress',
        description: `${present}/${total} classes present${total ? ` (${attendancePct}%)` : ''}.`,
        xp: `${attendancePct}%`,
        icon: BookOpen,
        iconClass: 'text-yellow-600',
        wrapClass: 'bg-yellow-50',
      },
      {
        id: 2,
        title: 'Assigned Mentors',
        description: `${teacherCount} teacher${teacherCount === 1 ? '' : 's'} mapped across your subjects.`,
        xp: `${assignedSubjects.length} Subjects`,
        icon: Sparkles,
        iconClass: 'text-blue-600',
        wrapClass: 'bg-blue-50',
      },
    ];
  }, [assignedSubjects.length, contexts, stats]);

  const deadlines = useMemo(() => {
    const now = Date.now();
    const exams = [];

    examGroups.forEach((group) => {
      (group?.subjects || []).forEach((exam) => {
        const when = new Date(exam?.date || '').getTime();
        if (!Number.isFinite(when) || when < now) return;
        exams.push({
          id: String(exam?._id || `${group?._id}-${exam?.subjectId?._id || exam?.title || when}`),
          title: exam?.subjectId?.name || exam?.title || group?.title || 'Upcoming Exam',
          date: exam?.date,
          when,
        });
      });
    });

    exams.sort((a, b) => a.when - b.when);
    const top = exams.slice(0, 3);

    if (top.length === 0) {
      return [{ id: 'none', title: 'No upcoming exams', date: null, active: false }];
    }

    return top.map((item, idx) => ({
      ...item,
      active: idx === 0,
      dateLabel: formatDateLabel(item.date),
    }));
  }, [examGroups]);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 p-3 sm:p-4 md:p-6 space-y-6 sm:space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <section>
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-slate-900 min-h-[240px] sm:h-[280px] md:h-[320px] flex items-center px-4 sm:px-6 md:px-12 group">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent z-10" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.15),transparent_50%)]" />
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-10 right-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000" />
              </div>
            </div>

            <div className="relative z-10 max-w-full lg:max-w-2xl">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-sky-500/20 backdrop-blur-sm border border-sky-400/30 rounded-full px-2.5 sm:px-3 py-1 mb-3 sm:mb-4">
                <Star size={12} className="sm:hidden text-sky-400 fill-sky-400" />
                <Star size={14} className="hidden sm:block text-sky-400 fill-sky-400" />
                <span className="text-[9px] sm:text-[10px] font-bold text-sky-300 uppercase tracking-widest">Learning Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-2 sm:mb-3 tracking-tight">
                Smart Learning <br />
                <span className="text-sky-400">for your subjects</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base md:text-lg font-light leading-relaxed mb-4 sm:mb-6 max-w-full lg:max-w-xl pr-4">
                Personalized learning for your assigned timetable subjects with live progress, insights, and upcoming assessments.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                <button className="bg-white text-slate-900 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-sky-100 transition-all hover:scale-105 shadow-lg active:scale-95">
                  Continue Learning
                </button>
                <button className="text-white border border-white/20 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-white/10 transition-all backdrop-blur-sm active:scale-95">
                  View Assigned Subjects ({assignedSubjects.length})
                </button>
              </div>
              {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
            </div>

            <div className="absolute right-4 xl:right-12 top-1/2 -translate-y-1/2 hidden xl:block">
              <div className="relative w-48 h-48 border-2 border-sky-500/20 rounded-full animate-spin-slow flex items-center justify-center">
                <div className="w-36 h-36 border border-sky-500/30 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles size={48} className="text-sky-500/40" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <div className="md:col-span-2 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group shadow-md hover:shadow-lg transition-shadow border border-slate-100">
            <div className="relative z-10">
              <span className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-3 sm:mb-4">Current Progress</span>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-1.5 sm:mb-2">{featuredTitle}</h3>
              <p className="text-slate-600 text-xs sm:text-sm md:text-base max-w-sm mb-4 sm:mb-6 leading-relaxed">
                {featuredDescription}
              </p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-4">
              <div className="flex-1 w-full max-w-xs">
                <div className="flex justify-between text-[10px] sm:text-xs font-bold mb-1.5 sm:mb-2 text-slate-600">
                  <span>Overall Completion</span>
                  <span className="text-sky-700">{overallProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 sm:h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-500 to-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
                </div>
              </div>
              <button className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform active:scale-95 shrink-0">
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="absolute -right-10 -top-10 w-32 sm:w-48 h-32 sm:h-48 bg-sky-200/30 rounded-full blur-3xl group-hover:bg-sky-300/40 transition-colors" />
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-between text-white relative overflow-hidden shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
            <div>
              <Upload size={28} className="sm:w-9 sm:h-9 md:w-10 md:h-10 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg md:text-xl font-extrabold leading-tight mb-1.5 sm:mb-2">Quick Lesson <br />Generator</h3>
            </div>
            <p className="text-[11px] sm:text-xs md:text-sm opacity-90 mb-3 sm:mb-4 md:mb-6 leading-relaxed">Create concise study guides using your assigned syllabus topics.</p>
            <button className="bg-white text-emerald-700 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-emerald-50 transition-colors active:scale-95">
              <Upload size={14} className="sm:hidden" />
              <Upload size={16} className="hidden sm:block" />
              Upload File
            </button>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h4 className="text-base sm:text-lg md:text-xl font-bold text-slate-800">Learning Insights</h4>
              <button className="text-sky-700 text-[10px] sm:text-xs font-bold hover:underline whitespace-nowrap shrink-0">View All</button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {insights.map((insight) => {
                const Icon = insight.icon;
                return (
                  <div key={insight.id} className="bg-white p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md transition-shadow border border-slate-100">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl ${insight.wrapClass} flex items-center justify-center shrink-0`}>
                      <Icon size={20} className={`sm:hidden ${insight.iconClass}`} />
                      <Icon size={22} className={`hidden sm:block md:hidden ${insight.iconClass}`} />
                      <Icon size={24} className={`hidden md:block ${insight.iconClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs sm:text-sm font-bold text-slate-800 mb-0.5 sm:mb-1 truncate">{insight.title}</h5>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed line-clamp-2">{insight.description}</p>
                    </div>
                    <div className="text-right shrink-0"><span className="text-[10px] sm:text-xs font-bold text-green-600">{insight.xp}</span></div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full lg:w-80">
            <div className="bg-slate-100 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Clock size={16} className="sm:hidden text-sky-800 shrink-0" />
                <Clock size={18} className="hidden sm:block md:hidden text-sky-800 shrink-0" />
                <Clock size={20} className="hidden md:block text-sky-800 shrink-0" />
                <h4 className="text-[11px] sm:text-xs md:text-sm font-black text-sky-900 uppercase tracking-widest truncate">Upcoming Deadlines</h4>
              </div>
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                {deadlines.map((deadline) => (
                  <div key={deadline.id} className={`relative pl-5 sm:pl-6 border-l-2 ${deadline.active ? 'border-sky-600' : 'border-slate-300'}`}>
                    <div className={`absolute -left-[5px] top-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${deadline.active ? 'bg-sky-600 animate-pulse' : 'bg-slate-400'}`} />
                    <p className={`text-[9px] sm:text-[10px] font-bold mb-0.5 sm:mb-1 uppercase tracking-wider ${deadline.active ? 'text-sky-700' : 'text-slate-400'}`}>
                      {deadline.dateLabel || 'NO UPCOMING DATE'}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">{deadline.title}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gradient-to-br from-sky-900 to-indigo-900 rounded-lg sm:rounded-xl text-white">
                <p className="text-[9px] sm:text-[10px] font-bold text-sky-300 uppercase tracking-widest mb-1.5 sm:mb-2 flex items-center gap-1.5">
                  <Bell size={11} className="sm:hidden" />
                  <Bell size={12} className="hidden sm:block" />
                  Learning Tip
                </p>
                <p className="text-[11px] sm:text-xs leading-relaxed italic opacity-95">Keep revising assigned topics weekly to improve consistency and retention.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button className="fixed right-4 sm:right-6 bottom-20 sm:bottom-6 w-14 h-14 bg-white/80 backdrop-blur-xl rounded-full shadow-2xl flex items-center justify-center text-sky-700 hover:scale-110 transition-transform border border-white/50 z-50">
        <Megaphone size={24} className="fill-sky-700" />
      </button>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
      `}</style>
    </div>
  );
};

export default AILearningCoursesReference;
