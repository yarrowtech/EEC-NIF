import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Plus, Trash2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '';

const SubjectManagement = ({ setShowAdminHeader }) => {
  const [loading, setLoading] = useState(false);

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeClassId, setActiveClassId] = useState('all');

  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', classId: '' });
  const [editingSubjectId, setEditingSubjectId] = useState(null);

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
      const [classData, subjectData] = await Promise.all([
        apiRequest('/api/academic/classes'),
        apiRequest('/api/academic/subjects'),
      ]);
      setClasses(Array.isArray(classData) ? classData : []);
      setSubjects(Array.isArray(subjectData) ? subjectData : []);
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

  const classTabs = useMemo(() => {
    const tabs = [{ id: 'all', name: 'All Classes' }];
    classes.forEach((cls) => tabs.push({ id: String(cls._id), name: cls.name }));
    return tabs;
  }, [classes]);

  const filteredSubjects = useMemo(() => {
    if (activeClassId === 'all') return subjects;
    return subjects.filter((subject) => String(subject.classId) === String(activeClassId));
  }, [subjects, activeClassId]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Subject Management</h1>
              <p className="mt-1 text-sm text-slate-500">
                Campus-wise subject setup by class.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="rounded-lg bg-slate-100 px-4 py-2">Subjects: {subjects.length}</div>
            </div>
          </div>
        </div>

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
            <div className="mb-4 flex flex-wrap gap-2">
              {classTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveClassId(tab.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    activeClassId === tab.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredSubjects.map((subject) => (
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
              {filteredSubjects.length === 0 && !loading && (
                <p className="text-sm text-slate-500">No subjects found for this class.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectManagement;
