import { useMemo, useState } from 'react';
import { AlertTriangle, ClipboardCheck } from 'lucide-react';

const STATUS_META = {
  open: 'bg-rose-50 text-rose-700 border-rose-200',
  investigating: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200'
};

const SEVERITY_META = {
  critical: 'bg-rose-100 text-rose-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-sky-100 text-sky-700'
};

const toLabel = (value = '') =>
  String(value)
    .split('_')
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ');

const Issues = ({ issues = [], onIssueUpdate, loading = false, error = null }) => {
  const [filter, setFilter] = useState('all');

  const statusCounts = useMemo(() => {
    const counts = { all: issues.length, open: 0, investigating: 0, resolved: 0 };
    issues.forEach((issue) => {
      const status = issue?.status || 'open';
      if (counts[status] !== undefined) counts[status] += 1;
    });
    return counts;
  }, [issues]);

  const filteredIssues = useMemo(
    () => issues.filter((issue) => (filter === 'all' ? true : issue.status === filter)),
    [issues, filter]
  );

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col gap-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Incident response</p>
            <h2 className="text-2xl font-semibold text-slate-900">Issue Control Room</h2>
            <p className="text-sm text-slate-500 mt-1">Track and close operational issues.</p>
          </div>
          <p className="text-xs text-slate-500">
            {statusCounts.all} total • {statusCounts.open} open • {statusCounts.investigating} investigating • {statusCounts.resolved} resolved
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {['all', 'open', 'investigating', 'resolved'].map((status) => (
            <button
              key={status}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-colors ${
                filter === status
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setFilter(status)}
            >
              <span>{status === 'all' ? 'All' : toLabel(status)}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${filter === status ? 'bg-white/20' : 'bg-slate-100'}`}>
                {statusCounts[status]}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading && filteredIssues.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
            <p className="text-slate-700 font-semibold">Loading issues from database...</p>
          </div>
        )}

        {filteredIssues.map((issue) => {
          const severity = String(issue?.severity || 'medium').toLowerCase();
          const status = String(issue?.status || 'open').toLowerCase();
          const severityClass = SEVERITY_META[severity] || SEVERITY_META.medium;
          const statusClass = STATUS_META[status] || 'bg-slate-100 text-slate-700 border-slate-200';

          return (
            <article key={issue.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-rose-50 text-rose-600 mt-0.5">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-slate-900 break-words">{issue.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{issue.schoolName || issue.reportedBy || 'Unknown school'}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {issue.reportedAt ? `Opened ${new Date(issue.reportedAt).toLocaleString()}` : 'Opened time unavailable'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-3">{issue.description || 'No description provided.'}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${severityClass}`}>
                    {toLabel(severity)}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${statusClass}`}>
                    {toLabel(status)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {status !== 'resolved' ? (
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                    onClick={() => onIssueUpdate(issue.id, { status: 'resolved' })}
                  >
                    <ClipboardCheck size={16} />
                    Mark Resolved
                  </button>
                ) : (
                  <p className="text-sm text-emerald-700 font-medium">Already resolved</p>
                )}
              </div>
            </article>
          );
        })}

        {filteredIssues.length === 0 && !loading && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
            <p className="text-slate-700 font-semibold">No issues in this status</p>
            <p className="text-sm text-slate-500 mt-1">Try switching the filter to see other items.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Issues;
