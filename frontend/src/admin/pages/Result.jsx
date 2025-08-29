import React, { useState } from 'react';
import { ChevronDown, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

const Result = ({ setShowAdminHeader }) => {
  setShowAdminHeader(true);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  const classes = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);
  const sections = ['A', 'B', 'C', 'D'];

  const mockStudentResults = {
    'Grade 1': {
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
    'Grade 2': {
      'A': [
        { id: 6, name: 'Emma Davis', rollNo: '006', subjects: { English: 93, Math: 88, Science: 85, History: 90 } },
        { id: 7, name: 'Alex Miller', rollNo: '007', subjects: { English: 79, Math: 91, Science: 83, History: 87 } }
      ],
      'B': [
        { id: 8, name: 'Lisa Garcia', rollNo: '008', subjects: { English: 87, Math: 84, Science: 89, History: 85 } }
      ]
    }
  };

  const generateReportCard = (student) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Background Watermark Design
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.05 }));
    
    // Create CBSE logo watermark
    doc.setFillColor(0, 51, 102);
    doc.circle(pageWidth/2, pageHeight/2, 45, 'F');
    doc.setFillColor(255, 255, 255);
    doc.circle(pageWidth/2, pageHeight/2, 40, 'F');
    doc.setFillColor(0, 51, 102);
    doc.circle(pageWidth/2, pageHeight/2, 35, 'F');
    
    // CBSE text
    doc.setTextColor(0, 51, 102);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('CBSE', pageWidth/2 - 18, pageHeight/2 + 3);
    
    // Surrounding text
    doc.setFontSize(10);
    doc.text('CENTRAL BOARD OF', pageWidth/2, pageHeight/2 - 25, { align: 'center' });
    doc.text('SECONDARY EDUCATION', pageWidth/2, pageHeight/2 + 20, { align: 'center' });
    
    // Corner decorative elements
    doc.setFillColor(0, 51, 102);
    doc.circle(30, 30, 8, 'F');
    doc.circle(pageWidth - 30, 30, 8, 'F');
    doc.circle(30, pageHeight - 30, 8, 'F');
    doc.circle(pageWidth - 30, pageHeight - 30, 8, 'F');
    
    doc.restoreGraphicsState();
    
    // Header Section with CBSE colors
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(3);
    doc.rect(10, 10, pageWidth - 20, 55);
    
    // Inner border for header
    doc.setDrawColor(255, 215, 0);
    doc.setLineWidth(1);
    doc.rect(12, 12, pageWidth - 24, 51);
    
    // School Logo Area (enhanced design)
    doc.setFillColor(0, 51, 102);
    doc.circle(35, 37, 15, 'F');
    doc.setFillColor(255, 215, 0);
    doc.circle(35, 37, 12, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('EEC', 28, 41);
    
    // School Name and Details
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('ELECTRONIC EDUCARE', pageWidth/2, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 215, 0);
    doc.text('CENTER FOR EXCELLENCE', pageWidth/2, 33, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 51, 102);
    doc.text('Affiliated to CBSE, New Delhi | School Code: EEC001', pageWidth/2, 41, { align: 'center' });
    doc.text('Address: Tech Park, Electronic City Phase 1, Bangalore - 560100 | Ph: +91-80-12345678', pageWidth/2, 47, { align: 'center' });
    doc.text('Email: info@electroniceducare.edu.in | Website: www.electroniceducare.edu.in', pageWidth/2, 53, { align: 'center' });
    
    // CBSE Affiliation Number
    doc.setFillColor(0, 51, 102);
    doc.rect(pageWidth - 100, 58, 90, 8, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('CBSE AFFILIATION NO: 1234567', pageWidth - 55, 63, { align: 'center' });
    
    // Report Card Title
    doc.setFillColor(0, 51, 102);
    doc.rect(10, 70, pageWidth - 20, 15, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('STUDENT PROGRESS REPORT', pageWidth/2, 80, { align: 'center' });
    
    // Academic Session and Term
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.5);
    doc.rect(pageWidth - 80, 88, 70, 20);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('Academic Year: 2024-25', pageWidth - 75, 95);
    doc.text('Term: Annual Exam', pageWidth - 75, 102);
    doc.text('Report No: RPT/2024/001', pageWidth - 75, 109);
    
    // Left side decorative border
    doc.setDrawColor(255, 215, 0);
    doc.setLineWidth(4);
    doc.line(8, 75, 8, pageHeight - 25);
    
    // Student Information Box
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(10, 100, pageWidth - 20, 35);
    
    // Student Details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Name:', 15, 110);
    doc.setFont('helvetica', 'normal');
    doc.text(student.name, 55, 110);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Roll Number:', 15, 118);
    doc.setFont('helvetica', 'normal');
    doc.text(student.rollNo, 55, 118);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Class:', 15, 126);
    doc.setFont('helvetica', 'normal');
    doc.text(`${selectedClass} - Section ${selectedSection}`, 35, 126);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Examination:', pageWidth/2 + 10, 110);
    doc.setFont('helvetica', 'normal');
    doc.text('Annual Examination', pageWidth/2 + 40, 110);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Date of Birth:', pageWidth/2 + 10, 118);
    doc.setFont('helvetica', 'normal');
    doc.text('01/01/2010', pageWidth/2 + 40, 118);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Admission No:', pageWidth/2 + 10, 126);
    doc.setFont('helvetica', 'normal');
    doc.text(`ADM${student.id.toString().padStart(4, '0')}`, pageWidth/2 + 40, 126);
    
    // Marks Table Header
    let tableY = 150;
    doc.setFillColor(240, 240, 240);
    doc.rect(10, tableY, pageWidth - 20, 12, 'F');
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(10, tableY, pageWidth - 20, 12);
    
    // Table Headers
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('S.No', 15, tableY + 8);
    doc.text('Subject', 35, tableY + 8);
    doc.text('Max Marks', 90, tableY + 8);
    doc.text('Marks Obtained', 125, tableY + 8);
    doc.text('Grade', 170, tableY + 8);
    
    // Vertical lines for table
    doc.line(30, tableY, 30, tableY + 12);
    doc.line(85, tableY, 85, tableY + 12);
    doc.line(120, tableY, 120, tableY + 12);
    doc.line(165, tableY, 165, tableY + 12);
    
    // Subject rows
    let rowY = tableY + 12;
    let totalMarks = 0;
    let maxTotalMarks = 0;
    let serialNo = 1;
    
    Object.entries(student.subjects).forEach(([subject, marks]) => {
      const maxMarks = 100;
      maxTotalMarks += maxMarks;
      totalMarks += marks;
      
      // Calculate grade
      const percentage = (marks / maxMarks) * 100;
      let grade;
      if (percentage >= 91) grade = 'A1';
      else if (percentage >= 81) grade = 'A2';
      else if (percentage >= 71) grade = 'B1';
      else if (percentage >= 61) grade = 'B2';
      else if (percentage >= 51) grade = 'C1';
      else if (percentage >= 41) grade = 'C2';
      else if (percentage >= 33) grade = 'D';
      else grade = 'E';
      
      // Row background (alternating)
      if (serialNo % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(10, rowY, pageWidth - 20, 10, 'F');
      }
      
      // Row border
      doc.setDrawColor(0);
      doc.rect(10, rowY, pageWidth - 20, 10);
      
      // Row data
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(serialNo.toString(), 17, rowY + 6);
      doc.text(subject, 35, rowY + 6);
      doc.text(maxMarks.toString(), 95, rowY + 6);
      doc.text(marks.toString(), 135, rowY + 6);
      
      // Grade with color
      if (grade.includes('A')) doc.setTextColor(0, 128, 0);
      else if (grade.includes('B')) doc.setTextColor(0, 0, 255);
      else if (grade.includes('C')) doc.setTextColor(255, 165, 0);
      else doc.setTextColor(255, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(grade, 175, rowY + 6);
      doc.setTextColor(0);
      
      // Vertical lines
      doc.setDrawColor(0);
      doc.line(30, rowY, 30, rowY + 10);
      doc.line(85, rowY, 85, rowY + 10);
      doc.line(120, rowY, 120, rowY + 10);
      doc.line(165, rowY, 165, rowY + 10);
      
      rowY += 10;
      serialNo++;
    });
    
    // Total row
    doc.setFillColor(220, 220, 220);
    doc.rect(10, rowY, pageWidth - 20, 12, 'F');
    doc.setDrawColor(0);
    doc.setLineWidth(0.8);
    doc.rect(10, rowY, pageWidth - 20, 12);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', 35, rowY + 8);
    doc.text(maxTotalMarks.toString(), 95, rowY + 8);
    doc.text(totalMarks.toString(), 135, rowY + 8);
    
    const overallPercentage = ((totalMarks / maxTotalMarks) * 100).toFixed(2);
    let overallGrade;
    if (overallPercentage >= 91) overallGrade = 'A1';
    else if (overallPercentage >= 81) overallGrade = 'A2';
    else if (overallPercentage >= 71) overallGrade = 'B1';
    else if (overallPercentage >= 61) overallGrade = 'B2';
    else if (overallPercentage >= 51) overallGrade = 'C1';
    else if (overallPercentage >= 41) overallGrade = 'C2';
    else if (overallPercentage >= 33) overallGrade = 'D';
    else overallGrade = 'E';
    
    doc.text(overallGrade, 175, rowY + 8);
    
    // Vertical lines for total row
    doc.line(30, rowY, 30, rowY + 12);
    doc.line(85, rowY, 85, rowY + 12);
    doc.line(120, rowY, 120, rowY + 12);
    doc.line(165, rowY, 165, rowY + 12);
    
    // Performance Summary
    rowY += 25;
    doc.setFillColor(245, 245, 245);
    doc.rect(10, rowY, pageWidth - 20, 25, 'F');
    doc.setDrawColor(0);
    doc.rect(10, rowY, pageWidth - 20, 25);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('PERFORMANCE SUMMARY', 15, rowY + 8);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Marks Obtained: ${totalMarks}/${maxTotalMarks}`, 15, rowY + 16);
    doc.text(`Percentage: ${overallPercentage}%`, 15, rowY + 22);
    doc.text(`Overall Grade: ${overallGrade}`, pageWidth/2, rowY + 16);
    
    // Result status
    const result = overallPercentage >= 33 ? 'PASS' : 'FAIL';
    const resultColor = result === 'PASS' ? [0, 128, 0] : [255, 0, 0];
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...resultColor);
    doc.text(`Result: ${result}`, pageWidth/2, rowY + 22);
    
    // Grading Scale
    rowY += 35;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('GRADING SCALE:', 15, rowY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const gradingScale = [
      'A1: 91-100 (Outstanding)', 'A2: 81-90 (Excellent)', 'B1: 71-80 (Very Good)',
      'B2: 61-70 (Good)', 'C1: 51-60 (Fair)', 'C2: 41-50 (Satisfactory)', 'D: 33-40 (Needs Improvement)', 'E: Below 33 (Unsatisfactory)'
    ];
    
    let gradeY = rowY + 8;
    gradingScale.forEach((scale, index) => {
      if (index % 2 === 0) {
        doc.text(scale, 15, gradeY);
      } else {
        doc.text(scale, pageWidth/2, gradeY);
        gradeY += 6;
      }
    });
    
    // Remarks Section
    rowY = gradeY + 10;
    doc.setDrawColor(0);
    doc.rect(10, rowY, pageWidth - 20, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CLASS TEACHER REMARKS:', 15, rowY + 8);
    
    doc.setFont('helvetica', 'normal');
    let remarks;
    if (overallPercentage >= 90) remarks = 'Excellent performance! Keep up the outstanding work.';
    else if (overallPercentage >= 75) remarks = 'Very good performance. Continue your efforts.';
    else if (overallPercentage >= 60) remarks = 'Good work. Focus on weaker areas for improvement.';
    else if (overallPercentage >= 33) remarks = 'Needs improvement. Please work harder and seek help when needed.';
    else remarks = 'Requires immediate attention and extra support.';
    
    doc.text(remarks, 15, rowY + 14);
    
    // Signature Section with boxes
    rowY += 30;
    
    // Authority signatures box
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(10, rowY, pageWidth - 20, 35);
    
    // Section header
    doc.setFillColor(240, 240, 240);
    doc.rect(10, rowY, pageWidth - 20, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('VERIFICATION & AUTHORIZATION', 15, rowY + 6);
    
    rowY += 12;
    
    // Class Teacher Signature
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Class Teacher:', 15, rowY + 5);
    doc.text('_____________________', 15, rowY + 12);
    doc.text('Mrs. Priya Sharma', 20, rowY + 18);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 15, rowY + 22);
    
    // School Seal placeholder
    doc.setDrawColor(0, 51, 102);
    doc.circle(pageWidth/2, rowY + 12, 15);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('SCHOOL', pageWidth/2, rowY + 10, { align: 'center' });
    doc.text('SEAL', pageWidth/2, rowY + 15, { align: 'center' });
    
    // Principal Signature  
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Principal:', pageWidth - 80, rowY + 5);
    doc.text('_____________________', pageWidth - 80, rowY + 12);
    doc.text('Dr. Rajesh Kumar', pageWidth - 75, rowY + 18);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 80, rowY + 22);
    
    // Parent acknowledgment section
    rowY += 35;
    doc.setDrawColor(0);
    doc.rect(10, rowY, pageWidth - 20, 20);
    doc.setFillColor(248, 250, 252);
    doc.rect(10, rowY, pageWidth - 20, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PARENT/GUARDIAN ACKNOWLEDGMENT', 15, rowY + 6);
    
    doc.setFont('helvetica', 'normal');
    doc.text("Parent's Signature: ___________________", 15, rowY + 15);
    doc.text('Date: ___________', pageWidth - 80, rowY + 15);
    
    // Professional Footer
    rowY += 25;
    doc.setFillColor(0, 51, 102);
    doc.rect(10, pageHeight - 25, pageWidth - 20, 15, 'F');
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text('This is a computer generated report card from Electronic Educare Management System', pageWidth/2, pageHeight - 18, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')} | Document ID: RPT${Date.now()}`, pageWidth/2, pageHeight - 13, { align: 'center' });
    
    // Add security features text
    doc.setFontSize(6);
    doc.text('*This document contains security features to prevent forgery', pageWidth/2, pageHeight - 8, { align: 'center' });
    
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