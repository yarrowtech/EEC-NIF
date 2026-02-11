import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const StudentDashboardContext = createContext({
  loading: true,
  error: '',
  profile: null,
  classTeacher: null,
  stats: null,
  course: null,
  recentAttendance: [],
  refresh: () => {},
});

const DASHBOARD_CACHE_KEY = 'studentDashboardCacheV1';
const DASHBOARD_CACHE_TTL_MS = 2 * 60 * 1000;

const emptyData = {
  profile: null,
  classTeacher: null,
  stats: null,
  course: null,
  recentAttendance: [],
};

const readDashboardCache = () => {
  try {
    const raw = sessionStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp || !parsed?.data) return null;
    if (Date.now() - parsed.timestamp > DASHBOARD_CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
};

const writeDashboardCache = (data) => {
  try {
    sessionStorage.setItem(
      DASHBOARD_CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    );
  } catch {
    // Ignore storage failures; network fetch remains source of truth.
  }
};

export const StudentDashboardProvider = ({ children }) => {
  const initialCachedDataRef = useRef(readDashboardCache());
  const initialCachedData = initialCachedDataRef.current;
  const [loading, setLoading] = useState(!initialCachedData);
  const [error, setError] = useState('');
  const [data, setData] = useState(initialCachedData || emptyData);
  const activeControllerRef = useRef(null);
  const isMountedRef = useRef(false);

  const fetchDashboard = useCallback(async ({ silent = false } = {}) => {
    activeControllerRef.current?.abort();
    const controller = new AbortController();
    activeControllerRef.current = controller;
    try {
      if (!silent) setLoading(true);
      if (isMountedRef.current) setError('');
      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');
      if (!token || userType !== 'Student') {
        sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
        if (!isMountedRef.current) return;
        setData(emptyData);
        setLoading(false);
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/student/auth/dashboard`, {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Unable to load dashboard data');
      }
      const payload = await response.json();
      let classTeacher = null;
      try {
        const teacherResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/student/auth/class-teacher`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (teacherResponse.ok) {
          const teacherPayload = await teacherResponse.json().catch(() => ({}));
          classTeacher = teacherPayload?.teacher || null;
        }
      } catch {
        classTeacher = null;
      }
      const nextData = {
        profile: payload.profile || null,
        classTeacher,
        stats: payload.stats || null,
        course: payload.course || null,
        recentAttendance: payload.recentAttendance || [],
      };
      writeDashboardCache(nextData);
      if (!isMountedRef.current) return;
      setData(nextData);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Student dashboard fetch error:', err);
      if (!isMountedRef.current) return;
      setError(err.message || 'Failed to load dashboard');
      if (!initialCachedData) {
        setData(emptyData);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [initialCachedData]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchDashboard({ silent: !!initialCachedData });
    return () => {
      isMountedRef.current = false;
      activeControllerRef.current?.abort();
    };
  }, [fetchDashboard, initialCachedData]);

  const value = useMemo(
    () => ({
      loading,
      error,
      profile: data.profile,
      classTeacher: data.classTeacher,
      stats: data.stats,
      course: data.course,
      recentAttendance: data.recentAttendance,
      refresh: () => fetchDashboard(),
    }),
    [loading, error, data.profile, data.classTeacher, data.stats, data.course, data.recentAttendance, fetchDashboard]
  );

  return (
    <StudentDashboardContext.Provider value={value}>
      {children}
    </StudentDashboardContext.Provider>
  );
};

export const useStudentDashboard = () => useContext(StudentDashboardContext);
