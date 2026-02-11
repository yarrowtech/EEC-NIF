import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  User,
  Bell,
  FileText,
  DollarSign,
  Check,
  X,
  Plus,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  UserCircle,
  CalendarDays,
  BellRing,
  Receipt,
  Edit,
  Save,
  Camera,
  Trash2,
  LayoutGrid,
  List,
  CalendarRange,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Building2,
  BadgeCheck,
  Shield,
  IndianRupee,
  Wallet,
  TrendingUp,
  FileCheck,
  LogIn,
  LogOut,
  Timer,
  CalendarCheck,
  Activity,
  XCircle
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const MyWorkPortal = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    presentDays: 0,
    lateDays: 0,
    absentDays: 0,
    attendanceRate: 0
  });
  const [todayAttendance, setTodayAttendance] = useState({
    hasCheckedIn: false,
    hasCheckedOut: false,
    checkIn: '-',
    checkOut: '-',
    status: 'Absent',
    workingMinutes: 0
  });
  const [attendanceTiming, setAttendanceTiming] = useState({ entryTime: '09:00', exitTime: '17:00' });
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');

  const [leaveData, setLeaveData] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveError, setLeaveError] = useState('');
  const [leaveEditId, setLeaveEditId] = useState(null);
  const [leaveViewMode, setLeaveViewMode] = useState('list');
  const [leaveToDelete, setLeaveToDelete] = useState(null);
  const [leaveDeleting, setLeaveDeleting] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const TOTAL_LEAVE_DAYS = 15;

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    employeeId: '',
    joinDate: '',
    address: '',
    emergencyContact: '',
    profilePic: ''
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Leave Request Approved', message: 'Your sick leave for Jan 15-16 has been approved', type: 'success', read: false, timestamp: '2 hours ago' },
    { id: 2, title: 'Expense Claim Update', message: 'Your expense claim #EC001 needs additional documentation', type: 'warning', read: false, timestamp: '5 hours ago' },
    { id: 3, title: 'Profile Update Required', message: 'Please update your emergency contact information', type: 'info', read: true, timestamp: '1 day ago' },
    { id: 4, title: 'Holiday Notice', message: 'School will be closed on Jan 26th for Republic Day', type: 'info', read: true, timestamp: '2 days ago' }
  ]);

  const [documents, setDocuments] = useState([
    { id: 1, name: 'Employee Handbook 2025', type: 'PDF', size: '2.5 MB', category: 'Policy', uploadDate: '2025-01-01' },
    { id: 2, name: 'Salary Certificate', type: 'PDF', size: '150 KB', category: 'Personal', uploadDate: '2024-12-15' },
    { id: 3, name: 'Tax Declaration Form', type: 'PDF', size: '300 KB', category: 'Financial', uploadDate: '2024-11-30' },
    { id: 4, name: 'Performance Review 2024', type: 'PDF', size: '500 KB', category: 'Performance', uploadDate: '2024-12-31' }
  ]);

  const [expenses, setExpenses] = useState([]);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);
  const [expenseError, setExpenseError] = useState('');
  const [expenseEditId, setExpenseEditId] = useState(null);
  const [expenseViewMode, setExpenseViewMode] = useState('list');
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [expenseDeleting, setExpenseDeleting] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Travel',
    amount: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    receiptFile: null,
    receiptName: '',
    receiptUrl: ''
  });

  const tabs = [
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leave Management', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User },
    // { id: 'notifications', label: 'Notifications', icon: Bell },
    // { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'expenses', label: 'Expenses', icon: IndianRupee }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': case 'present': return 'text-green-600 bg-green-100';
      case 'pending': case 'late': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': case 'absent': case 'sick leave': case 'casual leave': return 'text-red-600 bg-red-100';
      case 'weekend': case 'holiday': return 'text-gray-600 bg-gray-100';
      case 'half day': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const toMonthLabel = (monthValue) => {
    const [year, month] = String(monthValue || '').split('-').map(Number);
    if (!year || !month) return monthValue;
    return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '-') return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === '-') return '-';
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return timeStr;
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  const formatWorkingHours = (minutes) => {
    const totalMinutes = Number(minutes || 0);
    if (!totalMinutes) return '-';
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${String(mins).padStart(2, '0')}m`;
  };

  const fetchWorkAttendance = async (monthValue = selectedMonth) => {
    setAttendanceLoading(true);
    setAttendanceError('');
    try {
      const token = localStorage.getItem('token');
      const userType = (localStorage.getItem('userType') || '').toLowerCase();
      if (!token || userType !== 'teacher') {
        throw new Error('Teacher login required');
      }

      const res = await fetch(`${API_BASE}/api/teacher/dashboard/work-attendance?month=${monthValue}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to load attendance');
      }

      setAttendanceData(Array.isArray(data.records) ? data.records : []);
      setAttendanceStats(data.stats || { presentDays: 0, lateDays: 0, absentDays: 0, attendanceRate: 0 });
      setTodayAttendance(data.today || {
        hasCheckedIn: false,
        hasCheckedOut: false,
        checkIn: '-',
        checkOut: '-',
        status: 'Absent',
        workingMinutes: 0
      });
      setAttendanceTiming({
        entryTime: data?.settings?.entryTime || '09:00',
        exitTime: data?.settings?.exitTime || '17:00',
      });
    } catch (error) {
      setAttendanceError(error.message || 'Unable to load attendance');
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkAttendance(selectedMonth);
  }, [selectedMonth]);

  const handleCheckIn = async () => {
    setAttendanceSaving(true);
    setAttendanceError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/teacher/dashboard/work-attendance/check-in`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to check in');
      }
      await fetchWorkAttendance(selectedMonth);
    } catch (error) {
      setAttendanceError(error.message || 'Unable to check in');
    } finally {
      setAttendanceSaving(false);
    }
  };

  const handleCheckOut = async () => {
    setAttendanceSaving(true);
    setAttendanceError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/teacher/dashboard/work-attendance/check-out`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to check out');
      }
      await fetchWorkAttendance(selectedMonth);
    } catch (error) {
      setAttendanceError(error.message || 'Unable to check out');
    } finally {
      setAttendanceSaving(false);
    }
  };

  const fetchLeaveRequests = async () => {
    setLeaveLoading(true);
    setLeaveError('');
    try {
      const token = localStorage.getItem('token');
      const userType = (localStorage.getItem('userType') || '').toLowerCase();
      if (!token || userType !== 'teacher') {
        throw new Error('Teacher login required');
      }

      const res = await fetch(`${API_BASE}/api/teacher/dashboard/leave-requests`, {
        headers: { authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to load leave requests');
      }

      setLeaveData(Array.isArray(data.leaves) ? data.leaves : []);
    } catch (error) {
      setLeaveError(error.message || 'Unable to load leave requests');
    } finally {
      setLeaveLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const leaveStats = useMemo(() => {
    const getLeaveDays = (startDate, endDate) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
      const msPerDay = 24 * 60 * 60 * 1000;
      return Math.floor((end - start) / msPerDay) + 1;
    };

    const usedDays = leaveData
      .filter((leave) => String(leave.status).toLowerCase() === 'approved')
      .reduce((sum, leave) => sum + getLeaveDays(leave.startDate, leave.endDate), 0);

    const pendingRequests = leaveData.filter(
      (leave) => String(leave.status).toLowerCase() === 'pending'
    ).length;

    return {
      usedDays,
      pendingRequests,
      availableDays: Math.max(TOTAL_LEAVE_DAYS - usedDays, 0),
    };
  }, [leaveData]);

  const submitLeaveRequest = async (e) => {
    e.preventDefault();
    setLeaveError('');
    setLeaveSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Teacher login required');
      }
      if (!leaveForm.startDate || !leaveForm.endDate) {
        throw new Error('Start and end date are required');
      }

      const endpoint = leaveEditId
        ? `${API_BASE}/api/teacher/dashboard/leave-requests/${leaveEditId}`
        : `${API_BASE}/api/teacher/dashboard/leave-requests`;
      const method = leaveEditId ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify(leaveForm)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to submit leave request');
      }

      setShowLeaveForm(false);
      setLeaveEditId(null);
      setLeaveForm({ type: 'Sick Leave', startDate: '', endDate: '', reason: '' });
      await fetchLeaveRequests();
    } catch (error) {
      setLeaveError(error.message || 'Unable to submit leave request');
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const handleEditLeave = (leave) => {
    if (!leave || String(leave.status).toLowerCase() !== 'pending') return;
    setLeaveError('');
    setLeaveEditId(leave.id);
    setLeaveForm({
      type: leave.type || 'Sick Leave',
      startDate: leave.startDate || '',
      endDate: leave.endDate || '',
      reason: leave.reason || ''
    });
    setShowLeaveForm(true);
  };

  const handleDeleteLeave = (leave) => {
    if (!leave || String(leave.status).toLowerCase() !== 'pending') return;
    setLeaveToDelete(leave);
  };

  const confirmDeleteLeave = async () => {
    if (!leaveToDelete) return;

    setLeaveDeleting(true);
    setLeaveError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Teacher login required');
      const res = await fetch(`${API_BASE}/api/teacher/dashboard/leave-requests/${leaveToDelete.id}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to delete leave request');
      }
      setLeaveToDelete(null);
      await fetchLeaveRequests();
    } catch (error) {
      setLeaveError(error.message || 'Unable to delete leave request');
      setLeaveToDelete(null);
    } finally {
      setLeaveDeleting(false);
    }
  };

  const fetchExpenses = async () => {
    setExpenseLoading(true);
    setExpenseError('');
    try {
      const token = localStorage.getItem('token');
      const userType = (localStorage.getItem('userType') || '').toLowerCase();
      if (!token || userType !== 'teacher') {
        throw new Error('Teacher login required');
      }

      const res = await fetch(`${API_BASE}/api/teacher/dashboard/expenses`, {
        headers: { authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to load expenses');
      }
      setExpenses(Array.isArray(data.expenses) ? data.expenses : []);
    } catch (error) {
      setExpenseError(error.message || 'Unable to load expenses');
    } finally {
      setExpenseLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const expenseStats = useMemo(() => {
    const approved = expenses
      .filter((expense) => String(expense.status).toLowerCase() === 'approved')
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const pending = expenses
      .filter((expense) => String(expense.status).toLowerCase() === 'pending')
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const rejected = expenses
      .filter((expense) => String(expense.status).toLowerCase() === 'rejected')
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    return { approved, pending, rejected };
  }, [expenses]);

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setExpenseError('');
    setExpenseSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Teacher login required');
      if (!expenseForm.category) throw new Error('Category is required');
      if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      let receiptUrl = expenseForm.receiptUrl || '';
      let receiptName = expenseForm.receiptName || '';
      if (expenseForm.receiptFile) {
        const uploadForm = new FormData();
        uploadForm.append('file', expenseForm.receiptFile);
        uploadForm.append('folder', 'teacher_expenses');
        uploadForm.append('tags', 'teacher,expense');

        const uploadRes = await fetch(`${API_BASE}/api/uploads/cloudinary/single`, {
          method: 'POST',
          body: uploadForm
        });
        const uploadData = await uploadRes.json().catch(() => ({}));
        const fileData = uploadData?.files?.[0];
        if (!uploadRes.ok || !fileData?.secure_url) {
          throw new Error(uploadData?.message || uploadData?.error || 'Unable to upload receipt');
        }
        receiptUrl = fileData.secure_url;
        receiptName = fileData.originalName || expenseForm.receiptFile.name || '';
      }

      const endpoint = expenseEditId
        ? `${API_BASE}/api/teacher/dashboard/expenses/${expenseEditId}`
        : `${API_BASE}/api/teacher/dashboard/expenses`;
      const method = expenseEditId ? 'PATCH' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          category: expenseForm.category,
          amount: Number(expenseForm.amount),
          description: expenseForm.description,
          date: expenseForm.date,
          receiptUrl,
          receiptName
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to submit expense');
      }

      setShowExpenseForm(false);
      setExpenseEditId(null);
      setExpenseForm({
        category: 'Travel',
        amount: '',
        description: '',
        date: new Date().toISOString().slice(0, 10),
        receiptFile: null,
        receiptName: '',
        receiptUrl: ''
      });
      await fetchExpenses();
    } catch (error) {
      setExpenseError(error.message || 'Unable to submit expense');
    } finally {
      setExpenseSubmitting(false);
    }
  };

  const handleEditExpense = (expense) => {
    if (!expense || String(expense.status).toLowerCase() !== 'pending') return;
    setExpenseEditId(expense.id);
    setExpenseError('');
    setExpenseForm({
      category: expense.category || 'Travel',
      amount: String(expense.amount || ''),
      description: expense.description || '',
      date: expense.date || new Date().toISOString().slice(0, 10),
      receiptFile: null,
      receiptName: expense.receiptName || '',
      receiptUrl: expense.receiptUrl || ''
    });
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = (expense) => {
    if (!expense || String(expense.status).toLowerCase() !== 'pending') return;
    setExpenseToDelete(expense);
  };

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) return;

    setExpenseDeleting(true);
    setExpenseError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Teacher login required');
      const res = await fetch(`${API_BASE}/api/teacher/dashboard/expenses/${expenseToDelete.id}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to delete expense');
      }
      setExpenseToDelete(null);
      await fetchExpenses();
    } catch (error) {
      setExpenseError(error.message || 'Unable to delete expense');
      setExpenseToDelete(null);
    } finally {
      setExpenseDeleting(false);
    }
  };

  const normalizeJoinDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  };

  const mapProfileFromApi = (teacher = {}) => ({
    name: teacher.name || '',
    email: teacher.email || '',
    phone: teacher.mobile || '',
    department: teacher.department || '',
    employeeId: teacher.username || teacher.employeeCode || teacher.employeeId || '',
    joinDate: normalizeJoinDate(teacher.joiningDate),
    address: teacher.address || '',
    emergencyContact: teacher.emergencyContact || '',
    profilePic: teacher.profilePic || ''
  });

  useEffect(() => {
    const loadTeacherProfile = async () => {
      setProfileLoading(true);
      setProfileError('');
      try {
        const token = localStorage.getItem('token');
        const userType = (localStorage.getItem('userType') || '').toLowerCase();
        if (!token || userType !== 'teacher') {
          throw new Error('Teacher login required');
        }

        const response = await fetch(`${API_BASE}/api/teacher/auth/profile`, {
          headers: {
            authorization: `Bearer ${token}`
          }
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error || 'Unable to load profile');
        }

        setProfileData(mapProfileFromApi(data));
      } catch (error) {
        setProfileError(error.message || 'Unable to load profile');
      } finally {
        setProfileLoading(false);
      }
    };

    loadTeacherProfile();
  }, []);

  const handleProfileInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileEditSave = async () => {
    setProfileError('');
    setProfileSuccess('');

    if (!editProfile) {
      setEditProfile(true);
      return;
    }

    try {
      setProfileSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Teacher login required');
      }

      const payload = {
        name: profileData.name,
        email: profileData.email,
        mobile: profileData.phone,
        department: profileData.department,
        joiningDate: profileData.joinDate || null,
        address: profileData.address,
        emergencyContact: profileData.emergencyContact
      };

      const response = await fetch(`${API_BASE}/api/teacher/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to update profile');
      }

      setProfileData(mapProfileFromApi(data?.teacher || {}));
      setProfileSuccess('Profile updated successfully');
      setEditProfile(false);
    } catch (error) {
      setProfileError(error.message || 'Unable to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const profilePicInputRef = useRef(null);

  const handleProfilePicUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProfileError('');
    setProfileSuccess('');
    setProfileSaving(true);

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be 5MB or less');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'teacher_profiles');
      formData.append('tags', 'teacher,profile');

      const uploadRes = await fetch(`${API_BASE}/api/uploads/cloudinary/single`, {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadRes.json().catch(() => ({}));
      const uploadedUrl = uploadData?.files?.[0]?.secure_url;
      if (!uploadRes.ok || !uploadedUrl) {
        throw new Error(uploadData?.message || uploadData?.error || 'Unable to upload image');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Teacher login required');
      }

      const saveRes = await fetch(`${API_BASE}/api/teacher/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ profilePic: uploadedUrl })
      });

      const saveData = await saveRes.json().catch(() => ({}));
      if (!saveRes.ok) {
        throw new Error(saveData?.error || 'Unable to save profile photo');
      }

      setProfileData((prev) => ({ ...prev, profilePic: uploadedUrl }));
      setProfileSuccess('Profile photo updated successfully');
    } catch (error) {
      setProfileError(error.message || 'Unable to update profile photo');
    } finally {
      if (profilePicInputRef.current) {
        profilePicInputRef.current.value = '';
      }
      setProfileSaving(false);
    }
  };

  const renderAttendance = () => (
    <div className="space-y-6">
      {attendanceError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          {attendanceError}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Attendance Tracker</h3>
          <p className="text-sm text-gray-500 mt-1">Mark your daily attendance and track your records</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Today's Attendance Card */}
      <div className="bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
              <CalendarCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Today's Date</p>
              <p className="text-2xl font-bold">{formatDate(new Date().toISOString().slice(0, 10))}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <p className="text-white/70 text-xs mb-1">Entry / Exit Time</p>
              <p className="text-lg font-semibold">{formatTime(attendanceTiming.entryTime)} - {formatTime(attendanceTiming.exitTime)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <p className="text-white/70 text-xs mb-1">Check-in</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                {formatTime(todayAttendance.checkIn)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <p className="text-white/70 text-xs mb-1">Check-out</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                {formatTime(todayAttendance.checkOut)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <p className="text-white/70 text-xs mb-1">Working Hours</p>
              <p className="text-lg font-semibold">{formatWorkingHours(todayAttendance.workingMinutes)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <p className="text-white/70 text-xs mb-1">Status</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium ${
                todayAttendance.status === 'Present' ? 'bg-green-400/30 text-green-100' :
                todayAttendance.status === 'Late' ? 'bg-yellow-400/30 text-yellow-100' :
                todayAttendance.status === 'Absent' ? 'bg-red-400/30 text-red-100' :
                'bg-white/20 text-white/90'
              }`}>
                {todayAttendance.status === 'Present' && <CheckCircle className="w-3.5 h-3.5" />}
                {todayAttendance.status === 'Late' && <Timer className="w-3.5 h-3.5" />}
                {todayAttendance.status === 'Absent' && <XCircle className="w-3.5 h-3.5" />}
                {todayAttendance.status || 'Not Marked'}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCheckIn}
              disabled={attendanceSaving || todayAttendance.hasCheckedIn || attendanceLoading}
              className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <LogIn className="w-4 h-4" />
              {todayAttendance.hasCheckedIn ? 'Checked In' : 'Check In'}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={attendanceSaving || !todayAttendance.hasCheckedIn || todayAttendance.hasCheckedOut || attendanceLoading}
              className="px-5 py-2.5 bg-white/20 text-white border border-white/30 rounded-xl hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              {todayAttendance.hasCheckedOut ? 'Checked Out' : 'Check Out'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600">{attendanceStats.presentDays}</div>
              <div className="text-sm font-medium text-green-700 mt-1">Days Present</div>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-linear-to-br from-amber-50 to-yellow-50 p-5 rounded-xl border border-amber-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-amber-600">{attendanceStats.lateDays}</div>
              <div className="text-sm font-medium text-amber-700 mt-1">Days Late</div>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl">
              <Timer className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-linear-to-br from-red-50 to-rose-50 p-5 rounded-xl border border-red-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-red-600">{attendanceStats.absentDays}</div>
              <div className="text-sm font-medium text-red-700 mt-1">Days Absent</div>
            </div>
            <div className="bg-red-100 p-3 rounded-xl">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600">{attendanceStats.attendanceRate}%</div>
              <div className="text-sm font-medium text-blue-700 mt-1">Attendance Rate</div>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-linear-to-r from-gray-50 to-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Attendance History</h4>
                <p className="text-xs text-gray-500">{toMonthLabel(selectedMonth)}</p>
              </div>
            </div>
            <span className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
              {attendanceData.length} Records
            </span>
          </div>
        </div>

        <div className="p-5">
          {attendanceLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mb-4" style={{ animation: 'spin 1s linear infinite' }}></div>
              <p className="text-sm text-gray-500">Loading attendance for {toMonthLabel(selectedMonth)}...</p>
            </div>
          ) : attendanceData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No Records Found</p>
              <p className="text-sm text-gray-400 mt-1">No attendance records for {toMonthLabel(selectedMonth)}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-l-lg">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Check In</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Check Out</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Working Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendanceData.map((record) => (
                    <tr key={record.id || record.date} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-50 p-2 rounded-lg">
                            <CalendarDays className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="font-medium text-gray-900">{formatDate(record.date)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <LogIn className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-green-700">{formatTime(record.checkIn)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span className="font-medium text-red-700">{formatTime(record.checkOut)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-700">
                        {formatWorkingHours(record.workingMinutes)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          record.status === 'Present' ? 'bg-green-100 text-green-700' :
                          record.status === 'Late' ? 'bg-amber-100 text-amber-700' :
                          record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {record.status === 'Present' && <CheckCircle className="w-3 h-3" />}
                          {record.status === 'Late' && <Timer className="w-3 h-3" />}
                          {record.status === 'Absent' && <XCircle className="w-3 h-3" />}
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLeaveManagement = () => (
    <div className="space-y-6">
      {leaveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          {leaveError}
        </div>
      )}

      {/* Header with Apply Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Leave Management</h3>
          <p className="text-sm text-gray-500 mt-1">Track and manage your leave requests</p>
        </div>
        <button
          onClick={() => {
            setLeaveEditId(null);
            setLeaveForm({ type: 'Sick Leave', startDate: '', endDate: '', reason: '' });
            setLeaveError('');
            setShowLeaveForm(true);
          }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Apply Leave</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-linear-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600">{leaveStats.availableDays}</div>
              <div className="text-sm font-medium text-green-700 mt-1">Available Days</div>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-linear-to-br from-amber-50 to-yellow-50 p-5 rounded-xl border border-amber-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-amber-600">{leaveStats.usedDays}</div>
              <div className="text-sm font-medium text-amber-700 mt-1">Used Days</div>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl">
              <CalendarDays className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600">{leaveStats.pendingRequests}</div>
              <div className="text-sm font-medium text-blue-700 mt-1">Pending Requests</div>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Leave List Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* List Header with View Toggle */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h4 className="font-semibold text-gray-800">Leave Requests</h4>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 mr-2">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setLeaveViewMode('list')}
                className={`p-2 rounded-md transition-all ${leaveViewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLeaveViewMode('grid')}
                className={`p-2 rounded-md transition-all ${leaveViewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {leaveLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="ml-3 text-gray-500">Loading leave requests...</span>
            </div>
          ) : leaveData.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No leave requests found</p>
              <p className="text-gray-400 text-sm mt-1">Click "Apply Leave" to submit your first request</p>
            </div>
          ) : leaveViewMode === 'list' ? (
            /* List View */
            <div className="space-y-3">
              {leaveData.map((leave) => (
                <div
                  key={leave.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all bg-gray-50/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Leave Type Icon */}
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        leave.type === 'Sick Leave' ? 'bg-red-100' :
                        leave.type === 'Casual Leave' ? 'bg-orange-100' :
                        leave.type === 'Annual Leave' ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        <CalendarRange className={`w-5 h-5 ${
                          leave.type === 'Sick Leave' ? 'text-red-600' :
                          leave.type === 'Casual Leave' ? 'text-orange-600' :
                          leave.type === 'Annual Leave' ? 'text-green-600' : 'text-purple-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-semibold text-gray-900">{leave.type}</h5>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(leave.status)}`}>
                            {leave.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-600">
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                          <span>{formatDate(leave.startDate)} — {formatDate(leave.endDate)}</span>
                        </div>
                        {leave.reason && (
                          <div className="flex items-start gap-2 mt-2 text-sm text-gray-600">
                            <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                            <span className="line-clamp-2">{leave.reason}</span>
                          </div>
                        )}
                        {leave.adminNote && (
                          <div className="mt-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md inline-block">
                            Admin: {leave.adminNote}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Actions */}
                    {String(leave.status).toLowerCase() === 'pending' && (
                      <div className="flex items-center gap-1 sm:flex-col sm:gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditLeave(leave)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLeave(leave)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaveData.map((leave) => (
                <div
                  key={leave.id}
                  className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all bg-white"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${
                      leave.type === 'Sick Leave' ? 'bg-red-100' :
                      leave.type === 'Casual Leave' ? 'bg-orange-100' :
                      leave.type === 'Annual Leave' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      <CalendarRange className={`w-5 h-5 ${
                        leave.type === 'Sick Leave' ? 'text-red-600' :
                        leave.type === 'Casual Leave' ? 'text-orange-600' :
                        leave.type === 'Annual Leave' ? 'text-green-600' : 'text-purple-600'
                      }`} />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </div>

                  {/* Content */}
                  <h5 className="font-semibold text-gray-900 mb-2">{leave.type}</h5>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(leave.startDate)}</span>
                    <span className="text-gray-400">→</span>
                    <span>{formatDate(leave.endDate)}</span>
                  </div>
                  {leave.reason && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{leave.reason}</p>
                  )}
                  {leave.adminNote && (
                    <div className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md mb-3">
                      Admin: {leave.adminNote}
                    </div>
                  )}

                  {/* Actions */}
                  {String(leave.status).toLowerCase() === 'pending' && (
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleEditLeave(leave)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLeave(leave)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showLeaveForm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowLeaveForm(false)}
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            {/* Header */}
            <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-t-2xl px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {leaveEditId ? 'Edit Leave Request' : 'Apply for Leave'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowLeaveForm(false);
                    setLeaveEditId(null);
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form className="p-6 space-y-5" onSubmit={submitLeaveRequest}>
              {leaveError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{leaveError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Leave Type</label>
                <div className="relative">
                  <select
                    value={leaveForm.type}
                    onChange={(e) => setLeaveForm((prev) => ({ ...prev, type: e.target.value }))}
                    className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Maternity Leave">Maternity Leave</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    min={leaveForm.startDate}
                    onChange={(e) => setLeaveForm((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason</label>
                <textarea
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Please provide a reason for your leave request..."
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  rows="3"
                />
              </div>

              {/* Available Leave Info */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">Available Leave Days:</span>
                  <span className="font-semibold text-blue-800">{leaveStats.availableDays} days</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLeaveForm(false);
                    setLeaveEditId(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={leaveSubmitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {leaveSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{leaveEditId ? 'Update Request' : 'Submit Request'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {leaveToDelete && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && !leaveDeleting && setLeaveToDelete(null)}
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            {/* Icon */}
            <div className="pt-6 pb-2 flex justify-center">
              <div className="bg-red-100 p-4 rounded-full">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-2 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Leave Request?</h3>
              <p className="text-sm text-gray-600 mb-1">
                Are you sure you want to delete this leave request?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mt-3 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${
                    leaveToDelete.type === 'Sick Leave' ? 'bg-red-500' :
                    leaveToDelete.type === 'Casual Leave' ? 'bg-orange-500' :
                    leaveToDelete.type === 'Annual Leave' ? 'bg-green-500' : 'bg-purple-500'
                  }`} />
                  <span className="font-medium text-gray-900 text-sm">{leaveToDelete.type}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {formatDate(leaveToDelete.startDate)} — {formatDate(leaveToDelete.endDate)}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 flex gap-3">
              <button
                type="button"
                onClick={() => setLeaveToDelete(null)}
                disabled={leaveDeleting}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteLeave}
                disabled={leaveDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {leaveDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Profile Management</h3>
          <p className="text-sm text-gray-500 mt-1">View and manage your personal information</p>
        </div>
        <button
          onClick={handleProfileEditSave}
          disabled={profileSaving || profileLoading}
          className={`px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed ${
            editProfile
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {profileSaving ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="font-medium">Saving...</span>
            </>
          ) : editProfile ? (
            <>
              <Save className="w-4 h-4" />
              <span className="font-medium">Save Changes</span>
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" />
              <span className="font-medium">Edit Profile</span>
            </>
          )}
        </button>
      </div>

      {/* Alerts */}
      {profileError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-sm text-red-700">{profileError}</p>
        </div>
      )}
      {profileSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-green-700">{profileSuccess}</p>
        </div>
      )}

      {/* Loading State */}
      {profileLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Profile Header with Gradient */}
            <div className="bg-linear-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 py-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  {profileData.profilePic ? (
                    <img
                      src={profileData.profilePic}
                      alt={profileData.name || 'Profile'}
                      className="w-28 h-28 rounded-full object-cover border-4 border-white/30 shadow-lg"
                    />
                  ) : (
                    <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30">
                      <UserCircle className="w-16 h-16 text-white/80" />
                    </div>
                  )}
                  {editProfile && (
                    <button
                      type="button"
                      onClick={() => profilePicInputRef.current?.click()}
                      disabled={profileSaving}
                      className="absolute bottom-1 right-1 bg-white text-blue-600 p-2.5 rounded-full hover:bg-gray-100 disabled:opacity-60 shadow-lg transition-transform hover:scale-105"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                  <input
                    ref={profilePicInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePicUpload}
                  />
                </div>
                {/* Basic Info */}
                <div className="text-center sm:text-left">
                  <h4 className="text-2xl font-bold text-white">{profileData.name || 'Teacher Name'}</h4>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <Building2 className="w-4 h-4 text-white/70" />
                    <p className="text-white/90">{profileData.department || 'Department'}</p>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                    <BadgeCheck className="w-4 h-4 text-white/70" />
                    <p className="text-white/80 text-sm">ID: {profileData.employeeId || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2.5 rounded-xl">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{profileData.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2.5 rounded-xl">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{profileData.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2.5 rounded-xl">
                  <CalendarDays className="w-5 h-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Join Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(profileData.joinDate) || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2.5 rounded-xl">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Emergency</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{profileData.emergencyContact || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <h5 className="font-semibold text-gray-800">Personal Information</h5>
                {editProfile && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Editing</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => handleProfileInputChange('name', e.target.value)}
                      disabled={!editProfile}
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all"
                    />
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileInputChange('email', e.target.value)}
                      disabled={!editProfile}
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                      disabled={!editProfile}
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all"
                    />
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileData.department}
                      onChange={(e) => handleProfileInputChange('department', e.target.value)}
                      disabled={!editProfile}
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all"
                    />
                    <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Join Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={profileData.joinDate}
                      onChange={(e) => handleProfileInputChange('joinDate', e.target.value)}
                      disabled={!editProfile}
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Employee ID</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileData.employeeId}
                      disabled
                      className="block w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-xl text-gray-600 cursor-not-allowed"
                    />
                    <BadgeCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Employee ID cannot be changed</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                  <div className="relative">
                    <textarea
                      value={profileData.address}
                      onChange={(e) => handleProfileInputChange('address', e.target.value)}
                      disabled={!editProfile}
                      placeholder="Enter your full address..."
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all resize-none"
                      rows="3"
                    />
                    <MapPin className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Emergency Contact</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileData.emergencyContact}
                      onChange={(e) => handleProfileInputChange('emergencyContact', e.target.value)}
                      disabled={!editProfile}
                      placeholder="Name and phone number of emergency contact"
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all"
                    />
                    <Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Cancel Button when editing */}
              {editProfile && (
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditProfile(false)}
                    className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProfileEditSave}
                    disabled={profileSaving}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {profileSaving ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Notifications & Alerts</h3>
        <div className="text-sm text-gray-600">
          {notifications.filter(n => !n.read).length} unread
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {notification.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                  {notification.type === 'info' && <BellRing className="w-5 h-5 text-blue-500" />}
                  <h4 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                    {notification.title}
                  </h4>
                </div>
                <p className={`mt-1 text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                  {notification.message}
                </p>
                <p className="mt-2 text-xs text-gray-400">{notification.timestamp}</p>
              </div>
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Document Access</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                    <p className="text-sm text-gray-600">{doc.type} • {doc.size}</p>
                    <p className="text-xs text-gray-500">{doc.category} • {doc.uploadDate}</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderExpenses = () => (
    <div className="space-y-6">
      {expenseError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          {expenseError}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Expense Claims</h3>
          <p className="text-sm text-gray-500 mt-1">Submit and track your expense reimbursements</p>
        </div>
        <button
          onClick={() => {
            setExpenseEditId(null);
            setExpenseError('');
            setExpenseForm({
              category: 'Travel',
              amount: '',
              description: '',
              date: new Date().toISOString().slice(0, 10),
              receiptFile: null,
              receiptName: '',
              receiptUrl: ''
            });
            setShowExpenseForm(true);
          }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">New Claim</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-linear-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600 flex items-center">
                <IndianRupee className="w-6 h-6" />
                {expenseStats.approved.toLocaleString('en-IN')}
              </div>
              <div className="text-sm font-medium text-green-700 mt-1">Approved Claims</div>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-linear-to-br from-amber-50 to-yellow-50 p-5 rounded-xl border border-amber-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-amber-600 flex items-center">
                <IndianRupee className="w-6 h-6" />
                {expenseStats.pending.toLocaleString('en-IN')}
              </div>
              <div className="text-sm font-medium text-amber-700 mt-1">Pending Claims</div>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-linear-to-br from-red-50 to-rose-50 p-5 rounded-xl border border-red-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-red-600 flex items-center">
                <IndianRupee className="w-6 h-6" />
                {expenseStats.rejected.toLocaleString('en-IN')}
              </div>
              <div className="text-sm font-medium text-red-700 mt-1">Rejected Claims</div>
            </div>
            <div className="bg-red-100 p-3 rounded-xl">
              <X className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Expense List Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* List Header with View Toggle */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h4 className="font-semibold text-gray-800">Expense History</h4>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 mr-2">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setExpenseViewMode('list')}
                className={`p-2 rounded-md transition-all ${expenseViewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setExpenseViewMode('grid')}
                className={`p-2 rounded-md transition-all ${expenseViewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {expenseLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="ml-3 text-gray-500">Loading expenses...</span>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No expense claims found</p>
              <p className="text-gray-400 text-sm mt-1">Click "New Claim" to submit your first expense</p>
            </div>
          ) : expenseViewMode === 'list' ? (
            /* List View */
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all bg-gray-50/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Category Icon */}
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        expense.category === 'Travel' ? 'bg-blue-100' :
                        expense.category === 'Supplies' ? 'bg-purple-100' :
                        expense.category === 'Training' ? 'bg-green-100' :
                        expense.category === 'Entertainment' ? 'bg-pink-100' : 'bg-gray-100'
                      }`}>
                        <Wallet className={`w-5 h-5 ${
                          expense.category === 'Travel' ? 'text-blue-600' :
                          expense.category === 'Supplies' ? 'text-purple-600' :
                          expense.category === 'Training' ? 'text-green-600' :
                          expense.category === 'Entertainment' ? 'text-pink-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-semibold text-gray-900">{expense.category}</h5>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(expense.status)}`}>
                            {expense.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{expense.description}</p>
                        <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4" />
                            {formatDate(expense.date)}
                          </span>
                          {expense.receiptUrl && (
                            <a
                              href={expense.receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                            >
                              <FileCheck className="w-4 h-4" />
                              View Receipt
                            </a>
                          )}
                        </div>
                        {expense.adminNote && (
                          <div className="mt-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md inline-block">
                            Admin: {expense.adminNote}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Amount & Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900 flex items-center">
                          <IndianRupee className="w-5 h-5" />
                          {Number(expense.amount).toLocaleString('en-IN')}
                        </div>
                      </div>
                      {String(expense.status).toLowerCase() === 'pending' && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditExpense(expense)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(expense)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all bg-white"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${
                      expense.category === 'Travel' ? 'bg-blue-100' :
                      expense.category === 'Supplies' ? 'bg-purple-100' :
                      expense.category === 'Training' ? 'bg-green-100' :
                      expense.category === 'Entertainment' ? 'bg-pink-100' : 'bg-gray-100'
                    }`}>
                      <Wallet className={`w-5 h-5 ${
                        expense.category === 'Travel' ? 'text-blue-600' :
                        expense.category === 'Supplies' ? 'text-purple-600' :
                        expense.category === 'Training' ? 'text-green-600' :
                        expense.category === 'Entertainment' ? 'text-pink-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(expense.status)}`}>
                      {expense.status}
                    </span>
                  </div>

                  {/* Content */}
                  <h5 className="font-semibold text-gray-900 mb-1">{expense.category}</h5>
                  <div className="text-2xl font-bold text-gray-900 flex items-center mb-2">
                    <IndianRupee className="w-5 h-5" />
                    {Number(expense.amount).toLocaleString('en-IN')}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{expense.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <CalendarDays className="w-4 h-4" />
                    {formatDate(expense.date)}
                  </div>
                  {expense.receiptUrl && (
                    <a
                      href={expense.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-3"
                    >
                      <FileCheck className="w-4 h-4" />
                      View Receipt
                    </a>
                  )}
                  {expense.adminNote && (
                    <div className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md mb-3">
                      Admin: {expense.adminNote}
                    </div>
                  )}

                  {/* Actions */}
                  {String(expense.status).toLowerCase() === 'pending' && (
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleEditExpense(expense)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(expense)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowExpenseForm(false)}
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            {/* Header */}
            <div className="bg-linear-to-r from-emerald-600 to-teal-600 rounded-t-2xl px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Receipt className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {expenseEditId ? 'Edit Expense Claim' : 'New Expense Claim'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowExpenseForm(false);
                    setExpenseEditId(null);
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form className="p-6 space-y-5" onSubmit={handleExpenseSubmit}>
              {expenseError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{expenseError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <div className="relative">
                    <select
                      value={expenseForm.category}
                      onChange={(e) => setExpenseForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Travel">Travel</option>
                      <option value="Supplies">Supplies</option>
                      <option value="Training">Training</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <IndianRupee className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    className="block w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your expense..."
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Receipt (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-emerald-400 transition-colors">
                  <input
                    type="file"
                    onChange={(e) => setExpenseForm((prev) => ({ ...prev, receiptFile: e.target.files?.[0] || null }))}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label htmlFor="receipt-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload receipt</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 5MB</p>
                  </label>
                </div>
                {expenseForm.receiptFile && (
                  <p className="text-xs text-emerald-600 mt-2">Selected: {expenseForm.receiptFile.name}</p>
                )}
                {expenseForm.receiptName && !expenseForm.receiptFile && (
                  <p className="text-xs text-gray-500 mt-2">Current: {expenseForm.receiptName}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowExpenseForm(false);
                    setExpenseEditId(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={expenseSubmitting}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {expenseSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{expenseEditId ? 'Update Claim' : 'Submit Claim'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {expenseToDelete && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && !expenseDeleting && setExpenseToDelete(null)}
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            {/* Icon */}
            <div className="pt-6 pb-2 flex justify-center">
              <div className="bg-red-100 p-4 rounded-full">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-2 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Expense Claim?</h3>
              <p className="text-sm text-gray-600 mb-1">
                Are you sure you want to delete this expense claim?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mt-3 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900 text-sm">{expenseToDelete.category}</span>
                  <span className="font-bold text-gray-900 flex items-center">
                    <IndianRupee className="w-4 h-4" />
                    {Number(expenseToDelete.amount).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{formatDate(expenseToDelete.date)}</p>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 flex gap-3">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                disabled={expenseDeleting}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteExpense}
                disabled={expenseDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {expenseDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Tab Navigation — pill style */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                active
                  ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'attendance' && renderAttendance()}
      {activeTab === 'leave' && renderLeaveManagement()}
      {activeTab === 'profile' && renderProfile()}
      {activeTab === 'notifications' && renderNotifications()}
      {activeTab === 'documents' && renderDocuments()}
      {activeTab === 'expenses' && renderExpenses()}
    </div>
  );
};

export default MyWorkPortal;
