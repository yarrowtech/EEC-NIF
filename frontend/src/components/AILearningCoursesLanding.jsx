import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, ArrowLeft, BookOpen, ChevronDown, ChevronUp, FlaskConical, Globe, GraduationCap, Info, PlayCircle, Sparkles } from 'lucide-react';
import AILearningCoursesReference from './AILearningCoursesReference';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const CARD_STYLES = [
  {
    grad: 'from-blue-400 to-indigo-600',
    chipA: 'bg-blue-100 text-blue-700',
    chipB: 'bg-green-100 text-green-700',
    icon: GraduationCap,
  },
  {
    grad: 'from-emerald-400 to-teal-600',
    chipA: 'bg-teal-100 text-teal-700',
    chipB: 'bg-purple-100 text-purple-700',
    icon: FlaskConical,
  },
  {
    grad: 'from-orange-400 to-pink-600',
    chipA: 'bg-orange-100 text-orange-700',
    chipB: 'bg-yellow-100 text-yellow-700',
    icon: BookOpen,
  },
  {
    grad: 'from-cyan-500 to-blue-700',
    chipA: 'bg-cyan-100 text-cyan-700',
    chipB: 'bg-indigo-100 text-indigo-700',
    icon: Globe,
  },
];

const SUBJECT_TOPICS = {
  hindi: [
    { title: 'क्यों जीमल और कैसे - केसालिया', subtopics: ['पाठ परिचय', 'मुख्य शब्दार्थ', 'अभ्यास प्रश्न'] },
    { title: 'कब आऊँ', subtopics: ['कवि परिचय', 'भावार्थ', 'वस्तुनिष्ठ प्रश्न'] },
    { title: 'मेरे संग की औरतें', subtopics: ['पाठ सार', 'चरित्र विश्लेषण', 'लघु उत्तरीय प्रश्न'] },
    { title: 'डायरी का एक पन्ना', subtopics: ['प्रसंग', 'व्याख्या', 'दीर्घ उत्तरीय प्रश्न'] },
    { title: 'साना-साना हाथ जोड़ि', subtopics: ['शब्दार्थ', 'व्याख्या', 'मूल्य आधारित प्रश्न'] },
  ],
  english: [
    { title: 'Reading Comprehension', subtopics: ['Passage 1', 'Passage 2', 'Inference Questions'] },
    { title: 'Grammar Quest', subtopics: ['Tenses', 'Subject Verb Agreement', 'Modals'] },
    { title: 'Writing Skills', subtopics: ['Notice', 'Letter', 'Essay'] },
  ],
  mathematics: [
    { title: 'Number System', subtopics: ['Rational Numbers', 'Operations', 'Word Problems'] },
    { title: 'Algebra', subtopics: ['Expressions', 'Identities', 'Linear Equations'] },
    { title: 'Geometry', subtopics: ['Triangles', 'Circles', 'Constructions'] },
  ],
  science: [
    { title: 'Physics Basics', subtopics: ['Force', 'Motion', 'Energy'] },
    { title: 'Chemistry Basics', subtopics: ['Atoms', 'Compounds', 'Reactions'] },
    { title: 'Biology Basics', subtopics: ['Cell', 'Tissues', 'Nutrition'] },
  ],
};

const normalize = (value) => String(value || '').trim().toLowerCase();

const resolveTopicsForSubject = (subjectName) => {
  const key = normalize(subjectName);
  if (SUBJECT_TOPICS[key]) return SUBJECT_TOPICS[key];

  return Array.from({ length: 5 }).map((_, idx) => ({
    title: `${subjectName} Topic ${idx + 1}`,
    subtopics: ['Concept Overview', 'Practice Set', 'Quick Test'],
  }));
};

const SubjectTopicsView = ({ subject, onBack }) => {
  const navigate = useNavigate();
  const [openTopicIndex, setOpenTopicIndex] = useState(0);
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const topics = useMemo(() => resolveTopicsForSubject(subject.title), [subject.title]);

  const topicCount = topics.length;
  const completedCount = completedTopics.size;
  const progress = topicCount > 0 ? Math.round((completedCount / topicCount) * 100) : 0;

  // Load completed topics from localStorage on mount
  useEffect(() => {
    const storageKey = `smart-learning-progress-${subject.key}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCompletedTopics(new Set(parsed));
      } catch (e) {
        console.error('Failed to parse saved progress:', e);
      }
    }
  }, [subject.key]);

  // Save completed topics to localStorage whenever it changes
  useEffect(() => {
    const storageKey = `smart-learning-progress-${subject.key}`;
    localStorage.setItem(storageKey, JSON.stringify([...completedTopics]));
  }, [completedTopics, subject.key]);

  const markTopicAsStarted = (topicTitle) => {
    setCompletedTopics(prev => {
      const newSet = new Set(prev);
      newSet.add(topicTitle);
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        <ArrowLeft size={16} /> Back to Subjects
      </button>

      <section className="rounded-[2rem] border border-[#e8dfbf] bg-[#f7f3e2] p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <span className="inline-flex rounded-full bg-[#ead79b] px-4 py-1 text-sm font-bold text-slate-700">STAGE 1 QUEST</span>
            <h1 className="mt-3 text-4xl sm:text-5xl font-black text-[#0f1b3a]">{subject.title} Syllabus</h1>
            <p className="mt-2 text-xl text-slate-600">Master the concepts through structured quests and interactive challenges!</p>
          </div>

          <div className="min-w-[280px]">
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-slate-600">Progress</p>
                <p className="text-3xl font-black text-[#e0b92c]">{completedCount}/{topicCount}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-600">Completion</p>
                <p className="text-3xl font-black text-[#172447]">{progress}%</p>
              </div>
            </div>
            <div className="mt-4 h-5 w-full overflow-hidden rounded-full bg-white/60 border-2 border-[#ead79b] shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#e0b92c] to-[#d4a520] transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">
                {completedCount === 0 ? 'Start your journey!' : completedCount === topicCount ? '🎉 Complete!' : 'Keep going!'}
              </p>
              {progress > 0 && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < Math.floor(progress / 20) ? 'bg-[#e0b92c]' : 'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>

      <section>
        <h2 className="mb-4 text-4xl font-black text-[#0f1b3a]">Adventure Path</h2>

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
          <div className="flex items-center justify-between bg-slate-50 px-6 py-5">
            <div>
              <p className="text-3xl font-black text-[#0f1b3a]">{subject.title} Topics</p>
              <p className="text-lg text-slate-500">{topicCount} Quests Available</p>
            </div>
            <p className="text-right text-2xl font-black text-[#2f7dff]">STATUS<br />READY TO START</p>
          </div>

          <div className="space-y-4 bg-slate-50 p-4 sm:p-6">
            {topics.map((topic, index) => {
              const isOpen = openTopicIndex === index;
              const isCompleted = completedTopics.has(topic.title);
              return (
                <div key={topic.title} className={`rounded-3xl border ${isCompleted ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'} shadow-sm transition-all`}>
                  <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      onClick={() => setOpenTopicIndex(isOpen ? -1 : index)}
                      className="flex items-center gap-3 text-left"
                    >
                      <span className={`flex h-11 w-11 items-center justify-center rounded-full ${isCompleted ? 'bg-green-200 text-green-700' : 'bg-[#f4edd0] text-[#d4b12b]'}`}>
                        {isCompleted ? (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : (
                          <PlayCircle size={22} />
                        )}
                      </span>
                      <div>
                        <p className="text-2xl font-black text-[#111d3f] flex items-center gap-2">
                          {topic.title}
                          {isCompleted && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Completed</span>}
                        </p>
                        <p className="mt-0.5 text-sm text-slate-500">{topic.subtopics.length} subtopics</p>
                      </div>
                      <Info size={18} className="text-slate-400" />
                    </button>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => {
                          markTopicAsStarted(topic.title);
                          const topicSlug = topic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                          navigate(`/student/smart-learning/subject/${subject.key}/topic/${topicSlug}`);
                        }}
                        className={`rounded-full px-6 py-2.5 text-lg font-black transition-colors ${
                          isCompleted
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-[#e2bf3e] text-[#101a35] hover:bg-[#d9b734]'
                        }`}
                      >
                        {isCompleted ? 'Review' : 'Start Learning'}
                      </button>
                      <button
                        onClick={() => setOpenTopicIndex(isOpen ? -1 : index)}
                        className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                        aria-label="Toggle subtopics"
                      >
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-slate-100 bg-white px-8 pb-4 pt-2">
                      <ul className="list-disc space-y-1 pl-6 text-sm text-slate-600">
                        {topic.subtopics.map((subtopic) => (
                          <li key={subtopic}>{subtopic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

const AILearningCoursesLanding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contexts, setContexts] = useState([]);

  // Parse URL params manually
  const urlMatch = location.pathname.match(/\/student\/smart-learning\/subject\/([^/]+)(?:\/topic\/([^/]+))?/);
  const subjectKey = urlMatch?.[1] ? decodeURIComponent(urlMatch[1]) : null;
  const topicSlug = urlMatch?.[2] ? decodeURIComponent(urlMatch[2]) : null;

  useEffect(() => {
    const fetchAssignedSubjects = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        if (!token || userType !== 'Student') {
          setContexts([]);
          return;
        }

        const res = await fetch(`${API_BASE}/api/student/auth/teacher-feedback/context`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.error || 'Failed to load assigned subjects');
        }

        const data = await res.json();
        setContexts(Array.isArray(data?.teachers) ? data.teachers : []);
      } catch (err) {
        setError(err?.message || 'Unable to load assigned subjects');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedSubjects();
  }, []);

  const assignedSubjects = useMemo(() => {
    const map = new Map();
    contexts.forEach((ctx) => {
      const name = String(ctx?.subjectName || '').trim();
      if (!name) return;
      const key = normalize(name);
      if (!map.has(key)) {
        map.set(key, {
          key,
          title: name,
          teacherNames: new Set(),
          classNames: new Set(),
        });
      }
      const item = map.get(key);
      const teacher = String(ctx?.teacherName || '').trim();
      const classLabel = [ctx?.className, ctx?.sectionName].filter(Boolean).join('-');
      if (teacher) item.teacherNames.add(teacher);
      if (classLabel) item.classNames.add(classLabel);
    });

    return Array.from(map.values()).map((item) => ({
      ...item,
      teacherCount: item.teacherNames.size,
      classCount: item.classNames.size,
    }));
  }, [contexts]);

  const selectedSubject = useMemo(() => {
    if (!subjectKey) return null;
    const normalizedKey = normalize(subjectKey);
    return assignedSubjects.find(s => s.key === normalizedKey);
  }, [subjectKey, assignedSubjects]);

  // If on a topic page, show the learning content
  if (topicSlug && subjectKey) {
    return <AILearningCoursesReference />;
  }

  return (
    <div className="w-full min-h-screen bg-[#f8f7f6] text-slate-900 p-4 sm:p-6 md:p-8">
      <div className="mx-auto w-full max-w-[1200px]">
        {selectedSubject ? (
          <SubjectTopicsView
            subject={selectedSubject}
            onBack={() => navigate('/student/smart-learning')}
          />
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Your Subjects</h1>
              <p className="text-sm sm:text-base text-slate-600">Showing only subjects assigned to your class timetable.</p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-72 rounded-xl bg-white animate-pulse" />
                ))}
              </div>
            ) : assignedSubjects.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                <Sparkles className="mx-auto mb-3 text-slate-300" size={32} />
                <p className="text-lg font-bold text-slate-800">No assigned subjects found</p>
                <p className="mt-1 text-sm text-slate-500">Please contact your class teacher if this looks incorrect.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {assignedSubjects.map((subject, index) => {
                  const style = CARD_STYLES[index % CARD_STYLES.length];
                  const Icon = style.icon;
                  return (
                    <div key={subject.key} className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-[#e7c555]/50 hover:shadow-xl">
                      <div className={`relative flex h-40 flex-col justify-end overflow-hidden bg-gradient-to-br p-6 ${style.grad}`}>
                        <Icon className="absolute -bottom-4 -right-4 size-20 rotate-12 text-white/20 transition-transform group-hover:rotate-0" />
                        <h3 className="text-2xl font-black text-white">{subject.title}</h3>
                      </div>
                      <div className="flex flex-col gap-4 p-6">
                        <div className="flex flex-wrap gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${style.chipA}`}>{subject.teacherCount} Teacher{subject.teacherCount > 1 ? 's' : ''}</span>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${style.chipB}`}>{subject.classCount} Class Slot{subject.classCount > 1 ? 's' : ''}</span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">Assigned in your timetable. Start this subject quest now.</p>
                        <button
                          onClick={() => navigate(`/student/smart-learning/subject/${subject.key}`)}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#e7c555] py-3 font-bold text-slate-900 transition-all group-hover:scale-[1.02] hover:bg-[#e7c555]/90"
                        >
                          Start <PlayCircle size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AILearningCoursesLanding;
