import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Search,
  Calendar,
  User,
  Target,
  Package,
  FileText,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckSquare,
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const emptyForm = {
  classId: '',
  sectionId: '',
  subjectId: '',
  title: '',
  subject: '',
  date: '',
  learningObjectives: [''],
  materialsNeeded: [''],
  additionalNotes: '',
};

const emptyStatusForm = {
  date: '',
  status: 'pending',
  completionPercent: 0,
  isCompleted: false,
  remarks: '',
};

const statusTone = {
  completed: 'bg-green-100 text-green-700 border-green-200',
  in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
  pending: 'bg-gray-100 text-gray-700 border-gray-200',
};

const prettifyStatus = (value) => {
  if (value === 'in_progress') return 'In Progress';
  if (value === 'completed') return 'Completed';
  return 'Pending';
};

const LessonPlanDashboard = () => {
  const [lessonPlans, setLessonPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [completionEntries, setCompletionEntries] = useState([]);
  const [loadingCompletion, setLoadingCompletion] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingStatusId, setEditingStatusId] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusForm, setStatusForm] = useState(emptyStatusForm);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    };
  };

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE}/api/lesson-plans/teacher/my`, {
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.error || 'Failed to load lesson plans');
      const items = Array.isArray(data) ? data : [];
      setLessonPlans(items);
      setSelectedPlanId((prev) => {
        if (prev && items.some((item) => item._id === prev)) return prev;
        return items[0]?._id || '';
      });
    } catch (err) {
      setError(err.message || 'Failed to load lesson plans');
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async ({ classId = '', sectionId = '' } = {}) => {
    try {
      setLoadingOptions(true);
      const query = new URLSearchParams();
      if (classId) query.set('classId', classId);
      if (sectionId) query.set('sectionId', sectionId);
      const res = await fetch(`${API_BASE}/api/lesson-plans/teacher/options?${query.toString()}`, {
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to load options');
      setClasses(Array.isArray(data?.classes) ? data.classes : []);
      setSections(Array.isArray(data?.sections) ? data.sections : []);
      setSubjects(Array.isArray(data?.subjects) ? data.subjects : []);
    } catch (err) {
      setError(err.message || 'Failed to load options');
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadCompletionStatuses = async (planId) => {
    if (!planId) {
      setCompletionEntries([]);
      return;
    }
    try {
      setLoadingCompletion(true);
      const res = await fetch(`${API_BASE}/api/lesson-plans/teacher/${planId}/status`, {
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.error || 'Failed to load completion status');
      setCompletionEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load completion status');
      setCompletionEntries([]);
    } finally {
      setLoadingCompletion(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    loadCompletionStatuses(selectedPlanId);
  }, [selectedPlanId]);

  const filteredPlans = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return lessonPlans;
    return lessonPlans.filter((plan) => {
      return [plan.title, plan.subject, plan.className, plan.sectionName]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(q));
    });
  }, [lessonPlans, searchTerm]);

  const selectedPlan = useMemo(
    () => filteredPlans.find((plan) => plan._id === selectedPlanId) || filteredPlans[0] || null,
    [filteredPlans, selectedPlanId]
  );

  const updateArrayField = (field, index, value) => {
    setForm((prev) => {
      const next = [...prev[field]];
      next[index] = value;
      return { ...prev, [field]: next };
    });
  };

  const addArrayField = (field) => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayField = (field, index) => {
    setForm((prev) => {
      const next = prev[field].filter((_, idx) => idx !== index);
      return { ...prev, [field]: next.length ? next : [''] };
    });
  };

  const openCreateModal = async () => {
    setEditingPlanId('');
    setForm(emptyForm);
    setShowModal(true);
    await loadOptions();
  };

  const openEditModal = async (plan) => {
    const classId = String(plan?.classId || '');
    const sectionId = String(plan?.sectionId || '');
    const subjectId = String(plan?.subjectId || '');

    setEditingPlanId(String(plan?._id || ''));
    setForm({
      classId,
      sectionId,
      subjectId,
      title: plan?.title || '',
      subject: plan?.subject || '',
      date: plan?.date ? new Date(plan.date).toISOString().slice(0, 10) : '',
      learningObjectives:
        Array.isArray(plan?.learningObjectives) && plan.learningObjectives.length
          ? plan.learningObjectives
          : [''],
      materialsNeeded:
        Array.isArray(plan?.materialsNeeded) && plan.materialsNeeded.length
          ? plan.materialsNeeded
          : [''],
      additionalNotes: plan?.additionalNotes || '',
    });

    setShowModal(true);
    await loadOptions({ classId, sectionId });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlanId('');
    setForm(emptyForm);
  };

  const openCreateStatusModal = () => {
    setEditingStatusId('');
    setStatusForm({
      ...emptyStatusForm,
      date: selectedPlan?.date ? new Date(selectedPlan.date).toISOString().slice(0, 10) : '',
    });
    setShowStatusModal(true);
  };

  const openEditStatusModal = (entry) => {
    setEditingStatusId(String(entry?._id || ''));
    setStatusForm({
      date: entry?.date ? new Date(entry.date).toISOString().slice(0, 10) : '',
      status: entry?.status || 'pending',
      completionPercent: Number.isFinite(Number(entry?.completionPercent)) ? Number(entry.completionPercent) : 0,
      isCompleted: Boolean(entry?.isCompleted),
      remarks: entry?.remarks || '',
    });
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setEditingStatusId('');
    setStatusForm(emptyStatusForm);
  };

  const onClassChange = async (classId) => {
    setForm((prev) => ({
      ...prev,
      classId,
      sectionId: '',
      subjectId: '',
      subject: '',
    }));
    setSubjects([]);
    if (classId) {
      await loadOptions({ classId });
    } else {
      setSections([]);
    }
  };

  const onSectionChange = async (sectionId) => {
    const classId = form.classId;
    setForm((prev) => ({
      ...prev,
      sectionId,
      subjectId: '',
      subject: '',
    }));
    if (classId && sectionId) {
      await loadOptions({ classId, sectionId });
    } else {
      setSubjects([]);
    }
  };

  const onSubjectChange = (subjectId) => {
    if (!subjectId) {
      setForm((prev) => ({ ...prev, subjectId: '', subject: '' }));
      return;
    }
    const selected = subjects.find((item) => item.subjectId === subjectId);
    setForm((prev) => ({
      ...prev,
      subjectId,
      subject: selected?.subjectName || '',
    }));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');

      const payload = {
        classId: form.classId,
        sectionId: form.sectionId,
        subjectId: form.subjectId,
        title: form.title,
        subject: form.subject,
        date: form.date,
        learningObjectives: form.learningObjectives.map((v) => String(v || '').trim()).filter(Boolean),
        materialsNeeded: form.materialsNeeded.map((v) => String(v || '').trim()).filter(Boolean),
        additionalNotes: form.additionalNotes,
      };

      const isEdit = Boolean(editingPlanId);
      const endpoint = isEdit
        ? `${API_BASE}/api/lesson-plans/teacher/${editingPlanId}`
        : `${API_BASE}/api/lesson-plans/teacher`;

      const res = await fetch(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || (isEdit ? 'Failed to update lesson plan' : 'Failed to create lesson plan'));
      }

      closeModal();
      await loadPlans();
    } catch (err) {
      setError(err.message || (editingPlanId ? 'Failed to update lesson plan' : 'Failed to create lesson plan'));
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async (planId) => {
    if (!window.confirm('Delete this lesson plan?')) return;
    try {
      setError('');
      const res = await fetch(`${API_BASE}/api/lesson-plans/teacher/${planId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to delete lesson plan');
      await loadPlans();
    } catch (err) {
      setError(err.message || 'Failed to delete lesson plan');
    }
  };

  const submitStatusForm = async (e) => {
    e.preventDefault();
    if (!selectedPlan?._id) return;

    try {
      setSavingStatus(true);
      setError('');
      const payload = {
        date: statusForm.date,
        status: statusForm.status,
        completionPercent: Number(statusForm.completionPercent || 0),
        isCompleted: Boolean(statusForm.isCompleted),
        remarks: statusForm.remarks,
      };

      const isEdit = Boolean(editingStatusId);
      const endpoint = isEdit
        ? `${API_BASE}/api/lesson-plans/teacher/${selectedPlan._id}/status/${editingStatusId}`
        : `${API_BASE}/api/lesson-plans/teacher/${selectedPlan._id}/status`;

      const res = await fetch(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || (isEdit ? 'Failed to update status' : 'Failed to save status'));

      closeStatusModal();
      await loadCompletionStatuses(selectedPlan._id);
    } catch (err) {
      setError(err.message || (editingStatusId ? 'Failed to update status' : 'Failed to save status'));
    } finally {
      setSavingStatus(false);
    }
  };

  const deleteStatus = async (statusId) => {
    if (!selectedPlan?._id || !statusId) return;
    if (!window.confirm('Delete this completion status?')) return;
    try {
      setError('');
      const res = await fetch(`${API_BASE}/api/lesson-plans/teacher/${selectedPlan._id}/status/${statusId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to delete status');
      await loadCompletionStatuses(selectedPlan._id);
    } catch (err) {
      setError(err.message || 'Failed to delete status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Lesson Plans</h1>
              <p className="text-sm text-gray-500">Manage your own lesson plans</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search plans"
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Plan
            </button>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 text-sm text-gray-600">
            {loading ? 'Loading...' : `${filteredPlans.length} plan(s)`}
          </div>
          <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-100">
            {!loading && filteredPlans.length === 0 && (
              <div className="p-6 text-sm text-gray-500">No lesson plans yet.</div>
            )}
            {filteredPlans.map((plan) => (
              <button
                key={plan._id}
                onClick={() => setSelectedPlanId(plan._id)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                  selectedPlan?._id === plan._id ? 'bg-blue-50' : ''
                }`}
              >
                <p className="font-medium text-gray-900">{plan.title}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {plan.subject} • Class {plan.className} - {plan.sectionName}
                </p>
                <p className="text-xs text-gray-500 mt-1">{new Date(plan.date).toLocaleDateString()}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-6">
          {!selectedPlan ? (
            <p className="text-sm text-gray-500">Select a lesson plan to view details.</p>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedPlan.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {selectedPlan.teacherName}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedPlan.date).toLocaleDateString()}
                    </span>
                    <span>{selectedPlan.subject}</span>
                    <span>
                      Class {selectedPlan.className} - Section {selectedPlan.sectionName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(selectedPlan)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 text-sm"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => deletePlan(selectedPlan._id)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <h3 className="font-medium text-blue-800 flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4" />
                    Learning Objectives
                  </h3>
                  <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                    {(selectedPlan.learningObjectives || []).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                  <h3 className="font-medium text-emerald-800 flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4" />
                    Materials Needed
                  </h3>
                  <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                    {(selectedPlan.materialsNeeded || []).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                <h3 className="font-medium text-amber-800 flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" />
                  Additional Notes
                </h3>
                <p className="text-sm text-gray-700">{selectedPlan.additionalNotes || '—'}</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h3 className="font-medium text-slate-800 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
                    Syllabus Completion Status (Date-wise)
                  </h3>
                  <button
                    onClick={openCreateStatusModal}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Status
                  </button>
                </div>

                {loadingCompletion ? (
                  <p className="text-sm text-gray-500">Loading status...</p>
                ) : completionEntries.length === 0 ? (
                  <p className="text-sm text-gray-500">No completion status added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {completionEntries.map((entry) => {
                      const statusValue = entry?.status || 'pending';
                      const tone = statusTone[statusValue] || statusTone.pending;
                      return (
                        <div key={entry._id} className="rounded-lg border border-gray-200 bg-white p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <span className="font-medium">{new Date(entry.date).toLocaleDateString()}</span>
                              <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${tone}`}>
                                {prettifyStatus(statusValue)}
                              </span>
                              <span className="text-xs text-gray-500">{entry.completionPercent || 0}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditStatusModal(entry)}
                                className="px-2 py-1 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50 text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteStatus(entry._id)}
                                className="px-2 py-1 border border-red-200 text-red-700 rounded-md hover:bg-red-50 text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          {entry.remarks ? <p className="mt-1 text-xs text-gray-600">{entry.remarks}</p> : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingPlanId ? 'Edit Lesson Plan' : 'Create Lesson Plan'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={submitForm} className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                  <select
                    value={form.classId}
                    onChange={(e) => onClassChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                  <select
                    value={form.sectionId}
                    onChange={(e) => onSectionChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                    disabled={!form.classId}
                  >
                    <option value="">Select Section</option>
                    {sections.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allocated Subject *</label>
                  <select
                    value={form.subjectId}
                    onChange={(e) => onSubjectChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                    disabled={!form.sectionId || loadingOptions}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((item) => (
                      <option key={item.subjectId} value={item.subjectId}>
                        {item.subjectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Learning Objectives *</label>
                <div className="space-y-2">
                  {form.learningObjectives.map((item, idx) => (
                    <div key={`obj-${idx}`} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateArrayField('learningObjectives', idx, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField('learningObjectives', idx)}
                        className="px-3 border rounded-lg"
                      >
                        -
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addArrayField('learningObjectives')}
                  className="mt-2 text-sm text-blue-600"
                >
                  + Add Objective
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Materials Needed *</label>
                <div className="space-y-2">
                  {form.materialsNeeded.map((item, idx) => (
                    <div key={`mat-${idx}`} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateArrayField('materialsNeeded', idx, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField('materialsNeeded', idx)}
                        className="px-3 border rounded-lg"
                      >
                        -
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addArrayField('materialsNeeded')}
                  className="mt-2 text-sm text-blue-600"
                >
                  + Add Material
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  value={form.additionalNotes}
                  onChange={(e) => setForm((prev) => ({ ...prev, additionalNotes: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || loadingOptions}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingPlanId ? 'Update Lesson Plan' : 'Create Lesson Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStatusModal && selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingStatusId ? 'Edit Completion Status' : 'Add Completion Status'}
              </h2>
              <button onClick={closeStatusModal} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={submitStatusForm} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={statusForm.date}
                    onChange={(e) => setStatusForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    value={statusForm.status}
                    onChange={(e) => setStatusForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Completion %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={statusForm.completionPercent}
                    onChange={(e) => {
                      const value = Math.max(0, Math.min(100, Number(e.target.value || 0)));
                      setStatusForm((prev) => ({ ...prev, completionPercent: value }));
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={statusForm.isCompleted}
                      onChange={(e) =>
                        setStatusForm((prev) => ({
                          ...prev,
                          isCompleted: e.target.checked,
                          status: e.target.checked ? 'completed' : prev.status,
                          completionPercent: e.target.checked ? 100 : prev.completionPercent,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Mark as completed
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={statusForm.remarks}
                  onChange={(e) => setStatusForm((prev) => ({ ...prev, remarks: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeStatusModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingStatus ? 'Saving...' : editingStatusId ? 'Update Status' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPlanDashboard;
