import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Plus, Search, Calendar, Target, Package, FileText, X } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const emptyForm = {
  classId: '',
  sectionId: '',
  teacherId: '',
  subjectId: '',
  title: '',
  subject: '',
  date: '',
  learningObjectives: [''],
  materialsNeeded: [''],
  additionalNotes: '',
};

const LessonPlanPage = ({ setShowAdminHeader }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    setShowAdminHeader?.(false);
  }, [setShowAdminHeader]);

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
      const res = await fetch(`${API_BASE}/api/lesson-plans/admin`, { headers: authHeaders() });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.error || 'Failed to load lesson plans');
      setPlans(Array.isArray(data) ? data : []);
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
      const res = await fetch(`${API_BASE}/api/lesson-plans/admin/options?${query.toString()}`, {
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to load options');
      setClasses(Array.isArray(data?.classes) ? data.classes : []);
      setSections(Array.isArray(data?.sections) ? data.sections : []);
      setAllocations(Array.isArray(data?.allocations) ? data.allocations : []);
    } catch (err) {
      setError(err.message || 'Failed to load form options');
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const filteredPlans = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return plans;
    return plans.filter((plan) => {
      return [plan.title, plan.subject, plan.className, plan.sectionName, plan.teacherName]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(q));
    });
  }, [plans, searchTerm]);

  const openCreateModal = () => {
    setEditingPlanId('');
    setForm(emptyForm);
    setSections([]);
    setAllocations([]);
    setShowModal(true);
    loadOptions();
  };

  const openEditModal = async (plan) => {
    const classId = String(plan?.classId || '');
    const sectionId = String(plan?.sectionId || '');
    const teacherId = String(plan?.teacherId || '');
    const subjectId = String(plan?.subjectId || '');

    setEditingPlanId(String(plan?._id || ''));
    setForm({
      classId,
      sectionId,
      teacherId,
      subjectId,
      title: plan?.title || '',
      subject: plan?.subject || '',
      date: plan?.date ? new Date(plan.date).toISOString().slice(0, 10) : '',
      learningObjectives: Array.isArray(plan?.learningObjectives) && plan.learningObjectives.length ? plan.learningObjectives : [''],
      materialsNeeded: Array.isArray(plan?.materialsNeeded) && plan.materialsNeeded.length ? plan.materialsNeeded : [''],
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

  const onClassChange = async (classId) => {
    setForm((prev) => ({
      ...prev,
      classId,
      sectionId: '',
      teacherId: '',
      subjectId: '',
      subject: '',
    }));
    setAllocations([]);
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
      teacherId: '',
      subjectId: '',
      subject: '',
    }));
    if (classId && sectionId) {
      await loadOptions({ classId, sectionId });
    } else {
      setAllocations([]);
    }
  };

  const onAllocationChange = (combo) => {
    if (!combo) {
      setForm((prev) => ({ ...prev, teacherId: '', subjectId: '', subject: '' }));
      return;
    }
    const [teacherId, subjectId] = combo.split('::');
    const selected = allocations.find((item) => item.teacherId === teacherId && item.subjectId === subjectId);
    setForm((prev) => ({
      ...prev,
      teacherId,
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
        ...form,
        learningObjectives: form.learningObjectives.map((v) => String(v || '').trim()).filter(Boolean),
        materialsNeeded: form.materialsNeeded.map((v) => String(v || '').trim()).filter(Boolean),
      };
      const isEdit = Boolean(editingPlanId);
      const endpoint = isEdit
        ? `${API_BASE}/api/lesson-plans/admin/${editingPlanId}`
        : `${API_BASE}/api/lesson-plans/admin`;
      const res = await fetch(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || (isEdit ? 'Failed to update lesson plan' : 'Failed to create lesson plan'));
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
      const res = await fetch(`${API_BASE}/api/lesson-plans/admin/${planId}`, {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-gradient-to-r from-red-400 to-red-500 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Lesson Plans</h1>
            <p className="text-red-100">Create class-section-teacher specific lesson plans</p>
          </div>
          <BookOpen className="w-12 h-12 text-red-200" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search lesson plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-blue-600 text-black px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Lesson Plan
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-sm text-gray-600">Loading lesson plans...</div>
        ) : filteredPlans.length === 0 ? (
          <div className="p-8 text-sm text-gray-600">No lesson plans found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPlans.map((plan) => (
              <div key={plan._id} className="p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {plan.subject} • Class {plan.className} - Section {plan.sectionName}
                    </p>
                    <p className="text-sm text-gray-600">Teacher: {plan.teacherName}</p>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(plan.date).toLocaleDateString()}
                    <button
                      onClick={() => openEditModal(plan)}
                      className="ml-2 px-3 py-1 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePlan(plan._id)}
                      className="px-3 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-700 font-medium mb-2"><Target className="w-4 h-4" />Objectives</div>
                    <ul className="list-disc ml-5 text-gray-700 space-y-1">
                      {(plan.learningObjectives || []).map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-emerald-700 font-medium mb-2"><Package className="w-4 h-4" />Materials</div>
                    <ul className="list-disc ml-5 text-gray-700 space-y-1">
                      {(plan.materialsNeeded || []).map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-amber-700 font-medium mb-2"><FileText className="w-4 h-4" />Additional Notes</div>
                    <p className="text-gray-700">{plan.additionalNotes || '—'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{editingPlanId ? 'Edit Lesson Plan' : 'Create Lesson Plan'}</h2>
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
                    {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
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
                    {sections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allocated Teacher (Subject) *</label>
                  <select
                    value={form.teacherId && form.subjectId ? `${form.teacherId}::${form.subjectId}` : ''}
                    onChange={(e) => onAllocationChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                    disabled={!form.sectionId || loadingOptions}
                  >
                    <option value="">Select Allocation</option>
                    {allocations.map((item) => (
                      <option key={`${item.teacherId}::${item.subjectId}`} value={`${item.teacherId}::${item.subjectId}`}>
                        {item.label}
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
                      <button type="button" onClick={() => removeArrayField('learningObjectives', idx)} className="px-3 border rounded-lg">-</button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => addArrayField('learningObjectives')} className="mt-2 text-sm text-blue-600">+ Add Objective</button>
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
                      <button type="button" onClick={() => removeArrayField('materialsNeeded', idx)} className="px-3 border rounded-lg">-</button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => addArrayField('materialsNeeded')} className="mt-2 text-sm text-blue-600">+ Add Material</button>
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
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700">Cancel</button>
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
    </div>
  );
};

export default LessonPlanPage;
