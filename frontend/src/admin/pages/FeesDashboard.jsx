import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Download,
  Users,
  AlertCircle,
  School,
  Search,
  ArrowUp,
  CheckCircle,
  Clock,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;
const DATE_RANGE_OPTIONS = [
  { value: '30d', label: 'Last 30 Days' },
  { value: '7d', label: 'Last 7 Days' },
  { value: 'all', label: 'All Time' },
];

const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const FeesDashboard = ({ setShowAdminHeader }) => {
  useEffect(() => {
    setShowAdminHeader(false);
  }, [setShowAdminHeader]);

  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('30d');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const loadSummary = async () => {
      setError('');
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/fees/admin/summary`, {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          signal: controller.signal,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || data?.message || 'Failed to load fees dashboard data');
        }
        setSummary(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    loadSummary();
    return () => controller.abort();
  }, []);

  const totals = summary?.totals || {
    totalOutstanding: 0,
    totalCollected: 0,
    totalInvoiced: 0,
    totalStudents: 0,
    overdueInvoices: 0,
  };
  const enrollmentData = summary?.enrollment || [];
  const outstandingFeesData = summary?.outstandingSegments || [];
  const recentPayments = summary?.recentPayments || [];
  const dateRangeLabel =
    DATE_RANGE_OPTIONS.find((option) => option.value === dateRange)?.label || 'Last 30 Days';

  const rangeStart = useMemo(() => {
    if (dateRange === 'all') return null;
    const now = new Date();
    const days = dateRange === '7d' ? 7 : 30;
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));
    return start;
  }, [dateRange]);

  const paymentsByDateRange = useMemo(() => {
    if (!rangeStart) return recentPayments;
    return recentPayments.filter((payment) => {
      if (!payment?.paidOn) return false;
      const paidOn = new Date(payment.paidOn);
      if (Number.isNaN(paidOn.getTime())) return false;
      return paidOn >= rangeStart;
    });
  }, [recentPayments, rangeStart]);

  const filteredPayments = useMemo(() => {
    return paymentsByDateRange.filter(
      (payment) =>
        (payment.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.className || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [paymentsByDateRange, searchTerm]);

  const formatCurrency = (amount = 0) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);

  const getStatusColor = (status) =>
    status === 'Paid'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';

  const collectionTrend = useMemo(() => {
    const today = new Date();
    const result = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = date.toISOString().split('T')[0];
      result.push({
        key,
        label: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        value: 0,
      });
    }
    const seriesMap = result.reduce((map, entry) => {
      map.set(entry.key, entry);
      return map;
    }, new Map());
    paymentsByDateRange.forEach((payment) => {
      if (!payment.paidOn) return;
      const paidOnKey = new Date(payment.paidOn).toISOString().split('T')[0];
      if (seriesMap.has(paidOnKey)) {
        seriesMap.get(paidOnKey).value += Number(payment.amount || 0);
      }
    });
    return result;
  }, [paymentsByDateRange]);

  const peakCollection = Math.max(
    ...collectionTrend.map((entry) => entry.value),
    1
  );

  const generateReport = () => {
    const exportDate = new Date();
    const rows = [];

    rows.push(['FEES DASHBOARD REPORT']);
    rows.push(['Generated At', exportDate.toLocaleString('en-IN')]);
    rows.push(['Date Range', dateRangeLabel]);
    rows.push([]);

    rows.push(['SUMMARY']);
    rows.push(['Metric', 'Value']);
    rows.push(['Total Outstanding', totals.totalOutstanding]);
    rows.push(['Overdue Invoices', totals.overdueInvoices]);
    rows.push(['Students with Invoices', totals.totalStudents]);
    rows.push(['Total Collected', totals.totalCollected]);
    rows.push(['Total Invoiced', totals.totalInvoiced]);
    rows.push([]);

    rows.push(['COLLECTION TREND (LAST 7 DAYS)']);
    rows.push(['Date', 'Amount']);
    collectionTrend.forEach((entry) => {
      rows.push([entry.label, entry.value]);
    });
    rows.push([]);

    rows.push(['ENROLLMENT BY CLASS']);
    rows.push(['Class', 'Students', 'Share %']);
    enrollmentData.forEach((item) => {
      rows.push([item.label, item.students, item.percentage]);
    });
    rows.push([]);

    rows.push(['OUTSTANDING OVERVIEW']);
    rows.push(['Class', 'Amount', 'Share %']);
    outstandingFeesData.forEach((item) => {
      rows.push([item.label, item.amount, item.percentage]);
    });
    rows.push([]);

    rows.push(['RECENT PAYMENTS']);
    rows.push(['Student', 'Class', 'Section', 'Amount', 'Paid On', 'Method', 'Status']);
    filteredPayments.forEach((payment) => {
      rows.push([
        payment.studentName || '',
        payment.className || '',
        payment.section || '',
        payment.amount || 0,
        payment.paidOn ? new Date(payment.paidOn).toLocaleDateString('en-IN') : '',
        payment.method || '',
        payment.status || 'Paid',
      ]);
    });

    const csvContent = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fees-dashboard-report-${exportDate.toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-600">
          <div className="animate-spin h-10 w-10 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
          Loading the latest fee analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-6 py-8 lg:px-10">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">
              Fees Control Center
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 mt-2">
              Fees Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Monitor collection health, overdue invoices, and cash flow trends.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={generateReport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              <Download size={16} />
              Export Snapshot
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Total Outstanding
              </p>
              <div className="w-10 h-10 flex items-center justify-center bg-amber-100 rounded-full">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-slate-900 mt-2">
              {formatCurrency(totals.totalOutstanding)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Live balance pending across all records
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Overdue Invoices</p>
              <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-full">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-slate-900 mt-2">
              {totals.overdueInvoices} Invoices
            </p>
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <ArrowUp className="w-3 h-3 mr-1" />
              Require immediate follow-up
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Students with Invoices</p>
              <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
                <School className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-slate-900 mt-2">
              {totals.totalStudents.toLocaleString()} Students
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Students linked to fee records
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Total Collected</p>
              <div className="w-10 h-10 flex items-center justify-center bg-emerald-100 rounded-full">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-slate-900 mt-2">
              {formatCurrency(totals.totalCollected)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Amount received so far
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Collection Trend
                  </h2>
                  <p className="text-sm text-slate-500">
                    Daily collections over the last 7 days.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>{dateRangeLabel}</span>
                </div>
              </div>
              <div className="flex gap-3 items-end h-48">
                {collectionTrend.map((entry) => (
                  <div key={entry.key} className="flex flex-col items-center w-full">
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-amber-500 to-orange-400 shadow"
                        style={{
                          height: `${(entry.value / peakCollection) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-xs font-medium text-slate-700">
                        {formatCurrency(entry.value)}
                      </p>
                      <p className="text-xs text-slate-500">{entry.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Recent Payments
                  </h2>
                  <p className="text-sm text-slate-500">
                    Payments logged directly from fee invoices.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search students..."
                      className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {DATE_RANGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={generateReport}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Download size={16} />
                    Report
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredPayments.length ? (
                  filteredPayments.map((payment, idx) => (
                    <div
                      key={`${payment.studentName}-${idx}`}
                      className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-lg font-semibold text-slate-900">
                          {payment.studentName}
                        </p>
                        <p className="text-sm text-slate-500">
                          {payment.className || 'Class'} {payment.section ? `- ${payment.section}` : ''}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-xl font-semibold text-slate-900">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {payment.paidOn
                            ? new Date(payment.paidOn).toLocaleDateString()
                            : '-'}
                        </p>
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status || 'Paid'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-6">
                    No recent payments match your search.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Enrollment by Class
                  </h2>
                  <p className="text-sm text-slate-500">
                    Distribution of students with fee invoices.
                  </p>
                </div>
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              {enrollmentData.length ? (
                <div className="grid gap-4">
                  {enrollmentData.map((program) => (
                    <div
                      key={program.label}
                      className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm text-slate-500">
                          {program.label}
                        </p>
                        <p className="text-2xl font-semibold text-slate-900">
                          {program.students}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Share</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {program.percentage}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No enrollment data available.
                </p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Outstanding Overview
                  </h2>
                  <p className="text-sm text-slate-500">
                    Top classes with outstanding dues.
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              {outstandingFeesData.length ? (
                <div className="space-y-4">
                  {outstandingFeesData.map((segment) => (
                    <div key={segment.label}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-700">
                          {segment.label}
                        </p>
                        <span className="text-sm text-slate-500">
                          {segment.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full"
                          style={{ width: `${segment.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No outstanding data to display.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesDashboard;
