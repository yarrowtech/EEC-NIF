
import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Users,
  Clock,
  Calendar,
  IndianRupee,
  X,
  ChevronDown,
  ListOrdered,
} from "lucide-react";
import Swal from "sweetalert2";

const PROGRAM_OPTIONS = [
  { value: "ADV_CERT", label: "Advance Certificate (1-2 Years)" },
  { value: "B_VOC", label: "B.Voc (3 Years)" },
  { value: "M_VOC", label: "M.Voc (2 Years)" },
  { value: "B_DES", label: "B.Des (4 Years)" },
];

const createInstallmentRow = () => ({
  label: "",
  amount: "",
  dueMonth: "",
});


/* ---------------------- STATIC FEE STRUCTURES ---------------------- */
// NOTE: These structures are for display in the "Fee Breakdown" modal.
// Adjust values if your official PDFs change.

const FEE_STRUCTURES = {
  ADV_CERT: {
    key: "ADV_CERT",
    label: "Advance Certification (1 & 2 Years)",
    streamNote: "Fashion Design / Interior Design – 1 Year & 2 Years",
    years: ["1st Year", "2nd Year"],
    rows: [
      { description: "Time of Admission", values: [22000, 22000] },
      { description: "Time of Batch Commencement", values: [19000, 19000] },
      { description: "Registration fee (1st part)", values: [5000, 5000] },
      { description: "1st Installment", values: [7500, 7500] },
      {
        description: "Registration fee (2nd part – within 30 days)",
        values: [17000, 17000],
      },
      { description: "2nd Installment", values: [7500, 7500] },
      { description: "3rd Installment", values: [7500, 7500] },
      { description: "4th Installment", values: [7500, 7500] },
      {
        description: "Registration fee (3rd part – within 90 days)",
        values: [17000, 17000],
      },
      { description: "5th Installment", values: [7500, 7500] },
      { description: "6th Installment", values: [7500, 7500] },
      { description: "7th Installment", values: [7500, 7500] },
      { description: "8th Installment", values: [7500, 7500] },
      { description: "9th Installment", values: [7500, 7500] },
      { description: "10th Installment", values: [7500, 7500] },
    ],
    totals: [155000, 155000],
    extraNotes: [
      "Admission fee Rs 22,000 in favour of 'College of Fashion' payable at Kolkata.",
      "Payment mode: NEFT / IMPS / UPI (non-refundable).",
      "Registration fee to be paid online towards Medhavi Skills University.",
      "Annual subscription fee Rs 3,540 per annum for 'The Voice of Fashion'.",
    ],
  },

  BVOC: {
    key: "BVOC",
    label: "B.Voc – 3 Years",
    streamNote: "Fashion Design / Interior Design – B.Voc 3 Years",
    years: ["1st Year", "2nd Year", "3rd Year"],
    rows: [
      { description: "Time of Admission", values: [22000, 22000, 22000] },
      {
        description: "MSU fees for 1st / 3rd / 5th Semester",
        values: [18000, 18000, 18000],
      },
      {
        description: "Time of Batch Commencement",
        values: [19000, 19000, 19000],
      },
      { description: "Registration fee (1st part)", values: [5000, 5000, 5000] },
      { description: "1st Installment", values: [7500, 7500, 7500] },
      {
        description: "Registration fee (2nd part – within 30 days)",
        values: [17000, 17000, 17000],
      },
      { description: "2nd Installment", values: [7500, 7500, 7500] },
      {
        description: "MSU fees for 2nd / 4th / 6th Semester",
        values: [18000, 18000, 18000],
      },
      { description: "3rd Installment", values: [7500, 7500, 7500] },
      { description: "4th Installment", values: [7500, 7500, 7500] },
      {
        description: "Registration fee (3rd part – within 90 days)",
        values: [17000, 17000, 17000],
      },
      { description: "5th Installment", values: [7500, 7500, 7500] },
      { description: "6th Installment", values: [7500, 7500, 7500] },
      { description: "7th Installment", values: [7500, 7500, 7500] },
      { description: "8th Installment", values: [7500, 7500, 7500] },
      { description: "9th Installment", values: [7500, 7500, 7500] },
      { description: "10th Installment", values: [7500, 7500, 7500] },
    ],
    totals: [191000, 191000, 191000],
    extraNotes: [
      "One-time registration fee Rs 2,000 to be paid online towards Medhavi Skills University.",
      "Annual subscription fee Rs 3,540 per annum for 'The Voice of Fashion'.",
      "Examination and convocation fees Rs 5,000 per annum to be paid separately.",
    ],
  },

  MVOC: {
    key: "MVOC",
    label: "M.Voc – 2 Years",
    streamNote: "Fashion Design / Interior Design – M.Voc 2 Years",
    years: ["1st Year", "2nd Year"],
    rows: [
      { description: "Time of Admission", values: [22000, 22000] },
      {
        description: "MSU fees for 1st / 3rd Semester",
        values: [24000, 24000],
      },
      {
        description: "Time of Batch Commencement",
        values: [19000, 19000],
      },
      { description: "Registration fee (1st part)", values: [5000, 5000] },
      { description: "1st Installment", values: [7500, 7500] },
      {
        description: "Registration fee (2nd part – within 30 days)",
        values: [24000, 24000],
      },
      { description: "2nd Installment", values: [7500, 7500] },
      {
        description: "MSU fees for 2nd / 4th Semester",
        values: [24000, 24000],
      },
      { description: "3rd Installment", values: [7500, 7500] },
      { description: "4th Installment", values: [7500, 7500] },
      {
        description: "Registration fee (3rd part – within 90 days)",
        values: [24000, 24000],
      },
      { description: "5th Installment", values: [7500, 7500] },
      { description: "6th Installment", values: [7500, 7500] },
      { description: "7th Installment", values: [7500, 7500] },
      { description: "8th Installment", values: [7500, 7500] },
      { description: "9th Installment", values: [7500, 7500] },
      { description: "10th Installment", values: [7500, 7500] },
    ],
    totals: [205000, 205000],
    extraNotes: [
      "Admission fee Rs 22,000 in favour of 'College of Fashion' payable at Kolkata.",
      "Classroom fees Rs 3,540 per annum for 'Reliance Brands Limited', payable only online.",
      "Examination and convocation fees Rs 5,000 per annum to be paid separately.",
    ],
  },

  // 🔹 NEW: B.Des 4-year structure (from your photo)
  BDES: {
    key: "BDES",
    label: "B.Des – 4 Years",
    streamNote: "Fashion Design / Interior Design – B.Des 4 Years",
    years: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    rows: [
      {
        description: "Time of Admission",
        values: [22000, 22000, 22000, 22000],
      },
      {
        description:
          "Time of Admission (MSU fees for 1st / 3rd / 5th / 7th Semester)",
        values: [24000, 24000, 24000, 24000],
      },
      {
        description: "Time of Batch Commencement",
        values: [19000, 19000, 19000, 19000],
      },
      {
        description: "Registration fee (1st part)",
        values: [5000, 5000, 5000, 5000],
      },
      {
        description: "1st Installment",
        values: [7500, 7500, 7500, 7500],
      },
      {
        description:
          "Registration fee (2nd part within 30 days since commencement)",
        values: [17000, 17000, 17000, 17000],
      },
      {
        description: "2nd Installment",
        values: [7500, 7500, 7500, 7500],
      },
      {
        description: "MSU fees for 2nd / 4th / 6th / 8th Semester",
        values: [24000, 24000, 24000, 24000],
      },
      {
        description: "3rd Installment",
        values: [7500, 7500, 7500, 7500],
      },
      {
        description: "4th Installment",
        values: [7500, 7500, 7500, 7500],
      },
      {
        description:
          "Registration fee (3rd part within 90 days since commencement)",
        values: [17000, 17000, 17000, 17000],
      },
      {
        description: "5th Installment",
        values: [7500, 7500, 7500, 7500],
      },
      {
        description: "6th Installment",
        values: [7500, 7500, 7500, 7500],
      },
      {
        description: "7th Installment",
        values: [7500, 7500, 7500, 7500],
      },
      {
        description: "8th Installment",
        values: [7500, 7500, 7500, 7500],
      },
      {
        description: "9th Installment",
        values: [7500, 7500, 7500, 7500],
      },
      {
        description: "10th Installment",
        values: [7500, 7500, 7500, 7500],
      },
    ],
    totals: [203000, 203000, 203000, 203000],
    extraNotes: [
      "Admission fee Rs 22,000 in favour of 'College of Fashion' payable at Kolkata.",
      "MSU fees for odd and even semesters are included as per the sheet.",
      "Examination / convocation fees (if any) are payable separately as per university norms.",
    ],
  },
};


/* ----------------------- MAIN COMPONENT START ---------------------- */

const API_BASE = `${import.meta.env.VITE_API_URL}/api/nif/course`;

const CourseManagement = ({ setShowAdminHeader }) => {
  const [allCourses, setAllCourses] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showFeeModal, setShowFeeModal] = useState(false);
  const [activeFeeTab, setActiveFeeTab] = useState("ADV_CERT");

  // EDIT state
  const [editCourse, setEditCourse] = useState(null); // { _id, stream, name, duration, fees, description }

  // ADD form state
  const [newCourse, setNewCourse] = useState({
    stream: "",
    name: "",
    duration: "",
    fees: "",
    description: "",
    programType: "ADV_CERT",
    installments: [createInstallmentRow()],
  });

  const activeStructure = FEE_STRUCTURES[activeFeeTab];

  const sanitizeInstallmentsForSubmit = (items = []) =>
    items
      .map((row) => ({
        label: row.label?.trim(),
        amount: row.amount === "" ? "" : Number(row.amount),
        dueMonth: row.dueMonth?.trim() || "",
      }))
      .filter(
        (row) =>
          row.label &&
          row.amount !== "" &&
          Number.isFinite(Number(row.amount)) &&
          Number(row.amount) >= 0
      )
      .map((row) => ({
        label: row.label,
        amount: Number(row.amount),
        dueMonth: row.dueMonth,
      }));

  const updateInstallmentRow = (mode, index, field, value) => {
    if (mode === "new") {
      setNewCourse((prev) => {
        const installments = [...(prev.installments || [])];
        installments[index] = { ...installments[index], [field]: value };
        return { ...prev, installments };
      });
    } else if (mode === "edit" && editCourse) {
      setEditCourse((prev) => {
        const installments = [...(prev.installments || [])];
        installments[index] = { ...installments[index], [field]: value };
        return { ...prev, installments };
      });
    }
  };

  const addInstallmentRow = (mode) => {
    if (mode === "new") {
      setNewCourse((prev) => ({
        ...prev,
        installments: [...(prev.installments || []), createInstallmentRow()],
      }));
    } else if (mode === "edit" && editCourse) {
      setEditCourse((prev) => ({
        ...prev,
        installments: [...(prev.installments || []), createInstallmentRow()],
      }));
    }
  };

  const removeInstallmentRow = (mode, index) => {
    if (mode === "new") {
      setNewCourse((prev) => {
        const installments = [...(prev.installments || [])];
        installments.splice(index, 1);
        return {
          ...prev,
          installments: installments.length
            ? installments
            : [createInstallmentRow()],
        };
      });
    } else if (mode === "edit" && editCourse) {
      setEditCourse((prev) => {
        const installments = [...(prev.installments || [])];
        installments.splice(index, 1);
        return {
          ...prev,
          installments: installments.length
            ? installments
            : [createInstallmentRow()],
        };
      });
    }
  };

  /* ---------------------- Fetch Courses ---------------------- */
  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/fetch`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await res.json();
      setAllCourses(data || []);
    } catch (err) {
      console.error("Fetch courses error:", err);
      alert("Failed to load courses. Check backend/API URL.");
    }
  };

  useEffect(() => {
    fetchCourses();
    setShowAdminHeader(false);
  }, [setShowAdminHeader]);

/* ---------------------- ADD handlers ---------------------- */

const handleAddCourseChange = (e) => {
  const { name, value } = e.target;
  setNewCourse((prev) => ({ ...prev, [name]: value }));
};

const handleAddCourseSubmit = async (e) => {
  e.preventDefault();

  const requiredFields = ["stream", "name", "duration", "fees", "programType"];
  const missingFields = requiredFields.filter(
    (field) => !newCourse[field] || newCourse[field].trim() === ""
  );

  if (missingFields.length > 0) {
    Swal.fire({
      icon: "warning",
      title: "Missing Fields",
      text: `Please fill: ${missingFields.join(", ")}`,
    });
    return;
  }

  setIsSubmitting(true);

  try {
    const body = {
      stream: newCourse.stream,
      name: newCourse.name,
      duration: newCourse.duration,
      fees: newCourse.fees,
      description: newCourse.description,
      programType: newCourse.programType,
      installments: sanitizeInstallmentsForSubmit(newCourse.installments),
    };

    const res = await fetch(`${API_BASE}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to add course");
    }

    await res.json();

    Swal.fire({
      icon: "success",
      title: "Course added successfully!",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });

    await fetchCourses();

    setShowAddForm(false);
    setNewCourse({
      stream: "",
      name: "",
      duration: "",
      fees: "",
      description: "",
      programType: "ADV_CERT",
      installments: [createInstallmentRow()],
    });
  } catch (err) {
    console.error("Error adding course:", err);

    Swal.fire({
      icon: "error",
      title: "Error adding course",
      text: err.message,
    });
  } finally {
    setIsSubmitting(false);
  }
};

/* ---------------------- EDIT handlers ---------------------- */

const openEditModal = (course) => {
  setEditCourse({
    _id: course._id,
    stream: course.department || "",
    name: course.title || "",
    duration: course.duration || "",
    fees: course.fees != null ? String(course.fees) : "",
    description: course.desc || "",
    programType: course.programType || "ADV_CERT",
    installments:
      (course.installments && course.installments.length
        ? course.installments
        : [createInstallmentRow()]
      ).map((inst) => ({
        label: inst.label || "",
        amount:
          inst.amount === 0 || inst.amount
            ? String(inst.amount)
            : "",
        dueMonth: inst.dueMonth || "",
      })),
  });
};

const handleEditChange = (e) => {
  const { name, value } = e.target;
  setEditCourse((prev) => ({ ...prev, [name]: value }));
};

const handleEditSubmit = async (e) => {
  e.preventDefault();
  if (!editCourse?._id) return;

  const requiredFields = ["stream", "name", "duration", "fees", "programType"];
  const missingFields = requiredFields.filter(
    (field) => !editCourse[field] || editCourse[field].trim() === ""
  );

  if (missingFields.length > 0) {
    Swal.fire({
      icon: "warning",
      title: "Missing Fields",
      text: `Please fill: ${missingFields.join(", ")}`,
    });
    return;
  }

  setIsSubmitting(true);

  try {
    const body = {
      stream: editCourse.stream,
      name: editCourse.name,
      duration: editCourse.duration,
      fees: editCourse.fees,
      description: editCourse.description,
      programType: editCourse.programType,
      installments: sanitizeInstallmentsForSubmit(editCourse.installments),
    };

    const res = await fetch(`${API_BASE}/${editCourse._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to update course");
    }

    await res.json();

    Swal.fire({
      icon: "success",
      title: "Course updated successfully!",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });

    await fetchCourses();
    setEditCourse(null);
  } catch (err) {
    console.error("Error updating course:", err);

    Swal.fire({
      icon: "error",
      title: "Error updating course",
      text: err.message,
    });
  } finally {
    setIsSubmitting(false);
  }
};

/* ---------------------- DELETE handler ---------------------- */

const handleDeleteCourse = async (course) => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: `Do you want to delete "${course.title}"?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Cancel",
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(`${API_BASE}/${course._id}`, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to delete course");
    }

    await res.json();

    Swal.fire({
      icon: "success",
      title: "Course deleted successfully!",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });

    await fetchCourses();
  } catch (err) {
    console.error("Delete course error:", err);

    Swal.fire({
      icon: "error",
      title: "Deletion Failed",
      text: err.message,
    });
  }
};


  return (
    <div className="h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 flex flex-col">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full bg-white/90 rounded-2xl shadow-2xl m-4 border border-yellow-200 overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 p-8 bg-white/90 border-b border-yellow-100">
          <div className="flex justify-between items-start mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-yellow-700">
                Course Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and organize NIF courses, with official fee breakdowns.
              </p>
            </div>
            <BookOpen className="w-12 h-12 text-yellow-500" />
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              className="flex items-center space-x-2 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-50 transition-colors text-sm font-medium"
              onClick={() => setShowFeeModal(true)}
            >
              <IndianRupee className="w-4 h-4" />
              <span>View Fee Breakdown</span>
            </button>

            <button
              className="flex items-center space-x-2 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Add Course</span>
            </button>
          </div>
        </div>

        {/* Courses grid */}
        <div className="flex-1 overflow-hidden p-8">
          <div className="h-full overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {course.title}
                      </h3>
                      {course.department && (
                        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          {course.department}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                        onClick={() => openEditModal(course)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        onClick={() => handleDeleteCourse(course)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {course.desc && (
                    <p className="text-sm text-gray-600 mb-4">
                      {course.desc}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-gray-600">
                    {course.programLabel && (
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-2" />
                        <span>Program: {course.programLabel}</span>
                      </div>
                    )}
                    {course.duration && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Duration: {course.duration}</span>
                      </div>
                    )}
                    {course.fees != null && (
                      <div className="flex items-center">
                        <IndianRupee className="w-4 h-4 mr-2" />
                        <span>Fees: ₹{course.fees}</span>
                      </div>
                    )}
                    {course.installments?.length ? (
                      <div className="flex items-center">
                        <ListOrdered className="w-4 h-4 mr-2" />
                        <span>{course.installments.length} Installments</span>
                      </div>
                    ) : null}
                    {course.instructor && (
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Instructor: {course.instructor}</span>
                      </div>
                    )}
                    {course.totalStudents != null && (
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{course.totalStudents} Students</span>
                      </div>
                    )}
                    {course.startingDate && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          Starts:{" "}
                          {new Date(course.startingDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {allCourses.length === 0 && (
                <div className="col-span-full text-center text-gray-500">
                  No courses added yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---------------------- Add Course Modal ---------------------- */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-colors duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-yellow-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-yellow-700">
                  Add New Course
                </h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddCourseSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    STREAM<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="stream"
                      value={newCourse.stream}
                      onChange={handleAddCourseChange}
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all appearance-none bg-white"
                    >
                      <option value="">Select a stream</option>
                      <option value="Fashion Design">Fashion Design</option>
                      <option value="Interior Design">Interior Design</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={newCourse.name}
                    onChange={handleAddCourseChange}
                    required
                    placeholder="Enter course name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none placeholder-gray-400 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="duration"
                    value={newCourse.duration}
                    onChange={handleAddCourseChange}
                    required
                    placeholder="e.g., 1 Year, 2 Years, 3 Years, 4 Years"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none placeholder-gray-400 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="programType"
                      value={editCourse.programType}
                      onChange={handleEditChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none bg-white appearance-none"
                    >
                      {PROGRAM_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="programType"
                      value={newCourse.programType}
                      onChange={handleAddCourseChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none bg-white appearance-none"
                    >
                      {PROGRAM_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fees <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      name="fees"
                      value={newCourse.fees}
                      onChange={handleAddCourseChange}
                      required
                      placeholder="Enter course fees"
                      type="number"
                      min="0"
                      className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none placeholder-gray-400 text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    name="description"
                    value={newCourse.description}
                    onChange={handleAddCourseChange}
                    rows={3}
                    placeholder="Short description about the course"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none placeholder-gray-400 text-gray-800 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Installment Breakdown
                  </label>
                  <div className="space-y-3">
                    {editCourse.installments.map((inst, idx) => (
                      <div
                        key={`edit-installment-${idx}`}
                        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
                      >
                        <div className="md:col-span-4">
                          <label className="text-xs font-medium text-gray-500">
                            Label
                          </label>
                          <input
                            value={inst.label}
                            onChange={(e) =>
                              updateInstallmentRow("edit", idx, "label", e.target.value)
                            }
                            placeholder="e.g., Time of Admission"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="text-xs font-medium text-gray-500">
                            Amount
                          </label>
                          <div className="relative">
                            <IndianRupee
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                              size={14}
                            />
                            <input
                              type="number"
                              min="0"
                              value={inst.amount}
                              onChange={(e) =>
                                updateInstallmentRow("edit", idx, "amount", e.target.value)
                              }
                              placeholder="7500"
                              className="w-full pl-8 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-xs font-medium text-gray-500">
                            Due Timeline
                          </label>
                          <input
                            value={inst.dueMonth}
                            onChange={(e) =>
                              updateInstallmentRow("edit", idx, "dueMonth", e.target.value)
                            }
                            placeholder="e.g., Month 2"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                          />
                        </div>
                        <div className="md:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeInstallmentRow("edit", idx)}
                            className="text-sm text-red-500 hover:text-red-600"
                            disabled={editCourse.installments.length === 1}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addInstallmentRow("edit")}
                      className="text-sm text-yellow-700 font-medium"
                    >
                      + Add Installment
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Installment Breakdown
                  </label>
                  <div className="space-y-3">
                    {newCourse.installments.map((inst, idx) => (
                      <div
                        key={`new-installment-${idx}`}
                        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
                      >
                        <div className="md:col-span-4">
                          <label className="text-xs font-medium text-gray-500">
                            Label
                          </label>
                          <input
                            value={inst.label}
                            onChange={(e) =>
                              updateInstallmentRow("new", idx, "label", e.target.value)
                            }
                            placeholder="e.g., Time of Admission"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="text-xs font-medium text-gray-500">
                            Amount
                          </label>
                          <div className="relative">
                            <IndianRupee
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                              size={14}
                            />
                            <input
                              type="number"
                              min="0"
                              value={inst.amount}
                              onChange={(e) =>
                                updateInstallmentRow("new", idx, "amount", e.target.value)
                              }
                              placeholder="7500"
                              className="w-full pl-8 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-xs font-medium text-gray-500">
                            Due Timeline
                          </label>
                          <input
                            value={inst.dueMonth}
                            onChange={(e) =>
                              updateInstallmentRow("new", idx, "dueMonth", e.target.value)
                            }
                            placeholder="e.g., Month 2"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                          />
                        </div>
                        <div className="md:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeInstallmentRow("new", idx)}
                            className="text-sm text-red-500 hover:text-red-600"
                            disabled={newCourse.installments.length === 1}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addInstallmentRow("new")}
                      className="text-sm text-yellow-700 font-medium"
                    >
                      + Add Installment
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    {isSubmitting ? "Adding..." : "Add Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ---------------------- Edit Course Modal ---------------------- */}
        {editCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-colors duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-yellow-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-yellow-700">
                  Edit Course
                </h2>
                <button
                  onClick={() => setEditCourse(null)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    STREAM<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="stream"
                      value={editCourse.stream}
                      onChange={handleEditChange}
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all appearance-none bg-white"
                    >
                      <option value="">Select a stream</option>
                      <option value="Fashion Design">Fashion Design</option>
                      <option value="Interior Design">Interior Design</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={editCourse.name}
                    onChange={handleEditChange}
                    required
                    placeholder="Enter course name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none placeholder-gray-400 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="duration"
                    value={editCourse.duration}
                    onChange={handleEditChange}
                    required
                    placeholder="e.g., 1 Year, 2 Years, 3 Years, 4 Years"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none placeholder-gray-400 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fees <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      name="fees"
                      value={editCourse.fees}
                      onChange={handleEditChange}
                      required
                      placeholder="Enter course fees"
                      type="number"
                      min="0"
                      className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none placeholder-gray-400 text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    name="description"
                    value={editCourse.description}
                    onChange={handleEditChange}
                    rows={3}
                    placeholder="Short description about the course"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none placeholder-gray-400 text-gray-800 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditCourse(null)}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Edit3 size={18} />
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

       {/* Fee Breakdown Modal */}
        {showFeeModal && activeStructure && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-yellow-300 flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-yellow-100 bg-yellow-50">
                <div>
                  <h2 className="text-xl font-bold text-yellow-700">
                    Fees Breakup – Session 2025–26
                  </h2>
                  <p className="text-xs text-gray-600">
                    Official breakup based on your NIF Global fee structure.
                  </p>
                </div>
                <button
                  onClick={() => setShowFeeModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-yellow-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-6 pt-4 flex flex-wrap gap-2 border-b border-yellow-100 bg-white">
                {Object.values(FEE_STRUCTURES).map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setActiveFeeTab(s.key)}
                    className={`px-3 py-2 rounded-full text-xs font-medium border ${
                      activeFeeTab === s.key
                        ? "bg-yellow-500 text-black border-yellow-500 shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-yellow-50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {activeStructure.label}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {activeStructure.streamNote}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                  <table className="min-w-full text-sm">
                    <thead className="bg-yellow-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">
                          Description
                        </th>
                        {activeStructure.years.map((y) => (
                          <th
                            key={y}
                            className="px-4 py-2 text-right font-semibold text-gray-700 border-b"
                          >
                            {y}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeStructure.rows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-4 py-2 border-b text-gray-700">
                            {row.description}
                          </td>
                          {row.values.map((v, i) => (
                            <td
                              key={i}
                              className="px-4 py-2 border-b text-right text-gray-800"
                            >
                              ₹{v.toLocaleString("en-IN")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-yellow-100/80">
                        <td className="px-4 py-2 font-semibold text-gray-800 border-t">
                          Total (per year)
                        </td>
                        {activeStructure.totals.map((t, i) => (
                          <td
                            key={i}
                            className="px-4 py-2 text-right font-semibold text-gray-900 border-t"
                          >
                            ₹{t.toLocaleString("en-IN")}
                          </td>
                        ))}
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                    Important Notes
                  </h4>
                  <ul className="text-xs text-gray-700 list-disc list-inside space-y-1">
                    {activeStructure.extraNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                    <li>
                      Late fees, GST or university policy changes will apply as
                      per official circulars.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
