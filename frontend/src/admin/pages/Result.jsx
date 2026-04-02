import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Download, FileSpreadsheet, Plus, Send, Upload, X,
  BookOpen, Edit2, Trash2, Clock, MapPin, User, Calendar,
  RefreshCw, ChevronRight, CheckCircle, XCircle, AlertCircle,
  Loader2, Award, TrendingUp, Eye, EyeOff, FileUp, FileDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { getStoredAdminScope } from '../utils/adminScope';
import { formatStudentDisplay } from '../../utils/studentDisplay';

const API_BASE = import.meta.env.VITE_API_URL;

/* ── helpers ── */
const authH = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

const STATUS_STYLE = {
  pass:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  fail:   'bg-red-50 text-red-600 border border-red-200',
  absent: 'bg-slate-100 text-slate-600 border border-slate-200',
};

const TERM_STYLE = {
  'Term 1':   'bg-blue-50 text-blue-700 border-blue-100',
  'Term 2':   'bg-violet-50 text-violet-700 border-violet-100',
  'Term 3':   'bg-orange-50 text-orange-700 border-orange-100',
  'Final':    'bg-rose-50 text-rose-700 border-rose-100',
  'Annual':   'bg-red-50 text-red-700 border-red-100',
  'Half Yearly':'bg-amber-50 text-amber-700 border-amber-100',
};

const inp = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition placeholder:text-slate-400';

/* ── modal shell ── */
const Modal = ({ show, onClose, title, subtitle, icon: Icon, iconColor = 'bg-indigo-600', children, maxWidth = 'sm:max-w-2xl' }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white w-full ${maxWidth} rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-100`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`h-9 w-9 rounded-xl ${iconColor} flex items-center justify-center shadow-sm`}>
                <Icon size={16} className="text-white" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">{title}</h3>
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

/* ── field label wrapper ── */
const Field = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

/* ── stat card ── */
const StatCard = ({ label, value, icon: Icon, bg, text, border }) => (
  <div className={`rounded-2xl border p-4 ${bg} ${border}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${text}`}>{value}</p>
      </div>
      <Icon size={28} className={`${text} opacity-60`} />
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════ */
const Result = ({ setShowAdminHeader }) => {
  useEffect(() => { setShowAdminHeader?.(true); }, [setShowAdminHeader]);

  const [results, setResults]   = useState([]);
  const [exams, setExams]       = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses]   = useState([]);
  const [sections, setSections] = useState([]);

  const [loading, setLoading]           = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [searchTerm, setSearchTerm]     = useState('');
  const [selectedClass, setSelectedClass]   = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [filterSubject, setFilterSubject]   = useState('all');
  const [selectedTerm, setSelectedTerm]     = useState('all');

  const [showAddResult, setShowAddResult]   = useState(false);
  const [showEditResult, setShowEditResult] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const emptyR = { session: '', className: '', sectionName: '', examId: '', studentId: '', marks: '', grade: '', remarks: '', status: 'pass' };
  const [resultForm, setResultForm]       = useState(emptyR);
  const [editResultForm, setEditResultForm] = useState(emptyR);
  const [editingResultId, setEditingResultId] = useState(null);
  const [csvFile, setCSVFile]             = useState(null);

  /* ── fetch ── */
  const fetchResults = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/exam/results/admin`, { headers: authH() });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setResults(Array.isArray(d) ? d : []);
    } catch { toast.error('Failed to load results'); setResults([]); }
    finally { setLoading(false); }
  };

  const fetchClassesAndSections = async () => {
    try {
      const [cr, sr] = await Promise.all([
        fetch(`${API_BASE}/api/academic/classes`, { headers: authH() }),
        fetch(`${API_BASE}/api/academic/sections`, { headers: authH() }),
      ]);
      if (cr.ok) { const d = await cr.json(); setClasses(Array.isArray(d) ? d : []); }
      if (sr.ok) { const d = await sr.json(); setSections(Array.isArray(d) ? d : []); }
    } catch { /**/ }
  };

  const fetchExams = async () => {
    setLoadingExams(true);
    try {
      const r = await fetch(`${API_BASE}/api/exam/fetch`, { headers: authH() });
      if (r.ok) { const d = await r.json(); setExams(Array.isArray(d) ? d : []); }
    } catch { toast.error('Error fetching exams'); }
    finally { setLoadingExams(false); }
  };

  const normalizeClass = (v = '') => { const s = String(v).trim(); const n = s.match(/\d+/); return n ? n[0] : s.replace(/^class\s+/i,'').trim().toLowerCase(); };
  const normSec = (v = '') => String(v).trim().toLowerCase();

  const fetchStudentsByClass = async (forceAll = false) => {
    setLoadingStudents(true);
    try {
      const { schoolId } = getStoredAdminScope();
      const url = new URL(`${API_BASE}/api/admin/users/get-students`);
      if (schoolId) url.searchParams.set('schoolId', schoolId);
      const r = await fetch(url, { headers: authH() });
      if (!r.ok) throw new Error();
      const all = await r.json();
      let filtered = Array.isArray(all) ? all : [];
      if (!forceAll && selectedClass) {
        const nc = normalizeClass(selectedClass); const ns = normSec(selectedSection);
        filtered = filtered.filter(s => normalizeClass(s.grade||s.class||'') === nc && (selectedSection ? normSec(s.section||'') === ns : true));
      }
      const map = new Map(); const seen = new Set();
      filtered.forEach(s => {
        const id = String(s._id||s.id||'');
        const key = `${(s.name||'').toLowerCase()}-${s.roll}-${(s.grade||'').toLowerCase()}`;
        if (id && !seen.has(key)) { map.set(id, s); seen.add(key); }
      });
      setStudents([...map.values()].sort((a,b) => (a.name||'').localeCompare(b.name||'')));
    } catch { toast.error('Failed to fetch students'); setStudents([]); }
    finally { setLoadingStudents(false); }
  };

  useEffect(() => { fetchResults(); fetchClassesAndSections(); fetchExams(); }, []);
  useEffect(() => { if (selectedClass) fetchStudentsByClass(); }, [selectedClass, selectedSection]);

  /* ── publish ── */
  const handlePublishResults = async () => {
    if (!selectedClass) { toast.error('Select a class first'); return; }
    const r = await Swal.fire({ title: 'Publish Results?', html: `Publish results for <strong>Class ${selectedClass}${selectedSection ? ' – ' + selectedSection : ''}</strong>?`, icon: 'question', showCancelButton: true, confirmButtonColor: '#4f46e5', confirmButtonText: 'Publish' });
    if (!r.isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE}/api/exam/results/publish`, { method: 'POST', headers: authH(), body: JSON.stringify({ grade: selectedClass, section: selectedSection || undefined }) });
      if (!res.ok) throw new Error();
      const d = await res.json();
      Swal.fire({ title: 'Published!', html: `Results published. <strong>${d.studentsNotified || 0}</strong> students notified.`, icon: 'success' });
    } catch { Swal.fire('Error', 'Failed to publish results.', 'error'); }
  };

  const handleTogglePublish = async (id, val) => {
    try {
      const r = await fetch(`${API_BASE}/api/exam/results/${id}/publish`, { method: 'PUT', headers: authH(), body: JSON.stringify({ published: val }) });
      if (!r.ok) throw new Error();
      const d = await r.json();
      toast.success(d.message || `Result ${val ? 'published' : 'unpublished'}`);
      fetchResults();
    } catch { toast.error('Failed to update publish status'); }
  };

  /* ── add result ── */
  const handleAddResult = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API_BASE}/api/exam/results`, { method: 'POST', headers: authH(), body: JSON.stringify(resultForm) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed');
      toast.success('Result added'); setShowAddResult(false); setResultForm(emptyR); fetchResults();
    } catch (err) { toast.error(err.message || 'Failed to add result'); }
  };

  /* ── edit result ── */
  const openEditResult = async (result) => {
    setEditingResultId(result._id);
    setEditResultForm({ 
      session: result.studentId?.academicYear || result.studentId?.session || '', 
      className: result.studentId?.grade || result.studentId?.class || '', 
      sectionName: result.studentId?.section || '', 
      examId: result.examId?._id||result.examId||'', 
      studentId: result.studentId?._id||result.studentId||'', 
      marks: result.marks ?? '', 
      grade: result.grade||'', 
      remarks: result.remarks||'', 
      status: result.status||'pass' 
    });
    await Promise.all([fetchExams(), fetchStudentsByClass(true)]);
    setShowEditResult(true);
  };

  const handleUpdateResult = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API_BASE}/api/exam/results/${editingResultId}`, { method: 'PUT', headers: authH(), body: JSON.stringify(editResultForm) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed');
      toast.success('Result updated'); setShowEditResult(false); setEditingResultId(null); fetchResults();
    } catch (err) { toast.error(err.message || 'Failed to update result'); }
  };

  /* ── delete ── */
  const handleDeleteResult = async (result) => {
    const c = await Swal.fire({ title: 'Delete Result?', html: `Delete result for <strong>${result.studentId?.name || 'this student'}</strong>?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', confirmButtonText: 'Delete' });
    if (!c.isConfirmed) return;
    try {
      const r = await fetch(`${API_BASE}/api/exam/results/${result._id}`, { method: 'DELETE', headers: authH() });
      if (!r.ok) throw new Error();
      toast.success('Result deleted'); fetchResults();
    } catch { toast.error('Failed to delete result'); }
  };

  /* ── bulk upload ── */
  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) { toast.error('Select a CSV file'); return; }
    const fd = new FormData(); fd.append('file', csvFile);
    try {
      const r = await fetch(`${API_BASE}/api/exam/results/bulk-upload`, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: fd });
      if (!r.ok) throw new Error();
      const d = await r.json();
      Swal.fire({ title: 'Upload Complete!', html: `<strong>${d.count || 0}</strong> results uploaded.${d.errors?.length ? `<p class="text-xs text-red-500 mt-2">${d.errors.slice(0,3).join('<br/>')}</p>` : ''}`, icon: d.errors?.length ? 'warning' : 'success' });
      setShowBulkUpload(false); setCSVFile(null); fetchResults();
    } catch { toast.error('Failed to upload CSV'); }
  };

  const downloadCSVTemplate = () => {
    const blob = new Blob(['examId,studentId,marks,grade,remarks,status\n'], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'results_template.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    if (!filteredResults.length) { toast.error('No results to export'); return; }
    const hdr = ['Student', 'Roll', 'Class', 'Section', 'Exam', 'Subject', 'Marks', 'Grade', 'Status'];
    const rows = filteredResults.map(r => [r.studentId?.name||'N/A', r.studentId?.roll||'N/A', r.studentId?.grade||'N/A', r.studentId?.section||'N/A', r.examId?.title||'N/A', r.examId?.subject||'N/A', r.marks||0, r.grade||'N/A', r.status||'N/A']);
    const csv = [hdr.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `results_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.success('Exported successfully');
  };

  /* ── computed ── */
  const uniqueSubjects = [...new Set(results.map(r => r.examId?.subject).filter(Boolean))];

  const filteredResults = results.filter(r => {
    const name = (r.studentId?.name||'').toLowerCase();
    const subj = (r.examId?.subject||'').toLowerCase();
    const q = searchTerm.toLowerCase();
    return (!q || name.includes(q) || subj.includes(q)) &&
      (!selectedClass || r.studentId?.grade === selectedClass) &&
      (!selectedSection || r.studentId?.section === selectedSection) &&
      (filterSubject === 'all' || r.examId?.subject === filterSubject);
  });

  const stats = {
    total: filteredResults.length,
    pass: filteredResults.filter(r => r.status?.toLowerCase() === 'pass').length,
    fail: filteredResults.filter(r => r.status?.toLowerCase() === 'fail').length,
    absent: filteredResults.filter(r => r.status?.toLowerCase() === 'absent').length,
  };

  const passRate = stats.total > 0 ? Math.round((stats.pass / stats.total) * 100) : 0;

  /* ── result form fields (reusable) ── */
  const renderResultFields = (form, setForm) => {
    const selectedExam = exams.find(ex => ex._id === form.examId);

    const handleMarksChange = (e) => {
      const marks = e.target.value;
      let newGrade = form.grade;
      if (selectedExam?.marks && marks !== '') {
        const percentage = (Number(marks) / Number(selectedExam.marks)) * 100;
        if (percentage >= 90) newGrade = 'A+';
        else if (percentage >= 80) newGrade = 'A';
        else if (percentage >= 70) newGrade = 'B';
        else if (percentage >= 60) newGrade = 'C';
        else if (percentage >= 50) newGrade = 'D';
        else newGrade = 'F';
      }
      setForm({ ...form, marks, grade: newGrade });
    };

    const formSections = sections.filter(s => {
      if (!form.className) return true;
      const cls = classes.find(c => c.name === form.className);
      return cls ? s.classId === cls._id || s.classId?._id === cls._id : true;
    });

    const filteredStudents = students.filter(s => {
      const matchSession = !form.session || s.academicYear === form.session || s.session === form.session;
      const matchClass = !form.className || normalizeClass(s.grade || s.class || '') === normalizeClass(form.className);
      const matchSection = !form.sectionName || normSec(s.section || '') === normSec(form.sectionName);
      return matchSession && matchClass && matchSection;
    });

    return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Session">
          <select value={form.session || ''} onChange={e => setForm({...form, session: e.target.value, studentId: ''})} className={inp}>
            <option value="">All Sessions</option>
            {[...new Set(students.map(s => s.academicYear || s.session).filter(Boolean))].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </Field>
        <Field label="Class">
          <select value={form.className || ''} onChange={e => setForm({...form, className: e.target.value, sectionName: '', studentId: ''})} className={inp}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Section">
          <select value={form.sectionName || ''} onChange={e => setForm({...form, sectionName: e.target.value, studentId: ''})} className={inp}>
            <option value="">All Sections</option>
            {formSections.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
          </select>
        </Field>
      </div>
      
      <Field label="Student">
        <select value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} required disabled={loadingStudents} className={`${inp} disabled:opacity-60`}>
          <option value="">{loadingStudents ? 'Loading…' : filteredStudents.length === 0 ? 'No students found' : 'Choose a student…'}</option>
          {filteredStudents.map(s => <option key={s._id} value={s._id}>{formatStudentDisplay(s)}</option>)}
        </select>
        {!loadingStudents && filteredStudents.length > 0 && <p className="text-xs text-slate-400 mt-1">{filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} available</p>}
      </Field>

      <Field label="Exam">
        <select value={form.examId} onChange={e => setForm({...form, examId: e.target.value, marks: '', grade: ''})} required className={inp}>
          <option value="">Choose an exam…</option>
          {exams.map(ex => <option key={ex._id} value={ex._id}>{ex.title} – {ex.subject} ({ex.term}) {ex.marks ? `[Max: ${ex.marks}]` : ''}</option>)}
        </select>
        {!exams.length && <p className="text-xs text-indigo-500 mt-1">No exams found. Create exams from Exam Management.</p>}
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Marks">
          <input type="number" value={form.marks} onChange={handleMarksChange} required min="0" max={selectedExam?.marks || undefined} className={inp} placeholder="0" />
        </Field>
        <Field label="Grade">
          <input type="text" value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} className={inp} placeholder="A, B, C…" />
        </Field>
      </div>
      <Field label="Status">
        <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className={inp}>
          <option value="pass">Pass</option>
          <option value="fail">Fail</option>
          <option value="absent">Absent</option>
        </select>
      </Field>
      <Field label="Remarks">
        <textarea value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} rows="2" className={`${inp} resize-none`} placeholder="Optional remarks…" />
      </Field>
    </div>
    );
  };

  /* ════════════ RENDER ════════════ */
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
              <FileSpreadsheet size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Result Management</h1>
              <p className="text-xs text-slate-500">Record marks and publish student results</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => { fetchResults(); fetchExams(); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
              <RefreshCw size={13} /> Refresh
            </button>
            <button onClick={() => { window.location.href = '/admin/examination'; }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-xs text-indigo-700 hover:bg-indigo-100 transition-colors font-semibold">
              <BookOpen size={13} /> Exam Manager
            </button>
            <button onClick={() => setShowBulkUpload(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
              <FileUp size={13} /> Bulk Upload
            </button>
            <button onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
              <FileDown size={13} /> Export
            </button>
            <button onClick={handlePublishResults} disabled={!selectedClass}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${selectedClass ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
              <Send size={13} /> Publish
            </button>
            <button onClick={async () => { await Promise.all([fetchExams(), fetchStudentsByClass(true)]); setShowAddResult(true); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors">
              <Plus size={13} /> Add Result
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Results" value={stats.total} icon={FileSpreadsheet} bg="bg-white" border="border-slate-200" text="text-slate-700" />
          <StatCard label="Passed" value={stats.pass} icon={CheckCircle} bg="bg-emerald-50" border="border-emerald-100" text="text-emerald-600" />
          <StatCard label="Failed" value={stats.fail} icon={XCircle} bg="bg-red-50" border="border-red-100" text="text-red-600" />
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Pass Rate</p>
              <TrendingUp size={18} className="text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-indigo-600">{passRate}%</p>
            <div className="mt-2 h-1.5 rounded-full bg-indigo-100 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${passRate}%` }} />
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search student or subject…"
                className="pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 w-52" />
            </div>
            <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(''); }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none min-w-[120px]">
              <option value="">All Classes</option>
              {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
            <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none min-w-[120px]">
              <option value="">All Sections</option>
              {sections.filter(s => !selectedClass || classes.find(c => c.name === selectedClass)?._id === (s.classId?._id||s.classId)).map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
            </select>
            <div className="relative">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 py-2.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none min-w-[140px]">
                <option value="all">All Subjects</option>
                {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <span className="ml-auto text-xs text-slate-400 font-medium">{filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* ── Results Table ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={28} className="animate-spin text-indigo-400" />
              <p className="text-sm text-slate-400">Loading results…</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <FileSpreadsheet size={22} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-500">No results found</p>
              <p className="text-xs text-slate-400">Try adjusting filters or add a new result</p>
              <button onClick={async () => { await Promise.all([fetchExams(), fetchStudentsByClass(true)]); setShowAddResult(true); }}
                className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                <Plus size={13} /> Add Result
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Student', 'Exam / Subject', 'Marks', 'Grade', 'Status', 'Visibility', ''].map((h, i) => (
                      <th key={i} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredResults.map((result, i) => {
                    const statusKey = result.status?.toLowerCase();
                    const statusStyle = STATUS_STYLE[statusKey] || 'bg-blue-50 text-blue-700 border border-blue-100';
                    return (
                      <tr key={result._id || i} className="hover:bg-indigo-50/20 transition-colors group">
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-slate-800">{result.studentId?.name || 'N/A'}</p>
                          <p className="text-xs text-slate-400 mt-0.5">Roll {result.studentId?.roll || '—'} · Class {result.studentId?.grade || '—'} {result.studentId?.section || ''}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-slate-700">{result.examId?.title || 'N/A'}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{result.examId?.subject || '—'}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <Award size={13} className="text-amber-400" />
                            <span className="font-bold text-slate-800">{result.marks ?? '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-slate-700 text-base">{result.grade || '—'}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize ${statusStyle}`}>
                            {result.status || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => handleTogglePublish(result._id, !result.published)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${result.published ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>
                            {result.published ? <Eye size={11} /> : <EyeOff size={11} />}
                            {result.published ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditResult(result)}
                              className="h-7 w-7 flex items-center justify-center rounded-lg text-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => handleDeleteResult(result)}
                              className="h-7 w-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
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
      </div>

      {/* ═══ ADD RESULT MODAL ═══ */}
      <Modal show={showAddResult} onClose={() => setShowAddResult(false)} title="Add Result" subtitle="Record a student's exam result" icon={Plus} iconColor="bg-indigo-600">
        <form onSubmit={handleAddResult} className="space-y-4">
          {renderResultFields(resultForm, setResultForm)}
          <div className="flex justify-end gap-2.5 pt-2">
            <button type="button" onClick={() => setShowAddResult(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-200">Add Result</button>
          </div>
        </form>
      </Modal>

      {/* ═══ EDIT RESULT MODAL ═══ */}
      <Modal show={showEditResult} onClose={() => setShowEditResult(false)} title="Edit Result" subtitle="Update result details" icon={Edit2} iconColor="bg-slate-600">
        <form onSubmit={handleUpdateResult} className="space-y-4">
          {renderResultFields(editResultForm, setEditResultForm)}
          <div className="flex justify-end gap-2.5 pt-2">
            <button type="button" onClick={() => setShowEditResult(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-200">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* ═══ BULK UPLOAD MODAL ═══ */}
      <Modal show={showBulkUpload} onClose={() => setShowBulkUpload(false)} title="Bulk Upload Results" subtitle="Upload a CSV file to add multiple results" icon={FileUp} iconColor="bg-violet-600" maxWidth="sm:max-w-lg">
        <form onSubmit={handleBulkUpload} className="space-y-4">
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <FileUp size={28} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600 mb-1">Select your CSV file</p>
            <p className="text-xs text-slate-400 mb-4">Columns: examId, studentId, marks, grade, remarks, status</p>
            <input type="file" accept=".csv" onChange={e => setCSVFile(e.target.files[0])} required
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100" />
            {csvFile && <p className="mt-2 text-xs text-emerald-600 font-medium">✓ {csvFile.name}</p>}
          </div>
          <button type="button" onClick={downloadCSVTemplate}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <FileDown size={14} /> Download CSV Template
          </button>
          <div className="flex justify-end gap-2.5 pt-1">
            <button type="button" onClick={() => setShowBulkUpload(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 shadow-md shadow-violet-200">Upload Results</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Result;