import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, FileText, ArrowLeft } from 'lucide-react';

const asText = (value) => String(value || '').trim();

const extractDocuments = (rawDocs) => {
  if (!rawDocs) return [];

  if (Array.isArray(rawDocs)) {
    return rawDocs
      .map((doc, index) => {
        if (!doc) return null;
        if (typeof doc === 'string') {
          return { label: `Document ${index + 1}`, url: doc };
        }
        const label = asText(doc.label || doc.name || doc.type || `Document ${index + 1}`);
        const url = asText(doc.url || doc.link || doc.secure_url || doc.path);
        if (!url) return null;
        return { label, url };
      })
      .filter(Boolean);
  }

  if (typeof rawDocs === 'object') {
    return Object.entries(rawDocs)
      .map(([key, value], index) => {
        if (!value) return null;
        if (typeof value === 'string') {
          return { label: key || `Document ${index + 1}`, url: value };
        }
        const label = asText(value.label || value.name || key || `Document ${index + 1}`);
        const url = asText(value.url || value.link || value.secure_url || value.path);
        if (!url) return null;
        return { label, url };
      })
      .filter(Boolean);
  }

  return [];
};

const labelize = (key = '') =>
  String(key || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (ch) => ch.toUpperCase());

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (Array.isArray(value)) {
    if (!value.length) return 'N/A';
    return value
      .map((item) => {
        if (item === null || item === undefined || item === '') return null;
        if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
          return String(item);
        }
        if (typeof item === 'object') {
          return Object.entries(item)
            .filter(([, v]) => v !== null && v !== undefined && v !== '')
            .map(([k, v]) => `${labelize(k)}: ${String(v)}`)
            .join(', ');
        }
        return String(item);
      })
      .filter(Boolean)
      .join(' | ');
  }
  if (typeof value === 'object') {
    const clean = Object.entries(value).filter(([, v]) => v !== null && v !== undefined && v !== '');
    if (!clean.length) return 'N/A';
    return clean.map(([k, v]) => `${labelize(k)}: ${String(v)}`).join(' | ');
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

const DetailGrid = ({ title, rows = [] }) => {
  const visibleRows = rows.filter((row) => row && row.label);
  if (!visibleRows.length) return null;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">{title}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {visibleRows.map((row) => (
          <div key={row.label} className="rounded-lg border border-slate-100 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">{row.label}</p>
            <p className="text-sm text-slate-700 mt-1 break-words">{formatValue(row.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const RequestDetails = ({ requests = [] }) => {
  const { requestId } = useParams();

  const request = useMemo(
    () => requests.find((item) => String(item?.id) === String(requestId)) || null,
    [requests, requestId]
  );

  const logoUrl = asText(request?.logo?.secure_url || request?.logo?.url || request?.logo?.path || request?.logo);
  const documents = extractDocuments(request?.verificationDocs);
  const campuses = Array.isArray(request?.campusList)
    ? request.campusList
    : Array.isArray(request?.campuses)
    ? request.campuses
    : [];
  const structuredCoreRows = useMemo(
    () => [
      { label: 'School Name', value: request?.schoolName || request?.name },
      { label: 'Board', value: request?.board },
      { label: 'School Type', value: request?.schoolType },
      { label: 'Academic Year Structure', value: request?.academicYearStructure },
      { label: 'Estimated Users', value: request?.estimatedUsers || request?.studentCount },
      { label: 'Registration Status', value: request?.status },
      { label: 'Request ID', value: request?.id },
      { label: 'Submitted At', value: request?.submittedAt ? new Date(request.submittedAt).toLocaleString() : '' },
      { label: 'Updated At', value: request?.updatedAt ? new Date(request.updatedAt).toLocaleString() : '' },
      { label: 'Notes', value: request?.notes },
    ],
    [request]
  );
  const contactRows = useMemo(
    () => [
      { label: 'Contact Person', value: request?.contactPerson },
      { label: 'Official Email', value: request?.contactEmail || request?.officialEmail },
      { label: 'Contact Phone', value: request?.contactPhone },
      { label: 'Address', value: request?.address },
    ],
    [request]
  );
  const knownKeys = new Set([
    'id', 'schoolName', 'name', 'board', 'schoolType', 'academicYearStructure', 'estimatedUsers', 'studentCount',
    'contactPerson', 'contactEmail', 'officialEmail', 'contactPhone', 'submittedAt', 'updatedAt', 'status', 'notes',
    'address', 'campuses', 'campusList', 'campusName', 'verificationDocs', 'logo', 'source'
  ]);
  const extraRows = useMemo(
    () =>
      Object.entries(request || {})
        .filter(([key, value]) => !knownKeys.has(key) && value !== null && value !== undefined && value !== '')
        .map(([key, value]) => ({ label: labelize(key), value })),
    [request]
  );

  if (!request) {
    return (
      <div className="space-y-4">
        <Link
          to="/super-admin/requests"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={14} />
          Back to requests
        </Link>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-500">
          Request details not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/super-admin/requests"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={14} />
        Back to requests
      </Link>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="h-16 w-16 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt={request.schoolName || 'School logo'} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="text-slate-500" size={28} />
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-800">{request.schoolName || 'School'}</h1>
            <p className="text-sm text-slate-500">
              {request.board || 'Board not specified'} • {request.studentCount || 'N/A'} students
            </p>
            <p className="text-xs text-slate-500">Request ID: {request.id}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Contact</h2>
          <p className="text-sm text-slate-600 flex items-center gap-2">
            <Mail size={14} />
            {request.contactEmail || request.officialEmail || 'N/A'}
          </p>
          <p className="text-sm text-slate-600 flex items-center gap-2">
            <Phone size={14} />
            {request.contactPhone || request.contactPerson || 'N/A'}
          </p>
          <p className="text-sm text-slate-600 flex items-center gap-2">
            <MapPin size={14} />
            {request.address || 'Address not provided'}
          </p>
          <p className="text-xs text-slate-500">Submitted: {request.submittedAt ? new Date(request.submittedAt).toLocaleString() : 'N/A'}</p>
          <p className="text-xs text-slate-500">Status: {String(request.status || '').toUpperCase()}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Campuses</h2>
          {campuses.length === 0 ? (
            <p className="text-sm text-slate-500">No campuses listed.</p>
          ) : (
            <div className="space-y-2">
              {campuses.map((campus, index) => (
                <div key={`${campus?.id || campus?._id || campus?.name || index}`} className="rounded-lg border border-slate-100 p-3">
                  <p className="text-sm font-medium text-slate-700">{campus?.name || `Campus ${index + 1}`}</p>
                  <p className="text-xs text-slate-500">{campus?.campusType || 'Campus'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DetailGrid title="School Registration Details" rows={structuredCoreRows} />
      <DetailGrid title="Contact & Address Details" rows={contactRows} />
      <DetailGrid title="Additional School Fields" rows={extraRows} />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Verification Documents</h2>
        {documents.length === 0 ? (
          <p className="text-sm text-slate-500">No documents uploaded.</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc, index) => (
              <a
                key={`${doc.url}-${index}`}
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-50"
              >
                <FileText size={14} />
                {doc.label}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Raw Payload</h2>
        <pre className="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-4 overflow-auto max-h-[360px]">
{JSON.stringify(request, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default RequestDetails;
