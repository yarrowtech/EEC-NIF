import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, CheckCircle, XCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  review: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-600'
};

const getSchoolInitials = (name = '') => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'NA';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
};

const REQUESTS_PER_PAGE = 8;

const Requests = ({
  requests,
  onRequestAction,
  loading = false,
  bulkDeleteLoading = false,
  error = null,
  onRefresh,
  onDeleteAllPendingRequests,
  schoolCredentials = {},
  onGenerateSchoolCredentials
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeAction, setActiveAction] = useState(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkDeleteConfirmText, setBulkDeleteConfirmText] = useState('');
  const [actionError, setActionError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pendingRequestsCount = useMemo(
    () => requests.filter((request) => request.status === 'pending').length,
    [requests]
  );

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (request.status === 'approved') return false;
      const matchesSearch =
        String(request.schoolName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(request.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(request.contactEmail || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredRequests.length / REQUESTS_PER_PAGE)),
    [filteredRequests.length]
  );
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * REQUESTS_PER_PAGE;
    return filteredRequests.slice(start, start + REQUESTS_PER_PAGE);
  }, [filteredRequests, currentPage]);
  const startItem = filteredRequests.length > 0 ? (currentPage - 1) * REQUESTS_PER_PAGE + 1 : 0;
  const endItem = Math.min(currentPage * REQUESTS_PER_PAGE, filteredRequests.length);

  const updateStatus = async (requestId, status) => {
    const note =
      status === 'review'
        ? window.prompt('Add a note for the school (optional)')
        : undefined;
    try {
      setActionError(null);
      setActiveAction(`${requestId}:${status}`);
      await onRequestAction(requestId, status, note);
    } catch (requestError) {
      setActionError(requestError?.message || 'Unable to update this request');
    } finally {
      setActiveAction(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!onDeleteAllPendingRequests) return;
    try {
      setActionError(null);
      await onDeleteAllPendingRequests(bulkDeleteConfirmText);
      setBulkDeleteConfirmText('');
      setShowBulkDeleteConfirm(false);
    } catch (requestError) {
      setActionError(requestError?.message || 'Unable to delete pending requests');
    }
  };

  const resolveCampuses = (request) => {
    if (!request) return [];
    if (Array.isArray(request.campusList) && request.campusList.length > 0) {
      return request.campusList;
    }
    if (Array.isArray(request.campuses) && request.campuses.length > 0) {
      return request.campuses;
    }
    if (request.campusName) {
      return [{ name: request.campusName, campusType: 'Main' }];
    }
    return [
      {
        name: request.schoolName || request.name || 'Main Campus',
        campusType: 'Main'
      }
    ];
  };

  useEffect(() => {
    if (currentPage <= totalPages) return;
    setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase text-slate-400">School onboarding</p>
            <h2 className="text-2xl font-semibold text-slate-800">Approval workspace</h2>
          </div>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'border-slate-200 text-slate-600'
              }`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'border-slate-200 text-slate-600'
              }`}
              onClick={() => setStatusFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                statusFilter === 'review'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-slate-200 text-slate-600'
              }`}
              onClick={() => setStatusFilter('review')}
            >
              Need info
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                statusFilter === 'rejected'
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'border-slate-200 text-slate-600'
              }`}
              onClick={() => setStatusFilter('rejected')}
            >
              Rejected
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              className="bg-transparent flex-1 text-sm focus:outline-none"
              placeholder="Search by school, contact person or email"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600">
            <Filter size={16} />
            Advanced filters
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-300 bg-rose-50 text-sm text-rose-700 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => setShowBulkDeleteConfirm((prev) => !prev)}
            disabled={loading || bulkDeleteLoading || pendingRequestsCount === 0}
          >
            {bulkDeleteLoading ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
            Delete all pending ({pendingRequestsCount})
          </button>
        </div>

        {showBulkDeleteConfirm && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 space-y-3">
            <p className="text-sm text-rose-800 font-medium">
              This permanently deletes all pending registration requests from the database.
            </p>
            <p className="text-xs text-rose-700">
              Type <span className="font-semibold">DELETE</span> to confirm.
            </p>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <input
                type="text"
                value={bulkDeleteConfirmText}
                onChange={(event) => setBulkDeleteConfirmText(event.target.value)}
                className="w-full md:w-64 rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="Type DELETE"
              />
              <button
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleBulkDelete}
                disabled={bulkDeleteLoading || bulkDeleteConfirmText.trim().toUpperCase() !== 'DELETE'}
              >
                {bulkDeleteLoading ? 'Deleting...' : 'Confirm delete all'}
              </button>
              <button
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm"
                onClick={() => {
                  setShowBulkDeleteConfirm(false);
                  setBulkDeleteConfirmText('');
                }}
                disabled={bulkDeleteLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {(error || actionError) && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl p-4 flex items-center justify-between">
          <span>{actionError || error}</span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-500 flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-amber-500" />
          <p>Loading latest school registrations…</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-4">
          {filteredRequests.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
              <table className="w-full text-sm min-w-[1100px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">School</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Board</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Students</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Campuses</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Submitted</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRequests.map((request) => {
                    const logoSrc =
                      typeof request.logo === 'string'
                        ? request.logo
                        : (request.logo?.secure_url || request.logo?.url || request.logo?.path || '');
                    const campusList = resolveCampuses(request);
                    const firstCampus = campusList[0] || null;
                    return (
                      <tr key={request.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                              {logoSrc ? (
                                <img src={logoSrc} alt={request.schoolName || 'School logo'} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-[11px] font-semibold text-slate-600">
                                  {getSchoolInitials(request.schoolName || request.name)}
                                </span>
                              )}
                            </div>
                            <div>
                              <Link to={`/super-admin/requests/${request.id}`} className="font-semibold text-slate-800 hover:text-indigo-600">
                                {request.schoolName}
                              </Link>
                              <p className="text-xs text-slate-500">ID: {request.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{request.board || '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{request.studentCount || '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{request.campuses || campusList.length || 0}</td>
                        <td className="px-4 py-3 text-slate-600">
                          <div className="text-xs">
                            <p>{request.contactPerson || '-'}</p>
                            <p className="text-slate-500">{request.contactEmail || '-'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{new Date(request.submittedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[request.status] || 'bg-slate-100 text-slate-600'}`}>
                            {String(request.status || '').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                              onClick={() => updateStatus(request.id, 'review')}
                              disabled={Boolean(activeAction) || request.status === 'rejected'}
                            >
                              {activeAction === `${request.id}:review` ? 'Updating...' : 'Review'}
                            </button>
                            <button
                              className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                              onClick={() => updateStatus(request.id, 'rejected')}
                              disabled={Boolean(activeAction) || request.status === 'rejected'}
                            >
                              {activeAction === `${request.id}:rejected` ? 'Rejecting...' : 'Reject'}
                            </button>
                            <button
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                              onClick={() => updateStatus(request.id, 'approved')}
                              disabled={Boolean(activeAction) || request.status === 'rejected'}
                            >
                              {activeAction === `${request.id}:approved` ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                              className="px-2.5 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                              onClick={() => onGenerateSchoolCredentials?.(request, firstCampus, 0)}
                              disabled={Boolean(activeAction) || request.status === 'rejected'}
                            >
                              Credentials
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        {filteredRequests.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-500">
            No schools match the current filters.
          </div>
        )}
        {filteredRequests.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing {startItem}-{endItem} of {filteredRequests.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="text-sm text-slate-600">
                Page {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default Requests;
