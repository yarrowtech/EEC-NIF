import { useMemo, useState } from 'react';
import { KeySquare, RefreshCw, Copy, Eye, EyeOff, ShieldCheck, Search } from 'lucide-react';

const statusLabels = {
  not_generated: { label: 'Not generated', classes: 'bg-slate-100 text-slate-600' },
  generated: { label: 'Generated', classes: 'bg-emerald-100 text-emerald-600' },
  reset_sent: { label: 'Reset sent', classes: 'bg-amber-100 text-amber-700' }
};

const Credentials = ({ requests, credentialState, onGenerateCredential, onResetCredential }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const data = useMemo(() => {
    return requests.map((school) => ({
      ...school,
      credential: credentialState[school.id] || {
        password: '',
        status: 'not_generated',
        lastGenerated: null,
        lastReset: null
      }
    }));
  }, [requests, credentialState]);

  const filtered = data.filter((school) =>
    school.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generatedCount = data.filter((school) => school.credential.status !== 'not_generated').length;
  const recentResets = data.filter((school) => {
    if (!school.credential.lastReset) return false;
    return Date.now() - new Date(school.credential.lastReset).getTime() <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  const toggleVisibility = (schoolId) => {
    setVisiblePasswords((prev) => ({ ...prev, [schoolId]: !prev[schoolId] }));
  };

  const handleCopy = async (value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      console.error('Clipboard copy failed', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase text-slate-400">Security controls</p>
            <h2 className="text-2xl font-semibold text-slate-800">Password generation & reset</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="border border-slate-200 rounded-xl p-3">
              <p className="text-xs uppercase text-slate-400">Generated</p>
              <p className="text-xl font-semibold text-slate-800">{generatedCount}</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-3">
              <p className="text-xs uppercase text-slate-400">Reset in 7 days</p>
              <p className="text-xl font-semibold text-slate-800">{recentResets}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 md:flex-row">
          <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
            <Search size={16} className="text-slate-400" />
            <input
              className="bg-transparent flex-1 text-sm focus:outline-none"
              placeholder="Search school or email"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="text-xs text-slate-500">
            Password policy: 12+ chars, mixed case, number & symbol
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((school) => {
          const status = statusLabels[school.credential.status] || statusLabels.not_generated;
          const passwordVisible = visiblePasswords[school.id];
          const passwordValue = passwordVisible ? school.credential.password : school.credential.password ? '••••••••••' : '';

          return (
            <div key={school.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-800">{school.schoolName}</p>
                  <p className="text-sm text-slate-500">{school.contactEmail} • {school.board}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.classes}`}>
                    {status.label}
                  </span>
                  {school.credential.lastGenerated && (
                    <span className="text-xs text-slate-500">
                      Generated {new Date(school.credential.lastGenerated).toLocaleString()}
                    </span>
                  )}
                  {school.credential.lastReset && (
                    <span className="text-xs text-amber-600">
                      Reset {new Date(school.credential.lastReset).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="md:flex md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <KeySquare className="text-slate-500" size={20} />
                  <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
                    <span className="font-mono text-sm text-slate-800">
                      {passwordValue || 'Generate a secure password'}
                    </span>
                    {school.credential.password && (
                      <button
                        className="text-slate-500 hover:text-slate-800"
                        onClick={() => toggleVisibility(school.id)}
                        title={passwordVisible ? 'Hide password' : 'Show password'}
                      >
                        {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                    {school.credential.password && (
                      <button
                        className="text-slate-500 hover:text-slate-800"
                        onClick={() => handleCopy(school.credential.password)}
                        title="Copy password"
                      >
                        <Copy size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm"
                    onClick={() => onGenerateCredential(school.id)}
                  >
                    <ShieldCheck size={16} />
                    Generate
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm"
                    onClick={() => onResetCredential(school.id)}
                  >
                    <RefreshCw size={16} />
                    Send reset link
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-500">
            No schools found for "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
};

export default Credentials;
