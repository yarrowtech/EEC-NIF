import React, { useState, useEffect } from 'react';
import {
  Search, FileText, CheckCircle, Clock, User, BookOpen,
  Star, Calendar, Send, Eye, Award, X, AlertCircle,
  ChevronLeft, Filter
} from 'lucide-react';
import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const AssignmentEvaluation = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);          // the submission being graded
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // filter bar
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | pending | graded
  const [assignmentFilter, setAssignmentFilter] = useState('all');

  const token = () => localStorage.getItem('token');

  // ── fetch all submissions for this teacher ────────────────────────────────
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/api/assignment/teacher/submissions`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setSubmissions(data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  // ── derived lists ─────────────────────────────────────────────────────────
  const assignmentTitles = ['all', ...new Set(submissions.map(s => s.assignmentTitle))];

  useEffect(() => {
    let list = submissions;
    if (statusFilter !== 'all') {
      list = list.filter(s =>
        statusFilter === 'graded' ? s.score !== null : s.score === null
      );
    }
    if (assignmentFilter !== 'all') {
      list = list.filter(s => s.assignmentTitle === assignmentFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.studentName?.toLowerCase().includes(q) ||
        s.assignmentTitle?.toLowerCase().includes(q) ||
        s.subject?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [submissions, statusFilter, assignmentFilter, search]);

  // ── open a submission ─────────────────────────────────────────────────────
  const openSubmission = (sub) => {
    setSelected(sub);
    setMarks(sub.score !== null && sub.score !== undefined ? String(sub.score) : '');
    setFeedback(sub.feedback || '');
    setSaveError('');
  };

  const closePanel = () => { setSelected(null); setSaveError(''); };

  // ── save grade ────────────────────────────────────────────────────────────
  const saveGrade = async () => {
    const numMarks = parseFloat(marks);
    if (isNaN(numMarks) || numMarks < 0) {
      setSaveError('Please enter a valid mark (≥ 0).');
      return;
    }
    if (numMarks > selected.totalMarks) {
      setSaveError(`Marks cannot exceed ${selected.totalMarks}.`);
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      await axios.post(
        `${API_BASE}/api/assignment/teacher/grade`,
        {
          studentId: selected.studentId,
          assignmentId: selected.assignmentId,
          score: numMarks,
          feedback
        },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      // update local state immediately
      setSubmissions(prev =>
        prev.map(s =>
          s.submissionId === selected.submissionId
            ? { ...s, score: numMarks, feedback, status: 'graded' }
            : s
        )
      );
      setSelected(prev => ({ ...prev, score: numMarks, feedback, status: 'graded' }));
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── helpers ───────────────────────────────────────────────────────────────
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';

  const statusChip = (sub) => {
    if (sub.score !== null && sub.score !== undefined)
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">Graded</span>;
    if (sub.status === 'late')
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">Late</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">Pending</span>;
  };

  const pendingCount = submissions.filter(s => s.score === null || s.score === undefined).length;
  const gradedCount  = submissions.filter(s => s.score !== null && s.score !== undefined).length;

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-1">Assignment Evaluation</h1>
        <p className="text-purple-200">Review and grade student submissions</p>
        <div className="flex gap-6 mt-4 text-sm">
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{pendingCount} pending</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" />{gradedCount} graded</span>
          <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" />{submissions.length} total</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search student or assignment…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="graded">Graded</option>
        </select>
        <select
          value={assignmentFilter}
          onChange={e => setAssignmentFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none max-w-[240px]"
        >
          {assignmentTitles.map(t => (
            <option key={t} value={t}>{t === 'all' ? 'All Assignments' : t}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-20">
          <Clock className="w-10 h-10 text-purple-400 mx-auto mb-3 animate-spin" />
          <p className="text-gray-500">Loading submissions…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No submissions found</p>
          <p className="text-gray-400 text-sm mt-1">Students haven't submitted any assignments yet, or nothing matches your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((sub) => (
            <div
              key={`${sub.submissionId}`}
              onClick={() => openSubmission(sub)}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              {/* student + status */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{sub.studentName}</p>
                    <p className="text-xs text-gray-500">{sub.grade} – {sub.section}</p>
                  </div>
                </div>
                {statusChip(sub)}
              </div>

              {/* assignment info */}
              <p className="text-sm font-medium text-gray-800 line-clamp-1 mb-1">{sub.assignmentTitle}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                <BookOpen className="w-3 h-3" />{sub.subject}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(sub.submittedAt)} {formatTime(sub.submittedAt)}
                </span>
                {sub.score !== null && sub.score !== undefined ? (
                  <span className="font-semibold text-green-600">{sub.score}/{sub.totalMarks}</span>
                ) : (
                  <span className="text-purple-500 font-medium">Grade →</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Slide-in grading panel ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={closePanel}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Panel header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between rounded-t-2xl z-10">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selected.studentName}</p>
                    <p className="text-xs text-gray-500">{selected.grade} – {selected.section}</p>
                  </div>
                </div>
              </div>
              <button onClick={closePanel} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Assignment meta */}
              <div className="bg-purple-50 rounded-xl p-4 space-y-2">
                <p className="font-semibold text-gray-900">{selected.assignmentTitle}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{selected.subject}</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3" />Total: {selected.totalMarks} marks</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Submitted: {formatDate(selected.submittedAt)}</span>
                  {selected.status === 'late' && (
                    <span className="text-amber-600 font-medium">Late submission</span>
                  )}
                </div>
              </div>

              {/* Submission text */}
              {selected.submissionText ? (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Student's Answer</h3>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-line max-h-48 overflow-y-auto border border-gray-200">
                    {selected.submissionText}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-400 italic border border-gray-200">
                  No text submitted.
                </div>
              )}

              {/* Grading form */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {selected.score !== null && selected.score !== undefined ? 'Update Grade' : 'Give Grade'}
                </h3>

                {selected.score !== null && selected.score !== undefined && (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                    <Award className="w-5 h-5 text-green-600 shrink-0" />
                    <p className="text-sm font-semibold text-green-800">
                      Current score: {selected.score} / {selected.totalMarks}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Marks (out of {selected.totalMarks}) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selected.totalMarks}
                      value={marks}
                      onChange={e => setMarks(e.target.value)}
                      placeholder={`0 – ${selected.totalMarks}`}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm outline-none"
                    />
                  </div>
                  <div className="self-end pb-0.5">
                    <p className="text-xs text-gray-400 mb-1">Percentage</p>
                    <p className="text-lg font-bold text-purple-600">
                      {marks && !isNaN(parseFloat(marks))
                        ? `${Math.round((parseFloat(marks) / selected.totalMarks) * 100)}%`
                        : '—'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Feedback (optional)</label>
                  <textarea
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    rows={3}
                    placeholder="Write feedback for the student…"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none outline-none"
                  />
                </div>

                {saveError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />{saveError}
                  </div>
                )}

                <button
                  onClick={saveGrade}
                  disabled={saving || !marks}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {saving ? 'Saving…' : selected.score !== null && selected.score !== undefined ? 'Update Grade' : 'Submit Grade'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentEvaluation;
