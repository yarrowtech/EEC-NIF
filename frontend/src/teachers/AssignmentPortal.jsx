import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, Calendar, Search, Plus, Clock, AlertCircle, X,
  Edit3, Trash2, Eye, Users, CheckCircle, XCircle,
  Filter, BookOpen, MoreVertical, Download, Share2,
  ChevronDown, TrendingUp, Award, AlertTriangle, Upload, Loader,
  User, Star, ExternalLink, RefreshCcw, BarChart2, Sparkles,
  Target, ListChecks, Activity, Layers, GraduationCap
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const AssignmentPortal = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' or 'evaluate'

  // ─────────────────────────────────────────────────────────────────────────
  // ASSIGNMENT MANAGEMENT STATE
  // ─────────────────────────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailEditMode, setDetailEditMode] = useState(false);
  const [detailSaving, setDetailSaving] = useState(false);
  const [detailDraft, setDetailDraft] = useState({
    title: '',
    subject: '',
    description: '',
    classId: '',
    sectionId: '',
    dueDate: '',
    marks: 100,
    status: 'draft',
    submissionFormat: 'text',
    type: 'Assignment',
    difficulty: 'Medium'
  });
  const [viewMode, setViewMode] = useState('grid');
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
    submissionFormat: "text",
    attachments: []
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [showCreateSuccessModal, setShowCreateSuccessModal] = useState(false);
  const [createSuccessMessage, setCreateSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteAssignment, setPendingDeleteAssignment] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);

  // ─────────────────────────────────────────────────────────────────────────
  // ASSIGNMENT EVALUATION STATE
  // ─────────────────────────────────────────────────────────────────────────
  const [submissions, setSubmissions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [selected, setSelected] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('recent');

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────────────────
  const globalSubjectOptions = useMemo(() => {
    const map = new Map();
    myClasses.forEach(cs => {
      (cs.subjects || []).forEach(subject => {
        if (!subject?.name) return;
        const key = String(subject.id || subject._id || subject.name);
        if (!map.has(key)) {
          map.set(key, { id: key, name: subject.name });
        }
      });
    });
    return Array.from(map.values());
  }, [myClasses]);

  const subjectOptions = useMemo(() => {
    if (newAssignment.classId && newAssignment.sectionId) {
      const matched = myClasses.find(
        cs => cs.classId === newAssignment.classId && cs.sectionId === newAssignment.sectionId
      );
      if (matched?.subjects?.length) {
        const map = new Map();
        matched.subjects.forEach(sub => {
          if (!sub?.name) return;
          const key = String(sub.id || sub._id || sub.name);
          if (!map.has(key)) {
            map.set(key, { id: key, name: sub.name });
          }
        });
        const scoped = Array.from(map.values());
        if (scoped.length) return scoped;
      }
    }
    return globalSubjectOptions;
  }, [myClasses, newAssignment.classId, newAssignment.sectionId, globalSubjectOptions]);

  const subjects = [...new Set(assignments.map(a => a.subject).filter(Boolean))];
  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter(a => a.status === 'active').length;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const draftAssignments = assignments.filter(a => a.status === 'draft').length;

  const assignmentTitles = ['all', ...new Set(submissions.map(s => s.assignmentTitle))];
  const pendingCount = submissions.filter(s => s.score === null || s.score === undefined).length;
  const gradedCount = submissions.filter(s => s.score !== null && s.score !== undefined).length;
  const lateCount = submissions.filter(s => s.status === 'late').length;
  const gradedSubmissions = submissions.filter(s => s.score !== null && s.score !== undefined && s.totalMarks);
  const averageScore = gradedSubmissions.length
    ? Math.round((gradedSubmissions.reduce((acc, sub) => acc + (sub.score / sub.totalMarks), 0) / gradedSubmissions.length) * 100)
    : null;

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH DATA
  // ─────────────────────────────────────────────────────────────────────────
  const token = () => localStorage.getItem('token');

  const fetchMyClasses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/assignment/teacher/my-classes`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      const normalizedClasses = Array.isArray(response.data)
        ? response.data.map(item => ({
            ...item,
            subjects: Array.isArray(item.subjects) ? item.subjects.filter(sub => sub && sub.name) : []
          }))
        : [];
      setMyClasses(normalizedClasses);
      if (response.data.length === 0) {
        setError('No classes assigned. You need to be assigned to classes in the timetable first.');
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError(err.response?.data?.error || 'Failed to load your classes');
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/assignment/teacher/my-assignments`, {
        headers: { Authorization: `Bearer ${token()}` }
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

  const fetchSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      const { data } = await axios.get(`${API_BASE_URL}/api/assignment/teacher/submissions`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setSubmissions(data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    fetchMyClasses();
    fetchAssignments();
    fetchSubmissions();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // FILTER ASSIGNMENTS
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let filtered = assignments;
    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        String(assignment.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(assignment.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(getAssignmentClassName(assignment)).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(getAssignmentSectionName(assignment)).toLowerCase().includes(searchTerm.toLowerCase())
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

  // ─────────────────────────────────────────────────────────────────────────
  // FILTER SUBMISSIONS
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let list = [...submissions];
    if (statusFilter !== 'all') {
      list = list.filter(s => statusFilter === 'graded' ? s.score !== null : s.score === null);
    }
    if (assignmentFilter !== 'all') {
      list = list.filter(s => s.assignmentTitle === assignmentFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.studentName?.toLowerCase().includes(q) ||
        s.assignmentTitle?.toLowerCase().includes(q) ||
        s.subject?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const dateA = new Date(a.submittedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.submittedAt || b.createdAt || 0).getTime();
      return sortOrder === 'oldest' ? dateA - dateB : dateB - dateA;
    });
    setFiltered(list);
  }, [submissions, statusFilter, assignmentFilter, search, sortOrder]);

  // ─────────────────────────────────────────────────────────────────────────
  // HELPER FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Hard': return 'text-red-600';
      default: return 'text-gray-600';
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

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString();
  };

  const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';

  const toDateInputValue = (value) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 10);
  };

  const resolveIdValue = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return String(value._id || value.id || '');
    return '';
  };

  const getAssignmentClassName = (assignment) =>
    assignment?.classId?.name || assignment?.className || assignment?.class || '';

  const getAssignmentSectionName = (assignment) =>
    assignment?.sectionId?.name || assignment?.sectionName || assignment?.section || '';

  const statusChip = (sub) => {
    if (sub.score !== null && sub.score !== undefined)
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">Graded</span>;
    if (sub.status === 'late')
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">Late</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">Pending</span>;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ASSIGNMENT MANAGEMENT HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  const openAssignmentDetail = (assignment) => {
    setSelectedAssignment(assignment);
    setDetailDraft({
      title: assignment?.title || '',
      subject: assignment?.subject || '',
      description: assignment?.description || '',
      classId: resolveIdValue(assignment?.classId),
      sectionId: resolveIdValue(assignment?.sectionId),
      dueDate: toDateInputValue(assignment?.dueDate),
      marks: assignment?.marks ?? 100,
      status: assignment?.status || 'draft',
      submissionFormat: assignment?.submissionFormat === 'pdf' ? 'pdf' : 'text',
      type: assignment?.type || 'Assignment',
      difficulty: assignment?.difficulty || 'Medium'
    });
    setDetailEditMode(false);
    setShowDetailModal(true);
  };

  const handleDetailDraftChange = (key, value) => {
    setDetailDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdateAssignment = async () => {
    if (!selectedAssignment?._id) return;
    try {
      setDetailSaving(true);
      const payload = {
        title: detailDraft.title,
        subject: detailDraft.subject,
        description: detailDraft.description,
        classId: detailDraft.classId,
        sectionId: detailDraft.sectionId,
        dueDate: detailDraft.dueDate,
        marks: Number(detailDraft.marks),
        status: detailDraft.status,
        submissionFormat: detailDraft.submissionFormat,
        type: detailDraft.type,
        difficulty: detailDraft.difficulty
      };
      const response = await axios.put(
        `${API_BASE_URL}/api/assignment/teacher/update/${selectedAssignment._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      const updated = response?.data?.assignment;
      if (!updated) throw new Error('Assignment updated but response was invalid');
      setAssignments((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
      setSelectedAssignment(updated);
      setDetailEditMode(false);
    } catch (err) {
      console.error('Error updating assignment:', err);
      setError(err.response?.data?.error || err.message || 'Failed to update assignment');
    } finally {
      setDetailSaving(false);
    }
  };

  const handleChange = (e) => {
    setNewAssignment({ ...newAssignment, [e.target.name]: e.target.value });
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert('File size must be less than 20MB');
      return;
    }
    setPdfFile(file);
    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(
        `${API_BASE_URL}/api/uploads/cloudinary/single`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token()}`,
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
      const response = await axios.post(
        `${API_BASE_URL}/api/assignment/teacher/create`,
        newAssignment,
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      if (response.data) {
        await fetchAssignments();
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
          submissionFormat: "text",
          attachments: []
        });
        setPdfFile(null);
        setCreateSuccessMessage('Assignment created successfully.');
        setShowCreateSuccessModal(true);
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      setError(err.response?.data?.error || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (assignment) => {
    setPendingDeleteAssignment(assignment);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!pendingDeleteAssignment?._id) return;
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/api/assignment/teacher/delete/${pendingDeleteAssignment._id}`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      await fetchAssignments();
      setShowDeleteModal(false);
      setPendingDeleteAssignment(null);
    } catch (err) {
      console.error('Error deleting assignment:', err);
      setError(err.response?.data?.error || 'Failed to delete assignment');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // EVALUATION HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  const openSubmission = (sub) => {
    setSelected(sub);
    setMarks(sub.score !== null && sub.score !== undefined ? String(sub.score) : '');
    setFeedback(sub.feedback || '');
    setSaveError('');
    setShowPdfPreview(false);
  };

  const closePanel = () => {
    setSelected(null);
    setSaveError('');
    setShowPdfPreview(false);
  };

  const handleRefresh = () => {
    fetchSubmissions();
  };

  const saveGrade = async () => {
    const numMarks = parseFloat(marks);
    if (isNaN(numMarks) || numMarks < 0) {
      setSaveError('Please enter a valid mark (≥ 0).');
      return;
    }
    if (numMarks > selected.totalMarks) {
      setSaveError(`Marks cannot exceed ${selected.totalMarks}.`);
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      await axios.post(
        `${API_BASE_URL}/api/assignment/teacher/grade`,
        {
          studentId: selected.studentId,
          assignmentId: selected.assignmentId,
          score: numMarks,
          feedback
        },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      setSubmissions(prev =>
        prev.map(s =>
          s.submissionId === selected.submissionId
            ? { ...s, score: numMarks, feedback, status: 'graded' }
            : s
        )
      );
      setSelected(prev => ({ ...prev, score: numMarks, feedback, status: 'graded' }));
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-indigo-600 to-indigo-500 text-white">
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.15) 0, transparent 55%)' }} />
        <div className="relative px-4 md:px-6 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Assignment Portal</h1>
              <p className="text-white/80 text-sm mt-1">Manage assignments and evaluate student submissions</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-white/20 pb-4">
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl font-semibold text-sm transition-all ${
                activeTab === 'manage'
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <Layers className="w-4 h-4" />
              Manage Assignments
            </button>
            <button
              onClick={() => setActiveTab('evaluate')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl font-semibold text-sm transition-all ${
                activeTab === 'evaluate'
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Evaluate Submissions
            </button>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className="p-4 md:p-6 space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <p className="text-xs text-red-600 font-medium flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 p-1">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'manage' ? (
          <ManageAssignments
            loading={loading}
            assignments={assignments}
            filteredAssignments={filteredAssignments}
            myClasses={myClasses}
            subjects={subjects}
            activeAssignments={activeAssignments}
            draftAssignments={draftAssignments}
            totalAssignments={totalAssignments}
            viewMode={viewMode}
            setViewMode={setViewMode}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterSubject={filterSubject}
            setFilterSubject={setFilterSubject}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setShowModal={setShowModal}
            openAssignmentDetail={openAssignmentDetail}
            openDeleteModal={openDeleteModal}
            getStatusColor={getStatusColor}
            getAssignmentClassName={getAssignmentClassName}
            getAssignmentSectionName={getAssignmentSectionName}
            getDaysUntilDue={getDaysUntilDue}
          />
        ) : (
          <EvaluateSubmissions
            loadingSubmissions={loadingSubmissions}
            submissions={submissions}
            filtered={filtered}
            selected={selected}
            marks={marks}
            setMarks={setMarks}
            feedback={feedback}
            setFeedback={setFeedback}
            saving={saving}
            saveError={saveError}
            showPdfPreview={showPdfPreview}
            setShowPdfPreview={setShowPdfPreview}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            assignmentFilter={assignmentFilter}
            setAssignmentFilter={setAssignmentFilter}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            assignmentTitles={assignmentTitles}
            pendingCount={pendingCount}
            gradedCount={gradedCount}
            lateCount={lateCount}
            averageScore={averageScore}
            openSubmission={openSubmission}
            closePanel={closePanel}
            handleRefresh={handleRefresh}
            saveGrade={saveGrade}
            statusChip={statusChip}
            formatDate={formatDate}
            formatTime={formatTime}
            getSubmissionPercentage={getSubmissionPercentage}
          />
        )}
      </div>

      {/* Modals */}
      {showCreateSuccessModal && (
        <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border-[2.5px] border-purple-300 overflow-hidden">
            <div className="p-5">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Assignment Created</h3>
              <p className="text-sm text-gray-600">{createSuccessMessage}</p>
            </div>
            <div className="px-5 py-3 border-t border-purple-100 flex justify-end">
              <button
                onClick={() => setShowCreateSuccessModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border-[2.5px] border-purple-300 overflow-hidden">
            <div className="p-5">
              <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Delete Assignment?</h3>
              <p className="text-sm text-gray-600">
                {`This will permanently delete "${pendingDeleteAssignment?.title || 'this assignment'}".`}
              </p>
            </div>
            <div className="px-5 py-3 border-t border-purple-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPendingDeleteAssignment(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-50 border-[2px] border-purple-200 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-xl shadow-sm hover:shadow-md disabled:opacity-60 transition-all"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <CreateAssignmentModal
          showModal={showModal}
          setShowModal={setShowModal}
          newAssignment={newAssignment}
          handleChange={handleChange}
          handleCreate={handleCreate}
          myClasses={myClasses}
          subjectOptions={subjectOptions}
          setNewAssignment={setNewAssignment}
          uploadingPdf={uploadingPdf}
          handlePdfUpload={handlePdfUpload}
          removePdfAttachment={removePdfAttachment}
          loading={loading}
          error={error}
        />
      )}

      {showDetailModal && selectedAssignment && (
        <AssignmentDetailModal
          selectedAssignment={selectedAssignment}
          showDetailModal={showDetailModal}
          setShowDetailModal={setShowDetailModal}
          detailEditMode={detailEditMode}
          setDetailEditMode={setDetailEditMode}
          detailDraft={detailDraft}
          handleDetailDraftChange={handleDetailDraftChange}
          handleUpdateAssignment={handleUpdateAssignment}
          detailSaving={detailSaving}
          openAssignmentDetail={openAssignmentDetail}
          myClasses={myClasses}
          globalSubjectOptions={globalSubjectOptions}
          getStatusColor={getStatusColor}
          getDifficultyColor={getDifficultyColor}
          formatDate={formatDate}
          getAssignmentClassName={getAssignmentClassName}
          getAssignmentSectionName={getAssignmentSectionName}
          getSubmissionPercentage={getSubmissionPercentage}
        />
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

const ManageAssignments = ({
  loading, assignments, filteredAssignments, myClasses, subjects,
  activeAssignments, draftAssignments, totalAssignments,
  viewMode, setViewMode, filterStatus, setFilterStatus,
  filterSubject, setFilterSubject, searchTerm, setSearchTerm,
  setShowModal, openAssignmentDetail, openDeleteModal,
  getStatusColor, getAssignmentClassName, getAssignmentSectionName, getDaysUntilDue
}) => (
  <div className="space-y-4 sm:space-y-5">
    {/* Stats Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {[
        { label: 'Active', value: activeAssignments, icon: CheckCircle, gradient: 'from-emerald-500 to-green-500' },
        { label: 'Drafts', value: draftAssignments, icon: Edit3, gradient: 'from-amber-500 to-orange-500' },
        { label: 'My Classes', value: myClasses.length, icon: Users, gradient: 'from-blue-500 to-indigo-500' },
      ].map((stat) => (
        <div key={stat.label} className="bg-white rounded-2xl p-4 border-[2.5px] border-purple-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
              <stat.icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Controls */}
    <div className="bg-white rounded-2xl p-3 sm:p-4 border-[2.5px] border-purple-300 space-y-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
        >
          <option value="all">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
            >
              <div className="w-3.5 h-3.5 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm" />
                <div className="bg-current rounded-sm" />
                <div className="bg-current rounded-sm" />
                <div className="bg-current rounded-sm" />
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
            >
              <div className="w-3.5 h-3.5 flex flex-col justify-center gap-[3px]">
                <div className="bg-current h-[2px] rounded" />
                <div className="bg-current h-[2px] rounded" />
                <div className="bg-current h-[2px] rounded" />
              </div>
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all"
          >
            <Plus size={14} />
            Create
          </button>
        </div>
      </div>
    </div>

    {/* Assignment List */}
    {loading ? (
      <div className="bg-white rounded-2xl border-[2.5px] border-purple-300 p-12 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 mb-4">
          <Clock className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Loading assignments...</h3>
        <p className="text-sm text-gray-500">Fetching your assignment data</p>
      </div>
    ) : filteredAssignments.length === 0 ? (
      <div className="bg-white rounded-2xl border-[2.5px] border-purple-300 p-12 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 mb-4">
          <FileText className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">No assignments found</h3>
        <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or create a new assignment</p>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all"
        >
          <Plus size={14} />
          Create First Assignment
        </button>
      </div>
    ) : (
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-500">
            Showing {filteredAssignments.length} of {totalAssignments} assignments
          </p>
        </div>
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
          {filteredAssignments.map((assignment) => {
            const submissionFormat = assignment?.submissionFormat === 'pdf' ? 'pdf' : 'text';
            const statusBorder = assignment.status === 'active' ? 'border-l-emerald-500' : assignment.status === 'draft' ? 'border-l-amber-500' : assignment.status === 'completed' ? 'border-l-blue-500' : 'border-l-red-500';
            return (
              <div
                key={assignment._id}
                className={`bg-white rounded-2xl border-[2.5px] border-purple-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-l-4 ${statusBorder} ${viewMode === 'grid' ? 'p-5' : 'p-4'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug flex-1 mr-3">
                    {assignment.title}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openAssignmentDetail(assignment)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(assignment)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${getStatusColor(assignment.status)}`}>
                    {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border-[2px] border-purple-200">
                    {assignment.subject}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-100 text-purple-700 border-[2px] border-purple-200">
                    {`Class ${getAssignmentClassName(assignment) || 'N/A'}${getAssignmentSectionName(assignment) ? ` - ${getAssignmentSectionName(assignment)}` : ''}`}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${submissionFormat === 'pdf' ? 'border-purple-100 bg-purple-50 text-purple-600' : 'border-emerald-100 bg-emerald-50 text-emerald-600'}`}>
                    {submissionFormat === 'pdf' ? 'PDF' : 'Text'}
                  </span>
                </div>

                <p className="text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed">
                  {assignment.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-gray-400" />
                    <span>Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    {getDaysUntilDue(assignment.dueDate) <= 3 && getDaysUntilDue(assignment.dueDate) > 0 && (
                      <AlertTriangle size={12} className="text-orange-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award size={12} className="text-gray-400" />
                    <span>{assignment.marks} marks</span>
                  </div>
                  {assignment.attachments && assignment.attachments.length > 0 && (
                    <div className="flex items-center gap-1">
                      <FileText size={12} className="text-gray-400" />
                      <span>{assignment.attachments.length} files</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
);

const EvaluateSubmissions = ({
  loadingSubmissions, submissions, filtered, selected,
  marks, setMarks, feedback, setFeedback, saving, saveError,
  showPdfPreview, setShowPdfPreview, search, setSearch,
  statusFilter, setStatusFilter, assignmentFilter, setAssignmentFilter,
  sortOrder, setSortOrder, assignmentTitles, pendingCount, gradedCount,
  lateCount, averageScore, openSubmission, closePanel, handleRefresh,
  saveGrade, statusChip, formatDate, formatTime, getSubmissionPercentage
}) => {
  const uniqueAssignments = Math.max(assignmentTitles.length - 1, 0);
  const latestSubmissionDate = submissions.length
    ? submissions
        .map((s) => new Date(s.submittedAt || s.createdAt || 0).getTime())
        .reduce((max, current) => Math.max(max, current), 0)
    : null;
  const highlightedSubmission =
    filtered.find((s) => s.score === null || s.score === undefined) || filtered[0] || null;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border-[2.5px] border-purple-400 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-500">Awaiting review</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ListChecks className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Use the filters below to focus on the right class or subject.</p>
        </div>

        <div className="rounded-2xl border-[2.5px] border-purple-400 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Already graded</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{gradedCount}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">{averageScore !== null ? `Avg. score ${averageScore}%` : 'Grade a submission to unlock averages.'}</p>
        </div>

        <div className="rounded-2xl border-[2.5px] border-purple-400 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">Late submissions</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{lateCount}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Give priority feedback to learners who submitted late.</p>
        </div>

        <div className="rounded-2xl border-[2.5px] border-purple-400 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-500">Active assignments</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{uniqueAssignments}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BarChart2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Spanning {submissions.length} submissions this term.</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-3xl border-[2.5px] border-purple-300 shadow-sm p-5 md:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-500">Work queue</p>
            <h2 className="text-lg font-semibold text-gray-900">Filter submissions</h2>
            <p className="text-sm text-gray-500">Refine by student, assignment, or grading status.</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 rounded-2xl bg-white/15 border border-purple-200 px-4 py-2.5 text-sm font-semibold text-purple-600 hover:bg-purple-50 transition"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, assignment, or subject…"
              className="w-full rounded-2xl border-[2px] border-purple-200 bg-purple-50 pl-10 pr-4 py-3 text-sm focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 w-full lg:w-auto">
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="rounded-2xl border-[2px] border-purple-200 bg-purple-50 px-4 py-3 text-sm focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100"
            >
              {assignmentTitles.map((t) => (
                <option key={t} value={t}>
                  {t === 'all' ? 'All assignments' : t}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border-[2px] border-purple-200 bg-purple-50 px-4 py-3 text-sm focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100"
            >
              <option value="all">All status</option>
              <option value="pending">Pending review</option>
              <option value="graded">Graded</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="rounded-2xl border-[2px] border-purple-200 bg-purple-50 px-4 py-3 text-sm focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100"
            >
              <option value="recent">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'graded'].map((status) => {
            const active = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  active ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Show all' : status === 'pending' ? 'Needs review' : 'Completed'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submissions Grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr),minmax(320px,0.85fr)]">
        <div className="space-y-4">
          {loadingSubmissions ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="rounded-2xl border-[2.5px] border-purple-200 bg-white p-5 animate-pulse space-y-4">
                  <div className="h-5 w-1/2 bg-gray-200 rounded" />
                  <div className="h-4 w-1/3 bg-gray-200 rounded" />
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border-[2.5px] border-dashed border-purple-300 bg-white p-10 text-center space-y-2">
              <FileText className="w-12 h-12 mx-auto text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-800">No submissions found</h3>
              <p className="text-sm text-gray-500">Adjust the filters or ask students to upload their work.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((sub) => {
                const isSelected = selected?.submissionId === sub.submissionId;
                return (
                  <article
                    key={sub.submissionId}
                    onClick={() => openSubmission(sub)}
                    className={`rounded-2xl border-[2.5px] p-5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-500 bg-white shadow-lg shadow-purple-100'
                        : 'border-purple-300 bg-white hover:-translate-y-0.5 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{sub.studentName}</p>
                          <p className="text-xs text-gray-500">{sub.grade} • {sub.section}</p>
                        </div>
                      </div>
                      {statusChip(sub)}
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{sub.assignmentTitle}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1"><BookOpen className="w-3 h-3" />{sub.subject}</span>
                        <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(sub.submittedAt)}</span>
                      </div>
                      {sub.attachmentUrl && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-[11px] font-semibold text-purple-600">
                          <FileText className="w-3 h-3" />
                          PDF attached
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(sub.submittedAt)}
                      </span>
                      {sub.score !== null && sub.score !== undefined ? (
                        <span className="text-sm font-semibold text-green-600">{sub.score}/{sub.totalMarks}</span>
                      ) : (
                        <span className="text-sm font-semibold text-purple-600 flex items-center gap-1">
                          Review
                          <Eye className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Grading Panel */}
        <div className="space-y-5">
          <div className="rounded-3xl border-[2.5px] border-purple-400 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-500">Today's snapshot</p>
                <h3 className="text-lg font-semibold text-gray-900">Insights</h3>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 rounded-full border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-50"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border-[2px] border-purple-200 bg-purple-50 px-4 py-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Average score</p>
                  <p className="text-lg font-semibold text-gray-900">{averageScore !== null ? `${averageScore}%` : 'Awaiting first grade'}</p>
                  <p className="text-xs text-gray-500">Calculated from graded submissions.</p>
                </div>
              </div>
              {highlightedSubmission && (
                <div className="flex items-center gap-3 rounded-2xl border-[2px] border-purple-300 bg-purple-50 px-4 py-3">
                  <div className="w-10 h-10 rounded-2xl bg-white text-purple-600 flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-purple-500">Next best action</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{highlightedSubmission.assignmentTitle}</p>
                    <p className="text-xs text-gray-600 truncate">
                      {highlightedSubmission.studentName} • {formatDate(highlightedSubmission.submittedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border-[2.5px] border-purple-400 bg-white shadow-lg flex flex-col min-h-[480px]">
            {selected ? (
              <>
                <div className="flex items-start justify-between gap-3 border-b border-purple-100 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900">{selected.studentName}</p>
                      <p className="text-sm text-gray-500">{selected.grade} • {selected.section}</p>
                    </div>
                  </div>
                  <button
                    onClick={closePanel}
                    className="rounded-full border border-purple-200 p-1.5 text-purple-500 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  <div className="rounded-2xl border-[2px] border-purple-300 bg-purple-50/60 p-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-900">{selected.assignmentTitle}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {selected.subject}</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Total {selected.totalMarks} marks</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Submitted {formatDate(selected.submittedAt)}</span>
                      {selected.status === 'late' && <span className="text-amber-600 font-medium">Late submission</span>}
                    </div>
                  </div>

                  {selected.attachmentUrl && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Uploaded file</h3>
                      <div className="rounded-2xl border-[2px] border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50 p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Student submission</p>
                            <p className="text-xs text-gray-600">View, download, or preview the document.</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <a
                            href={selected.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-50"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open
                          </a>
                          <a
                            href={selected.attachmentUrl}
                            download
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-50"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                          <button
                            type="button"
                            onClick={() => setShowPdfPreview(!showPdfPreview)}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                          >
                            <Eye className="w-4 h-4" />
                            {showPdfPreview ? 'Hide' : 'Preview'}
                          </button>
                        </div>
                        {showPdfPreview && (
                          <div className="rounded-2xl border-2 border-purple-200 bg-white">
                            <iframe
                              src={`${selected.attachmentUrl}#toolbar=0`}
                              title="PDF Preview"
                              className="w-full h-80 rounded-2xl"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selected.submissionText ? (
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {selected.attachmentUrl ? 'Additional notes' : "Student's answer"}
                      </h3>
                      <div className="mt-2 rounded-2xl border-[2px] border-purple-200 bg-purple-50 p-4 text-sm text-gray-700 max-h-48 overflow-y-auto whitespace-pre-line">
                        {selected.submissionText}
                      </div>
                    </div>
                  ) : !selected.attachmentUrl ? (
                    <div className="rounded-2xl border-[2px] border-dashed border-purple-200 bg-purple-50 p-4 text-sm text-gray-400 text-center">
                      No text submitted.
                    </div>
                  ) : null}

                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {selected.score !== null && selected.score !== undefined ? 'Update grade' : 'Give grade'}
                    </h3>

                    {selected.score !== null && selected.score !== undefined && (
                      <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        <Award className="w-5 h-5 text-green-600" />
                        Current score: {selected.score} / {selected.totalMarks}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-500">Marks *</label>
                        <input
                          type="number"
                          min="0"
                          max={selected.totalMarks}
                          value={marks}
                          onChange={(e) => setMarks(e.target.value)}
                          placeholder={`0 – ${selected.totalMarks}`}
                          className="mt-1 w-full rounded-2xl border-[2px] border-purple-200 bg-white px-3 py-2.5 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                        />
                      </div>
                      <div className="rounded-2xl border-[2px] border-purple-300 bg-purple-50 px-4 py-3 text-center">
                        <p className="text-xs font-semibold text-purple-500">Percentage</p>
                        <p className="text-xl font-bold text-purple-700">
                          {marks && !isNaN(parseFloat(marks))
                            ? `${Math.round((parseFloat(marks) / selected.totalMarks) * 100)}%`
                            : '—'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500">Feedback (optional)</label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={3}
                        placeholder="Share quick praise, guidance, or rework notes…"
                        className="mt-1 w-full rounded-2xl border-[2px] border-purple-200 bg-white px-3 py-2.5 text-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none"
                      />
                    </div>

                    {saveError && (
                      <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        {saveError}
                      </div>
                    )}

                    <button
                      onClick={saveGrade}
                      disabled={saving || !marks}
                      className="w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      {saving ? 'Saving grade…' : selected.score !== null && selected.score !== undefined ? 'Update grade' : 'Submit grade'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center text-gray-500">
                <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Select a submission</h3>
                <p className="text-sm text-gray-500">Pick a card on the left to view the submission, preview files, and add feedback.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Assignment Modal Component
const CreateAssignmentModal = ({
  showModal, setShowModal, newAssignment, handleChange, handleCreate,
  myClasses, subjectOptions, setNewAssignment, uploadingPdf, handlePdfUpload,
  removePdfAttachment, loading, error
}) => (
  <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto border-[2.5px] border-purple-300">
      <div className="px-5 py-4 border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Plus size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Create New Assignment</h2>
            <p className="text-[11px] text-gray-400">Set up a new assignment for your students</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(false)}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="px-5 py-4">
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <p className="text-xs text-red-600 font-medium flex-1">{error}</p>
          </div>
        )}
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Assignment Title *</label>
              <input
                name="title"
                value={newAssignment.title}
                onChange={handleChange}
                type="text"
                placeholder="e.g., Quadratic Equations Problem Set"
                className="w-full px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject *</label>
              {subjectOptions.length > 0 ? (
                <>
                  <select
                    name="subject"
                    value={newAssignment.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjectOptions.map(subject => (
                      <option key={subject.id} value={subject.name}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-gray-400">From your assigned timetable</p>
                </>
              ) : (
                <>
                  <input
                    name="subject"
                    value={newAssignment.subject}
                    onChange={handleChange}
                    type="text"
                    placeholder="e.g., Mathematics"
                    className="w-full px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                    required
                  />
                  <p className="mt-1 text-[11px] text-gray-400">No assigned subjects found</p>
                </>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Class & Section *</label>
              <select
                name="classSection"
                value={newAssignment.classId && newAssignment.sectionId ? `${newAssignment.classId}-${newAssignment.sectionId}` : ''}
                onChange={(e) => {
                  if (!e.target.value) {
                    setNewAssignment(prev => ({ ...prev, classId: "", sectionId: "", subject: "" }));
                    return;
                  }
                  const [classId, sectionId] = e.target.value.split('-');
                  setNewAssignment(prev => ({ ...prev, classId, sectionId, subject: "" }));
                }}
                className="w-full px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
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
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Due Date *</label>
              <input
                name="dueDate"
                value={newAssignment.dueDate}
                onChange={handleChange}
                type="date"
                className="w-full px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total Marks *</label>
              <input
                name="marks"
                value={newAssignment.marks}
                onChange={handleChange}
                type="number"
                min="1"
                placeholder="e.g., 100"
                className="w-full px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Submission Format *</label>
              <select
                name="submissionFormat"
                value={newAssignment.submissionFormat}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                required
              >
                <option value="text">Text Only</option>
                <option value="pdf">PDF Upload</option>
              </select>
              <p className="mt-1 text-[11px] text-gray-400">How students submit this assignment</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
              <select
                name="status"
                value={newAssignment.status}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
              <textarea
                name="description"
                value={newAssignment.description}
                onChange={handleChange}
                rows="3"
                placeholder="Provide detailed instructions for the assignment..."
                className="w-full px-3 py-2 text-sm bg-gray-50 border-[2px] border-purple-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Attachment (PDF)</label>
              <div className="border-2 border-dashed border-purple-300 rounded-xl p-5 hover:border-purple-400 hover:bg-purple-50 transition-colors">
                {uploadingPdf ? (
                  <div className="flex flex-col items-center justify-center">
                    <Loader className="w-6 h-6 text-indigo-500 animate-spin mb-2" />
                    <p className="text-xs text-gray-500">Uploading PDF...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-2">
                      <Upload size={18} className="text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      Drag and drop a PDF file, or click to select
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
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors text-xs font-semibold"
                    >
                      Select PDF
                    </label>
                    <p className="text-[11px] text-gray-400 mt-1.5">Maximum file size: 20MB</p>
                  </div>
                )}
              </div>

              {newAssignment.attachments.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-600">Uploaded Files:</p>
                  {newAssignment.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl"
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-emerald-600" />
                        <span className="text-xs text-emerald-700 font-medium truncate max-w-xs">
                          {attachment.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePdfAttachment(index)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-purple-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-50 border-[2px] border-purple-200 rounded-xl hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-lg disabled:opacity-50 transition-all"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);

// Assignment Detail Modal Component
const AssignmentDetailModal = ({
  selectedAssignment, showDetailModal, setShowDetailModal,
  detailEditMode, setDetailEditMode, detailDraft, handleDetailDraftChange,
  handleUpdateAssignment, detailSaving, openAssignmentDetail,
  myClasses, globalSubjectOptions, getStatusColor, getDifficultyColor,
  formatDate, getAssignmentClassName, getAssignmentSectionName, getSubmissionPercentage
}) => {
  const detailClass = getAssignmentClassName(selectedAssignment) || 'N/A';
  const detailSection = getAssignmentSectionName(selectedAssignment);
  const detailInstructions = detailDraft.description || selectedAssignment.instructions || selectedAssignment.description || 'No instructions provided.';
  const detailType = selectedAssignment.type || 'Assignment';
  const detailDifficulty = selectedAssignment.difficulty || 'Medium';
  const detailAttachments = Array.isArray(selectedAssignment.attachments) ? selectedAssignment.attachments : [];
  const detailTags = Array.isArray(selectedAssignment.tags) ? selectedAssignment.tags : [];
  const detailSubmissions = Number(selectedAssignment.submissions || 0);
  const detailTotalStudents = Number(selectedAssignment.totalStudents || 0);
  const detailAvgScore = Number(selectedAssignment.avgScore || 0);
  const detailSubmissionRate = detailTotalStudents > 0
    ? Math.round((detailSubmissions / detailTotalStudents) * 100)
    : Number(selectedAssignment.submissionRate || 0);
  const detailClassSectionOptions = myClasses || [];
  const detailSubjectOptions = (() => {
    if (!detailDraft.classId || !detailDraft.sectionId) return globalSubjectOptions;
    const matched = detailClassSectionOptions.find(
      (cs) => String(cs.classId) === String(detailDraft.classId) && String(cs.sectionId) === String(detailDraft.sectionId)
    );
    return matched?.subjects?.length ? matched.subjects : globalSubjectOptions;
  })();

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto border-[2.5px] border-purple-300">
        <div className="p-6 border-b border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                {detailEditMode ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={detailDraft.title}
                      onChange={(e) => handleDetailDraftChange('title', e.target.value)}
                      className="w-full rounded-lg border-[2px] border-purple-300 px-3 py-1.5 text-sm font-semibold text-gray-900"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-gray-900">{selectedAssignment.title}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedAssignment.subject || 'Subject'} • Class {detailClass}{detailSection ? ` - ${detailSection}` : ''}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {detailEditMode ? (
                <>
                  <button
                    onClick={handleUpdateAssignment}
                    disabled={detailSaving}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
                  >
                    {detailSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => openAssignmentDetail(selectedAssignment)}
                    className="px-3 py-1.5 rounded-lg border-[2px] border-purple-300 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setDetailEditMode(true)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              )}
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
                {detailEditMode ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select
                        value={detailDraft.classId && detailDraft.sectionId ? `${detailDraft.classId}::${detailDraft.sectionId}` : ''}
                        onChange={(e) => {
                          const [classId, sectionId] = String(e.target.value || '').split('::');
                          handleDetailDraftChange('classId', classId || '');
                          handleDetailDraftChange('sectionId', sectionId || '');
                          handleDetailDraftChange('subject', '');
                        }}
                        className="w-full rounded-lg border-[2px] border-purple-300 px-3 py-2 text-sm text-gray-700"
                      >
                        <option value="">Select Class & Section</option>
                        {detailClassSectionOptions.map((cs) => (
                          <option key={`${cs.classId}-${cs.sectionId}`} value={`${cs.classId}::${cs.sectionId}`}>
                            Class {cs.className} - Section {cs.sectionName}
                          </option>
                        ))}
                      </select>
                      <select
                        value={detailDraft.subject}
                        onChange={(e) => handleDetailDraftChange('subject', e.target.value)}
                        className="w-full rounded-lg border-[2px] border-purple-300 px-3 py-2 text-sm text-gray-700"
                      >
                        <option value="">Select Subject</option>
                        {detailSubjectOptions.map((sub) => (
                          <option key={String(sub.id || sub._id || sub.name)} value={sub.name}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={detailDraft.type}
                        onChange={(e) => handleDetailDraftChange('type', e.target.value)}
                        placeholder="Type"
                        className="w-full rounded-lg border-[2px] border-purple-300 px-3 py-2 text-sm text-gray-700"
                      />
                      <select
                        value={detailDraft.difficulty}
                        onChange={(e) => handleDetailDraftChange('difficulty', e.target.value)}
                        className="w-full rounded-lg border-[2px] border-purple-300 px-3 py-2 text-sm text-gray-700"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    <textarea
                      value={detailDraft.description}
                      onChange={(e) => handleDetailDraftChange('description', e.target.value)}
                      rows={5}
                      className="w-full rounded-lg border-[2px] border-purple-300 px-3 py-2 text-sm text-gray-700"
                    />
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed">{selectedAssignment.description}</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
                <p className="text-gray-700 leading-relaxed">{detailInstructions}</p>
              </div>

              {detailAttachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {detailAttachments.map((attachment, index) => {
                      const label = typeof attachment === 'string' ? attachment : (attachment?.name || attachment?.originalName || `Attachment ${index + 1}`);
                      const link = typeof attachment === 'object' ? attachment?.url : '';
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 border-[2px] border-purple-200 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <span className="text-gray-700 flex-1">{label}</span>
                          {link ? (
                            <a
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">Attached</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {detailTags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {detailTags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Assignment Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    {detailEditMode ? (
                      <select
                        value={detailDraft.status}
                        onChange={(e) => handleDetailDraftChange('status', e.target.value)}
                        className="rounded-lg border-[2px] border-purple-300 px-2 py-1 text-xs"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedAssignment.status)}`}>
                        {selectedAssignment.status.charAt(0).toUpperCase() + selectedAssignment.status.slice(1)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type:</span>
                    <span className="text-gray-900">{detailEditMode ? detailDraft.type : detailType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Difficulty:</span>
                    <span className={getDifficultyColor(detailEditMode ? detailDraft.difficulty : detailDifficulty)}>
                      {detailEditMode ? detailDraft.difficulty : detailDifficulty}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Marks:</span>
                    {detailEditMode ? (
                      <input
                        type="number"
                        min="1"
                        value={detailDraft.marks}
                        onChange={(e) => handleDetailDraftChange('marks', e.target.value)}
                        className="w-24 rounded-lg border-[2px] border-purple-300 px-2 py-1 text-xs text-right"
                      />
                    ) : (
                      <span className="text-gray-900">{selectedAssignment.marks}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Due Date:</span>
                    {detailEditMode ? (
                      <input
                        type="date"
                        value={detailDraft.dueDate}
                        onChange={(e) => handleDetailDraftChange('dueDate', e.target.value)}
                        className="rounded-lg border-[2px] border-purple-300 px-2 py-1 text-xs"
                      />
                    ) : (
                      <span className="text-gray-900">{formatDate(selectedAssignment.dueDate)}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Submission:</span>
                    {detailEditMode ? (
                      <select
                        value={detailDraft.submissionFormat}
                        onChange={(e) => handleDetailDraftChange('submissionFormat', e.target.value)}
                        className="rounded-lg border-[2px] border-purple-300 px-2 py-1 text-xs"
                      >
                        <option value="text">Text</option>
                        <option value="pdf">PDF</option>
                      </select>
                    ) : (
                      <span className="text-gray-900">{selectedAssignment.submissionFormat === 'pdf' ? 'PDF' : 'Text'}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-900">{formatDate(selectedAssignment.createdDate || selectedAssignment.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Submission Stats</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Submissions</span>
                      <span className="text-gray-900">{detailSubmissions}/{detailTotalStudents}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getSubmissionPercentage(detailSubmissions, detailTotalStudents)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {getSubmissionPercentage(detailSubmissions, detailTotalStudents)}% completion rate
                    </p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Submitted Rate:</span>
                    <span className="text-gray-900">{detailSubmissionRate}%</span>
                  </div>
                  {detailAvgScore > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Average Score:</span>
                      <span className="text-gray-900">{detailAvgScore.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentPortal;
