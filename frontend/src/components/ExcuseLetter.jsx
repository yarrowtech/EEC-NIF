import React, { useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Send,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Download,
  Eye
} from 'lucide-react';

const ExcuseLetter = () => {
  const API_BASE = useMemo(
    () => (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '').replace(/\/api$/, ''),
    []
  );

  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    className: '',
    sectionName: '',
    schoolName: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    dateFrom: '',
    dateTo: '',
    reason: '',
    reasonType: 'illness',
    additionalNotes: '',
    emergencyContact: ''
  });

  const [submittedLetters, setSubmittedLetters] = useState([]);
  const [activeTab, setActiveTab] = useState('new');
  const [previewLetter, setPreviewLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const reasonTypes = [
    { value: 'illness', label: 'Illness/Medical', icon: '🏥' },
    { value: 'family', label: 'Family Emergency', icon: '👨‍👩‍👧‍👦' },
    { value: 'personal', label: 'Personal Reasons', icon: '🏠' },
    { value: 'travel', label: 'Travel/Vacation', icon: '✈️' },
    { value: 'appointment', label: 'Medical Appointment', icon: '👨‍⚕️' },
    { value: 'other', label: 'Other', icon: '📝' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/student/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      let schoolName =
        data?.schoolName || data?.schoolInfo?.name || data?.school?.name || '';
      if (!schoolName) {
        const dashboardRes = await fetch(`${API_BASE}/api/student/auth/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (dashboardRes.ok) {
          const dash = await dashboardRes.json().catch(() => ({}));
          schoolName =
            dash?.profile?.schoolName || dash?.profile?.school?.name || schoolName;
        }
      }
      setFormData((prev) => ({
        ...prev,
        studentName: data?.name || '',
        rollNumber: data?.roll || '',
        className: data?.grade || data?.className || '',
        sectionName: data?.section || data?.sectionName || '',
        schoolName,
        parentName: data?.guardianName || data?.fatherName || data?.motherName || '',
        parentEmail: data?.guardianEmail || data?.email || '',
        parentPhone: data?.guardianPhone || data?.fatherPhone || data?.motherPhone || ''
      }));
    } catch (_) {}
  };

  const loadLetters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/excuse-letters/student`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => []);
      if (res.ok) setSubmittedLetters(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadLetters();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      const token = localStorage.getItem('token');
      const payload = {
        dateFrom: formData.dateFrom,
        dateTo: formData.dateTo,
        reason: formData.reason,
        reasonType: formData.reasonType,
        additionalNotes: formData.additionalNotes,
        emergencyContact: formData.emergencyContact
      };
      const res = await fetch(`${API_BASE}/api/excuse-letters/student`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Unable to submit');
      await loadLetters();
      setFormData((prev) => ({
        ...prev,
        dateFrom: '',
        dateTo: '',
        reason: '',
        reasonType: 'illness',
        additionalNotes: '',
        emergencyContact: ''
      }));
      setActiveTab('history');
    } catch (err) {
      setError(err.message || 'Unable to submit');
    } finally {
      setSaving(false);
    }
  };

  const generateLetterPreview = (letter) => {
    const data = letter || formData;
    return {
      date: new Date().toLocaleDateString(),
      content: `
Date: ${new Date().toLocaleDateString()}

To,
The Principal/Class Teacher
${data.schoolName || 'School'}

Subject: Request for Leave of Absence

Dear Sir/Madam,

I am writing to inform you that my ward, ${data.studentName}, studying in Class ${data.className}-${data.sectionName}, Roll Number: ${data.rollNumber}, will not be able to attend school from ${new Date(data.dateFrom).toLocaleDateString()} to ${new Date(data.dateTo).toLocaleDateString()}.

Reason for absence: ${data.reason}
Type: ${reasonTypes.find(r => r.value === data.reasonType)?.label || data.reasonType}

${data.additionalNotes ? `Additional Information: ${data.additionalNotes}` : ''}

I kindly request you to grant permission for the leave and excuse the absence.

Thank you for your consideration.

Yours sincerely,
${data.parentName}
(Parent/Guardian)

Contact Details:
Email: ${data.parentEmail}
Phone: ${data.parentPhone}
Emergency Contact: ${data.emergencyContact}
      `
    };
  };

  const downloadLetter = (letter) => {
    const preview = generateLetterPreview(letter);
    const element = document.createElement('a');
    const file = new Blob([preview.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `excuse_letter_${letter.studentName || 'student'}_${letter.dateFrom}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Excuse Letters</h1>
              <p className="text-sm text-gray-500">Submit and manage leave applications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('new')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'new'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            New Letter
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            History ({submittedLetters.length})
          </button>
        </div>
      </div>

      {activeTab === 'new' && (
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Student Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <input
                    type="text"
                    name="className"
                    value={formData.className}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                  <input
                    type="text"
                    name="sectionName"
                    value={formData.sectionName}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Parent/Guardian Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent/Guardian Name</label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent Email</label>
                  <input
                    type="email"
                    name="parentEmail"
                    value={formData.parentEmail}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone</label>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={formData.parentPhone}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Emergency contact number"
                  />
                </div>
              </div>
            </div>

            {/* Leave Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Leave Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    name="dateFrom"
                    value={formData.dateFrom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <input
                    type="date"
                    name="dateTo"
                    value={formData.dateTo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason Type</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {reasonTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, reasonType: type.value }))}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.reasonType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{type.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Leave</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please provide detailed reason for leave"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                  <textarea
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any additional information"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
                <span>{saving ? 'Submitting...' : 'Submit Letter'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="p-6 overflow-y-auto">
          {loading && (
            <div className="text-sm text-gray-500">Loading letters...</div>
          )}
          <div className="space-y-4">
            {submittedLetters.map(letter => (
              <div key={letter._id || letter.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{letter.studentName}</h3>
                    <p className="text-sm text-gray-500">Class {letter.className}-{letter.sectionName}</p>
                    <p className="text-sm text-gray-500">Submitted on {new Date(letter.createdAt || letter.submittedOn).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    letter.status === 'approved' ? 'bg-green-100 text-green-700' :
                    letter.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {letter.status || 'pending'}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-700"><strong>Reason:</strong> {letter.reason}</p>
                  <p className="text-sm text-gray-700"><strong>Duration:</strong> {new Date(letter.dateFrom).toLocaleDateString()} - {new Date(letter.dateTo).toLocaleDateString()}</p>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => setPreviewLetter(letter)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">Preview</span>
                  </button>
                  <button
                    onClick={() => downloadLetter(letter)}
                    className="flex items-center space-x-2 text-green-600 hover:text-green-700"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {previewLetter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Letter Preview</h3>
              <button onClick={() => setPreviewLetter(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {generateLetterPreview(previewLetter).content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcuseLetter;
