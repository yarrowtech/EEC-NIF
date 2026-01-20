import { useMemo, useState } from 'react';
import { AlertTriangle, UserCog, ClipboardCheck, ChevronDown } from 'lucide-react';

const severityClasses = {
  high: 'bg-rose-100 text-rose-600',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-sky-100 text-sky-700'
};

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' }
];

const Issues = ({ issues, onIssueUpdate }) => {
  const [filter, setFilter] = useState('all');
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => (filter === 'all' ? true : issue.status === filter));
  }, [issues, filter]);

  const changeStatus = (issueId, status) => {
    onIssueUpdate(issueId, { status });
  };

  const changeOwner = (issueId) => {
    const owner = window.prompt('Assign a new owner');
    if (owner) {
      onIssueUpdate(issueId, { owner });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase text-slate-400">Incident response</p>
            <h2 className="text-2xl font-semibold text-slate-800">Issue control room</h2>
          </div>
          <div className="flex gap-2">
            {['all', 'open', 'investigating', 'resolved'].map((status) => (
              <button
                key={status}
                className={`px-4 py-2 rounded-lg text-sm border ${
                  filter === status ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600'
                }`}
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredIssues.map((issue) => (
          <div key={issue.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-800">{issue.title}</p>
                    <p className="text-sm text-slate-500">Reported by {issue.reportedBy}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-3">{issue.description}</p>
                <p className="text-xs text-slate-400 mt-2">Opened {new Date(issue.reportedAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2 text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${severityClasses[issue.severity]}`}>
                  {issue.severity.toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {issue.status.replace('_', ' ')}
                </span>
                <p className="text-xs text-slate-500">Owner: {issue.owner}</p>
                {issue.updatedAt && (
                  <p className="text-xs text-slate-400">Updated {new Date(issue.updatedAt).toLocaleString()}</p>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative inline-flex border border-slate-200 rounded-lg overflow-hidden">
                <select
                  value={issue.status}
                  onChange={(event) => changeStatus(issue.id, event.target.value)}
                  className="appearance-none px-4 py-2 text-sm text-slate-700 bg-white pr-8"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2 top-2 text-slate-400">
                  <ChevronDown size={16} />
                </span>
              </div>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm"
                onClick={() => changeOwner(issue.id)}
              >
                <UserCog size={16} />
                Reassign owner
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm"
                onClick={() => onIssueUpdate(issue.id, { status: 'resolved' })}
              >
                <ClipboardCheck size={16} />
                Mark resolved
              </button>
            </div>
          </div>
        ))}
        {filteredIssues.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-500">
            No issues for the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default Issues;
