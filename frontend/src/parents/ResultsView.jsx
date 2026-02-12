import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Download, Award, TrendingUp } from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const CATEGORY_FILTERS = [
  { value: 'all', label: 'All Records' },
  { value: 'exam', label: 'Exams' },
  { value: 'assignment', label: 'Assignments' },
];

const formatDate = (value) => {
  if (!value) return 'TBA';
  return new Date(value).toLocaleDateString();
};

const gradeBadgeClass = (grade = '') => {
  if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
  if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
  if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-700';
};

const ResultsView = () => {
  const [reports, setReports] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        if (!token || userType !== 'Parent') {
          setReports([]);
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/parent/auth/academics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.error || 'Unable to load results');
        }
        const payload = await res.json();
        const children = Array.isArray(payload?.children) ? payload.children : [];
        setReports(children);
        if (children.length > 0) {
          setSelectedStudentId(String(children[0].studentId));
        }
      } catch (err) {
        console.error('Parent results fetch error:', err);
        setError(err.message || 'Unable to load results');
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedReport = useMemo(() => {
    if (!reports.length) return null;
    return reports.find((child) => String(child.studentId) === String(selectedStudentId)) || reports[0];
  }, [reports, selectedStudentId]);

  useEffect(() => {
    if (!reports.length) return;
    if (!selectedStudentId) {
      setSelectedStudentId(String(reports[0].studentId));
    }
  }, [reports, selectedStudentId]);

  const records = selectedReport?.records || [];
  const filteredRecords = useMemo(() => {
    if (filterCategory === 'all') return records;
    return records.filter((record) => record.category === filterCategory);
  }, [records, filterCategory]);

  const summary = selectedReport?.summary || {};

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Results</h1>
        <p className="text-yellow-100">View your child's published marks and assignments</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && !reports.length && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500">
          No published results are available yet.
        </div>
      )}

      {reports.length > 0 && (
        <>
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Select Child</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    {reports.map((child) => (
                      <option key={child.studentId} value={child.studentId}>
                        {child.studentName} ({child.grade} {child.section})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  {CATEGORY_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-600"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Student Info</h3>
              <p className="text-gray-600 text-sm">
                {selectedReport?.studentName} • Grade {selectedReport?.grade} {selectedReport?.section}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <h3 className="text-2xl font-bold text-yellow-600">{summary.averagePercentage ?? '--'}%</h3>
              <p className="text-gray-600 text-sm">Average Score</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <h3 className="text-2xl font-bold text-blue-600">{summary.examCount ?? 0}</h3>
              <p className="text-gray-600 text-sm">Published Exams</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <h3 className="text-2xl font-bold text-green-600">{summary.assignmentCount ?? 0}</h3>
              <p className="text-gray-600 text-sm">Graded Assignments</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Performance Records</h3>
                  <p className="text-sm text-gray-500">
                    Showing {filteredRecords.length} of {records.length} entries
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-yellow-500" />
              </div>

              {filteredRecords.length === 0 ? (
                <p className="text-sm text-gray-500">No records match the selected filters.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Subject</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Marks</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Grade</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredRecords.map((record) => (
                        <tr key={`${record.id}-${record.examName}`}>
                          <td className="px-4 py-3 text-sm text-gray-800">{record.examName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{record.subject || '-'}</td>
                          <td className="px-4 py-3 text-sm capitalize text-gray-600">{record.category}</td>
                          <td className="px-4 py-3 text-sm text-gray-800">
                            {record.obtainedMarks}/{record.totalMarks}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${gradeBadgeClass(record.grade)}`}>
                              {record.grade || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(record.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500">Best Performing Subject</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {summary.bestSubject || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-sm font-medium text-gray-800">
                  {summary.lastUpdated ? formatDate(summary.lastUpdated) : 'Awaiting new results'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500">
          Loading latest results...
        </div>
      )}
    </div>
  );
};

export default ResultsView;
