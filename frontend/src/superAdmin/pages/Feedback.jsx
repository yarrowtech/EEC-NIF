import { useMemo, useState } from 'react';
import { MessageCircle, Send, CheckCircle2, Loader2 } from 'lucide-react';

const sentimentColors = {
  positive: 'text-emerald-600 bg-emerald-50',
  neutral: 'text-slate-600 bg-slate-100',
  negative: 'text-rose-600 bg-rose-50'
};

const statusLabel = {
  awaiting_response: 'Awaiting response',
  in_progress: 'In progress',
  resolved: 'Resolved'
};

const Feedback = ({ feedbackItems, onFeedbackUpdate }) => {
  const [draftResponses, setDraftResponses] = useState({});
  const pendingCount = useMemo(
    () => feedbackItems.filter((item) => item.status !== 'resolved').length,
    [feedbackItems]
  );

  const handleDraftChange = (id, value) => {
    setDraftResponses((prev) => ({ ...prev, [id]: value }));
  };

  const submitResponse = (id, status) => {
    if (!draftResponses[id]?.trim() && status === 'resolved') {
      return;
    }
    onFeedbackUpdate(id, {
      status,
      response: draftResponses[id]?.trim() || undefined
    });
    setDraftResponses((prev) => ({ ...prev, [id]: '' }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase text-slate-400">Voice of schools</p>
            <h2 className="text-2xl font-semibold text-slate-800">Feedback desk</h2>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="animate-spin text-amber-500" size={16} />
            <span className="text-slate-500">{pendingCount} conversations open</span>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {feedbackItems.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-base font-semibold text-slate-800">{item.topic}</p>
                <p className="text-sm text-slate-500">{item.schoolName} • {new Date(item.submittedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sentimentColors[item.sentiment]}`}>
                  {item.sentiment.toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {statusLabel[item.status]}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">{item.message}</p>

            {item.response && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-700 mb-1">Latest response</p>
                <p>{item.response}</p>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-xs uppercase text-slate-400 tracking-wide">Respond</label>
              <textarea
                rows="3"
                placeholder="Capture action items or send an update to the school"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                value={draftResponses[item.id] ?? ''}
                onChange={(event) => handleDraftChange(item.id, event.target.value)}
              />
              <div className="flex flex-wrap gap-3">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm"
                  onClick={() => submitResponse(item.id, 'in_progress')}
                >
                  <MessageCircle size={16} />
                  Acknowledge
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm"
                  onClick={() => submitResponse(item.id, 'resolved')}
                >
                  <Send size={16} />
                  Send & resolve
                </button>
                {item.status === 'resolved' && (
                  <span className="flex items-center gap-2 text-xs text-emerald-600">
                    <CheckCircle2 size={14} />
                    Marked resolved
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {feedbackItems.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-500">
            No feedback messages yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
