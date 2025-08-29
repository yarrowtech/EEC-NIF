import React, { useState } from 'react';
import { 
  Search, Filter, FileText, CheckCircle, AlertCircle, Download, 
  Upload, Clock, User, BookOpen, Star, Calendar, ChevronDown,
  Send, Eye, FileCheck, BarChart3, Award, TrendingUp
} from 'lucide-react';

const AssignmentEvaluation = () => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('all');
  const [activeTab, setActiveTab] = useState('evaluation');

  // Expanded static data
  const assignments = [
    { id: 1, title: "Mathematics Assignment 1", subject: "Mathematics", dueDate: "2024-03-10", totalMarks: 100 },
    { id: 2, title: "Physics Lab Report", subject: "Physics", dueDate: "2024-03-12", totalMarks: 50 },
    { id: 3, title: "English Essay", subject: "English Literature", dueDate: "2024-03-15", totalMarks: 80 },
    { id: 4, title: "Chemistry Project", subject: "Chemistry", dueDate: "2024-03-18", totalMarks: 100 },
  ];

  const submissions = [
    {
      id: 1,
      studentName: "Sarah Smith",
      studentId: "STU001",
      assignmentId: 1,
      assignmentTitle: "Mathematics Assignment 1",
      subject: "Mathematics",
      submissionDate: "2024-03-15",
      submissionTime: "14:30",
      status: "submitted",
      marks: null,
      feedback: "",
      attachments: ["math_hw1.pdf"],
      late: false,
      wordCount: 1200,
      pages: 4
    },
    {
      id: 2,
      studentName: "John Doe",
      studentId: "STU002",
      assignmentId: 1,
      assignmentTitle: "Mathematics Assignment 1",
      subject: "Mathematics",
      submissionDate: "2024-03-14",
      submissionTime: "09:15",
      status: "evaluated",
      marks: 85,
      feedback: "Excellent work! Clear explanations and accurate calculations. Please improve presentation of graphs.",
      attachments: ["math_solution.pdf"],
      late: false,
      wordCount: 1500,
      pages: 5
    },
    {
      id: 3,
      studentName: "Emma Johnson",
      studentId: "STU003",
      assignmentId: 1,
      assignmentTitle: "Mathematics Assignment 1",
      subject: "Mathematics",
      submissionDate: "2024-03-16",
      submissionTime: "23:45",
      status: "submitted",
      marks: null,
      feedback: "",
      attachments: ["algebra_assignment.pdf"],
      late: true,
      wordCount: 900,
      pages: 3
    },
    {
      id: 4,
      studentName: "Michael Brown",
      studentId: "STU004",
      assignmentId: 2,
      assignmentTitle: "Physics Lab Report",
      subject: "Physics",
      submissionDate: "2024-03-12",
      submissionTime: "11:20",
      status: "evaluated",
      marks: 42,
      feedback: "Good experimental setup description but analysis needs more depth. Include error analysis in future reports.",
      attachments: ["physics_lab.pdf", "data_sheet.xlsx"],
      late: false,
      wordCount: 2000,
      pages: 7
    },
    {
      id: 5,
      studentName: "Olivia Davis",
      studentId: "STU005",
      assignmentId: 2,
      assignmentTitle: "Physics Lab Report",
      subject: "Physics",
      submissionDate: "2024-03-13",
      submissionTime: "16:40",
      status: "evaluated",
      marks: 48,
      feedback: "Outstanding work! Thorough analysis and excellent presentation. Well done!",
      attachments: ["physics_report.pdf"],
      late: false,
      wordCount: 2200,
      pages: 8
    },
    {
      id: 6,
      studentName: "William Wilson",
      studentId: "STU006",
      assignmentId: 3,
      assignmentTitle: "English Essay",
      subject: "English Literature",
      submissionDate: "2024-03-14",
      submissionTime: "13:10",
      status: "submitted",
      marks: null,
      feedback: "",
      attachments: ["hamlet_essay.docx"],
      late: false,
      wordCount: 1800,
      pages: 6
    },
  ];

  const [evaluation, setEvaluation] = useState({
    marks: "",
    feedback: "",
    status: "evaluated",
    comments: []
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'evaluated':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            <span>Evaluated</span>
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getGradeColor = (marks, totalMarks) => {
    const percentage = (marks / totalMarks) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (filter !== 'all' && submission.status !== filter) return false;
    if (selectedAssignment !== 'all' && submission.assignmentId !== parseInt(selectedAssignment)) return false;
    if (searchTerm && !submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !submission.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const pendingCount = submissions.filter(s => s.status === 'submitted').length;
  const evaluatedCount = submissions.filter(s => s.status === 'evaluated').length;
  const averageMarks = submissions.filter(s => s.marks).reduce((acc, curr) => acc + curr.marks, 0) / evaluatedCount || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 mb-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Assignment Evaluation</h1>
            <p className="text-blue-100">Review, grade, and provide feedback on student submissions</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-400 px-3 py-1 rounded-full text-sm">
              <span className="font-medium">{submissions.length} Submissions</span>
            </div>
            <button className="flex items-center space-x-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              <Upload className="w-4 h-4" />
              <span>Export Grades</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Evaluation</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{pendingCount}</h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Evaluated</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{evaluatedCount}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FileCheck className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Score</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{averageMarks.toFixed(1)}%</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students or assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select 
                  className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Pending</option>
                  <option value="evaluated">Evaluated</option>
                </select>
              </div>

              <div className="relative">
                <BookOpen className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select 
                  className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
                  value={selectedAssignment}
                  onChange={(e) => setSelectedAssignment(e.target.value)}
                >
                  <option value="all">All Assignments</option>
                  {assignments.map(assignment => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{filteredSubmissions.length} results</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Submissions List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Submissions</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((submission) => {
                const assignment = assignments.find(a => a.id === submission.assignmentId);
                return (
                  <div
                    key={submission.id}
                    onClick={() => setSelectedSubmission(submission)}
                    className={`p-4 cursor-pointer transition-colors ${selectedSubmission?.id === submission.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-800">{submission.studentName}</h3>
                      {getStatusBadge(submission.status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{submission.assignmentTitle}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {submission.submissionDate}
                      </span>
                      
                      {submission.marks && assignment && (
                        <span className={`font-medium ${getGradeColor(submission.marks, assignment.totalMarks)}`}>
                          {submission.marks}/{assignment.totalMarks}
                        </span>
                      )}
                    </div>
                    
                    {submission.late && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Late Submission
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No submissions match your filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Evaluation Panel */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            {selectedSubmission ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-1">
                      Evaluate Submission
                    </h2>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(selectedSubmission.status)}
                      {selectedSubmission.late && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Late Submission
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8">
                    {['evaluation', 'details', 'statistics'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </nav>
                </div>

                {activeTab === 'evaluation' && (
                  <>
                    {/* Submission Details Card */}
                    <div className="bg-gray-50 rounded-lg p-5">
                      <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Submission Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Student</p>
                          <p className="font-medium">{selectedSubmission.studentName}</p>
                          <p className="text-gray-400 text-xs">{selectedSubmission.studentId}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Submitted On</p>
                          <p className="font-medium">{selectedSubmission.submissionDate}</p>
                          <p className="text-gray-400 text-xs">{selectedSubmission.submissionTime}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Assignment</p>
                          <p className="font-medium">{selectedSubmission.assignmentTitle}</p>
                          <p className="text-gray-400 text-xs">{selectedSubmission.subject}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Document</p>
                          <p className="font-medium">{selectedSubmission.pages} pages</p>
                          <p className="text-gray-400 text-xs">{selectedSubmission.wordCount} words</p>
                        </div>
                      </div>
                    </div>

                    {/* Attachments */}
                    <div>
                      <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Attachments
                      </h3>
                      <div className="space-y-2">
                        {selectedSubmission.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-sm text-gray-700">{attachment}</span>
                            </div>
                            <button className="text-blue-500 hover:text-blue-600 p-1">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Evaluation Form */}
                    <form className="space-y-6 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Marks
                            <span className="text-gray-400 ml-1">
                              (out of {assignments.find(a => a.id === selectedSubmission.assignmentId)?.totalMarks || 100})
                            </span>
                          </label>
                          <input
                            type="number"
                            value={evaluation.marks}
                            onChange={(e) => setEvaluation({...evaluation, marks: e.target.value})}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter marks"
                            min="0"
                            max={assignments.find(a => a.id === selectedSubmission.assignmentId)?.totalMarks || 100}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                          <select
                            value={evaluation.status}
                            onChange={(e) => setEvaluation({...evaluation, status: e.target.value})}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="evaluated">Evaluated</option>
                            <option value="submitted">Pending Review</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Feedback
                          <span className="text-gray-400 ml-1">(visible to student)</span>
                        </label>
                        <textarea
                          value={evaluation.feedback}
                          onChange={(e) => setEvaluation({...evaluation, feedback: e.target.value})}
                          rows={5}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Provide constructive feedback for the student..."
                        />
                      </div>

                      <div className="flex justify-end space-x-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setSelectedSubmission(null)}
                          className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>Submit Evaluation</span>
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-5">
                      <h3 className="font-medium text-blue-800 mb-3">Assignment Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-blue-700">Due Date</p>
                          <p className="font-medium">March 10, 2024</p>
                        </div>
                        <div>
                          <p className="text-blue-700">Total Marks</p>
                          <p className="font-medium">100</p>
                        </div>
                        <div>
                          <p className="text-blue-700">Submission Type</p>
                          <p className="font-medium">Individual</p>
                        </div>
                        <div>
                          <p className="text-blue-700">Word Limit</p>
                          <p className="font-medium">1500 words</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-800 mb-3">Rubric Assessment</h3>
                      <div className="space-y-4">
                        {['Content', 'Structure', 'Originality', 'References'].map(category => (
                          <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium">{category}</span>
                            <div className="flex items-center space-x-2">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-700">25/25</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'statistics' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h3 className="font-medium text-gray-800 mb-4">Class Performance</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Average Score</span>
                            <span className="font-medium">78.5%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Highest Score</span>
                            <span className="font-medium text-green-600">94%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Lowest Score</span>
                            <span className="font-medium text-red-600">62%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Submission Rate</span>
                            <span className="font-medium">92%</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h3 className="font-medium text-gray-800 mb-4">Grade Distribution</h3>
                        <div className="space-y-2">
                          {['A (90-100)', 'B (80-89)', 'C (70-79)', 'D (60-69)', 'F (<60)'].map((grade, index) => (
                            <div key={grade} className="flex items-center">
                              <span className="text-sm text-gray-600 w-16">{grade}</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${75 - index * 15}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-8">{75 - index * 15}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <FileText className="w-16 h-16 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No submission selected</h3>
                <p className="text-center">Select a submission from the list to begin evaluation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentEvaluation;