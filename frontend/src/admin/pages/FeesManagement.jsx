import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Loader2,
  PlusCircle,
  RefreshCw,
  Save,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const BOARD_OPTIONS = ['GENERAL', 'CBSE', 'ICSE', 'STATE', 'IB'];
const FEE_HEAD_OPTIONS = [
  'Tuition fee',
  'Admission / Registration fee',
  'Development fee',
  'Library fee',
  'Laboratory fee',
  'Examination fee',
  'Sports / Activity fee',
  'Transport fee',
  'Uniform / Books fee',
  'Miscellaneous charges',
];

const EMPTY_FORM = {
  classId: '',
  className: '',
  academicYearId: '',
  board: 'GENERAL',
  name: '',
  feeHeads: [],
  installments: [],
};

const toAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
};

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const authHeaders = () => ({
  'Content-Type': 'application/json',
  authorization: `Bearer ${localStorage.getItem('token')}`,
});

const normalizeInstallments = (items) =>
  (items || []).map((item) => ({
    label: String(item?.label || '').trim(),
    amount: toAmount(item?.amount),
    dueDate: item?.dueDate ? String(item.dueDate).slice(0, 10) : '',
  }));

const FeesManagement = ({ setShowAdminHeader }) => {
  const [filters, setFilters] = useState({ classes: [], academicYears: [] });
  const [structures, setStructures] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [activeId, setActiveId] = useState('');
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setShowAdminHeader?.(false);
  }, [setShowAdminHeader]);

  const classNameById = useMemo(
    () => new Map((filters.classes || []).map((item) => [String(item.id), item.name])),
    [filters.classes]
  );

  const yearNameById = useMemo(
    () => new Map((filters.academicYears || []).map((item) => [String(item.id), item.name])),
    [filters.academicYears]
  );

  const formTotal = useMemo(
    () => form.feeHeads.reduce((sum, item) => sum + toAmount(item.amount), 0),
    [form.feeHeads]
  );
  const installmentTotal = useMemo(
    () => form.installments.reduce((sum, item) => sum + toAmount(item.amount), 0),
    [form.installments]
  );
  const differenceTotal = useMemo(() => formTotal - installmentTotal, [formTotal, installmentTotal]);
  const configuredHeads = useMemo(
    () =>
      form.feeHeads.filter((item) => String(item.label || item.customLabel || '').trim()).length,
    [form.feeHeads]
  );
  const configuredInstallments = useMemo(
    () => form.installments.filter((item) => String(item.label || '').trim()).length,
    [form.installments]
  );
  const basicsDone = Boolean(form.classId && String(form.name || '').trim());
  const headsDone = configuredHeads > 0;
  const installmentsDone = configuredInstallments > 0;
  const flowCompleted = [basicsDone, headsDone, installmentsDone].filter(Boolean).length;


  const filteredStructures = useMemo(() => {
    return structures.filter((item) => {
      if (selectedClass && String(item.classId) !== String(selectedClass)) return false;
      if (selectedYear && String(item.academicYearId) !== String(selectedYear)) return false;
      if (selectedBoard && String(item.board || 'GENERAL') !== selectedBoard) return false;
      const haystack = `${item.name || ''} ${item.className || ''} ${item.board || ''}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [structures, selectedClass, selectedYear, selectedBoard, search]);

  const dashboardStats = useMemo(() => {
    if (!filteredStructures.length) {
      return {
        count: 0,
        totalValue: 0,
        averageValue: 0,
        classesCovered: 0,
      };
    }
    const totalValue = filteredStructures.reduce(
      (sum, item) => sum + toAmount(item.totalAmount),
      0
    );
    const classIds = new Set(
      filteredStructures
        .map((item) => {
          if (item.classId) return String(item.classId);
          if (item.className) return `${item.className}-${item.board || 'GENERAL'}`;
          return null;
        })
        .filter(Boolean)
    );
    return {
      count: filteredStructures.length,
      totalValue,
      averageValue: Math.round(totalValue / filteredStructures.length),
      classesCovered: classIds.size,
    };
  }, [filteredStructures]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [filtersRes, structuresRes] = await Promise.all([
        fetch(`${API_BASE}/api/fees/admin/filters`, { headers: authHeaders() }),
        fetch(`${API_BASE}/api/fees/structures`, { headers: authHeaders() }),
      ]);
      const filtersData = await filtersRes.json().catch(() => ({}));
      const structuresData = await structuresRes.json().catch(() => ([]));
      if (!filtersRes.ok) throw new Error(filtersData?.error || 'Failed to load filters');
      if (!structuresRes.ok) throw new Error(structuresData?.error || 'Failed to load fee structures');
      setFilters({
        classes: filtersData.classes || [],
        academicYears: filtersData.academicYears || [],
      });
      setStructures(Array.isArray(structuresData) ? structuresData : []);
    } catch (err) {
      setError(err.message || 'Unable to load fee builder data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const resetForm = () => {
    setActiveId('');
    setForm(EMPTY_FORM);
    setError('');
    setNotice('');
  };

  const editStructure = (structure) => {
    setActiveId(structure._id || '');
    setError('');
    setNotice('');
    setForm({
      classId: structure.classId || '',
      className: structure.className || '',
      academicYearId: structure.academicYearId || '',
      board: structure.board || 'GENERAL',
      name: structure.name || '',
      feeHeads: (structure.feeHeads || []).map((item) => ({
        label: item.label || '',
        customLabel: '',
        amount: toAmount(item.amount),
      })),
      installments: normalizeInstallments(structure.installments || []),
    });
  };

  const addHead = () =>
    setForm((prev) => ({
      ...prev,
      feeHeads: [...prev.feeHeads, { label: '', customLabel: '', amount: 0 }],
    }));

  const removeHead = (index) =>
    setForm((prev) => ({
      ...prev,
      feeHeads: prev.feeHeads.filter((_, idx) => idx !== index),
    }));

  const updateHead = (index, key, value) =>
    setForm((prev) => ({
      ...prev,
      feeHeads: prev.feeHeads.map((head, idx) => (idx === index ? { ...head, [key]: value } : head)),
    }));

  const addInstallment = () =>
    setForm((prev) => ({
      ...prev,
      installments: [...prev.installments, { label: '', amount: 0, dueDate: '' }],
    }));

  const removeInstallment = (index) =>
    setForm((prev) => ({
      ...prev,
      installments: prev.installments.filter((_, idx) => idx !== index),
    }));

  const updateInstallment = (index, key, value) =>
    setForm((prev) => ({
      ...prev,
      installments: prev.installments.map((item, idx) => (idx === index ? { ...item, [key]: value } : item)),
    }));

  const saveStructure = async () => {
    setError('');
    setNotice('');
    if (!form.classId) return setError('Class is required.');
    if (!String(form.name || '').trim()) return setError('Structure name is required.');

    const heads = form.feeHeads
      .map((item) => ({
        label: String(item.label || item.customLabel || '').trim(),
        amount: toAmount(item.amount),
      }))
      .filter((item) => item.label);
    if (!heads.length) return setError('Add at least one fee head.');
    if (heads.every((item) => item.amount === 0)) return setError('Fee head amount cannot be all zero.');

    const sameScope = structures.find(
      (item) =>
        String(item.classId || '') === String(form.classId) &&
        String(item.academicYearId || '') === String(form.academicYearId || '') &&
        String(item.board || 'GENERAL') === String(form.board || 'GENERAL') &&
        item._id !== activeId
    );
    if (sameScope) {
      return setError('A structure already exists for this class, board, and academic year.');
    }

    const totalAmount = heads.reduce((sum, item) => sum + item.amount, 0);
    const installments = normalizeInstallments(form.installments).filter((item) => item.label);
    if (installments.length) {
      const installmentSum = installments.reduce((sum, item) => sum + item.amount, 0);
      const diff = totalAmount - installmentSum;
      if (diff !== 0) {
        installments[installments.length - 1].amount = toAmount(installments[installments.length - 1].amount + diff);
      }
    }

    setSaving(true);
    try {
      const payload = {
        classId: form.classId,
        className: form.className || classNameById.get(String(form.classId)) || '',
        academicYearId: form.academicYearId || undefined,
        board: form.board || 'GENERAL',
        name: String(form.name || '').trim(),
        totalAmount,
        feeHeads: heads,
        installments,
      };
      const isEdit = Boolean(activeId);
      const endpoint = isEdit
        ? `${API_BASE}/api/fees/structures/${activeId}`
        : `${API_BASE}/api/fees/structures`;
      const res = await fetch(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Unable to save structure');
      await loadAll();
      resetForm();
      setNotice(isEdit ? 'Fee structure updated.' : 'Fee structure created.');
    } catch (err) {
      setError(err.message || 'Unable to save structure');
    } finally {
      setSaving(false);
    }
  };

  const deleteStructure = async (structure) => {
    if (!structure?._id) return;
    if (!window.confirm(`Delete "${structure.name || 'this structure'}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/fees/structures/${structure._id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Unable to delete structure');
      await loadAll();
      if (activeId === structure._id) resetForm();
      setNotice('Fee structure deleted.');
    } catch (err) {
      setError(err.message || 'Unable to delete structure');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-[1680px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="relative overflow-hidden rounded-3xl border border-sky-200/70 bg-gradient-to-r from-slate-900 via-sky-900 to-blue-800 px-6 py-7 text-white shadow-xl sm:px-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-20 h-56 w-56 rounded-full bg-blue-200/20 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-100">Fees Builder</p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Fee Structure Management</h1>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Structures</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? '...' : dashboardStats.count}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Total Value</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? '...' : money(dashboardStats.totalValue)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Average Value</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? '...' : money(dashboardStats.averageValue)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Classes Covered</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? '...' : dashboardStats.classesCovered}</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle size={16} />{error}</div>}
          {notice && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><CheckCircle2 size={16} />{notice}</div>}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.12fr_1fr]">
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Saved Structures</h2>
              <div className="flex gap-2">
                <button onClick={loadAll} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><RefreshCw size={15} />Refresh</button>
                <button onClick={resetForm} className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-800"><PlusCircle size={15} />New</button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search structure" className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100" />
              </div>
              <select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"><option value="">All classes</option>{filters.classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
              <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"><option value="">All years</option>{filters.academicYears.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <select value={selectedBoard} onChange={(event) => setSelectedBoard(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"><option value="">All boards</option>{BOARD_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <div className="flex items-center text-sm text-slate-500">{loading ? 'Loading...' : `${filteredStructures.length} results`}</div>
            </div>
            <div className="max-h-[560px] space-y-3 overflow-auto pr-1">
              {!loading && !filteredStructures.length && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-500">
                  No fee structures found for the selected filters.
                </div>
              )}
              {filteredStructures.map((item) => (
                <div key={item._id} className={`rounded-2xl border p-4 transition ${activeId === item._id ? 'border-sky-300 bg-sky-50/70' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{item.name || 'Unnamed'}</h3>
                      <p className="mt-1 text-xs text-slate-500">{item.className || classNameById.get(String(item.classId)) || '-'} | {item.board || 'GENERAL'}{item.academicYearId ? ` | ${yearNameById.get(String(item.academicYearId)) || 'Academic Year'}` : ''}</p>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">{money(item.totalAmount)}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => editStructure(item)} className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"><Edit3 size={13} />Edit</button>
                    <button onClick={() => deleteStructure(item)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"><Trash2 size={13} />Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:sticky xl:top-6 xl:h-fit">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">{activeId ? 'Edit Structure' : 'Create Structure'}</h2>
              {activeId && <button onClick={resetForm} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"><XCircle size={13} />Cancel</button>}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Setup Flow</p>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">{flowCompleted}/3 complete</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className={`rounded-lg border px-2 py-2 text-center font-medium ${basicsDone ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'}`}>1. Basics</div>
                <div className={`rounded-lg border px-2 py-2 text-center font-medium ${headsDone ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'}`}>2. Fee Heads</div>
                <div className={`rounded-lg border px-2 py-2 text-center font-medium ${installmentsDone ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'}`}>3. Installments</div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="mb-2 block text-sm font-medium text-slate-700">Class</label><select value={form.classId} onChange={(event) => setForm((prev) => ({ ...prev, classId: event.target.value, className: classNameById.get(String(event.target.value)) || '' }))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"><option value="">Select class</option>{filters.classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
              <div><label className="mb-2 block text-sm font-medium text-slate-700">Structure Name</label><input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Class 9 Annual Fees 2026" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100" /></div>
              <div><label className="mb-2 block text-sm font-medium text-slate-700">Board</label><select value={form.board} onChange={(event) => setForm((prev) => ({ ...prev, board: event.target.value }))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100">{BOARD_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
              <div><label className="mb-2 block text-sm font-medium text-slate-700">Academic Year</label><select value={form.academicYearId} onChange={(event) => setForm((prev) => ({ ...prev, academicYearId: event.target.value }))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"><option value="">Select year</option>{filters.academicYears.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
            </div>
            <p className="text-xs text-slate-500">Pick class and name first, then add fee heads and installments.</p>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Fee Heads</h3>
                  <p className="text-xs text-slate-500">Define charge categories and amounts.</p>
                </div>
                <button onClick={addHead} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs transition hover:bg-slate-50"><PlusCircle size={12} />Add Head</button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {!form.feeHeads.length && (
                  <div className="md:col-span-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-3 py-6 text-center text-sm text-slate-500">
                    No fee heads added yet.
                  </div>
                )}
                {form.feeHeads.map((item, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 bg-white p-3">
                    <label className="text-xs font-medium text-slate-600">Label</label>
                    <select value={FEE_HEAD_OPTIONS.includes(item.label) ? item.label : 'CUSTOM'} onChange={(event) => {
                      const value = event.target.value;
                      const isCustom = value === 'CUSTOM';
                      updateHead(index, 'label', isCustom ? '' : value);
                      if (!isCustom) updateHead(index, 'customLabel', '');
                    }} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"><option value="">Select fee head</option>{FEE_HEAD_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}<option value="CUSTOM">Custom</option></select>
                    {!FEE_HEAD_OPTIONS.includes(item.label) && <input value={item.customLabel || ''} onChange={(event) => updateHead(index, 'customLabel', event.target.value)} placeholder="Custom fee head" className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100" />}
                    <label className="mt-3 block text-xs font-medium text-slate-600">Amount</label>
                    <input type="number" min="0" value={item.amount} onChange={(event) => updateHead(index, 'amount', toAmount(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100" />
                    <button onClick={() => removeHead(index)} className="mt-3 text-xs font-medium text-red-600 hover:text-red-700">Remove</button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Installments</h3>
                  <p className="text-xs text-slate-500">Break total into payment terms.</p>
                </div>
                <button onClick={addInstallment} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs transition hover:bg-slate-50"><PlusCircle size={12} />Add Installment</button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {!form.installments.length && (
                  <div className="md:col-span-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-3 py-6 text-center text-sm text-slate-500">
                    No installments added yet.
                  </div>
                )}
                {form.installments.map((item, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 bg-white p-3">
                    <label className="text-xs font-medium text-slate-600">Label</label>
                    <input value={item.label} onChange={(event) => updateInstallment(index, 'label', event.target.value)} placeholder="Term 1" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100" />
                    <label className="mt-3 block text-xs font-medium text-slate-600">Amount</label>
                    <input type="number" min="0" value={item.amount} onChange={(event) => updateInstallment(index, 'amount', toAmount(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100" />
                    <label className="mt-3 block text-xs font-medium text-slate-600">Due Date</label>
                    <input type="date" value={item.dueDate || ''} onChange={(event) => updateInstallment(index, 'dueDate', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100" />
                    <button onClick={() => removeInstallment(index)} className="mt-3 text-xs font-medium text-red-600 hover:text-red-700">Remove</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div><p className="text-xs uppercase tracking-[0.2em] text-sky-700">Heads Total</p><p className="text-lg font-semibold text-sky-900">{money(formTotal)}</p></div>
                <div><p className="text-xs uppercase tracking-[0.2em] text-sky-700">Installments</p><p className="text-lg font-semibold text-sky-900">{money(installmentTotal)}</p></div>
                <div><p className="text-xs uppercase tracking-[0.2em] text-sky-700">Difference</p><p className={`text-lg font-semibold ${differenceTotal === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>{money(differenceTotal)}</p></div>
              </div>
              {configuredInstallments > 0 && differenceTotal !== 0 && (
                <p className="mt-2 text-xs font-medium text-amber-700">On save, the last installment is auto-adjusted to match the total.</p>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button onClick={resetForm} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Reset
              </button>
              <button onClick={saveStructure} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-700 to-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:from-sky-800 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={15} />}
                {activeId ? 'Update Structure' : 'Save Structure'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesManagement;
