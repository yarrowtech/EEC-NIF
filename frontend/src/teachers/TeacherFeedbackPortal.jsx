import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Star, MessageCircle, Users, BookOpen, Heart, Target,
  Search, Filter, Calendar, User, AlertCircle,
  ClipboardList, Shield, AlertTriangle, CheckCircle, RefreshCw,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ── Client-side cache ──────────────────────────────────────────────────────────
const CACHE_TTL_MS         = 5 * 60 * 1000; // 5 minutes
const FEEDBACK_CACHE_KEY   = 'eec_teacher_feedback_v1';
const COMPLAINTS_CACHE_KEY = 'eec_teacher_complaints_v1';

const readCache = (key) => {
  try {
    const entry = JSON.parse(localStorage.getItem(key) || 'null');
    if (!entry || Date.now() - entry.ts > CACHE_TTL_MS) return null;
    return entry.data;
  } catch { return null; }
};

const writeCache = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch {}
};

// ── Static config ──────────────────────────────────────────────────────────────
const ratingCategories = [
  { id: 'teaching_quality', label: 'Teaching Quality', icon: Star },
  { id: 'communication',    label: 'Communication',    icon: MessageCircle },
  { id: 'engagement',       label: 'Engagement',       icon: Users },
  { id: 'preparation',      label: 'Preparation',       icon: BookOpen },
  { id: 'availability',     label: 'Availability',      icon: Heart },
  { id: 'fairness',         label: 'Fair Assessment',   icon: Target },
];

const RATING_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'];

const COMPLAINT_STATUS_COLORS = {
  open:        '#ef4444',
  in_progress: '#f59e0b',
  resolved:    '#10b981',
};

const computeComplaintStats = (list = []) =>
  list.reduce(
    (acc, item) => {
      acc.total += 1;
      if (item.status === 'open')        acc.open       += 1;
      else if (item.status === 'in_progress') acc.inProgress += 1;
      else if (item.status === 'resolved')    acc.resolved   += 1;
      return acc;
    },
    { total: list.length, open: 0, inProgress: 0, resolved: 0 }
  );

const placeholderAvatar =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";

// ── Custom pie tooltip ─────────────────────────────────────────────────────────
const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-900">{payload[0].name}</p>
      <p className="text-gray-500">{payload[0].value} submission{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
};

const ComplaintPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-900">{payload[0].name}</p>
      <p className="text-gray-500">{payload[0].value} complaint{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const TeacherFeedbackPortal = () => {
  const [activeView, setActiveView] = useState('feedback');

  // Feedback state
  const [stats, setStats]                   = useState(null);
  const [feedback, setFeedback]             = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackRefreshing, setFeedbackRefreshing] = useState(false);
  const [feedbackError, setFeedbackError]   = useState('');
  const [search, setSearch]                 = useState('');
  const [ratingFilter, setRatingFilter]     = useState('all');

  // Complaints state
  const [complaints, setComplaints]             = useState([]);
  const [complaintStats, setComplaintStats]     = useState(null);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [complaintsRefreshing, setComplaintsRefreshing] = useState(false);
  const [complaintsError, setComplaintsError]   = useState('');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('all');
  const [complaintSearch, setComplaintSearch]   = useState('');
  const [updatingComplaintId, setUpdatingComplaintId] = useState('');

  const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

  // ── Fetch feedback ───────────────────────────────────────────────────────────
  const fetchFeedback = useCallback(async ({ silent = false } = {}) => {
    const token    = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    if (!token || userType !== 'Teacher') {
      setFeedbackError('Teacher session not found. Please log in again.');
      setFeedbackLoading(false);
      return;
    }
    if (silent) setFeedbackRefreshing(true);
    else        setFeedbackLoading(true);
    setFeedbackError('');
    try {
      const res  = await fetch(`${API_BASE_URL}/api/teacher/dashboard/feedback`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load feedback.');
      const payload = {
        stats:    data.stats    || null,
        feedback: Array.isArray(data.feedback) ? data.feedback : [],
      };
      setStats(payload.stats);
      setFeedback(payload.feedback);
      writeCache(FEEDBACK_CACHE_KEY, payload);
    } catch (err) {
      if (!silent) {
        setFeedbackError(err.message || 'Unable to load feedback.');
        setStats(null);
        setFeedback([]);
      }
    } finally {
      if (silent) setFeedbackRefreshing(false);
      else        setFeedbackLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    const cached = readCache(FEEDBACK_CACHE_KEY);
    if (cached) {
      setStats(cached.stats);
      setFeedback(cached.feedback);
      setFeedbackLoading(false);
      fetchFeedback({ silent: true }); // background refresh
    } else {
      fetchFeedback();
    }
  }, [fetchFeedback]);

  // ── Fetch complaints ─────────────────────────────────────────────────────────
  const fetchComplaints = useCallback(async ({ silent = false } = {}) => {
    const token    = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    if (!token || userType !== 'Teacher') {
      setComplaintsError('Teacher session not found. Please log in again.');
      setComplaintsLoading(false);
      return;
    }
    if (silent) setComplaintsRefreshing(true);
    else        setComplaintsLoading(true);
    setComplaintsError('');
    try {
      const res  = await fetch(`${API_BASE_URL}/api/teacher/dashboard/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load complaints.');
      const list   = Array.isArray(data.complaints) ? data.complaints : [];
      const cStats = data.stats || computeComplaintStats(list);
      setComplaints(list);
      setComplaintStats(cStats);
      writeCache(COMPLAINTS_CACHE_KEY, { complaints: list, stats: cStats });
    } catch (err) {
      if (!silent) {
        setComplaintsError(err.message || 'Unable to load complaints.');
        setComplaintStats(null);
        setComplaints([]);
      }
    } finally {
      if (silent) setComplaintsRefreshing(false);
      else        setComplaintsLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    const cached = readCache(COMPLAINTS_CACHE_KEY);
    if (cached) {
      setComplaints(cached.complaints);
      setComplaintStats(cached.stats);
      setComplaintsLoading(false);
      fetchComplaints({ silent: true });
    } else {
      fetchComplaints();
    }
  }, [fetchComplaints]);

  // ── Filtered lists ───────────────────────────────────────────────────────────
  const filteredFeedback = useMemo(() => {
    const q = search.trim().toLowerCase();
    return feedback.filter((item) => {
      const matchSearch =
        !q ||
        item.subjectName?.toLowerCase().includes(q) ||
        item.studentName?.toLowerCase().includes(q) ||
        item.className?.toLowerCase().includes(q);
      const matchRating =
        ratingFilter === 'all' || Number(item.overallRating || 0) >= Number(ratingFilter);
      return matchSearch && matchRating;
    });
  }, [feedback, search, ratingFilter]);

  const filteredComplaints = useMemo(() => {
    const q = complaintSearch.trim().toLowerCase();
    return complaints.filter((item) => {
      const matchStatus = complaintStatusFilter === 'all' || item.status === complaintStatusFilter;
      const matchQuery  =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.ticketNumber?.toLowerCase().includes(q) ||
        item.parentName?.toLowerCase().includes(q) ||
        item.studentName?.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [complaints, complaintStatusFilter, complaintSearch]);

  // ── Chart data ───────────────────────────────────────────────────────────────
  const ratingPieData = useMemo(() =>
    [5, 4, 3, 2, 1]
      .map((r, i) => ({
        name:  `${r} Star${r > 1 ? 's' : ''}`,
        value: stats?.ratingDistribution?.[r] || 0,
        color: RATING_COLORS[i],
      }))
      .filter(d => d.value > 0),
    [stats]
  );

  const complaintPieData = useMemo(() => [
    { name: 'Open',        value: complaintStats?.open        || 0, color: COMPLAINT_STATUS_COLORS.open },
    { name: 'In Progress', value: complaintStats?.inProgress  || 0, color: COMPLAINT_STATUS_COLORS.in_progress },
    { name: 'Resolved',    value: complaintStats?.resolved    || 0, color: COMPLAINT_STATUS_COLORS.resolved },
  ].filter(d => d.value > 0), [complaintStats]);

  // ── Complaint status update ──────────────────────────────────────────────────
  const handleComplaintStatusUpdate = async (complaintId, nextStatus) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setUpdatingComplaintId(complaintId);
    try {
      const res  = await fetch(
        `${API_BASE_URL}/api/teacher/dashboard/complaints/${complaintId}/status`,
        {
          method:  'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body:    JSON.stringify({ status: nextStatus }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to update.');
      setComplaints((prev) => {
        const next = prev.map((item) => (item.id === complaintId ? data : item));
        const newStats = computeComplaintStats(next);
        setComplaintStats(newStats);
        writeCache(COMPLAINTS_CACHE_KEY, { complaints: next, stats: newStats });
        return next;
      });
      setComplaintsError('');
    } catch (err) {
      setComplaintsError(err.message || 'Unable to update complaint.');
    } finally {
      setUpdatingComplaintId('');
    }
  };

  const averageRating = stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0';

  // ── Render helpers ───────────────────────────────────────────────────────────
  const renderStars = (rating) => {
    const n = Math.round(Number(rating || 0));
    return (
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star key={i} size={12} className={i <= n ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
        ))}
      </div>
    );
  };

  // ── FEEDBACK VIEW ────────────────────────────────────────────────────────────
  const renderFeedbackView = () => {
    if (feedbackLoading) {
      return (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)}
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {feedbackError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={15} className="shrink-0" />
            {feedbackError}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total Feedback', value: stats?.totalFeedback ?? 0,    gradient: 'from-indigo-500 to-violet-500', sub: 'Submissions received' },
            { label: 'Average Rating', value: `${averageRating}/5`,          gradient: 'from-amber-400 to-orange-500',  sub: 'Overall satisfaction' },
            { label: 'Latest Submission', value: stats?.latestFeedbackDate
                ? new Date(stats.latestFeedbackDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : '—',                                                       gradient: 'from-emerald-500 to-teal-500',  sub: 'Most recent date' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className={`w-8 h-1.5 rounded-full bg-linear-to-r ${s.gradient} mb-3`} />
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Feedback list — 2/3 width */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Search + filter bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search subject, student, class…"
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={13} className="text-gray-400 shrink-0" />
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  >
                    <option value="all">All ratings</option>
                    <option value="4">4★ and above</option>
                    <option value="3">3★ and above</option>
                    <option value="2">2★ and above</option>
                  </select>
                </div>
              </div>

              {/* List */}
              <div className="max-h-144 overflow-y-auto divide-y divide-gray-50">
                {filteredFeedback.length === 0 ? (
                  <div className="py-16 text-center">
                    <Star size={28} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No feedback matches the current filter.</p>
                  </div>
                ) : (
                  filteredFeedback.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-amber-50/30 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={placeholderAvatar}
                            alt=""
                            className="w-9 h-9 rounded-full border border-gray-200 shrink-0"
                          />
                          <div>
                            <p className="text-sm font-bold text-gray-900">{item.subjectName}</p>
                            <p className="text-xs text-gray-500">
                              {item.className}
                              {item.sectionName ? ` · Section ${item.sectionName}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {renderStars(item.overallRating)}
                          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            {Number(item.overallRating || 0).toFixed(1)} / 5
                          </span>
                        </div>
                      </div>

                      {item.comments && (
                        <p className="text-sm text-gray-700 leading-relaxed mb-3 pl-12">
                          {item.comments}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pl-12 mb-3">
                        <span className="flex items-center gap-1">
                          <User size={11} />
                          {item.isAnonymous ? (
                            <span className="text-purple-600 font-medium">Anonymous</span>
                          ) : (
                            item.studentName || 'Student'
                          )}
                        </span>
                        {item.createdAt && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>

                      {/* Category ratings mini-grid */}
                      <div className="grid grid-cols-3 gap-1.5 pl-12">
                        {ratingCategories.map((cat) => {
                          const val = Number(item.ratings?.[cat.id]);
                          if (!Number.isFinite(val)) return null;
                          const pct = (val / 5) * 100;
                          return (
                            <div key={cat.id} className="bg-amber-50/60 rounded-lg px-2 py-1.5">
                              <p className="text-[10px] text-amber-700 font-medium truncate">{cat.label}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="flex-1 h-1 bg-amber-100 rounded-full">
                                  <div className="h-1 bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-[10px] font-bold text-amber-800">{val}</span>
                              </div>
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

          {/* Sidebar — 1/3 width */}
          <div className="space-y-4">
            {/* Pie chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Rating Distribution</h3>
              {ratingPieData.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-xs text-gray-400">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={ratingPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {ratingPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {/* Bar fallback / extra detail */}
              <div className="mt-2 space-y-2">
                {[5, 4, 3, 2, 1].map((r, i) => {
                  const count = stats?.ratingDistribution?.[r] || 0;
                  const pct   = stats?.totalFeedback ? Math.round((count / stats.totalFeedback) * 100) : 0;
                  return (
                    <div key={r} className="flex items-center gap-2 text-xs">
                      <span className="w-10 text-gray-500 shrink-0">{r}★</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: RATING_COLORS[i] }}
                        />
                      </div>
                      <span className="w-8 text-right text-gray-400">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category averages */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Category Averages</h3>
              <div className="space-y-2.5">
                {ratingCategories.map((cat) => {
                  const Icon    = cat.icon;
                  const average = stats?.categoryAverages?.[cat.id]?.average || 0;
                  const pct     = (average / 5) * 100;
                  return (
                    <div key={cat.id} className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <Icon size={13} className="text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs text-gray-600 truncate">{cat.label}</span>
                          <span className="text-xs font-bold text-amber-700 shrink-0 ml-1">{average.toFixed(1)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full">
                          <div
                            className="h-1.5 bg-amber-400 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
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

  // ── COMPLAINTS VIEW ──────────────────────────────────────────────────────────
  const renderComplaintsView = () => {
    if (complaintsLoading) {
      return (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)}
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {complaintsError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={15} className="shrink-0" />
            {complaintsError}
          </div>
        )}

        {/* Stats + pie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Stat cards */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total',       value: complaintStats?.total      ?? 0, gradient: 'from-indigo-500 to-violet-500' },
              { label: 'Open',        value: complaintStats?.open        ?? 0, gradient: 'from-rose-500 to-pink-500'    },
              { label: 'In Progress', value: complaintStats?.inProgress  ?? 0, gradient: 'from-amber-400 to-orange-500' },
              { label: 'Resolved',    value: complaintStats?.resolved    ?? 0, gradient: 'from-emerald-500 to-teal-500' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className={`w-7 h-1.5 rounded-full bg-linear-to-r ${s.gradient} mb-3`} />
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Pie chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-1">Status Overview</h3>
            {complaintPieData.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-xs text-gray-400">No complaints</div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={complaintPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {complaintPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<ComplaintPieTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Complaint list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/60">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={complaintSearch}
                onChange={(e) => setComplaintSearch(e.target.value)}
                placeholder="Search ticket, parent, student…"
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-gray-400 shrink-0" />
              <select
                value={complaintStatusFilter}
                onChange={(e) => setComplaintStatusFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              >
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Items */}
          {filteredComplaints.length === 0 ? (
            <div className="py-16 text-center">
              <ClipboardList size={28} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No complaints match the current filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredComplaints.map((complaint) => {
                const isBusy = updatingComplaintId === complaint.id;
                const priorityConfig = {
                  critical: 'bg-red-100 text-red-700',
                  high:     'bg-orange-100 text-orange-700',
                  medium:   'bg-amber-100 text-amber-700',
                  low:      'bg-gray-100 text-gray-600',
                }[complaint.priority] || 'bg-gray-100 text-gray-600';

                const statusAccent = {
                  open:        'border-l-rose-500',
                  in_progress: 'border-l-amber-500',
                  resolved:    'border-l-emerald-500',
                }[complaint.status] || 'border-l-gray-300';

                return (
                  <article
                    key={complaint.id}
                    className={`p-4 sm:p-5 border-l-4 ${statusAccent} hover:bg-gray-50/50 transition-colors`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-gray-400">#{complaint.ticketNumber}</span>
                          {complaint.priority && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${priorityConfig}`}>
                              {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">{complaint.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-2">{complaint.description}</p>
                      </div>

                      <div className="shrink-0">
                        <select
                          value={complaint.status}
                          onChange={(e) => handleComplaintStatusUpdate(complaint.id, e.target.value)}
                          disabled={isBusy}
                          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white disabled:opacity-50"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Shield size={11} className="text-gray-400" />
                        {complaint.parentName}
                      </span>
                      {complaint.studentName && (
                        <span className="flex items-center gap-1">
                          <User size={11} className="text-gray-400" />
                          {complaint.studentName}
                          {complaint.studentGrade && (
                            <span className="text-gray-400 ml-0.5">({complaint.studentGrade}{complaint.studentSection ? ` ${complaint.studentSection}` : ''})</span>
                          )}
                        </span>
                      )}
                      {complaint.createdAt && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-gray-400" />
                          {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      <span className={`flex items-center gap-1 font-medium ${
                        complaint.status === 'resolved' ? 'text-emerald-600' :
                        complaint.status === 'in_progress' ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {complaint.status === 'resolved' ? <CheckCircle size={11} /> :
                         complaint.status === 'in_progress' ? <AlertTriangle size={11} /> :
                         <AlertCircle size={11} />}
                        {complaint.status === 'resolved' ? 'Resolved' :
                         complaint.status === 'in_progress' ? 'In Progress' : 'Awaiting action'}
                      </span>
                    </div>

                    {complaint.resolutionNotes && (
                      <div className="mt-3 flex items-start gap-2 bg-emerald-50 text-emerald-700 rounded-lg px-3 py-2 text-xs">
                        <CheckCircle size={12} className="shrink-0 mt-0.5" />
                        <p>{complaint.resolutionNotes}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Root render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header + tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            {activeView === 'feedback' ? (
              <Star size={20} className="text-amber-600" />
            ) : (
              <ClipboardList size={20} className="text-amber-600" />
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {activeView === 'feedback' ? 'Student Feedback' : 'Parent Complaints'}
            </h1>
            <p className="text-xs text-gray-500">
              {activeView === 'feedback'
                ? 'Review ratings and insights from your students'
                : 'Track and resolve issues submitted by parents'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <button
            onClick={() => activeView === 'feedback' ? fetchFeedback() : fetchComplaints()}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <RefreshCw
              size={13}
              className={activeView === 'feedback' && feedbackRefreshing || activeView === 'complaints' && complaintsRefreshing
                ? 'animate-spin text-indigo-500' : ''}
            />
            Refresh
          </button>

          {/* Tab switcher */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('feedback')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeView === 'feedback'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Star size={13} />
              Feedback
              {(stats?.totalFeedback ?? 0) > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeView === 'feedback' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-500'
                }`}>
                  {stats.totalFeedback}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveView('complaints')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeView === 'complaints'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ClipboardList size={13} />
              Complaints
              {(complaintStats?.open ?? 0) > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeView === 'complaints' ? 'bg-rose-100 text-rose-700' : 'bg-gray-200 text-gray-500'
                }`}>
                  {complaintStats.open}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {activeView === 'feedback' ? renderFeedbackView() : renderComplaintsView()}
    </div>
  );
};

export default TeacherFeedbackPortal;
