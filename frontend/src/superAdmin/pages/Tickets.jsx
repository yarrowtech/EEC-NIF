import { useMemo, useState } from 'react';
import { LifeBuoy, CheckCircle2, Loader, Users, ChevronDown } from 'lucide-react';

const statusDisplay = {
  open: { label: 'Open', classes: 'bg-rose-100 text-rose-600' },
  in_progress: { label: 'In progress', classes: 'bg-amber-100 text-amber-700' },
  resolved: { label: 'Resolved', classes: 'bg-emerald-100 text-emerald-600' }
};

const priorityColors = {
  high: 'text-rose-600',
  medium: 'text-amber-600',
  low: 'text-slate-500'
};

const Tickets = ({ tickets, onTicketUpdate }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => (statusFilter === 'all' ? true : ticket.status === statusFilter));
  }, [tickets, statusFilter]);

  const updateTicket = (ticketId, status) => {
    onTicketUpdate(ticketId, { status });
  };

  const reassignTicket = (ticketId) => {
    const owner = window.prompt('Assign to which support group?');
    if (owner) {
      onTicketUpdate(ticketId, { owner });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase text-slate-400">Helpdesk</p>
            <h2 className="text-2xl font-semibold text-slate-800">Ticket queue</h2>
          </div>
          <div className="flex gap-2">
            {['all', 'open', 'in_progress', 'resolved'].map((status) => (
              <button
                key={status}
                className={`px-4 py-2 rounded-lg text-sm border ${
                  statusFilter === status ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600'
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-800">{ticket.subject}</p>
                <p className="text-sm text-slate-500">{ticket.schoolName} • {new Date(ticket.openedAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(() => {
                  const currentStatus = statusDisplay[ticket.status] || { label: ticket.status, classes: 'bg-slate-100 text-slate-600' };
                  return (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${currentStatus.classes}`}>
                      {currentStatus.label}
                    </span>
                  );
                })()}
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-slate-100 ${priorityColors[ticket.priority] || 'text-slate-500'}`}>
                  Priority: {ticket.priority}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-3">{ticket.category} • Owner: {ticket.owner}</p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative inline-flex border border-slate-200 rounded-lg overflow-hidden">
                <select
                  value={ticket.status}
                  onChange={(event) => updateTicket(ticket.id, event.target.value)}
                  className="appearance-none px-4 py-2 text-sm text-slate-700 bg-white pr-8"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <span className="pointer-events-none absolute right-2 top-2 text-slate-400">
                  <ChevronDown size={16} />
                </span>
              </div>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm"
                onClick={() => reassignTicket(ticket.id)}
              >
                <Users size={16} />
                Reassign
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm"
                onClick={() => updateTicket(ticket.id, 'resolved')}
              >
                <CheckCircle2 size={16} />
                Close ticket
              </button>
            </div>
          </div>
        ))}
        {filteredTickets.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-500">
            No tickets in this bucket.
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;
