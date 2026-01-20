import { useMemo, useState } from 'react';
import { Send, Activity, ShieldCheck, Bell, ClipboardList } from 'lucide-react';

const statusStyle = {
  pending: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700'
};

const Operations = ({
  announcements,
  onCreateAnnouncement,
  complianceItems,
  onComplianceUpdate,
  activityFeed
}) => {
  const [form, setForm] = useState({
    title: '',
    message: '',
    audience: 'All schools'
  });
  const [sending, setSending] = useState(false);

  const pendingCompliance = useMemo(
    () => complianceItems.filter((item) => item.status !== 'completed').length,
    [complianceItems]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    setSending(true);
    setTimeout(() => {
      onCreateAnnouncement(form);
      setForm({ title: '', message: '', audience: 'All schools' });
      setSending(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase text-slate-400">Operations</p>
            <h2 className="text-2xl font-semibold text-slate-800">Command centre</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 border border-slate-200 rounded-xl">
              <p className="text-xs uppercase text-slate-400">Pending compliance</p>
              <p className="text-xl font-semibold text-slate-800">{pendingCompliance}</p>
            </div>
            <div className="p-3 border border-slate-200 rounded-xl">
              <p className="text-xs uppercase text-slate-400">Scheduled broadcasts</p>
              <p className="text-xl font-semibold text-slate-800">
                {announcements.filter((item) => item.status !== 'sent').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-50 text-sky-500">
              <Bell size={18} />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Broadcasts</p>
              <h3 className="text-lg font-semibold text-slate-800">Send announcement</h3>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase text-slate-500">Audience</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1"
                value={form.audience}
                onChange={(event) => setForm((prev) => ({ ...prev, audience: event.target.value }))}
              >
                <option>All schools</option>
                <option>Premium schools</option>
                <option>Pending onboarding</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase text-slate-500">Title</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1"
                placeholder="Maintenance alert, feature rollout, etc"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs uppercase text-slate-500">Message</label>
              <textarea
                rows="4"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1"
                placeholder="Share impact, timelines and contact details"
                value={form.message}
                onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-600 text-white py-2 text-sm disabled:opacity-60"
              disabled={sending}
            >
              <Send size={16} />
              {sending ? 'Scheduling...' : 'Schedule broadcast'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-500">
              <ClipboardList size={18} />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Compliance</p>
              <h3 className="text-lg font-semibold text-slate-800">Controls tracker</h3>
            </div>
          </div>
          <div className="space-y-3">
            {complianceItems.map((item) => (
              <div key={item.id} className="border border-slate-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">Owner: {item.owner} • Due {item.dueDate}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[item.status] || 'bg-slate-100 text-slate-600'}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    className="text-xs px-3 py-1 border border-slate-200 rounded-lg text-slate-600"
                    onClick={() => onComplianceUpdate(item.id, 'in_progress')}
                  >
                    Progress
                  </button>
                  <button
                    className="text-xs px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600"
                    onClick={() => onComplianceUpdate(item.id, 'completed')}
                  >
                    Mark done
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-violet-50 text-violet-500">
            <Activity size={18} />
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">Timeline</p>
            <h3 className="text-lg font-semibold text-slate-800">Operational heartbeat</h3>
          </div>
        </div>
        <div className="space-y-4">
          {activityFeed.map((event) => (
            <div key={event.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="flex-1 w-px bg-slate-200" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{event.label}</p>
                <p className="text-xs text-slate-500">{new Date(event.timestamp).toLocaleString()}</p>
              </div>
              <div>
                {event.type === 'incident' && (
                  <span className="px-2 py-1 text-xs rounded-full bg-rose-50 text-rose-600">Incident</span>
                )}
                {event.type === 'approval' && (
                  <span className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-600">Approval</span>
                )}
                {event.type === 'broadcast' && (
                  <span className="px-2 py-1 text-xs rounded-full bg-sky-50 text-sky-600">Broadcast</span>
                )}
                {event.type === 'compliance' && (
                  <span className="px-2 py-1 text-xs rounded-full bg-amber-50 text-amber-600">Compliance</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-500">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">Broadcast log</p>
            <h3 className="text-lg font-semibold text-slate-800">Recent announcements</h3>
          </div>
        </div>
        <div className="space-y-3">
          {announcements.map((item) => (
            <div key={item.id} className="border border-slate-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-800">{item.title}</p>
                <span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-slate-600 mt-2">{item.message}</p>
              <p className="text-xs text-slate-500 mt-2">Audience: {item.audience}</p>
            </div>
          ))}
          {announcements.length === 0 && (
            <p className="text-sm text-slate-500">No broadcasts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Operations;
