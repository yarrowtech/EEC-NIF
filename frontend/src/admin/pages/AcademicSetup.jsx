import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Calendar, Layers, Plus, Edit3, Trash2, X, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL;

const AcademicSetup = ({ setShowAdminHeader }) => {
  const [activeTab, setActiveTab] = useState("years");
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [error, setError] = useState("");

  const [yearForm, setYearForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isActive: false,
  });
  const [classForm, setClassForm] = useState({
    name: "",
    academicYearId: "",
    order: "",
  });
  const [sectionForm, setSectionForm] = useState({
    name: "",
    classId: "",
  });
  // Edit states for each entity type
  const [editingYear, setEditingYear] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  // Search/filter states
  const [searchYear, setSearchYear] = useState("");
  const [searchClass, setSearchClass] = useState("");
  const [searchSection, setSearchSection] = useState("");
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Sorting states for each tab
  const [yearSort, setYearSort] = useState({ field: 'name', order: 'asc' });
  const [classSort, setClassSort] = useState({ field: 'order', order: 'asc' });
  const [sectionSort, setSectionSort] = useState({ field: 'name', order: 'asc' });
  // Pagination states
  const [yearPage, setYearPage] = useState(1);
  const [classPage, setClassPage] = useState(1);
  const [sectionPage, setSectionPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bulk selection states
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      authorization: token ? `Bearer ${token}` : "",
    };
  }, []);

  // Filtered data for search
  const filteredYears = useMemo(() => {
    if (!searchYear.trim()) return years;
    const query = searchYear.toLowerCase();
    return years.filter(
      (y) =>
        y.name.toLowerCase().includes(query) ||
        (y.startDate && new Date(y.startDate).toLocaleDateString().includes(query))
    );
  }, [years, searchYear]);

  const filteredClasses = useMemo(() => {
    if (!searchClass.trim()) return classes;
    const query = searchClass.toLowerCase();
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(query) || c.order?.toString().includes(query)
    );
  }, [classes, searchClass]);

  const filteredSections = useMemo(() => {
    if (!searchSection.trim()) return sections;
    const query = searchSection.toLowerCase();
    return sections.filter((s) => {
      const className = classes.find((c) => c._id === s.classId)?.name || "";
      return s.name.toLowerCase().includes(query) || className.toLowerCase().includes(query);
    });
  }, [sections, searchSection, classes]);

  const handleApiError = (err) => {
    console.error(err);
    setError("Unable to load academic data. Please retry.");
  };

  const loadAcademicData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/academic/hierarchy`, {
        method: "GET",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Failed to load academic setup");
      const data = await res.json();
      setYears(Array.isArray(data.years) ? data.years : []);
      setClasses(Array.isArray(data.classes) ? data.classes : []);
      setSections(Array.isArray(data.sections) ? data.sections : []);
    } catch (err) {
      handleApiError(err);
      throw err;
    }
  };

  useEffect(() => {
    setShowAdminHeader?.(false);
    setError("");
    loadAcademicData().catch(handleApiError);
  }, [setShowAdminHeader]);

  const handleCreate = async (endpoint, payload, onSuccess) => {
    setError("");
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Request failed");
    }
    await res.json().catch(() => ({}));
    await onSuccess();
  };

  const submitYear = async (e) => {
    e.preventDefault();
    try {
      await handleCreate("/api/academic/years", yearForm, loadAcademicData);
      setYearForm({ name: "", startDate: "", endDate: "", isActive: false });
    } catch (err) {
      handleApiError(err);
    }
  };

  const submitClass = async (e) => {
    e.preventDefault();
    try {
      await handleCreate("/api/academic/classes", classForm, loadAcademicData);
      setClassForm({ name: "", academicYearId: "", order: "" });
    } catch (err) {
      handleApiError(err);
    }
  };

  const submitSection = async (e) => {
    e.preventDefault();
    if (!sectionForm.classId) {
      setError("Select a class before creating a section.");
      return;
    }
    try {
      await handleCreate("/api/academic/sections", sectionForm, loadAcademicData);
      setSectionForm({ name: "", classId: "" });
    } catch (err) {
      handleApiError(err);
    }
  };

  // Generic update handler
  const handleUpdate = async (endpoint, id, payload, onSuccess) => {
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}${endpoint}/${id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Update failed");
      }
      await res.json();
      await onSuccess();
      const entityName = endpoint.split("/").pop();
      toast.success(`${entityName.slice(0, -1)} updated successfully!`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update handlers for each entity
  const updateYear = async (e) => {
    e.preventDefault();
    await handleUpdate(
      "/api/academic/years",
      editingYear._id,
      {
        name: editingYear.name,
        startDate: editingYear.startDate,
        endDate: editingYear.endDate,
        isActive: editingYear.isActive,
      },
      async () => {
        await loadAcademicData();
        setEditingYear(null);
      }
    );
  };

  const updateClass = async (e) => {
    e.preventDefault();
    await handleUpdate(
      "/api/academic/classes",
      editingClass._id,
      {
        name: editingClass.name,
        academicYearId: editingClass.academicYearId,
        order: editingClass.order,
      },
      async () => {
        await loadAcademicData();
        setEditingClass(null);
      }
    );
  };

  const updateSection = async (e) => {
    e.preventDefault();
    if (!editingSection.classId) {
      setError("Select a class before updating section.");
      return;
    }
    await handleUpdate(
      "/api/academic/sections",
      editingSection._id,
      {
        name: editingSection.name,
        classId: editingSection.classId,
      },
      async () => {
        await loadAcademicData();
        setEditingSection(null);
      }
    );
  };

  // Generic delete handler with SweetAlert2 confirmation
  const handleDelete = async (endpoint, id, entityName, onSuccess) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete this ${entityName}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}${endpoint}/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        // Handle dependent records error
        if (res.status === 409 && (data.dependentCount || data.dependentSections || data.dependentSubjects)) {
          const cascadeConfirm = await Swal.fire({
            title: "Dependent Records Found",
            html: data.error + "<br><br>Do you want to delete this and all dependent records?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete all",
            cancelButtonText: "Cancel",
          });

          if (cascadeConfirm.isConfirmed) {
            // Retry with cascade flag
            const cascadeRes = await fetch(`${API_BASE}${endpoint}/${id}?cascade=true`, {
              method: "DELETE",
              headers: authHeaders,
            });

            if (!cascadeRes.ok) {
              const errData = await cascadeRes.json().catch(() => ({}));
              throw new Error(errData.error || "Delete failed");
            }

            const result = await cascadeRes.json();
            await onSuccess();

            Swal.fire({
              title: "Deleted!",
              html: `${entityName} and ${result.deletedSections || 0} section(s) deleted.`,
              icon: "success",
              timer: 3000,
            });
            return;
          } else {
            return; // User cancelled cascade delete
          }
        }

        throw new Error(data.error || "Delete failed");
      }

      await onSuccess();
      Swal.fire({
        title: "Deleted!",
        text: `${entityName} has been deleted.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.message,
        icon: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Delete handlers for each entity
  const deleteYear = (id) =>
    handleDelete("/api/academic/years", id, "academic year", loadAcademicData);
  const deleteClass = (id) => handleDelete("/api/academic/classes", id, "class", loadAcademicData);
  const deleteSection = (id) =>
    handleDelete("/api/academic/sections", id, "section", loadAcademicData);

  // Sorting utility function
  const sortData = (data, sortConfig) => {
    if (!sortConfig.field) return data;

    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.field];
      let bVal = b[sortConfig.field];

      // Handle dates
      if (sortConfig.field.includes('Date')) {
        aVal = new Date(aVal || 0);
        bVal = new Date(bVal || 0);
      }

      // Handle strings
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal?.toLowerCase() || '';
      }

      // Handle numbers
      if (sortConfig.field === 'order') {
        aVal = aVal ?? 0;
        bVal = bVal ?? 0;
      }

      if (aVal < bVal) return sortConfig.order === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.order === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Sorted and filtered data
  const sortedAndFilteredYears = useMemo(() => {
    return sortData(filteredYears, yearSort);
  }, [filteredYears, yearSort]);

  const sortedAndFilteredClasses = useMemo(() => {
    return sortData(filteredClasses, classSort);
  }, [filteredClasses, classSort]);

  const sortedAndFilteredSections = useMemo(() => {
    return sortData(filteredSections, sectionSort);
  }, [filteredSections, sectionSort]);

  // Paginated data
  const paginatedYears = useMemo(() => {
    const start = (yearPage - 1) * itemsPerPage;
    return sortedAndFilteredYears.slice(start, start + itemsPerPage);
  }, [sortedAndFilteredYears, yearPage, itemsPerPage]);

  const paginatedClasses = useMemo(() => {
    const start = (classPage - 1) * itemsPerPage;
    return sortedAndFilteredClasses.slice(start, start + itemsPerPage);
  }, [sortedAndFilteredClasses, classPage, itemsPerPage]);

  const paginatedSections = useMemo(() => {
    const start = (sectionPage - 1) * itemsPerPage;
    return sortedAndFilteredSections.slice(start, start + itemsPerPage);
  }, [sortedAndFilteredSections, sectionPage, itemsPerPage]);

  // Bulk selection handlers
  const handleSelectAll = (entityType, items) => {
    const setters = {
      years: setSelectedYears,
      classes: setSelectedClasses,
      sections: setSelectedSections,
    };

    const currentSelected = {
      years: selectedYears,
      classes: selectedClasses,
      sections: selectedSections,
    }[entityType];

    if (currentSelected.length === items.length && items.length > 0) {
      setters[entityType]([]);
    } else {
      setters[entityType](items.map(item => item._id));
    }
  };

  const handleSelectItem = (entityType, id) => {
    const setters = {
      years: setSelectedYears,
      classes: setSelectedClasses,
      sections: setSelectedSections,
    };

    const currentSelected = {
      years: selectedYears,
      classes: selectedClasses,
      sections: selectedSections,
    }[entityType];

    if (currentSelected.includes(id)) {
      setters[entityType](currentSelected.filter(itemId => itemId !== id));
    } else {
      setters[entityType]([...currentSelected, id]);
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async (entityType, entityName) => {
    const selected = {
      years: selectedYears,
      classes: selectedClasses,
      sections: selectedSections,
    }[entityType];

    if (selected.length === 0) return;

    const confirm = await Swal.fire({
      title: 'Bulk Delete',
      html: `Are you sure you want to delete <strong>${selected.length}</strong> ${entityName}(s)?<br>This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete all',
    });

    if (!confirm.isConfirmed) return;

    let successCount = 0;
    let failCount = 0;

    Swal.fire({
      title: 'Deleting...',
      html: `Deleted: <b>0</b> / ${selected.length}`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    for (const id of selected) {
      try {
        const endpoint = {
          years: '/api/academic/years',
          classes: '/api/academic/classes',
          sections: '/api/academic/sections',
        }[entityType];

        const res = await fetch(`${API_BASE}${endpoint}/${id}?cascade=true`, {
          method: 'DELETE',
          headers: authHeaders,
        });

        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }

        Swal.update({
          html: `Deleted: <b>${successCount}</b> / ${selected.length}${
            failCount > 0 ? ` (${failCount} failed)` : ''
          }`,
        });
      } catch (err) {
        failCount++;
      }
    }

    await loadAcademicData();

    setSelectedYears([]);
    setSelectedClasses([]);
    setSelectedSections([]);

    Swal.fire({
      title: 'Completed',
      html: `Successfully deleted <b>${successCount}</b> ${entityName}(s)${
        failCount > 0 ? `<br>${failCount} deletion(s) failed` : ''
      }`,
      icon: successCount > 0 ? 'success' : 'error',
    });
  };

  // Bulk import handlers

  const tabButton = (key, label, Icon) => (
    <button
      type="button"
      onClick={() => setActiveTab(key)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
        activeTab === key
          ? "bg-yellow-500 text-white"
          : "bg-white text-gray-600 border border-gray-200 hover:bg-yellow-50"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  // Search Input Component
  const SearchInput = ({ value, onChange, placeholder }) => (
    <div className="mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none text-sm"
      />
    </div>
  );

  // Edit Modal Component
  const EditModal = ({ isOpen, onClose, title, children, onSubmit, isSubmitting }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={onSubmit}>
            {children}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Sortable Header Component
  const SortableHeader = ({ label, field, sortConfig, onSort }) => (
    <th
      onClick={() => onSort(field)}
      className="cursor-pointer px-4 py-3 text-left hover:bg-yellow-100 transition select-none bg-gray-50"
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-700">{label}</span>
        {sortConfig.field === field && (
          sortConfig.order === 'asc' ?
            <ChevronUp className="w-4 h-4 text-yellow-600" /> :
            <ChevronDown className="w-4 h-4 text-yellow-600" />
        )}
        {sortConfig.field !== field && (
          <ChevronsUpDown className="w-4 h-4 text-gray-400" />
        )}
      </div>
    </th>
  );

  // Pagination Component
  const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

    const pageNumbers = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    if (totalItems === 0) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 gap-3">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            Showing {startIndex} to {endIndex} of {totalItems} items
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-yellow-500"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>

        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Previous
          </button>

          {start > 1 && (
            <>
              <button onClick={() => onPageChange(1)} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm">
                1
              </button>
              {start > 2 && <span className="px-2 py-1 text-sm">...</span>}
            </>
          )}

          {pageNumbers.map(num => (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              className={`px-3 py-1 border rounded text-sm ${
                currentPage === num ? 'bg-yellow-500 text-white border-yellow-500' : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              {num}
            </button>
          ))}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span className="px-2 py-1 text-sm">...</span>}
              <button onClick={() => onPageChange(totalPages)} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm">
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 p-8">
      <div className="max-w-6xl mx-auto bg-white/90 rounded-2xl shadow-2xl p-8 border border-yellow-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-700">Academic Setup</h1>
            <p className="text-gray-600 mt-2">
              Manage academic years, classes, and sections.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {tabButton("years", "Academic Years", Calendar)}
            {tabButton("classes", "Classes", Layers)}
            {tabButton("sections", "Sections", BookOpen)}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {activeTab === "years" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={submitYear} className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Academic Year</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Year Name</label>
                  <input
                    type="text"
                    value={yearForm.name}
                    onChange={(e) => setYearForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                    placeholder="2025-2026"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={yearForm.startDate}
                      onChange={(e) =>
                        setYearForm((prev) => ({ ...prev, startDate: e.target.value }))
                      }
                      className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={yearForm.endDate}
                      onChange={(e) =>
                        setYearForm((prev) => ({ ...prev, endDate: e.target.value }))
                      }
                      className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={yearForm.isActive}
                    onChange={(e) =>
                      setYearForm((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                    className="h-4 w-4 text-yellow-600 border-gray-300 rounded"
                  />
                  Set as active
                </label>
                <button
                  type="submit"
                  className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Year
                </button>
              </div>
            </form>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Academic Years</h2>

              {/* Bulk Action Bar */}
              {selectedYears.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedYears.length} item(s) selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedYears([])}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-white"
                    >
                      Clear Selection
                    </button>
                    <button
                      onClick={() => handleBulkDelete('years', 'academic year')}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}

              <SearchInput
                value={searchYear}
                onChange={setSearchYear}
                placeholder="Search academic years..."
              />

              {/* Table View */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 w-12 bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedYears.length === paginatedYears.length && paginatedYears.length > 0}
                          onChange={() => handleSelectAll('years', paginatedYears)}
                          className="h-4 w-4 text-yellow-600 rounded"
                        />
                      </th>
                      <SortableHeader
                        label="Name"
                        field="name"
                        sortConfig={yearSort}
                        onSort={(f) => setYearSort(prev => ({field: f, order: prev.field === f && prev.order === 'asc' ? 'desc' : 'asc'}))}
                      />
                      <SortableHeader
                        label="Start Date"
                        field="startDate"
                        sortConfig={yearSort}
                        onSort={(f) => setYearSort(prev => ({field: f, order: prev.field === f && prev.order === 'asc' ? 'desc' : 'asc'}))}
                      />
                      <SortableHeader
                        label="End Date"
                        field="endDate"
                        sortConfig={yearSort}
                        onSort={(f) => setYearSort(prev => ({field: f, order: prev.field === f && prev.order === 'asc' ? 'desc' : 'asc'}))}
                      />
                      <th className="px-4 py-3 text-left bg-gray-50">
                        <span className="font-semibold text-gray-700">Status</span>
                      </th>
                      <th className="px-4 py-3 text-left bg-gray-50">
                        <span className="font-semibold text-gray-700">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedYears.map((year) => (
                      <tr key={year._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedYears.includes(year._id)}
                            onChange={() => handleSelectItem('years', year._id)}
                            className="h-4 w-4 text-yellow-600 rounded"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{year.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {year.startDate ? new Date(year.startDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {year.endDate ? new Date(year.endDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {year.isActive ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingYear(year)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteYear(year._id)}
                              disabled={deletingId === year._id}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {paginatedYears.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchYear ? "No matching academic years found." : "No academic years yet."}
                  </div>
                )}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={yearPage}
                totalItems={sortedAndFilteredYears.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setYearPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          </div>
        )}

        {activeTab === "classes" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={submitClass} className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Class</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Class Name</label>
                  <input
                    type="text"
                    value={classForm.name}
                    onChange={(e) => setClassForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                    placeholder="Grade 10"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Academic Year</label>
                  <select
                    value={classForm.academicYearId}
                    onChange={(e) =>
                      setClassForm((prev) => ({ ...prev, academicYearId: e.target.value }))
                    }
                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Optional</option>
                    {years.map((year) => (
                      <option key={year._id} value={year._id}>
                        {year.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Display Order</label>
                  <input
                    type="number"
                    value={classForm.order}
                    onChange={(e) => setClassForm((prev) => ({ ...prev, order: e.target.value }))}
                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                    placeholder="0"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Class
                </button>
              </div>
            </form>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Classes</h2>

              {selectedClasses.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedClasses.length} item(s) selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedClasses([])}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-white"
                    >
                      Clear Selection
                    </button>
                    <button
                      onClick={() => handleBulkDelete('classes', 'class')}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}

              <SearchInput
                value={searchClass}
                onChange={setSearchClass}
                placeholder="Search classes..."
              />

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 w-12 bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedClasses.length === paginatedClasses.length && paginatedClasses.length > 0}
                          onChange={() => handleSelectAll('classes', paginatedClasses)}
                          className="h-4 w-4 text-yellow-600 rounded"
                        />
                      </th>
                      <SortableHeader
                        label="Name"
                        field="name"
                        sortConfig={classSort}
                        onSort={(f) => setClassSort(prev => ({field: f, order: prev.field === f && prev.order === 'asc' ? 'desc' : 'asc'}))}
                      />
                      <SortableHeader
                        label="Order"
                        field="order"
                        sortConfig={classSort}
                        onSort={(f) => setClassSort(prev => ({field: f, order: prev.field === f && prev.order === 'asc' ? 'desc' : 'asc'}))}
                      />
                      <th className="px-4 py-3 text-left bg-gray-50">
                        <span className="font-semibold text-gray-700">Academic Year</span>
                      </th>
                      <th className="px-4 py-3 text-left bg-gray-50">
                        <span className="font-semibold text-gray-700">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedClasses.map((cls) => (
                      <tr key={cls._id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedClasses.includes(cls._id)}
                            onChange={() => handleSelectItem('classes', cls._id)}
                            className="h-4 w-4 text-yellow-600 rounded"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{cls.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{cls.order ?? 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {years.find(y => y._id === cls.academicYearId)?.name || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingClass(cls)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteClass(cls._id)}
                              disabled={deletingId === cls._id}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {paginatedClasses.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchClass ? "No matching classes found." : "No classes yet."}
                  </div>
                )}
              </div>

              <Pagination
                currentPage={classPage}
                totalItems={sortedAndFilteredClasses.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setClassPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          </div>
        )}

        {activeTab === "sections" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={submitSection} className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Section</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Section Name</label>
                  <input
                    type="text"
                    value={sectionForm.name}
                    onChange={(e) => setSectionForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                    placeholder="A"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Class</label>
                  <select
                    value={sectionForm.classId}
                    onChange={(e) =>
                      setSectionForm((prev) => ({ ...prev, classId: e.target.value }))
                    }
                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                    required
                  >
                    <option value="">Select class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Section
                </button>
              </div>
            </form>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sections</h2>

              <SearchInput
                value={searchSection}
                onChange={setSearchSection}
                placeholder="Search sections..."
              />

              <div className="space-y-3">
                {filteredSections.map((section) => (
                  <div
                    key={section._id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{section.name}</p>
                      <p className="text-xs text-gray-500">
                        Class: {classes.find((cls) => cls._id === section.classId)?.name || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingSection(section)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSection(section._id)}
                        disabled={deletingId === section._id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredSections.length === 0 && (
                  <p className="text-sm text-gray-500">
                    {searchSection ? "No matching sections found." : "No sections yet."}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}




        {/* Edit Year Modal */}
        <EditModal
          isOpen={editingYear !== null}
          onClose={() => setEditingYear(null)}
          title="Edit Academic Year"
          onSubmit={updateYear}
          isSubmitting={isSubmitting}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Year Name</label>
              <input
                type="text"
                value={editingYear?.name || ""}
                onChange={(e) => setEditingYear((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={editingYear?.startDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setEditingYear((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                  className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={editingYear?.endDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setEditingYear((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={editingYear?.isActive || false}
                onChange={(e) =>
                  setEditingYear((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                className="h-4 w-4 text-yellow-600 border-gray-300 rounded"
              />
              Set as active
            </label>
          </div>
        </EditModal>

        {/* Edit Class Modal */}
        <EditModal
          isOpen={editingClass !== null}
          onClose={() => setEditingClass(null)}
          title="Edit Class"
          onSubmit={updateClass}
          isSubmitting={isSubmitting}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Class Name</label>
              <input
                type="text"
                value={editingClass?.name || ""}
                onChange={(e) => setEditingClass((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Academic Year</label>
              <select
                value={editingClass?.academicYearId || ""}
                onChange={(e) =>
                  setEditingClass((prev) => ({ ...prev, academicYearId: e.target.value }))
                }
                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Optional</option>
                {years.map((year) => (
                  <option key={year._id} value={year._id}>
                    {year.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Display Order</label>
              <input
                type="number"
                value={editingClass?.order ?? ""}
                onChange={(e) => setEditingClass((prev) => ({ ...prev, order: e.target.value }))}
                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                placeholder="0"
              />
            </div>
          </div>
        </EditModal>

        {/* Edit Section Modal */}
        <EditModal
          isOpen={editingSection !== null}
          onClose={() => setEditingSection(null)}
          title="Edit Section"
          onSubmit={updateSection}
          isSubmitting={isSubmitting}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Section Name</label>
              <input
                type="text"
                value={editingSection?.name || ""}
                onChange={(e) =>
                  setEditingSection((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Class</label>
              <select
                value={editingSection?.classId || ""}
                onChange={(e) =>
                  setEditingSection((prev) => ({ ...prev, classId: e.target.value }))
                }
                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                required
              >
                <option value="">Select class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </EditModal>


      </div>
    </div>
  );
};

export default AcademicSetup;
