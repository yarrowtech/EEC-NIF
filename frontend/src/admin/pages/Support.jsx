import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  ClipboardList,
  Clock,
  Headphones,
  LifeBuoy,
  Loader2,
  Mail,
  MessageCircle,
  NotebookPen,
  RefreshCcw,
  Send,
  TrendingUp,
  Users
} from 'lucide-react';

const SUPPORT_QUEUE_KEY = 'adminSupportRequests';
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const PASSWORD_RESET_ROLES = [
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
];

const defaultFeedback = {
  subject: '',
  category: 'general',
  sentiment: 'positive',
  message: ''
};

const defaultComplaint = {
  topic: 'system-issue',
  incidentDate: '',
  studentOrStaff: '',
  description: '',
  impactLevel: 'low'
};

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition';
const selectClass =
  'mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition bg-white';
const textareaClass =
  'mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition resize-none';
const labelClass = 'text-sm text-gray-600 font-medium';

const Support = ({ setShowAdminHeader }) => {
  const [passwordResetRole, setPasswordResetRole] = useState('teacher');
  const [passwordResetSearch, setPasswordResetSearch] = useState('');
  const [passwordResetUsers, setPasswordResetUsers] = useState([]);
  const [passwordResetLoadingUsers, setPasswordResetLoadingUsers] = useState(false);
  const [passwordResetUserPickerOpen, setPasswordResetUserPickerOpen] = useState(false);
  const [selectedPasswordResetUser, setSelectedPasswordResetUser] = useState(null);
  const [passwordResetResult, setPasswordResetResult] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState(defaultFeedback);
  const [complaintForm, setComplaintForm] = useState(defaultComplaint);
  const [submitting, setSubmitting] = useState('');
  const [statusBanner, setStatusBanner] = useState(null);
  const [queuedRequests, setQueuedRequests] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = window.localStorage.getItem(SUPPORT_QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Unable to read support queue', err);
      return [];
    }
  });
  const [syncingQueue, setSyncingQueue] = useState(false);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [recentError, setRecentError] = useState(null);
  const openTicketCount = useMemo(
    () => recentRequests.filter((request) => request.status !== 'resolved').length,
    [recentRequests]
  );
  const supportHighlights = useMemo(
    () => [
      {
        icon: Clock,
        label: 'Avg. first response',
        value: '42 min',
        helper: 'Last 30 days',
        accent: 'bg-blue-50 text-blue-600'
      },
      {
        icon: TrendingUp,
        label: 'Resolution rate',
        value: '97%',
        helper: '+3% vs last week',
        accent: 'bg-green-50 text-green-600'
      },
      {
        icon: Users,
        label: 'Open tickets',
        value: openTicketCount,
        helper: 'Awaiting action',
        accent: 'bg-amber-50 text-amber-600'
      },
      {
        icon: ClipboardList,
        label: 'Queued offline',
        value: queuedRequests.length,
        helper: 'Auto-sync when online',
        accent: 'bg-gray-100 text-gray-600'
      }
    ],
    [openTicketCount, queuedRequests.length]
  );
  const supportPlaybook = useMemo(
    () => [
      {
        title: 'Share context up front',
        description: 'Attach ticket IDs, affected modules, and screenshots. It removes back-and-forths.',
        checklist: ['Mention the latest action taken', 'Include grade/campus info when relevant']
      },
      {
        title: 'Prefer portal requests',
        description: 'Support routing is automatic here, so you skip the manual triage that happens on calls.',
        checklist: ['Use the urgency dropdown honestly', 'Tag the right topic so SMEs jump in faster']
      },
      {
        title: 'Track the follow-up rhythm',
        description: 'Tickets update every 4 hours. Add a note only if the situation has changed.',
        checklist: ['Check "Recent requests" before calling', 'Escalate only if SLA is breached']
      }
    ],
    []
  );

  useEffect(() => {
    setShowAdminHeader(true);
  }, [setShowAdminHeader]);

  const fetchRecentRequests = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem('token');
    if (!token) {
      setRecentRequests([]);
      return;
    }
    setLoadingRecent(true);
    setRecentError(null);
    try {
      const response = await fetch(`${API_BASE}/api/support/requests?limit=5`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Unable to load recent support requests');
      }
      const data = await response.json();
      setRecentRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      setRecentError(error.message || 'Unable to load recent support requests');
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentRequests();
  }, [fetchRecentRequests]);

  const handleInput = (setter) => (event) => {
    const { name, value } = event.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const persistQueue = (queue) => {
    setQueuedRequests(queue);
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SUPPORT_QUEUE_KEY, JSON.stringify(queue));
  };

  const saveOfflineRequest = (payload) => {
    const offlineRequest = {
      ...payload,
      queuedAt: new Date().toISOString()
    };
    persistQueue([...queuedRequests, offlineRequest]);
  };

  const handleSupportSubmit = async (type, payload, resetForm) => {
    setSubmitting(type);
    setStatusBanner(null);

    const body = {
      ...payload,
      supportType: type,
      submittedAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_BASE}/api/support/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${(typeof window !== 'undefined' && window.localStorage.getItem('token')) || ''}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Support service unavailable');
      }

      setStatusBanner({
        type: 'success',
        title: 'Request sent to the EEC support desk.',
        description: 'You will receive a confirmation email shortly.'
      });
      resetForm();
      fetchRecentRequests();
    } catch (error) {
      console.error('Support request failed', error);
      saveOfflineRequest(body);
      setStatusBanner({
        type: 'warning',
        title: 'Support service unreachable.',
        description:
          'The request has been saved locally and can be resent when your connection is restored. You can also call the hotline for urgent help.'
      });
    } finally {
      setSubmitting('');
    }
  };

  const retryQueuedRequests = async () => {
    if (!queuedRequests.length) return;
    setSyncingQueue(true);
    const remaining = [];

    for (const request of queuedRequests) {
      try {
        const response = await fetch(`${API_BASE}/api/support/requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${(typeof window !== 'undefined' && window.localStorage.getItem('token')) || ''}`
          },
          body: JSON.stringify(request)
        });
        if (!response.ok) {
          throw new Error('Failed to sync support request');
        }
      } catch (err) {
        console.error('Unable to sync support request', err);
        remaining.push(request);
      }
    }

    persistQueue(remaining);
    setSyncingQueue(false);

    if (!remaining.length) {
      setStatusBanner({
        type: 'success',
        title: 'All queued support requests were sent.',
        description: 'Our support desk has received your pending items.'
      });
    } else {
      setStatusBanner({
        type: 'warning',
        title: 'Some requests are still queued.',
        description: 'Please retry syncing once you have a stable connection.'
      });
    }
  };

  const statusStyles = useMemo(
    () => ({
      success: 'bg-green-50 text-green-800 border-green-200',
      warning: 'bg-amber-50 text-amber-800 border-amber-200',
      error: 'bg-red-50 text-red-800 border-red-200'
    }),
    []
  );

  const fetchPasswordResetUsers = useCallback(async (role, search) => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem('token');
    if (!token) {
      setPasswordResetUsers([]);
      return;
    }

    setPasswordResetLoadingUsers(true);
    try {
      const query = new URLSearchParams({ role });
      if (search?.trim()) {
        query.set('q', search.trim());
      }
      const response = await fetch(`${API_BASE}/api/admin/users/password-reset/users?${query.toString()}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to fetch users');
      }
      setPasswordResetUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (error) {
      setPasswordResetUsers([]);
      setStatusBanner({
        type: 'error',
        title: 'Unable to load users for password reset.',
        description: error.message || 'Please retry.',
      });
    } finally {
      setPasswordResetLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    setSelectedPasswordResetUser(null);
    setPasswordResetResult(null);
    const timer = window.setTimeout(() => {
      fetchPasswordResetUsers(passwordResetRole, passwordResetSearch);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [passwordResetRole, passwordResetSearch, fetchPasswordResetUsers]);

  const handlePasswordResetSubmit = async (event) => {
    event.preventDefault();
    if (!selectedPasswordResetUser?.id) {
      setStatusBanner({
        type: 'error',
        title: 'Please select a user to reset password.',
        description: 'Choose a role, search by user ID/name, then select one user.',
      });
      return;
    }

    setSubmitting('password-reset');
    setStatusBanner(null);
    setPasswordResetResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/admin/users/password-reset/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${(typeof window !== 'undefined' && window.localStorage.getItem('token')) || ''}`,
        },
        body: JSON.stringify({
          role: passwordResetRole,
          userId: selectedPasswordResetUser.id,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to reset password');
      }

      setPasswordResetResult({
        name: data?.name || selectedPasswordResetUser.name,
        loginId: data?.loginId || selectedPasswordResetUser.userId,
        password: data?.password || 'Pass@123',
      });
      setStatusBanner({
        type: 'success',
        title: 'Password reset completed.',
        description: 'Default password has been set to Pass@123.',
      });
    } catch (error) {
      setStatusBanner({
        type: 'error',
        title: 'Password reset failed.',
        description: error.message || 'Please retry.',
      });
    } finally {
      setSubmitting('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Hero / Header Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-7 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest font-semibold text-amber-500">Need assistance?</p>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">Support & Service Desk</h1>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                Let our support team reset credentials, collect your product feedback, or investigate complaints.
                We typically respond within one business day.
              </p>
            </div>
            <div className="bg-amber-50 text-amber-500 rounded-xl p-4 self-start">
              <LifeBuoy className="h-7 w-7" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3 text-gray-600">
              <Headphones className="text-amber-500" size={18} />
              <div>
                <p className="text-gray-400 text-xs">Support Hotline</p>
                <p className="font-semibold text-gray-800">+91 90420 56789</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="text-amber-500" size={18} />
              <div>
                <p className="text-gray-400 text-xs">Email</p>
                <p className="font-semibold text-gray-800">support@eecschools.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MessageCircle className="text-amber-500" size={18} />
              <div>
                <p className="text-gray-400 text-xs">Availability</p>
                <p className="font-semibold text-gray-800">Mon - Fri &bull; 8 AM to 6 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Highlight Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {supportHighlights.map((item) => (
            <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex gap-3 items-start">
              <div className={`${item.accent} rounded-lg p-2.5`}>
                <item.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{item.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{item.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.helper}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Status Banner */}
        {statusBanner && (
          <div className={`rounded-xl border px-4 py-3 ${statusStyles[statusBanner.type]}`}>
            <p className="font-semibold text-sm">{statusBanner.title}</p>
            <p className="text-xs mt-1 opacity-80">{statusBanner.description}</p>
          </div>
        )}

        {/* Offline Queue */}
        {queuedRequests.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <p className="text-xs uppercase font-semibold text-amber-500">Offline queue</p>
                <h2 className="text-base font-semibold text-gray-900">
                  {queuedRequests.length} request{queuedRequests.length > 1 ? 's' : ''} pending sync
                </h2>
              </div>
              <button
                type="button"
                onClick={retryQueuedRequests}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 text-white px-4 py-2 text-sm font-medium hover:bg-amber-600 transition disabled:opacity-60 disabled:cursor-wait"
                disabled={syncingQueue}
              >
                {syncingQueue ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                Retry sending
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {queuedRequests.slice(0, 4).map((request, index) => (
                <div key={request.submittedAt + index} className="bg-amber-50 rounded-lg p-3 text-sm text-gray-700">
                  <p className="font-semibold capitalize">{request.supportType.replace('-', ' ')}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Saved on {new Date(request.queuedAt || request.submittedAt).toLocaleString()}
                  </p>
                  {request.staffName && <p className="mt-1.5 text-gray-600 text-xs">{request.staffName}</p>}
                  {request.subject && <p className="mt-1.5 text-gray-600 text-xs">{request.subject}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Forms Row */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Password Reset Form */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg">
                <RefreshCcw size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Password reset</h2>
                <p className="text-xs text-gray-400">Request account unlocks or credential resets for your staff.</p>
              </div>
            </div>
            <form className="space-y-3" onSubmit={handlePasswordResetSubmit}>
              <div>
                <label className={labelClass}>Role <span className="text-red-500">*</span></label>
                <select
                  value={passwordResetRole}
                  onChange={(event) => {
                    setPasswordResetRole(event.target.value);
                    setPasswordResetUserPickerOpen(false);
                  }}
                  className={selectClass}
                  required
                >
                  {PASSWORD_RESET_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className={labelClass}>User ID / Name <span className="text-red-500">*</span></label>
                <button
                  type="button"
                  className={`${inputClass} mt-1 text-left flex items-center justify-between`}
                  onClick={() => setPasswordResetUserPickerOpen((prev) => !prev)}
                >
                  <span className="truncate">
                    {selectedPasswordResetUser
                      ? `${selectedPasswordResetUser.userId} - ${selectedPasswordResetUser.name}`
                      : 'Select user'}
                  </span>
                  <span className="text-gray-400">{passwordResetUserPickerOpen ? '▲' : '▼'}</span>
                </button>

                {passwordResetUserPickerOpen && (
                  <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg p-2">
                    <input
                      type="text"
                      value={passwordResetSearch}
                      onChange={(event) => setPasswordResetSearch(event.target.value)}
                      className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      placeholder="Search by user ID or name"
                    />
                    <div className="mt-2 max-h-52 overflow-y-auto">
                      {passwordResetLoadingUsers ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Loading users...</div>
                      ) : passwordResetUsers.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No users found</div>
                      ) : (
                        passwordResetUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-yellow-50 text-sm"
                            onClick={() => {
                              setSelectedPasswordResetUser(user);
                              setPasswordResetUserPickerOpen(false);
                            }}
                          >
                            <div className="font-medium text-gray-900">{user.userId}</div>
                            <div className="text-xs text-gray-500">{user.name}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {passwordResetResult && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                  <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">Reset complete</p>
                  <p className="text-sm text-emerald-800 mt-1">
                    <span className="font-semibold">Name:</span> {passwordResetResult.name}
                  </p>
                  <p className="text-sm text-emerald-800">
                    <span className="font-semibold">Login ID:</span> {passwordResetResult.loginId}
                  </p>
                  <p className="text-sm text-emerald-800">
                    <span className="font-semibold">Password:</span> {passwordResetResult.password}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 text-white py-2.5 text-sm font-semibold hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-wait"
                disabled={submitting === 'password-reset'}
              >
                {submitting === 'password-reset' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Reset password to Pass@123
              </button>
            </form>
          </section>

          {/* Feedback Form */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 text-purple-600 p-2.5 rounded-lg">
                <MessageCircle size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Product feedback</h2>
                <p className="text-xs text-gray-400">Share improvements, new ideas, or satisfaction scores.</p>
              </div>
            </div>
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                handleSupportSubmit('feedback', feedbackForm, () => setFeedbackForm(defaultFeedback));
              }}
            >
              <div>
                <label className={labelClass}>Subject</label>
                <input
                  name="subject"
                  value={feedbackForm.subject}
                  onChange={handleInput(setFeedbackForm)}
                  required
                  className={inputClass}
                  placeholder="Eg. Attendance dashboard idea"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    name="category"
                    value={feedbackForm.category}
                    onChange={handleInput(setFeedbackForm)}
                    className={selectClass}
                  >
                    <option value="general">General</option>
                    <option value="feature-request">Feature Request</option>
                    <option value="issue">Issue</option>
                    <option value="praise">Appreciation</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Sentiment</label>
                  <select
                    name="sentiment"
                    value={feedbackForm.sentiment}
                    onChange={handleInput(setFeedbackForm)}
                    className={selectClass}
                  >
                    <option value="positive">Positive</option>
                    <option value="neutral">Neutral</option>
                    <option value="negative">Needs attention</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Message</label>
                <textarea
                  name="message"
                  value={feedbackForm.message}
                  onChange={handleInput(setFeedbackForm)}
                  rows={6}
                  className={textareaClass}
                  placeholder="Be as descriptive as possible helps our product team to prioritise."
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 text-white py-2.5 text-sm font-semibold hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-wait"
                disabled={submitting === 'feedback'}
              >
                {submitting === 'feedback' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send feedback
              </button>
            </form>
          </section>
        </div>

        {/* Complaint Form - Full Width */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 text-red-500 p-2.5 rounded-lg">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">File a complaint</h2>
              <p className="text-xs text-gray-400">
                Escalate safeguarding issues, product incidents, and compliance concerns directly to our support desk.
              </p>
            </div>
          </div>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              handleSupportSubmit('complaint', complaintForm, () => setComplaintForm(defaultComplaint));
            }}
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Complaint topic</label>
                <select
                  name="topic"
                  value={complaintForm.topic}
                  onChange={handleInput(setComplaintForm)}
                  className={selectClass}
                >
                  <option value="system-issue">System issue</option>
                  <option value="service-quality">Service quality</option>
                  <option value="data-privacy">Data privacy</option>
                  <option value="safety">Student safety</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Impact level</label>
                <select
                  name="impactLevel"
                  value={complaintForm.impactLevel}
                  onChange={handleInput(setComplaintForm)}
                  className={selectClass}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Incident date</label>
                <input
                  type="date"
                  name="incidentDate"
                  value={complaintForm.incidentDate}
                  onChange={handleInput(setComplaintForm)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Student / staff involved (optional)</label>
                <input
                  name="studentOrStaff"
                  value={complaintForm.studentOrStaff}
                  onChange={handleInput(setComplaintForm)}
                  className={inputClass}
                  placeholder="Eg. Grade 8 - Section B"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Describe the issue</label>
              <textarea
                name="description"
                rows={4}
                value={complaintForm.description}
                onChange={handleInput(setComplaintForm)}
                required
                className={textareaClass}
                placeholder="Include any evidence, attachments shared via email, and the expected resolution timeline."
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 text-white py-2.5 text-sm font-semibold hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-wait"
              disabled={submitting === 'complaint'}
            >
              {submitting === 'complaint' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit complaint
            </button>
          </form>
        </section>

        {/* Support Playbook */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gray-100 text-gray-600">
              <NotebookPen size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Better requests</p>
              <h2 className="text-base font-semibold text-gray-900">Support playbook</h2>
              <p className="text-xs text-gray-400">Tiny reminders that keep responses fast and actionable.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {supportPlaybook.map((tip) => (
              <div key={tip.title} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-800">{tip.title}</p>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{tip.description}</p>
                <ul className="mt-3 space-y-1.5">
                  {tip.checklist.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Urgent Help Banner */}
        <section className="bg-gray-900 text-white rounded-xl p-5 md:p-7 grid gap-5 md:grid-cols-2 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Need urgent help?</p>
            <h2 className="text-xl font-semibold mt-1.5">Reach our on-call team 24/7</h2>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">
              Security and compliance incidents can be escalated immediately. Our on-call engineers track the same case
              ID as the ticket you create here.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <ClipboardList className="text-amber-400" size={18} />
              <div>
                <p className="text-xs text-gray-400">Service status</p>
                <p className="text-sm font-semibold">All systems normal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Headphones className="text-amber-400" size={18} />
              <div>
                <p className="text-xs text-gray-400">On-call engineer</p>
                <p className="text-sm font-semibold">Meow Bala</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-amber-400" size={18} />
              <div>
                <p className="text-xs text-gray-400">Escalate on email</p>
                <p className="text-sm font-semibold">meow.bala@eecschools.com</p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Requests */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-gray-400">Live history</p>
              <h2 className="text-base font-semibold text-gray-900">Recent requests</h2>
              <p className="text-xs text-gray-400 mt-0.5">Track what the support desk is working on for your campus.</p>
            </div>
            <button
              type="button"
              onClick={fetchRecentRequests}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-60"
              disabled={loadingRecent}
            >
              {loadingRecent ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Refresh
            </button>
          </div>
          {recentError && (
            <div className="rounded-lg bg-red-50 text-red-600 border border-red-100 px-4 py-2 text-xs mb-4">
              {recentError}
            </div>
          )}
          {loadingRecent ? (
            <p className="text-sm text-gray-400">Loading recent tickets...</p>
          ) : recentRequests.length === 0 ? (
            <p className="text-sm text-gray-400">No support tickets submitted yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentRequests.map((request) => (
                <div key={request.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {request.subject || request.supportType?.replace('-', ' ')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {request.ticketNumber} &bull; {request.supportType} &bull;{' '}
                      {new Date(request.updatedAt || request.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{request.message || request.resolutionNotes}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        request.status === 'resolved'
                          ? 'bg-green-50 text-green-600'
                          : request.status === 'in_progress'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {request.status?.replace('_', ' ')}
                    </span>
                    {request.priority && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 capitalize">
                        {request.priority} priority
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Support;
