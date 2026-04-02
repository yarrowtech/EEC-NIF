import React, { useEffect, useMemo, useState } from 'react';
import {
  Edit2, Plus, Search, Trash2, X, BookOpen, Calendar, Clock,
  MapPin, Award, ChevronDown, Filter, Loader2, CheckCircle2,
  XCircle, Building2, Layers, DoorOpen, User, FileText, AlertCircle
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const TERM_OPTIONS = ['Class Test', 'Unit Test', 'Monthly Test', 'Term 1', 'Term 2', 'Term 3', 'Half Yearly', 'Annual', 'Final'];
const STATUS_OPTIONS = ['Scheduled', 'Ongoing', 'Completed', 'Cancelled', 'Postponed'];

const TERM_COLORS = {
  'Class Test':  'bg-sky-50 text-sky-700 border-sky-200',
  'Unit Test':   'bg-violet-50 text-violet-700 border-violet-200',
  'Monthly Test':'bg-amber-50 text-amber-700 border-amber-200',
  'Term 1':      'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Term 2':      'bg-blue-50 text-blue-700 border-blue-200',
  'Term 3':      'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Half Yearly': 'bg-orange-50 text-orange-700 border-orange-200',
  'Annual':      'bg-rose-50 text-rose-700 border-rose-200',
  'Final':       'bg-red-50 text-red-700 border-red-200',
};

const STATUS_COLORS = {
  Scheduled:  'bg-blue-50 text-blue-700',
  Ongoing:    'bg-emerald-50 text-emerald-700',
  Completed:  'bg-slate-100 text-slate-600',
  Cancelled:  'bg-red-50 text-red-600',
  Postponed:  'bg-amber-50 text-amber-700',
};

const EMPTY_FORM = {
  title: '', classId: '', sectionId: '', subjectId: '',
  buildingId: '', floorId: '', roomId: '',
  term: 'Term 1', date: '', time: '', duration: '', marks: '100',
  primaryInstructor: '', secondaryInstructor: '', venue: '', status: 'Scheduled',
};

/* ── overlap logic ── */
const timeToMins = (t) => {
  if (!t) return 0;
  const [h, m] = String(t).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const hasOverlap = (formDate, formTime, formDur, exam) => {
  if (!formDate || !formTime || !formDur) return false;
  if (!exam.date || !exam.time || !exam.duration) return false;
  const fd = String(formDate).slice(0, 10);
  const ed = String(exam.date).slice(0, 10);
  if (fd !== ed) return false;
  const fStart = timeToMins(formTime);
  const fEnd = fStart + Number(formDur);
  const eStart = timeToMins(exam.time);
  const eEnd = eStart + Number(exam.duration);
  return fStart < eEnd && fEnd > eStart;
};

/* ── tiny helpers ── */
const Field = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const inp = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition placeholder:text-slate-400';

const Toast = ({ show, message, type }) => !show ? null : (
  <div className={`fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl text-sm font-medium ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
    {type === 'success' ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
    {message}
  </div>
);

/* ════════════════════════════════════════════════════════ */
const ExaminationManagement = ({ setShowAdminHeader }) => {
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState('');
  const [termFilter, setTermFilter] = useState('all');
  const [exams, setExams]           = useState([]);
  const [classes, setClasses]       = useState([]);
  const [sections, setSections]     = useState([]);
  const [subjects, setSubjects]     = useState([]);
  const [buildings, setBuildings]   = useState([]);
  const [floors, setFloors]         = useState([]);
  const [rooms, setRooms]           = useState([]);
  const [teachers, setTeachers]     = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [toast, setToast]           = useState({ show: false, message: '', type: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState(null); // exam obj

  useEffect(() => { setShowAdminHeader?.(true); }, [setShowAdminHeader]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 3500);
  };

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const loadExams = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/exam/fetch`, { headers: authHeaders() });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.error || 'Failed to load');
      setExams(Array.isArray(data) ? data : []);
    } catch (err) { showToast(err.message || 'Failed to load exams', 'error'); setExams([]); }
    finally { setLoading(false); }
  };

  const loadAcademicOptions = async () => {
    try {
      const h = authHeaders();
      const results = await Promise.allSettled([
        fetch(`${API_BASE}/api/academic/classes`, { headers: h }),
        fetch(`${API_BASE}/api/academic/sections`, { headers: h }),
        fetch(`${API_BASE}/api/academic/subjects`, { headers: h }),
        fetch(`${API_BASE}/api/academic/buildings`, { headers: h }),
        fetch(`${API_BASE}/api/academic/floors`, { headers: h }),
        fetch(`${API_BASE}/api/academic/rooms`, { headers: h }),
        fetch(`${API_BASE}/api/admin/users/get-teachers`, { headers: h }),
      ]);
      const parse = async (r) => r.status === 'fulfilled' ? (await r.value.json().catch(() => [])) : [];
      const [c, s, sub, b, f, rm, tch] = await Promise.all(results.map(parse));
      setClasses(Array.isArray(c) ? c : []);
      setSections(Array.isArray(s) ? s : []);
      setSubjects(Array.isArray(sub) ? sub : []);
      setBuildings(Array.isArray(b) ? b : []);
      setFloors(Array.isArray(f) ? f : []);
      setRooms(Array.isArray(rm) ? rm : []);
      setTeachers(Array.isArray(tch) ? tch : []);
    } catch { /* silent */ }
  };

  useEffect(() => { loadExams(); loadAcademicOptions(); }, []);

  /* ── filtered data ── */
  const filteredExams = useMemo(() => {
    const q = search.trim().toLowerCase();
    return exams.filter(exam => {
      const matchTerm = termFilter === 'all' || exam.term === termFilter;
      const matchSearch = !q || [exam.title, exam.subject, exam.grade].some(v => String(v||'').toLowerCase().includes(q));
      return matchTerm && matchSearch;
    });
  }, [exams, search, termFilter]);

  const filteredSections = useMemo(() =>
    sections.filter(s => form.classId ? String(s.classId) === String(form.classId) : true),
    [sections, form.classId]);

  const filteredSubjects = useMemo(() =>
    subjects.filter(s => form.classId ? String(s.classId||'') === String(form.classId) : true),
    [subjects, form.classId]);

  const filteredFloors = useMemo(() =>
    floors.filter(f => form.buildingId ? String(f.buildingId?._id||f.buildingId) === String(form.buildingId) : true),
    [floors, form.buildingId]);

  const filteredRooms = useMemo(() => {
    const occupiedRoomIds = new Set();
    if (form.date && form.time && form.duration) {
      exams.forEach(ex => {
        if (editingExamId && ex._id === editingExamId) return;
        if (hasOverlap(form.date, form.time, form.duration, ex)) {
          if (ex.roomId) {
            const rid = typeof ex.roomId === 'object' ? ex.roomId._id : ex.roomId;
            occupiedRoomIds.add(String(rid));
          }
        }
      });
    }

    return rooms.filter(r => {
      if (occupiedRoomIds.has(String(r._id))) return false;
      const fid = String(r.floorId?._id||r.floorId||'');
      const bid = String(r.floorId?.buildingId?._id||r.floorId?.buildingId||'');
      if (form.floorId) return fid === String(form.floorId);
      if (form.buildingId) return bid === String(form.buildingId);
      return true;
    });
  }, [rooms, form.floorId, form.buildingId, form.date, form.time, form.duration, exams, editingExamId]);

  const filteredTeachers = useMemo(() => {
    const occupiedTeacherNames = new Set();
    if (form.date && form.time && form.duration) {
      exams.forEach(ex => {
        if (editingExamId && ex._id === editingExamId) return;
        if (hasOverlap(form.date, form.time, form.duration, ex)) {
          if (ex.instructor) {
            ex.instructor.split(',').forEach(t => occupiedTeacherNames.add(t.trim()));
          }
        }
      });
    }
    return teachers.filter(t => !occupiedTeacherNames.has(t.name));
  }, [teachers, form.date, form.time, form.duration, exams, editingExamId]);

  /* ── form open/close ── */
  const openCreate = () => { setEditingExamId(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (exam) => {
    setEditingExamId(exam._id);
    const instructors = (exam.instructor || '').split(',').map(s => s.trim());
    setForm({
      title: exam.title || '', classId: exam.classId?._id||exam.classId||'',
      sectionId: exam.sectionId?._id||exam.sectionId||'', subjectId: exam.subjectId?._id||exam.subjectId||'',
      buildingId: exam.roomId?.floorId?.buildingId?._id||'', floorId: exam.roomId?.floorId?._id||'',
      roomId: exam.roomId?._id||exam.roomId||'', term: exam.term||'Term 1',
      date: exam.date ? String(exam.date).slice(0,10) : '', time: exam.time||'',
      duration: exam.duration??'', marks: exam.marks??'100',
      primaryInstructor: instructors[0] || '', secondaryInstructor: instructors[1] || '', venue: exam.venue||'', status: exam.status||'Scheduled',
    });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingExamId(null); setForm(EMPTY_FORM); };

  /* ── save ── */
  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const instructorStr = [form.primaryInstructor, form.secondaryInstructor].filter(Boolean).join(', ');
      const payload = { ...form, duration: form.duration==='' ? undefined : Number(form.duration), marks: form.marks==='' ? undefined : Number(form.marks), instructor: instructorStr };
      delete payload.primaryInstructor;
      delete payload.secondaryInstructor;
      if (!payload.title?.trim()) throw new Error('Exam title is required');
      if (!payload.classId) throw new Error('Class is required');
      if (!payload.sectionId) throw new Error('Section is required');
      if (!payload.subjectId) throw new Error('Subject is required');
      const url = editingExamId ? `${API_BASE}/api/exam/${editingExamId}` : `${API_BASE}/api/exam/add`;
      const res = await fetch(url, { method: editingExamId ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to save');
      showToast(editingExamId ? 'Exam updated!' : 'Exam created!');
      closeForm(); await loadExams();
    } catch (err) { showToast(err.message || 'Failed to save exam', 'error'); }
    finally { setSaving(false); }
  };

  /* ── delete ── */
  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`${API_BASE}/api/exam/${deleteConfirm._id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to delete');
      showToast('Exam deleted'); setDeleteConfirm(null); await loadExams();
    } catch (err) { showToast(err.message || 'Failed to delete', 'error'); setDeleteConfirm(null); }
  };

  /* ── stats ── */
  const stats = useMemo(() => ({
    total: exams.length,
    scheduled: exams.filter(e => e.status === 'Scheduled').length,
    completed: exams.filter(e => e.status === 'Completed').length,
    upcoming: exams.filter(e => e.date && new Date(e.date) >= new Date()).length,
  }), [exams]);

  /* ════════════ RENDER ════════════ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 p-4 space-y-5">
      <Toast {...toast} />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
        <div className="absolute -top-10 -right-10 h-52 w-52 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-32 w-64 rounded-full bg-violet-400/10 blur-2xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Examination Management</h1>
            <p className="mt-0.5 text-sm text-slate-400">Schedule, manage, and track all exams in one place</p>
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Total', val: stats.total, color: 'bg-white/10' },
              { label: 'Scheduled', val: stats.scheduled, color: 'bg-blue-500/20' },
              { label: 'Upcoming', val: stats.upcoming, color: 'bg-emerald-500/20' },
            ].map(({ label, val, color }) => (
              <div key={label} className={`flex flex-col items-center rounded-xl px-4 py-2.5 backdrop-blur-sm ${color}`}>
                <span className="text-xl font-bold">{val}</span>
                <span className="text-[10px] text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exam, subject, class…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div className="relative">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select value={termFilter} onChange={e => setTermFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-8 py-2.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none appearance-none">
              <option value="all">All Terms</option>
              {TERM_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
            <Plus size={15} /> Add Exam
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-400">
            <Loader2 size={18} className="animate-spin text-indigo-400" /> Loading exams…
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <FileText size={22} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500">No exams found</p>
            <button onClick={openCreate} className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1">
              <Plus size={12} /> Add your first exam
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Exam', 'Term', 'Class', 'Date & Time', 'Venue', 'Marks', 'Status', ''].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredExams.map(exam => {
                  const venueStr = exam.roomId?.floorId?.buildingId?.name
                    ? `${exam.roomId.floorId.buildingId.name} / ${exam.roomId.floorId.name} / ${exam.roomId.roomNumber}`
                    : (exam.venue || null);
                  const termColor = TERM_COLORS[exam.term] || 'bg-slate-50 text-slate-600 border-slate-200';
                  const statusColor = STATUS_COLORS[exam.status] || 'bg-slate-100 text-slate-600';
                  const isPast = exam.date && new Date(exam.date) < new Date();
                  return (
                    <tr key={exam._id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-800">{exam.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{exam.subjectId?.name || exam.subject || '—'}</p>
                        {exam.instructor && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><User size={10} />{exam.instructor}</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${termColor}`}>{exam.term || '—'}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-700">{exam.classId?.name || exam.grade || '—'}</p>
                        <p className="text-xs text-slate-400">{exam.sectionId?.name || exam.section || ''}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        {exam.date ? (
                          <div className="flex flex-col gap-0.5">
                            <span className={`flex items-center gap-1.5 text-xs font-medium ${isPast ? 'text-slate-400' : 'text-slate-700'}`}>
                              <Calendar size={11} />{new Date(exam.date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                            </span>
                            {exam.time && <span className="flex items-center gap-1.5 text-xs text-slate-400"><Clock size={11} />{exam.time}</span>}
                            {exam.duration && <span className="text-xs text-slate-400">{exam.duration} min</span>}
                          </div>
                        ) : <span className="text-slate-300 text-xs">Not set</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        {venueStr ? (
                          <span className="flex items-start gap-1.5 text-xs text-slate-500 max-w-[160px]">
                            <MapPin size={11} className="shrink-0 mt-0.5 text-slate-400" />{venueStr}
                          </span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <Award size={12} className="text-amber-400 shrink-0" />
                          <span className="font-semibold text-slate-700">{exam.marks ?? '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-semibold ${statusColor}`}>{exam.status || '—'}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(exam)}
                            className="h-7 w-7 flex items-center justify-center rounded-lg text-indigo-500 hover:bg-indigo-50 transition-colors" title="Edit">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => setDeleteConfirm(exam)}
                            className="h-7 w-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors" title="Delete">
                            <Trash2 size={13} />
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

      {/* ══════════ FORM MODAL ══════════ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">

            {/* modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
                  <BookOpen size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">{editingExamId ? 'Edit Exam' : 'Create Exam'}</h3>
                  <p className="text-xs text-slate-400">{editingExamId ? 'Update exam details' : 'Fill in details to schedule a new exam'}</p>
                </div>
              </div>
              <button onClick={closeForm} className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
              <div className="px-6 py-5 space-y-5">

                {/* Section: Basic Info */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Basic Information</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Exam Title">
                      <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className={inp} placeholder="e.g. Mid-Term Mathematics" required />
                    </Field>
                    <Field label="Term">
                      <select value={form.term} onChange={e => setForm(p => ({...p, term: e.target.value}))} className={inp}>
                        {TERM_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>

                {/* Section: Class */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Class Details</p>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Class">
                      <select value={form.classId} onChange={e => setForm(p => ({...p, classId: e.target.value, sectionId:'', subjectId:''}))} className={inp} required>
                        <option value="">Select class</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </Field>
                    <Field label="Section">
                      <select value={form.sectionId} onChange={e => setForm(p => ({...p, sectionId: e.target.value}))} className={inp} required>
                        <option value="">Select section</option>
                        {filteredSections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                      </select>
                    </Field>
                    <Field label="Subject">
                      <select value={form.subjectId} onChange={e => setForm(p => ({...p, subjectId: e.target.value}))} className={inp} required>
                        <option value="">Select subject</option>
                        {filteredSubjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>

                {/* Section: Schedule */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Schedule</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Field label="Date">
                      <input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} className={inp} />
                    </Field>
                    <Field label="Time">
                      <input type="time" value={form.time} onChange={e => setForm(p => ({...p, time: e.target.value}))} className={inp} />
                    </Field>
                    <Field label="Duration (min)">
                      <input type="number" min="0" value={form.duration} onChange={e => setForm(p => ({...p, duration: e.target.value}))} className={inp} placeholder="e.g. 90" />
                    </Field>
                    <Field label="Total Marks">
                      <input type="number" min="1" value={form.marks} onChange={e => setForm(p => ({...p, marks: e.target.value}))} className={inp} />
                    </Field>
                  </div>
                </div>

                {/* Section: Venue */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Venue</p>
                  <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Field label="Building">
                        <div className="relative">
                          <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <select value={form.buildingId} onChange={e => setForm(p => ({...p, buildingId: e.target.value, floorId:'', roomId:''}))} className={`${inp} pl-8`}>
                            <option value="">Select building</option>
                            {buildings.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}
                          </select>
                        </div>
                      </Field>
                      <Field label="Floor">
                        <div className="relative">
                          <Layers size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <select value={form.floorId} onChange={e => setForm(p => ({...p, floorId: e.target.value, roomId:''}))} className={`${inp} pl-8`}>
                            <option value="">Select floor</option>
                            {filteredFloors.map(f => <option key={f._id} value={f._id}>{f.name} ({f.floorCode||'-'})</option>)}
                          </select>
                        </div>
                      </Field>
                      <Field label="Room">
                        <div className="relative">
                          <DoorOpen size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <select value={form.roomId} onChange={e => {
                            const rid = e.target.value;
                            const room = rooms.find(r => String(r._id) === String(rid));
                            setForm(p => ({
                              ...p, roomId: rid,
                              buildingId: room ? String(room.floorId?.buildingId?._id||room.floorId?.buildingId||p.buildingId) : p.buildingId,
                              floorId: room ? String(room.floorId?._id||room.floorId||'') : p.floorId,
                              venue: room ? `${room.floorId?.buildingId?.name||'Building'} / ${room.floorId?.name||'Floor'} / ${room.roomNumber}` : p.venue,
                            }));
                          }} className={`${inp} pl-8`}>
                            <option value="">Select room</option>
                            {filteredRooms.map(r => <option key={r._id} value={r._id}>{r.floorId?.buildingId?.name||'Bldg'} / {r.floorId?.name||'Floor'} ({r.floorId?.floorCode||'-'}) / {r.roomNumber}</option>)}
                          </select>
                        </div>
                      </Field>
                    </div>
                    <Field label="Venue Note (optional)">
                      <input value={form.venue} onChange={e => setForm(p => ({...p, venue: e.target.value}))} className={inp} placeholder="Custom venue override or extra detail" />
                    </Field>
                  </div>
                </div>

                {/* Section: Extra */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Additional</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="Primary Invigilator">
                      <div className="relative">
                        <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select value={form.primaryInstructor} onChange={e => setForm(p => ({...p, primaryInstructor: e.target.value}))} className={`${inp} pl-8`}>
                          <option value="">Select Primary</option>
                          {filteredTeachers.map(t => <option key={t._id} value={t.name} disabled={t.name === form.secondaryInstructor}>{t.name}</option>)}
                        </select>
                      </div>
                    </Field>
                    <Field label="Secondary Invigilator">
                      <div className="relative">
                        <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select value={form.secondaryInstructor} onChange={e => setForm(p => ({...p, secondaryInstructor: e.target.value}))} className={`${inp} pl-8`}>
                          <option value="">Select Secondary</option>
                          {filteredTeachers.map(t => <option key={t._id} value={t.name} disabled={t.name === form.primaryInstructor}>{t.name}</option>)}
                        </select>
                      </div>
                    </Field>
                    <Field label="Status">
                      <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))} className={inp}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>
              </div>

              {/* modal footer */}
              <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-white/95">
                <button type="button" onClick={closeForm} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 shadow-md shadow-indigo-200 transition-colors">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
                  {saving ? 'Saving…' : editingExamId ? 'Update Exam' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════ DELETE CONFIRM ══════════ */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-red-100 overflow-hidden">
            <div className="p-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={22} className="text-red-500" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Delete Exam?</h3>
              <p className="text-sm text-slate-500 mb-1">
                <span className="font-semibold text-slate-700">"{deleteConfirm.title}"</span> will be permanently removed.
              </p>
              <p className="text-xs text-slate-400 mb-5">Related results will also be deleted.</p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium">
                  Cancel
                </button>
                <button onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-md shadow-red-200">
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExaminationManagement;