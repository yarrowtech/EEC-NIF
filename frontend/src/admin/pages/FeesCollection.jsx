// import React, { useState, useEffect } from 'react';
// import { jsPDF } from 'jspdf';
// import { ChevronDown, IndianRupee, Users, AlertCircle, CheckCircle2, Filter, Download, Eye, X, FileText } from 'lucide-react';

// const FeesCollection = ({ setShowAdminHeader }) => {
//   // Restore original behavior
//   setShowAdminHeader(false);
  
//   const [selectedClass, setSelectedClass] = useState('');
//   const [selectedSection, setSelectedSection] = useState('');
//   const [selectedTerm, setSelectedTerm] = useState('Annual');
//   const [viewType, setViewType] = useState('overview');
//   const [showCollectionModal, setShowCollectionModal] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [collectionAmount, setCollectionAmount] = useState('');
//   const [paymentMethod, setPaymentMethod] = useState('cash');


//   const classes = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);
//   const sections = ['A', 'B', 'C', 'D'];
//   const terms = ['Term 1', 'Term 2', 'Annual'];

//   const mockFeesData = {
//     'Class 1': {
//       'A': [
//         { 
//           id: 1, 
//           name: 'John Doe', 
//           rollNo: '001', 
//           tuitionFees: 15000, 
//           transportFees: 3000, 
//           examFees: 500, 
//           libraryFees: 200,
//           totalDue: 18700,
//           paidAmount: 15000,
//           dueAmount: 3700,
//           lastPayment: '2024-01-15',
//           dueDate: '2024-01-20',
//           status: 'partial'
//         },
//         { 
//           id: 2, 
//           name: 'Jane Smith', 
//           rollNo: '002', 
//           tuitionFees: 15000, 
//           transportFees: 0, 
//           examFees: 500, 
//           libraryFees: 200,
//           totalDue: 15700,
//           paidAmount: 15700,
//           dueAmount: 0,
//           lastPayment: '2024-01-10',
//           dueDate: '2024-01-15',
//           status: 'paid'
//         },
//         { 
//           id: 3, 
//           name: 'Mike Johnson', 
//           rollNo: '003', 
//           tuitionFees: 15000, 
//           transportFees: 3000, 
//           examFees: 500, 
//           libraryFees: 200,
//           totalDue: 18700,
//           paidAmount: 0,
//           dueAmount: 18700,
//           lastPayment: null,
//           dueDate: '2024-01-10',
//           status: 'due'
//         }
//       ],
//       'B': [
//         { 
//           id: 4, 
//           name: 'Sarah Wilson', 
//           rollNo: '004', 
//           tuitionFees: 15000, 
//           transportFees: 3000, 
//           examFees: 500, 
//           libraryFees: 200,
//           totalDue: 18700,
//           paidAmount: 18700,
//           dueAmount: 0,
//           lastPayment: '2024-01-12',
//           dueDate: '2024-01-25',
//           status: 'paid'
//         },
//         { 
//           id: 5, 
//           name: 'Tom Brown', 
//           rollNo: '005', 
//           tuitionFees: 15000, 
//           transportFees: 3000, 
//           examFees: 500, 
//           libraryFees: 200,
//           totalDue: 18700,
//           paidAmount: 10000,
//           dueAmount: 8700,
//           lastPayment: '2024-01-08',
//           dueDate: '2024-01-18',
//           status: 'partial'
//         }
//       ]
//     },
//     'Class 2': {
//       'A': [
//         { 
//           id: 6, 
//           name: 'Emma Davis', 
//           rollNo: '006', 
//           tuitionFees: 15000, 
//           transportFees: 0, 
//           examFees: 500, 
//           libraryFees: 200,
//           totalDue: 15700,
//           paidAmount: 15700,
//           dueAmount: 0,
//           lastPayment: '2024-01-14',
//           dueDate: '2024-01-22',
//           status: 'paid'
//         }
//       ],
//       'B': [
//         { 
//           id: 7, 
//           name: 'Alex Miller', 
//           rollNo: '007', 
//           tuitionFees: 15000, 
//           transportFees: 3000, 
//           examFees: 500, 
//           libraryFees: 200,
//           totalDue: 18700,
//           paidAmount: 5000,
//           dueAmount: 13700,
//           lastPayment: '2024-01-05',
//           dueDate: '2024-01-16',
//           status: 'partial'
//         }
//       ]
//     }
//   };

//   const getFilteredStudents = () => {
//     if (!selectedClass || !selectedSection) return [];
//     return mockFeesData[selectedClass]?.[selectedSection] || [];
//   };

//   const isOverdue = (student) => {
//     if (!student?.dueDate || !student?.dueAmount || student.dueAmount <= 0) return false;
//     try {
//       const due = new Date(student.dueDate);
//       const today = new Date();
//       // normalize to midnight for comparison
//       due.setHours(0,0,0,0);
//       today.setHours(0,0,0,0);
//       return today > due;
//     } catch {
//       return false;
//     }
//   };

//   const effectiveDue = (student) => {
//     return (student?.dueAmount || 0) + (isOverdue(student) ? 300 : 0);
//   };

//   const getClassSectionSummary = () => {
//     const students = getFilteredStudents();
//     const totalStudents = students.length;
//     const totalDue = students.reduce((sum, student) => sum + student.totalDue, 0);
//     const totalCollected = students.reduce((sum, student) => sum + student.paidAmount, 0);
//     const totalPending = students.reduce((sum, student) => sum + effectiveDue(student), 0);
//     const paidStudents = students.filter(s => s.status === 'paid').length;
//     const partialStudents = students.filter(s => s.status === 'partial').length;
//     const dueStudents = students.filter(s => s.status === 'due').length;

//     return {
//       totalStudents,
//       totalDue,
//       totalCollected,
//       totalPending,
//       paidStudents,
//       partialStudents,
//       dueStudents,
//       collectionPercentage: totalDue > 0 ? ((totalCollected / totalDue) * 100).toFixed(1) : 0
//     };
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'paid':
//         return 'bg-green-100 text-green-800';
//       case 'partial':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'due':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'paid':
//         return <CheckCircle2 size={16} className="text-green-600" />;
//       case 'partial':
//         return <AlertCircle size={16} className="text-yellow-600" />;
//       case 'due':
//         return <AlertCircle size={16} className="text-red-600" />;
//       default:
//         return null;
//     }
//   };

//   const summary = getClassSectionSummary();

//   const handleCollectFees = (student) => {
//     setSelectedStudent(student);
//     setCollectionAmount(String(effectiveDue(student)));
//     setShowCollectionModal(true);
//   };

//   const exportFeesReport = () => {
//     const pdf = new jsPDF();
//     const pageWidth = pdf.internal.pageSize.width;
//     const currentDate = new Date().toLocaleDateString();
//     let yPosition = 20;
    
//     // Title
//     pdf.setFontSize(20);
//     pdf.setFont(undefined, 'bold');
//     pdf.text('Fees Collection Report', pageWidth / 2, yPosition, { align: 'center' });
    
//     yPosition += 10;
//     pdf.setFontSize(12);
//     pdf.setFont(undefined, 'normal');
//     pdf.text(`Class: ${selectedClass}, Section: ${selectedSection}`, pageWidth / 2, yPosition, { align: 'center' });
    
//     yPosition += 8;
//     pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
    
//     yPosition += 15;

//     // Summary Section
//     pdf.setFontSize(16);
//     pdf.setFont(undefined, 'bold');
//     pdf.text('Summary', 20, yPosition);
//     yPosition += 10;

//     pdf.setFontSize(10);
//     pdf.setFont(undefined, 'normal');
//     pdf.text(`Total Students: ${summary.totalStudents}`, 25, yPosition);
//     yPosition += 7;
//     pdf.text(`Total Amount: ₹${summary.totalAmount.toLocaleString()}`, 25, yPosition);
//     yPosition += 7;
//     pdf.text(`Collected: ₹${summary.collectedAmount.toLocaleString()}`, 25, yPosition);
//     yPosition += 7;
//     pdf.text(`Pending: ₹${summary.pendingAmount.toLocaleString()}`, 25, yPosition);
//     yPosition += 7;
//     pdf.text(`Collection Rate: ${summary.collectionPercentage}%`, 25, yPosition);
    
//     yPosition += 15;

//     // Student Details
//     pdf.setFontSize(16);
//     pdf.setFont(undefined, 'bold');
//     pdf.text('Student Details', 20, yPosition);
//     yPosition += 10;

//     // Table headers
//     pdf.setFontSize(8);
//     pdf.setFont(undefined, 'bold');
//     pdf.text('Name', 20, yPosition);
//     pdf.text('Roll', 50, yPosition);
//     pdf.text('Total Due', 70, yPosition);
//     pdf.text('Paid', 100, yPosition);
//     pdf.text('Balance', 125, yPosition);
//     pdf.text('Status', 150, yPosition);
//     pdf.text('Due Date', 170, yPosition);
    
//     pdf.line(15, yPosition + 2, pageWidth - 15, yPosition + 2);
//     yPosition += 8;

//     // Student data
//     pdf.setFont(undefined, 'normal');
//     const students = getFilteredStudents();
    
//     students.forEach((student) => {
//       if (yPosition > 270) { // Check if we need a new page
//         pdf.addPage();
//         yPosition = 20;
//       }
      
//       pdf.text(student.name, 20, yPosition);
//       pdf.text(student.rollNo, 50, yPosition);
//       pdf.text(`₹${student.totalDue.toLocaleString()}`, 70, yPosition);
//       pdf.text(`₹${student.paidAmount.toLocaleString()}`, 100, yPosition);
//       pdf.text(`₹${student.dueAmount.toLocaleString()}`, 125, yPosition);
//       pdf.text(student.status, 150, yPosition);
//       pdf.text(student.dueDate || 'N/A', 170, yPosition);
      
//       yPosition += 7;
//     });

//     // Footer
//     pdf.setFontSize(8);
//     pdf.setFont(undefined, 'italic');
//     pdf.text('Generated by School Management System - Fees Collection Module', pageWidth / 2, pdf.internal.pageSize.height - 10, { align: 'center' });

//     pdf.save(`fees-report-${selectedClass.replace(' ', '-')}-${selectedSection}-${currentDate.replace(/\//g, '-')}.pdf`);
//   };

//   const processPayment = () => {
//     if (!selectedStudent || !collectionAmount || collectionAmount <= 0) return;
    
//     const amount = parseInt(collectionAmount);
//     const selectedEffectiveDue = effectiveDue(selectedStudent);
//     if (amount > selectedEffectiveDue) {
//       alert('Amount cannot exceed due amount');
//       return;
//     }

//     // Update the mock data (in a real app, this would be an API call)
//     const updatedData = { ...mockFeesData };
//     const studentIndex = updatedData[selectedClass][selectedSection].findIndex(s => s.id === selectedStudent.id);
    
//     if (studentIndex !== -1) {
//       const amountToReduce = Math.min(amount, updatedData[selectedClass][selectedSection][studentIndex].dueAmount);
//       updatedData[selectedClass][selectedSection][studentIndex].paidAmount += amount;
//       updatedData[selectedClass][selectedSection][studentIndex].dueAmount -= amountToReduce;
//       updatedData[selectedClass][selectedSection][studentIndex].lastPayment = new Date().toISOString().split('T')[0];
      
//       if (updatedData[selectedClass][selectedSection][studentIndex].dueAmount === 0) {
//         updatedData[selectedClass][selectedSection][studentIndex].status = 'paid';
//       } else {
//         updatedData[selectedClass][selectedSection][studentIndex].status = 'partial';
//       }
//     }

//     setShowCollectionModal(false);
//     setSelectedStudent(null);
//     setCollectionAmount('');
    
//     // Force re-render by updating state (in a real app, you'd refetch data)
//     window.location.reload();
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//         <h1 className="text-2xl font-bold text-gray-800 mb-6">Fees Collection Management</h1>
        
//         {/* Filters */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <div className="relative">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Select Class
//             </label>
//             <div className="relative">
//               <select
//                 value={selectedClass}
//                 onChange={(e) => setSelectedClass(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white"
//               >
//                 <option value="">Choose a class</option>
//                 {classes.map((cls) => (
//                   <option key={cls} value={cls}>{cls}</option>
//                 ))}
//               </select>
//               <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
//             </div>
//           </div>

//           <div className="relative">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Select Section
//             </label>
//             <div className="relative">
//               <select
//                 value={selectedSection}
//                 onChange={(e) => setSelectedSection(e.target.value)}
//                 disabled={!selectedClass}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100"
//               >
//                 <option value="">Choose a section</option>
//                 {sections.map((section) => (
//                   <option key={section} value={section}>Section {section}</option>
//                 ))}
//               </select>
//               <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
//             </div>
//           </div>

//           <div className="relative">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Term
//             </label>
//             <div className="relative">
//               <select
//                 value={selectedTerm}
//                 onChange={(e) => setSelectedTerm(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white"
//               >
//                 {terms.map((term) => (
//                   <option key={term} value={term}>{term}</option>
//                 ))}
//               </select>
//               <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
//             </div>
//           </div>

//           <div className="relative">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               View
//             </label>
//             <div className="relative">
//               <select
//                 value={viewType}
//                 onChange={(e) => setViewType(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white"
//               >
//                 <option value="overview">Overview</option>
//                 <option value="detailed">Detailed View</option>
//               </select>
//               <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       {selectedClass && selectedSection && (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Students</p>
//                 <p className="text-2xl font-bold text-gray-900">{summary.totalStudents}</p>
//               </div>
//               <Users className="h-8 w-8 text-blue-500" />
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Fees Due</p>
//                 <p className="text-2xl font-bold text-gray-900">₹{summary.totalDue.toLocaleString()}</p>
//               </div>
//               <IndianRupee className="h-8 w-8 text-orange-500" />
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Amount Collected</p>
//                 <p className="text-2xl font-bold text-green-600">₹{summary.totalCollected.toLocaleString()}</p>
//               </div>
//               <CheckCircle2 className="h-8 w-8 text-green-500" />
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Pending Amount</p>
//                 <p className="text-2xl font-bold text-red-600">₹{summary.totalPending.toLocaleString()}</p>
//               </div>
//               <AlertCircle className="h-8 w-8 text-red-500" />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Payment Category Modal removed */}

//       {/* Collection Status */}
//       {selectedClass && selectedSection && (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-semibold text-gray-800">
//               Collection Status - {selectedClass} Section {selectedSection}
//             </h2>
//             <div className="flex items-center space-x-2">
//               <span className="text-sm text-gray-600">Collection Rate:</span>
//               <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
//                 summary.collectionPercentage >= 80 ? 'bg-green-100 text-green-800' :
//                 summary.collectionPercentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
//                 'bg-red-100 text-red-800'
//               }`}>
//                 {summary.collectionPercentage}%
//               </span>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//             <div className="text-center p-4 bg-green-50 rounded-lg">
//               <div className="text-2xl font-bold text-green-600">{summary.paidStudents}</div>
//               <div className="text-sm text-gray-600">Fully Paid</div>
//             </div>
//             <div className="text-center p-4 bg-yellow-50 rounded-lg">
//               <div className="text-2xl font-bold text-yellow-600">{summary.partialStudents}</div>
//               <div className="text-sm text-gray-600">Partial Payment</div>
//             </div>
//             <div className="text-center p-4 bg-red-50 rounded-lg">
//               <div className="text-2xl font-bold text-red-600">{summary.dueStudents}</div>
//               <div className="text-sm text-gray-600">Payment Due</div>
//             </div>
//           </div>

//           {/* Progress Bar */}
//           <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
//             <div 
//               className="bg-green-500 h-3 rounded-full transition-all duration-300"
//               style={{ width: `${summary.collectionPercentage}%` }}
//             ></div>
//           </div>
//         </div>
//       )}

//       {/* Student Fees Table */}
//       {selectedClass && selectedSection && (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//           <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//             <h2 className="text-xl font-semibold text-gray-800">
//               Student Fees Details
//             </h2>
//             <button 
//               onClick={exportFeesReport}
//               className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
//             >
//               <Download size={16} className="mr-2" />
//               Export Report
//             </button>
//           </div>
          
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Student Details
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Fee Structure
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Total Due
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Amount Paid
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Balance Due
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {getFilteredStudents().map((student) => (
//                   <tr key={student.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">{student.name}</div>
//                         <div className="text-sm text-gray-500">Roll No: {student.rollNo}</div>
//                         {student.lastPayment && (
//                           <div className="text-xs text-gray-400">Last payment: {student.lastPayment}</div>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       {student.dueDate ? (
//                         <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isOverdue(student) ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
//                           {new Date(student.dueDate).toLocaleDateString()}
//                         </span>
//                       ) : (
//                         <span className="text-gray-400">—</span>
//                       )}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-900">
//                       <div className="space-y-1">
//                         <div className="flex justify-between">
//                           <span>Tuition:</span>
//                           <span>₹{student.tuitionFees.toLocaleString()}</span>
//                         </div>
//                         {student.transportFees > 0 && (
//                           <div className="flex justify-between">
//                             <span>Transport:</span>
//                             <span>₹{student.transportFees.toLocaleString()}</span>
//                           </div>
//                         )}
//                         <div className="flex justify-between">
//                           <span>Exam:</span>
//                           <span>₹{student.examFees.toLocaleString()}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span>Library:</span>
//                           <span>₹{student.libraryFees.toLocaleString()}</span>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
//                       ₹{student.totalDue.toLocaleString()}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
//                       ₹{student.paidAmount.toLocaleString()}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
//                       ₹{effectiveDue(student).toLocaleString()}
//                       {isOverdue(student) && (
//                         <div className="text-xs text-red-600">Incl. ₹300 fine</div>
//                       )}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center space-x-2">
//                         {getStatusIcon(student.status)}
//                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
//                           {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       <div className="flex space-x-2">
//                         {student.status !== 'paid' && (
//                           <button 
//                             onClick={() => handleCollectFees(student)}
//                             className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
//                           >
//                             <IndianRupee size={12} className="mr-1" />
//                             Collect
//                           </button>
//                         )}
//                         <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
//                           <Eye size={12} className="mr-1" />
//                           View
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* No Selection State */}
//       {(!selectedClass || !selectedSection) && (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
//           <div className="text-center">
//             <Filter className="mx-auto h-12 w-12 text-gray-400" />
//             <h3 className="mt-2 text-lg font-medium text-gray-900">Select Class and Section</h3>
//             <p className="mt-1 text-sm text-gray-500">
//               Please select both class and section to view fees collection details.
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Payment Category Modal - removed in revert */}

//       {/* Collection Modal */}
//       {showCollectionModal && selectedStudent && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
//             <div className="flex items-center justify-between p-6 border-b border-gray-200">
//               <h3 className="text-lg font-semibold text-gray-900">Collect Fees</h3>
//               <button 
//                 onClick={() => setShowCollectionModal(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X size={20} />
//               </button>
//             </div>
            
//             <div className="p-6">
//               <div className="mb-4">
//                 <h4 className="font-medium text-gray-900">{selectedStudent.name}</h4>
//                 <p className="text-sm text-gray-600">Roll No: {selectedStudent.rollNo}</p>
//                 <p className="text-sm text-gray-600">Class: {selectedClass} - Section {selectedSection}</p>
//               </div>

//               <div className="bg-gray-50 p-4 rounded-lg mb-4">
//                 <div className="flex justify-between items-center mb-2">
//                   <span className="text-sm text-gray-600">Total Amount Due:</span>
//                   <span className="font-semibold text-gray-900">₹{selectedStudent.totalDue.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between items-center mb-2">
//                   <span className="text-sm text-gray-600">Amount Paid:</span>
//                   <span className="font-semibold text-green-600">₹{selectedStudent.paidAmount.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Balance Due{isOverdue(selectedStudent) ? ' (incl. fine)' : ''}:</span>
//                   <span className="font-semibold text-red-600">₹{effectiveDue(selectedStudent).toLocaleString()}</span>
//                 </div>
//                 {selectedStudent.dueDate && (
//                   <div className="flex justify-between items-center mt-2">
//                     <span className="text-sm text-gray-600">Due Date:</span>
//                     <span className={`text-sm ${isOverdue(selectedStudent) ? 'text-red-600' : 'text-gray-700'}`}>
//                       {new Date(selectedStudent.dueDate).toLocaleDateString()}
//                     </span>
//                   </div>
//                 )}
//               </div>

//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Collection Amount
//                 </label>
//                 <div className="relative">
//                   <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
//                   <input
//                     type="number"
//                     value={collectionAmount}
//                     onChange={(e) => setCollectionAmount(e.target.value)}
//                     max={effectiveDue(selectedStudent)}
//                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
//                     placeholder="Enter amount"
//                   />
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Payment Method
//                 </label>
//                 <select
//                   value={paymentMethod}
//                   onChange={(e) => setPaymentMethod(e.target.value)}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
//                 >
//                   <option value="cash">Cash</option>
//                   <option value="card">Card Payment</option>
//                   <option value="upi">UPI</option>
//                   <option value="bank_transfer">Bank Transfer</option>
//                   <option value="cheque">Cheque</option>
//                 </select>
//               </div>

//               <div className="flex space-x-3">
//                 <button
//                   onClick={() => setShowCollectionModal(false)}
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={processPayment}
//                   disabled={!collectionAmount || collectionAmount <= 0}
//                   className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
//                 >
//                   Collect Payment
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// export default FeesCollection;


import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import {
  Search,
  Filter,
  CreditCard,
  X,
  Loader2,
  IndianRupee,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

const PROGRAM_TYPES = [
  { value: 'ADV_CERT', label: 'Advance Certificate (1 / 2 Years)' },
  { value: 'B_VOC', label: 'B.Voc (3 Years)' },
  { value: 'M_VOC', label: 'M.Voc (2 Years)' },
];

const COURSES = [
  { value: 'Fashion Design', label: 'Fashion Design' },
  { value: 'Interior Design', label: 'Interior Design' },
];

const getYearsForProgram = (programType) => {
  if (programType === 'ADV_CERT') return [1, 2];
  if (programType === 'B_VOC') return [1, 2, 3];
  if (programType === 'M_VOC') return [1, 2];
  return [];
};

const FeesCollection = ({ setShowAdminHeader }) => {
  useEffect(() => {
    if (setShowAdminHeader) setShowAdminHeader(false);
  }, [setShowAdminHeader]);

  const [programType, setProgramType] = useState('ADV_CERT');
  const [course, setCourse] = useState('Fashion Design');
  const [yearNumber, setYearNumber] = useState(1);
  const [viewType, setViewType] = useState('overview');

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [collectionAmount, setCollectionAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [searchTerm, setSearchTerm] = useState('');

  const yearOptions = useMemo(
    () => getYearsForProgram(programType),
    [programType]
  );

  // Fetch NIF fee records from backend
  useEffect(() => {
    const fetchFees = async () => {
      if (!programType || !course || !yearNumber) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          programType,
          course,
          year: String(yearNumber),
        }).toString();

        const res = await fetch(`${API_BASE}/api/nif/fees?${params}`, {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch NIF fees');
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, [programType, course, yearNumber]);

  // Sample students for demonstration when no data from API
  const sampleStudents = [
    {
      feeRecordId: 'sample1',
      name: 'Aarav Sharma',
      roll: 'FAD101',
      program: '3 Year B VOC',
      course: 'Fashion Design',
      totalFee: 15000,
      paidAmount: 15000,
      dueAmount: 0,
      status: 'paid'
    },
    {
      feeRecordId: 'sample2',
      name: 'Priya Patel',
      roll: 'INT202',
      program: '4 Year B DES',
      course: 'Interior Design',
      totalFee: 20000,
      paidAmount: 10000,
      dueAmount: 10000,
      status: 'partial'
    },
    {
      feeRecordId: 'sample3',
      name: 'Rohan Mehta',
      roll: 'FAD303',
      program: '2 Year M VOC',
      course: 'Fashion Design',
      totalFee: 18000,
      paidAmount: 5000,
      dueAmount: 13000,
      status: 'due'
    },
    {
      feeRecordId: 'sample4',
      name: 'Saanvi Gupta',
      roll: 'INT404',
      program: '1 Year Certificate',
      course: 'Interior Design',
      totalFee: 8000,
      paidAmount: 8000,
      dueAmount: 0,
      status: 'paid'
    },
    {
      feeRecordId: 'sample5',
      name: 'Vikram Singh',
      roll: 'FAD505',
      program: '2 Year Advanced Cert.',
      course: 'Fashion Design',
      totalFee: 12000,
      paidAmount: 12000,
      dueAmount: 0,
      status: 'paid'
    }
  ];

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    const studentsToFilter = students.length > 0 ? students : sampleStudents;
    
    if (!searchTerm) return studentsToFilter;
    
    return studentsToFilter.filter(student => 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  // Summary calculations
  const summary = useMemo(() => {
    const studentsToCalculate = students.length > 0 ? students : sampleStudents;
    
    if (!studentsToCalculate.length) {
      return {
        totalStudents: 0,
        totalDue: 0,
        totalCollected: 0,
        totalPending: 0,
        paidStudents: 0,
        partialStudents: 0,
        dueStudents: 0,
        collectionPercentage: 0,
      };
    }

    const totalStudents = studentsToCalculate.length;
    const totalDue = studentsToCalculate.reduce((sum, s) => sum + (s.totalFee || 0), 0);
    const totalCollected = studentsToCalculate.reduce(
      (sum, s) => sum + (s.paidAmount || 0),
      0
    );
    const totalPending = studentsToCalculate.reduce(
      (sum, s) => sum + (s.dueAmount || 0),
      0
    );

    const paidStudents = studentsToCalculate.filter((s) => s.status === 'paid').length;
    const partialStudents = studentsToCalculate.filter((s) => s.status === 'partial').length;
    const dueStudents = studentsToCalculate.filter((s) => s.status === 'due').length;

    const collectionPercentage =
      totalDue > 0 ? ((totalCollected / totalDue) * 100).toFixed(1) : 0;

    return {
      totalStudents,
      totalDue,
      totalCollected,
      totalPending,
      paidStudents,
      partialStudents,
      dueStudents,
      collectionPercentage,
    };
  }, [students]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'due':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 size={16} className="text-green-600" />;
      case 'partial':
        return <AlertCircle size={16} className="text-yellow-600" />;
      case 'due':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return null;
    }
    if (amountNum > selectedRecord.dueAmount) {
      alert("Amount cannot be greater than due amount");
      return;
    }
    const method =
      window.prompt('Enter payment method (cash/card/upi/...):', 'cash') ||
      'cash';

    try {
      const res = await fetch(
        `${API_BASE}/api/nif/fees/records/collect/${selectedRecord.feeRecordId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            amount: amountNum,
            method: paymentMethod,
            note: paymentNote,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to collect payment");
      }

      const updated = await res.json();

      // Update local list
      setRecords((prev) =>
        prev.map((r) =>
          r.feeRecordId === updated.id
            ? {
                ...r,
                paidAmount: updated.paidAmount,
                dueAmount: updated.dueAmount,
                status: updated.status,
                lastPayment: updated.lastPayment,
              }
            : r
        )
      );

      alert("Payment collected successfully ✅");
      closePaymentModal();
    } catch (err) {
      console.error(err);
      alert('Failed to collect payment');
    }
  };

  const exportFeesReport = () => {
    if (!students.length) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const currentDate = new Date().toLocaleDateString();
    let y = 20;

    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.text('NIF Fees Collection Report', pageWidth / 2, y, {
      align: 'center',
    });

    y += 8;
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    const progLabel =
      PROGRAM_TYPES.find((p) => p.value === programType)?.label || programType;
    pdf.text(
      `Program: ${progLabel} | Course: ${course} | Year: ${yearNumber}`,
      pageWidth / 2,
      y,
      { align: 'center' }
    );
    y += 6;
    pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, y, {
      align: 'center',
    });

    y += 10;
    pdf.setFontSize(13);
    pdf.setFont(undefined, 'bold');
    pdf.text('Summary', 15, y);
    y += 7;
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Total Students: ${summary.totalStudents}`, 20, y);
    y += 5;
    pdf.text(`Total Fees: ₹${summary.totalDue.toLocaleString()}`, 20, y);
    y += 5;
    pdf.text(`Collected: ₹${summary.totalCollected.toLocaleString()}`, 20, y);
    y += 5;
    pdf.text(`Pending: ₹${summary.totalPending.toLocaleString()}`, 20, y);
    y += 5;
    pdf.text(`Collection Rate: ${summary.collectionPercentage}%`, 20, y);

    y += 10;
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.text('Name', 10, y);
    pdf.text('Roll', 55, y);
    pdf.text('Total', 80, y);
    pdf.text('Paid', 105, y);
    pdf.text('Due', 130, y);
    pdf.text('Status', 155, y);
    pdf.text('Last Pay', 180, y);

    y += 3;
    pdf.line(10, y, pageWidth - 10, y);
    y += 6;

    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');

    students.forEach((s) => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(s.name || '', 10, y);
      pdf.text(s.roll || '', 55, y);
      pdf.text(`₹${(s.totalFee || 0).toLocaleString()}`, 80, y);
      pdf.text(`₹${(s.paidAmount || 0).toLocaleString()}`, 105, y);
      pdf.text(`₹${(s.dueAmount || 0).toLocaleString()}`, 130, y);
      pdf.text(s.status || '', 155, y);
      pdf.text(
        s.lastPayment ? new Date(s.lastPayment).toLocaleDateString() : '-',
        180,
        y
      );
      y += 6;
    });

    pdf.save(
      `nif-fees-${programType}-${course}-year${yearNumber}-${currentDate.replace(
        /\//g,
        '-'
      )}.pdf`
    );
  };

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

  const summaryCards = [
    { label: 'Total Students', value: summary.totalStudents, icon: Users },
    {
      label: 'Total Fees',
      value: `₹${summary.totalDue.toLocaleString()}`,
      icon: IndianRupee,
    },
    {
      label: 'Collected',
      value: `₹${summary.totalCollected.toLocaleString()}`,
      icon: CheckCircle2,
    },
    {
      label: 'Pending',
      value: `₹${summary.totalPending.toLocaleString()}`,
      icon: AlertCircle,
    },
  ];

  const hasRecords = filteredRecords.length > 0;

  return (
    <div className="space-y-6">
      {/* Filters header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          NIF Fees Collection
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Program type */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program Type
            </label>
            <div className="relative">
              <select
                value={programType}
                onChange={(e) => {
                  const val = e.target.value;
                  setProgramType(val);
                  const ys = getYearsForProgram(val);
                  if (!ys.includes(yearNumber)) {
                    setYearNumber(ys[0] || 1);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white"
              >
                {PROGRAM_TYPES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={20}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Course */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course
            </label>
            <div className="relative">
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-sm bg-gray-50"
              >
                {COURSES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={20}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Year */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <div className="relative">
              <select
                value={yearNumber}
                onChange={(e) => setYearNumber(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={20}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* View */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View
            </label>
            <div className="relative">
              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="overview">Overview</option>
                <option value="detailed">Detailed</option>
              </select>
              <ChevronDown
                size={20}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            <button
              onClick={fetchRecords}
              disabled={loading}
              className="hidden md:inline-flex items-center px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Refresh
            </button>
          </div>

      {/* Summary cards */}
      {(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalStudents}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fees</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{summary.totalDue.toLocaleString()}
                </p>
              </div>
              <IndianRupee className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collected</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{summary.totalCollected.toLocaleString()}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Amount
                </p>
                <p className="text-2xl font-bold text-red-600">
                  ₹{summary.totalPending.toLocaleString()}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Loading NIF fee records...
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Please wait while we fetch the data.
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters Section */}
      {(
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-gray-500 flex border border-gray-300 bg-gray-50 items-center justify-center pl-4 rounded-l-lg border-r-0">
                    <Search size={20} />
                  </div>
                  <input 
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-blue-500 border border-gray-300 bg-gray-50 focus:border-blue-500 h-full placeholder:text-gray-500 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal" 
                    placeholder="Search by Student Name or ID" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </label>
            </div>
            <div className="flex gap-3 overflow-x-auto w-full md:w-auto">
              <button className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-50 border border-gray-300 px-4">
                <p className="text-gray-800 text-sm font-medium leading-normal">Stream</p>
                <ChevronDown className="text-gray-800 text-xl" />
              </button>
              <button className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-50 border border-gray-300 px-4">
                <p className="text-gray-800 text-sm font-medium leading-normal">Program</p>
                <ChevronDown className="text-gray-800 text-xl" />
              </button>
              <button className="flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-gray-50 border border-gray-300 px-4">
                <p className="text-gray-800 text-sm font-medium leading-normal">Fee Status</p>
                <ChevronDown className="text-gray-800 text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {(
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Student Fees Details
            </h2>
            <button
              onClick={fetchRecords}
              disabled={loading}
              className="hidden md:inline-flex items-center px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Refresh
            </button>
          </div>

          {fetchError && (
            <p className="mt-2 text-xs text-red-500">Error: {fetchError}</p>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left">Student</th>
                  <th className="px-6 py-3 text-left">Roll</th>
                  <th className="px-6 py-3 text-left">Course / Year</th>
                  <th className="px-6 py-3 text-right">Total Fee</th>
                  <th className="px-6 py-3 text-right">Paid</th>
                  <th className="px-6 py-3 text-right">Due</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                      Loading fee records...
                    </td>
                  </tr>
                )}

                {!loading && filteredRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No fee records found for selected filters.
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {s.roll}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {s.program}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {s.course}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}>
                        {s.status?.charAt(0).toUpperCase() + s.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm text-right">
                      ₹{(s.totalFee || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm text-right">
                      ₹{(s.paidAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-900 text-sm text-right font-medium">
                      ₹{(s.dueAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center space-x-2">
                        {s.status !== 'paid' && (
                          <button
                            onClick={() => handleCollectFees(s)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                          >
                            <IndianRupee size={12} className="mr-1" />
                            Collect
                          </button>
                        )}
                        <button className="text-gray-500 hover:text-blue-600">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              Showing 1 to {filteredStudents.length} of {filteredStudents.length} results
            </span>
            <div className="flex items-center gap-2">
              <button className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">
                <ChevronDown className="text-xl rotate-90" />
              </button>
              <button className="flex items-center justify-center h-8 w-8 rounded-lg border border-blue-600 bg-blue-100 text-blue-600">
                1
              </button>
              <button className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">
                2
              </button>
              <button className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">
                3
              </button>
              <button className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">
                <ChevronDown className="text-xl -rotate-90" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="font-semibold text-gray-900 text-lg">
                Collect Fees – {selectedRecord.name}
              </h3>
              <button
                onClick={closePaymentModal}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="px-5 py-4 space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Course / Year / Roll
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {selectedRecord.course} / Year {selectedRecord.yearNumber} –{" "}
                  {selectedRecord.roll}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Total Fee</p>
                  <p className="font-semibold text-gray-900">
                    {formatINR(selectedRecord.totalFee)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Outstanding</p>
                  <p className="font-semibold text-red-600">
                    {formatINR(selectedRecord.dueAmount)}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  Amount to Collect
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  min={0}
                  max={selectedRecord.dueAmount}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Note (optional)
                </label>
                <textarea
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Txn ID, cheque no., remarks..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closePaymentModal}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="px-4 py-1.5 text-sm rounded-lg bg-blue-600 text-white inline-flex items-center disabled:opacity-60"
                >
                  {paymentLoading && (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  )}
                  {paymentLoading ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NifFeesCollection;