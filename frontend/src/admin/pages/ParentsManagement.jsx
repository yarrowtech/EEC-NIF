import React, { useEffect, useState, useMemo } from 'react';
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X
} from 'lucide-react';
import CredentialGeneratorButton from '../components/CredentialGeneratorButton';
import { useNavigate } from 'react-router-dom';

const PARENTS_PER_PAGE = 10;

const ParentsManagement = ({setShowAdminHeader}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('All');
  const [filterRelationship, setFilterRelationship] = useState('All');
  const [filterEngagement, setFilterEngagement] = useState('All');
  const [filterCommunication, setFilterCommunication] = useState('All');
  const [parents, setParents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showChildrenModal, setShowChildrenModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [childActionLoadingId, setChildActionLoadingId] = useState('');
  const [parentActionLoadingId, setParentActionLoadingId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editSaveError, setEditSaveError] = useState('');

  // Filter parents based on search and filters
  const filteredParents = parents.filter(parent => {
    const children = Array.isArray(parent.children) ? parent.children : [];
    const grades = Array.isArray(parent.grades) ? parent.grades : [];
    const query = searchTerm.toLowerCase();
    const matchesSearch = !query ||
      parent.name.toLowerCase().includes(query) ||
      parent.loginUsername.toLowerCase().includes(query) ||
      parent.email.toLowerCase().includes(query) ||
      children.some(child => child.toLowerCase().includes(query));

    const matchesGrade = filterGrade === 'All' || grades.includes(filterGrade);
    const matchesRelationship =
      filterRelationship === 'All' ||
      (parent.relationship || '').toLowerCase() === filterRelationship.toLowerCase();
    const matchesEngagement =
      filterEngagement === 'All' ||
      (parent.engagementLevel || '').toLowerCase() === filterEngagement.toLowerCase();
    const matchesCommunication =
      filterCommunication === 'All' ||
      (parent.communicationStatus || '').toLowerCase() === filterCommunication.toLowerCase();

    return matchesSearch && matchesGrade && matchesRelationship && matchesEngagement && matchesCommunication;
  });

  const totalPages = Math.max(1, Math.ceil(filteredParents.length / PARENTS_PER_PAGE));
  const paginatedParents = useMemo(() => {
    const start = (currentPage - 1) * PARENTS_PER_PAGE;
    return filteredParents.slice(start, start + PARENTS_PER_PAGE);
  }, [filteredParents, currentPage]);
  const startItem = filteredParents.length > 0 ? (currentPage - 1) * PARENTS_PER_PAGE + 1 : 0;
  const endItem = Math.min(currentPage * PARENTS_PER_PAGE, filteredParents.length);

  // Reset to page 1 when filters or search change
  const handleSearchChange = (val) => { setSearchTerm(val); setCurrentPage(1); };
  const handleFilterGrade = (val) => { setFilterGrade(val); setCurrentPage(1); };
  const handleFilterRelationship = (val) => { setFilterRelationship(val); setCurrentPage(1); };
  const handleFilterEngagement = (val) => { setFilterEngagement(val); setCurrentPage(1); };
  const handleFilterCommunication = (val) => { setFilterCommunication(val); setCurrentPage(1); };

  const fetchParents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/get-parents`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      if (!res.ok) {
        throw new Error('Failed to fetch parents');
      }
      const data = await res.json();
      const normalized = (Array.isArray(data) ? data : []).map((parent, idx) => {
        const children = Array.isArray(parent.children) ? parent.children : [];
        const grades = Array.isArray(parent.grade)
          ? parent.grade
          : Array.isArray(parent.grades)
          ? parent.grades
          : [];
        const engagementMetrics = parent.engagementMetrics || parent.metrics || {};
        const childrenDetails = Array.isArray(parent.childrenDetails) ? parent.childrenDetails : [];
        const mappedChildrenDetails = childrenDetails.length
          ? childrenDetails.map((child, childIdx) => ({
              id: child?._id || child?.id || null,
              name: child?.name || children[childIdx] || 'Unnamed Student',
              grade: child?.grade || grades[childIdx] || '—',
              section: child?.section || '',
              performance: child?.performance || '',
            }))
          : children.map((childName, childIdx) => ({
              id: null,
              name: childName || 'Unnamed Student',
              grade: grades[childIdx] || '—',
              section: '',
              performance: '',
            }));
        return {
          id: parent._id || parent.id || idx,
          name: parent.name || 'Unnamed Parent',
          loginUsername: parent.username || '—',
          parentId: parent._id ? `PAR-${parent._id.slice(-4)}` : `PAR-${idx + 1}`,
          email: parent.email || '—',
          mobile: parent.mobile || '—',
          children,
          grades,
          occupation: parent.occupation || '—',
          address: parent.address || '—',
          joinDate: parent.createdAt ? new Date(parent.createdAt).toISOString().slice(0, 10) : '—',
          emergencyContact: parent.emergencyContact || parent.mobile || '—',
          relationship: parent.relationship || 'Parent',
          contactPreference: parent.contactPreference || parent.preferredContact || '—',
          communicationStatus: parent.communicationStatus || '—',
          engagementLevel: parent.engagementLevel || '—',
          engagementMetrics: {
            communicationRate: engagementMetrics.communicationRate ?? 0,
            eventAttendance: engagementMetrics.eventAttendance ?? 0,
            meetingParticipation: engagementMetrics.meetingParticipation ?? 0,
            responsiveness: engagementMetrics.responsiveness ?? 0,
            totalInteractions: engagementMetrics.totalInteractions ?? 0,
            lastContactDays: engagementMetrics.lastContactDays ?? null,
          },
          recentActivities: Array.isArray(parent.recentActivities) ? parent.recentActivities : [],
          childrenDetails: mappedChildrenDetails,
        };
      });
      setParents(normalized);
    } catch (err) {
      console.error('Error fetching parents:', err);
      setError(err.message || 'Failed to fetch parents');
      setParents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setShowAdminHeader?.(false);
    setError('');

    fetchParents();
  }, [setShowAdminHeader]);

  const openChildrenModal = (parent) => {
    setSelectedParent(parent);
    setShowChildrenModal(true);
  };

  const handleEditChild = (childName = '') => {
    navigate('/admin/students');
    if (childName) {
      localStorage.setItem('admin_student_search', childName);
    }
    setShowChildrenModal(false);
  };

  const handleDeleteChild = async (child) => {
    if (!child?.id) {
      alert('Cannot delete: this student has no linked student record id.');
      return;
    }
    if (!window.confirm(`Delete student "${child.name}"?`)) {
      return;
    }
    setChildActionLoadingId(String(child.id));
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/students/${child.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to delete student');
      }
      await fetchParents();
      setSelectedParent((prev) => {
        if (!prev) return prev;
        const nextChildrenDetails = (prev.childrenDetails || []).filter((item) => String(item.id) !== String(child.id));
        return {
          ...prev,
          childrenDetails: nextChildrenDetails,
        };
      });
    } catch (err) {
      alert(err.message || 'Failed to delete student');
    } finally {
      setChildActionLoadingId('');
    }
  };

  const openEditModal = (parent) => {
    setEditForm({
      id: parent.id,
      name: parent.name === '—' ? '' : parent.name || '',
      email: parent.email === '—' ? '' : parent.email || '',
      mobile: parent.mobile === '—' ? '' : parent.mobile || '',
      relationship: parent.relationship === 'Parent' || parent.relationship === '—' ? '' : parent.relationship || '',
      occupation: parent.occupation === '—' ? '' : parent.occupation || '',
      address: parent.address === '—' ? '' : parent.address || '',
      emergencyContact: parent.emergencyContact === '—' ? '' : parent.emergencyContact || '',
      contactPreference: parent.contactPreference === '—' ? '' : parent.contactPreference || '',
    });
    setEditSaveError('');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm?.id) return;
    setEditSaving(true);
    setEditSaveError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/parents/${editForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: editForm.name.trim(),
          email: editForm.email.trim().toLowerCase(),
          mobile: editForm.mobile.trim(),
          relationship: editForm.relationship,
          occupation: editForm.occupation.trim(),
          address: editForm.address.trim(),
          emergencyContact: editForm.emergencyContact.trim(),
          contactPreference: editForm.contactPreference,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to update parent');
      await fetchParents();
      setShowEditModal(false);
      setEditForm(null);
    } catch (err) {
      setEditSaveError(err.message || 'Failed to update parent');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteParent = async (parent) => {
    if (!parent?.id) return;
    if (!window.confirm(`Delete parent "${parent.name}"?`)) {
      return;
    }
    setParentActionLoadingId(String(parent.id));
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/parents/${parent.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to delete parent');
      }
      await fetchParents();
    } catch (err) {
      alert(err.message || 'Failed to delete parent');
    } finally {
      setParentActionLoadingId('');
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-green-50 via-green-100 to-emerald-100">
      <div className="flex-1 flex flex-col mx-auto w-full bg-white/90 border border-green-200 rounded-xl overflow-hidden">
        
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
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search parents or children..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <select 
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filterGrade}
              onChange={(e) => handleFilterGrade(e.target.value)}
            >
              <option value="All">All Grades</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
            <select
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filterRelationship}
              onChange={(e) => handleFilterRelationship(e.target.value)}
            >
              <option value="All">All Relationships</option>
              <option value="Father">Fathers</option>
              <option value="Mother">Mothers</option>
              <option value="Guardian">Guardians</option>
            </select>
            <select
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filterEngagement}
              onChange={(e) => handleFilterEngagement(e.target.value)}
            >
              <option value="All">Engagement Level</option>
              <option value="high">High (90%+)</option>
              <option value="medium">Medium (70-89%)</option>
              <option value="low">Low (Below 70%)</option>
            </select>
            <select
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filterCommunication}
              onChange={(e) => handleFilterCommunication(e.target.value)}
            >
              <option value="All">Communication Status</option>
              <option value="recent">Recent Contact</option>
              <option value="pending">Pending Response</option>
              <option value="overdue">Overdue Contact</option>
            </select>
            <CredentialGeneratorButton
              buttonText="Generate Parent ID"
              defaultRole="Parent"
              allowRoleSelection={false}
              size="sm"
              buttonClassName="bg-green-600 hover:bg-green-700"
            />
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            {error ? (
              <div className="px-6 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">
                {error}
              </div>
            ) : null}
            <table className="w-full min-w-[1250px] border-collapse">
              <thead className="sticky top-0 bg-green-50 z-10">
                <tr>
                  <th className="border-b border-green-100 px-6 py-3 text-left text-sm font-semibold text-green-800">Parent Info</th>
                  <th className="border-b border-green-100 px-6 py-3 text-left text-sm font-semibold text-green-800">Engagement</th>
                  <th className="border-b border-green-100 px-6 py-3 text-left text-sm font-semibold text-green-800">Children & Grades</th>
                  <th className="border-b border-green-100 px-6 py-3 text-left text-sm font-semibold text-green-800">Contact Info</th>
                  <th className="border-b border-green-100 px-6 py-3 text-left text-sm font-semibold text-green-800">Communication</th>
                  <th className="border-b border-green-100 px-6 py-3 text-left text-sm font-semibold text-green-800">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-6 text-center text-sm text-gray-500">
                      Loading parents...
                    </td>
                  </tr>
                ) : null}
                {!isLoading && filteredParents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-6 text-center text-sm text-gray-500">
                      No parents found.
                    </td>
                  </tr>
                ) : null}
                {paginatedParents.map((parent) => (
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
                          {/* <div className="text-xs text-gray-500 font-mono">ID: {parent.parentId}</div> */}
                          <div className="text-xs text-emerald-700 font-mono">Login: {parent.loginUsername}</div>
                          <div className="text-xs text-gray-600">{parent.relationship}</div>
                          <div className="text-xs text-gray-500">{parent.occupation}</div>
                        </div>
                      </div>
                    </td>

                    {/* Engagement Metrics */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Target size={14} className="text-blue-600" />
                            <span className="text-sm font-semibold text-blue-600">
                              {parent.engagementMetrics.eventAttendance}%
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">Events</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {parent.engagementMetrics.totalInteractions} interactions
                        </div>
                      </div>
                    </td>

                    {/* Children & Grades */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {(parent.childrenDetails.length ? parent.childrenDetails : parent.children).map((child, idx) => {
                          const name = typeof child === 'string' ? child : child.name;
                          const grade = typeof child === 'string' ? parent.grades[idx] : child.grade;
                          const performance = typeof child === 'string' ? null : child.performance;
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex items-center gap-2">
                                <GraduationCap size={14} className="text-indigo-600" />
                                <span className="font-medium text-gray-900">{name || '—'}</span>
                              </div>
                              <div className="flex items-center gap-2 ml-6">
                                <span className="text-sm text-gray-600">{grade || '—'}</span>
                                {performance ? (
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    performance === 'Excellent' ? 'bg-green-100 text-green-800' :
                                    performance === 'Good' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {performance}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
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
                          {parent.contactPreference}
                        </div>
                        <div className="text-xs text-gray-600">
                          {parent.engagementMetrics.lastContactDays != null
                            ? `Last: ${parent.engagementMetrics.lastContactDays} days ago`
                            : 'Last: —'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Emergency: {parent.emergencyContact}
                        </div>
                      </div>
                    </td>

                    {/* Enhanced Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {/* <button 
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
                        </button> */}
                        <button
                          type="button"
                          onClick={() => openChildrenModal(parent)}
                          className="text-emerald-600 hover:text-emerald-800 p-1 hover:bg-emerald-50 rounded"
                          title="View Students"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(parent)}
                          disabled={parentActionLoadingId === String(parent.id)}
                          className="text-orange-600 hover:text-orange-800 p-1 hover:bg-orange-50 rounded disabled:opacity-60"
                          title="Edit Parent Info"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteParent(parent)}
                          disabled={parentActionLoadingId === String(parent.id)}
                          className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded disabled:opacity-60"
                          title="Delete Parent"
                        >
                          <Trash2 size={14} />
                        </button>
                        {/* <button 
                          className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-50 rounded" 
                          title="More Options"
                        >
                          <MoreVertical size={14} />
                        </button> */}
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
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between flex-shrink-0 pt-3 border-t border-gray-100 px-1">
            <p className="text-gray-500 text-xs">
              {filteredParents.length === 0
                ? 'No parents to display'
                : `Showing ${startItem}\u2013${endItem} of ${filteredParents.length} parents`}
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {/* First */}
                <button
                  className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  title="First page"
                >
                  <ChevronsLeft size={14} />
                </button>

                {/* Prev */}
                <button
                  className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  title="Previous page"
                >
                  <ChevronLeft size={14} />
                </button>

                {/* Page numbers with smart truncation */}
                {(() => {
                  const pages = [];
                  const showMax = 5;

                  if (totalPages <= showMax + 2) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    let rangeStart = Math.max(2, currentPage - 1);
                    let rangeEnd = Math.min(totalPages - 1, currentPage + 1);

                    if (currentPage <= 3) {
                      rangeStart = 2;
                      rangeEnd = Math.min(showMax, totalPages - 1);
                    } else if (currentPage >= totalPages - 2) {
                      rangeStart = Math.max(2, totalPages - showMax + 1);
                      rangeEnd = totalPages - 1;
                    }

                    if (rangeStart > 2) pages.push('start-ellipsis');
                    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
                    if (rangeEnd < totalPages - 1) pages.push('end-ellipsis');
                    pages.push(totalPages);
                  }

                  return pages.map((page) => {
                    if (typeof page === 'string') {
                      return (
                        <span key={page} className="px-1 text-gray-400 text-xs select-none">
                          &hellip;
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[28px] h-7 rounded-md text-xs font-medium transition ${
                          page === currentPage
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  });
                })()}

                {/* Next */}
                <button
                  className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  title="Next page"
                >
                  <ChevronRight size={14} />
                </button>

                {/* Last */}
                <button
                  className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Last page"
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Parent Modal */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600">
              <div>
                <h3 className="text-lg font-semibold text-white">Edit Parent</h3>
                <p className="text-sm text-green-100 mt-0.5">Update parent information</p>
              </div>
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setEditForm(null); setEditSaveError(''); }}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {editSaveError && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {editSaveError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Parent full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="email@example.com"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mobile</label>
                  <input
                    type="text"
                    value={editForm.mobile}
                    onChange={(e) => setEditForm(f => ({ ...f, mobile: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                {/* Relationship */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Relationship</label>
                  <select
                    value={editForm.relationship}
                    onChange={(e) => setEditForm(f => ({ ...f, relationship: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="">Select relationship</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>

                {/* Occupation */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={editForm.occupation}
                    onChange={(e) => setEditForm(f => ({ ...f, occupation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Engineer, Teacher..."
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={editForm.emergencyContact}
                    onChange={(e) => setEditForm(f => ({ ...f, emergencyContact: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Emergency phone number"
                  />
                </div>

                {/* Contact Preference */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Contact Preference</label>
                  <select
                    value={editForm.contactPreference}
                    onChange={(e) => setEditForm(f => ({ ...f, contactPreference: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="">Select preference</option>
                    <option value="Phone">Phone</option>
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                  <textarea
                    value={editForm.address}
                    onChange={(e) => setEditForm(f => ({ ...f, address: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Full address"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setEditForm(null); setEditSaveError(''); }}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="px-5 py-2 text-sm rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showChildrenModal && selectedParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Students of {selectedParent.name}</h3>
                <p className="text-sm text-gray-500">Parent Login: {selectedParent.loginUsername}</p>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded-lg border text-white bg-red-500 border-gray-200 hover:bg-red-600"
                onClick={() => setShowChildrenModal(false)}
              >
                Close
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {(selectedParent.childrenDetails || []).length === 0 ? (
                <div className="text-sm text-gray-500 py-6 text-center">No linked students found.</div>
              ) : (
                <div className="space-y-2">
                  {selectedParent.childrenDetails.map((child, idx) => (
                    <div key={`${child.id || child.name}-${idx}`} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{child.name}</div>
                        <div className="text-xs text-gray-500">
                          Grade: {child.grade || '—'} {child.section ? `| Section: ${child.section}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditChild(child.name)}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs text-blue-700 hover:bg-blue-100"
                        >
                          <Edit2 size={12} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteChild(child)}
                          disabled={childActionLoadingId === String(child.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-700 hover:bg-red-100 disabled:opacity-60"
                        >
                          <Trash2 size={12} />
                          {childActionLoadingId === String(child.id) ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentsManagement;
