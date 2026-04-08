import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  TrendingUp,
  Download,
  Target,
  Calendar,
  Trophy,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadSingleReportCardPdf } from '../utils/reportCardPdf';

const API_BASE = import.meta.env.VITE_API_URL || '';

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const formatDate = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString();
};

const ResultsView = () => {
  const [template, setTemplate] = useState(null);
  const [reportCard, setReportCard] = useState(null);
  const [examGroups, setExamGroups] = useState([]);
  const [selectedExamGroupId, setSelectedExamGroupId] = useState('');
  const [selectedExamGroupTitle, setSelectedExamGroupTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [downloadingReportCard, setDownloadingReportCard] = useState(false);

  const fetchExamWiseReport = useCallback(async (examGroupId = '') => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    if (!token || userType !== 'Student') {
      setError('Please login as student to view results.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams();
      if (examGroupId) query.set('examGroupId', examGroupId);

      const res = await fetch(
        `${API_BASE}/api/reports/report-cards/me${query.toString() ? `?${query.toString()}` : ''}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Unable to load exam results');

      setTemplate(data?.template || null);
      setReportCard(data?.reportCard || null);
      setExamGroups(Array.isArray(data?.examGroups) ? data.examGroups : []);
      setSelectedExamGroupId(String(data?.selectedExamGroupId || examGroupId || ''));
      setSelectedExamGroupTitle(String(data?.selectedExamGroupTitle || ''));
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Student results fetch error:', err);
      setError(err.message || 'Unable to load exam results');
      setReportCard(null);
      setExamGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExamWiseReport();
  }, [fetchExamWiseReport]);

  const examCards = useMemo(() => {
    if (!reportCard) return [];

    const totals = reportCard.totals || {};
    const subjects = Array.isArray(reportCard.subjects) ? reportCard.subjects : [];
    if (!subjects.length) return [];
    const percentage = toNumber(totals.percentage, 0);
    const promoted = totals.promoted;
    const selectedExamGroup = (Array.isArray(examGroups) ? examGroups : [])
      .find((group) => String(group?._id) === String(selectedExamGroupId)) || null;

    return [
      {
        _id: selectedExamGroupId || String(reportCard.studentId || 'exam'),
        examName: selectedExamGroupTitle || reportCard.term || 'Exam',
        date: reportCard.generatedAt || null,
        startDate: selectedExamGroup?.startDate || null,
        endDate: selectedExamGroup?.endDate || null,
        examStatus: String(selectedExamGroup?.status || '').toLowerCase(),
        obtainedMarks: toNumber(totals.obtainedMarks, 0),
        totalMarks: toNumber(totals.totalMarks, 0),
        percentage,
        grade: String(totals.grade || '').trim(),
        status: promoted === false ? 'Fail' : promoted === true ? 'Pass' : '',
        remarks: promoted === false ? 'Not Promoted' : promoted === true ? 'Promoted' : '',
        subjects: subjects.map((subject) => ({
          name: subject.name || 'Subject',
          marks: toNumber(subject.obtainedMarks, 0),
          maxMarks: toNumber(subject.totalMarks, 0),
          grade: subject.grade || '',
        })),
      },
    ];
  }, [reportCard, selectedExamGroupId, selectedExamGroupTitle, examGroups]);

  const overview = useMemo(() => {
    const exam = examCards[0];
    if (!exam) {
      return { averagePercentage: 0, examsTaken: 0, topScore: null, recentExam: null };
    }
    return {
      averagePercentage: toNumber(exam.percentage, 0),
      examsTaken: 1,
      topScore: { percentage: toNumber(exam.percentage, 0), examName: exam.examName || 'Exam' },
      recentExam: { examName: exam.examName || 'Exam', date: exam.date || null },
    };
  }, [examCards]);

  const handleDownloadReportCard = async () => {
    if (!reportCard) {
      toast.error('No report card available');
      return;
    }
    setDownloadingReportCard(true);
    try {
      await downloadSingleReportCardPdf({
        template,
        reportCard,
        fileName: `report_card_${String(reportCard.studentName || 'student').replace(/\s+/g, '_')}_${String(selectedExamGroupTitle || 'exam').replace(/\s+/g, '_')}.pdf`,
      });
      toast.success('Report card downloaded');
    } catch (err) {
      toast.error(err.message || 'Failed to download report card');
    } finally {
      setDownloadingReportCard(false);
    }
  };

  const selectedExamGroupStatus = String(
    (examGroups.find((group) => String(group?._id) === String(selectedExamGroupId))?.status || '')
  ).toLowerCase();
  const hideDownloadButton = selectedExamGroupStatus === 'completed';

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
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 md:p-4 pb-24 md:pb-6">
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
            <p className="text-yellow-100 text-xs md:text-sm">Exam-wise subject performance and official grade card</p>
          </div>
          <div className="text-right shrink-0">
            <div className="bg-white/20 rounded-xl px-3 py-2 backdrop-blur-sm">
              <p className="text-yellow-100 text-xs mb-0.5">Average</p>
              <p className="text-2xl md:text-3xl font-bold">{overview.averagePercentage.toFixed(1)}%</p>
            </div>
            {lastUpdated && (
              <p className="text-yellow-200 text-[10px] mt-1">Updated {lastUpdated.toLocaleDateString()}</p>
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

      {/* <div className="rounded-xl border border-gray-100 bg-white p-4 flex flex-col md:flex-row md:items-end gap-3 md:justify-between">
        <div className="w-full md:max-w-md">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Completed Examination</label>
          <select
            value={selectedExamGroupId}
            onChange={(e) => fetchExamWiseReport(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
            disabled={!examGroups.length}
          >
            {!examGroups.length && <option value="">No completed exams</option>}
            {examGroups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.title || 'Exam'}
              </option>
            ))}
          </select>
        </div>
        {!hideDownloadButton && (
          <button
            type="button"
            onClick={handleDownloadReportCard}
            disabled={downloadingReportCard || !reportCard}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadingReportCard ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {downloadingReportCard ? 'Preparing PDF...' : 'Download Grade Card'}
          </button>
        )}
      </div> */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={Award} title="Exams Taken" value={overview.examsTaken} accent="bg-blue-100 text-blue-600" />
        <SummaryCard
          icon={TrendingUp}
          title="Best Exam"
          value={overview.topScore ? `${overview.topScore.percentage.toFixed(1)}%` : 'N/A'}
          subtitle={overview.topScore?.examName || 'Awaiting data'}
          accent="bg-green-100 text-green-600"
        />
        <SummaryCard icon={Target} title="Average" value={`${overview.averagePercentage.toFixed(1)}%`} accent="bg-yellow-100 text-yellow-600" />
        <SummaryCard
          icon={Calendar}
          title="Recent Exam"
          value={overview.recentExam?.examName || 'N/A'}
          subtitle={overview.recentExam?.date ? new Date(overview.recentExam.date).toLocaleDateString() : 'No records'}
          accent="bg-purple-100 text-purple-600"
        />
      </div>

      <div className="space-y-3">
        {examCards.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-400">
            <Trophy className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="font-medium text-gray-500 mb-1">Result is not published yet</p>
            <p className="text-sm">Please wait until your school publishes this exam result.</p>
          </div>
        ) : (
          examCards.map((exam, index) => (
            <ExamCard
              key={exam._id || index}
              exam={exam}
              onDownload={handleDownloadReportCard}
              downloadingReportCard={downloadingReportCard}
              showDownload={!hideDownloadButton}
            />
          ))
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, title, value, subtitle, accent }) => {
  const IconComponent = icon;
  return (
    <div className="bg-white rounded-xl p-3 md:p-5 shadow-sm border border-gray-100">
      <div className={`inline-flex p-2 rounded-lg ${accent} mb-2`}>
        <IconComponent className="w-4 h-4 md:w-5 md:h-5" />
      </div>
      <p className="text-xs text-gray-500 font-medium">{title}</p>
      <p className="text-lg md:text-xl font-bold text-gray-900 leading-tight truncate">{value}</p>
      {subtitle && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{subtitle}</p>}
    </div>
  );
};

const ExamCard = ({ exam, onDownload, downloadingReportCard, showDownload }) => {
  const [expanded, setExpanded] = useState(true);
  const percentage = toNumber(exam.percentage, 0);

  const scoreColor = percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-500';
  const scoreBg = percentage >= 80 ? 'bg-green-50 border-green-100' : percentage >= 60 ? 'bg-yellow-50 border-yellow-100' : 'bg-red-50 border-red-100';
  const hasSubjects = Array.isArray(exam.subjects) && exam.subjects.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 leading-snug">{exam.examName || 'Exam'}</h3>
            {(exam.startDate || exam.endDate) ? (
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
                <Calendar size={11} />
                {formatDate(exam.startDate) || '-'} - {formatDate(exam.endDate) || '-'}
              </div>
            ) : exam.date && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
                <Calendar size={11} />
                {new Date(exam.date).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className={`shrink-0 rounded-xl border px-3 py-2 text-center ${scoreBg}`}>
            <p className={`text-2xl md:text-3xl font-bold ${scoreColor}`}>
              {percentage.toFixed(0)}
              <span className="text-sm font-medium">%</span>
            </p>
            {exam.grade && <p className={`text-xs font-semibold ${scoreColor}`}>{exam.grade}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <StatPill label="Total" value={exam.totalMarks ?? 0} />
          <StatPill label="Obtained" value={exam.obtainedMarks ?? 0} highlight={scoreColor} />
          {exam.status && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                String(exam.status).toLowerCase() === 'pass' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              }`}
            >
              {String(exam.status).toLowerCase() === 'pass' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
              {exam.status}
            </span>
          )}
          {showDownload && (
            <button
              type="button"
              onClick={onDownload}
              disabled={downloadingReportCard}
              className="ml-auto flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1 hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              <Download size={12} />
              {downloadingReportCard ? 'Downloading...' : 'Download'}
            </button>
          )}
        </div>

        {exam.remarks && (
          <div className="mt-3 p-3 rounded-xl border-l-4 bg-amber-50 border-amber-400">
            <p className="text-xs font-semibold mb-0.5 text-amber-900">Result</p>
            <p className="text-xs leading-relaxed text-amber-800">{exam.remarks}</p>
          </div>
        )}
      </div>

      {hasSubjects && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium border-t border-gray-100 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            <span>Subject Breakdown ({exam.subjects.length})</span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {expanded && (
            <div className="divide-y divide-gray-50">
              {exam.subjects.map((subject, idx) => (
                <div key={`${subject.name}-${idx}`} className="px-4 py-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-800 truncate">{subject.name || 'Subject'}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-gray-700">
                      {toNumber(subject.marks, 0)}
                      {subject.maxMarks ? `/${toNumber(subject.maxMarks, 0)}` : ''}
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
  if (String(grade).startsWith('A')) return 'bg-green-100 text-green-700';
  if (String(grade).startsWith('B')) return 'bg-blue-100 text-blue-700';
  if (String(grade).startsWith('C')) return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-700';
};

export default ResultsView;
