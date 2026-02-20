import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Download,
  FileText,
  File,
  Image as ImageIcon,
  Paperclip,
  Loader2,
  Search,
  Filter,
  Calendar,
  User,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';

const StudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [expandedMaterial, setExpandedMaterial] = useState(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');

      if (!token || userType !== 'Student') {
        setLoading(false);
        return;
      }

      const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
        .replace(/\/$/, '')
        .replace(/\/api$/, '');

      const response = await fetch(`${API_BASE}/api/notifications/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Unable to load study materials');
      }

      const data = await response.json();
      const classMaterials = Array.isArray(data)
        ? data.filter((item) => item.type === 'class_note')
        : [];

      setMaterials(classMaterials);
    } catch (err) {
      console.error('Failed to fetch materials:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return ImageIcon;
    if (type === 'application/pdf') return FileText;
    return File;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get unique subjects for filter
  const subjects = useMemo(() => {
    const subjectSet = new Set();
    materials.forEach((material) => {
      if (material.subjectName) {
        subjectSet.add(material.subjectName);
      }
    });
    return ['all', ...Array.from(subjectSet).sort()];
  }, [materials]);

  // Filter materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const matchesSearch =
        !searchQuery ||
        material.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.message?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject =
        selectedSubject === 'all' || material.subjectName === selectedSubject;

      return matchesSearch && matchesSubject;
    });
  }, [materials, searchQuery, selectedSubject]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600 mb-3" />
                <p className="text-sm text-slate-500">Loading study materials...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <BookOpen className="h-7 w-7" />
              Study Materials
            </h2>
            <p className="mt-1 text-sm text-indigo-100">
              Access all learning materials shared by your teachers
            </p>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-2xl font-bold">{materials.length}</div>
            <div className="text-xs text-indigo-100">Total</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="border-b border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search materials by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Subject Filter */}
          <div className="relative sm:w-64">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white text-sm font-medium"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Filter Summary */}
        {(searchQuery || selectedSubject !== 'all') && (
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <span>
              Showing {filteredMaterials.length} of {materials.length} materials
            </span>
            {searchQuery && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                Search: "{searchQuery}"
              </span>
            )}
            {selectedSubject !== 'all' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                Subject: {selectedSubject}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}

      {/* Materials List */}
      <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
        {filteredMaterials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="p-4 rounded-full bg-slate-100 mb-4">
              <BookOpen className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Materials Found
            </h3>
            <p className="text-sm text-slate-500 max-w-md">
              {searchQuery || selectedSubject !== 'all'
                ? 'No materials match your current filters. Try adjusting your search or filter criteria.'
                : 'Your teachers haven\'t uploaded any study materials yet. Check back later!'}
            </p>
          </div>
        ) : (
          filteredMaterials.map((material) => {
            const attachments = Array.isArray(material.attachments)
              ? material.attachments
              : [];
            const isExpanded = expandedMaterial === material._id;

            return (
              <div
                key={material._id}
                className="p-5 hover:bg-slate-50 transition-colors"
              >
                {/* Material Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-indigo-600 shrink-0" />
                      {material.title}
                    </h3>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      {material.subjectName && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                          <BookOpen className="h-3 w-3" />
                          {material.subjectName}
                        </span>
                      )}
                      {material.typeLabel && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                          {material.typeLabel}
                        </span>
                      )}
                      {material.priority && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium ${
                            material.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : material.priority === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {material.priority}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Attachment Count Badge */}
                  {attachments.length > 0 && (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200">
                      <Paperclip className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm font-semibold text-indigo-700">
                        {attachments.length}
                      </span>
                    </div>
                  )}
                </div>

                {/* Message */}
                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                  {material.message}
                </p>

                {/* Footer Info */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-3">
                  {material.createdByName && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {material.createdByName}
                    </span>
                  )}
                  {material.createdAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(material.createdAt)}
                    </span>
                  )}
                  {material.className && (
                    <span>
                      {material.className}
                      {material.sectionName && `-${material.sectionName}`}
                    </span>
                  )}
                </div>

                {/* Attachments */}
                {attachments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <button
                      onClick={() =>
                        setExpandedMaterial(isExpanded ? null : material._id)
                      }
                      className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 mb-3"
                    >
                      <Paperclip className="h-4 w-4" />
                      {isExpanded ? 'Hide' : 'Show'} Attachments ({attachments.length})
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 animate-in fade-in">
                        {attachments.map((attachment, idx) => {
                          const FileIcon = getFileIcon(attachment?.type);
                          return (
                            <a
                              key={idx}
                              href={attachment?.url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 hover:border-indigo-300 hover:bg-indigo-50 transition group"
                            >
                              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition">
                                <FileIcon className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate group-hover:text-indigo-700">
                                  {attachment?.name || `File ${idx + 1}`}
                                </p>
                                {attachment?.size && (
                                  <p className="text-xs text-slate-500">
                                    {formatFileSize(attachment.size)}
                                  </p>
                                )}
                              </div>
                              <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Summary */}
      {filteredMaterials.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>
              Total: {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={fetchMaterials}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default StudyMaterials;
