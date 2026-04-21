import React, { useEffect, useState } from 'react';
import {
  Book, Clock, Calendar, TrendingUp, Layers, GraduationCap, Star, Sparkles,
  BookOpen, FileText, Upload, Play, History, Lightbulb, Award, Target,
  Brain, Zap, CheckCircle, ArrowRight, CalendarDays, AlertCircle
} from 'lucide-react';
import { fetchCachedJson } from '../utils/studentApiCache';

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

        const { data } = await fetchCachedJson(`${import.meta.env.VITE_API_URL}/api/student/auth/dashboard`, {
          ttlMs: 5 * 60 * 1000,
          fetchOptions: {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          },
        });
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
      <div className="space-y-6 p-4 sm:p-6 pb-8 min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="h-[320px] bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-48 bg-white rounded-2xl animate-pulse" />
          <div className="h-48 bg-white rounded-2xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-white rounded-2xl animate-pulse" />
          <div className="h-64 bg-white rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Mock data for the learning hub
  const learningModules = [
    {
      id: 1,
      title: 'Mathematics',
      description: 'Advanced algebra, geometry, and calculus concepts',
      progress: 68,
      color: 'from-blue-500 to-blue-600',
      icon: Book,
      lessons: 45,
      hours: 32
    },
    {
      id: 2,
      title: 'Physics',
      description: 'Mechanics, electricity, and modern physics',
      progress: 52,
      color: 'from-purple-500 to-purple-600',
      icon: Sparkles,
      lessons: 38,
      hours: 28
    },
    {
      id: 3,
      title: 'Chemistry',
      description: 'Organic chemistry and chemical reactions',
      progress: 75,
      color: 'from-green-500 to-green-600',
      icon: BookOpen,
      lessons: 40,
      hours: 30
    },
    {
      id: 4,
      title: 'Biology',
      description: 'Cell biology, genetics, and evolution',
      progress: 60,
      color: 'from-orange-500 to-orange-600',
      icon: Target,
      lessons: 42,
      hours: 26
    }
  ];

  const insights = [
    {
      id: 1,
      title: 'Concept Mastery: Quadratic Equations',
      description: 'You spent 2 hours on this yesterday. Good progress!',
      xp: '+12 XP',
      icon: Lightbulb,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      xpColor: 'text-green-600'
    },
    {
      id: 2,
      title: 'Quiz Perfection: Calculus I',
      description: 'Scored 100% on the Derivatives mock test.',
      xp: '+50 XP',
      icon: Award,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      xpColor: 'text-green-600'
    }
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      title: 'Literature Essay',
      date: 'TOMORROW, 09:00 AM',
      status: 'urgent',
      isActive: true
    },
    {
      id: 2,
      title: 'Physics Lab Submission',
      date: '15 JUNE, 02:00 PM',
      status: 'upcoming',
      isActive: false
    },
    {
      id: 3,
      title: 'Mathematics Midterm Exam',
      date: '20 JUNE, 11:30 AM',
      status: 'upcoming',
      isActive: false
    }
  ];

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 p-3 sm:p-4 md:p-6 space-y-6 sm:space-y-8">
      {/* Hero Announcement Banner */}
      <section>
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-slate-900 min-h-[240px] sm:h-[280px] md:h-[320px] flex items-center px-4 sm:px-6 md:px-12 group">
          {/* Background with Gradient Overlay */}
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
              <span className="text-[9px] sm:text-[10px] font-bold text-sky-300 uppercase tracking-widest">New Feature</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-2 sm:mb-3 tracking-tight">
              AI Courses <br />
              <span className="text-sky-400">coming soon!</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base md:text-lg font-light leading-relaxed mb-4 sm:mb-6 max-w-full lg:max-w-xl pr-4">
              Personalized, curriculum-aligned courses generated in seconds by your AI Learning Assistant.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <button className="bg-white text-slate-900 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-sky-100 transition-all hover:scale-105 shadow-lg active:scale-95">
                Notify Me
              </button>
              <button className="text-white border border-white/20 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-white/10 transition-all backdrop-blur-sm active:scale-95">
                View Roadmap
              </button>
            </div>
          </div>

          {/* Decorative Element - Hidden on mobile and tablet */}
          <div className="absolute right-4 xl:right-12 top-1/2 -translate-y-1/2 hidden xl:block">
            <div className="relative w-48 h-48 border-2 border-sky-500/20 rounded-full animate-spin-slow flex items-center justify-center">
              <div className="w-36 h-36 border border-sky-500/30 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles size={48} className="text-sky-500/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Preview Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Featured Module */}
        <div className="md:col-span-2 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group shadow-md hover:shadow-lg transition-shadow border border-slate-100">
          <div className="relative z-10">
            <span className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-3 sm:mb-4">
              Current Progress
            </span>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-1.5 sm:mb-2">Organic Chemistry II</h3>
            <p className="text-slate-600 text-xs sm:text-sm md:text-base max-w-sm mb-4 sm:mb-6 leading-relaxed">
              Continue where you left off in Module 4: Synthesis of Carbonyl Compounds.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-4">
            <div className="flex-1 w-full max-w-xs">
              <div className="flex justify-between text-[10px] sm:text-xs font-bold mb-1.5 sm:mb-2 text-slate-600">
                <span>Module Completion</span>
                <span className="text-sky-700">68%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 sm:h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-sky-500 to-blue-600 h-full rounded-full transition-all duration-500" style={{ width: '68%' }}></div>
              </div>
            </div>
            <button className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform active:scale-95 shrink-0">
              <Play size={16} className="sm:hidden fill-white" />
              <Play size={18} className="hidden sm:block md:hidden fill-white" />
              <Play size={20} className="hidden md:block fill-white" />
            </button>
          </div>
          {/* Decorative blur */}
          <div className="absolute -right-10 -top-10 w-32 sm:w-48 h-32 sm:h-48 bg-sky-200/30 rounded-full blur-3xl group-hover:bg-sky-300/40 transition-colors" />
        </div>

        {/* Quick Action Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-between text-white relative overflow-hidden shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
          <div>
            <FileText size={28} className="sm:w-9 sm:h-9 md:w-10 md:h-10 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg md:text-xl font-extrabold leading-tight mb-1.5 sm:mb-2">
              Quick Lesson <br />Generator
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs md:text-sm opacity-90 mb-3 sm:mb-4 md:mb-6 leading-relaxed">
            Turn any PDF or note into a structured study guide instantly.
          </p>
          <button className="bg-white text-emerald-700 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-emerald-50 transition-colors active:scale-95">
            <Upload size={14} className="sm:hidden" />
            <Upload size={16} className="hidden sm:block" />
            Upload File
          </button>
        </div>
      </section>

      {/* Bottom Editorial Section */}
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* Learning Insights */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h4 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
              <Brain size={20} className="sm:hidden text-indigo-600" />
              <Brain size={22} className="hidden sm:block md:hidden text-indigo-600" />
              <Brain size={24} className="hidden md:block text-indigo-600" />
              <span className="truncate">Learning Insights</span>
            </h4>
            <button className="text-sky-700 text-[10px] sm:text-xs font-bold hover:underline whitespace-nowrap shrink-0">View All</button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {insights.map((insight) => {
              const Icon = insight.icon;
              return (
                <div key={insight.id} className="bg-white p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md transition-shadow border border-slate-100">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl ${insight.bgColor} flex items-center justify-center shrink-0`}>
                    <Icon size={20} className={`sm:hidden ${insight.iconColor}`} />
                    <Icon size={22} className={`hidden sm:block md:hidden ${insight.iconColor}`} />
                    <Icon size={24} className={`hidden md:block ${insight.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs sm:text-sm font-bold text-slate-800 mb-0.5 sm:mb-1 truncate">{insight.title}</h5>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed line-clamp-2">{insight.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] sm:text-xs font-bold ${insight.xpColor}`}>{insight.xp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Deadlines Sidebar */}
        <div className="w-full lg:w-80">
          <div className="bg-slate-100 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <CalendarDays size={16} className="sm:hidden text-sky-800 shrink-0" />
              <CalendarDays size={18} className="hidden sm:block md:hidden text-sky-800 shrink-0" />
              <CalendarDays size={20} className="hidden md:block text-sky-800 shrink-0" />
              <h4 className="text-[11px] sm:text-xs md:text-sm font-black text-sky-900 uppercase tracking-widest truncate">Upcoming Deadlines</h4>
            </div>

            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={deadline.id} className={`relative pl-5 sm:pl-6 border-l-2 ${deadline.isActive ? 'border-sky-600' : 'border-slate-300'}`}>
                  <div className={`absolute -left-[5px] top-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${deadline.isActive ? 'bg-sky-600 animate-pulse' : 'bg-slate-400'}`} />
                  <p className={`text-[9px] sm:text-[10px] font-bold mb-0.5 sm:mb-1 uppercase tracking-wider ${deadline.isActive ? 'text-sky-700' : 'text-slate-400'}`}>
                    {deadline.date}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">{deadline.title}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gradient-to-br from-sky-900 to-indigo-900 rounded-lg sm:rounded-xl text-white">
              <p className="text-[9px] sm:text-[10px] font-bold text-sky-300 uppercase tracking-widest mb-1.5 sm:mb-2 flex items-center gap-1.5">
                <Zap size={11} className="sm:hidden" />
                <Zap size={12} className="hidden sm:block" />
                AI Tutor Tip
              </p>
              <p className="text-[11px] sm:text-xs leading-relaxed italic opacity-95">
                "Focus on spatial derivatives today to master the next module faster."
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Custom animation styles */}
      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CoursesView;
