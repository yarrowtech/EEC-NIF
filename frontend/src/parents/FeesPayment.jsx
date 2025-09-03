import React, { useState } from 'react';
import { CreditCard, Calendar, Download, ChevronDown, CheckCircle, AlertCircle, X } from 'lucide-react';
import jsPDF from 'jspdf';

const FeesPayment = () => {
  const handleDownloadReceipt = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Fee Payment Receipt', 20, 20);
    doc.setFontSize(12);
    doc.text(`Student Name: ${feesData.studentName}`, 20, 35);
    doc.text(`Class: ${feesData.class}`, 20, 45);
    doc.text(`Total Fees: ₹${feesData.totalFees}`, 20, 55);
    doc.text(`Paid Fees: ₹${feesData.paidFees}`, 20, 65);
    doc.text(`Pending Fees: ₹${feesData.pendingFees}`, 20, 75);
    doc.text(`Next Due Date: ${new Date(feesData.nextDueDate).toLocaleDateString()}`, 20, 85);
    doc.text('Payments:', 20, 95);
    let y = 105;
    feesData.payments.forEach((p, i) => {
      doc.text(`${i + 1}. ${p.type} - ₹${p.amount} - ${p.status}${p.paidOn ? ' (Paid on ' + new Date(p.paidOn).toLocaleDateString() + ')' : ''}`, 25, y);
      y += 10;
    });
    doc.save('Fee_Receipt.pdf');
  };
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  const feesData = {
    studentName: "Koushik Bala",
    class: "10-A",
    totalFees: 50000,
    paidFees: 35000,
    pendingFees: 15000,
    nextDueDate: "2024-03-15",
    payments: [
      {
        id: 1,
        type: "Tuition Fee",
        amount: 25000,
        dueDate: "2024-03-15",
        status: "Paid",
        paidOn: "2024-03-01"
      },
      {
        id: 2,
        type: "Laboratory Fee",
        amount: 5000,
        dueDate: "2024-03-15",
        status: "Pending"
      },
      {
        id: 3,
        type: "Library Fee",
        amount: 2000,
        dueDate: "2024-03-15",
        status: "Paid",
        paidOn: "2024-03-01"
      }
    ]
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Fees Payment</h1>
        <p className="text-yellow-100">Manage and pay school fees</p>
      </div>

      {/* Student Info & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Info</h3>
          <div className="space-y-2">
            <p className="text-gray-600">Name: {feesData.studentName}</p>
            <p className="text-gray-600">Class: {feesData.class}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800">₹{feesData.totalFees}</h3>
            <p className="text-gray-600">Total Fees</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-green-600">₹{feesData.paidFees}</h3>
            <p className="text-gray-600">Paid Fees</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-red-600">₹{feesData.pendingFees}</h3>
            <p className="text-gray-600">Pending Fees</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600">Next Due Date: {new Date(feesData.nextDueDate).toLocaleDateString()}</span>
            </div>
          </div>

          <button
            className="flex items-center space-x-2 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            onClick={handleDownloadReceipt}
          >
            <Download className="w-4 h-4" />
            <span>Download Receipt</span>
          </button>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-6 py-2 sm:py-4 text-left font-medium text-gray-500">Fee Type</th>
                <th className="px-2 sm:px-6 py-2 sm:py-4 text-left font-medium text-gray-500">Amount</th>
                <th className="px-2 sm:px-6 py-2 sm:py-4 text-left font-medium text-gray-500">Due Date</th>
                <th className="px-2 sm:px-6 py-2 sm:py-4 text-left font-medium text-gray-500">Status</th>
                <th className="px-2 sm:px-6 py-2 sm:py-4 text-left font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {feesData.payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-6 py-2 sm:py-4">
                    <div className="text-gray-900">{payment.type}</div>
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4">
                    <div className="flex items-center text-gray-900">
                      {/* <DollarSign className="w-4 h-4 mr-1 text-gray-500" /> */}
                      {payment.amount}
                    </div>
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(payment.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      payment.status === 'Paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4">
                    {payment.status === 'Pending' ? (
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="inline-flex items-center px-2 sm:px-3 py-1 border border-yellow-500 text-yellow-500 rounded hover:bg-yellow-50 text-xs sm:text-sm"
                      >
                        <CreditCard className="w-4 h-4 mr-1" />
                        Pay Now
                      </button>
                    ) : (
                      <span className="flex items-center text-green-600 text-xs sm:text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Paid on {new Date(payment.paidOn).toLocaleDateString()}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Fees Due & Pay Now Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-xl p-4 sm:p-6 shadow-sm mb-4 sm:mb-6 mt-4 sm:mt-6 gap-4 sm:gap-0">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Total Fees Due</h2>
          <p className="text-xl sm:text-2xl text-red-600 font-semibold">₹{feesData.pendingFees}</p>
        </div>
        <button
          className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold shadow-lg transition-all text-base sm:text-lg tracking-wide w-full sm:w-auto"
          onClick={() => setShowPaymentModal(true)}
        >
          Pay Now
        </button>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-0">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-md relative border border-yellow-300 animate-fadeIn">
            <button className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-yellow-600 text-2xl sm:text-3xl font-bold focus:outline-none" onClick={() => setShowPaymentModal(false)}><X /></button>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-yellow-700 text-center">Select Payment Method</h2>
            <div className="space-y-2 sm:space-y-4">
              <button
                className="w-full flex items-center gap-2 sm:gap-3 border border-yellow-300 py-2 sm:py-3 rounded-xl hover:bg-yellow-50 transition-all duration-200 group justify-center"
                onClick={() => setShowUPIModal(true)}
              >
                {/* <DollarSign className="w-5 sm:w-6 h-5 sm:h-6 text-yellow-500" /> */}
                <span className="text-sm sm:text-base font-medium text-gray-700 group-hover:text-gray-900">UPI</span>
              </button>
              <button
                className="w-full flex items-center gap-2 sm:gap-3 border border-yellow-300 py-2 sm:py-3 rounded-xl hover:bg-yellow-50 transition-all duration-200 group justify-center"
                onClick={() => setShowCardModal(true)}
              >
                <CreditCard className="w-5 sm:w-6 h-5 sm:h-6 text-yellow-500" />
                <span className="text-sm sm:text-base font-medium text-gray-700 group-hover:text-gray-900">Credit/Debit Card</span>
              </button>
              <button
                className="w-full flex items-center gap-2 sm:gap-3 border border-yellow-300 py-2 sm:py-3 rounded-xl hover:bg-yellow-50 transition-all duration-200 group justify-center"
                onClick={() => setShowBankModal(true)}
              >
                {/* <DollarSign className="w-5 sm:w-6 h-5 sm:h-6 text-yellow-500" /> */}
                <span className="text-sm sm:text-base font-medium text-gray-700 group-hover:text-gray-900">Net Banking</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPI QR Modal */}
      {showUPIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-0">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-sm relative border border-yellow-300 animate-fadeIn flex flex-col items-center">
            <button className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-yellow-600 text-2xl sm:text-3xl font-bold focus:outline-none" onClick={() => setShowUPIModal(false)}><X /></button>
            <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-yellow-700 text-center">Scan UPI QR to Pay</h2>
            <img src="/koushik-upi-qr.jpeg" alt="UPI QR Code" className="w-40 sm:w-64 h-40 sm:h-64 object-contain rounded-lg border-2 border-yellow-300 mb-2 sm:mb-4" />
            <p className="text-gray-600 text-center text-xs sm:text-base">Open your UPI app and scan the QR code to complete the payment.</p>
          </div>
        </div>
      )}

      {/* Card Payment Modal */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-0">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-lg relative border border-yellow-300 animate-fadeIn flex flex-col items-center">
            <button className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-yellow-600 text-2xl sm:text-3xl font-bold focus:outline-none" onClick={() => setShowCardModal(false)}><X /></button>
            <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-yellow-700 text-center">Pay with Card</h2>
            <form className="w-full space-y-2 sm:space-y-4">
              <input type="text" placeholder="Card Number" maxLength={19} className="w-full border border-yellow-300 rounded-lg px-3 sm:px-4 py-3 sm:py-4 focus:ring-2 focus:ring-yellow-400 focus:outline-none bg-yellow-50 placeholder-gray-400 text-gray-800 text-base sm:text-lg shadow-sm" />
              <div className="flex gap-2 sm:gap-6">
                <input type="text" placeholder="MM/YY" maxLength={5} className="flex-1 border border-yellow-300 rounded-lg px-3 sm:px-4 py-3 sm:py-4 focus:ring-2 focus:ring-yellow-400 focus:outline-none bg-yellow-50 placeholder-gray-400 text-gray-800 text-base sm:text-lg shadow-sm" />
                <input type="text" placeholder="CVV" maxLength={4} className="w-16 sm:w-24 border border-yellow-300 rounded-lg px-3 sm:px-4 py-3 sm:py-4 focus:ring-2 focus:ring-yellow-400 focus:outline-none bg-yellow-50 placeholder-gray-400 text-gray-800 text-base sm:text-lg shadow-sm" />
              </div>
              <input type="text" placeholder="Cardholder Name" className="w-full border border-yellow-300 rounded-lg px-3 sm:px-4 py-3 sm:py-4 focus:ring-2 focus:ring-yellow-400 focus:outline-none bg-yellow-50 placeholder-gray-400 text-gray-800 text-base sm:text-lg shadow-sm" />
              <button type="button" className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white py-3 sm:py-4 rounded-xl font-bold shadow-lg transition-all text-base sm:text-lg tracking-wide">Pay</button>
            </form>
          </div>
        </div>
      )}

      {/* Net Banking Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-0">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-sm relative border border-yellow-300 animate-fadeIn flex flex-col items-center">
            <button className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-yellow-600 text-2xl sm:text-3xl font-bold focus:outline-none" onClick={() => setShowBankModal(false)}><X /></button>
            <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-yellow-700 text-center">Net Banking</h2>
            <form className="w-full space-y-2 sm:space-y-4">
              <select className="w-full border border-yellow-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none bg-yellow-50 text-gray-800 text-sm sm:text-base shadow-sm">
                <option value="">Select Bank</option>
                <option value="SBI">State Bank of India</option>
                <option value="HDFC">HDFC Bank</option>
                <option value="ICICI">ICICI Bank</option>
                <option value="AXIS">Axis Bank</option>
                <option value="PNB">Punjab National Bank</option>
                <option value="BOB">Bank of Baroda</option>
              </select>
              <input type="text" placeholder="Account Holder Name" className="w-full border border-yellow-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none bg-yellow-50 placeholder-gray-400 text-gray-800 text-sm sm:text-base shadow-sm" />
              <input type="text" placeholder="Account Number" className="w-full border border-yellow-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none bg-yellow-50 placeholder-gray-400 text-gray-800 text-sm sm:text-base shadow-sm" />
              <input type="text" placeholder="IFSC Code" className="w-full border border-yellow-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none bg-yellow-50 placeholder-gray-400 text-gray-800 text-sm sm:text-base shadow-sm" />
              <input type="text" placeholder="Branch Name" className="w-full border border-yellow-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none bg-yellow-50 placeholder-gray-400 text-gray-800 text-sm sm:text-base shadow-sm" />
              <button type="button" className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white py-2 sm:py-3 rounded-xl font-bold shadow-lg transition-all text-base sm:text-lg tracking-wide">Pay</button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <div className="mt-4 sm:mt-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-4">Payment Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border-2 border-yellow-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <CreditCard className="w-5 sm:w-6 h-5 sm:h-6 text-yellow-500" />
                <div>
                  <p className="font-medium text-gray-800 text-xs sm:text-base">Credit/Debit Card</p>
                  <p className="text-xs sm:text-sm text-gray-500">Pay securely with your card</p>
                </div>
              </div>
              <input type="radio" name="payment" className="text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm hover:border-2 hover:border-yellow-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* <DollarSign className="w-5 sm:w-6 h-5 sm:h-6 text-gray-500" /> */}
                <div>
                  <p className="font-medium text-gray-800 text-xs sm:text-base">Net Banking</p>
                  <p className="text-xs sm:text-sm text-gray-500">Pay through your bank</p>
                </div>
              </div>
              <input type="radio" name="payment" className="text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm hover:border-2 hover:border-yellow-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* <DollarSign className="w-5 sm:w-6 h-5 sm:h-6 text-gray-500" /> */}
                <div>
                  <p className="font-medium text-gray-800 text-xs sm:text-base">UPI</p>
                  <p className="text-xs sm:text-sm text-gray-500">Pay using UPI</p>
                </div>
              </div>
              <input type="radio" name="payment" className="text-yellow-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesPayment;