import React, { useEffect, useMemo, useState } from 'react';
import { Award, BookOpen, Calendar, Download, TrendingUp, AlertCircle } from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const AcademicReport = () => {
  const [childrenReports, setChildrenReports] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAcademicReport = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view academic reports.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/parent/auth/academics`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Unable to load academic report');
        }

        const children = Array.isArray(data.children) ? data.children : [];
        setChildrenReports(children);
        setSelectedChildId((prev) => {
          if (prev && children.some((child) => String(child.studentId) === String(prev))) {
            return prev;
          }
          return children.length > 0 ? String(children[0].studentId) : '';
        });
      } catch (err) {
        setError(err.message || 'Unable to load academic report');
      } finally {
        setLoading(false);
      }
    };

    loadAcademicReport();
  }, []);

  const selectedChild = useMemo(
    () => childrenReports.find((child) => String(child.studentId) === String(selectedChildId)) || childrenReports[0] || null,
    [childrenReports, selectedChildId]
  );

  const filteredRecords = useMemo(() => {
    if (!selectedChild) return [];
    if (filterType === 'all') return selectedChild.records || [];
    return (selectedChild.records || []).filter((record) => record.category === filterType);
  }, [selectedChild, filterType]);

  const summary = selectedChild?.summary || {
    averagePercentage: null,
    examCount: 0,
    assignmentCount: 0,
    bestSubject: '',
    lastUpdated: null,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-6">
      <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-gray-900">Academic Report</h1>
          <p className="text-sm text-gray-600">
            Published exam and assignment results for your children. Data refreshes automatically when teachers publish grades.
          </p>
          {summary.lastUpdated && (
            <p className="text-xs text-gray-500">
              Last updated: {new Date(summary.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Select Child</label>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              {childrenReports.length === 0 && <option value="">No linked children</option>}
              {childrenReports.map((child) => (
                <option key={child.studentId} value={child.studentId}>
                  {child.studentName} ({child.grade || '-'} {child.section || ''})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Filter Entries</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All records</option>
              <option value="exam">Exams</option>
              <option value="assignment">Assignments</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              className="inline-flex items-center justify-center w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => window.print()}
              disabled={!filteredRecords.length}
            >
              <Download className="w-4 h-4 mr-2" />
              Export snapshot
            </button>
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Average Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-gray-900">
              {summary.averagePercentage === null ? '—' : `${summary.averagePercentage}%`}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Exams</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-gray-900">{summary.examCount}</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Assignments</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-gray-900">{summary.assignmentCount}</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Strongest Subject</p>
          <span className="text-lg font-semibold text-gray-900">
            {summary.bestSubject || '—'}
          </span>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading academic report...</div>
        ) : !selectedChild ? (
          <div className="p-6 text-sm text-gray-500">No linked children found.</div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No {filterType === 'all' ? '' : filterType} records available yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Assessment</th>
                  <th className="text-left font-medium px-4 py-3">Subject</th>
                  <th className="text-left font-medium px-4 py-3">Score</th>
                  <th className="text-left font-medium px-4 py-3">Grade</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-left font-medium px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{record.examName}</p>
                      <p className="text-xs text-gray-500 capitalize">{record.category}</p>
                    </td>
                    <td className="px-4 py-3">{record.subject || '—'}</td>
                    <td className="px-4 py-3">
                      {record.obtainedMarks}/{record.totalMarks} ({record.percentage}%)
                    </td>
                    <td className="px-4 py-3">{record.grade || '—'}</td>
                    <td className="px-4 py-3 capitalize">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          record.status === 'pass'
                            ? 'bg-emerald-50 text-emerald-700'
                            : record.status === 'fail'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {record.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {record.date ? new Date(record.date).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AcademicReport;
