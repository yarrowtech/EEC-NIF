import { useMemo, useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  review: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-600'
};

const Requests = ({ requests, onRequestAction, loading = false, error = null, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch =
        request.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const updateStatus = (requestId, status) => {
    const note =
      status === 'review'
        ? window.prompt('Add a note for the school (optional)')
        : undefined;
    onRequestAction(requestId, status, note);
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
                statusFilter === 'approved'
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'border-slate-200 text-slate-600'
              }`}
              onClick={() => setStatusFilter('approved')}
            >
              Approved
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
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl p-4 flex items-center justify-between">
          <span>{error}</span>
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
        {filteredRequests.map((request) => (
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

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm"
                onClick={() => updateStatus(request.id, 'review')}
              >
                <RefreshCw size={14} />
                Request updates
              </button>
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-rose-200 text-rose-600 text-sm"
                onClick={() => updateStatus(request.id, 'rejected')}
              >
                <XCircle size={14} />
                Reject
              </button>
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm"
                onClick={() => updateStatus(request.id, 'approved')}
              >
                <CheckCircle size={14} />
                Approve and activate
              </button>
            </div>
          </div>
        ))}
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
