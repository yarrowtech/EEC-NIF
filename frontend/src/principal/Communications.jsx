import React, { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Mail, Phone, Search, Users, GraduationCap, Loader2 } from 'lucide-react';
import PrincipalChatPanel from './PrincipalChatPanel';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export default function Communications() {
  const [channelEmail, setChannelEmail] = useState(true);
  const [channelSms, setChannelSms] = useState(false);
  const [audience, setAudience] = useState('Teachers'); // Parents | Teachers | Staff | All
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [directory, setDirectory] = useState([]);
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [directoryError, setDirectoryError] = useState('');

  useEffect(() => {
    const fetchTeachers = async () => {
      setDirectoryLoading(true);
      setDirectoryError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Please sign in to load teachers');
        }
        const res = await fetch(`${API_BASE}/api/principal/teachers`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || 'Unable to load teachers');
        }
        const data = await res.json();
        const normalized = (Array.isArray(data) ? data : []).map((t) => ({
          id: t._id || t.id,
          role: 'Teacher',
          name: t.name || t.employeeCode || 'Teacher',
          subject: t.subject || '',
          department: t.department || '',
          email: t.email || '',
          phone: t.mobile || t.phone || '',
          campusName: t.campusName || '',
        }));
        setDirectory(normalized);
        setSelectedIds(new Set());
      } catch (err) {
        setDirectory([]);
        setDirectoryError(err.message || 'Unable to load teachers');
      } finally {
        setDirectoryLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const subjects = useMemo(() => {
    const options = new Set();
    directory.forEach((entry) => {
      if (entry.subject) options.add(entry.subject);
    });
    return Array.from(options).sort((a, b) => a.localeCompare(b));
  }, [directory]);

  const departments = useMemo(() => {
    const options = new Set();
    directory.forEach((entry) => {
      if (entry.department) options.add(entry.department);
    });
    return Array.from(options).sort((a, b) => a.localeCompare(b));
  }, [directory]);

  const filteredDirectory = useMemo(() => {
    let list = directory;

    if (audience !== 'All') {
      list = list.filter((c) => c.role.toLowerCase() === audience.toLowerCase());
    }

    if (selectedSubject) {
      list = list.filter((c) => (c.subject || '').toLowerCase() === selectedSubject.toLowerCase());
    }
    if (selectedDepartment) {
      list = list.filter((c) => (c.department || '').toLowerCase() === selectedDepartment.toLowerCase());
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.phone && c.phone.toLowerCase().includes(q)) ||
          (c.subject && c.subject.toLowerCase().includes(q)) ||
          (c.department && c.department.toLowerCase().includes(q))
      );
    }
    return list;
  }, [audience, selectedSubject, selectedDepartment, query, directory]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedIds(new Set(filteredDirectory.map((c) => c.id)));
  };
  const clearSelection = () => setSelectedIds(new Set());

  const smsCharCount = message.length;
  const smsSegments = Math.max(1, Math.ceil(smsCharCount / 160));

  const teacherCount = directory.length;
  const subjectCount = subjects.length;
  const departmentCount = departments.length;

  const canSend = (channelEmail || channelSms) && selectedIds.size > 0 && message.trim().length > 0;

  const handleSend = async () => {
    const recipients = directory.filter((c) => selectedIds.has(c.id));
    console.log('Sending via:', { email: channelEmail, sms: channelSms });
    console.log('Audience/Filters:', { audience, selectedSubject, selectedDepartment, query });
    console.log('Subject:', subject);
    console.log('Message:', message);
    console.log('Recipients:', recipients);
    alert(`Prepared to send ${channelEmail ? 'Email ' : ''}${channelEmail && channelSms ? '& ' : ''}${channelSms ? 'SMS ' : ''}to ${recipients.length} recipient(s).`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Communications</h1>
            <p className="text-yellow-100">Send Email and SMS to parents, teachers, and staff</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-right">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold">{teacherCount}</div>
              <div className="text-xs text-yellow-100 flex items-center gap-1 justify-end">
                <Users className="w-3 h-3" />
                Verified Teachers
              </div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold">{subjectCount || departmentCount || 0}</div>
              <div className="text-xs text-yellow-100 flex items-center gap-1 justify-end">
                <GraduationCap className="w-3 h-3" />
                Subjects & Departments
              </div>
            </div>
          </div>
        </div>
      </div>

      {directoryError && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">
          {directoryError}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Channels */}
          <div className="flex items-center gap-2 flex-wrap md:col-span-2">
            <button
              onClick={() => setChannelEmail((v) => !v)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${channelEmail ? 'bg-amber-100 border-amber-300 text-amber-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <Mail className="w-4 h-4"/> Email
            </button>
            <button
              onClick={() => setChannelSms((v) => !v)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${channelSms ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <Phone className="w-4 h-4"/> SMS
            </button>
          </div>

          {/* Audience */}
          <div className="min-w-0">
            <label className="text-xs text-amber-700">Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option>Parents</option>
              <option>Teachers</option>
              <option>Staff</option>
              <option>All</option>
            </select>
          </div>

          {/* Subject */}
          <div className="min-w-0">
            <label className="text-xs text-amber-700">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">All Subjects</option>
              {subjects.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div className="min-w-0">
            <label className="text-xs text-amber-700">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="md:col-span-2 min-w-0">
            <label className="text-xs text-amber-700">Search</label>
            <div className="mt-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, phone"
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Selection actions */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-amber-800">
            {selectedIds.size} selected • {filteredDirectory.length} match{filteredDirectory.length !== 1 ? 'es' : ''}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={selectAllFiltered}
              disabled={filteredDirectory.length === 0 || directoryLoading}
              className="text-sm px-3 py-1.5 rounded-lg bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-amber-800 disabled:opacity-60"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              disabled={selectedIds.size === 0}
              className="text-sm px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 disabled:opacity-60"
            >
              Clear
            </button>
          </div>
        </div>
        {audience !== 'Teachers' && audience !== 'All' && (
          <p className="text-xs text-amber-700 mt-2">
            Parent and staff directories are coming soon. Switch to Teachers or All to view available contacts.
          </p>
        )}
      </div>

      {/* Directory + Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Directory */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-yellow-100 overflow-hidden">
          <div className="p-4 border-b border-yellow-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-amber-900">Recipients</h3>
          </div>
          <div className="divide-y divide-yellow-50 max-h-[440px] overflow-auto">
            {directoryLoading && (
              <div className="p-6 flex items-center gap-2 text-amber-700">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading teacher directory...
              </div>
            )}
            {!directoryLoading && filteredDirectory.map((c) => (
              <label key={c.id} className="flex items-center gap-4 p-4 hover:bg-yellow-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.has(c.id)}
                  onChange={() => toggleSelect(c.id)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-amber-900">{c.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.role === 'Teacher' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'}`}>{c.role}</span>
                  </div>
                  <div className="text-sm text-amber-700 truncate">{c.email} {c.email && c.phone ? '• ' : ''}{c.phone}</div>
                </div>
                <div className="text-sm text-amber-700 w-32 text-right">
                  {c.subject || c.department || 'Faculty'}
                </div>
              </label>
            ))}
            {!directoryLoading && filteredDirectory.length === 0 && (
              <div className="p-6 text-center text-amber-700">No matches found.</div>
            )}
          </div>
        </div>
        {/* Composer */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-yellow-100 p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">Compose Message</h3>
          {channelEmail && (
            <div className="mb-3">
              <label className="text-xs text-amber-700">Subject (Email)</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Subject line"
              />
            </div>
          )}
          <div className="mb-2">
            <label className="text-xs text-amber-700">Message</label>
            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Type your announcement or message here..."
            />
            {channelSms && (
              <div className="text-xs text-amber-700 mt-1">{smsCharCount} characters • ~{smsSegments} SMS segment{smsSegments>1?'s':''}</div>
            )}
          </div>
          <button
            disabled={!canSend}
            onClick={handleSend}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${canSend ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            <MessageSquare className="w-4 h-4" />
            {channelEmail && channelSms ? 'Send Email & SMS' : channelEmail ? 'Send Email' : 'Send SMS'}
          </button>
          <div className="text-xs text-amber-700 mt-2">This is a demo UI. Integrate with backend APIs to actually deliver messages.</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-yellow-100 shadow-sm p-6">
        <PrincipalChatPanel />
      </div>
    </div>
  );
}
