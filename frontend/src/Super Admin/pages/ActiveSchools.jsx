import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search, Trash2, Power, X, Building2, Users, CheckCircle2, XCircle, KeyRound, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

/* ── Pagination bar ── */
const Pagination = ({ page, totalPages, totalItems, pageSize, onPage, onPageSize }) => {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, totalItems);

  const pages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '…', totalPages];
    if (page >= totalPages - 3) return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', page - 1, page, page + 1, '…', totalPages];
  }, [page, totalPages]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
      {/* Count + page-size picker */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span>{totalItems === 0 ? 'No results' : `${from}–${to} of ${totalItems}`}</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
      </div>

      {/* Page buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPage(page - 1)}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {pages.map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-xs select-none">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPage(p)}
                className={`min-w-[30px] h-[30px] rounded-lg text-xs font-semibold border transition-colors ${
                  p === page
                    ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => onPage(page + 1)}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Logo / avatar helper ── */
const SchoolAvatar = ({ school, size = 'md' }) => {
  const [imgError, setImgError] = useState(false);
  const logo = school?.logo?.secure_url
    || school?.logo?.url
    || (typeof school?.logo === 'string' ? school.logo : '')
    || school?.logoUrl
    || school?.logoURL
    || '';
  const letter = (school?.name || '?')[0].toUpperCase();
  const colors = ['bg-violet-100 text-violet-700', 'bg-sky-100 text-sky-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700'];
  const colorClass = colors[(letter.charCodeAt(0) || 0) % colors.length];
  const dim = size === 'lg' ? 'w-14 h-14 text-xl' : 'w-9 h-9 text-sm';

  useEffect(() => {
    setImgError(false);
  }, [logo, school?._id, school?.id]);

  if (logo && !imgError) {
    return (
      <img
        src={logo}
        alt={school.name}
        onError={() => setImgError(true)}
        className={`${dim} rounded-xl object-cover shrink-0 border border-slate-200`}
      />
    );
  }
  return (
    <div className={`${dim} rounded-xl ${colorClass} flex items-center justify-center font-bold shrink-0`}>
      {letter}
    </div>
  );
};

/* ── Status badge ── */
const StatusBadge = ({ status }) => (
  status === 'inactive'
    ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700"><XCircle className="w-3 h-3" />Inactive</span>
    : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3" />Active</span>
);

/* ── Inline toggle switch ── */
const StatusToggle = ({ active, disabled, onChange }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onChange}
    title={active ? 'Click to deactivate' : 'Click to activate'}
    className={`relative inline-flex w-11 h-6 items-center rounded-full transition-colors focus:outline-none disabled:opacity-40 ${active ? 'bg-emerald-400' : 'bg-slate-300'}`}
  >
    <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

/* ── Stat card ── */
const Stat = ({ icon: Icon, value, label, color }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
    <div className={`p-2.5 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
    <div>
      <div className="text-xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  </div>
);

const ActiveSchools = ({
  fetchActiveSchools,
  fetchSchoolAdmins,
  loading,
  error,
  schools = [],
  admins = []
}) => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusOverrides, setStatusOverrides] = useState({});
  const [resettingAdminId, setResettingAdminId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isSchoolApproved = (school) =>
    String(school?.registrationStatus || '').trim().toLowerCase() === 'approved';

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
        map.set(key, [...(map.get(key) || []), admin]);
      }
    });
    return map;
  }, [admins]);

  const getSchoolStatus = (school) => {
    if (!school) return 'active';
    const key = String(school._id || school.id || '');
    return statusOverrides[key] || school.status || 'active';
  };

  const approvedSchools = useMemo(() => schools.filter(isSchoolApproved), [schools]);

  const filteredSchools = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return approvedSchools.filter((school) => {
      const st = getSchoolStatus(school);
      if (statusFilter !== 'all' && st !== statusFilter) return false;
      if (!needle) return true;
      return [school.name, school.contactEmail, school.contactPhone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle));
    });
  }, [approvedSchools, query, statusFilter, statusOverrides]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSchools.length / pageSize));
  const pagedSchools = filteredSchools.slice((page - 1) * pageSize, page * pageSize);

  const resolveCampuses = (school) => {
    if (!school) return [];
    if (Array.isArray(school.campuses) && school.campuses.length > 0) return school.campuses;
    if (school.campusName) return [{ name: school.campusName, campusType: 'Main' }];
    return [];
  };

  const handleStatusChange = async (school, nextStatus) => {
    if (!school) return;
    if (!window.confirm(`Set "${school.name}" to ${nextStatus}?`)) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const key = String(school._id || school.id || '');
    setStatusOverrides((p) => ({ ...p, [key]: nextStatus }));
    setStatusUpdating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/super-admin/schools/${school._id || school.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.error || 'Unable to update status'); }
      await fetchActiveSchools?.();
      setSelected((p) => p ? { ...p, school: { ...p.school, status: nextStatus } } : p);
    } catch (err) {
      console.error(err);
      setStatusOverrides((p) => { const n = { ...p }; delete n[key]; return n; });
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDeleteSchool = async (school) => {
    if (!school) return;
    if (!window.confirm(`Permanently delete "${school.name}" and all its data? This cannot be undone.`)) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/super-admin/schools/${school._id || school.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Unable to delete school');
      await fetchActiveSchools?.();
      if (selected && String(selected.school._id || selected.school.id) === String(school._id || school.id)) setSelected(null);
    } catch (err) {
      window.alert(err.message || 'Unable to delete school');
    }
  };

  const handleResetSchoolAdminPassword = async (admin) => {
    if (!admin?._id) return;
    if (!window.confirm(`Reset password for ${admin.username || 'this admin'}?`)) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    setResettingAdminId(String(admin._id));
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/auth/school-admins/${admin._id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Unable to reset password');
      const message = `Username: ${data?.username || admin.username || 'N/A'}\nNew Password: ${data?.password || 'N/A'}`;
      window.alert(`Password reset successful.\n\n${message}`);
      try { await navigator.clipboard.writeText(message); } catch { /* ignore */ }
      await fetchSchoolAdmins?.();
    } catch (err) {
      window.alert(err.message || 'Unable to reset password');
    } finally {
      setResettingAdminId(null);
    }
  };

  const activeCount = approvedSchools.filter((s) => getSchoolStatus(s) === 'active').length;
  const inactiveCount = approvedSchools.filter((s) => getSchoolStatus(s) === 'inactive').length;

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-0.5">Management</p>
            <h2 className="text-2xl font-bold text-slate-800">Registered Schools</h2>
          </div>
          <button
            onClick={fetchActiveSchools}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat icon={Building2}    value={loading ? '—' : approvedSchools.length} label="Total"    color="bg-violet-100 text-violet-600" />
          <Stat icon={CheckCircle2} value={loading ? '—' : activeCount}            label="Active"   color="bg-emerald-100 text-emerald-600" />
          <Stat icon={XCircle}      value={loading ? '—' : inactiveCount}           label="Inactive" color="bg-rose-100 text-rose-600" />
        </div>

        {/* Search + filter */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus-within:ring-2 focus-within:ring-violet-300 focus-within:border-violet-300 transition-all">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              type="text"
              className="bg-transparent flex-1 text-sm focus:outline-none placeholder:text-slate-400"
              placeholder="Search by name, email or phone…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center justify-between bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl p-4">
          <span>{error}</span>
          <button onClick={fetchActiveSchools} className="ml-4 px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-medium">
            Retry
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading schools…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">School</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Email</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Active</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pagedSchools.map((school) => {
                  const st = getSchoolStatus(school);
                  const isActive = st !== 'inactive';
                  return (
                    <tr key={school._id || school.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* School name + logo */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <SchoolAvatar school={school} />
                          <div>
                            <p className="font-semibold text-slate-800 leading-tight">{school.name}</p>
                            {school.campuses?.length > 0 && (
                              <p className="text-xs text-slate-400 mt-0.5">{school.campuses.length} campus{school.campuses.length !== 1 ? 'es' : ''}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{school.contactEmail || '—'}</td>
                      <td className="px-5 py-3.5 text-slate-600">{school.contactPhone || '—'}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={st} /></td>
                      {/* Toggle */}
                      <td className="px-5 py-3.5">
                        <StatusToggle
                          active={isActive}
                          disabled={statusUpdating}
                          onChange={() => handleStatusChange(school, isActive ? 'inactive' : 'active')}
                        />
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              const schoolAdmins = adminBySchoolId.get(String(school._id || school.id)) || [];
                              setSelected({ school, admins: schoolAdmins });
                            }}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 hover:bg-violet-100 transition-colors"
                          >
                            View
                          </button>
                          <button
                            title="Delete school"
                            onClick={() => handleDeleteSchool(school)}
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pagedSchools.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-slate-400 text-sm">
                      <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                      No schools found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filteredSchools.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filteredSchools.length}
            pageSize={pageSize}
            onPage={(p) => setPage(Math.max(1, Math.min(p, totalPages)))}
            onPageSize={(n) => { setPageSize(n); setPage(1); }}
          />
        )}
      </div>

      {/* ── Detail modal ── */}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Modal header */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 shrink-0">
              <SchoolAvatar school={selected.school} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium uppercase tracking-widest text-slate-400">School details</p>
                <h3 className="text-xl font-bold text-slate-800 truncate">{selected.school.name}</h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <div className="grid gap-6 md:grid-cols-2">

                {/* Left: school info */}
                <div className="space-y-4">
                  {/* Info card */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">School Info</p>
                    <Row label="Status"><StatusBadge status={getSchoolStatus(selected.school)} /></Row>
                    <Row label="Email">{selected.school.contactEmail || '—'}</Row>
                    <Row label="Phone">{selected.school.contactPhone || '—'}</Row>
                    {selected.school.address && <Row label="Address">{selected.school.address}</Row>}
                  </div>

                  {/* Campuses */}
                  {resolveCampuses(selected.school).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Campuses</p>
                      <div className="space-y-2">
                        {resolveCampuses(selected.school).map((campus, i) => (
                          <div key={`${campus.name || 'campus'}-${i}`} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
                            <p className="font-semibold text-slate-700">{campus.name || `Campus ${i + 1}`}</p>
                            <p className="text-xs text-slate-400 mb-1">{campus.campusType || 'Campus'}</p>
                            {campus.address && <p className="text-xs text-slate-600">📍 {campus.address}</p>}
                            {campus.contactPerson && <p className="text-xs text-slate-600">👤 {campus.contactPerson}</p>}
                            {campus.contactPhone && <p className="text-xs text-slate-600">📞 {campus.contactPhone}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status & delete actions */}
                  <div className="space-y-2 pt-2">
                    {(() => {
                      const isInactive = getSchoolStatus(selected.school) === 'inactive';
                      return (
                        <button
                          disabled={statusUpdating}
                          onClick={() => handleStatusChange(selected.school, isInactive ? 'active' : 'inactive')}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-50 ${
                            isInactive
                              ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Power className="w-4 h-4" />
                            {isInactive ? 'Activate school' : 'Deactivate school'}
                          </span>
                          <span className={`inline-flex w-10 h-5 rounded-full transition-colors ${isInactive ? 'bg-slate-300' : 'bg-emerald-400'}`}>
                            <span className={`my-auto w-4 h-4 rounded-full bg-white shadow transition-transform ${isInactive ? 'translate-x-0.5' : 'translate-x-5'}`} />
                          </span>
                        </button>
                      );
                    })()}
                    <button
                      onClick={() => handleDeleteSchool(selected.school)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300 text-sm font-semibold transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete school
                    </button>
                  </div>
                </div>

                {/* Right: admins */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                    Admin Accounts
                    {selected.admins.length > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-bold">{selected.admins.length}</span>
                    )}
                  </p>
                  {selected.admins.length === 0 ? (
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-center text-slate-400 text-sm">
                      <Users className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                      No admin accounts found.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selected.admins.map((admin) => (
                        <div key={admin._id || admin.username} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm space-y-1.5">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-semibold text-slate-700">{admin.campusName || 'Campus'}</p>
                            <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                              {admin.campusType || 'Campus'}
                            </span>
                          </div>
                          <Row label="Username">{admin.username}</Row>
                          <Row label="Name">{admin.name || '—'}</Row>
                          <Row label="Email">{admin.email || '—'}</Row>
                          <Row label="Status">
                            <span className={`font-semibold ${admin.status === 'inactive' ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {admin.status || '—'}
                            </span>
                          </Row>
                          <Row label="Role">{admin.role || '—'}</Row>
                          <div className="pt-2">
                            <button
                              disabled={resettingAdminId === String(admin._id)}
                              onClick={() => handleResetSchoolAdminPassword(admin)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-60 transition-colors"
                            >
                              <KeyRound className="w-3 h-3" />
                              {resettingAdminId === String(admin._id) ? 'Resetting…' : 'Reset Password'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* tiny helper for detail rows */
const Row = ({ label, children }) => (
  <div className="flex items-start gap-2 text-sm">
    <span className="text-slate-400 w-20 shrink-0">{label}</span>
    <span className="text-slate-700 font-medium flex-1">{children}</span>
  </div>
);

export default ActiveSchools;
