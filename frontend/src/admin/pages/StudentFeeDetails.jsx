import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Download,
  ArrowLeft,
  AlertCircle,
  Calendar,
  Wallet,
  PiggyBank,
  BadgeCheck,
  Phone,
  Mail,
  User,
  Clock,
} from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL;

const StudentFeeDetails = ({ setShowAdminHeader }) => {
  useEffect(() => {
    setShowAdminHeader(false);
  }, [setShowAdminHeader]);

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const feeRecordId =
    location.state?.feeRecordId || searchParams.get('record') || '';

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetails = useCallback(
    async ({ silent } = {}) => {
      if (!feeRecordId) {
        setError('No fee record selected. Please return to Fees Collection.');
        if (!silent) {
          setLoading(false);
        }
        return;
      }

      if (!silent) {
        setLoading(true);
      }

      try {
        setError('');
        const res = await fetch(
          `${API_BASE}/api/nif/fees/details/${feeRecordId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Unable to load fee details');
        }
        setDetail(data);
      } catch (err) {
        setError(err.message || 'Failed to load fee details');
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [feeRecordId]
  );

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const student = detail?.student;
  const payments = detail?.payments || [];
  const [breakdown, setBreakdown] = useState([]);
  const [discountValue, setDiscountValue] = useState('');
  const [discountNote, setDiscountNote] = useState('');
  const [savingDiscount, setSavingDiscount] = useState(false);

  useEffect(() => {
    if (!detail) {
      setDiscountValue('');
      setDiscountNote('');
      return;
    }
    setDiscountValue(
      detail.discountAmount != null ? String(detail.discountAmount) : ''
    );
    setDiscountNote(detail.discountNote || '');
  }, [detail]);

  const applyDiscountToInstallments = useCallback((installments = [], discountAmount = 0) => {
    if (!discountAmount) return installments;

    let remainingDiscount = Number(discountAmount);
    if (!Number.isFinite(remainingDiscount) || remainingDiscount <= 0) {
      return installments;
    }

    const updated = installments.map((inst) => ({
      ...inst,
      discountImpact: 0,
    }));

    for (let idx = updated.length - 1; idx >= 0 && remainingDiscount > 0; idx -= 1) {
      const inst = updated[idx];
      const dueBeforeDiscount =
        inst.outstanding != null
          ? Math.max(0, Number(inst.outstanding))
          : Math.max(0, Number(inst.amount || 0) - Number(inst.paid || 0));

      if (!dueBeforeDiscount) {
        continue;
      }

      const appliedDiscount = Math.min(remainingDiscount, dueBeforeDiscount);
      inst.outstanding = dueBeforeDiscount - appliedDiscount;
      inst.discountImpact = appliedDiscount;
      remainingDiscount -= appliedDiscount;

      if (inst.outstanding === 0) {
        inst.status = 'discounted';
      }
    }

    return updated;
  }, []);

  useEffect(() => {
    if (!detail) return;
    const installmentsSource =
      detail.installments && detail.installments.length
        ? detail.installments
        : detail.installmentsSnapshot && detail.installmentsSnapshot.length
        ? detail.installmentsSnapshot
        : null;
    const source =
      installmentsSource ||
      [
            {
              label: 'Program Fee',
              amount: detail.totalFee,
              dueMonth: detail.academicYear || '—',
            },
          ];

    const normalized = source.map((inst, idx) => {
      const amount = Number(inst.amount || 0);
      const paidAmount = Number(inst.paid || 0);
      const outstanding =
        inst.outstanding != null
          ? Number(inst.outstanding)
          : Math.max(0, amount - paidAmount);
      const discountImpact = Number(inst.discountImpact || 0);
      const status =
        inst.status ||
        (paidAmount >= amount
          ? 'paid'
          : paidAmount > 0
          ? 'partial'
          : 'due');

      return {
        label: inst.label || `Installment ${idx + 1}`,
        dueMonth: inst.dueMonth || 'Scheduled',
        amount,
        paid: paidAmount,
        outstanding,
        status,
        discountImpact,
      };
    });

    const discountAmount = Number(detail.discountAmount || 0);
    const backendHasDiscounts =
      normalized.some(
        (inst) => inst.discountImpact > 0 || inst.status === 'discounted'
      );
    const shouldSimulateDiscount =
      discountAmount > 0 && !backendHasDiscounts;

    const withDiscounts = shouldSimulateDiscount
      ? applyDiscountToInstallments(normalized, discountAmount)
      : normalized;

    setBreakdown(withDiscounts);
  }, [applyDiscountToInstallments, detail]);

  const totals = useMemo(() => {
    if (!detail) {
      return {
        totalFee: 0,
        totalPaid: 0,
        discountAmount: 0,
        netTotal: 0,
        outstanding: 0,
        progress: 0,
      };
    }
    const totalFee = Number(detail.totalFee || 0);
    const totalPaid = Number(detail.paidAmount || 0);
    const discountAmount = Number(detail.discountAmount || 0);
    const netTotal = Math.max(0, totalFee - discountAmount);
    const outstanding = Math.max(0, netTotal - totalPaid);
    const progress = netTotal ? Math.round((totalPaid / netTotal) * 100) : 0;
    return { totalFee, totalPaid, discountAmount, netTotal, outstanding, progress };
  }, [detail]);

  const formatCurrency = (value = 0) =>
    `₹${Number(value || 0).toLocaleString()}`;

  const getStatusBadge = (status) => {
    const badges = {
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      due: 'bg-red-100 text-red-800',
      discounted: 'bg-yellow-100 text-yellow-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };
  const getStatusLabel = (status = '') =>
    status === 'discounted' ? 'DISCOUNT' : status?.toUpperCase?.() || '';

  const dueInstallments = useMemo(
    () =>
      breakdown.filter((inst) => Number(inst.outstanding ?? inst.amount ?? 0) > 0),
    [breakdown]
  );

  const upcomingInstallment = useMemo(
    () => dueInstallments[0] || null,
    [dueInstallments]
  );

  const upcomingPreview = useMemo(
    () => dueInstallments.slice(0, 3),
    [dueInstallments]
  );

  const latestPayment = useMemo(() => {
    if (!payments.length) return null;
    return [...payments].sort(
      (a, b) => new Date(b.paidOn || 0) - new Date(a.paidOn || 0)
    )[0];
  }, [payments]);

  const guardianPhone = student?.guardianPhone || student?.mobile || 'Not provided';
  const guardianEmail = student?.guardianEmail || student?.email || 'Not provided';

  const markInstallmentPaid = async (idx) => {
    if (!feeRecordId) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/nif/fees/installments/pay/${feeRecordId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ installmentIndex: idx, method: 'cash' }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to mark installment as paid');
      }
      await fetchDetails({ silent: true });
    } catch (err) {
      alert(err.message || 'Could not mark as paid');
    } finally {
    }
  };

  const handleApplyDiscount = async () => {
    if (!feeRecordId) return;
    const numericValue = Number(discountValue || 0);
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      alert('Enter a valid discount amount');
      return;
    }
    if (detail && numericValue > Number(detail.totalFee || 0)) {
      alert('Discount cannot exceed the total fee amount');
      return;
    }

    setSavingDiscount(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/nif/fees/discount/${feeRecordId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            amount: numericValue,
            note: discountNote,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update discount');
      }
      await fetchDetails({ silent: true });
    } catch (err) {
      alert(err.message || 'Could not update discount');
    } finally {
      setSavingDiscount(false);
    }
  };

  const generateStatement = () => {
    alert('Implement statement export.');
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-600">
          <div className="animate-spin h-10 w-10 border-2 border-yellow-600 border-t-transparent rounded-full mx-auto mb-4" />
          Loading student fee details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="relative max-w-xl w-full rounded-3xl border border-red-100 shadow-2xl overflow-hidden error-state-card">
          <div className="relative z-10 p-8 flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Something’s missing</h2>
              <p className="text-gray-600">
                {error || 'No fee record selected. Please return to Fees Collection.'}
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/fees')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold shadow hover:shadow-lg transition-all"
            >
              <ArrowLeft size={16} />
              Back to Fees Collection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
        <div className="relative isolate px-6 py-8 sm:px-8 animated-fee-gradient text-white">
          <div className="absolute inset-y-0 right-0 w-64 blur-3xl bg-white/30 opacity-40 pointer-events-none" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
            <div className="space-y-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Fees
              </button>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">
                  {student?.name || 'Unnamed Student'}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/25 text-white">
                  {getStatusLabel(detail?.status) || 'STATUS'}
                </span>
              </div>
              <p className="text-white/80">
                Roll: {student?.roll || '—'} • Program:{' '}
                {student?.grade || detail?.programLabel || '—'}
              </p>
              <p className="text-white/80">
                Academic Year: {detail?.academicYear || student?.academicYear || '—'}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-white/80">
                <span className="inline-flex items-center gap-2">
                  <User size={16} />
                  {student?.guardianName || 'Guardian not added'}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Phone size={16} />
                  {guardianPhone}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Mail size={16} />
                  {guardianEmail}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-sm">
              <div className="rounded-2xl bg-white/15 border border-white/30 p-4 shadow-lg backdrop-blur">
                <p className="text-sm text-white/80">Outstanding balance</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(totals.outstanding)}
                </p>
                <p className="text-xs text-white/70">
                  Net payable: {formatCurrency(totals.netTotal)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
                <p className="text-sm text-white/80">Next installment</p>
                <p className="text-2xl font-semibold">
                  {upcomingInstallment
                    ? formatCurrency(
                        upcomingInstallment.outstanding ?? upcomingInstallment.amount
                      )
                    : 'All clear'}
                </p>
                <p className="text-xs text-white/80 flex items-center gap-2 mt-1">
                  <Calendar size={14} />
                  {upcomingInstallment?.dueMonth || 'To be scheduled'}
                </p>
              </div>
              <button
                onClick={generateStatement}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-amber-600 rounded-2xl font-semibold shadow hover:bg-amber-50 transition-colors"
              >
                <Download size={16} />
                Generate Statement
              </button>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm text-white/80 relative z-10">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 border border-white/20 p-3">
              <Calendar size={18} />
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Course Duration
                </p>
                <p className="font-semibold">
                  {student?.duration || detail?.programLabel || 'Not specified'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 border border-white/20 p-3">
              <Clock size={18} />
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Last Payment
                </p>
                <p className="font-semibold">
                  {latestPayment?.paidOn
                    ? new Date(latestPayment.paidOn).toLocaleDateString()
                    : 'No payments yet'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 border border-white/20 p-3">
              <BadgeCheck size={18} />
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Payments Logged
                </p>
                <p className="font-semibold">{payments.length || 0} entries</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 bg-white">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-100 p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Total Fee</span>
                <Wallet size={18} className="text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totals.totalFee)}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Discount Applied</span>
                <PiggyBank size={18} className="text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(totals.discountAmount)}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Total Paid</span>
                <BadgeCheck size={18} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(totals.totalPaid)}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Outstanding</span>
                <AlertCircle size={18} className="text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totals.outstanding)}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Payment Progress</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {totals.progress}%
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>Last payment</p>
                  <p className="text-base font-semibold text-gray-900">
                    {latestPayment ? formatCurrency(latestPayment.amount) : '—'}
                  </p>
                  <p className="text-xs">
                    {latestPayment?.paidOn
                      ? new Date(latestPayment.paidOn).toLocaleString()
                      : 'No payments yet'}
                  </p>
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300"
                  style={{ width: `${totals.progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {formatCurrency(totals.totalPaid)} of{' '}
                {formatCurrency(totals.netTotal)} paid
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Upcoming installments
                  </p>
                  <p className="text-xs text-gray-500">
                    Next dues at a glance
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                  {dueInstallments.length} pending
                </span>
              </div>
              {upcomingPreview.length ? (
                <div className="space-y-3">
                  {upcomingPreview.map((inst, idx) => (
                    <div
                      key={`${inst.label}-${idx}`}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {inst.label}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {inst.dueMonth || 'Scheduled'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(inst.outstanding ?? inst.amount)}
                        </p>
                        <p className="text-[11px] text-gray-500 uppercase">
                          {getStatusLabel(inst.status)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {dueInstallments.length > upcomingPreview.length && (
                    <p className="text-xs text-gray-500">
                      +{dueInstallments.length - upcomingPreview.length} more installments
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  All installments are settled. No pending dues.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col gap-2 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Fee Breakup</h3>
                <p className="text-xs text-gray-500">
                  Registration parts and installments with paid vs remaining. Click an item to mark it as paid.
                </p>
              </div>
              {breakdown.length ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {breakdown.map((fee, idx) => {
                    const discountImpact = Number(fee.discountImpact || 0);
                    const isDiscountImpacted =
                      discountImpact > 0 || fee.status === 'discounted';
                    const statusForDisplay = isDiscountImpacted ? 'discounted' : fee.status;
                    const isCompletedStatus =
                      statusForDisplay === 'paid' || statusForDisplay === 'discounted';
                    const canMarkPaid = !isCompletedStatus;

                    return (
                      <div
                        key={`${fee.label}-${idx}`}
                        className={`flex flex-col gap-3 rounded-lg border px-4 py-3 shadow-xs ${
                          isDiscountImpacted
                            ? 'border-amber-200 bg-amber-50/60'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {fee.label}
                            </p>
                            <p className="text-xs text-gray-500">
                              {fee.dueMonth || 'Scheduled'}
                            </p>
                            {isDiscountImpacted && (
                              <p className="text-[11px] text-amber-600 font-semibold">
                                Discount applied
                                {discountImpact > 0 && (
                                  <span className="ml-1 font-normal text-amber-700">
                                    ({formatCurrency(discountImpact)})
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-[11px] font-semibold ${getStatusBadge(
                              statusForDisplay
                            )}`}
                          >
                            {getStatusLabel(statusForDisplay)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                          <div className="flex flex-col">
                            <span className="text-[11px] uppercase tracking-wide">
                              Amount
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(fee.amount)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] uppercase tracking-wide text-green-700">
                              Paid
                            </span>
                            <span className="font-semibold text-green-700">
                              {formatCurrency(fee.paid)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] uppercase tracking-wide text-red-700">
                              Remaining
                            </span>
                            <span className="font-semibold text-red-700">
                              {formatCurrency(fee.outstanding)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => markInstallmentPaid(idx)}
                          disabled={!canMarkPaid}
                          className={`text-xs font-semibold self-start ${
                            canMarkPaid
                              ? 'text-blue-600 hover:underline'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {canMarkPaid
                            ? 'Mark as Paid'
                            : statusForDisplay === 'discounted'
                            ? 'Discounted'
                            : 'Completed'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No fee breakup available.</p>
              )}
            </div>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="p-4 w-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3">Fee Item</th>
                    <th className="px-6 py-3">Due Date</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {breakdown.length ? (
                    breakdown.map((fee, idx) => {
                      const discountImpact = Number(fee.discountImpact || 0);
                      const isDiscountImpacted =
                        discountImpact > 0 || fee.status === 'discounted';
                      const statusForDisplay = isDiscountImpacted ? 'discounted' : fee.status;
                      const isCompletedStatus =
                        statusForDisplay === 'paid' || statusForDisplay === 'discounted';
                      const canMarkPaid = !isCompletedStatus;

                      return (
                        <tr
                          key={`${fee.label}-${idx}`}
                          className={`${
                            isDiscountImpacted ? 'bg-amber-50/70' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="p-4 w-4">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-3 text-gray-900 font-medium">
                            {fee.label}
                            {isDiscountImpacted && (
                              <span className="ml-2 text-[11px] font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                Discounted
                                {discountImpact > 0 && (
                                  <span className="ml-1 text-amber-700">
                                    ({formatCurrency(discountImpact)})
                                  </span>
                                )}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-gray-500 flex items-center gap-2">
                            <Calendar size={14} />
                            {fee.dueMonth || 'Scheduled'}
                          </td>
                          <td className="px-6 py-3 text-gray-900">
                            {formatCurrency(fee.amount)}
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                statusForDisplay
                              )}`}
                            >
                              {getStatusLabel(statusForDisplay)}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            {canMarkPaid ? (
                              <button
                                onClick={() => markInstallmentPaid(idx)}
                                className="font-medium text-blue-600 hover:underline"
                              >
                                Mark as Paid
                              </button>
                            ) : (
                              <span className="text-gray-400 italic">
                                {statusForDisplay === 'discounted' ? 'Discounted' : 'Completed'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        className="px-6 py-8 text-center text-gray-500"
                        colSpan={6}
                      >
                        No fee breakup available for this course.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Fee Discount</h3>
            <p className="text-sm text-gray-600">
              Current discount: {formatCurrency(detail?.discountAmount || 0)} • Net payable:{' '}
              {formatCurrency(totals.netTotal)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {detail?.discountNote ? `Note: ${detail.discountNote}` : 'No discount note added yet.'}
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Discount Amount</label>
                <input
                  type="number"
                  min="0"
                  max={detail?.totalFee || undefined}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
                <span className="text-xs text-gray-400">
                  Max allowed: {formatCurrency(detail?.totalFee || 0)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Note (optional)</label>
                <input
                  type="text"
                  value={discountNote}
                  onChange={(e) => setDiscountNote(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Reason for discount"
                />
              </div>
              <button
                onClick={handleApplyDiscount}
                disabled={savingDiscount}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:bg-gray-300"
              >
                {savingDiscount ? 'Saving...' : 'Apply Discount'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment History</h3>
            {payments.length ? (
              <div className="space-y-3">
                {payments.map((payment, idx) => (
                  <div
                    key={`${payment.paidOn}-${idx}`}
                    className="flex items-center justify-between border border-gray-200 rounded-xl p-3"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {payment.method?.toUpperCase() || 'CASH'}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {payment.paidOn
                        ? new Date(payment.paidOn).toLocaleDateString()
                        : '—'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No payment records yet. Collect a payment to populate this list.
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Current Status</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                    detail?.status
                  )}`}
                >
                  {getStatusLabel(detail?.status)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Payment</span>
                <span>
                  {detail?.lastPayment
                    ? new Date(detail.lastPayment).toLocaleString()
                    : 'No payments yet'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeeDetails;
