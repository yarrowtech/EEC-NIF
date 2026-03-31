import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell, BookOpen, Plus, Trash2,
  Send, Eye, Clock, FileText, X, Search, Users, Tag
} from 'lucide-react';
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

const PRIORITY_STYLES = {
  high:   { bar: 'bg-red-500',   badge: 'bg-red-50 text-red-700 border-red-200' },
  medium: { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  low:    { bar: 'bg-slate-300', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const AUDIENCE_STYLES = {
  All:     'bg-slate-100 text-slate-700 border-slate-200',
  Student: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Parent:  'bg-purple-50 text-purple-700 border-purple-200',
  Teacher: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const NoticeManagement = ({ setShowAdminHeader }) => {
  const [activeTab, setActiveTab]       = useState('notice');
  const [loading, setLoading]           = useState(false);
  const [classes, setClasses]           = useState([]);
  const [sections, setSections]         = useState([]);
  const [notices, setNotices]           = useState([]);
  const [attachments, setAttachments]   = useState([]);
  const [isUploading, setIsUploading]   = useState(false);
  const [form, setForm]                 = useState(DEFAULT_FORM);
  const [searchQuery, setSearchQuery]   = useState('');

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      authorization: token ? `Bearer ${token}` : '',
    };
  }, []);

  const apiRequest = async (path, options = {}) => {
    const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders, ...options });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Request failed');
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
    if (activeTab === 'class_note') return notices.filter((n) => n.type === 'class_note');
    return notices.filter((n) => {
      if (n.type === 'class_note') return false;
      const title = String(n?.title || '').toLowerCase();
      const typeLabel = String(n?.typeLabel || '').toLowerCase();
      const isLeaveRequestNotice = typeLabel.includes('leave request') || title.includes('leave request');
      return !isLeaveRequestNotice;
    });
  }, [notices, activeTab]);

  const searchedNotices = useMemo(() => {
    if (!searchQuery.trim()) return filteredNotices;
    const q = searchQuery.toLowerCase();
    return filteredNotices.filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.message?.toLowerCase().includes(q)
    );
  }, [filteredNotices, searchQuery]);

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
    if (file.type !== 'application/pdf') { toast.error('Only PDF files are allowed'); return; }
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Unauthorized'); return; }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'notices');
      formData.append('tags', 'notice,pdf');
      const res = await fetch(`${API_BASE}/api/uploads/cloudinary/single`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
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
    if (!form.title.trim() || !form.message.trim()) { toast.error('Title and message are required'); return; }
    if (activeTab === 'class_note' && !form.classId) { toast.error('Class is required for class notes'); return; }
    try {
      await apiRequest('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          typeLabel: form.typeLabel,
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

  const resolveClassName   = (id) => classes.find((c) => String(c._id) === String(id))?.name || '—';
  const resolveSectionName = (id) => sections.find((s) => String(s._id) === String(id))?.name || '—';

  const formatDate = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const inputCls = 'w-full rounded-lg border border-black bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition';
  const labelCls = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5';

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-md flex-shrink-0">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Notices & Class Notes</h1>
                <p className="text-sm text-slate-500 mt-0.5">Publish and manage school announcements</p>
              </div>
            </div>

            {/* Stat chips */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-2">
                <Bell className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-bold text-indigo-700">{notices.filter(n => n.type !== 'class_note').length}</span>
                <span className="text-xs text-indigo-400">Notices</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-2">
                <BookOpen className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-bold text-amber-700">{notices.filter(n => n.type === 'class_note').length}</span>
                <span className="text-xs text-amber-400">Class Notes</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-5 flex gap-0 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('notice')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all ${
                activeTab === 'notice'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Bell className="h-4 w-4" />
              Notices
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${activeTab === 'notice' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {notices.filter(n => n.type !== 'class_note').length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('class_note')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all ${
                activeTab === 'class_note'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Class Notes
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${activeTab === 'class_note' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {notices.filter(n => n.type === 'class_note').length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

          {/* ── Compose form (2/5) ── */}
          <form onSubmit={submitNotice} className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

              {/* Form header */}
              <div className="px-6 py-4 bg-slate-900 flex items-center gap-3">
                <Send className="h-5 w-5 text-slate-300" />
                <h2 className="text-sm font-semibold text-white">
                  {activeTab === 'class_note' ? 'New Class Note' : 'New Notice'}
                </h2>
              </div>

              <div className="px-6 py-5 space-y-4">

                {/* Title */}
                <div>
                  <label className={labelCls}>Title <span className="text-red-400 normal-case tracking-normal">*</span></label>
                  <input
                    className={inputCls}
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Enter notice title…"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className={labelCls}>Message <span className="text-red-400 normal-case tracking-normal">*</span></label>
                  <textarea
                    rows={4}
                    className={`${inputCls} resize-none`}
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    placeholder="Write your message here…"
                    required
                  />
                </div>

                <div className="border-t border-slate-100" />

                {/* Type + Audience */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Type</label>
                    <select
                      className={inputCls}
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
                    <label className={labelCls}>Audience</label>
                    <select
                      className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
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

                {/* Custom label */}
                {form.type === 'other' && (
                  <div>
                    <label className={labelCls}>Custom Label</label>
                    <input
                      className={inputCls}
                      value={form.typeLabel}
                      onChange={(e) => setForm((p) => ({ ...p, typeLabel: e.target.value }))}
                      placeholder="e.g., Holiday"
                    />
                  </div>
                )}

                {/* Class + Section */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>
                      Class {activeTab === 'class_note' && <span className="text-red-400 normal-case tracking-normal">*</span>}
                    </label>
                    <select
                      className={inputCls}
                      value={form.classId}
                      onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value, sectionId: '' }))}
                      required={activeTab === 'class_note'}
                    >
                      <option value="">All classes</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Section</label>
                    <select
                      className={inputCls}
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

                {/* Priority + Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Priority</label>
                    <select
                      className={inputCls}
                      value={form.priority}
                      onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <select
                      className={inputCls}
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

                <div className="border-t border-slate-100" />

                {/* PDF Upload */}
                <div>
                  <label className={labelCls}>PDF Attachment <span className="normal-case tracking-normal font-normal text-slate-400">(optional)</span></label>
                  <label className={`flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed px-4 py-5 cursor-pointer transition ${isUploading ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed' : 'border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-white'}`}>
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                      <FileText className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-600">{isUploading ? 'Uploading…' : 'Click to upload PDF'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">PDF files only</p>
                    </div>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAttachment(f); }}
                      disabled={isUploading}
                    />
                  </label>

                  {attachments.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {attachments.map((att, idx) => (
                        <div key={`${att.url}-${idx}`} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <FileText className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                          <span className="text-xs text-slate-700 truncate flex-1">{att.name || `Attachment ${idx + 1}`}</span>
                          <button
                            type="button"
                            onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-red-500 transition flex-shrink-0"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Form footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm text-slate-400 hover:text-slate-600 transition"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={loading || isUploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                >
                  <Send className="h-4 w-4" />
                  {loading ? 'Publishing…' : 'Publish'}
                </button>
              </div>
            </div>
          </form>

          {/* ── Published list (3/5) ── */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

              {/* List header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {activeTab === 'class_note' ? 'Class Notes' : 'Published Notices'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {searchedNotices.length} {searchedNotices.length === 1 ? 'item' : 'items'}
                    {searchQuery && ` matching "${searchQuery}"`}
                  </p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 w-44 transition"
                  />
                </div>
              </div>

              {/* List body */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-100 border-t-slate-900" />
                </div>
              ) : searchedNotices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Bell className="h-7 w-7 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-400">
                    No {activeTab === 'class_note' ? 'class notes' : 'notices'} found
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
                  {searchedNotices.map((notice) => {
                    const priority = notice.priority || 'medium';
                    const ps = PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium;
                    const audienceStyle = AUDIENCE_STYLES[notice.audience] || AUDIENCE_STYLES.All;
                    const isClassNote = notice.type === 'class_note';
                    return (
                      <div key={notice._id} className="flex gap-0 group hover:bg-slate-50 transition-colors">
                        {/* Priority accent bar */}
                        <div className={`w-1 flex-shrink-0 ${ps.bar} rounded-l-none`} />

                        <div className="flex-1 px-5 py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              {/* Type icon */}
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isClassNote ? 'bg-amber-50' : 'bg-indigo-50'}`}>
                                {isClassNote
                                  ? <BookOpen className="h-4 w-4 text-amber-600" />
                                  : <Bell className="h-4 w-4 text-indigo-600" />
                                }
                              </div>

                              <div className="min-w-0">
                                {/* Title */}
                                <p className="text-sm font-semibold text-slate-900 leading-tight">{notice.title}</p>

                                {/* Message */}
                                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">{notice.message}</p>

                                {/* Badges */}
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${ps.badge}`}>
                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${audienceStyle}`}>
                                    <Users className="h-3 w-3" />
                                    {notice.audience || 'All'}
                                  </span>
                                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                    <Tag className="h-3 w-3" />
                                    {notice.typeLabel || notice.type}
                                  </span>
                                </div>

                                {/* Meta */}
                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                                  {(notice.classId || notice.sectionId) && (
                                    <span>
                                      {notice.classId ? resolveClassName(notice.classId) : 'All classes'}
                                      {notice.sectionId ? ` · ${resolveSectionName(notice.sectionId)}` : ' · All sections'}
                                    </span>
                                  )}
                                  {notice.createdByName && (
                                    <span>By {notice.createdByName}</span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {Number(notice.views) || 0} views
                                  </span>
                                  {notice.createdAt && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatDate(notice.createdAt)}
                                    </span>
                                  )}
                                  {Array.isArray(notice.attachments) && notice.attachments.length > 0 && (
                                    <span className="flex items-center gap-1 text-indigo-500">
                                      <FileText className="h-3 w-3" />
                                      {notice.attachments.length} file{notice.attachments.length > 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => deleteNotice(notice._id)}
                              className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0 opacity-0 group-hover:opacity-100"
                              title="Delete notice"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NoticeManagement;
