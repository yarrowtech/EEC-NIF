import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, ArrowLeft, AlertCircle, Calendar } from 'lucide-react';
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
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-red-100 shadow p-8 flex flex-col gap-4">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle />
          <p className="font-semibold">{error}</p>
        </div>
        <button
          onClick={() => navigate('/admin/fees')}
          className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Fees Collection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Student Fee Details</h1>
            <p className="text-gray-600 mt-1">
              Overview of {student?.name || 'the student'}'s financial record.
            </p>
          </div>
          <button
            onClick={generateStatement}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            <Download size={16} />
            Generate Statement
          </button>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{student?.name || 'Unnamed Student'}</h2>
            <p className="text-gray-600 mt-1">
              Roll: {student?.roll || '—'} • Program: {student?.grade || detail?.programLabel}
            </p>
            <p className="text-gray-600">
              Academic Year: {detail?.academicYear || student?.academicYear || '—'}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            <p>Guardian: {student?.guardianName || '—'}</p>
            <p>Contact: {student?.guardianPhone || student?.guardianEmail || '—'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="flex flex-col gap-1 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm font-medium">Total Fees</p>
                <p className="text-gray-900 text-2xl font-bold">
                  {formatCurrency(totals.totalFee)}
                </p>
              </div>
              <div className="flex flex-col gap-1 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm font-medium">Discount Applied</p>
                <p className="text-amber-600 text-2xl font-bold">
                  {formatCurrency(totals.discountAmount)}
                </p>
              </div>
              <div className="flex flex-col gap-1 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm font-medium">Total Paid</p>
                <p className="text-green-600 text-2xl font-bold">
                  {formatCurrency(totals.totalPaid)}
                </p>
              </div>
              <div className="flex flex-col gap-1 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm font-medium">Outstanding Balance</p>
                <p className="text-red-600 text-2xl font-bold">
                  {formatCurrency(totals.outstanding)}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <p className="text-gray-900 text-base font-medium">Fee Payment Progress</p>
                <p className="text-gray-900 text-sm">{totals.progress}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${totals.progress}%` }}
                />
              </div>
              <p className="text-gray-500 text-sm">
                {formatCurrency(totals.totalPaid)} of {formatCurrency(totals.netTotal)} paid
              </p>
              <p className="text-gray-500 text-xs">
                Net payable after discount: {formatCurrency(totals.netTotal)}
              </p>
            </div>
          </div>

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
