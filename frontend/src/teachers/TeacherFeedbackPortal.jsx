import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Star,
  MessageCircle,
  Users,
  BookOpen,
  Heart,
  Target,
  Search,
  Filter,
  Calendar,
  User,
  Loader2,
  AlertCircle,
  ClipboardList,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const ratingCategories = [
  { id: 'teaching_quality', label: 'Teaching Quality', icon: Star },
  { id: 'communication', label: 'Communication', icon: MessageCircle },
  { id: 'engagement', label: 'Engagement', icon: Users },
  { id: 'preparation', label: 'Preparation', icon: BookOpen },
  { id: 'availability', label: 'Availability', icon: Heart },
  { id: 'fairness', label: 'Fair Assessment', icon: Target }
];

const complaintStatusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

const computeComplaintStats = (list = []) => {
  return list.reduce(
    (acc, item) => {
      acc.total += 1;
      if (item.status === 'open') acc.open += 1;
      else if (item.status === 'in_progress') acc.inProgress += 1;
      else if (item.status === 'resolved') acc.resolved += 1;
      return acc;
    },
    { total: list.length, open: 0, inProgress: 0, resolved: 0 }
  );
};

const placeholderAvatar =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";

const TeacherFeedbackPortal = () => {
  const [activeView, setActiveView] = useState('feedback');
  const [stats, setStats] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState('');
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [complaints, setComplaints] = useState([]);
  const [complaintStats, setComplaintStats] = useState(null);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [complaintsError, setComplaintsError] = useState('');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('all');
  const [complaintSearch, setComplaintSearch] = useState('');
  const [updatingComplaintId, setUpdatingComplaintId] = useState('');

  const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

  useEffect(() => {
    const fetchFeedback = async () => {
      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');
      if (!token || userType !== 'Teacher') {
        setFeedbackError('Teacher session not found. Please log in again.');
        setFeedbackLoading(false);
        return;
      }

      setFeedbackLoading(true);
      setFeedbackError('');
      try {
        const response = await fetch(`${API_BASE_URL}/api/teacher/dashboard/feedback`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load feedback.');
        }
        setStats(data.stats || null);
        setFeedback(Array.isArray(data.feedback) ? data.feedback : []);
      } catch (err) {
        console.error('Teacher feedback portal error:', err);
        setFeedbackError(err.message || 'Unable to load feedback.');
        setStats(null);
        setFeedback([]);
      } finally {
        setFeedbackLoading(false);
      }
    };

    fetchFeedback();
  }, [API_BASE_URL]);

  const fetchComplaints = useCallback(async () => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    if (!token || userType !== 'Teacher') {
      setComplaintsError('Teacher session not found. Please log in again.');
      setComplaintsLoading(false);
      return;
    }

    setComplaintsLoading(true);
    setComplaintsError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/dashboard/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load complaints.');
      }
      const list = Array.isArray(data.complaints) ? data.complaints : [];
      setComplaints(list);
      setComplaintStats(data.stats || computeComplaintStats(list));
    } catch (err) {
      console.error('Teacher complaints fetch error:', err);
      setComplaintsError(err.message || 'Unable to load complaints.');
      setComplaintStats(null);
      setComplaints([]);
    } finally {
      setComplaintsLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const filteredFeedback = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    return feedback.filter((item) => {
      const matchesSearch =
        !normalizedQuery ||
        item.subjectName?.toLowerCase().includes(normalizedQuery) ||
        item.studentName?.toLowerCase().includes(normalizedQuery) ||
        item.className?.toLowerCase().includes(normalizedQuery);
      const matchesRating =
        ratingFilter === 'all' ||
        Number(item.overallRating || 0) >= Number(ratingFilter);
      return matchesSearch && matchesRating;
    });
  }, [feedback, search, ratingFilter]);

  const filteredComplaints = useMemo(() => {
    const normalizedQuery = complaintSearch.trim().toLowerCase();
    return complaints.filter((item) => {
      const matchesStatus = complaintStatusFilter === 'all' || item.status === complaintStatusFilter;
      const matchesQuery =
        !normalizedQuery ||
        item.title?.toLowerCase().includes(normalizedQuery) ||
        item.ticketNumber?.toLowerCase().includes(normalizedQuery) ||
        item.parentName?.toLowerCase().includes(normalizedQuery) ||
        item.studentName?.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [complaints, complaintStatusFilter, complaintSearch]);

  const averageRating = stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0';

  const handleComplaintStatusUpdate = async (complaintId, nextStatus) => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    if (!token || userType !== 'Teacher') {
      setComplaintsError('Teacher session not found. Please log in again.');
      return;
    }
    setUpdatingComplaintId(complaintId);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/teacher/dashboard/complaints/${complaintId}/status`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to update complaint.');
      }
      setComplaints((prev) => {
        const next = prev.map((item) => (item.id === complaintId ? data : item));
        setComplaintStats(computeComplaintStats(next));
        return next;
      });
      setComplaintsError('');
    } catch (err) {
      console.error('Teacher complaint update error:', err);
      setComplaintsError(err.message || 'Unable to update complaint.');
    } finally {
      setUpdatingComplaintId('');
    }
  };

  const renderStatCard = (title, value, subtitle, accent = 'text-indigo-600') => (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${accent}`}>{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );

  const renderFeedbackView = () => {
    if (feedbackLoading) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p>Loading feedback...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">Student Feedback</h1>
            <p className="text-slate-500 text-sm">
              Review what students are saying about your classes, spot trends, and respond with impact.
            </p>
          </div>
        </div>

        {feedbackError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
            {feedbackError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderStatCard('Total Feedback', stats?.totalFeedback ?? 0, 'Submissions from your classes')}
          {renderStatCard('Average Rating', `${averageRating}/5`, 'Overall student satisfaction', 'text-amber-600')}
          {renderStatCard(
            'Latest Feedback',
            stats?.latestFeedbackDate ? new Date(stats.latestFeedbackDate).toLocaleDateString() : '—',
            'Most recent submission date',
            'text-emerald-600'
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by subject, student, or class..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  >
                    <option value="all">All ratings</option>
                    <option value="4">4★ and above</option>
                    <option value="3">3★ and above</option>
                    <option value="2">2★ and above</option>
                    <option value="1">All (1★+)</option>
                  </select>
                </div>
              </div>

              <div className="max-h-[32rem] overflow-y-auto divide-y divide-slate-100">
                {filteredFeedback.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    No feedback found with the applied filters.
                  </div>
                ) : (
                  filteredFeedback.map((item) => (
                    <div key={item.id} className="p-6 flex flex-col gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={placeholderAvatar}
                            alt={item.studentName}
                            className="w-10 h-10 rounded-full border border-slate-200"
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{item.subjectName}</p>
                            <p className="text-xs text-slate-500">
                              {item.className}
                              {item.sectionName ? ` • Section ${item.sectionName}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold text-amber-700">
                            {Number(item.overallRating || 0).toFixed(1)} / 5
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed">
                        {item.comments || 'No additional comments provided.'}
                      </p>

                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {item.studentName || 'Student'}
                        </span>
                        {item.createdAt && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {ratingCategories.map((category) => {
                          const value = Number(item.ratings?.[category.id]);
                          if (!Number.isFinite(value)) return null;
                          return (
                            <div key={category.id} className="bg-white border border-amber-100 rounded-lg p-2">
                              <p className="text-xs text-amber-600">{category.label}</p>
                              <p className="text-sm font-semibold text-amber-900">{value}/5</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4">Rating Distribution</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats?.ratingDistribution?.[rating] || 0;
                  const percentage =
                    stats?.totalFeedback ? Math.round((count / stats.totalFeedback) * 100) : 0;
                  return (
                    <div key={rating}>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>
                          {rating} Star{rating > 1 ? 's' : ''}
                        </span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full">
                        <div
                          className="h-2 bg-amber-400 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4">Category Insights</h3>
              <div className="space-y-3">
                {ratingCategories.map((category) => {
                  const Icon = category.icon;
                  const average = stats?.categoryAverages?.[category.id]?.average || 0;
                  return (
                    <div key={category.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                      <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{category.label}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          <span>{average.toFixed(1)} / 5</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderComplaintsView = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-amber-600" />
              Parent Complaints
            </h1>
            <p className="text-slate-500 text-sm">
              View issues submitted by parents for your classes and keep them informed of progress.
            </p>
          </div>
        </div>

        {complaintsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
            {complaintsError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {renderStatCard('Total', complaintStats?.total ?? 0, 'Assigned to you')}
          {renderStatCard('Open', complaintStats?.open ?? 0, 'Needs action', 'text-red-600')}
          {renderStatCard('Resolved', complaintStats?.resolved ?? 0, 'Closed tickets', 'text-emerald-600')}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={complaintSearch}
                onChange={(e) => setComplaintSearch(e.target.value)}
                placeholder="Search by ticket, parent, or student..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={complaintStatusFilter}
                onChange={(e) => setComplaintStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              >
                {complaintStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {complaintsLoading ? (
            <div className="p-6 flex items-center gap-3 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
              Loading complaints...
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">No complaints found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredComplaints.map((complaint) => (
                <article key={complaint.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Ticket #{complaint.ticketNumber}</p>
                      <h3 className="text-lg font-semibold text-slate-900">{complaint.title}</h3>
                      <p className="text-sm text-slate-600 mt-2">{complaint.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          complaint.priority === 'critical'
                            ? 'bg-red-50 text-red-700'
                            : complaint.priority === 'high'
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {complaint.priority?.charAt(0).toUpperCase() + complaint.priority?.slice(1)}
                      </span>
                      <select
                        value={complaint.status}
                        onChange={(e) => handleComplaintStatusUpdate(complaint.id, e.target.value)}
                        disabled={updatingComplaintId === complaint.id}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-4">
                    <span className="inline-flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" />
                      {complaint.parentName}
                    </span>
                    {complaint.studentName && (
                      <span className="inline-flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {complaint.studentName}
                        {complaint.studentGrade && (
                          <span className="ml-1 text-slate-400">
                            ({complaint.studentGrade} {complaint.studentSection || ''})
                          </span>
                        )}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : '—'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 ${
                        complaint.status === 'resolved' ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {complaint.status === 'resolved' ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      {complaint.status === 'resolved' ? 'Resolved' : 'Awaiting action'}
                    </span>
                  </div>

                  {complaint.resolutionNotes && (
                    <p className="mt-3 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
                      Resolution note: {complaint.resolutionNotes}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setActiveView('feedback')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
            activeView === 'feedback'
              ? 'bg-amber-500 text-white border-amber-500 shadow'
              : 'border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Student Feedback
        </button>
        <button
          onClick={() => setActiveView('complaints')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
            activeView === 'complaints'
              ? 'bg-slate-900 text-white border-slate-900 shadow'
              : 'border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Parent Complaints
        </button>
      </div>

      {activeView === 'feedback' ? renderFeedbackView() : renderComplaintsView()}
    </div>
  );
};

export default TeacherFeedbackPortal;
