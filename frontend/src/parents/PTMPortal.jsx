import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Video, Phone, Users, Bell, Check, X, ArrowLeftRight, MessageSquareMore, Star, ExternalLink, Copy } from 'lucide-react';

const PTMPortal = () => {
  const [activeTab, setActiveTab] = useState('meetings'); // meetings | requests | video | history
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '', reason: '' });
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, comment: '' });

  // Video meeting state (Jitsi embed)
  const [videoRoom, setVideoRoom] = useState('');
  const [jitsiActive, setJitsiActive] = useState(false);
  const jitsiUrl = useMemo(() => (videoRoom ? `https://meet.jit.si/${encodeURIComponent(videoRoom)}` : ''), [videoRoom]);
  const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

  const getMeetingId = (meeting) => meeting?._id || meeting?.id;
  const getTeacherName = (meeting) => meeting?.teacherId?.name || meeting?.teacherName || 'Teacher';
  const getMeetingSubject = (meeting) =>
    meeting?.topic ||
    meeting?.title ||
    (meeting?.studentId?.name ? `Discussion about ${meeting.studentId.name}` : 'Parent-Teacher Meeting');
  const getMeetingTypeLabel = (meeting) => meeting?.meetingType || meeting?.type || 'In Person';
  const getMeetingDate = (meeting) => meeting?.meetingDate || meeting?.date || '';
  const getMeetingTime = (meeting) => meeting?.meetingTime || meeting?.time || '';
  const getMeetingAgenda = (meeting) => meeting?.agenda || (meeting?.description ? [meeting.description] : null);
  const getStudentLabel = (meeting) => {
    if (!meeting?.studentId) return '';
    const { name, grade, section } = meeting.studentId;
    const gradeLabel = grade ? `Grade ${grade}${section ? ` - ${section}` : ''}` : '';
    if (name && gradeLabel) return `${name} • ${gradeLabel}`;
    return name || gradeLabel || '';
  };
  const normalizeStatus = (status) => String(status || 'scheduled').toLowerCase();
  const isPendingStatus = (status) => {
    const value = normalizeStatus(status);
    return value === 'scheduled' || value === 'pending';
  };
  const isConfirmedStatus = (status) => normalizeStatus(status) === 'confirmed';
  const isRescheduleStatus = (status) => normalizeStatus(status) === 'reschedule_requested';
  const isHistoryStatus = (status) => !isPendingStatus(status) && !isConfirmedStatus(status);

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');
      if (!token || userType !== 'Parent') {
        setMeetings([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/meeting/parent/my-meetings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Unable to load meetings');
      }

      const data = await response.json();
      setMeetings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Parent meetings fetch error:', err);
      setError(err.message || 'Failed to load meetings');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const upcomingMeetings = useMemo(
    () => meetings.filter((m) => isPendingStatus(m.status) || isConfirmedStatus(m.status)),
    [meetings]
  );
  const pendingRequests = useMemo(
    () => meetings.filter((m) => isPendingStatus(m.status) || isRescheduleStatus(m.status)),
    [meetings]
  );
  const historyMeetings = useMemo(
    () => meetings.filter((m) => isHistoryStatus(m.status)),
    [meetings]
  );

  const getMeetingTypeIcon = (type) => {
    switch (type) {
      case 'Video Call':
        return <Video className="w-4 h-4" />;
      case 'Phone Call':
        return <Phone className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const confirmMeeting = async (meetingId) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/meeting/parent/confirm/${meetingId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Unable to confirm meeting');
      }
      await fetchMeetings();
    } catch (err) {
      console.error('Confirm meeting error:', err);
      setError(err.message || 'Failed to confirm meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (meeting, response) => {
    if (response === 'accept') {
      confirmMeeting(meeting._id || meeting.id);
      return;
    }
    alert('Please contact the teacher to reschedule or decline this meeting.');
  };

  const handleRescheduleRequest = (meeting) => {
    setSelectedMeeting(meeting);
    setRescheduleForm({ date: '', time: '', reason: '' });
  };

  const submitReschedule = () => {
    if (!selectedMeeting) return;
    setMeetings(prev => prev.map(m => getMeetingId(m) === getMeetingId(selectedMeeting) ? { ...m, status: 'reschedule_requested', requested: { ...rescheduleForm } } : m));
    setSelectedMeeting(null);
  };

  const openFeedback = (meeting) => {
    setSelectedMeeting(meeting);
    setFeedbackForm({ rating: 0, comment: '' });
  };

  const submitFeedback = () => {
    if (!selectedMeeting) return;
    setMeetings(prev => prev.map(m => getMeetingId(m) === getMeetingId(selectedMeeting) ? { ...m, feedback: feedbackForm } : m));
    setSelectedMeeting(null);
  };

  const copyToClipboard = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Parent-Teacher Meetings</h1>
        <p className="text-yellow-100">View and respond to meeting requests</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'meetings', label: 'Meetings' },
          { key: 'requests', label: 'Requests' },
          { key: 'video', label: 'Video Meeting' },
          { key: 'history', label: 'History' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-3 py-1.5 rounded-lg text-sm border ${activeTab === t.key ? 'bg-yellow-500 text-black border-yellow-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Meetings */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'meetings' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Upcoming Meetings</h2>
            </div>
            <div className="p-4 space-y-4">
              {loading && upcomingMeetings.length === 0 && (
                <div className="py-6 text-center text-gray-500">Loading meetings...</div>
              )}
              {!loading && upcomingMeetings.length === 0 && (
                <div className="py-6 text-center text-gray-500">No meetings scheduled yet.</div>
              )}
              {upcomingMeetings.map((meeting) => {
                  const meetingId = getMeetingId(meeting);
                  const pending = isPendingStatus(meeting.status);
                  const confirmed = isConfirmedStatus(meeting.status);
                  const agendaItems = getMeetingAgenda(meeting);
                  const meetingType = getMeetingTypeLabel(meeting);
                  const meetingDateLabel = getMeetingDate(meeting);
                  const meetingTimeLabel = getMeetingTime(meeting);
                  const teacherName = getTeacherName(meeting);
                  const subjectLabel = getMeetingSubject(meeting);
                  const studentLabel = getStudentLabel(meeting);

                  return (
                    <div
                      key={meetingId || subjectLabel}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-yellow-500 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-800">
                              Meeting with {teacherName}
                            </h3>
                            {pending && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{subjectLabel}</p>
                          {studentLabel && (
                            <p className="text-xs text-gray-400">{studentLabel}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{meetingDateLabel || 'TBA'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{meetingTimeLabel || 'TBA'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {getMeetingTypeIcon(meetingType)}
                              <span>{meetingType}</span>
                            </div>
                          </div>
                          {agendaItems?.length ? (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Agenda:</span> {agendaItems.join(', ')}
                            </div>
                          ) : null}
                        </div>

                        {pending && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleResponse(meeting, 'accept')}
                              className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleResponse(meeting, 'decline')}
                              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {confirmed && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Confirmed
                            </span>
                            <button onClick={() => handleRescheduleRequest(meeting)} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              <ArrowLeftRight className="w-3.5 h-3.5" /> Reschedule
                            </button>
                            <button onClick={() => openFeedback(meeting)} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
                              <Star className="w-3.5 h-3.5" /> Feedback
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          )}

          {activeTab === 'requests' && (
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Pending Requests</h2>
              </div>
              <div className="p-4 space-y-4">
                {pendingRequests.length === 0 && (
                  <p className="text-sm text-gray-500">No pending requests.</p>
                )}
                {pendingRequests.map((m) => {
                    const meetingId = getMeetingId(m);
                    const meetingType = getMeetingTypeLabel(m);
                    const meetingDateLabel = getMeetingDate(m);
                    const meetingTimeLabel = getMeetingTime(m);
                    const subjectLabel = getMeetingSubject(m);
                    const teacherName = getTeacherName(m);
                    return (
                      <div key={meetingId || subjectLabel} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">{teacherName} • {subjectLabel}</p>
                            <p className="text-sm text-gray-600">
                              {meetingDateLabel || 'TBA'} at {meetingTimeLabel || 'TBA'} • {meetingType}
                            </p>
                            {m.requested && (
                              <p className="text-xs text-blue-700 mt-1">
                                Reschedule requested: {m.requested.date} at {m.requested.time} — {m.requested.reason}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleResponse(m, 'accept')} className="px-3 py-1 rounded-lg bg-green-600 text-white text-sm">Accept</button>
                            <button onClick={() => handleResponse(m, 'decline')} className="px-3 py-1 rounded-lg bg-red-600 text-white text-sm">Decline</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Video Meeting</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input placeholder="Enter or generate room name" value={videoRoom} onChange={(e)=>setVideoRoom(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 md:col-span-2" />
                <div className="flex gap-2">
                  <button onClick={()=>{ setVideoRoom(`PTM-${Math.random().toString(36).slice(2,8).toUpperCase()}`); setJitsiActive(false); }} className="px-3 py-2 rounded-lg border border-gray-300">Generate</button>
                  <button onClick={()=>setJitsiActive(true)} disabled={!videoRoom} className={`px-3 py-2 rounded-lg ${videoRoom? 'bg-yellow-500 text-black hover:bg-yellow-600' : 'bg-gray-100 text-gray-400'}`}>Start</button>
                </div>
              </div>
              {videoRoom && (
                <div className="flex items-center gap-2 mb-3">
                  <button onClick={()=>window.open(jitsiUrl, '_blank')} className="text-sm inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300">
                    <ExternalLink className="w-4 h-4"/> Open in new tab
                  </button>
                  <button onClick={()=>copyToClipboard(jitsiUrl)} className="text-sm inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300">
                    <Copy className="w-4 h-4"/> Copy link
                  </button>
                </div>
              )}
              <div className="rounded-lg overflow-hidden border border-gray-200">
                {jitsiActive && videoRoom ? (
                  <iframe title="PTM Video Meeting" src={`${jitsiUrl}#config.prejoinConfig.enabled=true`} className="w-full h-[480px]" allow="camera; microphone; fullscreen; display-capture" />
                ) : (
                  <div className="h-[240px] flex items-center justify-center text-gray-500 text-sm">
                    Enter a room name and click Start to join.
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">Video meetings are powered by Jitsi Meet. By starting, you agree to Jitsi’s terms of service.</p>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Past Meetings</h2>
              </div>
              <div className="p-4 space-y-3">
                {historyMeetings.length === 0 && (
                  <p className="text-sm text-gray-500">No past meetings recorded.</p>
                )}
                {historyMeetings.map((m) => {
                  const meetingId = getMeetingId(m);
                  const meetingDateLabel = getMeetingDate(m);
                  const meetingTimeLabel = getMeetingTime(m);
                  const subjectLabel = getMeetingSubject(m);
                  const statusLabel = normalizeStatus(m.status).replace(/_/g, ' ');
                  return (
                    <div key={meetingId || subjectLabel} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{getTeacherName(m)} • {subjectLabel}</p>
                          <p className="text-sm text-gray-600">{meetingDateLabel || 'TBA'} at {meetingTimeLabel || 'TBA'}</p>
                          {m.feedback && (
                            <p className="text-xs text-yellow-700">Your rating: {m.feedback.rating}/5 — {m.feedback.comment}</p>
                          )}
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">{statusLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications & Calendar */}
        <div className="space-y-6">
          {/* Recent Notifications */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {meetings.slice(0, 5).map((meeting) => {
                  const meetingId = getMeetingId(meeting);
                  const pending = isPendingStatus(meeting.status);
                  const meetingDateLabel = getMeetingDate(meeting);
                  const meetingTimeLabel = getMeetingTime(meeting);
                  return (
                    <div
                      key={meetingId || meetingDateLabel}
                      className={`flex items-start space-x-3 p-3 rounded-lg ${
                        pending ? 'bg-yellow-50' : 'bg-gray-50'
                      }`}
                    >
                      <Bell className={`w-5 h-5 ${
                        pending ? 'text-yellow-500' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className="text-sm text-gray-800">
                          {pending ? 'New meeting scheduled' : 'Meeting update'} from {getTeacherName(meeting)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {meetingDateLabel || 'Date TBA'} {meetingTimeLabel ? `• ${meetingTimeLabel}` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {meetings.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No notifications yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Upcoming</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {upcomingMeetings.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {pendingRequests.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {selectedMeeting && rescheduleForm && activeTab !== 'video' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setSelectedMeeting(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-xl shadow-xl border p-5">
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><ArrowLeftRight className="w-5 h-5"/> Request Reschedule</h3>
              <p className="text-sm text-gray-600">{getTeacherName(selectedMeeting)} • {getMeetingSubject(selectedMeeting)}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-sm text-gray-700">New Date</label>
                <input type="date" value={rescheduleForm.date} onChange={e=>setRescheduleForm({...rescheduleForm, date:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2"/>
              </div>
              <div>
                <label className="text-sm text-gray-700">New Time</label>
                <input type="time" value={rescheduleForm.time} onChange={e=>setRescheduleForm({...rescheduleForm, time:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2"/>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-700">Reason</label>
                <textarea rows={3} value={rescheduleForm.reason} onChange={e=>setRescheduleForm({...rescheduleForm, reason:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Brief reason for rescheduling"/>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setSelectedMeeting(null)} className="px-3 py-2 rounded-lg border border-gray-300">Cancel</button>
              <button onClick={submitReschedule} className="px-3 py-2 rounded-lg bg-blue-600 text-white">Submit Request</button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {selectedMeeting && feedbackForm && activeTab !== 'video' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setSelectedMeeting(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-xl shadow-xl border p-5">
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Star className="w-5 h-5"/> Meeting Feedback</h3>
              <p className="text-sm text-gray-600">{getTeacherName(selectedMeeting)} • {getMeetingSubject(selectedMeeting)}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Rating:</span>
                {[1,2,3,4,5].map(r => (
                  <button key={r} onClick={()=>setFeedbackForm({...feedbackForm, rating: r})} className={`p-1 rounded ${feedbackForm.rating >= r ? 'text-yellow-500' : 'text-gray-300'}`}>
                    <Star className="w-5 h-5 fill-current"/>
                  </button>
                ))}
              </div>
              <div>
                <label className="text-sm text-gray-700">Comments</label>
                <textarea rows={3} value={feedbackForm.comment} onChange={e=>setFeedbackForm({...feedbackForm, comment:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Share your feedback"/>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setSelectedMeeting(null)} className="px-3 py-2 rounded-lg border border-gray-300">Cancel</button>
              <button onClick={submitFeedback} className="px-3 py-2 rounded-lg bg-yellow-500 text-black">Submit Feedback</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PTMPortal; 
