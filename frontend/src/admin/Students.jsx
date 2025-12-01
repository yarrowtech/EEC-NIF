
// frontend/src/admin/pages/Students.jsx
import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import Swal from "sweetalert2";

const Students = ({ setShowAdminHeader }) => {
  const [studentData, setStudentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showWellbeingModal, setShowWellbeingModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [wellbeingData, setWellbeingData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

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

    // academic / nif
    serialNo: "",
    batchCode: "",
    admissionDate: "",
    roll: "",
    grade: "",
    section: "",
    course: "",
    duration: "",
    formNo: "",
    enrollmentNo: "",
  });

  /* -------------------- Derived -------------------- */
  const filteredStudents = studentData.filter((student) =>
    [student.name, student.roll, student.email]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  const getFeesStatus = () => {
    const mockFees = {
      totalDue: 18700,
      paidAmount: Math.floor(Math.random() * 18700),
      dueDate: "2024-02-15",
    };
    mockFees.dueAmount = mockFees.totalDue - mockFees.paidAmount;
    mockFees.status =
      mockFees.dueAmount === 0
        ? "paid"
        : mockFees.dueAmount < mockFees.totalDue
        ? "partial"
        : "due";
    return mockFees;
  };

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
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/nif/students`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      setStudentData(data);
    }
  };

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    setShowAdminHeader?.(true);
    refreshStudents().catch(console.error);
  }, [setShowAdminHeader]);

  /* -------------------- Add Student -------------------- */
  const handleAddStudentChange = (e) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
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
      "grade",
      "section",
      "course",
    ];

    const missing = requiredFields.filter(
      (f) => !newStudent[f] || String(newStudent[f]).trim() === ""
    );
    if (missing.length) {
      alert(`Please fill required fields: ${missing.join(", ")}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...newStudent,
        // convert serialNo to number if provided
        serialNo: newStudent.serialNo
          ? Number(newStudent.serialNo)
          : undefined,
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/nif/students`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

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
        serialNo: "",
        batchCode: "",
        admissionDate: "",
        roll: "",
        grade: "",
        section: "",
        course: "",
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

  /* -------------------- Bulk Upload -------------------- */
  const REQUIRED_HEADERS = ["name", "mobile"]; // keep minimum strict
  const OPTIONAL_HEADERS = [
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
    "course",
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
          duration: obj.duration || "",
          formNo: obj.formNo || "",
          enrollmentNo: obj.enrollmentNo || "",
        });
      }

      if (!payload.length) {
        alert("No valid rows found.");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/nif/students/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ students: payload }),
        }
      );

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

  const downloadTemplate = () => {
    const headers = [
      "serialNo",
      "batchCode",
      "admissionDate",
      "name",
      "mobile",
      "email",
      "gender",
      "dob",
      "roll",
      "grade",
      "section",
      "course",
      "duration",
      "formNo",
      "enrollmentNo",
      "address",
      "pincode",
      "status",
    ];
    const blob = new Blob([headers.join(",") + "\n"], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nif_students_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 p-8">
      <div className="max-w-7xl mx-auto bg-white/90 rounded-2xl shadow-2xl p-8 border border-yellow-200">
        {/* Header */}
        <div className="flex flex-wrap gap-3 justify-between items-center mb-8">
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
              onClick={downloadTemplate}
              className="bg-white border border-amber-300 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-50 flex items-center gap-2"
            >
              <FileDown size={16} />
              CSV Template
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2"
            >
              <Plus size={16} /> Add Student
            </button>
          </div>
        </div>

        {/* Summary Cards */}

        {/* Search */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
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
        <div className="overflow-x-auto">
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
              {filteredStudents.map((student) => (
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
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
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
        <div className="mt-6 flex items-center justify-between">
          <div className="text-gray-600">
            Showing {filteredStudents.length} of {studentData.length} students
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-yellow-50">
              Previous
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-yellow-50">
              Next
            </button>
          </div>
        </div>

        {/* Wellbeing Modal */}
        

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
                          Course Name
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          name="course"
                          value={newStudent.course}
                          onChange={handleAddStudentChange}
                          required
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="e.g. AD-201 TWO YEARS FD"
                        />
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
      </div>
    </div>
  );
};

export default Students;
