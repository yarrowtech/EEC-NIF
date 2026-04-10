import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Building2, Mail, Phone, MapPin, FileText,
  Calendar, Hash, Clock, CheckCircle2, AlertCircle, Ban,
  GraduationCap, Users, BookOpen, Layers, ExternalLink,
  ChevronDown, ChevronUp, Info
} from 'lucide-react';

/* ─── helpers ─── */
const asText = (value) => String(value || '').trim();

const extractDocuments = (rawDocs) => {
  if (!rawDocs) return [];
  if (Array.isArray(rawDocs)) {
    return rawDocs.map((doc, i) => {
      if (!doc) return null;
      if (typeof doc === 'string') return { label: `Document ${i + 1}`, url: doc };
      const label = asText(doc.label || doc.name || doc.type || `Document ${i + 1}`);
      const url   = asText(doc.url || doc.link || doc.secure_url || doc.path);
      return url ? { label, url } : null;
    }).filter(Boolean);
  }
  if (typeof rawDocs === 'object') {
    return Object.entries(rawDocs).map(([key, value], i) => {
      if (!value) return null;
      if (typeof value === 'string') return { label: key || `Document ${i + 1}`, url: value };
      const label = asText(value.label || value.name || key || `Document ${i + 1}`);
      const url   = asText(value.url || value.link || value.secure_url || value.path);
      return url ? { label, url } : null;
    }).filter(Boolean);
  }
  return [];
};

const labelize = (key = '') =>
  String(key || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/^./, (ch) => ch.toUpperCase());

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (Array.isArray(value)) {
    if (!value.length) return 'N/A';
    return value.map((item) => {
      if (item === null || item === undefined || item === '') return null;
      if (typeof item === 'object')
        return Object.entries(item).filter(([, v]) => v !== null && v !== undefined && v !== '').map(([k, v]) => `${labelize(k)}: ${v}`).join(', ');
      return String(item);
    }).filter(Boolean).join(' | ');
  }
  if (typeof value === 'object') {
    const clean = Object.entries(value).filter(([, v]) => v !== null && v !== undefined && v !== '');
    if (!clean.length) return 'N/A';
    return clean.map(([k, v]) => `${labelize(k)}: ${v}`).join(' | ');
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

/* ─── Status config ─── */
const STATUS_META = {
  pending:  { label: 'Pending',   cls: 'bg-amber-100 text-amber-700 border-amber-200',      icon: Clock,        bar: 'bg-amber-400' },
  review:   { label: 'Need Info', cls: 'bg-blue-100 text-blue-700 border-blue-200',         icon: AlertCircle,  bar: 'bg-blue-400' },
  rejected: { label: 'Rejected',  cls: 'bg-rose-100 text-rose-700 border-rose-200',         icon: Ban,          bar: 'bg-rose-500' },
  approved: { label: 'Approved',  cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2, bar: 'bg-emerald-500' },
};

/* ─── Info row helper ─── */
const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value || value === 'N/A') return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 shrink-0">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-sm text-slate-700 font-medium mt-0.5 wrap-break-word">{value}</p>
      </div>
    </div>
  );
};

/* ─── Field grid card ─── */
const FieldCard = ({ label, value }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
    <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">{label}</p>
    <p className="text-sm text-slate-700 font-medium wrap-break-word">{formatValue(value)}</p>
  </div>
);

/* ─── Collapsible section ─── */
const Section = ({ title, icon: Icon, iconColor = 'text-slate-500', iconBg = 'bg-slate-100', children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${iconBg}`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
          <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-6 py-5">{children}</div>}
    </div>
  );
};

/* ─── Main component ─── */
const RequestDetails = ({ requests = [] }) => {
  const { requestId } = useParams();
  const [showRaw, setShowRaw] = useState(false);

  const request = useMemo(
    () => requests.find((item) => String(item?.id) === String(requestId)) || null,
    [requests, requestId]
  );

  const logoUrl = asText(
    request?.logo?.secure_url || request?.logo?.url || request?.logo?.path ||
    (typeof request?.logo === 'string' ? request.logo : '')
  );
  const documents = extractDocuments(request?.verificationDocs);
  const campuses  = Array.isArray(request?.campusList) ? request.campusList
    : Array.isArray(request?.campuses) ? request.campuses : [];

  const status    = String(request?.status || 'pending').toLowerCase();
  const statusMeta = STATUS_META[status] || STATUS_META.pending;
  const StatusIcon = statusMeta.icon;

  const knownKeys = new Set([
    'id','schoolName','name','board','schoolType','academicYearStructure','estimatedUsers','studentCount',
    'contactPerson','contactEmail','officialEmail','contactPhone','submittedAt','updatedAt','status','notes',
    'address','campuses','campusList','campusName','verificationDocs','logo','source','registrationStatus',
  ]);
  const extraRows = useMemo(
    () => Object.entries(request || {})
      .filter(([key, value]) => !knownKeys.has(key) && value !== null && value !== undefined && value !== '')
      .map(([key, value]) => ({ label: labelize(key), value })),
    [request]
  );

  /* ── Not found ── */
  if (!request) {
    return (
      <div className="space-y-4">
        <Link to="/super-admin/requests" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={14} /> Back to requests
        </Link>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="text-slate-500 font-medium">Request not found.</p>
          <p className="text-sm text-slate-400 mt-1">ID: {requestId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl">

      {/* Back link */}
      <Link
        to="/super-admin/requests"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors"
      >
        <ArrowLeft size={14} /> Back to requests
      </Link>

      {/* ── Hero card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Status accent bar */}
        <div className={`h-1.5 ${statusMeta.bar}`} />

        <div className="px-6 py-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          {/* Logo + name */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
              {logoUrl
                ? <img src={logoUrl} alt={request.schoolName} className="w-full h-full object-cover" />
                : <Building2 className="w-7 h-7 text-slate-400" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 leading-tight">
                {request.schoolName || request.name || 'Unnamed School'}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${statusMeta.cls}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusMeta.label}
                </span>
                {request.schoolType && (
                  <span className="px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200 text-xs font-semibold">
                    {request.schoolType}
                  </span>
                )}
                {request.board && (
                  <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold">
                    {request.board}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick meta */}
          <div className="flex flex-col gap-1.5 text-xs text-slate-500 shrink-0 min-w-40">
            <span className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono text-slate-600 truncate">{request.id}</span>
            </span>
            {request.submittedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(request.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            )}
            {(request.studentCount || request.estimatedUsers) && (
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {request.studentCount || request.estimatedUsers} students
              </span>
            )}
          </div>
        </div>

        {/* Notes banner */}
        {request.notes && (
          <div className="mx-6 mb-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
            <span><span className="font-semibold">Note: </span>{request.notes}</span>
          </div>
        )}
      </div>

      {/* ── Contact + Campus side by side ── */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Contact */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-sky-100"><Mail className="w-4 h-4 text-sky-600" /></div>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Contact</h2>
          </div>
          <InfoRow icon={Users}   label="Contact Person" value={request.contactPerson} />
          <InfoRow icon={Mail}    label="Email"          value={request.contactEmail || request.officialEmail} />
          <InfoRow icon={Phone}   label="Phone"          value={request.contactPhone} />
          <InfoRow icon={MapPin}  label="Address"        value={request.address} />
          {request.updatedAt && (
            <InfoRow icon={Calendar} label="Last Updated" value={new Date(request.updatedAt).toLocaleString()} />
          )}
        </div>

        {/* Campuses */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-violet-100"><Layers className="w-4 h-4 text-violet-600" /></div>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Campuses
              {campuses.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-bold normal-case">{campuses.length}</span>
              )}
            </h2>
          </div>
          {campuses.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-center text-sm text-slate-400">
              <Layers className="w-7 h-7 mx-auto mb-1.5 text-slate-200" />
              No campuses listed.
            </div>
          ) : (
            <div className="space-y-2">
              {campuses.map((campus, i) => (
                <div key={campus?.id || campus?._id || campus?.name || i}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                    <Building2 className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{campus?.name || `Campus ${i + 1}`}</p>
                    <p className="text-xs text-slate-400">{campus?.campusType || 'Campus'}</p>
                    {campus?.address && <p className="text-xs text-slate-500 mt-0.5">📍 {campus.address}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── School details ── */}
      <Section title="School Registration Details" icon={BookOpen} iconBg="bg-emerald-100" iconColor="text-emerald-600">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { label: 'School Name',               value: request.schoolName || request.name },
            { label: 'Board',                     value: request.board },
            { label: 'School Type',               value: request.schoolType },
            { label: 'Academic Year Structure',   value: request.academicYearStructure },
            { label: 'Estimated Users / Students',value: request.estimatedUsers || request.studentCount },
            { label: 'Registration Status',       value: request.status },
            { label: 'Request ID',                value: request.id },
            { label: 'Submitted At',              value: request.submittedAt ? new Date(request.submittedAt).toLocaleString() : '' },
            { label: 'Updated At',                value: request.updatedAt  ? new Date(request.updatedAt).toLocaleString()  : '' },
          ].filter(r => r.value).map((r) => (
            <FieldCard key={r.label} label={r.label} value={r.value} />
          ))}
        </div>
      </Section>

      {/* ── Contact & address details ── */}
      <Section title="Contact & Address Details" icon={MapPin} iconBg="bg-sky-100" iconColor="text-sky-600">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { label: 'Contact Person', value: request.contactPerson },
            { label: 'Official Email', value: request.contactEmail || request.officialEmail },
            { label: 'Contact Phone',  value: request.contactPhone },
            { label: 'Address',        value: request.address },
          ].filter(r => r.value).map((r) => (
            <FieldCard key={r.label} label={r.label} value={r.value} />
          ))}
        </div>
      </Section>

      {/* ── Additional fields ── */}
      {extraRows.length > 0 && (
        <Section title="Additional School Fields" icon={Info} iconBg="bg-amber-100" iconColor="text-amber-600" defaultOpen={false}>
          <div className="grid gap-3 md:grid-cols-2">
            {extraRows.map((r) => <FieldCard key={r.label} label={r.label} value={r.value} />)}
          </div>
        </Section>
      )}

      {/* ── Verification documents ── */}
      <Section title="Verification Documents" icon={FileText} iconBg="bg-rose-100" iconColor="text-rose-600">
        {documents.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-center text-sm text-slate-400">
            <FileText className="w-7 h-7 mx-auto mb-1.5 text-slate-200" />
            No documents uploaded.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {documents.map((doc, i) => (
              <a
                key={`${doc.url}-${i}`}
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-violet-50 hover:border-violet-200 transition-all group"
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm group-hover:border-violet-200">
                  <FileText className="w-4 h-4 text-violet-500" />
                </div>
                <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-violet-700 truncate">{doc.label}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-500 shrink-0" />
              </a>
            ))}
          </div>
        )}
      </Section>

      {/* ── Raw payload (collapsed) ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowRaw((o) => !o)}
          className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100">
              <GraduationCap className="w-4 h-4 text-slate-500" />
            </div>
            <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Raw Payload</span>
          </div>
          {showRaw ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        {showRaw && (
          <div className="px-6 py-5">
            <pre className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-4 overflow-auto max-h-96 leading-relaxed">
              {JSON.stringify(request, null, 2)}
            </pre>
          </div>
        )}
      </div>

    </div>
  );
};

export default RequestDetails;
