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
  Baby
} from 'lucide-react';

const ParentsManagement = ({setShowAdminHeader}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('All');
  const [parents, setParents] = useState([]);

  // Filter parents based on search and grade
  const filteredParents = parents.filter(parent => {
    const matchesSearch = parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parent.children.some(child => child.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGrade = filterGrade === 'All' || parent.grades.includes(filterGrade);
    return matchesSearch && matchesGrade;
  });

  // Helper functions for enhanced features
  const getEngagementMetrics = () => {
    return {
      communicationRate: Math.floor(Math.random() * 20) + 80, // 80-100
      eventAttendance: Math.floor(Math.random() * 15) + 85, // 85-100
      meetingParticipation: Math.floor(Math.random() * 10) + 90, // 90-100
      responsiveness: Math.floor(Math.random() * 25) + 75, // 75-100
      totalInteractions: Math.floor(Math.random() * 30) + 10, // 10-40
      lastContact: Math.floor(Math.random() * 7) + 1 // 1-7 days ago
    };
  };

  const getRecentActivities = () => {
    const activities = [
      { type: 'Parent-Teacher Meet', date: '2024-01-20', status: 'attended' },
      { type: 'Progress Report', date: '2024-01-18', status: 'viewed' },
      { type: 'School Event', date: '2024-01-15', status: 'attended' },
      { type: 'Fee Payment', date: '2024-01-10', status: 'completed' }
    ];
    return activities.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const getChildrenInfo = (parent) => {
    return parent.children.map((child, idx) => ({
      name: child,
      grade: parent.grades[idx] || parent.grades[0],
      performance: ['Excellent', 'Good', 'Average'][Math.floor(Math.random() * 3)],
      attendance: Math.floor(Math.random() * 10) + 90
    }));
  };

  const getContactPreferences = () => {
    const preferences = ['Email', 'Phone', 'SMS', 'In-Person'];
    return preferences[Math.floor(Math.random() * preferences.length)];
  };

  // Static sample data for demonstration
  const staticParentsData = [
    {
      id: 1,
      name: 'John Smith',
      parentId: 'PAR001',
      email: 'john.smith@email.com',
      mobile: '+1-555-1001',
      children: ['Alex Smith', 'Emma Smith'],
      grades: ['Grade 10', 'Grade 8'],
      occupation: 'Software Engineer',
      address: '123 Oak Street, Springfield',
      joinDate: '2020-08-15',
      emergencyContact: '+1-555-1002',
      relationship: 'Father'
    },
    {
      id: 2,
      name: 'Maria Rodriguez',
      parentId: 'PAR002',
      email: 'maria.rodriguez@email.com',
      mobile: '+1-555-1003',
      children: ['Carlos Rodriguez'],
      grades: ['Grade 11'],
      occupation: 'Marketing Manager',
      address: '456 Pine Avenue, Springfield',
      joinDate: '2019-09-10',
      emergencyContact: '+1-555-1004',
      relationship: 'Mother'
    },
    {
      id: 3,
      name: 'David Wilson',
      parentId: 'PAR003',
      email: 'david.wilson@email.com',
      mobile: '+1-555-1005',
      children: ['Sophie Wilson', 'James Wilson'],
      grades: ['Grade 12', 'Grade 9'],
      occupation: 'Doctor',
      address: '789 Maple Road, Springfield',
      joinDate: '2018-07-20',
      emergencyContact: '+1-555-1006',
      relationship: 'Father'
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      parentId: 'PAR004',
      email: 'sarah.johnson@email.com',
      mobile: '+1-555-1007',
      children: ['Michael Johnson'],
      grades: ['Grade 10'],
      occupation: 'Teacher',
      address: '321 Elm Street, Springfield',
      joinDate: '2021-06-05',
      emergencyContact: '+1-555-1008',
      relationship: 'Mother'
    },
    {
      id: 5,
      name: 'Robert Chen',
      parentId: 'PAR005',
      email: 'robert.chen@email.com',
      mobile: '+1-555-1009',
      children: ['Lisa Chen', 'Kevin Chen'],
      grades: ['Grade 11', 'Grade 12'],
      occupation: 'Accountant',
      address: '654 Birch Lane, Springfield',
      joinDate: '2019-03-12',
      emergencyContact: '+1-555-1010',
      relationship: 'Father'
    },
    {
      id: 6,
      name: 'Emily Davis',
      parentId: 'PAR006',
      email: 'emily.davis@email.com',
      mobile: '+1-555-1011',
      children: ['Ryan Davis'],
      grades: ['Grade 9'],
      occupation: 'Nurse',
      address: '987 Cedar Court, Springfield',
      joinDate: '2020-01-18',
      emergencyContact: '+1-555-1012',
      relationship: 'Mother'
    },
    {
      id: 7,
      name: 'Michael Brown',
      parentId: 'PAR007',
      email: 'michael.brown@email.com',
      mobile: '+1-555-1013',
      children: ['Ashley Brown', 'Tyler Brown'],
      grades: ['Grade 10', 'Grade 11'],
      occupation: 'Engineer',
      address: '159 Willow Way, Springfield',
      joinDate: '2018-11-25',
      emergencyContact: '+1-555-1014',
      relationship: 'Father'
    },
    {
      id: 8,
      name: 'Jennifer Lee',
      parentId: 'PAR008',
      email: 'jennifer.lee@email.com',
      mobile: '+1-555-1015',
      children: ['Daniel Lee'],
      grades: ['Grade 12'],
      occupation: 'Lawyer',
      address: '753 Poplar Place, Springfield',
      joinDate: '2019-05-30',
      emergencyContact: '+1-555-1016',
      relationship: 'Mother'
    },
    {
      id: 9,
      name: 'Thomas Anderson',
      parentId: 'PAR009',
      email: 'thomas.anderson@email.com',
      mobile: '+1-555-1017',
      children: ['Jessica Anderson', 'Matthew Anderson'],
      grades: ['Grade 9', 'Grade 11'],
      occupation: 'Business Owner',
      address: '852 Ash Avenue, Springfield',
      joinDate: '2020-04-08',
      emergencyContact: '+1-555-1018',
      relationship: 'Father'
    },
    {
      id: 10,
      name: 'Lisa Taylor',
      parentId: 'PAR010',
      email: 'lisa.taylor@email.com',
      mobile: '+1-555-1019',
      children: ['Brandon Taylor'],
      grades: ['Grade 10'],
      occupation: 'Pharmacist',
      address: '147 Spruce Street, Springfield',
      joinDate: '2021-02-14',
      emergencyContact: '+1-555-1020',
      relationship: 'Mother'
    },
    {
      id: 11,
      name: 'James Miller',
      parentId: 'PAR011',
      email: 'james.miller@email.com',
      mobile: '+1-555-1021',
      children: ['Amanda Miller', 'Christopher Miller'],
      grades: ['Grade 12', 'Grade 9'],
      occupation: 'Architect',
      address: '369 Hickory Hill, Springfield',
      joinDate: '2018-12-03',
      emergencyContact: '+1-555-1022',
      relationship: 'Father'
    },
    {
      id: 12,
      name: 'Amanda Garcia',
      parentId: 'PAR012',
      email: 'amanda.garcia@email.com',
      mobile: '+1-555-1023',
      children: ['Isabella Garcia'],
      grades: ['Grade 11'],
      occupation: 'Graphic Designer',
      address: '258 Dogwood Drive, Springfield',
      joinDate: '2019-08-17',
      emergencyContact: '+1-555-1024',
      relationship: 'Mother'
    }
  ];

  // making the admin header invisible
  useEffect(() => {
    setShowAdminHeader(false)

    // Set static data instead of API call for demonstration
    setParents(staticParentsData);

    // Uncomment below for actual API integration
    /*
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/get-parents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch parents');
      }
      return res.json();
    })
    .then(data => {
      setParents(data)
    })
    .catch(err => {
      console.error('Error fetching parents:', err);
    });
    */
  }, [setShowAdminHeader])

  return (
    <div className="h-screen bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 ">
      <div className="flex-1 flex flex-col mx-auto w-full bg-white/90 border border-green-200 ">
        
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 p-8 bg-white/90 border-b border-green-100">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold text-green-700">Parents Management</h1>
                <p className="text-gray-600 mt-2">Manage parent engagement, communication, and student relationships</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <UserCheck className="w-8 h-8 text-green-500" />
                  <span className="text-sm font-semibold text-green-600 mt-1">{parents.length}</span>
                  <span className="text-xs text-gray-500">Total Parents</span>
                </div>
                <div className="flex flex-col items-center">
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-600 mt-1">89%</span>
                  <span className="text-xs text-gray-500">Engagement Rate</span>
                </div>
                <div className="flex flex-col items-center">
                  <Baby className="w-8 h-8 text-purple-500" />
                  <span className="text-sm font-semibold text-purple-600 mt-1">{parents.reduce((acc, p) => acc + p.children.length, 0)}</span>
                  <span className="text-xs text-gray-500">Total Students</span>
                </div>
                <div className="flex flex-col items-center">
                  <Calendar className="w-8 h-8 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-600 mt-1">{Math.floor(parents.length * 0.3)}</span>
                  <span className="text-xs text-gray-500">Meetings Due</span>
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
                placeholder="Search parents or children..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
            >
              <option value="All">All Grades</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
            <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Relationships</option>
              <option value="Father">Fathers</option>
              <option value="Mother">Mothers</option>
              <option value="Guardian">Guardians</option>
            </select>
            <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Engagement Level</option>
              <option value="high">High (90%+)</option>
              <option value="medium">Medium (70-89%)</option>
              <option value="low">Low (Below 70%)</option>
            </select>
            <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Communication Status</option>
              <option value="recent">Recent Contact</option>
              <option value="pending">Pending Response</option>
              <option value="overdue">Overdue Contact</option>
            </select>
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-green-50 z-10">
                <tr>
                  <th className="border-b border-green-100 px-6 py-3 text-left text-sm font-semibold text-green-800">Parent Info</th>
                  <th className="border-b border-green-100 px-6 py-3 text-left text-sm font-semibold text-green-800">Engagement</th>
                  <th className="border-b border-green-100 px-6 py-3 text-left text-sm font-semibold text-green-800">Recent Activity</th>
                  <th className="border-b border-green-100 px-6 py-3 text-left text-sm font-semibold text-green-800">Children & Grades</th>
                  <th className="border-b border-green-100 px-6 py-3 text-left text-sm font-semibold text-green-800">Contact Info</th>
                  <th className="border-b border-green-100 px-6 py-3 text-left text-sm font-semibold text-green-800">Communication</th>
                  <th className="border-b border-green-100 px-6 py-3 text-left text-sm font-semibold text-green-800">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredParents.map((parent) => (
                  <tr 
                    key={parent.id}
                    className="hover:bg-green-50 transition-colors border-b border-gray-100"
                  >
                    {/* Parent Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center font-semibold text-green-700 flex-shrink-0">
                          {parent.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{parent.name}</div>
                          <div className="text-xs text-gray-500 font-mono">ID: {parent.parentId}</div>
                          <div className="text-xs text-gray-600">{parent.relationship}</div>
                          <div className="text-xs text-gray-500">{parent.occupation}</div>
                        </div>
                      </div>
                    </td>

                    {/* Engagement Metrics */}
                    <td className="px-6 py-4">
                      {(() => {
                        const metrics = getEngagementMetrics();
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Activity size={14} className="text-green-600" />
                                <span className="text-sm font-semibold text-green-600">{metrics.communicationRate}%</span>
                              </div>
                              <span className="text-xs text-gray-500">Communication</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Target size={14} className="text-blue-600" />
                                <span className="text-sm font-semibold text-blue-600">{metrics.eventAttendance}%</span>
                              </div>
                              <span className="text-xs text-gray-500">Events</span>
                            </div>
                            <div className="text-xs text-gray-600">{metrics.totalInteractions} interactions</div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Recent Activity */}
                    <td className="px-6 py-4">
                      {(() => {
                        const activities = getRecentActivities();
                        if (activities.length === 0) {
                          return <span className="text-sm text-gray-400 italic">No recent activity</span>;
                        }
                        return (
                          <div className="space-y-1 max-w-[180px]">
                            {activities.slice(0, 2).map((activity, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <CheckCircle size={12} className="text-green-600" />
                                <span className="text-xs text-gray-700">{activity.type}</span>
                                <span className="text-xs bg-green-100 text-green-800 px-1 rounded">{activity.status}</span>
                              </div>
                            ))}
                            {activities.length > 2 && (
                              <div className="text-xs text-gray-500">+{activities.length - 2} more</div>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    {/* Children & Grades */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {parent.children.map((child, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <GraduationCap size={14} className="text-indigo-600" />
                              <span className="font-medium text-gray-900">{child}</span>
                            </div>
                            <div className="flex items-center gap-2 ml-6">
                              <span className="text-sm text-gray-600">{parent.grades[idx]}</span>
                              {(() => {
                                const childInfo = getChildrenInfo(parent)[idx];
                                return (
                                  <>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      childInfo.performance === 'Excellent' ? 'bg-green-100 text-green-800' :
                                      childInfo.performance === 'Good' ? 'bg-blue-100 text-blue-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {childInfo.performance}
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <a href={`mailto:${parent.email}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-600">
                          <Mail size={12} className="flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{parent.email}</span>
                        </a>
                        <a href={`tel:${parent.mobile}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-600">
                          <Phone size={12} className="flex-shrink-0" />
                          {parent.mobile}
                        </a>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin size={12} className="flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{parent.address}</span>
                        </div>
                      </div>
                    </td>

                    {/* Communication */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-900">
                          {getContactPreferences()}
                        </div>
                        <div className="text-xs text-gray-600">
                          Last: {Math.floor(Math.random() * 7) + 1} days ago
                        </div>
                        <div className="text-xs text-gray-500">
                          Emergency: {parent.emergencyContact}
                        </div>
                      </div>
                    </td>

                    {/* Enhanced Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button 
                          className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded" 
                          title="View Engagement Analytics"
                        >
                          <BarChart3 size={14} />
                        </button>
                        <button 
                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded" 
                          title="Communication History"
                        >
                          <Mail size={14} />
                        </button>
                        <button 
                          className="text-purple-600 hover:text-purple-800 p-1 hover:bg-purple-50 rounded" 
                          title="Schedule Meeting"
                        >
                          <Calendar size={14} />
                        </button>
                        <button 
                          className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded" 
                          title="View Children Progress"
                        >
                          <GraduationCap size={14} />
                        </button>
                        <button 
                          className="text-orange-600 hover:text-orange-800 p-1 hover:bg-orange-50 rounded" 
                          title="Edit Parent Info"
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
        <div className="flex-shrink-0 p-8 pt-4 bg-white/90 border-t border-green-100">
          <div className="flex items-center justify-between">
            <div className="text-gray-600">
              Showing {filteredParents.length} of {parents.length} parents
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border text-black border-black rounded-lg  transition-colors">Previous</button>
              <button className="px-4 py-2 border text-black border-black rounded-lg  transition-colors">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentsManagement;