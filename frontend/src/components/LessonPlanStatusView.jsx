import React, { useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, Calendar, Search, CheckCircle2, Clock, Circle, BookOpen, ChevronRight, Sparkles, Layers3 } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const STATUS_CONFIG = {
  completed:   { label: 'Completed',   tone: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500',  icon: CheckCircle2 },
  in_progress: { label: 'In Progress', tone: 'bg-amber-100  text-amber-700  border-amber-200',   dot: 'bg-amber-400',   icon: Clock },
  pending:     { label: 'Pending',     tone: 'bg-gray-100   text-gray-600   border-gray-200',     dot: 'bg-gray-300',    icon: Circle },
};

const cfg = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.pending;

/* Progress bar with animated fill */
const ProgressBar = ({ value, color = 'bg-blue-500' }) => (
  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
    <div
      className={`h-full rounded-full transition-all duration-700 ${color}`}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

/* Circular ring indicator */
const Ring = ({ percent, size = 56, stroke = 5, color = '#3b82f6' }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.7s ease' }} />
    </svg>
  );
};

const LessonPlanStatusView = () => {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [query, setQuery]       = useState('');
  const [activeSubject, setActiveSubject] = useState('all');

  /* ── Fetch ──────────────────────────────────────────────────────────── */
  const loadStatus = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/lesson-plans/student/status`, {
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.error || 'Failed to load syllabus status');
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load syllabus status');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStatus(); }, []);

  /* ── Derived data ───────────────────────────────────────────────────── */

  /* unique subjects in order of first appearance */
  const subjects = useMemo(() => {
    const seen = new Set();
    const list = [];
    items.forEach((item) => {
      const s = item.subject || 'Unknown';
      if (!seen.has(s)) { seen.add(s); list.push(s); }
    });
    return list;
  }, [items]);

  /* per-subject stats: { completed, total, avgPercent } */
  const subjectStats = useMemo(() => {
    const map = {};
    items.forEach((item) => {
      const s = item.subject || 'Unknown';
      if (!map[s]) map[s] = { completed: 0, inProgress: 0, pending: 0, total: 0, sumPercent: 0 };
      map[s].total++;
      map[s].sumPercent += item.completionPercent || 0;
      if (item.status === 'completed')   map[s].completed++;
      else if (item.status === 'in_progress') map[s].inProgress++;
      else map[s].pending++;
    });
    Object.keys(map).forEach((s) => {
      map[s].avgPercent = map[s].total ? Math.round(map[s].sumPercent / map[s].total) : 0;
    });
    return map;
  }, [items]);

  /* overall stats across all items */
  const overallStats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((i) => i.status === 'completed').length;
    const inProgress = items.filter((i) => i.status === 'in_progress').length;
    const avgPercent = total ? Math.round(items.reduce((s, i) => s + (i.completionPercent || 0), 0) / total) : 0;
    return { total, completed, inProgress, pending: total - completed - inProgress, avgPercent };
  }, [items]);

  /* filtered list for active tab + search */
  const filteredItems = useMemo(() => {
    let list = activeSubject === 'all' ? items : items.filter((i) => (i.subject || 'Unknown') === activeSubject);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((i) => [i.title, i.subject, i.teacherName].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
    return list;
  }, [items, activeSubject, query]);

  /* active subject stats for the progress header */
  const activeStat = activeSubject === 'all' ? overallStats : (subjectStats[activeSubject] || { total: 0, completed: 0, inProgress: 0, pending: 0, avgPercent: 0 });

  /* ring colour per completion */
  const ringColor = (p) => p >= 80 ? '#10b981' : p >= 50 ? '#f59e0b' : '#3b82f6';

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.10),_transparent_22%),linear-gradient(180deg,_#f8fafc_0%,_#eff6ff_100%)] p-4 md:p-6 space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.10),_transparent_22%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <BookOpenCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                <Sparkles className="w-3.5 h-3.5" />
                Progress Tracker
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900">Syllabus Completion</h1>
              <p className="text-sm text-gray-500 mt-1">Date-wise lesson progress updates from your teachers</p>
            </div>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lesson or subject…"
              className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-2xl text-sm bg-white/80 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
            />
          </div>
        </div>

        {/* Overall summary chips */}
        {!loading && items.length > 0 && (
          <div className="relative mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: 'Total lessons', value: overallStats.total, color: 'border-blue-200 bg-blue-50 text-blue-700' },
              { label: 'Completed',     value: overallStats.completed, color: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
              { label: 'In progress',   value: overallStats.inProgress, color: 'border-amber-200 bg-amber-50 text-amber-700' },
              { label: 'Pending',       value: overallStats.pending, color: 'border-slate-200 bg-slate-50 text-slate-700' },
            ].map((c) => (
              <div key={c.label} className={`rounded-2xl border px-4 py-3 ${c.color}`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-80">{c.label}</p>
                <p className="mt-2 text-2xl font-bold">{c.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>
      )}

      {/* ── Subject Tabs ─────────────────────────────────────────────────── */}
      {!loading && subjects.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-[28px] shadow-sm overflow-hidden">

          {/* Tab strip */}
          <div className="overflow-x-auto border-b border-gray-100 px-4 pt-4 bg-slate-50/80">
            <div className="flex gap-2 min-w-max pb-3">
              {/* "All" tab */}
              <button
                onClick={() => setActiveSubject('all')}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-2xl transition-colors border ${
                  activeSubject === 'all'
                    ? 'border-blue-200 text-blue-700 bg-blue-50 shadow-sm'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white'
                }`}
              >
                <Layers3 className="w-4 h-4" />
                All Subjects
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  activeSubject === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>{items.length}</span>
              </button>

              {/* One tab per subject */}
              {subjects.map((subj) => {
                const stat = subjectStats[subj] || {};
                const pct = stat.avgPercent || 0;
                const isActive = activeSubject === subj;
                const badgeColor = pct >= 80 ? 'bg-emerald-100 text-emerald-700' : pct >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500';
                return (
                  <button
                    key={subj}
                    onClick={() => setActiveSubject(subj)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-2xl transition-colors border whitespace-nowrap ${
                      isActive
                        ? 'border-blue-200 text-blue-700 bg-blue-50 shadow-sm'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white'
                    }`}
                  >
                    {subj}
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-blue-100 text-blue-700' : badgeColor}`}>
                      {pct}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Subject Completion Summary ──────────────────────────────── */}
          <div className="p-5 border-b border-gray-100 bg-[linear-gradient(180deg,_rgba(248,250,252,0.85),_rgba(255,255,255,1))]">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
              {/* Ring */}
              <div className="relative shrink-0 flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <Ring percent={activeStat.avgPercent} size={88} stroke={7} color={ringColor(activeStat.avgPercent)} />
                <span className="absolute text-base font-extrabold text-gray-800">{activeStat.avgPercent}%</span>
              </div>

              {/* Text stats */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-700">
                    {activeSubject === 'all' ? 'Overall Completion' : `${activeSubject} — Completion`}
                  </span>
                  <span className="text-xs text-gray-400">{activeStat.total} lesson{activeStat.total !== 1 ? 's' : ''}</span>
                </div>
                <ProgressBar
                  value={activeStat.avgPercent}
                  color={activeStat.avgPercent >= 80 ? 'bg-emerald-500' : activeStat.avgPercent >= 50 ? 'bg-amber-400' : 'bg-blue-500'}
                />
                <div className="flex flex-wrap gap-4 mt-1">
                  {[
                    { label: 'Completed',   value: activeStat.completed,  color: 'text-emerald-600', dot: 'bg-emerald-500' },
                    { label: 'In Progress', value: activeStat.inProgress, color: 'text-amber-600',   dot: 'bg-amber-400'  },
                    { label: 'Pending',     value: activeStat.pending,    color: 'text-gray-500',    dot: 'bg-gray-300'   },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-1.5 text-xs">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                      <span className={`font-bold ${s.color}`}>{s.value}</span>
                      <span className="text-gray-400">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-subject mini grid (only on All tab) */}
              {activeSubject === 'all' && subjects.length > 1 && (
                <div className="xl:ml-4 flex flex-wrap gap-2 xl:max-w-sm">
                  {subjects.slice(0, 6).map((s) => {
                    const pct = subjectStats[s]?.avgPercent || 0;
                    return (
                      <button key={s}
                        onClick={() => setActiveSubject(s)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition text-xs font-semibold text-gray-700">
                        <span className={`w-2 h-2 rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-blue-400'}`} />
                        {s}
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      </button>
                    );
                  })}
                  {subjects.length > 6 && (
                    <span className="flex items-center px-3 py-1.5 text-xs text-gray-400">+{subjects.length - 6} more</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Lesson List ────────────────────────────────────────────── */}
          <div className="p-3 border-b border-gray-100">
            <p className="text-xs text-gray-400 font-medium px-2">
              {loading ? 'Loading…' : `${filteredItems.length} lesson plan${filteredItems.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
              <p className="text-sm text-gray-400">Loading lesson plans…</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
              <div className="p-4 bg-gray-100 rounded-2xl">
                <BookOpenCheck className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-500">No lesson plans found</p>
              <p className="text-xs text-gray-400">
                {query ? 'Try clearing your search' : 'No updates yet for this subject'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredItems.map((item) => {
                const c = cfg(item.status);
                const StatusIcon = c.icon;
                const pct = item.completionPercent || 0;
                return (
                  <div key={item._id} className="px-5 py-4 hover:bg-blue-50/20 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      {/* Left: icon + title/meta */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2.5 rounded-2xl shrink-0 mt-0.5 ${c.tone}`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{item.title || 'Lesson Plan'}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                            <span className="text-xs text-gray-500">{item.subject || 'Subject'}</span>
                            {item.teacherName && (
                              <>
                                <span className="text-gray-300">·</span>
                                <span className="text-xs text-gray-400">{item.teacherName}</span>
                              </>
                            )}
                            <span className="text-gray-300">·</span>
                            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                              <Calendar className="w-3 h-3" />
                              {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </span>
                          </div>
                          {item.remarks && <p className="mt-1.5 text-xs text-gray-500 italic line-clamp-2">{item.remarks}</p>}
                        </div>
                      </div>

                      {/* Right: status badge + mini progress */}
                      <div className="flex items-center gap-3 shrink-0 ml-11 sm:ml-0">
                        <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
                          <div className="flex items-center justify-between w-full">
                            <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${c.tone}`}>
                              {c.label}
                            </span>
                            <span className="text-xs font-bold text-gray-700 ml-2">{pct}%</span>
                          </div>
                          <ProgressBar
                            value={pct}
                            color={pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-blue-400'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* empty state when no items at all */}
      {!loading && items.length === 0 && !error && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="p-4 bg-gray-100 rounded-2xl">
            <BookOpenCheck className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-base font-semibold text-gray-500">No syllabus updates yet</p>
          <p className="text-sm text-gray-400">Your teachers haven't posted any lesson progress.</p>
        </div>
      )}
    </div>
  );
};

export default LessonPlanStatusView;
