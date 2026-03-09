import React, { useEffect, useMemo, useState } from 'react';
import { Edit2, Plus, Search, Trash2, X } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const TERM_OPTIONS = ['Class Test', 'Unit Test', 'Monthly Test', 'Term 1', 'Term 2', 'Term 3', 'Half Yearly', 'Annual', 'Final'];

const EMPTY_FORM = {
  title: '',
  classId: '',
  sectionId: '',
  subjectId: '',
  term: 'Term 1',
  date: '',
  time: '',
  duration: '',
  marks: '100',
  instructor: '',
  venue: '',
  status: 'Scheduled',
};

const ExaminationManagement = ({ setShowAdminHeader }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [termFilter, setTermFilter] = useState('all');
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setShowAdminHeader?.(true);
  }, [setShowAdminHeader]);

  const loadExams = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/exam/fetch`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load exams');
      }
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load exams');
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAcademicOptions = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      };
      const [classesRes, sectionsRes, subjectsRes] = await Promise.all([
        fetch(`${API_BASE}/api/academic/classes`, { headers }),
        fetch(`${API_BASE}/api/academic/sections`, { headers }),
        fetch(`${API_BASE}/api/academic/subjects`, { headers }),
      ]);

      const classesData = await classesRes.json().catch(() => []);
      const sectionsData = await sectionsRes.json().catch(() => []);
      const subjectsData = await subjectsRes.json().catch(() => []);

      setClasses(Array.isArray(classesData) ? classesData : []);
      setSections(Array.isArray(sectionsData) ? sectionsData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
    } catch {
      setClasses([]);
      setSections([]);
      setSubjects([]);
    }
  };

  useEffect(() => {
    loadExams();
    loadAcademicOptions();
  }, []);

  const filteredExams = useMemo(() => {
    const q = search.trim().toLowerCase();
    return exams.filter((exam) => {
      const matchesTerm = termFilter === 'all' ? true : exam.term === termFilter;
      const matchesSearch = q
        ? String(exam.title || '').toLowerCase().includes(q) ||
          String(exam.subject || '').toLowerCase().includes(q) ||
          String(exam.grade || '').toLowerCase().includes(q)
        : true;
      return matchesTerm && matchesSearch;
    });
  }, [exams, search, termFilter]);

  const openCreate = () => {
    setEditingExamId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const openEdit = (exam) => {
    setEditingExamId(exam._id);
      setForm({
        title: exam.title || '',
        classId: exam.classId?._id || exam.classId || '',
        sectionId: exam.sectionId?._id || exam.sectionId || '',
        subjectId: exam.subjectId?._id || exam.subjectId || '',
        term: exam.term || 'Term 1',
        date: exam.date ? String(exam.date).slice(0, 10) : '',
        time: exam.time || '',
      duration: exam.duration ?? '',
        marks: exam.marks ?? '100',
        instructor: exam.instructor || '',
        venue: exam.venue || '',
        status: exam.status || 'Scheduled',
      });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingExamId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...form,
        duration: form.duration === '' ? undefined : Number(form.duration),
        marks: form.marks === '' ? undefined : Number(form.marks),
      };

      if (!payload.title?.trim()) throw new Error('Exam title is required');
      if (!payload.classId) throw new Error('Class is required');
      if (!payload.sectionId) throw new Error('Section is required');
      if (!payload.subjectId) throw new Error('Subject is required');

      const endpoint = editingExamId ? `${API_BASE}/api/exam/${editingExamId}` : `${API_BASE}/api/exam/add`;
      const method = editingExamId ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to save exam');
      }

      setSuccess(editingExamId ? 'Exam updated successfully' : 'Exam created successfully');
      closeForm();
      await loadExams();
    } catch (err) {
      setError(err.message || 'Failed to save exam');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (exam) => {
    const confirmed = window.confirm(`Delete exam "${exam.title}"? Related results will also be removed.`);
    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');
      const res = await fetch(`${API_BASE}/api/exam/${exam._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to delete exam');
      setSuccess('Exam deleted successfully');
      await loadExams();
    } catch (err) {
      setError(err.message || 'Failed to delete exam');
    }
  };

  const inputClass =
    'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

  const filteredSections = useMemo(
    () => sections.filter((section) => (form.classId ? String(section.classId) === String(form.classId) : true)),
    [sections, form.classId]
  );

  const filteredSubjects = useMemo(
    () => subjects.filter((subject) => (form.classId ? String(subject.classId || '') === String(form.classId) : true)),
    [subjects, form.classId]
  );

  return (
    <div className="space-y-5 p-2">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-5 text-white shadow-lg">
        <div className="absolute -top-6 -right-6 h-40 w-40 rounded-full bg-indigo-400/10 blur-2xl" />
        <h1 className="relative text-2xl font-bold tracking-tight">Exam Management</h1>
        <p className="relative mt-1 text-sm text-slate-300">Admin-only exam planning, scheduling, and CRUD</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exam, subject, class"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <select value={termFilter} onChange={(e) => setTermFilter(e.target.value)} className="max-w-[220px] rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
            <option value="all">All Terms</option>
            {TERM_OPTIONS.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus size={14} />
            Add Exam
          </button>
        </div>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div> : null}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading exams...</div>
        ) : filteredExams.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No exams found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Exam</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Term</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Marks</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{exam.title}</div>
                      <div className="text-xs text-gray-500">{exam.subjectId?.name || exam.subject || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{exam.term || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {exam.classId?.name || exam.grade || '-'} {exam.sectionId?.name || exam.section || ''}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {exam.date ? new Date(exam.date).toLocaleDateString() : '-'} {exam.time ? `| ${exam.time}` : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{exam.marks ?? '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => openEdit(exam)} className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button type="button" onClick={() => handleDelete(exam)} className="rounded-md p-1.5 text-red-600 hover:bg-red-50" title="Delete">
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

      {showForm ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h2 className="text-base font-semibold text-gray-900">{editingExamId ? 'Edit Exam' : 'Create Exam'}</h2>
              <button type="button" onClick={closeForm} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-3 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Exam Title</label>
                  <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className={inputClass} required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Term</label>
                  <select value={form.term} onChange={(e) => setForm((prev) => ({ ...prev, term: e.target.value }))} className={inputClass}>
                    {TERM_OPTIONS.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Class</label>
                  <select
                    value={form.classId}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, classId: e.target.value, sectionId: '', subjectId: '' }))
                    }
                    className={inputClass}
                    required
                  >
                    <option value="">Select class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Section</label>
                  <select
                    value={form.sectionId}
                    onChange={(e) => setForm((prev) => ({ ...prev, sectionId: e.target.value }))}
                    className={inputClass}
                    required
                  >
                    <option value="">Select section</option>
                    {filteredSections.map((sec) => (
                      <option key={sec._id} value={sec._id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Subject</label>
                  <select
                    value={form.subjectId}
                    onChange={(e) => setForm((prev) => ({ ...prev, subjectId: e.target.value }))}
                    className={inputClass}
                    required
                  >
                    <option value="">Select subject</option>
                    {filteredSubjects.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Time</label>
                  <input type="time" value={form.time} onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Duration (min)</label>
                  <input type="number" min="0" value={form.duration} onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Marks</label>
                  <input type="number" min="1" value={form.marks} onChange={(e) => setForm((prev) => ({ ...prev, marks: e.target.value }))} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Instructor</label>
                  <input value={form.instructor} onChange={(e) => setForm((prev) => ({ ...prev, instructor: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Venue</label>
                  <input value={form.venue} onChange={(e) => setForm((prev) => ({ ...prev, venue: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Status</label>
                  <input value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className={inputClass} placeholder="Scheduled" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeForm} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                  {saving ? 'Saving...' : editingExamId ? 'Update Exam' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ExaminationManagement;
