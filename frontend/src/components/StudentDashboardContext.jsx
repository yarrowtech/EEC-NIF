import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const StudentDashboardContext = createContext({
  loading: true,
  error: '',
  profile: null,
  stats: null,
  course: null,
  recentAttendance: [],
  refresh: () => {},
});

export const StudentDashboardProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    profile: null,
    stats: null,
    course: null,
    recentAttendance: [],
  });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');
      if (!token || userType !== 'Student') {
        setData({
          profile: null,
          stats: null,
          course: null,
          recentAttendance: [],
        });
        setLoading(false);
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/student/auth/dashboard`, {
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
      setData({
        profile: payload.profile || null,
        stats: payload.stats || null,
        course: payload.course || null,
        recentAttendance: payload.recentAttendance || [],
      });
    } catch (err) {
      console.error('Student dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard');
      setData({
        profile: null,
        stats: null,
        course: null,
        recentAttendance: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const value = useMemo(
    () => ({
      loading,
      error,
      profile: data.profile,
      stats: data.stats,
      course: data.course,
      recentAttendance: data.recentAttendance,
      refresh: fetchDashboard,
    }),
    [loading, error, data]
  );

  return (
    <StudentDashboardContext.Provider value={value}>
      {children}
    </StudentDashboardContext.Provider>
  );
};

export const useStudentDashboard = () => useContext(StudentDashboardContext);

