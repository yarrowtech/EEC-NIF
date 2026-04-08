import { useMemo, useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, AlertCircle, RefreshCw, Loader2, BadgeCheck, Copy } from 'lucide-react';

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  review: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-600'
};

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

  const campusKeyFor = (campus, index = 0) => {
    const rawKey = campus?.id || campus?._id || campus?.campusId || campus?.name || `campus-${index}`;
    return String(rawKey);
  };

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
        {filteredRequests.map((request) => {
          const credentialBucket = schoolCredentials[request.id];
          const campusList = resolveCampuses(request);
          return (
          <div key={request.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-800">{request.schoolName}</p>
                    <p className="text-sm text-slate-500">{request.board} • {request.studentCount} students • {request.campuses} campuses</p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500 flex flex-wrap gap-3">
                  <span>ID: {request.id}</span>
                  <span>Contact: {request.contactPerson}</span>
                  <span>Email: {request.contactEmail}</span>
                  <span>Submitted: {new Date(request.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[request.status] || 'bg-slate-100 text-slate-600'}`}>
                  {request.status.toUpperCase()}
                </span>
                <p className="text-xs text-slate-500 mt-2">{request.notes}</p>
              </div>
            </div>

            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-xs uppercase text-slate-500">
                <BadgeCheck className="text-amber-500" size={16} />
                Campus credentials
              </div>
              <div className="space-y-3">
                {campusList.map((campus, campusIndex) => {
                  const campusKey = campusKeyFor(campus, campusIndex);
                  const campusCredentials = credentialBucket?.campuses || {};
                  const credential =
                    campusCredentials[campusKey] ||
                    campusCredentials.default ||
                    (campusIndex === 0 && credentialBucket?.code ? credentialBucket : null);
                  return (
                    <div key={`${campusKey}-${campusIndex}`} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {campus?.name || `Campus ${campusIndex + 1}`}
                          </p>
                          <p className="text-xs text-slate-500">
                            {campus?.campusType || 'Campus'}
                          </p>
                          {credential?.generatedAt && (
                            <p className="text-xs text-slate-400">
                              Generated {new Date(credential.generatedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase text-slate-500">Username</span>
                            <span className="font-mono text-sm text-slate-800">
                              {credential?.code || 'Not generated'}
                            </span>
                            {credential?.code && (
                              <button
                                className="flex items-center gap-1 text-xs text-slate-500 border border-slate-300 rounded-lg px-2 py-1"
                                onClick={() => navigator.clipboard.writeText(credential.code)}
                              >
                                <Copy size={12} /> Copy
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase text-slate-500">Password</span>
                            <span className="font-mono text-sm text-slate-800">
                              {credential?.password || 'Not generated'}
                            </span>
                            {credential?.password && (
                              <button
                                className="flex items-center gap-1 text-xs text-slate-500 border border-slate-300 rounded-lg px-2 py-1"
                                onClick={() => navigator.clipboard.writeText(credential.password)}
                              >
                                <Copy size={12} /> Copy
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm"
                          onClick={() => onGenerateSchoolCredentials?.(request, campus, campusIndex)}
                        >
                          {credential ? 'Regenerate credentials' : 'Generate username & password'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => updateStatus(request.id, 'review')}
                disabled={Boolean(activeAction) || request.status === 'rejected'}
              >
                <RefreshCw size={14} />
                {activeAction === `${request.id}:review` ? 'Updating...' : 'Request updates'}
              </button>
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-rose-200 text-rose-600 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => updateStatus(request.id, 'rejected')}
                disabled={Boolean(activeAction) || request.status === 'rejected'}
              >
                <XCircle size={14} />
                {activeAction === `${request.id}:rejected` ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => updateStatus(request.id, 'approved')}
                disabled={Boolean(activeAction) || request.status === 'rejected'}
              >
                <CheckCircle size={14} />
                {activeAction === `${request.id}:approved` ? 'Approving...' : 'Approve and activate'}
              </button>
            </div>
          </div>
        )})}
        {filteredRequests.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-500">
            No schools match the current filters.
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default Requests;
