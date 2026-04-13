import { useMemo, useState } from 'react';
import { AlertTriangle, ClipboardCheck, Calendar, Building2, Check } from 'lucide-react';

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

  const handleToggleResolve = (issue) => {
    const isResolved = issue.status === 'resolved';
    onIssueUpdate(issue.id, { status: isResolved ? 'open' : 'resolved' });
  };

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

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {error && (
          <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading && filteredIssues.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-slate-700 font-semibold">Loading issues from database...</p>
          </div>
        )}

        <div className="divide-y divide-slate-100">
          {filteredIssues.map((issue) => {
            const severity = String(issue?.severity || 'medium').toLowerCase();
            const status = String(issue?.status || 'open').toLowerCase();
            const severityClass = SEVERITY_META[severity] || SEVERITY_META.medium;
            const statusClass = STATUS_META[status] || 'bg-slate-100 text-slate-700 border-slate-200';
            const isResolved = status === 'resolved';

            return (
              <div key={issue.id} className={`p-5 transition-colors hover:bg-slate-50 flex items-start gap-4 ${isResolved ? 'bg-slate-50/50' : ''}`}>
                <button
                  onClick={() => handleToggleResolve(issue)}
                  className={`mt-1 shrink-0 flex h-6 w-6 items-center justify-center rounded border transition-colors ${
                    isResolved
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white border-slate-300 text-transparent hover:border-emerald-400'
                  }`}
                >
                  <Check size={16} strokeWidth={3} className={isResolved ? 'opacity-100' : 'opacity-0'} />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <h3 className={`text-base font-semibold truncate ${isResolved ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                        {issue.title}
                      </h3>
                      <p className={`text-sm mt-1 line-clamp-2 ${isResolved ? 'text-slate-400' : 'text-slate-600'}`}>
                        {issue.description || 'No description provided.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${severityClass}`}>
                        {toLabel(severity)}
                      </span>
                      {!isResolved && status === 'investigating' && (
                        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
                          {toLabel(status)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Building2 size={14} className="text-slate-400" />
                      {issue.schoolName || issue.reportedBy || 'Unknown school'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      {issue.reportedAt ? new Date(issue.reportedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredIssues.length === 0 && !loading && (
          <div className="p-10 text-center">
            <p className="text-slate-700 font-semibold">No issues in this status</p>
            <p className="text-sm text-slate-500 mt-1">Try switching the filter to see other items.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Issues;
