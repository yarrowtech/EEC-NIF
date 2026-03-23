import React, { useEffect, useState } from 'react';
import { CalendarDays, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatDate = (value) => {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
};

const HolidayList = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/holidays/teacher`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          throw new Error(data?.error || 'Unable to load holidays');
        }
        setHolidays(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Unable to load holidays');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-amber-600" />
        <h1 className="text-lg font-bold text-gray-900">Holiday List</h1>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading holidays...
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : holidays.length === 0 ? (
        <div>
          <p className="text-sm text-gray-500">No holidays announced yet.</p>
          <p className="mt-3 text-sm font-medium text-gray-600">Total Holidays: 0</p>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Holiday Name</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((item) => (
                  <tr key={item._id} className="border-b border-gray-100">
                    <td className="px-3 py-2.5 text-gray-700">{formatDate(item.date)}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-900">{item.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm font-medium text-gray-600">Total Holidays: {holidays.length}</p>
        </div>
      )}
    </div>
  );
};

export default HolidayList;
