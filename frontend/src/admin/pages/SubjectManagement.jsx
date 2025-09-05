import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  BookOpen,
  Users,
  Star,
  Award,
  Eye,
  MoreVertical,
  Edit2,
  Clock,
  TrendingUp,
  Target,
  CheckCircle,
  AlertCircle,
  FileText,
  GraduationCap,
  BarChart3,
  Activity,
  DollarSign,
  Timer,
  Briefcase,
  Shield,
  UserCheck,
  Baby,
  Book,
  Zap,
  PieChart,
  TrendingDown
} from 'lucide-react';

const SubjectManagement = ({setShowAdminHeader}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('All');
  const [subjects, setSubjects] = useState([]);

  // Filter subjects based on search and grade
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.teachers.some(teacher => teacher.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         subject.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'All' || subject.grades.includes(filterGrade);
    return matchesSearch && matchesGrade;
  });

  // Helper functions for enhanced features
  const getSubjectPerformance = () => {
    return {
      averageScore: Math.floor(Math.random() * 20) + 70, // 70-90
      passRate: Math.floor(Math.random() * 15) + 85, // 85-100
      attendanceRate: Math.floor(Math.random() * 10) + 90, // 90-100
      completionRate: Math.floor(Math.random() * 15) + 85, // 85-100
      assignmentsCompleted: Math.floor(Math.random() * 50) + 80, // 80-130
      totalAssessments: Math.floor(Math.random() * 10) + 15 // 15-25
    };
  };

  const getUpcomingActivities = () => {
    const activities = [
      { type: 'Quiz', date: '2024-02-05', topic: 'Chapter 5' },
      { type: 'Assignment', date: '2024-02-08', topic: 'Lab Report' },
      { type: 'Exam', date: '2024-02-15', topic: 'Mid-term' },
      { type: 'Project', date: '2024-02-20', topic: 'Group Project' }
    ];
    return activities.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const getResourcesInfo = () => {
    return {
      textbooks: Math.floor(Math.random() * 3) + 2, // 2-5
      digitalResources: Math.floor(Math.random() * 10) + 5, // 5-15
      labEquipment: Math.floor(Math.random() * 20) + 10, // 10-30
      onlineModules: Math.floor(Math.random() * 8) + 3 // 3-11
    };
  };

  const getDifficultyLevel = () => {
    const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    return levels[Math.floor(Math.random() * levels.length)];
  };

  // Static sample data for demonstration
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
      description: 'Advanced mathematical concepts including calculus and statistics'
    },
    {
      id: 2,
      subjectCode: 'PHYS201',
      subjectName: 'Physics',
      grades: ['Grade 11', 'Grade 12'],
      category: 'STEM',
      teachers: ['Dr. Robert Johnson', 'Dr. Emily Davis'],
      totalStudents: 128,
      hoursPerWeek: 5,
      credits: 4,
      department: 'Sciences',
      difficulty: 'Advanced',
      prerequisites: ['Basic Mathematics'],
      description: 'Comprehensive physics covering mechanics, thermodynamics, and electricity'
    },
    {
      id: 3,
      subjectCode: 'CHEM151',
      subjectName: 'Chemistry',
      grades: ['Grade 10', 'Grade 11', 'Grade 12'],
      category: 'STEM',
      teachers: ['Dr. Lisa Brown', 'Prof. James Miller'],
      totalStudents: 134,
      hoursPerWeek: 5,
      credits: 4,
      department: 'Sciences',
      difficulty: 'Intermediate',
      prerequisites: ['Basic Science'],
      description: 'Organic and inorganic chemistry with laboratory experiments'
    },
    {
      id: 4,
      subjectCode: 'BIO101',
      subjectName: 'Biology',
      grades: ['Grade 9', 'Grade 10', 'Grade 11'],
      category: 'STEM',
      teachers: ['Dr. Amanda Garcia', 'Prof. Thomas Anderson'],
      totalStudents: 156,
      hoursPerWeek: 4,
      credits: 3,
      department: 'Sciences',
      difficulty: 'Intermediate',
      prerequisites: ['None'],
      description: 'Study of living organisms, genetics, and ecosystems'
    },
    {
      id: 5,
      subjectCode: 'ENG201',
      subjectName: 'English Literature',
      grades: ['Grade 11', 'Grade 12'],
      category: 'Humanities',
      teachers: ['Prof. Jennifer Lee', 'Dr. David Wilson'],
      totalStudents: 142,
      hoursPerWeek: 4,
      credits: 3,
      department: 'English',
      difficulty: 'Intermediate',
      prerequisites: ['Basic English'],
      description: 'Analysis of classic and contemporary literature'
    },
    {
      id: 6,
      subjectCode: 'HIST101',
      subjectName: 'World History',
      grades: ['Grade 9', 'Grade 10'],
      category: 'Humanities',
      teachers: ['Prof. Maria Rodriguez', 'Dr. John Smith'],
      totalStudents: 167,
      hoursPerWeek: 3,
      credits: 3,
      department: 'Social Studies',
      difficulty: 'Beginner',
      prerequisites: ['None'],
      description: 'Comprehensive study of world civilizations and events'
    },
    {
      id: 7,
      subjectCode: 'CS101',
      subjectName: 'Computer Science',
      grades: ['Grade 10', 'Grade 11', 'Grade 12'],
      category: 'STEM',
      teachers: ['Dr. Kevin Brown', 'Prof. Rachel Green'],
      totalStudents: 98,
      hoursPerWeek: 4,
      credits: 3,
      department: 'Technology',
      difficulty: 'Intermediate',
      prerequisites: ['Basic Mathematics'],
      description: 'Programming fundamentals and computer systems'
    },
    {
      id: 8,
      subjectCode: 'ART201',
      subjectName: 'Fine Arts',
      grades: ['Grade 9', 'Grade 10', 'Grade 11'],
      category: 'Arts',
      teachers: ['Prof. Lisa Taylor', 'Dr. Michael Brown'],
      totalStudents: 89,
      hoursPerWeek: 3,
      credits: 2,
      department: 'Arts',
      difficulty: 'Beginner',
      prerequisites: ['None'],
      description: 'Drawing, painting, and artistic expression techniques'
    },
    {
      id: 9,
      subjectCode: 'PE101',
      subjectName: 'Physical Education',
      grades: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
      category: 'Health',
      teachers: ['Coach Sarah Johnson', 'Coach Robert Martinez'],
      totalStudents: 234,
      hoursPerWeek: 2,
      credits: 1,
      department: 'Physical Education',
      difficulty: 'Beginner',
      prerequisites: ['Medical Clearance'],
      description: 'Physical fitness, sports, and health education'
    },
    {
      id: 10,
      subjectCode: 'MUS101',
      subjectName: 'Music Theory',
      grades: ['Grade 9', 'Grade 10', 'Grade 11'],
      category: 'Arts',
      teachers: ['Prof. Emily Rodriguez', 'Dr. James Anderson'],
      totalStudents: 76,
      hoursPerWeek: 2,
      credits: 2,
      department: 'Arts',
      difficulty: 'Intermediate',
      prerequisites: ['Basic Music'],
      description: 'Music composition, theory, and performance'
    },
    {
      id: 11,
      subjectCode: 'ECON101',
      subjectName: 'Economics',
      grades: ['Grade 11', 'Grade 12'],
      category: 'Social Sciences',
      teachers: ['Prof. Jennifer Foster', 'Dr. Thomas Wright'],
      totalStudents: 112,
      hoursPerWeek: 3,
      credits: 3,
      department: 'Social Studies',
      difficulty: 'Intermediate',
      prerequisites: ['Basic Mathematics'],
      description: 'Microeconomics, macroeconomics, and market analysis'
    },
    {
      id: 12,
      subjectCode: 'LANG201',
      subjectName: 'Spanish Language',
      grades: ['Grade 10', 'Grade 11', 'Grade 12'],
      category: 'Languages',
      teachers: ['Prof. Amanda Miller', 'Dr. Carlos Hernandez'],
      totalStudents: 94,
      hoursPerWeek: 3,
      credits: 2,
      department: 'Languages',
      difficulty: 'Intermediate',
      prerequisites: ['None'],
      description: 'Spanish grammar, conversation, and cultural studies'
    }
  ];

  // making the admin header invisible
  useEffect(() => {
    setShowAdminHeader(false)

    // Set static data instead of API call for demonstration
    setSubjects(staticSubjectsData);

    // Uncomment below for actual API integration
    /*
    fetch(`${import.meta.env.VITE_API_URL}/api/subject/fetch`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch subjects');
      }
      return res.json();
    }).then(data => {
      setSubjects(data)
    }).catch(err => {
      console.error("Error fetching subjects: ", err);
    })
    */
  }, [setShowAdminHeader])

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 via-indigo-100 to-purple-100 flex flex-col">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full bg-white/90 rounded-2xl shadow-2xl m-4 border border-indigo-200 overflow-hidden">
        
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 p-8 bg-white/90 border-b border-indigo-100">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold text-indigo-700">Subject Management</h1>
                <p className="text-gray-600 mt-2">Manage curriculum, performance tracking, and academic resources</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <BookOpen className="w-8 h-8 text-indigo-500" />
                  <span className="text-sm font-semibold text-indigo-600 mt-1">{subjects.length}</span>
                  <span className="text-xs text-gray-500">Total Subjects</span>
                </div>
                <div className="flex flex-col items-center">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                  <span className="text-sm font-semibold text-green-600 mt-1">87%</span>
                  <span className="text-xs text-gray-500">Avg Performance</span>
                </div>
                <div className="flex flex-col items-center">
                  <Users className="w-8 h-8 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-600 mt-1">{subjects.reduce((acc, s) => acc + s.totalStudents, 0)}</span>
                  <span className="text-xs text-gray-500">Total Enrolled</span>
                </div>
                <div className="flex flex-col items-center">
                  <Zap className="w-8 h-8 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-600 mt-1">{subjects.reduce((acc, s) => acc + s.hoursPerWeek, 0)}</span>
                  <span className="text-xs text-gray-500">Weekly Hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search subjects, teachers, or categories..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
            >
              <option value="All">All Grades</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
            <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">All Categories</option>
              <option value="STEM">STEM</option>
              <option value="Humanities">Humanities</option>
              <option value="Arts">Arts</option>
              <option value="Languages">Languages</option>
              <option value="Social Sciences">Social Sciences</option>
              <option value="Health">Health & PE</option>
            </select>
            <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Difficulty Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
            <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Department</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Sciences">Sciences</option>
              <option value="English">English</option>
              <option value="Social Studies">Social Studies</option>
              <option value="Technology">Technology</option>
              <option value="Arts">Arts</option>
            </select>
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-indigo-50 z-10">
                <tr>
                  <th className="border-b border-indigo-100 px-6 py-3 text-left text-sm font-semibold text-indigo-800">Subject Info</th>
                  <th className="border-b border-indigo-100 px-6 py-3 text-left text-sm font-semibold text-indigo-800">Performance</th>
                  <th className="border-b border-indigo-100 px-6 py-3 text-left text-sm font-semibold text-indigo-800">Upcoming Activities</th>
                  <th className="border-b border-indigo-100 px-6 py-3 text-left text-sm font-semibold text-indigo-800">Teachers & Students</th>
                  <th className="border-b border-indigo-100 px-6 py-3 text-left text-sm font-semibold text-indigo-800">Schedule & Credits</th>
                  <th className="border-b border-indigo-100 px-6 py-3 text-left text-sm font-semibold text-indigo-800">Resources</th>
                  <th className="border-b border-indigo-100 px-6 py-3 text-left text-sm font-semibold text-indigo-800">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredSubjects.map((subject) => (
                  <tr 
                    key={subject.id}
                    className="hover:bg-indigo-50 transition-colors border-b border-gray-100"
                  >
                    {/* Subject Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center font-semibold text-indigo-700 flex-shrink-0">
                          {subject.subjectName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{subject.subjectName}</div>
                          <div className="text-xs text-gray-500 font-mono">Code: {subject.subjectCode}</div>
                          <div className="text-xs text-gray-600">{subject.category} • {subject.department}</div>
                          <div className="text-xs text-gray-500">{subject.difficulty} Level</div>
                        </div>
                      </div>
                    </td>

                    {/* Performance Metrics */}
                    <td className="px-6 py-4">
                      {(() => {
                        const performance = getSubjectPerformance();
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Target size={14} className="text-green-600" />
                                <span className="text-sm font-semibold text-green-600">{performance.averageScore}%</span>
                              </div>
                              <span className="text-xs text-gray-500">Avg Score</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Activity size={14} className="text-blue-600" />
                                <span className="text-sm font-semibold text-blue-600">{performance.passRate}%</span>
                              </div>
                              <span className="text-xs text-gray-500">Pass Rate</span>
                            </div>
                            <div className="text-xs text-gray-600">{performance.assignmentsCompleted} assignments</div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Upcoming Activities */}
                    <td className="px-6 py-4">
                      {(() => {
                        const activities = getUpcomingActivities();
                        if (activities.length === 0) {
                          return <span className="text-sm text-gray-400 italic">No upcoming activities</span>;
                        }
                        return (
                          <div className="space-y-1 max-w-[180px]">
                            {activities.slice(0, 2).map((activity, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Calendar size={12} className="text-purple-600" />
                                <span className="text-xs text-gray-700">{activity.type}</span>
                                <span className="text-xs bg-purple-100 text-purple-800 px-1 rounded">{activity.topic}</span>
                              </div>
                            ))}
                            {activities.length > 2 && (
                              <div className="text-xs text-gray-500">+{activities.length - 2} more</div>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    {/* Teachers & Students */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <GraduationCap size={14} className="text-indigo-600" />
                          <span className="font-medium text-gray-900">Teachers:</span>
                        </div>
                        {subject.teachers.slice(0, 2).map((teacher, idx) => (
                          <div key={idx} className="text-sm text-gray-600 ml-6">{teacher}</div>
                        ))}
                        {subject.teachers.length > 2 && (
                          <div className="text-xs text-gray-500 ml-6">+{subject.teachers.length - 2} more</div>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <Users size={14} className="text-blue-600" />
                          <span className="font-semibold text-gray-900">{subject.totalStudents}</span>
                          <span className="text-xs text-gray-500">enrolled</span>
                        </div>
                      </div>
                    </td>

                    {/* Schedule & Credits */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-orange-600" />
                          <span className="font-semibold text-gray-900">{subject.hoursPerWeek} hrs/week</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award size={14} className="text-yellow-600" />
                          <span className="font-semibold text-gray-900">{subject.credits} credits</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Grades: {subject.grades.join(', ')}
                        </div>
                        {subject.prerequisites.length > 0 && (
                          <div className="text-xs text-gray-500">
                            Prerequisites: {subject.prerequisites.join(', ')}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Resources */}
                    <td className="px-6 py-4">
                      {(() => {
                        const resources = getResourcesInfo();
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Book size={14} className="text-green-600" />
                              <span className="text-sm font-semibold text-gray-900">{resources.textbooks}</span>
                              <span className="text-xs text-gray-500">textbooks</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText size={14} className="text-blue-600" />
                              <span className="text-sm font-semibold text-gray-900">{resources.digitalResources}</span>
                              <span className="text-xs text-gray-500">digital</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {resources.onlineModules} online modules
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Enhanced Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button 
                          className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded" 
                          title="View Performance Analytics"
                        >
                          <BarChart3 size={14} />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded" 
                          title="Curriculum Management"
                        >
                          <BookOpen size={14} />
                        </button>
                        <button 
                          className="text-purple-600 hover:text-purple-800 p-1 hover:bg-purple-50 rounded" 
                          title="Schedule & Timetable"
                        >
                          <Calendar size={14} />
                        </button>
                        <button 
                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded" 
                          title="Student Enrollment"
                        >
                          <Users size={14} />
                        </button>
                        <button 
                          className="text-orange-600 hover:text-orange-800 p-1 hover:bg-orange-50 rounded" 
                          title="Edit Subject"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-50 rounded" 
                          title="More Options"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fixed Footer Section */}
        <div className="flex-shrink-0 p-8 pt-4 bg-white/90 border-t border-indigo-100">
          <div className="flex items-center justify-between">
            <div className="text-gray-600">
              Showing {filteredSubjects.length} of {subjects.length} subjects
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors">Previous</button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectManagement;