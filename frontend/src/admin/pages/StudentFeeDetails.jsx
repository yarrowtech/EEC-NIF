import React, { useState, useEffect } from 'react';
import { Download, CheckSquare, Eye, Calendar, IndianRupee } from 'lucide-react';

const StudentFeeDetails = ({ setShowAdminHeader }) => {
  useEffect(() => {
    setShowAdminHeader(false);
  }, [setShowAdminHeader]);

  const [selectedStudent] = useState({
    id: '123456',
    name: 'Priya Sharma',
    program: 'Computer Science',
    academicYear: '2024-2025',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face'
  });

  const [feeBreakdown] = useState([
    {
      id: 1,
      item: 'Registration Fee',
      dueDate: '2024-08-01',
      amount: 500,
      status: 'paid',
      paidDate: '2024-07-25'
    },
    {
      id: 2,
      item: 'Tuition - Installment 1',
      dueDate: '2024-09-01',
      amount: 47500,
      status: 'paid',
      paidDate: '2024-08-28'
    },
    {
      id: 3,
      item: 'Tuition - Installment 2',
      dueDate: '2025-01-15',
      amount: 47500,
      status: 'due'
    },
    {
      id: 4,
      item: 'MSU Fees',
      dueDate: '2024-11-01',
      amount: 2500,
      status: 'overdue'
    }
  ]);

  const [paymentHistory] = useState([
    {
      id: 1,
      amount: 47500,
      method: 'Online Transfer',
      date: '2024-09-01',
      reference: 'TXN_987654321'
    },
    {
      id: 2,
      amount: 500,
      method: 'Bank Transfer',
      date: '2024-08-01',
      reference: 'TXN_123456789'
    }
  ]);

  const getTotalFees = () => feeBreakdown.reduce((sum, fee) => sum + fee.amount, 0);
  const getTotalPaid = () => feeBreakdown.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
  const getOutstandingBalance = () => getTotalFees() - getTotalPaid();
  const getPaymentProgress = () => Math.round((getTotalPaid() / getTotalFees()) * 100);

  const getStatusBadge = (status) => {
    const badges = {
      paid: 'bg-green-100 text-green-800',
      due: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const markAsPaid = (feeId) => {
    alert(`Marking fee item ${feeId} as paid. This would normally update the backend.`);
  };

  const generateStatement = () => {
    alert('Generating fee statement PDF...');
  };

  const recordPayment = () => {
    alert('Opening payment recording modal...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Student Fee Details</h1>
          <p className="text-gray-600">
            A comprehensive overview of a student's financial record.
          </p>
        </div>

        {/* Student Profile Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
          <div className="flex gap-4">
            <div 
              className="w-24 h-24 rounded-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${selectedStudent.avatar})` }}
            />
            <div className="flex flex-col justify-center">
              <h2 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h2>
              <p className="text-gray-600">Student ID: {selectedStudent.id}</p>
              <p className="text-gray-600">
                Program: {selectedStudent.program} | Academic Year: {selectedStudent.academicYear}
              </p>
            </div>
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
              Record a Payment
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Stats and Progress */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex flex-col gap-2 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-base font-medium">Total Fees</p>
                <p className="text-gray-900 text-2xl font-bold">₹{getTotalFees().toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-base font-medium">Total Paid</p>
                <p className="text-green-600 text-2xl font-bold">₹{getTotalPaid().toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-base font-medium">Outstanding Balance</p>
                <p className="text-red-600 text-2xl font-bold">₹{getOutstandingBalance().toLocaleString()}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <p className="text-gray-900 text-base font-medium">Fee Payment Progress</p>
                <p className="text-gray-900 text-sm">{getPaymentProgress()}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${getPaymentProgress()}%` }}
                />
              </div>
              <p className="text-gray-500 text-sm">
                ₹{getTotalPaid().toLocaleString()} of ₹{getTotalFees().toLocaleString()} paid
              </p>
            </div>
          </div>

          {/* Fee Breakdown Table */}
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
                      <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                    </th>
                    <th className="px-6 py-3">Fee Item</th>
                    <th className="px-6 py-3">Due Date</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {feeBreakdown.map((fee) => (
                    <tr key={fee.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          disabled={fee.status === 'paid'}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50" 
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{fee.item}</td>
                      <td className="px-6 py-4 text-gray-500">{fee.dueDate}</td>
                      <td className="px-6 py-4 text-gray-900">₹{fee.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(fee.status)}`}>
                          {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {fee.status === 'paid' ? (
                          <span className="text-gray-400 italic">Completed</span>
                        ) : (
                          <button 
                            onClick={() => markAsPaid(fee.id)}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            Mark as Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Payment History</h3>
          <div className="flex flex-col gap-4">
            {paymentHistory.map((payment) => (
              <div key={payment.id}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-green-100 rounded-full h-10 w-10 flex items-center justify-center">
                    <CheckSquare size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      ₹{payment.amount.toLocaleString()} 
                      <span className="text-sm font-normal text-gray-500 ml-2">via {payment.method}</span>
                    </p>
                    <p className="text-sm text-gray-500">Paid on {payment.date}</p>
                    <p className="text-xs text-gray-400">Ref: {payment.reference}</p>
                  </div>
                </div>
                {paymentHistory.indexOf(payment) < paymentHistory.length - 1 && (
                  <div className="border-t border-gray-200 mt-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeeDetails;