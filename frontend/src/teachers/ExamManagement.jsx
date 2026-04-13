import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, Edit2, MapPin, Plus, Save, Search, Trash2, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const TERM_OPTIONS = ['Class Test', 'Unit Test', 'Monthly Test', 'Term 1', 'Term 2', 'Term 3', 'Half Yearly', 'Annual', 'Final'];
const STATUS_OPTIONS = ['scheduled', 'ongoing', 'completed', 'cancelled'];

const EMPTY_FORM = {
  title: '',
  term: 'Term 1',
  instructor: '',
  venue: '',
  date: '',
  time: '',
  duration: '',
  marks: '',
  noOfStudents: '',
  status: 'scheduled',
  classId: '',
  sectionId: '',
  subjectId: '',
  published: false,
};

const formatDate = (value) => {
  if (!value) return 'TBA';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

const normalizeExamStatus = (exam) => {
  const explicitStatus = String(exam?.status || '').trim().toLowerCase();
  if (explicitStatus) return explicitStatus;

  if (!exam?.date) return 'scheduled';
  const when = new Date(exam.date);
  if (Number.isNaN(when.getTime())) return 'scheduled';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  when.setHours(0, 0, 0, 0);

  if (when.getTime() < today.getTime()) return 'completed';
  if (when.getTime() === today.getTime()) return 'ongoing';
  return 'scheduled';
};

const statusBadgeClass = (status) => {
  const value = String(status || '').toLowerCase();
  if (value === 'completed') return 'bg-emerald-100 text-emerald-700';
  if (value === 'ongoing') return 'bg-blue-100 text-blue-700';
  if (value === 'cancelled') return 'bg-red-100 text-red-700';
  return 'bg-amber-100 text-amber-700';
};

const ExamManagement = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exams, setExams] = useState([]);
  const [invigilationRoutine, setInvigilationRoutine] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

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

  const loadExams = useCallback(async () => {
    if (!token) {
      setError('Login required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [examData, allocationData, routineData] = await Promise.all([
        apiFetch('/api/exam/teacher/manage'),
        apiFetch('/api/teacher/dashboard/allocations'),
        apiFetch('/api/exam/teacher/routine'),
      ]);
      setExams(Array.isArray(examData) ? examData : []);
      setAllocations(Array.isArray(allocationData) ? allocationData : []);
      setInvigilationRoutine(Array.isArray(routineData) ? routineData : []);
    } catch (err) {
      setError(err.message || 'Failed to load exams');
      setExams([]);
      setAllocations([]);
      setInvigilationRoutine([]);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, token]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const classOptions = useMemo(() => {
    const map = new Map();
    exams.forEach((exam) => {
      const classId = exam?.classId?._id;
      const className = exam?.classId?.name || exam?.grade;
      if (!classId || !className || map.has(classId)) return;
      map.set(classId, { _id: classId, name: className });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [exams]);

  const sectionOptions = useMemo(() => {
    const map = new Map();
    exams.forEach((exam) => {
      const classId = exam?.classId?._id;
      const sectionId = exam?.sectionId?._id;
      const sectionName = exam?.sectionId?.name || exam?.section;
      if (!sectionId || !sectionName) return;
      if (classFilter && String(classId) !== String(classFilter)) return;
      if (!map.has(sectionId)) map.set(sectionId, { _id: sectionId, name: sectionName });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [classFilter, exams]);

  const formClassOptions = useMemo(() => {
    const map = new Map();
    allocations.forEach((item) => {
      const classId = item?.classId?._id;
      const className = item?.classId?.name;
      if (!classId || !className || map.has(classId)) return;
      map.set(classId, { _id: classId, name: className });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [allocations]);

  const formSectionOptions = useMemo(() => {
    const map = new Map();
    allocations.forEach((item) => {
      const classId = item?.classId?._id;
      const sectionId = item?.sectionId?._id;
      const sectionName = item?.sectionId?.name;
      if (!classId || !sectionId || !sectionName) return;
      if (form.classId && String(classId) !== String(form.classId)) return;
      if (!map.has(sectionId)) map.set(sectionId, { _id: sectionId, name: sectionName });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [allocations, form.classId]);

  const formSubjectOptions = useMemo(() => {
    const map = new Map();
    allocations.forEach((item) => {
      const classId = item?.classId?._id;
      const sectionId = item?.sectionId?._id;
      const subjectId = item?.subjectId?._id;
      const subjectName = item?.subjectId?.name;
      if (!classId || !sectionId || !subjectId || !subjectName) return;
      if (form.classId && String(classId) !== String(form.classId)) return;
      if (form.sectionId && String(sectionId) !== String(form.sectionId)) return;
      if (!map.has(subjectId)) map.set(subjectId, { _id: subjectId, name: subjectName });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [allocations, form.classId, form.sectionId]);

  const visibleExams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return exams.filter((exam) => {
      const className = exam?.classId?.name || exam?.grade || '';
      const sectionName = exam?.sectionId?.name || exam?.section || '';
      const classId = exam?.classId?._id || '';
      const sectionId = exam?.sectionId?._id || '';
      const status = normalizeExamStatus(exam);

      const matchesClass = classFilter ? String(classId) === String(classFilter) : true;
      const matchesSection = sectionFilter ? String(sectionId) === String(sectionFilter) : true;
      const matchesStatus = statusFilter ? status === statusFilter : true;

      const text = [exam?.title, exam?.subject, exam?.term, className, sectionName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = query ? text.includes(query) : true;

      return matchesClass && matchesSection && matchesStatus && matchesSearch;
    });
  }, [classFilter, exams, search, sectionFilter, statusFilter]);

  const summary = useMemo(() => {
    const total = visibleExams.length;
    const published = visibleExams.filter((exam) => Boolean(exam.published)).length;
    const completed = visibleExams.filter((exam) => normalizeExamStatus(exam) === 'completed').length;
    const upcoming = visibleExams.filter((exam) => normalizeExamStatus(exam) === 'scheduled').length;
    return { total, published, completed, upcoming };
  }, [visibleExams]);

  const inputClass =
    'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20';

  const openCreate = () => {
    setEditingExamId(null);
    setForm({
      ...EMPTY_FORM,
      classId: formClassOptions[0]?._id || '',
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const openEdit = (exam) => {
    setEditingExamId(exam?._id || null);
    setForm({
      title: exam?.title || '',
      term: exam?.term || 'Term 1',
      instructor: exam?.instructor || '',
      venue: exam?.venue || '',
      date: exam?.date || '',
      time: exam?.time || '',
      duration: exam?.duration ?? '',
      marks: exam?.marks ?? '',
      noOfStudents: exam?.noOfStudents ?? '',
      status: exam?.status || 'scheduled',
      classId: exam?.classId?._id || '',
      sectionId: exam?.sectionId?._id || '',
      subjectId: exam?.subjectId?._id || '',
      published: !!exam?.published,
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
    if (!form.title.trim()) {
      setError('Exam title is required');
      return;
    }
    if (!form.classId || !form.sectionId || !form.subjectId) {
      setError('Class, section and subject are required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        title: form.title.trim(),
        term: form.term,
        instructor: form.instructor.trim(),
        venue: form.venue.trim(),
        date: form.date,
        time: form.time,
        duration: form.duration === '' ? undefined : Number(form.duration),
        marks: form.marks === '' ? undefined : Number(form.marks),
        noOfStudents: form.noOfStudents === '' ? undefined : Number(form.noOfStudents),
        status: form.status,
        classId: form.classId,
        sectionId: form.sectionId,
        subjectId: form.subjectId,
        published: !!form.published,
      };

      if (editingExamId) {
        await apiFetch(`/api/exam/teacher/${editingExamId}`, { method: 'PUT', body: JSON.stringify(payload) });
        setSuccess('Exam updated successfully');
      } else {
        await apiFetch('/api/exam/teacher/add', { method: 'POST', body: JSON.stringify(payload) });
        setSuccess('Exam created successfully');
      }

      closeForm();
      await loadExams();
    } catch (err) {
      setError(err.message || 'Failed to save exam');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (exam) => {
    if (!window.confirm(`Delete exam "${exam?.title || 'this exam'}"? Linked results will also be deleted.`)) return;
    try {
      setError('');
      setSuccess('');
      await apiFetch(`/api/exam/teacher/${exam._id}`, { method: 'DELETE' });
      setSuccess('Exam deleted successfully');
      await loadExams();
    } catch (err) {
      setError(err.message || 'Failed to delete exam');
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 shadow-lg text-white">
        <div className="absolute top-0 right-0 h-56 w-56 -translate-y-1/3 translate-x-1/4 rounded-full bg-indigo-400/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-44 w-44 translate-y-1/3 -translate-x-1/4 rounded-full bg-cyan-500/10 blur-2xl" />
        <div className="relative">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Exam Management</h1>
          <p className="mt-1 text-sm text-slate-300">
            View exam schedules and publication status by class and section
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total Exams</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{summary.total}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs text-emerald-700">Published</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{summary.published}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs text-amber-700">Upcoming</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{summary.upcoming}</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
          <p className="text-xs text-blue-700">Completed</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{summary.completed}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">My Exam Invigilation Routine</h2>
            <p className="text-xs text-gray-500">Assigned by admin when exam room and invigilator are set.</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            {invigilationRoutine.length} assigned
          </span>
        </div>
        {loading ? (
          <p className="text-sm text-gray-500">Loading routine...</p>
        ) : invigilationRoutine.length === 0 ? (
          <p className="text-sm text-gray-500">No invigilation duty assigned yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {invigilationRoutine.map((exam) => {
              const className = exam?.classId?.name || exam?.grade || '-';
              const sectionName = exam?.sectionId?.name || exam?.section || '-';
              const subjectName = exam?.subjectId?.name || exam?.subject || '-';
              const roomText =
                exam?.roomId?.floorId?.buildingId?.name && exam?.roomId?.roomNumber
                  ? `${exam.roomId.floorId.buildingId.name} / ${exam.roomId.floorId.name || 'Floor'} / ${exam.roomId.roomNumber}`
                  : (exam?.venue || exam?.roomId?.roomNumber || 'Room TBA');

              return (
                <div key={exam._id} className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
                  <p className="text-sm font-semibold text-gray-900">{exam?.title || 'Exam'} • {subjectName}</p>
                  <p className="mt-1 text-xs text-gray-600">{className} - {sectionName}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                    <CalendarDays size={12} className="text-gray-500" />
                    {formatDate(exam?.date)} {exam?.time ? `• ${exam.time}` : ''}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                    <MapPin size={12} className="text-gray-500" />
                    {roomText}
                  </p>
                  {exam?.instructor && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                      <User size={12} className="text-gray-500" />
                      {exam.instructor}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setSectionFilter('');
            }}
            className={`${inputClass} max-w-[220px]`}
          >
            <option value="">All Classes</option>
            {classOptions.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>

          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className={`${inputClass} max-w-[180px]`}
          >
            <option value="">All Sections</option>
            {sectionOptions.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${inputClass} max-w-[180px]`}
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="relative min-w-[240px] flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exam, subject, term"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus size={14} />
            Add Exam
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading exam data...</div>
        ) : visibleExams.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No exams found for selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Exam</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Class/Section</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Max Marks</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Publish</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleExams.map((exam) => {
                  const className = exam?.classId?.name || exam?.grade || '-';
                  const sectionName = exam?.sectionId?.name || exam?.section || '-';
                  const normalizedStatus = normalizeExamStatus(exam);

                  return (
                    <tr key={exam._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{exam?.title || 'Exam'}</div>
                        <div className="text-xs text-gray-500">
                          {exam?.subject || '-'} {exam?.term ? `• ${exam.term}` : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {className} - {sectionName}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-gray-800">
                          <CalendarDays size={14} className="text-gray-500" />
                          <span>{formatDate(exam?.date)}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock3 size={12} />
                          <span>{exam?.time || 'Time not set'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {Number.isFinite(Number(exam?.marks)) ? Number(exam.marks) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusBadgeClass(
                            normalizedStatus
                          )}`}
                        >
                          {normalizedStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            exam?.published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {exam?.published ? <CheckCircle2 size={12} /> : null}
                          {exam?.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/teacher/result-management?examId=${exam._id}`)}
                            className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                          >
                            Results
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(exam)}
                            className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(exam)}
                            className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h2 className="text-base font-semibold text-gray-900">{editingExamId ? 'Edit Exam' : 'Add Exam'}</h2>
              <button type="button" onClick={closeForm} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Title</label>
                  <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className={inputClass} required />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Term</label>
                  <select value={form.term} onChange={(e) => setForm((prev) => ({ ...prev, term: e.target.value }))} className={inputClass}>
                    {TERM_OPTIONS.map((term) => <option key={term} value={term}>{term}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Class</label>
                  <select value={form.classId} onChange={(e) => setForm((prev) => ({ ...prev, classId: e.target.value, sectionId: '', subjectId: '' }))} className={inputClass} required>
                    <option value="">Select class</option>
                    {formClassOptions.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Section</label>
                  <select value={form.sectionId} onChange={(e) => setForm((prev) => ({ ...prev, sectionId: e.target.value, subjectId: '' }))} className={inputClass} required>
                    <option value="">Select section</option>
                    {formSectionOptions.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Subject</label>
                  <select value={form.subjectId} onChange={(e) => setForm((prev) => ({ ...prev, subjectId: e.target.value }))} className={inputClass} required>
                    <option value="">Select subject</option>
                    {formSubjectOptions.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Date</label><input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} className={inputClass} /></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Time</label><input type="time" value={form.time} onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))} className={inputClass} /></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Duration</label><input type="number" min="0" value={form.duration} onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))} className={inputClass} /></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Marks</label><input type="number" min="0" value={form.marks} onChange={(e) => setForm((prev) => ({ ...prev, marks: e.target.value }))} className={inputClass} /></div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Students</label><input type="number" min="0" value={form.noOfStudents} onChange={(e) => setForm((prev) => ({ ...prev, noOfStudents: e.target.value }))} className={inputClass} /></div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Status</label>
                  <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className={inputClass}>
                    {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Instructor</label><input value={form.instructor} onChange={(e) => setForm((prev) => ({ ...prev, instructor: e.target.value }))} className={inputClass} /></div>
                <div><label className="mb-1 block text-xs font-medium text-gray-600">Venue</label><input value={form.venue} onChange={(e) => setForm((prev) => ({ ...prev, venue: e.target.value }))} className={inputClass} /></div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
                Publish immediately
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeForm} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                  <Save size={14} />
                  {saving ? 'Saving...' : editingExamId ? 'Update Exam' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManagement;
