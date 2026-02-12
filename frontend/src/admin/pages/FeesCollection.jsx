import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  IndianRupee,
  Loader2,
  PlusCircle,
  Search,
  Users,
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const FeesCollection = ({ setShowAdminHeader }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    classId: '',
    section: '',
    status: '',
    overdue: false,
    search: '',
  });
  const [filterOptions, setFilterOptions] = useState({
    classes: [],
    sections: [],
    academicYears: [],
  });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    studentId: '',
    feeStructureId: '',
    title: '',
    totalAmount: '',
    dueDate: '',
  });

  const [students, setStudents] = useState([]);
  const [structures, setStructures] = useState([]);
  const [bulkForm, setBulkForm] = useState({
    classId: '',
    section: '',
    title: '',
    dueDate: '',
  });
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState('');

  useEffect(() => {
    setShowAdminHeader?.(false);
  }, [setShowAdminHeader]);

  const loadFilters = async () => {
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
        sections: data.sections || [],
        academicYears: data.academicYears || [],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const params = new URLSearchParams();
      const selectedClassName = filters.classId
        ? classOptions.find((cls) => String(cls.id) === String(filters.classId))?.name
        : '';
      if (filters.classId) params.append('classId', filters.classId);
      if (selectedClassName) params.append('className', selectedClassName);
      if (filters.section) params.append('section', filters.section);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.overdue) params.append('overdue', 'true');

      const res = await fetch(`${API_BASE}/api/fees/admin/invoices?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load invoices');
      }
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(err.message || 'Unable to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/get-students`, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load students');
      }
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStructures = async () => {
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
      console.error(err);
    }
  };

  useEffect(() => {
    loadFilters();
    fetchRecords();
    fetchStudents();
    fetchStructures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const summary = useMemo(() => {
    const totalStudents = new Set(records.map((r) => r.studentId)).size;
    const totalDue = records.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);
    const totalCollected = records.reduce((sum, r) => sum + Number(r.paidAmount || 0), 0);
    const totalPending = records.reduce((sum, r) => sum + Number(r.balanceAmount || 0), 0);
    return { totalStudents, totalDue, totalCollected, totalPending };
  }, [records]);

  const handleInvoiceCreate = async () => {
    if (!invoiceForm.studentId) {
      alert('Select a student');
      return;
    }
    if (!invoiceForm.feeStructureId && !invoiceForm.totalAmount) {
      alert('Select a fee structure or enter total amount');
      return;
    }
    setCreatingInvoice(true);
    try {
      const payload = {
        studentId: invoiceForm.studentId,
        feeStructureId: invoiceForm.feeStructureId || undefined,
        title: invoiceForm.title || undefined,
        totalAmount: invoiceForm.feeStructureId ? undefined : Number(invoiceForm.totalAmount || 0),
        dueDate: invoiceForm.dueDate || undefined,
      };
      const res = await fetch(`${API_BASE}/api/fees/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to create invoice');
      }
      setInvoiceForm({
        studentId: '',
        feeStructureId: '',
        title: '',
        totalAmount: '',
        dueDate: '',
      });
      setShowInvoiceForm(false);
      fetchRecords();
    } catch (err) {
      alert(err.message || 'Unable to create invoice');
    } finally {
      setCreatingInvoice(false);
    }
  };

  const classOptions = useMemo(() => filterOptions.classes || [], [filterOptions.classes]);
  const sectionOptions = useMemo(() => filterOptions.sections || [], [filterOptions.sections]);
  const classNameById = useMemo(() => {
    const map = new Map();
    classOptions.forEach((cls) => map.set(String(cls.id), cls.name));
    return map;
  }, [classOptions]);
  const filteredSections = useMemo(() => {
    const selectedClassId = filters.classId || null;
    if (!selectedClassId) return sectionOptions;
    return sectionOptions.filter((sec) => String(sec.classId) === String(selectedClassId));
  }, [filters.classId, sectionOptions]);
  const bulkSections = useMemo(() => {
    const selectedClassId = bulkForm.classId || null;
    if (!selectedClassId) return sectionOptions;
    return sectionOptions.filter((sec) => String(sec.classId) === String(selectedClassId));
  }, [bulkForm.classId, sectionOptions]);

  const handleViewDetails = (record) => {
    if (!record?.invoiceId) return;
    navigate(`/admin/fees/student-details?invoice=${record.invoiceId}`, {
      state: { invoiceId: record.invoiceId },
    });
  };

  const handleBulkGenerate = async () => {
    if (!bulkForm.classId) {
      alert('Select class');
      return;
    }
    setBulkLoading(true);
    setBulkResult('');
    try {
      const payload = {
        classId: bulkForm.classId,
        section: bulkForm.section || undefined,
        title: bulkForm.title || undefined,
        dueDate: bulkForm.dueDate || undefined,
      };
      const res = await fetch(`${API_BASE}/api/fees/admin/invoices/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to generate invoices');
      }
      const className = classNameById.get(String(bulkForm.classId)) || 'Class';
      setBulkResult(
        `Created ${data.createdCount} invoices (skipped ${data.skippedCount}) for ${className}${bulkForm.section ? ` - ${bulkForm.section}` : ''}.`
      );
      fetchRecords();
    } catch (err) {
      setBulkResult(err.message || 'Unable to generate invoices');
    } finally {
      setBulkLoading(false);
    }
  };

  const exportReport = () => {
    if (!records.length) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const currentDate = new Date().toLocaleDateString('en-IN');
    let y = 20;

    doc.setFontSize(16);
    doc.text('Fees Collection Report', pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(10);
    doc.text(`Generated on: ${currentDate}`, pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(9);
    doc.text('Student', 10, y);
    doc.text('Adm No', 45, y);
    doc.text('Class', 70, y);
    doc.text('Sec', 85, y);
    doc.text('Total', 100, y);
    doc.text('Paid', 125, y);
    doc.text('Due', 150, y);
    doc.text('Status', 175, y);
    y += 4;
    doc.line(10, y, pageWidth - 10, y);
    y += 6;

    records.forEach((record) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(String(record.studentName || '-'), 10, y);
      doc.text(String(record.admissionNumber || '-'), 45, y);
      doc.text(String(record.className || '-'), 70, y);
      doc.text(String(record.section || '-'), 85, y);
      doc.text(String(Number(record.totalAmount || 0).toLocaleString()), 100, y);
      doc.text(String(Number(record.paidAmount || 0).toLocaleString()), 125, y);
      doc.text(String(Number(record.balanceAmount || 0).toLocaleString()), 150, y);
      doc.text(String(record.status || '-'), 175, y);
      y += 6;
    });

    doc.save(`fees-report-${currentDate.replace(/\//g, '-')}.pdf`);
  };

  const summaryCards = [
    { label: 'Total Students', value: summary.totalStudents, icon: Users },
    { label: 'Total Fees', value: formatCurrency(summary.totalDue), icon: IndianRupee },
    { label: 'Collected', value: formatCurrency(summary.totalCollected), icon: CheckCircle2 },
    { label: 'Pending', value: formatCurrency(summary.totalPending), icon: AlertCircle },
  ];

  const getStatusChip = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'partial':
        return 'bg-yellow-100 text-yellow-700';
      case 'due':
      default:
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-6 py-8 lg:px-10 space-y-6">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 rounded-3xl p-6 text-white shadow-lg">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                  Fees Operations
                </p>
                <h1 className="text-3xl font-semibold mt-2">Fees Collection</h1>
                <p className="text-sm text-white/80 mt-2">
                  Track invoices, collect payments, and manage fee structures.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportReport}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-slate-100"
              >
                <Download size={16} />
                Export Report
              </button>
              <button
                onClick={fetchRecords}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
              <p className="text-sm text-slate-500">Narrow down invoices by class, section, status, or search.</p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={filters.overdue}
                onChange={(e) => setFilters((prev) => ({ ...prev, overdue: e.target.checked }))}
              />
              Show overdue only
            </label>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
              <select
                value={filters.classId}
                onChange={(e) => setFilters((prev) => ({ ...prev, classId: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">All</option>
                {classOptions.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">Section</label>
              <select
                value={filters.section}
                onChange={(e) => setFilters((prev) => ({ ...prev, section: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">All</option>
                {bulkSections.map((sec) => (
                  <option key={sec.id} value={sec.name}>
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="due">Due</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Student name / admission no / student id"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between"
            >
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="text-xl font-semibold text-slate-900 mt-1">{card.value}</p>
              </div>
              <card.icon className="w-8 h-8 text-amber-500" />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Bulk Invoice Generator</h2>
              <p className="text-sm text-slate-500">
                Create invoices for every student in a class using the active academic-year structure.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
              <select
                value={bulkForm.classId}
                onChange={(e) =>
                  setBulkForm((prev) => ({
                    ...prev,
                    classId: e.target.value,
                    section: '',
                  }))
                }
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Section (optional)</label>
              <select
                value={bulkForm.section}
                onChange={(e) => setBulkForm((prev) => ({ ...prev, section: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">All</option>
                {filteredSections.map((sec) => (
                  <option key={sec.id} value={sec.name}>
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Invoice Title (optional)</label>
              <input
                value={bulkForm.title}
                onChange={(e) => setBulkForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                placeholder="Annual Fee Invoice"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Due Date (optional)</label>
              <input
                type="date"
                value={bulkForm.dueDate}
                onChange={(e) => setBulkForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleBulkGenerate}
              disabled={bulkLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
              {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Generate Invoices
            </button>
            {bulkResult && (
              <span className="text-sm text-slate-600">{bulkResult}</span>
            )}
          </div>
        </div>

        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {fetchError}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Fee Invoices</h2>
              <p className="text-sm text-slate-500">Manage fee invoices and dues.</p>
            </div>
            <button
              onClick={() => setShowInvoiceForm((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600"
            >
              <PlusCircle size={16} />
              Create Invoice
            </button>
          </div>

          {showInvoiceForm && (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5 border border-amber-200 rounded-2xl p-5 bg-amber-50/60">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Student</label>
                <select
                  value={invoiceForm.studentId}
                  onChange={(e) => setInvoiceForm((prev) => ({ ...prev, studentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.grade || 'Class'}{student.section ? `-${student.section}` : ''})
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Fee Structure (optional)</label>
                <select
                  value={invoiceForm.feeStructureId}
                  onChange={(e) => setInvoiceForm((prev) => ({ ...prev, feeStructureId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">Select structure</option>
                  {structures.map((structure) => (
                    <option key={structure._id} value={structure._id}>
                      {structure.name} {structure.className ? `- ${structure.className}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Total Amount</label>
                <input
                  type="number"
                  min="0"
                  value={invoiceForm.totalAmount}
                  onChange={(e) => setInvoiceForm((prev) => ({ ...prev, totalAmount: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Amount"
                  disabled={Boolean(invoiceForm.feeStructureId)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                <input
                  type="text"
                  value={invoiceForm.title}
                  onChange={(e) => setInvoiceForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Invoice title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="lg:col-span-5">
                <button
                  onClick={handleInvoiceCreate}
                  disabled={creatingInvoice}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {creatingInvoice ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Create Invoice
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Admission No</th>
                  <th className="px-4 py-3 text-left">Class</th>
                  <th className="px-4 py-3 text-left">Section</th>
                  <th className="px-4 py-3 text-right">Total Fee</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-right">Outstanding</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                      Loading fee invoices...
                    </td>
                  </tr>
                )}

                {!loading && records.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                      No fee invoices found for the selected filters.
                    </td>
                  </tr>
                )}

                {!loading &&
                  records.map((record) => (
                    <tr key={record.invoiceId} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-900 font-medium">{record.studentName}</td>
                      <td className="px-4 py-3 text-slate-600">{record.admissionNumber || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{record.className || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{record.section || '-'}</td>
                      <td className="px-4 py-3 text-right text-slate-900">
                        {formatCurrency(record.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {formatCurrency(record.paidAmount)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600 font-semibold">
                        {formatCurrency(record.balanceAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusChip(
                            record.status
                          )}`}
                        >
                          {record.status?.toUpperCase?.() || ''}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleViewDetails(record)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded border border-slate-200 hover:bg-slate-100 text-slate-800"
                        >
                          <Eye size={12} />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesCollection;
