import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Plus, Trash2, Upload, File, FileText, Image, X, Download } from 'lucide-react';

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

    // Accept PDFs, images, and common document types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF, images, and document files (Word, Excel, PowerPoint, Text) are allowed');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
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
      formData.append('folder', 'class_materials');
      formData.append('tags', 'class_note,material');
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
            type: file.type,
          },
        ]);
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return Image;
    if (type === 'application/pdf') return FileText;
    return File;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
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
        <div className="rounded-2xl border-[2.5px] border-purple-300 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Class Notes</h1>
              <p className="mt-1 text-sm text-slate-500">Share notes with assigned classes only.</p>
            </div>
            <div className="rounded-xl border-[2px] border-purple-200 bg-purple-50 px-4 py-2 text-sm text-purple-700">
              Notes: {notes.length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <form onSubmit={submitNote} className="rounded-2xl border-[2.5px] border-purple-300 bg-white p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">New Class Note</h2>
            {error && (
              <div className="rounded-xl border-[2px] border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {error}
              </div>
            )}
            {classOptions.length === 0 && !loading && (
              <div className="rounded-xl border-[2px] border-purple-200 bg-purple-50 px-3 py-2 text-xs text-purple-700">
                No assigned classes found. Please ask the admin to assign a class/section.
              </div>
            )}
            <div>
              <label className="text-sm text-slate-600">Title</label>
              <input
                className="mt-1 w-full rounded-xl border-[2px] border-purple-200 bg-purple-50 focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 px-3 py-2"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">Message</label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded-xl border-[2px] border-purple-200 bg-purple-50 focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 px-3 py-2"
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm text-slate-600">Class</label>
                <select
                  className="mt-1 w-full rounded-xl border-[2px] border-purple-200 bg-purple-50 focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 px-3 py-2"
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
                  className="mt-1 w-full rounded-xl border-[2px] border-purple-200 bg-purple-50 focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 px-3 py-2"
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
                  className="mt-1 w-full rounded-xl border-[2px] border-purple-200 bg-purple-50 focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 px-3 py-2"
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
                  className="mt-1 w-full rounded-xl border-[2px] border-purple-200 bg-purple-50 focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 px-3 py-2"
                  value={form.typeLabel}
                  onChange={(e) => setForm((p) => ({ ...p, typeLabel: e.target.value }))}
                  placeholder="e.g., Homework, Worksheet"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Priority</label>
                <select
                  className="mt-1 w-full rounded-xl border-[2px] border-purple-200 bg-purple-50 focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 px-3 py-2"
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
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Upload className="h-4 w-4 text-blue-600" />
                Upload Learning Materials
              </label>
              <p className="text-xs text-slate-500 mt-1 mb-2">
                Share PDFs, images, documents with students (Max 10MB per file)
              </p>

              <div className="mt-2 flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 px-4 py-3 hover:bg-purple-100 transition-colors">
                    <Upload className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">
                      {isUploading ? 'Uploading...' : 'Choose File'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        uploadAttachment(f);
                        e.target.value = '';
                      }
                    }}
                    disabled={isUploading}
                  />
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-600">Uploaded Files ({attachments.length})</p>
                  {attachments.map((att, idx) => {
                    const FileIcon = getFileIcon(att.type);
                    return (
                      <div
                        key={`${att.url}-${idx}`}
                        className="flex items-center justify-between gap-3 rounded-xl border-[2px] border-purple-200 bg-slate-50 px-3 py-2"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileIcon className="h-4 w-4 text-blue-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">
                              {att.name || `File ${idx + 1}`}
                            </p>
                            <p className="text-xs text-slate-500">{formatFileSize(att.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
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

          <div className="rounded-2xl border-[2.5px] border-purple-300 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Your Notes</h2>
            <div className="space-y-3">
              {notes.map((note) => {
                const noteAttachments = Array.isArray(note.attachments) ? note.attachments : [];
                return (
                  <div key={note._id} className="rounded-2xl border-[2px] border-purple-200 bg-white p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <BookOpen className="h-4 w-4 text-amber-600" />
                          {note.title}
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{note.message}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          {note.className || 'Class'} · {note.sectionName || 'Section'} · {note.typeLabel || 'Class Note'}
                        </p>

                        {noteAttachments.length > 0 && (
                          <div className="mt-3 space-y-1.5">
                            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                              <File className="h-3 w-3" />
                              Materials ({noteAttachments.length})
                            </p>
                            <div className="space-y-1">
                              {noteAttachments.map((att, idx) => {
                                const FileIcon = getFileIcon(att.type);
                                return (
                                  <a
                                    key={idx}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 rounded-md border-[2px] border-purple-200 bg-purple-50 px-2 py-1.5 hover:bg-purple-100 transition-colors group"
                                  >
                                    <FileIcon className="h-3.5 w-3.5 text-purple-500 group-hover:text-purple-700" />
                                    <span className="text-xs text-slate-700 group-hover:text-purple-700 truncate flex-1">
                                      {att.name || `Material ${idx + 1}`}
                                    </span>
                                    <Download className="h-3 w-3 text-purple-400 group-hover:text-purple-700" />
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteNote(note._id)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
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
