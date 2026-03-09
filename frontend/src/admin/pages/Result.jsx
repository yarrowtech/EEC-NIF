import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Download, FileSpreadsheet, Plus, Send, Upload, X,
  BookOpen, Edit2, Trash2, Clock, MapPin, User, Calendar,
  RefreshCw, ChevronRight, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { getStoredAdminScope } from '../utils/adminScope';

const API_BASE = import.meta.env.VITE_API_URL;

const Result = ({ setShowAdminHeader }) => {
  useEffect(() => {
    setShowAdminHeader?.(true);
  }, [setShowAdminHeader]);

  // Data states
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  // UI states
  const activeTab = 'results';
  const [loading, setLoading] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [examSearchTerm, setExamSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('all');

  // Modal states
  const [showAddResultModal, setShowAddResultModal] = useState(false);
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [showEditExamModal, setShowEditExamModal] = useState(false);
  const [showEditResultModal, setShowEditResultModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  // Form states
  const emptyResultForm = { examId: '', studentId: '', marks: '', grade: '', remarks: '', status: 'pass' };
  const emptyExamForm = { title: '', subject: '', term: 'Term 1', date: '', time: '', duration: '', marks: '100', instructor: '', venue: '' };

  const [resultForm, setResultForm] = useState(emptyResultForm);
  const [examForm, setExamForm] = useState(emptyExamForm);
  const [editExamForm, setEditExamForm] = useState(emptyExamForm);
  const [editResultForm, setEditResultForm] = useState(emptyResultForm);
  const [editingExamId, setEditingExamId] = useState(null);
  const [editingResultId, setEditingResultId] = useState(null);
  const [csvFile, setCSVFile] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchResults();
    fetchClassesAndSections();
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedClass) fetchStudentsByClass();
  }, [selectedClass, selectedSection]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/exam/results/admin`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch results');
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load results');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesAndSections = async () => {
    try {
      const [classesRes, sectionsRes] = await Promise.all([
        fetch(`${API_BASE}/api/academic/classes`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch(`${API_BASE}/api/academic/sections`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      ]);
      if (classesRes.ok) setClasses(Array.isArray(await classesRes.json()) ? await classesRes.json() : []);
      if (sectionsRes.ok) setSections(Array.isArray(await sectionsRes.json()) ? await sectionsRes.json() : []);
    } catch (error) {
      console.error('Error fetching classes/sections:', error);
    }
  };

  const fetchExams = async () => {
    setLoadingExams(true);
    try {
      const response = await fetch(`${API_BASE}/api/exam/fetch`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setExams(Array.isArray(data) ? data : []);
      } else {
        toast.error('Failed to fetch exams');
        setExams([]);
      }
    } catch (error) {
      toast.error('Error fetching exams');
      setExams([]);
    } finally {
      setLoadingExams(false);
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

  const fetchStudentsByClass = async (forceAll = false) => {
    setLoadingStudents(true);
    try {
      const { schoolId } = getStoredAdminScope();
      const url = new URL(`${API_BASE}/api/admin/users/get-students`);
      if (schoolId) url.searchParams.set('schoolId', schoolId);

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Failed to fetch students: ${response.status}`);

      const data = await response.json();
      const allStudents = Array.isArray(data) ? data : [];

      let filtered = allStudents;
      if (!forceAll && selectedClass) {
        const normalizedClass = normalizeClassValue(selectedClass);
        const normalizedSection = normalizeSectionValue(selectedSection);
        filtered = allStudents.filter(s => {
          const gradeMatch = normalizeClassValue(s.grade || s.class || '') === normalizedClass;
          const sectionMatch = selectedSection ? normalizeSectionValue(s.section || '') === normalizedSection : true;
          return gradeMatch && sectionMatch;
        });
      }

      const uniqueMap = new Map();
      const seenCombos = new Set();
      filtered.forEach(student => {
        const id = student._id?.toString() || student.id?.toString();
        const comboKey = `${student.name?.toLowerCase()}-${student.roll}-${student.grade?.toLowerCase()}`;
        if (id && !seenCombos.has(comboKey)) {
          uniqueMap.set(id, student);
          seenCombos.add(comboKey);
        }
      });
      setStudents(Array.from(uniqueMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || '')));
    } catch (error) {
      toast.error(error.message || 'Failed to fetch students');
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // ── Publish handlers ──────────────────────────────────────────────────────────

  const handlePublishResults = async () => {
    if (!selectedClass) { toast.error('Please select a class first'); return; }
    const confirm = await Swal.fire({
      title: 'Publish Results?',
      html: `<p>Publish results for <strong>Class ${selectedClass}</strong>${selectedSection ? ` – ${selectedSection}` : ''}?</p><p class="text-sm text-gray-500 mt-2">Students and parents will be notified.</p>`,
      icon: 'question', showCancelButton: true,
      confirmButtonColor: '#2563eb', cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Publish!',
    });
    if (!confirm.isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE}/api/exam/results/publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: selectedClass, section: selectedSection || undefined })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      Swal.fire({ title: 'Published!', html: `<p>Results published successfully.</p><p class="text-sm mt-2"><strong>Students notified:</strong> ${data.studentsNotified || 0}</p>`, icon: 'success' });
    } catch { Swal.fire('Error!', 'Failed to publish results.', 'error'); }
  };

  const handleTogglePublish = async (resultId, shouldPublish) => {
    try {
      const res = await fetch(`${API_BASE}/api/exam/results/${resultId}/publish`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: shouldPublish })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(data.message || `Result ${shouldPublish ? 'published' : 'unpublished'}`);
      fetchResults();
    } catch { toast.error('Failed to update publish status'); }
  };

  // ── Add handlers ──────────────────────────────────────────────────────────────

  const handleAddResult = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/exam/results`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(resultForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add result');
      toast.success('Result added successfully');
      setShowAddResultModal(false);
      setResultForm(emptyResultForm);
      fetchResults();
    } catch (error) { toast.error(error.message || 'Failed to add result'); }
  };

  const handleAddExam = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/exam/add`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(examForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to add exam');
      toast.success('Exam created successfully');
      setShowAddExamModal(false);
      setExamForm(emptyExamForm);
      fetchExams();
    } catch (error) { toast.error(error.message || 'Failed to create exam'); }
  };

  // ── Edit handlers ─────────────────────────────────────────────────────────────

  const openEditExam = (exam) => {
    setEditingExamId(exam._id);
    setEditExamForm({
      title: exam.title || '',
      subject: exam.subject || '',
      term: exam.term || 'Term 1',
      date: exam.date ? exam.date.split('T')[0] : '',
      time: exam.time || '',
      duration: exam.duration || '',
      marks: exam.marks || '100',
      instructor: exam.instructor || '',
      venue: exam.venue || '',
    });
    setShowEditExamModal(true);
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/exam/${editingExamId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editExamForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update exam');
      toast.success('Exam updated successfully');
      setShowEditExamModal(false);
      setEditingExamId(null);
      fetchExams();
    } catch (error) { toast.error(error.message || 'Failed to update exam'); }
  };

  const openEditResult = async (result) => {
    setEditingResultId(result._id);
    setEditResultForm({
      examId: result.examId?._id || result.examId || '',
      studentId: result.studentId?._id || result.studentId || '',
      marks: result.marks || '',
      grade: result.grade || '',
      remarks: result.remarks || '',
      status: result.status || 'pass',
    });
    await Promise.all([fetchExams(), fetchStudentsByClass(true)]);
    setShowEditResultModal(true);
  };

  const handleUpdateResult = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/exam/results/${editingResultId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editResultForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update result');
      toast.success('Result updated successfully');
      setShowEditResultModal(false);
      setEditingResultId(null);
      fetchResults();
    } catch (error) { toast.error(error.message || 'Failed to update result'); }
  };

  // ── Delete handlers ───────────────────────────────────────────────────────────

  const handleDeleteExam = async (exam) => {
    const confirm = await Swal.fire({
      title: 'Delete Exam?',
      html: `<p>Are you sure you want to delete <strong>${exam.title}</strong>?</p><p class="text-sm text-red-500 mt-2">This may also remove associated results.</p>`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete', cancelButtonText: 'Cancel',
    });
    if (!confirm.isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE}/api/exam/${exam._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error();
      toast.success('Exam deleted successfully');
      fetchExams();
    } catch { toast.error('Failed to delete exam'); }
  };

  const handleDeleteResult = async (result) => {
    const confirm = await Swal.fire({
      title: 'Delete Result?',
      html: `<p>Delete result for <strong>${result.studentId?.name || 'this student'}</strong>?</p>`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete',
    });
    if (!confirm.isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE}/api/exam/results/${result._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error();
      toast.success('Result deleted successfully');
      fetchResults();
    } catch { toast.error('Failed to delete result'); }
  };

  // ── Bulk upload ───────────────────────────────────────────────────────────────

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) { toast.error('Please select a CSV file'); return; }
    const formData = new FormData();
    formData.append('file', csvFile);
    try {
      const res = await fetch(`${API_BASE}/api/exam/results/bulk-upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      Swal.fire({
        title: 'Upload Complete!',
        html: `<p><strong>Uploaded:</strong> ${data.count || 0} results</p>${data.errors?.length ? `<p class="text-xs text-red-500 mt-2">${data.errors.slice(0, 3).join('<br/>')}</p>` : ''}`,
        icon: data.errors?.length ? 'warning' : 'success'
      });
      setShowBulkUploadModal(false);
      setCSVFile(null);
      fetchResults();
    } catch { toast.error('Failed to upload CSV'); }
  };

  const downloadCSVTemplate = () => {
    const blob = new Blob(['examId,studentId,marks,grade,remarks,status\n'], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'results_template.csv'; a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    if (filteredResults.length === 0) { toast.error('No results to export'); return; }
    const headers = ['Student Name', 'Roll', 'Class', 'Section', 'Exam', 'Subject', 'Marks', 'Grade', 'Status'];
    const rows = filteredResults.map(r => [
      r.studentId?.name || 'N/A', r.studentId?.roll || 'N/A', r.studentId?.grade || 'N/A',
      r.studentId?.section || 'N/A', r.examId?.title || 'N/A', r.examId?.subject || 'N/A',
      r.marks || 0, r.grade || 'N/A', r.status || 'N/A',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `results_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Results exported successfully');
  };

  // ── Computed values ───────────────────────────────────────────────────────────

  const uniqueSubjects = [...new Set(results.map(r => r.examId?.subject).filter(Boolean))];

  const filteredResults = results.filter(result => {
    const studentName = result.studentId?.name?.toLowerCase() || '';
    const subject = result.examId?.subject?.toLowerCase() || '';
    const grade = result.studentId?.grade || '';
    const section = result.studentId?.section || '';
    const matchesSearch = studentName.includes(searchTerm.toLowerCase()) || subject.includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass ? grade === selectedClass : true;
    const matchesSection = selectedSection ? section === selectedSection : true;
    const matchesSubject = filterSubject === 'all' || result.examId?.subject === filterSubject;
    return matchesSearch && matchesClass && matchesSection && matchesSubject;
  });

  const filteredExams = exams.filter(exam => {
    const term = exam.term || '';
    const title = exam.title?.toLowerCase() || '';
    const subject = exam.subject?.toLowerCase() || '';
    const matchesTerm = selectedTerm === 'all' || term === selectedTerm;
    const matchesSearch = title.includes(examSearchTerm.toLowerCase()) || subject.includes(examSearchTerm.toLowerCase());
    return matchesTerm && matchesSearch;
  });

  const stats = {
    total: filteredResults.length,
    pass: filteredResults.filter(r => r.status?.toLowerCase() === 'pass').length,
    fail: filteredResults.filter(r => r.status?.toLowerCase() === 'fail').length,
    absent: filteredResults.filter(r => r.status?.toLowerCase() === 'absent').length,
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pass': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'fail': return 'bg-red-100 text-red-700 border border-red-200';
      case 'absent': return 'bg-slate-100 text-slate-600 border border-slate-200';
      default: return 'bg-blue-100 text-blue-700 border border-blue-200';
    }
  };

  const getTermColor = (term) => {
    switch (term) {
      case 'Term 1': return 'bg-blue-100 text-blue-700';
      case 'Term 2': return 'bg-violet-100 text-violet-700';
      case 'Term 3': return 'bg-orange-100 text-orange-700';
      case 'Final': return 'bg-rose-100 text-rose-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // ── Shared form fields ────────────────────────────────────────────────────────

  const ExamFormFields = ({ form, setForm }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Exam Title *</label>
          <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Mid Term Examination"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
          <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required placeholder="Mathematics"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Term *</label>
          <select value={form.term} onChange={e => setForm({ ...form, term: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            {['Term 1', 'Term 2', 'Term 3', 'Final'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Time</label>
          <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (min)</label>
          <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="120" min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Marks</label>
          <input type="number" value={form.marks} onChange={e => setForm({ ...form, marks: e.target.value })} min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Instructor</label>
          <input type="text" value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} placeholder="Prof. Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Venue</label>
          <input type="text" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Hall A"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>
    </div>
  );

  const ResultFormFields = ({ form, setForm }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Exam *</label>
        <select value={form.examId} onChange={e => setForm({ ...form, examId: e.target.value })} required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="">Choose an exam</option>
          {exams.map(exam => (
            <option key={exam._id} value={exam._id}>{exam.title} – {exam.subject} ({exam.term})</option>
          ))}
        </select>
        {exams.length === 0 && (
          <p className="text-xs text-blue-600 mt-1">No exams found. Please create exams from Exam Management.</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Student *</label>
        <select value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} required disabled={loadingStudents}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100">
          <option value="">{loadingStudents ? 'Loading...' : students.length === 0 ? 'No students' : 'Choose a student'}</option>
          {students.map(s => (
            <option key={s._id} value={s._id}>{s.name} – Roll: {s.roll || 'N/A'} ({s.grade || '?'} {s.section || ''})</option>
          ))}
        </select>
        {!loadingStudents && students.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">{students.length} student{students.length !== 1 ? 's' : ''} available</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Marks *</label>
          <input type="number" value={form.marks} onChange={e => setForm({ ...form, marks: e.target.value })} required min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Grade</label>
          <input type="text" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} placeholder="A, B, C…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Status *</label>
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="pass">Pass</option>
          <option value="fail">Fail</option>
          <option value="absent">Absent</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Remarks</label>
        <textarea value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} rows="2"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
      </div>
    </div>
  );

  // ── Modal wrapper ─────────────────────────────────────────────────────────────

  const Modal = ({ show, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Result Management</h1>
              <p className="text-sm text-gray-500 mt-0.5">Record marks and publish student results linked to admin-created exams</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { fetchResults(); fetchExams(); }} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              <button onClick={() => { window.location.href = '/admin/examination'; }} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                <BookOpen className="w-4 h-4" /> Exam Management
              </button>
              <button
                onClick={async () => { await Promise.all([fetchExams(), fetchStudentsByClass(true)]); setShowAddResultModal(true); }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" /> Add Result
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* ═══ RESULTS TAB ════════════════════════════════════════════════════ */}
        {activeTab === 'results' && (
          <>
            {/* Filters Row */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Classes</option>
                    {classes.map(cls => <option key={cls._id} value={cls.name}>{cls.name}</option>)}
                  </select>
                  <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Sections</option>
                    {sections.map(sec => <option key={sec._id} value={sec.name}>{sec.name}</option>)}
                  </select>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
                      className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none">
                      <option value="all">All Subjects</option>
                      {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" placeholder="Search student or subject…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-56" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowBulkUploadModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
                    <Upload className="w-4 h-4" /> Bulk Upload
                  </button>
                  <button onClick={exportToCSV}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
                    <Download className="w-4 h-4" /> Export
                  </button>
                  <button onClick={handlePublishResults} disabled={!selectedClass}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors font-medium ${selectedClass ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                    <Send className="w-4 h-4" /> Publish
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Results', value: stats.total, color: 'bg-blue-50 border-blue-100', textColor: 'text-blue-700', icon: FileSpreadsheet },
                { label: 'Passed', value: stats.pass, color: 'bg-emerald-50 border-emerald-100', textColor: 'text-emerald-700', icon: CheckCircle },
                { label: 'Failed', value: stats.fail, color: 'bg-red-50 border-red-100', textColor: 'text-red-700', icon: XCircle },
                { label: 'Absent', value: stats.absent, color: 'bg-slate-50 border-slate-100', textColor: 'text-slate-600', icon: AlertCircle },
              ].map(card => (
                <div key={card.label} className={`rounded-xl border p-4 ${card.color}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
                      <p className={`text-2xl font-bold mt-1 ${card.textColor}`}>{card.value}</p>
                    </div>
                    <card.icon className={`w-8 h-8 ${card.textColor} opacity-70`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
                  <p className="text-sm text-gray-500">Loading results…</p>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <FileSpreadsheet className="w-12 h-12 text-gray-300" />
                  <p className="text-gray-500 font-medium">No results found</p>
                  <p className="text-sm text-gray-400">Try adjusting your filters or add results</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {['Student', 'Exam', 'Marks', 'Grade', 'Status', 'Published', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredResults.map((result, i) => (
                        <tr key={result._id || i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-medium text-sm text-gray-900">{result.studentId?.name || 'N/A'}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Roll {result.studentId?.roll || '—'} · Class {result.studentId?.grade || '—'} {result.studentId?.section || ''}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-medium text-sm text-gray-900">{result.examId?.title || 'N/A'}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{result.examId?.subject || '—'}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-bold text-gray-900">{result.marks ?? '—'}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-semibold text-gray-700">{result.grade || '—'}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                              {result.status || 'N/A'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${result.published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {result.published ? '● Published' : '○ Draft'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleTogglePublish(result._id, !result.published)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${result.published ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                              >
                                {result.published ? 'Unpublish' : 'Publish'}
                              </button>
                              <button
                                onClick={() => openEditResult(result)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit result"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteResult(result)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete result"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══ EXAMS TAB ══════════════════════════════════════════════════════ */}
        {activeTab === 'exams' && (
          <>
            {/* Exam Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" placeholder="Search exams…" value={examSearchTerm} onChange={e => setExamSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-52" />
                  </div>
                  <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">All Terms</option>
                    {['Class Test', 'Unit Test', 'Monthly Test', 'Term 1', 'Term 2', 'Term 3', 'Half Yearly', 'Annual', 'Final'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <p className="text-sm text-gray-500">{filteredExams.length} exam{filteredExams.length !== 1 ? 's' : ''} found</p>
              </div>
            </div>

            {/* Exams Grid */}
            {loadingExams ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
                <p className="text-sm text-gray-500">Loading exams…</p>
              </div>
            ) : filteredExams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center bg-white rounded-xl border border-gray-200">
                <BookOpen className="w-12 h-12 text-gray-300" />
                <p className="text-gray-500 font-medium">No exams found</p>
                <p className="text-sm text-gray-400">Create your first exam to get started</p>
                <button onClick={() => setShowAddExamModal(true)}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                  <Plus className="w-4 h-4" /> Create Exam
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExams.map(exam => (
                  <div key={exam._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">{exam.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{exam.subject}</p>
                      </div>
                      <span className={`ml-2 shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${getTermColor(exam.term)}`}>
                        {exam.term}
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      {exam.date && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>{new Date(exam.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          {exam.time && <span className="text-gray-400">· {exam.time}</span>}
                        </div>
                      )}
                      {exam.duration && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{exam.duration} min</span>
                          {exam.marks && <span className="text-gray-400">· Max {exam.marks} marks</span>}
                        </div>
                      )}
                      {exam.venue && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{exam.venue}</span>
                        </div>
                      )}
                      {exam.instructor && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <User className="w-3.5 h-3.5 shrink-0" />
                          <span>{exam.instructor}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => openEditExam(exam)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                      <button
                        onClick={async () => { await Promise.all([fetchExams(), fetchStudentsByClass(true)]); setResultForm({ ...emptyResultForm, examId: exam._id }); setShowAddResultModal(true); }}
                        className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Add Result <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══ MODALS ══════════════════════════════════════════════════════════ */}

      {/* Add Result */}
      <Modal show={showAddResultModal} onClose={() => setShowAddResultModal(false)} title="Add Result">
        <form onSubmit={handleAddResult} className="space-y-4">
          <ResultFormFields form={resultForm} setForm={setResultForm} />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAddResultModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Add Result</button>
          </div>
        </form>
      </Modal>

      {/* Edit Result */}
      <Modal show={showEditResultModal} onClose={() => setShowEditResultModal(false)} title="Edit Result">
        <form onSubmit={handleUpdateResult} className="space-y-4">
          <ResultFormFields form={editResultForm} setForm={setEditResultForm} />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowEditResultModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* Add Exam */}
      <Modal show={showAddExamModal} onClose={() => setShowAddExamModal(false)} title="Create New Exam">
        <form onSubmit={handleAddExam} className="space-y-4">
          <ExamFormFields form={examForm} setForm={setExamForm} />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAddExamModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">Create Exam</button>
          </div>
        </form>
      </Modal>

      {/* Edit Exam */}
      <Modal show={showEditExamModal} onClose={() => setShowEditExamModal(false)} title="Edit Exam">
        <form onSubmit={handleUpdateExam} className="space-y-4">
          <ExamFormFields form={editExamForm} setForm={setEditExamForm} />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowEditExamModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* Bulk Upload */}
      <Modal show={showBulkUploadModal} onClose={() => setShowBulkUploadModal(false)} title="Bulk Upload Results (CSV)" maxWidth="max-w-lg">
        <form onSubmit={handleBulkUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload CSV File *</label>
            <input type="file" accept=".csv" onChange={e => setCSVFile(e.target.files[0])} required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs text-gray-400 mt-1">Required columns: examId, studentId, marks, grade, remarks, status</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs text-blue-700 mb-1.5 font-medium">Need a template?</p>
            <button type="button" onClick={downloadCSVTemplate} className="text-xs text-blue-600 underline hover:text-blue-800">Download CSV Template</button>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowBulkUploadModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">Upload</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Result;
