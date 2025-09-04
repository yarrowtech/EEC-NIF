import React, { useState } from 'react';
import { ChevronDown, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

const Result = ({ setShowAdminHeader }) => {
  setShowAdminHeader(true);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  const classes = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);
  const sections = ['A', 'B', 'C', 'D'];

  const mockStudentResults = {
    'Class 1': {
      'A': [
        { id: 1, name: 'John Doe', rollNo: '001', subjects: { English: 85, Math: 92, Science: 78, History: 88 } },
        { id: 2, name: 'Jane Smith', rollNo: '002', subjects: { English: 90, Math: 87, Science: 82, History: 91 } },
        { id: 3, name: 'Mike Johnson', rollNo: '003', subjects: { English: 75, Math: 83, Science: 79, History: 84 } }
      ],
      'B': [
        { id: 4, name: 'Sarah Wilson', rollNo: '004', subjects: { English: 88, Math: 85, Science: 91, History: 86 } },
        { id: 5, name: 'Tom Brown', rollNo: '005', subjects: { English: 82, Math: 89, Science: 77, History: 83 } }
      ]
    },
    'Class 2': {
      'A': [
        { id: 6, name: 'Emma Davis', rollNo: '006', subjects: { English: 93, Math: 88, Science: 85, History: 90 } },
        { id: 7, name: 'Alex Miller', rollNo: '007', subjects: { English: 79, Math: 91, Science: 83, History: 87 } }
      ],
      'B': [
        { id: 8, name: 'Lisa Garcia', rollNo: '008', subjects: { English: 87, Math: 84, Science: 89, History: 85 } }
      ]
    }
  };

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
    doc.text('ELECTRONIC EDUCARE', pageWidth/2, currentY + 12, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    doc.text('Tech Park, Electronic City Phase 1, Bangalore - 560100', pageWidth/2, currentY + 18, { align: 'center' });
    doc.text('Phone: +91-80-12345678 | Email: info@electroniceducare.edu.in', pageWidth/2, currentY + 22, { align: 'center' });
    
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
    doc.text(selectedClass.split(' ')[1] || 'I', 18, currentY + 10);
    
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
    doc.text(selectedClass, 125, currentY);
    
    doc.text("Section:", 110, currentY + 5);
    doc.text(selectedSection, 125, currentY + 5);
    
    doc.text("Roll No.:", 110, currentY + 10);
    doc.text(student.rollNo, 125, currentY + 10);
    
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
    
    doc.save(`${student.name}_Report_Card_${selectedClass}_Section_${selectedSection}_2024-25.pdf`);
  };

  const filteredStudents = () => {
    if (!selectedClass || !selectedSection) return [];
    return mockStudentResults[selectedClass]?.[selectedSection] || [];
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Student Results</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
        </div>
      </div>

      {selectedClass && selectedSection && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedClass} - Section {selectedSection} Results
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subjects & Marks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents().map((student) => {
                  const totalMarks = Object.values(student.subjects).reduce((sum, marks) => sum + marks, 0);
                  const percentage = ((totalMarks / (Object.keys(student.subjects).length * 100)) * 100).toFixed(1);
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.rollNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          {Object.entries(student.subjects).map(([subject, marks]) => (
                            <div key={subject} className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded">
                              <span className="font-medium">{subject}:</span>
                              <span className="text-blue-600 font-semibold">{marks}/100</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {totalMarks}/{Object.keys(student.subjects).length * 100}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          percentage >= 90 ? 'bg-green-100 text-green-800' :
                          percentage >= 80 ? 'bg-blue-100 text-blue-800' :
                          percentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          percentage >= 60 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => generateReportCard(student)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                        >
                          <Download size={14} className="mr-1" />
                          Report Card
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredStudents().length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No student results available for the selected class and section.
              </p>
            </div>
          )}
        </div>
      )}

      {(!selectedClass || !selectedSection) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Select Class and Section</h3>
            <p className="mt-1 text-sm text-gray-500">
              Please select both class and section to view student results.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Result;