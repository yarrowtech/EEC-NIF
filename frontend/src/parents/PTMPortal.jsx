import React, { useMemo, useState } from 'react';
import { Calendar, Clock, Video, Phone, Users, Bell, Check, X, ArrowLeftRight, MessageSquareMore, Star, ExternalLink, Copy } from 'lucide-react';

const PTMPortal = () => {
  const [activeTab, setActiveTab] = useState('meetings'); // meetings | requests | video | history
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetings, setMeetings] = useState([
    {
      id: 1,
      teacherName: "Ms. Johnson",
      subject: "Mathematics",
      date: "2025-09-12",
      time: "10:00 AM",
      type: "Video Call",
      status: "pending",
      topic: "Academic Progress Discussion",
      agenda: ["Homework completion", "Exam preparation"],
      notification: {
        read: false,
        timestamp: "2025-09-01T10:30:00"
      }
    },
    {
      id: 2,
      teacherName: "Mr. Smith",
      subject: "Science",
      date: "2025-09-15",
      time: "2:30 PM",
      type: "In Person",
      status: "confirmed",
      topic: "Project Discussion",
      agenda: ["Project timeline", "Lab safety"],
      notification: {
        read: true,
        timestamp: "2025-09-02T15:45:00"
      }
    }
  ]);

  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '', reason: '' });
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, comment: '' });

  // Video meeting state (Jitsi embed)
  const [videoRoom, setVideoRoom] = useState('');
  const [jitsiActive, setJitsiActive] = useState(false);
  const jitsiUrl = useMemo(() => (videoRoom ? `https://meet.jit.si/${encodeURIComponent(videoRoom)}` : ''), [videoRoom]);

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

  const handleResponse = (meetingId, response) => {
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, status: response === 'accept' ? 'confirmed' : 'declined' } : m));
  };

  const handleRescheduleRequest = (meeting) => {
    setSelectedMeeting(meeting);
    setRescheduleForm({ date: '', time: '', reason: '' });
  };

  const submitReschedule = () => {
    if (!selectedMeeting) return;
    setMeetings(prev => prev.map(m => m.id === selectedMeeting.id ? { ...m, status: 'reschedule_requested', requested: { ...rescheduleForm } } : m));
    setSelectedMeeting(null);
  };

  const openFeedback = (meeting) => {
    setSelectedMeeting(meeting);
    setFeedbackForm({ rating: 0, comment: '' });
  };

  const submitFeedback = () => {
    if (!selectedMeeting) return;
    setMeetings(prev => prev.map(m => m.id === selectedMeeting.id ? { ...m, feedback: feedbackForm } : m));
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
              {meetings.filter(m => m.status === 'pending' || m.status === 'confirmed').map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-yellow-500 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-800">
                          Meeting with {meeting.teacherName}
                        </h3>
                        {!meeting.notification.read && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{meeting.subject}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{meeting.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{meeting.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getMeetingTypeIcon(meeting.type)}
                          <span>{meeting.type}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Topic: {meeting.topic}
                      </p>
                      {meeting.agenda?.length ? (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Agenda:</span> {meeting.agenda.join(', ')}
                        </div>
                      ) : null}
                    </div>

                    {meeting.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleResponse(meeting.id, 'accept')}
                          className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResponse(meeting.id, 'decline')}
                          className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {meeting.status === 'confirmed' && (
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
              ))}
            </div>
          </div>
          )}

          {activeTab === 'requests' && (
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Pending Requests</h2>
              </div>
              <div className="p-4 space-y-4">
                {meetings.filter(m => m.status === 'pending' || m.status === 'reschedule_requested').map((m) => (
                  <div key={m.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{m.teacherName} • {m.subject}</p>
                        <p className="text-sm text-gray-600">{m.date} at {m.time} • {m.type}</p>
                        {m.requested && (
                          <p className="text-xs text-blue-700 mt-1">Reschedule requested: {m.requested.date} at {m.requested.time} — {m.requested.reason}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleResponse(m.id, 'accept')} className="px-3 py-1 rounded-lg bg-green-600 text-white text-sm">Accept</button>
                        <button onClick={() => handleResponse(m.id, 'decline')} className="px-3 py-1 rounded-lg bg-red-600 text-white text-sm">Decline</button>
                      </div>
                    </div>
                  </div>
                ))}
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
                {meetings.filter(m => m.status === 'declined' || m.status === 'completed').map((m) => (
                  <div key={m.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{m.teacherName} • {m.subject}</p>
                        <p className="text-sm text-gray-600">{m.date} at {m.time}</p>
                        {m.feedback && (
                          <p className="text-xs text-yellow-700">Your rating: {m.feedback.rating}/5 — {m.feedback.comment}</p>
                        )}
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">{m.status}</span>
                    </div>
                  </div>
                ))}
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
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg ${
                      !meeting.notification.read ? 'bg-yellow-50' : 'bg-gray-50'
                    }`}
                  >
                    <Bell className={`w-5 h-5 ${
                      !meeting.notification.read ? 'text-yellow-500' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="text-sm text-gray-800">
                        New meeting request from {meeting.teacherName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(meeting.notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
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
                  {meetings.filter(m => m.status === 'confirmed').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {meetings.filter(m => m.status === 'pending').length}
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
              <p className="text-sm text-gray-600">{selectedMeeting.teacherName} • {selectedMeeting.subject}</p>
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
              <p className="text-sm text-gray-600">{selectedMeeting.teacherName} • {selectedMeeting.subject}</p>
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
