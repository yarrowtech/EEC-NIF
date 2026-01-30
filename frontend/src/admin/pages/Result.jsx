import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, FileSpreadsheet, Plus, Send, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { getStoredAdminScope } from '../utils/adminScope';

const API_BASE = import.meta.env.VITE_API_URL;

const Result = ({ setShowAdminHeader }) => {
  useEffect(() => {
    setShowAdminHeader?.(true);
  }, [setShowAdminHeader]);

  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');

  // Modals
  const [showAddResultModal, setShowAddResultModal] = useState(false);
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  // Form states
  const [resultForm, setResultForm] = useState({
    examId: '',
    studentId: '',
    marks: '',
    grade: '',
    remarks: '',
    status: 'pass'
  });

  const [examForm, setExamForm] = useState({
    title: '',
    subject: '',
    term: 'Term 1',
    date: '',
    time: '',
    duration: '',
    marks: '100',
    instructor: '',
    venue: ''
  });

  const [csvFile, setCSVFile] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchResults();
    fetchClassesAndSections();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass();
    }
  }, [selectedClass, selectedSection]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/exam/results/admin`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch results');
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load results');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesAndSections = async () => {
    try {
      const [classesRes, sectionsRes] = await Promise.all([
        fetch(`${API_BASE}/api/academics/classes`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_BASE}/api/academics/sections`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(Array.isArray(classesData) ? classesData : []);
      }

      if (sectionsRes.ok) {
        const sectionsData = await sectionsRes.json();
        setSections(Array.isArray(sectionsData) ? sectionsData : []);
      }
    } catch (error) {
      console.error('Error fetching classes/sections:', error);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/exam/fetch`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const allExams = Array.isArray(data) ? data : [];
        const filteredExams = allExams.filter(exam => exam.term === selectedTerm);
        setExams(filteredExams);
      } else {
        console.error('Failed to fetch exams');
        toast.error('Failed to fetch exams');
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Error fetching exams');
    }
  };

  const normalizeClassValue = (value = '') => {
    if (!value) return '';
    const str = value.toString().trim();
    const numeric = str.match(/\d+/);
    if (numeric) return numeric[0];
    return str.replace(/^class\s+/i, '').trim().toLowerCase();
  };

  const normalizeSectionValue = (value = '') =>
    value ? value.toString().trim().toLowerCase() : '';

  const fetchStudentsByClass = async () => {
    try {
      const { schoolId } = getStoredAdminScope();
      const url = new URL(`${API_BASE}/api/admin/users/get-students`);
      if (schoolId) {
        url.searchParams.set('schoolId', schoolId);
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      const allStudents = Array.isArray(data) ? data : [];

      const normalizedSelectedClass = normalizeClassValue(selectedClass);
      const normalizedSelectedSection = normalizeSectionValue(selectedSection);

      const filtered = allStudents.filter(student => {
        if (!selectedClass) return true;
        const studentGrade = normalizeClassValue(student.grade || student.class || '');
        const studentSection = normalizeSectionValue(student.section || '');
        const gradeMatch = studentGrade === normalizedSelectedClass;
        const sectionMatch = selectedSection ? studentSection === normalizedSelectedSection : true;
        return gradeMatch && sectionMatch;
      });

      const uniqueMap = new Map();
      filtered.forEach((student) => {
        const id = student._id?.toString() || student.id?.toString();
        const nifId = student.nifStudent?.toString();
        const key = nifId || id || `${student.name}-${student.roll}`;
        if (!key || uniqueMap.has(key)) return;
        uniqueMap.set(key, student);
      });

      const uniqueStudents = Array.from(uniqueMap.values()).sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
      );

      setStudents(uniqueStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
      setStudents([]);
    }
  };

  // Publish Results
  const handlePublishResults = async () => {
    if (!selectedClass) {
      toast.error('Please select a class first');
      return;
    }

    const result = await Swal.fire({
      title: 'Publish Results?',
      html: `
        <p>Are you sure you want to publish results for:</p>
        <p><strong>Class:</strong> ${selectedClass}</p>
        ${selectedSection ? `<p><strong>Section:</strong> ${selectedSection}</p>` : ''}
        <p class="text-sm text-gray-600 mt-2">Students and parents will be notified.</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Publish!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_BASE}/api/exam/results/publish`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grade: selectedClass,
            section: selectedSection || undefined
          })
        });

        if (!response.ok) throw new Error('Failed to publish results');

        const data = await response.json();

        Swal.fire({
          title: 'Published!',
          html: `
            <p>Results have been published successfully.</p>
            <p class="text-sm mt-2">
              <strong>Students notified:</strong> ${data.studentsNotified || 0}<br/>
              <strong>Parents notified:</strong> ${data.parentsNotified || 0}<br/>
              <strong>Teachers notified:</strong> ${data.teachersNotified || 0}
            </p>
          `,
          icon: 'success'
        });
      } catch (error) {
        console.error('Error publishing results:', error);
        Swal.fire('Error!', 'Failed to publish results. Please try again.', 'error');
      }
    }
  };

  // Add Result
  const handleAddResult = async (e) => {
    e.preventDefault();

    try {
      console.log('Submitting result:', resultForm);

      const response = await fetch(`${API_BASE}/api/exam/results`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultForm)
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add result');
      }

      toast.success('Result added successfully');
      setShowAddResultModal(false);
      setResultForm({
        examId: '',
        studentId: '',
        marks: '',
        grade: '',
        remarks: '',
        status: 'pass'
      });
      fetchResults();
    } catch (error) {
      console.error('Error adding result:', error);
      toast.error(error.message || 'Failed to add result');
    }
  };

  // Add Exam
  const handleAddExam = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE}/api/exam/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examForm)
      });

      if (!response.ok) throw new Error('Failed to add exam');

      const data = await response.json();
      toast.success('Exam created successfully');
      setShowAddExamModal(false);
      setExamForm({
        title: '',
        subject: '',
        term: 'Term 1',
        date: '',
        time: '',
        duration: '',
        marks: '100',
        instructor: '',
        venue: ''
      });
      fetchExams();
    } catch (error) {
      console.error('Error adding exam:', error);
      toast.error('Failed to create exam');
    }
  };

  // Bulk Upload CSV
  const handleBulkUpload = async (e) => {
    e.preventDefault();

    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const response = await fetch(`${API_BASE}/api/exam/results/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload results');

      const data = await response.json();

      Swal.fire({
        title: 'Upload Complete!',
        html: `
          <p><strong>Successfully uploaded:</strong> ${data.count || 0} results</p>
          ${data.errors && data.errors.length > 0 ? `
            <p class="text-sm text-red-600 mt-2"><strong>Errors:</strong></p>
            <div class="text-xs text-left max-h-40 overflow-y-auto">
              ${data.errors.slice(0, 5).map(err => `<p>• ${err}</p>`).join('')}
              ${data.errors.length > 5 ? `<p>... and ${data.errors.length - 5} more</p>` : ''}
            </div>
          ` : ''}
        `,
        icon: data.errors && data.errors.length > 0 ? 'warning' : 'success'
      });

      setShowBulkUploadModal(false);
      setCSVFile(null);
      fetchResults();
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast.error('Failed to upload CSV');
    }
  };

  const downloadCSVTemplate = () => {
    const template = 'examId,studentId,marks,grade,remarks,status\n65a1b2c3d4e5f6789012345,65b2c3d4e5f67890123456,85,A,Excellent,pass';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter results
  const uniqueSubjects = [...new Set(results.map(r => r.examId?.subject).filter(Boolean))];

  const filteredResults = results.filter(result => {
    const studentName = result.studentId?.name?.toLowerCase() || '';
    const subject = result.examId?.subject?.toLowerCase() || '';
    const grade = result.studentId?.grade || '';
    const section = result.studentId?.section || '';

    const matchesSearch =
      studentName.includes(searchTerm.toLowerCase()) ||
      subject.includes(searchTerm.toLowerCase());

    const matchesClass = selectedClass ? grade === selectedClass : true;
    const matchesSection = selectedSection ? section === selectedSection : true;
    const matchesSubject = filterSubject === 'all' || result.examId?.subject === filterSubject;

    return matchesSearch && matchesClass && matchesSection && matchesSubject;
  });

  // Export to CSV
  const exportToCSV = () => {
    if (filteredResults.length === 0) {
      toast.error('No results to export');
      return;
    }

    const headers = ['Student Name', 'Roll', 'Class', 'Section', 'Exam', 'Subject', 'Marks', 'Grade', 'Status'];
    const rows = filteredResults.map(r => [
      r.studentId?.name || 'N/A',
      r.studentId?.roll || 'N/A',
      r.studentId?.grade || 'N/A',
      r.studentId?.section || 'N/A',
      r.examId?.title || 'N/A',
      r.examId?.subject || 'N/A',
      r.marks || 0,
      r.grade || 'N/A',
      r.status || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Results exported successfully');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pass': return 'bg-green-100 text-green-800';
      case 'fail': return 'bg-red-100 text-red-800';
      case 'absent': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Result Management</h1>
          <p className="text-gray-600">Manage and publish student examination results</p>
        </div>

        {/* Class/Section Selection & Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls.name}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Section (Optional)</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Sections</option>
                {sections.map(sec => (
                  <option key={sec._id} value={sec.name}>{sec.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={async () => {
                try {
                  await Promise.all([fetchExams(), fetchStudentsByClass()]);
                  setShowAddResultModal(true);
                } catch (error) {
                  console.error('Error loading modal data:', error);
                  toast.error('Failed to load data');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Single Result
            </button>
            <button
              onClick={() => setShowBulkUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Bulk Upload (CSV)
            </button>
            <button
              onClick={() => setShowAddExamModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Exam
            </button>
            <button
              onClick={handlePublishResults}
              disabled={!selectedClass}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedClass
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              Publish Results
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by student or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
              </div>

              {/* Subject Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Subjects</option>
                  {uniqueSubjects.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Results</p>
                <p className="text-2xl font-bold text-gray-900">{filteredResults.length}</p>
              </div>
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pass</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredResults.filter(r => r.status?.toLowerCase() === 'pass').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fail</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredResults.filter(r => r.status?.toLowerCase() === 'fail').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-gray-600">
                  {filteredResults.filter(r => r.status?.toLowerCase() === 'absent').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResults.map((result, index) => (
                    <tr key={result._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {result.studentId?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Roll: {result.studentId?.roll || 'N/A'} |
                            Class: {result.studentId?.grade || 'N/A'} {result.studentId?.section || ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {result.examId?.title || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {result.examId?.subject || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-400">
                            {result.examId?.date ? new Date(result.examId.date).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {result.marks || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {result.grade || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                          {result.status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Result Modal */}
        {showAddResultModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Add Result</h2>
                <button onClick={() => setShowAddResultModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddResult} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Exam *</label>
                  <select
                    value={resultForm.examId}
                    onChange={(e) => setResultForm({...resultForm, examId: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose an exam</option>
                    {exams.map(exam => (
                      <option key={exam._id} value={exam._id}>
                        {exam.title} - {exam.subject} ({exam.term})
                      </option>
                    ))}
                  </select>
                  {exams.length === 0 && (
                    <p className="text-sm text-blue-600 mt-1">
                      No exams found for {selectedTerm}. <button type="button" onClick={() => setShowAddExamModal(true)} className="underline">Create a new exam</button>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Student *</label>
                  <select
                    value={resultForm.studentId}
                    onChange={(e) => setResultForm({...resultForm, studentId: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a student</option>
                    {students.map(student => (
                      <option key={student._id} value={student._id}>
                        {student.name} - Roll: {student.roll} ({student.grade} {student.section})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marks *</label>
                    <input
                      type="number"
                      value={resultForm.marks}
                      onChange={(e) => setResultForm({...resultForm, marks: e.target.value})}
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                    <input
                      type="text"
                      value={resultForm.grade}
                      onChange={(e) => setResultForm({...resultForm, grade: e.target.value})}
                      placeholder="A, B, C..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    value={resultForm.status}
                    onChange={(e) => setResultForm({...resultForm, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pass">Pass</option>
                    <option value="fail">Fail</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                  <textarea
                    value={resultForm.remarks}
                    onChange={(e) => setResultForm({...resultForm, remarks: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddResultModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Result
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Exam Modal */}
        {showAddExamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Create Exam</h2>
                <button onClick={() => setShowAddExamModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddExam} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Exam Title *</label>
                    <input
                      type="text"
                      value={examForm.title}
                      onChange={(e) => setExamForm({...examForm, title: e.target.value})}
                      required
                      placeholder="Mid Term Examination"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                    <input
                      type="text"
                      value={examForm.subject}
                      onChange={(e) => setExamForm({...examForm, subject: e.target.value})}
                      required
                      placeholder="Mathematics"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Term *</label>
                    <select
                      value={examForm.term}
                      onChange={(e) => setExamForm({...examForm, term: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Term 1">Term 1</option>
                      <option value="Term 2">Term 2</option>
                      <option value="Term 3">Term 3</option>
                      <option value="Final">Final</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      value={examForm.date}
                      onChange={(e) => setExamForm({...examForm, date: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      value={examForm.time}
                      onChange={(e) => setExamForm({...examForm, time: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min)</label>
                    <input
                      type="number"
                      value={examForm.duration}
                      onChange={(e) => setExamForm({...examForm, duration: e.target.value})}
                      placeholder="120"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Marks</label>
                    <input
                      type="number"
                      value={examForm.marks}
                      onChange={(e) => setExamForm({...examForm, marks: e.target.value})}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
                    <input
                      type="text"
                      value={examForm.instructor}
                      onChange={(e) => setExamForm({...examForm, instructor: e.target.value})}
                      placeholder="Prof. Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                    <input
                      type="text"
                      value={examForm.venue}
                      onChange={(e) => setExamForm({...examForm, venue: e.target.value})}
                      placeholder="Hall A"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddExamModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Create Exam
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Upload Modal */}
        {showBulkUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Bulk Upload Results (CSV)</h2>
                <button onClick={() => setShowBulkUploadModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBulkUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File *</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCSVFile(e.target.files[0])}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    CSV must contain: examId, studentId, marks, grade, remarks, status
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Need a template?</strong>
                  </p>
                  <button
                    type="button"
                    onClick={downloadCSVTemplate}
                    className="text-sm text-blue-600 underline hover:text-blue-800"
                  >
                    Download CSV Template
                  </button>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBulkUploadModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Result;
