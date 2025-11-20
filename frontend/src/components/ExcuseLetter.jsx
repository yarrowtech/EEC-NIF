import React, { useState } from 'react';
import { 
  FileText, 
  Send, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  AlertCircle,
  CheckCircle,
  Download,
  Eye
} from 'lucide-react';

const ExcuseLetter = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    class: '',
    section: '',
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

  const [submittedLetters, setSubmittedLetters] = useState([
    {
      id: 1,
      studentName: 'John Doe',
      class: '10-A',
      reason: 'Medical appointment',
      dateFrom: '2025-01-15',
      dateTo: '2025-01-15',
      status: 'approved',
      submittedOn: '2025-01-12',
      approvedBy: 'Ms. Johnson'
    },
    {
      id: 2,
      studentName: 'John Doe',
      class: '10-A',
      reason: 'Family emergency',
      dateFrom: '2025-01-08',
      dateTo: '2025-01-10',
      status: 'pending',
      submittedOn: '2025-01-07',
      approvedBy: null
    }
  ]);

  const [activeTab, setActiveTab] = useState('new');
  const [previewLetter, setPreviewLetter] = useState(null);

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newLetter = {
      id: submittedLetters.length + 1,
      studentName: formData.studentName,
      class: `${formData.class}-${formData.section}`,
      reason: formData.reason,
      dateFrom: formData.dateFrom,
      dateTo: formData.dateTo,
      status: 'pending',
      submittedOn: new Date().toISOString().split('T')[0],
      approvedBy: null,
      formData: { ...formData }
    };

    setSubmittedLetters(prev => [newLetter, ...prev]);
    
    // Reset form
    setFormData({
      studentName: '',
      rollNumber: '',
      class: '',
      section: '',
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

    alert('Excuse letter submitted successfully!');
    setActiveTab('history');
  };

  const generateLetterPreview = (letter) => {
    const data = letter.formData || formData;
    return {
      date: new Date().toLocaleDateString(),
      content: `
Date: ${new Date().toLocaleDateString()}

To,
The Principal/Class Teacher
Electronic Educare

Subject: Request for Leave of Absence

Dear Sir/Madam,

I am writing to inform you that my ward, ${data.studentName}, studying in Class ${data.class}-${data.section}, Roll Number: ${data.rollNumber}, will not be able to attend school from ${new Date(data.dateFrom).toLocaleDateString()} to ${new Date(data.dateTo).toLocaleDateString()}.

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
    element.download = `excuse_letter_${letter.studentName}_${letter.dateFrom}.txt`;
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'new' ? (
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class *
                    </label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Class</option>
                      {Array.from({length: 12}, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>Class {num}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section *
                    </label>
                    <select
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Section</option>
                      {['A', 'B', 'C', 'D'].map(section => (
                        <option key={section} value={section}>Section {section}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-green-600" />
                  Parent/Guardian Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent/Guardian Name *
                    </label>
                    <input
                      type="text"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="parentEmail"
                      value={formData.parentEmail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="parentPhone"
                      value={formData.parentPhone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact
                    </label>
                    <input
                      type="tel"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Leave Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  Leave Details
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Date *
                      </label>
                      <input
                        type="date"
                        name="dateFrom"
                        value={formData.dateFrom}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To Date *
                      </label>
                      <input
                        type="date"
                        name="dateTo"
                        value={formData.dateTo}
                        onChange={handleInputChange}
                        min={formData.dateFrom || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason Type *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {reasonTypes.map((type) => (
                        <label key={type.value} className="flex items-center">
                          <input
                            type="radio"
                            name="reasonType"
                            value={type.value}
                            checked={formData.reasonType === type.value}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {type.icon} {type.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Detailed Reason *
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Please provide specific details about the reason for absence..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      name="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any additional information you'd like to share..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setPreviewLetter(generateLetterPreview({ formData }))}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Letter
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Excuse Letter
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Submitted Excuse Letters</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Leave Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submittedLetters.map((letter) => (
                      <tr key={letter.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{letter.studentName}</div>
                            <div className="text-sm text-gray-500">Class {letter.class}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(letter.dateFrom).toLocaleDateString()} - {new Date(letter.dateTo).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{letter.reason}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            letter.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : letter.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {letter.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {letter.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {letter.status === 'rejected' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {letter.status.charAt(0).toUpperCase() + letter.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(letter.submittedOn).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setPreviewLetter(generateLetterPreview(letter))}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => downloadLetter(letter)}
                              className="text-green-600 hover:text-green-900 flex items-center"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewLetter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Letter Preview</h3>
              <button
                onClick={() => setPreviewLetter(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 p-4 rounded-lg border">
                {previewLetter.content}
              </pre>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setPreviewLetter(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const element = document.createElement('a');
                  const file = new Blob([previewLetter.content], { type: 'text/plain' });
                  element.href = URL.createObjectURL(file);
                  element.download = `excuse_letter_${previewLetter.date}.txt`;
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcuseLetter;