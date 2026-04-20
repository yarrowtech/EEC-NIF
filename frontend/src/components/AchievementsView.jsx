import React, { useEffect, useMemo, useState } from 'react';
import { Award, Calendar, Loader2, Trophy } from 'lucide-react';
import { fetchCachedJson } from '../utils/studentApiCache';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const STUDENT_ACHIEVEMENTS_ENDPOINT = `${API_BASE}/api/student/auth/achievements`;
const STUDENT_ACHIEVEMENTS_CACHE_TTL_MS = 2 * 60 * 1000;

const formatDate = (value) => {
  if (!value) return 'N/A';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value);
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const categoryClass = (category = '') => {
  if (category === 'Academic') return 'bg-blue-100 text-blue-700';
  if (category === 'Sports') return 'bg-emerald-100 text-emerald-700';
  if (category === 'Extra-Curricular') return 'bg-purple-100 text-purple-700';
  return 'bg-slate-100 text-slate-700';
};

const AchievementsView = () => {
  const [student, setStudent] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Please login again.');

        const { data } = await fetchCachedJson(STUDENT_ACHIEVEMENTS_ENDPOINT, {
          ttlMs: STUDENT_ACHIEVEMENTS_CACHE_TTL_MS,
          fetchOptions: {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        });

        setStudent(data?.student || null);
        setAchievements(Array.isArray(data?.achievements) ? data.achievements : []);
      } catch (err) {
        setError(err.message || 'Unable to load achievements');
        setStudent(null);
        setAchievements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const totalCount = achievements.length;
  const latestDate = useMemo(() => {
    if (!achievements.length) return 'N/A';
    return formatDate(achievements[0]?.date);
  }, [achievements]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 p-6 text-white shadow-lg">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy size={24} /> My Achievements</h1>
          <p className="text-yellow-100 text-sm mt-1">
            {student?.name ? `${student.name}${student?.grade ? ` • ${student.grade}${student?.section ? `-${student.section}` : ''}` : ''}` : 'Student achievements'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Achievements</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase">Latest Achievement</p>
            <p className="text-lg font-bold text-slate-900 mt-1">{latestDate}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-5">
          {loading ? (
            <div className="py-10 flex items-center justify-center gap-2 text-slate-500">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Loading achievements...</span>
            </div>
          ) : error ? (
            <div className="py-8 text-sm text-red-600">{error}</div>
          ) : achievements.length === 0 ? (
            <div className="py-10 text-center text-slate-500">
              <Award size={28} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">No achievements yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {achievements.map((item, idx) => (
                <div key={item?._id || `${item?.title || 'achievement'}-${idx}`} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 break-words">{item?.title || 'Achievement'}</p>
                      {item?.description && <p className="text-sm text-slate-600 mt-1 break-words">{item.description}</p>}
                    </div>
                    <span className={`shrink-0 text-[11px] font-semibold px-2 py-1 rounded-full ${categoryClass(item?.category)}`}>
                      {item?.category || 'Other'}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(item?.date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementsView;
