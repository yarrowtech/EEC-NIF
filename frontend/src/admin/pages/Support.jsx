import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ClipboardList,
  Headphones,
  LifeBuoy,
  Loader2,
  Mail,
  MessageCircle,
  RefreshCcw,
  Send
} from 'lucide-react';

const SUPPORT_QUEUE_KEY = 'adminSupportRequests';

const defaultPasswordReset = {
  staffName: '',
  email: '',
  role: 'Teacher',
  urgency: 'normal',
  contactNumber: '',
  details: ''
};

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

const Support = ({ setShowAdminHeader }) => {
  const [passwordResetForm, setPasswordResetForm] = useState(defaultPasswordReset);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/support/requests?limit=5`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/support/requests`, {
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/support/requests`, {
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
      success: 'bg-green-50 text-green-900 border-green-200',
      warning: 'bg-amber-50 text-amber-900 border-amber-200',
      error: 'bg-red-50 text-red-900 border-red-200'
    }),
    []
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm uppercase tracking-widest font-semibold text-orange-500">Need assistance?</p>
              <h1 className="text-3xl font-bold text-slate-900 mt-1">Support & Service Desk</h1>
              <p className="text-slate-600 mt-3">
                Let our support team reset credentials, collect your product feedback, or investigate complaints.
                We typically respond within one business day.
              </p>
            </div>
            <div className="bg-orange-50 text-orange-600 rounded-2xl p-4 self-start">
              <LifeBuoy className="h-8 w-8" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Headphones className="text-orange-500" size={20} />
              <div>
                <p className="text-slate-500">Support Hotline</p>
                <p className="font-semibold text-slate-900">+91 90420 56789</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="text-orange-500" size={20} />
              <div>
                <p className="text-slate-500">Email</p>
                <p className="font-semibold text-slate-900">support@eecschools.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <MessageCircle className="text-orange-500" size={20} />
              <div>
                <p className="text-slate-500">Availability</p>
                <p className="font-semibold text-slate-900">Mon - Fri • 8 AM to 6 PM</p>
              </div>
            </div>
          </div>
        </div>

        {statusBanner && (
          <div className={`rounded-2xl border px-4 py-3 ${statusStyles[statusBanner.type]}`}>
            <p className="font-semibold">{statusBanner.title}</p>
            <p className="text-sm mt-1 text-slate-600">{statusBanner.description}</p>
          </div>
        )}

        {queuedRequests.length > 0 && (
          <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <p className="text-sm uppercase font-semibold text-amber-500">Offline queue</p>
                <h2 className="text-lg font-semibold text-slate-900">
                  {queuedRequests.length} request{queuedRequests.length > 1 ? 's' : ''} pending sync
                </h2>
              </div>
              <button
                type="button"
                onClick={retryQueuedRequests}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 text-white px-4 py-2 text-sm font-medium hover:bg-amber-600 disabled:opacity-60 disabled:cursor-wait"
                disabled={syncingQueue}
              >
                {syncingQueue ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                Retry sending
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {queuedRequests.slice(0, 4).map((request, index) => (
                <div key={request.submittedAt + index} className="bg-amber-50 rounded-xl p-3 text-sm text-slate-700">
                  <p className="font-semibold capitalize">{request.supportType.replace('-', ' ')}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Saved on {new Date(request.queuedAt || request.submittedAt).toLocaleString()}
                  </p>
                  {request.staffName && <p className="mt-2 text-slate-600">{request.staffName}</p>}
                  {request.subject && <p className="mt-2 text-slate-600">{request.subject}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="bg-white rounded-2xl shadow border border-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
                <RefreshCcw />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Password reset</h2>
                <p className="text-sm text-slate-500">Request account unlocks or credential resets for your staff.</p>
              </div>
            </div>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleSupportSubmit('password-reset', passwordResetForm, () => setPasswordResetForm(defaultPasswordReset));
              }}
            >
              <div>
                <label className="text-sm text-slate-600 font-medium">Staff name</label>
                <input
                  name="staffName"
                  value={passwordResetForm.staffName}
                  onChange={handleInput(setPasswordResetForm)}
                  required
                  className="mt-1 w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Eg. Priya Raman"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600 font-medium">Official email</label>
                  <input
                    type="email"
                    name="email"
                    value={passwordResetForm.email}
                    onChange={handleInput(setPasswordResetForm)}
                    required
                    className="mt-1 w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="staff@school.com"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 font-medium">Role</label>
                  <select
                    name="role"
                    value={passwordResetForm.role}
                    onChange={handleInput(setPasswordResetForm)}
                    className="mt-1 w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="Teacher">Teacher</option>
                    <option value="Staff">Staff</option>
                    <option value="Principal">Principal</option>
                    <option value="Parent">Parent</option>
                  </select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600 font-medium">Urgency</label>
                  <select
                    name="urgency"
                    value={passwordResetForm.urgency}
                    onChange={handleInput(setPasswordResetForm)}
                    className="mt-1 w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High - classes impacted</option>
                    <option value="critical">Critical - exams impacted</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-600 font-medium">Contact number</label>
                  <input
                    name="contactNumber"
                    value={passwordResetForm.contactNumber || ''}
                    onChange={handleInput(setPasswordResetForm)}
                    className="mt-1 w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-600 font-medium">Details</label>
                <textarea
                  name="details"
                  value={passwordResetForm.details}
                  onChange={handleInput(setPasswordResetForm)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Add context such as login screen, screenshots shared, etc."
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 disabled:opacity-70 disabled:cursor-wait"
                disabled={submitting === 'password-reset'}
              >
                {submitting === 'password-reset' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send reset request
              </button>
            </form>
          </section>

          <section className="bg-white rounded-2xl shadow border border-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-violet-50 text-violet-600 p-3 rounded-2xl">
                <MessageCircle />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Product feedback</h2>
                <p className="text-sm text-slate-500">Share improvements, new ideas, or satisfaction scores.</p>
              </div>
            </div>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleSupportSubmit('feedback', feedbackForm, () => setFeedbackForm(defaultFeedback));
              }}
            >
              <div>
                <label className="text-sm text-slate-600 font-medium">Subject</label>
                <input
                  name="subject"
                  value={feedbackForm.subject}
                  onChange={handleInput(setFeedbackForm)}
                  required
                  className="mt-1 w-full rounded-xl border-slate-200 focus:border-violet-500 focus:ring-violet-500"
                  placeholder="Eg. Attendance dashboard idea"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600 font-medium">Category</label>
                  <select
                    name="category"
                    value={feedbackForm.category}
                    onChange={handleInput(setFeedbackForm)}
                    className="mt-1 w-full rounded-xl border-slate-200 focus:border-violet-500 focus:ring-violet-500"
                  >
                    <option value="general">General</option>
                    <option value="feature-request">Feature Request</option>
                    <option value="issue">Issue</option>
                    <option value="praise">Appreciation</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-600 font-medium">Sentiment</label>
                  <select
                    name="sentiment"
                    value={feedbackForm.sentiment}
                    onChange={handleInput(setFeedbackForm)}
                    className="mt-1 w-full rounded-xl border-slate-200 focus:border-violet-500 focus:ring-violet-500"
                  >
                    <option value="positive">Positive</option>
                    <option value="neutral">Neutral</option>
                    <option value="negative">Needs attention</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-600 font-medium">Message</label>
                <textarea
                  name="message"
                  value={feedbackForm.message}
                  onChange={handleInput(setFeedbackForm)}
                  rows={4}
                  className="mt-1 w-full rounded-xl border-slate-200 focus:border-violet-500 focus:ring-violet-500"
                  placeholder="Be as descriptive as possible helps our product team to prioritise."
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 text-white py-3 font-semibold hover:bg-violet-700 disabled:opacity-70 disabled:cursor-wait"
                disabled={submitting === 'feedback'}
              >
                {submitting === 'feedback' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send feedback
              </button>
            </form>
          </section>
        </div>

        <section className="bg-white rounded-2xl shadow border border-slate-100 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-rose-50 text-rose-600 p-3 rounded-2xl">
              <AlertTriangle />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">File a complaint</h2>
              <p className="text-sm text-slate-500">
                Escalate safeguarding issues, product incidents, and compliance concerns directly to our support desk.
              </p>
            </div>
          </div>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleSupportSubmit('complaint', complaintForm, () => setComplaintForm(defaultComplaint));
            }}
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-600 font-medium">Complaint topic</label>
                <select
                  name="topic"
                  value={complaintForm.topic}
                  onChange={handleInput(setComplaintForm)}
                  className="mt-1 w-full rounded-xl border-slate-200 focus:border-rose-500 focus:ring-rose-500"
                >
                  <option value="system-issue">System issue</option>
                  <option value="service-quality">Service quality</option>
                  <option value="data-privacy">Data privacy</option>
                  <option value="safety">Student safety</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600 font-medium">Impact level</label>
                <select
                  name="impactLevel"
                  value={complaintForm.impactLevel}
                  onChange={handleInput(setComplaintForm)}
                  className="mt-1 w-full rounded-xl border-slate-200 focus:border-rose-500 focus:ring-rose-500"
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
                <label className="text-sm text-slate-600 font-medium">Incident date</label>
                <input
                  type="date"
                  name="incidentDate"
                  value={complaintForm.incidentDate}
                  onChange={handleInput(setComplaintForm)}
                  className="mt-1 w-full rounded-xl border-slate-200 focus:border-rose-500 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600 font-medium">Student / staff involved (optional)</label>
                <input
                  name="studentOrStaff"
                  value={complaintForm.studentOrStaff}
                  onChange={handleInput(setComplaintForm)}
                  className="mt-1 w-full rounded-xl border-slate-200 focus:border-rose-500 focus:ring-rose-500"
                  placeholder="Eg. Grade 8 - Section B"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600 font-medium">Describe the issue</label>
              <textarea
                name="description"
                rows={5}
                value={complaintForm.description}
                onChange={handleInput(setComplaintForm)}
                required
                className="mt-1 w-full rounded-xl border-slate-200 focus:border-rose-500 focus:ring-rose-500"
                placeholder="Include any evidence, attachments shared via email, and the expected resolution timeline."
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 text-white py-3 font-semibold hover:bg-rose-700 disabled:opacity-70 disabled:cursor-wait"
              disabled={submitting === 'complaint'}
            >
              {submitting === 'complaint' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit complaint
            </button>
          </form>
        </section>

        <section className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 grid gap-6 md:grid-cols-2 items-center">
          <div>
            <p className="text-sm uppercase tracking-widest text-slate-400 font-semibold">Need urgent help?</p>
            <h2 className="text-2xl font-semibold mt-2">Reach our on-call team 24/7</h2>
            <p className="text-slate-300 mt-3">
              Security and compliance incidents can be escalated immediately. Our on-call engineers track the same case
              ID as the ticket you create here.
            </p>
          </div>
          <div className="bg-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <ClipboardList className="text-white" />
              <div>
                <p className="text-sm text-slate-300">Service status</p>
                <p className="text-lg font-semibold">All systems normal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Headphones className="text-white" />
              <div>
                <p className="text-sm text-slate-300">On-call engineer</p>
                <p className="text-lg font-semibold">Meow Bala</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-white" />
              <div>
                <p className="text-sm text-slate-300">Escalate on email</p>
                <p className="text-lg font-semibold">meow.bala@eecschools.com</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow border border-slate-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-slate-400">Live history</p>
              <h2 className="text-xl font-semibold text-slate-900">Recent requests</h2>
              <p className="text-sm text-slate-500 mt-1">Track what the support desk is working on for your campus.</p>
            </div>
            <button
              type="button"
              onClick={fetchRecentRequests}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              disabled={loadingRecent}
            >
              {loadingRecent ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Refresh
            </button>
          </div>
          {recentError && (
            <div className="rounded-xl bg-rose-50 text-rose-700 border border-rose-100 px-4 py-2 text-sm mb-4">
              {recentError}
            </div>
          )}
          {loadingRecent ? (
            <p className="text-sm text-slate-500">Loading recent tickets...</p>
          ) : recentRequests.length === 0 ? (
            <p className="text-sm text-slate-500">No support tickets submitted yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentRequests.map((request) => (
                <div key={request.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {request.subject || request.supportType?.replace('-', ' ')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {request.ticketNumber} • {request.supportType} •{' '}
                      {new Date(request.updatedAt || request.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{request.message || request.resolutionNotes}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        request.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-600'
                          : request.status === 'in_progress'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {request.status?.replace('_', ' ')}
                    </span>
                    {request.priority && (
                      <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">
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
