import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  Edit3, 
  Trash2, 
  Download, 
  Upload,
  Target,
  CheckCircle,
  Users,
  FileText,
  Star,
  Copy,
  Share2
} from 'lucide-react';
import LessonPlanForm from '../components/LessonPlanForm';

const LessonPlanPage = ({setShowAdminHeader}) => {
  const [currentView, setCurrentView] = useState('grid');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // making the admin header invisible
    useEffect(() => {
      setShowAdminHeader(false)
    }, [])

  // Sample lesson plans data
  const lessonPlans = [
    {
      id: 1,
      title: "Introduction to Quadratic Equations",
      subject: "Mathematics",
      grade: "Grade 10",
      teacher: "Dr. Sarah Johnson",
      duration: "45 minutes",
      date: "2025-06-18",
      status: "Published",
      objectives: [
        "Understand the definition of quadratic equations",
        "Learn to identify quadratic equations",
        "Solve simple quadratic equations"
      ],
      materials: ["Whiteboard", "Graphing calculator", "Worksheets"],
      description: "This lesson introduces students to quadratic equations, covering basic concepts and solving techniques.",
      tags: ["algebra", "equations", "mathematics"],
      rating: 4.8,
      views: 245,
      lastModified: "2025-06-15"
    },
    {
      id: 2,
      title: "Newton's Laws of Motion",
      subject: "Physics",
      grade: "Grade 11",
      teacher: "Prof. Michael Chen",
      duration: "60 minutes",
      date: "2025-06-19",
      status: "Draft",
      objectives: [
        "Explain Newton's three laws of motion",
        "Apply laws to real-world scenarios",
        "Conduct practical experiments"
      ],
      materials: ["Lab equipment", "Demonstration props", "Video clips"],
      description: "Comprehensive lesson on Newton's laws with hands-on experiments and real-world applications.",
      tags: ["physics", "motion", "laws", "experiments"],
      rating: 4.9,
      views: 189,
      lastModified: "2025-06-16"
    },
    {
      id: 3,
      title: "Shakespeare's Romeo and Juliet - Act 1",
      subject: "English Literature",
      grade: "Grade 12",
      teacher: "Ms. Emily Davis",
      duration: "50 minutes",
      date: "2025-06-20",
      status: "Published",
      objectives: [
        "Analyze character development in Act 1",
        "Understand themes of love and conflict",
        "Examine Shakespeare's language techniques"
      ],
      materials: ["Play text", "Audio recordings", "Character worksheets"],
      description: "Deep dive into Act 1 of Romeo and Juliet, focusing on character analysis and thematic elements.",
      tags: ["literature", "shakespeare", "drama", "analysis"],
      rating: 4.7,
      views: 312,
      lastModified: "2025-06-14"
    },
    {
      id: 4,
      title: "Organic Chemistry: Hydrocarbons",
      subject: "Chemistry",
      grade: "Grade 12",
      teacher: "Mr. David Wilson",
      duration: "70 minutes",
      date: "2025-06-21",
      status: "Published",
      objectives: [
        "Classify different types of hydrocarbons",
        "Understand molecular structures",
        "Practice naming conventions"
      ],
      materials: ["Molecular models", "Periodic table", "Structure diagrams"],
      description: "Comprehensive study of hydrocarbon compounds including alkanes, alkenes, and alkynes.",
      tags: ["chemistry", "organic", "hydrocarbons", "molecules"],
      rating: 4.6,
      views: 156,
      lastModified: "2025-06-13"
    },
    {
      id: 5,
      title: "Cell Division: Mitosis and Meiosis",
      subject: "Biology",
      grade: "Grade 11",
      teacher: "Dr. Lisa Brown",
      duration: "55 minutes",
      date: "2025-06-22",
      status: "Published",
      objectives: [
        "Compare mitosis and meiosis processes",
        "Identify phases of cell division",
        "Understand biological significance"
      ],
      materials: ["Microscopes", "Cell slides", "Diagrams", "Models"],
      description: "Interactive lesson on cell division processes with microscope observations and detailed comparisons.",
      tags: ["biology", "cells", "division", "mitosis", "meiosis"],
      rating: 4.8,
      views: 203,
      lastModified: "2025-06-12"
    },
    {
      id: 6,
      title: "World War II: Causes and Consequences",
      subject: "History",
      grade: "Grade 10",
      teacher: "Ms. Jennifer Lee",
      duration: "45 minutes",
      date: "2025-06-23",
      status: "Draft",
      objectives: [
        "Analyze causes of World War II",
        "Examine key events and turning points",
        "Assess global consequences"
      ],
      materials: ["Historical maps", "Primary sources", "Timeline charts"],
      description: "Comprehensive analysis of WWII covering political, social, and economic factors.",
      tags: ["history", "world war", "global", "analysis"],
      rating: 4.5,
      views: 178,
      lastModified: "2025-06-17"
    }
  ];

  const subjects = ['all', 'Mathematics', 'Physics', 'English Literature', 'Chemistry', 'Biology', 'History'];

  const getSubjectColor = (subject) => {
    const colors = {
      'Mathematics': 'bg-blue-100 border-blue-300 text-blue-800',
      'Physics': 'bg-purple-100 border-purple-300 text-purple-800',
      'English Literature': 'bg-green-100 border-green-300 text-green-800',
      'Chemistry': 'bg-orange-100 border-orange-300 text-orange-800',
      'Biology': 'bg-pink-100 border-pink-300 text-pink-800',
      'History': 'bg-yellow-100 border-yellow-300 text-yellow-800'
    };
    return colors[subject] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  const getStatusColor = (status) => {
    return status === 'Published' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const filteredLessonPlans = lessonPlans.filter(plan => {
    const matchesSubject = selectedSubject === 'all' || plan.subject === selectedSubject;
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setShowCreateModal(true);
  };

  const handleDeletePlan = (planId) => {
    // Here you would typically make an API call to delete the lesson plan
    console.log('Deleting plan:', planId);
  };

  const handleFormSubmit = (formData) => {
    if (editingPlan) {
      // Handle edit
      console.log('Updating lesson plan:', formData);
    } else {
      // Handle create
      console.log('Creating new lesson plan:', formData);
    }
    setShowCreateModal(false);
    setEditingPlan(null);
  };

  const handleFormCancel = () => {
    setShowCreateModal(false);
    setEditingPlan(null);
  };

  const exportLessonPlansToPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const currentDate = new Date().toLocaleDateString();
    let yPosition = 20;
    
    // Title
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text('Lesson Plans Report', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
    
    if (selectedSubject !== 'all') {
      yPosition += 6;
      pdf.text(`Subject: ${selectedSubject}`, pageWidth / 2, yPosition, { align: 'center' });
    }
    
    yPosition += 15;

    // Summary
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Summary', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Total Lesson Plans: ${lessonPlans.length}`, 25, yPosition);
    yPosition += 6;
    pdf.text(`Published: ${lessonPlans.filter(plan => plan.status === 'Published').length}`, 25, yPosition);
    yPosition += 6;
    pdf.text(`Draft: ${lessonPlans.filter(plan => plan.status === 'Draft').length}`, 25, yPosition);
    yPosition += 6;
    pdf.text(`Under Review: ${lessonPlans.filter(plan => plan.status === 'Under Review').length}`, 25, yPosition);
    
    yPosition += 15;

    // Lesson Plans Details
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Lesson Plans Details', 20, yPosition);
    yPosition += 12;

    const plansToExport = filteredLessonPlans;
    
    plansToExport.forEach((plan, index) => {
      if (yPosition > 250) { // Check if we need a new page
        pdf.addPage();
        yPosition = 20;
      }
      
      // Plan header
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text(`${index + 1}. ${plan.title}`, 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      
      // Plan details
      pdf.text(`Subject: ${plan.subject}`, 25, yPosition);
      pdf.text(`Grade: ${plan.grade}`, 100, yPosition);
      pdf.text(`Status: ${plan.status}`, 150, yPosition);
      yPosition += 6;
      
      pdf.text(`Teacher: ${plan.teacher}`, 25, yPosition);
      pdf.text(`Duration: ${plan.duration}`, 100, yPosition);
      pdf.text(`Date: ${plan.date}`, 150, yPosition);
      yPosition += 6;
      
      // Description
      pdf.text(`Description: ${plan.description}`, 25, yPosition);
      yPosition += 6;
      
      // Objectives
      if (plan.objectives && plan.objectives.length > 0) {
        pdf.text('Learning Objectives:', 25, yPosition);
        yPosition += 4;
        plan.objectives.forEach(objective => {
          pdf.text(`  • ${objective}`, 30, yPosition);
          yPosition += 4;
        });
      }
      
      // Activities
      if (plan.activities && plan.activities.length > 0) {
        yPosition += 2;
        pdf.text('Activities:', 25, yPosition);
        yPosition += 4;
        plan.activities.forEach(activity => {
          pdf.text(`  • ${activity.title} (${activity.duration})`, 30, yPosition);
          yPosition += 4;
        });
      }
      
      // Assessment
      if (plan.assessment) {
        yPosition += 2;
        pdf.text(`Assessment: ${plan.assessment}`, 25, yPosition);
        yPosition += 6;
      }
      
      // Resources
      if (plan.resources && plan.resources.length > 0) {
        pdf.text('Resources:', 25, yPosition);
        yPosition += 4;
        plan.resources.forEach(resource => {
          pdf.text(`  • ${resource}`, 30, yPosition);
          yPosition += 4;
        });
      }
      
      yPosition += 8; // Space between lesson plans
    });

    // Footer
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'italic');
    pdf.text('Generated by School Management System - Lesson Plan Module', pageWidth / 2, pdf.internal.pageSize.height - 10, { align: 'center' });

    const subjectSuffix = selectedSubject === 'all' ? 'all-subjects' : selectedSubject.replace(/ /g, '-');
    pdf.save(`lesson-plans-${subjectSuffix}-${currentDate.replace(/\//g, '-')}.pdf`);
  };

  const CreateLessonModal = () => (
    showCreateModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <LessonPlanForm
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            initialData={editingPlan}
          />
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-400 to-red-500 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Lesson Plans</h1>
            <p className="text-red-100">Create, manage, and organize your teaching materials</p>
          </div>
          <div className="flex items-center space-x-4">
            <BookOpen className="w-12 h-12 text-red-200" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search lesson plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentView('grid')}
                className={`px-3 py-1 rounded-md transition-all ${
                  currentView === 'grid' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setCurrentView('list')}
                className={`px-3 py-1 rounded-md transition-all ${
                  currentView === 'list' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                List
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
            <button 
              onClick={exportLessonPlansToPDF}
              className="flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button 
              onClick={() => {
                setEditingPlan(null);
                setShowCreateModal(true);
              }}
              className="flex items-center space-x-2 bg-blue-600 text-black px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Lesson Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Lesson Plans</p>
              <p className="text-2xl font-bold text-gray-900">{lessonPlans.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600">
                {lessonPlans.filter(plan => plan.status === 'Published').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-yellow-600">
                {lessonPlans.filter(plan => plan.status === 'Draft').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Edit3 className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Rating</p>
              <p className="text-2xl font-bold text-purple-600">4.7</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Plans Grid/List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {currentView === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessonPlans.map(plan => (
                <div key={plan.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(plan.subject)} mb-2`}>
                        {plan.subject}
                      </span>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {plan.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{plan.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>{plan.teacher}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{plan.grade}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{plan.duration}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{new Date(plan.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span>{plan.rating}</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{plan.views}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditPlan(plan)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Teacher</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Grade</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Rating</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLessonPlans.map(plan => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{plan.title}</h4>
                        <p className="text-sm text-gray-600">{plan.duration}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(plan.subject)}`}>
                        {plan.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{plan.teacher}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{plan.grade}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(plan.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm">{plan.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditPlan(plan)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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
        )}
      </div>

      {/* Create/Edit Lesson Modal */}
      <CreateLessonModal />
    </div>
  );
};

export default LessonPlanPage;