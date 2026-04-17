import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Filter, MessageSquare, RefreshCw, Search, Star, Users } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const TeacherFeedbackOverview = ({ setShowAdminHeader }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [filters, setFilters] = useState({ teachers: [], classes: [], sections: [], subjects: [] });
  const [query, setQuery] = useState({
    teacherId: 'all',
    className: 'all',
    sectionName: 'all',
    subjectName: 'all',
    search: '',
  });

  useEffect(() => {
    setShowAdminHeader?.(true);
  }, [setShowAdminHeader]);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (query.teacherId !== 'all') params.append('teacherId', query.teacherId);
      if (query.className !== 'all') params.append('className', query.className);
      if (query.sectionName !== 'all') params.append('sectionName', query.sectionName);
      if (query.subjectName !== 'all') params.append('subjectName', query.subjectName);
      if (query.search.trim()) params.append('search', query.search.trim());

      const res = await fetch(`${API_BASE}/api/admin/feedback/teacher-feedback?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to load teacher feedback');

      setStats(data?.stats || null);
      setFeedback(Array.isArray(data?.feedback) ? data.feedback : []);
      setFilters({
        teachers: Array.isArray(data?.filters?.teachers) ? data.filters.teachers : [],
        classes: Array.isArray(data?.filters?.classes) ? data.filters.classes : [],
        sections: Array.isArray(data?.filters?.sections) ? data.filters.sections : [],
        subjects: Array.isArray(data?.filters?.subjects) ? data.filters.subjects : [],
      });
    } catch (err) {
      setError(err.message || 'Unable to load teacher feedback');
      setStats(null);
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const averageRating = useMemo(() => Number(stats?.averageRating || 0).toFixed(1), [stats]);

  const resetFilters = () => {
    setQuery({
      teacherId: 'all',
      className: 'all',
      sectionName: 'all',
      subjectName: 'all',
      search: '',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Teacher Feedback Overview
            </h1>
            <p className="text-sm text-slate-500 mt-1">View feedback by teacher, class, section and subject.</p>
          </div>
          <button
            onClick={fetchFeedback}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500">Total Feedback</p>
          <p className="text-2xl font-bold text-slate-900">{stats?.totalFeedback ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500">Average Rating</p>
          <p className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            {averageRating}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500">Latest Feedback</p>
          <p className="text-lg font-bold text-slate-900">
            {stats?.latestFeedbackDate
              ? new Date(stats.latestFeedbackDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <p className="text-sm font-semibold text-slate-700">Filters</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          <select
            value={query.teacherId}
            onChange={(e) => setQuery((prev) => ({ ...prev, teacherId: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="all">All Teachers</option>
            {filters.teachers.map((teacher) => (
              <option key={`${teacher.teacherId}-${teacher.teacherName}`} value={String(teacher.teacherId || '')}>
                {teacher.teacherName}
              </option>
            ))}
          </select>
          <select
            value={query.className}
            onChange={(e) => setQuery((prev) => ({ ...prev, className: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="all">All Classes</option>
            {filters.classes.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <select
            value={query.sectionName}
            onChange={(e) => setQuery((prev) => ({ ...prev, sectionName: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="all">All Sections</option>
            {filters.sections.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <select
            value={query.subjectName}
            onChange={(e) => setQuery((prev) => ({ ...prev, subjectName: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="all">All Subjects</option>
            {filters.subjects.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query.search}
              onChange={(e) => setQuery((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Search..."
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm"
            />
          </div>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          Reset Filters
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading feedback...</div>
        ) : error ? (
          <div className="p-6 text-red-700 bg-red-50 border-t border-red-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        ) : feedback.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No feedback found for the selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-slate-600">
                  <th className="px-4 py-3 font-semibold">Teacher</th>
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Class</th>
                  <th className="px-4 py-3 font-semibold">Section</th>
                  <th className="px-4 py-3 font-semibold">Rating</th>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Comments</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 align-top">
                    <td className="px-4 py-3 font-semibold text-slate-800">{item.teacherName || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{item.subjectName || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{item.className || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{item.sectionName || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        {Number(item.overallRating || 0).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {item.studentName || 'Anonymous Student'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[320px]">
                      <p className="line-clamp-2">{item.comments || '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherFeedbackOverview;
