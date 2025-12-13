import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Download,
  Bell,
  TrendingUp,
  DollarSign,
  Users,
  AlertCircle,
  School,
  Search,
  ArrowUp,
  CheckCircle,
  Clock,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const FeesDashboard = ({ setShowAdminHeader }) => {
  useEffect(() => {
    setShowAdminHeader(false);
  }, [setShowAdminHeader]);

  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const loadSummary = async () => {
      setError('');
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/nif/fees/dashboard-summary`, {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          signal: controller.signal,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || 'Failed to load fees dashboard data');
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
    monthlyCollection: 0,
    overduePayments: 0,
    totalEnrolled: 0,
    totalCollected: 0,
  };
  const enrollmentData = summary?.enrollment || [];
  const outstandingFeesData = summary?.outstandingSegments || [];
  const recentPayments = summary?.recentPayments || [];

  const filteredPayments = useMemo(() => {
    return recentPayments.filter(
      (payment) =>
        payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.program.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recentPayments, searchTerm]);

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
    recentPayments.forEach((payment) => {
      if (!payment.paidOn) return;
      const paidOnKey = new Date(payment.paidOn).toISOString().split('T')[0];
      if (seriesMap.has(paidOnKey)) {
        seriesMap.get(paidOnKey).value += Number(payment.amount || 0);
      }
    });
    return result;
  }, [recentPayments]);

  const peakCollection = Math.max(
    ...collectionTrend.map((entry) => entry.value),
    1
  );

  const generateReport = () => {
    alert('Generating comprehensive fees report...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <div className="animate-spin h-10 w-10 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          Loading the latest fee analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Total Outstanding
              </p>
              <div className="w-10 h-10 flex items-center justify-center bg-amber-100 rounded-full">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {formatCurrency(totals.totalOutstanding)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Live balance pending across all records
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Overdue Payments</p>
              <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-full">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {totals.overduePayments} Students
            </p>
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <ArrowUp className="w-3 h-3 mr-1" />
              Require immediate follow-up
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Total Enrolled</p>
              <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
                <School className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {totals.totalEnrolled.toLocaleString()} Students
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Students linked to fee records
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Collection Trend
                  </h2>
                  <p className="text-sm text-gray-500">
                    Daily collections over the last 7 days.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{dateRange}</span>
                </div>
              </div>
              <div className="flex gap-3 items-end h-48">
                {collectionTrend.map((entry) => (
                  <div key={entry.key} className="flex flex-col items-center w-full">
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-emerald-400 shadow"
                        style={{
                          height: `${(entry.value / peakCollection) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-xs font-medium text-gray-700">
                        {formatCurrency(entry.value)}
                      </p>
                      <p className="text-xs text-gray-500">{entry.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Recent Payments
                  </h2>
                  <p className="text-sm text-gray-500">
                    Payments logged directly from fee records.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search students..."
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option>Last 30 Days</option>
                    <option>Last 7 Days</option>
                    <option>All Time</option>
                  </select>
                  <button
                    onClick={generateReport}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
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
                      className="bg-gray-50 rounded-2xl border border-gray-200 p-4 flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-lg font-semibold text-gray-900">
                          {payment.studentName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {payment.program}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-xl font-semibold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {payment.paidOn
                            ? new Date(payment.paidOn).toLocaleDateString()
                            : '—'}
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
                  <p className="text-sm text-gray-500 text-center py-6">
                    No recent payments match your search.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Enrollment by Program
                  </h2>
                  <p className="text-sm text-gray-500">
                    Distribution of students with fee records.
                  </p>
                </div>
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              {enrollmentData.length ? (
                <div className="grid gap-4">
                  {enrollmentData.map((program, index) => (
                    <div
                      key={program.program}
                      className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm text-gray-500">
                          {program.program}
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {program.students}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Share</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {program.percentage}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No enrollment data available.
                </p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Outstanding Overview
                  </h2>
                  <p className="text-sm text-gray-500">
                    Top programs and batches with outstanding dues.
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              {outstandingFeesData.length ? (
                <div className="space-y-4">
                  {outstandingFeesData.map((segment) => (
                    <div key={segment.label}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">
                          {segment.label}
                        </p>
                        <span className="text-sm text-gray-500">
                          {segment.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full"
                          style={{ width: `${segment.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
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
