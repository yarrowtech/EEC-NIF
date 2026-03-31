import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, MapPin, Phone, Mail, User, Globe,
  Upload, FileText, Check, ChevronLeft, ChevronRight,
  AlertCircle, Loader2, X, GraduationCap, Plus, Trash2,
  School, ClipboardList, Info, FolderOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL;

// Validation helpers
const isValidPhone = (phone) => {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^\+?[1-9]\d{9,14}$/.test(cleaned);
};

const isValidEmail = (email) => {
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email.trim());
};

const isValidURL = (url) => {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.includes('.');
  } catch {
    return false;
  }
};

const STEPS = [
  { id: 1, label: 'School Info',  shortLabel: 'Info',    icon: School },
  { id: 2, label: 'Contact',      shortLabel: 'Contact',  icon: ClipboardList },
  { id: 3, label: 'Details',      shortLabel: 'Details',  icon: Info },
  { id: 4, label: 'Files',        shortLabel: 'Files',    icon: FolderOpen },
];

const schoolTypes        = ['Public', 'Private', 'Charter', 'International'];
const boards             = ['CBSE', 'ICSE', 'IB', 'IGCSE', 'State Board', 'NIOS', 'Other'];
const academicStructures = ['Semester', 'Trimester', 'Quarter'];
const userRanges         = ['Less than 100', '100 – 500', '500 – 1,000', 'More than 1,000'];
const campusTypes        = ['Main', 'Branch'];

/* ─── Reusable field error ─── */
const FieldError = ({ msg }) =>
  msg ? (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle size={12} className="shrink-0" />
      {msg}
    </p>
  ) : null;

/* ─── Reusable label ─── */
const Label = ({ children, required, optional }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1.5">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
    {optional && <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>}
  </label>
);

/* ─── Input wrapper with icon ─── */
const InputWithIcon = ({ icon: Icon, error, children }) => (
  <div className="relative">
    <Icon
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      size={17}
    />
    {React.cloneElement(children, {
      className: `${children.props.className || ''} w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
        error
          ? 'border-red-400 bg-red-50'
          : 'border-gray-300 bg-white hover:border-gray-400'
      }`.trim(),
    })}
  </div>
);

/* ─── Textarea wrapper with icon ─── */
const TextareaWithIcon = ({ icon: Icon, error, children }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={17} />
    {React.cloneElement(children, {
      className: `${children.props.className || ''} w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
        error
          ? 'border-red-400 bg-red-50'
          : 'border-gray-300 bg-white hover:border-gray-400'
      }`.trim(),
    })}
  </div>
);

const SchoolRegistrationForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    name: '',
    campuses: [
      { name: '', address: '', campusType: 'Main', contactPerson: '', contactPhone: '' }
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
    verificationDocs: [],
  });

  const [errors, setErrors]             = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo]   = useState(false);
  const [isUploadingDocs, setIsUploadingDocs]   = useState(false);
  const [logoPreview, setLogoPreview]   = useState(null);
  const [docsPreview, setDocsPreview]   = useState([]);

  /* ── campus helpers ── */
  const addCampus = () =>
    setFormData(p => ({
      ...p,
      campuses: [...p.campuses, { name: '', address: '', campusType: 'Branch', contactPerson: '', contactPhone: '' }],
    }));

  const removeCampus = (idx) => {
    if (formData.campuses.length === 1) { toast.error('At least one campus is required'); return; }
    setFormData(p => ({ ...p, campuses: p.campuses.filter((_, i) => i !== idx) }));
    setErrors(p => {
      const next = { ...p };
      Object.keys(next).filter(k => k.startsWith(`campus_${idx}_`)).forEach(k => delete next[k]);
      return next;
    });
  };

  const handleCampusChange = (idx, field, value) => {
    setFormData(p => ({
      ...p,
      campuses: p.campuses.map((c, i) => i === idx ? { ...c, [field]: value } : c),
    }));
    const key = `campus_${idx}_${field}`;
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  /* ── input helper ── */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  /* ── validation ── */
  const validateStep1 = () => {
    const e = {};
    if (!formData.name.trim())                 e.name = 'School name is required';
    else if (formData.name.trim().length < 3)  e.name = 'School name must be at least 3 characters';

    if (!formData.campuses?.length) {
      e.campuses = 'At least one campus is required';
    } else {
      formData.campuses.forEach((c, i) => {
        if (!c.name.trim())
          e[`campus_${i}_name`] = 'Campus name is required';
        if (!c.address.trim())
          e[`campus_${i}_address`] = 'Campus address is required';
        else if (c.address.trim().length < 10)
          e[`campus_${i}_address`] = 'Please provide a complete address (min 10 characters)';
        if (c.contactPhone && !isValidPhone(c.contactPhone))
          e[`campus_${i}_contactPhone`] = 'Please enter a valid phone number';
      });
    }

    if (!formData.schoolType)
      e.schoolType = 'Please select a school type';

    if (!formData.board)
      e.board = 'Please select a board/affiliation';
    else if (formData.board === 'Other' && !formData.boardOther.trim())
      e.boardOther = 'Please specify the board name';

    if (!formData.academicYearStructure)
      e.academicYearStructure = 'Please select an academic year structure';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!formData.contactPersonName.trim())
      e.contactPersonName = 'Contact person name is required';
    else if (formData.contactPersonName.trim().length < 2)
      e.contactPersonName = 'Name must be at least 2 characters';
    else if (!/^[a-zA-Z\s.'-]{2,}$/.test(formData.contactPersonName.trim()))
      e.contactPersonName = 'Name should contain only letters and spaces';

    if (!formData.contactPhone.trim())
      e.contactPhone = 'Contact phone is required';
    else if (!isValidPhone(formData.contactPhone))
      e.contactPhone = 'Please enter a valid phone number (10–15 digits)';

    if (!formData.officialEmail.trim())
      e.officialEmail = 'Official email is required';
    else if (!isValidEmail(formData.officialEmail))
      e.officialEmail = 'Please enter a valid email address';

    if (!formData.address.trim())
      e.address = 'School address is required';
    else if (formData.address.trim().length < 15)
      e.address = 'Please provide a complete address (min 15 characters)';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e = {};
    if (formData.websiteURL?.trim() && !isValidURL(formData.websiteURL.trim()))
      e.websiteURL = 'Please enter a valid URL (e.g. https://example.com)';
    if (!formData.estimatedUsers)
      e.estimatedUsers = 'Please select the estimated number of users';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep4 = () => {
    const e = {};
    if (!formData.logo)
      e.logo = 'School logo is required';
    if (!formData.verificationDocs?.length)
      e.verificationDocs = 'Please upload at least one verification document';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── uploads ── */
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrors(p => ({ ...p, logo: 'Only JPG, PNG, or WebP images are accepted' })); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(p => ({ ...p, logo: 'Logo must be smaller than 5 MB' })); return;
    }
    setIsUploadingLogo(true);
    setErrors(p => ({ ...p, logo: '' }));
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'school_logos');
      const res = await fetch(`${API_BASE}/api/uploads/cloudinary/single`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const result = await res.json();
      const f = result.files[0];
      setFormData(p => ({ ...p, logo: { public_id: f.public_id, secure_url: f.secure_url, originalName: f.originalName } }));
      setLogoPreview(f.secure_url);
      toast.success('Logo uploaded successfully');
    } catch {
      setErrors(p => ({ ...p, logo: 'Upload failed. Please try again.' }));
      toast.error('Logo upload failed');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleDocsUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (files.length + formData.verificationDocs.length > 5) {
      setErrors(p => ({ ...p, verificationDocs: 'Maximum 5 documents allowed' })); return;
    }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    for (const f of files) {
      if (!allowed.includes(f.type)) { setErrors(p => ({ ...p, verificationDocs: 'Only PDF and image files are allowed' })); return; }
      if (f.size > 10 * 1024 * 1024) { setErrors(p => ({ ...p, verificationDocs: 'Each file must be under 10 MB' })); return; }
    }
    setIsUploadingDocs(true);
    setErrors(p => ({ ...p, verificationDocs: '' }));
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('files', f));
      fd.append('folder', 'school_verification_docs');
      const res = await fetch(`${API_BASE}/api/uploads/cloudinary/bulk`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const result = await res.json();
      const uploaded = result.files.map(f => ({ public_id: f.public_id, secure_url: f.secure_url, originalName: f.originalName }));
      setFormData(p => ({ ...p, verificationDocs: [...p.verificationDocs, ...uploaded] }));
      setDocsPreview(p => [...p, ...uploaded.map(f => ({ name: f.originalName, url: f.secure_url }))]);
      toast.success(`${uploaded.length} document${uploaded.length > 1 ? 's' : ''} uploaded`);
    } catch {
      setErrors(p => ({ ...p, verificationDocs: 'Upload failed. Please try again.' }));
      toast.error('Document upload failed');
    } finally {
      setIsUploadingDocs(false);
    }
  };

  const removeDocument = (idx) => {
    setFormData(p => ({ ...p, verificationDocs: p.verificationDocs.filter((_, i) => i !== idx) }));
    setDocsPreview(p => p.filter((_, i) => i !== idx));
  };

  /* ── navigation ── */
  const validators = { 1: validateStep1, 2: validateStep2, 3: validateStep3, 4: validateStep4 };

  const handleNext = () => {
    if (validators[currentStep]() && currentStep < totalSteps) {
      setCurrentStep(p => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(p => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep4()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/school-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) { setErrors(data.errors); setCurrentStep(1); toast.error('Please fix the errors and try again'); }
        else throw new Error(data.error || 'Registration failed');
        return;
      }
      toast.success('Registration submitted successfully!');
      window.dispatchEvent(new Event('super-admin-refresh-requests'));
      navigate('/school-registration/success', { state: { schoolData: data.school } });
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── select class helper ── */
  const selectCls = (field) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
      errors[field]
        ? 'border-red-400 bg-red-50'
        : 'border-gray-300 bg-white hover:border-gray-400'
    }`;

  /* ════════════════════════════════
     STEP CONTENT
  ════════════════════════════════ */
  const renderStep = () => {
    switch (currentStep) {
      /* ─── STEP 1 ─── */
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <Label required>School Name</Label>
              <InputWithIcon icon={GraduationCap} error={errors.name}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Greenfield International School"
                />
              </InputWithIcon>
              <FieldError msg={errors.name} />
            </div>

            {/* Campuses */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label required>
                  Campus Details
                  <span className="text-gray-400 font-normal text-xs ml-1">
                    ({formData.campuses.length} campus{formData.campuses.length !== 1 ? 'es' : ''})
                  </span>
                </Label>
                <button
                  type="button"
                  onClick={addCampus}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-medium hover:bg-amber-100 transition"
                >
                  <Plus size={13} /> Add Campus
                </button>
              </div>

              <div className="space-y-4">
                {formData.campuses.map((campus, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        <Building2 size={15} className="text-amber-500" />
                        Campus {idx + 1}
                        {idx === 0 && <span className="ml-1 text-xs text-amber-600 font-normal">(Main)</span>}
                      </span>
                      {formData.campuses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCampus(idx)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label required>Campus Name</Label>
                        <div className="relative">
                          <input
                            type="text"
                            value={campus.name}
                            onChange={(e) => handleCampusChange(idx, 'name', e.target.value)}
                            placeholder="e.g. Main Campus"
                            className={`w-full px-3 py-2 border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                              errors[`campus_${idx}_name`] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                            }`}
                          />
                        </div>
                        <FieldError msg={errors[`campus_${idx}_name`]} />
                      </div>

                      <div>
                        <Label>Campus Type</Label>
                        <select
                          value={campus.campusType}
                          onChange={(e) => handleCampusChange(idx, 'campusType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                        >
                          {campusTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label required>Campus Address</Label>
                      <textarea
                        value={campus.address}
                        onChange={(e) => handleCampusChange(idx, 'address', e.target.value)}
                        rows={2}
                        placeholder="Enter full campus address"
                        className={`w-full px-3 py-2 border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none ${
                          errors[`campus_${idx}_address`] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                        }`}
                      />
                      <FieldError msg={errors[`campus_${idx}_address`]} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label optional>Contact Person</Label>
                        <input
                          type="text"
                          value={campus.contactPerson}
                          onChange={(e) => handleCampusChange(idx, 'contactPerson', e.target.value)}
                          placeholder="Campus coordinator"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                        />
                      </div>
                      <div>
                        <Label optional>Contact Phone</Label>
                        <input
                          type="tel"
                          value={campus.contactPhone}
                          onChange={(e) => handleCampusChange(idx, 'contactPhone', e.target.value)}
                          placeholder="+91 98765 43210"
                          className={`w-full px-3 py-2 border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
                            errors[`campus_${idx}_contactPhone`] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                          }`}
                        />
                        <FieldError msg={errors[`campus_${idx}_contactPhone`]} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <FieldError msg={errors.campuses} />
            </div>

            {/* School Type + Board */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>School Type</Label>
                <select name="schoolType" value={formData.schoolType} onChange={handleInputChange} className={selectCls('schoolType')}>
                  <option value="">Select type</option>
                  {schoolTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <FieldError msg={errors.schoolType} />
              </div>
              <div>
                <Label required>Board / Affiliation</Label>
                <select name="board" value={formData.board} onChange={handleInputChange} className={selectCls('board')}>
                  <option value="">Select board</option>
                  {boards.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <FieldError msg={errors.board} />
              </div>
            </div>

            {formData.board === 'Other' && (
              <div>
                <Label required>Specify Board Name</Label>
                <input
                  type="text"
                  name="boardOther"
                  value={formData.boardOther}
                  onChange={handleInputChange}
                  placeholder="Enter board / affiliation name"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${errors.boardOther ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}
                />
                <FieldError msg={errors.boardOther} />
              </div>
            )}

            <div>
              <Label required>Academic Year Structure</Label>
              <select name="academicYearStructure" value={formData.academicYearStructure} onChange={handleInputChange} className={selectCls('academicYearStructure')}>
                <option value="">Select structure</option>
                {academicStructures.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <FieldError msg={errors.academicYearStructure} />
            </div>
          </div>
        );

      /* ─── STEP 2 ─── */
      case 2:
        return (
          <div className="space-y-5">
            <div>
              <Label required>Contact Person's Name</Label>
              <InputWithIcon icon={User} error={errors.contactPersonName}>
                <input
                  type="text"
                  name="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={handleInputChange}
                  placeholder="Full name of the primary contact"
                />
              </InputWithIcon>
              <FieldError msg={errors.contactPersonName} />
            </div>

            <div>
              <Label required>Contact Phone Number</Label>
              <InputWithIcon icon={Phone} error={errors.contactPhone}>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                />
              </InputWithIcon>
              <FieldError msg={errors.contactPhone} />
            </div>

            <div>
              <Label required>Official School Email</Label>
              <InputWithIcon icon={Mail} error={errors.officialEmail}>
                <input
                  type="email"
                  name="officialEmail"
                  value={formData.officialEmail}
                  onChange={handleInputChange}
                  placeholder="admin@yourschool.com"
                />
              </InputWithIcon>
              <FieldError msg={errors.officialEmail} />
            </div>

            <div>
              <Label required>School Address</Label>
              <TextareaWithIcon icon={MapPin} error={errors.address}>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter the complete registered address of your school"
                  style={{ resize: 'none' }}
                />
              </TextareaWithIcon>
              <FieldError msg={errors.address} />
            </div>
          </div>
        );

      /* ─── STEP 3 ─── */
      case 3:
        return (
          <div className="space-y-5">
            <div>
              <Label optional>Website URL</Label>
              <InputWithIcon icon={Globe} error={errors.websiteURL}>
                <input
                  type="url"
                  name="websiteURL"
                  value={formData.websiteURL}
                  onChange={handleInputChange}
                  placeholder="https://www.yourschool.com"
                />
              </InputWithIcon>
              <FieldError msg={errors.websiteURL} />
            </div>

            <div>
              <Label required>Estimated Number of Users</Label>
              <select name="estimatedUsers" value={formData.estimatedUsers} onChange={handleInputChange} className={selectCls('estimatedUsers')}>
                <option value="">Select a range</option>
                {userRanges.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <FieldError msg={errors.estimatedUsers} />
            </div>

            {/* Info card */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-medium mb-1">Almost there!</p>
              <p className="text-amber-700 text-xs leading-relaxed">
                In the next step you'll upload your school logo and verification documents. Make sure they are ready before proceeding.
              </p>
            </div>
          </div>
        );

      /* ─── STEP 4 ─── */
      case 4:
        return (
          <div className="space-y-6">
            {/* Logo */}
            <div>
              <Label required>
                School Logo
                <span className="text-gray-400 font-normal text-xs ml-1">— JPG / PNG / WebP, max 5 MB</span>
              </Label>

              {logoPreview ? (
                <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <img src={logoPreview} alt="Logo preview" className="w-16 h-16 object-cover rounded-lg shrink-0 border border-gray-200" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{formData.logo?.originalName}</p>
                    <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1"><Check size={12} /> Uploaded successfully</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFormData(p => ({ ...p, logo: null })); setLogoPreview(null); }}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                    aria-label="Remove logo"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <input type="file" accept="image/jpeg,image/png,image/jpg,image/webp" onChange={handleLogoUpload} disabled={isUploadingLogo} className="hidden" id="logo-upload" />
                  <label
                    htmlFor="logo-upload"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition ${
                      errors.logo ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50'
                    } ${isUploadingLogo ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
                  >
                    {isUploadingLogo ? (
                      <><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /><p className="text-xs text-gray-500 mt-2">Uploading…</p></>
                    ) : (
                      <><Upload className="w-8 h-8 text-gray-400 mb-2" /><p className="text-sm font-medium text-gray-600">Click to upload logo</p><p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP up to 5 MB</p></>
                    )}
                  </label>
                </>
              )}
              <FieldError msg={errors.logo} />
            </div>

            {/* Verification Docs */}
            <div>
              <Label required>
                Verification Documents
                <span className="text-gray-400 font-normal text-xs ml-1">— PDF / JPG / PNG, max 10 MB each, up to 5 files</span>
              </Label>

              {formData.verificationDocs.length < 5 && (
                <>
                  <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/jpg"
                    onChange={handleDocsUpload}
                    disabled={isUploadingDocs}
                    multiple
                    className="hidden"
                    id="docs-upload"
                  />
                  <label
                    htmlFor="docs-upload"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition ${
                      errors.verificationDocs ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50'
                    } ${isUploadingDocs ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
                  >
                    {isUploadingDocs ? (
                      <><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /><p className="text-xs text-gray-500 mt-2">Uploading…</p></>
                    ) : (
                      <>
                        <FileText className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-600">Click to upload documents</p>
                        <p className="text-xs text-gray-400 mt-1">{formData.verificationDocs.length} / 5 uploaded</p>
                      </>
                    )}
                  </label>
                </>
              )}

              {docsPreview.length > 0 && (
                <div className="mt-3 space-y-2">
                  {docsPreview.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <FileText className="text-gray-400 shrink-0" size={16} />
                      <p className="flex-1 text-sm text-gray-700 truncate min-w-0">{doc.name}</p>
                      <button
                        type="button"
                        onClick={() => removeDocument(idx)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition shrink-0"
                        aria-label="Remove document"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <FieldError msg={errors.verificationDocs} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /* ════════════════════════════════
     MAIN RENDER
  ════════════════════════════════ */
  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-50 via-amber-50 to-orange-50 px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">School Registration</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1.5">
            Register your school to get started with our platform
          </p>
        </div>

        {/* ── Step Indicator ── */}
        <div className="mb-8">
          {/* Progress bar */}
          <div className="relative flex items-center justify-between mb-3">
            {/* background track */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 z-0" />
            {/* filled track */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-amber-400 z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
            {STEPS.map((step) => {
              const done    = step.id < currentStep;
              const active  = step.id === currentStep;
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-200 ${
                      done
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : active
                        ? 'bg-white border-amber-500 text-amber-600 shadow-sm shadow-amber-200'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {done ? <Check size={15} /> : step.id}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Labels */}
          <div className="flex justify-between">
            {STEPS.map((step) => {
              const active = step.id === currentStep;
              return (
                <span
                  key={step.id}
                  className={`text-xs font-medium text-center transition-colors ${
                    active ? 'text-amber-600' : 'text-gray-400'
                  }`}
                  style={{ width: '25%' }}
                >
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel}</span>
                </span>
              );
            })}
          </div>

          {/* Step counter */}
          <p className="text-center text-xs text-gray-400 mt-2">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* ── Form Card ── */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Card header strip */}
          <div className="bg-linear-to-r from-amber-400 to-orange-400 px-6 py-3 flex items-center gap-2">
            {(() => { const S = STEPS[currentStep - 1]; return <S.icon className="w-4 h-4 text-white" />; })()}
            <span className="text-white text-sm font-semibold">{STEPS[currentStep - 1].label}</span>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="p-5 sm:p-7">{renderStep()}</div>

            {/* ── Navigation ── */}
            <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-4 bg-gray-50 border-t border-gray-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
              ) : (
                <div />
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition shadow-sm shadow-amber-200 ml-auto"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition shadow-sm shadow-amber-200 disabled:opacity-60 disabled:cursor-not-allowed ml-auto"
                >
                  {isSubmitting ? (
                    <><Loader2 className="animate-spin" size={16} /> Submitting…</>
                  ) : (
                    <><Check size={16} /> Submit Registration</>
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
