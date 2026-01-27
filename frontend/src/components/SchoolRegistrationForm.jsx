import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, MapPin, Phone, Mail, User, Globe,
  Upload, FileText, Check, ChevronLeft, ChevronRight,
  AlertCircle, Loader2, X, GraduationCap, Plus, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL;

const SchoolRegistrationForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    campuses: [
      {
        name: '',
        address: '',
        campusType: 'Main',
        contactPerson: '',
        contactPhone: ''
      }
    ],
    schoolType: '',
    board: '',
    boardOther: '',
    academicYearStructure: '',
    contactPersonName: '',
    contactPhone: '',
    officialEmail: '',
    address: '',
    websiteURL: '',
    estimatedUsers: '',
    logo: null,
    verificationDocs: []
  });

  // Error state
  const [errors, setErrors] = useState({});

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);

  // File preview states
  const [logoPreview, setLogoPreview] = useState(null);
  const [docsPreview, setDocsPreview] = useState([]);

  // Options for dropdowns
  const schoolTypes = ['Public', 'Private', 'Charter', 'International'];
  const boards = ['CBSE', 'ICSE', 'IB', 'IGCSE', 'State Board', 'NIOS', 'Other'];
  const academicStructures = ['Semester', 'Trimester', 'Quarter'];
  const userRanges = ['<100', '100-500', '500-1000', '1000+'];
  const campusTypes = ['Main', 'Branch'];

  // Add campus
  const addCampus = () => {
    setFormData(prev => ({
      ...prev,
      campuses: [
        ...prev.campuses,
        {
          name: '',
          address: '',
          campusType: 'Branch',
          contactPerson: '',
          contactPhone: ''
        }
      ]
    }));
  };

  // Remove campus
  const removeCampus = (index) => {
    if (formData.campuses.length === 1) {
      toast.error('At least one campus is required');
      return;
    }
    setFormData(prev => ({
      ...prev,
      campuses: prev.campuses.filter((_, i) => i !== index)
    }));
    // Clear errors for this campus
    const errorKeys = Object.keys(errors).filter(key => key.startsWith(`campus_${index}_`));
    if (errorKeys.length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        errorKeys.forEach(key => delete newErrors[key]);
        return newErrors;
      });
    }
  };

  // Handle campus field change
  const handleCampusChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      campuses: prev.campuses.map((campus, i) =>
        i === index ? { ...campus, [field]: value } : campus
      )
    }));

    // Clear error for this field
    const errorKey = `campus_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validation functions per step
  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'School name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'School name must be at least 3 characters';
    }

    // Validate each campus
    if (!formData.campuses || formData.campuses.length === 0) {
      newErrors.campuses = 'At least one campus is required';
    } else {
      formData.campuses.forEach((campus, index) => {
        if (!campus.name.trim()) {
          newErrors[`campus_${index}_name`] = 'Campus name is required';
        }

        if (!campus.address.trim()) {
          newErrors[`campus_${index}_address`] = 'Campus address is required';
        } else if (campus.address.trim().length < 10) {
          newErrors[`campus_${index}_address`] = 'Please provide a complete address';
        }

        if (campus.contactPhone && !/^\+?[\d\s\-()]{10,}$/.test(campus.contactPhone)) {
          newErrors[`campus_${index}_contactPhone`] = 'Invalid phone number';
        }
      });
    }

    if (!formData.schoolType) {
      newErrors.schoolType = 'Please select a school type';
    }

    if (!formData.board) {
      newErrors.board = 'Please select a school board/affiliation';
    } else if (formData.board === 'Other' && !formData.boardOther.trim()) {
      newErrors.boardOther = 'Please specify the board name';
    }

    if (!formData.academicYearStructure) {
      newErrors.academicYearStructure = 'Please select academic year structure';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.contactPersonName.trim()) {
      newErrors.contactPersonName = 'Contact person name is required';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    } else if (!/^\+?[\d\s\-()]{10,}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Please enter a valid phone number';
    }

    if (!formData.officialEmail.trim()) {
      newErrors.officialEmail = 'Official email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.officialEmail)) {
      newErrors.officialEmail = 'Please enter a valid email address';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'School address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please provide a complete address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};

    if (formData.websiteURL && formData.websiteURL.trim()) {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.websiteURL)) {
        newErrors.websiteURL = 'Please enter a valid URL';
      }
    }

    if (!formData.estimatedUsers) {
      newErrors.estimatedUsers = 'Please select estimated number of users';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};

    if (!formData.logo) {
      newErrors.logo = 'School logo is required';
    }

    if (!formData.verificationDocs || formData.verificationDocs.length === 0) {
      newErrors.verificationDocs = 'At least one verification document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        logo: 'Please upload a valid image (JPG, PNG, or WebP)'
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        logo: 'Logo file size must be less than 5MB'
      }));
      return;
    }

    setIsUploadingLogo(true);
    setErrors(prev => ({ ...prev, logo: '' }));

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('folder', 'school_logos');

      const response = await fetch(`${API_BASE}/api/uploads/cloudinary/single`, {
        method: 'POST',
        body: uploadData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      const uploadedFile = result.files[0];

      setFormData(prev => ({
        ...prev,
        logo: {
          public_id: uploadedFile.public_id,
          secure_url: uploadedFile.secure_url,
          originalName: uploadedFile.originalName
        }
      }));

      setLogoPreview(uploadedFile.secure_url);
      toast.success('Logo uploaded successfully');

    } catch (error) {
      console.error('Logo upload error:', error);
      setErrors(prev => ({
        ...prev,
        logo: 'Failed to upload logo. Please try again.'
      }));
      toast.error('Logo upload failed');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Handle verification documents upload
  const handleDocsUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (files.length + formData.verificationDocs.length > 5) {
      setErrors(prev => ({
        ...prev,
        verificationDocs: 'Maximum 5 documents allowed'
      }));
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          verificationDocs: 'Only PDF and image files are allowed'
        }));
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          verificationDocs: 'Each file must be less than 10MB'
        }));
        return;
      }
    }

    setIsUploadingDocs(true);
    setErrors(prev => ({ ...prev, verificationDocs: '' }));

    try {
      const uploadData = new FormData();
      files.forEach(file => uploadData.append('files', file));
      uploadData.append('folder', 'school_verification_docs');

      const response = await fetch(`${API_BASE}/api/uploads/cloudinary/bulk`, {
        method: 'POST',
        body: uploadData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      const uploadedFiles = result.files.map(file => ({
        public_id: file.public_id,
        secure_url: file.secure_url,
        originalName: file.originalName
      }));

      setFormData(prev => ({
        ...prev,
        verificationDocs: [...prev.verificationDocs, ...uploadedFiles]
      }));

      setDocsPreview(prev => [
        ...prev,
        ...uploadedFiles.map(f => ({
          name: f.originalName,
          url: f.secure_url
        }))
      ]);

      toast.success(`${uploadedFiles.length} document(s) uploaded successfully`);

    } catch (error) {
      console.error('Documents upload error:', error);
      setErrors(prev => ({
        ...prev,
        verificationDocs: 'Failed to upload documents. Please try again.'
      }));
      toast.error('Document upload failed');
    } finally {
      setIsUploadingDocs(false);
    }
  };

  // Remove uploaded document
  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      verificationDocs: prev.verificationDocs.filter((_, i) => i !== index)
    }));
    setDocsPreview(prev => prev.filter((_, i) => i !== index));
  };

  // Navigation handlers
  const handleNext = () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      default:
        isValid = true;
    }

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep4()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/school-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
          setCurrentStep(1);
          toast.error('Please fix the errors and try again');
        } else {
          throw new Error(data.error || 'Registration failed');
        }
        return;
      }

      toast.success('Registration submitted successfully!');
      window.dispatchEvent(new Event('super-admin-refresh-requests'));
      navigate('/school-registration/success', {
        state: { schoolData: data.school }
      });

    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">School Information</h2>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                School Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  placeholder="Enter school name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" /> {errors.name}
                </p>
              )}
            </div>

            {/* Campus Management */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">
                  Campus Details <span className="text-red-500">*</span>
                  <span className="text-gray-500 text-xs ml-1 sm:ml-2">({formData.campuses.length} campus{formData.campuses.length !== 1 ? 'es' : ''})</span>
                </label>
                <button
                  type="button"
                  onClick={addCampus}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-xs sm:text-sm font-medium"
                >
                  <Plus size={14} className="sm:w-4 sm:h-4" />
                  Add Campus
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {formData.campuses.map((campus, index) => (
                  <div key={index} className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border-2 border-gray-200 space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <h4 className="font-semibold text-gray-700 text-sm sm:text-base">Campus {index + 1}</h4>
                      {formData.campuses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCampus(index)}
                          className="text-red-500 hover:text-red-700 p-1.5 sm:p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Campus Name */}
                      <div>
                        <label className="block text-[11px] sm:text-xs font-medium text-gray-600 mb-1">
                          Campus Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="text"
                            value={campus.name}
                            onChange={(e) => handleCampusChange(index, 'name', e.target.value)}
                            className={`w-full pl-8 sm:pl-9 pr-2.5 sm:pr-3 py-2 border ${errors[`campus_${index}_name`] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-xs sm:text-sm`}
                            placeholder="e.g., Main Campus"
                          />
                        </div>
                        {errors[`campus_${index}_name`] && (
                          <p className="mt-1 text-[10px] sm:text-xs text-red-500">{errors[`campus_${index}_name`]}</p>
                        )}
                      </div>

                      {/* Campus Type */}
                      <div>
                        <label className="block text-[11px] sm:text-xs font-medium text-gray-600 mb-1">
                          Campus Type
                        </label>
                        <select
                          value={campus.campusType}
                          onChange={(e) => handleCampusChange(index, 'campusType', e.target.value)}
                          className="w-full px-2.5 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-xs sm:text-sm"
                        >
                          {campusTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Campus Address */}
                    <div>
                      <label className="block text-[11px] sm:text-xs font-medium text-gray-600 mb-1">
                        Campus Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 text-gray-400" size={16} />
                        <textarea
                          value={campus.address}
                          onChange={(e) => handleCampusChange(index, 'address', e.target.value)}
                          rows="2"
                          className={`w-full pl-8 sm:pl-9 pr-2.5 sm:pr-3 py-2 border ${errors[`campus_${index}_address`] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-xs sm:text-sm`}
                          placeholder="Enter complete campus address"
                        />
                      </div>
                      {errors[`campus_${index}_address`] && (
                        <p className="mt-1 text-[10px] sm:text-xs text-red-500">{errors[`campus_${index}_address`]}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Campus Contact Person (Optional) */}
                      <div>
                        <label className="block text-[11px] sm:text-xs font-medium text-gray-600 mb-1">
                          Contact Person <span className="text-gray-500">(Optional)</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="text"
                            value={campus.contactPerson}
                            onChange={(e) => handleCampusChange(index, 'contactPerson', e.target.value)}
                            className="w-full pl-8 sm:pl-9 pr-2.5 sm:pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-xs sm:text-sm"
                            placeholder="Campus contact"
                          />
                        </div>
                      </div>

                      {/* Campus Contact Phone (Optional) */}
                      <div>
                        <label className="block text-[11px] sm:text-xs font-medium text-gray-600 mb-1">
                          Contact Phone <span className="text-gray-500">(Optional)</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="tel"
                            value={campus.contactPhone}
                            onChange={(e) => handleCampusChange(index, 'contactPhone', e.target.value)}
                            className={`w-full pl-8 sm:pl-9 pr-2.5 sm:pr-3 py-2 border ${errors[`campus_${index}_contactPhone`] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-xs sm:text-sm`}
                            placeholder="Campus phone"
                          />
                        </div>
                        {errors[`campus_${index}_contactPhone`] && (
                          <p className="mt-1 text-[10px] sm:text-xs text-red-500">{errors[`campus_${index}_contactPhone`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {errors.campuses && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.campuses}
                </p>
              )}
            </div>

            {/* School Type and Board - Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  School Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="schoolType"
                  value={formData.schoolType}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border ${errors.schoolType ? 'border-red-500' : 'border-gray-300'} rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                >
                  <option value="">Select school type</option>
                  {schoolTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.schoolType && (
                  <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" /> {errors.schoolType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  School Board/Affiliation <span className="text-red-500">*</span>
                </label>
                <select
                  name="board"
                  value={formData.board}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border ${errors.board ? 'border-red-500' : 'border-gray-300'} rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                >
                  <option value="">Select board/affiliation</option>
                  {boards.map(board => (
                    <option key={board} value={board}>{board}</option>
                  ))}
                </select>
                {errors.board && (
                  <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" /> {errors.board}
                  </p>
                )}
              </div>
            </div>

            {formData.board === 'Other' && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Specify Board Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="boardOther"
                  value={formData.boardOther}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border ${errors.boardOther ? 'border-red-500' : 'border-gray-300'} rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  placeholder="Enter board/affiliation name"
                />
                {errors.boardOther && (
                  <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" /> {errors.boardOther}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Academic Year Structure <span className="text-red-500">*</span>
              </label>
              <select
                name="academicYearStructure"
                value={formData.academicYearStructure}
                onChange={handleInputChange}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border ${errors.academicYearStructure ? 'border-red-500' : 'border-gray-300'} rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
              >
                <option value="">Select academic structure</option>
                {academicStructures.map(structure => (
                  <option key={structure} value={structure}>{structure}</option>
                ))}
              </select>
              {errors.academicYearStructure && (
                <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" /> {errors.academicYearStructure}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Contact Details</h2>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Contact Person's Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={handleInputChange}
                  className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border ${errors.contactPersonName ? 'border-red-500' : 'border-gray-300'} rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  placeholder="Enter contact person's name"
                />
              </div>
              {errors.contactPersonName && (
                <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" /> {errors.contactPersonName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Contact Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border ${errors.contactPhone ? 'border-red-500' : 'border-gray-300'} rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  placeholder="Enter phone number"
                />
              </div>
              {errors.contactPhone && (
                <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" /> {errors.contactPhone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Official School Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="officialEmail"
                  value={formData.officialEmail}
                  onChange={handleInputChange}
                  className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border ${errors.officialEmail ? 'border-red-500' : 'border-gray-300'} rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  placeholder="school@example.com"
                />
              </div>
              {errors.officialEmail && (
                <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" /> {errors.officialEmail}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                School Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  placeholder="Enter complete school address"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" /> {errors.address}
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Additional Information</h2>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Website URL <span className="text-gray-500">(Optional)</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="url"
                  name="websiteURL"
                  value={formData.websiteURL}
                  onChange={handleInputChange}
                  className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border ${errors.websiteURL ? 'border-red-500' : 'border-gray-300'} rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  placeholder="https://www.example.com"
                />
              </div>
              {errors.websiteURL && (
                <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" /> {errors.websiteURL}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Estimated Number of Users <span className="text-red-500">*</span>
              </label>
              <select
                name="estimatedUsers"
                value={formData.estimatedUsers}
                onChange={handleInputChange}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border ${errors.estimatedUsers ? 'border-red-500' : 'border-gray-300'} rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
              >
                <option value="">Select estimated users</option>
                {userRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
              {errors.estimatedUsers && (
                <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" /> {errors.estimatedUsers}
                </p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">File Uploads</h2>

            {/* Logo Upload */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                School Logo <span className="text-red-500">*</span>
                <span className="text-gray-500 text-[10px] sm:text-xs ml-1 sm:ml-2">(Max 5MB, JPG/PNG/WebP)</span>
              </label>

              {logoPreview ? (
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                  <img src={logoPreview} alt="Logo preview" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">{formData.logo.originalName}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">Logo uploaded successfully</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, logo: null }));
                      setLogoPreview(null);
                    }}
                    className="text-red-500 hover:text-red-700 flex-shrink-0"
                  >
                    <X size={18} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleLogoUpload}
                    disabled={isUploadingLogo}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className={`flex flex-col items-center justify-center w-full h-28 sm:h-32 border-2 border-dashed ${errors.logo ? 'border-red-500' : 'border-gray-300'} rounded-lg sm:rounded-xl cursor-pointer hover:border-amber-500 transition-colors ${isUploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUploadingLogo ? (
                      <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 mb-1.5 sm:mb-2" />
                        <p className="text-xs sm:text-sm text-gray-600">Click to upload logo</p>
                      </>
                    )}
                  </label>
                </div>
              )}
              {errors.logo && (
                <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" /> {errors.logo}
                </p>
              )}
            </div>

            {/* Verification Documents Upload */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Verification Documents <span className="text-red-500">*</span>
                <span className="text-gray-500 text-[10px] sm:text-xs ml-1 sm:ml-2">(Max 5 files, 10MB each, PDF/JPG/PNG)</span>
              </label>

              <div className="relative">
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/jpg"
                  onChange={handleDocsUpload}
                  disabled={isUploadingDocs || formData.verificationDocs.length >= 5}
                  multiple
                  className="hidden"
                  id="docs-upload"
                />
                <label
                  htmlFor="docs-upload"
                  className={`flex flex-col items-center justify-center w-full h-28 sm:h-32 border-2 border-dashed ${errors.verificationDocs ? 'border-red-500' : 'border-gray-300'} rounded-lg sm:rounded-xl cursor-pointer hover:border-amber-500 transition-colors ${isUploadingDocs || formData.verificationDocs.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUploadingDocs ? (
                    <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500 animate-spin" />
                  ) : (
                    <>
                      <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 mb-1.5 sm:mb-2" />
                      <p className="text-xs sm:text-sm text-gray-600">Click to upload documents</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        {formData.verificationDocs.length} / 5 uploaded
                      </p>
                    </>
                  )}
                </label>
              </div>

              {docsPreview.length > 0 && (
                <div className="mt-3 sm:mt-4 space-y-2">
                  {docsPreview.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <FileText className="text-gray-400 flex-shrink-0" size={18} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">{doc.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700 flex-shrink-0"
                      >
                        <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {errors.verificationDocs && (
                <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" /> {errors.verificationDocs}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 py-6 sm:py-8 lg:py-12 px-3 sm:px-4 lg:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">School Registration</h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">Register your school to get started with our platform</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6 sm:mb-8 px-2">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1 last:flex-initial">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base flex-shrink-0 ${
                    step <= currentStep
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step < currentStep ? <Check size={16} className="sm:w-5 sm:h-5" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`h-0.5 sm:h-1 flex-1 mx-1 sm:mx-2 ${
                      step < currentStep ? 'bg-amber-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] sm:text-xs text-gray-600 px-0 sm:px-1">
            <span className="text-center w-1/4">School Info</span>
            <span className="text-center w-1/4">Contact</span>
            <span className="text-center w-1/4">Details</span>
            <span className="text-center w-1/4">Files</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit}>
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-300 transition-colors text-sm sm:text-base font-medium"
                >
                  <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Previous</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg sm:rounded-xl hover:from-amber-600 hover:to-orange-600 transition-colors ml-auto text-sm sm:text-base font-medium"
                >
                  Next
                  <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg sm:rounded-xl hover:from-amber-600 hover:to-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto text-sm sm:text-base font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span className="hidden xs:inline">Submitting...</span>
                      <span className="xs:hidden">Sending...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden xs:inline">Submit Registration</span>
                      <span className="xs:hidden">Submit</span>
                      <Check size={18} className="sm:w-5 sm:h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SchoolRegistrationForm;
