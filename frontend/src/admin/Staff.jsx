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
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const Staff = ({setShowAdminHeader}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [staff, setStaff] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaffMember, setNewStaffMember] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    experience: '',
    qualification: '',
    salary: '',
    rating: '',
    status: 'Active',
    joinDate: '',
    location: '',
    avatar: ''
  });

  // Filter staff based on search and status
  const filteredStaff = staff.filter(staffMember => {
    const matchesSearch = staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || staffMember.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Helper functions for enhanced features
  const getPerformanceMetrics = () => {
    // Mock performance data - integrate with actual metrics
    return {
      taskCompletionRate: Math.floor(Math.random() * 20) + 80, // 80-100
      attendanceRate: Math.floor(Math.random() * 15) + 85, // 85-100
      projectsCompleted: Math.floor(Math.random() * 10) + 5, // 5-15
      avgResponseTime: Math.floor(Math.random() * 20) + 10, // 10-30 hours
      totalTasks: Math.floor(Math.random() * 50) + 20, // 20-70
      activeProjects: Math.floor(Math.random() * 5) + 1 // 1-6
    };
  };

  const getTodaySchedule = () => {
    const schedules = [
      { time: '09:00-10:00', task: 'Admin Meeting', location: 'Conference Room A' },
      { time: '10:00-11:00', task: 'Budget Review', location: 'Office 205' },
      { time: '11:30-12:30', task: 'Staff Training', location: 'Training Room' },
      { time: '14:00-15:00', task: 'Facilities Inspection', location: 'Ground Floor' }
    ];
    return schedules.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const getCertifications = () => {
    const allCerts = [
      { name: 'Administrative Management', year: '2018', status: 'verified' },
      { name: 'Safety Training Certificate', year: '2020', status: 'verified' },
      { name: 'Leadership Development', year: '2022', status: 'pending' },
      { name: 'Digital Workflow Management', year: '2023', status: 'verified' }
    ];
    return allCerts.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const getRecentEvaluations = () => {
    return {
      lastEvaluation: '2024-01-15',
      overallRating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      evaluatedBy: 'HR Manager',
      nextEvaluation: '2024-07-15',
      improvements: Math.floor(Math.random() * 3) + 1
    };
  };

  // Static sample data for demonstration
  const staticStaffData = [
    {
      id: 1,
      name: 'Priya Sharma',
      empId: 'EMP001',
      email: 'priya.sharma@eec.edu',
      mobile: '+91-98765-43210',
      position: 'Administrative Manager',
      department: 'Administration',
      qualification: 'MBA in Management',
      experience: 8,
      joiningDate: '2016-03-15',
      status: 'Active',
      salary: 650000,
      attendanceToday: 'Present',
      lastSalaryDate: '2024-01-01',
      paymentStatus: 'Paid',
      nextPaymentDue: '2024-02-01',
      address: '15/2, MG Road, Bengaluru, Karnataka 560001'
    },
    {
      id: 2,
      name: 'Rajesh Kumar',
      empId: 'EMP002',
      email: 'rajesh.kumar@eec.edu',
      mobile: '+91-98765-43211',
      position: 'IT Support Specialist',
      department: 'IT Support',
      qualification: 'BE Computer Science',
      experience: 5,
      joiningDate: '2019-06-20',
      status: 'Active',
      salary: 520000,
      attendanceToday: 'Present',
      lastSalaryDate: '2024-01-01',
      paymentStatus: 'Paid',
      nextPaymentDue: '2024-02-01',
      address: '42, Sector 14, Gurgaon, Haryana 122001'
    },
    {
      id: 3,
      name: 'Anita Patel',
      empId: 'EMP003',
      email: 'anita.patel@eec.edu',
      mobile: '+91-98765-43212',
      position: 'HR Coordinator',
      department: 'Human Resources',
      qualification: 'MA Human Resources',
      experience: 6,
      joiningDate: '2018-01-10',
      status: 'Active',
      salary: 580000,
      attendanceToday: 'Absent',
      lastSalaryDate: '2024-01-01',
      paymentStatus: 'Due',
      nextPaymentDue: '2024-01-30',
      address: '78, Koregaon Park, Pune, Maharashtra 411001'
    },
    {
      id: 4,
      name: 'Suresh Gupta',
      empId: 'EMP004',
      email: 'suresh.gupta@eec.edu',
      mobile: '+91-98765-43213',
      position: 'Finance Officer',
      department: 'Finance',
      qualification: 'CA, B.Com Accounting',
      experience: 10,
      joiningDate: '2014-09-01',
      status: 'Active',
      salary: 720000,
      attendanceToday: 'Present',
      lastSalaryDate: '2024-01-01',
      paymentStatus: 'Paid',
      nextPaymentDue: '2024-02-01',
      address: '23, CP Tank, Mumbai, Maharashtra 400004'
    },
    {
      id: 5,
      name: 'Kavita Singh',
      empId: 'EMP005',
      email: 'kavita.singh@eec.edu',
      mobile: '+91-98765-43214',
      position: 'Library Assistant',
      department: 'Library',
      qualification: 'MLIS',
      experience: 4,
      joiningDate: '2020-08-15',
      status: 'Active',
      salary: 420000,
      attendanceToday: 'Present',
      lastSalaryDate: '2024-01-01',
      paymentStatus: 'Paid',
      nextPaymentDue: '2024-02-01',
      address: '56, Lajpat Nagar, New Delhi 110024'
    },
    {
      id: 6,
      name: 'Ravi Krishnan',
      empId: 'EMP006',
      email: 'ravi.krishnan@eec.edu',
      mobile: '+91-98765-43215',
      position: 'Security Supervisor',
      department: 'Security',
      qualification: 'Security Management Certificate',
      experience: 12,
      joiningDate: '2012-04-20',
      status: 'Active',
      salary: 480000,
      attendanceToday: 'Present',
      lastSalaryDate: '2024-01-01',
      paymentStatus: 'Due',
      nextPaymentDue: '2024-01-28',
      address: '89, T Nagar, Chennai, Tamil Nadu 600017'
    },
    {
      id: 7,
      name: 'Meera Nair',
      empId: 'EMP007',
      email: 'meera.nair@eec.edu',
      mobile: '+91-98765-43216',
      position: 'Maintenance Coordinator',
      department: 'Maintenance',
      qualification: 'Facilities Management Certificate',
      experience: 7,
      joiningDate: '2017-11-30',
      status: 'Active',
      salary: 450000,
      attendanceToday: 'Absent',
      lastSalaryDate: '2024-01-01',
      paymentStatus: 'Paid',
      nextPaymentDue: '2024-02-01',
      address: '12, Marine Drive, Kochi, Kerala 682031'
    },
    {
      id: 8,
      name: 'Arjun Reddy',
      empId: 'EMP008',
      email: 'arjun.reddy@eec.edu',
      mobile: '+91-98765-43217',
      position: 'Cafeteria Manager',
      department: 'Cafeteria',
      qualification: 'Food Service Management',
      experience: 9,
      joiningDate: '2015-02-14',
      status: 'Active',
      salary: 500000,
      attendanceToday: 'Present',
      lastSalaryDate: '2024-01-01',
      paymentStatus: 'Paid',
      nextPaymentDue: '2024-02-01',
      address: '34, Jubilee Hills, Hyderabad, Telangana 500033'
    },
    {
      id: 9,
      name: 'Deepika Joshi',
      empId: 'EMP009',
      email: 'deepika.joshi@eec.edu',
      mobile: '+91-98765-43218',
      position: 'Executive Assistant',
      department: 'Administration',
      qualification: 'BA Business Administration',
      experience: 6,
      joiningDate: '2018-07-25',
      status: 'On Leave',
      salary: 470000,
      attendanceToday: 'Absent',
      lastSalaryDate: '2023-12-01',
      paymentStatus: 'Due',
      nextPaymentDue: '2024-01-25',
      address: '67, Aundh, Pune, Maharashtra 411007'
    },
    {
      id: 10,
      name: 'Kevin Brown',
      empId: 'EMP010',
      email: 'kevin.brown@eec.edu',
      mobile: '+1-555-0110',
      position: 'Network Administrator',
      department: 'IT Support',
      qualification: 'MS Information Systems',
      experience: 8,
      joiningDate: '2016-12-05',
      status: 'Active',
      salary: 68000,
      attendanceToday: 'Present',
      lastSalaryDate: '2024-01-01',
      paymentStatus: 'Paid',
      nextPaymentDue: '2024-02-01'
    },
    {
      id: 11,
      name: 'Sneha Agarwal',
      empId: 'EMP011',
      email: 'sneha.agarwal@eec.edu',
      mobile: '+91-98765-43220',
      position: 'Accounts Payable Clerk',
      department: 'Finance',
      qualification: 'B.Com Accounting',
      experience: 3,
      joiningDate: '2021-05-10',
      status: 'Active',
      salary: 380000,
      attendanceToday: 'Present',
      lastSalaryDate: '2024-01-01',
      paymentStatus: 'Due',
      nextPaymentDue: '2024-01-31',
      address: '45, Civil Lines, Jaipur, Rajasthan 302006'
    },
    {
      id: 12,
      name: 'Ramesh Yadav',
      empId: 'EMP012',
      email: 'ramesh.yadav@eec.edu',
      mobile: '+91-98765-43221',
      position: 'Groundskeeper',
      department: 'Maintenance',
      qualification: 'Landscaping Certificate',
      experience: 5,
      joiningDate: '2019-03-20',
      status: 'Active',
      salary: 350000,
      attendanceToday: 'Present',
      lastSalaryDate: '2024-01-01',
      paymentStatus: 'Paid',
      nextPaymentDue: '2024-02-01',
      address: '128, Gomti Nagar, Lucknow, Uttar Pradesh 226010'
    }
  ];

  // making the admin header invisible
  useEffect(() => {
    setShowAdminHeader(false)

    // Set static data instead of API call for demonstration
    setStaff(staticStaffData);

    // Uncomment below for actual API integration
    /*
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/get-staff`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch staff');
      }
      return res.json();
    })
    .then(data => {
      setStaff(data)
    })
    .catch(err => {
      console.error('Error fetching staff:', err);
    });
    */
  }, [setShowAdminHeader])

  const handleAddStaffChange = (e) => {
    const { name, value } = e.target;
    setNewStaffMember(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    // Here you would send newStaffMember to backend or update state
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/auth/register`,{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(newStaffMember)
        })
        const data = await res.json();
        if (!res.ok) { 
          console.error('Registration failed:', data);
          throw new Error('Registration failed');
        }
      console.log('New staff member added:', data);
      setShowAddForm(false);
      // Optionally reset form
      setNewStaffMember({
        name: '', email: '', mobile: '', position: '', department: '', experience: '', qualification: '', joiningDate: '', address: '', pinCode: '', gender: '', salary: ''
      });
    }
    catch (error) {
      console.error('Error adding staff member:', error);
    }
  };


  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex flex-col">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full bg-white/90 shadow-2xlborder border-blue-200 overflow-hidden p-5">
        
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 p- bg-white/90 border-b border-blue-100">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-75">
              <div>
                <h1 className="text-3xl font-bold text-blue-700">Staff Management</h1>
                <p className="text-gray-600 mt-2">Manage administrative staff performance, schedules, and evaluations</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <Users className="w-8 h-8 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-600 mt-1">{staff.length}</span>
                  <span className="text-xs text-gray-500">Total Staff</span>
                </div>
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <span className="text-sm font-semibold text-green-600 mt-1">{staff.filter(s => s.attendanceToday === 'Present').length}</span>
                  <span className="text-xs text-gray-500">Present Today</span>
                </div>
                <div className="flex flex-col items-center">
                  <XCircle className="w-8 h-8 text-red-500" />
                  <span className="text-sm font-semibold text-red-600 mt-1">{staff.filter(s => s.attendanceToday === 'Absent').length}</span>
                  <span className="text-xs text-gray-500">Absent Today</span>
                </div>
                <div className="flex flex-col items-center">
                  <DollarSign className="w-8 h-8 text-green-500" />
                  <span className="text-sm font-semibold text-green-600 mt-1">{staff.filter(s => s.paymentStatus === 'Paid').length}</span>
                  <span className="text-xs text-gray-500">Payments Paid</span>
                </div>
                <div className="flex flex-col items-center">
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-600 mt-1">{staff.filter(s => s.paymentStatus === 'Due').length}</span>
                  <span className="text-xs text-gray-500">Payments Due</span>
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
                placeholder="Search staff..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
            </select>
            <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Departments</option>
              <option value="Administration">Administration</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
              <option value="Maintenance">Maintenance</option>
              <option value="IT Support">IT Support</option>
              <option value="Security">Security</option>
              <option value="Library">Library</option>
              <option value="Cafeteria">Cafeteria</option>
            </select>
            <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Performance Rating</option>
              <option value="excellent">Excellent (90%+)</option>
              <option value="good">Good (80-89%)</option>
              <option value="average">Average (70-79%)</option>
              <option value="needs-improvement">Needs Improvement</option>
            </select>
            <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Attendance</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
            <select className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Payment Status</option>
              <option value="paid">Paid</option>
              <option value="due">Due</option>
            </select>
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-blue-50 z-10">
                <tr>
                  <th className="border-b border-blue-100 px-6 py-3 text-left text-sm font-semibold text-blue-800">Staff Member</th>
                  <th className="border-b border-blue-100 px-6 py-3 text-left text-sm font-semibold text-blue-800">Attendance</th>
                  <th className="border-b border-blue-100 px-6 py-3 text-left text-sm font-semibold text-blue-800">Payment Status</th>
                  <th className="border-b border-blue-100 px-6 py-3 text-left text-sm font-semibold text-blue-800">Performance</th>
                  <th className="border-b border-blue-100 px-6 py-3 text-left text-sm font-semibold text-blue-800">Schedule Today</th>
                  <th className="border-b border-blue-100 px-6 py-3 text-left text-sm font-semibold text-blue-800">Position & Dept</th>
                  <th className="border-b border-blue-100 px-6 py-3 text-left text-sm font-semibold text-blue-800">Qualifications</th>
                  <th className="border-b border-blue-100 px-6 py-3 text-left text-sm font-semibold text-blue-800">Experience</th>
                  <th className="border-b border-blue-100 px-6 py-3 text-left text-sm font-semibold text-blue-800">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredStaff.map((staffMember) => (
                  <tr 
                    key={staffMember.id}
                    className="hover:bg-blue-50 transition-colors border-b border-gray-100"
                  >
                    {/* Staff Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center font-semibold text-blue-700 flex-shrink-0">
                          {staffMember.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{staffMember.name}</div>
                          <div className="text-xs text-gray-500 font-mono">ID: {staffMember.empId}</div>
                          <div className="flex items-center gap-3 mt-1">
                            <a href={`mailto:${staffMember.email}`} className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 truncate">
                              <Mail size={12} className="flex-shrink-0" />
                              <span className="truncate max-w-[120px]">{staffMember.email}</span>
                            </a>
                            <a href={`tel:${staffMember.mobile}`} className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 flex-shrink-0">
                              <Phone size={12} />
                              {staffMember.mobile}
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Attendance Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {staffMember.attendanceToday === 'Present' ? (
                          <>
                            <CheckCircle2 size={16} className="text-green-600" />
                            <span className="text-sm font-semibold text-green-600">Present</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={16} className="text-red-600" />
                            <span className="text-sm font-semibold text-red-600">Absent</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Today's Status
                      </div>
                    </td>

                    {/* Payment Status */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {staffMember.paymentStatus === 'Paid' ? (
                            <>
                              <CheckCircle2 size={14} className="text-green-600" />
                              <span className="text-sm font-semibold text-green-600">Paid</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={14} className="text-orange-600" />
                              <span className="text-sm font-semibold text-orange-600">Due</span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">
                          Last: {new Date(staffMember.lastSalaryDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Next: {new Date(staffMember.nextPaymentDue).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-gray-600">₹</span>
                          <span className="text-xs text-gray-600">{staffMember.salary.toLocaleString()}</span>
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
                                <span className="text-sm font-semibold text-green-600">{metrics.taskCompletionRate}%</span>
                              </div>
                              <span className="text-xs text-gray-500">Task Completion</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Activity size={14} className="text-blue-600" />
                                <span className="text-sm font-semibold text-blue-600">{metrics.attendanceRate}%</span>
                              </div>
                              <span className="text-xs text-gray-500">Attendance</span>
                            </div>
                            <div className="text-xs text-gray-600">{metrics.totalTasks} tasks handled</div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Schedule Today */}
                    <td className="px-6 py-4">
                      {(() => {
                        const schedule = getTodaySchedule();
                        if (schedule.length === 0) {
                          return <span className="text-sm text-gray-400 italic">No tasks today</span>;
                        }
                        return (
                          <div className="space-y-1 max-w-[200px]">
                            {schedule.slice(0, 2).map((slot, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Clock size={12} className="text-purple-600" />
                                <span className="text-xs text-gray-700">{slot.time}</span>
                                <span className="text-xs bg-purple-100 text-purple-800 px-1 rounded">{slot.task}</span>
                              </div>
                            ))}
                            {schedule.length > 2 && (
                              <div className="text-xs text-gray-500">+{schedule.length - 2} more</div>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    {/* Position & Department */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Briefcase size={14} className="text-blue-600" />
                          <span className="font-medium text-gray-900">{staffMember.position}</span>
                        </div>
                        <div className="text-sm text-gray-600">{staffMember.department}</div>
                        <div className="text-xs text-gray-500">
                          Joined: {new Date(staffMember.joiningDate).toLocaleDateString()}
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
                              <span className="font-medium text-gray-900">{staffMember.qualification}</span>
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
                          <span className="font-semibold text-gray-900">{staffMember.experience} years</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Since {new Date().getFullYear() - staffMember.experience}
                        </div>
                      </div>
                    </td>

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
                          title="Manage Certifications"
                        >
                          <GraduationCap size={14} />
                        </button>
                        <button 
                          className="text-orange-600 hover:text-orange-800 p-1 hover:bg-orange-50 rounded" 
                          title="Edit Staff Member"
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
        <div className="flex-shrink-0 pt-7 bg-white/90 border-t border-blue-100">
          <div className="flex items-center justify-between">
            <div className="text-black">
              Showing {filteredStaff.length} of {staff.length} staff members
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border text-black rounded-2xl transition-colors">Previous</button>
              <button className="px-4 py-2 border text-black rounded-2xl transition-colors">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staff;