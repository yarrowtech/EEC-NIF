import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Edit2, Loader2, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatDate = (value) => {
  if (!value) return '—';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
};

const toDateInputValue = (value) => {
  const dt = value ? new Date(value) : new Date();
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const HolidayList = ({ setShowAdminHeader }) => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState({
    name: '',
    date: toDateInputValue(),
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
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load holidays');
      }
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
    const date = String(form.date || '').trim();
    if (!name || !date) {
      toast.error('Holiday name and date are required');
      return;
    }
    setSaving(true);
    try {
      const isEdit = Boolean(editingId);
      const res = await fetch(`${API_BASE}/api/holidays${isEdit ? `/${editingId}` : ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify({ name, date }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || (isEdit ? 'Failed to update holiday' : 'Failed to add holiday'));
      }
      toast.success(isEdit ? 'Holiday updated' : 'Holiday added');
      setEditingId('');
      setForm({ name: '', date: toDateInputValue() });
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
      date: toDateInputValue(item.date),
    });
  };

  const cancelEdit = () => {
    setEditingId('');
    setForm({ name: '', date: toDateInputValue() });
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
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to delete holiday');
      }
      toast.success('Holiday removed');
      await loadHolidays();
    } catch (err) {
      toast.error(err.message || 'Failed to delete holiday');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="space-y-5 p-2 sm:p-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-amber-600" />
          <h1 className="text-lg font-bold text-gray-900">Holiday List</h1>
        </div>
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Holiday name"
            className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {editingId ? 'Update Holiday' : 'Add Holiday'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-800">Configured Holidays</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading holidays...
          </div>
        ) : holidays.length === 0 ? (
          <div>
            <p className="text-sm text-gray-500">No holidays added yet.</p>
            <p className="mt-3 text-sm font-medium text-gray-600">Total Holidays: 0</p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Holiday Name</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.map((item) => (
                    <tr key={item._id} className="border-b border-gray-100">
                      <td className="px-3 py-2.5 text-gray-700">{formatDate(item.date)}</td>
                      <td className="px-3 py-2.5 font-medium text-gray-900">{item.name}</td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="mr-2 inline-flex items-center gap-1 rounded-lg border border-indigo-200 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          disabled={deletingId === item._id}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          {deletingId === item._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm font-medium text-gray-600">Total Holidays: {holidays.length}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HolidayList;
