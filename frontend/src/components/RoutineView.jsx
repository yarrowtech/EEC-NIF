import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, MapPin, BookOpen, AlertCircle } from 'lucide-react';
import { useStudentDashboard } from './StudentDashboardContext';

const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayLabels = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const normalizeDay = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  return dayOrder.includes(normalized) ? normalized : null;
};

const normalizeSchedule = (rawSchedule) => {
  if (!rawSchedule) return {};

  if (Array.isArray(rawSchedule)) {
    const reduced = rawSchedule.reduce((acc, session) => {
      const day = normalizeDay(session.day || session.weekday || session.dayOfWeek);
      if (!day) return acc;
      acc[day] = acc[day] || [];
      acc[day].push(session);
      return acc;
    }, {});
    return addBreaksToSchedule(reduced);
  }

  if (typeof rawSchedule === 'object') {
    const reduced = Object.entries(rawSchedule).reduce((acc, [day, sessions]) => {
      const dayKey = normalizeDay(day);
      if (!dayKey) return acc;
      acc[dayKey] = Array.isArray(sessions) ? sessions : [];
      return acc;
    }, {});
    return addBreaksToSchedule(reduced);
  }

  return {};
};

const pickId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value._id || value.id || null;
  return null;
};

const hasScheduleEntries = (normalizedSchedule) =>
  dayOrder.some((day) => (normalizedSchedule?.[day] || []).length > 0);

const parseTimeToMinutes = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  const timeMatch = raw.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/);
  if (!timeMatch) return null;
  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const meridiem = timeMatch[3]?.toLowerCase();
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (meridiem) {
    if (meridiem === 'pm' && hours !== 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;
  }
  return hours * 60 + minutes;
};

const resolveTimeRange = (entry) => {
  const start = entry?.startTime || entry?.time?.split('-')?.[0]?.trim() || '';
  const end = entry?.endTime || entry?.time?.split('-')?.[1]?.trim() || '';
  return { start, end };
};

const addBreaksToSchedule = (schedule) => {
  const next = {};
  dayOrder.forEach((day) => {
    const sessions = Array.isArray(schedule?.[day]) ? [...schedule[day]] : [];
    const withTimes = sessions
      .map((entry) => {
        const range = resolveTimeRange(entry);
        const startMin = parseTimeToMinutes(range.start);
        const endMin = parseTimeToMinutes(range.end);
        return { entry, startMin, endMin, range };
      })
      .filter((item) => item.startMin !== null && item.endMin !== null)
      .sort((a, b) => a.startMin - b.startMin);

    if (withTimes.length === 0) {
      next[day] = sessions;
      return;
    }

    const result = [];
    for (let i = 0; i < withTimes.length; i += 1) {
      const current = withTimes[i];
      result.push(current.entry);
      const nextItem = withTimes[i + 1];
      if (!nextItem) continue;
      if (current.endMin < nextItem.startMin) {
        result.push({
          day,
          startTime: current.range.end,
          endTime: nextItem.range.start,
          time: `${current.range.end} - ${nextItem.range.start}`,
          subject: 'Break',
          instructor: '-',
          room: '',
          isBreak: true,
        });
      }
    }
    next[day] = result;
  });
  return next;
};

const normalizeTimetablePayload = (payload) => {
  const timetables = [];

  if (Array.isArray(payload)) {
    timetables.push(...payload);
  } else if (Array.isArray(payload?.timetables)) {
    timetables.push(...payload.timetables);
  } else if (payload?.timetable) {
    timetables.push(payload.timetable);
  } else if (Array.isArray(payload?.entries)) {
    timetables.push({ entries: payload.entries });
  }

  const sessions = timetables.flatMap((timetable) =>
    (timetable?.entries || []).map((entry) => ({
      day: entry.dayOfWeek || entry.day || entry.weekday,
      startTime: entry.startTime,
      endTime: entry.endTime,
      time:
        entry.time ||
        (entry.startTime
          ? `${entry.startTime}${entry.endTime ? ` - ${entry.endTime}` : ''}`
          : undefined),
      subject:
        entry.subjectId?.name ||
        entry.subject?.name ||
        entry.subjectName ||
        entry.subject ||
        'Class',
      instructor:
        entry.teacherId?.name ||
        entry.teacher?.name ||
        entry.teacherName ||
        entry.instructor,
      room: entry.room || entry.location || 'TBD',
      className: timetable?.classId?.name || entry.className || entry.class,
      sectionName: timetable?.sectionId?.name || entry.sectionName || entry.section,
    }))
  );

  return normalizeSchedule(sessions);
};

const normalizeValue = (value) => String(value || '').trim().toLowerCase();

const getEntryValues = (entry, keys) =>
  keys
    .map((key) => entry?.[key])
    .filter(Boolean)
    .map((value) => normalizeValue(value));

const isBreakSession = (session) =>
  session?.isBreak ||
  String(session?.subject || session?.course || session?.title || '').trim().toLowerCase() === 'break';

const matchesCredential = (entryValues, credentialValues) => {
  if (!credentialValues.length) return true;
  if (!entryValues.length) return true;
  return entryValues.some((entryValue) =>
    credentialValues.some(
      (credentialValue) =>
        entryValue === credentialValue ||
        entryValue.includes(credentialValue) ||
        credentialValue.includes(entryValue)
    )
  );
};

const RoutineView = () => {
  const { profile } = useStudentDashboard();
  const [schedule, setSchedule] = useState({});
  const [selectedDay, setSelectedDay] = useState(dayOrder[0]);
  const [viewMode, setViewMode] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        if (!token || userType !== 'Student') {
          setError('Only students can view this routine.');
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const tryFetchSchedule = async (url) => {
          const response = await fetch(url, { headers });
          if (!response.ok) return null;
          const data = await response.json().catch(() => null);
          if (!data) return null;
          const normalized = normalizeSchedule(data.schedule || data.routine || data.data?.schedule);
          return hasScheduleEntries(normalized) ? normalized : null;
        };

        let normalized =
          (await tryFetchSchedule(`${import.meta.env.VITE_API_URL}/api/student/auth/schedule`)) ||
          (await tryFetchSchedule(`${import.meta.env.VITE_API_URL}/api/student/dashboard/routine`)) ||
          (await tryFetchSchedule(`${import.meta.env.VITE_API_URL}/api/student/routine`));

        if (!normalized) {
          const classId = pickId(profile?.classId || profile?.class || profile?.currentClass);
          const sectionId = pickId(profile?.sectionId || profile?.section || profile?.currentSection);

          if (classId) {
            const params = new URLSearchParams({ classId });
            if (sectionId) params.append('sectionId', sectionId);

            const timetableResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/api/timetable?${params.toString()}`,
              { headers }
            );

            if (timetableResponse.ok) {
              const timetableData = await timetableResponse.json().catch(() => null);
              normalized = normalizeTimetablePayload(timetableData);
            }
          }
        }

        if (!normalized) {
          setSchedule({});
          setLastUpdated(new Date());
          setError('No routine has been assigned yet for your class/section.');
          return;
        }

        setSchedule(normalized);
        setLastUpdated(new Date());
      } catch (err) {
        setError(err.message || 'Failed to load routine');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [profile]);

  const studentClassValues = useMemo(
    () =>
      [profile?.className, profile?.grade]
        .filter(Boolean)
        .map((value) => normalizeValue(value)),
    [profile]
  );

  const studentSectionValues = useMemo(
    () =>
      [profile?.sectionName, profile?.section]
        .filter(Boolean)
        .map((value) => normalizeValue(value)),
    [profile]
  );

  const filteredSchedule = useMemo(() => {
    return dayOrder.reduce((acc, day) => {
      const entries = schedule[day] || [];
      acc[day] = entries.filter((entry) => {
        const entryClassValues = getEntryValues(entry, ['className', 'class', 'grade', 'standard']);
        const entrySectionValues = getEntryValues(entry, ['sectionName', 'section', 'division']);
        const classMatch = matchesCredential(entryClassValues, studentClassValues);
        const sectionMatch = matchesCredential(entrySectionValues, studentSectionValues);
        return classMatch && sectionMatch;
      });
      return acc;
    }, {});
  }, [schedule, studentClassValues, studentSectionValues]);

  const weeklySlots = useMemo(() => {
    const slotMap = new Map();
    dayOrder.forEach((day) => {
      (filteredSchedule[day] || []).forEach((session, index) => {
        const timeLabel =
          session.time ||
          (session.startTime
            ? `${session.startTime}${session.endTime ? ` - ${session.endTime}` : ''}`
            : `Period ${session.period || index + 1}`);
        const periodOrder = Number(session.period || 999);
        const startLabel = String(timeLabel).split('-')[0]?.trim();
        const timeOrder = parseTimeToMinutes(startLabel);
        if (!slotMap.has(timeLabel)) {
          slotMap.set(timeLabel, { timeLabel, periodOrder, timeOrder });
        } else {
          const prev = slotMap.get(timeLabel);
          if (periodOrder < prev.periodOrder) {
            slotMap.set(timeLabel, { timeLabel, periodOrder, timeOrder });
          }
        }
      });
    });
    return Array.from(slotMap.values()).sort((a, b) =>
      (a.timeOrder ?? a.periodOrder) === (b.timeOrder ?? b.periodOrder)
        ? a.timeLabel.localeCompare(b.timeLabel)
        : (a.timeOrder ?? a.periodOrder) - (b.timeOrder ?? b.periodOrder)
    );
  }, [filteredSchedule]);

  const weeklyMatrix = useMemo(() => {
    const matrix = {};
    dayOrder.forEach((day) => {
      matrix[day] = {};
      (filteredSchedule[day] || []).forEach((session, index) => {
        const timeLabel =
          session.time ||
          (session.startTime
            ? `${session.startTime}${session.endTime ? ` - ${session.endTime}` : ''}`
            : `Period ${session.period || index + 1}`);
        matrix[day][timeLabel] = session;
      });
    });
    return matrix;
  }, [filteredSchedule]);

  useEffect(() => {
    const firstAvailableDay = dayOrder.find((day) => filteredSchedule[day]?.length) || dayOrder[0];
    setSelectedDay(firstAvailableDay);
  }, [filteredSchedule]);

  const daySessions = filteredSchedule[selectedDay] || [];
  const totalSessions = useMemo(
    () => dayOrder.reduce((sum, day) => sum + (filteredSchedule[day]?.length || 0), 0),
    [filteredSchedule]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 space-y-4">
        <div className="h-28 bg-white rounded-2xl shadow-sm animate-pulse" />
        <div className="h-52 bg-white rounded-2xl shadow-sm animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-indigo-600" />
              <h1 className="text-2xl font-bold text-slate-900">Daily Routine</h1>
            </div>
            <p className="text-slate-500 text-sm">
              Student view only
              {(profile?.className || profile?.grade) &&
                ` | Class ${profile?.className || profile?.grade}`}
              {(profile?.sectionName || profile?.section) &&
                ` | Section ${profile?.sectionName || profile?.section}`}
            </p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>
              Total sessions this week: <span className="font-semibold text-slate-900">{totalSessions}</span>
            </p>
            {lastUpdated && <p>Updated {lastUpdated.toLocaleDateString()}</p>}
          </div>
        </div>
        {error && (
          <div className="mt-4 flex items-center text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle size={16} className="mr-2" />
            {error}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                viewMode === 'daily' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                viewMode === 'weekly' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Weekly
            </button>
          </div>
          <p className="text-xs text-slate-500">Switch between daily and weekly routine</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {dayOrder.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedDay === day ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dayLabels[day]}
              {filteredSchedule[day]?.length ? (
                <span className="ml-2 text-xs text-indigo-100 bg-indigo-500 rounded-full px-2 py-0.5">
                  {filteredSchedule[day].length}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {totalSessions === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-lg font-semibold text-slate-800">No routine assigned yet</p>
            <p className="text-sm text-slate-500 mt-2">
              Please ask your school admin to assign timetable for your class and section.
            </p>
          </div>
        ) : viewMode === 'weekly' ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-[900px] w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left text-sm font-semibold text-slate-700 px-4 py-3 border-b border-slate-200">
                    Time
                  </th>
                  {dayOrder.map((day) => (
                    <th
                      key={`head-${day}`}
                      className="text-left text-sm font-semibold text-slate-700 px-4 py-3 border-b border-slate-200"
                    >
                      {dayLabels[day]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeklySlots.map((slot) => (
                  <tr key={`row-${slot.timeLabel}`} className="align-top">
                    <td className="px-4 py-3 text-sm font-medium text-slate-700 border-b border-slate-100 bg-slate-50">
                      {slot.timeLabel}
                    </td>
                    {dayOrder.map((day) => {
                      const session = weeklyMatrix[day]?.[slot.timeLabel];
                      return (
                        <td key={`cell-${day}-${slot.timeLabel}`} className="px-3 py-3 border-b border-slate-100">
                          {session ? (
                            <div
                              className={`rounded-lg border px-3 py-2 ${
                                isBreakSession(session)
                                  ? 'border-amber-200 bg-amber-50'
                                  : 'border-indigo-100 bg-indigo-50'
                              }`}
                            >
                              <p className="text-sm font-semibold text-slate-900">
                                {session.course || session.subject || session.title || 'Class'}
                              </p>
                              {!isBreakSession(session) && (
                                <p className="text-xs text-slate-600 mt-1">
                                  {session.instructor || session.teacher || 'TBA'}
                                  {(session.room || session.location) ? ` | ${session.room || session.location}` : ''}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-400 text-center">
                              --
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : daySessions.length > 0 ? (
          <div className="space-y-4">
            {daySessions.map((session, index) => (
              <div
                key={session.id || `${selectedDay}-${index}`}
                className="p-4 border border-indigo-100 rounded-2xl bg-gradient-to-r from-white to-indigo-50 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <p className="text-xs uppercase font-medium text-indigo-600">
                    {session.type || `Period ${session.period || index + 1}`}
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <BookOpen size={16} className="text-indigo-600" />
                    {session.course || session.subject || session.title || 'Class'}
                  </h3>
                  {!isBreakSession(session) && (session.instructor || session.teacher) && (
                    <p className="text-sm text-slate-500">By {session.instructor || session.teacher}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Clock size={16} className="text-indigo-600" />
                    <span>{session.time || `${session.startTime || '--'}${session.endTime ? ` - ${session.endTime}` : ''}`}</span>
                  </div>
                  {!isBreakSession(session) && (
                    <div className="flex items-center gap-1">
                      <MapPin size={16} className="text-indigo-600" />
                      <span>{session.room || session.location || 'TBD'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
            No classes scheduled for {dayLabels[selectedDay]}. Please select another day.
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutineView;
