import React, { useEffect, useMemo, useState } from 'react';
import {
  FileText, Send, Calendar, User, CheckCircle, XCircle, Download, Eye,
  Clock, ChevronRight, X, Loader2, AlertTriangle, Plus, History,
  Phone, Mail, Hash, BookOpen,
} from 'lucide-react';

const STATUS_MAP = {
  approved: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle, dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: XCircle, dot: 'bg-rose-500' },
  pending:  { label: 'Pending',  bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, dot: 'bg-amber-500' },
};

const REASON_TYPES = [
  { value: 'illness',     label: 'Illness / Medical',   icon: '🏥' },
  { value: 'family',      label: 'Family Emergency',    icon: '👨‍👩‍👧‍👦' },
  { value: 'personal',    label: 'Personal Reasons',    icon: '🏠' },
  { value: 'travel',      label: 'Travel / Vacation',   icon: '✈️' },
  { value: 'appointment', label: 'Medical Appointment', icon: '👨‍⚕️' },
  { value: 'other',       label: 'Other',               icon: '📝' },
];

const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const daysBetween = (a, b) => {
  if (!a || !b) return 0;
  const ms = new Date(b) - new Date(a);
  return Math.max(1, Math.ceil(ms / 86400000) + 1);
};

/* ─── Reusable input wrapper ─── */
const Field = ({ label, icon: Icon, children, readOnly }) => (
  <div>
    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </label>
    {children || (
      <div className={`rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm ${readOnly ? 'bg-slate-50 text-slate-600' : 'bg-white text-slate-900'}`} />
    )}
  </div>
);

const ExcuseLetter = () => {
  const API_BASE = useMemo(
    () => (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '').replace(/\/api$/, ''),
    []
  );

  const [formData, setFormData] = useState({
    studentName: '', rollNumber: '', className: '', sectionName: '',
    schoolName: '', parentName: '', parentEmail: '', parentPhone: '',
    dateFrom: '', dateTo: '', reason: '', reasonType: 'illness',
    additionalNotes: '', emergencyContact: '',
  });
  const [submittedLetters, setSubmittedLetters] = useState([]);
  const [activeTab, setActiveTab] = useState('new');
  const [previewLetter, setPreviewLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/student/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      let schoolName = data?.schoolName || data?.schoolInfo?.name || data?.school?.name || '';
      if (!schoolName) {
        const dashboardRes = await fetch(`${API_BASE}/api/student/auth/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (dashboardRes.ok) {
          const dash = await dashboardRes.json().catch(() => ({}));
          schoolName = dash?.profile?.schoolName || dash?.profile?.school?.name || schoolName;
        }
      }
      setFormData((prev) => ({
        ...prev,
        studentName: data?.name || '',
        rollNumber: data?.roll || '',
        className: data?.grade || data?.className || '',
        sectionName: data?.section || data?.sectionName || '',
        schoolName,
        parentName: data?.guardianName || data?.fatherName || data?.motherName || '',
        parentEmail: data?.guardianEmail || data?.email || '',
        parentPhone: data?.guardianPhone || data?.fatherPhone || data?.motherPhone || '',
      }));
    } catch (_) {}
  };

  const loadLetters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/excuse-letters/student`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => []);
      if (res.ok) setSubmittedLetters(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); loadLetters(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const token = localStorage.getItem('token');
      const payload = {
        dateFrom: formData.dateFrom, dateTo: formData.dateTo,
        reason: formData.reason, reasonType: formData.reasonType,
        additionalNotes: formData.additionalNotes, emergencyContact: formData.emergencyContact,
      };
      const res = await fetch(`${API_BASE}/api/excuse-letters/student`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Unable to submit');
      await loadLetters();
      setFormData((prev) => ({
        ...prev, dateFrom: '', dateTo: '', reason: '', reasonType: 'illness',
        additionalNotes: '', emergencyContact: '',
      }));
      setSuccess('Excuse letter submitted successfully!');
      setTimeout(() => { setSuccess(''); setActiveTab('history'); }, 1500);
    } catch (err) {
      setError(err.message || 'Unable to submit');
    } finally {
      setSaving(false);
    }
  };

  const generateLetterPreview = (letter) => {
    const d = letter || formData;
    return `Date: ${new Date().toLocaleDateString()}

To,
The Principal / Class Teacher
${d.schoolName || 'School'}

Subject: Request for Leave of Absence

Dear Sir/Madam,

I am writing to inform you that my ward, ${d.studentName}, studying in Class ${d.className}-${d.sectionName}, Roll Number: ${d.rollNumber}, will not be able to attend school from ${fmtDate(d.dateFrom)} to ${fmtDate(d.dateTo)}.

Reason for absence: ${d.reason}
Type: ${REASON_TYPES.find((r) => r.value === d.reasonType)?.label || d.reasonType}
${d.additionalNotes ? `\nAdditional Information: ${d.additionalNotes}` : ''}

I kindly request you to grant permission for the leave and excuse the absence.

Thank you for your consideration.

Yours sincerely,
${d.parentName}
(Parent/Guardian)

Contact Details:
Email: ${d.parentEmail}
Phone: ${d.parentPhone}${d.emergencyContact ? `\nEmergency Contact: ${d.emergencyContact}` : ''}`;
  };

  const downloadLetter = (letter) => {
    const content = generateLetterPreview(letter);
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `excuse_letter_${letter.studentName || 'student'}_${letter.dateFrom}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const leaveDays = daysBetween(formData.dateFrom, formData.dateTo);

  const pendingCount = submittedLetters.filter((l) => (l.status || 'pending') === 'pending').length;
  const approvedCount = submittedLetters.filter((l) => l.status === 'approved').length;

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* ─── Header ─── */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Excuse Letters</h1>
              <p className="text-xs text-slate-500">Submit and track leave applications</p>
            </div>
          </div>

          {/* Mini stats */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-700">
              <Clock className="h-3 w-3" /> {pendingCount} Pending
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle className="h-3 w-3" /> {approvedCount} Approved
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6">
        <div className="flex gap-1">
          <button type="button" onClick={() => setActiveTab('new')}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'new'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            <Plus className="h-3.5 w-3.5" /> New Letter
          </button>
          <button type="button" onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            <History className="h-3.5 w-3.5" /> History
            {submittedLetters.length > 0 && (
              <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                {submittedLetters.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ═══════ NEW LETTER TAB ═══════ */}
      {activeTab === 'new' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-3xl space-y-5">
            {/* Alerts */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle className="h-4 w-4 shrink-0" /> {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Student Info — compact read-only card */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
                  <User className="h-4 w-4 text-indigo-600" />
                  <h2 className="text-sm font-semibold text-slate-800">Student Information</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100">
                  {[
                    { label: 'Name', value: formData.studentName, icon: User },
                    { label: 'Roll No', value: formData.rollNumber, icon: Hash },
                    { label: 'Class', value: formData.className, icon: BookOpen },
                    { label: 'Section', value: formData.sectionName, icon: BookOpen },
                  ].map((item) => (
                    <div key={item.label} className="bg-white px-4 py-3">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-800 truncate">{item.value || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parent Info — compact card */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
                  <User className="h-4 w-4 text-indigo-600" />
                  <h2 className="text-sm font-semibold text-slate-800">Parent / Guardian</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100">
                  {[
                    { label: 'Name', value: formData.parentName, icon: User },
                    { label: 'Email', value: formData.parentEmail, icon: Mail },
                    { label: 'Phone', value: formData.parentPhone, icon: Phone },
                  ].map((item) => (
                    <div key={item.label} className="bg-white px-4 py-3">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-800 truncate">{item.value || '—'}</p>
                    </div>
                  ))}
                  <div className="bg-white px-4 py-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Emergency</p>
                    <input type="tel" name="emergencyContact" value={formData.emergencyContact}
                      onChange={handleInputChange} placeholder="Contact no."
                      className="w-full text-sm font-medium text-slate-800 bg-transparent border-0 border-b border-dashed border-slate-300 focus:border-indigo-500 focus:ring-0 px-0 py-0.5 placeholder:text-slate-300" />
                  </div>
                </div>
              </div>

              {/* Leave Details */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <h2 className="text-sm font-semibold text-slate-800">Leave Details</h2>
                </div>

                {/* Date row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">From Date</label>
                    <input type="date" name="dateFrom" value={formData.dateFrom} onChange={handleInputChange} required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">To Date</label>
                    <input type="date" name="dateTo" value={formData.dateTo} onChange={handleInputChange} required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
                  </div>
                  {formData.dateFrom && formData.dateTo && (
                    <div className="flex flex-col justify-end">
                      <div className="rounded-lg bg-indigo-50 border border-indigo-200 px-3.5 py-2.5 text-center">
                        <p className="text-lg font-bold text-indigo-700">{leaveDays}</p>
                        <p className="text-[10px] font-semibold text-indigo-500 uppercase">Day{leaveDays !== 1 ? 's' : ''} Leave</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reason type chips */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Reason Type</label>
                  <div className="flex flex-wrap gap-2">
                    {REASON_TYPES.map((type) => (
                      <button key={type.value} type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, reasonType: type.value }))}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium border transition ${
                          formData.reasonType === type.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}>
                        <span className="text-base">{type.icon}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason text */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Reason for Leave</label>
                  <textarea name="reason" value={formData.reason} onChange={handleInputChange} rows={3} required
                    placeholder="Please describe the reason for your leave..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none" />
                </div>

                {/* Additional notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Additional Notes <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} rows={2}
                    placeholder="Any additional information..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none" />
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between">
                <button type="button"
                  onClick={() => setPreviewLetter(formData)}
                  disabled={!formData.reason || !formData.dateFrom}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed">
                  <Eye className="h-4 w-4" /> Preview
                </button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {saving ? 'Submitting...' : 'Submit Letter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════ HISTORY TAB ═══════ */}
      {activeTab === 'history' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-3xl space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                <span className="ml-2 text-sm text-slate-500">Loading letters...</span>
              </div>
            )}

            {!loading && submittedLetters.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
                <FileText className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-600">No letters submitted yet</p>
                <p className="text-xs text-slate-400 mt-1">Your submitted excuse letters will appear here.</p>
                <button type="button" onClick={() => setActiveTab('new')}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition">
                  <Plus className="h-3.5 w-3.5" /> Write New Letter
                </button>
              </div>
            )}

            {!loading && submittedLetters.map((letter) => {
              const st = STATUS_MAP[letter.status] || STATUS_MAP.pending;
              const StIcon = st.icon;
              const days = daysBetween(letter.dateFrom, letter.dateTo);
              return (
                <div key={letter._id || letter.id}
                  className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
                  {/* Top bar */}
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${st.dot}`} />
                      <span className={`text-xs font-semibold ${st.text}`}>{st.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Submitted {fmtDate(letter.createdAt || letter.submittedOn)}
                    </span>
                  </div>

                  <div className="p-5">
                    {/* Dates row */}
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {fmtDate(letter.dateFrom)}
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                        {fmtDate(letter.dateTo)}
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {days} day{days !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Reason type + reason */}
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 mb-1.5">
                        {REASON_TYPES.find((r) => r.value === letter.reasonType)?.icon || '📝'}
                        {REASON_TYPES.find((r) => r.value === letter.reasonType)?.label || letter.reasonType}
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed">{letter.reason}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <button type="button" onClick={() => setPreviewLetter(letter)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition">
                        <Eye className="h-3 w-3" /> Preview
                      </button>
                      <button type="button" onClick={() => downloadLetter(letter)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition">
                        <Download className="h-3 w-3" /> Download
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════ PREVIEW MODAL ═══════ */}
      {previewLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                <h3 className="font-semibold text-slate-900">Letter Preview</h3>
              </div>
              <button type="button" onClick={() => setPreviewLetter(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Letter content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-slate-50 p-6">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
                  {generateLetterPreview(previewLetter)}
                </pre>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-3 shrink-0">
              <button type="button" onClick={() => setPreviewLetter(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                Close
              </button>
              <button type="button" onClick={() => { downloadLetter(previewLetter); setPreviewLetter(null); }}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition">
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcuseLetter;
