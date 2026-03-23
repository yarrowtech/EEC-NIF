import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertCircle, Calendar, CheckCircle2, Heart, MessageCircle, Search, Shield, TrendingUp, User } from 'lucide-react';

const moodScores = { '😊': 95, '😐': 65, '😟': 35 };
const energyScores = { High: 90, Medium: 65, Low: 40 };
const issueScores = { No: 95, Yes: 40 };

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);

const computeMetrics = (student) => {
  const logs = student.logs || [];
  const moodScore = logs.length ? avg(logs.map((l) => moodScores[l.mood] || 50)) : Math.round(student.moodBase ?? 70);
  const healthScore = logs.length
    ? avg(logs.map((l) => Math.round((energyScores[l.energy] + issueScores[l.physicalIssue]) / 2)))
    : Math.round(student.healthBase ?? 70);
  const behaviorScore = logs.length
    ? avg(logs.map((l) => l.behaviorScore ?? student.behaviorBaseline ?? 60))
    : Math.round(student.behaviorBaseline ?? 70);
  const wellbeingScore = Math.round(moodScore * 0.35 + behaviorScore * 0.35 + healthScore * 0.3);
  const issueCounts = logs.reduce((acc, l) => {
    const k = String(l.issueTag || '').toLowerCase();
    if (k && k !== 'none') acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const maxIssueCount = Object.values(issueCounts).reduce((m, n) => Math.max(m, n), 0);
  const autoAlert = maxIssueCount >= 3;
  const status = autoAlert || wellbeingScore < 45 ? 'Critical' : wellbeingScore < 70 ? 'Risk' : 'Good';
  return { moodScore, behaviorScore, healthScore, wellbeingScore, autoAlert, status };
};

const statusClass = (status) => (status === 'Critical' ? 'bg-red-100 text-red-700' : status === 'Risk' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700');

const TrendGraph = ({ pointsA = [], pointsB = [], colorA = '#2563eb', colorB = '#f59e0b' }) => {
  const width = 320;
  const height = 120;
  const toPolyline = (arr) => {
    if (!arr.length) return '';
    return arr.map((v, i) => `${(i / Math.max(1, arr.length - 1)) * width},${height - (Math.max(0, Math.min(100, v)) / 100) * height}`).join(' ');
  };
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 bg-slate-50 rounded-lg border border-slate-200">
      <polyline fill="none" stroke={colorA} strokeWidth="3" points={toPolyline(pointsA)} />
      {pointsB.length > 0 && <polyline fill="none" stroke={colorB} strokeWidth="3" points={toPolyline(pointsB)} />}
    </svg>
  );
};

const parseSortNumber = (value) => {
  const text = String(value ?? '').trim();
  if (!text) return Number.POSITIVE_INFINITY;
  const n = Number(text);
  if (Number.isFinite(n)) return n;
  const m = text.match(/\d+/);
  return m ? Number(m[0]) : Number.POSITIVE_INFINITY;
};

const HealthUpdatesAdvanced = () => {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [sessionOptions, setSessionOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [range, setRange] = useState('7');
  const [quick, setQuick] = useState({ mood: '😊', energy: 'High', physicalIssue: 'No', notes: '', issueTag: 'none' });
  const [action, setAction] = useState({ type: 'Talked to student', followUpDate: '', notes: '', privateNote: false });
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const loadStudents = async () => {
      setLoadingStudents(true);
      setLoadError('');
      try {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        if (!token || userType !== 'Teacher') throw new Error('Teacher login required');

        const now = new Date();
        const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const date = now.toISOString().slice(0, 10);
        const query = new URLSearchParams({ month, date });
        if (selectedSession) query.set('session', selectedSession);
        if (selectedClass) query.set('className', selectedClass);
        if (selectedSection) query.set('section', selectedSection);
        if (search.trim()) query.set('search', search.trim());

        const res = await fetch(`${API_BASE}/api/attendance/teacher/students?${query.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload?.error || 'Unable to load students');

        const mapped = (Array.isArray(payload?.students) ? payload.students : []).map((s) => {
          const attendancePercent = Number(
            s?.monthlySummary?.attendancePercentage ??
              s?.overallSummary?.attendancePercentage ??
              80
          );
          const safePct = Number.isFinite(attendancePercent) ? attendancePercent : 80;
          return {
            id: String(s._id || s.id),
            name: s.name || 'Student',
            className: `${s.className || s.grade || '-'}${s.section ? `-${s.section}` : ''}`,
            roll: s.roll || s.rollNo || s.rollNumber || '',
            section: s.section || '',
            parentFeedback: { homeBehavior: '—', sleepScreen: '—', emotionalState: '—' },
            behaviorBaseline: Math.max(45, Math.min(95, Math.round(safePct))),
            moodBase: Math.max(45, Math.min(95, Math.round(safePct * 0.9))),
            healthBase: Math.max(45, Math.min(95, Math.round(safePct))),
            logs: [],
            interventions: [],
            confidentialNotes: [],
          };
        });

        setStudents(mapped);
        setSessionOptions(Array.isArray(payload?.options?.sessions) ? payload.options.sessions : []);
        setClassOptions(Array.isArray(payload?.options?.classes) ? payload.options.classes : []);
        setSectionOptions(Array.isArray(payload?.options?.sections) ? payload.options.sections : []);
        setSelectedId((prev) => (mapped.some((s) => s.id === prev) ? prev : mapped[0]?.id || null));
      } catch (err) {
        console.error('Health updates student fetch error:', err);
        setLoadError(err.message || 'Unable to load student data');
        setStudents([]);
        setSelectedId(null);
      } finally {
        setLoadingStudents(false);
      }
    };
    loadStudents();
  }, [selectedSession, selectedClass, selectedSection, search]);

  const enriched = useMemo(() => students.map((s) => ({ ...s, metrics: computeMetrics(s) })), [students]);
  const selectedStudent = useMemo(() => enriched.find((s) => s.id === selectedId) || null, [enriched, selectedId]);

  const directory = useMemo(() => {
    let list = enriched.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.className.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') list = list.filter((s) => s.metrics.status.toLowerCase() === statusFilter);
    list = [...list].sort((a, b) => {
      if (sortBy === 'lowest') {
        const diff = a.metrics.wellbeingScore - b.metrics.wellbeingScore;
        if (diff !== 0) return diff;
      }
      const aDate = a.logs[0]?.date || '';
      const bDate = b.logs[0]?.date || '';
      const byDate = String(bDate).localeCompare(String(aDate));
      if (byDate !== 0) return byDate;
      const byRoll = parseSortNumber(a.roll) - parseSortNumber(b.roll);
      if (byRoll !== 0) return byRoll;
      return String(a.name).localeCompare(String(b.name), undefined, { numeric: true });
    });
    return list;
  }, [enriched, search, statusFilter, sortBy]);

  const emotionalInsights = useMemo(() => {
    const atRisk = enriched.filter((s) => s.metrics.status !== 'Good');
    const issueMap = {};
    enriched.forEach((s) => s.logs.forEach((l) => {
      const key = String(l.issueTag || '').toLowerCase();
      if (key && key !== 'none') issueMap[key] = (issueMap[key] || 0) + 1;
    }));
    const frequentIssues = Object.entries(issueMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { atRisk, frequentIssues };
  }, [enriched]);

  const saveQuickEntry = () => {
    if (!selectedStudent) return;
    const entry = {
      date: new Date().toISOString().slice(0, 10),
      mood: quick.mood,
      energy: quick.energy,
      physicalIssue: quick.physicalIssue,
      notes: quick.notes.trim(),
      issueTag: quick.issueTag.trim().toLowerCase() || 'none',
      behaviorScore: selectedStudent.behaviorBaseline,
      attendance: 1,
    };
    setStudents((prev) => prev.map((s) => (s.id === selectedStudent.id ? { ...s, logs: [entry, ...(s.logs || [])] } : s)));
    setQuick((q) => ({ ...q, notes: '', issueTag: q.physicalIssue === 'Yes' ? q.issueTag : 'none' }));
  };

  const saveIntervention = () => {
    if (!selectedStudent) return;
    const entry = { type: action.type, date: new Date().toISOString().slice(0, 10), followUpDate: action.followUpDate, description: action.notes };
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== selectedStudent.id) return s;
        return {
          ...s,
          interventions: [entry, ...(s.interventions || [])],
          confidentialNotes: action.privateNote && action.notes ? [{ date: entry.date, note: action.notes }, ...(s.confidentialNotes || [])] : s.confidentialNotes,
        };
      })
    );
    setAction({ type: 'Talked to student', followUpDate: '', notes: '', privateNote: false });
  };

  const trendData = useMemo(() => {
    if (!selectedStudent) return { mood: [], attendance: [], behavior: [] };
    const limit = Number(range);
    const logs = [...selectedStudent.logs].slice(0, limit).reverse();
    return {
      mood: logs.map((l) => moodScores[l.mood] || 50),
      attendance: logs.map((l) => (l.attendance ? 100 : 20)),
      behavior: logs.map((l) => l.behaviorScore || 60),
    };
  }, [selectedStudent, range]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h1 className="text-2xl font-bold text-slate-900">Student Health Updates</h1>
        <p className="text-sm text-slate-600">Quick entry, smart alerts, wellbeing analytics, trends, parent feedback, interventions and confidential notes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <h2 className="font-semibold text-slate-900">Student Directory</h2>
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" placeholder="Search student..." /></div>
          <div className="grid grid-cols-3 gap-2">
            <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="border rounded-lg px-2 py-2 text-sm"><option value="">All Years</option>{sessionOptions.map((v) => <option key={v} value={v}>{v}</option>)}</select>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="border rounded-lg px-2 py-2 text-sm"><option value="">All Classes</option>{classOptions.map((v) => <option key={v} value={v}>{v}</option>)}</select>
            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="border rounded-lg px-2 py-2 text-sm"><option value="">All Sections</option>{sectionOptions.map((v) => <option key={v} value={v}>{v}</option>)}</select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-2 py-2 text-sm"><option value="all">All Status</option><option value="good">Good</option><option value="risk">Risk</option><option value="critical">Critical</option></select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded-lg px-2 py-2 text-sm"><option value="recent">Recent issue</option><option value="lowest">Lowest wellbeing</option></select>
          </div>
          <div className="max-h-[420px] overflow-y-auto space-y-2">
            {loadingStudents && <div className="text-sm text-slate-500 p-2">Loading students...</div>}
            {loadError && <div className="text-sm text-red-600 p-2">{loadError}</div>}
            {directory.map((s) => (
              <button key={s.id} onClick={() => setSelectedId(s.id)} className={`w-full text-left border rounded-lg p-3 ${selectedId === s.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{s.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusClass(s.metrics.status)}`}>{s.metrics.status}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{s.className} • Roll {s.roll} • Sec {s.section}</p>
                <p className="text-xs text-slate-500 mt-1">Wellbeing: {s.metrics.wellbeingScore}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 space-y-5">
          {!selectedStudent ? <p className="text-slate-500">Select a student.</p> : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{selectedStudent.name}</h2>
                  <p className="text-sm text-slate-600">{selectedStudent.className} • Roll {selectedStudent.roll} • Sec {selectedStudent.section}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTab('parent')}
                    className="px-3 py-1 rounded-lg text-sm bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    Parent Feedback
                  </button>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass(selectedStudent.metrics.status)}`}>{selectedStudent.metrics.status}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard label="Mood Score" value={selectedStudent.metrics.moodScore} icon={<Heart className="w-4 h-4" />} />
                <MetricCard label="Behavior Score" value={selectedStudent.metrics.behaviorScore} icon={<User className="w-4 h-4" />} />
                <MetricCard label="Health Score" value={selectedStudent.metrics.healthScore} icon={<Activity className="w-4 h-4" />} />
                <MetricCard label="Wellbeing (0-100)" value={selectedStudent.metrics.wellbeingScore} icon={<TrendingUp className="w-4 h-4" />} />
              </div>

              <div className="border rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Quick Health Entry</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <div className="flex gap-2">{['😊', '😐', '😟'].map((m) => <button key={m} type="button" onClick={() => setQuick((q) => ({ ...q, mood: m }))} className={`px-3 py-2 rounded-lg border ${quick.mood === m ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>{m}</button>)}</div>
                  <select value={quick.energy} onChange={(e) => setQuick((q) => ({ ...q, energy: e.target.value }))} className="border rounded-lg px-2 py-2 text-sm"><option>High</option><option>Medium</option><option>Low</option></select>
                  <select value={quick.physicalIssue} onChange={(e) => setQuick((q) => ({ ...q, physicalIssue: e.target.value }))} className="border rounded-lg px-2 py-2 text-sm"><option>No</option><option>Yes</option></select>
                  <input value={quick.issueTag} onChange={(e) => setQuick((q) => ({ ...q, issueTag: e.target.value }))} className="border rounded-lg px-2 py-2 text-sm" placeholder="Issue tag (stress/fatigue)" />
                  <input value={quick.notes} onChange={(e) => setQuick((q) => ({ ...q, notes: e.target.value }))} className="border rounded-lg px-2 py-2 text-sm" placeholder="Short notes" />
                </div>
                <button type="button" onClick={saveQuickEntry} className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><CheckCircle2 className="w-4 h-4" />Save in 1 click</button>
              </div>

              <div className="flex gap-2 flex-wrap">
                {['overview', 'trends', 'parent', 'intervention', 'confidential', 'daily'].map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-sm ${tab === t ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>{t}</button>
                ))}
              </div>

              {tab === 'overview' && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-xl p-4">
                    <h4 className="font-semibold mb-2">Smart Alert</h4>
                    <p className="text-sm text-slate-700">{selectedStudent.metrics.autoAlert ? 'Repeated issue detected 3+ times. Auto alert raised.' : 'No repeated critical pattern.'}</p>
                    <p className="text-xs text-slate-500 mt-1">Logic: Good (green), Risk (yellow), Critical (red).</p>
                  </div>
                  <div className="border rounded-xl p-4">
                    <h4 className="font-semibold mb-2">Emotional Insights</h4>
                    <p className="text-sm">At Risk Students: <span className="font-semibold">{emotionalInsights.atRisk.length}</span></p>
                    <ul className="text-xs mt-2 text-slate-600 space-y-1">{emotionalInsights.frequentIssues.map(([k, c]) => <li key={k}>{k}: {c}</li>)}</ul>
                  </div>
                </div>
              )}

              {tab === 'trends' && (
                <div className="space-y-4">
                  <div className="flex gap-2"><button onClick={() => setRange('7')} className={`px-3 py-1 rounded ${range === '7' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'}`}>7 days</button><button onClick={() => setRange('30')} className={`px-3 py-1 rounded ${range === '30' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'}`}>30 days</button></div>
                  <div><p className="text-sm font-medium mb-1">Mood Trend</p><TrendGraph pointsA={trendData.mood} /></div>
                  <div><p className="text-sm font-medium mb-1">Attendance vs Mood</p><TrendGraph pointsA={trendData.attendance} pointsB={trendData.mood} colorA="#10b981" colorB="#2563eb" /></div>
                  <div><p className="text-sm font-medium mb-1">Behavior Trend</p><TrendGraph pointsA={trendData.behavior} colorA="#f97316" /></div>
                </div>
              )}

              {tab === 'parent' && (
                <div className="border rounded-xl p-4 space-y-2">
                  <h4 className="font-semibold flex items-center gap-2"><MessageCircle className="w-4 h-4" />Parent Feedback</h4>
                  <p className="text-sm">Home behavior: {selectedStudent.parentFeedback.homeBehavior}</p>
                  <p className="text-sm">Sleep/screen time: {selectedStudent.parentFeedback.sleepScreen}</p>
                  <p className="text-sm">Emotional state: {selectedStudent.parentFeedback.emotionalState}</p>
                  <p className="text-xs text-slate-500 mt-2">Teacher vs Parent view helps identify mismatch early.</p>
                </div>
              )}

              {tab === 'intervention' && (
                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-2">
                    <select value={action.type} onChange={(e) => setAction((a) => ({ ...a, type: e.target.value }))} className="border rounded-lg px-2 py-2 text-sm"><option>Talked to student</option><option>Informed parent</option><option>Sent to counselor</option></select>
                    <input type="date" value={action.followUpDate} onChange={(e) => setAction((a) => ({ ...a, followUpDate: e.target.value }))} className="border rounded-lg px-2 py-2 text-sm" />
                  </div>
                  <textarea value={action.notes} onChange={(e) => setAction((a) => ({ ...a, notes: e.target.value }))} className="w-full border rounded-lg px-2 py-2 text-sm" rows={3} placeholder="Action notes..." />
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={action.privateNote} onChange={(e) => setAction((a) => ({ ...a, privateNote: e.target.checked }))} />Private note (teacher + admin)</label>
                  <button type="button" onClick={saveIntervention} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save Action</button>
                  <div className="space-y-2">{(selectedStudent.interventions || []).map((i, idx) => <div key={`${i.date}-${idx}`} className="border rounded-lg p-2 text-sm">{i.date} • {i.type} {i.followUpDate ? `• Follow-up: ${i.followUpDate}` : ''}<div className="text-xs text-slate-600">{i.description}</div></div>)}</div>
                </div>
              )}

              {tab === 'confidential' && (
                <div className="border rounded-xl p-4">
                  <h4 className="font-semibold flex items-center gap-2"><Shield className="w-4 h-4" />Confidential Notes</h4>
                  <div className="space-y-2 mt-2">{(selectedStudent.confidentialNotes || []).length ? selectedStudent.confidentialNotes.map((n, i) => <div key={`${n.date}-${i}`} className="text-sm border rounded p-2">{n.date} • {n.note}</div>) : <p className="text-sm text-slate-500">No confidential notes yet.</p>}</div>
                </div>
              )}

              {tab === 'daily' && (
                <div className="border rounded-xl p-4">
                  <h4 className="font-semibold flex items-center gap-2"><Calendar className="w-4 h-4" />Daily Logs</h4>
                  <div className="mt-2 space-y-2 max-h-56 overflow-y-auto">
                    {selectedStudent.logs.map((l, idx) => (
                      <div key={`${l.date}-${idx}`} className="text-sm border rounded p-2">
                        <div className="font-medium">Date: {l.date}</div>
                        <div className="text-xs text-slate-700">Observation: Energy {l.energy}, Physical issue {l.physicalIssue}</div>
                        <div className="text-xs text-slate-700">Mood: {l.mood}</div>
                        <div className="text-xs text-slate-600">Notes: {l.notes || '-'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold mb-2">At Risk Students</h3>
        <div className="flex flex-wrap gap-2">
          {emotionalInsights.atRisk.map((s) => <span key={s.id} className={`text-xs px-2 py-1 rounded-full ${statusClass(s.metrics.status)}`}>{s.name} ({s.metrics.wellbeingScore})</span>)}
          {!emotionalInsights.atRisk.length && <span className="text-sm text-slate-500">No at-risk students.</span>}
        </div>
        <h3 className="font-semibold mt-4 mb-2">Frequent Issues</h3>
        <div className="flex flex-wrap gap-2">
          {emotionalInsights.frequentIssues.map(([k, c]) => <span key={k} className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">{k}: {c}</span>)}
          {!emotionalInsights.frequentIssues.length && <span className="text-sm text-slate-500">No frequent issues.</span>}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon }) => (
  <div className="border rounded-xl p-3 bg-slate-50">
    <div className="flex items-center gap-2 text-slate-600 text-xs">{icon}<span>{label}</span></div>
    <div className="text-xl font-semibold text-slate-900 mt-1">{value}</div>
  </div>
);

export default HealthUpdatesAdvanced;
