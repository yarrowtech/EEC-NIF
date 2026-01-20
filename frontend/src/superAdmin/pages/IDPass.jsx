import { useMemo, useRef, useState } from 'react';
import { Shield, BadgeCheck, Download, RefreshCw, Copy } from 'lucide-react';
import html2canvas from 'html2canvas';

const createPass = () => {
  const idSuffix = Math.floor(100000 + Math.random() * 900000);
  const accessPin = Math.floor(100000 + Math.random() * 900000).toString();
  return {
    id: `EEC-SA-${idSuffix}`,
    accessPin,
    issuedAt: new Date().toISOString()
  };
};

const IDPass = ({ profile }) => {
  const [pass, setPass] = useState(() => createPass());
  const cardRef = useRef(null);
  const issuedDisplay = useMemo(
    () => new Date(pass.issuedAt).toLocaleString(),
    [pass.issuedAt]
  );

  const handleRegenerate = () => {
    setPass(createPass());
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: '#f8fafc',
      scale: 2
    });
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${pass.id}.png`;
    link.click();
  };

  const copyValue = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      console.error('Unable to copy', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase text-slate-400">Identity</p>
          <h1 className="text-2xl font-semibold text-slate-800">Super Admin ID Pass</h1>
          <p className="text-sm text-slate-500">Use this secure ID while accessing the dedicated portal.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRegenerate}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700"
          >
            <RefreshCw size={16} />
            Generate new pass
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white"
          >
            <Download size={16} />
            Download card
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div
            ref={cardRef}
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl text-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Shield size={28} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-200">EEC PLATFORM</p>
                  <p className="text-lg font-semibold">Super Admin Access</p>
                </div>
              </div>
              <BadgeCheck className="text-emerald-400" size={32} />
            </div>

            <div className="mt-8 space-y-4">
              <div>
                <p className="text-xs text-slate-300">Name</p>
                <p className="text-xl font-semibold">{profile.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-300">Role</p>
                  <p className="text-base font-semibold">{profile.role}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-300">Portal</p>
                  <p className="text-base font-semibold">super-admin.eec.in</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-300">Super Admin ID</p>
                <p className="text-lg font-semibold tracking-wider">{pass.id}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-300">One-Time Access PIN</p>
                  <p className="text-xl font-semibold tracking-[0.3em]">{pass.accessPin}</p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>Issued</p>
                  <p>{issuedDisplay}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-[11px] text-slate-400">
              Valid only for verified Super Admins • Rotate pins after every session • Contact support@eec.in for revocation
            </div>
          </div>
        </div>

        <div className="lg:w-80 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            <p className="text-sm font-semibold text-slate-800">Secure Sharing</p>
            <div className="space-y-2">
              <button
                className="w-full flex items-center justify-between text-sm border border-slate-200 rounded-lg px-3 py-2"
                onClick={() => copyValue(pass.id)}
              >
                <span>ID: {pass.id}</span>
                <Copy size={14} className="text-slate-500" />
              </button>
              <button
                className="w-full flex items-center justify-between text-sm border border-slate-200 rounded-lg px-3 py-2"
                onClick={() => copyValue(pass.accessPin)}
              >
                <span>PIN: {pass.accessPin}</span>
                <Copy size={14} className="text-slate-500" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            <p className="text-sm font-semibold text-slate-800">Best Practices</p>
            <ul className="text-sm text-slate-600 list-disc pl-4 space-y-1">
              <li>Store the ID pass in an encrypted vault.</li>
              <li>Rotate the access PIN each login.</li>
              <li>Restrict sharing to trusted devices.</li>
              <li>Contact platform security if compromised.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDPass;
