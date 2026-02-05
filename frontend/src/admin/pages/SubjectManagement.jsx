import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Plus, Trash2, Pencil, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '';

const SubjectManagement = ({ setShowAdminHeader }) => {
  const [activeTab, setActiveTab] = useState('subjects');
  const [loading, setLoading] = useState(false);

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [allocations, setAllocations] = useState([]);

  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', classId: '' });
  const [editingSubjectId, setEditingSubjectId] = useState(null);

  const [allocationForm, setAllocationForm] = useState({
    teacherId: '',
    subjectId: '',
    classId: '',
    sectionId: '',
    isClassTeacher: false,
    notes: '',
  });
  const [editingAllocationId, setEditingAllocationId] = useState(null);

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      authorization: token ? `Bearer ${token}` : '',
    };
  }, []);

  const apiRequest = async (path, options = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: authHeaders,
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error || 'Request failed');
    }
    return data;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [classData, sectionData, subjectData, teacherData, allocationData] = await Promise.all([
        apiRequest('/api/academic/classes'),
        apiRequest('/api/academic/sections'),
        apiRequest('/api/academic/subjects'),
        apiRequest('/api/admin/users/get-teachers'),
        apiRequest('/api/teacher-allocations'),
      ]);
      setClasses(Array.isArray(classData) ? classData : []);
      setSections(Array.isArray(sectionData) ? sectionData : []);
      setSubjects(Array.isArray(subjectData) ? subjectData : []);
      setTeachers(Array.isArray(teacherData) ? teacherData : []);
      setAllocations(Array.isArray(allocationData) ? allocationData : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setShowAdminHeader?.(false);
    loadData();
  }, [setShowAdminHeader]);

  const sectionOptions = useMemo(
    () => sections.filter((section) => section.classId === allocationForm.classId),
    [sections, allocationForm.classId]
  );

  const subjectOptions = useMemo(
    () =>
      subjects.filter(
        (subject) => !subject.classId || String(subject.classId) === String(allocationForm.classId)
      ),
    [subjects, allocationForm.classId]
  );

  const getNameById = (list, id) => list.find((item) => String(item._id) === String(id))?.name || '-';

  const resetSubjectForm = () => {
    setSubjectForm({ name: '', code: '', classId: '' });
    setEditingSubjectId(null);
  };

  const submitSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) {
      toast.error('Subject name is required');
      return;
    }
    try {
      const method = editingSubjectId ? 'PUT' : 'POST';
      const endpoint = editingSubjectId
        ? `/api/academic/subjects/${editingSubjectId}`
        : '/api/academic/subjects';
      await apiRequest(endpoint, {
        method,
        body: JSON.stringify({
          name: subjectForm.name.trim(),
          code: subjectForm.code.trim(),
          classId: subjectForm.classId || undefined,
        }),
      });
      toast.success(editingSubjectId ? 'Subject updated' : 'Subject added');
      resetSubjectForm();
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Unable to save subject');
    }
  };

  const startEditSubject = (subject) => {
    setEditingSubjectId(subject._id);
    setSubjectForm({
      name: subject.name || '',
      code: subject.code || '',
      classId: subject.classId || '',
    });
  };

  const deleteSubject = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await apiRequest(`/api/academic/subjects/${id}`, { method: 'DELETE' });
      toast.success('Subject deleted');
      if (editingSubjectId === id) resetSubjectForm();
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Unable to delete subject');
    }
  };

  const resetAllocationForm = () => {
    setAllocationForm({
      teacherId: '',
      subjectId: '',
      classId: '',
      sectionId: '',
      isClassTeacher: false,
      notes: '',
    });
    setEditingAllocationId(null);
  };

  const submitAllocation = async (e) => {
    e.preventDefault();
    const { teacherId, subjectId, classId, sectionId } = allocationForm;
    if (!teacherId || !subjectId || !classId || !sectionId) {
      toast.error('Teacher, subject, class and section are required');
      return;
    }
    try {
      const method = editingAllocationId ? 'PUT' : 'POST';
      const endpoint = editingAllocationId
        ? `/api/teacher-allocations/${editingAllocationId}`
        : '/api/teacher-allocations';
      await apiRequest(endpoint, {
        method,
        body: JSON.stringify({
          ...allocationForm,
        }),
      });
      toast.success(editingAllocationId ? 'Allocation updated' : 'Teacher allocated');
      resetAllocationForm();
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Unable to save allocation');
    }
  };

  const startEditAllocation = (allocation) => {
    setEditingAllocationId(allocation._id);
    setAllocationForm({
      teacherId: allocation.teacherId?._id || allocation.teacherId || '',
      subjectId: allocation.subjectId?._id || allocation.subjectId || '',
      classId: allocation.classId?._id || allocation.classId || '',
      sectionId: allocation.sectionId?._id || allocation.sectionId || '',
      isClassTeacher: Boolean(allocation.isClassTeacher),
      notes: allocation.notes || '',
    });
  };

  const deleteAllocation = async (id) => {
    if (!window.confirm('Delete this teacher allocation?')) return;
    try {
      await apiRequest(`/api/teacher-allocations/${id}`, { method: 'DELETE' });
      toast.success('Allocation deleted');
      if (editingAllocationId === id) resetAllocationForm();
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Unable to delete allocation');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Subject & Teacher Allocation</h1>
              <p className="mt-1 text-sm text-slate-500">
                Campus-wise subject setup and teacher mapping to class/section.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-100 px-4 py-2">Subjects: {subjects.length}</div>
              <div className="rounded-lg bg-slate-100 px-4 py-2">Allocations: {allocations.length}</div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeTab === 'subjects' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
              onClick={() => setActiveTab('subjects')}
            >
              <BookOpen className="mr-2 inline h-4 w-4" />
              Subject Management
            </button>
            <button
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeTab === 'allocations' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
              onClick={() => setActiveTab('allocations')}
            >
              <Link2 className="mr-2 inline h-4 w-4" />
              Teacher Allocation
            </button>
          </div>
        </div>

        {activeTab === 'subjects' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <form onSubmit={submitSubject} className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                {editingSubjectId ? 'Edit Subject' : 'Add Subject'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600">Subject Name</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Subject Code</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm((p) => ({ ...p, code: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Class (optional)</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={subjectForm.classId}
                    onChange={(e) => setSubjectForm((p) => ({ ...p, classId: e.target.value }))}
                  >
                    <option value="">All Classes</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
                    <Plus className="mr-2 inline h-4 w-4" />
                    {editingSubjectId ? 'Update' : 'Add'}
                  </button>
                  {editingSubjectId && (
                    <button
                      type="button"
                      onClick={resetSubjectForm}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Subjects</h2>
              <div className="space-y-3">
                {subjects.map((subject) => (
                  <div
                    key={subject._id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{subject.name}</p>
                      <p className="text-xs text-slate-500">
                        Code: {subject.code || '-'} | Class:{' '}
                        {subject.classId ? getNameById(classes, subject.classId) : 'All'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEditSubject(subject)}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSubject(subject._id)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {subjects.length === 0 && !loading && (
                  <p className="text-sm text-slate-500">No subjects found for this campus.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'allocations' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <form onSubmit={submitAllocation} className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                {editingAllocationId ? 'Edit Allocation' : 'Allocate Teacher'}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm text-slate-600">Teacher</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={allocationForm.teacherId}
                    onChange={(e) => setAllocationForm((p) => ({ ...p, teacherId: e.target.value }))}
                    required
                  >
                    <option value="">Select teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name} ({teacher.employeeCode || teacher.username || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Class</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={allocationForm.classId}
                    onChange={(e) =>
                      setAllocationForm((p) => ({
                        ...p,
                        classId: e.target.value,
                        sectionId: '',
                        subjectId: '',
                      }))
                    }
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
                  <label className="text-sm text-slate-600">Section</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={allocationForm.sectionId}
                    onChange={(e) => setAllocationForm((p) => ({ ...p, sectionId: e.target.value }))}
                    required
                  >
                    <option value="">Select section</option>
                    {sectionOptions.map((section) => (
                      <option key={section._id} value={section._id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Subject</label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={allocationForm.subjectId}
                    onChange={(e) => setAllocationForm((p) => ({ ...p, subjectId: e.target.value }))}
                    required
                  >
                    <option value="">Select subject</option>
                    {subjectOptions.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name} {subject.code ? `(${subject.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={allocationForm.isClassTeacher}
                    onChange={(e) =>
                      setAllocationForm((p) => ({ ...p, isClassTeacher: e.target.checked }))
                    }
                  />
                  Class teacher for this section
                </label>
                <div>
                  <label className="text-sm text-slate-600">Notes</label>
                  <textarea
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    rows={2}
                    value={allocationForm.notes}
                    onChange={(e) => setAllocationForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
                    {editingAllocationId ? 'Update Allocation' : 'Allocate'}
                  </button>
                  {editingAllocationId && (
                    <button
                      type="button"
                      onClick={resetAllocationForm}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Current Allocations</h2>
              <div className="space-y-3">
                {allocations.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {item.teacherId?.name || '-'} {'->'} {item.subjectId?.name || '-'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Class {item.classId?.name || '-'} | Section {item.sectionId?.name || '-'}
                        {item.isClassTeacher ? ' | Class Teacher' : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEditAllocation(item)}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAllocation(item._id)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {allocations.length === 0 && !loading && (
                  <p className="text-sm text-slate-500">No teacher allocations found for this campus.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectManagement;
