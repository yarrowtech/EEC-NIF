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
  Timer
} from 'lucide-react';
import CredentialGeneratorButton from './components/CredentialGeneratorButton';

const Teachers = ({setShowAdminHeader}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [teachers, setTeachers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    mobile: '',
    subject: '',
    department: '',
    experience: '',
    qualification: '',
    students: '',
    rating: '',
    status: 'Active',
    joinDate: '',
    location: '',
    avatar: ''
  });

  // Filter teachers based on search and status
  const filteredTeachers = teachers.filter(teacher => {
    const teacherName = (teacher.name || '').toLowerCase();
    const teacherSubject = (teacher.subject || '').toLowerCase();
    const teacherEmail = (teacher.email || '').toLowerCase();
    const matchesSearch = teacherName.includes(searchTerm.toLowerCase()) ||
                         teacherSubject.includes(searchTerm.toLowerCase()) ||
                         teacherEmail.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || teacher.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Helper functions for enhanced features
  const getPerformanceMetrics = () => {
    // Mock performance data - integrate with actual metrics
    return {
      studentSatisfaction: Math.floor(Math.random() * 20) + 80, // 80-100
      classAttendance: Math.floor(Math.random() * 15) + 85, // 85-100
      lessonCompletionRate: Math.floor(Math.random() * 10) + 90, // 90-100
      avgGradeImprovement: Math.floor(Math.random() * 20) + 10, // 10-30%
      totalStudents: Math.floor(Math.random() * 50) + 20, // 20-70
      activeClasses: Math.floor(Math.random() * 5) + 3 // 3-8
    };
  };

  const getTodaySchedule = () => {
    const schedules = [
      { time: '09:00-10:00', subject: 'Mathematics', class: 'X-A', room: '101' },
      { time: '10:00-11:00', subject: 'Physics', class: 'XI-B', room: '205' },
      { time: '11:30-12:30', subject: 'Chemistry', class: 'XII-A', room: '301' },
      { time: '14:00-15:00', subject: 'Biology', class: 'IX-C', room: '102' }
    ];
    return schedules.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const getCertifications = () => {
    const allCerts = [
      { name: 'M.Ed in Mathematics', year: '2018', status: 'verified' },
      { name: 'B.Ed', year: '2015', status: 'verified' },
      { name: 'Teaching Excellence Certificate', year: '2022', status: 'pending' },
      { name: 'Digital Teaching Methods', year: '2023', status: 'verified' }
    ];
    return allCerts.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const getRecentEvaluations = () => {
    return {
      lastEvaluation: '2024-01-15',
      overallRating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      evaluatedBy: 'Principal',
      nextEvaluation: '2024-07-15',
      improvements: Math.floor(Math.random() * 3) + 1
    };
  };

  // making the admin header invisible
  useEffect(() => {
    setShowAdminHeader(false)

    fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/get-teachers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch teachers');
      }
      return res.json();
    })
    .then(data => {
      const normalized = (Array.isArray(data) ? data : []).map((teacher, idx) => ({
        ...teacher,
        id: teacher._id || teacher.id || idx,
        name: teacher.name || 'Unnamed Teacher',
        email: teacher.email || '—',
        mobile: teacher.mobile || '—',
        subject: teacher.subject || '—',
        department: teacher.department || '—',
        qualification: teacher.qualification || '—',
        joiningDate: teacher.joiningDate || '',
        empId: teacher.empId ?? '—',
        status: teacher.status || 'Active'
      }));
      setTeachers(normalized)
    })
    .catch(err => {
      console.error('Error fetching teachers:', err);
    });
  }, [setShowAdminHeader])

  const handleAddTeacherChange = (e) => {
    const { name, value } = e.target;
    setNewTeacher(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTeacherSubmit = async (e) => {
    e.preventDefault();
    // Here you would send newTeacher to backend or update state
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/teacher/auth/register`,{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(newTeacher)
        })
        const data = await res.json();
        if (!res.ok) { 
          console.error('Registration failed:', data);
          throw new Error('Registration failed');
        }
      console.log('New teacher added:', data);
      setShowAddForm(false);
      // Optionally reset form
      setNewTeacher({
        name: '', email: '', mobile: '', subject: '', department: '', experience: '', qualification: '', joiningDate: '', address: '', pinCode: '', gender: ''
      });
    }
    catch (error) {
      console.error('Error adding teacher:', error);
    }
  };


  return (
    <div className="h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 flex flex-col">
      <div className="flex-1 flex flex-col  mx-auto w-full bg-white/90 border border-yellow-200 overflow-hidden">
        
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 p-8 bg-white/90 border-b border-yellow-100">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold text-yellow-700">Teacher Management</h1>
                <p className="text-gray-600 mt-2">Manage teaching staff performance, schedules, and evaluations</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <Users className="w-8 h-8 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-600 mt-1">{teachers.length}</span>
                  <span className="text-xs text-gray-500">Total Teachers</span>
                </div>
                <div className="flex flex-col items-center">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                  <span className="text-sm font-semibold text-green-600 mt-1">88%</span>
                  <span className="text-xs text-gray-500">Avg Performance</span>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="w-8 h-8 text-purple-500" />
                  <span className="text-sm font-semibold text-purple-600 mt-1">{teachers.filter(t => t.status === 'Active').length}</span>
                  <span className="text-xs text-gray-500">Teaching Today</span>
                </div>
                <div className="flex flex-col items-center">
                  <FileText className="w-8 h-8 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-600 mt-1">{Math.floor(teachers.length * 0.3)}</span>
                  <span className="text-xs text-gray-500">Due Evaluations</span>
                </div>
              </div>
            </div>        
          </div>


          {/* Search and Filter */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search teachers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
            </select>
            <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="">All Departments</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Computer Science">Computer Science</option>
              <option value="English">English</option>
              <option value="History">History</option>
              <option value="Fine Arts">Fine Arts</option>
            </select>
            <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="">Performance Rating</option>
              <option value="excellent">Excellent (90%+)</option>
              <option value="good">Good (80-89%)</option>
              <option value="average">Average (70-79%)</option>
              <option value="needs-improvement">Needs Improvement</option>
            </select>
            <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="">Schedule Status</option>
              <option value="teaching-now">Teaching Now</option>
              <option value="free-now">Free Now</option>
              <option value="on-break">On Break</option>
            </select>
            <CredentialGeneratorButton
              buttonText="Generate Teacher ID"
              defaultRole="Teacher"
              allowRoleSelection={false}
              size="sm"
              buttonClassName="bg-indigo-600 hover:bg-indigo-700"
            />
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-yellow-50 z-10">
                <tr>
                  <th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">Teacher</th>
                  <th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">Performance</th>
                  <th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">Schedule Today</th>
                  <th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">Subject & Dept</th>
                  <th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">Qualifications</th>
                  <th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">Evaluation</th>
                  <th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">Experience</th>
                  <th className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredTeachers.map((teacher) => (
                  <tr 
                    key={teacher._id || teacher.id}
                    className="hover:bg-yellow-50 transition-colors border-b border-gray-100"
                  >
                    {/* Teacher Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center font-semibold text-yellow-700 flex-shrink-0">
                          {(teacher.name || 'NA').split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{teacher.name}</div>
                          <div className="text-xs text-gray-500 font-mono">ID: {teacher.empId}</div>
                          <div className="flex items-center gap-3 mt-1">
                            <a href={`mailto:${teacher.email}`} className="text-sm text-gray-500 hover:text-yellow-600 flex items-center gap-1 truncate">
                              <Mail size={12} className="flex-shrink-0" />
                              <span className="truncate max-w-[120px]">{teacher.email}</span>
                            </a>
                            <a href={`tel:${teacher.mobile}`} className="text-sm text-gray-500 hover:text-yellow-600 flex items-center gap-1 flex-shrink-0">
                              <Phone size={12} />
                              {teacher.mobile}
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Performance Metrics */}
                    <td className="px-6 py-4">
                      {(() => {
                        const metrics = getPerformanceMetrics();
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Target size={14} className="text-green-600" />
                                <span className="text-sm font-semibold text-green-600">{metrics.studentSatisfaction}%</span>
                              </div>
                              <span className="text-xs text-gray-500">Satisfaction</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Activity size={14} className="text-blue-600" />
                                <span className="text-sm font-semibold text-blue-600">{metrics.classAttendance}%</span>
                              </div>
                              <span className="text-xs text-gray-500">Attendance</span>
                            </div>
                            <div className="text-xs text-gray-600">{metrics.totalStudents} students</div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Schedule Today */}
                    <td className="px-6 py-4">
                      {(() => {
                        const schedule = getTodaySchedule();
                        if (schedule.length === 0) {
                          return <span className="text-sm text-gray-400 italic">No classes today</span>;
                        }
                        return (
                          <div className="space-y-1 max-w-[200px]">
                            {schedule.slice(0, 2).map((slot, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Clock size={12} className="text-purple-600" />
                                <span className="text-xs text-gray-700">{slot.time}</span>
                                <span className="text-xs bg-purple-100 text-purple-800 px-1 rounded">{slot.class}</span>
                              </div>
                            ))}
                            {schedule.length > 2 && (
                              <div className="text-xs text-gray-500">+{schedule.length - 2} more</div>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    {/* Subject & Department */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <BookOpen size={14} className="text-blue-600" />
                          <span className="font-medium text-gray-900">{teacher.subject}</span>
                        </div>
                        <div className="text-sm text-gray-600">{teacher.department}</div>
                        <div className="text-xs text-gray-500">
                          Joined: {teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : '—'}
                        </div>
                      </div>
                    </td>

                    {/* Qualifications */}
                    <td className="px-6 py-4">
                      {(() => {
                        const certs = getCertifications();
                        return (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <GraduationCap size={14} className="text-indigo-600" />
                              <span className="font-medium text-gray-900">{teacher.qualification}</span>
                            </div>
                            {certs.slice(0, 2).map((cert, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                  cert.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {cert.status === 'verified' ? 'Verified' : 'Pending'}
                                </span>
                                <span className="text-xs text-gray-600 truncate">{cert.name}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </td>

                    {/* Evaluation */}
                    <td className="px-6 py-4">
                      {(() => {
                        const evaluation = getRecentEvaluations();
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={14} 
                                  className={i < evaluation.overallRating ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                                />
                              ))}
                              <span className="text-sm font-semibold ml-1">{evaluation.overallRating}/5</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              Last: {new Date(evaluation.lastEvaluation).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              By: {evaluation.evaluatedBy}
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Experience */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Award size={14} className="text-orange-600" />
                          <span className="font-semibold text-gray-900">5 years</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Since {new Date().getFullYear() - 5}
                        </div>
                      </div>
                    </td>
                    {/* <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${teacher.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {teacher.status}
                      </span>
                    </td> */}
                    {/* Enhanced Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button 
                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded" 
                          title="View Performance Analytics"
                        >
                          <BarChart3 size={14} />
                        </button>
                        <button 
                          className="text-purple-600 hover:text-purple-800 p-1 hover:bg-purple-50 rounded" 
                          title="View Schedule"
                        >
                          <Clock size={14} />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded" 
                          title="Conduct Evaluation"
                        >
                          <FileText size={14} />
                        </button>
                        <button 
                          className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded" 
                          title="Manage Qualifications"
                        >
                          <GraduationCap size={14} />
                        </button>
                        <button 
                          className="text-orange-600 hover:text-orange-800 p-1 hover:bg-orange-50 rounded" 
                          title="Edit Teacher"
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
        <div className="flex-shrink-0 p-8 pt-4 bg-white/90 border-t border-yellow-100">
          <div className="flex items-center justify-between">
            <div className="text-gray-600">
              Showing {filteredTeachers.length} of {teachers.length} teachers
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-yellow-50 transition-colors">Previous</button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-yellow-50 transition-colors">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teachers
