import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { ChevronDown, IndianRupee, Users, AlertCircle, CheckCircle2, Filter, Download, Eye, X, FileText } from 'lucide-react';

const FeesCollection = ({ setShowAdminHeader }) => {
  // Restore original behavior
  setShowAdminHeader(false);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Annual');
  const [viewType, setViewType] = useState('overview');
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [collectionAmount, setCollectionAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');


  const classes = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);
  const sections = ['A', 'B', 'C', 'D'];
  const terms = ['Term 1', 'Term 2', 'Annual'];

  const mockFeesData = {
    'Grade 1': {
      'A': [
        { 
          id: 1, 
          name: 'John Doe', 
          rollNo: '001', 
          tuitionFees: 15000, 
          transportFees: 3000, 
          examFees: 500, 
          libraryFees: 200,
          totalDue: 18700,
          paidAmount: 15000,
          dueAmount: 3700,
          lastPayment: '2024-01-15',
          dueDate: '2024-01-20',
          status: 'partial'
        },
        { 
          id: 2, 
          name: 'Jane Smith', 
          rollNo: '002', 
          tuitionFees: 15000, 
          transportFees: 0, 
          examFees: 500, 
          libraryFees: 200,
          totalDue: 15700,
          paidAmount: 15700,
          dueAmount: 0,
          lastPayment: '2024-01-10',
          dueDate: '2024-01-15',
          status: 'paid'
        },
        { 
          id: 3, 
          name: 'Mike Johnson', 
          rollNo: '003', 
          tuitionFees: 15000, 
          transportFees: 3000, 
          examFees: 500, 
          libraryFees: 200,
          totalDue: 18700,
          paidAmount: 0,
          dueAmount: 18700,
          lastPayment: null,
          dueDate: '2024-01-10',
          status: 'due'
        }
      ],
      'B': [
        { 
          id: 4, 
          name: 'Sarah Wilson', 
          rollNo: '004', 
          tuitionFees: 15000, 
          transportFees: 3000, 
          examFees: 500, 
          libraryFees: 200,
          totalDue: 18700,
          paidAmount: 18700,
          dueAmount: 0,
          lastPayment: '2024-01-12',
          dueDate: '2024-01-25',
          status: 'paid'
        },
        { 
          id: 5, 
          name: 'Tom Brown', 
          rollNo: '005', 
          tuitionFees: 15000, 
          transportFees: 3000, 
          examFees: 500, 
          libraryFees: 200,
          totalDue: 18700,
          paidAmount: 10000,
          dueAmount: 8700,
          lastPayment: '2024-01-08',
          dueDate: '2024-01-18',
          status: 'partial'
        }
      ]
    },
    'Grade 2': {
      'A': [
        { 
          id: 6, 
          name: 'Emma Davis', 
          rollNo: '006', 
          tuitionFees: 15000, 
          transportFees: 0, 
          examFees: 500, 
          libraryFees: 200,
          totalDue: 15700,
          paidAmount: 15700,
          dueAmount: 0,
          lastPayment: '2024-01-14',
          dueDate: '2024-01-22',
          status: 'paid'
        }
      ],
      'B': [
        { 
          id: 7, 
          name: 'Alex Miller', 
          rollNo: '007', 
          tuitionFees: 15000, 
          transportFees: 3000, 
          examFees: 500, 
          libraryFees: 200,
          totalDue: 18700,
          paidAmount: 5000,
          dueAmount: 13700,
          lastPayment: '2024-01-05',
          dueDate: '2024-01-16',
          status: 'partial'
        }
      ]
    }
  };

  const getFilteredStudents = () => {
    if (!selectedClass || !selectedSection) return [];
    return mockFeesData[selectedClass]?.[selectedSection] || [];
  };

  const isOverdue = (student) => {
    if (!student?.dueDate || !student?.dueAmount || student.dueAmount <= 0) return false;
    try {
      const due = new Date(student.dueDate);
      const today = new Date();
      // normalize to midnight for comparison
      due.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      return today > due;
    } catch {
      return false;
    }
  };

  const effectiveDue = (student) => {
    return (student?.dueAmount || 0) + (isOverdue(student) ? 300 : 0);
  };

  const getClassSectionSummary = () => {
    const students = getFilteredStudents();
    const totalStudents = students.length;
    const totalDue = students.reduce((sum, student) => sum + student.totalDue, 0);
    const totalCollected = students.reduce((sum, student) => sum + student.paidAmount, 0);
    const totalPending = students.reduce((sum, student) => sum + effectiveDue(student), 0);
    const paidStudents = students.filter(s => s.status === 'paid').length;
    const partialStudents = students.filter(s => s.status === 'partial').length;
    const dueStudents = students.filter(s => s.status === 'due').length;

    return {
      totalStudents,
      totalDue,
      totalCollected,
      totalPending,
      paidStudents,
      partialStudents,
      dueStudents,
      collectionPercentage: totalDue > 0 ? ((totalCollected / totalDue) * 100).toFixed(1) : 0
    };
  };

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
  };

  const summary = getClassSectionSummary();

  const handleCollectFees = (student) => {
    setSelectedStudent(student);
    setCollectionAmount(String(effectiveDue(student)));
    setShowCollectionModal(true);
  };

  const processPayment = () => {
    if (!selectedStudent || !collectionAmount || collectionAmount <= 0) return;
    
    const amount = parseInt(collectionAmount);
    const selectedEffectiveDue = effectiveDue(selectedStudent);
    if (amount > selectedEffectiveDue) {
      alert('Amount cannot exceed due amount');
      return;
    }

    // Update the mock data (in a real app, this would be an API call)
    const updatedData = { ...mockFeesData };
    const studentIndex = updatedData[selectedClass][selectedSection].findIndex(s => s.id === selectedStudent.id);
    
    if (studentIndex !== -1) {
      const amountToReduce = Math.min(amount, updatedData[selectedClass][selectedSection][studentIndex].dueAmount);
      updatedData[selectedClass][selectedSection][studentIndex].paidAmount += amount;
      updatedData[selectedClass][selectedSection][studentIndex].dueAmount -= amountToReduce;
      updatedData[selectedClass][selectedSection][studentIndex].lastPayment = new Date().toISOString().split('T')[0];
      
      if (updatedData[selectedClass][selectedSection][studentIndex].dueAmount === 0) {
        updatedData[selectedClass][selectedSection][studentIndex].status = 'paid';
      } else {
        updatedData[selectedClass][selectedSection][studentIndex].status = 'partial';
      }
    }

    setShowCollectionModal(false);
    setSelectedStudent(null);
    setCollectionAmount('');
    
    // Force re-render by updating state (in a real app, you'd refetch data)
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Fees Collection Management</h1>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Choose a class</option>
                {classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Section
            </label>
            <div className="relative">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedClass}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100"
              >
                <option value="">Choose a section</option>
                {sections.map((section) => (
                  <option key={section} value={section}>Section {section}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Term
            </label>
            <div className="relative">
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white"
              >
                {terms.map((term) => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

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
                <option value="detailed">Detailed View</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {selectedClass && selectedSection && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fees Due</p>
                <p className="text-2xl font-bold text-gray-900">₹{summary.totalDue.toLocaleString()}</p>
              </div>
              <IndianRupee className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Amount Collected</p>
                <p className="text-2xl font-bold text-green-600">₹{summary.totalCollected.toLocaleString()}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-red-600">₹{summary.totalPending.toLocaleString()}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Payment Category Modal removed */}

      {/* Collection Status */}
      {selectedClass && selectedSection && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Collection Status - {selectedClass} Section {selectedSection}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Collection Rate:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                summary.collectionPercentage >= 80 ? 'bg-green-100 text-green-800' :
                summary.collectionPercentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {summary.collectionPercentage}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.paidStudents}</div>
              <div className="text-sm text-gray-600">Fully Paid</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{summary.partialStudents}</div>
              <div className="text-sm text-gray-600">Partial Payment</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{summary.dueStudents}</div>
              <div className="text-sm text-gray-600">Payment Due</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${summary.collectionPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Student Fees Table */}
      {selectedClass && selectedSection && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Student Fees Details
            </h2>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download size={16} className="mr-2" />
              Export Report
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Structure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Due
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance Due
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredStudents().map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">Roll No: {student.rollNo}</div>
                        {student.lastPayment && (
                          <div className="text-xs text-gray-400">Last payment: {student.lastPayment}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {student.dueDate ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isOverdue(student) ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                          {new Date(student.dueDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Tuition:</span>
                          <span>₹{student.tuitionFees.toLocaleString()}</span>
                        </div>
                        {student.transportFees > 0 && (
                          <div className="flex justify-between">
                            <span>Transport:</span>
                            <span>₹{student.transportFees.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Exam:</span>
                          <span>₹{student.examFees.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Library:</span>
                          <span>₹{student.libraryFees.toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{student.totalDue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ₹{student.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                      ₹{effectiveDue(student).toLocaleString()}
                      {isOverdue(student) && (
                        <div className="text-xs text-red-600">Incl. ₹300 fine</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(student.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        {student.status !== 'paid' && (
                          <button 
                            onClick={() => handleCollectFees(student)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                          >
                            <IndianRupee size={12} className="mr-1" />
                            Collect
                          </button>
                        )}
                        <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                          <Eye size={12} className="mr-1" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Selection State */}
      {(!selectedClass || !selectedSection) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Filter className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Select Class and Section</h3>
            <p className="mt-1 text-sm text-gray-500">
              Please select both class and section to view fees collection details.
            </p>
          </div>
        </div>
      )}

      {/* Payment Category Modal - removed in revert */}

      {/* Collection Modal */}
      {showCollectionModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Collect Fees</h3>
              <button 
                onClick={() => setShowCollectionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900">{selectedStudent.name}</h4>
                <p className="text-sm text-gray-600">Roll No: {selectedStudent.rollNo}</p>
                <p className="text-sm text-gray-600">Class: {selectedClass} - Section {selectedSection}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Total Amount Due:</span>
                  <span className="font-semibold text-gray-900">₹{selectedStudent.totalDue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Amount Paid:</span>
                  <span className="font-semibold text-green-600">₹{selectedStudent.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Balance Due{isOverdue(selectedStudent) ? ' (incl. fine)' : ''}:</span>
                  <span className="font-semibold text-red-600">₹{effectiveDue(selectedStudent).toLocaleString()}</span>
                </div>
                {selectedStudent.dueDate && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Due Date:</span>
                    <span className={`text-sm ${isOverdue(selectedStudent) ? 'text-red-600' : 'text-gray-700'}`}>
                      {new Date(selectedStudent.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collection Amount
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="number"
                    value={collectionAmount}
                    onChange={(e) => setCollectionAmount(e.target.value)}
                    max={effectiveDue(selectedStudent)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card Payment</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCollectionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  disabled={!collectionAmount || collectionAmount <= 0}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Collect Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FeesCollection;
