import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CalendarX, Edit2, Loader2, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatDate = (value) => {
  if (!value) return '—';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDateRange = (startValue, endValue) => {
  const start = formatDate(startValue);
  const end = formatDate(endValue || startValue);
  if (start === end) return start;
  return `${start} → ${end}`;
};

const getDuration = (startValue, endValue) => {
  const s = new Date(startValue);
  const e = new Date(endValue || startValue);
  const days = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return days === 1 ? '1 day' : `${days} days`;
};

const toDateInputValue = (value) => {
  const dt = value ? new Date(value) : new Date();
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const PALETTE = [
  'bg-amber-100 text-amber-800',
  'bg-orange-100 text-orange-800',
  'bg-rose-100 text-rose-800',
  'bg-violet-100 text-violet-800',
  'bg-sky-100 text-sky-800',
  'bg-emerald-100 text-emerald-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
];

const HolidayList = ({ setShowAdminHeader }) => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState({
    name: '',
    startDate: toDateInputValue(),
    endDate: toDateInputValue(),
  });

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem('token') || '';
    return {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    };
  }, []);

  useEffect(() => {
    setShowAdminHeader?.(true);
  }, [setShowAdminHeader]);

  const loadHolidays = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/holidays/admin`, {
        method: 'GET',
        headers: authHeaders,
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.error || 'Failed to load holidays');
      setHolidays(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Unable to load holidays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays().catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const name = String(form.name || '').trim();
    const startDate = String(form.startDate || '').trim();
    const endDate = String(form.endDate || '').trim();
    if (!name || !startDate || !endDate) {
      toast.error('Holiday name, start date and end date are required');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date cannot be before start date');
      return;
    }
    setSaving(true);
    try {
      const isEdit = Boolean(editingId);
      const res = await fetch(`${API_BASE}/api/holidays${isEdit ? `/${editingId}` : ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify({ name, startDate, endDate }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || (isEdit ? 'Failed to update holiday' : 'Failed to add holiday'));
      toast.success(isEdit ? 'Holiday updated' : 'Holiday added');
      setEditingId('');
      setForm({ name: '', startDate: toDateInputValue(), endDate: toDateInputValue() });
      await loadHolidays();
    } catch (err) {
      toast.error(err.message || 'Failed to save holiday');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    if (!item?._id) return;
    setEditingId(item._id);
    setForm({
      name: item.name || '',
      startDate: toDateInputValue(item.startDate || item.date),
      endDate: toDateInputValue(item.endDate || item.startDate || item.date),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId('');
    setForm({ name: '', startDate: toDateInputValue(), endDate: toDateInputValue() });
  };

  const handleDelete = async (id) => {
    if (!id) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/holidays/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to delete holiday');
      toast.success('Holiday removed');
      await loadHolidays();
    } catch (err) {
      toast.error(err.message || 'Failed to delete holiday');
    } finally {
      setDeletingId('');
    }
  };

  const totalDays = holidays.reduce((acc, h) => {
    const s = new Date(h.startDate || h.date);
    const e = new Date(h.endDate || h.startDate || h.date);
    return acc + Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-5">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-200">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">Holiday Manager</h1>
            <p className="text-xs text-gray-400 mt-0.5">Add, edit, or remove school holidays</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-gray-100 rounded-2xl px-4 py-2 shadow-sm text-center">
            <div className="text-lg font-black text-amber-600 leading-none">{holidays.length}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Holidays</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl px-4 py-2 shadow-sm text-center">
            <div className="text-lg font-black text-amber-600 leading-none">{totalDays}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Total Days</div>
          </div>
        </div>
      </div>

      {/* ── Form card ── */}
      <div className={`rounded-3xl border bg-white p-6 shadow-sm transition-all ${editingId ? 'border-amber-300 shadow-amber-100 shadow-md' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {editingId ? (
              <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                <Edit2 className="w-3.5 h-3.5 text-amber-600" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-amber-600" />
              </div>
            )}
            <h2 className="text-sm font-bold text-gray-800">
              {editingId ? 'Edit Holiday' : 'Add New Holiday'}
            </h2>
            {editingId && (
              <span className="text-[11px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Editing</span>
            )}
          </div>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Holiday Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Eid-ul-Fitr"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-gray-900 placeholder-gray-300 transition-all outline-none focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-50 hover:border-amber-200"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Start Date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-gray-900 transition-all outline-none focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-50 hover:border-amber-200"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">End Date</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-gray-900 transition-all outline-none focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-50 hover:border-amber-200"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-md shadow-amber-200/60 transition-all hover:shadow-lg hover:shadow-amber-300/50 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:hover:translate-y-0"
            style={{ background: 'linear-gradient(135deg,#d97706 0%,#f59e0b 60%,#fbbf24 100%)' }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? 'Update' : 'Add Holiday'}
          </button>
        </form>
      </div>

      {/* ── Holiday list ── */}
      <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="text-sm font-bold text-gray-800">Configured Holidays</h2>
          {!loading && holidays.length > 0 && (
            <span className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full">
              {holidays.length} {holidays.length === 1 ? 'holiday' : 'holidays'} · {totalDays} days off
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
            </div>
            <p className="text-sm text-gray-400">Loading holidays...</p>
          </div>
        ) : holidays.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              <CalendarX className="w-7 h-7 text-gray-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-500">No holidays added yet</p>
              <p className="text-xs text-gray-400 mt-1">Use the form above to add your first holiday</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider w-8">#</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Holiday</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date Range</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Duration</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {holidays.map((item, idx) => {
                  const colorClass = PALETTE[idx % PALETTE.length];
                  const isDeleting = deletingId === item._id;
                  const isBeingEdited = editingId === item._id;
                  return (
                    <tr
                      key={item._id}
                      className={`group transition-colors ${isBeingEdited ? 'bg-amber-50/60' : 'hover:bg-gray-50/60'}`}
                    >
                      <td className="px-5 py-4 text-xs font-bold text-gray-300">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${colorClass}`}>
                          {item.name}
                        </span>
                        {isBeingEdited && (
                          <span className="ml-2 text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">editing</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDateRange(item.startDate || item.date, item.endDate || item.startDate || item.date)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                          <CalendarDays className="w-3 h-3" />
                          {getDuration(item.startDate || item.date, item.endDate || item.startDate || item.date)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300 transition-all"
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item._id)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 hover:border-red-300 transition-all disabled:opacity-50"
                          >
                            {isDeleting
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Trash2 className="h-3 w-3" />}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-5 py-3.5 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing <span className="font-semibold text-gray-600">{holidays.length}</span> {holidays.length === 1 ? 'holiday' : 'holidays'}
              </p>
              <p className="text-xs text-gray-400">
                Total days off: <span className="font-semibold text-amber-600">{totalDays}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HolidayList;
