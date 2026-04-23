import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  FileText,
  Flame,
  GraduationCap,
  Layers,
  Lightbulb,
  ListChecks,
  Map,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import { fetchCachedJson } from '../utils/studentApiCache';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const DASHBOARD_ENDPOINT = `${API_BASE}/api/student/auth/dashboard`;
const FEEDBACK_CONTEXT_ENDPOINT = `${API_BASE}/api/student/auth/teacher-feedback/context`;

const AILearningCoursesReference = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [contexts, setContexts] = useState([]);

  // Extract topic from URL
  const urlMatch = location.pathname.match(/\/topic\/([^/]+)$/);
  const topicSlug = urlMatch?.[1] ? decodeURIComponent(urlMatch[1]) : 'Topic';
  const subjectMatch = location.pathname.match(/\/subject\/([^/]+)/);
  const subjectSlug = subjectMatch?.[1] ? decodeURIComponent(subjectMatch[1]) : 'Subject';

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

        const [dashRes, contextRes] = await Promise.all([
          fetchCachedJson(DASHBOARD_ENDPOINT, { ttlMs: 2 * 60 * 1000, fetchOptions: { headers } }),
          fetchCachedJson(FEEDBACK_CONTEXT_ENDPOINT, { ttlMs: 2 * 60 * 1000, fetchOptions: { headers } }),
        ]);

        setStats(dashRes?.data?.stats || null);
        setProfile(dashRes?.data?.profile || null);
        setContexts(Array.isArray(contextRes?.data?.teachers) ? contextRes.data.teachers : []);
      } catch (err) {
        setError(err?.message || 'Failed to load learning data');
      }
    };

    load();
  }, []);

  const assignedMentors = useMemo(() => {
    const teacherSet = new Set();
    contexts.forEach((ctx) => {
      const teacher = String(ctx?.teacherName || '').trim();
      if (teacher) teacherSet.add(teacher);
    });
    return Array.from(teacherSet);
  }, [contexts]);

  const attendancePct = Number(stats?.attendancePercentage || 0);
  const present = Number(stats?.presentDays || 0);
  const total = Number(stats?.totalClasses || 0);

  return (
    <div className="w-full min-h-screen bg-[#f8f9fa] font-['Lexend',sans-serif]">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12 space-y-16">
        {/* Hero / Document Header */}
        <section className="space-y-6">
          <div className="space-y-3">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#aeeecb] text-[#0e5138] text-xs font-['Work_Sans',sans-serif] uppercase tracking-widest font-bold">
              {subjectSlug} • {profile?.className || 'Your Class'}
            </span>
            <h1 className="text-5xl sm:text-6xl font-['Manrope',sans-serif] font-extrabold tracking-tight text-[#004b71] leading-tight">
              {topicSlug}
            </h1>
            <p className="text-xl text-[#40484f] max-w-3xl leading-relaxed">
              A comprehensive learning experience designed to help you master key concepts through structured practice, visual aids, and interactive materials.
            </p>
          </div>
          <div className="h-1 w-32 bg-[#006494]"></div>
        </section>


        {/* SECTION 1: Description Module with Learning Objective */}
        <section className="space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-[#e1e3e4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#cbe6ff] flex items-center justify-center">
              <BookOpen className="text-[#004b71]" size={20} />
            </div>
            <h2 className="text-3xl font-['Manrope',sans-serif] font-bold text-[#191c1d]">Learning Objective</h2>
          </div>

          {/* Instructional Flow Timeline */}
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="relative pl-10 border-l-2 border-[#8ecdff]/30 pb-8">
              <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-[#004b71] ring-4 ring-white"></div>
              <div className="space-y-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h3 className="text-xl font-bold text-[#004b71] font-['Manrope',sans-serif]">Introduction & Overview</h3>
                  <span className="text-sm font-['Work_Sans',sans-serif] font-bold text-[#40484f]">10 MIN</span>
                </div>
                <p className="text-[#40484f] leading-relaxed">
                  Begin with a brief overview of the topic. Understand the core concepts and how they connect to real-world applications. Review prerequisite knowledge to ensure a strong foundation.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative pl-10 border-l-2 border-[#8ecdff]/30 pb-8">
              <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-[#004b71] ring-4 ring-white"></div>
              <div className="space-y-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h3 className="text-xl font-bold text-[#004b71] font-['Manrope',sans-serif]">Core Concepts & Theory</h3>
                  <span className="text-sm font-['Work_Sans',sans-serif] font-bold text-[#40484f]">25 MIN</span>
                </div>
                <p className="text-[#40484f] leading-relaxed">
                  Dive deep into the fundamental principles. Learn key definitions, formulas, and theorems. Use visual aids and mindmaps to connect different concepts and build a comprehensive understanding.
                </p>
                <div className="p-4 bg-[#cbe6ff]/20 rounded-lg border-l-4 border-[#004b71] mt-4">
                  <p className="text-xs font-['Work_Sans',sans-serif] uppercase font-bold text-[#004b71] mb-1">Key Insight</p>
                  <p className="text-sm italic text-[#40484f]">
                    Understanding the 'why' behind each concept is just as important as knowing the 'how'.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative pl-10 border-l-2 border-[#8ecdff]/30 pb-8">
              <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-[#004b71] ring-4 ring-white"></div>
              <div className="space-y-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h3 className="text-xl font-bold text-[#004b71] font-['Manrope',sans-serif]">Practice & Application</h3>
                  <span className="text-sm font-['Work_Sans',sans-serif] font-bold text-[#40484f]">30 MIN</span>
                </div>
                <p className="text-[#40484f] leading-relaxed">
                  Work through example problems step-by-step. Apply the concepts you've learned to solve various exercises. Use worksheets and tryout quizzes to reinforce your understanding.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative pl-10">
              <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-[#004b71] ring-4 ring-white"></div>
              <div className="space-y-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h3 className="text-xl font-bold text-[#004b71] font-['Manrope',sans-serif]">Review & Self-Assessment</h3>
                  <span className="text-sm font-['Work_Sans',sans-serif] font-bold text-[#40484f]">15 MIN</span>
                </div>
                <p className="text-[#40484f] leading-relaxed">
                  Test your knowledge with flashcards and quick quizzes. Review any challenging areas and revisit study materials as needed. Track your progress and identify areas for improvement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Practice Papers */}
        <section className="space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-[#e1e3e4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ffd386] flex items-center justify-center">
              <FileText className="text-[#5f4200]" size={20} />
            </div>
            <h2 className="text-3xl font-['Manrope',sans-serif] font-bold text-[#191c1d]">Practice Papers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Practice Paper 1 */}
            <div className="group relative overflow-hidden rounded-xl bg-white border-2 border-[#e1e3e4] p-6 cursor-pointer hover:border-rose-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="text-white" size={20} />
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#fff3e0] text-[#e65100] font-bold font-['Work_Sans',sans-serif]">EASY</span>
              </div>
              <h3 className="font-bold text-[#191c1d] font-['Manrope',sans-serif] mb-2 text-lg">Basic Concepts</h3>
              <p className="text-sm text-[#40484f] font-['Work_Sans',sans-serif] leading-relaxed mb-4">10 questions • 20 minutes</p>
              <button className="w-full py-2 px-3 rounded-lg bg-[#f3f4f5] text-[#004b71] font-semibold text-sm hover:bg-[#e8eaed] transition-colors">
                Start Practice
              </button>
            </div>

            {/* Practice Paper 2 */}
            <div className="group relative overflow-hidden rounded-xl bg-white border-2 border-[#e1e3e4] p-6 cursor-pointer hover:border-amber-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="text-white" size={20} />
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#e3f2fd] text-[#1565c0] font-bold font-['Work_Sans',sans-serif]">MEDIUM</span>
              </div>
              <h3 className="font-bold text-[#191c1d] font-['Manrope',sans-serif] mb-2 text-lg">Applied Problems</h3>
              <p className="text-sm text-[#40484f] font-['Work_Sans',sans-serif] leading-relaxed mb-4">15 questions • 30 minutes</p>
              <button className="w-full py-2 px-3 rounded-lg bg-[#f3f4f5] text-[#004b71] font-semibold text-sm hover:bg-[#e8eaed] transition-colors">
                Start Practice
              </button>
            </div>

            {/* Practice Paper 3 */}
            <div className="group relative overflow-hidden rounded-xl bg-white border-2 border-[#e1e3e4] p-6 cursor-pointer hover:border-red-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="text-white" size={20} />
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#fce4ec] text-[#c2185b] font-bold font-['Work_Sans',sans-serif]">HARD</span>
              </div>
              <h3 className="font-bold text-[#191c1d] font-['Manrope',sans-serif] mb-2 text-lg">Challenge Questions</h3>
              <p className="text-sm text-[#40484f] font-['Work_Sans',sans-serif] leading-relaxed mb-4">20 questions • 45 minutes</p>
              <button className="w-full py-2 px-3 rounded-lg bg-[#f3f4f5] text-[#004b71] font-semibold text-sm hover:bg-[#e8eaed] transition-colors">
                Start Practice
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 3: Learning Resources */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ffd386] flex items-center justify-center">
              <Target className="text-[#5f4200]" size={20} />
            </div>
            <h2 className="text-3xl font-['Manrope',sans-serif] font-bold text-[#191c1d]">Learning Resources</h2>
          </div>

          {/* Grid Layout for Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tryout - Featured Card */}
            <div className="col-span-1 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Flame className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white font-['Manrope',sans-serif] mb-2">Tryout</h3>
                <p className="text-sm text-white/90 font-['Work_Sans',sans-serif] leading-relaxed">Test your knowledge with quick practice quizzes and challenges</p>
              </div>
            </div>

            {/* Flashcard */}
            <div className="group relative overflow-hidden rounded-xl bg-[#aeeecb]/30 border-2 border-[#2c694e]/20 p-6 cursor-pointer hover:bg-[#aeeecb]/50 hover:border-[#2c694e]/40 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers className="text-white" size={20} />
              </div>
              <h3 className="font-bold text-[#191c1d] font-['Manrope',sans-serif] mb-2 text-lg">Flashcard</h3>
              <p className="text-sm text-[#40484f] font-['Work_Sans',sans-serif] leading-relaxed">Quick revision and memorization</p>
            </div>

            {/* Mindmap */}
            <div className="group relative overflow-hidden rounded-xl bg-white border-2 border-[#e1e3e4] p-6 cursor-pointer hover:border-cyan-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="text-white" size={20} />
              </div>
              <h3 className="font-bold text-[#191c1d] font-['Manrope',sans-serif] mb-2 text-lg">Mindmap</h3>
              <p className="text-sm text-[#40484f] font-['Work_Sans',sans-serif] leading-relaxed">Visual concepts and connections</p>
            </div>

            {/* Study Material */}
            <div className="group relative overflow-hidden rounded-xl bg-[#cbe6ff]/30 border-2 border-[#004b71]/20 p-6 cursor-pointer hover:bg-[#cbe6ff]/50 hover:border-[#004b71]/40 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="text-white" size={20} />
              </div>
              <h3 className="font-bold text-[#191c1d] font-['Manrope',sans-serif] mb-2 text-lg">Study Material</h3>
              <p className="text-sm text-[#40484f] font-['Work_Sans',sans-serif] leading-relaxed">Detailed notes and explanations</p>
            </div>

            {/* Worksheet */}
            <div className="group relative overflow-hidden rounded-xl bg-white border-2 border-[#e1e3e4] p-6 cursor-pointer hover:border-rose-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="text-white" size={20} />
              </div>
              <h3 className="font-bold text-[#191c1d] font-['Manrope',sans-serif] mb-2 text-lg">Worksheet</h3>
              <p className="text-sm text-[#40484f] font-['Work_Sans',sans-serif] leading-relaxed">Extra practice exercises</p>
            </div>

            {/* Additional Notes */}
            <div className="group relative overflow-hidden rounded-xl bg-white border-2 border-[#e1e3e4] p-6 cursor-pointer hover:border-green-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ListChecks className="text-white" size={20} />
              </div>
              <h3 className="font-bold text-[#191c1d] font-['Manrope',sans-serif] mb-2 text-lg">Summary Notes</h3>
              <p className="text-sm text-[#40484f] font-['Work_Sans',sans-serif] leading-relaxed">Quick reference guide</p>
            </div>
          </div>

          {/* Pro Tip Card */}
          <div className="p-6 rounded-xl bg-[#f3f4f5] border-l-4 border-[#006494]">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-[#5f4200] flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-bold text-[#191c1d] font-['Work_Sans',sans-serif] uppercase tracking-wider mb-1">Pro Tip</p>
                <p className="text-sm text-[#40484f] leading-relaxed">Start with the Learning Objective section to understand what you'll learn, then attempt the Practice Papers. Use other resources (Flashcards, Mindmaps) to reinforce areas where you need help.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Meta 
        <footer className="pt-8 border-t border-[#e7e8e9] flex flex-col md:flex-row justify-between items-center text-[#40484f] text-sm font-['Work_Sans',sans-serif]">
          <div className="flex items-center gap-4 flex-wrap">
            <span>Topic: {topicSlug}</span>
            <span className="w-1 h-1 rounded-full bg-[#c0c7d0]"></span>
            <span>Subject: {subjectSlug}</span>
          </div>
          <div className="mt-4 md:mt-0 flex gap-6">
            <button className="hover:text-[#004b71] transition-colors font-semibold">Mark Complete</button>
            <button className="hover:text-[#004b71] transition-colors font-semibold">Save for Later</button>
          </div>
        </footer> */}
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-[#ffdad6] border border-[#ba1a1a] text-[#93000a] px-4 py-3 rounded-lg shadow-lg max-w-md">
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}
    </div>
  );
};

export default AILearningCoursesReference;
