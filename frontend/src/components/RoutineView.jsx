import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, MapPin, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { timetableApi } from '../admin/utils/timetableApi';

const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayLabels = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

const RoutineView = () => {
  const [schedule, setSchedule] = useState({});
  const [selectedDay, setSelectedDay] = useState(dayOrder[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState('');
  const userType = typeof window !== 'undefined' ? window.localStorage.getItem('userType') : null;
  const isAdmin = (userType || '').toLowerCase() === 'admin';

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');

        if (!token || userType !== 'Student') {
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/student/auth/schedule`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Unable to load routine.');
        }

        const data = await response.json();
        const normalized = normalizeSchedule(data.schedule);
        setSchedule(normalized);
        const firstAvailableDay = dayOrder.find(day => normalized[day]?.length) || dayOrder[0];
        setSelectedDay(firstAvailableDay);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Failed to fetch schedule:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const handleAutoGenerate = async () => {
    if (!isAdmin) {
      setGenerateMessage('Admin access required to auto-generate routines.');
      return;
    }
    const ok = window.confirm('Auto-generate routines for all classes? This overwrites existing timetables.');
    if (!ok) return;

    try {
      setGenerating(true);
      setGenerateMessage('');
      const result = await timetableApi.autoGenerate({ overwriteExisting: true });
      const total = result?.totalGenerated || 0;
      const failed = result?.totalErrors || 0;
      const firstError = result?.errors?.[0];
      const errorLabel = firstError
        ? ` First error: ${firstError.className || firstError.classId}${firstError.sectionName ? `-${firstError.sectionName}` : ''} — ${firstError.error}`
        : '';
      setGenerateMessage(`Generated ${total} timetable${total !== 1 ? 's' : ''}.${failed ? ` ${failed} failed.` : ''}${errorLabel}`);
    } catch (err) {
      setGenerateMessage(err.message || 'Auto-generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const daySessions = schedule[selectedDay] || [];
  const totalSessions = useMemo(
    () => dayOrder.reduce((sum, day) => sum + (schedule[day]?.length || 0), 0),
    [schedule]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-purple-50 p-4 sm:p-6 space-y-4">
        <div className="h-32 bg-white rounded-2xl shadow animate-pulse" />
        <div className="h-48 bg-white rounded-2xl shadow animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-purple-50 p-4 sm:p-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-yellow-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-amber-500" />
              <h1 className="text-2xl font-bold text-gray-900">Weekly Routine</h1>
            </div>
            <p className="text-gray-500 text-sm">Synced with your timetable from the school portal</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={handleAutoGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:-translate-y-0.5 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Sparkles size={14} />
                {generating ? 'Generating...' : 'Auto Generate (Admin)'}
              </button>
              <a
                href="/admin/routines"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:-translate-y-0.5 hover:bg-gray-50"
              >
                Customize / Edit
              </a>
            </div>
            {generateMessage && (
              <div className="mt-3 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                {generateMessage}
              </div>
            )}
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Total sessions this week: <span className="font-semibold text-gray-900">{totalSessions}</span></p>
            {lastUpdated && <p>Updated {lastUpdated.toLocaleDateString()}</p>}
          </div>
        </div>
        {error && (
          <div className="mt-4 flex items-center text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            <AlertCircle size={16} className="mr-2" />
            {error}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex flex-wrap gap-2 mb-6">
          {dayOrder.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedDay === day
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {dayLabels[day]}
              {schedule[day]?.length ? (
                <span className="ml-2 text-xs text-purple-100 bg-purple-500 rounded-full px-2 py-0.5">
                  {schedule[day].length}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {daySessions.length > 0 ? (
          <div className="space-y-4">
            {daySessions.map((session, index) => (
              <div
                key={session.id || `${selectedDay}-${index}`}
                className="p-4 border border-purple-100 rounded-2xl bg-gradient-to-r from-white to-purple-50 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <p className="text-xs uppercase font-medium text-purple-500">{session.type || 'Session'}</p>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpen size={16} className="text-purple-500" />
                    {session.course || session.subject || session.title || 'Class'}
                  </h3>
                  {session.instructor && (
                    <p className="text-sm text-gray-500">By {session.instructor}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock size={16} className="text-purple-500" />
                    <span>
                      {session.time ||
                        `${session.startTime || '--'}${session.endTime ? ` - ${session.endTime}` : ''}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={16} className="text-purple-500" />
                    <span>{session.room || session.location || 'TBD'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No classes scheduled for {dayLabels[selectedDay]}. Enjoy your day!
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Week At a Glance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dayOrder.map((day) => (
            <div key={`overview-${day}`} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <p className="text-sm font-semibold text-gray-800">{dayLabels[day]}</p>
              <p className="text-xs text-gray-500 mb-2">{schedule[day]?.length || 0} sessions</p>
              <ul className="space-y-2">
                {(schedule[day] || []).slice(0, 3).map((session, idx) => (
                  <li key={`${day}-session-${idx}`} className="text-sm text-gray-600 flex justify-between">
                    <span className="truncate mr-2">{session.course || session.subject || 'Class'}</span>
                    <span className="text-xs text-gray-400">
                      {session.time || session.startTime || ''}
                    </span>
                  </li>
                ))}
                {(schedule[day]?.length || 0) > 3 && (
                  <li className="text-xs text-gray-400">+{schedule[day].length - 3} more</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const normalizeSchedule = (rawSchedule) => {
  if (!rawSchedule) return {};

  // Support both array of sessions and object keyed by day
  if (Array.isArray(rawSchedule)) {
    return rawSchedule.reduce((acc, session) => {
      const day = normalizeDay(session.day || session.weekday || session.dayOfWeek);
      if (!day) return acc;
      acc[day] = acc[day] || [];
      acc[day].push(session);
      return acc;
    }, {});
  }

  if (typeof rawSchedule === 'object') {
    return Object.entries(rawSchedule).reduce((acc, [day, sessions]) => {
      const dayKey = normalizeDay(day);
      if (!dayKey) return acc;
      acc[dayKey] = Array.isArray(sessions) ? sessions : [];
      return acc;
    }, {});
  }

  return {};
};

const normalizeDay = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  if (dayOrder.includes(normalized)) return normalized;
  return null;
};

export default RoutineView;
