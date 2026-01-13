import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Calendar, Layers, Plus } from "lucide-react";

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

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      authorization: token ? `Bearer ${token}` : "",
    };
  }, []);

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
              <div className="space-y-3">
                {years.map((year) => (
                  <div
                    key={year._id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{year.name}</p>
                      <p className="text-xs text-gray-500">
                        {year.startDate ? new Date(year.startDate).toLocaleDateString() : "—"}{" "}
                        to {year.endDate ? new Date(year.endDate).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    {year.isActive && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                ))}
                {years.length === 0 && (
                  <p className="text-sm text-gray-500">No academic years yet.</p>
                )}
              </div>
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
              <div className="space-y-3">
                {classes.map((cls) => (
                  <div
                    key={cls._id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{cls.name}</p>
                      <p className="text-xs text-gray-500">Order: {cls.order ?? 0}</p>
                    </div>
                  </div>
                ))}
                {classes.length === 0 && (
                  <p className="text-sm text-gray-500">No classes yet.</p>
                )}
              </div>
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
              <div className="space-y-3">
                {sections.map((section) => (
                  <div
                    key={section._id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{section.name}</p>
                      <p className="text-xs text-gray-500">
                        Class: {classes.find((cls) => cls._id === section.classId)?.name || "—"}
                      </p>
                    </div>
                  </div>
                ))}
                {sections.length === 0 && (
                  <p className="text-sm text-gray-500">No sections yet.</p>
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
              <div className="space-y-3">
                {subjects.map((subject) => (
                  <div
                    key={subject._id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{subject.name}</p>
                      <p className="text-xs text-gray-500">
                        {subject.code || "No code"} •{" "}
                        {classes.find((cls) => cls._id === subject.classId)?.name || "All classes"}
                      </p>
                    </div>
                  </div>
                ))}
                {subjects.length === 0 && (
                  <p className="text-sm text-gray-500">No subjects yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicSetup;
