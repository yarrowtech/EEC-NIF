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
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusOverrides, setStatusOverrides] = useState({});

  useEffect(() => {
    fetchActiveSchools?.();
    fetchSchoolAdmins?.();
  }, [fetchActiveSchools, fetchSchoolAdmins]);

  const adminBySchoolId = useMemo(() => {
    const map = new Map();
    admins.forEach((admin) => {
      const schoolId = admin.schoolId?._id || admin.schoolId;
      if (schoolId) {
        const key = String(schoolId);
        const existing = map.get(key) || [];
        map.set(key, [...existing, admin]);
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

  const resolveCampuses = (school) => {
    if (!school) return [];
    if (Array.isArray(school.campuses) && school.campuses.length > 0) {
      return school.campuses;
    }
    if (school.campusName) {
      return [{ name: school.campusName, campusType: 'Main' }];
    }
    return [];
  };

  const getSchoolStatus = (school) => {
    if (!school) return 'active';
    const key = String(school._id || school.id || '');
    return statusOverrides[key] || school.status || 'active';
  };

  const handleStatusChange = async (school, nextStatus) => {
    if (!school) return;
    const confirmed = window.confirm(`Set ${school.name} to ${nextStatus}?`);
    if (!confirmed) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const schoolKey = String(school._id || school.id || '');
    setStatusOverrides((prev) => ({ ...prev, [schoolKey]: nextStatus }));
    setStatusUpdating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/super-admin/schools/${school._id || school.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Unable to update status');
      }
      await fetchActiveSchools?.();
      setSelected((prev) => (prev ? { ...prev, school: { ...prev.school, status: nextStatus } } : prev));
    } catch (err) {
      console.error('Failed to update status', err);
      setStatusOverrides((prev) => {
        const next = { ...prev };
        delete next[schoolKey];
        return next;
      });
    } finally {
      setStatusUpdating(false);
    }
  };

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
                    {(() => {
                      const effectiveStatus = getSchoolStatus(school);
                      return (
                        <>
                    <td className="px-4 py-3 font-medium text-slate-800">{school.name}</td>
                    <td className="px-4 py-3">{school.code || '—'}</td>
                    <td className="px-4 py-3">{school.contactEmail || '—'}</td>
                    <td className="px-4 py-3">{school.contactPhone || '—'}</td>
                    <td className="px-4 py-3">{school.address || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        effectiveStatus === 'inactive'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {effectiveStatus || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="text-xs font-semibold text-amber-700 hover:text-amber-800 px-3 py-1 rounded-full bg-amber-50 border border-amber-200"
                        onClick={() => {
                          const schoolAdmins = adminBySchoolId.get(String(school._id || school.id)) || [];
                          setSelected({ school, admins: schoolAdmins });
                        }}
                      >
                        View
                      </button>
                      <button
                        className={`ml-2 text-xs font-semibold px-3 py-1 rounded-full border ${
                          effectiveStatus === 'inactive'
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                            : 'text-rose-700 bg-rose-50 border-rose-200'
                        }`}
                        disabled={statusUpdating}
                        onClick={() => handleStatusChange(school, effectiveStatus === 'inactive' ? 'active' : 'inactive')}
                      >
                        {effectiveStatus === 'inactive' ? 'Activate' : 'Deactivate'}
                      </button>
                    </td>
                        </>
                      );
                    })()}
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
                <p><span className="font-semibold">Status:</span> {getSchoolStatus(selected.school)}</p>
                <p><span className="font-semibold">Code:</span> {selected.school.code || '—'}</p>
                <p><span className="font-semibold">Email:</span> {selected.school.contactEmail || '—'}</p>
                <p><span className="font-semibold">Phone:</span> {selected.school.contactPhone || '—'}</p>
                <p><span className="font-semibold">Address:</span> {selected.school.address || '—'}</p>
                <div className="pt-2">
                  <p className="text-xs uppercase text-slate-400">Campuses</p>
                  {resolveCampuses(selected.school).length === 0 && (
                    <p className="text-sm text-slate-500">No campus details available.</p>
                  )}
                  {resolveCampuses(selected.school).length > 0 && (
                    <div className="mt-2 space-y-2">
                      {resolveCampuses(selected.school).map((campus, index) => (
                        <div key={`${campus.name || 'campus'}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <p className="font-semibold text-slate-700">{campus.name || `Campus ${index + 1}`}</p>
                          <p className="text-xs text-slate-500">{campus.campusType || 'Campus'}</p>
                          {campus.address && <p className="text-xs text-slate-600">Address: {campus.address}</p>}
                          {campus.contactPerson && <p className="text-xs text-slate-600">Contact: {campus.contactPerson}</p>}
                          {campus.contactPhone && <p className="text-xs text-slate-600">Phone: {campus.contactPhone}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase text-slate-400">Admin</p>
                {(selected.admins || []).length === 0 && (
                  <p className="text-sm text-slate-500">No admin accounts found.</p>
                )}
                {(selected.admins || []).length > 0 && (
                  <div className="space-y-2">
                    {(selected.admins || []).map((admin) => (
                      <div key={admin._id || admin.username} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="font-semibold text-slate-700">{admin.campusName || 'Campus'}</p>
                        <p className="text-xs text-slate-500">{admin.campusType || 'Campus'}</p>
                        <p className="text-xs text-slate-700"><span className="font-semibold">Username:</span> {admin.username}</p>
                        <p className="text-xs text-slate-600"><span className="font-semibold">Name:</span> {admin.name || '—'}</p>
                        <p className="text-xs text-slate-600"><span className="font-semibold">Email:</span> {admin.email || '—'}</p>
                        <p className="text-xs text-slate-600"><span className="font-semibold">Status:</span> {admin.status || '—'}</p>
                        <p className="text-xs text-slate-600"><span className="font-semibold">Role:</span> {admin.role || '—'}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-2">
                  <button
                    className={`text-xs font-semibold px-3 py-2 rounded-lg border ${
                      getSchoolStatus(selected.school) === 'inactive'
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-rose-700 bg-rose-50 border-rose-200'
                    }`}
                    disabled={statusUpdating}
                    onClick={() => handleStatusChange(selected.school, getSchoolStatus(selected.school) === 'inactive' ? 'active' : 'inactive')}
                  >
                    {getSchoolStatus(selected.school) === 'inactive' ? 'Activate school' : 'Deactivate school'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveSchools;
