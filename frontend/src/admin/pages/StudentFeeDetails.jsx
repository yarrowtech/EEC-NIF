import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  CheckSquare,
  Calendar,
  IndianRupee,
  ArrowLeft,
  AlertCircle,
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

  useEffect(() => {
    const fetchDetails = async () => {
      if (!feeRecordId) {
        setError('No fee record selected. Return to Fees Collection and pick a student.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
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
        setLoading(false);
      }
    };

    fetchDetails();
  }, [feeRecordId]);

  const installmentBreakdown = detail?.installments || [];
  const paymentHistory = detail?.payments || [];
  const student = detail?.student;

  const totals = useMemo(() => {
    if (!detail) {
      return { totalFee: 0, totalPaid: 0, outstanding: 0, progress: 0 };
    }
    const totalFee = Number(detail.totalFee || 0);
    const totalPaid = Number(detail.paidAmount || 0);
    const outstanding = Math.max(0, totalFee - totalPaid);
    const progress = totalFee ? Math.round((totalPaid / totalFee) * 100) : 0;
    return { totalFee, totalPaid, outstanding, progress };
  }, [detail]);

  const formatCurrency = (value = 0) =>
    `₹${Number(value || 0).toLocaleString()}`;

  const getStatusBadge = (status) => {
    const badges = {
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      due: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const generateStatement = () => {
    // Placeholder for PDF/report generation
    alert('Implement fee statement generation.');
  };

  const recordPayment = () => {
    alert('Implement payment recording flow.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-600">
          <div className="animate-spin h-10 w-10 border-2 border-yellow-600 border-t-transparent rounded-full mx-auto mb-4" />
          Loading student fee details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow border border-red-100 flex flex-col gap-4">
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
              A comprehensive overview of {student?.name || 'the student'}'s financial record.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={generateStatement}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <Download size={16} />
              Generate Statement
            </button>
            <button
              onClick={recordPayment}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <IndianRupee size={16} />
              Record Payment
            </button>
          </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex flex-col gap-1 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm font-medium">Total Fees</p>
                <p className="text-gray-900 text-2xl font-bold">
                  {formatCurrency(totals.totalFee)}
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
                {formatCurrency(totals.totalPaid)} of {formatCurrency(totals.totalFee)} paid
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Fee Breakdown</h3>
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                <CheckSquare size={16} />
                Mark Selected as Paid
              </button>
            </div>

            <div className="overflow-x-auto">
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
                    <th className="px-6 py-3">Due Timeline</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {installmentBreakdown.length ? (
                    installmentBreakdown.map((fee, idx) => (
                      <tr key={`${fee.label}-${idx}`} className="hover:bg-gray-50">
                        <td className="p-4 w-4">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-3 text-gray-900 font-medium">
                          {fee.label || `Installment ${idx + 1}`}
                        </td>
                        <td className="px-6 py-3 text-gray-500 flex items-center gap-2">
                          <Calendar size={14} />
                          {fee.dueMonth || 'Scheduled'}
                        </td>
                        <td className="px-6 py-3 text-gray-900">
                          {formatCurrency(fee.amount)}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className="inline-flex px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                            Pending
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-6 py-6 text-center text-gray-500"
                        colSpan={5}
                      >
                        No installment breakdown available for this course.
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
            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment History</h3>
            {paymentHistory.length ? (
              <div className="space-y-4">
                {paymentHistory.map((payment, idx) => (
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
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                    detail?.status
                  )}`}
                >
                  {detail?.status?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
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
