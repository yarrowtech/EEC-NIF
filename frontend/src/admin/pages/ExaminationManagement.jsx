import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { Plus, Edit, Trash2, Calendar, Clock, Users, Search, Filter, X, ClipboardList, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';

const ExaminationManagement = ({setShowAdminHeader}) => {

  // making the admin header invisible
    useEffect(() => {
      setShowAdminHeader(false)
    }, [])


  const [examinations, setExaminations] = useState([]);

  // Local-only setup/supervision data keyed by exam id
  const [setupDataMap, setSetupDataMap] = useState({});
  const [supervisionDataMap, setSupervisionDataMap] = useState({});
  const [selectedSetupExamId, setSelectedSetupExamId] = useState('');
  const [selectedSupervisionExamId, setSelectedSupervisionExamId] = useState('');

  // reference data (demo)
  const roomOptions = ['Hall A', 'Hall B', 'Hall C', 'Lab 1', 'Lab 2'];
  const teacherOptions = [
    'Prof. Priya Verma', 'Dr. Arjun Sen', 'Ms. Kavita Rao', 'Mr. Amit Shah', 'Mrs. N. Iyer'
  ];

  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    duration: '',
    marks: '',
    venue: '',
    instructor: '',
    noOfStudents: '',
    status: 'scheduled'
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/exam/fetch`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${localStorage.getItem('token')}`
      },
    }).then(res => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    }).then(data => {
      let list = Array.isArray(data) ? data : [];
      // Seed more demo data if API is empty or sparse
      if ((list?.length || 0) < 5) {
        const samples = [
          { id: 'sample-1', title: 'Mid Term', subject: 'Mathematics', date: '2025-09-12', time: '10:00', duration: 120, marks: 100, venue: 'Hall A', instructor: 'Dr. Arjun Sen', noOfStudents: 60, status: 'scheduled' },
          { id: 'sample-2', title: 'Unit Test', subject: 'Physics', date: '2025-09-15', time: '13:00', duration: 60, marks: 50, venue: 'Hall B', instructor: 'Prof. Priya Verma', noOfStudents: 45, status: 'scheduled' },
          { id: 'sample-3', title: 'Practical', subject: 'Chemistry', date: '2025-09-18', time: '09:00', duration: 90, marks: 40, venue: 'Lab 1', instructor: 'Ms. Kavita Rao', noOfStudents: 30, status: 'ongoing' },
          { id: 'sample-4', title: 'Final', subject: 'English', date: '2025-10-01', time: '11:00', duration: 120, marks: 100, venue: 'Hall C', instructor: 'Mr. Amit Shah', noOfStudents: 80, status: 'scheduled' },
          { id: 'sample-5', title: 'Oral', subject: 'Biology', date: '2025-09-20', time: '12:30', duration: 45, marks: 25, venue: 'Hall A', instructor: 'Mrs. N. Iyer', noOfStudents: 35, status: 'completed' },
        ];
        list = [...list, ...samples];
      }
      setExaminations(list);
    }).catch(error => {
      console.error('Error fetching examinations:', error);
    });
  }, [])



  // Filter examinations based on search and status
  // const filteredExaminations = examinations.filter(exam => {
  //   const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //                        exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //                        exam.instructor.toLowerCase().includes(searchTerm.toLowerCase());
  //   const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
  //   return matchesSearch && matchesStatus;
  // });

  const [filteredExaminations, setFilteredExaminations] = useState(examinations);

  useEffect(() => {
    setFilteredExaminations(examinations)
  }, [examinations])

  useEffect(() => {
    setFilteredExaminations(examinations.filter(exam => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            exam.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
      return matchesSearch && matchesStatus;
    }))
  }, [searchTerm, filterStatus]);

  const resetForm = () => {
    setFormData({
      title: '',
      subject: '',
      date: '',
      time: '',
      endDate: '',
      endTime: '',
      duration: '',
      marks: '',
      venue: '',
      instructor: '',
      noOfStudents: '',
      status: 'scheduled'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/exam/add`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await res.json();
      console.log(data)
      setShowModal(false);
      setEditingExam(null);
      resetForm();
    } catch(err) {
      console.log('Error submitting form:', err);
    }
    
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title || '',
      subject: exam.subject || '',
      date: exam.date || '',
      time: exam.time || '',
      endDate: exam.endDate || '',
      endTime: exam.endTime || '',
      duration: String(exam.duration ?? ''),
      marks: String(exam.marks ?? ''),
      venue: exam.venue || '',
      instructor: exam.instructor || '',
      noOfStudents: String(exam.noOfStudents ?? ''),
      status: exam.status || 'scheduled'
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this examination?')) {
      // Optimistic local removal; hook to backend delete if available
      setExaminations(prev => prev.filter(exam => exam.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Exam Setup local form state
  const [setupForm, setSetupForm] = useState({
    type: 'Written',
    grade: '',
    section: '',
    passMarks: '',
    instructions: '',
    rooms: [],
    seatingPlan: 'Row'
  });

  // Supervision local form state
  const [supervisionForm, setSupervisionForm] = useState({
    invigilators: [],
    reportingTime: '00:30',
    reliefInterval: '01:00',
    qrAttendance: true,
    notes: ''
  });

  const saveExamSetup = () => {
    if (!selectedSetupExamId) return;
    setSetupDataMap(prev => ({ ...prev, [selectedSetupExamId]: setupForm }));
  };

  const saveSupervision = () => {
    if (!selectedSupervisionExamId) return;
    setSupervisionDataMap(prev => ({ ...prev, [selectedSupervisionExamId]: supervisionForm }));
  };

  // Printing utilities
  const seatPlanRef = useRef(null);
  const rosterRef = useRef(null);
  const printSection = (ref, title = 'Print') => {
    if (!ref?.current) return;
    const content = ref.current.innerHTML;
    const css = `
      <style>
        @media print {
          body { margin: 16px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'; }
          .print-table { width: 100%; border-collapse: collapse; }
          .print-table td, .print-table th { border: 1px solid #000; padding: 6px; text-align: center; }
          .print-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
          .print-section { page-break-inside: avoid; }
          .title { font-size: 18px; font-weight: 700; margin: 0 0 8px; }
          .subtitle { font-size: 14px; margin: 0 0 6px; }
        }
      </style>
    `;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>${css}</head><body>${content}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  // Derived selections
  const selectedSetupExam = examinations.find(ex => ex.id === selectedSetupExamId);
  const selectedSupervisionExam = examinations.find(ex => ex.id === selectedSupervisionExamId);

  // Seat plan generation
  const generateSeatPlan = (exam, setup) => {
    if (!exam || !setup?.rooms?.length) return [];
    const total = Number(exam.noOfStudents || 0);
    if (!total) return [];
    const rooms = setup.rooms;
    const columns = Math.max(1, Number(setup.columns || 6));
    const result = [];
    let nextSeat = 1;
    const perRoomBase = Math.floor(total / rooms.length);
    let remainder = total % rooms.length;
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      const count = perRoomBase + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder -= 1;
      const rows = Math.ceil(count / columns) || 1;
      const grid = [];
      for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < columns; c++) {
          if (nextSeat <= total && row.length + (r * columns) < count) {
            row.push(nextSeat);
            nextSeat += 1;
          } else {
            row.push('');
          }
        }
        grid.push(row);
      }
      result.push({ room, grid });
    }
    return result;
  };

  // PDF: helper to add a standard header
  const addPdfHeader = (doc, mainTitle, lines = []) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 40;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(mainTitle, pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    lines.forEach((ln) => {
      y += 14;
      doc.text(String(ln), pageWidth / 2, y, { align: 'center' });
    });
    return y + 20; // return next Y after header block
  };

  // PDF: helper to add footer with page x of y
  const addPdfFooters = (doc) => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(9);
      doc.setTextColor(100);
      const footerLeft = `Generated by EEC • ${new Date().toLocaleDateString()}`;
      const footerRight = `Page ${i} of ${pageCount}`;
      doc.text(footerLeft, 40, pageHeight - 24);
      doc.text(footerRight, pageWidth - 40, pageHeight - 24, { align: 'right' });
    }
  };

  // Export: Seat Plan -> PDF
  const exportSeatPlanPDF = () => {
    if (!selectedSetupExam || !(setupForm.rooms?.length)) return;
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;

    let y = addPdfHeader(doc, 'Seat Plan', [
      `${selectedSetupExam.title} — ${selectedSetupExam.subject}`,
      `${formatDate(selectedSetupExam.date)} at ${selectedSetupExam.time}` +
        `${(selectedSetupExam.endDate || selectedSetupExam.endTime) ? ` — ${formatDate(selectedSetupExam.endDate || selectedSetupExam.date)} ${selectedSetupExam.endTime || ''}` : ''}` +
        ` • Duration ${selectedSetupExam.duration} mins`,
      `Seating: ${setupForm.seatingPlan} • Columns: ${setupForm.columns || 6} • Students: ${selectedSetupExam.noOfStudents}`
    ]);

    const plans = generateSeatPlan(selectedSetupExam, setupForm);
    const columns = Math.max(1, Number(setupForm.columns || 6));
    const usableWidth = pageWidth - margin * 2;
    const cellW = Math.floor(usableWidth / columns);
    const cellH = 22;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);

    plans.forEach(({ room, grid }) => {
      const sectionNeededHeight = 20 + grid.length * cellH + 16; // title + grid + spacing
      if (y + sectionNeededHeight > pageHeight - margin) {
        doc.addPage();
        y = addPdfHeader(doc, 'Seat Plan', [
          `${selectedSetupExam.title} — ${selectedSetupExam.subject}`,
          `${formatDate(selectedSetupExam.date)} at ${selectedSetupExam.time}` +
            `${(selectedSetupExam.endDate || selectedSetupExam.endTime) ? ` — ${formatDate(selectedSetupExam.endDate || selectedSetupExam.date)} ${selectedSetupExam.endTime || ''}` : ''}` +
            ` • Duration ${selectedSetupExam.duration} mins`
        ]);
      }
      doc.text(`Room: ${room} (Seats: ${grid.flat().filter(Boolean).length})`, margin, y);
      y += 8;
      doc.setDrawColor(0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      grid.forEach((row) => {
        let x = margin;
        row.forEach((seat) => {
          doc.rect(x, y, cellW, cellH);
          if (seat) {
            doc.text(String(seat), x + cellW / 2, y + cellH / 2 + 3, { align: 'center' });
          }
          x += cellW;
        });
        y += cellH;
      });
      y += 16;
    });

    addPdfFooters(doc);
    doc.save(`Seat_Plan_${selectedSetupExam.subject}_${selectedSetupExam.date}.pdf`);
  };

  // Export: Duty Roster -> PDF
  const exportRosterPDF = () => {
    if (!selectedSupervisionExam) return;
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    let y = addPdfHeader(doc, 'Duty Roster', [
      `${selectedSupervisionExam.title} — ${selectedSupervisionExam.subject}`,
      `${formatDate(selectedSupervisionExam.date)} at ${selectedSupervisionExam.time}` +
        `${(selectedSupervisionExam.endDate || selectedSupervisionExam.endTime) ? ` — ${formatDate(selectedSupervisionExam.endDate || selectedSupervisionExam.date)} ${selectedSupervisionExam.endTime || ''}` : ''}` +
        ` • Duration ${selectedSupervisionExam.duration} mins`,
      `Reporting: ${supervisionForm.reportingTime || '—'} • Relief: ${supervisionForm.reliefInterval || '—'}`
    ]);

    // Table header
    const colRoomW = 200;
    const colInvW = pageWidth - margin * 2 - colRoomW;
    const rowH = 22;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.rect(margin, y, colRoomW, rowH, 'S');
    doc.rect(margin + colRoomW, y, colInvW, rowH, 'S');
    doc.text('Room', margin + 8, y + 15);
    doc.text('Invigilator', margin + colRoomW + 8, y + 15);
    y += rowH;

    // Rows
    const rooms = setupForm.rooms || [];
    const invigilators = supervisionForm.invigilators || [];
    rooms.forEach((room, idx) => {
      if (y + rowH > pageHeight - margin) {
        doc.addPage();
        y = addPdfHeader(doc, 'Duty Roster', [
          `${selectedSupervisionExam.title} — ${selectedSupervisionExam.subject}`
        ]);
        // repeat header row
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.rect(margin, y, colRoomW, rowH, 'S');
        doc.rect(margin + colRoomW, y, colInvW, rowH, 'S');
        doc.text('Room', margin + 8, y + 15);
        doc.text('Invigilator', margin + colRoomW + 8, y + 15);
        y += rowH;
      }
      const invigilator = invigilators.length ? invigilators[idx % invigilators.length] : '';
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.rect(margin, y, colRoomW, rowH, 'S');
      doc.rect(margin + colRoomW, y, colInvW, rowH, 'S');
      doc.text(String(room), margin + 8, y + 15);
      doc.text(invigilator || '—', margin + colRoomW + 8, y + 15);
      y += rowH;
    });

    if (supervisionForm.notes) {
      if (y + 40 > pageHeight - margin) {
        doc.addPage();
        y = addPdfHeader(doc, 'Duty Roster', [
          `${selectedSupervisionExam.title} — ${selectedSupervisionExam.subject}`
        ]);
      }
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', margin, y + 20);
      doc.setFont('helvetica', 'normal');
      const text = doc.splitTextToSize(String(supervisionForm.notes), pageWidth - margin * 2);
      doc.text(text, margin, y + 36);
    }

    addPdfFooters(doc);
    doc.save(`Duty_Roster_${selectedSupervisionExam.subject}_${selectedSupervisionExam.date}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Examination Management</h1>
          <p className="text-gray-600">Manage and organize all examinations efficiently</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search examinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingExam(null);
                setShowModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Examination
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900">{examinations.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {examinations.filter(exam => exam.status === 'scheduled').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {examinations.filter(exam => exam.status === 'completed').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {examinations.reduce((sum, exam) => sum + exam.noOfStudents, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Examinations Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Examination Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Setup/Supervision
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
                {filteredExaminations.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                        <div className="text-sm text-gray-500">{exam.subject}</div>
                        <div className="text-sm text-gray-500">Instructor: {exam.instructor}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(exam.date)}{(exam.endDate && exam.endDate !== exam.date) && ` — ${formatDate(exam.endDate)}`}</div>
                      <div className="text-sm text-gray-500">{exam.time}{exam.endTime && ` — ${exam.endTime}`}</div>
                      <div className="text-sm text-gray-500">{exam.duration} minutes</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Venue: {exam.venue}</div>
                      <div className="text-sm text-gray-500">Students: {exam.noOfStudents}</div>
                      <div className="text-sm text-gray-500">Marks: {exam.marks}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                          <Building2 className="w-3.5 h-3.5" />
                          {setupDataMap[exam.id]?.rooms?.length || 0} rooms
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {supervisionDataMap[exam.id]?.invigilators?.length || 0} invigilators
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(exam.status)}`}>
                        {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(exam)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Exam Setup and Supervision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Exam Setup */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Exam Setup</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Select Exam</label>
                <select value={selectedSetupExamId} onChange={(e) => {
                  const id = e.target.value;
                  setSelectedSetupExamId(id);
                  const existing = setupDataMap[id];
                  if (existing) setSetupForm(existing);
                }} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">-- Choose --</option>
                  {examinations.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.title} — {ex.subject}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">Type</label>
                <select value={setupForm.type} onChange={e=>setSetupForm({...setupForm, type: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>Written</option>
                  <option>Practical</option>
                  <option>Oral</option>
                  <option>Objective</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Grade/Class</label>
                <input value={setupForm.grade} onChange={e=>setSetupForm({...setupForm, grade: e.target.value})} placeholder="10" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Section</label>
                <input value={setupForm.section} onChange={e=>setSetupForm({...setupForm, section: e.target.value})} placeholder="A" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Columns per room</label>
                <input type="number" min={1} max={20} value={setupForm.columns || 6} onChange={e=>setSetupForm({...setupForm, columns: Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Pass Marks</label>
                  <input type="number" value={setupForm.passMarks} onChange={e=>setSetupForm({...setupForm, passMarks: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>
              {/* Materials Allowed section removed as per requirements */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Rooms</label>
                <div className="flex flex-wrap gap-2">
                  {roomOptions.map(r => {
                    const active = setupForm.rooms.includes(r);
                    return (
                      <button type="button" key={r} onClick={() => setSetupForm(prev => ({
                        ...prev,
                        rooms: active ? prev.rooms.filter(x=>x!==r) : [...prev.rooms, r]
                      }))} className={`px-3 py-1 rounded-full text-sm border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>
                        {r}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Seating Plan</label>
                <select value={setupForm.seatingPlan} onChange={e=>setSetupForm({...setupForm, seatingPlan: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>Row</option>
                  <option>Grid</option>
                  <option>Zig-Zag</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Instructions</label>
                <textarea rows={3} value={setupForm.instructions} onChange={e=>setSetupForm({...setupForm, instructions: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Report 30 min early. Carry admit card."/>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={saveExamSetup} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">Save Setup</button>
            </div>
          </div>

          {/* Supervision */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Supervision</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Select Exam</label>
                <select value={selectedSupervisionExamId} onChange={(e) => {
                  const id = e.target.value;
                  setSelectedSupervisionExamId(id);
                  const existing = supervisionDataMap[id];
                  if (existing) setSupervisionForm(existing);
                }} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="">-- Choose --</option>
                  {examinations.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.title} — {ex.subject}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Invigilators</label>
                <select
                  multiple
                  value={supervisionForm.invigilators}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                    setSupervisionForm(prev => ({ ...prev, invigilators: selected }));
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-32"
                >
                  {teacherOptions.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple.</p>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Reporting Time (hh:mm)</label>
                <input type="time" value={supervisionForm.reportingTime} onChange={e=>setSupervisionForm({...supervisionForm, reportingTime: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Relief Interval (hh:mm)</label>
                <input type="time" value={supervisionForm.reliefInterval} onChange={e=>setSupervisionForm({...supervisionForm, reliefInterval: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div className="flex items-center gap-2">
                <input id="qrAtt" type="checkbox" checked={supervisionForm.qrAttendance} onChange={e=>setSupervisionForm({...supervisionForm, qrAttendance: e.target.checked})} />
                <label htmlFor="qrAtt" className="text-sm text-gray-700">Enable QR Attendance</label>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Notes</label>
                <textarea rows={3} value={supervisionForm.notes} onChange={e=>setSupervisionForm({...supervisionForm, notes: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Brief invigilation instructions or duty roster notes."/>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={saveSupervision} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">Save Supervision</button>
            </div>
          </div>
        </div>

        {/* Seat Plan Preview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Seat Plan Preview</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => printSection(seatPlanRef, 'Seat Plan')} disabled={!selectedSetupExam || !(setupForm.rooms?.length)} className={`px-3 py-2 rounded-lg border ${!selectedSetupExam || !(setupForm.rooms?.length) ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}>
                Print
              </button>
              <button onClick={exportSeatPlanPDF} disabled={!selectedSetupExam || !(setupForm.rooms?.length)} className={`px-3 py-2 rounded-lg border ${!selectedSetupExam || !(setupForm.rooms?.length) ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600'}`}>
                Export PDF
              </button>
            </div>
          </div>
          <div ref={seatPlanRef}>
            {selectedSetupExam && setupForm.rooms?.length ? (
              <div className="print-section">
                <div className="mb-3">
                  <p className="text-sm text-gray-700"><span className="font-medium">Exam:</span> {selectedSetupExam.title} — {selectedSetupExam.subject}</p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Schedule:</span> {formatDate(selectedSetupExam.date)} at {selectedSetupExam.time}
                    {(selectedSetupExam.endDate || selectedSetupExam.endTime) && (
                      <> — {formatDate(selectedSetupExam.endDate || selectedSetupExam.date)} {selectedSetupExam.endTime || ''}</>
                    )}
                    {' '}| Duration {selectedSetupExam.duration} mins
                  </p>
                  <p className="text-sm text-gray-700"><span className="font-medium">Seating:</span> {setupForm.seatingPlan} | Columns: {setupForm.columns || 6} | Students: {selectedSetupExam.noOfStudents}</p>
                </div>
                <div className="grid gap-4 md:gap-6 md:grid-cols-2 print-grid">
                  {generateSeatPlan(selectedSetupExam, setupForm).map(({room, grid}) => (
                    <div key={room} className="border rounded-lg p-3 print-section">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">Room: {room}</h3>
                        <span className="text-sm text-gray-600">Seats: {grid.flat().filter(Boolean).length}</span>
                      </div>
                      <table className="w-full text-sm print-table">
                        <tbody>
                          {grid.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((seat, cIdx) => (
                                <td key={cIdx} className="border border-gray-300 p-2 text-center align-middle min-w-[36px]">{seat || ''}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Select an exam and add rooms in Exam Setup to preview seat plan.</p>
            )}
          </div>
        </div>

        {/* Duty Roster */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Duty Roster</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => printSection(rosterRef, 'Duty Roster')} disabled={!selectedSupervisionExam} className={`px-3 py-2 rounded-lg border ${!selectedSupervisionExam ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}>
                Print
              </button>
              <button onClick={exportRosterPDF} disabled={!selectedSupervisionExam} className={`px-3 py-2 rounded-lg border ${!selectedSupervisionExam ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600'}`}>
                Export PDF
              </button>
            </div>
          </div>
          <div ref={rosterRef}>
            {selectedSupervisionExam ? (
              <div className="print-section">
                <div className="mb-3">
                  <p className="text-sm text-gray-700"><span className="font-medium">Exam:</span> {selectedSupervisionExam.title} — {selectedSupervisionExam.subject}</p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Schedule:</span> {formatDate(selectedSupervisionExam.date)} at {selectedSupervisionExam.time}
                    {(selectedSupervisionExam.endDate || selectedSupervisionExam.endTime) && (
                      <> — {formatDate(selectedSupervisionExam.endDate || selectedSupervisionExam.date)} {selectedSupervisionExam.endTime || ''}</>
                    )}
                    {' '}| Duration {selectedSupervisionExam.duration} mins
                  </p>
                  <p className="text-sm text-gray-700"><span className="font-medium">Reporting:</span> {supervisionForm.reportingTime || '—'} before | Relief: {supervisionForm.reliefInterval || '—'}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm print-table">
                    <thead>
                      <tr>
                        <th className="border px-2 py-1 text-left">Room</th>
                        <th className="border px-2 py-1 text-left">Invigilator</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(setupForm.rooms || []).map((room, idx) => {
                        const invigilators = supervisionForm.invigilators || [];
                        const invigilator = invigilators.length ? invigilators[idx % invigilators.length] : '';
                        return (
                          <tr key={room}>
                            <td className="border px-2 py-1">{room}</td>
                            <td className="border px-2 py-1">{invigilator || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {supervisionForm.notes && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-700"><span className="font-medium">Notes:</span> {supervisionForm.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Select an exam in the Supervision card to view and print duty roster.</p>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => { setShowModal(false); setEditingExam(null); resetForm(); }} />
            <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 p-6 sm:p-7">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{editingExam ? 'Edit Examination' : 'Add Examination'}</h2>
                  <p className="text-sm text-gray-500">Enter exam details and schedule</p>
                </div>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => { setShowModal(false); setEditingExam(null); resetForm(); }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Exam Title</label>
                    <input name="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="Mid Term Examination" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Subject</label>
                    <input name="subject" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required placeholder="Physics" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Instructor</label>
                    <input name="instructor" value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} required placeholder="Prof. Priya Verma" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Venue</label>
                    <input name="venue" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} required placeholder="Hall A" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Start Date</label>
                    <input name="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" type="date" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Start Time</label>
                    <input name="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" type="time" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">End Date</label>
                    <input name="endDate" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" type="date" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">End Time</label>
                    <input name="endTime" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" type="time" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Total Marks</label>
                    <input name="marks" value={formData.marks} onChange={e => setFormData({...formData, marks: e.target.value})} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" type="number" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Students</label>
                    <input name="noOfStudents" value={formData.noOfStudents} onChange={e => setFormData({...formData, noOfStudents: e.target.value})} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" type="number" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Duration (minutes)</label>
                    <input name="duration" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" type="number" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="scheduled">Scheduled</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setEditingExam(null); resetForm(); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">{editingExam ? 'Update' : 'Add'} Examination</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExaminationManagement;
