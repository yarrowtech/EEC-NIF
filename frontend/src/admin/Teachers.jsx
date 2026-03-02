import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  BookOpen,
  Eye,
  XCircle,
  Users,
  UserCheck,
  Clock,
  Building2,
  KeyRound,
  Copy,
  Check,
  GraduationCap,
  MapPin,
  Briefcase,
  Calendar,
  User,
  Award,
  Hash,
  Crown
} from 'lucide-react';
import CredentialGeneratorButton from './components/CredentialGeneratorButton';

const TEACHERS_CACHE_PREFIX = 'admin_teachers_cache_v1';

const AVATAR_COLORS = [
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-pink-100', text: 'text-pink-700' },
  { bg: 'bg-teal-100', text: 'text-teal-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
];

const getAvatarColor = (name) => {
  const hash = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const resolveImageUrl = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.secure_url || value.url || value.path || '';
  }
  return '';
};

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const normalizeDayLabel = (value) => {
  const lower = String(value || '').trim().toLowerCase();
  return WEEK_DAYS.find((day) => day.toLowerCase() === lower) || null;
};

const getTodayCacheDateKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const formatScheduleMeta = (entry) => {
  const dayLabel = entry?.dayOfWeek ? `${entry.dayOfWeek}:` : '';
  const classLabel = [entry?.className, entry?.sectionName].filter(Boolean).join('-');
  const timeLabel = [entry?.startTime, entry?.endTime].filter(Boolean).join('-');
  return [dayLabel, classLabel, timeLabel].filter(Boolean).join(' ');
};

const inputClass =
  'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all bg-white';

const resolveTeacherStatus = (teacher, todayCheckedInTeacherIds, attendanceLoaded) => {
  if (attendanceLoaded) {
    const teacherId = String(teacher?._id || teacher?.id || '');
    return todayCheckedInTeacherIds.has(teacherId) ? 'Active' : 'On Leave';
  }
  const rawStatus = String(teacher?.status || '').trim().toLowerCase();
  if (rawStatus === 'on leave' || rawStatus === 'leave' || rawStatus === 'absent') return 'On Leave';
  return 'Active';
};

const Teachers = ({setShowAdminHeader}) => {
  const [activeTab, setActiveTab] = useState('teachers');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [teachers, setTeachers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [credentialLoadingId, setCredentialLoadingId] = useState(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState(null);
  const [deleteConfirmTeacher, setDeleteConfirmTeacher] = useState(null);
  const [credentialView, setCredentialView] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [viewTeacher, setViewTeacher] = useState(null);
  const [scheduleModal, setScheduleModal] = useState(null);
  const [principalLoadingId, setPrincipalLoadingId] = useState(null);
  const [principalCredentialView, setPrincipalCredentialView] = useState(null);

  // Principals tab state
  const [principals, setPrincipals] = useState([]);
  const [loadingPrincipals, setLoadingPrincipals] = useState(false);
  const [principalSearchTerm, setPrincipalSearchTerm] = useState('');
  const [principalCredLoadingId, setPrincipalCredLoadingId] = useState(null);
  const [principalDeleteLoadingId, setPrincipalDeleteLoadingId] = useState(null);
  const [deleteConfirmPrincipal, setDeleteConfirmPrincipal] = useState(null);
  const [makePrincipalConfirmTeacher, setMakePrincipalConfirmTeacher] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    mobile: '',
    subject: '',
    department: '',
    experience: '',
    qualification: '',
    status: 'Active',
    joiningDate: '',
    gender: '',
    address: '',
    pinCode: '',
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTeachers = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const getTeachersCacheKey = () => {
    const token = localStorage.getItem('token');
    const dayKey = getTodayCacheDateKey();
    if (!token) return `${TEACHERS_CACHE_PREFIX}_anonymous_${dayKey}`;
    try {
      const base64 = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      const adminId = payload?.id || 'unknown';
      const schoolId = payload?.schoolId || 'school';
      const campusId = payload?.campusId || 'campus';
      return `${TEACHERS_CACHE_PREFIX}_${adminId}_${schoolId}_${campusId}_${dayKey}`;
    } catch {
      return `${TEACHERS_CACHE_PREFIX}_fallback_${dayKey}`;
    }
  };

  const fetchTeachers = async ({ useCache = false } = {}) => {
    if (useCache) {
      try {
        const cachedRaw = sessionStorage.getItem(getTeachersCacheKey());
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (Array.isArray(cached?.teachers)) {
            setTeachers(cached.teachers);
            return;
          }
        }
      } catch (err) {
        console.warn('Unable to read teachers cache', err);
      }
    }

    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`
    };

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const [teachersRes, attendanceRes, timetableRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/get-teachers`, {
        method: 'GET',
        headers
      }),
      fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/teacher-attendance?month=${encodeURIComponent(monthKey)}`, {
        method: 'GET',
        headers
      }),
      fetch(`${import.meta.env.VITE_API_URL}/api/timetable/all`, {
        method: 'GET',
        headers
      })
    ]);

    if (!teachersRes.ok) {
      throw new Error('Failed to fetch teachers');
    }

    const data = await teachersRes.json();
    const attendanceData = attendanceRes.ok ? await attendanceRes.json().catch(() => ({})) : {};
    const timetableData = timetableRes.ok ? await timetableRes.json().catch(() => []) : [];
    const todayCheckedInTeacherIds = new Set(
      (Array.isArray(attendanceData?.records) ? attendanceData.records : [])
        .filter((record) => record?.date === todayKey && record?.checkInAt)
        .map((record) => String(record?.teacherId))
    );
    const attendanceLoaded = attendanceRes.ok;
    const scheduleByTeacherId = new Map();

    (Array.isArray(timetableData) ? timetableData : []).forEach((timetable) => {
      const className = timetable?.classId?.name || '';
      const sectionName = timetable?.sectionId?.name || '';
      (Array.isArray(timetable?.entries) ? timetable.entries : []).forEach((entry) => {
        if (!entry?.teacherId || !entry?.dayOfWeek) return;
        const teacherId = String(entry.teacherId?._id || entry.teacherId);
        if (!teacherId) return;
        if (!scheduleByTeacherId.has(teacherId)) scheduleByTeacherId.set(teacherId, []);
        const dayOfWeek = normalizeDayLabel(entry.dayOfWeek);
        if (!dayOfWeek) return;
        scheduleByTeacherId.get(teacherId).push({
          dayOfWeek,
          period: entry.period,
          startTime: entry.startTime || '',
          endTime: entry.endTime || '',
          subjectName: entry?.subjectId?.name || '',
          className,
          sectionName,
        });
      });
    });

    const normalized = (Array.isArray(data) ? data : []).map((teacher, idx) => ({
      ...teacher,
      id: teacher._id || teacher.id || idx,
      name: teacher.name || 'Unnamed Teacher',
      email: teacher.email || '-',
      mobile: teacher.mobile || '-',
      subject: teacher.subject || '-',
      department: teacher.department || '-',
      qualification: teacher.qualification || '-',
      joiningDate: teacher.joiningDate || teacher.joinDate || '',
      empId: teacher.employeeCode || teacher.empId || '-',
      profilePic: resolveImageUrl(teacher.profilePic || teacher.avatar || teacher.photo),
      scheduleTodayEntries: [...(scheduleByTeacherId.get(String(teacher._id || teacher.id || '')) || [])]
        .sort((a, b) => {
          const dayDiff = WEEK_DAYS.indexOf(a.dayOfWeek) - WEEK_DAYS.indexOf(b.dayOfWeek);
          if (dayDiff !== 0) return dayDiff;
          return (Number(a.period) || 0) - (Number(b.period) || 0);
        }),
      status: resolveTeacherStatus(teacher, todayCheckedInTeacherIds, attendanceLoaded)
    }));
    setTeachers(normalized);
    try {
      sessionStorage.setItem(
        getTeachersCacheKey(),
        JSON.stringify({ teachers: normalized, cachedAt: Date.now() })
      );
    } catch (err) {
      console.warn('Unable to cache teachers data', err);
    }
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const fetchPrincipals = async () => {
    setLoadingPrincipals(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/get-principals`, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setPrincipals(Array.isArray(data) ? data : (data.principals || []));
      }
    } catch (err) {
      console.error('Error fetching principals:', err);
    } finally {
      setLoadingPrincipals(false);
    }
  };

  const handleViewPrincipalCredentials = async (principal) => {
    const principalId = principal?._id || principal?.id;
    if (!principalId) return;
    setPrincipalCredLoadingId(principalId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/principals/${principalId}/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Unable to load credentials');
      const principalResetAt = data?.lastLoginAt ? new Date(data.lastLoginAt) : null;
      const passwordValue = principalResetAt
        ? `Password reset by the principal at ${principalResetAt.toLocaleDateString()}`
        : (data?.initialPassword || 'Not available');
      setPrincipalCredentialView({
        name: data?.name || principal.name,
        username: data.username || data.email || principal.email,
        email: data.email || principal.email,
        password: passwordValue
      });
    } catch (error) {
      setSubmitStatus({ type: 'error', message: error.message || 'Unable to load credentials' });
    } finally {
      setPrincipalCredLoadingId(null);
    }
  };

  const handleDeletePrincipal = async (principal) => {
    const principalId = principal?._id || principal?.id;
    if (!principalId || principalDeleteLoadingId) return;

    setPrincipalDeleteLoadingId(principalId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/principals/${principalId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Unable to delete principal');
      }

      setPrincipals((prev) => prev.filter((item) => String(item._id || item.id) !== String(principalId)));
      setSubmitStatus({ type: 'success', message: `${principal?.name || 'Principal'} deleted successfully.` });
      fetchPrincipals().catch(console.error);
    } catch (error) {
      setSubmitStatus({ type: 'error', message: error.message || 'Unable to delete principal' });
    } finally {
      setPrincipalDeleteLoadingId(null);
      setDeleteConfirmPrincipal(null);
    }
  };

  // making the admin header invisible
  useEffect(() => {
    setShowAdminHeader(false);
    fetchTeachers({ useCache: true }).catch(err => {
      console.error("Error fetching teachers:", err);
    });
  }, [setShowAdminHeader]);

  useEffect(() => {
    if (activeTab === 'principals' && principals.length === 0) {
      fetchPrincipals();
    }
  }, [activeTab]);

  const handleAddTeacherChange = (e) => {
    const { name, value } = e.target;
    setNewTeacher(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTeacherSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitStatus(null);
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
          throw new Error(data?.error || 'Registration failed');
        }
      setSubmitStatus({
        type: 'success',
        message: data?.emailSent
          ? 'Teacher added and credentials emailed.'
          : 'Teacher added. Email not sent.'
      });
      if (data?.username && data?.password) {
        setCredentialView({
          name: newTeacher.name,
          username: data.username,
          employeeCode: data.employeeCode || data.username,
          password: data.password
        });
      }
      setShowAddForm(false);
      await fetchTeachers();
      // Reset form
      setNewTeacher({
        name: '', email: '', mobile: '', subject: '', department: '', experience: '', qualification: '', joiningDate: '', address: '', pinCode: '', gender: ''
      });
    }
    catch (error) {
      console.error('Error adding teacher:', error);
      setSubmitStatus({ type: 'error', message: error.message || 'Unable to add teacher' });
    }
  };

  const handleViewCredentials = async (teacher) => {
    const teacherId = teacher?._id || teacher?.id;
    if (!teacherId) return;
    const confirmReset = window.confirm(
      `This will reset ${teacher.name || 'the teacher'}'s password and generate a new one. Continue?`
    );
    if (!confirmReset) return;
    setCredentialLoadingId(teacherId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/teachers/${teacherId}/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to generate credentials');
      }
      setCredentialView({
        name: teacher.name,
        username: data.username,
        employeeCode: data.employeeCode || data.username,
        password: data.password
      });
    } catch (error) {
      setSubmitStatus({ type: 'error', message: error.message || 'Unable to generate credentials' });
    } finally {
      setCredentialLoadingId(null);
    }
  };

  const copyCredential = async (value, field) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy credential:', err);
    }
  };

  const handleDeleteTeacher = async (teacher) => {
    const teacherId = teacher?._id || teacher?.id;
    if (!teacherId || deletingTeacherId) return;

    setDeletingTeacherId(teacherId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/teachers/${teacherId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Unable to delete teacher');
      }

      setTeachers((prev) => prev.filter((item) => String(item._id || item.id) !== String(teacherId)));
      setSubmitStatus({ type: 'success', message: `${teacher.name || 'Teacher'} deleted successfully.` });
      fetchTeachers().catch(console.error);
    } catch (error) {
      setSubmitStatus({ type: 'error', message: error.message || 'Unable to delete teacher' });
    } finally {
      setDeletingTeacherId(null);
      setDeleteConfirmTeacher(null);
    }
  };

  const handleMakePrincipal = async (teacher) => {
    const teacherId = teacher?._id || teacher?.id;
    if (!teacherId) return;
    setPrincipalLoadingId(teacherId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/teachers/${teacherId}/make-principal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to create principal account');
      }
      setPrincipalCredentialView({
        name: data.teacherName || teacher.name,
        username: data.username,
        email: data.email,
        password: data.password
      });
      setSubmitStatus({ type: 'success', message: `Principal account created for ${teacher.name || 'teacher'}` });
    } catch (error) {
      setSubmitStatus({ type: 'error', message: error.message || 'Unable to create principal account' });
    } finally {
      setPrincipalLoadingId(null);
      setMakePrincipalConfirmTeacher(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
                <p className="text-sm text-gray-500 mt-0.5">Manage your teaching staff</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* <CredentialGeneratorButton
                buttonText="Generate Teacher ID"
                defaultRole="Teacher"
                allowRoleSelection={false}
                size="sm"
                buttonClassName="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm"
              /> */}
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-200 text-sm font-medium"
              >
                <Plus size={18} />
                Add Teacher
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{teachers.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Users size={20} className="text-indigo-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{teachers.filter(t => t.status === 'Active').length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <UserCheck size={20} className="text-emerald-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">On Leave</p>
                  <p className="text-2xl font-bold text-amber-500 mt-1">{teachers.filter(t => t.status === 'On Leave').length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock size={20} className="text-amber-500" />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Departments</p>
                  <p className="text-2xl font-bold text-violet-600 mt-1">{new Set(teachers.map(t => t.department)).size}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                  <Building2 size={20} className="text-violet-600" />
                </div>
              </div>
            </div>
          </div>

          {submitStatus && (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${
                submitStatus.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {submitStatus.type === 'success'
                ? <Check size={15} className="flex-shrink-0" />
                : <XCircle size={15} className="flex-shrink-0" />}
              {submitStatus.message}
            </div>
          )}

          {/* Tabs */}
          <div className="mt-6 flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('teachers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'teachers'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <GraduationCap size={15} />
              Teachers
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === 'teachers' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                {teachers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('principals')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'principals'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Crown size={15} />
              Principals
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === 'principals' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-500'}`}>
                {principals.length}
              </span>
            </button>
          </div>

          {/* Search and Filter — Teachers only */}
          {activeTab === 'teachers' && <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, subject or email..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white shadow-sm text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="sm:w-44 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white shadow-sm text-sm text-gray-700"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>}
        </div>

        {/* Teachers Table */}
        {activeTab === 'teachers' && <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-slate-50/80 border-b border-gray-100">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Teacher</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject & Dept</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Weekly Routine</th>
                  {/* <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Qualification</th> */}
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentTeachers.map((teacher) => {
                  const avatarColor = getAvatarColor(teacher.name);
                  const teacherInitials = (teacher.name || 'NA').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <tr key={teacher._id || teacher.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${avatarColor.bg} flex items-center justify-center text-sm font-bold ${avatarColor.text} flex-shrink-0 overflow-hidden`}>
                            {teacher.profilePic ? (
                              <img
                                src={teacher.profilePic}
                                alt={teacher.name || 'Teacher'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              teacherInitials
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{teacher.name}</div>
                            <div className="text-xs text-gray-400 font-mono">#{teacher.empId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail size={13} className="mr-2 text-indigo-400 flex-shrink-0" />
                            <span className="truncate max-w-[180px]">{teacher.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone size={13} className="mr-2 text-emerald-400 flex-shrink-0" />
                            <span>{teacher.mobile}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center text-sm font-medium text-gray-800">
                            <BookOpen size={13} className="mr-2 text-violet-400 flex-shrink-0" />
                            {teacher.subject}
                          </div>
                          <span className="inline-block text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                            {teacher.department}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {teacher.scheduleTodayEntries?.length ? (
                          <div className="space-y-2 min-w-[250px]">
                            {teacher.scheduleTodayEntries.slice(0, 1).map((entry, idx) => (
                              <div key={`${teacher.id || teacher._id}-sched-${idx}`} className="text-sm">
                                <div className="font-medium text-gray-800">{entry.subjectName || 'Class'}</div>
                                <div className="text-xs text-gray-500">({formatScheduleMeta(entry)})</div>
                              </div>
                            ))}
                            {teacher.scheduleTodayEntries.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setScheduleModal({ teacherName: teacher.name, entries: teacher.scheduleTodayEntries })}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                              >
                                More ({teacher.scheduleTodayEntries.length - 1})
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">No routine assigned</div>
                        )}
                      </td>
                      {/* <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-800">{teacher.qualification || '-'}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Joined: {teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : '-'}
                        </div>
                      </td> */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                          ${teacher.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${teacher.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {teacher.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                            title="View Details"
                            onClick={() => setViewTeacher(teacher)}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all disabled:opacity-40"
                            title="Make Principal"
                            onClick={() => setMakePrincipalConfirmTeacher(teacher)}
                            disabled={principalLoadingId === (teacher._id || teacher.id)}
                          >
                            <Crown size={15} />
                          </button>
                          {/* <button
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all"
                            title="Generate Credentials"
                            onClick={() => handleViewCredentials(teacher)}
                            disabled={credentialLoadingId === (teacher._id || teacher.id)}
                          >
                            <KeyRound size={15} />
                          </button> */}
                          <button
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-40"
                            title="Delete"
                            onClick={() => setDeleteConfirmTeacher(teacher)}
                            disabled={deletingTeacherId === (teacher._id || teacher.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredTeachers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-500">
                  Showing{' '}
                  <span className="font-semibold text-gray-700">{indexOfFirstItem + 1}</span>
                  {' '}–{' '}
                  <span className="font-semibold text-gray-700">{Math.min(indexOfLastItem, filteredTeachers.length)}</span>
                  {' '}of{' '}
                  <span className="font-semibold text-gray-700">{filteredTeachers.length}</span> teachers
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all
                          ${currentPage === i + 1
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                            : 'border border-gray-200 text-gray-600 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
                          }`}
                      >
                        {i + 1}
                      </button>
                    )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                  </div>
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {filteredTeachers.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={28} className="text-indigo-400" />
              </div>
              <p className="text-gray-600 font-semibold">No teachers found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>}

        {/* Principals Tab */}
        {activeTab === 'principals' && (
          <div>
            {/* Principals search */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white shadow-sm text-sm"
                  value={principalSearchTerm}
                  onChange={(e) => setPrincipalSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={fetchPrincipals}
                className="sm:w-auto px-4 py-2.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-sm text-gray-600 font-medium shadow-sm transition-colors"
              >
                Refresh
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-50 to-pink-50/50 border-b border-gray-100">
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Principal</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Login ID</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loadingPrincipals ? (
                      <tr>
                        <td colSpan={4} className="py-16 text-center">
                          <div className="flex items-center justify-center gap-2 text-gray-400">
                            <span className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                            Loading principals...
                          </div>
                        </td>
                      </tr>
                    ) : principals.filter(p => {
                        const q = principalSearchTerm.toLowerCase();
                        return !q || (p.name || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q);
                      }).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-16 text-center">
                          <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
                            <Crown size={24} className="text-purple-300" />
                          </div>
                          <p className="text-gray-500 font-medium text-sm">No principals found</p>
                          <p className="text-gray-400 text-xs mt-1">Assign a teacher as principal using the Teachers tab</p>
                        </td>
                      </tr>
                    ) : (
                      principals
                        .filter(p => {
                          const q = principalSearchTerm.toLowerCase();
                          return !q || (p.name || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q);
                        })
                        .map((principal) => {
                          const avatarColor = getAvatarColor(principal.name);
                          const initials = (principal.name || 'P').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                          const loginId = principal.username || principal.employeeCode || principal.email || '—';
                          return (
                            <tr key={principal._id || principal.id} className="hover:bg-purple-50/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-xl ${avatarColor.bg} flex items-center justify-center text-sm font-bold ${avatarColor.text} flex-shrink-0 overflow-hidden`}>
                                    {principal.profilePic ? (
                                      <img src={resolveImageUrl(principal.profilePic)} alt={principal.name} className="w-full h-full object-cover" />
                                    ) : initials}
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                                      {principal.name}
                                      <Crown size={12} className="text-purple-400" />
                                    </div>
                                    <div className="text-xs text-gray-400">Principal</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1.5">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Mail size={13} className="mr-2 text-purple-400 flex-shrink-0" />
                                    <span className="truncate max-w-[180px]">{principal.email || '—'}</span>
                                  </div>
                                  {principal.mobile && (
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Phone size={13} className="mr-2 text-emerald-400 flex-shrink-0" />
                                      <span>{principal.mobile}</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <code className="text-xs font-mono bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">{loginId}</code>
                                  <button
                                    onClick={() => copyCredential(loginId, `pid_${principal._id || principal.id}`)}
                                    className={`p-1 rounded-lg transition-all ${copiedField === `pid_${principal._id || principal.id}` ? 'text-emerald-600' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'}`}
                                    title="Copy Login ID"
                                  >
                                    {copiedField === `pid_${principal._id || principal.id}` ? <Check size={13} /> : <Copy size={13} />}
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleViewPrincipalCredentials(principal)}
                                    disabled={principalCredLoadingId === (principal._id || principal.id) || principalDeleteLoadingId === (principal._id || principal.id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-xs font-medium disabled:opacity-50"
                                    title="Reset & View Credentials"
                                  >
                                    {principalCredLoadingId === (principal._id || principal.id) ? (
                                      <span className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <KeyRound size={13} />
                                    )}
                                    Credentials
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmPrincipal(principal)}
                                    disabled={principalDeleteLoadingId === (principal._id || principal.id) || principalCredLoadingId === (principal._id || principal.id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors text-xs font-medium disabled:opacity-50"
                                    title="Delete Principal"
                                  >
                                    {principalDeleteLoadingId === (principal._id || principal.id) ? (
                                      <span className="w-3 h-3 border border-rose-400 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Trash2 size={13} />
                                    )}
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Teacher Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200">
                  <Plus size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Add New Teacher</h2>
                  <p className="text-xs text-gray-500">Fill in the teacher's information</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTeacherSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name *</label>
                  <input type="text" name="name" value={newTeacher.name} onChange={handleAddTeacherChange} className={inputClass} required />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email *</label>
                  <input type="email" name="email" value={newTeacher.email} onChange={handleAddTeacherChange} className={inputClass} required />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Contact Number *</label>
                  <input type="tel" name="mobile" value={newTeacher.mobile} onChange={handleAddTeacherChange} className={inputClass} required />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Gender</label>
                  <select name="gender" value={newTeacher.gender} onChange={handleAddTeacherChange} className={inputClass}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Qualification</label>
                  <input type="text" name="qualification" value={newTeacher.qualification} onChange={handleAddTeacherChange} className={inputClass} placeholder="e.g., M.Sc, B.Ed" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Subject</label>
                  <input type="text" name="subject" value={newTeacher.subject} onChange={handleAddTeacherChange} className={inputClass} placeholder="e.g., Mathematics" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Department</label>
                  <input type="text" name="department" value={newTeacher.department} onChange={handleAddTeacherChange} className={inputClass} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Experience (years)</label>
                  <input type="number" name="experience" value={newTeacher.experience} onChange={handleAddTeacherChange} className={inputClass} min="0" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Joining Date</label>
                  <input type="date" name="joiningDate" value={newTeacher.joiningDate} onChange={handleAddTeacherChange} className={inputClass} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Address</label>
                  <input type="text" name="address" value={newTeacher.address} onChange={handleAddTeacherChange} className={inputClass} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Pin Code</label>
                  <input type="text" name="pinCode" value={newTeacher.pinCode} onChange={handleAddTeacherChange} className={inputClass} />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-200 text-sm font-medium"
                >
                  Add Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Details Modal */}
      {viewTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">

            {/* Gradient Profile Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 pt-6 pb-10 relative flex-shrink-0">
              <button
                onClick={() => setViewTeacher(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <XCircle size={18} />
              </button>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg flex-shrink-0 ${getAvatarColor(viewTeacher.name).bg} ${getAvatarColor(viewTeacher.name).text} overflow-hidden`}>
                  {viewTeacher.profilePic ? (
                    <img
                      src={viewTeacher.profilePic}
                      alt={viewTeacher.name || 'Teacher'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (viewTeacher.name || 'NA').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{viewTeacher.name}</h2>
                  <p className="text-indigo-200 text-sm mt-0.5 font-mono">#{viewTeacher.empId}</p>
                  <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold
                    ${viewTeacher.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${viewTeacher.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {viewTeacher.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Body — pulls up over the gradient */}
            <div className="overflow-y-auto mt-5">
              <div className="bg-white rounded-t-2xl px-6 pt-5 pb-6 space-y-5">

                {/* Contact Info */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Contact</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Mail size={14} className="text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="text-sm font-medium text-gray-800">{viewTeacher.email || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <Phone size={14} className="text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Mobile</p>
                        <p className="text-sm font-medium text-gray-800">{viewTeacher.mobile || '—'}</p>
                      </div>
                    </div>
                    {(viewTeacher.address || viewTeacher.pinCode) && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                          <MapPin size={14} className="text-rose-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Address</p>
                          <p className="text-sm font-medium text-gray-800">
                            {[viewTeacher.address, viewTeacher.pinCode].filter(Boolean).join(', ') || '—'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Professional Info */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Professional</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                        <BookOpen size={14} className="text-violet-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Subject</p>
                        <p className="text-sm font-medium text-gray-800">{viewTeacher.subject || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Building2 size={14} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Department</p>
                        <p className="text-sm font-medium text-gray-800">{viewTeacher.department || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Award size={14} className="text-amber-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Qualification</p>
                        <p className="text-sm font-medium text-gray-800">{viewTeacher.qualification || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                        <Briefcase size={14} className="text-teal-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Experience</p>
                        <p className="text-sm font-medium text-gray-800">
                          {viewTeacher.experience ? `${viewTeacher.experience} yrs` : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
                        <Calendar size={14} className="text-pink-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Joining Date</p>
                        <p className="text-sm font-medium text-gray-800">
                          {viewTeacher.joiningDate ? new Date(viewTeacher.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                        <User size={14} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Gender</p>
                        <p className="text-sm font-medium text-gray-800 capitalize">{viewTeacher.gender || '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-1">
                  {/* <button
                    onClick={() => {
                      setViewTeacher(null);
                      handleViewCredentials(viewTeacher);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-sm font-medium"
                  >
                    <KeyRound size={15} />
                    Generate Credentials
                  </button> */}
                  <button
                    onClick={() => setViewTeacher(null)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Details Modal */}
      {scheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Weekly Routine</h2>
                <p className="text-sm text-gray-500">{scheduleModal.teacherName}</p>
              </div>
              <button
                onClick={() => setScheduleModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-3">
                {scheduleModal.entries.map((entry, idx) => (
                  <div key={`schedule-modal-${idx}`} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">{entry.subjectName || 'Class'}</div>
                    <div className="text-xs text-gray-500 mt-1">({formatScheduleMeta(entry)})</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setScheduleModal(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {/* Delete Confirmation Modal */}
      {deleteConfirmTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Teacher</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete <span className="font-semibold text-gray-700">{deleteConfirmTeacher.name || 'this teacher'}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 pb-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmTeacher(null)}
                disabled={!!deletingTeacherId}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTeacher(deleteConfirmTeacher)}
                disabled={!!deletingTeacherId}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {deletingTeacherId ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmPrincipal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Principal</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete <span className="font-semibold text-gray-700">{deleteConfirmPrincipal.name || 'this principal'}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 pb-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmPrincipal(null)}
                disabled={!!principalDeleteLoadingId}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeletePrincipal(deleteConfirmPrincipal)}
                disabled={!!principalDeleteLoadingId}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {principalDeleteLoadingId ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {makePrincipalConfirmTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
                <Crown size={24} className="text-purple-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Make Principal</h3>
              <p className="text-sm text-gray-500 mt-2">
                This will create a Principal account for <span className="font-semibold text-gray-700">{makePrincipalConfirmTeacher.name || 'this teacher'}</span>. Continue?
              </p>
            </div>
            <div className="px-6 pb-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMakePrincipalConfirmTeacher(null)}
                disabled={!!principalLoadingId}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleMakePrincipal(makePrincipalConfirmTeacher)}
                disabled={!!principalLoadingId}
                className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {principalLoadingId ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {credentialView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <KeyRound size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Login Credentials</h2>
                    <p className="text-indigo-200 text-xs mt-0.5">Share these securely with the teacher</p>
                  </div>
                </div>
                <button
                  onClick={() => setCredentialView(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <XCircle size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Teacher identity */}
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${getAvatarColor(credentialView.name).bg} ${getAvatarColor(credentialView.name).text}`}>
                  {(credentialView.name || 'T').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-indigo-500 font-medium">Teacher</p>
                  <p className="text-sm font-semibold text-indigo-900">{credentialView.name || 'Teacher'}</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Login ID */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Login ID</p>
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <code className="text-sm font-mono text-gray-800">
                      {credentialView.employeeCode || credentialView.username}
                    </code>
                    <button
                      onClick={() => copyCredential(credentialView.employeeCode || credentialView.username, 'id')}
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${
                        copiedField === 'id'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-200 hover:bg-indigo-100 hover:text-indigo-700 text-gray-600'
                      }`}
                    >
                      {copiedField === 'id' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedField === 'id' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Password</p>
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <code className="text-sm font-mono text-gray-800">{credentialView.password}</code>
                    <button
                      onClick={() => copyCredential(credentialView.password, 'pass')}
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${
                        copiedField === 'pass'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-200 hover:bg-indigo-100 hover:text-indigo-700 text-gray-600'
                      }`}
                    >
                      {copiedField === 'pass' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedField === 'pass' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Please ask the teacher to reset their password after first login.
              </p>
            </div>

            <div className="border-t border-gray-100 px-6 py-4 flex justify-end bg-gray-50/50">
              <button
                onClick={() => setCredentialView(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Principal Credentials Modal */}
      {principalCredentialView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Crown size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Principal Login Credentials</h2>
                    <p className="text-purple-200 text-xs mt-0.5">Share these securely with the principal</p>
                  </div>
                </div>
                <button
                  onClick={() => setPrincipalCredentialView(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <XCircle size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Principal identity */}
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${getAvatarColor(principalCredentialView.name).bg} ${getAvatarColor(principalCredentialView.name).text}`}>
                  {(principalCredentialView.name || 'P').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-purple-500 font-medium">Principal</p>
                  <p className="text-sm font-semibold text-purple-900">{principalCredentialView.name || 'Principal'}</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Login ID / Email */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Login ID (Email)</p>
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <code className="text-sm font-mono text-gray-800">
                      {principalCredentialView.username || principalCredentialView.email}
                    </code>
                    <button
                      onClick={() => copyCredential(principalCredentialView.username || principalCredentialView.email, 'principal_id')}
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${
                        copiedField === 'principal_id'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-200 hover:bg-purple-100 hover:text-purple-700 text-gray-600'
                      }`}
                    >
                      {copiedField === 'principal_id' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedField === 'principal_id' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Password</p>
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <code className="text-sm font-mono text-gray-800">{principalCredentialView.password}</code>
                    <button
                      onClick={() => copyCredential(principalCredentialView.password, 'principal_pass')}
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${
                        copiedField === 'principal_pass'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-200 hover:bg-purple-100 hover:text-purple-700 text-gray-600'
                      }`}
                    >
                      {copiedField === 'principal_pass' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedField === 'principal_pass' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">Important:</span> Principal account created successfully. Please ask them to change their password after first login.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 px-6 py-4 flex justify-end bg-gray-50/50">
              <button
                onClick={() => setPrincipalCredentialView(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
