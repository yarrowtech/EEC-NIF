import React, { useEffect, useMemo, useState } from 'react';
import { Award, AlertCircle, Calendar, Loader2 } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const formatDate = (value) => {
  if (!value) return 'N/A';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const AchievementCard = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAchievements([]);
          return;
        }

        const res = await fetch(`${API_BASE}/api/student/auth/achievements`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || 'Unable to load achievements');

        const list = Array.isArray(data?.achievements) ? data.achievements : [];
        setAchievements(list);
      } catch (err) {
        setError(err.message || 'Unable to load achievements');
        setAchievements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const recentAchievements = useMemo(
    () => achievements.slice(0, 3),
    [achievements]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Award className="text-yellow-500" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Achievements</h2>
          </div>
          {!loading && !error && (
            <span className="text-xs font-semibold text-gray-500">
              {achievements.length} total
            </span>
          )}
        </div>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 size={18} className="animate-spin" />
            <p className="text-sm font-medium">Loading recent achievements...</p>
          </div>
        ) : error ? (
          <div className="flex items-center space-x-3 text-red-600">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : recentAchievements.length === 0 ? (
          <>
            <div className="flex items-center space-x-3 text-gray-600">
              <AlertCircle size={20} />
              <p className="font-medium">No achievements yet.</p>
            </div>
            <p className="text-sm text-gray-500 mt-2">Achievements will appear here once available.</p>
          </>
        ) : (
          <div className="space-y-3">
            {recentAchievements.map((item, idx) => (
              <div
                key={item?._id || `${item?.title || 'achievement'}-${idx}`}
                className="rounded-lg border border-gray-100 p-3"
              >
                <p className="text-sm font-semibold text-gray-900">
                  {item?.title || 'Achievement'}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={12} />
                  <span>{formatDate(item?.date)}</span>
                  <span>•</span>
                  <span>{item?.category || 'Other'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementCard;
