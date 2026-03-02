import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Award,
  Target,
  Calendar,
  Eye,
  FileText,
  AlertCircle,
  Minus,
  ChevronRight,
  Loader2,
  X,
  RefreshCcw,
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
});

/* ── Helpers ── */
const getGradeColor = (grade) => ({
  'A+': 'text-emerald-700 bg-emerald-50 border-emerald-200',
  'A': 'text-emerald-700 bg-emerald-50 border-emerald-200',
  'B+': 'text-blue-700 bg-blue-50 border-blue-200',
  'B': 'text-blue-700 bg-blue-50 border-blue-200',
  'C+': 'text-amber-700 bg-amber-50 border-amber-200',
  'C': 'text-amber-700 bg-amber-50 border-amber-200',
  'D': 'text-orange-700 bg-orange-50 border-orange-200',
  'F': 'text-red-700 bg-red-50 border-red-200',
}[grade] || 'text-gray-600 bg-gray-50 border-gray-200');

const getScoreColor = (score) => {
  if (score >= 90) return 'text-emerald-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
};

const getBarColor = (score) => {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 75) return 'bg-blue-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
};

const TrendIcon = ({ trend }) => {
  if (trend === 'improving') return <TrendingUp size={14} className="text-emerald-500" />;
  if (trend === 'declining') return <TrendingDown size={14} className="text-red-500" />;
  return <Minus size={14} className="text-gray-400" />;
};

/* ── Stat Card ── */
const StatCard = ({ label, value, sub, icon: Icon }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="mt-2 text-3xl font-black text-gray-900 leading-none">{value ?? '—'}</p>
        {sub && <p className="mt-2 text-xs text-gray-500 font-medium">{sub}</p>}
      </div>
      <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
        <Icon size={18} className="text-gray-600" />
      </div>
    </div>
  </div>
);

/* ── Detail Modal ── */
const StudentDetailModal = ({ student, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        // Try the teacher-accessible detailed view via the progress route
        const res = await fetch(`${API_BASE}/api/progress/student/${student._id}`, {
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error('Unable to load student details');
        const data = await res.json();
        setDetail(data);
      } catch (err) {
        // If detail endpoint fails, show what we already have from the list
        setDetail(student);
        setError('Some details may be unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [student._id]);

  const data = detail || student;
  const metrics = data.progressMetrics || [];
  const submissions = data.submissions || [];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-white text-lg font-black">
              {(data.studentId?.name || data.name || 'S').charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">{data.studentId?.name || data.name || 'Student'}</h2>
              <p className="text-sm text-gray-500">
                Grade {data.studentId?.grade || data.grade || '—'}
                {(data.studentId?.section || data.section) ? `-${data.studentId?.section || data.section}` : ''} &nbsp;·&nbsp;
                Roll {data.studentId?.roll || data.rollNumber || '—'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Subject Performance */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4">Subject Performance</h3>
                {metrics.length === 0 ? (
                  <p className="text-sm text-gray-500">No performance data yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {metrics.map((metric, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-bold text-gray-800">{metric.subject}</p>
                          <span className={`text-sm font-black ${getScoreColor(metric.averageScore)}`}>{metric.averageScore}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                          <div className={`h-full rounded-full transition-all ${getBarColor(metric.averageScore)}`} style={{ width: `${metric.averageScore}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Assignments: {metric.completedAssignments ?? '—'}/{metric.totalAssignments ?? '—'}</span>
                          <span>Attendance: {metric.attendanceRate ?? '—'}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Submissions */}
              {submissions.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Recent Submissions</h3>
                  <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                    {submissions.slice(0, 6).map((sub, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-1.5 rounded-lg bg-gray-100">
                            <FileText size={13} className="text-gray-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {sub.assignmentId?.title || `Assignment ${i + 1}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : '—'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-4">
                          <span className={`text-sm font-black ${getScoreColor(sub.score ?? 0)}`}>{sub.score ?? '—'}%</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sub.status === 'graded' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                              sub.status === 'submitted' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                                sub.status === 'late' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                                  'text-red-700 bg-red-50 border-red-200'
                            } capitalize`}>
                            {sub.status || 'pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ── */
const StudentProgress = () => {
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [classOptions, setClassOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [filters, setFilters] = useState({ grade: '', section: '', subject: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.grade) params.set('grade', filters.grade);
      if (filters.section) params.set('section', filters.section);
      if (filters.subject) params.set('subject', filters.subject);

      const [studentsRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE}/api/progress/students?${params}`, { headers: authHeaders() }),
        fetch(`${API_BASE}/api/progress/analytics?${params}`, { headers: authHeaders() }),
      ]);

      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(Array.isArray(data) ? data : []);
      } else {
        // Fallback: fetch student list from teacher dashboard route
        const fallbackRes = await fetch(`${API_BASE}/api/teacher/dashboard/students`, { headers: authHeaders() });
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setClassOptions((fallbackData.classes || []).map(c => typeof c === 'string' ? c : c.name));
          setSectionOptions((fallbackData.sections || []).map(s => typeof s === 'string' ? s : s.name));
          // Map to progress shape so the rest of the UI works
          setStudents((fallbackData.students || []).map(s => ({
            _id: s._id,
            studentId: { name: s.name, grade: s.grade || s.className, section: s.section || s.sectionName, roll: s.rollNumber },
            progressMetrics: [],
            submissions: [],
            overallGrade: null,
            improvementTrend: 'stable',
          })));
        } else {
          throw new Error('Unable to load student progress data');
        }
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (err) {
      setError(err.message || 'Failed to load progress data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredStudents = useMemo(() =>
    students.filter((s) => {
      const name = s.studentId?.name || '';
      const roll = String(s.studentId?.roll || '');
      const term = searchTerm.toLowerCase();
      return !term || name.toLowerCase().includes(term) || roll.includes(term);
    }),
    [students, searchTerm]
  );

  const overallScore = (student) => {
    const metrics = student.progressMetrics || [];
    if (!metrics.length) return 0;
    return Math.round(metrics.reduce((sum, m) => sum + (m.averageScore || 0), 0) / metrics.length);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student Progress</h1>
          <p className="mt-1.5 text-sm font-medium text-gray-500">Monitor performance and academic trends</p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCcw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={analytics?.totalStudents ?? students.length} sub="in your classes" icon={Users} />
        <StatCard label="Average Score" value={analytics?.averageScore != null ? `${analytics.averageScore}%` : '—'} sub="across subjects" icon={Target} />
        <StatCard label="Attendance Rate" value={analytics?.attendanceRate != null ? `${analytics.attendanceRate}%` : '—'} sub="avg attendance" icon={Calendar} />
        <StatCard label="Improving" value={analytics?.improvementTrends?.improving ?? '—'} sub="students trending up" icon={TrendingUp} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or roll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
            />
          </div>
          {/* Grade filter */}
          <select
            value={filters.grade}
            onChange={(e) => setFilters(f => ({ ...f, grade: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
          >
            <option value="">All Grades</option>
            {classOptions.length > 0
              ? classOptions.map(c => <option key={c} value={c}>{c}</option>)
              : ['9', '10', '11', '12'].map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
          {/* Section filter */}
          <select
            value={filters.section}
            onChange={(e) => setFilters(f => ({ ...f, section: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
          >
            <option value="">All Sections</option>
            {sectionOptions.length > 0
              ? sectionOptions.map(s => <option key={s} value={s}>{s}</option>)
              : ['A', 'B', 'C'].map(s => <option key={s} value={s}>Section {s}</option>)}
          </select>
          {/* Subject filter */}
          <input
            type="text"
            placeholder="Subject (optional)"
            value={filters.subject}
            onChange={(e) => setFilters(f => ({ ...f, subject: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
          />
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tab Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base font-bold text-gray-900">
            {filteredStudents.length} Student{filteredStudents.length !== 1 ? 's' : ''}
          </h2>
          <div className="flex gap-1.5 bg-gray-100 p-1 rounded-lg w-fit">
            {['overview', 'detailed'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={24} className="animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Loading student progress...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-gray-100">
              <Users size={22} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-600">No students found</p>
            <p className="text-xs text-gray-400">Try adjusting your filters</p>
          </div>
        ) : activeTab === 'overview' ? (
          <div className="divide-y divide-gray-50">
            {filteredStudents.map((student) => {
              const score = overallScore(student);
              return (
                <div key={student._id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white text-sm font-black shrink-0">
                      {(student.studentId?.name || 'S').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{student.studentId?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Grade {student.studentId?.grade || '—'}
                        {student.studentId?.section ? `-${student.studentId.section}` : ''}
                        &nbsp;·&nbsp;Roll {student.studentId?.roll || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Score + Grade + Trend + CTA */}
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-center hidden sm:block">
                      <p className="text-xs text-gray-500">Score</p>
                      <p className={`text-sm font-black mt-0.5 ${getScoreColor(score)}`}>{score}%</p>
                    </div>
                    {student.overallGrade && (
                      <span className={`hidden sm:inline-flex text-xs font-bold px-2 py-1 rounded-md border ${getGradeColor(student.overallGrade)}`}>
                        {student.overallGrade}
                      </span>
                    )}
                    <TrendIcon trend={student.improvementTrend} />
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <Eye size={14} /> Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Detailed Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Overall</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Trend</th>
                  {/* Dynamic subject columns */}
                  {[...new Set(filteredStudents.flatMap(s => (s.progressMetrics || []).map(m => m.subject)))].slice(0, 3).map(subj => (
                    <th key={subj} className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">{subj}</th>
                  ))}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.map((student) => {
                  const score = overallScore(student);
                  const subjects = [...new Set(filteredStudents.flatMap(s => (s.progressMetrics || []).map(m => m.subject)))].slice(0, 3);
                  return (
                    <tr key={student._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white text-xs font-black shrink-0">
                            {(student.studentId?.name || 'S').charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{student.studentId?.name || '—'}</p>
                            <p className="text-xs text-gray-400">Roll {student.studentId?.roll || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-black ${getScoreColor(score)}`}>{score}%</span>
                      </td>
                      <td className="px-4 py-3">
                        {student.overallGrade ? (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getGradeColor(student.overallGrade)}`}>
                            {student.overallGrade}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <TrendIcon trend={student.improvementTrend} />
                      </td>
                      {subjects.map(subj => {
                        const metric = (student.progressMetrics || []).find(m => m.subject === subj);
                        return (
                          <td key={subj} className="px-4 py-3">
                            <span className={`font-semibold ${getScoreColor(metric?.averageScore ?? 0)}`}>
                              {metric?.averageScore != null ? `${metric.averageScore}%` : '—'}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

export default StudentProgress;