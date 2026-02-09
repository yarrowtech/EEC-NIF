import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const DEFAULT_FORM = {
  title: '',
  message: '',
  classId: '',
  sectionId: '',
  subjectId: '',
  typeLabel: '',
  priority: 'medium',
  category: 'academic',
};

const ClassNotes = () => {
  const [loading, setLoading] = useState(false);
  const [allocations, setAllocations] = useState([]);
  const [notes, setNotes] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [error, setError] = useState('');

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
    setError('');
    try {
      const [allocationData, noteData] = await Promise.all([
        apiRequest('/api/teacher/dashboard/allocations'),
        apiRequest('/api/notifications/teacher'),
      ]);
      setAllocations(Array.isArray(allocationData) ? allocationData : []);
      setNotes(Array.isArray(noteData) ? noteData : []);
    } catch (err) {
      setError(err.message || 'Failed to load class notes');
    } finally {
      setLoading(false);
    }
  };

  const classOptions = useMemo(() => {
    const map = new Map();
    allocations.forEach((a) => {
      const cls = a.classId;
      if (cls?._id) map.set(String(cls._id), cls.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allocations]);

  const sectionOptions = useMemo(() => {
    if (!form.classId) return [];
    const map = new Map();
    allocations.forEach((a) => {
      if (String(a.classId?._id) !== String(form.classId)) return;
      const sec = a.sectionId;
      if (sec?._id) map.set(String(sec._id), sec.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allocations, form.classId]);

  const subjectOptions = useMemo(() => {
    if (!form.classId || !form.sectionId) return [];
    const map = new Map();
    allocations.forEach((a) => {
      if (String(a.classId?._id) !== String(form.classId)) return;
      if (String(a.sectionId?._id) !== String(form.sectionId)) return;
      const subj = a.subjectId;
      if (subj?._id) map.set(String(subj._id), subj.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allocations, form.classId, form.sectionId]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!allocations.length) return;
    if (form.classId) return;
    if (classOptions.length === 1) {
      const onlyClass = classOptions[0];
      const onlySection = allocations
        .filter((a) => String(a.classId?._id) === String(onlyClass.id))
        .map((a) => a.sectionId)
        .filter(Boolean);
      const firstSection = onlySection[0];
      setForm((p) => ({
        ...p,
        classId: onlyClass.id,
        sectionId: firstSection?._id || '',
      }));
    }
  }, [allocations, classOptions, form.classId]);

  const resetForm = () => setForm(DEFAULT_FORM);
  const resetAttachments = () => setAttachments([]);

  const submitNote = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      setError('Title and message are required');
      return;
    }
    if (!form.classId || !form.sectionId) {
      setError('Class and section are required');
      return;
    }
    try {
      setError('');
      await apiRequest('/api/notifications/teacher', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title.trim(),
          message: form.message.trim(),
          classId: form.classId,
          sectionId: form.sectionId,
          subjectId: form.subjectId || undefined,
          typeLabel: form.typeLabel.trim(),
          priority: form.priority,
          category: form.category,
          attachments,
        }),
      });
      resetForm();
      resetAttachments();
      await loadData();
    } catch (err) {
      setError(err.message || 'Unable to publish class note');
    }
  };

  const uploadAttachment = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Unauthorized');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'class_notes');
      formData.append('tags', 'class_note,pdf');
      const res = await fetch(`${API_BASE}/api/uploads/cloudinary/single`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Upload failed');
      const uploaded = data?.files?.[0];
      if (uploaded?.secure_url) {
        setAttachments((prev) => [
          ...prev,
          {
            name: uploaded.originalName || file.name,
            url: uploaded.secure_url,
            size: uploaded.bytes || file.size,
            type: uploaded.format || 'pdf',
          },
        ]);
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm('Delete this class note?')) return;
    try {
      await apiRequest(`/api/notifications/teacher/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (err) {
      setError(err.message || 'Unable to delete class note');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Class Notes</h1>
              <p className="mt-1 text-sm text-slate-500">Share notes with assigned classes only.</p>
            </div>
            <div className="rounded-lg bg-amber-100 px-4 py-2 text-sm text-amber-800">
              Notes: {notes.length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <form onSubmit={submitNote} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">New Class Note</h2>
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {error}
              </div>
            )}
            {classOptions.length === 0 && !loading && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                No assigned classes found. Please ask the admin to assign a class/section.
              </div>
            )}
            <div>
              <label className="text-sm text-slate-600">Title</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">Message</label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm text-slate-600">Class</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={form.classId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, classId: e.target.value, sectionId: '', subjectId: '' }))
                  }
                  required
                >
                  <option value="">Select class</option>
                  {classOptions.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600">Section</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={form.sectionId}
                  onChange={(e) => setForm((p) => ({ ...p, sectionId: e.target.value, subjectId: '' }))}
                  required
                >
                  <option value="">Select section</option>
                  {sectionOptions.map((sec) => (
                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600">Subject</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={form.subjectId}
                  onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value }))}
                >
                  <option value="">All subjects</option>
                  {subjectOptions.map((subj) => (
                    <option key={subj.id} value={subj.id}>{subj.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm text-slate-600">Note Type</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={form.typeLabel}
                  onChange={(e) => setForm((p) => ({ ...p, typeLabel: e.target.value }))}
                  placeholder="e.g., Homework, Worksheet"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Priority</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={form.priority}
                  onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">PDF Attachment (optional)</label>
              <input
                type="file"
                accept="application/pdf"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadAttachment(f);
                }}
                disabled={isUploading}
              />
              {attachments.length > 0 && (
                <div className="mt-2 text-xs text-slate-600 space-y-1">
                  {attachments.map((att, idx) => (
                    <div key={`${att.url}-${idx}`} className="truncate">
                      {att.name || `Attachment ${idx + 1}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm text-white"
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              Publish
            </button>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Your Notes</h2>
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note._id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <BookOpen className="h-4 w-4 text-amber-600" />
                        {note.title}
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{note.message}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {note.className || 'Class'} · {note.sectionName || 'Section'} · {note.typeLabel || 'Class Note'}
                      </p>
                      {Array.isArray(note.attachments) && note.attachments.length > 0 && (
                        <div className="mt-2 text-xs text-slate-600">
                          Attachments: {note.attachments.length}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteNote(note._id)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {!notes.length && !loading && (
                <p className="text-sm text-slate-500">No class notes yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassNotes;
