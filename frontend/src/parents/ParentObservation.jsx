import React, { useEffect, useMemo, useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  Eye, 
  User, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ChevronRight,
  ClipboardList,
  Smile,
  ShieldAlert,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatStudentDisplay } from '../utils/studentDisplay';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ParentObservation = () => {
  const [formData, setFormData] = useState({
    q1: null, q2: null, q3: null, q4: null, q5: null,
    q6: null, q7: null, q8: null, q9: null, q10: null
  });

  const [submitting, setSubmitting] = useState(false);
  const [teacherObservations, setTeacherObservations] = useState([]);
  const [teacherStats, setTeacherStats] = useState(null);
  const [teacherChildren, setTeacherChildren] = useState([]);
  const [teacherLoading, setTeacherLoading] = useState(true);
  const [teacherError, setTeacherError] = useState('');

  const questions = [
    { id: 'q1', text: 'Irritable, sad, or emotionally flat behavior?' },
    { id: 'q2', text: 'Withdrawn from family activities?' },
    { id: 'q3', text: 'Changes in sleep pattern or quality?' },
    { id: 'q4', text: 'Interest in hobbies or friendships?' },
    { id: 'q5', text: 'Overall energy level at home?' },
    { id: 'q6', text: 'Worry about school or friendships?' },
    { id: 'q7', text: 'Easily frustrated by small problems?' },
    { id: 'q8', text: 'Physical issues (headaches, fatigue)?' },
    { id: 'q9', text: 'Communication about schoolwork?' },
    { id: 'q10', text: 'Negative or critical self-comments?' }
  ];

  const emojiOptions = [
    { emoji: '😊', label: 'Very Good', value: 0, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { emoji: '🙂', label: 'Okay', value: 1, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { emoji: '😐', label: 'Neutral', value: 2, color: 'text-slate-600 bg-slate-50 border-slate-100' },
    { emoji: '😕', label: 'Worried', value: 3, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { emoji: '😟', label: 'Concerned', value: 4, color: 'text-rose-600 bg-rose-50 border-rose-100' }
  ];

  const handleEmojiClick = (questionId, value) => {
    setFormData(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormComplete()) {
      toast.error('Please answer all questions');
      return;
    }

    setSubmitting(true);
    try {
      // In a real scenario, we'd send this to /api/observations/parent
      // For now, simulating success as this component also focuses on viewing teacher notes
      await new Promise(r => setTimeout(r, 1000));
      toast.success('Behavior observation submitted successfully');
      setFormData({
        q1: null, q2: null, q3: null, q4: null, q5: null,
        q6: null, q7: null, q8: null, q9: null, q10: null
      });
    } catch (err) {
      toast.error('Failed to submit observation');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormComplete = () => Object.values(formData).every(value => value !== null);

  useEffect(() => {
    const fetchTeacherObservations = async () => {
      setTeacherLoading(true);
      setTeacherError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/observations/parent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Unable to load observations');
        
        setTeacherObservations(Array.isArray(data.observations) ? data.observations : []);
        setTeacherStats(data.stats || null);
        setTeacherChildren(Array.isArray(data.children) ? data.children : []);
      } catch (err) {
        setTeacherError(err.message);
      } finally {
        setTeacherLoading(false);
      }
    };
    fetchTeacherObservations();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm group transition-all hover:shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Eye size={14} />
              <span>Institutional Insights</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Teacher Observations</h1>
            <p className="text-slate-600 max-w-2xl text-sm sm:text-base leading-relaxed">
              Review professional wellbeing notes recorded by teachers and provide your own feedback on your child's behavior at home.
            </p>
          </div>
        </div>
      </header>

      {/* Stats Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { 
            label: 'Total Observations', 
            value: teacherStats?.total ?? '0', 
            icon: ClipboardList, 
            color: 'bg-blue-50 text-blue-600',
            trend: 'Teacher recorded notes'
          },
          { 
            label: 'Urgent Alerts', 
            value: teacherStats?.urgent ?? '0', 
            icon: ShieldAlert, 
            color: teacherStats?.urgent > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400',
            trend: 'Immediate attention'
          },
          { 
            label: 'Required Follow-ups', 
            value: teacherStats?.followUps ?? '0', 
            icon: AlertTriangle, 
            color: teacherStats?.followUps > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400',
            trend: 'Action items'
          },
          { 
            label: 'Last Sync', 
            value: teacherStats?.lastUpdated ? formatDate(teacherStats.lastUpdated) : '—', 
            icon: Clock, 
            color: 'bg-emerald-50 text-emerald-600',
            trend: 'Data freshness'
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h2 className="text-2xl font-bold text-slate-900">{stat.value}</h2>
              <p className="text-[10px] font-medium text-slate-500 mt-2">{stat.trend}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Side: Teacher Notes & Child Roster */}
        <div className="lg:col-span-7 space-y-8">
          {/* Child Roster */}
          <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                  <TrendingUp size={16} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Observation Summary by Child</h2>
              </div>
            </div>
            <div className="p-6">
              {teacherLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-300" /></div>
              ) : teacherChildren.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-sm italic">No entries available.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {teacherChildren.map((child) => (
                    <div key={child.studentId} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{child.studentName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Grade {child.grade} {child.section}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">{child.totalEntries}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Notes</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Recent Teacher Notes */}
          <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                  <Search size={16} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Recent Professional Logs</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {teacherLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-300" /></div>
              ) : teacherObservations.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ClipboardList size={48} className="mx-auto mb-3 opacity-10" />
                  <p className="text-sm font-medium">No professional logs recorded yet.</p>
                </div>
              ) : (
                teacherObservations.slice(0, 5).map((item) => (
                  <div key={item.id} className="group border border-slate-100 rounded-2xl p-5 hover:bg-slate-50 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-10 rounded-full ${
                          item.urgencyLevel === 'urgent' ? 'bg-rose-500' : 
                          item.urgencyLevel === 'high' ? 'bg-amber-500' : 'bg-slate-200'
                        }`} />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.studentName}</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <Calendar size={10} />
                            <span>{formatDate(item.recordedAt)}</span>
                            <span>•</span>
                            <span>{item.teacher?.name || 'Class Teacher'}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        item.urgencyLevel === 'urgent' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        item.urgencyLevel === 'high' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {item.urgencyLevel}
                      </span>
                    </div>
                    {item.additionalNotes && (
                      <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-slate-100 pl-4 py-1">
                        "{item.additionalNotes}"
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-100 rounded-full shadow-sm text-[10px] font-bold text-slate-500">
                        <Activity size={12} className="text-blue-500" />
                        HEALTH: {item.healthScore ?? 'N/A'}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-100 rounded-full shadow-sm text-[10px] font-bold text-slate-500">
                        <Smile size={12} className="text-emerald-500" />
                        EMOTION: {item.emotionScore ?? 'N/A'}
                      </div>
                      {item.followUpRequired && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full shadow-sm text-[10px] font-bold text-rose-600 animate-pulse">
                          <AlertTriangle size={12} />
                          FOLLOW-UP REQUIRED
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Side: Behavior Form */}
        <div className="lg:col-span-5">
          <section className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden sticky top-8 transition-all hover:shadow-2xl">
            <div className="bg-slate-900 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Smile size={24} className="text-blue-400" />
                <h2 className="text-xl font-bold">Home Check-in</h2>
              </div>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                Provide quick feedback on your child's emotional state at home to help us align our support strategies.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {questions.map((q, idx) => (
                  <div key={q.id} className="space-y-3 pb-6 border-b border-slate-50 last:border-0">
                    <label className="block text-sm font-bold text-slate-700">
                      {idx + 1}. {q.text}
                    </label>
                    <div className="flex justify-between gap-2">
                      {emojiOptions.map((opt) => {
                        const active = formData[q.id] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleEmojiClick(q.id, opt.value)}
                            title={opt.label}
                            className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl border transition-all active:scale-95 ${
                              active ? 'bg-slate-900 border-slate-900 shadow-lg -translate-y-1' : 'bg-slate-50 border-slate-100 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                            }`}
                          >
                            <span className="text-xl mb-1">{opt.emoji}</span>
                            <span className={`text-[8px] font-black uppercase tracking-tighter ${active ? 'text-white' : 'text-slate-400'}`}>
                              {opt.label.split(' ')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!isFormComplete() || submitting}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3 ${
                    isFormComplete()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 active:scale-[0.98]'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
                  }`}
                >
                  {submitting ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle2 size={24} />}
                  <span>{submitting ? 'Submitting...' : 'Submit Observation'}</span>
                </button>
                {!isFormComplete() && (
                  <p className="text-[10px] text-center text-slate-400 mt-3 font-bold uppercase tracking-widest">Answer all 10 questions to enable submission</p>
                )}
              </div>
            </form>
          </section>
        </div>
      </div>

      <footer className="text-center pb-8 border-t border-slate-100 pt-8">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
          Electronic Educare • Holistic Student Wellbeing Monitor
        </p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default ParentObservation;
