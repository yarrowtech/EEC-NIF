import { Building2, CheckCircle2, AlertCircle, LifeBuoy, Clock, Mail, Phone } from 'lucide-react';

const formatDate = (value) =>
  new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  review: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700'
};

const Overview = ({
  requests,
  feedbackItems,
  issues,
  tickets,
  onRequestAction,
  onIssueUpdate,
  onTicketUpdate,
  onFeedbackUpdate
}) => {
  const pendingRequests = requests.filter((request) => request.status === 'pending');
  const urgentIssues = issues.filter((issue) => issue.status !== 'resolved');
  const activeTickets = tickets.filter((ticket) => ticket.status !== 'resolved');
  const feedbackQueue = feedbackItems.filter((item) => item.status !== 'resolved');

  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase text-slate-400 tracking-wide">Approval Centre</p>
              <h2 className="text-xl font-semibold text-slate-800">Schools waiting for action</h2>
            </div>
            <span className="text-sm text-slate-500">{pendingRequests.length} pending</span>
          </div>

          {pendingRequests.length === 0 && (
            <p className="text-sm text-slate-500">All caught up! Every school request is processed.</p>
          )}

          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="rounded-xl border border-slate-100 p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{request.schoolName}</p>
                      <p className="text-xs text-slate-500">{request.board} • {request.studentCount} students</p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-500 flex gap-4">
                    <span className="flex items-center gap-1"><Clock size={14} /> {formatDate(request.submittedAt)}</span>
                    <span className="flex items-center gap-1"><Mail size={14} /> {request.contactEmail}</span>
                    <span className="flex items-center gap-1"><Phone size={14} /> {request.contactPerson}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
                    onClick={() => onRequestAction(request.id, 'review')}
                  >
                    Request Info
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                    onClick={() => onRequestAction(request.id, 'approved')}
                  >
                    Approve Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-violet-50 text-violet-500">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Recent approvals</p>
                <p className="font-semibold text-slate-800">Activation timeline</p>
              </div>
            </div>
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div key={request.id} className="border border-slate-100 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{request.schoolName}</p>
                      <p className="text-xs text-slate-500">Campus: {request.campuses}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[request.status] || 'bg-slate-100 text-slate-500'}`}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Updated {request.updatedAt ? formatDate(request.updatedAt) : formatDate(request.submittedAt)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-sky-50 text-sky-500">
                <LifeBuoy size={18} />
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Tickets</p>
                <p className="font-semibold text-slate-800">Live queue</p>
              </div>
            </div>
            {activeTickets.length === 0 ? (
              <p className="text-sm text-slate-500">No open tickets. Support team is up to date.</p>
            ) : (
              <div className="space-y-3">
                {activeTickets.slice(0, 4).map((ticket) => (
                  <div key={ticket.id} className="border border-slate-100 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">{ticket.subject}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        ticket.status === 'open'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{ticket.schoolName} • {ticket.owner}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        className="text-xs px-3 py-1 border border-slate-200 rounded-lg text-slate-600"
                        onClick={() => onTicketUpdate(ticket.id, { status: 'in_progress' })}
                      >
                        Assign
                      </button>
                      <button
                        className="text-xs px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600"
                        onClick={() => onTicketUpdate(ticket.id, { status: 'resolved' })}
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-500">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Issue room</p>
              <p className="font-semibold text-slate-800">Incidents under watch</p>
            </div>
          </div>
          {urgentIssues.length === 0 ? (
            <p className="text-sm text-slate-500">No open incidents right now.</p>
          ) : (
            <div className="space-y-3">
              {urgentIssues.map((issue) => (
                <div key={issue.id} className="border border-slate-100 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{issue.title}</p>
                      <p className="text-xs text-slate-500">Owner: {issue.owner}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      issue.severity === 'high'
                        ? 'bg-red-100 text-red-600'
                        : issue.severity === 'medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-sky-100 text-sky-700'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{issue.description}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      className="text-xs px-3 py-1 border border-slate-200 rounded-lg text-slate-600"
                      onClick={() => onIssueUpdate(issue.id, { status: 'investigating' })}
                    >
                      Escalate
                    </button>
                    <button
                      className="text-xs px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600"
                      onClick={() => onIssueUpdate(issue.id, { status: 'resolved' })}
                    >
                      Mark resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-500">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Feedback</p>
              <p className="font-semibold text-slate-800">Responses waiting</p>
            </div>
          </div>
          {feedbackQueue.length === 0 ? (
            <p className="text-sm text-slate-500">No pending feedback threads.</p>
          ) : (
            <div className="space-y-3">
              {feedbackQueue.map((feedback) => (
                <div key={feedback.id} className="border border-slate-100 rounded-lg p-3">
                  <p className="text-sm font-semibold text-slate-700">{feedback.topic}</p>
                  <p className="text-xs text-slate-500">{feedback.schoolName}</p>
                  <p className="text-sm text-slate-600 mt-2">{feedback.message}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      className="text-xs px-3 py-1 border border-slate-200 rounded-lg text-slate-600"
                      onClick={() => onFeedbackUpdate(feedback.id, { status: 'in_progress' })}
                    >
                      Discuss
                    </button>
                    <button
                      className="text-xs px-3 py-1 rounded-lg bg-sky-50 text-sky-600"
                      onClick={() => onFeedbackUpdate(feedback.id, { status: 'resolved' })}
                    >
                      Close feedback
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
