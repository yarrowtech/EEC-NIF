import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Loader2, Save, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadBulkReportCardsPdf } from '../../utils/reportCardPdf';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const initialTemplate = {
  title: 'Report Card',
  subtitle: 'Academic Performance Report',
  schoolNameOverride: '',
  logoUrlOverride: '',
  schoolAddressLine: '',
  schoolContactLine: '',
  accentColor: '#1f2937',
  showPageBorder: true,
  watermarkText: '',
  footerNote: 'This is a computer-generated report card.',
  signatureLabel: 'Class Teacher',
  principalLabel: 'Principal',
};

const ReportCardManagement = ({ setShowAdminHeader }) => {
  const [template, setTemplate] = useState(initialTemplate);
  const [templatePreview, setTemplatePreview] = useState(null);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  const logoInputRef = useRef(null);

  const [filters, setFilters] = useState({
    classId: '',
    sectionId: '',
    academicYearId: '',
  });

  useEffect(() => {
    setShowAdminHeader?.(true);
  }, [setShowAdminHeader]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const headers = { authorization: `Bearer ${token}` };
        const [templateRes, classesRes, sectionsRes, yearsRes] = await Promise.all([
          fetch(`${API_BASE}/api/reports/report-cards/template`, { headers }),
          fetch(`${API_BASE}/api/academic/classes`, { headers }),
          fetch(`${API_BASE}/api/academic/sections`, { headers }),
          fetch(`${API_BASE}/api/academic/years`, { headers }),
        ]);

        const [templateData, classesData, sectionsData, yearsData] = await Promise.all([
          templateRes.json().catch(() => ({})),
          classesRes.json().catch(() => []),
          sectionsRes.json().catch(() => []),
          yearsRes.json().catch(() => []),
        ]);

        if (!templateRes.ok) throw new Error(templateData?.error || 'Unable to load report card template');
        setTemplate({
          ...initialTemplate,
          ...templateData,
        });
        setTemplatePreview(templateData || null);
        setClasses(Array.isArray(classesData) ? classesData : []);
        setSections(Array.isArray(sectionsData) ? sectionsData : []);
        setAcademicYears(Array.isArray(yearsData) ? yearsData : []);
      } catch (err) {
        toast.error(err.message || 'Unable to load report card setup');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const filteredSections = useMemo(() => {
    if (!filters.classId) return sections;
    return sections.filter((section) => String(section.classId) === String(filters.classId));
  }, [sections, filters.classId]);

  const handleTemplateSave = async () => {
    if (!token) return;
    setSavingTemplate(true);
    try {
      const res = await fetch(`${API_BASE}/api/reports/report-cards/template`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(template),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Unable to save template');
      setTemplate({ ...template, ...(data?.template || {}) });
      setTemplatePreview(data?.template || template);
      toast.success('Report card template saved');
    } catch (err) {
      toast.error(err.message || 'Unable to save template');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file || !token) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo must be less than 5 MB');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'report-card-logos');
      const res = await fetch(`${API_BASE}/api/uploads/cloudinary/single`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Logo upload failed');
      const url = data?.secure_url || data?.url || '';
      if (url) {
        setTemplate((prev) => ({ ...prev, logoUrlOverride: url }));
        toast.success('Logo uploaded');
      }
    } catch (err) {
      toast.error(err.message || 'Logo upload failed');
    }
  };

  const handleBulkGenerate = async () => {
    if (!token) return;
    if (!filters.classId || !filters.sectionId || !filters.academicYearId) {
      toast.error('Select class, section and academic year');
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/api/reports/report-cards/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(filters),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Unable to generate report cards');
      const cards = Array.isArray(data?.reportCards) ? data.reportCards : [];
      setReportCount(cards.length);
      if (!cards.length) {
        toast.error('No published results found for selected filters');
        return;
      }
      const className = data?.filters?.className || 'class';
      const sectionName = data?.filters?.sectionName || 'section';
      const yearName = data?.filters?.academicYear || 'year';
      const fileName = `report_cards_${className}_${sectionName}_${yearName}.pdf`
        .replace(/\s+/g, '_')
        .toLowerCase();
      await downloadBulkReportCardsPdf({
        template: data?.template || templatePreview || template,
        reportCards: cards,
        fileName,
      });
      toast.success(`Generated ${cards.length} report cards`);
    } catch (err) {
      toast.error(err.message || 'Unable to generate report cards');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-500">Loading report card management...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white">
        <h1 className="text-2xl font-bold">Report Card Management</h1>
        <p className="text-sm text-yellow-50">Customize report card design and bulk-generate class-section wise PDFs.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Template Setup</h2>
          <div className="grid grid-cols-1 gap-3">
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Title"
              value={template.title}
              onChange={(e) => setTemplate((prev) => ({ ...prev, title: e.target.value }))}
            />
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Subtitle"
              value={template.subtitle}
              onChange={(e) => setTemplate((prev) => ({ ...prev, subtitle: e.target.value }))}
            />
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="School Name Override"
              value={template.schoolNameOverride}
              onChange={(e) => setTemplate((prev) => ({ ...prev, schoolNameOverride: e.target.value }))}
            />
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="School Address Line (for school pad)"
              value={template.schoolAddressLine}
              onChange={(e) => setTemplate((prev) => ({ ...prev, schoolAddressLine: e.target.value }))}
            />
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="School Contact Line (phone/email/website)"
              value={template.schoolContactLine}
              onChange={(e) => setTemplate((prev) => ({ ...prev, schoolContactLine: e.target.value }))}
            />
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="Logo URL Override"
                value={template.logoUrlOverride}
                onChange={(e) => setTemplate((prev) => ({ ...prev, logoUrlOverride: e.target.value }))}
              />
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleLogoUpload(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Upload className="h-4 w-4" />
                Upload
              </button>
            </div>
            <input
              type="color"
              className="h-10 w-full rounded-lg border border-gray-300 px-2 py-1"
              value={template.accentColor || '#1f2937'}
              onChange={(e) => setTemplate((prev) => ({ ...prev, accentColor: e.target.value }))}
            />
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Watermark Text (optional, e.g. SCHOOL COPY)"
              value={template.watermarkText}
              onChange={(e) => setTemplate((prev) => ({ ...prev, watermarkText: e.target.value }))}
            />
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={Boolean(template.showPageBorder)}
                onChange={(e) => setTemplate((prev) => ({ ...prev, showPageBorder: e.target.checked }))}
              />
              Show page border (school pad style)
            </label>
            <input
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Footer Note"
              value={template.footerNote}
              onChange={(e) => setTemplate((prev) => ({ ...prev, footerNote: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="Signature Label"
                value={template.signatureLabel}
                onChange={(e) => setTemplate((prev) => ({ ...prev, signatureLabel: e.target.value }))}
              />
              <input
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="Principal Label"
                value={template.principalLabel}
                onChange={(e) => setTemplate((prev) => ({ ...prev, principalLabel: e.target.value }))}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleTemplateSave}
            disabled={savingTemplate}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {savingTemplate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Template
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Bulk PDF Generation</h2>
          <div className="grid grid-cols-1 gap-3">
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={filters.classId}
              onChange={(e) => setFilters((prev) => ({ ...prev, classId: e.target.value, sectionId: '' }))}
            >
              <option value="">Select Class</option>
              {classes.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={filters.sectionId}
              onChange={(e) => setFilters((prev) => ({ ...prev, sectionId: e.target.value }))}
            >
              <option value="">Select Section</option>
              {filteredSections.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={filters.academicYearId}
              onChange={(e) => setFilters((prev) => ({ ...prev, academicYearId: e.target.value }))}
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleBulkGenerate}
            disabled={generating}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Generate Bulk PDF
          </button>
          <p className="mt-3 text-sm text-gray-500">Last generated report cards: {reportCount}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportCardManagement;
