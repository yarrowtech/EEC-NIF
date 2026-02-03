import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, MapPin, BookOpen, AlertCircle, Users, School } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_LOOKUP = DAYS.reduce((acc, day) => {
  acc[day.toLowerCase()] = day;
  return acc;
}, {});

const to12Hour = (value) => {
  if (!value) return '';
  const [hh, mm] = String(value).split(':');
  const hours = Number(hh);
  if (Number.isNaN(hours)) return value;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${mm || '00'} ${suffix}`;
};

const formatSlot = (entry) => {
  if (entry.startTime && entry.endTime) {
    return `${to12Hour(entry.startTime)} - ${to12Hour(entry.endTime)}`;
  }
  if (entry.startTime) return to12Hour(entry.startTime);
  return entry.period ? `Period ${entry.period}` : 'TBD';
};

const normalizeDayLabel = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  return DAY_LOOKUP[normalized] || null;
};

const normalizeSchedule = (rawSchedule) => {
  const base = DAYS.reduce((acc, day) => {
    acc[day] = [];
    return acc;
  }, {});

  if (!rawSchedule || typeof rawSchedule !== 'object') {
    return base;
  }

  Object.entries(rawSchedule).forEach(([day, entries]) => {
    const dayKey = normalizeDayLabel(day);
    if (!dayKey) return;
    base[dayKey] = Array.isArray(entries) ? entries : [];
  });

  return base;
};

const normalizeValue = (value) => String(value || '').trim().toLowerCase();

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [value];
};

const getCredentialValues = (teacherProfile, keys) =>
  keys
    .flatMap((key) => toArray(teacherProfile?.[key]))
    .filter(Boolean)
    .map((value) => normalizeValue(value));

const getCredentialDisplayValues = (teacherProfile, keys) =>
  Array.from(
    new Set(
      keys
        .flatMap((key) => toArray(teacherProfile?.[key]))
        .filter(Boolean)
        .map((value) => String(value).trim())
    )
  );

const getEntryValues = (entry, keys) =>
  keys
    .map((key) => entry?.[key])
    .filter(Boolean)
    .flatMap((value) => toArray(value))
    .map((value) => normalizeValue(value));

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

const toScopeLabel = (scope) => {
  if (scope === 'campus') return 'Campus matched';
  if (scope === 'school-fallback') return 'School fallback';
  if (scope === 'dashboard-fallback') return 'Dashboard fallback';
  return 'School matched';
};

const ClassRoutine = () => {
  const [schedule, setSchedule] = useState({});
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [routineMeta, setRoutineMeta] = useState({ campusScoped: true, timetableCount: 0, filterSource: 'campus' });
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [viewMode, setViewMode] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRoutine = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');
      if (!token || (userType !== 'Teacher' && userType !== 'teacher')) {
        setError('Only teachers can view this routine.');
        return;
      }

      const routineResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/teacher/dashboard/routine`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (routineResponse.ok) {
        const data = await routineResponse.json().catch(() => ({}));
        setSchedule(normalizeSchedule(data.schedule));
        setRoutineMeta({
          campusScoped: Boolean(data?.meta?.campusScoped),
          timetableCount: Number(data?.meta?.timetableCount || 0),
          filterSource: data?.meta?.filterSource || (data?.meta?.campusScoped ? 'campus' : 'school'),
        });
        if (data.teacher) {
          setTeacherProfile(data.teacher);
        }
      } else {
        const dashboardResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/teacher/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!dashboardResponse.ok) {
          const data = await dashboardResponse.json().catch(() => ({}));
          throw new Error(data.error || 'Unable to load teacher routine.');
        }

        const dashboardData = await dashboardResponse.json().catch(() => ({}));
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const fallbackSchedule = normalizeSchedule({
          [today]: (dashboardData?.upcomingClasses || []).map((item, index) => ({
            subject: item.subject || 'Subject',
            className: item.class || '',
            sectionName: '',
            classLabel: item.class || '',
            room: item.room || 'TBA',
            startTime: item.time || '',
            endTime: '',
            period: index + 1,
          })),
        });
        setSchedule(fallbackSchedule);
        setRoutineMeta({
          campusScoped: true,
          timetableCount: Number((dashboardData?.upcomingClasses || []).length > 0 ? 1 : 0),
          filterSource: 'dashboard-fallback',
        });
        setTeacherProfile(dashboardData?.teacher || null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load routine');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoutine();
  }, [loadRoutine]);

  const teacherClassValues = useMemo(
    () =>
      getCredentialValues(teacherProfile, [
        'className',
        'class',
        'grade',
        'standard',
        'assignedClass',
        'assignedClasses',
        'assignedClassLabels',
        'classes',
      ]),
    [teacherProfile]
  );
  const teacherClassLabels = useMemo(
    () =>
      getCredentialDisplayValues(teacherProfile, [
        'className',
        'class',
        'grade',
        'standard',
        'assignedClass',
        'assignedClasses',
        'assignedClassLabels',
        'classes',
      ]),
    [teacherProfile]
  );

  const teacherSectionValues = useMemo(
    () =>
      getCredentialValues(teacherProfile, [
        'sectionName',
        'section',
        'division',
        'assignedSection',
        'assignedSections',
        'sections',
      ]),
    [teacherProfile]
  );
  const teacherSectionLabels = useMemo(
    () =>
      getCredentialDisplayValues(teacherProfile, [
        'sectionName',
        'section',
        'division',
        'assignedSection',
        'assignedSections',
        'sections',
      ]),
    [teacherProfile]
  );

  const filteredSchedule = useMemo(
    () =>
      DAYS.reduce((acc, day) => {
        const entries = schedule[day] || [];
        acc[day] = entries.filter((entry) => {
          const entryClassValues = getEntryValues(entry, ['className', 'class', 'grade', 'standard', 'classLabel']);
          const entrySectionValues = getEntryValues(entry, ['sectionName', 'section', 'division', 'classLabel']);
          const classMatch = matchesCredential(entryClassValues, teacherClassValues);
          const sectionMatch = matchesCredential(entrySectionValues, teacherSectionValues);
          return classMatch && sectionMatch;
        });
        return acc;
      }, {}),
    [schedule, teacherClassValues, teacherSectionValues]
  );

  const filteredTotalClasses = useMemo(
    () => DAYS.reduce((sum, day) => sum + ((filteredSchedule[day] || []).length), 0),
    [filteredSchedule]
  );

  const effectiveSchedule = useMemo(() => {
    // If strict class/section filter removes everything, fallback to teacher-scoped schedule.
    if (filteredTotalClasses > 0) return filteredSchedule;
    return schedule;
  }, [filteredSchedule, schedule, filteredTotalClasses]);

  useEffect(() => {
    const firstAvailableDay = DAYS.find((day) => (effectiveSchedule[day] || []).length > 0);
    if (firstAvailableDay) {
      setSelectedDay(firstAvailableDay);
    }
  }, [effectiveSchedule]);

  const totalClasses = useMemo(
    () => DAYS.reduce((sum, day) => sum + ((effectiveSchedule[day] || []).length), 0),
    [effectiveSchedule]
  );
  const todayClasses = effectiveSchedule[selectedDay] || [];
  const weeklySlots = useMemo(() => {
    const slotMap = new Map();
    DAYS.forEach((day) => {
      (effectiveSchedule[day] || []).forEach((entry, index) => {
        const slot = formatSlot(entry) || `Period ${entry.period || index + 1}`;
        const order = Number(entry.period || 999);
        if (!slotMap.has(slot)) {
          slotMap.set(slot, { slot, order });
        } else if (order < slotMap.get(slot).order) {
          slotMap.set(slot, { slot, order });
        }
      });
    });
    return Array.from(slotMap.values()).sort((a, b) =>
      a.order === b.order ? a.slot.localeCompare(b.slot) : a.order - b.order
    );
  }, [effectiveSchedule]);
  const weeklyMatrix = useMemo(() => {
    const matrix = {};
    DAYS.forEach((day) => {
      matrix[day] = {};
      (effectiveSchedule[day] || []).forEach((entry, index) => {
        const slot = formatSlot(entry) || `Period ${entry.period || index + 1}`;
        matrix[day][slot] = entry;
      });
    });
    return matrix;
  }, [effectiveSchedule]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 space-y-4">
        <div className="h-24 bg-white rounded-xl shadow animate-pulse" />
        <div className="h-16 bg-white rounded-xl shadow animate-pulse" />
        <div className="h-64 bg-white rounded-xl shadow animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 mb-6 text-white shadow-md">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-2">Class Routine</h1>
            <p className="text-indigo-100">
              Teacher view only
              {teacherClassLabels.length ? ` | Class ${teacherClassLabels.join(', ')}` : ''}
              {teacherSectionLabels.length ? ` | Section ${teacherSectionLabels.join(', ')}` : ''}
            </p>
            {(teacherProfile?.subject || teacherProfile?.department) ? (
              <p className="text-indigo-50 text-sm mt-1">
                {teacherProfile?.subject || 'Subject not set'}
                {teacherProfile?.department ? ` | ${teacherProfile.department}` : ''}
              </p>
            ) : null}
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-indigo-50">
            <School size={15} />
            <span>
              Campus: {teacherProfile?.campusName || 'N/A'}
              {teacherProfile?.campusType ? ` (${teacherProfile.campusType})` : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Weekly Classes</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalClasses}</h3>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">{selectedDay} Classes</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{todayClasses.length}</h3>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Timetable Source</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            {routineMeta.campusScoped ? 'Campus' : 'School'}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {toScopeLabel(routineMeta.filterSource)} | Matched timetables: {routineMeta.timetableCount}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                viewMode === 'daily' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Daily View
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                viewMode === 'weekly' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Weekly Sheet
            </button>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-500">Use Weekly Sheet for full timetable layout</p>
            <button
              onClick={loadRoutine}
              className="text-xs font-medium text-indigo-700 hover:text-indigo-800"
            >
              Reload
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDay === day ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {day}
              {effectiveSchedule[day]?.length ? (
                <span className="ml-2 text-xs rounded-full bg-indigo-500 text-white px-2 py-0.5">
                  {effectiveSchedule[day].length}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {viewMode === 'weekly' ? 'Weekly Class Routine' : `${selectedDay} Schedule`}
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {totalClasses === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                No classes assigned yet for this teacher.
              </div>
            ) : viewMode === 'weekly' ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[920px] border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b">Time</th>
                      {DAYS.map((day) => (
                        <th key={`head-${day}`} className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeklySlots.map((slot) => (
                      <tr key={`slot-${slot.slot}`} className="align-top">
                        <td className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 border-b">{slot.slot}</td>
                        {DAYS.map((day) => {
                          const entry = weeklyMatrix[day]?.[slot.slot];
                          return (
                            <td key={`cell-${day}-${slot.slot}`} className="px-3 py-3 border-b">
                              {entry ? (
                                <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2">
                                  <p className="text-sm font-semibold text-gray-900">{entry.subject || 'Subject'}</p>
                                  <p className="text-xs text-gray-600 mt-1">{entry.classLabel || entry.className || 'Class'}</p>
                                  <p className="text-xs text-gray-500 mt-1">{entry.room || 'TBA'}</p>
                                </div>
                              ) : (
                                <div className="rounded-lg border border-dashed border-gray-200 px-3 py-2 text-center text-xs text-gray-400">
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
            ) : todayClasses.length > 0 ? (
              todayClasses.map((entry, index) => (
                <div key={`${selectedDay}-${index}`} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-indigo-600" />
                        {entry.subject}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{entry.classLabel}</p>
                    </div>
                    <div className="text-sm text-gray-600 flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-4 w-4 text-indigo-600" />
                        {formatSlot(entry)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-indigo-600" />
                        {entry.room || 'TBA'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-4 w-4 text-indigo-600" />
                        {entry.className}{entry.sectionName ? ` - ${entry.sectionName}` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                No classes scheduled for {selectedDay}.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassRoutine;
