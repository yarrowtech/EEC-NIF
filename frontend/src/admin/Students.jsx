// frontend/src/admin/pages/Students.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  Calendar,
  ChevronDown,
  Hash,
  BookOpen,
  Search,
  Plus,
  Edit2,
  MoreVertical,
  Heart,
  AlertCircle,
  CheckCircle,
  IndianRupee,
  Smile,
  Frown,
  Meh,
  TrendingUp,
  Brain,
  Users,
  MessageCircle,
  Star,
  X,
  Upload,
  FileDown,
  Archive,
  RotateCcw,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";

const API_BASE = import.meta.env.VITE_API_URL;

const STUDENTS_PER_PAGE = 5;

const Students = ({ setShowAdminHeader, setShowAdminBreadcrumb }) => {
  const navigate = useNavigate(); 

  const [studentData, setStudentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showWellbeingModal, setShowWellbeingModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [wellbeingData, setWellbeingData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);
  const [courseOptions, setCourseOptions] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [archivedStudents, setArchivedStudents] = useState([]);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveActionLoading, setArchiveActionLoading] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [newStudent, setNewStudent] = useState({
    // core
    name: "",
    email: "",
    mobile: "",
    gender: "",
    dob: "",
    address: "",
    pincode: "",
    status: "Active",
    guardianName: "",
    guardianEmail: "",
    guardianPhone: "",

    // academic / nif
    serialNo: "",
    batchCode: "",
    admissionDate: "",
    roll: "",
    grade: "",
    section: "",
    course: "",
    courseId: "",
    duration: "",
    formNo: "",
    enrollmentNo: "",
  });

  const selectedCourse = useMemo(
    () =>
      courseOptions.find((course) => course._id === newStudent.courseId) ||
      null,
    [courseOptions, newStudent.courseId]
  );
  const selectedCourseInstallments = selectedCourse?.installments || [];

  const [currentPage, setCurrentPage] = useState(1);

  /* -------------------- Derived -------------------- */
  const filteredStudents = useMemo(
    () =>
      studentData.filter((student) =>
        [student.name, student.roll, student.email]
          .filter(Boolean)
          .some((v) =>
            String(v).toLowerCase().includes(searchTerm.toLowerCase())
          )
      ),
    [studentData, searchTerm]
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE)
  );
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * STUDENTS_PER_PAGE;
    return filteredStudents.slice(start, start + STUDENTS_PER_PAGE);
  }, [filteredStudents, currentPage]);
  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, idx) => idx + 1),
    [totalPages]
  );
  const startItem =
    filteredStudents.length > 0
      ? (currentPage - 1) * STUDENTS_PER_PAGE + 1
      : 0;
  const endItem = Math.min(
    currentPage * STUDENTS_PER_PAGE,
    filteredStudents.length
  );
  useEffect(() => {
    setCurrentPage((prev) => {
      const next = Math.min(prev, totalPages);
      return next < 1 ? 1 : next;
    });
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  /* -------------------- Helpers -------------------- */
  const getTodayAttendance = (student) => {
    if (!student.attendance || student.attendance.length === 0) return null;
    const today = new Date().toDateString();
    return student.attendance.find(
      (att) => new Date(att.date).toDateString() === today
    );
  };

  const getHealthStatus = (student) => {
    const healthStatuses = ["healthy", "sick", "injured", "absent-sick"];
    return (
      student.healthStatus ||
      healthStatuses[Math.floor(Math.random() * healthStatuses.length)]
    );
  };

  const getFeeStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "due":
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const formatCurrency = (value = 0) =>
    `₹${Number(value || 0).toLocaleString()}`;

  const getMoodIcon = (mood) => {
    const moodIcons = {
      excellent: { icon: Smile, color: "text-green-600", bg: "bg-green-100" },
      good: { icon: Smile, color: "text-blue-600", bg: "bg-blue-100" },
      neutral: { icon: Meh, color: "text-yellow-600", bg: "bg-yellow-100" },
      concerning: { icon: Frown, color: "text-orange-600", bg: "bg-orange-100" },
      critical: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
    };
    return moodIcons[mood] || moodIcons.neutral;
  };

  const getWellbeingStatus = (studentId) => {
    if (!wellbeingData[studentId]) {
      const moods = ["excellent", "good", "neutral", "concerning", "critical"];
      const mood = moods[Math.floor(Math.random() * moods.length)];
      const socialEngagement = Math.floor(Math.random() * 10) + 1;
      const academicStress = Math.floor(Math.random() * 10) + 1;
      const behaviorChanges = Math.random() > 0.7;

      setWellbeingData((prev) => ({
        ...prev,
        [studentId]: {
          mood,
          socialEngagement,
          academicStress,
          behaviorChanges,
          lastAssessment: new Date().toISOString().split("T")[0],
          notes: "",
          interventions: [],
          counselingSessions: Math.floor(Math.random() * 5),
          parentNotifications: Math.floor(Math.random() * 3),
        },
      }));
      return { mood, socialEngagement, academicStress, behaviorChanges };
    }
    return wellbeingData[studentId];
  };

  const updateWellbeingData = (studentId, updates) => {
    setWellbeingData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        ...updates,
        lastAssessment: new Date().toISOString().split("T")[0],
      },
    }));
  };

  const openWellbeingModal = (student) => {
    setSelectedStudent(student);
    setShowWellbeingModal(true);
  };

  const refreshStudents = async () => {
    const res = await fetch(`${API_BASE}/api/nif/students`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      setStudentData(data);
    }
  };

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/nif/course/fetch`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCourseOptions(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Placeholder until archive endpoints are implemented
  const refreshArchivedStudents = async () => {
    setArchivedStudents([]);
  };

  const handleViewArchive = () => setShowArchiveModal(true);

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    setShowAdminHeader?.(true);
    setShowAdminBreadcrumb?.(false);
    refreshStudents().catch(console.error);
    fetchCourses().catch(console.error);
    refreshArchivedStudents().catch(console.error);

    return () => {
      setShowAdminBreadcrumb?.(true);
    };
  }, [setShowAdminHeader, setShowAdminBreadcrumb]);

  /* -------------------- Archive Student -------------------- */
  const handleArchiveStudent = async (student) => {
    const result = await Swal.fire({
      title: "Archive Student?",
      text: `Are you sure you want to archive ${student.name}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, archive it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    const confirmResult = await Swal.fire({
      title: "Confirm Archive",
      text: "Would you like to add this record to archive?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, move to archive",
      cancelButtonText: "No, keep active",
    });

    if (!confirmResult.isConfirmed) return;

    setIsArchiving(true);
    try {
      const res = await fetch(`${API_BASE}/api/nif/students/${student._id}/archive`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        Swal.fire({
          title: "Archived!",
          text: `${student.name} has been moved to archive.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        await refreshStudents();
      } else {
        throw new Error("Failed to archive student");
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error!",
        text: "Failed to archive student. Please try again.",
        icon: "error",
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!student?._id || deletingId) return;

    const firstConfirm = await Swal.fire({
      title: "Delete student?",
      text: `This will remove ${student.name} from students list.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
    });
    if (!firstConfirm.isConfirmed) return;

    const secondConfirm = await Swal.fire({
      title: "Are you absolutely sure?",
      text: "Click delete again to permanently remove all associated records.",
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#b91c1c",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete permanently",
    });
    if (!secondConfirm.isConfirmed) return;

    setDeletingId(student._id);
    try {
      const res = await fetch(`${API_BASE}/api/nif/students/${student._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete student");
      }

      await Swal.fire({
        title: "Deleted",
        text: `${student.name} and associated fee records have been removed.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      await refreshStudents();
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: err.message || "Failed to delete student",
        icon: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  /* -------------------- Add Student -------------------- */
  const handleAddStudentChange = (e) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleCourseSelect = (e) => {
    const { value } = e.target;
    const course = courseOptions.find((c) => c._id === value);
    setNewStudent((prev) => ({
      ...prev,
      courseId: value,
      course: course?.title || "",
      grade: course?.programLabel || prev.grade,
      duration: course?.duration || prev.duration,
    }));
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = [
      "name",
      "mobile",
      "gender",
      "batchCode",
      "admissionDate",
      "roll",
      "section",
    ];

    const missing = requiredFields.filter(
      (f) => !newStudent[f] || String(newStudent[f]).trim() === ""
    );
    if (!newStudent.courseId) {
      missing.push("course");
    }
    if (missing.length) {
      alert(`Please fill required fields: ${missing.join(", ")}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...newStudent,
        courseId: newStudent.courseId,
        course: selectedCourse?.title || newStudent.course,
        grade: selectedCourse?.programLabel || newStudent.grade,
        duration: selectedCourse?.duration || newStudent.duration,
        // convert serialNo to number if provided
        serialNo: newStudent.serialNo
          ? Number(newStudent.serialNo)
          : undefined,
      };

      const res = await fetch(`${API_BASE}/api/nif/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(`Registration failed: ${data.message || res.statusText}`);
        return;
      }
      Swal.fire({
        icon: "success",
        title: "student enrolled successfully!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      await refreshStudents();

      setShowAddForm(false);
      setNewStudent({
        name: "",
        email: "",
        mobile: "",
        gender: "",
        dob: "",
        address: "",
        pincode: "",
        status: "Active",
        guardianName: "",
        guardianEmail: "",
        guardianPhone: "",
        serialNo: "",
        batchCode: "",
        admissionDate: "",
        roll: "",
        grade: "",
        section: "",
        course: "",
        courseId: "",
        duration: "",
        formNo: "",
        enrollmentNo: "",
      });
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleUnarchiveStudent = async (studentId) => {
    if (!studentId) return;
    if (!window.confirm("Restore this student from archive?")) return;
    try {
      setArchiveActionLoading(true);
      const res = await fetch(
        `${API_BASE}/api/nif/students/${studentId}/unarchive`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to restore student");
      }
      await Promise.all([refreshStudents(), refreshArchivedStudents()]);
      Swal.fire({
        icon: "success",
        title: "Student restored",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setArchiveActionLoading(false);
    }
  };

  /* -------------------- Bulk Upload -------------------- */
  const REQUIRED_HEADERS = ["name", "mobile", "course"];
  const OPTIONAL_HEADERS = [
    "courseId",
    "email",
    "gender",
    "dob",
    "address",
    "pincode",
    "status",
    "serialNo",
    "batchCode",
    "admissionDate",
    "roll",
    "grade",
    "section",
    "duration",
    "formNo",
    "enrollmentNo",
  ];
  const ALL_HEADERS = [...REQUIRED_HEADERS, ...OPTIONAL_HEADERS];

  const normalize = (h) => h?.toString().trim().toLowerCase();

  // simple CSV parser with quotes support
  const parseCsv = (text) => {
    const out = [];
    let i = 0,
      f = "",
      row = [],
      q = false;
    const pf = () => {
        row.push(f);
        f = "";
      },
      pr = () => {
        out.push(row);
        row = [];
      };

    while (i < text.length) {
      const c = text[i];
      if (q) {
        if (c === '"') {
          if (text[i + 1] === '"') {
            f += '"';
            i += 2;
          } else {
            q = false;
            i++;
          }
        } else {
          f += c;
          i++;
        }
      } else {
        if (c === '"') {
          q = true;
          i++;
        } else if (c === ",") {
          pf();
          i++;
        } else if (c === "\r") {
          i++;
        } else if (c === "\n") {
          pf();
          pr();
          i++;
        } else {
          f += c;
          i++;
        }
      }
    }
    pf();
    if (row.length) pr();
    return out;
  };

  const toISO = (s) => {
    const t = String(s || "").trim();
    if (!t) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
    const m = t.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/); // dd/mm/yyyy or mm/dd/yyyy
    if (m) {
      const dd = String(m[1]).padStart(2, "0");
      const mm = String(m[2]).padStart(2, "0");
      return `${m[3]}-${mm}-${dd}`;
    }
    return null;
  };

  const handleBulkFilePicked = async (file) => {
    try {
      setIsImporting(true);
      const text = await file.text();
      const rows = parseCsv(text);
      if (!rows.length) {
        alert("CSV is empty");
        return;
      }
      const header = rows[0].map(normalize);
      const missing = REQUIRED_HEADERS.filter((h) => !header.includes(h));
      if (missing.length) {
        alert(`Missing headers: ${missing.join(", ")}`);
        return;
      }

      const idx = Object.fromEntries(header.map((h, i) => [h, i]));
      const payload = [];

      for (let r = 1; r < rows.length; r++) {
        const raw = rows[r];
        if (!raw || raw.every((c) => !String(c || "").trim())) continue;

        const obj = {};
        for (const h of ALL_HEADERS) {
          const key = h.toLowerCase();
          if (idx[key] !== undefined) {
            obj[h] = String(raw[idx[key]] ?? "").trim();
          } else {
            obj[h] = "";
          }
        }

        if (!obj.name || !obj.mobile) continue;

        const dob = toISO(obj.dob);
        const admissionDate = toISO(obj.admissionDate);

        if (!obj.course && !obj.courseId) {
          continue;
        }

        payload.push({
          name: obj.name,
          mobile: obj.mobile,
          email: (obj.email || "").toLowerCase(),
          gender: obj.gender || "Other",
          dob,
          address: obj.address || "",
          pincode: obj.pincode || "",
          status: obj.status || "Active",
          serialNo: obj.serialNo ? Number(obj.serialNo) : undefined,
          batchCode: obj.batchCode || "",
          admissionDate,
          roll: obj.roll || "",
          grade: obj.grade || "",
          section: obj.section || "",
          course: obj.course || "",
          courseId: obj.courseId || "",
          duration: obj.duration || "",
          formNo: obj.formNo || "",
          enrollmentNo: obj.enrollmentNo || "",
        });
      }

      if (!payload.length) {
        alert("No valid rows found.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/nif/students/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ students: payload }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(`Import failed: ${data.message || res.statusText}`);
        return;
      }

      alert(
        `Import complete\nImported: ${data.imported}\nFailed: ${data.failed}`
      );
      await refreshStudents();
    } catch (e) {
      console.error(e);
      alert(`Bulk import error: ${e.message}`);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="-m-4 lg:-m-8 flex-1 bg-white overflow-hidden flex flex-col">
      <div className="w-full flex-1 flex flex-col p-4 lg:p-6 overflow-hidden text-[1.02rem]">
        {/* Header */}
        <div className="flex flex-wrap gap-3 justify-between items-center mb-6 flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-yellow-700">
              Student Management (NIF)
            </h1>
            <p className="text-gray-600 mt-2">
              Manage Students
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-60 flex items-center gap-2"
            >
              <Upload size={16} />
              {isImporting ? "Importing..." : "Bulk Upload"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleBulkFilePicked(f);
              }}
            />
            <button
              onClick={handleViewArchive}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Archive size={16} />
              View Archive
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2"
            >
              <Plus size={16} /> Add Student
            </button>
            <button
              onClick={() => setShowArchiveModal(true)}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Archive size={16} /> Archived
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search */}
          <div className="mb-4 flex flex-wrap items-center gap-4 flex-shrink-0">
            <div className="flex-1 min-w-[240px] relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search students..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Students Table */}
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-yellow-50">
                  {[
                    "Name",
                    "Roll No.",
                    "Program",
                    "Batch",
                    "Course",
                    "Phone",
                    "Fees",
                    "Balance",
                    "Archive",
                  ].map((h) => (
                    <th
                      key={h}
                      className="border-b border-yellow-100 px-6 py-3 text-left text-sm font-semibold text-yellow-800"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr
                    key={student._id || student.id}
                    className="hover:bg-yellow-50 transition-colors"
                  >
                    <td className="border-b border-yellow-100 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center">
                          {student.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {student.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-yellow-100 px-6 py-4 text-gray-600">
                      {student.roll}
                    </td>
                    <td className="border-b border-yellow-100 px-6 py-4 text-gray-600">
                      {student.grade}
                    </td>
                    <td className="border-b border-yellow-100 px-6 py-4 text-gray-600">
                      {student.batchCode}
                    </td>
                    <td className="border-b border-yellow-100 px-6 py-4 text-gray-600">
                      {student.course}
                    </td>

                    <td className="border-b border-yellow-100 px-6 py-4 text-gray-600">
                      {student.mobile}
                    </td>
                    <td className="border-b border-yellow-100 px-6 py-4 text-gray-600">
                      <div className="text-sm text-gray-600">
                        {formatCurrency(student.feeSummary?.paidAmount)} /{" "}
                        {formatCurrency(student.feeSummary?.totalFee)}
                      </div>
                      <span
                        className={`inline-flex mt-1 px-2 py-0.5 text-xs rounded-full ${getFeeStatusClass(
                          student.feeSummary?.status
                        )}`}
                      >
                        {student.feeSummary?.status
                          ? student.feeSummary.status.charAt(0).toUpperCase() +
                            student.feeSummary.status.slice(1)
                          : "N/A"}
                      </span>
                    </td>
                    <td className="border-b border-yellow-100 px-6 py-4 text-gray-900 font-semibold">
                      {formatCurrency(student.feeSummary?.dueAmount)}
                    </td>
                    <td className="border-b border-yellow-100 px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleArchiveStudent(student)}
                          disabled={isArchiving}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors disabled:opacity-50"
                        >
                          <Archive size={14} />
                          {isArchiving ? "Archiving..." : "Archive"}
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student)}
                          disabled={!!deletingId}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          {deletingId === student._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center text-gray-500 py-10"
                    >
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between flex-shrink-0 mt-auto pt-4 border-t border-yellow-100">
            <div className="text-gray-600 text-sm">
              {filteredStudents.length === 0
                ? "No students to display"
                : `Showing ${startItem}-${endItem} of ${filteredStudents.length} students`}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-yellow-50 disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    page === currentPage
                      ? "bg-yellow-500 text-white border-yellow-500"
                      : "border-gray-200 text-gray-700 hover:bg-yellow-50"
                  }`}
                >
                  Page {page}
                </button>
              ))}
              <button
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-yellow-50 disabled:opacity-50"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Add Student Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Enroll New NIF Student
                      </h2>
                      <p className="text-yellow-100 mt-1">
                        Complete all sections to register student
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Steps (visual only) */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                  {["Personal", "Academic", "Review"].map((step, idx) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                          idx === 0
                            ? "bg-yellow-500 border-yellow-500 text-white"
                            : "border-gray-300 text-gray-500"
                        } font-semibold text-sm`}
                      >
                        {idx + 1}
                      </div>
                      <span
                        className={`ml-2 text-sm font-medium ${
                          idx === 0 ? "text-yellow-600" : "text-gray-500"
                        }`}
                      >
                        {step}
                      </span>
                      {idx < 2 && (
                        <div className="w-12 h-0.5 bg-gray-300 mx-4" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <form
                  onSubmit={handleAddStudentSubmit}
                  className="space-y-8"
                >
                  {/* Personal */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Users className="w-3 h-3 text-yellow-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Personal Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Full Name
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="name"
                            value={newStudent.name}
                            onChange={handleAddStudentChange}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="Enter student's full name"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Users className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Mobile Number
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            name="mobile"
                            value={newStudent.mobile}
                            onChange={handleAddStudentChange}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="+91 98765 43210"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Phone className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            name="email"
                            value={newStudent.email}
                            onChange={handleAddStudentChange}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="student@example.com"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Mail className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Date of Birth
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            name="dob"
                            value={newStudent.dob}
                            onChange={handleAddStudentChange}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 relative">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Gender
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          name="gender"
                          value={newStudent.gender}
                          onChange={handleAddStudentChange}
                          required
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none bg-white"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-[45px]">
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Pincode
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={newStudent.pincode}
                          onChange={handleAddStudentChange}
                          maxLength={6}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="Enter 6-digit pincode"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Guardian Name
                        </label>
                        <input
                          type="text"
                          name="guardianName"
                          value={newStudent.guardianName}
                          onChange={handleAddStudentChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="Parent/Guardian Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Guardian Phone
                        </label>
                        <input
                          type="tel"
                          name="guardianPhone"
                          value={newStudent.guardianPhone}
                          onChange={handleAddStudentChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="+91 90000 00000"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Guardian Email
                        </label>
                        <input
                          type="email"
                          name="guardianEmail"
                          value={newStudent.guardianEmail}
                          onChange={handleAddStudentChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="guardian@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={newStudent.address}
                        onChange={handleAddStudentChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                        placeholder="Enter complete residential address..."
                      />
                    </div>
                  </div>

                  {/* Academic & NIF Details */}
                  <div className="space-y-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <BookOpen className="w-3 h-3 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Academic & NIF Details
                      </h3>
                    </div>

                    {/* Row 1: Serial, Batch, Admission Date */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Serial No (optional)
                        </label>
                        <input
                          type="number"
                          name="serialNo"
                          value={newStudent.serialNo}
                          onChange={handleAddStudentChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="Srl No"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Batch Code
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          name="batchCode"
                          value={newStudent.batchCode}
                          onChange={handleAddStudentChange}
                          required
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="e.g. 1124B02"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Date of Admission
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            name="admissionDate"
                            value={newStudent.admissionDate}
                            onChange={handleAddStudentChange}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Program, Course, Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                      <div className="space-y-2 relative">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Program
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          name="grade"
                          value={newStudent.grade}
                          onChange={handleAddStudentChange}
                          required
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none bg-white"
                        >
                          <option value="">Select Program</option>
                          <optgroup label="Fashion Design">
                            <option value="Fashion Design - 1 year Certificate Program">
                              1 year Certificate Program
                            </option>
                            <option value="Fashion Design - 2 year Advanced Certificate">
                              2 year Advanced Certificate
                            </option>
                            <option value="Fashion Design - 3 year B Voc Program">
                              3 year B Voc Program
                            </option>
                            <option value="Fashion Design - 4 year B Des Program">
                              4 year B Des Program
                            </option>
                            <option value="Fashion Design - 2 Year M Voc program">
                              2 Year M Voc program
                            </option>
                          </optgroup>
                          <optgroup label="Interior Design">
                            <option value="Interior Design - 1 year Certificate Program">
                              1 year Certificate Program
                            </option>
                            <option value="Interior Design - 2 year Advanced Certificate">
                              2 year Advanced Certificate
                            </option>
                            <option value="Interior Design - 3 year B Voc Program">
                              3 year B Voc Program
                            </option>
                            <option value="Interior Design - 4 year B Des Program">
                              4 year B Des Program
                            </option>
                            <option value="Interior Design - 2 Year M Voc program">
                              2 Year M Voc program
                            </option>
                          </optgroup>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-[45px]">
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Course & Fees
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="courseId"
                            value={newStudent.courseId}
                            onChange={handleCourseSelect}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none bg-white"
                          >
                            <option value="">
                              {coursesLoading
                                ? "Loading courses..."
                                : "Select course"}
                            </option>
                            {courseOptions.map((course) => (
                              <option key={course._id} value={course._id}>
                                {course.title} ({course.department})
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-3 top-[45px]">
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        {selectedCourse && (
                          <p className="text-xs text-gray-500">
                            Program: {selectedCourse.programLabel} • Total Fee: ₹
                            {selectedCourse.fees?.toLocaleString()}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Duration
                        </label>
                        <input
                          type="text"
                          name="duration"
                          value={newStudent.duration}
                          onChange={handleAddStudentChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="e.g. 2 Years"
                        />
                      </div>
                    </div>

                    {/* Row 3: Roll, Section, Form No, Enrollment No */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Roll Number
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="roll"
                            value={newStudent.roll}
                            onChange={handleAddStudentChange}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="Enter roll number"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Hash className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 relative">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          Section
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          name="section"
                          value={newStudent.section}
                          onChange={handleAddStudentChange}
                          required
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none bg-white"
                        >
                          <option value="">Select Section</option>
                          <option value="A">Section A</option>
                          <option value="B">Section B</option>
                          <option value="C">Section C</option>
                          <option value="D">Section D</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-[45px]">
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Form No
                        </label>
                        <input
                          type="text"
                          name="formNo"
                          value={newStudent.formNo}
                          onChange={handleAddStudentChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="Enter form number"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Enrollment No
                        </label>
                        <input
                          type="text"
                          name="enrollmentNo"
                          value={newStudent.enrollmentNo}
                          onChange={handleAddStudentChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="Enter enrollment no"
                        />
                      </div>
                    </div>

                    {selectedCourse && (
                      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-yellow-800">
                              Course Fee Snapshot
                            </h4>
                            <p className="text-sm text-yellow-700">
                              Total Fee: ₹{selectedCourse.fees?.toLocaleString()} •{" "}
                              {selectedCourse.installments?.length || 0} Installments
                            </p>
                          </div>
                          <div className="px-3 py-1 bg-white/70 rounded-full text-xs text-yellow-800 border border-yellow-200">
                            {selectedCourse.programLabel}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedCourseInstallments.slice(0, 6).map((inst, idx) => (
                            <div
                              key={`${inst.label}-${idx}`}
                              className="bg-white rounded-xl p-3 shadow-sm border border-yellow-100"
                            >
                              <p className="text-sm font-medium text-gray-700">
                                {inst.label}
                              </p>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-gray-500">
                                  {inst.dueMonth || "Scheduled"}
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                  ₹{inst.amount?.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {selectedCourseInstallments.length > 6 && (
                          <p className="text-xs text-gray-500 mt-2">
                            Showing first 6 installments. Full schedule included in course
                            record.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      All fields marked with{" "}
                      <span className="text-red-500">*</span> are required
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl hover:from-yellow-600 hover:to-amber-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Plus size={18} />
                        {isSubmitting ? "Enrolling..." : "Enroll Student"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {showArchiveModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden border border-gray-200">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Archived Students
                </h3>
                <button
                  onClick={() => setShowArchiveModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Roll</th>
                      <th className="px-4 py-3 text-left">Program</th>
                      <th className="px-4 py-3 text-left">Course</th>
                      <th className="px-4 py-3 text-left">Phone</th>
                      <th className="px-4 py-3 text-right">Outstanding</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedStudents.map((student) => (
                      <tr key={student._id} className="border-t">
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {student.name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {student.roll}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {student.grade}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {student.course}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {student.mobile}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600 font-semibold">
                          {formatCurrency(student.feeSummary?.dueAmount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleUnarchiveStudent(student._id)}
                            disabled={archiveActionLoading}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 text-sm disabled:opacity-50"
                          >
                            <RotateCcw size={14} />
                            Restore
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!archivedStudents.length && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-gray-500"
                        >
                          No archived students.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t flex justify-end">
                <button
                  onClick={() => setShowArchiveModal(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;
