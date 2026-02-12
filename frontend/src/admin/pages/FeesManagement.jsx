import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  Loader2,
  PlusCircle,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

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
const FEE_HEAD_ORDER = new Map(FEE_HEAD_OPTIONS.map((label, index) => [label, index]));

const emptyStructure = {
  id: '',
  classId: '',
  className: '',
  academicYearId: '',
  name: '',
  feeHeads: [],
  installments: [],
};

const FeesManagement = ({ setShowAdminHeader }) => {
  const [filterOptions, setFilterOptions] = useState({
    classes: [],
    academicYears: [],
  });
  const [structures, setStructures] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [structureForm, setStructureForm] = useState(emptyStructure);
  const [activeStructureId, setActiveStructureId] = useState('');
  const [savingStructure, setSavingStructure] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [loadingStructures, setLoadingStructures] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    setShowAdminHeader?.(false);
  }, [setShowAdminHeader]);

  const loadFilters = async () => {
    setLoadingFilters(true);
    try {
      const res = await fetch(`${API_BASE}/api/fees/admin/filters`, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load filters');
      }
      setFilterOptions({
        classes: data.classes || [],
        academicYears: data.academicYears || [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFilters(false);
    }
  };

  const fetchStructures = async () => {
    setLoadingStructures(true);
    setFetchError('');
    try {
      const res = await fetch(`${API_BASE}/api/fees/structures`, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load structures');
      }
      setStructures(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(err.message || 'Unable to load structures');
      setStructures([]);
    } finally {
      setLoadingStructures(false);
    }
  };

  useEffect(() => {
    loadFilters();
    fetchStructures();
  }, []);

  const classOptions = useMemo(() => filterOptions.classes || [], [filterOptions.classes]);
  const academicYearOptions = useMemo(() => filterOptions.academicYears || [], [filterOptions.academicYears]);
  const classNameById = useMemo(() => {
    const map = new Map();
    classOptions.forEach((cls) => map.set(String(cls.id), cls.name));
    return map;
  }, [classOptions]);
  const yearNameById = useMemo(() => {
    const map = new Map();
    academicYearOptions.forEach((year) => map.set(String(year.id), year.name));
    return map;
  }, [academicYearOptions]);

  const filteredStructures = useMemo(() => {
    return structures.filter((structure) => {
      if (selectedClass && String(structure.classId) !== String(selectedClass)) return false;
      if (selectedYear && String(structure.academicYearId) !== String(selectedYear)) return false;
      const haystack = `${structure.name || ''} ${structure.className || ''}`.toLowerCase();
      return haystack.includes(searchTerm.toLowerCase());
    });
  }, [structures, selectedClass, selectedYear, searchTerm]);

  const setEditStructure = (structure) => {
    if (!structure) return;
    setActiveStructureId(structure._id);
    setStructureForm({
      id: structure._id,
      classId: structure.classId || '',
      className: structure.className || '',
      academicYearId: structure.academicYearId || '',
      name: structure.name || '',
      feeHeads: (structure.feeHeads || []).map((head) => ({
        label: head.label || '',
        amount: Number(head.amount || 0),
        customLabel: '',
      })),
      installments: (structure.installments || []).map((inst) => ({
        label: inst.label || '',
        amount: Number(inst.amount || 0),
        dueDate: inst.dueDate ? String(inst.dueDate).slice(0, 10) : '',
      })),
    });
  };

  const resetForm = () => {
    setStructureForm(emptyStructure);
    setActiveStructureId('');
  };

  const handleStructureSave = async () => {
    if (!structureForm.classId) {
      alert('Select class');
      return;
    }
    if (!structureForm.name) {
      alert('Enter structure name');
      return;
    }
    const total = structureForm.feeHeads.reduce((sum, head) => sum + Number(head.amount || 0), 0);
    const normalizedInstallments = (structureForm.installments || [])
      .map((inst) => ({
        label: String(inst.label || '').trim(),
        amount: Number(inst.amount || 0),
        dueDate: inst.dueDate || undefined,
      }))
      .filter((inst) => inst.label);

    let computedInstallments = normalizedInstallments;
    if (computedInstallments.length > 0) {
      const hasPositiveAmounts = computedInstallments.some((inst) => inst.amount > 0);
      if (!hasPositiveAmounts) {
        const baseAmount = Math.floor(total / computedInstallments.length);
        let remaining = total;
        computedInstallments = computedInstallments.map((inst, idx) => {
          const amount = idx === computedInstallments.length - 1 ? remaining : baseAmount;
          remaining -= amount;
          return { ...inst, amount };
        });
      } else {
        const currentTotal = computedInstallments.reduce((sum, inst) => sum + Number(inst.amount || 0), 0);
        const diff = total - currentTotal;
        if (computedInstallments.length > 0 && diff !== 0) {
          const last = computedInstallments[computedInstallments.length - 1];
          last.amount = Number(last.amount || 0) + diff;
        }
      }
    }
    const normalizedFeeHeads = structureForm.feeHeads
      .map((head) => {
        const label =
          head.label && head.label.trim()
            ? head.label.trim()
            : String(head.customLabel || '').trim();
        return {
          label,
          amount: Number(head.amount || 0),
        };
      })
      .filter((head) => head.label);

    const labelCounts = normalizedFeeHeads.reduce((acc, head) => {
      const key = head.label.toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const duplicates = Object.entries(labelCounts)
      .filter(([, count]) => count > 1)
      .map(([label]) => label);
    if (duplicates.length > 0) {
      alert(`Duplicate fee heads found: ${duplicates.join(', ')}`);
      return;
    }

    normalizedFeeHeads.sort((a, b) => {
      const aIndex = FEE_HEAD_ORDER.has(a.label) ? FEE_HEAD_ORDER.get(a.label) : Number.MAX_SAFE_INTEGER;
      const bIndex = FEE_HEAD_ORDER.has(b.label) ? FEE_HEAD_ORDER.get(b.label) : Number.MAX_SAFE_INTEGER;
      if (aIndex !== bIndex) return aIndex - bIndex;
      return a.label.localeCompare(b.label);
    });

    setSavingStructure(true);
    try {
      const payload = {
        name: structureForm.name,
        classId: structureForm.classId,
        className: structureForm.className || undefined,
        academicYearId: structureForm.academicYearId || undefined,
        totalAmount: total,
        feeHeads: normalizedFeeHeads,
        installments: computedInstallments,
      };
      const isEditing = Boolean(activeStructureId);
      const url = isEditing
        ? `${API_BASE}/api/fees/structures/${activeStructureId}`
        : `${API_BASE}/api/fees/structures`;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to save structure');
      }
      await fetchStructures();
      resetForm();
    } catch (err) {
      alert(err.message || 'Unable to save structure');
    } finally {
      setSavingStructure(false);
    }
  };

  const handleDeleteStructure = async (structure) => {
    if (!structure?._id) return;
    const confirmed = window.confirm(`Delete "${structure.name}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_BASE}/api/fees/structures/${structure._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to delete structure');
      }
      await fetchStructures();
      if (activeStructureId === structure._id) {
        resetForm();
      }
    } catch (err) {
      alert(err.message || 'Unable to delete structure');
    }
  };

  const updateFeeHead = (idx, field, value) => {
    setStructureForm((prev) => {
      const updated = [...prev.feeHeads];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, feeHeads: updated };
    });
  };

  const handleFeeHeadLabelChange = (idx, value) => {
    const isCustom = value === 'CUSTOM';
    setStructureForm((prev) => {
      const updated = [...prev.feeHeads];
      updated[idx] = {
        ...updated[idx],
        label: isCustom ? '' : value,
        customLabel: isCustom ? updated[idx]?.customLabel || '' : '',
      };
      return { ...prev, feeHeads: updated };
    });
  };

  const addFeeHead = () => {
    setStructureForm((prev) => ({
      ...prev,
      feeHeads: [...prev.feeHeads, { label: '', amount: 0, customLabel: '' }],
    }));
  };

  const removeFeeHead = (idx) => {
    setStructureForm((prev) => ({
      ...prev,
      feeHeads: prev.feeHeads.filter((_, index) => index !== idx),
    }));
  };

  const addInstallment = () => {
    setStructureForm((prev) => ({
      ...prev,
      installments: [...prev.installments, { label: '', amount: 0, dueDate: '' }],
    }));
  };

  const updateInstallment = (idx, field, value) => {
    setStructureForm((prev) => {
      const updated = [...prev.installments];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, installments: updated };
    });
  };

  const removeInstallment = (idx) => {
    setStructureForm((prev) => ({
      ...prev,
      installments: prev.installments.filter((_, index) => index !== idx),
    }));
  };

  const totalAmount = structureForm.feeHeads.reduce((sum, head) => sum + Number(head.amount || 0), 0);
  const totalHeads = structureForm.feeHeads.length;
  const totalInstallments = structureForm.installments.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-6 py-8 lg:px-10 space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white shadow-xl">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -left-10 -bottom-16 h-44 w-44 rounded-full bg-white/10" />
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
            Fees Management
          </p>
          <h1 className="text-3xl font-semibold mt-2">Fees Manage</h1>
          <p className="text-sm text-white/85 mt-2 max-w-2xl">
            Build fee structures and installment plans. Everything updates live so the
            collection team can start invoicing immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Active Structures</h2>
                <p className="text-sm text-slate-500">
                  {structures.length} structures in this campus.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={fetchStructures}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
                <button
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <Sparkles size={16} />
                  New Structure
                </button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm"
                  placeholder="Search structure"
                />
              </div>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">All classes</option>
                {classOptions.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">All years</option>
                {academicYearOptions.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name}
                  </option>
                ))}
              </select>
            </div>

            {fetchError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {fetchError}
              </div>
            )}

            <div className="space-y-3">
              {loadingStructures ? (
                <div className="flex items-center justify-center py-10 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading structures...
                </div>
              ) : filteredStructures.length ? (
                filteredStructures.map((structure) => (
                  <div
                    key={structure._id}
                    className={`rounded-2xl border p-4 transition ${
                      activeStructureId === structure._id
                        ? 'border-emerald-300 bg-emerald-50/70 shadow-[0_12px_30px_-24px_rgba(16,185,129,0.7)]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          {structure.name || 'Unnamed structure'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Class: {structure.className || classNameById.get(String(structure.classId)) || '-'}
                          {structure.academicYearId
                            ? ` • ${yearNameById.get(String(structure.academicYearId)) || 'Year'}`
                            : ''}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span className="rounded-full bg-slate-100 px-2 py-1">
                            Heads: {(structure.feeHeads || []).length}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-1">
                            Installments: {(structure.installments || []).length}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Total</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {formatCurrency(structure.totalAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => setEditStructure(structure)}
                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStructure(structure)}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center text-sm text-slate-500">
                  No structures found. Create your first fee structure to get started.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {activeStructureId ? 'Edit Structure' : 'Create Structure'}
                </h2>
                <p className="text-sm text-slate-500">
                  {activeStructureId
                    ? 'Update and save changes instantly.'
                    : 'Build a new fee structure for invoicing.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeStructureId && (
                  <button
                    onClick={resetForm}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <XCircle size={14} />
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
                <select
                  value={structureForm.classId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setStructureForm((prev) => ({
                      ...prev,
                      classId: nextId,
                      className: classNameById.get(String(nextId)) || '',
                    }));
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">Select class</option>
                  {classOptions.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Structure Name</label>
                <input
                  value={structureForm.name}
                  onChange={(e) => setStructureForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Class V Fee Structure"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Academic Year (optional)</label>
                <select
                  value={structureForm.academicYearId}
                  onChange={(e) => setStructureForm((prev) => ({ ...prev, academicYearId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">Select year</option>
                  {academicYearOptions.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 space-y-2">
                <p className="text-xs text-emerald-700 font-semibold uppercase tracking-[0.2em]">
                  Summary
                </p>
                <p className="text-2xl font-semibold text-emerald-900">
                  {formatCurrency(totalAmount)}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-emerald-900/80">
                  <span className="rounded-full bg-white/70 px-2 py-1">Heads: {totalHeads}</span>
                  <span className="rounded-full bg-white/70 px-2 py-1">Installments: {totalInstallments}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Fee Heads</h3>
                <button
                  onClick={addFeeHead}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <PlusCircle size={12} />
                  Add Fee Head
                </button>
              </div>
              {structureForm.feeHeads.length === 0 && (
                <p className="text-sm text-slate-400 mt-3">No fee heads added yet.</p>
              )}
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {structureForm.feeHeads.map((head, idx) => (
                  <div key={`${head.label}-${idx}`} className="border border-slate-200 rounded-xl p-3">
                    <label className="block text-xs font-medium text-slate-600">Label</label>
                    <select
                      value={FEE_HEAD_OPTIONS.includes(head.label) ? head.label : 'CUSTOM'}
                      onChange={(e) => handleFeeHeadLabelChange(idx, e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="">Select fee head</option>
                      {FEE_HEAD_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                      <option value="CUSTOM">Custom</option>
                    </select>
                    {!FEE_HEAD_OPTIONS.includes(head.label) && (
                      <input
                        value={head.customLabel || ''}
                        onChange={(e) => updateFeeHead(idx, 'customLabel', e.target.value)}
                        className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        placeholder="Enter custom label"
                      />
                    )}
                    <label className="block text-xs font-medium text-slate-600 mt-3">Amount</label>
                    <input
                      type="number"
                      min="0"
                      value={head.amount}
                      onChange={(e) => updateFeeHead(idx, 'amount', Number(e.target.value || 0))}
                      className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => removeFeeHead(idx)}
                      className="mt-3 text-xs text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Installments (optional)</h3>
                <button
                  onClick={addInstallment}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <PlusCircle size={12} />
                  Add Installment
                </button>
              </div>
              {structureForm.installments.length === 0 && (
                <p className="text-sm text-slate-400 mt-3">No installments added yet.</p>
              )}
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {structureForm.installments.map((inst, idx) => (
                  <div key={`${inst.label}-${idx}`} className="border border-slate-200 rounded-xl p-3">
                    <label className="block text-xs font-medium text-slate-600">Label</label>
                    <input
                      value={inst.label}
                      onChange={(e) => updateInstallment(idx, 'label', e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="Term 1"
                    />
                    <label className="block text-xs font-medium text-slate-600 mt-3">Amount</label>
                    <input
                      type="number"
                      min="0"
                      value={inst.amount}
                      onChange={(e) => updateInstallment(idx, 'amount', Number(e.target.value || 0))}
                      className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                    <label className="block text-xs font-medium text-slate-600 mt-3">Due Date</label>
                    <input
                      type="date"
                      value={inst.dueDate || ''}
                      onChange={(e) => updateInstallment(idx, 'dueDate', e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => removeInstallment(idx)}
                      className="mt-3 text-xs text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="text-emerald-600" size={16} />
                Total: <span className="font-semibold text-slate-900">{formatCurrency(totalAmount)}</span>
              </div>
              <button
                onClick={handleStructureSave}
                disabled={savingStructure}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 text-sm font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50"
              >
                {savingStructure ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                {activeStructureId ? 'Update Structure' : 'Save Structure'}
              </button>
            </div>
          </div>
        </div>

        {loadingFilters && (
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading filters...
          </div>
        )}
      </div>
    </div>
  );
};

export default FeesManagement;
