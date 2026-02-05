import React, { useState } from 'react';
import {
  BookOpen, Plus, ChevronDown, ChevronRight, Search,
  Grid, List, Calendar, FileText, Edit3, MoreVertical,
  Download, Share, Trash2, Filter, Bookmark, Clock, User,
  X
} from 'lucide-react';

const initialLessonPlans = [
  { 
    id: 1, 
    subject: 'Mathematics', 
    title: 'Introduction to Algebra', 
    class: 'Grade 8', 
    section: 'A', 
    chapter: 'Chapter 1', 
    status: 'Published', 
    lastUpdated: '2 days ago',
    duration: '45 mins',
    objectives: ['Understand basic algebraic concepts', 'Solve simple equations', 'Apply algebraic principles'],
    resources: ['Textbook Chapter 1', 'Algebra worksheets', 'Online practice problems'],
    activities: ['Group problem-solving', 'Equation practice', 'Real-world applications']
  },
  { 
    id: 2, 
    subject: 'Physics', 
    title: "Newton's Laws of Motion", 
    class: 'Grade 10', 
    section: 'B', 
    chapter: 'Chapter 3', 
    status: 'Draft', 
    lastUpdated: '1 week ago',
    duration: '60 mins',
    objectives: ['Explain Newton\'s three laws', 'Apply laws to real-world scenarios', 'Calculate force and motion'],
    resources: ['Physics textbook', 'Motion simulation software', 'Experiment materials'],
    activities: ['Demonstrations', 'Group experiments', 'Problem-solving sessions']
  },
  { 
    id: 3, 
    subject: 'English Literature', 
    title: "Shakespeare's Hamlet", 
    class: 'Grade 12', 
    section: 'A', 
    chapter: 'Act 1', 
    status: 'Published', 
    lastUpdated: '3 days ago',
    duration: '90 mins',
    objectives: ['Analyze character motivations', 'Understand Elizabethan context', 'Interpret key soliloquies'],
    resources: ['Hamlet text', 'Historical context materials', 'Film adaptations'],
    activities: ['Role reading', 'Group discussions', 'Literary analysis writing']
  },
  { 
    id: 4, 
    subject: 'Chemistry', 
    title: 'Organic Compounds', 
    class: 'Grade 11', 
    section: 'C', 
    chapter: 'Chapter 5', 
    status: 'Published', 
    lastUpdated: '5 days ago',
    duration: '75 mins',
    objectives: ['Identify organic functional groups', 'Name simple organic compounds', 'Understand isomerism'],
    resources: ['Molecular model kits', 'Textbook Chapter 5', 'Nomenclature guide'],
    activities: ['Molecular modeling', 'Nomenclature practice', 'Group presentations']
  },
  { 
    id: 5, 
    subject: 'History', 
    title: 'World War II', 
    class: 'Grade 9', 
    section: 'A', 
    chapter: 'Chapter 8', 
    status: 'Draft', 
    lastUpdated: '1 day ago',
    duration: '50 mins',
    objectives: ['Identify key events of WWII', 'Understand geopolitical causes', 'Analyze consequences'],
    resources: ['Historical documents', 'Maps and timelines', 'Documentary clips'],
    activities: ['Timeline creation', 'Document analysis', 'Debate on key decisions']
  },
  { 
    id: 6, 
    subject: 'Biology', 
    title: 'Cell Structure', 
    class: 'Grade 10', 
    section: 'A', 
    chapter: 'Chapter 2', 
    status: 'Published', 
    lastUpdated: '4 days ago',
    duration: '55 mins',
    objectives: ['Identify cell organelles', 'Understand cellular functions', 'Compare plant and animal cells'],
    resources: ['Microscopes and slides', 'Cell diagrams', 'Interactive cell models'],
    activities: ['Microscope work', 'Cell drawing', 'Organelle function matching']
  }
];

const getStatusColor = (status) =>
  status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

const getSubjectColor = (subject) => {
  const colorMap = {
    'Mathematics': 'bg-blue-100 text-blue-800',
    'Physics': 'bg-purple-100 text-purple-800',
    'English Literature': 'bg-red-100 text-red-800',
    'Chemistry': 'bg-indigo-100 text-indigo-800',
    'History': 'bg-amber-100 text-amber-800',
    'Biology': 'bg-emerald-100 text-emerald-800'
  };
  return colorMap[subject] || 'bg-gray-100 text-gray-800';
};

const LessonPlanDashboard = () => {
  const [lessonPlans, setLessonPlans] = useState(initialLessonPlans);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [formData, setFormData] = useState({
    title: '',
    class: '',
    section: '',
    subject: '',
    chapter: '',
    date: '',
    duration: ''
  });
  const [selectedPlan, setSelectedPlan] = useState(initialLessonPlans[0]);
  const [showDetailView, setShowDetailView] = useState(true);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    const newLessonPlan = {
      id: Math.max(...lessonPlans.map(plan => plan.id), 0) + 1,
      title: formData.title || `New ${formData.subject} Lesson`,
      subject: formData.subject,
      class: formData.class,
      section: formData.section,
      chapter: formData.chapter,
      duration: formData.duration || '45 mins',
      status: 'Draft',
      lastUpdated: 'Just now',
      date: formData.date || new Date().toISOString().split('T')[0],
      objectives: ['Learning objectives will be added here'],
      resources: ['Teaching resources will be listed here'],
      activities: ['Classroom activities will be detailed here']
    };

    setLessonPlans(prev => [newLessonPlan, ...prev]);
    setSelectedPlan(newLessonPlan);
    setFormData({ 
      title: '',
      class: '', 
      section: '', 
      subject: '', 
      chapter: '', 
      date: '',
      duration: ''
    });
    setIsDropdownOpen(false);
  };

  const isFormValid = formData.class && formData.section && formData.subject && formData.chapter;

  // Filter lesson plans based on search and filters
  const filteredPlans = lessonPlans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         plan.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'All Subjects' || plan.subject === selectedSubject;
    const matchesStatus = selectedStatus === 'All Statuses' || plan.status === selectedStatus;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const subjects = ['All Subjects', ...new Set(lessonPlans.map(plan => plan.subject))];
  const statuses = ['All Statuses', 'Published', 'Draft'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Lesson Plan Manager</h1>
              <p className="text-sm text-gray-500">Create, manage and organize your lesson plans</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Prof. Johnson</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Controls Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Lesson Plan</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-6 z-10 w-96">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Create New Lesson Plan</h3>
                      <button 
                        onClick={() => setIsDropdownOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                          <select
                            value={formData.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select Subject</option>
                            {subjects.filter(s => s !== 'All Subjects').map(subject => (
                              <option key={subject} value={subject}>{subject}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            placeholder="Lesson title"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                          <input
                            type="text"
                            placeholder="Grade level"
                            value={formData.class}
                            onChange={(e) => handleInputChange('class', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                          <input
                            type="text"
                            placeholder="Section"
                            value={formData.section}
                            onChange={(e) => handleInputChange('section', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Chapter *</label>
                          <input
                            type="text"
                            placeholder="Chapter"
                            value={formData.chapter}
                            onChange={(e) => handleInputChange('chapter', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                          <input
                            type="text"
                            placeholder="e.g., 45 mins"
                            value={formData.duration}
                            onChange={(e) => handleInputChange('duration', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 pt-2">
                        <button
                          type="submit"
                          disabled={!isFormValid}
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${isFormValid ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                        >
                          Create Lesson Plan
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(false)}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
              
            </div>

            {/* Search, Filter, View */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search lesson plans..."
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    {subjects.map(subject => (
                      <option key={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                
                <div className="relative">
                  <select
                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {statuses.map(status => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Plans</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{lessonPlans.length}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Published</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{lessonPlans.filter(p => p.status === 'Published').length}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Bookmark className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Drafts</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{lessonPlans.filter(p => p.status === 'Draft').length}</h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Edit3 className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Subjects</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{subjects.length - 1}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Lesson Plan List */}
          <div className={`${showDetailView ? 'lg:w-2/5' : 'w-full'} bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden`}>
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Lesson Plans ({filteredPlans.length})</h2>
              <button 
                onClick={() => setShowDetailView(!showDetailView)}
                className="lg:hidden text-blue-600 text-sm font-medium"
              >
                {showDetailView ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 380px)' }}>
              {filteredPlans.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredPlans.map(plan => (
                    <div
                      key={plan.id}
                      className={`p-4 cursor-pointer transition-colors ${selectedPlan?.id === plan.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${getSubjectColor(plan.subject)}`}>
                              {plan.subject}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(plan.status)}`}>
                              {plan.status}
                            </span>
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 mb-1">{plan.title}</h3>
                          
                          <div className="flex items-center text-sm text-gray-500 space-x-3">
                            <span>{plan.class} - Section {plan.section}</span>
                            <span>•</span>
                            <span>{plan.chapter}</span>
                          </div>
                          
                          <div className="flex items-center mt-2 text-xs text-gray-400 space-x-3">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {plan.duration}
                            </span>
                            <span>Updated {plan.lastUpdated}</span>
                          </div>
                        </div>
                        
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-gray-500 font-medium">No lesson plans found</h3>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Lesson Plan Detail */}
          {showDetailView && (
            <div className="lg:w-3/5 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Lesson Plan Details</h2>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-green-600 rounded-lg hover:bg-green-50">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-purple-600 rounded-lg hover:bg-purple-50">
                    <Share className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 380px)' }}>
                {selectedPlan ? (
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPlan.status)}`}>
                            {selectedPlan.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSubjectColor(selectedPlan.subject)}`}>
                            {selectedPlan.subject}
                          </span>
                        </div>
                        
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedPlan.title}</h1>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1" />
                            {selectedPlan.class} - Section {selectedPlan.section}
                          </span>
                          <span>•</span>
                          <span>{selectedPlan.chapter}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {selectedPlan.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                          <Bookmark className="w-4 h-4 mr-2" />
                          Learning Objectives
                        </h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                          {selectedPlan.objectives.map((obj, index) => (
                            <li key={index}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Teaching Resources
                        </h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                          {selectedPlan.resources.map((res, index) => (
                            <li key={index}>{res}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                      <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Classroom Activities
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                        {selectedPlan.activities.map((act, index) => (
                          <li key={index}>{act}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="text-xs text-gray-400 flex justify-between items-center">
                      <span>Last updated: {selectedPlan.lastUpdated}</span>
                      <span>Created by: Prof. Johnson</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <FileText className="w-12 h-12 mb-3" />
                    <p>Select a lesson plan to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPlanDashboard;
