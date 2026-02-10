import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen, Calendar, Layers, Plus, Edit3, Trash2, X,
  ChevronUp, ChevronDown, ChevronsUpDown, Search, GraduationCap,
  FolderOpen, UserCheck,
} from "lucide-react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL;

const AcademicSetup = ({ setShowAdminHeader }) => {
  const [activeTab, setActiveTab] = useState("years");
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [teacherAllocations, setTeacherAllocations] = useState([]);
  const [error, setError] = useState("");

  // Forms
  const [yearForm, setYearForm] = useState({ name: "", startDate: "", endDate: "", isActive: false });
  const [classForm, setClassForm] = useState({ name: "", academicYearId: "", order: "" });
  const [sectionForm, setSectionForm] = useState({ name: "", classId: "" });
  const [subjectForm, setSubjectForm] = useState({ name: "", code: "", classId: "" });
  const [classTeacherForm, setClassTeacherForm] = useState({ teacherId: "", classId: "", sectionId: "", subjectId: "" });

  // Edit states
  const [editingYear, setEditingYear] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [savingClassTeacher, setSavingClassTeacher] = useState(false);

  // Search/filter
  const [searchYear, setSearchYear] = useState("");
  const [searchClass, setSearchClass] = useState("");
  const [searchSection, setSearchSection] = useState("");
  const [searchSubject, setSearchSubject] = useState("");

  // Loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Sorting
  const [yearSort, setYearSort] = useState({ field: "name", order: "asc" });
  const [classSort, setClassSort] = useState({ field: "order", order: "asc" });
  const [sectionSort, setSectionSort] = useState({ field: "name", order: "asc" });
  const [subjectSort, setSubjectSort] = useState({ field: "name", order: "asc" });

  // Pagination
  const [yearPage, setYearPage] = useState(1);
  const [classPage, setClassPage] = useState(1);
  const [sectionPage, setSectionPage] = useState(1);
  const [subjectPage, setSubjectPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bulk selection
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // Show/hide add form
  const [showAddForm, setShowAddForm] = useState(false);

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      authorization: token ? `Bearer ${token}` : "",
    };
  }, []);

  /* ─── Filtered data ─── */
  const filteredYears = useMemo(() => {
    if (!searchYear.trim()) return years;
    const q = searchYear.toLowerCase();
    return years.filter(
      (y) =>
        y.name.toLowerCase().includes(q) ||
        (y.startDate && new Date(y.startDate).toLocaleDateString().includes(q))
    );
  }, [years, searchYear]);

  const filteredClasses = useMemo(() => {
    if (!searchClass.trim()) return classes;
    const q = searchClass.toLowerCase();
    return classes.filter(
      (c) => c.name.toLowerCase().includes(q) || c.order?.toString().includes(q)
    );
  }, [classes, searchClass]);

  const filteredSections = useMemo(() => {
    if (!searchSection.trim()) return sections;
    const q = searchSection.toLowerCase();
    return sections.filter((s) => {
      const className = classes.find((c) => c._id === s.classId)?.name || "";
      return s.name.toLowerCase().includes(q) || className.toLowerCase().includes(q);
    });
  }, [sections, searchSection, classes]);

  const filteredSubjects = useMemo(() => {
    if (!searchSubject.trim()) return subjects;
    const q = searchSubject.toLowerCase();
    return subjects.filter((s) => {
      const className = classes.find((c) => c._id === s.classId)?.name || "";
      return (
        s.name.toLowerCase().includes(q) ||
        (s.code && s.code.toLowerCase().includes(q)) ||
        className.toLowerCase().includes(q)
      );
    });
  }, [subjects, searchSubject, classes]);

  const classTeacherAllocations = useMemo(
    () => teacherAllocations.filter((a) => a.isClassTeacher),
    [teacherAllocations]
  );

  const classTeacherSections = useMemo(() => {
    if (!classTeacherForm.classId) return [];
    return sections.filter((s) => String(s.classId) === String(classTeacherForm.classId));
  }, [sections, classTeacherForm.classId]);

  const classTeacherSubjects = useMemo(() => {
    if (!classTeacherForm.classId) return [];
    return subjects.filter((s) => String(s.classId) === String(classTeacherForm.classId));
  }, [subjects, classTeacherForm.classId]);

  const handleSaveClassTeacher = async (e) => {
    e.preventDefault();
    if (!classTeacherForm.teacherId || !classTeacherForm.classId || !classTeacherForm.sectionId || !classTeacherForm.subjectId) {
      setError("Teacher, class, section, and subject are required.");
      return;
    }
    setSavingClassTeacher(true);
    setError("");
    try {
      const existing = classTeacherAllocations.find(
        (a) =>
          String(a.classId?._id || a.classId) === String(classTeacherForm.classId) &&
          String(a.sectionId?._id || a.sectionId) === String(classTeacherForm.sectionId)
      );
      const payload = {
        teacherId: classTeacherForm.teacherId,
        classId: classTeacherForm.classId,
        sectionId: classTeacherForm.sectionId,
        subjectId: classTeacherForm.subjectId,
        isClassTeacher: true,
      };
      const endpoint = existing ? `${API_BASE}/api/teacher-allocations/${existing._id}` : `${API_BASE}/api/teacher-allocations`;
      const method = existing ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to save class teacher");
      }
      await res.json().catch(() => ({}));
      await loadClassTeachers();
      setClassTeacherForm({ teacherId: "", classId: "", sectionId: "", subjectId: "" });
      toast.success("Class teacher saved.");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSavingClassTeacher(false);
    }
  };

  const deleteClassTeacher = async (id) => {
    if (!window.confirm("Remove this class teacher?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/teacher-allocations/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to delete");
      }
      await loadClassTeachers();
      toast.success("Removed.");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  /* ─── API helpers ─── */
  const handleApiError = (err) => {
    console.error(err);
    setError("Unable to load academic data. Please retry.");
  };

  const loadAcademicData = async () => {
    try {
      const [hierarchyRes, subjectsRes] = await Promise.all([
        fetch(`${API_BASE}/api/academic/hierarchy`, { method: "GET", headers: authHeaders }),
        fetch(`${API_BASE}/api/academic/subjects`, { method: "GET", headers: authHeaders }),
      ]);
      if (!hierarchyRes.ok) throw new Error("Failed to load academic setup");
      const data = await hierarchyRes.json();
      setYears(Array.isArray(data.years) ? data.years : []);
      setClasses(Array.isArray(data.classes) ? data.classes : []);
      setSections(Array.isArray(data.sections) ? data.sections : []);

      if (subjectsRes.ok) {
        const subData = await subjectsRes.json();
        setSubjects(Array.isArray(subData) ? subData : []);
      }
    } catch (err) {
      handleApiError(err);
      throw err;
    }
  };

  const loadClassTeachers = async () => {
    try {
      const [teacherRes, allocationRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users/get-teachers`, { method: "GET", headers: authHeaders }),
        fetch(`${API_BASE}/api/teacher-allocations`, { method: "GET", headers: authHeaders }),
      ]);
      if (teacherRes.ok) {
        const teacherData = await teacherRes.json().catch(() => []);
        setTeachers(Array.isArray(teacherData) ? teacherData : []);
      }
      if (allocationRes.ok) {
        const allocData = await allocationRes.json().catch(() => []);
        setTeacherAllocations(Array.isArray(allocData) ? allocData : []);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load class teacher data.");
    }
  };

  useEffect(() => {
    setShowAdminHeader?.(false);
    setError("");
    loadAcademicData().catch(handleApiError);
    loadClassTeachers().catch(() => {});
  }, [setShowAdminHeader]);

  const handleCreate = async (endpoint, payload, onSuccess) => {
    setError("");
    setIsSubmitting(true);
    try {
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
      toast.success("Created successfully!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Submit handlers ─── */
  const submitYear = async (e) => {
    e.preventDefault();
    await handleCreate("/api/academic/years", yearForm, async () => {
      await loadAcademicData();
      setYearForm({ name: "", startDate: "", endDate: "", isActive: false });
      setShowAddForm(false);
    });
  };

  const submitClass = async (e) => {
    e.preventDefault();
    await handleCreate("/api/academic/classes", classForm, async () => {
      await loadAcademicData();
      setClassForm({ name: "", academicYearId: "", order: "" });
      setShowAddForm(false);
    });
  };

  const submitSection = async (e) => {
    e.preventDefault();
    if (!sectionForm.classId) {
      setError("Select a class before creating a section.");
      return;
    }
    await handleCreate("/api/academic/sections", sectionForm, async () => {
      await loadAcademicData();
      setSectionForm({ name: "", classId: "" });
      setShowAddForm(false);
    });
  };

  const submitSubject = async (e) => {
    e.preventDefault();
    await handleCreate("/api/academic/subjects", subjectForm, async () => {
      await loadAcademicData();
      setSubjectForm({ name: "", code: "", classId: "" });
      setShowAddForm(false);
    });
  };

  /* ─── Update handlers ─── */
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
      toast.success("Updated successfully!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateYear = async (e) => {
    e.preventDefault();
    await handleUpdate("/api/academic/years", editingYear._id, {
      name: editingYear.name,
      startDate: editingYear.startDate,
      endDate: editingYear.endDate,
      isActive: editingYear.isActive,
    }, async () => { await loadAcademicData(); setEditingYear(null); });
  };

  const updateClass = async (e) => {
    e.preventDefault();
    await handleUpdate("/api/academic/classes", editingClass._id, {
      name: editingClass.name,
      academicYearId: editingClass.academicYearId,
      order: editingClass.order,
    }, async () => { await loadAcademicData(); setEditingClass(null); });
  };

  const updateSection = async (e) => {
    e.preventDefault();
    if (!editingSection.classId) {
      setError("Select a class before updating section.");
      return;
    }
    await handleUpdate("/api/academic/sections", editingSection._id, {
      name: editingSection.name,
      classId: editingSection.classId,
    }, async () => { await loadAcademicData(); setEditingSection(null); });
  };

  const updateSubject = async (e) => {
    e.preventDefault();
    await handleUpdate("/api/academic/subjects", editingSubject._id, {
      name: editingSubject.name,
      code: editingSubject.code,
      classId: editingSubject.classId,
    }, async () => { await loadAcademicData(); setEditingSubject(null); });
  };

  /* ─── Delete handlers ─── */
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
          }
          return;
        }
        throw new Error(data.error || "Delete failed");
      }
      await onSuccess();
      Swal.fire({ title: "Deleted!", text: `${entityName} has been deleted.`, icon: "success", timer: 2000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const deleteYear = (id) => handleDelete("/api/academic/years", id, "academic year", loadAcademicData);
  const deleteClass = (id) => handleDelete("/api/academic/classes", id, "class", loadAcademicData);
  const deleteSection = (id) => handleDelete("/api/academic/sections", id, "section", loadAcademicData);
  const deleteSubject = (id) => handleDelete("/api/academic/subjects", id, "subject", loadAcademicData);

  /* ─── Sorting ─── */
  const sortData = (data, sortConfig) => {
    if (!sortConfig.field) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.field];
      let bVal = b[sortConfig.field];
      if (sortConfig.field.includes("Date")) {
        aVal = new Date(aVal || 0);
        bVal = new Date(bVal || 0);
      }
      if (typeof aVal === "string") { aVal = aVal.toLowerCase(); bVal = bVal?.toLowerCase() || ""; }
      if (sortConfig.field === "order") { aVal = aVal ?? 0; bVal = bVal ?? 0; }
      if (aVal < bVal) return sortConfig.order === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.order === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sortedYears = useMemo(() => sortData(filteredYears, yearSort), [filteredYears, yearSort]);
  const sortedClasses = useMemo(() => sortData(filteredClasses, classSort), [filteredClasses, classSort]);
  const sortedSections = useMemo(() => sortData(filteredSections, sectionSort), [filteredSections, sectionSort]);
  const sortedSubjects = useMemo(() => sortData(filteredSubjects, subjectSort), [filteredSubjects, subjectSort]);

  /* ─── Pagination ─── */
  const paginate = (data, page) => {
    const start = (page - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  };
  const paginatedYears = useMemo(() => paginate(sortedYears, yearPage), [sortedYears, yearPage, itemsPerPage]);
  const paginatedClasses = useMemo(() => paginate(sortedClasses, classPage), [sortedClasses, classPage, itemsPerPage]);
  const paginatedSections = useMemo(() => paginate(sortedSections, sectionPage), [sortedSections, sectionPage, itemsPerPage]);
  const paginatedSubjects = useMemo(() => paginate(sortedSubjects, subjectPage), [sortedSubjects, subjectPage, itemsPerPage]);

  /* ─── Bulk selection ─── */
  const selectionMap = {
    years: [selectedYears, setSelectedYears],
    classes: [selectedClasses, setSelectedClasses],
    sections: [selectedSections, setSelectedSections],
    subjects: [selectedSubjects, setSelectedSubjects],
  };

  const handleSelectAll = (entityType, items) => {
    const [current, setter] = selectionMap[entityType];
    setter(current.length === items.length && items.length > 0 ? [] : items.map((i) => i._id));
  };

  const handleSelectItem = (entityType, id) => {
    const [current, setter] = selectionMap[entityType];
    setter(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  };

  const handleBulkDelete = async (entityType, entityName) => {
    const [selected] = selectionMap[entityType];
    if (selected.length === 0) return;

    const confirm = await Swal.fire({
      title: "Bulk Delete",
      html: `Are you sure you want to delete <strong>${selected.length}</strong> ${entityName}(s)?<br>This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete all",
    });
    if (!confirm.isConfirmed) return;

    let successCount = 0;
    let failCount = 0;

    Swal.fire({
      title: "Deleting...",
      html: `Deleted: <b>0</b> / ${selected.length}`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const endpoint = {
      years: "/api/academic/years",
      classes: "/api/academic/classes",
      sections: "/api/academic/sections",
      subjects: "/api/academic/subjects",
    }[entityType];

    for (const id of selected) {
      try {
        const res = await fetch(`${API_BASE}${endpoint}/${id}?cascade=true`, {
          method: "DELETE",
          headers: authHeaders,
        });
        if (res.ok) successCount++;
        else failCount++;
        Swal.update({
          html: `Deleted: <b>${successCount}</b> / ${selected.length}${failCount > 0 ? ` (${failCount} failed)` : ""}`,
        });
      } catch {
        failCount++;
      }
    }

    await loadAcademicData();
    Object.values(selectionMap).forEach(([, setter]) => setter([]));

    Swal.fire({
      title: "Completed",
      html: `Successfully deleted <b>${successCount}</b> ${entityName}(s)${failCount > 0 ? `<br>${failCount} deletion(s) failed` : ""}`,
      icon: successCount > 0 ? "success" : "error",
    });
  };

  /* ─── Toggle sort helper ─── */
  const toggleSort = (setter) => (field) => {
    setter((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  /* ═══════════════════════ SUB-COMPONENTS ═══════════════════════ */

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );

  const SearchInput = ({ value, onChange, placeholder }) => (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
      />
    </div>
  );

  const SortableHeader = ({ label, field, sortConfig, onSort }) => (
    <th
      onClick={() => onSort(field)}
      className="cursor-pointer select-none whitespace-nowrap bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 transition hover:bg-amber-50"
    >
      <div className="flex items-center gap-1.5">
        {label}
        {sortConfig.field === field ? (
          sortConfig.order === "asc" ? (
            <ChevronUp className="h-3.5 w-3.5 text-amber-600" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-amber-600" />
          )
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5 text-gray-300" />
        )}
      </div>
    </th>
  );

  const Pagination = ({ currentPage, totalItems, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalItems === 0) return null;
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);

    const pages = [];
    const maxVisible = 5;
    let pStart = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let pEnd = Math.min(totalPages, pStart + maxVisible - 1);
    if (pEnd - pStart < maxVisible - 1) pStart = Math.max(1, pEnd - maxVisible + 1);
    for (let i = pStart; i <= pEnd; i++) pages.push(i);

    return (
      <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50 px-4 py-3 sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {start}–{end} of {totalItems}
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="rounded border border-gray-200 px-2 py-1 text-xs focus:ring-2 focus:ring-amber-200"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          {pStart > 1 && (
            <>
              <button onClick={() => onPageChange(1)} className="rounded-md border border-gray-200 px-2.5 py-1 text-xs hover:bg-gray-100">1</button>
              {pStart > 2 && <span className="px-1 text-xs text-gray-400">...</span>}
            </>
          )}
          {pages.map((n) => (
            <button
              key={n}
              onClick={() => onPageChange(n)}
              className={`rounded-md border px-2.5 py-1 text-xs transition ${
                currentPage === n
                  ? "border-amber-400 bg-amber-500 text-white"
                  : "border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {n}
            </button>
          ))}
          {pEnd < totalPages && (
            <>
              {pEnd < totalPages - 1 && <span className="px-1 text-xs text-gray-400">...</span>}
              <button onClick={() => onPageChange(totalPages)} className="rounded-md border border-gray-200 px-2.5 py-1 text-xs hover:bg-gray-100">{totalPages}</button>
            </>
          )}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const BulkBar = ({ entityType, entityName }) => {
    const [selected] = selectionMap[entityType];
    if (selected.length === 0) return null;
    return (
      <div className="mb-3 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2">
        <span className="text-sm font-medium text-gray-700">{selected.length} selected</span>
        <div className="flex gap-2">
          <button
            onClick={() => selectionMap[entityType][1]([])}
            className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-white"
          >
            Clear
          </button>
          <button
            onClick={() => handleBulkDelete(entityType, entityName)}
            className="flex items-center gap-1 rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </div>
    );
  };

  const EmptyState = ({ search, entity }) => (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <FolderOpen className="mb-3 h-10 w-10" />
      <p className="text-sm">{search ? `No matching ${entity} found.` : `No ${entity} yet.`}</p>
    </div>
  );

  const EditModal = ({ isOpen, onClose, title, children, onSubmit }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <button type="button" onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={onSubmit} className="px-6 py-5">
            {children}
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  /* ═══════════════════════ TAB CONFIG ═══════════════════════ */

  const tabs = [
    { key: "years", label: "Academic Years", icon: Calendar, count: years.length },
    { key: "classes", label: "Classes", icon: Layers, count: classes.length },
    { key: "sections", label: "Sections", icon: BookOpen, count: sections.length },
    { key: "subjects", label: "Subjects", icon: GraduationCap, count: subjects.length },
    { key: "class-teachers", label: "Class Teachers", icon: UserCheck, count: classTeacherAllocations.length },
  ];

  /* ═══════════════════════ RENDER ═══════════════════════ */

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* ─── Header ─── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Academic Setup</h1>
            <p className="mt-1 text-sm text-gray-500">Manage academic years, classes, sections and subjects.</p>
          </div>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600"
          >
            <Plus className="h-4 w-4" />
            {showAddForm ? "Hide Form" : "Add New"}
          </button>
        </div>

        {/* ─── Stat Cards ─── */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard icon={Calendar} label="Academic Years" value={years.length} color="bg-blue-500" />
          <StatCard icon={Layers} label="Classes" value={classes.length} color="bg-emerald-500" />
          <StatCard icon={BookOpen} label="Sections" value={sections.length} color="bg-violet-500" />
          <StatCard icon={GraduationCap} label="Subjects" value={subjects.length} color="bg-amber-500" />
        </div>

        {/* ─── Error ─── */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ─── Tabs ─── */}
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setShowAddForm(false); }}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === t.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                activeTab === t.key ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-gray-500"
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* ═══════════════ YEARS TAB ═══════════════ */}
        {activeTab === "years" && (
          <div className="space-y-4">
            {/* Add Form */}
            {showAddForm && ( 
              <form onSubmit={submitYear} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-base font-semibold text-gray-800">Add Academic Year</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Year Name</label>
                    <input type="text" value={yearForm.name} onChange={(e) => setYearForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                      placeholder="2025-2026" required />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Start Date</label>
                    <input type="date" value={yearForm.startDate} onChange={(e) => setYearForm((p) => ({ ...p, startDate: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">End Date</label>
                    <input type="date" value={yearForm.endDate} onChange={(e) => setYearForm((p) => ({ ...p, endDate: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" />
                  </div>
                  <div className="flex items-end gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input type="checkbox" checked={yearForm.isActive} onChange={(e) => setYearForm((p) => ({ ...p, isActive: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400" />
                      Active
                    </label>
                    <button type="submit" disabled={isSubmitting}
                      className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50">
                      <Plus className="h-4 w-4" /> Add
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Table Card */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                <h3 className="text-sm font-semibold text-gray-700">Academic Years</h3>
                <div className="w-64">
                  <SearchInput value={searchYear} onChange={setSearchYear} placeholder="Search years..." />
                </div>
              </div>
              <BulkBar entityType="years" entityName="academic year" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="w-12 bg-gray-50 px-4 py-3">
                        <input type="checkbox" checked={selectedYears.length === paginatedYears.length && paginatedYears.length > 0}
                          onChange={() => handleSelectAll("years", paginatedYears)} className="h-4 w-4 rounded border-gray-300 text-amber-500" />
                      </th>
                      <SortableHeader label="Name" field="name" sortConfig={yearSort} onSort={toggleSort(setYearSort)} />
                      <SortableHeader label="Start Date" field="startDate" sortConfig={yearSort} onSort={toggleSort(setYearSort)} />
                      <SortableHeader label="End Date" field="endDate" sortConfig={yearSort} onSort={toggleSort(setYearSort)} />
                      <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                      <th className="bg-gray-50 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedYears.map((year) => (
                      <tr key={year._id} className="transition hover:bg-amber-50/30">
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selectedYears.includes(year._id)}
                            onChange={() => handleSelectItem("years", year._id)} className="h-4 w-4 rounded border-gray-300 text-amber-500" />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{year.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{year.startDate ? new Date(year.startDate).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{year.endDate ? new Date(year.endDate).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3">
                          {year.isActive ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">Active</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setEditingYear(year)} className="rounded-md p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600" title="Edit">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button onClick={() => deleteYear(year._id)} disabled={deletingId === year._id}
                              className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {paginatedYears.length === 0 && <EmptyState search={searchYear} entity="academic years" />}
              </div>
              <Pagination currentPage={yearPage} totalItems={sortedYears.length} onPageChange={setYearPage} />
            </div>
          </div>
        )}

        {/* ═══════════════ CLASSES TAB ═══════════════ */}
        {activeTab === "classes" && (
          <div className="space-y-4">
            {showAddForm && (
              <form onSubmit={submitClass} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-base font-semibold text-gray-800">Add Class</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Class Name</label>
                    <input type="text" value={classForm.name} onChange={(e) => setClassForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                      placeholder="Grade 10" required />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Academic Year</label>
                    <select value={classForm.academicYearId} onChange={(e) => setClassForm((p) => ({ ...p, academicYearId: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100">
                      <option value="">Optional</option>
                      {years.map((y) => <option key={y._id} value={y._id}>{y.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Display Order</label>
                    <input type="number" value={classForm.order} onChange={(e) => setClassForm((p) => ({ ...p, order: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                      placeholder="0" />
                  </div>
                  <div className="flex items-end">
                    <button type="submit" disabled={isSubmitting}
                      className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50">
                      <Plus className="h-4 w-4" /> Add Class
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                <h3 className="text-sm font-semibold text-gray-700">Classes</h3>
                <div className="w-64">
                  <SearchInput value={searchClass} onChange={setSearchClass} placeholder="Search classes..." />
                </div>
              </div>
              <BulkBar entityType="classes" entityName="class" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="w-12 bg-gray-50 px-4 py-3">
                        <input type="checkbox" checked={selectedClasses.length === paginatedClasses.length && paginatedClasses.length > 0}
                          onChange={() => handleSelectAll("classes", paginatedClasses)} className="h-4 w-4 rounded border-gray-300 text-amber-500" />
                      </th>
                      <SortableHeader label="Name" field="name" sortConfig={classSort} onSort={toggleSort(setClassSort)} />
                      <SortableHeader label="Order" field="order" sortConfig={classSort} onSort={toggleSort(setClassSort)} />
                      <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Academic Year</th>
                      <th className="bg-gray-50 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedClasses.map((cls) => (
                      <tr key={cls._id} className="transition hover:bg-amber-50/30">
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selectedClasses.includes(cls._id)}
                            onChange={() => handleSelectItem("classes", cls._id)} className="h-4 w-4 rounded border-gray-300 text-amber-500" />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{cls.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{cls.order ?? 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{years.find((y) => y._id === cls.academicYearId)?.name || "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setEditingClass(cls)} className="rounded-md p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600" title="Edit">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button onClick={() => deleteClass(cls._id)} disabled={deletingId === cls._id}
                              className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {paginatedClasses.length === 0 && <EmptyState search={searchClass} entity="classes" />}
              </div>
              <Pagination currentPage={classPage} totalItems={sortedClasses.length} onPageChange={setClassPage} />
            </div>
          </div>
        )}

        {/* ═══════════════ SECTIONS TAB ═══════════════ */}
        {activeTab === "sections" && (
          <div className="space-y-4">
            {showAddForm && (
              <form onSubmit={submitSection} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-base font-semibold text-gray-800">Add Section</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Section Name</label>
                    <input type="text" value={sectionForm.name} onChange={(e) => setSectionForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                      placeholder="A" required />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Class</label>
                    <select value={sectionForm.classId} onChange={(e) => setSectionForm((p) => ({ ...p, classId: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" required>
                      <option value="">Select class</option>
                      {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button type="submit" disabled={isSubmitting}
                      className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50">
                      <Plus className="h-4 w-4" /> Add Section
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                <h3 className="text-sm font-semibold text-gray-700">Sections</h3>
                <div className="w-64">
                  <SearchInput value={searchSection} onChange={setSearchSection} placeholder="Search sections..." />
                </div>
              </div>
              <BulkBar entityType="sections" entityName="section" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="w-12 bg-gray-50 px-4 py-3">
                        <input type="checkbox" checked={selectedSections.length === paginatedSections.length && paginatedSections.length > 0}
                          onChange={() => handleSelectAll("sections", paginatedSections)} className="h-4 w-4 rounded border-gray-300 text-amber-500" />
                      </th>
                      <SortableHeader label="Name" field="name" sortConfig={sectionSort} onSort={toggleSort(setSectionSort)} />
                      <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Class</th>
                      <th className="bg-gray-50 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedSections.map((sec) => (
                      <tr key={sec._id} className="transition hover:bg-amber-50/30">
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selectedSections.includes(sec._id)}
                            onChange={() => handleSelectItem("sections", sec._id)} className="h-4 w-4 rounded border-gray-300 text-amber-500" />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{sec.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{classes.find((c) => c._id === sec.classId)?.name || "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setEditingSection(sec)} className="rounded-md p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600" title="Edit">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button onClick={() => deleteSection(sec._id)} disabled={deletingId === sec._id}
                              className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {paginatedSections.length === 0 && <EmptyState search={searchSection} entity="sections" />}
              </div>
              <Pagination currentPage={sectionPage} totalItems={sortedSections.length} onPageChange={setSectionPage} />
            </div>
          </div>
        )}

        {/* ═══════════════ SUBJECTS TAB ═══════════════ */}
        {activeTab === "subjects" && (
          <div className="space-y-4">
            {showAddForm && (
              <form onSubmit={submitSubject} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-base font-semibold text-gray-800">Add Subject</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Subject Name</label>
                    <input type="text" value={subjectForm.name} onChange={(e) => setSubjectForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                      placeholder="Mathematics" required />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Subject Code</label>
                    <input type="text" value={subjectForm.code} onChange={(e) => setSubjectForm((p) => ({ ...p, code: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                      placeholder="MATH101" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Class</label>
                    <select value={subjectForm.classId} onChange={(e) => setSubjectForm((p) => ({ ...p, classId: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100">
                      <option value="">Optional</option>
                      {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button type="submit" disabled={isSubmitting}
                      className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50">
                      <Plus className="h-4 w-4" /> Add Subject
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                <h3 className="text-sm font-semibold text-gray-700">Subjects</h3>
                <div className="w-64">
                  <SearchInput value={searchSubject} onChange={setSearchSubject} placeholder="Search subjects..." />
                </div>
              </div>
              <BulkBar entityType="subjects" entityName="subject" />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="w-12 bg-gray-50 px-4 py-3">
                        <input type="checkbox" checked={selectedSubjects.length === paginatedSubjects.length && paginatedSubjects.length > 0}
                          onChange={() => handleSelectAll("subjects", paginatedSubjects)} className="h-4 w-4 rounded border-gray-300 text-amber-500" />
                      </th>
                      <SortableHeader label="Name" field="name" sortConfig={subjectSort} onSort={toggleSort(setSubjectSort)} />
                      <SortableHeader label="Code" field="code" sortConfig={subjectSort} onSort={toggleSort(setSubjectSort)} />
                      <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Class</th>
                      <th className="bg-gray-50 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedSubjects.map((sub) => (
                      <tr key={sub._id} className="transition hover:bg-amber-50/30">
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selectedSubjects.includes(sub._id)}
                            onChange={() => handleSelectItem("subjects", sub._id)} className="h-4 w-4 rounded border-gray-300 text-amber-500" />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{sub.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{sub.code || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{classes.find((c) => c._id === sub.classId)?.name || "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setEditingSubject(sub)} className="rounded-md p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600" title="Edit">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button onClick={() => deleteSubject(sub._id)} disabled={deletingId === sub._id}
                              className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {paginatedSubjects.length === 0 && <EmptyState search={searchSubject} entity="subjects" />}
              </div>
              <Pagination currentPage={subjectPage} totalItems={sortedSubjects.length} onPageChange={setSubjectPage} />
            </div>
          </div>
        )}

        {/* ═══════════════ CLASS TEACHERS TAB ═══════════════ */}
        {activeTab === "class-teachers" && (
          <div className="space-y-4">
            <form onSubmit={handleSaveClassTeacher} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-base font-semibold text-gray-800">Assign Class Teacher</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Teacher</label>
                  <select
                    value={classTeacherForm.teacherId}
                    onChange={(e) => setClassTeacherForm((p) => ({ ...p, teacherId: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                    required
                  >
                    <option value="">Select teacher</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name || t.username || t.employeeCode || 'Teacher'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Class</label>
                  <select
                    value={classTeacherForm.classId}
                    onChange={(e) =>
                      setClassTeacherForm((p) => ({ ...p, classId: e.target.value, sectionId: "", subjectId: "" }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                    required
                  >
                    <option value="">Select class</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Section</label>
                  <select
                    value={classTeacherForm.sectionId}
                    onChange={(e) => setClassTeacherForm((p) => ({ ...p, sectionId: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                    required
                  >
                    <option value="">Select section</option>
                    {classTeacherSections.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Subject</label>
                  <select
                    value={classTeacherForm.subjectId}
                    onChange={(e) => setClassTeacherForm((p) => ({ ...p, subjectId: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                    required
                  >
                    <option value="">Select subject</option>
                    {classTeacherSubjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} {s.code ? `(${s.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={savingClassTeacher}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  {savingClassTeacher ? "Saving..." : "Save Class Teacher"}
                </button>
                <button
                  type="button"
                  onClick={() => setClassTeacherForm({ teacherId: "", classId: "", sectionId: "", subjectId: "" })}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </form>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-base font-semibold text-gray-800">Current Class Teachers</h3>
              <div className="space-y-3">
                {classTeacherAllocations.length === 0 && (
                  <p className="text-sm text-gray-500">No class teachers assigned yet.</p>
                )}
                {classTeacherAllocations.map((item) => (
                  <div key={item._id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.teacherId?.name || 'Teacher'} • {item.subjectId?.name || 'Subject'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Class {item.classId?.name || '-'} | Section {item.sectionId?.name || '-'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteClassTeacher(item._id)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ EDIT MODALS ═══════════════ */}

        {/* Edit Year */}
        <EditModal isOpen={editingYear !== null} onClose={() => setEditingYear(null)} title="Edit Academic Year" onSubmit={updateYear}>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Year Name</label>
              <input type="text" value={editingYear?.name || ""} onChange={(e) => setEditingYear((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Start Date</label>
                <input type="date" value={editingYear?.startDate?.split("T")[0] || ""}
                  onChange={(e) => setEditingYear((p) => ({ ...p, startDate: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">End Date</label>
                <input type="date" value={editingYear?.endDate?.split("T")[0] || ""}
                  onChange={(e) => setEditingYear((p) => ({ ...p, endDate: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={editingYear?.isActive || false}
                onChange={(e) => setEditingYear((p) => ({ ...p, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400" />
              Set as active
            </label>
          </div>
        </EditModal>

        {/* Edit Class */}
        <EditModal isOpen={editingClass !== null} onClose={() => setEditingClass(null)} title="Edit Class" onSubmit={updateClass}>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Class Name</label>
              <input type="text" value={editingClass?.name || ""} onChange={(e) => setEditingClass((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Academic Year</label>
              <select value={editingClass?.academicYearId || ""} onChange={(e) => setEditingClass((p) => ({ ...p, academicYearId: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100">
                <option value="">Optional</option>
                {years.map((y) => <option key={y._id} value={y._id}>{y.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Display Order</label>
              <input type="number" value={editingClass?.order ?? ""} onChange={(e) => setEditingClass((p) => ({ ...p, order: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" placeholder="0" />
            </div>
          </div>
        </EditModal>

        {/* Edit Section */}
        <EditModal isOpen={editingSection !== null} onClose={() => setEditingSection(null)} title="Edit Section" onSubmit={updateSection}>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Section Name</label>
              <input type="text" value={editingSection?.name || ""} onChange={(e) => setEditingSection((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Class</label>
              <select value={editingSection?.classId || ""} onChange={(e) => setEditingSection((p) => ({ ...p, classId: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" required>
                <option value="">Select class</option>
                {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </EditModal>

        {/* Edit Subject */}
        <EditModal isOpen={editingSubject !== null} onClose={() => setEditingSubject(null)} title="Edit Subject" onSubmit={updateSubject}>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Subject Name</label>
              <input type="text" value={editingSubject?.name || ""} onChange={(e) => setEditingSubject((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Subject Code</label>
              <input type="text" value={editingSubject?.code || ""} onChange={(e) => setEditingSubject((p) => ({ ...p, code: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                placeholder="MATH101" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Class</label>
              <select value={editingSubject?.classId || ""} onChange={(e) => setEditingSubject((p) => ({ ...p, classId: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100">
                <option value="">Optional</option>
                {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </EditModal>
      </div>
    </div>
  );
};

export default AcademicSetup;
