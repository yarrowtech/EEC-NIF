// import React, { useState, useEffect } from 'react';
// import { 
//   Calendar, 
//   Download, 
//   Bell, 
//   TrendingUp, 
//   TrendingDown,
//   DollarSign,
//   Users,
//   AlertCircle,
//   School,
//   Search,
//   ArrowUp,
//   CheckCircle,
//   Clock
// } from 'lucide-react';

// const FeesDashboard = ({ setShowAdminHeader }) => {
//   useEffect(() => {
//     setShowAdminHeader(false);
//   }, [setShowAdminHeader]);

//   const [searchTerm, setSearchTerm] = useState('');
//   const [dateRange, setDateRange] = useState('Last 30 Days');

//   // Mock data based on the reference dashboard
//   const kpiData = {
//     totalOutstanding: 450230.50,
//     monthlyCollection: 1280600.00,
//     overduePayments: 124,
//     totalEnrolled: 2458,
//     monthlyGrowth: {
//       outstanding: 5.2,
//       collection: 12.8,
//       overdue: 8,
//       enrolled: 120
//     }
//   };

//   const enrollmentData = [
//     { program: 'Fashion Design', students: 2015, percentage: 82 },
//     { program: 'Interior Design', students: 443, percentage: 18 }
//   ];

//   const outstandingFeesData = [
//     { label: 'Fashion - Sem 1', percentage: 75 },
//     { label: 'Fashion - Sem 3', percentage: 60 },
//     { label: 'Fashion - Sem 5', percentage: 40 },
//     { label: 'Interior - Sem 1', percentage: 50 },
//     { label: 'Interior - Sem 3', percentage: 35 },
//     { label: 'Interior - Sem 5', percentage: 20 }
//   ];

//   const recentPayments = [
//     {
//       id: 1,
//       studentName: 'Priya Sharma',
//       program: 'Fashion Design',
//       semester: 'Sem 3',
//       amount: 2500.00,
//       paymentDate: 'Oct 15, 2024',
//       status: 'Paid'
//     },
//     {
//       id: 2,
//       studentName: 'Arjun Patel',
//       program: 'Interior Design',
//       semester: 'Sem 1',
//       amount: 3200.00,
//       paymentDate: 'Oct 14, 2024',
//       status: 'Paid'
//     },
//     {
//       id: 3,
//       studentName: 'Ananya Singh',
//       program: 'Fashion Design',
//       semester: 'Sem 5',
//       amount: 1800.00,
//       paymentDate: 'Oct 14, 2024',
//       status: 'Paid'
//     },
//     {
//       id: 4,
//       studentName: 'Rohit Kumar',
//       program: 'Fashion Design',
//       semester: 'Sem 1',
//       amount: 2500.00,
//       paymentDate: 'Oct 12, 2024',
//       status: 'Pending'
//     },
//     {
//       id: 5,
//       studentName: 'Sneha Reddy',
//       program: 'Interior Design',
//       semester: 'Sem 3',
//       amount: 3200.00,
//       paymentDate: 'Oct 11, 2024',
//       status: 'Paid'
//     }
//   ];

//   const filteredPayments = recentPayments.filter(payment =>
//     payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     payment.program.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'Paid':
//         return 'bg-green-100 text-green-800';
//       case 'Pending':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'Overdue':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR'
//     }).format(amount);
//   };

//   const generateReport = () => {
//     alert('Generating comprehensive fees report...');
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Page Content */}
//       <div className="p-8">
//         {/* KPI Summary Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {/* Total Outstanding */}
//           <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
//             <div className="flex items-center justify-between">
//               <p className="text-sm font-medium text-gray-500">Total Outstanding</p>
//               <div className="w-10 h-10 flex items-center justify-center bg-amber-100 rounded-full">
//                 <Clock className="w-5 h-5 text-amber-600" />
//               </div>
//             </div>
//             <p className="text-3xl font-bold text-gray-900 mt-2">
//               {formatCurrency(kpiData.totalOutstanding)}
//             </p>
//             <p className="text-xs text-gray-500 mt-1 flex items-center">
//               <TrendingUp className="w-3 h-3 mr-1" />
//               +{kpiData.monthlyGrowth.outstanding}% from last month
//             </p>
//           </div>

//           {/* Fees Collected */}
//           <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
//             <div className="flex items-center justify-between">
//               <p className="text-sm font-medium text-gray-500">Fees Collected (Month)</p>
//               <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-full">
//                 <DollarSign className="w-5 h-5 text-green-600" />
//               </div>
//             </div>
//             <p className="text-3xl font-bold text-gray-900 mt-2">
//               {formatCurrency(kpiData.monthlyCollection)}
//             </p>
//             <p className="text-xs text-green-600 mt-1 flex items-center">
//               <ArrowUp className="w-3 h-3 mr-1" />
//               +{kpiData.monthlyGrowth.collection}% vs last month
//             </p>
//           </div>

//           {/* Overdue Payments */}
//           <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
//             <div className="flex items-center justify-between">
//               <p className="text-sm font-medium text-gray-500">Overdue Payments</p>
//               <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-full">
//                 <AlertCircle className="w-5 h-5 text-red-600" />
//               </div>
//             </div>
//             <p className="text-3xl font-bold text-gray-900 mt-2">
//               {kpiData.overduePayments} Students
//             </p>
//             <p className="text-xs text-red-600 mt-1 flex items-center">
//               <ArrowUp className="w-3 h-3 mr-1" />
//               +{kpiData.monthlyGrowth.overdue} new since last week
//             </p>
//           </div>

//           {/* Total Enrolled */}
//           <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
//             <div className="flex items-center justify-between">
//               <p className="text-sm font-medium text-gray-500">Total Enrolled</p>
//               <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
//                 <School className="w-5 h-5 text-blue-600" />
//               </div>
//             </div>
//             <p className="text-3xl font-bold text-gray-900 mt-2">
//               {kpiData.totalEnrolled.toLocaleString()} Students
//             </p>
//             <p className="text-xs text-gray-500 mt-1">
//               +{kpiData.monthlyGrowth.enrolled} this semester
//             </p>
//           </div>
//         </div>

//         {/* Charts Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
//           {/* Enrollment by Program */}
//           <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//             <h3 className="text-lg font-semibold text-gray-900">Enrollment by Program</h3>
//             <div className="relative flex items-center justify-center my-6 h-48">
//               {/* Simple pie chart representation */}
//               <div className="relative w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-blue-400" 
//                    style={{
//                      background: `conic-gradient(#2563eb 0% ${enrollmentData[0].percentage}%, #e5e7eb ${enrollmentData[0].percentage}% 100%)`
//                    }}>
//                 <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
//                   <div className="text-center">
//                     <span className="text-2xl font-bold text-gray-900">{enrollmentData[0].percentage}%</span>
//                     <p className="text-xs text-gray-500">Fashion</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="space-y-3">
//               {enrollmentData.map((item, index) => (
//                 <div key={index} className="flex justify-between items-center">
//                   <div className="flex items-center">
//                     <span className={`w-2.5 h-2.5 rounded-full mr-2 ${
//                       index === 0 ? 'bg-blue-600' : 'bg-gray-300'
//                     }`}></span>
//                     <span className="text-sm font-medium text-gray-600">{item.program}</span>
//                   </div>
//                   <span className="text-sm font-semibold text-gray-800">
//                     {item.students.toLocaleString()} Students
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Outstanding Fees Summary */}
//           <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//             <h3 className="text-lg font-semibold text-gray-900">Outstanding Fees Summary</h3>
//             <div className="h-64 mt-4 flex items-end space-x-4">
//               {outstandingFeesData.map((item, index) => (
//                 <div key={index} className="flex-1 flex flex-col items-center space-y-2 h-full justify-end">
//                   <div 
//                     className="w-full bg-gray-200 rounded-t-md relative"
//                     style={{ height: `${item.percentage}%` }}
//                   >
//                     <div className={`w-full rounded-t-md h-full ${
//                       item.label.includes('Fashion') ? 'bg-blue-600' : 'bg-gray-400'
//                     }`}></div>
//                   </div>
//                   <span className="text-xs text-gray-500 text-center">{item.label}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Recent Payments Table */}
//         <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//           <div className="p-6 flex justify-between items-center">
//             <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//               <input 
//                 className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Search students..."
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm text-left">
//               <thead className="bg-gray-50 text-xs text-gray-600 uppercase font-semibold">
//                 <tr>
//                   <th className="px-6 py-3">Student Name</th>
//                   <th className="px-6 py-3">Program / Stream</th>
//                   <th className="px-6 py-3">Amount Paid</th>
//                   <th className="px-6 py-3">Payment Date</th>
//                   <th className="px-6 py-3">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredPayments.map((payment) => (
//                   <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-50">
//                     <td className="px-6 py-4 font-medium text-gray-900">{payment.studentName}</td>
//                     <td className="px-6 py-4 text-gray-600">{payment.program} / {payment.semester}</td>
//                     <td className="px-6 py-4 font-medium text-gray-800">
//                       {formatCurrency(payment.amount)}
//                     </td>
//                     <td className="px-6 py-4 text-gray-600">{payment.paymentDate}</td>
//                     <td className="px-6 py-4">
//                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
//                         {payment.status === 'Paid' && <CheckCircle className="w-3 h-3 mr-1" />}
//                         {payment.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FeesDashboard;

// src/NIF/FeesDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  Calendar,
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
  Loader2,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const FeesDashboard = ({ setShowAdminHeader }) => {
  useEffect(() => {
    if (setShowAdminHeader) setShowAdminHeader(false);
  }, [setShowAdminHeader]);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("Last 30 Days");

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState("");

  const [kpiData, setKpiData] = useState({
    totalOutstanding: 0,
    monthlyCollection: 0,
    overduePayments: 0,
    totalEnrolled: 0,
    monthlyGrowth: {
      outstanding: 0,
      collection: 0,
      overdue: 0,
      enrolled: 0,
    },
  });

  const [enrollmentData, setEnrollmentData] = useState([]);
  const [outstandingFeesData, setOutstandingFeesData] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch(`${API_BASE}/api/nif/fees/dashboard/summary`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load dashboard summary");
      }
      const data = await res.json();

      const {
        totalStudents,
        totalCollected,
        totalOutstanding,
        thisMonthCollection,
        lastMonthCollection,
      } = data;

      const collectionGrowth =
        lastMonthCollection > 0
          ? ((thisMonthCollection - lastMonthCollection) /
              lastMonthCollection) *
            100
          : thisMonthCollection > 0
          ? 100
          : 0;

      setKpiData((prev) => ({
        ...prev,
        totalOutstanding,
        monthlyCollection: thisMonthCollection,
        totalEnrolled: totalStudents,
        monthlyGrowth: {
          ...prev.monthlyGrowth,
          collection: Number(collectionGrowth.toFixed(1)),
        },
      }));
    } catch (err) {
      console.error(err);
      setError(err.message);
      alert(`Error loading fees summary: ${err.message}`);
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      const res = await fetch(`${API_BASE}/api/nif/fees/records/fetch`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load fee records");
      }
      const records = await res.json();

      const arr = Array.isArray(records) ? records : [];

      // Overdue = status === 'due'
      const overdueCount = arr.filter((r) => r.status === "due").length;

      // Enrollment by course
      const byCourse = {};
      arr.forEach((r) => {
        const key = r.course || "Unknown";
        byCourse[key] = (byCourse[key] || 0) + 1;
      });
      const enrollArr = Object.entries(byCourse).map(([course, count]) => ({
        program: course,
        students: count,
      }));
      const totalStudents = enrollArr.reduce(
        (s, item) => s + item.students,
        0
      );
      const enrollWithPct = enrollArr.map((item) => ({
        ...item,
        percentage:
          totalStudents > 0
            ? Math.round((item.students / totalStudents) * 100)
            : 0,
      }));

      // Outstanding by course/year
      const outMap = {};
      arr.forEach((r) => {
        const label = `${r.course || "Unknown"} - Year ${r.yearNumber}`;
        outMap[label] = (outMap[label] || 0) + (r.dueAmount || 0);
      });
      const outArrRaw = Object.entries(outMap).map(([label, amount]) => ({
        label,
        amount,
      }));
      const maxOut = outArrRaw.reduce(
        (m, i) => (i.amount > m ? i.amount : m),
        0
      );
      const outArr = outArrRaw.map((item) => ({
        label: item.label,
        percentage:
          maxOut > 0 ? Math.round((item.amount / maxOut) * 100) : 0,
      }));

      // Recent payments (based on lastPayment date, showing total paid)
      const recentSorted = [...arr]
        .filter((r) => r.lastPayment)
        .sort(
          (a, b) =>
            new Date(b.lastPayment).getTime() -
            new Date(a.lastPayment).getTime()
        )
        .slice(0, 8)
        .map((r, idx) => ({
          id: r.feeRecordId || idx,
          studentName: r.name || "Unknown",
          program: r.course || "",
          semester: `Year ${r.yearNumber}`,
          amount: r.paidAmount || 0,
          paymentDate: new Date(r.lastPayment).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          status: r.status === "paid" ? "Paid" : "Partial",
        }));

      setKpiData((prev) => ({
        ...prev,
        overduePayments: overdueCount,
        totalEnrolled:
          prev.totalEnrolled && prev.totalEnrolled > 0
            ? prev.totalEnrolled
            : arr.length,
      }));
      setEnrollmentData(enrollWithPct);
      setOutstandingFeesData(outArr);
      setRecentPayments(recentSorted);
    } catch (err) {
      console.error(err);
      setError((prev) => prev || err.message);
      alert(`Error loading fee records: ${err.message}`);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPayments = recentPayments.filter(
    (payment) =>
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Outstanding */}
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
              {formatCurrency(kpiData.totalOutstanding)}
            </p>
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              {kpiData.monthlyGrowth.outstanding || 0}% vs last month
            </p>
          </div>

          {/* Fees Collected (Month) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Fees Collected (This Month)
              </p>
              <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-full">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {formatCurrency(kpiData.monthlyCollection)}
            </p>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <ArrowUp className="w-3 h-3 mr-1" />
              {kpiData.monthlyGrowth.collection}% vs last month
            </p>
          </div>

          {/* Overdue Payments */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Overdue Payments
              </p>
              <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-full">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {kpiData.overduePayments} Students
            </p>
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <ArrowUp className="w-3 h-3 mr-1" />
              {/* we don't calculate growth here, keep simple */}
              high risk accounts
            </p>
          </div>

          {/* Total Enrolled */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Total Enrolled
              </p>
              <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
                <School className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {kpiData.totalEnrolled.toLocaleString()} Students
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Live data from NIF student fees
            </p>
          </div>
        </div>

        {/* Loading bar / error */}
        {(loadingSummary || loadingRecords) && (
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Updating dashboard data...
          </div>
        )}
        {error && (
          <p className="mt-2 text-xs text-red-500">Error: {error}</p>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Enrollment by Program */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Enrollment by Program
            </h3>
            <div className="relative flex items-center justify-center my-6 h-48">
              <div
                className="relative w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                style={{
                  background:
                    enrollmentData.length > 0
                      ? `conic-gradient(#2563eb 0% ${
                          enrollmentData[0].percentage || 0
                        }%, #e5e7eb ${
                          enrollmentData[0].percentage || 0
                        }% 100%)`
                      : "#e5e7eb",
                }}
              >
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {enrollmentData[0]?.percentage || 0}%
                    </span>
                    <p className="text-xs text-gray-500">
                      {enrollmentData[0]?.program || "No data"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {enrollmentData.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <span
                      className={`w-2.5 h-2.5 rounded-full mr-2 ${
                        index === 0 ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    ></span>
                    <span className="text-sm font-medium text-gray-600">
                      {item.program}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    {item.students.toLocaleString()} Students
                  </span>
                </div>
              ))}
              {enrollmentData.length === 0 && (
                <p className="text-xs text-gray-400">
                  No enrollment data available yet.
                </p>
              )}
            </div>
          </div>

          {/* Outstanding Fees Summary */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Outstanding Fees Summary
            </h3>
            <div className="h-64 mt-4 flex items-end space-x-4">
              {outstandingFeesData.length === 0 && (
                <p className="text-xs text-gray-400">
                  No outstanding data to display.
                </p>
              )}
              {outstandingFeesData.map((item, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center space-y-2 h-full justify-end"
                >
                  <div
                    className="w-full bg-gray-200 rounded-t-md relative"
                    style={{ height: `${item.percentage || 5}%` }}
                  >
                    <div
                      className={`w-full rounded-t-md h-full ${
                        item.label.toLowerCase().includes("fashion")
                          ? "bg-blue-600"
                          : "bg-gray-400"
                      }`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 text-center">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Payments Table */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Payments
            </h3>
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
                  <th className="px-6 py-3">Program / Year</th>
                  <th className="px-6 py-3">Total Paid</th>
                  <th className="px-6 py-3">Last Payment Date</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {payment.studentName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {payment.program} / {payment.semester}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {payment.paymentDate}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status === "Paid" && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No recent payments to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesDashboard;
