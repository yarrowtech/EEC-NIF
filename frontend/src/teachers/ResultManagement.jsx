import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Edit2, Plus, Save, Search, Send, Trash2, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const EMPTY_FORM = {
  examId: '',
  studentId: '',
  marks: '',
  grade: '',
  remarks: '',
  status: 'pass',
};

const STATUS_OPTIONS = ['pass', 'fail', 'absent'];

const ResultManagement = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingExamStudents, setLoadingExamStudents] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [examStudentsByExamId, setExamStudentsByExamId] = useState({});

  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingResultId, setEditingResultId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    const examIdFromQuery = params.get('examId') || '';
    if (examIdFromQuery) {
      setSelectedExamId(examIdFromQuery);
    }
  }, [location.search]);

  const apiFetch = useCallback(
    async (path, options = {}) => {
      const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || 'Request failed');
      }
      return payload;
    },
    [token]
  );

  const loadBootstrap = useCallback(async () => {
    if (!token) {
      setError('Login required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const examData = await apiFetch('/api/exam/results/exam-options');
      const examItems = Array.isArray(examData) ? examData : [];
      setExams(examItems);
    } catch (err) {
      setError(err.message || 'Failed to load result setup data');
    } finally {
      setLoading(false);
    }
  }, [apiFetch, token]);

  const loadResults = useCallback(async () => {
    if (!token) return;
    setError('');

    try {
      const query = new URLSearchParams();
      if (selectedExamId) query.set('examId', selectedExamId);
      if (selectedClass) query.set('grade', selectedClass);
      if (selectedSection) query.set('section', selectedSection);

      const path = `/api/exam/results${query.toString() ? `?${query.toString()}` : ''}`;
      const data = await apiFetch(path);
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load results');
      setResults([]);
    }
  }, [apiFetch, selectedClass, selectedExamId, selectedSection, token]);

  const ensureExamStudents = useCallback(
    async (examId) => {
      if (!examId || examStudentsByExamId[examId]) return;
      setLoadingExamStudents(true);
      try {
        const payload = await apiFetch(`/api/exam/results/exam-students?examId=${encodeURIComponent(examId)}`);
        setExamStudentsByExamId((prev) => ({
          ...prev,
          [examId]: Array.isArray(payload?.students) ? payload.students : [],
        }));
      } catch (err) {
        setError(err.message || 'Unable to load exam students');
      } finally {
        setLoadingExamStudents(false);
      }
    },
    [apiFetch, examStudentsByExamId]
  );

  useEffect(() => {
    loadBootstrap();
  }, [loadBootstrap]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const selectedExam = useMemo(
    () => exams.find((exam) => String(exam._id) === String(selectedExamId)) || null,
    [exams, selectedExamId]
  );

  useEffect(() => {
    if (!selectedExamId || !selectedExam) return;
    setSelectedClass(selectedExam?.classId?.name || selectedExam?.grade || '');
    setSelectedSection(selectedExam?.sectionId?.name || selectedExam?.section || '');
  }, [selectedExam, selectedExamId]);

  const classOptions = useMemo(() => {
    const values = new Set();
    exams.forEach((exam) => {
      const className = exam?.classId?.name || exam?.grade;
      if (className) values.add(String(className));
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [exams]);

  const sectionOptions = useMemo(() => {
    const values = new Set();
    exams
      .filter((exam) => {
        if (!selectedClass) return true;
        const className = exam?.classId?.name || exam?.grade || '';
        return String(className) === String(selectedClass);
      })
      .forEach((exam) => {
        const sectionName = exam?.sectionId?.name || exam?.section;
        if (sectionName) values.add(String(sectionName));
      });
    return Array.from(values).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [exams, selectedClass]);

  const visibleResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return results;

    return results.filter((result) => {
      const studentName = String(result?.studentId?.name || '').toLowerCase();
      const subject = String(result?.examId?.subject || '').toLowerCase();
      const examTitle = String(result?.examId?.title || '').toLowerCase();
      return studentName.includes(query) || subject.includes(query) || examTitle.includes(query);
    });
  }, [results, search]);

  const formExam = useMemo(
    () => exams.find((exam) => String(exam._id) === String(form.examId)) || null,
    [exams, form.examId]
  );

  const formStudents = useMemo(() => {
    if (!form.examId) return [];
    return examStudentsByExamId[form.examId] || [];
  }, [examStudentsByExamId, form.examId]);

  useEffect(() => {
    if (!showForm || !form.examId) return;
    ensureExamStudents(form.examId);
  }, [ensureExamStudents, form.examId, showForm]);

  const openCreate = () => {
    setEditingResultId(null);
    setForm({
      ...EMPTY_FORM,
      examId: selectedExamId || '',
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const openEdit = async (item) => {
    const examId = item?.examId?._id || '';
    setEditingResultId(item?._id || null);
    setForm({
      examId,
      studentId: item?.studentId?._id || '',
      marks: item?.marks ?? '',
      grade: item?.grade || '',
      remarks: item?.remarks || '',
      status: item?.status || 'pass',
    });
    setShowForm(true);
    setError('');
    setSuccess('');
    if (examId) await ensureExamStudents(examId);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingResultId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.examId || !form.studentId) {
      setError('Exam and student are required');
      return;
    }

    const maxMarks = Number(formExam?.marks);
    const marksRequired = form.status !== 'absent';
    let parsedMarks;
    if (marksRequired) {
      parsedMarks = Number(form.marks);
      if (!Number.isFinite(parsedMarks) || parsedMarks < 0) {
        setError('Enter valid marks');
        return;
      }
      if (Number.isFinite(maxMarks) && maxMarks >= 0 && parsedMarks > maxMarks) {
        setError(`Marks cannot be greater than ${maxMarks}`);
        return;
      }
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        examId: form.examId,
        studentId: form.studentId,
        grade: form.grade.trim(),
        remarks: form.remarks.trim(),
        status: form.status,
      };
      if (marksRequired) payload.marks = parsedMarks;

      if (editingResultId) {
        await apiFetch(`/api/exam/results/${editingResultId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSuccess('Result updated successfully');
      } else {
        await apiFetch('/api/exam/results', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSuccess('Result created successfully');
      }

      closeForm();
      await loadResults();
      if (form.examId) {
        setExamStudentsByExamId((prev) => {
          const next = { ...prev };
          delete next[form.examId];
          return next;
        });
        await ensureExamStudents(form.examId);
      }
    } catch (err) {
      setError(err.message || 'Failed to save result');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Delete result for ${item?.studentId?.name || 'this student'}?`);
    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');
      await apiFetch(`/api/exam/results/${item._id}`, { method: 'DELETE' });
      setSuccess('Result deleted successfully');
      await loadResults();
    } catch (err) {
      setError(err.message || 'Failed to delete result');
    }
  };

  const handleTogglePublish = async (item) => {
    try {
      setError('');
      setSuccess('');
      await apiFetch(`/api/exam/results/${item._id}`, {
        method: 'PUT',
        body: JSON.stringify({ published: !item.published }),
      });
      setSuccess(`Result ${item.published ? 'unpublished' : 'published'} successfully`);
      await loadResults();
    } catch (err) {
      setError(err.message || 'Failed to update publish status');
    }
  };

  const summary = useMemo(() => {
    const total = visibleResults.length;
    const published = visibleResults.filter((item) => Boolean(item.published)).length;
    const pass = visibleResults.filter((item) => String(item.status || '').toLowerCase() === 'pass').length;
    const fail = visibleResults.filter((item) => String(item.status || '').toLowerCase() === 'fail').length;
    return { total, published, pass, fail };
  }, [visibleResults]);

  const inputClass =
    'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20';

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-5 shadow-lg text-white">
        <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-400/10 rounded-full -translate-y-1/3 translate-x-1/4 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-cyan-500/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />
        <div className="relative">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Result Management</h1>
          <p className="mt-1 text-sm text-slate-300">Create, update, publish, and maintain student results</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total Results</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{summary.total}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs text-emerald-700">Published</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{summary.published}</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
          <p className="text-xs text-blue-700">Pass</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{summary.pass}</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 shadow-sm">
          <p className="text-xs text-red-700">Fail</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{summary.fail}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className={`${inputClass} max-w-[280px]`}
          >
            <option value="">All Exams</option>
            {exams.map((exam) => (
              <option key={exam._id} value={exam._id}>
                {exam.title} {exam.subject ? `(${exam.subject})` : ''}
              </option>
            ))}
          </select>

          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSection('');
            }}
            disabled={Boolean(selectedExamId)}
            className={`${inputClass} max-w-[180px] disabled:bg-gray-100 disabled:text-gray-500`}
          >
            <option value="">All Classes</option>
            {classOptions.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            disabled={Boolean(selectedExamId)}
            className={`${inputClass} max-w-[180px] disabled:bg-gray-100 disabled:text-gray-500`}
          >
            <option value="">All Sections</option>
            {sectionOptions.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>

          <div className="relative min-w-[220px] flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, exam, subject"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus size={14} />
            Add Result
          </button>
        </div>
      </div>

      {selectedExam && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-800">
          {selectedExam.title || 'Exam'}: {selectedExam?.classId?.name || selectedExam?.grade || '-'}
          {' - '}
          {selectedExam?.sectionId?.name || selectedExam?.section || '-'}
          {' - '}
          {selectedExam?.subject || selectedExam?.subjectId?.name || '-'}
          {Number.isFinite(Number(selectedExam?.marks)) ? ` (Max: ${Number(selectedExam.marks)})` : ''}
        </div>
      )}

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading result management data...</div>
        ) : visibleResults.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No results found for selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Exam</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Marks</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Publish</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleResults.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{item?.studentId?.name || 'Student'}</div>
                      <div className="text-xs text-gray-500">
                        {item?.studentId?.grade || '-'} {item?.studentId?.section || ''}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{item?.examId?.title || 'Exam'}</div>
                      <div className="text-xs text-gray-500">{item?.examId?.subject || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-800">{item?.marks ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-800">{item?.grade || '-'}</td>
                    <td className="px-4 py-3 text-gray-800 capitalize">{item?.status || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${item?.published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item?.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(item)}
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${item?.published ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                          title={item?.published ? 'Unpublish' : 'Publish'}
                        >
                          {item?.published ? <Send size={12} /> : <CheckCircle2 size={12} />}
                          {item?.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h2 className="text-base font-semibold text-gray-900">
                {editingResultId ? 'Edit Result' : 'Add Result'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 p-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Exam</label>
                <select
                  value={form.examId}
                  onChange={(e) => setForm((prev) => ({ ...prev, examId: e.target.value, studentId: '' }))}
                  className={inputClass}
                  required
                >
                  <option value="">Select exam</option>
                  {exams.map((exam) => (
                    <option key={exam._id} value={exam._id}>
                      {exam.title} {exam.subject ? `(${exam.subject})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {formExam && (
                <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-800">
                  Scope: {formExam?.classId?.name || formExam?.grade || '-'} - {formExam?.sectionId?.name || formExam?.section || '-'} - {formExam?.subject || formExam?.subjectId?.name || '-'}
                  {Number.isFinite(Number(formExam?.marks)) ? ` | Max Marks: ${Number(formExam.marks)}` : ''}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Student</label>
                <select
                  value={form.studentId}
                  onChange={(e) => setForm((prev) => ({ ...prev, studentId: e.target.value }))}
                  className={inputClass}
                  required
                  disabled={!form.examId || loadingExamStudents}
                >
                  <option value="">{loadingExamStudents ? 'Loading students...' : 'Select student'}</option>
                  {formStudents.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.grade || '-'} {student.section || ''}{student.roll ? `, Roll ${student.roll}` : ''})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Marks</label>
                  <input
                    type="number"
                    min="0"
                    max={Number.isFinite(Number(formExam?.marks)) ? Number(formExam?.marks) : undefined}
                    value={form.marks}
                    onChange={(e) => setForm((prev) => ({ ...prev, marks: e.target.value }))}
                    className={inputClass}
                    disabled={form.status === 'absent'}
                    required={form.status !== 'absent'}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Grade</label>
                  <input
                    value={form.grade}
                    onChange={(e) => setForm((prev) => ({ ...prev, grade: e.target.value }))}
                    className={inputClass}
                    placeholder="A+ / B / C"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => {
                      const nextStatus = e.target.value;
                      setForm((prev) => ({ ...prev, status: nextStatus, marks: nextStatus === 'absent' ? '' : prev.marks }));
                    }}
                    className={inputClass}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Remarks</label>
                <textarea
                  rows={3}
                  value={form.remarks}
                  onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
                  className={inputClass}
                  placeholder="Optional teacher feedback"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  <Save size={14} />
                  {saving ? 'Saving...' : editingResultId ? 'Update Result' : 'Create Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultManagement;
