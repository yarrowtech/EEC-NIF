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
import CredentialGeneratorButton from '../components/CredentialGeneratorButton';
import { useNavigate } from 'react-router-dom';

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

  const handleEditParent = async (parent) => {
    if (!parent?.id) return;
    const nextName = window.prompt('Edit parent name:', parent.name || '');
    if (nextName === null) return;
    const nextMobile = window.prompt('Edit parent mobile:', parent.mobile === '—' ? '' : parent.mobile || '');
    if (nextMobile === null) return;
    const nextEmail = window.prompt('Edit parent email:', parent.email === '—' ? '' : parent.email || '');
    if (nextEmail === null) return;

    setParentActionLoadingId(String(parent.id));
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/parents/${parent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: nextName.trim(),
          mobile: nextMobile.trim(),
          email: nextEmail.trim().toLowerCase(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to update parent');
      }
      await fetchParents();
    } catch (err) {
      alert(err.message || 'Failed to update parent');
    } finally {
      setParentActionLoadingId('');
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
            <select
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filterRelationship}
              onChange={(e) => setFilterRelationship(e.target.value)}
            >
              <option value="All">All Relationships</option>
              <option value="Father">Fathers</option>
              <option value="Mother">Mothers</option>
              <option value="Guardian">Guardians</option>
            </select>
            <select
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filterEngagement}
              onChange={(e) => setFilterEngagement(e.target.value)}
            >
              <option value="All">Engagement Level</option>
              <option value="high">High (90%+)</option>
              <option value="medium">Medium (70-89%)</option>
              <option value="low">Low (Below 70%)</option>
            </select>
            <select
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filterCommunication}
              onChange={(e) => setFilterCommunication(e.target.value)}
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
                  <th className="border-b border-green-100 px-6 py-3 text-left text-sm font-semibold text-green-800">Recent Activity</th>
                  <th className="border-b border-green-100 px-6 py-3 text-left text-sm font-semibold text-green-800">Children & Grades</th>
                  <th className="border-b border-green-100 px-6 py-3 text-left text-sm font-semibold text-green-800">Contact Info</th>
                  <th className="border-b border-green-100 px-6 py-3 text-left text-sm font-semibold text-green-800">Communication</th>
                  <th className="border-b border-green-100 px-6 py-3 text-left text-sm font-semibold text-green-800">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-6 text-center text-sm text-gray-500">
                      Loading parents...
                    </td>
                  </tr>
                ) : null}
                {!isLoading && filteredParents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-6 text-center text-sm text-gray-500">
                      No parents found.
                    </td>
                  </tr>
                ) : null}
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
                            <Activity size={14} className="text-green-600" />
                            <span className="text-sm font-semibold text-green-600">
                              {parent.engagementMetrics.communicationRate}%
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">Communication</span>
                        </div>
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

                    {/* Recent Activity */}
                    <td className="px-6 py-4">
                      {(() => {
                        const activities = parent.recentActivities;
                        if (activities.length === 0) {
                          return <span className="text-sm text-gray-400 italic">No recent activity</span>;
                        }
                        return (
                          <div className="space-y-1 max-w-[180px]">
                            {activities.slice(0, 2).map((activity, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <CheckCircle size={12} className="text-green-600" />
                                <span className="text-xs text-gray-700">{activity.type}</span>
                                {activity.status ? (
                                  <span className="text-xs bg-green-100 text-green-800 px-1 rounded">{activity.status}</span>
                                ) : null}
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
                          onClick={() => handleEditParent(parent)}
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
