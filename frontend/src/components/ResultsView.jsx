import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  TrendingUp,
  Download,
  Target,
  Calendar,
  Trophy,
  AlertCircle
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
        setResults(items);
        setOverview(buildOverview(items));
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
      <div className="space-y-6 p-4">
        <div className="h-36 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-32 bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-xl h-64 border border-gray-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full"></div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-8 h-8 text-yellow-200" />
                <h1 className="text-3xl font-bold">My Results</h1>
              </div>
              <p className="text-yellow-100">Live academic performance pulled from your student profile</p>
            </div>
            <div className="text-right">
              {lastUpdated && (
                <>
                  <p className="text-yellow-100 text-sm mb-1">Last Synced</p>
                  <p className="text-xl font-semibold">{lastUpdated.toLocaleDateString()}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          icon={Target}
          title="Average Score"
          value={`${overview.averagePercentage.toFixed(1)}%`}
          accent="bg-yellow-100 text-yellow-600"
        />
        <SummaryCard
          icon={Award}
          title="Exams Taken"
          value={overview.examsTaken}
          accent="bg-blue-100 text-blue-600"
        />
        <SummaryCard
          icon={TrendingUp}
          title="Best Exam"
          value={overview.topScore?.examName || 'N/A'}
          subtitle={overview.topScore ? `${overview.topScore.percentage.toFixed(1)}%` : 'Awaiting data'}
          accent="bg-green-100 text-green-600"
        />
        <SummaryCard
          icon={Calendar}
          title="Recent Exam"
          value={overview.recentExam?.examName || 'N/A'}
          subtitle={overview.recentExam ? new Date(overview.recentExam.date).toLocaleDateString() : 'No records'}
          accent="bg-purple-100 text-purple-600"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-medium text-gray-600">Filter by exam type:</p>
        <div className="flex flex-wrap gap-2">
          {examTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedExamType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedExamType === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {type === 'all' ? 'All Exams' : type.replace(/^\w/, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredResults.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-500">
            No exam records available. Once your school publishes results they will appear here automatically.
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
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${accent}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-2xl">📊</span>
    </div>
    <div>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const ExamCard = ({ exam }) => {
  const percentage = exam.percentage ?? (exam.obtainedMarks && exam.totalMarks
    ? (exam.obtainedMarks / exam.totalMarks) * 100
    : null);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{exam.examName || 'Exam'}</h3>
          {exam.subject && (
            <p className="text-sm font-medium text-indigo-600 mt-1">
              📚 {exam.subject}
            </p>
          )}
          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
            <Calendar size={14} />
            {exam.date ? new Date(exam.date).toLocaleDateString() : 'Date not available'}
            {exam.type && <>• {exam.type.replace(/^\w/, c => c.toUpperCase())}</>}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {percentage !== null && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Score</p>
              <p className="text-2xl font-bold text-indigo-600">{percentage.toFixed(1)}%</p>
            </div>
          )}
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {exam.subject && (
            <Stat label="Subject" value={exam.subject} />
          )}
          <Stat label="Total Marks" value={exam.totalMarks ?? '-'} />
          <Stat label="Obtained" value={exam.obtainedMarks ?? '-'} />
          <Stat label="Status" value={exam.status || 'Not available'} />
          <Stat label="Result" value={exam.grade || (percentage ? `${percentage.toFixed(1)}%` : '-')} />
        </div>

        {/* Teacher's Remarks */}
        {exam.remarks && (
          <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-900 mb-1">Teacher's Remarks</h4>
                <p className="text-sm text-amber-800">{exam.remarks}</p>
              </div>
            </div>
          </div>
        )}

        {Array.isArray(exam.subjects) && exam.subjects.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {exam.subjects.map((subject, idx) => (
                  <tr key={`${subject.name}-${idx}`}>
                    <td className="px-4 py-2 text-sm text-gray-700">{subject.name || 'Subject'}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {subject.marks ?? '-'}{subject.maxMarks ? ` / ${subject.maxMarks}` : ''}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${gradeColor(subject.grade)}`}>
                        {subject.grade || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">{subject.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-lg font-semibold text-gray-900">{value}</p>
  </div>
);

const gradeColor = (grade = '') => {
  if (grade.startsWith('A')) return 'bg-green-100 text-green-700';
  if (grade.startsWith('B')) return 'bg-blue-100 text-blue-700';
  if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-700';
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
