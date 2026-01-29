import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Download, FileText, Send, Plus, X, Upload, Bell, Users, GraduationCap, User } from 'lucide-react';
import { jsPDF } from 'jspdf';
const API_BASE = import.meta.env.VITE_API_URL;

const Result = ({ setShowAdminHeader }) => {
  useEffect(() => {
    setShowAdminHeader?.(true);
  }, [setShowAdminHeader]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [rawResults, setRawResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState('');

  // Add Result Modal States
  const [showAddResultModal, setShowAddResultModal] = useState(false);
  const [showCSVUploadModal, setShowCSVUploadModal] = useState(false);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [uploadingCSV, setUploadingCSV] = useState(false);
  const [csvFile, setCSVFile] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState('');

  // Form States
  const [formData, setFormData] = useState({
    examId: '',
    studentId: '',
    marks: '',
    grade: '',
    remarks: '',
    status: 'pass'
  });

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchResults = async () => {
      setError('');
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/exam/results/admin`, {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          signal: controller.signal,
        });
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          throw new Error(data?.error || 'Failed to load results');
        }
        if (isMounted) {
          setRawResults(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        if (isMounted) {
          setError(err.message || 'Failed to load results');
          setRawResults([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const structuredResults = useMemo(() => {
    const classMap = new Map();
    rawResults.forEach((record) => {
      const student = record.studentId || {};
      const exam = record.examId || {};
      const classKey = student.grade || 'Unassigned';
      const sectionKey = student.section || 'General';

      if (!classMap.has(classKey)) {
        classMap.set(classKey, new Map());
      }
      const sectionMap = classMap.get(classKey);
      if (!sectionMap.has(sectionKey)) {
        sectionMap.set(sectionKey, new Map());
      }
      const studentsMap = sectionMap.get(sectionKey);

      const studentKey =
        student._id?.toString() || `${classKey}-${sectionKey}-${student.name || record._id}`;
      if (!studentsMap.has(studentKey)) {
        studentsMap.set(studentKey, {
          id: studentKey,
          name: student.name || 'Unnamed Student',
          rollNo: student.roll || '—',
          grade: student.grade || classKey,
          section: student.section || sectionKey,
          schoolName: student.schoolId?.name || '',
          subjects: {},
        });
      }
      const entry = studentsMap.get(studentKey);
      const subjectName = exam.subject || exam.title || record.subject || 'Subject';
      const marks = Number.isFinite(Number(record.marks)) ? Number(record.marks) : 0;
      entry.subjects[subjectName] = marks;
    });

    const normalized = {};
    classMap.forEach((sectionMap, classKey) => {
      normalized[classKey] = {};
      sectionMap.forEach((studentsMap, sectionKey) => {
        normalized[classKey][sectionKey] = Array.from(studentsMap.values());
      });
    });
    return normalized;
  }, [rawResults]);

  // Predefined classes from 1 to 12
  const predefinedClasses = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);
  }, []);

  const classes = useMemo(
    () => {
      // Combine predefined classes with any additional classes from results
      const resultClasses = Object.keys(structuredResults);
      const allClasses = [...new Set([...predefinedClasses, ...resultClasses])];
      return allClasses.sort((a, b) => {
        // Extract numeric part for proper sorting
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
      });
    },
    [structuredResults, predefinedClasses]
  );

  // Predefined sections A, B, C
  const predefinedSections = useMemo(() => ['A', 'B', 'C'], []);

  const sections = useMemo(() => {
    if (!selectedClass) return predefinedSections;

    // Combine predefined sections with any additional sections from results
    const resultSections = structuredResults[selectedClass]
      ? Object.keys(structuredResults[selectedClass])
      : [];
    const allSections = [...new Set([...predefinedSections, ...resultSections])];
    return allSections.sort();
  }, [structuredResults, selectedClass, predefinedSections]);

  useEffect(() => {
    if (!classes.length) {
      if (selectedClass) setSelectedClass('');
      return;
    }
    if (!selectedClass || !classes.includes(selectedClass)) {
      setSelectedClass(classes[0]);
    }
  }, [classes, selectedClass]);

  useEffect(() => {
    if (!selectedClass) {
      if (selectedSection) setSelectedSection('');
      return;
    }
    if (!sections.length) {
      if (selectedSection) setSelectedSection('');
      return;
    }
    if (!selectedSection || !sections.includes(selectedSection)) {
      setSelectedSection(sections[0]);
    }
  }, [sections, selectedClass, selectedSection]);

  const studentsForSelection = useMemo(() => {
    if (!selectedClass || !selectedSection) return [];
    return structuredResults[selectedClass]?.[selectedSection] || [];
  }, [structuredResults, selectedClass, selectedSection]);

  const generateReportCard = async (student) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;
    
    // Load images
    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    let schoolLogo, studentPhoto;
    
    try {
      schoolLogo = await loadImage('/NIF LOGO crop.png');
      studentPhoto = await loadImage('/80.jpg');
    } catch (error) {
      console.warn('Could not load images:', error);
    }
    
    // Decorative border
    doc.setDrawColor(200, 150, 150);
    doc.setLineWidth(1);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
    
    // Header Section
    let currentY = 12;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(margin, currentY, contentWidth, 35);
    
    // School Logo (left)
    if (schoolLogo) {
      doc.addImage(schoolLogo, 'PNG', 15, currentY + 5, 20, 20);
    } else {
      // Fallback placeholder
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.rect(15, currentY + 5, 20, 20);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text('EEC', 25, currentY + 13, { align: 'center' });
      doc.text('LOGO', 25, currentY + 18, { align: 'center' });
    }
    
    // School Name and Details (center)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 20, 60);
    const classLabel = student.grade || selectedClass || 'Class';
    const sectionLabel = student.section || selectedSection || 'Section';
    const schoolTitle = (student.schoolName || 'Electronic Educare').toUpperCase();
    doc.text(schoolTitle, pageWidth/2, currentY + 12, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    doc.text('Citimart, New Market, Esplanade, Kolkata', pageWidth/2, currentY + 18, { align: 'center' });
    doc.text('Phone: +91 9830590929 | Email: info@electroniceducare.com', pageWidth/2, currentY + 22, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Annual Term (Session 2024-2025)', pageWidth/2, currentY + 30, { align: 'center' });
    
    // CBSE Logo placeholder (right)
    doc.setDrawColor(0);
    doc.circle(pageWidth - 25, currentY + 15, 10);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.text('CBSE', pageWidth - 25, currentY + 16, { align: 'center' });
    
    currentY += 40;
    
    // Class designation
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, currentY, 20, 12, 'F');
    doc.setDrawColor(0);
    doc.rect(margin, currentY, 20, 12);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('class', 15, currentY + 6);
    doc.text(classLabel, 18, currentY + 10);
    
    currentY += 15;
    
    // Student Information Section
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    
    // Left column student details
    doc.text("Student's Name:", 15, currentY);
    doc.text(student.name, 50, currentY);
    
    doc.text("Father's Name:", 15, currentY + 5);
    doc.text('Mr. ' + (student.name.split(' ')[1] || 'Father Name'), 50, currentY + 5);
    
    doc.text("Mother's Name:", 15, currentY + 10);
    doc.text('Mrs. ' + (student.name.split(' ')[1] || 'Mother Name'), 50, currentY + 10);
    
    doc.text("Date of Birth:", 15, currentY + 15);
    doc.text('01/01/2010', 50, currentY + 15);
    
    doc.text("Height:", 15, currentY + 20);
    doc.text('152 CM', 50, currentY + 20);
    
    // Right column details
    doc.text("Class:", 110, currentY);
    doc.text(classLabel, 125, currentY);
    
    doc.text("Section:", 110, currentY + 5);
    doc.text(sectionLabel, 125, currentY + 5);
    
    doc.text("Roll No.:", 110, currentY + 10);
    doc.text(student.rollNo || '—', 125, currentY + 10);
    
    doc.text("House:", 110, currentY + 15);
    doc.text('Blue House', 125, currentY + 15);
    
    doc.text("Weight:", 110, currentY + 20);
    doc.text('40 KG', 125, currentY + 20);
    
    // Student photo
    if (studentPhoto) {
      doc.addImage(studentPhoto, 'JPEG', pageWidth - 30, currentY, 20, 25);
    } else {
      // Fallback placeholder
      doc.setDrawColor(0);
      doc.rect(pageWidth - 30, currentY, 20, 25);
      doc.setFontSize(5);
      doc.text('STUDENT', pageWidth - 20, currentY + 10, { align: 'center' });
      doc.text('PHOTO', pageWidth - 20, currentY + 15, { align: 'center' });
    }
    
    currentY += 30;
    
    // Enhanced subjects data
    const enhancedSubjects = {
      'English': { periodicTest: 8, notebook: 4, subEnrichment: 4, halfYearly: 78, total: 94, grade: 'A2' },
      'Hindi': { periodicTest: 8, notebook: 4, subEnrichment: 4, halfYearly: 75, total: 91, grade: 'A1' },
      'Maths': { periodicTest: student.subjects.Math ? Math.floor(student.subjects.Math/10) : 9, notebook: 5, subEnrichment: 5, halfYearly: student.subjects.Math || 85, total: (student.subjects.Math || 85) + 19, grade: 'A1' },
      'Science': { periodicTest: student.subjects.Science ? Math.floor(student.subjects.Science/10) : 7, notebook: 4, subEnrichment: 4, halfYearly: student.subjects.Science || 72, total: (student.subjects.Science || 72) + 15, grade: 'B1' },
      'Social Science': { periodicTest: student.subjects.History ? Math.floor(student.subjects.History/10) : 8, notebook: 4, subEnrichment: 4, halfYearly: student.subjects.History || 80, total: (student.subjects.History || 80) + 16, grade: 'A2' }
    };
    
    // Main table header
    doc.setFillColor(220, 220, 220);
    doc.rect(margin, currentY, contentWidth, 15, 'F');
    doc.setDrawColor(0);
    doc.rect(margin, currentY, contentWidth, 15);
    
    // Column widths
    const col1 = 35; // Subjects
    const col2 = 15; // Periodic Test
    const col3 = 15; // Notebook
    const col4 = 20; // Sub Enhancement
    const col5 = 20; // Half Yearly
    const col6 = 20; // Total
    const col7 = 25; // Grade
    const col8 = 25; // Overall Grade
    
    // Multi-line header
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('Subjects', margin + 15, currentY + 5);
    doc.text('Scholastic Areas', margin + col1 + 30, currentY + 3);
    doc.text('Total', margin + col1 + col2 + col3 + col4 + col5 + 5, currentY + 5);
    doc.text('Grade', margin + col1 + col2 + col3 + col4 + col5 + col6 + 5, currentY + 5);
    
    doc.text('Periodic', margin + col1 + 5, currentY + 8);
    doc.text('Note', margin + col1 + col2 + 3, currentY + 8);
    doc.text('Sub', margin + col1 + col2 + col3 + 5, currentY + 8);
    doc.text('Half', margin + col1 + col2 + col3 + col4 + 3, currentY + 8);
    doc.text('(100)', margin + col1 + col2 + col3 + col4 + col5 + 3, currentY + 8);
    
    doc.text('Test(10)', margin + col1 + 3, currentY + 12);
    doc.text('Book(5)', margin + col1 + col2 + 1, currentY + 12);
    doc.text('Enrich(5)', margin + col1 + col2 + col3 + 1, currentY + 12);
    doc.text('Yearly(80)', margin + col1 + col2 + col3 + col4 - 2, currentY + 12);
    
    // Vertical lines for header
    let lineX = margin + col1;
    doc.line(lineX, currentY, lineX, currentY + 15);
    lineX += col2;
    doc.line(lineX, currentY, lineX, currentY + 15);
    lineX += col3;
    doc.line(lineX, currentY, lineX, currentY + 15);
    lineX += col4;
    doc.line(lineX, currentY, lineX, currentY + 15);
    lineX += col5;
    doc.line(lineX, currentY, lineX, currentY + 15);
    lineX += col6;
    doc.line(lineX, currentY, lineX, currentY + 15);
    
    currentY += 15;
    
    // Subject rows
    Object.entries(enhancedSubjects).forEach(([subject, marks], index) => {
      const rowHeight = 10;
      
      // Row background (alternating)
      if (index % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, currentY, contentWidth, rowHeight, 'F');
      }
      
      doc.setDrawColor(0);
      doc.rect(margin, currentY, contentWidth, rowHeight);
      
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.text(subject, margin + 2, currentY + 6);
      doc.text(marks.periodicTest.toString(), margin + col1 + 5, currentY + 6);
      doc.text(marks.notebook.toString(), margin + col1 + col2 + 5, currentY + 6);
      doc.text(marks.subEnrichment.toString(), margin + col1 + col2 + col3 + 7, currentY + 6);
      doc.text(marks.halfYearly.toString(), margin + col1 + col2 + col3 + col4 + 5, currentY + 6);
      doc.text(marks.total.toString(), margin + col1 + col2 + col3 + col4 + col5 + 5, currentY + 6);
      doc.text(marks.grade, margin + col1 + col2 + col3 + col4 + col5 + col6 + 8, currentY + 6);
      
      // Vertical lines
      lineX = margin + col1;
      doc.line(lineX, currentY, lineX, currentY + rowHeight);
      lineX += col2;
      doc.line(lineX, currentY, lineX, currentY + rowHeight);
      lineX += col3;
      doc.line(lineX, currentY, lineX, currentY + rowHeight);
      lineX += col4;
      doc.line(lineX, currentY, lineX, currentY + rowHeight);
      lineX += col5;
      doc.line(lineX, currentY, lineX, currentY + rowHeight);
      lineX += col6;
      doc.line(lineX, currentY, lineX, currentY + rowHeight);
      
      currentY += rowHeight;
    });
    
    // Attendance row
    doc.setFillColor(220, 220, 220);
    doc.rect(margin, currentY, contentWidth, 10, 'F');
    doc.setDrawColor(0);
    doc.rect(margin, currentY, contentWidth, 10);
    
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('Attendance', margin + 2, currentY + 6);
    doc.text('95/105', margin + col1 + 5, currentY + 6);
    
    // Calculate total marks
    const totalMarks = Object.values(enhancedSubjects).reduce((sum, subject) => sum + subject.total, 0);
    const maxMarks = Object.keys(enhancedSubjects).length * 100;
    const percentage = ((totalMarks / maxMarks) * 100).toFixed(1);
    
    doc.text('Total Marks:', margin + col1 + col2 + 5, currentY + 6);
    doc.text(`${totalMarks}/${maxMarks}`, margin + col1 + col2 + col3 + col4 + 5, currentY + 6);
    doc.text('Percentage:', margin + col1 + col2 + col3 + col4 + col5 + 2, currentY + 6);
    doc.text(`${percentage}%`, margin + col1 + col2 + col3 + col4 + col5 + col6 + 5, currentY + 6);
    
    currentY += 15;
    
    // Co-scholastic Activities section (simplified to fit)
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, currentY, contentWidth, 6, 'F');
    doc.setDrawColor(0);
    doc.rect(margin, currentY, contentWidth, 6);
    
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('Co-scholastic Activities Area (3-point scale)', margin + 5, currentY + 4);
    
    currentY += 8;
    
    // Simplified co-scholastic table
    const coScholasticRows = [
      { activity: 'Work Education', grade: 'A' },
      { activity: 'Art Education', grade: 'B' },
      { activity: 'Physical Education', grade: 'A' }
    ];
    
    coScholasticRows.forEach((item, index) => {
      doc.setDrawColor(0);
      doc.rect(margin, currentY, contentWidth, 6);
      
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.text(item.activity, margin + 5, currentY + 4);
      doc.text(item.grade, margin + 80, currentY + 4);
      
      currentY += 6;
    });
    
    currentY += 8;
    
    // Compact Grade Scale
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('Grade Scale: A1(91-100) A2(81-90) B1(71-80) B2(61-70) C1(51-60) C2(41-50) D(33-40) E(<33)', margin, currentY);
    
    currentY += 10;
    
    // Remarks section (more compact)
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('Remarks:', margin, currentY);
    doc.setFont('helvetica', 'normal');
    
    let remarks;
    const overallPercentage = parseFloat(percentage);
    if (overallPercentage >= 90) remarks = 'Excellent performance! Keep up the outstanding work.';
    else if (overallPercentage >= 75) remarks = 'Very good performance. Continue your efforts.';
    else if (overallPercentage >= 60) remarks = 'Good work. Focus on weaker areas for improvement.';
    else if (overallPercentage >= 33) remarks = 'Needs improvement. Please work harder.';
    else remarks = 'Requires immediate attention and support.';
    
    doc.text(remarks, margin, currentY + 6);
    
    currentY += 15;
    
    // Promotion section
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('On promotion/ You are promoted to class:', margin, currentY);
    doc.setFont('helvetica', 'normal');
    const nextClass = parseInt(selectedClass.split(' ')[1] || '1') + 1;
    doc.text(`Class ${nextClass}`, margin + 80, currentY);
    
    // Ensure signature section stays within bounds
    const signatureY = Math.min(currentY + 20, pageHeight - 30);
    
    // Signature section
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    
    // Parent signature
    doc.line(15, signatureY, 65, signatureY);
    doc.text("Parent's Signature", 30, signatureY + 8);
    
    // Class teacher signature  
    doc.line(pageWidth/2 - 25, signatureY, pageWidth/2 + 25, signatureY);
    doc.text("Class Teacher Signature", pageWidth/2 - 15, signatureY + 8);
    
    // Principal signature
    doc.line(pageWidth - 65, signatureY, pageWidth - 15, signatureY);
    doc.text("Principal Signature", pageWidth - 45, signatureY + 8);
    
    doc.save(`${student.name}_Report_Card_${classLabel}_Section_${sectionLabel}_${new Date().getFullYear()}.pdf`);
  };

  const handlePublishResults = async () => {
    if (!selectedClass) {
      setError('Please select a class to publish results');
      return;
    }

    setPublishing(true);
    setError('');
    setPublishSuccess('');

    try {
      const res = await fetch(`${API_BASE}/api/exam/results/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          grade: selectedClass,
          section: selectedSection || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to publish results');
      }

      setPublishSuccess(
        `Results published successfully! Notified ${data.studentsNotified} students, ${data.teachersNotified} teachers, and ${data.parentsNotified} parents.`
      );
    } catch (err) {
      setError(err.message || 'Failed to publish results');
    } finally {
      setPublishing(false);
    }
  };

  // Fetch exams
  const fetchExams = async () => {
    setLoadingExams(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/exam/fetch`, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check if you are logged in.');
      }

      const data = await res.json();
      if (res.ok) {
        setExams(Array.isArray(data) ? data : []);
      } else {
        throw new Error(data?.error || 'Failed to fetch exams');
      }
    } catch (err) {
      console.error('Failed to fetch exams:', err);
      setError('Failed to load exams: ' + err.message);
      setExams([]);
    } finally {
      setLoadingExams(false);
    }
  };

  // Fetch students for selected class/section
  const fetchStudents = async () => {
    if (!selectedClass) return;

    setLoadingStudents(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/get-students`, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check if you are logged in.');
      }

      const data = await res.json();
      if (res.ok) {
        const allStudents = Array.isArray(data) ? data : [];

        console.log('Total students fetched:', allStudents.length);
        console.log('Looking for class:', selectedClass);
        console.log('Looking for section:', selectedSection);

        // Log first few students to see their structure
        if (allStudents.length > 0) {
          console.log('Sample student:', allStudents[0]);
          console.log('Available grades:', [...new Set(allStudents.map(s => s.grade))]);
          console.log('Available sections:', [...new Set(allStudents.map(s => s.section))]);
        }

        // Filter students by selected class and section
        const filtered = allStudents.filter(student => {
          const matchesClass = student.grade === selectedClass;
          const matchesSection = selectedSection ? student.section === selectedSection : true;

          if (student.grade === selectedClass || student.grade?.includes('11')) {
            console.log('Student match check:', {
              name: student.name,
              grade: student.grade,
              section: student.section,
              matchesClass,
              matchesSection
            });
          }

          return matchesClass && matchesSection;
        });

        console.log('Filtered students:', filtered.length);
        setStudents(filtered);

        if (filtered.length === 0) {
          console.warn(`No students found for ${selectedClass}${selectedSection ? ` Section ${selectedSection}` : ''}`);
          console.warn('All students:', allStudents.map(s => ({ name: s.name, grade: s.grade, section: s.section })));
        }
      } else {
        throw new Error(data?.error || 'Failed to fetch students');
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError('Failed to load students: ' + err.message);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Open Add Result Modal
  const openAddResultModal = () => {
    if (!selectedClass) {
      setError('Please select a class first');
      return;
    }
    setError('');
    setPublishSuccess('');
    setShowAddResultModal(true);
    fetchExams();
    fetchStudents();
  };

  // Close modal and reset form
  const closeAddResultModal = () => {
    setShowAddResultModal(false);
    setSelectedTerm('');
    setFormData({
      examId: '',
      studentId: '',
      marks: '',
      grade: '',
      remarks: '',
      status: 'pass'
    });
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit result
  const handleSubmitResult = async (e) => {
    e.preventDefault();

    if (!selectedTerm) {
      setError('Please select a term or type first');
      return;
    }

    if (!formData.examId || !formData.studentId || !formData.marks) {
      setError('Please fill in all required fields (Term, Exam, Student, and Marks)');
      return;
    }

    // Validate marks
    const marksValue = parseFloat(formData.marks);
    if (isNaN(marksValue) || marksValue < 0 || marksValue > 100) {
      setError('Marks must be a number between 0 and 100');
      return;
    }

    setSavingResult(true);
    setError('');
    setPublishSuccess('');

    const payload = {
      ...formData,
      marks: marksValue
    };

    console.log('Submitting result:', payload);

    try {
      const res = await fetch(`${API_BASE}/api/exam/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('Response:', { status: res.status, data });

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to save result');
      }

      setPublishSuccess('✓ Result added successfully! Refreshing page...');
      closeAddResultModal();

      // Refresh results after a short delay to show success message
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to save result');
      setSavingResult(false);
    }
  };

  // Open CSV Upload Modal
  const openCSVUploadModal = () => {
    if (!selectedClass) {
      setError('Please select a class first');
      return;
    }
    setShowCSVUploadModal(true);
    fetchExams();
  };

  // Close CSV modal
  const closeCSVUploadModal = () => {
    setShowCSVUploadModal(false);
    setCSVFile(null);
  };

  // Handle CSV file selection
  const handleCSVFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCSVFile(file);
      setError('');
    } else {
      setError('Please select a valid CSV file');
      setCSVFile(null);
    }
  };

  // Handle CSV upload
  const handleCSVUpload = async (e) => {
    e.preventDefault();

    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }

    setUploadingCSV(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('grade', selectedClass);
      if (selectedSection) {
        formData.append('section', selectedSection);
      }

      const res = await fetch(`${API_BASE}/api/exam/results/bulk-upload`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to upload CSV');
      }

      setPublishSuccess(`Successfully uploaded ${data.count || 0} results!`);
      closeCSVUploadModal();

      // Refresh results
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Failed to upload CSV');
    } finally {
      setUploadingCSV(false);
    }
  };

  // Download CSV template
  const downloadCSVTemplate = () => {
    const headers = ['examId', 'studentId', 'marks', 'grade', 'remarks', 'status'];
    const sampleRow = ['exam_id_here', 'student_id_here', '85', 'A', 'Good performance', 'pass'];
    const csvContent = [
      headers.join(','),
      sampleRow.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'result_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Results Management</h1>
          <p className="text-gray-600">Manage, upload, and publish examination results</p>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <FileText className="text-blue-600 mr-2" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Filter Results</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Class
              </label>
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900 font-medium transition-all"
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Section
              </label>
              <div className="relative">
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={!selectedClass}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white disabled:bg-gray-50 disabled:text-gray-400 text-gray-900 font-medium transition-all"
                >
                  <option value="">Select a section</option>
                  {sections.map((section) => (
                    <option key={section} value={section}>Section {section}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>
          </div>
        </div>

        {selectedClass && (
          <>
            {/* Action Buttons Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Plus className="text-blue-600 mr-2" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">Add Results</h2>
                </div>
                <span className="text-sm text-gray-500">
                  {selectedClass}{selectedSection ? ` - Section ${selectedSection}` : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={openAddResultModal}
                  className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-center">
                    <Plus size={22} className="mr-2" />
                    <span>Add Single Result</span>
                  </div>
                  <p className="text-blue-100 text-xs mt-1">Enter result for one student</p>
                </button>

                <button
                  onClick={openCSVUploadModal}
                  className="group relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-center">
                    <Upload size={22} className="mr-2" />
                    <span>Bulk Upload CSV</span>
                  </div>
                  <p className="text-indigo-100 text-xs mt-1">Upload multiple results at once</p>
                </button>
              </div>
            </div>

            {/* Publish Results Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-6 py-4">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-lg p-2.5 mr-3">
                    <Bell className="text-green-600" size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Publish & Notify
                    </h2>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {selectedClass}{selectedSection ? ` - Section ${selectedSection}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                    <div className="flex items-start">
                      <div className="bg-blue-600 rounded-lg p-2.5 mr-3 group-hover:scale-110 transition-transform">
                        <GraduationCap className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">Students</p>
                        <p className="text-sm font-semibold text-blue-800">Will receive notifications</p>
                      </div>
                    </div>
                  </div>

                  <div className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                    <div className="flex items-start">
                      <div className="bg-purple-600 rounded-lg p-2.5 mr-3 group-hover:scale-110 transition-transform">
                        <Users className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">Teachers</p>
                        <p className="text-sm font-semibold text-purple-800">Will receive notifications</p>
                      </div>
                    </div>
                  </div>

                  <div className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
                    <div className="flex items-start">
                      <div className="bg-orange-600 rounded-lg p-2.5 mr-3 group-hover:scale-110 transition-transform">
                        <User className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-orange-900 uppercase tracking-wider mb-1">Parents</p>
                        <p className="text-sm font-semibold text-orange-800">Will receive notifications</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-800 leading-relaxed">
                    <span className="font-semibold">📢 Publishing will send instant notifications</span> to all students, teachers, and parents of <span className="font-bold">{selectedClass}{selectedSection ? ` Section ${selectedSection}` : ''}</span> about the newly published examination results.
                  </p>
                </div>

                <button
                  onClick={handlePublishResults}
                  disabled={publishing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {publishing ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Publishing Results...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Send size={22} className="mr-3" />
                      Publish Results & Send Notifications
                    </div>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="mb-6 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
        {publishSuccess && (
          <div className="mb-6 rounded-xl border-l-4 border-green-500 bg-green-50 p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Bell className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{publishSuccess}</p>
              </div>
            </div>
          </div>
        )}
        {loading && (
          <div className="mb-6 rounded-xl border-l-4 border-blue-500 bg-blue-50 p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">Loading exam results...</p>
              </div>
            </div>
          </div>
        )}

      {selectedClass && selectedSection && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Results Overview
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedClass} - Section {selectedSection}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{studentsForSelection.length}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Subjects & Marks
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Total Marks
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {studentsForSelection.map((student, index) => {
                  const subjectCount = Math.max(Object.keys(student.subjects || {}).length, 1);
                  const totalMarks = Object.values(student.subjects || {}).reduce((sum, marks) => sum + marks, 0);
                  const percentage = ((totalMarks / (subjectCount * 100)) * 100).toFixed(1);

                  return (
                    <tr key={student.id} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">{student.rollNo}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{student.name}</div>
                          {student.schoolName && (
                            <div className="text-xs text-gray-500 mt-1">{student.schoolName}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          {Object.entries(student.subjects || {}).map(([subject, marks]) => (
                            <div key={subject} className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 rounded-lg border border-gray-200">
                              <span className="font-semibold text-gray-700 text-sm">{subject}</span>
                              <span className="text-blue-600 font-bold text-sm">{marks}<span className="text-gray-400">/100</span></span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-lg font-bold text-gray-900">{totalMarks}</div>
                        <div className="text-xs text-gray-500">out of {subjectCount * 100}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1.5 text-sm font-bold rounded-lg ${
                          percentage >= 90 ? 'bg-green-100 text-green-800 border border-green-200' :
                          percentage >= 80 ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          percentage >= 70 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          percentage >= 60 ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <button
                          onClick={() => generateReportCard(student)}
                          className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                          <Download size={16} className="mr-2" />
                          Report Card
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {studentsForSelection.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                No student results available for {selectedClass} - Section {selectedSection}. Add results to get started.
              </p>
            </div>
          )}
        </div>
      )}

      {!loading && (!selectedClass || !selectedSection) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16">
          <div className="text-center max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Select Class & Section</h3>
            <p className="text-gray-600 leading-relaxed">
              Choose a class and section from the filters above to view and manage student examination results.
            </p>
          </div>
        </div>
      )}

      {/* Add Result Modal */}
      {showAddResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-blue-100 flex justify-between items-center sticky top-0">
              <div className="flex items-center">
                <div className="bg-blue-600 rounded-lg p-2 mr-3">
                  <Plus className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Add Exam Result</h2>
                  <p className="text-sm text-blue-700 mt-0.5">
                    {selectedClass}{selectedSection ? ` - Section ${selectedSection}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={closeAddResultModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmitResult} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Success Display in Modal */}
              {publishSuccess && (
                <div className="rounded-xl border-l-4 border-green-500 bg-green-50 p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Bell className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{publishSuccess}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display in Modal */}
              {error && (
                <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <X className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start">
                  <FileText className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" size={18} />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">How to add a result:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Select the term type</li>
                      <li>Select the exam from the dropdown</li>
                      <li>Choose the student</li>
                      <li>Enter marks (0-100)</li>
                      <li>Optionally add grade, status, and remarks</li>
                      <li>Click Save Result</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Term Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Term / Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Term 1', 'Term 2', 'Term 3', 'Class Test'].map((term) => {
                    const count = exams.filter(exam => exam.term === term).length;
                    return (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setSelectedTerm(term);
                          setFormData({...formData, examId: ''});
                        }}
                        className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all relative ${
                          selectedTerm === term
                            ? 'bg-blue-600 text-white shadow-md transform scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
                        }`}
                      >
                        <div>{term}</div>
                        <div className={`text-xs mt-1 ${selectedTerm === term ? 'text-blue-100' : 'text-gray-500'}`}>
                          {count} exam{count !== 1 ? 's' : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedTerm && (
                  <div className="mt-3 flex items-center text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <Bell size={16} className="mr-2" />
                    <span>
                      <span className="font-semibold">Selected:</span> {selectedTerm}
                      <span className="ml-2 text-blue-600">
                        ({exams.filter(exam => exam.term === selectedTerm).length} available)
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Exam Selection */}
              {selectedTerm && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Exam <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="examId"
                    value={formData.examId}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  >
                    <option value="">Select an exam</option>
                    {loadingExams ? (
                      <option disabled>Loading exams...</option>
                    ) : exams.filter(exam => exam.term === selectedTerm).length === 0 ? (
                      <option disabled>No exams available for {selectedTerm}</option>
                    ) : (
                      exams
                        .filter(exam => exam.term === selectedTerm)
                        .map((exam) => (
                          <option key={exam._id} value={exam._id}>
                            {exam.title} - {exam.subject} ({exam.date})
                          </option>
                        ))
                    )}
                  </select>
                  {exams.filter(exam => exam.term === selectedTerm).length === 0 && !loadingExams && (
                    <p className="mt-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                      No exams found for {selectedTerm}. Please create an exam first.
                    </p>
                  )}
                </div>
              )}

              {/* Student Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Student <span className="text-red-500">*</span>
                </label>
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                >
                  <option value="">Select a student</option>
                  {loadingStudents ? (
                    <option disabled>Loading students...</option>
                  ) : (
                    students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name} (Roll: {student.roll || 'N/A'}) - {student.grade} {student.section}
                      </option>
                    ))
                  )}
                </select>
                {students.length === 0 && !loadingStudents && (
                  <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                    No students found for {selectedClass}{selectedSection ? ` Section ${selectedSection}` : ''}.
                  </p>
                )}
              </div>

              {/* Marks Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Marks <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="marks"
                  value={formData.marks}
                  onChange={handleFormChange}
                  min="0"
                  max="100"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  placeholder="Enter marks (0-100)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Grade Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Grade
                  </label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                    placeholder="e.g., A+, A, B+"
                  />
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  >
                    <option value="pass">Pass</option>
                    <option value="fail">Fail</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
              </div>

              {/* Remarks Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  placeholder="Optional remarks about the result"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-5 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeAddResultModal}
                  disabled={savingResult}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingResult || loadingExams || loadingStudents}
                  className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {savingResult ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Result'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showCSVUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5 flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 rounded-lg p-2 mr-3">
                  <Upload className="text-white" size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Bulk Upload Results</h2>
                  <p className="text-indigo-100 text-sm mt-0.5">Upload multiple results via CSV</p>
                </div>
              </div>
              <button
                onClick={closeCSVUploadModal}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCSVUpload} className="p-6 space-y-6">
              {/* Instructions */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-5">
                <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center">
                  <FileText className="mr-2" size={18} />
                  CSV Format Requirements
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Required columns: <code className="bg-blue-100 px-2 py-0.5 rounded font-mono text-xs">examId, studentId, marks, grade, remarks, status</code></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Get exam IDs and student IDs from the system</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Marks must be between 0-100</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Status values: <code className="bg-blue-100 px-2 py-0.5 rounded font-mono text-xs">pass</code>, <code className="bg-blue-100 px-2 py-0.5 rounded font-mono text-xs">fail</code>, or <code className="bg-blue-100 px-2 py-0.5 rounded font-mono text-xs">absent</code></span>
                  </li>
                </ul>
              </div>

              {/* Download Template */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 rounded-lg p-2.5 mr-3">
                      <Download className="text-indigo-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Download CSV Template</p>
                      <p className="text-xs text-gray-600 mt-0.5">Get the correctly formatted template file</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={downloadCSVTemplate}
                    className="inline-flex items-center px-5 py-2.5 border-2 border-indigo-300 text-sm font-semibold rounded-xl text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm hover:shadow-md"
                  >
                    <Download size={16} className="mr-2" />
                    Download
                  </button>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Upload CSV File <span className="text-red-500">*</span>
                </label>
                <div className={`mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed rounded-xl transition-all ${
                  csvFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-indigo-400 bg-gray-50'
                }`}>
                  <div className="space-y-2 text-center">
                    {csvFile ? (
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2">
                        <FileText className="h-8 w-8 text-green-600" />
                      </div>
                    ) : (
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    )}
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="csv-upload"
                        className="relative cursor-pointer rounded-md font-bold text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                      >
                        <span>Click to upload</span>
                        <input
                          id="csv-upload"
                          name="csv-upload"
                          type="file"
                          accept=".csv"
                          onChange={handleCSVFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">CSV file up to 10MB</p>
                    {csvFile && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-sm font-bold text-green-700">
                          ✓ {csvFile.name}
                        </p>
                        <p className="text-xs text-green-600 mt-1">Ready to upload</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Info about class/section */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg p-4">
                <div className="flex items-start">
                  <Bell className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-bold text-yellow-900">
                      Target: {selectedClass}{selectedSection ? ` - Section ${selectedSection}` : ''}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Results will be uploaded for students in this class/section
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-5 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeCSVUploadModal}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingCSV || !csvFile}
                  className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {uploadingCSV ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={20} className="mr-2" />
                      Upload Results
                    </>
                  )}
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
