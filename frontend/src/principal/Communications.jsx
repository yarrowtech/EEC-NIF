import React, { useMemo, useState } from 'react';
import { MessageSquare, Mail, Phone, Search, Users, GraduationCap } from 'lucide-react';

const classes = [
  { value: '1', label: 'Class 1' },
  { value: '2', label: 'Class 2' },
  { value: '3', label: 'Class 3' },
  { value: '4', label: 'Class 4' },
  { value: '5', label: 'Class 5' },
  { value: '6', label: 'Class 6' },
  { value: '7', label: 'Class 7' },
  { value: '8', label: 'Class 8' },
  { value: '9', label: 'Class 9' },
  { value: '10', label: 'Class 10' },
  { value: '11', label: 'Class 11' },
  { value: '12', label: 'Class 12' },
];

const sections = ['A', 'B', 'C', 'D'];

// Mock directory of contacts for demo/testing purposes
const mockDirectory = [
  // Parents
  { id: 'p1', role: 'Parent', name: 'Anita Sharma', class: '1', section: 'A', email: 'anita@example.com', phone: '+91-900000001' },
  { id: 'p2', role: 'Parent', name: 'Rahul Verma', class: '1', section: 'B', email: 'rahul@example.com', phone: '+91-900000002' },
  { id: 'p3', role: 'Parent', name: 'Sonal Kapoor', class: '2', section: 'A', email: 'sonal@example.com', phone: '+91-900000003' },
  { id: 'p4', role: 'Parent', name: 'Deepak Singh', class: '3', section: 'C', email: 'deepak@example.com', phone: '+91-900000004' },
  // Teachers
  { id: 't1', role: 'Teacher', name: 'Mr. Iyer', class: '5', section: 'A', email: 'iyer@school.edu', phone: '+91-900000101' },
  { id: 't2', role: 'Teacher', name: 'Ms. Bose', class: '7', section: 'B', email: 'bose@school.edu', phone: '+91-900000102' },
  // Staff/Others
  { id: 's1', role: 'Staff', name: 'Office Admin', class: '-', section: '-', email: 'office@school.edu', phone: '+91-900000201' },
  { id: 's2', role: 'Staff', name: 'Transport Incharge', class: '-', section: '-', email: 'bus@school.edu', phone: '+91-900000202' },
];

export default function Communications() {
  const [channelEmail, setChannelEmail] = useState(true);
  const [channelSms, setChannelSms] = useState(false);
  const [audience, setAudience] = useState('Parents'); // Parents | Teachers | Staff | All
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const filteredDirectory = useMemo(() => {
    let list = mockDirectory;

    if (audience !== 'All') {
      list = list.filter((c) => c.role.toLowerCase() === audience.toLowerCase());
    }

    if (selectedClass) {
      list = list.filter((c) => c.class === selectedClass);
    }
    if (selectedSection) {
      list = list.filter((c) => c.section === selectedSection);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.phone && c.phone.toLowerCase().includes(q))
      );
    }
    return list;
  }, [audience, selectedClass, selectedSection, query]);

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

  const canSend = (channelEmail || channelSms) && selectedIds.size > 0 && message.trim().length > 0;

  const handleSend = async () => {
    const recipients = mockDirectory.filter((c) => selectedIds.has(c.id));
    // Placeholder: integrate with backend here when available
    console.log('Sending via:', { email: channelEmail, sms: channelSms });
    console.log('Audience/Filters:', { audience, selectedClass, selectedSection, query });
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
              <div className="text-2xl font-bold">{mockDirectory.filter(d=>d.role==='Parent').length}</div>
              <div className="text-xs text-yellow-100 flex items-center gap-1 justify-end"><GraduationCap className="w-3 h-3"/> Parents</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold">{mockDirectory.filter(d=>d.role!=='Parent').length}</div>
              <div className="text-xs text-yellow-100 flex items-center gap-1 justify-end"><Users className="w-3 h-3"/> Staff & Teachers</div>
            </div>
          </div>
        </div>
      </div>

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

          {/* Class */}
          <div className="min-w-0">
            <label className="text-xs text-amber-700">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div className="min-w-0">
            <label className="text-xs text-amber-700">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">All Sections</option>
              {sections.map((s) => (
                <option key={s} value={s}>{s}</option>
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
            <button onClick={selectAllFiltered} className="text-sm px-3 py-1.5 rounded-lg bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-amber-800">Select All</button>
            <button onClick={clearSelection} className="text-sm px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700">Clear</button>
          </div>
        </div>
      </div>

      {/* Directory + Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Directory */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-yellow-100 overflow-hidden">
          <div className="p-4 border-b border-yellow-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-amber-900">Recipients</h3>
          </div>
          <div className="divide-y divide-yellow-50 max-h-[440px] overflow-auto">
            {filteredDirectory.map((c) => (
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
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.role === 'Parent' ? 'bg-purple-100 text-purple-700' : c.role === 'Teacher' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'}`}>{c.role}</span>
                  </div>
                  <div className="text-sm text-amber-700">{c.email} • {c.phone}</div>
                </div>
                <div className="text-sm text-amber-700 w-24 text-right">{c.class !== '-' ? `Class ${c.class}-${c.section}` : '-'}</div>
              </label>
            ))}
            {filteredDirectory.length === 0 && (
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
    </div>
  );
}
