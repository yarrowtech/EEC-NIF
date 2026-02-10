import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, BookOpen, Calendar, Clock, MapPin, User } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const normalizeDay = (value) => {
  if (!value) return null;
  const v = String(value).trim().toLowerCase();
  return DAYS.find((day) => day.toLowerCase() === v) || null;
};

const normalizeSchedule = (rawSchedule) => {
  const base = DAYS.reduce((acc, day) => {
    acc[day] = [];
    return acc;
  }, {});
  if (!rawSchedule || typeof rawSchedule !== 'object') return base;

  Object.entries(rawSchedule).forEach(([day, entries]) => {
    const normalizedDay = normalizeDay(day);
    if (!normalizedDay) return;
    base[normalizedDay] = Array.isArray(entries) ? entries : [];
  });
  return base;
};

const getTimeLabel = (entry, index) =>
  entry?.time || (entry?.period ? `Period ${entry.period}` : `Slot ${index + 1}`);

const ParentClassRoutine = () => {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [viewMode, setViewMode] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  const fetchRoutine = useCallback(async ({ initial = false } = {}) => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    if (!token || userType !== 'Parent') {
      setError('Only parents can view children routines.');
      setChildren([]);
      setSelectedChildId('');
      setLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      if (initial) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError('');

      const res = await fetch(`${API_BASE_URL}/api/parent/auth/routine`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Unable to load routine');
      }

      const list = (data?.children || []).map((child) => ({
        ...child,
        schedule: normalizeSchedule(child?.schedule),
      }));

      setChildren(list);
      setSelectedChildId((prev) => {
        if (prev && list.some((child) => String(child.studentId) === String(prev))) {
          return prev;
        }
        if (list.length === 0) return '';
        const preferred = list.find((child) => child.hasRoutine) || list[0];
        return String(preferred.studentId);
      });
      setLastFetchedAt(new Date());
    } catch (err) {
      setError(err.message || 'Unable to load routine');
      setChildren([]);
      setSelectedChildId('');
    } finally {
      if (initial) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchRoutine({ initial: true });
  }, [fetchRoutine]);

  const selectedChild = useMemo(
    () => children.find((child) => String(child.studentId) === String(selectedChildId)) || null,
    [children, selectedChildId]
  );

  const schedule = selectedChild?.schedule || {};
  const weeklySlots = useMemo(() => {
    const map = new Map();
    DAYS.forEach((day) => {
      (schedule[day] || []).forEach((entry, index) => {
        const time = getTimeLabel(entry, index);
        const order = Number(entry?.period || 999);
        if (!map.has(time) || order < map.get(time).order) {
          map.set(time, { time, order });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => (a.order === b.order ? a.time.localeCompare(b.time) : a.order - b.order));
  }, [schedule]);

  const weeklyMatrix = useMemo(() => {
    const matrix = {};
    DAYS.forEach((day) => {
      matrix[day] = {};
      (schedule[day] || []).forEach((entry, index) => {
        matrix[day][getTimeLabel(entry, index)] = entry;
      });
    });
    return matrix;
  }, [schedule]);

  const dayEntries = schedule[selectedDay] || [];
  const weeklyCount = useMemo(
    () => DAYS.reduce((sum, day) => sum + ((schedule[day] || []).length), 0),
    [schedule]
  );

  if (loading) {
    return <div className="p-6 text-sm text-gray-600">Loading children routine...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-600" />
          <h1 className="text-xl font-semibold text-gray-900">Children Class Routine</h1>
        </div>
        {selectedChild && (
          <p className="text-sm text-gray-600 mt-2">
            {selectedChild.studentName} | Class {selectedChild.className || selectedChild.grade || '-'}
            {selectedChild.sectionName || selectedChild.section ? ` | Section ${selectedChild.sectionName || selectedChild.section}` : ''}
            {` | Weekly Classes ${weeklyCount}`}
          </p>
        )}
        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
          {lastFetchedAt && (
            <span>Last updated: {lastFetchedAt.toLocaleTimeString()}</span>
          )}
          <button
            onClick={() => fetchRoutine()}
            disabled={loading || isRefreshing}
            className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-3 py-1.5 text-amber-700 hover:bg-amber-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh data'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {children.map((child) => (
            <button
              key={child.studentId}
              onClick={() => setSelectedChildId(String(child.studentId))}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                String(child.studentId) === String(selectedChildId)
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {child.studentName}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'daily' ? 'bg-amber-600 text-white' : 'text-gray-700'}`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'weekly' ? 'bg-amber-600 text-white' : 'text-gray-700'}`}
            >
              Weekly Sheet
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-2 rounded-lg text-sm ${
                selectedDay === day ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {children.length === 0 ? (
          <div className="text-sm text-gray-600">No linked children found for this parent account.</div>
        ) : !selectedChild ? (
          <div className="text-sm text-gray-600">Select a child to view routine.</div>
        ) : weeklyCount === 0 ? (
          <div className="text-sm text-gray-600">No routine assigned yet for {selectedChild.studentName}.</div>
        ) : viewMode === 'weekly' ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b">Time</th>
                  {DAYS.map((day) => (
                    <th key={day} className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeklySlots.map((slot) => (
                  <tr key={slot.time} className="align-top">
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium bg-gray-50 border-b">{slot.time}</td>
                    {DAYS.map((day) => {
                      const entry = weeklyMatrix[day]?.[slot.time];
                      return (
                        <td key={`${day}-${slot.time}`} className="px-3 py-3 border-b">
                          {entry ? (
                            <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                              <p className="text-sm font-semibold text-gray-900">{entry.subject || 'Subject'}</p>
                              <p className="text-xs text-gray-600 mt-1">{entry.instructor || 'TBA'}</p>
                              <p className="text-xs text-gray-500 mt-1">{entry.room || 'TBA'}</p>
                            </div>
                          ) : (
                            <div className="rounded-lg border border-dashed border-gray-200 px-3 py-2 text-center text-xs text-gray-400">--</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-3">
            {dayEntries.length === 0 ? (
              <div className="text-sm text-gray-600">No classes on {selectedDay}.</div>
            ) : (
              dayEntries.map((entry, index) => (
                <div key={`${selectedDay}-${index}`} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    {entry.subject || 'Subject'}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-4 h-4 text-amber-600" />
                      {entry.time || 'TBA'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <User className="w-4 h-4 text-amber-600" />
                      {entry.instructor || 'TBA'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      {entry.room || 'TBA'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentClassRoutine;
