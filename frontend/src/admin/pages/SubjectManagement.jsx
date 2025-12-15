import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Users,
  Clock,
  Award,
  BarChart3,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Calendar,
  GraduationCap,
  FileText,
  MoreVertical,
  Eye,
  Download,
  Printer,
  Settings,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  CheckCircle,
  XCircle,
  Star,
  Zap,
  Layers,
  Book,
  Building,
  UserPlus,
  ChartBar,
  Filter as FilterIcon,
  Grid,
  List
} from 'lucide-react';

const SubjectManagement = ({ setShowAdminHeader }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [expandedCard, setExpandedCard] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [subjects, setSubjects] = useState([]);

  // Static sample data
  const staticSubjectsData = [
    {
      id: 1,
      subjectCode: 'MATH101',
      subjectName: 'Advanced Mathematics',
      grades: ['Grade 11', 'Grade 12'],
      category: 'STEM',
      teachers: ['Dr. Sarah Wilson', 'Prof. Michael Chen'],
      totalStudents: 145,
      hoursPerWeek: 6,
      credits: 4,
      department: 'Mathematics',
      difficulty: 'Advanced',
      prerequisites: ['Basic Algebra', 'Geometry'],
      description: 'Advanced mathematical concepts including calculus and statistics',
      performance: {
        averageScore: 92,
        passRate: 98,
        attendance: 94,
        satisfaction: 4.8
      },
      status: 'active',
      lastUpdated: '2024-01-15',
      resources: {
        textbooks: 4,
        digital: 12,
        lab: true,
        online: 8
      }
    },
    // ... (include all other subjects with similar enhanced structure)
  ];

  useEffect(() => {
    setShowAdminHeader(false);
    setSubjects(staticSubjectsData);
  }, [setShowAdminHeader]);

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return 'bg-emerald-100 text-emerald-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-purple-100 text-purple-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'STEM': return 'bg-indigo-100 text-indigo-800';
      case 'Humanities': return 'bg-amber-100 text-amber-800';
      case 'Arts': return 'bg-pink-100 text-pink-800';
      case 'Languages': return 'bg-teal-100 text-teal-800';
      case 'Social Sciences': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const SubjectCard = ({ subject }) => {
    const isExpanded = expandedCard === subject.id;
    
    return (
      <div className={`bg-white rounded-2xl border transition-all duration-300 ${
        isExpanded ? 'border-indigo-300 shadow-2xl' : 'border-gray-200 shadow-lg hover:shadow-xl'
      }`}>
        {/* Card Header */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <BookOpen size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{subject.subjectName}</h3>
                  <p className="text-sm text-gray-500">{subject.subjectCode} • {subject.department}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(subject.difficulty)}`}>
                  {subject.difficulty}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(subject.category)}`}>
                  {subject.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                  {subject.credits} Credits
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{subject.description}</p>
            </div>
            
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Edit2 size={18} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical size={18} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users size={14} className="text-blue-600" />
                <span className="font-bold text-gray-900">{subject.totalStudents}</span>
              </div>
              <span className="text-xs text-gray-500">Students</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock size={14} className="text-orange-600" />
                <span className="font-bold text-gray-900">{subject.hoursPerWeek}h</span>
              </div>
              <span className="text-xs text-gray-500">Weekly</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target size={14} className="text-green-600" />
                <span className="font-bold text-gray-900">{subject.performance.averageScore}%</span>
              </div>
              <span className="text-xs text-gray-500">Avg Score</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star size={14} className="text-yellow-600" />
                <span className="font-bold text-gray-900">{subject.performance.satisfaction}</span>
              </div>
              <span className="text-xs text-gray-500">Rating</span>
            </div>
          </div>

          {/* Expand Button */}
          <button
            onClick={() => setExpandedCard(isExpanded ? null : subject.id)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Show Details
              </>
            )}
          </button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-100 p-6 bg-gradient-to-b from-white to-gray-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <GraduationCap size={16} className="text-indigo-600" />
                    Teaching Team
                  </h4>
                  <div className="space-y-2">
                    {subject.teachers.map((teacher, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-xs font-semibold text-indigo-700">
                            {teacher.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="text-sm text-gray-700">{teacher}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar size={16} className="text-green-600" />
                    Schedule & Grades
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Weekly Hours</span>
                      <span className="font-semibold">{subject.hoursPerWeek}h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Credits</span>
                      <span className="font-semibold">{subject.credits}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Grades</span>
                      <div className="flex gap-1">
                        {subject.grades.map(grade => (
                          <span key={grade} className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {grade}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 size={16} className="text-purple-600" />
                    Performance Metrics
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Average Score</span>
                        <span className="font-semibold">{subject.performance.averageScore}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                          style={{ width: `${subject.performance.averageScore}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Pass Rate</span>
                        <span className="font-semibold">{subject.performance.passRate}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"
                          style={{ width: `${subject.performance.passRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText size={16} className="text-amber-600" />
                    Resources
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-bold text-blue-700">{subject.resources.textbooks}</div>
                      <div className="text-xs text-blue-600">Textbooks</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="font-bold text-purple-700">{subject.resources.digital}</div>
                      <div className="text-xs text-purple-600">Digital</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="font-bold text-green-700">{subject.resources.online}</div>
                      <div className="text-xs text-green-600">Modules</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="font-bold text-orange-700">
                        {subject.resources.lab ? 'Yes' : 'No'}
                      </div>
                      <div className="text-xs text-orange-600">Lab Access</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <BarChart3 size={16} />
                Analytics
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                <Calendar size={16} />
                Schedule
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Users size={16} />
                Students
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 p-4 md:p-6">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Subject Management</h1>
              <p className="text-gray-600 mt-2">Comprehensive overview and management of all academic subjects</p>
            </div>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300">
              <Plus size={20} />
              Add New Subject
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Subjects</p>
                  <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {subjects.reduce((acc, s) => acc + s.totalStudents, 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Performance</p>
                  <p className="text-2xl font-bold text-gray-900">92%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Teachers</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search subjects, teachers, departments..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <select 
                    className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white appearance-none"
                    value={filterGrade}
                    onChange={(e) => setFilterGrade(e.target.value)}
                  >
                    <option value="All">All Grades</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>

                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <select 
                    className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white appearance-none"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">Sort by Name</option>
                    <option value="students">Most Students</option>
                    <option value="performance">Best Performance</option>
                    <option value="difficulty">Difficulty Level</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}
                  >
                    <List size={20} />
                  </button>
                </div>

                <button className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Settings size={18} />
                  <span className="hidden md:inline">More Filters</span>
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">
                STEM
              </button>
              <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                Humanities
              </button>
              <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                Arts
              </button>
              <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                Languages
              </button>
              <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                All Categories
              </button>
            </div>
          </div>
        </div>

        {/* Subjects Grid/List */}
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col'} gap-6`}>
          {subjects.map(subject => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{subjects.length}</span> subjects
            <span className="mx-2">•</span>
            <span className="text-green-600 font-semibold">All systems operational</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Printer size={16} />
              Print Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download size={16} />
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectManagement;