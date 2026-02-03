import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Calendar, Layers, Plus, Edit3, Trash2, X, ChevronUp, ChevronDown, ChevronsUpDown, Download, FileSpreadsheet, Upload } from "lucide-react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import * as XLSX from 'xlsx';

const API_BASE = import.meta.env.VITE_API_URL;

const AcademicSetup = ({ setShowAdminHeader }) => {
  const [activeTab, setActiveTab] = useState("years");
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
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
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    code: "",
    classId: "",
  });

  // Edit states for each entity type
  const [editingYear, setEditingYear] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);

  // Search/filter states
  const [searchYear, setSearchYear] = useState("");
  const [searchClass, setSearchClass] = useState("");
  const [searchSection, setSearchSection] = useState("");
  const [searchSubject, setSearchSubject] = useState("");

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Sorting states for each tab
  const [yearSort, setYearSort] = useState({ field: 'name', order: 'asc' });
  const [classSort, setClassSort] = useState({ field: 'order', order: 'asc' });
  const [sectionSort, setSectionSort] = useState({ field: 'name', order: 'asc' });
  const [subjectSort, setSubjectSort] = useState({ field: 'name', order: 'asc' });

  // Pagination states
  const [yearPage, setYearPage] = useState(1);
  const [classPage, setClassPage] = useState(1);
  const [sectionPage, setSectionPage] = useState(1);
  const [subjectPage, setSubjectPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bulk selection states
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

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

  const filteredSubjects = useMemo(() => {
    if (!searchSubject.trim()) return subjects;
    const query = searchSubject.toLowerCase();
    return subjects.filter((s) => {
      const className = classes.find((c) => c._id === s.classId)?.name || "";
      return (
        s.name.toLowerCase().includes(query) ||
        s.code?.toLowerCase().includes(query) ||
        className.toLowerCase().includes(query)
      );
    });
  }, [subjects, searchSubject, classes]);

  const handleApiError = (err) => {
    console.error(err);
    setError("Unable to load academic data. Please retry.");
  };

  const fetchYears = async () => {
    const res = await fetch(`${API_BASE}/api/academic/years`, {
      method: "GET",
      headers: authHeaders,
    });
    if (!res.ok) throw new Error("Failed to load academic years");
    const data = await res.json();
    setYears(Array.isArray(data) ? data : []);
  };

  const fetchClasses = async () => {
    const res = await fetch(`${API_BASE}/api/academic/classes`, {
      method: "GET",
      headers: authHeaders,
    });
    if (!res.ok) throw new Error("Failed to load classes");
    const data = await res.json();
    setClasses(Array.isArray(data) ? data : []);
  };

  const fetchSections = async () => {
    const res = await fetch(`${API_BASE}/api/academic/sections`, {
      method: "GET",
      headers: authHeaders,
    });
    if (!res.ok) throw new Error("Failed to load sections");
    const data = await res.json();
    setSections(Array.isArray(data) ? data : []);
  };

  const fetchSubjects = async () => {
    const res = await fetch(`${API_BASE}/api/academic/subjects`, {
      method: "GET",
      headers: authHeaders,
    });
    if (!res.ok) throw new Error("Failed to load subjects");
    const data = await res.json();
    setSubjects(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    setShowAdminHeader?.(false);
    setError("");
    Promise.all([fetchYears(), fetchClasses(), fetchSections(), fetchSubjects()]).catch(
      handleApiError
    );
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
      await handleCreate("/api/academic/years", yearForm, fetchYears);
      setYearForm({ name: "", startDate: "", endDate: "", isActive: false });
    } catch (err) {
      handleApiError(err);
    }
  };

  const submitClass = async (e) => {
    e.preventDefault();
    try {
      await handleCreate("/api/academic/classes", classForm, fetchClasses);
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
      await handleCreate("/api/academic/sections", sectionForm, fetchSections);
      setSectionForm({ name: "", classId: "" });
    } catch (err) {
      handleApiError(err);
    }
  };

  const submitSubject = async (e) => {
    e.preventDefault();
    try {
      await handleCreate("/api/academic/subjects", subjectForm, fetchSubjects);
      setSubjectForm({ name: "", code: "", classId: "" });
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
        await fetchYears();
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
        await fetchClasses();
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
        await fetchSections();
        setEditingSection(null);
      }
    );
  };

  const updateSubject = async (e) => {
    e.preventDefault();
    await handleUpdate(
      "/api/academic/subjects",
      editingSubject._id,
      {
        name: editingSubject.name,
        code: editingSubject.code,
        classId: editingSubject.classId,
      },
      async () => {
        await fetchSubjects();
        setEditingSubject(null);
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
              html: `${entityName} and ${result.deletedSections || 0} section(s), ${
                result.deletedSubjects || 0
              } subject(s) deleted.`,
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
    handleDelete("/api/academic/years", id, "academic year", fetchYears);
  const deleteClass = (id) => handleDelete("/api/academic/classes", id, "class", fetchClasses);
  const deleteSection = (id) =>
    handleDelete("/api/academic/sections", id, "section", fetchSections);
  const deleteSubject = (id) =>
    handleDelete("/api/academic/subjects", id, "subject", fetchSubjects);

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

  const sortedAndFilteredSubjects = useMemo(() => {
    return sortData(filteredSubjects, subjectSort);
  }, [filteredSubjects, subjectSort]);

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

  const paginatedSubjects = useMemo(() => {
    const start = (subjectPage - 1) * itemsPerPage;
    return sortedAndFilteredSubjects.slice(start, start + itemsPerPage);
  }, [sortedAndFilteredSubjects, subjectPage, itemsPerPage]);

  // Bulk selection handlers
  const handleSelectAll = (entityType, items) => {
    const setters = {
      years: setSelectedYears,
      classes: setSelectedClasses,
      sections: setSelectedSections,
      subjects: setSelectedSubjects,
    };

    const currentSelected = {
      years: selectedYears,
      classes: selectedClasses,
      sections: selectedSections,
      subjects: selectedSubjects,
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
      subjects: setSelectedSubjects,
    };

    const currentSelected = {
      years: selectedYears,
      classes: selectedClasses,
      sections: selectedSections,
      subjects: selectedSubjects,
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
      subjects: selectedSubjects,
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
          subjects: '/api/academic/subjects',
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

    await Promise.all([fetchYears(), fetchClasses(), fetchSections(), fetchSubjects()]);

    setSelectedYears([]);
    setSelectedClasses([]);
    setSelectedSections([]);
    setSelectedSubjects([]);

    Swal.fire({
      title: 'Completed',
      html: `Successfully deleted <b>${successCount}</b> ${entityName}(s)${
        failCount > 0 ? `<br>${failCount} deletion(s) failed` : ''
      }`,
      icon: successCount > 0 ? 'success' : 'error',
    });
  };

  // Export handlers
  const exportToCSV = (data, filename, columns) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = columns.map(col => col.label).join(',');
    const rows = data.map(item => {
      return columns.map(col => {
        let value = col.accessor(item);
        if (value instanceof Date) {
          value = value.toLocaleDateString();
        }
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',');
    });

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success(`Exported ${data.length} records to CSV`);
  };

  const exportToExcel = (data, filename, columns) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const excelData = data.map(item => {
      const row = {};
      columns.forEach(col => {
        row[col.label] = col.accessor(item);
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    ws['!cols'] = columns.map(col => ({ wch: col.width || 15 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast.success(`Exported ${data.length} records to Excel`);
  };

  // Export column configurations
  const yearColumns = [
    { label: 'Name', accessor: (y) => y.name, width: 20 },
    { label: 'Start Date', accessor: (y) => y.startDate ? new Date(y.startDate).toLocaleDateString() : '', width: 15 },
    { label: 'End Date', accessor: (y) => y.endDate ? new Date(y.endDate).toLocaleDateString() : '', width: 15 },
    { label: 'Active', accessor: (y) => y.isActive ? 'Yes' : 'No', width: 10 },
  ];

  const classColumns = [
    { label: 'Name', accessor: (c) => c.name, width: 20 },
    { label: 'Order', accessor: (c) => c.order ?? 0, width: 10 },
    { label: 'Academic Year', accessor: (c) => years.find(y => y._id === c.academicYearId)?.name || '', width: 20 },
  ];

  const sectionColumns = [
    { label: 'Name', accessor: (s) => s.name, width: 20 },
    { label: 'Class', accessor: (s) => classes.find(c => c._id === s.classId)?.name || '', width: 20 },
  ];

  const subjectColumns = [
    { label: 'Name', accessor: (s) => s.name, width: 25 },
    { label: 'Code', accessor: (s) => s.code || '', width: 15 },
    { label: 'Class', accessor: (s) => classes.find(c => c._id === s.classId)?.name || 'All classes', width: 20 },
  ];

  // Bulk import handlers
  const downloadYearTemplate = () => {
    const template = [
      { Name: '2024-2025', 'Start Date': '2024-04-01', 'End Date': '2025-03-31', Active: 'Yes' },
      { Name: '2025-2026', 'Start Date': '2025-04-01', 'End Date': '2026-03-31', Active: 'No' },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 10 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Years Template');
    XLSX.writeFile(wb, 'academic_years_template.xlsx');
    toast.success('Template downloaded');
  };

  const downloadClassTemplate = () => {
    const template = [
      { Name: 'Grade 1', 'Academic Year': '2024-2025', Order: 1 },
      { Name: 'Grade 2', 'Academic Year': '2024-2025', Order: 2 },
      { Name: 'Grade 3', 'Academic Year': '', Order: 3 },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    ws['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 10 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Classes Template');
    XLSX.writeFile(wb, 'classes_template.xlsx');
    toast.success('Template downloaded');
  };

  const downloadSectionTemplate = () => {
    const template = [
      { Name: 'A', 'Class Name': 'Grade 1' },
      { Name: 'B', 'Class Name': 'Grade 1' },
      { Name: 'A', 'Class Name': 'Grade 2' },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    ws['!cols'] = [{ wch: 20 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sections Template');
    XLSX.writeFile(wb, 'sections_template.xlsx');
    toast.success('Template downloaded');
  };

  const downloadSubjectTemplate = () => {
    const template = [
      { Name: 'Mathematics', Code: 'MATH101', 'Class Name': 'Grade 1' },
      { Name: 'English', Code: 'ENG101', 'Class Name': 'Grade 1' },
      { Name: 'Physical Education', Code: 'PE101', 'Class Name': '' },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    ws['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subjects Template');
    XLSX.writeFile(wb, 'subjects_template.xlsx');
    toast.success('Template downloaded');
  };

  const handleYearImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error('File is empty');
        return;
      }

      let successCount = 0;
      let failCount = 0;
      const errors = [];

      Swal.fire({
        title: 'Importing...',
        html: `Imported: <b>0</b> / ${jsonData.length}`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        try {
          const yearName = row['Name'] || row['name'];
          const startDate = row['Start Date'] || row['startDate'] || '';
          const endDate = row['End Date'] || row['endDate'] || '';
          const active = row['Active'] || row['active'] || '';

          if (!yearName?.trim()) {
            errors.push(`Row ${i + 1}: Year name is required`);
            failCount++;
            continue;
          }

          const isActive = String(active).toLowerCase() === 'yes' || String(active).toLowerCase() === 'true';

          const res = await fetch(`${API_BASE}/api/academic/years`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              name: String(yearName).trim(),
              startDate: startDate || undefined,
              endDate: endDate || undefined,
              isActive,
            }),
          });

          if (res.ok) {
            successCount++;
          } else {
            const errData = await res.json().catch(() => ({}));
            errors.push(`Row ${i + 1}: ${errData.error || 'Failed to create'}`);
            failCount++;
          }

          Swal.update({
            html: `Imported: <b>${successCount}</b> / ${jsonData.length}${
              failCount > 0 ? ` (${failCount} failed)` : ''
            }`,
          });
        } catch (err) {
          errors.push(`Row ${i + 1}: ${err.message}`);
          failCount++;
        }
      }

      await fetchYears();
      event.target.value = '';

      if (errors.length > 0) {
        Swal.fire({
          title: 'Import Completed with Errors',
          html: `
            <p>Successfully imported: <b>${successCount}</b></p>
            <p>Failed: <b>${failCount}</b></p>
            <div style="max-height: 200px; overflow-y: auto; text-align: left; margin-top: 10px;">
              <p><b>Errors:</b></p>
              <ul style="font-size: 12px;">
                ${errors.map(e => `<li>${e}</li>`).join('')}
              </ul>
            </div>
          `,
          icon: successCount > 0 ? 'warning' : 'error',
        });
      } else {
        Swal.fire({
          title: 'Import Successful',
          text: `Successfully imported ${successCount} academic year(s)`,
          icon: 'success',
          timer: 2000,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Import Failed',
        text: err.message || 'Failed to read file',
        icon: 'error',
      });
    }
  };

  const handleClassImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error('File is empty');
        return;
      }

      let successCount = 0;
      let failCount = 0;
      const errors = [];

      Swal.fire({
        title: 'Importing...',
        html: `Imported: <b>0</b> / ${jsonData.length}`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        try {
          const className = row['Name'] || row['name'] || row['Class Name'];
          const yearName = row['Academic Year'] || row['academicYear'] || '';
          const order = row['Order'] || row['order'] || 0;

          if (!className?.trim()) {
            errors.push(`Row ${i + 1}: Class name is required`);
            failCount++;
            continue;
          }

          let academicYearId = '';
          if (yearName) {
            const year = years.find(y => y.name.toLowerCase() === yearName.toLowerCase());
            if (year) {
              academicYearId = year._id;
            }
          }

          const res = await fetch(`${API_BASE}/api/academic/classes`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              name: String(className).trim(),
              academicYearId: academicYearId || undefined,
              order: Number(order) || 0,
            }),
          });

          if (res.ok) {
            successCount++;
          } else {
            const errData = await res.json().catch(() => ({}));
            errors.push(`Row ${i + 1}: ${errData.error || 'Failed to create'}`);
            failCount++;
          }

          Swal.update({
            html: `Imported: <b>${successCount}</b> / ${jsonData.length}${
              failCount > 0 ? ` (${failCount} failed)` : ''
            }`,
          });
        } catch (err) {
          errors.push(`Row ${i + 1}: ${err.message}`);
          failCount++;
        }
      }

      await fetchClasses();
      event.target.value = '';

      if (errors.length > 0) {
        Swal.fire({
          title: 'Import Completed with Errors',
          html: `
            <p>Successfully imported: <b>${successCount}</b></p>
            <p>Failed: <b>${failCount}</b></p>
            <div style="max-height: 200px; overflow-y: auto; text-align: left; margin-top: 10px;">
              <p><b>Errors:</b></p>
              <ul style="font-size: 12px;">
                ${errors.map(e => `<li>${e}</li>`).join('')}
              </ul>
            </div>
          `,
          icon: successCount > 0 ? 'warning' : 'error',
        });
      } else {
        Swal.fire({
          title: 'Import Successful',
          text: `Successfully imported ${successCount} class(es)`,
          icon: 'success',
          timer: 2000,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Import Failed',
        text: err.message || 'Failed to read file',
        icon: 'error',
      });
    }
  };

  const handleSectionImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error('File is empty');
        return;
      }

      let successCount = 0;
      let failCount = 0;
      const errors = [];

      Swal.fire({
        title: 'Importing...',
        html: `Imported: <b>0</b> / ${jsonData.length}`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        try {
          const sectionName = row['Name'] || row['name'] || row['Section Name'];
          const className = row['Class Name'] || row['className'] || row['Class'];

          if (!sectionName?.trim()) {
            errors.push(`Row ${i + 1}: Section name is required`);
            failCount++;
            continue;
          }

          if (!className?.trim()) {
            errors.push(`Row ${i + 1}: Class name is required`);
            failCount++;
            continue;
          }

          const classObj = classes.find(c => c.name.toLowerCase() === String(className).toLowerCase().trim());
          if (!classObj) {
            errors.push(`Row ${i + 1}: Class "${className}" not found`);
            failCount++;
            continue;
          }

          const res = await fetch(`${API_BASE}/api/academic/sections`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              name: String(sectionName).trim(),
              classId: classObj._id,
            }),
          });

          if (res.ok) {
            successCount++;
          } else {
            const errData = await res.json().catch(() => ({}));
            errors.push(`Row ${i + 1}: ${errData.error || 'Failed to create'}`);
            failCount++;
          }

          Swal.update({
            html: `Imported: <b>${successCount}</b> / ${jsonData.length}${
              failCount > 0 ? ` (${failCount} failed)` : ''
            }`,
          });
        } catch (err) {
          errors.push(`Row ${i + 1}: ${err.message}`);
          failCount++;
        }
      }

      await fetchSections();
      event.target.value = '';

      if (errors.length > 0) {
        Swal.fire({
          title: 'Import Completed with Errors',
          html: `
            <p>Successfully imported: <b>${successCount}</b></p>
            <p>Failed: <b>${failCount}</b></p>
            <div style="max-height: 200px; overflow-y: auto; text-align: left; margin-top: 10px;">
              <p><b>Errors:</b></p>
              <ul style="font-size: 12px;">
                ${errors.map(e => `<li>${e}</li>`).join('')}
              </ul>
            </div>
          `,
          icon: successCount > 0 ? 'warning' : 'error',
        });
      } else {
        Swal.fire({
          title: 'Import Successful',
          text: `Successfully imported ${successCount} section(s)`,
          icon: 'success',
          timer: 2000,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Import Failed',
        text: err.message || 'Failed to read file',
        icon: 'error',
      });
    }
  };

  const handleSubjectImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error('File is empty');
        return;
      }

      let successCount = 0;
      let failCount = 0;
      const errors = [];

      Swal.fire({
        title: 'Importing...',
        html: `Imported: <b>0</b> / ${jsonData.length}`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        try {
          const subjectName = row['Name'] || row['name'] || row['Subject Name'];
          const subjectCode = row['Code'] || row['code'] || '';
          const className = row['Class Name'] || row['className'] || row['Class'] || '';

          if (!subjectName?.trim()) {
            errors.push(`Row ${i + 1}: Subject name is required`);
            failCount++;
            continue;
          }

          let classId = '';
          if (className?.trim()) {
            const classObj = classes.find(c => c.name.toLowerCase() === String(className).toLowerCase().trim());
            if (classObj) {
              classId = classObj._id;
            } else {
              errors.push(`Row ${i + 1}: Class "${className}" not found`);
              failCount++;
              continue;
            }
          }

          const res = await fetch(`${API_BASE}/api/academic/subjects`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              name: String(subjectName).trim(),
              code: subjectCode ? String(subjectCode).trim() : undefined,
              classId: classId || undefined,
            }),
          });

          if (res.ok) {
            successCount++;
          } else {
            const errData = await res.json().catch(() => ({}));
            errors.push(`Row ${i + 1}: ${errData.error || 'Failed to create'}`);
            failCount++;
          }

          Swal.update({
            html: `Imported: <b>${successCount}</b> / ${jsonData.length}${
              failCount > 0 ? ` (${failCount} failed)` : ''
            }`,
          });
        } catch (err) {
          errors.push(`Row ${i + 1}: ${err.message}`);
          failCount++;
        }
      }

      await fetchSubjects();
      event.target.value = '';

      if (errors.length > 0) {
        Swal.fire({
          title: 'Import Completed with Errors',
          html: `
            <p>Successfully imported: <b>${successCount}</b></p>
            <p>Failed: <b>${failCount}</b></p>
            <div style="max-height: 200px; overflow-y: auto; text-align: left; margin-top: 10px;">
              <p><b>Errors:</b></p>
              <ul style="font-size: 12px;">
                ${errors.map(e => `<li>${e}</li>`).join('')}
              </ul>
            </div>
          `,
          icon: successCount > 0 ? 'warning' : 'error',
        });
      } else {
        Swal.fire({
          title: 'Import Successful',
          text: `Successfully imported ${successCount} subject(s)`,
          icon: 'success',
          timer: 2000,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Import Failed',
        text: err.message || 'Failed to read file',
        icon: 'error',
      });
    }
  };

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
              Manage academic years, classes, sections, and subjects.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {tabButton("years", "Academic Years", Calendar)}
            {tabButton("classes", "Classes", Layers)}
            {tabButton("sections", "Sections", BookOpen)}
            {tabButton("subjects", "Subjects", BookOpen)}
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

              {/* Export & Import Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => exportToCSV(sortedAndFilteredYears, 'academic_years', yearColumns)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={() => exportToExcel(sortedAndFilteredYears, 'academic_years', yearColumns)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export Excel
                </button>
                <label className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import Excel
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleYearImport}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={downloadYearTemplate}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Template
                </button>
              </div>

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

              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => exportToCSV(sortedAndFilteredClasses, 'classes', classColumns)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={() => exportToExcel(sortedAndFilteredClasses, 'classes', classColumns)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export Excel
                </button>
                <label className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import Excel
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleClassImport}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={downloadClassTemplate}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Template
                </button>
              </div>

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

              <div className="flex flex-wrap gap-2 mb-4">
                <label className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import Excel
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleSectionImport}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={downloadSectionTemplate}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Template
                </button>
              </div>

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

        {activeTab === "subjects" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={submitSubject} className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Subject</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Subject Name</label>
                  <input
                    type="text"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                    placeholder="Mathematics"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Subject Code</label>
                  <input
                    type="text"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm((prev) => ({ ...prev, code: e.target.value }))}
                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                    placeholder="MATH101"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Class (optional)</label>
                  <select
                    value={subjectForm.classId}
                    onChange={(e) =>
                      setSubjectForm((prev) => ({ ...prev, classId: e.target.value }))
                    }
                    className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">All classes</option>
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
                  Add Subject
                </button>
              </div>
            </form>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Subjects</h2>

              <div className="flex flex-wrap gap-2 mb-4">
                <label className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import Excel
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleSubjectImport}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={downloadSubjectTemplate}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Template
                </button>
              </div>

              <SearchInput
                value={searchSubject}
                onChange={setSearchSubject}
                placeholder="Search subjects..."
              />

              <div className="space-y-3">
                {filteredSubjects.map((subject) => (
                  <div
                    key={subject._id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{subject.name}</p>
                      <p className="text-xs text-gray-500">
                        {subject.code || "No code"} •{" "}
                        {classes.find((cls) => cls._id === subject.classId)?.name || "All classes"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingSubject(subject)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSubject(subject._id)}
                        disabled={deletingId === subject._id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredSubjects.length === 0 && (
                  <p className="text-sm text-gray-500">
                    {searchSubject ? "No matching subjects found." : "No subjects yet."}
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

        {/* Edit Subject Modal */}
        <EditModal
          isOpen={editingSubject !== null}
          onClose={() => setEditingSubject(null)}
          title="Edit Subject"
          onSubmit={updateSubject}
          isSubmitting={isSubmitting}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Subject Name</label>
              <input
                type="text"
                value={editingSubject?.name || ""}
                onChange={(e) =>
                  setEditingSubject((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Subject Code</label>
              <input
                type="text"
                value={editingSubject?.code || ""}
                onChange={(e) =>
                  setEditingSubject((prev) => ({ ...prev, code: e.target.value }))
                }
                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
                placeholder="MATH101"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Class (optional)</label>
              <select
                value={editingSubject?.classId || ""}
                onChange={(e) =>
                  setEditingSubject((prev) => ({ ...prev, classId: e.target.value }))
                }
                className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">All classes</option>
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