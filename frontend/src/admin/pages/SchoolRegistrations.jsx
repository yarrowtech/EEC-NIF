import React, { useState, useEffect } from 'react';
import {
  Eye, CheckCircle, XCircle, Clock, Search, Building2,
  Mail, Phone, User, MapPin, Globe, Calendar, FileText,
  X, Loader2, GraduationCap
} from 'lucide-react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL;

const SchoolRegistrations = ({ setShowAdminHeader }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  };

  // Fetch registrations
  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/schools/registrations/pending`,
        { headers: authHeaders }
      );

      if (!response.ok) throw new Error('Failed to fetch registrations');

      const data = await response.json();
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setShowAdminHeader?.(false);
    fetchRegistrations();
  }, []);

  // Approve registration
  const handleApprove = async (id, schoolName) => {
    const result = await Swal.fire({
      title: 'Approve Registration?',
      text: `Are you sure you want to approve ${schoolName}?`,
      input: 'textarea',
      inputLabel: 'Admin Notes (Optional)',
      inputPlaceholder: 'Add any notes for this approval...',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve',
      confirmButtonColor: '#10b981',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${API_BASE}/api/schools/registrations/${id}/approve`,
          {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({ adminNotes: result.value })
          }
        );

        if (!response.ok) throw new Error('Approval failed');

        toast.success('School registration approved successfully');
        fetchRegistrations();
        setShowModal(false);
      } catch (error) {
        console.error('Approval error:', error);
        toast.error('Failed to approve registration');
      }
    }
  };

  // Reject registration
  const handleReject = async (id, schoolName) => {
    const result = await Swal.fire({
      title: 'Reject Registration?',
      text: `Are you sure you want to reject ${schoolName}?`,
      input: 'textarea',
      inputLabel: 'Rejection Reason (Required)',
      inputPlaceholder: 'Provide reason for rejection...',
      inputValidator: (value) => {
        if (!value) {
          return 'Rejection reason is required';
        }
      },
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Reject',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${API_BASE}/api/schools/registrations/${id}/reject`,
          {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({ rejectionReason: result.value })
          }
        );

        if (!response.ok) throw new Error('Rejection failed');

        toast.success('School registration rejected');
        fetchRegistrations();
        setShowModal(false);
      } catch (error) {
        console.error('Rejection error:', error);
        toast.error('Failed to reject registration');
      }

    }
  };

  // View details
  const handleViewDetails = (school) => {
    setSelectedSchool(school);
    setShowModal(true);
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = searchQuery.trim() === '' ||
      reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.officialEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.code?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    const icons = {
      pending: <Clock size={14} />,
      approved: <CheckCircle size={14} />,
      rejected: <XCircle size={14} />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">School Registrations</h1>
        <p className="text-sm sm:text-base text-gray-600">Review and manage pending school registrations</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500 animate-spin" />
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center">
          <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Pending Registrations</h3>
          <p className="text-sm sm:text-base text-gray-600">There are no pending school registrations at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredRegistrations.map((school) => (
            <div key={school._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6">
              {/* School Logo */}
              {school.logo?.secure_url && (
                <div className="flex justify-center mb-3 sm:mb-4">
                  <img
                    src={school.logo.secure_url}
                    alt={school.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* School Info */}
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 line-clamp-2">{school.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                {school.campuses && school.campuses.length > 0
                  ? `${school.campuses.length} Campus${school.campuses.length !== 1 ? 'es' : ''}`
                  : school.campusName}
              </p>
              {school.campuses && school.campuses.length > 0 && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {school.campuses.map(c => c.name).join(', ')}
                </p>
              )}

              {/* Details */}
              <div className="space-y-2 mb-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-gray-600 min-w-0">
                  <Mail size={14} className="text-amber-500 flex-shrink-0 sm:w-4 sm:h-4" />
                  <span className="truncate">{school.officialEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 min-w-0">
                  <Phone size={14} className="text-amber-500 flex-shrink-0 sm:w-4 sm:h-4" />
                  <span className="truncate">{school.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 min-w-0">
                  <Building2 size={14} className="text-amber-500 flex-shrink-0 sm:w-4 sm:h-4" />
                  <span className="truncate">{school.schoolType}</span>
                </div>
                {school.board && (
                  <div className="flex items-center gap-2 text-gray-600 min-w-0">
                    <GraduationCap size={14} className="text-amber-500 flex-shrink-0 sm:w-4 sm:h-4" />
                    <span className="truncate">{school.board === 'Other' ? school.boardOther : school.board}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600 min-w-0">
                  <Calendar size={14} className="text-amber-500 flex-shrink-0 sm:w-4 sm:h-4" />
                  <span className="truncate">{new Date(school.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Status */}
              <div className="mb-4">
                <StatusBadge status={school.registrationStatus} />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetails(school)}
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs sm:text-sm font-medium"
                >
                  <Eye size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">View</span>
                </button>
                <button
                  onClick={() => handleApprove(school._id, school.name)}
                  className="flex items-center justify-center px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  title="Approve"
                >
                  <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                <button
                  onClick={() => handleReject(school._id, school.name)}
                  className="flex items-center justify-center px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  title="Reject"
                >
                  <XCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold line-clamp-2">{selectedSchool.name}</h2>
                <p className="text-amber-100 text-xs sm:text-sm mt-1">
                  {selectedSchool.campuses && selectedSchool.campuses.length > 0
                    ? `${selectedSchool.campuses.length} Campus${selectedSchool.campuses.length !== 1 ? 'es' : ''}`
                    : selectedSchool.campusName}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 sm:p-2 transition-colors flex-shrink-0"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Logo */}
              {selectedSchool.logo?.secure_url && (
                <div className="flex justify-center">
                  <img
                    src={selectedSchool.logo.secure_url}
                    alt={selectedSchool.name}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl shadow-md"
                  />
                </div>
              )}

              {/* Basic Information */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <InfoItem icon={<Building2 />} label="School Code" value={selectedSchool.code} />
                  <InfoItem icon={<Building2 />} label="School Type" value={selectedSchool.schoolType} />
                  {selectedSchool.board && (
                    <InfoItem
                      icon={<GraduationCap />}
                      label="Board/Affiliation"
                      value={selectedSchool.board === 'Other' ? selectedSchool.boardOther : selectedSchool.board}
                    />
                  )}
                  <InfoItem icon={<Calendar />} label="Academic Structure" value={selectedSchool.academicYearStructure} />
                  <InfoItem icon={<User />} label="Estimated Users" value={selectedSchool.estimatedUsers} />
                </div>
              </div>

              {/* Campus Information */}
              {selectedSchool.campuses && selectedSchool.campuses.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Campus Information</h3>
                  <div className="space-y-3 sm:space-y-4">
                    {selectedSchool.campuses.map((campus, index) => (
                      <div key={index} className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start sm:items-center gap-2 mb-3 flex-wrap">
                          <Building2 className="text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0" size={18} />
                          <h4 className="font-semibold text-gray-800 text-sm sm:text-base flex-1 min-w-0">{campus.name}</h4>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${campus.campusType === 'Main' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                            {campus.campusType}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="text-gray-400 flex-shrink-0 mt-0.5" size={14} />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-gray-500">Address</p>
                              <p className="text-gray-700 break-words">{campus.address}</p>
                            </div>
                          </div>
                          {campus.contactPerson && (
                            <div className="flex items-start gap-2">
                              <User className="text-gray-400 flex-shrink-0 mt-0.5" size={14} />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-500">Contact Person</p>
                                <p className="text-gray-700 break-words">{campus.contactPerson}</p>
                              </div>
                            </div>
                          )}
                          {campus.contactPhone && (
                            <div className="flex items-start gap-2">
                              <Phone className="text-gray-400 flex-shrink-0 mt-0.5" size={14} />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-500">Contact Phone</p>
                                <p className="text-gray-700">{campus.contactPhone}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Primary Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <InfoItem icon={<User />} label="Contact Person" value={selectedSchool.contactPersonName} />
                  <InfoItem icon={<Phone />} label="Phone" value={selectedSchool.contactPhone} />
                  <InfoItem icon={<Mail />} label="Email" value={selectedSchool.officialEmail} />
                  {selectedSchool.websiteURL && (
                    <InfoItem icon={<Globe />} label="Website" value={selectedSchool.websiteURL} />
                  )}
                </div>
              </div>

              {/* Main Address */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Main School Address</h3>
                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <MapPin className="text-amber-500 flex-shrink-0 mt-0.5 sm:mt-1" size={18} className="sm:w-5 sm:h-5" />
                  <p className="text-gray-700 text-sm sm:text-base break-words">{selectedSchool.address}</p>
                </div>
              </div>

              {/* Verification Documents */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Verification Documents</h3>
                <div className="space-y-2">
                  {selectedSchool.verificationDocs?.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.secure_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FileText className="text-gray-400 flex-shrink-0" size={18} className="sm:w-5 sm:h-5" />
                      <span className="text-xs sm:text-sm text-gray-700 flex-1 truncate">{doc.originalName}</span>
                      <Eye className="text-blue-500 flex-shrink-0" size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Submission Details */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Submission Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <InfoItem
                    icon={<Calendar />}
                    label="Submitted At"
                    value={new Date(selectedSchool.submittedAt).toLocaleString()}
                  />
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Clock className="text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" size={18} className="sm:w-5 sm:h-5" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Status</p>
                      <div className="mt-1">
                        <StatusBadge status={selectedSchool.registrationStatus} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleApprove(selectedSchool._id, selectedSchool.name)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-green-500 text-white rounded-lg sm:rounded-xl hover:bg-green-600 transition-colors font-semibold text-sm sm:text-base"
                >
                  <CheckCircle size={18} className="sm:w-5 sm:h-5" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedSchool._id, selectedSchool.name)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-500 text-white rounded-lg sm:rounded-xl hover:bg-red-600 transition-colors font-semibold text-sm sm:text-base"
                >
                  <XCircle size={18} className="sm:w-5 sm:h-5" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for displaying information items
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-2 sm:gap-3">
    <div className="text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0">{React.cloneElement(icon, { size: 18, className: 'sm:w-5 sm:h-5' })}</div>
    <div className="min-w-0 flex-1">
      <p className="text-xs sm:text-sm font-medium text-gray-500">{label}</p>
      <p className="text-sm sm:text-base text-gray-800 break-words">{value}</p>
    </div>
  </div>
);

export default SchoolRegistrations;