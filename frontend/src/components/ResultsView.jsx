import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  TrendingUp,
  Download,
  Target,
  Calendar,
  Trophy,
  AlertCircle,
  FileText,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const ResultsView = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExamType, setSelectedExamType] = useState('all');
  const [overview, setOverview] = useState({
    averagePercentage: 0,
    examsTaken: 0,
    topScore: null,
    recentExam: null
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');

        if (!token || userType !== 'Student') {
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/student/auth/results`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Unable to load results.');
        }

        const data = await response.json();
        const items = Array.isArray(data.results) ? data.results : [];
        const sortedItems = sortResultsByDate(items);
        setResults(sortedItems);
        setOverview(buildOverview(sortedItems));
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Failed to fetch results:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const examTypes = useMemo(() => {
    const uniqueTypes = new Set(results.map(result => result.type || 'general'));
    return ['all', ...Array.from(uniqueTypes)];
  }, [results]);

  const filteredResults = useMemo(() => {
    if (selectedExamType === 'all') return results;
    return results.filter(result => (result.type || 'general') === selectedExamType);
  }, [results, selectedExamType]);

  if (loading) {
    return (
      <div className="space-y-4 p-4 pb-24 md:pb-6">
        <div className="h-28 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-24 bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-xl h-48 border border-gray-100 animate-pulse" />
        <div className="bg-white rounded-xl h-48 border border-gray-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 md:p-4 pb-24 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-2xl p-4 md:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-3 right-3 w-24 h-24 bg-white rounded-full" />
          <div className="absolute bottom-3 left-3 w-16 h-16 bg-white rounded-full" />
        </div>
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-6 h-6 text-yellow-200" />
              <h1 className="text-xl md:text-3xl font-bold">My Results</h1>
            </div>
            <p className="text-yellow-100 text-xs md:text-sm">Score card, academic progress overview, and performance blocks</p>
          </div>
          <div className="text-right shrink-0">
            <div className="bg-white/20 rounded-xl px-3 py-2 backdrop-blur-sm">
              <p className="text-yellow-100 text-xs mb-0.5">Avg Score</p>
              <p className="text-2xl md:text-3xl font-bold">{overview.averagePercentage.toFixed(1)}%</p>
            </div>
            {lastUpdated && (
              <p className="text-yellow-200 text-[10px] mt-1">
                Updated {lastUpdated.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Score Card</h2>
      </div>

      {/* Summary stat cards — 2 col on mobile, 4 col on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          icon={Award}
          title="Exams Taken"
          value={overview.examsTaken}
          accent="bg-blue-100 text-blue-600"
        />
        <SummaryCard
          icon={TrendingUp}
          title="Best Exam"
          value={overview.topScore ? `${overview.topScore.percentage.toFixed(1)}%` : 'N/A'}
          subtitle={overview.topScore?.examName || 'Awaiting data'}
          accent="bg-green-100 text-green-600"
        />
        <SummaryCard
          icon={Target}
          title="Average"
          value={`${overview.averagePercentage.toFixed(1)}%`}
          accent="bg-yellow-100 text-yellow-600"
        />
        <SummaryCard
          icon={Calendar}
          title="Recent Exam"
          value={overview.recentExam?.examName || 'N/A'}
          subtitle={overview.recentExam ? new Date(overview.recentExam.date).toLocaleDateString() : 'No records'}
          accent="bg-purple-100 text-purple-600"
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-2">Academic Progress Overview</h2>
        <p className="text-xs text-gray-500">
          Overall average: <span className="font-semibold text-gray-700">{overview.averagePercentage.toFixed(1)}%</span> |
          Top performance: <span className="font-semibold text-gray-700"> {overview.topScore?.examName || 'N/A'}</span> |
          Latest record: <span className="font-semibold text-gray-700"> {overview.recentExam?.examName || 'N/A'}</span>
        </p>
      </div>

      {/* Filter chips — horizontal scroll on mobile */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0 md:flex-wrap">
        {examTypes.map(type => (
          <button
            key={type}
            onClick={() => setSelectedExamType(type)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedExamType === type
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {type === 'all' ? 'All Results' : type === 'assignment' ? 'Assignments' : type.replace(/^\w/, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Performance Blocks</h2>
      </div>

      {/* Results list */}
      <div className="space-y-3">
        {filteredResults.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-400">
            <Trophy className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="font-medium text-gray-500 mb-1">No results yet</p>
            <p className="text-sm">Exam results and graded assignments will appear here automatically.</p>
          </div>
        ) : (
          filteredResults.map((exam, index) => (
            <ExamCard key={exam._id || index} exam={exam} />
          ))
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, title, value, subtitle, accent }) => (
  <div className="bg-white rounded-xl p-3 md:p-5 shadow-sm border border-gray-100">
    <div className={`inline-flex p-2 rounded-lg ${accent} mb-2`}>
      <Icon className="w-4 h-4 md:w-5 md:h-5" />
    </div>
    <p className="text-xs text-gray-500 font-medium">{title}</p>
    <p className="text-lg md:text-xl font-bold text-gray-900 leading-tight truncate">{value}</p>
    {subtitle && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{subtitle}</p>}
  </div>
);

const ExamCard = ({ exam }) => {
  const [expanded, setExpanded] = useState(false);
  const isAssignment = exam.resultType === 'assignment' || exam.type === 'assignment';
  const percentage = exam.percentage ?? (exam.obtainedMarks && exam.totalMarks
    ? (exam.obtainedMarks / exam.totalMarks) * 100
    : null);

  const scoreColor = percentage === null
    ? 'text-gray-400'
    : percentage >= 80
    ? 'text-green-600'
    : percentage >= 60
    ? 'text-yellow-600'
    : 'text-red-500';

  const scoreBg = percentage === null
    ? 'bg-gray-100'
    : percentage >= 80
    ? 'bg-green-50 border-green-100'
    : percentage >= 60
    ? 'bg-yellow-50 border-yellow-100'
    : 'bg-red-50 border-red-100';

  const hasSubjects = Array.isArray(exam.subjects) && exam.subjects.length > 0;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${isAssignment ? 'border-purple-100' : 'border-gray-100'}`}>
      {/* Card header */}
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {isAssignment && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700 mb-1.5">
                <BookOpen size={10} />
                Assignment
              </span>
            )}
            <h3 className="text-base md:text-lg font-semibold text-gray-900 leading-snug">
              {exam.examName || (isAssignment ? 'Assignment' : 'Exam')}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {exam.subject && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isAssignment ? 'bg-purple-50 text-purple-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {exam.subject}
                </span>
              )}
              {exam.date && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar size={11} />
                  {new Date(exam.date).toLocaleDateString()}
                </span>
              )}
              {exam.type && !isAssignment && (
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                  {exam.type.replace(/^\w/, c => c.toUpperCase())}
                </span>
              )}
            </div>
          </div>

          {/* Score badge */}
          {percentage !== null && (
            <div className={`shrink-0 rounded-xl border px-3 py-2 text-center ${scoreBg}`}>
              <p className={`text-2xl md:text-3xl font-bold ${scoreColor}`}>
                {percentage.toFixed(0)}
                <span className="text-sm font-medium">%</span>
              </p>
              {exam.grade && (
                <p className={`text-xs font-semibold ${scoreColor}`}>{exam.grade}</p>
              )}
            </div>
          )}
        </div>

        {/* Quick stats row */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {exam.totalMarks != null && (
            <StatPill label="Total" value={exam.totalMarks} />
          )}
          {exam.obtainedMarks != null && (
            <StatPill label="Obtained" value={exam.obtainedMarks} highlight={scoreColor} />
          )}
          {!isAssignment && exam.status && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              exam.status?.toLowerCase() === 'pass'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-600'
            }`}>
              {exam.status?.toLowerCase() === 'pass'
                ? <CheckCircle2 size={11} />
                : <XCircle size={11} />}
              {exam.status}
            </span>
          )}
          {!isAssignment && (
            <button className="ml-auto flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1 hover:bg-gray-50 transition-colors">
              <Download size={12} />
              Download
            </button>
          )}
        </div>
      </div>

      {/* Remarks */}
      {exam.remarks && (
        <div className={`mx-4 mb-3 p-3 rounded-xl border-l-4 ${isAssignment ? 'bg-purple-50 border-purple-400' : 'bg-amber-50 border-amber-400'}`}>
          <div className="flex items-start gap-2">
            {isAssignment
              ? <FileText className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              : <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
            <div>
              <p className={`text-xs font-semibold mb-0.5 ${isAssignment ? 'text-purple-900' : 'text-amber-900'}`}>
                {isAssignment ? "Teacher's Feedback" : "Teacher's Remarks"}
              </p>
              <p className={`text-xs leading-relaxed ${isAssignment ? 'text-purple-800' : 'text-amber-800'}`}>
                {exam.remarks}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subject breakdown — collapsible */}
      {hasSubjects && (
        <>
          <button
            onClick={() => setExpanded(v => !v)}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium border-t transition-colors ${
              isAssignment
                ? 'border-purple-50 text-purple-700 bg-purple-50 hover:bg-purple-100'
                : 'border-gray-100 text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
            }`}
          >
            <span>Subject Breakdown ({exam.subjects.length})</span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {expanded && (
            <div className="divide-y divide-gray-50">
              {exam.subjects.map((subject, idx) => (
                <div key={`${subject.name}-${idx}`} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{subject.name || 'Subject'}</p>
                    {subject.remarks && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{subject.remarks}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-gray-700">
                      {subject.marks ?? '-'}{subject.maxMarks ? `/${subject.maxMarks}` : ''}
                    </span>
                    {subject.grade && (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${gradeColor(subject.grade)}`}>
                        {subject.grade}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const StatPill = ({ label, value, highlight }) => (
  <span className="inline-flex items-center gap-1 text-xs bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
    <span className="text-gray-400">{label}:</span>
    <span className={`font-semibold ${highlight || 'text-gray-700'}`}>{value}</span>
  </span>
);

const gradeColor = (grade = '') => {
  if (grade.startsWith('A')) return 'bg-green-100 text-green-700';
  if (grade.startsWith('B')) return 'bg-blue-100 text-blue-700';
  if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-700';
};

const getResultTimestamp = (result = {}) => {
  const candidates = [result.date, result.updatedAt, result.createdAt];
  for (const value of candidates) {
    if (!value) continue;
    const parsed = new Date(value).getTime();
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
};

const sortResultsByDate = (items = []) => {
  return [...items].sort((a, b) => getResultTimestamp(b) - getResultTimestamp(a));
};

const buildOverview = (items = []) => {
  if (!items.length) {
    return {
      averagePercentage: 0,
      examsTaken: 0,
      topScore: null,
      recentExam: null
    };
  }

  const enriched = items.map((exam) => {
    const pct = exam.percentage ?? (exam.obtainedMarks && exam.totalMarks
      ? (exam.obtainedMarks / exam.totalMarks) * 100
      : 0);
    return { ...exam, percentage: pct || 0 };
  });

  const totalPercentage = enriched.reduce((sum, exam) => sum + exam.percentage, 0);
  const topScore = enriched.reduce((best, exam) => (exam.percentage > (best?.percentage || 0) ? exam : best), null);
  const recentExam = enriched.reduce((latest, exam) => {
    if (!exam.date) return latest;
    if (!latest) return exam;
    return new Date(exam.date) > new Date(latest.date) ? exam : latest;
  }, null);

  return {
    averagePercentage: totalPercentage / enriched.length,
    examsTaken: enriched.length,
    topScore,
    recentExam
  };
};

export default ResultsView;
