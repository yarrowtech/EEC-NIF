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

const normalizeAttendance = (value) => {
  if (!value) return 'Unknown';
  const normalized = String(value).toLowerCase();
  if (normalized === 'present') return 'Present';
  if (normalized === 'absent') return 'Absent';
  return value;
};

const normalizePaymentStatus = (value) => {
  if (!value) return 'Pending';
  const normalized = String(value).toLowerCase();
  if (normalized === 'paid') return 'Paid';
  if (normalized === 'due') return 'Due';
  if (normalized === 'pending') return 'Pending';
  return value;
};

const getInitials = (name = '') => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .filter(Boolean);
  if (parts.length === 0) return 'S';
  return parts.slice(0, 2).join('');
};

const Staff = ({ setShowAdminHeader }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [credentialView, setCredentialView] = useState(null);
  const [deletingStaffId, setDeletingStaffId] = useState(null);
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
  const [editStaffMember, setEditStaffMember] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    experience: '',
    qualification: '',
    salary: '',
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

  const fetchStaff = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/get-staff`, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to fetch staff');
      }
      const normalized = (Array.isArray(data) ? data : []).map((member, idx) => ({
        _id: member._id,
        id: member._id || member.id || idx,
        name: member.name || 'Unnamed Staff',
        empId: member.employeeCode || member.empId || member.staffCode || `EMP-${idx + 1}`,
        email: member.email || '-',
        mobile: member.mobile || member.phone || '-',
        position: member.position || member.role || member.designation || 'Staff',
        department: member.department || 'General',
        qualification: member.qualification || '-',
        experience: Number(member.experience || 0),
        joiningDate: member.joiningDate || member.joinDate || member.createdAt || '',
        status: member.status || 'Active',
        salary: Number(member.salary ?? member.ctc ?? 0),
        attendanceToday: normalizeAttendance(member.attendanceToday),
        lastSalaryDate: member.lastSalaryDate || null,
        paymentStatus: normalizePaymentStatus(member.paymentStatus),
        nextPaymentDue: member.nextPaymentDue || null,
        address: member.address || '',
        avatar: member.avatar || '',
      }));
      setStaff(normalized);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError(err.message || 'Failed to fetch staff');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  // making the admin header invisible
  useEffect(() => {
    setShowAdminHeader(false);
    fetchStaff();
  }, [setShowAdminHeader]);

  const handleAddStaffChange = (e) => {
    const { name, value } = e.target;
    setNewStaffMember(prev => ({ ...prev, [name]: value }));
  };

  const handleEditStaffChange = (e) => {
    const { name, value } = e.target;
    setEditStaffMember(prev => ({ ...prev, [name]: value }));
  };

  const openEditForm = (staffMember) => {
    if (!staffMember) return;
    setEditingStaff(staffMember);
    setEditStaffMember({
      name: staffMember.name || '',
      email: staffMember.email || '',
      phone: staffMember.mobile || '',
      position: staffMember.position || '',
      department: staffMember.department || '',
      experience: staffMember.experience ? String(staffMember.experience) : '',
      qualification: staffMember.qualification || '',
      salary: staffMember.salary != null ? String(staffMember.salary) : '',
      status: staffMember.status || 'Active',
      joinDate: staffMember.joiningDate || '',
      location: staffMember.location || '',
      avatar: staffMember.avatar || ''
    });
    setShowEditForm(true);
  };

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    // Here you would send newStaffMember to backend or update state
    try {
      setSubmitStatus(null);
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
          throw new Error(data?.error || 'Registration failed');
        }
      setSubmitStatus({
        type: 'success',
        message: 'Staff member added successfully.'
      });
      if (data?.username && data?.password) {
        setCredentialView({
          name: newStaffMember.name,
          username: data.username,
          employeeCode: data.employeeCode || data.username,
          password: data.password
        });
      }
      setShowAddForm(false);
      // Optionally reset form
      setNewStaffMember({
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
      fetchStaff();
    }
    catch (error) {
      console.error('Error adding staff member:', error);
      setSubmitStatus({ type: 'error', message: error.message || 'Unable to add staff member' });
    }
  };

  const handleEditStaffSubmit = async (e) => {
    e.preventDefault();
    if (!editingStaff?._id && !editingStaff?.id) return;
    try {
      setSubmitStatus(null);
      const staffId = editingStaff._id || editingStaff.id;
      const payload = {
        name: editStaffMember.name,
        email: editStaffMember.email,
        mobile: editStaffMember.phone,
        position: editStaffMember.position,
        department: editStaffMember.department,
        experience: editStaffMember.experience,
        qualification: editStaffMember.qualification,
        salary: editStaffMember.salary ? Number(editStaffMember.salary) : undefined,
        status: editStaffMember.status,
        joiningDate: editStaffMember.joinDate
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/staff/${staffId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to update staff member');
      }
      setSubmitStatus({ type: 'success', message: 'Staff member updated successfully.' });
      setShowEditForm(false);
      setEditingStaff(null);
      fetchStaff();
    } catch (error) {
      console.error('Error updating staff member:', error);
      setSubmitStatus({ type: 'error', message: error.message || 'Unable to update staff member' });
    }
  };

  const handleDeleteStaff = async (staffMember) => {
    const staffId = staffMember?._id || staffMember?.id;
    if (!staffId || deletingStaffId) return;
    const confirmed = window.confirm(`Delete staff member ${staffMember.name || ''}?`);
    if (!confirmed) return;
    setDeletingStaffId(staffId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/staff/${staffId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Unable to delete staff member');
      }
      setStaff((prev) => prev.filter((item) => String(item._id || item.id) !== String(staffId)));
      setSubmitStatus({ type: 'success', message: 'Staff member deleted successfully.' });
    } catch (error) {
      console.error('Error deleting staff member:', error);
      setSubmitStatus({ type: 'error', message: error.message || 'Unable to delete staff member' });
    } finally {
      setDeletingStaffId(null);
    }
  };

  const copyCredential = async (value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error('Failed to copy credential:', err);
    }
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return '-';
    return dt.toLocaleDateString();
  };

  const formatMoney = (value) => {
    if (value == null || Number.isNaN(Number(value))) return '-';
    return Number(value).toLocaleString();
  };


  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 flex flex-col">
      <div className="flex-1 flex flex-col  mx-auto w-full bg-white/90 shadow-2xlborder border-blue-200 overflow-hidden p-5">
        
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                Add Staff
              </button>
            </div>
          </div>

          {submitStatus && (
            <div
              className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                submitStatus.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {submitStatus.message}
            </div>
          )}

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

        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-blue-100">
              <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100">
                <div>
                  <h2 className="text-xl font-semibold text-blue-700">Add New Staff</h2>
                  <p className="text-sm text-gray-500">Create staff profile and send login credentials</p>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle size={20} />
                </button>
              </div>
              <form onSubmit={handleAddStaffSubmit} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newStaffMember.name}
                      onChange={handleAddStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={newStaffMember.email}
                      onChange={handleAddStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={newStaffMember.phone}
                      onChange={handleAddStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Position</label>
                    <input
                      type="text"
                      name="position"
                      value={newStaffMember.position}
                      onChange={handleAddStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={newStaffMember.department}
                      onChange={handleAddStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Qualification</label>
                    <input
                      type="text"
                      name="qualification"
                      value={newStaffMember.qualification}
                      onChange={handleAddStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Experience (years)</label>
                    <input
                      type="number"
                      name="experience"
                      value={newStaffMember.experience}
                      onChange={handleAddStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Salary</label>
                    <input
                      type="number"
                      name="salary"
                      value={newStaffMember.salary}
                      onChange={handleAddStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Join Date</label>
                    <input
                      type="date"
                      name="joinDate"
                      value={newStaffMember.joinDate}
                      onChange={handleAddStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={newStaffMember.status}
                      onChange={handleAddStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-100">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Save & Send Credentials
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-blue-100">
              <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100">
                <div>
                  <h2 className="text-xl font-semibold text-blue-700">Edit Staff</h2>
                  <p className="text-sm text-gray-500">Update staff profile details</p>
                </div>
                <button
                  onClick={() => setShowEditForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle size={20} />
                </button>
              </div>
              <form onSubmit={handleEditStaffSubmit} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editStaffMember.name}
                      onChange={handleEditStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editStaffMember.email}
                      onChange={handleEditStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editStaffMember.phone}
                      onChange={handleEditStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Position</label>
                    <input
                      type="text"
                      name="position"
                      value={editStaffMember.position}
                      onChange={handleEditStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={editStaffMember.department}
                      onChange={handleEditStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Qualification</label>
                    <input
                      type="text"
                      name="qualification"
                      value={editStaffMember.qualification}
                      onChange={handleEditStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Experience (years)</label>
                    <input
                      type="number"
                      name="experience"
                      value={editStaffMember.experience}
                      onChange={handleEditStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Salary</label>
                    <input
                      type="number"
                      name="salary"
                      value={editStaffMember.salary}
                      onChange={handleEditStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Join Date</label>
                    <input
                      type="date"
                      name="joinDate"
                      value={editStaffMember.joinDate}
                      onChange={handleEditStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={editStaffMember.status}
                      onChange={handleEditStaffChange}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-100">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {credentialView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-blue-100">
              <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100">
                <div>
                  <h2 className="text-lg font-semibold text-blue-700">Staff Login Credentials</h2>
                  <p className="text-sm text-gray-500">Share these credentials securely</p>
                </div>
                <button
                  onClick={() => setCredentialView(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle size={20} />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Staff Member</p>
                  <p className="text-base font-semibold text-gray-900">{credentialView.name || 'Staff'}</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-blue-700 uppercase">Login ID</p>
                    <div className="mt-1 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                      <code className="text-sm font-mono text-gray-800">
                        {credentialView.employeeCode || credentialView.username}
                      </code>
                      <button
                        onClick={() => copyCredential(credentialView.employeeCode || credentialView.username)}
                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                        title="Copy ID"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-700 uppercase">Password</p>
                    <div className="mt-1 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                      <code className="text-sm font-mono text-gray-800">{credentialView.password}</code>
                      <button
                        onClick={() => copyCredential(credentialView.password)}
                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                        title="Copy Password"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Please ask the staff member to reset the password after first login.</p>
              </div>
              <div className="px-6 py-4 border-t border-blue-100 flex justify-end">
                <button
                  onClick={() => setCredentialView(null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Table Container */}
        <div className="flex-1 overflow-hidden">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              Loading staff records...
            </div>
          ) : (
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
                          {getInitials(staffMember.name)}
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
                          Last: {formatDate(staffMember.lastSalaryDate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Next: {formatDate(staffMember.nextPaymentDue)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-gray-600">INR</span>
                          <span className="text-xs text-gray-600">{formatMoney(staffMember.salary)}</span>
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
                          Joined: {formatDate(staffMember.joiningDate)}
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
                          onClick={() => openEditForm(staffMember)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded disabled:opacity-50" 
                          title="Delete Staff Member"
                          onClick={() => handleDeleteStaff(staffMember)}
                          disabled={deletingStaffId === (staffMember._id || staffMember.id)}
                        >
                          <Trash2 size={14} />
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
          )}
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
