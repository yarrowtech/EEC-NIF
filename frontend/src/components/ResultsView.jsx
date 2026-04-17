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
  Sparkles,
  GraduationCap,
  ShieldCheck,
  BookOpen,
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

  const hasResults = examCards.length > 0;

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
    <div className="space-y-5 bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.14),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(251,146,60,0.12),_transparent_26%),linear-gradient(180deg,_#fffaf3_0%,_#f8fafc_100%)] p-3 pb-24 md:p-4 md:pb-6">
      <div className="relative overflow-hidden rounded-[28px] border border-amber-200/70 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 p-5 text-white shadow-[0_28px_80px_-45px_rgba(249,115,22,0.65)] md:p-7">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-white/40 blur-3xl" />
          <div className="absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-yellow-100/50 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
              <Sparkles className="h-3.5 w-3.5" />
              Academic Progress
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Trophy className="h-7 w-7 text-amber-100" />
              <h1 className="text-2xl font-bold tracking-tight md:text-4xl">My Results</h1>
            </div>
            <p className="mt-2 text-sm leading-6 text-amber-50/95 md:text-base">
              Track your published exam performance, review subject-wise marks, and download the official report card when it becomes available.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[430px]">
            <HeroMetric
              label="Average"
              value={`${overview.averagePercentage.toFixed(1)}%`}
              helper={hasResults ? 'Across published exams' : 'Waiting for first result'}
            />
            <HeroMetric
              label="Published"
              value={overview.examsTaken}
              helper={overview.examsTaken === 1 ? 'Exam available' : 'Exams available'}
            />
            <HeroMetric
              label="Updated"
              value={lastUpdated ? lastUpdated.toLocaleDateString() : 'Today'}
              helper="Latest sync"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Award}
          title="Published Exams"
          value={overview.examsTaken}
          subtitle={hasResults ? 'Results available now' : 'No published records yet'}
          accent="bg-blue-100 text-blue-600"
        />
        <SummaryCard
          icon={TrendingUp}
          title="Best Exam"
          value={overview.topScore ? `${overview.topScore.percentage.toFixed(1)}%` : 'N/A'}
          subtitle={overview.topScore?.examName || 'Awaiting published result'}
          accent="bg-green-100 text-green-600"
        />
        <SummaryCard
          icon={Target}
          title="Average Score"
          value={`${overview.averagePercentage.toFixed(1)}%`}
          subtitle={hasResults ? 'Current published average' : 'Will appear after first result'}
          accent="bg-yellow-100 text-yellow-600"
        />
        <SummaryCard
          icon={Calendar}
          title="Latest Exam"
          value={overview.recentExam?.examName || 'Not available'}
          subtitle={overview.recentExam?.date ? new Date(overview.recentExam.date).toLocaleDateString() : 'No exam published'}
          accent="bg-purple-100 text-purple-600"
        />
      </div>

      <div className="space-y-4">
        {examCards.length === 0 ? (
          <div className="overflow-hidden rounded-[28px] border border-dashed border-amber-200 bg-white shadow-[0_18px_45px_-38px_rgba(15,23,42,0.35)]">
            <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="border-b border-amber-100 bg-[linear-gradient(135deg,_rgba(254,243,199,0.55),_rgba(255,255,255,0.95))] p-6 sm:p-8 lg:border-b-0 lg:border-r">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Awaiting Publication
                </div>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Results have not been published yet</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                  Your school has not released an exam result for this term yet. Once marks are published, this page will automatically show your overall percentage, subject breakdown, grade, and downloadable report card.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <InfoTile
                    icon={GraduationCap}
                    title="What will appear here"
                    copy="Exam name, marks, grade, pass or fail status, and subject-wise performance."
                  />
                  <InfoTile
                    icon={BookOpen}
                    title="What to do now"
                    copy="Check with your class teacher or school noticeboard if you expected a published result already."
                  />
                </div>
              </div>

              <div className="flex flex-col justify-center bg-slate-50/80 p-6 sm:p-8">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
                  <Trophy className="h-10 w-10 text-amber-300" />
                </div>
                <p className="mt-5 text-center text-sm font-semibold text-slate-700">
                  Nothing is missing from your account right now.
                </p>
                <p className="mt-2 text-center text-sm leading-6 text-slate-500">
                  This section will update as soon as the school publishes your exam record.
                </p>
              </div>
            </div>
          </div>
        ) : (
          examCards.map((exam, index) => (
            <ExamCard
              key={exam._id || index}
              exam={exam}
              onDownload={handleDownloadReportCard}
              downloadingReportCard={downloadingReportCard}
              showDownload={hasResults}
            />
          ))
        )}
      </div>
    </div>
  );
};

const HeroMetric = ({ label, value, helper }) => (
  <div className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-sm">
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">{label}</p>
    <p className="mt-2 text-xl font-bold text-white">{value}</p>
    <p className="mt-1 text-[11px] text-white/75">{helper}</p>
  </div>
);

const InfoTile = ({ icon, title, copy }) => {
  const Icon = icon;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="inline-flex rounded-xl bg-amber-50 p-2 text-amber-600">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-xs leading-6 text-slate-500">{copy}</p>
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
              {downloadingReportCard ? 'Downloading...' : 'Download Grade Card'}
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
