import { useMemo, useState, useEffect } from 'react';
import {
  AlertTriangle, Calendar, Building2, Check, RefreshCw, Search,
  ChevronLeft, ChevronRight, Hash, Flame, ShieldAlert, Minus,
  ClipboardList, CheckCircle2, Loader2, Circle
} from 'lucide-react';

const STATUS_META = {
  open: { label: 'Open', bar: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  investigating: { label: 'In Progress', bar: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  resolved: { label: 'Resolved', bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
};

const SEVERITY_META = {
  critical: { label: 'Critical', icon: Flame, cls: 'bg-rose-100 text-rose-700' },
  high: { label: 'High', icon: ShieldAlert, cls: 'bg-orange-100 text-orange-700' },
  medium: { label: 'Medium', icon: AlertTriangle, cls: 'bg-amber-100 text-amber-700' },
  low: { label: 'Low', icon: Minus, cls: 'bg-sky-100 text-sky-700' }
};

const PAGE_SIZE = 8;

/* ─── Numbered Pagination ─── */
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  const pages = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="px-1.5 text-slate-400 text-xs">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`min-w-8 h-8 rounded-lg text-xs font-medium transition-colors border ${
              p === current
                ? 'bg-slate-900 text-white border-slate-900'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─── Issue Card ─── */
function IssueCard({ issue, onToggleInProgress, onToggleResolved }) {
  const severity = String(issue?.severity || 'medium').toLowerCase();
  const status = String(issue?.status || 'open').toLowerCase();
  const severityMeta = SEVERITY_META[severity] || SEVERITY_META.medium;
  const statusMeta = STATUS_META[status] || STATUS_META.open;
  const SeverityIcon = severityMeta.icon;
  const isResolved = status === 'resolved';
  const isInProgress = status === 'investigating';
  const progressChecked = isInProgress || isResolved;
  const canToggleResolved = isInProgress || isResolved;

  return (
    <div className={`relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md ${isResolved ? 'opacity-70' : ''}`}>
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusMeta.bar}`} />

      <div className="pl-5 pr-5 py-4 flex items-start gap-4">
        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="min-w-0">
              <h3 className={`text-base font-semibold leading-snug ${isResolved ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                {issue.title || 'Untitled Issue'}
              </h3>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-1">
                <Hash size={11} />
                {issue.id || issue._id || '—'}
              </p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${severityMeta.cls}`}>
                <SeverityIcon size={11} />
                {severityMeta.label}
              </span>
              <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusMeta.badge}`}>
                {statusMeta.label}
              </span>
            </div>
          </div>

          {/* Description */}
          {issue.description && (
            <p className={`text-sm mt-2 line-clamp-2 leading-relaxed ${isResolved ? 'text-slate-400' : 'text-slate-600'}`}>
              {issue.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
              <Building2 size={13} className="text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-700">
                {issue.schoolName || issue.reportedBy || 'Unknown School'}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400 shrink-0" />
              {issue.reportedAt
                ? new Date(issue.reportedAt).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })
                : 'No date'}
            </span>
            {isResolved && issue.resolvedAt && (
              <span className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 size={13} />
                Resolved {new Date(issue.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <button
              onClick={() => onToggleInProgress(issue)}
              title={progressChecked ? 'Mark as open' : 'Mark as in progress'}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className={`flex h-4 w-4 items-center justify-center rounded-sm border ${progressChecked ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300 bg-white text-transparent'}`}>
                <Check size={11} strokeWidth={3} />
              </span>
              In Progress
            </button>

            <button
              onClick={() => onToggleResolved(issue)}
              disabled={!canToggleResolved}
              title={!canToggleResolved ? 'Mark as In Progress first' : (isResolved ? 'Reopen to in progress' : 'Mark as resolved')}
              className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                isResolved
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              } ${!canToggleResolved ? 'cursor-not-allowed opacity-45 hover:bg-white' : ''}`}
            >
              {isResolved ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              Resolved
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
const Issues = ({ issues = [], onIssueUpdate, loading = false, error = null, onRefresh }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const statusCounts = useMemo(() => {
    const counts = { all: issues.length, open: 0, investigating: 0, resolved: 0 };
    issues.forEach((issue) => {
      const s = issue?.status || 'open';
      if (counts[s] !== undefined) counts[s] += 1;
    });
    return counts;
  }, [issues]);

  const filteredIssues = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return issues.filter((issue) => {
      if (filter !== 'all' && issue.status !== filter) return false;
      if (q) {
        const inTitle = String(issue.title || '').toLowerCase().includes(q);
        const inSchool = String(issue.schoolName || issue.reportedBy || '').toLowerCase().includes(q);
        const inDesc = String(issue.description || '').toLowerCase().includes(q);
        if (!inTitle && !inSchool && !inDesc) return false;
      }
      return true;
    });
  }, [issues, filter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredIssues.length / PAGE_SIZE));
  const paginatedIssues = filteredIssues.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const from = filteredIssues.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, filteredIssues.length);

  useEffect(() => { setCurrentPage(1); }, [filter, searchTerm]);

  const handleToggleInProgress = (issue) => {
    const status = String(issue?.status || 'open').toLowerCase();
    const nextStatus = status === 'open' ? 'investigating' : 'open';
    onIssueUpdate(issue.id, { status: nextStatus }, issue);
  };

  const handleToggleResolved = (issue) => {
    const status = String(issue?.status || 'open').toLowerCase();
    if (status === 'open') return;
    const nextStatus = status === 'resolved' ? 'investigating' : 'resolved';
    onIssueUpdate(issue.id, { status: nextStatus }, issue);
  };

  const FILTER_TABS = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'investigating', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Incident response</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-0.5">Issue Control Room</h2>
            <p className="text-sm text-slate-500 mt-1">Track and close operational issues reported by schools.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Stat chips */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg">
                {statusCounts.all} total
              </span>
              <span className="text-xs font-medium bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1.5 rounded-lg">
                {statusCounts.open} open
              </span>
              <span className="text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg">
                {statusCounts.resolved} resolved
              </span>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            )}
          </div>
        </div>

        {/* Filters + Search */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTER_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  filter === key
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{label}</span>
                <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${filter === key ? 'bg-white/20' : 'bg-slate-100'}`}>
                  {statusCounts[key]}
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-1 items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus-within:ring-2 focus-within:ring-emerald-300 transition-all sm:ml-auto max-w-md">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              type="text"
              className="bg-transparent flex-1 text-sm focus:outline-none placeholder:text-slate-400"
              placeholder="Search by school, title, or description…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="space-y-3">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading && filteredIssues.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <Loader2 size={28} className="animate-spin text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Loading issues…</p>
          </div>
        )}

        {!loading && filteredIssues.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <ClipboardList size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-semibold">No issues found</p>
            <p className="text-sm text-slate-500 mt-1">
              {filter !== 'all' ? 'Try switching the filter.' : 'No issues have been reported yet.'}
            </p>
          </div>
        )}

        {paginatedIssues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onToggleInProgress={handleToggleInProgress}
            onToggleResolved={handleToggleResolved}
          />
        ))}

        {/* Pagination bar */}
        {!loading && filteredIssues.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-3.5 border border-slate-100 bg-white rounded-2xl shadow-sm mt-2">
            <span className="text-xs text-slate-500">
              {filteredIssues.length === 0 ? 'No results' : `${from}–${to} of ${filteredIssues.length} issues`}
            </span>
            <Pagination current={currentPage} total={totalPages} onChange={setCurrentPage} />
          </div>
        )}
      </section>
    </div>
  );
};

export default Issues;
