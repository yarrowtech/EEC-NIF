import React, { useState, useEffect } from 'react';
import {
  FileText, Calendar, Search, Plus, Clock, AlertCircle, X,
  Edit3, Trash2, Eye, Users, CheckCircle, XCircle,
  Filter, BookOpen, MoreVertical, Download, Share2,
  ChevronDown, TrendingUp, Award, AlertTriangle, Upload, Loader
} from 'lucide-react';
import axios from 'axios';

// Static data for assignments
const staticAssignments = [
  {
    _id: '1',
    title: 'Quadratic Equations Problem Set',
    subject: 'Mathematics',
    class: '10-A',
    description: 'Solve problems related to quadratic equations, including graphing and real-world applications.',
    dueDate: '2025-01-15',
    createdDate: '2025-01-05',
    marks: 100,
    status: 'active',
    submissions: 28,
    totalStudents: 35,
    avgScore: 87.5,
    difficulty: 'Medium',
    type: 'Problem Set',
    attachments: ['quadratic_equations.pdf', 'answer_sheet.docx'],
    instructions: 'Complete all 20 problems. Show your work for full credit. Use graphing calculator where needed.',
    tags: ['Algebra', 'Graphing', 'Problem Solving']
  },
  {
    _id: '2',
    title: 'Cell Structure Lab Report',
    subject: 'Biology',
    class: '9-B',
    description: 'Write a detailed lab report on cell structure observation using microscopy.',
    dueDate: '2025-01-20',
    createdDate: '2025-01-08',
    marks: 50,
    status: 'active',
    submissions: 22,
    totalStudents: 30,
    avgScore: 92.3,
    difficulty: 'Easy',
    type: 'Lab Report',
    attachments: ['lab_format.pdf', 'cell_images.zip'],
    instructions: 'Follow the lab report format. Include labeled diagrams and observations.',
    tags: ['Laboratory', 'Microscopy', 'Scientific Writing']
  },
  {
    _id: '3',
    title: 'Romeo and Juliet Essay',
    subject: 'English Literature',
    class: '11-A',
    description: 'Analytical essay on the theme of fate vs. free will in Romeo and Juliet.',
    dueDate: '2025-01-25',
    createdDate: '2025-01-10',
    marks: 75,
    status: 'draft',
    submissions: 0,
    totalStudents: 32,
    avgScore: 0,
    difficulty: 'Hard',
    type: 'Essay',
    attachments: ['essay_rubric.pdf', 'citation_guide.pdf'],
    instructions: 'Write a 1000-word analytical essay. Use MLA format with at least 3 scholarly sources.',
    tags: ['Literature', 'Critical Analysis', 'Writing']
  },
  {
    _id: '4',
    title: 'World War II Timeline Project',
    subject: 'History',
    class: '10-B',
    description: 'Create a comprehensive timeline of major World War II events with analysis.',
    dueDate: '2025-01-18',
    createdDate: '2025-01-03',
    marks: 80,
    status: 'active',
    submissions: 25,
    totalStudents: 28,
    avgScore: 85.7,
    difficulty: 'Medium',
    type: 'Project',
    attachments: ['timeline_template.pptx', 'resource_links.pdf'],
    instructions: 'Include at least 20 major events. Provide context and analysis for each event.',
    tags: ['Timeline', 'Research', 'Historical Analysis']
  },
  {
    _id: '5',
    title: 'Chemical Bonding Quiz',
    subject: 'Chemistry',
    class: '11-C',
    description: 'Multiple choice and short answer quiz on ionic and covalent bonding.',
    dueDate: '2025-01-12',
    createdDate: '2025-01-07',
    marks: 25,
    status: 'completed',
    submissions: 27,
    totalStudents: 27,
    avgScore: 78.9,
    difficulty: 'Medium',
    type: 'Quiz',
    attachments: [],
    instructions: 'Complete the quiz in 30 minutes. No external resources allowed.',
    tags: ['Assessment', 'Chemical Bonding', 'Quick Test']
  },
  {
    _id: '6',
    title: 'Python Programming Assignment',
    subject: 'Computer Science',
    class: '12-A',
    description: 'Implement sorting algorithms and analyze their time complexity.',
    dueDate: '2025-01-30',
    createdDate: '2025-01-12',
    marks: 120,
    status: 'active',
    submissions: 15,
    totalStudents: 24,
    avgScore: 95.2,
    difficulty: 'Hard',
    type: 'Programming',
    attachments: ['starter_code.py', 'test_cases.txt'],
    instructions: 'Implement bubble sort, merge sort, and quick sort. Include time complexity analysis.',
    tags: ['Programming', 'Algorithms', 'Time Complexity']
  }
];

const AssignmentManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [myClasses, setMyClasses] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    subject: "",
    classId: "",
    sectionId: "",
    description: "",
    dueDate: "",
    marks: 100,
    status: "draft",
    attachments: []
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);

  const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

  // Fetch teacher's assigned classes
  useEffect(() => {
    fetchMyClasses();
  }, []);

  // Fetch assignments when component mounts
  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchMyClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching my classes with token:', token ? 'Token exists' : 'No token');
      const response = await axios.get(`${API_BASE_URL}/api/assignment/teacher/my-classes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('My classes response:', response.data);
      setMyClasses(response.data);

      if (response.data.length === 0) {
        setError('No classes assigned. You need to be assigned to classes in the timetable first.');
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to load your classes');
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/assignment/teacher/my-assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(response.data);
      setFilteredAssignments(response.data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSubmissionPercentage = (submissions, totalStudents) => {
    return totalStudents > 0 ? Math.round((submissions / totalStudents) * 100) : 0;
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleChange = (e) => {
    setNewAssignment({ ...newAssignment, [e.target.name]: e.target.value });
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert('File size must be less than 20MB');
      return;
    }

    setPdfFile(file);
    setUploadingPdf(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/uploads/cloudinary/single`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.files && response.data.files.length > 0) {
        const uploadedFile = response.data.files[0];
        setNewAssignment(prev => ({
          ...prev,
          attachments: [...prev.attachments, {
            name: uploadedFile.originalName,
            url: uploadedFile.secure_url,
            type: 'pdf'
          }]
        }));
      }
    } catch (err) {
      console.error('Error uploading PDF:', err);
      alert('Failed to upload PDF. Please try again.');
      setPdfFile(null);
    } finally {
      setUploadingPdf(false);
    }
  };

  const removePdfAttachment = (index) => {
    setNewAssignment(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_BASE_URL}/api/assignment/teacher/create`,
        newAssignment,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        await fetchAssignments(); // Refresh the assignments list
        setShowModal(false);
        setNewAssignment({
          title: "",
          subject: "",
          classId: "",
          sectionId: "",
          description: "",
          dueDate: "",
          marks: 100,
          status: "draft",
          attachments: []
        });
        setPdfFile(null);
        alert('Assignment created successfully!');
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      setError(err.response?.data?.error || 'Failed to create assignment');
      alert(err.response?.data?.error || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/assignment/teacher/delete/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchAssignments();
      alert('Assignment deleted successfully!');
    } catch (err) {
      console.error('Error deleting assignment:', err);
      alert(err.response?.data?.error || 'Failed to delete assignment');
    } finally {
      setLoading(false);
    }
  };

  // Filter assignments
  useEffect(() => {
    let filtered = assignments;

    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.class.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(assignment => assignment.status === filterStatus);
    }

    if (filterSubject !== 'all') {
      filtered = filtered.filter(assignment => assignment.subject === filterSubject);
    }

    setFilteredAssignments(filtered);
  }, [assignments, searchTerm, filterStatus, filterSubject]);

  const subjects = [...new Set(assignments.map(a => a.subject).filter(Boolean))];
  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter(a => a.status === 'active').length;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const draftAssignments = assignments.filter(a => a.status === 'draft').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Assignment Management</h1>
                <p className="text-sm text-gray-500">Create, manage and track student assignments</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{totalAssignments}</p>
                <p className="text-xs text-gray-500">Total Assignments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">{activeAssignments}</p>
                <p className="text-xs text-gray-400 mt-1">Currently ongoing</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Drafts</p>
                <p className="text-2xl font-bold text-yellow-600">{draftAssignments}</p>
                <p className="text-xs text-gray-400 mt-1">Work in progress</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Edit3 className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">My Classes</p>
                <p className="text-2xl font-bold text-blue-600">{myClasses.length}</p>
                <p className="text-xs text-gray-400 mt-1">Assigned classes</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                </select>
                
                <select 
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                >
                  <div className="w-4 h-4 flex flex-col space-y-0.5">
                    <div className="bg-current h-0.5 rounded"></div>
                    <div className="bg-current h-0.5 rounded"></div>
                    <div className="bg-current h-0.5 rounded"></div>
                  </div>
                </button>
              </div>
              
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create Assignment</span>
              </button>
            </div>
          </div>
        </div>

        {/* Assignment List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Assignments ({filteredAssignments.length})
            </h2>
            {filteredAssignments.length > 0 && (
              <p className="text-sm text-gray-500">
                Showing {filteredAssignments.length} of {totalAssignments} assignments
              </p>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading assignments...</h3>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria or create a new assignment</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Assignment
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
              {filteredAssignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 ${
                    viewMode === 'grid' ? 'p-6' : 'p-4'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                          {assignment.title}
                        </h3>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowDetailModal(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(assignment._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
                          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {assignment.subject}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                          {assignment.classId?.name || assignment.class} - {assignment.sectionId?.name}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {assignment.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            Due {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                          {getDaysUntilDue(assignment.dueDate) <= 3 && getDaysUntilDue(assignment.dueDate) > 0 && (
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Award className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{assignment.marks} marks</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Created {new Date(assignment.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {assignment.attachments && assignment.attachments.length > 0 && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <FileText className="w-3 h-3" />
                              <span>{assignment.attachments.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Create Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Create New Assignment</h2>
                    <p className="text-sm text-gray-500">Set up a new assignment for your students</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title *</label>
                    <input
                      name="title"
                      value={newAssignment.title}
                      onChange={handleChange}
                      type="text"
                      placeholder="e.g., Quadratic Equations Problem Set"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                    <input
                      name="subject"
                      value={newAssignment.subject}
                      onChange={handleChange}
                      type="text"
                      placeholder="e.g., Mathematics"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class & Section *</label>
                    <select
                      name="classSection"
                      value={`${newAssignment.classId}-${newAssignment.sectionId}`}
                      onChange={(e) => {
                        const [classId, sectionId] = e.target.value.split('-');
                        setNewAssignment({ ...newAssignment, classId, sectionId });
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Class & Section</option>
                      {myClasses.map((cs) => (
                        <option key={`${cs.classId}-${cs.sectionId}`} value={`${cs.classId}-${cs.sectionId}`}>
                          Class {cs.className} - Section {cs.sectionName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                    <input
                      name="dueDate"
                      value={newAssignment.dueDate}
                      onChange={handleChange}
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks *</label>
                    <input
                      name="marks"
                      value={newAssignment.marks}
                      onChange={handleChange}
                      type="number"
                      min="1"
                      placeholder="e.g., 100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={newAssignment.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={newAssignment.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Provide detailed instructions for the assignment..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* PDF Upload Section */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attachment (PDF)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                      {uploadingPdf ? (
                        <div className="flex flex-col items-center justify-center">
                          <Loader className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                          <p className="text-sm text-gray-600">Uploading PDF...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <Upload className="w-10 h-10 text-gray-400 mb-3" />
                          <p className="text-sm text-gray-600 mb-2">
                            Drag and drop a PDF file here, or click to select
                          </p>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={handlePdfUpload}
                            className="hidden"
                            id="pdf-upload"
                          />
                          <label
                            htmlFor="pdf-upload"
                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            Select PDF
                          </label>
                          <p className="text-xs text-gray-500 mt-2">Maximum file size: 20MB</p>
                        </div>
                      )}
                    </div>

                    {/* Show uploaded attachments */}
                    {newAssignment.attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                        {newAssignment.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-green-600" />
                              <span className="text-sm text-green-800 truncate max-w-xs">
                                {attachment.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removePdfAttachment(index)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Detail Modal */}
      {showDetailModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedAssignment.title}</h2>
                    <p className="text-sm text-gray-500">{selectedAssignment.subject} • Class {selectedAssignment.class}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Assignment Details</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedAssignment.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedAssignment.instructions}</p>
                  </div>
                  
                  {selectedAssignment.attachments.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Attachments</h3>
                      <div className="space-y-2">
                        {selectedAssignment.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <span className="text-gray-700 flex-1">{attachment}</span>
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAssignment.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Assignment Info</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedAssignment.status)}`}>
                          {selectedAssignment.status.charAt(0).toUpperCase() + selectedAssignment.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Type:</span>
                        <span className="text-gray-900">{selectedAssignment.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Difficulty:</span>
                        <span className={getDifficultyColor(selectedAssignment.difficulty)}>
                          {selectedAssignment.difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Marks:</span>
                        <span className="text-gray-900">{selectedAssignment.marks}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Due Date:</span>
                        <span className="text-gray-900">{new Date(selectedAssignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Created:</span>
                        <span className="text-gray-900">{new Date(selectedAssignment.createdDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Submission Stats</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Submissions</span>
                          <span className="text-gray-900">{selectedAssignment.submissions}/{selectedAssignment.totalStudents}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getSubmissionPercentage(selectedAssignment.submissions, selectedAssignment.totalStudents)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {getSubmissionPercentage(selectedAssignment.submissions, selectedAssignment.totalStudents)}% completion rate
                        </p>
                      </div>
                      {selectedAssignment.avgScore > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Average Score:</span>
                          <span className="text-gray-900">{selectedAssignment.avgScore.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;
