import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Download, 
  Bell, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  AlertCircle,
  School,
  Search,
  ArrowUp,
  CheckCircle,
  Clock
} from 'lucide-react';

const FeesDashboard = ({ setShowAdminHeader }) => {
  useEffect(() => {
    setShowAdminHeader(false);
  }, [setShowAdminHeader]);

  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('Last 30 Days');

  // Mock data based on the reference dashboard
  const kpiData = {
    totalOutstanding: 450230.50,
    monthlyCollection: 1280600.00,
    overduePayments: 124,
    totalEnrolled: 2458,
    monthlyGrowth: {
      outstanding: 5.2,
      collection: 12.8,
      overdue: 8,
      enrolled: 120
    }
  };

  const enrollmentData = [
    { program: 'Fashion Design', students: 2015, percentage: 82 },
    { program: 'Interior Design', students: 443, percentage: 18 }
  ];

  const outstandingFeesData = [
    { label: 'Fashion - Sem 1', percentage: 75 },
    { label: 'Fashion - Sem 3', percentage: 60 },
    { label: 'Fashion - Sem 5', percentage: 40 },
    { label: 'Interior - Sem 1', percentage: 50 },
    { label: 'Interior - Sem 3', percentage: 35 },
    { label: 'Interior - Sem 5', percentage: 20 }
  ];

  const recentPayments = [
    {
      id: 1,
      studentName: 'Priya Sharma',
      program: 'Fashion Design',
      semester: 'Sem 3',
      amount: 2500.00,
      paymentDate: 'Oct 15, 2024',
      status: 'Paid'
    },
    {
      id: 2,
      studentName: 'Arjun Patel',
      program: 'Interior Design',
      semester: 'Sem 1',
      amount: 3200.00,
      paymentDate: 'Oct 14, 2024',
      status: 'Paid'
    },
    {
      id: 3,
      studentName: 'Ananya Singh',
      program: 'Fashion Design',
      semester: 'Sem 5',
      amount: 1800.00,
      paymentDate: 'Oct 14, 2024',
      status: 'Paid'
    },
    {
      id: 4,
      studentName: 'Rohit Kumar',
      program: 'Fashion Design',
      semester: 'Sem 1',
      amount: 2500.00,
      paymentDate: 'Oct 12, 2024',
      status: 'Pending'
    },
    {
      id: 5,
      studentName: 'Sneha Reddy',
      program: 'Interior Design',
      semester: 'Sem 3',
      amount: 3200.00,
      paymentDate: 'Oct 11, 2024',
      status: 'Paid'
    }
  ];

  const filteredPayments = recentPayments.filter(payment =>
    payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const generateReport = () => {
    alert('Generating comprehensive fees report...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Content */}
      <div className="p-8">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Outstanding */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Total Outstanding</p>
              <div className="w-10 h-10 flex items-center justify-center bg-amber-100 rounded-full">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {formatCurrency(kpiData.totalOutstanding)}
            </p>
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{kpiData.monthlyGrowth.outstanding}% from last month
            </p>
          </div>

          {/* Fees Collected */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Fees Collected (Month)</p>
              <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-full">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {formatCurrency(kpiData.monthlyCollection)}
            </p>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <ArrowUp className="w-3 h-3 mr-1" />
              +{kpiData.monthlyGrowth.collection}% vs last month
            </p>
          </div>

          {/* Overdue Payments */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Overdue Payments</p>
              <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-full">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {kpiData.overduePayments} Students
            </p>
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <ArrowUp className="w-3 h-3 mr-1" />
              +{kpiData.monthlyGrowth.overdue} new since last week
            </p>
          </div>

          {/* Total Enrolled */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Total Enrolled</p>
              <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
                <School className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {kpiData.totalEnrolled.toLocaleString()} Students
            </p>
            <p className="text-xs text-gray-500 mt-1">
              +{kpiData.monthlyGrowth.enrolled} this semester
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Enrollment by Program */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Enrollment by Program</h3>
            <div className="relative flex items-center justify-center my-6 h-48">
              {/* Simple pie chart representation */}
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-blue-400" 
                   style={{
                     background: `conic-gradient(#2563eb 0% ${enrollmentData[0].percentage}%, #e5e7eb ${enrollmentData[0].percentage}% 100%)`
                   }}>
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-gray-900">{enrollmentData[0].percentage}%</span>
                    <p className="text-xs text-gray-500">Fashion</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {enrollmentData.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className={`w-2.5 h-2.5 rounded-full mr-2 ${
                      index === 0 ? 'bg-blue-600' : 'bg-gray-300'
                    }`}></span>
                    <span className="text-sm font-medium text-gray-600">{item.program}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    {item.students.toLocaleString()} Students
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Outstanding Fees Summary */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Outstanding Fees Summary</h3>
            <div className="h-64 mt-4 flex items-end space-x-4">
              {outstandingFeesData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center space-y-2 h-full justify-end">
                  <div 
                    className="w-full bg-gray-200 rounded-t-md relative"
                    style={{ height: `${item.percentage}%` }}
                  >
                    <div className={`w-full rounded-t-md h-full ${
                      item.label.includes('Fashion') ? 'bg-blue-600' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <span className="text-xs text-gray-500 text-center">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Payments Table */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search students..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-600 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3">Program / Stream</th>
                  <th className="px-6 py-3">Amount Paid</th>
                  <th className="px-6 py-3">Payment Date</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{payment.studentName}</td>
                    <td className="px-6 py-4 text-gray-600">{payment.program} / {payment.semester}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{payment.paymentDate}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status === 'Paid' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {payment.status}
                      </span>
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

export default FeesDashboard;