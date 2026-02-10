import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, XCircle, FileText, Eye } from 'lucide-react';

const ExcuseLetters = () => {
  const API_BASE = useMemo(
    () => (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '').replace(/\/api$/, ''),
    []
  );
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [previewLetter, setPreviewLetter] = useState(null);

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

  useEffect(() => {
    loadLetters();
  }, []);

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
    } catch (err) {
      setError(err.message || 'Unable to update');
    } finally {
      setUpdatingId('');
    }
  };

  const reasonTypes = [
    { value: 'illness', label: 'Illness/Medical' },
    { value: 'family', label: 'Family Emergency' },
    { value: 'personal', label: 'Personal Reasons' },
    { value: 'travel', label: 'Travel/Vacation' },
    { value: 'appointment', label: 'Medical Appointment' },
    { value: 'other', label: 'Other' }
  ];

  const generateLetterPreview = (letter) => {
    const typeLabel = reasonTypes.find((r) => r.value === letter.reasonType)?.label || letter.reasonType;
    return `
Date: ${new Date(letter.createdAt || Date.now()).toLocaleDateString()}

To,
The Principal/Class Teacher
${letter.schoolName || 'School'}

Subject: Request for Leave of Absence

Dear Sir/Madam,

I am writing to inform you that my ward, ${letter.studentName}, studying in Class ${letter.className}-${letter.sectionName}, Roll Number: ${letter.rollNumber}, will not be able to attend school from ${new Date(letter.dateFrom).toLocaleDateString()} to ${new Date(letter.dateTo).toLocaleDateString()}.

Reason for absence: ${letter.reason}
Type: ${typeLabel}

${letter.additionalNotes ? `Additional Information: ${letter.additionalNotes}` : ''}

I kindly request you to grant permission for the leave and excuse the absence.

Thank you for your consideration.

Yours sincerely,
${letter.parentName || 'Parent/Guardian'}
(Parent/Guardian)

Contact Details:
Email: ${letter.parentEmail || ''}
Phone: ${letter.parentPhone || ''}
Emergency Contact: ${letter.emergencyContact || ''}
    `.trim();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Excuse Letters</h2>
            <p className="text-sm text-slate-500">Review and approve student leave requests</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading && <div className="text-sm text-slate-500">Loading letters...</div>}
        {!loading && letters.length === 0 && (
          <div className="text-sm text-slate-500">No excuse letters available.</div>
        )}
        <div className="space-y-4">
          {letters.map((letter) => (
            <div key={letter._id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{letter.studentName}</p>
                  <p className="text-xs text-slate-500">
                    Class {letter.className}-{letter.sectionName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(letter.dateFrom).toLocaleDateString()} → {new Date(letter.dateTo).toLocaleDateString()}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  letter.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  letter.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {letter.status || 'pending'}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-700">{letter.reason}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setPreviewLetter(letter)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Eye size={14} /> Preview
                </button>
                <button
                  onClick={() => updateStatus(letter._id, 'approved')}
                  disabled={updatingId === letter._id}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  <CheckCircle size={14} /> Approve
                </button>
                <button
                  onClick={() => updateStatus(letter._id, 'rejected')}
                  disabled={updatingId === letter._id}
                  className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </div>
            ))}
        </div>
      </div>

      {previewLetter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Letter Preview</h3>
              <button onClick={() => setPreviewLetter(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {generateLetterPreview(previewLetter)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcuseLetters;
