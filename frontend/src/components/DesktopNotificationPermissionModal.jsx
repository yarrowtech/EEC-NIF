import React from 'react';
import { Bell, BellRing, Shield, X } from 'lucide-react';

const DesktopNotificationPermissionModal = ({
  open = false,
  onAllow,
  onLater,
  pendingCount = 0,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/80">Desktop Alerts</p>
              <h3 className="text-base font-bold">Enable Browser Notifications</h3>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-800">Notification Preview</p>
            <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-start gap-2">
                <Bell className="mt-0.5 h-4 w-4 text-indigo-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">New school update</p>
                  <p className="text-xs text-slate-500">You will get instant desktop alerts for panel notifications.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-indigo-50 p-2.5 text-xs text-indigo-700">
            <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              You can disable this anytime from browser settings.
              {pendingCount > 0 ? ` ${pendingCount} new update${pendingCount > 1 ? 's are' : ' is'} waiting.` : ''}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onLater}
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <span className="inline-flex items-center gap-1">
                <X className="h-3.5 w-3.5" />
                Not now
              </span>
            </button>
            <button
              type="button"
              onClick={onAllow}
              className="flex-1 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Enable Alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopNotificationPermissionModal;

