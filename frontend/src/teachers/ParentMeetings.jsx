import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, Video, Phone, Users, MapPin, Link,
  Plus, Trash2, X, AlertCircle, CheckCircle, ChevronRight,
  MessageSquare, BookOpen, User
} from 'lucide-react';
import axios from 'axios';
import { formatStudentDisplay } from '../utils/studentDisplay';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '') + '/api';

const EMPTY_FORM = {
  studentId: '', title: '', topic: '', description: '',
  meetingDate: '', meetingTime: '', meetingType: 'In Person',
  location: '', meetingLink: ''
};

const STATUS_CONFIG = {
  scheduled:  { label: 'Scheduled',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed:  { label: 'Confirmed',  cls: 'bg-green-50 text-green-700 border-green-200' },
  completed:  { label: 'Completed',  cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  cancelled:  { label: 'Cancelled',  cls: 'bg-red-50 text-red-600 border-red-200' },
};

const MEETING_TYPES = [
  { value: 'In Person', label: 'In Person', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  { value: 'Video Call', label: 'Video Call', icon: Video, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
  { value: 'Phone Call', label: 'Phone Call', icon: Phone, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
];

const inp = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-yellow-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-100 transition placeholder:text-slate-400';

const Field = ({ label, required, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const formatTime = (t) => { if (!t) return ''; const [h, m] = t.split(':'); const hr = +h; return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; };

const ParentMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchMeetings();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(''), 4000); return () => clearTimeout(t); }
  }, [success]);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/meeting/teacher/my-meetings`, { headers });
      setMeetings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/meeting/teacher/students`, { headers });
      setStudents(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { studentId, title, topic, meetingDate, meetingTime } = formData;
    if (!studentId || !title || !topic || !meetingDate || !meetingTime) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const parentRes = await axios.get(`${API_BASE_URL}/meeting/teacher/student/${studentId}/parent`, { headers });
      await axios.post(`${API_BASE_URL}/meeting/teacher/create`, { ...formData, parentId: parentRes.data._id }, { headers });
      setSuccess('Meeting scheduled! Parent has been notified.');
      setFormData(EMPTY_FORM);
      setShowForm(false);
      fetchMeetings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to schedule meeting');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (meetingId) => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/meeting/teacher/delete/${meetingId}`, { headers });
      setSuccess('Meeting deleted successfully.');
      setDeleteConfirmId(null);
      fetchMeetings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete meeting');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: meetings.length,
    scheduled: meetings.filter(m => m.status === 'scheduled').length,
    confirmed: meetings.filter(m => m.status === 'confirmed').length,
    completed: meetings.filter(m => m.status === 'completed').length,
  };

  const selectedType = MEETING_TYPES.find(t => t.value === formData.meetingType);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-linear-to-r from-yellow-400 via-amber-400 to-orange-400 px-6 py-8 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              Parent-Teacher Meetings
            </h1>
            <p className="text-yellow-100 text-sm mt-1">Schedule and manage parent-teacher meetings</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setError(''); }}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-white text-amber-700 rounded-xl text-sm font-semibold hover:bg-yellow-50 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-slate-700', bg: 'bg-white border-slate-200' },
            { label: 'Scheduled', value: stats.scheduled, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
            { label: 'Confirmed', value: stats.confirmed, color: 'text-green-700', bg: 'bg-green-50 border-green-100' },
            { label: 'Completed', value: stats.completed, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-100' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-2xl border p-4 shadow-sm ${bg}`}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Meetings List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              All Meetings
              {meetings.length > 0 && (
                <span className="ml-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">
                  {meetings.length}
                </span>
              )}
            </h2>
          </div>

          {loading && meetings.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Loading meetings…</p>
            </div>
          ) : meetings.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-slate-300" />
              </div>
              <p className="font-semibold text-slate-500 mb-1">No meetings yet</p>
              <p className="text-xs text-slate-400 mb-4">Schedule your first parent-teacher meeting</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule a meeting
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {meetings.map((meeting) => {
                const typeInfo = MEETING_TYPES.find(t => t.value === meeting.meetingType) || MEETING_TYPES[0];
                const TypeIcon = typeInfo.icon;
                const statusCfg = STATUS_CONFIG[meeting.status] || STATUS_CONFIG.scheduled;
                return (
                  <div key={meeting._id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors group">
                    <div className="flex items-start gap-4">
                      {/* Type icon */}
                      <div className={`shrink-0 mt-0.5 p-2.5 rounded-xl border ${typeInfo.bg}`}>
                        <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-slate-800 text-sm truncate">{meeting.title}</h3>
                              <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${statusCfg.cls}`}>
                                {statusCfg.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              <span className="font-medium text-slate-600">{meeting.topic}</span>
                            </p>
                          </div>
                          {/* Delete */}
                          {deleteConfirmId === meeting._id ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-xs text-slate-500">Delete?</span>
                              <button
                                onClick={() => handleDelete(meeting._id)}
                                className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg"
                              >Yes</button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg"
                              >No</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(meeting._id)}
                              className="shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {meeting.studentId?.name}
                            {meeting.studentId?.grade && ` · Class ${meeting.studentId.grade}`}
                            {meeting.studentId?.section && ` ${meeting.studentId.section}`}
                          </span>
                          {meeting.parentId?.name && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {meeting.parentId.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(meeting.meetingDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(meeting.meetingTime)}
                          </span>
                          {meeting.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {meeting.location}
                            </span>
                          )}
                          {meeting.meetingLink && (
                            <a
                              href={meeting.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-indigo-500 hover:text-indigo-700"
                            >
                              <Link className="w-3 h-3" />
                              Join
                            </a>
                          )}
                        </div>

                        {meeting.description && (
                          <p className="text-xs text-slate-400 mt-1.5 italic line-clamp-1">{meeting.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col border border-slate-100 z-10">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-sm shadow-amber-200">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">Schedule Meeting</h3>
                  <p className="text-xs text-slate-400">Notify parent instantly on save</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-3 py-2.5 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              )}

              <Field label="Student" required>
                <select value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} className={inp} required>
                  <option value="">Select a student…</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>{formatStudentDisplay(s)}</option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Meeting Title" required>
                  <input
                    type="text" value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={inp} placeholder="e.g., Academic Discussion" required
                  />
                </Field>
                <Field label="Topic" required>
                  <input
                    type="text" value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className={inp} placeholder="e.g., Student Progress" required
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Date" required>
                  <input type="date" value={formData.meetingDate} onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })} className={inp} required />
                </Field>
                <Field label="Time" required>
                  <input type="time" value={formData.meetingTime} onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })} className={inp} required />
                </Field>
              </div>

              {/* Meeting type selector */}
              <Field label="Meeting Type" required>
                <div className="grid grid-cols-3 gap-2">
                  {MEETING_TYPES.map(({ value, label, icon: Icon, color, bg }) => (
                    <button
                      key={value} type="button"
                      onClick={() => setFormData({ ...formData, meetingType: value, location: '', meetingLink: '' })}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                        formData.meetingType === value
                          ? `${bg} ${color} border-current shadow-sm`
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </Field>

              {formData.meetingType === 'In Person' && (
                <Field label="Location">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text" value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className={`${inp} pl-9`} placeholder="e.g., Teacher's Office, Room 12"
                    />
                  </div>
                </Field>
              )}

              {formData.meetingType === 'Video Call' && (
                <Field label="Meeting Link">
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="url" value={formData.meetingLink}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      className={`${inp} pl-9`} placeholder="https://meet.google.com/..."
                    />
                  </div>
                </Field>
              )}

              <Field label="Description">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`${inp} resize-none`} rows="3"
                  placeholder="Any additional details about the meeting agenda…"
                />
              </Field>

              {/* Footer buttons */}
              <div className="flex gap-3 pt-1 pb-2">
                <button
                  type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 shadow-md shadow-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Scheduling…' : 'Schedule Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentMeetings;
