import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Clock, Eye, User } from 'lucide-react';
import { formatStudentDisplay } from '../utils/studentDisplay';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const POSITIVE_OPTIONS = ['Excellent', 'Good', 'Average', 'Needs Support'];
const SCORE_OPTIONS = ['High', 'Medium', 'Low'];
const CONCERN_OPTIONS = ['None', 'Mild', 'Moderate', 'High'];
const LIFE_OPTIONS = ['Healthy', 'Mostly Healthy', 'Inconsistent', 'Needs Attention'];
const field = (label, options) => ({ label, options });

const SECTIONS = [
  { title: '1. Behavior at Home', fields: [field('Obedience level', POSITIVE_OPTIONS), field('Respect towards elders', POSITIVE_OPTIONS), field('Listening habits', POSITIVE_OPTIONS), field('Following instructions', POSITIVE_OPTIONS), field('Discipline at home', POSITIVE_OPTIONS)] },
  { title: '2. Communication', fields: [field('Talks openly with parents', POSITIVE_OPTIONS), field('Expresses feelings clearly', POSITIVE_OPTIONS), field('Confidence in speaking', POSITIVE_OPTIONS), field('Shares daily experiences', POSITIVE_OPTIONS), field('Listening skills', POSITIVE_OPTIONS)] },
  { title: '3. Emotional Behavior', fields: [field('Mood stability', POSITIVE_OPTIONS), field('Anger control', POSITIVE_OPTIONS), field('Sensitivity level', SCORE_OPTIONS), field('Stress or anxiety signs', CONCERN_OPTIONS), field('Happiness level', SCORE_OPTIONS)] },
  { title: '4. Social Behavior', fields: [field('Interaction with siblings', POSITIVE_OPTIONS), field('Behavior with relatives', POSITIVE_OPTIONS), field('Making friends outside school', POSITIVE_OPTIONS), field('Sharing and caring nature', POSITIVE_OPTIONS), field('Conflict handling', POSITIVE_OPTIONS)] },
  { title: '5. Responsibility & Habits', fields: [field('Completes daily tasks', POSITIVE_OPTIONS), field('Helps in household work', POSITIVE_OPTIONS), field('Time management', POSITIVE_OPTIONS), field('Follows routine', POSITIVE_OPTIONS), field('Screen time control', POSITIVE_OPTIONS)] },
  { title: '6. Lifestyle & Daily Routine', fields: [field('Sleep pattern', LIFE_OPTIONS), field('Eating habits', LIFE_OPTIONS), field('Mobile/TV usage', LIFE_OPTIONS), field('Outdoor activity', LIFE_OPTIONS), field('Physical activity level', LIFE_OPTIONS)] },
  { title: '7. Interests & Hobbies', fields: [field('Hobbies (sports, music, drawing, etc.)', POSITIVE_OPTIONS), field('Creativity at home', POSITIVE_OPTIONS), field('Learning new things', POSITIVE_OPTIONS), field('Passion areas', POSITIVE_OPTIONS)] },
  { title: '8. Personality Traits', fields: [field('Confidence', POSITIVE_OPTIONS), field('Independence', POSITIVE_OPTIONS), field('Honesty', POSITIVE_OPTIONS), field('Patience', POSITIVE_OPTIONS), field('Adaptability', POSITIVE_OPTIONS)] },
  { title: '9. Concerns (If Any)', fields: [field('Behavioral issues', CONCERN_OPTIONS), field('Addiction (mobile, games, etc.)', CONCERN_OPTIONS), field('Fear or anxiety', CONCERN_OPTIONS), field('Sudden changes in behavior', CONCERN_OPTIONS)] },
];

const REMARK_FIELDS = ['General observation', 'Strengths of the child', 'Areas needing improvement', 'Expectations from school'];

const buildRatings = () => {
  const out = {};
  SECTIONS.forEach((section) => section.fields.forEach((f) => { out[f.label] = ''; }));
  return out;
};

const buildRemarks = () => {
  const out = {};
  REMARK_FIELDS.forEach((f) => { out[f] = ''; });
  return out;
};

const getEmoji = (option) => {
  const value = String(option || '').toLowerCase();
  if (value.includes('excellent') || value.includes('healthy') || value === 'high') return '😀';
  if (value.includes('good') || value.includes('mostly') || value === 'medium') return '🙂';
  if (value.includes('average') || value.includes('inconsistent') || value.includes('mild')) return '😐';
  if (value.includes('low') || value.includes('needs') || value.includes('moderate')) return '😟';
  if (value.includes('none')) return '✅';
  return '🙂';
};

const concernBadge = (level) =>
  level === 'high' ? 'text-red-600 bg-red-100' : level === 'medium' ? 'text-yellow-600 bg-yellow-100' : 'text-green-600 bg-green-100';

const parseSortNumber = (value) => {
  const text = String(value ?? '').trim();
  if (!text) return Number.POSITIVE_INFINITY;
  const n = Number(text);
  if (Number.isFinite(n)) return n;
  const m = text.match(/\d+/);
  return m ? Number(m[0]) : Number.POSITIVE_INFINITY;
};

const ParentObservationNonAcademic = () => {
  const [children, setChildren] = useState([]);
  const [sessionOptions, setSessionOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [ratings, setRatings] = useState(buildRatings);
  const [remarks, setRemarks] = useState(buildRemarks);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        if (!token || userType !== 'Parent') throw new Error('Please login as a parent to manage observations.');

        const [childrenRes, observationsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/attendance/parent/children`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/observations/parent`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const childrenPayload = await childrenRes.json().catch(() => ({}));
        const observationsPayload = await observationsRes.json().catch(() => ({}));
        if (!childrenRes.ok) throw new Error(childrenPayload?.error || 'Unable to load children');
        if (!observationsRes.ok) throw new Error(observationsPayload?.error || 'Unable to load observations');

        const childOptions = (childrenPayload.children || []).map((entry) => ({
          id: entry.student?._id || entry.studentId,
          name: entry.student?.name || 'Student',
          roll: entry.student?.roll || entry.student?.rollNo || entry.student?.rollNumber,
          session: entry.student?.session || '',
          className: entry.student?.grade || '',
          section: entry.student?.section || entry.student?.sectionName || '',
        }));
        const sessionSet = new Set(childOptions.map((c) => String(c.session || '').trim()).filter(Boolean));
        const classSet = new Set(childOptions.map((c) => String(c.className || '').trim()).filter(Boolean));
        const sectionSet = new Set(childOptions.map((c) => String(c.section || '').trim()).filter(Boolean));
        setSessionOptions([...sessionSet].sort((a, b) => b.localeCompare(a, undefined, { numeric: true })));
        setClassOptions([...classSet].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })));
        setSectionOptions([...sectionSet].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })));
        setChildren(childOptions);
        setStudentId((prev) => prev || childOptions[0]?.id || '');
        setObservations(Array.isArray(observationsPayload.parentEntries) ? observationsPayload.parentEntries : []);
      } catch (err) {
        console.error('Parent observation load error:', err);
        setError(err.message || 'Unable to load data');
        setChildren([]);
        setObservations([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const selectedCount = useMemo(() => Object.values(ratings).filter(Boolean).length, [ratings]);
  const recentObservations = useMemo(() => observations.slice(0, 10), [observations]);
  const filteredChildren = useMemo(() => {
    return children
      .filter((child) => {
        if (selectedSession && String(child.session || '') !== selectedSession) return false;
        if (selectedClass && String(child.className || '') !== selectedClass) return false;
        if (selectedSection && String(child.section || '') !== selectedSection) return false;
        return true;
      })
      .sort((a, b) => {
        const rollA = parseSortNumber(a.roll);
        const rollB = parseSortNumber(b.roll);
        if (rollA !== rollB) return rollA - rollB;
        return String(a.name || '').localeCompare(String(b.name || ''), undefined, { numeric: true });
      });
  }, [children, selectedSession, selectedClass, selectedSection]);

  useEffect(() => {
    if (!filteredChildren.length) {
      setStudentId('');
      return;
    }
    const exists = filteredChildren.some((child) => String(child.id) === String(studentId));
    if (!exists) {
      setStudentId(String(filteredChildren[0].id));
    }
  }, [filteredChildren, studentId]);

  const concernLevel = useMemo(() => {
    const values = ['Behavioral issues', 'Addiction (mobile, games, etc.)', 'Fear or anxiety', 'Sudden changes in behavior']
      .map((k) => String(ratings[k] || '').toLowerCase());
    if (values.some((v) => v === 'high')) return 'high';
    if (values.some((v) => v === 'moderate')) return 'medium';
    return 'low';
  }, [ratings]);

  const moodRating = useMemo(() => {
    const h = String(ratings['Happiness level'] || '').toLowerCase();
    if (h === 'high') return 5;
    if (h === 'medium') return 3;
    if (h === 'low') return 2;
    return null;
  }, [ratings]);

  const isValid = useMemo(() => {
    const hasRatings = Object.values(ratings).some(Boolean);
    const hasRemarks = Object.values(remarks).some((v) => String(v || '').trim());
    return Boolean(studentId && (hasRatings || hasRemarks));
  }, [studentId, ratings, remarks]);

  const onDropValue = (fieldLabel, options, dropped) => {
    if (!options.includes(dropped)) return;
    setRatings((prev) => ({ ...prev, [fieldLabel]: dropped }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      setSubmitting(true);
      setError('');
      const token = localStorage.getItem('token');
      const selectedLines = [];
      SECTIONS.forEach((section) => section.fields.forEach((f) => {
        if (ratings[f.label]) selectedLines.push(`${f.label}: ${ratings[f.label]}`);
      }));
      const remarkLines = REMARK_FIELDS.map((f) => `${f}: ${remarks[f] || '-'}`);

      const res = await fetch(`${API_BASE_URL}/api/observations/parent`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          category: 'Parent Observation (Non-Academic)',
          observation: selectedLines.slice(0, 25).join(' | '),
          observationText: selectedLines.slice(0, 25).join(' | '),
          behaviorNotes: remarkLines.join('\n'),
          concernLevel,
          moodRating,
          date,
        }),
      });
      const saved = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(saved?.error || 'Unable to submit observation');

      setObservations((prev) => [saved, ...prev]);
      setRatings(buildRatings());
      setRemarks(buildRemarks());
      setDate(new Date().toISOString().split('T')[0]);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);
    } catch (err) {
      console.error('Parent observation submit error:', err);
      setError(err.message || 'Unable to save observation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6">
      <div className="w-full px-3 sm:px-3 md:px-4 lg:px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-full"><Eye className="w-6 h-6 text-blue-600" /></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Parent Observation (Non-Academic)</h1>
              <p className="text-gray-600">Emoji style input with click + drag-and-drop.</p>
            </div>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm mt-4">{error}</div>}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200"><h2 className="text-xl font-semibold text-gray-900">New Observation</h2></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                  <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Years</option>
                    {sessionOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Classes</option>
                    {classOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                  <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Sections</option>
                    {sectionOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Child</label>
                  <p className="text-xs text-gray-500 pt-2">Choose from filtered list below.</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Children (Filtered)</h3>
                {loading ? (
                  <p className="text-sm text-gray-500">Loading children...</p>
                ) : filteredChildren.length === 0 ? (
                  <p className="text-sm text-gray-500">No children found for selected filters.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filteredChildren.map((child) => (
                      <label
                        key={child.id}
                        className={`flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer ${String(studentId) === String(child.id) ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}
                      >
                        <input
                          type="radio"
                          name="selectedChild"
                          value={child.id}
                          checked={String(studentId) === String(child.id)}
                          onChange={(e) => setStudentId(e.target.value)}
                          className="h-4 w-4 text-blue-600"
                          required
                        />
                        <span className="text-sm text-gray-800">{formatStudentDisplay({ name: child.name, studentId: child.id, roll: child.roll, section: child.section })}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600">
                Selected fields: <span className="font-semibold text-gray-900">{selectedCount}</span> | Concern level:
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${concernBadge(concernLevel)}`}>{concernLevel.toUpperCase()}</span>
              </p>

              {SECTIONS.map((section) => (
                <div key={section.title} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">{section.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {section.fields.map((f) => (
                      <label key={f.label} className="block">
                        <span className="block text-xs font-medium text-gray-700 mb-1">{f.label}</span>
                        <div className="w-full p-2 border border-gray-300 rounded-lg bg-white" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onDropValue(f.label, f.options, e.dataTransfer.getData('text/plain')); }}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500">{ratings[f.label] ? `Selected: ${ratings[f.label]}` : 'Click or drag emoji option'}</p>
                            {ratings[f.label] && <button type="button" className="text-xs text-red-600 hover:text-red-700" onClick={() => setRatings((prev) => ({ ...prev, [f.label]: '' }))}>Clear</button>}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {f.options.map((opt) => {
                              const active = ratings[f.label] === opt;
                              return (
                                <button key={opt} type="button" draggable={!submitting} onDragStart={(e) => e.dataTransfer.setData('text/plain', opt)} onClick={() => setRatings((prev) => ({ ...prev, [f.label]: opt }))} className={`inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs border transition ${active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                                  <span className="text-sm">{getEmoji(opt)}</span><span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">10. Parent Remarks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {REMARK_FIELDS.map((f) => (
                    <label key={f} className="block">
                      <span className="block text-xs font-medium text-gray-700 mb-1">{f}</span>
                      <textarea rows={3} value={remarks[f]} onChange={(e) => setRemarks((prev) => ({ ...prev, [f]: e.target.value }))} className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={!isValid || submitting} className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${isValid ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                {submitting ? 'Submitting...' : 'Record Observation'}
              </button>
              {submitted && <div className="mt-3 flex items-center text-sm text-green-600 gap-2"><CheckCircle className="w-4 h-4" />Observation submitted successfully.</div>}
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200"><h2 className="text-xl font-semibold text-gray-900">Recent Observations</h2></div>
            <div className="p-6">
              {recentObservations.length === 0 ? <div className="text-center text-sm text-gray-500">No observations recorded yet.</div> : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {recentObservations.map((obs) => (
                    <div key={obs.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{formatStudentDisplay({ studentName: obs.studentName, studentId: obs.studentId, roll: obs.roll || obs.rollNo || obs.rollNumber, section: obs.section })}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${concernBadge(obs.concernLevel || 'low')}`}>{(obs.concernLevel || 'low').toUpperCase()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500"><Clock className="w-4 h-4" /><span>{obs.recordedAt ? new Date(obs.recordedAt).toLocaleDateString() : obs.date}</span></div>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{obs.observationText || obs.observation || ''}</p>
                      {obs.behaviorNotes && <div className="text-xs text-gray-500 whitespace-pre-line">Notes: {obs.behaviorNotes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentObservationNonAcademic;
