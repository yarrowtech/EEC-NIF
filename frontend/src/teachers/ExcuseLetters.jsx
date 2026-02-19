import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle, XCircle, FileText, Eye, Calendar,
  User, Phone, RefreshCw, X, AlertCircle, Clock, Mail,
} from 'lucide-react';

const STATUS_CFG = {
  approved: { label: 'Approved', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', accent: 'border-l-emerald-500' },
  rejected:  { label: 'Rejected', bg: 'bg-rose-100',   text: 'text-rose-700',   dot: 'bg-rose-500',   accent: 'border-l-rose-500'   },
  pending:   { label: 'Pending',  bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500',  accent: 'border-l-amber-500'  },
};

const REASON_LABELS = {
  illness:     'Illness / Medical',
  family:      'Family Emergency',
  personal:    'Personal Reasons',
  travel:      'Travel / Vacation',
  appointment: 'Medical Appointment',
  other:       'Other',
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const daysBetween = (from, to) =>
  Math.max(1, Math.round((new Date(to) - new Date(from)) / 86400000) + 1);

const TABS = [
  { key: 'all',      label: 'All' },
  { key: 'pending',  label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const ExcuseLetters = () => {
  const API_BASE = useMemo(
    () => (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '').replace(/\/api$/, ''),
    []
  );
  const [letters, setLetters]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [previewLetter, setPreviewLetter] = useState(null);
  const [activeFilter, setActiveFilter]   = useState('all');

  const loadLetters = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/excuse-letters/teacher`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.error || 'Unable to load letters');
      setLetters(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load letters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLetters(); }, []);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/excuse-letters/teacher/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Unable to update');
      setLetters((prev) => prev.map((l) => (l._id === id ? data : l)));
      if (previewLetter?._id === id) setPreviewLetter(data);
    } catch (err) {
      setError(err.message || 'Unable to update');
    } finally {
      setUpdatingId('');
    }
  };

  const stats = useMemo(() => ({
    total:    letters.length,
    pending:  letters.filter(l => (l.status || 'pending') === 'pending').length,
    approved: letters.filter(l => l.status === 'approved').length,
    rejected: letters.filter(l => l.status === 'rejected').length,
  }), [letters]);

  const filteredLetters = useMemo(
    () => activeFilter === 'all' ? letters : letters.filter(l => (l.status || 'pending') === activeFilter),
    [letters, activeFilter]
  );

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-white rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-12 bg-white rounded-2xl animate-pulse" />
        {[1,2,3].map(i => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <FileText size={20} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Excuse Letters</h1>
            <p className="text-xs text-gray-500">Review and approve student leave requests</p>
          </div>
        </div>
        <button
          onClick={loadLetters}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <RefreshCw size={13} />
          Reload
        </button>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Letters', value: stats.total,    gradient: 'from-indigo-500 to-violet-500' },
          { label: 'Pending',       value: stats.pending,  gradient: 'from-amber-400 to-orange-500'  },
          { label: 'Approved',      value: stats.approved, gradient: 'from-emerald-500 to-teal-500'  },
          { label: 'Rejected',      value: stats.rejected, gradient: 'from-rose-500 to-pink-500'     },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className={`w-8 h-1.5 rounded-full bg-linear-to-r ${s.gradient} mb-3`} />
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-2">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          {TABS.map(tab => {
            const count = tab.key === 'all' ? stats.total : stats[tab.key];
            const active = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    active ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Letters list ───────────────────────────────────────────────────── */}
      {filteredLetters.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <FileText size={24} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">
            {activeFilter === 'all' ? 'No excuse letters yet' : `No ${activeFilter} letters`}
          </p>
          <p className="text-xs text-gray-400 mt-1">Letters submitted by parents will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLetters.map((letter) => {
            const status = letter.status || 'pending';
            const cfg    = STATUS_CFG[status] || STATUS_CFG.pending;
            const days   = daysBetween(letter.dateFrom, letter.dateTo);
            const reasonLabel = REASON_LABELS[letter.reasonType] || letter.reasonType || 'Other';
            const isBusy = updatingId === letter._id;

            return (
              <div
                key={letter._id}
                className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${cfg.accent} overflow-hidden hover:shadow-md transition-shadow duration-200`}
              >
                <div className="p-4 sm:p-5">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <User size={16} className="text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{letter.studentName}</p>
                        <p className="text-xs text-gray-500">
                          Class {letter.className}
                          {letter.sectionName && `-${letter.sectionName}`}
                          {letter.rollNumber && <span className="ml-1.5 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md">Roll {letter.rollNumber}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Date range */}
                  <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-indigo-500" />
                      {fmtDate(letter.dateFrom)} → {fmtDate(letter.dateTo)}
                      <span className="bg-indigo-50 text-indigo-600 font-semibold px-1.5 py-0.5 rounded-md">{days} day{days > 1 ? 's' : ''}</span>
                    </span>
                    {letter.createdAt && (
                      <span className="flex items-center gap-1 text-gray-400">
                        <Clock size={11} />
                        Submitted {fmtDate(letter.createdAt)}
                      </span>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="mb-3">
                    <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mb-1.5">
                      {reasonLabel}
                    </span>
                    <p className="text-sm text-gray-700 line-clamp-2">{letter.reason}</p>
                  </div>

                  {/* Parent info */}
                  {(letter.parentName || letter.parentPhone || letter.parentEmail) && (
                    <div className="flex flex-wrap gap-3 mb-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      {letter.parentName && (
                        <span className="flex items-center gap-1">
                          <User size={11} className="text-gray-400" />
                          {letter.parentName}
                        </span>
                      )}
                      {letter.parentPhone && (
                        <span className="flex items-center gap-1">
                          <Phone size={11} className="text-gray-400" />
                          {letter.parentPhone}
                        </span>
                      )}
                      {letter.parentEmail && (
                        <span className="flex items-center gap-1">
                          <Mail size={11} className="text-gray-400" />
                          {letter.parentEmail}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setPreviewLetter(letter)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      <Eye size={13} /> View Letter
                    </button>
                    {status !== 'approved' && (
                      <button
                        onClick={() => updateStatus(letter._id, 'approved')}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        <CheckCircle size={13} />
                        {isBusy ? 'Updating…' : 'Approve'}
                      </button>
                    )}
                    {status !== 'rejected' && (
                      <button
                        onClick={() => updateStatus(letter._id, 'rejected')}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        <XCircle size={13} />
                        {isBusy ? 'Updating…' : 'Reject'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Preview modal ──────────────────────────────────────────────────── */}
      {previewLetter && (() => {
        const letter = previewLetter;
        const status = letter.status || 'pending';
        const cfg    = STATUS_CFG[status] || STATUS_CFG.pending;
        const reasonLabel = REASON_LABELS[letter.reasonType] || letter.reasonType || 'Other';
        const isBusy = updatingId === letter._id;
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600" />
                  <h3 className="text-sm font-bold text-gray-900">Excuse Letter</h3>
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>
                <button onClick={() => setPreviewLetter(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Modal body — formal letter */}
              <div className="overflow-y-auto flex-1 px-6 py-5">
                {/* Letterhead */}
                <div className="text-center mb-6 pb-4 border-b border-gray-100">
                  <p className="text-base font-bold text-gray-900">{letter.schoolName || 'School'}</p>
                  {letter.schoolAddress && (
                    <p className="text-xs text-gray-500 mt-0.5">{letter.schoolAddress}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">Leave Application</p>
                </div>

                <div className="space-y-4 text-sm text-gray-700">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Date: {fmtDate(letter.createdAt || Date.now())}</span>
                    <span className="inline-flex items-center gap-1 font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {reasonLabel}
                    </span>
                  </div>

                  <div>
                    <p className="font-medium text-gray-600 text-xs mb-0.5">To,</p>
                    <p>The Principal / Class Teacher</p>
                    <p className="text-gray-500">{letter.schoolName || 'School'}</p>
                    {letter.schoolAddress && <p className="text-gray-500">{letter.schoolAddress}</p>}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900 underline underline-offset-2 text-center">
                      Subject: Request for Leave of Absence
                    </p>
                  </div>

                  <div className="leading-relaxed">
                    <p>Dear Sir/Madam,</p>
                    <p className="mt-2">
                      I am writing to inform you that my ward,{' '}
                      <span className="font-semibold text-gray-900">{letter.studentName}</span>, studying in{' '}
                      Class {letter.className}{letter.sectionName ? `-${letter.sectionName}` : ''}{letter.rollNumber ? `, Roll No. ${letter.rollNumber}` : ''},
                      will not be able to attend school from{' '}
                      <span className="font-semibold text-gray-900">{fmtDate(letter.dateFrom)}</span> to{' '}
                      <span className="font-semibold text-gray-900">{fmtDate(letter.dateTo)}</span>{' '}
                      ({daysBetween(letter.dateFrom, letter.dateTo)} day{daysBetween(letter.dateFrom, letter.dateTo) > 1 ? 's' : ''}).
                    </p>
                    <p className="mt-2">
                      <span className="font-medium text-gray-600">Reason:</span> {letter.reason}
                    </p>
                    {letter.additionalNotes && (
                      <p className="mt-1">
                        <span className="font-medium text-gray-600">Additional notes:</span> {letter.additionalNotes}
                      </p>
                    )}
                    <p className="mt-3">
                      I kindly request you to grant permission for the leave and excuse the absence.
                    </p>
                    <p className="mt-1">Thank you for your consideration.</p>
                  </div>

                  <div className="pt-2">
                    <p>Yours sincerely,</p>
                    <p className="font-semibold text-gray-900 mt-1">{letter.parentName || 'Parent/Guardian'}</p>
                    <p className="text-gray-500 text-xs">Parent / Guardian</p>
                  </div>

                  {(letter.parentEmail || letter.parentPhone || letter.emergencyContact) && (
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1 text-xs">
                      <p className="font-semibold text-gray-600 mb-1">Contact Details</p>
                      {letter.parentEmail && (
                        <p className="flex items-center gap-1.5 text-gray-600">
                          <Mail size={11} className="text-gray-400" /> {letter.parentEmail}
                        </p>
                      )}
                      {letter.parentPhone && (
                        <p className="flex items-center gap-1.5 text-gray-600">
                          <Phone size={11} className="text-gray-400" /> {letter.parentPhone}
                        </p>
                      )}
                      {letter.emergencyContact && (
                        <p className="flex items-center gap-1.5 text-gray-600">
                          <Phone size={11} className="text-red-400" /> Emergency: {letter.emergencyContact}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal footer — actions */}
              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={() => setPreviewLetter(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                {status !== 'rejected' && (
                  <button
                    onClick={() => updateStatus(letter._id, 'rejected')}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60 transition-colors"
                  >
                    <XCircle size={14} />
                    {isBusy ? 'Updating…' : 'Reject'}
                  </button>
                )}
                {status !== 'approved' && (
                  <button
                    onClick={() => updateStatus(letter._id, 'approved')}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                  >
                    <CheckCircle size={14} />
                    {isBusy ? 'Updating…' : 'Approve'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ExcuseLetters;
