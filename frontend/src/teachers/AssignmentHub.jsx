import React, { useState, useEffect, useMemo } from 'react';
import {
    FileText, Calendar, Search, Plus, Clock, AlertCircle, X,
    Edit3, Trash2, Eye, Users, CheckCircle, XCircle,
    Filter, BookOpen, Download, Share2, Upload, Loader,
    Award, AlertTriangle, User, Star, ExternalLink,
    RefreshCcw, ClipboardCheck, ChevronRight
} from 'lucide-react';
import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const token = () => localStorage.getItem('token');
const authH = () => ({ Authorization: `Bearer ${token()}` });

/* ═══════════════════════════════════════════════════════════
   MANAGE TAB
   ═══════════════════════════════════════════════════════════ */
const ManageTab = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailEditMode, setDetailEditMode] = useState(false);
    const [detailSaving, setDetailSaving] = useState(false);
    const [detailDraft, setDetailDraft] = useState({ title: '', subject: '', description: '', classId: '', sectionId: '', dueDate: '', marks: 100, status: 'draft', submissionFormat: 'text', type: 'Assignment', difficulty: 'Medium' });
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterSubject, setFilterSubject] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [myClasses, setMyClasses] = useState([]);
    const [newAssignment, setNewAssignment] = useState({ title: '', subject: '', classId: '', sectionId: '', description: '', dueDate: '', marks: 100, status: 'draft', submissionFormat: 'text', attachments: [] });
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [filteredAssignments, setFilteredAssignments] = useState([]);

    const globalSubjectOptions = useMemo(() => {
        const map = new Map();
        myClasses.forEach(cs => (cs.subjects || []).forEach(s => { if (s?.name) { const k = String(s.id || s._id || s.name); if (!map.has(k)) map.set(k, { id: k, name: s.name }); } }));
        return Array.from(map.values());
    }, [myClasses]);

    const subjectOptions = useMemo(() => {
        if (newAssignment.classId && newAssignment.sectionId) {
            const m = myClasses.find(cs => cs.classId === newAssignment.classId && cs.sectionId === newAssignment.sectionId);
            if (m?.subjects?.length) { const map = new Map(); m.subjects.forEach(s => { if (s?.name) { const k = String(s.id || s._id || s.name); if (!map.has(k)) map.set(k, { id: k, name: s.name }); } }); const sc = Array.from(map.values()); if (sc.length) return sc; }
        }
        return globalSubjectOptions;
    }, [myClasses, newAssignment.classId, newAssignment.sectionId, globalSubjectOptions]);

    useEffect(() => { fetchMyClasses(); fetchAssignments(); }, []);

    const fetchMyClasses = async () => {
        try {
            const r = await axios.get(`${API_BASE}/api/assignment/teacher/my-classes`, { headers: authH() });
            setMyClasses((Array.isArray(r.data) ? r.data : []).map(i => ({ ...i, subjects: (i.subjects || []).filter(s => s && s.name) })));
            if (!r.data.length) setError('No classes assigned.');
        } catch (e) { setError(e.response?.data?.error || 'Failed to load classes'); }
    };

    const fetchAssignments = async () => {
        try { setLoading(true); const r = await axios.get(`${API_BASE}/api/assignment/teacher/my-assignments`, { headers: authH() }); setAssignments(r.data); setFilteredAssignments(r.data); }
        catch (e) { setError('Failed to load assignments'); }
        finally { setLoading(false); }
    };

    const getStatusColor = s => s === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : s === 'draft' ? 'bg-amber-50 text-amber-700 border-amber-200' : s === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200';
    const formatDate = v => { if (!v) return 'N/A'; const p = new Date(v); return isNaN(p) ? 'N/A' : p.toLocaleDateString(); };
    const toDateInputValue = v => { if (!v) return ''; const p = new Date(v); return isNaN(p) ? '' : p.toISOString().slice(0, 10); };
    const resolveId = v => !v ? '' : typeof v === 'string' ? v : String(v._id || v.id || '');
    const getClassName = a => a?.classId?.name || a?.className || a?.class || '';
    const getSectionName = a => a?.sectionId?.name || a?.sectionName || a?.section || '';
    const getDaysUntilDue = d => { const diff = new Date(d) - new Date(); return Math.ceil(diff / (864e5)); };

    const openDetail = a => {
        setSelectedAssignment(a);
        setDetailDraft({ title: a?.title || '', subject: a?.subject || '', description: a?.description || '', classId: resolveId(a?.classId), sectionId: resolveId(a?.sectionId), dueDate: toDateInputValue(a?.dueDate), marks: a?.marks ?? 100, status: a?.status || 'draft', submissionFormat: a?.submissionFormat === 'pdf' ? 'pdf' : 'text', type: a?.type || 'Assignment', difficulty: a?.difficulty || 'Medium' });
        setDetailEditMode(false); setShowDetailModal(true);
    };

    const handleUpdate = async () => {
        if (!selectedAssignment?._id) return;
        try {
            setDetailSaving(true);
            const r = await axios.put(`${API_BASE}/api/assignment/teacher/update/${selectedAssignment._id}`, { ...detailDraft, marks: Number(detailDraft.marks) }, { headers: authH() });
            const u = r?.data?.assignment; if (!u) throw new Error('Invalid response');
            setAssignments(p => p.map(i => i._id === u._id ? u : i)); setSelectedAssignment(u); setDetailEditMode(false);
        } catch (e) { setError(e.response?.data?.error || 'Failed to update'); } finally { setDetailSaving(false); }
    };

    const handleChange = e => setNewAssignment(p => ({ ...p, [e.target.name]: e.target.value }));

    const handlePdfUpload = async e => {
        const file = e.target.files[0]; if (!file) return;
        if (file.type !== 'application/pdf') { alert('Please select a PDF'); return; }
        if (file.size > 20 * 1024 * 1024) { alert('Max 20MB'); return; }
        setUploadingPdf(true);
        try {
            const fd = new FormData(); fd.append('file', file);
            const r = await axios.post(`${API_BASE}/api/uploads/cloudinary/single`, fd, { headers: { ...authH(), 'Content-Type': 'multipart/form-data' } });
            if (r.data.files?.length) { const f = r.data.files[0]; setNewAssignment(p => ({ ...p, attachments: [...p.attachments, { name: f.originalName, url: f.secure_url, type: 'pdf' }] })); }
        } catch { alert('Upload failed'); } finally { setUploadingPdf(false); }
    };

    const handleCreate = async e => {
        e.preventDefault();
        try {
            setLoading(true); setError('');
            await axios.post(`${API_BASE}/api/assignment/teacher/create`, newAssignment, { headers: authH() });
            await fetchAssignments(); setShowModal(false);
            setNewAssignment({ title: '', subject: '', classId: '', sectionId: '', description: '', dueDate: '', marks: 100, status: 'draft', submissionFormat: 'text', attachments: [] });
        } catch (e) { setError(e.response?.data?.error || 'Failed to create'); } finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!pendingDelete?._id) return;
        try { setLoading(true); await axios.delete(`${API_BASE}/api/assignment/teacher/delete/${pendingDelete._id}`, { headers: authH() }); await fetchAssignments(); setShowDeleteModal(false); setPendingDelete(null); }
        catch (e) { setError(e.response?.data?.error || 'Failed to delete'); } finally { setLoading(false); }
    };

    useEffect(() => {
        let f = assignments;
        if (searchTerm) f = f.filter(a => String(a.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || String(a.subject || '').toLowerCase().includes(searchTerm.toLowerCase()));
        if (filterStatus !== 'all') f = f.filter(a => a.status === filterStatus);
        if (filterSubject !== 'all') f = f.filter(a => a.subject === filterSubject);
        setFilteredAssignments(f);
    }, [assignments, searchTerm, filterStatus, filterSubject]);

    const subjects = [...new Set(assignments.map(a => a.subject).filter(Boolean))];
    const activeCount = assignments.filter(a => a.status === 'active').length;
    const draftCount = assignments.filter(a => a.status === 'draft').length;

    return (
        <div className="space-y-4">
            {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <p className="text-xs text-red-600 font-medium flex-1">{error}</p>
                    <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 p-1"><X size={14} /></button>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Active', value: activeCount, icon: CheckCircle, color: 'from-emerald-500 to-green-500' },
                    { label: 'Drafts', value: draftCount, icon: Edit3, color: 'from-amber-500 to-orange-500' },
                    { label: 'Classes', value: myClasses.length, icon: Users, color: 'from-blue-500 to-indigo-500' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl p-3.5 border-[2px] border-purple-200 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow`}>
                                <s.icon size={16} className="text-white" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                                <p className="text-[11px] text-gray-500">{s.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="bg-white rounded-2xl p-3 border-[2px] border-purple-200">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[160px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search assignments..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition" />
                    </div>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl focus:border-purple-400">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="completed">Completed</option>
                    </select>
                    <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl focus:border-purple-400">
                        <option value="all">All Subjects</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setShowModal(true)} className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-md hover:shadow-lg transition-all">
                        <Plus size={14} />Create
                    </button>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="bg-white rounded-2xl border-[2px] border-purple-200 p-12 text-center">
                    <Clock className="w-6 h-6 text-purple-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading assignments...</p>
                </div>
            ) : filteredAssignments.length === 0 ? (
                <div className="bg-white rounded-2xl border-[2px] border-purple-200 p-12 text-center">
                    <FileText className="w-6 h-6 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-900 mb-1">No assignments found</p>
                    <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl mt-3"><Plus size={14} />Create First</button>
                </div>
            ) : (
                <div>
                    <p className="text-xs text-gray-500 mb-2">Showing {filteredAssignments.length} of {assignments.length}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredAssignments.map(a => {
                            const fmt = a?.submissionFormat === 'pdf' ? 'pdf' : 'text';
                            const bdr = a.status === 'active' ? 'border-l-emerald-500' : a.status === 'draft' ? 'border-l-amber-500' : 'border-l-blue-500';
                            return (
                                <div key={a._id} className={`bg-white rounded-2xl border-[2px] border-purple-200 hover:shadow-md hover:-translate-y-0.5 transition-all border-l-4 ${bdr} p-4`}>
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900 text-sm flex-1 mr-2">{a.title}</h3>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={() => openDetail(a)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"><Eye size={14} /></button>
                                            <button onClick={() => { setPendingDelete(a); setShowDeleteModal(true); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${getStatusColor(a.status)}`}>{a.status?.charAt(0).toUpperCase() + a.status?.slice(1)}</span>
                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">{a.subject}</span>
                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-100 text-purple-700 border border-purple-200">{`${getClassName(a) || 'N/A'}${getSectionName(a) ? ` - ${getSectionName(a)}` : ''}`}</span>
                                    </div>
                                    <p className="text-gray-500 text-xs mb-2 line-clamp-2">{a.description}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Calendar size={12} />Due {formatDate(a.dueDate)}</span>
                                        <span className="flex items-center gap-1"><Award size={12} />{a.marks} marks</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border-[2px] border-purple-200 p-5">
                        <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center mb-3"><Trash2 className="w-6 h-6 text-red-600" /></div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">Delete Assignment?</h3>
                        <p className="text-sm text-gray-600 mb-4">{`Permanently delete "${pendingDelete?.title || 'this assignment'}".`}</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => { setShowDeleteModal(false); setPendingDelete(null); }} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-50 border-[2px] border-purple-200 rounded-xl">Cancel</button>
                            <button onClick={handleDelete} disabled={loading} className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-xl disabled:opacity-60">{loading ? 'Deleting...' : 'Delete'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto border-[2px] border-purple-200">
                        <div className="px-5 py-4 border-b border-purple-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow"><Plus size={18} className="text-white" /></div>
                                <div><h2 className="text-sm font-bold text-gray-900">New Assignment</h2><p className="text-[11px] text-gray-400">Set up for your students</p></div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
                        </div>
                        <div className="px-5 py-4">
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
                                        <input name="title" value={newAssignment.title} onChange={handleChange} type="text" placeholder="e.g., Quadratic Equations" className="w-full px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl focus:border-purple-400 transition" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Subject *</label>
                                        {subjectOptions.length > 0 ? (
                                            <select name="subject" value={newAssignment.subject} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl" required>
                                                <option value="">Select Subject</option>
                                                {subjectOptions.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                            </select>
                                        ) : (
                                            <input name="subject" value={newAssignment.subject} onChange={handleChange} type="text" placeholder="e.g., Mathematics" className="w-full px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl" required />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Class & Section *</label>
                                        <select value={newAssignment.classId && newAssignment.sectionId ? `${newAssignment.classId}-${newAssignment.sectionId}` : ''} onChange={e => { if (!e.target.value) { setNewAssignment(p => ({ ...p, classId: '', sectionId: '', subject: '' })); return; } const [c, s] = e.target.value.split('-'); setNewAssignment(p => ({ ...p, classId: c, sectionId: s, subject: '' })); }} className="w-full px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl" required>
                                            <option value="">Select</option>
                                            {myClasses.map(cs => <option key={`${cs.classId}-${cs.sectionId}`} value={`${cs.classId}-${cs.sectionId}`}>Class {cs.className} - Section {cs.sectionName}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Due Date *</label>
                                        <input name="dueDate" value={newAssignment.dueDate} onChange={handleChange} type="date" className="w-full px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Total Marks *</label>
                                        <input name="marks" value={newAssignment.marks} onChange={handleChange} type="number" min="1" className="w-full px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Submission Format</label>
                                        <select name="submissionFormat" value={newAssignment.submissionFormat} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl">
                                            <option value="text">Text Only</option><option value="pdf">PDF Upload</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                                        <select name="status" value={newAssignment.status} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl">
                                            <option value="draft">Draft</option><option value="active">Active</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                                        <textarea name="description" value={newAssignment.description} onChange={handleChange} rows="3" placeholder="Instructions..." className="w-full px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl resize-none" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Attachment (PDF)</label>
                                        <div className="border-2 border-dashed border-purple-300 rounded-xl p-4 hover:border-purple-400 transition text-center">
                                            {uploadingPdf ? <><Loader className="w-5 h-5 text-purple-500 animate-spin mx-auto mb-1" /><p className="text-xs text-gray-500">Uploading...</p></> : (
                                                <><Upload size={16} className="text-gray-400 mx-auto mb-1" />
                                                    <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" id="pdf-upload" />
                                                    <label htmlFor="pdf-upload" className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg cursor-pointer hover:bg-purple-100 text-xs font-semibold">Select PDF</label></>
                                            )}
                                        </div>
                                        {newAssignment.attachments.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                {newAssignment.attachments.map((att, i) => (
                                                    <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                                                        <span className="flex items-center gap-1.5 text-xs text-emerald-700"><FileText size={12} />{att.name}</span>
                                                        <button type="button" onClick={() => setNewAssignment(p => ({ ...p, attachments: p.attachments.filter((_, j) => j !== i) }))} className="p-1 text-red-400 hover:text-red-600"><X size={12} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-3 border-t border-purple-100">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-50 border-[2px] border-purple-200 rounded-xl" disabled={loading}>Cancel</button>
                                    <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-md disabled:opacity-50" disabled={loading}>{loading ? 'Creating...' : 'Create Assignment'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedAssignment && (() => {
                const cn = getClassName(selectedAssignment) || 'N/A'; const sn = getSectionName(selectedAssignment);
                const atts = Array.isArray(selectedAssignment.attachments) ? selectedAssignment.attachments : [];
                const detailCSOptions = myClasses || [];
                const detSubjects = (() => { if (!detailDraft.classId || !detailDraft.sectionId) return globalSubjectOptions; const m = detailCSOptions.find(cs => String(cs.classId) === String(detailDraft.classId) && String(cs.sectionId) === String(detailDraft.sectionId)); return m?.subjects?.length ? m.subjects : globalSubjectOptions; })();
                return (
                    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto border-[2px] border-purple-200">
                            <div className="p-5 border-b border-purple-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg"><FileText className="h-5 w-5 text-purple-600" /></div>
                                    <div>
                                        {detailEditMode ? (
                                            <input type="text" value={detailDraft.title} onChange={e => setDetailDraft(p => ({ ...p, title: e.target.value }))} className="rounded-lg border-[2px] border-purple-300 px-3 py-1 text-sm font-semibold" />
                                        ) : (
                                            <><h2 className="text-lg font-bold text-gray-900">{selectedAssignment.title}</h2><p className="text-xs text-gray-500">{selectedAssignment.subject} • Class {cn}{sn ? ` - ${sn}` : ''}</p></>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {detailEditMode ? (
                                        <><button onClick={handleUpdate} disabled={detailSaving} className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-60">{detailSaving ? 'Saving...' : 'Save'}</button>
                                            <button onClick={() => openDetail(selectedAssignment)} className="px-3 py-1.5 rounded-lg border-[2px] border-purple-200 text-sm text-gray-700 hover:bg-gray-50">Cancel</button></>
                                    ) : <button onClick={() => setDetailEditMode(true)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>}
                                    <button onClick={() => setShowDetailModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
                                        {detailEditMode ? (
                                            <div className="space-y-2">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <select value={detailDraft.classId && detailDraft.sectionId ? `${detailDraft.classId}::${detailDraft.sectionId}` : ''} onChange={e => { const [c, s] = String(e.target.value || '').split('::'); setDetailDraft(p => ({ ...p, classId: c || '', sectionId: s || '', subject: '' })); }} className="rounded-lg border-[2px] border-purple-200 px-3 py-2 text-sm">
                                                        <option value="">Select Class</option>
                                                        {detailCSOptions.map(cs => <option key={`${cs.classId}-${cs.sectionId}`} value={`${cs.classId}::${cs.sectionId}`}>Class {cs.className} - {cs.sectionName}</option>)}
                                                    </select>
                                                    <select value={detailDraft.subject} onChange={e => setDetailDraft(p => ({ ...p, subject: e.target.value }))} className="rounded-lg border-[2px] border-purple-200 px-3 py-2 text-sm">
                                                        <option value="">Select Subject</option>
                                                        {detSubjects.map(s => <option key={String(s.id || s._id || s.name)} value={s.name}>{s.name}</option>)}
                                                    </select>
                                                </div>
                                                <textarea value={detailDraft.description} onChange={e => setDetailDraft(p => ({ ...p, description: e.target.value }))} rows={4} className="w-full rounded-lg border-[2px] border-purple-200 px-3 py-2 text-sm" />
                                            </div>
                                        ) : <p className="text-sm text-gray-700 leading-relaxed">{selectedAssignment.description}</p>}
                                    </div>
                                    {atts.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Attachments</h3>
                                            <div className="space-y-1.5">
                                                {atts.map((att, i) => {
                                                    const label = typeof att === 'string' ? att : att?.name || `Attachment ${i + 1}`; const link = typeof att === 'object' ? att?.url : '';
                                                    return <div key={i} className="flex items-center gap-2 p-2 border-[2px] border-purple-200 rounded-lg text-sm"><FileText className="w-4 h-4 text-purple-500" /><span className="flex-1 text-gray-700">{label}</span>{link ? <a href={link} target="_blank" rel="noreferrer" className="text-purple-600 text-xs font-medium">View</a> : null}</div>;
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h3 className="text-xs font-semibold text-gray-900 mb-2">Info</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-gray-500">Status</span>{detailEditMode ? <select value={detailDraft.status} onChange={e => setDetailDraft(p => ({ ...p, status: e.target.value }))} className="rounded-lg border-[2px] border-purple-200 px-2 py-0.5 text-xs"><option value="draft">Draft</option><option value="active">Active</option></select> : <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedAssignment.status)}`}>{selectedAssignment.status?.charAt(0).toUpperCase() + selectedAssignment.status?.slice(1)}</span>}</div>
                                            <div className="flex justify-between"><span className="text-gray-500">Marks</span>{detailEditMode ? <input type="number" min="1" value={detailDraft.marks} onChange={e => setDetailDraft(p => ({ ...p, marks: e.target.value }))} className="w-20 rounded-lg border-[2px] border-purple-200 px-2 py-0.5 text-xs text-right" /> : <span className="text-gray-900">{selectedAssignment.marks}</span>}</div>
                                            <div className="flex justify-between"><span className="text-gray-500">Due</span>{detailEditMode ? <input type="date" value={detailDraft.dueDate} onChange={e => setDetailDraft(p => ({ ...p, dueDate: e.target.value }))} className="rounded-lg border-[2px] border-purple-200 px-2 py-0.5 text-xs" /> : <span className="text-gray-900">{formatDate(selectedAssignment.dueDate)}</span>}</div>
                                            <div className="flex justify-between"><span className="text-gray-500">Format</span>{detailEditMode ? <select value={detailDraft.submissionFormat} onChange={e => setDetailDraft(p => ({ ...p, submissionFormat: e.target.value }))} className="rounded-lg border-[2px] border-purple-200 px-2 py-0.5 text-xs"><option value="text">Text</option><option value="pdf">PDF</option></select> : <span className="text-gray-900">{selectedAssignment.submissionFormat === 'pdf' ? 'PDF' : 'Text'}</span>}</div>
                                            <div className="flex justify-between"><span className="text-gray-500">Created</span><span className="text-gray-900">{formatDate(selectedAssignment.createdDate || selectedAssignment.createdAt)}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════
   EVALUATE TAB
   ═══════════════════════════════════════════════════════════ */
const EvaluateTab = () => {
    const [submissions, setSubmissions] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [marks, setMarks] = useState('');
    const [feedback, setFeedback] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [assignmentFilter, setAssignmentFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('recent');

    const fetchSubmissions = async () => {
        try { setLoading(true); const { data } = await axios.get(`${API_BASE}/api/assignment/teacher/submissions`, { headers: authH() }); setSubmissions(data); }
        catch (e) { console.error(e); } finally { setLoading(false); }
    };
    useEffect(() => { fetchSubmissions(); }, []);

    const assignmentTitles = ['all', ...new Set(submissions.map(s => s.assignmentTitle))];

    useEffect(() => {
        let list = [...submissions];
        if (statusFilter !== 'all') list = list.filter(s => statusFilter === 'graded' ? s.score !== null : s.score === null);
        if (assignmentFilter !== 'all') list = list.filter(s => s.assignmentTitle === assignmentFilter);
        if (search.trim()) { const q = search.toLowerCase(); list = list.filter(s => s.studentName?.toLowerCase().includes(q) || s.assignmentTitle?.toLowerCase().includes(q) || s.subject?.toLowerCase().includes(q)); }
        list.sort((a, b) => { const dA = new Date(a.submittedAt || 0).getTime(), dB = new Date(b.submittedAt || 0).getTime(); return sortOrder === 'oldest' ? dA - dB : dB - dA; });
        setFiltered(list);
    }, [submissions, statusFilter, assignmentFilter, search, sortOrder]);

    const openSubmission = sub => { setSelected(sub); setMarks(sub.score != null ? String(sub.score) : ''); setFeedback(sub.feedback || ''); setSaveError(''); setShowPdfPreview(false); };
    const closePanel = () => { setSelected(null); setSaveError(''); setShowPdfPreview(false); };

    const saveGrade = async () => {
        const n = parseFloat(marks);
        if (isNaN(n) || n < 0) { setSaveError('Enter valid mark ≥ 0.'); return; }
        if (n > selected.totalMarks) { setSaveError(`Max ${selected.totalMarks}.`); return; }
        setSaving(true); setSaveError('');
        try {
            await axios.post(`${API_BASE}/api/assignment/teacher/grade`, { studentId: selected.studentId, assignmentId: selected.assignmentId, score: n, feedback }, { headers: authH() });
            setSubmissions(p => p.map(s => s.submissionId === selected.submissionId ? { ...s, score: n, feedback, status: 'graded' } : s));
            setSelected(p => ({ ...p, score: n, feedback, status: 'graded' }));
        } catch (e) { setSaveError(e.response?.data?.error || 'Failed to save.'); } finally { setSaving(false); }
    };

    const formatDate = d => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
    const formatTime = d => d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
    const statusChip = sub => {
        if (sub.score != null) return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Graded</span>;
        if (sub.status === 'late') return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">Late</span>;
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">Pending</span>;
    };

    const pendingCount = submissions.filter(s => s.score == null).length;
    const gradedCount = submissions.filter(s => s.score != null).length;

    return (
        <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Pending', value: pendingCount, icon: Clock, color: 'from-amber-500 to-orange-500' },
                    { label: 'Graded', value: gradedCount, icon: CheckCircle, color: 'from-emerald-500 to-green-500' },
                    { label: 'Total', value: submissions.length, icon: FileText, color: 'from-purple-500 to-indigo-500' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl p-3.5 border-[2px] border-purple-200 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow`}><s.icon size={16} className="text-white" /></div>
                            <div><p className="text-xl font-bold text-gray-900">{s.value}</p><p className="text-[11px] text-gray-500">{s.label}</p></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-3 border-[2px] border-purple-200 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[160px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student, assignment..." className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition" />
                    </div>
                    <select value={assignmentFilter} onChange={e => setAssignmentFilter(e.target.value)} className="px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl">
                        {assignmentTitles.map(t => <option key={t} value={t}>{t === 'all' ? 'All Assignments' : t}</option>)}
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl">
                        <option value="all">All Status</option><option value="pending">Pending</option><option value="graded">Graded</option>
                    </select>
                    <button onClick={fetchSubmissions} className="ml-auto p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition"><RefreshCcw size={16} /></button>
                </div>
                <div className="flex gap-1.5">
                    {['all', 'pending', 'graded'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-full px-3 py-1 text-xs font-medium transition ${statusFilter === s ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {s === 'all' ? 'All' : s === 'pending' ? 'Needs review' : 'Completed'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Submissions + Grading Panel */}
            <div className="grid gap-4 lg:grid-cols-[1fr,380px]">
                <div>
                    {loading ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {[...Array(4)].map((_, i) => <div key={i} className="rounded-2xl border-[2px] border-purple-200 bg-white p-4 animate-pulse space-y-3"><div className="h-4 w-1/2 bg-gray-200 rounded" /><div className="h-3 w-1/3 bg-gray-200 rounded" /><div className="h-3 w-full bg-gray-100 rounded" /></div>)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="rounded-2xl border-[2px] border-dashed border-purple-200 bg-white p-10 text-center">
                            <FileText className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                            <p className="text-sm font-semibold text-gray-800">No submissions found</p>
                            <p className="text-xs text-gray-500">Adjust filters or wait for student submissions.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {filtered.map(sub => {
                                const isSel = selected?.submissionId === sub.submissionId;
                                return (
                                    <article key={sub.submissionId} onClick={() => openSubmission(sub)} className={`rounded-2xl border-[2px] p-4 transition-all cursor-pointer ${isSel ? 'border-purple-500 bg-white shadow-lg shadow-purple-100' : 'border-purple-200 bg-white hover:-translate-y-0.5 hover:shadow-md'}`}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><User className="w-4 h-4" /></div>
                                                <div className="min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{sub.studentName}</p><p className="text-[11px] text-gray-500">{sub.grade} • {sub.section}</p></div>
                                            </div>
                                            {statusChip(sub)}
                                        </div>
                                        <div className="mt-3 space-y-1.5">
                                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{sub.assignmentTitle}</p>
                                            <div className="flex flex-wrap gap-2 text-[11px] text-gray-500">
                                                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{sub.subject}</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(sub.submittedAt)}</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(sub.submittedAt)}</span>
                                            {sub.score != null ? <span className="text-sm font-semibold text-emerald-600">{sub.score}/{sub.totalMarks}</span> : <span className="text-sm font-semibold text-purple-600 flex items-center gap-1">Review<Eye className="w-3.5 h-3.5" /></span>}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Grading Panel */}
                <div className="rounded-2xl border-[2px] border-purple-300 bg-white shadow-sm flex flex-col min-h-[400px]">
                    {selected ? (
                        <>
                            <div className="flex items-start justify-between gap-2 border-b border-purple-100 px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><User className="w-4 h-4" /></div>
                                    <div><p className="text-sm font-semibold text-gray-900">{selected.studentName}</p><p className="text-xs text-gray-500">{selected.grade} • {selected.section}</p></div>
                                </div>
                                <button onClick={closePanel} className="rounded-full border border-purple-200 p-1 text-purple-500 hover:bg-purple-50"><X className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                <div className="rounded-xl border-[2px] border-purple-200 bg-purple-50/60 p-3 space-y-1.5">
                                    <p className="text-sm font-semibold text-gray-900">{selected.assignmentTitle}</p>
                                    <div className="flex flex-wrap gap-2 text-[11px] text-gray-600">
                                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{selected.subject}</span>
                                        <span className="flex items-center gap-1"><Star className="w-3 h-3" />Total {selected.totalMarks}</span>
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(selected.submittedAt)}</span>
                                    </div>
                                </div>

                                {selected.attachmentUrl && (
                                    <div className="space-y-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Uploaded file</p>
                                        <div className="rounded-xl border-[2px] border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-3 space-y-2">
                                            <div className="flex gap-2">
                                                <a href={selected.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-purple-200 bg-white px-2 py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-50"><ExternalLink className="w-3 h-3" />Open</a>
                                                <a href={selected.attachmentUrl} download className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-purple-200 bg-white px-2 py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-50"><Download className="w-3 h-3" />Download</a>
                                                <button onClick={() => setShowPdfPreview(!showPdfPreview)} className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-purple-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"><Eye className="w-3 h-3" />{showPdfPreview ? 'Hide' : 'Preview'}</button>
                                            </div>
                                            {showPdfPreview && <iframe src={`${selected.attachmentUrl}#toolbar=0`} title="PDF" className="w-full h-60 rounded-xl border-2 border-purple-200 bg-white" />}
                                        </div>
                                    </div>
                                )}

                                {selected.submissionText ? (
                                    <div><p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">{selected.attachmentUrl ? 'Additional notes' : "Student's answer"}</p>
                                        <div className="rounded-xl border-[2px] border-purple-200 bg-purple-50 p-3 text-sm text-gray-700 max-h-36 overflow-y-auto whitespace-pre-line">{selected.submissionText}</div></div>
                                ) : !selected.attachmentUrl ? <div className="rounded-xl border-[2px] border-dashed border-purple-200 bg-purple-50 p-3 text-sm text-gray-400 text-center">No text submitted.</div> : null}

                                <div className="space-y-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{selected.score != null ? 'Update grade' : 'Grade'}</p>
                                    {selected.score != null && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"><Award className="w-4 h-4 text-emerald-600" />Current: {selected.score}/{selected.totalMarks}</div>}
                                    <div className="flex gap-2">
                                        <div className="flex-1"><label className="text-[11px] font-semibold text-gray-500">Marks *</label><input type="number" min="0" max={selected.totalMarks} value={marks} onChange={e => setMarks(e.target.value)} placeholder={`0 – ${selected.totalMarks}`} className="mt-1 w-full rounded-xl border-[2px] border-purple-200 px-3 py-2 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100" /></div>
                                        <div className="rounded-xl border-[2px] border-purple-200 bg-purple-50 px-3 py-2 text-center"><p className="text-[11px] font-semibold text-purple-500">%</p><p className="text-lg font-bold text-purple-700">{marks && !isNaN(parseFloat(marks)) ? `${Math.round((parseFloat(marks) / selected.totalMarks) * 100)}%` : '—'}</p></div>
                                    </div>
                                    <div><label className="text-[11px] font-semibold text-gray-500">Feedback</label><textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={2} placeholder="Praise, guidance, notes…" className="mt-1 w-full rounded-xl border-[2px] border-purple-200 px-3 py-2 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none" /></div>
                                    {saveError && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"><AlertCircle className="w-4 h-4" />{saveError}</div>}
                                    <button onClick={saveGrade} disabled={saving || !marks} className="w-full rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300 transition">{saving ? 'Saving…' : selected.score != null ? 'Update grade' : 'Submit grade'}</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center text-gray-500">
                            <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><ClipboardCheck className="w-6 h-6" /></div>
                            <h3 className="text-base font-semibold text-gray-800">Select a submission</h3>
                            <p className="text-xs text-gray-500">Pick a card to view, preview files, and grade.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════
   MAIN HUB
   ═══════════════════════════════════════════════════════════ */
const AssignmentHub = () => {
    const [activeTab, setActiveTab] = useState('manage');
    const tabs = [
        { id: 'manage', label: 'Manage', icon: FileText },
        { id: 'evaluate', label: 'Evaluate', icon: ClipboardCheck },
    ];

    return (
        <div className="space-y-4">
            {/* Tab Bar */}
            <div className="bg-white rounded-2xl border-[2px] border-purple-200 p-1.5 inline-flex gap-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-200'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'manage' ? <ManageTab /> : <EvaluateTab />}
        </div>
    );
};

export default AssignmentHub;
