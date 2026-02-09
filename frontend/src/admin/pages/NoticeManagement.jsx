import React, { useEffect, useMemo, useState } from 'react';
import { Bell, BookOpen, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '';

const DEFAULT_FORM = {
  title: '',
  message: '',
  type: 'notice',
  typeLabel: '',
  audience: 'All',
  classId: '',
  sectionId: '',
  priority: 'medium',
  category: 'general',
};

const NoticeManagement = ({ setShowAdminHeader }) => {
  const [activeTab, setActiveTab] = useState('notice');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [notices, setNotices] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);

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
      const [classData, sectionData, noticeData] = await Promise.all([
        apiRequest('/api/academic/classes'),
        apiRequest('/api/academic/sections'),
        apiRequest('/api/notifications'),
      ]);
      setClasses(Array.isArray(classData) ? classData : []);
      setSections(Array.isArray(sectionData) ? sectionData : []);
      setNotices(Array.isArray(noticeData) ? noticeData : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setShowAdminHeader?.(false);
    loadData();
  }, [setShowAdminHeader]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      type: activeTab === 'class_note' ? 'class_note' : 'notice',
      audience: activeTab === 'class_note' ? 'Student' : prev.audience || 'All',
    }));
  }, [activeTab]);

  const sectionOptions = useMemo(() => {
    if (!form.classId) return [];
    return sections.filter((sec) => String(sec.classId) === String(form.classId));
  }, [sections, form.classId]);

  const filteredNotices = useMemo(() => {
    if (activeTab === 'class_note') {
      return notices.filter((n) => n.type === 'class_note');
    }
    return notices.filter((n) => n.type !== 'class_note');
  }, [notices, activeTab]);

  const resetForm = () => {
    setForm({
      ...DEFAULT_FORM,
      type: activeTab === 'class_note' ? 'class_note' : 'notice',
      audience: activeTab === 'class_note' ? 'Student' : 'All',
    });
    setAttachments([]);
  };

  const uploadAttachment = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Unauthorized');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'notices');
      formData.append('tags', 'notice,pdf');
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
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const submitNotice = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    if (activeTab === 'class_note' && !form.classId) {
      toast.error('Class is required for class notes');
      return;
    }
    try {
      await apiRequest('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          typeLabel: form.type === 'other' ? form.typeLabel : form.typeLabel,
          classId: form.classId || undefined,
          sectionId: form.sectionId || undefined,
          attachments,
        }),
      });
      toast.success('Notice published');
      resetForm();
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Unable to publish notice');
    }
  };

  const deleteNotice = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await apiRequest(`/api/notifications/${id}`, { method: 'DELETE' });
      toast.success('Notice deleted');
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Unable to delete notice');
    }
  };

  const resolveClassName = (id) => classes.find((c) => String(c._id) === String(id))?.name || '-';
  const resolveSectionName = (id) => sections.find((s) => String(s._id) === String(id))?.name || '-';

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Notices & Class Notes</h1>
              <p className="mt-1 text-sm text-slate-500">Publish announcements and class notes.</p>
            </div>
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => setActiveTab('notice')}
                className={`rounded-full px-4 py-2 font-medium transition ${
                  activeTab === 'notice' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Notices
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('class_note')}
                className={`rounded-full px-4 py-2 font-medium transition ${
                  activeTab === 'class_note' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Class Notes
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <form onSubmit={submitNotice} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Publish</h2>
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
                <label className="text-sm text-slate-600">Type</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                >
                  <option value="notice">Notice</option>
                  <option value="class_note">Class Note</option>
                  <option value="announcement">Announcement</option>
                  <option value="assignment">Assignment</option>
                  <option value="exam">Exam</option>
                  <option value="result">Result</option>
                  <option value="fee">Fee</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600">Audience</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={form.audience}
                  onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))}
                  disabled={activeTab === 'class_note'}
                >
                  <option value="All">All</option>
                  <option value="Student">Students</option>
                  <option value="Parent">Parents</option>
                  <option value="Teacher">Teachers</option>
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
            {form.type === 'other' && (
              <div>
                <label className="text-sm text-slate-600">Custom type label</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={form.typeLabel}
                  onChange={(e) => setForm((p) => ({ ...p, typeLabel: e.target.value }))}
                  placeholder="e.g., Holiday"
                />
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm text-slate-600">Class</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={form.classId}
                  onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value, sectionId: '' }))}
                  required={activeTab === 'class_note'}
                >
                  <option value="">Select class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600">Section</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={form.sectionId}
                  onChange={(e) => setForm((p) => ({ ...p, sectionId: e.target.value }))}
                >
                  <option value="">All sections</option>
                  {sectionOptions.map((sec) => (
                    <option key={sec._id} value={sec._id}>{sec.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
              <div>
                <label className="text-sm text-slate-600">Category</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                >
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="events">Events</option>
                  <option value="transport">Transport</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              Publish
            </button>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Published</h2>
            <div className="space-y-3">
              {filteredNotices.map((notice) => (
                <div key={notice._id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm">
                        {notice.type === 'class_note' ? <BookOpen className="h-4 w-4 text-amber-600" /> : <Bell className="h-4 w-4 text-indigo-600" />}
                        <span className="font-semibold text-slate-900">{notice.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{notice.message}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        Type: {notice.typeLabel || notice.type} · Audience: {notice.audience || 'All'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Posted by: {notice.createdByType === 'teacher' ? 'Teacher' : 'School Admin'}
                        {notice.createdByName ? ` · ${notice.createdByName}` : ''}
                      </p>
                      <p className="text-xs text-slate-500">
                        Class: {notice.classId ? resolveClassName(notice.classId) : 'All'} · Section:{' '}
                        {notice.sectionId ? resolveSectionName(notice.sectionId) : 'All'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Views: {Number(notice.views) || 0}
                      </p>
                      {Array.isArray(notice.attachments) && notice.attachments.length > 0 && (
                        <div className="mt-2 text-xs text-slate-600">
                          Attachments: {notice.attachments.length}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteNotice(notice._id)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {!filteredNotices.length && !loading && (
                <p className="text-sm text-slate-500">No notices found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeManagement;
