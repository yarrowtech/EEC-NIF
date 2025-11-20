import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Calendar,
  Clock,
  Users,
  BookOpen,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

const Assignments = () => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Sample assignments data
  const assignments = [
    {
      id: 1,
      title: 'Advanced Calculus Problems',
      subject: 'Mathematics',
      class: 'Grade 12A',
      teacher: 'Dr. Sarah Johnson',
      dueDate: '2024-03-20',
      status: 'active',
      totalStudents: 45,
      submitted: 32,
      description: 'Complete problems 1-10 from Chapter 5 on Differential Equations.'
    },
    {
      id: 2,
      title: 'Physics Lab Report',
      subject: 'Physics',
      class: 'Grade 11B',
      teacher: 'Prof. Michael Chen',
      dueDate: '2024-03-18',
      status: 'completed',
      totalStudents: 38,
      submitted: 38,
      description: 'Write a detailed lab report on the Wave Properties experiment.'
    },
    {
      id: 3,
      title: 'Literature Analysis',
      subject: 'English',
      class: 'Grade 10A',
      teacher: 'Ms. Emily Davis',
      dueDate: '2024-03-25',
      status: 'active',
      totalStudents: 42,
      submitted: 15,
      description: 'Analyze the themes in Shakespeare\'s Macbeth (Act 1-3).'
    },
    {
      id: 4,
      title: 'Chemical Reactions Report',
      subject: 'Chemistry',
      class: 'Grade 11A',
      teacher: 'Dr. James Wilson',
      dueDate: '2024-03-15',
      status: 'overdue',
      totalStudents: 40,
      submitted: 35,
      description: 'Document the results of acid-base titration experiments.'
    },
    {
      id: 5,
      title: 'Ecosystem Study',
      subject: 'Biology',
      class: 'Grade 10B',
      teacher: 'Dr. Lisa Brown',
      dueDate: '2024-03-22',
      status: 'active',
      totalStudents: 44,
      submitted: 28,
      description: 'Research and present findings on local ecosystem biodiversity.'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'overdue':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const classMatch = selectedClass === 'all' || assignment.class.includes(selectedClass);
    const subjectMatch = selectedSubject === 'all' || assignment.subject === selectedSubject;
    const statusMatch = selectedStatus === 'all' || assignment.status === selectedStatus;
    return classMatch && subjectMatch && statusMatch;
  });

  const exportAssignmentsToPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const currentDate = new Date().toLocaleDateString();
    let yPosition = 20;
    
    // Title
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text('Assignments Report', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
    
    // Filter information
    yPosition += 8;
    const filterInfo = [];
    if (selectedClass !== 'all') filterInfo.push(`Class: ${selectedClass}`);
    if (selectedSubject !== 'all') filterInfo.push(`Subject: ${selectedSubject}`);
    if (selectedStatus !== 'all') filterInfo.push(`Status: ${selectedStatus}`);
    
    if (filterInfo.length > 0) {
      pdf.text(`Filters: ${filterInfo.join(', ')}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
    }
    
    yPosition += 15;

    // Summary
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Summary', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Total Assignments: ${filteredAssignments.length}`, 25, yPosition);
    yPosition += 6;
    pdf.text(`Active: ${filteredAssignments.filter(a => a.status === 'active').length}`, 25, yPosition);
    yPosition += 6;
    pdf.text(`Completed: ${filteredAssignments.filter(a => a.status === 'completed').length}`, 25, yPosition);
    yPosition += 6;
    pdf.text(`Overdue: ${filteredAssignments.filter(a => a.status === 'overdue').length}`, 25, yPosition);
    
    yPosition += 15;

    // Assignments Details
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Assignment Details', 20, yPosition);
    yPosition += 12;

    filteredAssignments.forEach((assignment, index) => {
      if (yPosition > 250) { // Check if we need a new page
        pdf.addPage();
        yPosition = 20;
      }
      
      // Assignment header
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text(`${index + 1}. ${assignment.title}`, 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      
      // Assignment details
      pdf.text(`Subject: ${assignment.subject}`, 25, yPosition);
      pdf.text(`Class: ${assignment.class}`, 100, yPosition);
      pdf.text(`Status: ${assignment.status}`, 150, yPosition);
      yPosition += 6;
      
      pdf.text(`Teacher: ${assignment.teacher}`, 25, yPosition);
      pdf.text(`Due Date: ${assignment.dueDate}`, 100, yPosition);
      yPosition += 6;
      
      // Description
      pdf.text(`Description: ${assignment.description}`, 25, yPosition);
      yPosition += 6;
      
      // Submission statistics
      const completionRate = Math.round((assignment.submitted / assignment.totalStudents) * 100);
      pdf.text(`Submissions: ${assignment.submitted}/${assignment.totalStudents} (${completionRate}%)`, 25, yPosition);
      yPosition += 6;
      
      yPosition += 6; // Space between assignments
    });

    // Footer
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'italic');
    pdf.text('Generated by School Management System - Assignments Module', pageWidth / 2, pdf.internal.pageSize.height - 10, { align: 'center' });

    const filterSuffix = selectedClass !== 'all' ? selectedClass.replace(/ /g, '-') : 'all';
    pdf.save(`assignments-${filterSuffix}-${currentDate.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 flex flex-col">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full bg-white/90 rounded-2xl shadow-2xl m-4 border border-yellow-200 overflow-hidden">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 p-8 bg-white/90 border-b border-yellow-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-yellow-700">Assignments</h1>
              <p className="text-gray-600 mt-2">Manage and track student assignments</p>
            </div>
            <div className="flex items-center space-x-4">
              <ClipboardList className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">All Classes</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">All Subjects</option>
                <option value="math">Mathematics</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="biology">Biology</option>
                <option value="english">English</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
                <Plus className="w-4 h-4" />
                <span>New Assignment</span>
              </button>
              <button 
                onClick={exportAssignmentsToPDF}
                className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto p-6">
            <div className="grid grid-cols-1 gap-6">
              {assignments.map((assignment) => (
                <div 
                  key={assignment.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{assignment.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(assignment.status)}`}>
                          {getStatusIcon(assignment.status)}
                          <span className="capitalize">{assignment.status}</span>
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{assignment.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <BookOpen className="w-4 h-4" />
                          <span>{assignment.subject}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{assignment.class}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{assignment.submitted}/{assignment.totalStudents} Submitted</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Assigned by: {assignment.teacher}</span>
                      <div className="flex items-center space-x-4">
                        <button className="text-blue-600 hover:text-blue-800">View Submissions</button>
                        <button className="text-blue-600 hover:text-blue-800">Send Reminder</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assignments; 