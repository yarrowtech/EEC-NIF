import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, MapPin, BookOpen, AlertCircle, Users } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

const ClassRoutine = () => {
  const [schedule, setSchedule] = useState({});
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRoutine = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        if (!token || userType !== 'Teacher') {
          setError('Only teachers can view this routine.');
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/teacher/dashboard/routine`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Unable to load teacher routine.');
        }

        const data = await response.json();
        setSchedule(data.schedule || {});
        if (data.teacher) {
          setTeacherProfile(data.teacher);
        }

        try {
          const profileResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/teacher/dashboard`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setTeacherProfile((prev) => prev || profileData?.teacher || null);
          }
        } catch (profileError) {
          console.error('Unable to load teacher credentials for routine filtering', profileError);
        }
      } catch (err) {
        setError(err.message || 'Failed to load routine');
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, []);

  const teacherClassValues = useMemo(
    () =>
      getCredentialValues(teacherProfile, [
        'className',
        'class',
        'grade',
        'standard',
        'assignedClass',
        'assignedClasses',
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

  const totalClasses = useMemo(
    () => DAYS.reduce((sum, day) => sum + ((filteredSchedule[day] || []).length), 0),
    [filteredSchedule]
  );
  const todayClasses = filteredSchedule[selectedDay] || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 space-y-4">
        <div className="h-28 bg-white rounded-xl shadow animate-pulse" />
        <div className="h-40 bg-white rounded-xl shadow animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 mb-6 text-white shadow-md">
        <h1 className="text-3xl font-bold mb-2">Class Routine</h1>
        <p className="text-indigo-100">
          Teacher view only
          {teacherClassLabels.length ? ` | Class ${teacherClassLabels.join(', ')}` : ''}
          {teacherSectionLabels.length ? ` | Section ${teacherSectionLabels.join(', ')}` : ''}
        </p>
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
          <p className="text-sm text-gray-500">Campus Scoped</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">Yes</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
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
              {filteredSchedule[day]?.length ? (
                <span className="ml-2 text-xs rounded-full bg-indigo-500 text-white px-2 py-0.5">
                  {filteredSchedule[day].length}
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
            <h2 className="text-xl font-semibold text-gray-800">{selectedDay} Schedule</h2>
          </div>
          <div className="p-6 space-y-4">
            {todayClasses.length > 0 ? (
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
