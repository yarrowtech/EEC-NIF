import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Trash2 } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const QUESTION_TYPES = [
  { value: 'mcq', label: 'Multiple Choice' },
  { value: 'blank', label: 'Fill in the Blank' },
];

const emptyOptions = ['', '', '', ''];

const PracticeQuestions = () => {
  const [allocations, setAllocations] = useState([]);
  const [selectedAllocationId, setSelectedAllocationId] = useState('');
  const [questionType, setQuestionType] = useState('mcq');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(emptyOptions);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loadingAllocations, setLoadingAllocations] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState('');

  const selectedAllocation = useMemo(
    () => allocations.find((item) => item._id === selectedAllocationId) || null,
    [allocations, selectedAllocationId]
  );

  const allocationLabel = (alloc) => {
    const className = alloc?.classId?.name || 'Class';
    const sectionName = alloc?.sectionId?.name || 'Section';
    const subjectName = alloc?.subjectId?.name || 'Subject';
    return `${className} - ${sectionName} • ${subjectName}`;
  };

  const resolveId = (value) => value?._id || value;

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  const loadAllocations = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      setError('Login required');
      return;
    }
    setLoadingAllocations(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/teacher/dashboard/allocations`, { headers });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || 'Unable to load allocations');
      }
      const data = await res.json();
      const items = Array.isArray(data) ? data : [];
      setAllocations(items);
    } catch (err) {
      console.error('Allocation load error:', err);
      setError(err.message || 'Failed to load allocations');
    } finally {
      setLoadingAllocations(false);
    }
  };

  const loadQuestions = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      setError('Login required');
      return;
    }
    setLoadingQuestions(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (selectedAllocation?.classId?._id) params.set('classId', selectedAllocation.classId._id);
      if (selectedAllocation?.sectionId?._id) params.set('sectionId', selectedAllocation.sectionId._id);
      if (selectedAllocation?.subjectId?._id) params.set('subjectId', selectedAllocation.subjectId._id);
      const query = params.toString();
      const res = await fetch(`${API_BASE}/api/practice/teacher/questions${query ? `?${query}` : ''}`, { headers });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || 'Unable to load questions');
      }
      const data = await res.json();
      setQuestions(Array.isArray(data?.questions) ? data.questions : []);
    } catch (err) {
      console.error('Questions load error:', err);
      setError(err.message || 'Failed to load questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const resetForm = () => {
    setQuestionText('');
    setOptions(emptyOptions);
    setCorrectAnswer('');
    setExplanation('');
    setEditingId('');
  };

  const handleSave = async () => {
    if (!selectedAllocation) {
      setError('Select an allocation first');
      return;
    }
    const headers = getAuthHeaders();
    if (!headers) {
      setError('Login required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        classId: selectedAllocation.classId?._id,
        sectionId: selectedAllocation.sectionId?._id,
        subjectId: selectedAllocation.subjectId?._id,
        type: questionType,
        question: questionText.trim(),
        options: questionType === 'mcq' ? options.map((o) => o.trim()) : [],
        correctAnswer: correctAnswer.trim(),
        explanation: explanation.trim(),
      };
      const res = await fetch(
        `${API_BASE}/api/practice/teacher/questions${editingId ? `/${editingId}` : ''}`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers,
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || 'Unable to save question');
      }
      resetForm();
      await loadQuestions();
    } catch (err) {
      console.error('Question save error:', err);
      setError(err.message || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const headers = getAuthHeaders();
    if (!headers) {
      setError('Login required');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/practice/teacher/questions/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || 'Unable to delete question');
      }
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error('Question delete error:', err);
      setError(err.message || 'Failed to delete question');
    }
  };

  useEffect(() => {
    loadAllocations();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [selectedAllocationId]);

  const startEdit = (q) => {
    setEditingId(q._id);
    setQuestionType(q.type);
    setQuestionText(q.question || '');
    setOptions(q.options && q.options.length ? [...q.options, '', '', '', ''].slice(0, 4) : emptyOptions);
    setCorrectAnswer(q.correctAnswer || '');
    setExplanation(q.explanation || '');
    if (q.classId && q.sectionId && q.subjectId) {
      const match = allocations.find(
        (alloc) =>
          String(alloc.classId?._id) === String(resolveId(q.classId)) &&
          String(alloc.sectionId?._id) === String(resolveId(q.sectionId)) &&
          String(alloc.subjectId?._id) === String(resolveId(q.subjectId))
      );
      if (match) setSelectedAllocationId(match._id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Practice Question Bank</h2>
            <p className="text-sm text-slate-500">Create practice questions for your assigned classes</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Assigned Class & Subject</label>
            <select
              value={selectedAllocationId}
              onChange={(e) => setSelectedAllocationId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              <option value="">All allocations (view only)</option>
              {loadingAllocations && <option>Loading...</option>}
              {!loadingAllocations && allocations.length === 0 && <option>No allocations found</option>}
              {!loadingAllocations &&
                allocations.map((alloc) => (
                  <option key={alloc._id} value={alloc._id}>
                    {allocationLabel(alloc)}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Question Type</label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              {QUESTION_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Question</label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={4}
              placeholder="Type the question..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>

          {questionType === 'mcq' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Options</label>
              {options.map((opt, idx) => (
                <input
                  key={idx}
                  value={opt}
                  onChange={(e) => {
                    const next = [...options];
                    next[idx] = e.target.value;
                    setOptions(next);
                  }}
                  placeholder={`Option ${idx + 1}`}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              ))}
              <div>
                <label className="text-xs font-medium text-slate-500">Correct Answer</label>
                <select
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  <option value="">Select correct option</option>
                  {options
                    .map((opt) => opt.trim())
                    .filter(Boolean)
                    .map((opt, idx) => (
                      <option key={`${opt}-${idx}`} value={opt}>
                        {opt}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {questionType === 'blank' && (
            <div>
              <label className="text-sm font-medium text-slate-700">Correct Answer</label>
              <input
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Exact answer"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700">Explanation (optional)</label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={3}
              placeholder="Explain why this is correct..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingId ? 'Update Question' : 'Save Question'}
            </button>
            <button
              onClick={resetForm}
              type="button"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
            >
              {editingId ? 'Cancel Edit' : 'Clear'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Saved Questions</h3>
              <p className="text-xs text-slate-500">
                {selectedAllocation ? allocationLabel(selectedAllocation) : 'Select an allocation'}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {loadingQuestions && (
              <div className="text-sm text-slate-500">Loading questions...</div>
            )}
            {!loadingQuestions && questions.length === 0 && (
              <div className="text-sm text-slate-500">No questions added yet.</div>
            )}
            {!loadingQuestions &&
              questions.map((q) => (
                <div key={q._id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{q.question}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {q.type === 'mcq' ? 'MCQ' : 'Fill in the blank'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {(q.classId?.name || 'Class')} - {(q.sectionId?.name || 'Section')} • {(q.subjectId?.name || 'Subject')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(q)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(q._id)}
                        className="rounded-lg p-1 text-red-500 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeQuestions;
