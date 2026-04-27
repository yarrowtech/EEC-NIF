import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Lock,
  Target,
  Layers,
  Maximize2,
  Minimize2,
  Download,
} from 'lucide-react';
import { fetchCachedJson } from '../utils/studentApiCache';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const DASHBOARD_ENDPOINT = `${API_BASE}/api/student/auth/dashboard`;
const FEEDBACK_CONTEXT_ENDPOINT = `${API_BASE}/api/student/auth/teacher-feedback/context`;

const LEARNING_STEPS = [
  { id: 'step1', title: 'Introduction & Overview', duration: 10, type: 'The Hook' },
  { id: 'step2', title: 'Core Concepts & Theory', duration: 25, type: 'Instruction' },
  { id: 'step3', title: 'Practice & Application', duration: 30, type: 'Guided Practice' },
  { id: 'step4', title: 'Review & Self-Assessment', duration: 15, type: 'Synthesis' },
];

const LEARNING_OBJECTIVES = [
  'Master the fundamental concepts and principles of the topic with comprehensive understanding',
  'Apply learned concepts to solve real-world problems and complex scenarios',
  'Synthesize knowledge to create meaningful connections between related topics',
];

const MATERIALS = [
  { title: 'Interactive Learning', description: 'Smart practice exercises' },
  { title: 'Visual Aids', description: 'Mindmaps and diagrams' },
  { title: 'Study Materials', description: 'Detailed notes and guides' },
];

const ASSESSMENT_ITEMS = [
  { title: 'Practice Papers', description: 'Three difficulty levels with instant feedback' },
  { title: 'Self-Assessment', description: 'Quick quizzes and flashcards for review' },
];

const AILearningCoursesReference = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [contexts, setContexts] = useState([]);
  const [activeStep, setActiveStep] = useState('step1');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const moduleRef = useRef(null);

  // Extract topic from URL
  const urlMatch = location.pathname.match(/\/topic\/([^/]+)$/);
  const topicSlug = urlMatch?.[1] ? decodeURIComponent(urlMatch[1]) : 'Topic';
  const subjectMatch = location.pathname.match(/\/subject\/([^/]+)/);
  const subjectSlug = subjectMatch?.[1] ? decodeURIComponent(subjectMatch[1]) : 'Subject';

  // Load progress from localStorage
  useEffect(() => {
    const storageKey = `learning-topic-progress-${topicSlug}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCompletedSteps(data.completedSteps || []);
        setOverallProgress(data.percentage || 0);
      } catch (err) {
        console.error('Failed to load progress:', err);
      }
    }
  }, [topicSlug]);

  // Save progress to localStorage
  useEffect(() => {
    const storageKey = `learning-topic-progress-${topicSlug}`;
    const percentage = LEARNING_STEPS.length > 0
      ? Math.round((completedSteps.length / LEARNING_STEPS.length) * 100)
      : 0;
    const data = {
      completedSteps,
      percentage,
      lastAccessed: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
    setOverallProgress(percentage);
  }, [completedSteps, topicSlug]);

  // Fetch user data
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

  // Helper functions
  const toggleStepComplete = (stepId) => {
    if (completedSteps.includes(stepId)) {
      setCompletedSteps(completedSteps.filter(s => s !== stepId));
    } else {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const isPracticeUnlocked = overallProgress >= 75;

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && moduleRef.current) {
        await moduleRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      setError('Fullscreen mode is not available on this device/browser.');
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === moduleRef.current);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  return (
    <div
      ref={moduleRef}
      className="min-h-screen w-full flex flex-col overflow-x-hidden"
      style={{ backgroundColor: '#f8f9fa', fontFamily: 'Lexend, sans-serif' }}
    >
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-4 sm:px-6 z-50 sticky top-0 flex-shrink-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderColor: '#e7e8e9' }}>
        <div className="flex items-center gap-2 sm:gap-6 flex-1 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors rounded-lg px-2 py-1 sm:px-3"
            style={{ color: '#004b71' }}
          >
            <ArrowLeft size={16} className="sm:w-[18px]" /> <span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-4 w-px hidden sm:block" style={{ backgroundColor: '#cbd5e0' }}></div>
          <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: '#707880' }}>
            {subjectSlug} • {profile?.className || 'Class'}
          </p>
        </div>
        <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex px-4 py-1.5 text-sm font-bold hover:bg-slate-50 transition-colors rounded-lg items-center gap-2"
            style={{ color: '#004b71' }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          </button>
          <button className="px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-1 sm:gap-2 text-white" style={{ backgroundColor: '#006494' }}>
            <Download size={14} className="sm:w-4" /> <span className="hidden sm:inline">Download PDF</span>
          </button>
        </div>
      </header>

      {/* Main Layout - Responsive Grid */}
      <main className="flex-1 w-full overflow-auto" style={{ padding: '12px' }}>
        {/* Desktop Grid Layout (lg and above) */}
        <div className="hidden lg:grid gap-3 h-full" style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gridTemplateRows: 'repeat(6, minmax(0, 1fr))' }}>
          {/* Learning Objectives - Top Left */}
          <section className="col-span-3 row-span-3 rounded-2xl p-5 flex flex-col border shadow-sm overflow-hidden" style={{ backgroundColor: '#f3f4f5', borderColor: '#e7e8e9' }}>
            <div className="flex items-center gap-2 mb-4">
              <Target size={20} style={{ color: '#5f4200' }} />
              <h2 className="text-lg font-black" style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1d' }}>Learning Objectives</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
              {LEARNING_OBJECTIVES.map((obj, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: '#7d5800' }}>
                    {idx + 1}
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: '#40484f' }}>{obj}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Instructional Flow - Middle Left */}
          <section className="col-span-3 row-span-3 rounded-2xl p-5 border shadow-sm flex flex-col overflow-hidden" style={{ backgroundColor: '#ffffff', borderColor: '#e7e8e9' }}>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={20} style={{ color: '#004b71' }} />
              <h2 className="text-lg font-black" style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1d' }}>Instructional Flow</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
              {LEARNING_STEPS.map((step, idx) => (
                <div key={step.id} className="relative pl-6" style={{ borderLeft: '1px solid rgba(0, 75, 113, 0.2)' }}>
                  <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#004b71' }}></div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xs font-bold uppercase" style={{ color: '#004b71' }}>{step.type}</h3>
                    <span className="text-[10px] font-bold" style={{ color: '#a0aec0' }}>{step.duration}m</span>
                  </div>
                  <p className="text-xs leading-snug" style={{ color: '#40484f' }}>{step.title}</p>
                  {completedSteps.includes(step.id) && (
                    <div className="mt-2 text-[10px] font-bold flex items-center gap-1" style={{ color: '#22c55e' }}>
                      <CheckCircle2 size={12} /> Completed
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Large Featured Section - Center */}
          <section className="col-span-6 row-span-6 relative rounded-3xl overflow-hidden shadow-2xl" style={{ border: '4px solid white' }}>
            <img
              alt="Featured learning visualization"
              className="absolute inset-0 w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjErJaMyDK5kjzTovLrASuyjKjQibbbK3m9j83ky5Y8NUw42gJ8rI2I2nvCTIMD9KarwXUrpyqZ3mOAtTehMrvrfM5zley6gduXzfL9s0lZtKH5TvmU1QxZQRQ1wUQAK9WMT7rZWr10yVa7fZAtEaFk1Eci3MupvnWlWRXxik3eIhP4eyhrZKKDf1u7wZOqKUuaCgcUyuFIQ3isA-SUievMVWvVKr1vYH5L9syrve9QLI6yCKDPzBpXuVusD2XRg-QobUMRlHoPDCZ"
            />
            <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12" style={{ background: 'linear-gradient(to top, rgba(0, 75, 113, 0.95), rgba(0, 75, 113, 0.4), transparent)' }}>
              <div className="max-w-2xl space-y-4">
                <h1 className="text-4xl sm:text-6xl font-black text-white leading-[0.95] tracking-tighter" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {topicSlug}
                </h1>
                <p className="text-base sm:text-xl leading-relaxed opacity-90" style={{ fontFamily: 'Lexend, sans-serif', color: '#cbe6ff' }}>
                  A comprehensive learning experience designed to help you master key concepts through structured practice, visual aids, and interactive materials.
                </p>

                {/* Metadata Cards */}
                <div className="pt-6 flex gap-2 sm:gap-4 flex-wrap">
                  <div className="px-3 sm:px-4 py-2 rounded-xl border text-sm sm:text-base" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <p className="text-[9px] sm:text-[10px] uppercase font-bold" style={{ fontFamily: 'Work Sans, sans-serif', color: 'rgba(255, 255, 255, 0.6)' }}>Total Duration</p>
                    <p className="text-sm font-bold text-white">
                      {LEARNING_STEPS.reduce((sum, step) => sum + step.duration, 0)} Min
                    </p>
                  </div>
                  <div className="px-3 sm:px-4 py-2 rounded-xl border text-sm sm:text-base" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <p className="text-[9px] sm:text-[10px] uppercase font-bold" style={{ fontFamily: 'Work Sans, sans-serif', color: 'rgba(255, 255, 255, 0.6)' }}>Progress</p>
                    <p className="text-sm font-bold text-white">{overallProgress}%</p>
                  </div>
                  <div className="px-3 sm:px-4 py-2 rounded-xl border text-sm sm:text-base" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <p className="text-[9px] sm:text-[10px] uppercase font-bold" style={{ fontFamily: 'Work Sans, sans-serif', color: 'rgba(255, 255, 255, 0.6)' }}>Steps Done</p>
                    <p className="text-sm font-bold text-white">
                      {completedSteps.length}/{LEARNING_STEPS.length}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="pt-6 space-y-2">
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${overallProgress}%`,
                        background: 'linear-gradient(to right, #ffdea9, #ffba27, #ffd386)'
                      }}
                    ></div>
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Work Sans, sans-serif' }}>
                    {completedSteps.length} of {LEARNING_STEPS.length} learning steps completed
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Materials - Bottom Right Top */}
          <section className="col-span-3 row-span-3 rounded-2xl p-5 flex flex-col border shadow-sm overflow-hidden" style={{ backgroundColor: 'rgba(171, 238, 203, 0.1)', borderColor: 'rgba(171, 238, 203, 0.2)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Layers size={20} style={{ color: '#2c694e' }} />
              <h2 className="text-lg font-black" style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1d' }}>Materials</h2>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
              {MATERIALS.map((material, idx) => (
                <div key={idx} className="p-3 rounded-xl flex items-center gap-3" style={{ backgroundColor: '#ffffff', border: '1px solid #f3f4f5' }}>
                  <span className="text-2xl flex-shrink-0">
                    {idx === 0 ? '💻' : idx === 1 ? '📊' : '📚'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: '#191c1d' }}>{material.title}</p>
                    <p className="text-[10px] truncate" style={{ fontFamily: 'Work Sans, sans-serif', color: '#40484f' }}>{material.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Assessment & Practice - Bottom Right Bottom */}
          <section className="col-span-3 row-span-3 rounded-2xl p-5 flex flex-col border shadow-sm overflow-hidden" style={{ backgroundColor: '#e7e8e9', borderColor: '#e1e3e4' }}>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={20} style={{ color: '#004b71' }} />
              <h2 className="text-lg font-black" style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1d' }}>Assessment</h2>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
              <p className="text-xs italic leading-relaxed mb-4" style={{ color: '#40484f' }}>
                Measure mastery through structured practice and self-assessment tools.
              </p>
              {ASSESSMENT_ITEMS.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl border" style={{ backgroundColor: isPracticeUnlocked ? '#ffffff' : '#f3f4f5', borderColor: isPracticeUnlocked ? '#c0c7d0' : '#c0c7d0' }}>
                  <div className="flex items-center gap-2 mb-1">
                    {isPracticeUnlocked ? (
                      <CheckCircle2 size={16} style={{ color: '#004b71' }} />
                    ) : (
                      <Lock size={16} style={{ color: '#40484f' }} />
                    )}
                    <h4 className="text-xs font-bold truncate" style={{ color: isPracticeUnlocked ? '#004b71' : '#40484f' }}>
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[10px]" style={{ color: '#40484f' }}>
                    {item.description}
                  </p>
                  {!isPracticeUnlocked && idx === 0 && (
                    <p className="text-[9px] font-bold mt-2" style={{ color: '#5f4200' }}>
                      📌 Complete 75% to unlock
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Tablet Layout (md-lg) */}
        <div className="hidden md:grid lg:hidden gap-3 auto-rows-max" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          {/* Learning Objectives */}
          <section className="rounded-2xl p-4 flex flex-col border shadow-sm overflow-hidden max-h-96" style={{ backgroundColor: '#f3f4f5', borderColor: '#e7e8e9' }}>
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} style={{ color: '#5f4200' }} />
              <h2 className="text-base font-black" style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1d' }}>Learning Objectives</h2>
            </div>
            <div className="overflow-y-auto space-y-3 text-sm" style={{ scrollbarWidth: 'thin' }}>
              {LEARNING_OBJECTIVES.map((obj, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: '#7d5800' }}>
                    {idx + 1}
                  </span>
                  <p className="text-xs leading-relaxed" style={{ color: '#40484f' }}>{obj}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Instructional Flow */}
          <section className="rounded-2xl p-4 border shadow-sm flex flex-col overflow-hidden max-h-96" style={{ backgroundColor: '#ffffff', borderColor: '#e7e8e9' }}>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={18} style={{ color: '#004b71' }} />
              <h2 className="text-base font-black" style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1d' }}>Instructional Flow</h2>
            </div>
            <div className="overflow-y-auto space-y-4 text-xs" style={{ scrollbarWidth: 'thin' }}>
              {LEARNING_STEPS.map((step, idx) => (
                <div key={step.id} className="relative pl-5" style={{ borderLeft: '1px solid rgba(0, 75, 113, 0.2)' }}>
                  <div className="absolute -left-[3px] top-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#004b71' }}></div>
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-bold uppercase" style={{ color: '#004b71', fontSize: '9px' }}>{step.type}</h3>
                    <span className="font-bold" style={{ color: '#a0aec0', fontSize: '8px' }}>{step.duration}m</span>
                  </div>
                  <p className="leading-snug" style={{ color: '#40484f' }}>{step.title}</p>
                  {completedSteps.includes(step.id) && (
                    <div className="mt-1 text-[9px] font-bold flex items-center gap-1" style={{ color: '#22c55e' }}>
                      <CheckCircle2 size={10} /> Done
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Featured Section */}
          <section className="col-span-2 relative rounded-2xl overflow-hidden shadow-lg h-[45vw] min-h-[280px] max-h-[420px]" style={{ border: '3px solid white' }}>
            <img
              alt="Featured learning visualization"
              className="absolute inset-0 w-full h-full object-cover object-center"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjErJaMyDK5kjzTovLrASuyjKjQibbbK3m9j83ky5Y8NUw42gJ8rI2I2nvCTIMD9KarwXUrpyqZ3mOAtTehMrvrfM5zley6gduXzfL9s0lZtKH5TvmU1QxZQRQ1wUQAK9WMT7rZWr10yVa7fZAtEaFk1Eci3MupvnWlWRXxik3eIhP4eyhrZKKDf1u7wZOqKUuaCgcUyuFIQ3isA-SUievMVWvVKr1vYH5L9syrve9QLI6yCKDPzBpXuVusD2XRg-QobUMRlHoPDCZ"
            />
            <div className="absolute inset-0 flex flex-col justify-end p-6" style={{ background: 'linear-gradient(to top, rgba(0, 75, 113, 0.95), rgba(0, 75, 113, 0.4), transparent)' }}>
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {topicSlug}
                </h1>
                <p className="text-xs sm:text-sm opacity-90" style={{ fontFamily: 'Lexend, sans-serif', color: '#cbe6ff' }}>
                  Master key concepts through structured practice and interactive materials.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <div className="px-2 py-1 rounded-lg border text-xs" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <p className="text-[8px] text-white/60" style={{ fontFamily: 'Work Sans, sans-serif' }}>Progress</p>
                    <p className="text-xs font-bold text-white">{overallProgress}%</p>
                  </div>
                  <div className="px-2 py-1 rounded-lg border text-xs" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <p className="text-[8px] text-white/60" style={{ fontFamily: 'Work Sans, sans-serif' }}>Steps</p>
                    <p className="text-xs font-bold text-white">{completedSteps.length}/{LEARNING_STEPS.length}</p>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden mt-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${overallProgress}%`,
                      background: 'linear-gradient(to right, #ffdea9, #ffba27, #ffd386)'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </section>

          {/* Materials */}
          <section className="rounded-2xl p-4 flex flex-col border shadow-sm overflow-hidden max-h-64" style={{ backgroundColor: 'rgba(171, 238, 203, 0.1)', borderColor: 'rgba(171, 238, 203, 0.2)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Layers size={18} style={{ color: '#2c694e' }} />
              <h2 className="text-base font-black" style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1d' }}>Materials</h2>
            </div>
            <div className="overflow-y-auto space-y-2" style={{ scrollbarWidth: 'thin' }}>
              {MATERIALS.map((material, idx) => (
                <div key={idx} className="p-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#ffffff', border: '1px solid #f3f4f5' }}>
                  <span className="text-lg flex-shrink-0">
                    {idx === 0 ? '💻' : idx === 1 ? '📊' : '📚'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold truncate" style={{ color: '#191c1d' }}>{material.title}</p>
                    <p className="text-[9px] truncate" style={{ fontFamily: 'Work Sans, sans-serif', color: '#40484f' }}>{material.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Assessment */}
          <section className="rounded-2xl p-4 flex flex-col border shadow-sm overflow-hidden max-h-64" style={{ backgroundColor: '#e7e8e9', borderColor: '#e1e3e4' }}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={18} style={{ color: '#004b71' }} />
              <h2 className="text-base font-black" style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1d' }}>Assessment</h2>
            </div>
            <div className="overflow-y-auto space-y-2" style={{ scrollbarWidth: 'thin' }}>
              {ASSESSMENT_ITEMS.map((item, idx) => (
                <div key={idx} className="p-2 rounded-lg border text-xs" style={{ backgroundColor: isPracticeUnlocked ? '#ffffff' : '#f3f4f5', borderColor: '#c0c7d0' }}>
                  <div className="flex items-center gap-1 mb-1">
                    {isPracticeUnlocked ? (
                      <CheckCircle2 size={14} style={{ color: '#004b71' }} />
                    ) : (
                      <Lock size={14} style={{ color: '#40484f' }} />
                    )}
                    <h4 className="font-bold text-[11px] truncate" style={{ color: isPracticeUnlocked ? '#004b71' : '#40484f' }}>
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[9px]" style={{ color: '#40484f' }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Mobile Layout (below md) */}
        <div className="md:hidden space-y-3">
          {/* Featured Section First */}
          <section className="relative rounded-2xl overflow-hidden shadow-lg h-[56vw] min-h-[220px] max-h-[360px]" style={{ border: '3px solid white' }}>
            <img
              alt="Featured learning visualization"
              className="absolute inset-0 w-full h-full object-cover object-center"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjErJaMyDK5kjzTovLrASuyjKjQibbbK3m9j83ky5Y8NUw42gJ8rI2I2nvCTIMD9KarwXUrpyqZ3mOAtTehMrvrfM5zley6gduXzfL9s0lZtKH5TvmU1QxZQRQ1wUQAK9WMT7rZWr10yVa7fZAtEaFk1Eci3MupvnWlWRXxik3eIhP4eyhrZKKDf1u7wZOqKUuaCgcUyuFIQ3isA-SUievMVWvVKr1vYH5L9syrve9QLI6yCKDPzBpXuVusD2XRg-QobUMRlHoPDCZ"
            />
            <div className="absolute inset-0 flex flex-col justify-end p-4" style={{ background: 'linear-gradient(to top, rgba(0, 75, 113, 0.95), rgba(0, 75, 113, 0.4), transparent)' }}>
              <div className="space-y-2">
                <h1 className="text-xl font-black text-white leading-tight tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {topicSlug}
                </h1>
                <p className="text-xs opacity-90" style={{ fontFamily: 'Lexend, sans-serif', color: '#cbe6ff' }}>
                  Master key concepts through structured practice.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <div className="px-2 py-1 rounded-lg border text-xs" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <p className="text-[8px] text-white/60">Progress</p>
                    <p className="text-xs font-bold text-white">{overallProgress}%</p>
                  </div>
                  <div className="px-2 py-1 rounded-lg border text-xs" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                    <p className="text-[8px] text-white/60">Steps</p>
                    <p className="text-xs font-bold text-white">{completedSteps.length}/{LEARNING_STEPS.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Learning Objectives */}
          <section className="rounded-2xl p-4 flex flex-col border shadow-sm" style={{ backgroundColor: '#f3f4f5', borderColor: '#e7e8e9' }}>
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} style={{ color: '#5f4200' }} />
              <h2 className="text-base font-black" style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1d' }}>Learning Objectives</h2>
            </div>
            <div className="space-y-3 text-sm">
              {LEARNING_OBJECTIVES.map((obj, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: '#7d5800' }}>
                    {idx + 1}
                  </span>
                  <p className="text-xs leading-relaxed" style={{ color: '#40484f' }}>{obj}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Instructional Flow */}
          <section className="rounded-2xl p-4 border shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#e7e8e9' }}>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={18} style={{ color: '#004b71' }} />
              <h2 className="text-base font-black" style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1d' }}>Instructional Flow</h2>
            </div>
            <div className="space-y-4 text-xs">
              {LEARNING_STEPS.map((step, idx) => (
                <div key={step.id} className="relative pl-5" style={{ borderLeft: '1px solid rgba(0, 75, 113, 0.2)' }}>
                  <div className="absolute -left-[3px] top-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#004b71' }}></div>
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-bold uppercase" style={{ color: '#004b71', fontSize: '9px' }}>{step.type}</h3>
                    <span className="font-bold" style={{ color: '#a0aec0', fontSize: '8px' }}>{step.duration}m</span>
                  </div>
                  <p className="leading-snug" style={{ color: '#40484f' }}>{step.title}</p>
                  {completedSteps.includes(step.id) && (
                    <div className="mt-1 text-[9px] font-bold flex items-center gap-1" style={{ color: '#22c55e' }}>
                      <CheckCircle2 size={10} /> Done
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Materials */}
          <section className="rounded-2xl p-4 flex flex-col border shadow-sm" style={{ backgroundColor: 'rgba(171, 238, 203, 0.1)', borderColor: 'rgba(171, 238, 203, 0.2)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Layers size={18} style={{ color: '#2c694e' }} />
              <h2 className="text-base font-black" style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1d' }}>Materials</h2>
            </div>
            <div className="space-y-2">
              {MATERIALS.map((material, idx) => (
                <div key={idx} className="p-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#ffffff', border: '1px solid #f3f4f5' }}>
                  <span className="text-lg flex-shrink-0">
                    {idx === 0 ? '💻' : idx === 1 ? '📊' : '📚'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold truncate" style={{ color: '#191c1d' }}>{material.title}</p>
                    <p className="text-[9px] truncate" style={{ fontFamily: 'Work Sans, sans-serif', color: '#40484f' }}>{material.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Assessment */}
          <section className="rounded-2xl p-4 flex flex-col border shadow-sm" style={{ backgroundColor: '#e7e8e9', borderColor: '#e1e3e4' }}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={18} style={{ color: '#004b71' }} />
              <h2 className="text-base font-black" style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1d' }}>Assessment</h2>
            </div>
            <div className="space-y-2">
              {ASSESSMENT_ITEMS.map((item, idx) => (
                <div key={idx} className="p-2 rounded-lg border text-xs" style={{ backgroundColor: isPracticeUnlocked ? '#ffffff' : '#f3f4f5', borderColor: '#c0c7d0' }}>
                  <div className="flex items-center gap-1 mb-1">
                    {isPracticeUnlocked ? (
                      <CheckCircle2 size={14} style={{ color: '#004b71' }} />
                    ) : (
                      <Lock size={14} style={{ color: '#40484f' }} />
                    )}
                    <h4 className="font-bold text-[11px] truncate" style={{ color: isPracticeUnlocked ? '#004b71' : '#40484f' }}>
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[9px]" style={{ color: '#40484f' }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Error Notification */}
      {error && (
        <div className="fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg max-w-md border" style={{ backgroundColor: '#ffdad6', borderColor: '#ba1a1a', color: '#93000a' }}>
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <style>{`
        * {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        *::-webkit-scrollbar {
          width: 4px;
        }
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        *::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default AILearningCoursesReference;
