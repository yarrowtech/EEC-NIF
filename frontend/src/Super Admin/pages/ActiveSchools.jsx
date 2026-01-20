import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';

const ActiveSchools = ({
  fetchActiveSchools,
  fetchSchoolAdmins,
  loading,
  error,
  schools = [],
  admins = []
}) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchActiveSchools?.();
    fetchSchoolAdmins?.();
  }, [fetchActiveSchools, fetchSchoolAdmins]);

  const adminBySchoolId = useMemo(() => {
    const map = new Map();
    admins.forEach((admin) => {
      const schoolId = admin.schoolId?._id || admin.schoolId;
      if (schoolId) {
        map.set(String(schoolId), admin);
      }
    });
    return map;
  }, [admins]);

  const filteredSchools = useMemo(() => {
    if (!query.trim()) return schools;
    const needle = query.toLowerCase();
    return schools.filter((school) =>
      [
        school.name,
        school.code,
        school.contactEmail,
        school.contactPhone,
        school.address
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [schools, query]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase text-slate-400">Active schools</p>
            <h2 className="text-2xl font-semibold text-slate-800">Registered institutions</h2>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600"
            onClick={fetchActiveSchools}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="mt-6 flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            className="bg-transparent flex-1 text-sm focus:outline-none"
            placeholder="Search by name, code, email, phone, or address"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl p-4 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchActiveSchools}
            className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-500">
          Loading active schools…
        </div>
      )}

      {!loading && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Address</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchools.map((school) => (
                  <tr key={school._id || school.id} className="text-slate-700">
                    <td className="px-4 py-3 font-medium text-slate-800">{school.name}</td>
                    <td className="px-4 py-3">{school.code || '—'}</td>
                    <td className="px-4 py-3">{school.contactEmail || '—'}</td>
                    <td className="px-4 py-3">{school.contactPhone || '—'}</td>
                    <td className="px-4 py-3">{school.address || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1 text-xs font-semibold">
                        {school.status || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="text-xs font-semibold text-amber-700 hover:text-amber-800 px-3 py-1 rounded-full bg-amber-50 border border-amber-200"
                        onClick={() => {
                          const admin = adminBySchoolId.get(String(school._id || school.id));
                          setSelected({ school, admin });
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSchools.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                      No active schools found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl border border-slate-200">
            <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <p className="text-xs uppercase text-slate-400">School details</p>
                <h3 className="text-xl font-semibold text-slate-800">
                  {selected.school.name}
                </h3>
              </div>
              <button
                className="text-sm text-slate-500 hover:text-slate-700"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
            <div className="px-6 py-5 grid gap-6 md:grid-cols-2 text-sm text-slate-700">
              <div className="space-y-2">
                <p className="text-xs uppercase text-slate-400">School</p>
                <p><span className="font-semibold">Name:</span> {selected.school.name}</p>
                <p><span className="font-semibold">Code:</span> {selected.school.code || '—'}</p>
                <p><span className="font-semibold">Status:</span> {selected.school.status || 'active'}</p>
                <p><span className="font-semibold">Email:</span> {selected.school.contactEmail || '—'}</p>
                <p><span className="font-semibold">Phone:</span> {selected.school.contactPhone || '—'}</p>
                <p><span className="font-semibold">Address:</span> {selected.school.address || '—'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase text-slate-400">Admin</p>
                <p><span className="font-semibold">Username:</span> {selected.admin?.username || '—'}</p>
                <p><span className="font-semibold">Name:</span> {selected.admin?.name || '—'}</p>
                <p><span className="font-semibold">Email:</span> {selected.admin?.email || '—'}</p>
                <p><span className="font-semibold">Status:</span> {selected.admin?.status || '—'}</p>
                <p><span className="font-semibold">Role:</span> {selected.admin?.role || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveSchools;
