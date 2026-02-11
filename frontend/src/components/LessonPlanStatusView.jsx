import React, { useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, Calendar, Search } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const toneByStatus = {
  completed: 'bg-green-100 text-green-700 border-green-200',
  in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
  pending: 'bg-gray-100 text-gray-700 border-gray-200',
};

const statusLabel = (value) => {
  if (value === 'completed') return 'Completed';
  if (value === 'in_progress') return 'In Progress';
  return 'Pending';
};

const LessonPlanStatusView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/lesson-plans/student/status`, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.error || 'Failed to load syllabus status');
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load syllabus status');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.title, item.subject, item.teacherName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [items, query]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpenCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Syllabus Completion Status</h1>
              <p className="text-sm text-gray-500">Date-wise lesson progress updates from your teachers</p>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by lesson or subject"
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {error ? <div className="mb-4 text-sm text-red-600">{error}</div> : null}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 text-sm text-gray-600">
          {loading ? 'Loading...' : `${filteredItems.length} update(s)`}
        </div>

        <div className="divide-y divide-gray-100">
          {!loading && filteredItems.length === 0 ? (
            <div className="p-8 text-sm text-gray-500">No date-wise syllabus status available yet.</div>
          ) : null}

          {filteredItems.map((item) => {
            const tone = toneByStatus[item.status] || toneByStatus.pending;
            return (
              <div key={item._id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{item.title || 'Lesson Plan'}</p>
                    <p className="text-sm text-gray-600">{item.subject || 'Subject'} • {item.teacherName || 'Teacher'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${tone}`}>
                      {statusLabel(item.status)}
                    </span>
                    <span className="text-xs text-gray-500">{item.completionPercent || 0}%</span>
                  </div>
                </div>

                {item.remarks ? <p className="mt-1 text-xs text-gray-600">{item.remarks}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LessonPlanStatusView;
