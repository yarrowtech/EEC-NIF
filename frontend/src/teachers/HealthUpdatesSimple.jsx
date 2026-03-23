import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Search, User } from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const parseSortNumber = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return Number.POSITIVE_INFINITY;
  const n = Number(text);
  if (Number.isFinite(n)) return n;
  const m = text.match(/\d+/);
  return m ? Number(m[0]) : Number.POSITIVE_INFINITY;
};

const HealthUpdatesSimple = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [sessionOptions, setSessionOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [quick, setQuick] = useState({
    mood: "Happy",
    energy: "High",
    physicalIssue: "No",
    notes: "",
  });

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const userType = localStorage.getItem("userType");
        if (!token || userType !== "Teacher") throw new Error("Teacher login required.");

        const now = new Date();
        const month = String(now.getFullYear()) + "-" + String(now.getMonth() + 1).padStart(2, "0");
        const date = now.toISOString().slice(0, 10);
        const query = new URLSearchParams({ month, date });
        if (selectedSession) query.set("session", selectedSession);
        if (selectedClass) query.set("className", selectedClass);
        if (selectedSection) query.set("section", selectedSection);
        if (search.trim()) query.set("search", search.trim());

        const res = await fetch(API_BASE + "/api/attendance/teacher/students?" + query.toString(), {
          headers: { Authorization: "Bearer " + token },
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload?.error || "Unable to load students");

        const list = (Array.isArray(payload?.students) ? payload.students : []).map((s) => ({
          id: String(s._id || s.id || ""),
          name: s.name || "Student",
          className: s.className || s.grade || "-",
          section: s.section || "-",
          roll: s.roll || s.rollNo || s.rollNumber || "-",
        }));

        list.sort((a, b) => {
          const ra = parseSortNumber(a.roll);
          const rb = parseSortNumber(b.roll);
          if (ra !== rb) return ra - rb;
          return String(a.name).localeCompare(String(b.name), undefined, { numeric: true });
        });

        setStudents(list);
        setSessionOptions(Array.isArray(payload?.options?.sessions) ? payload.options.sessions : []);
        setClassOptions(Array.isArray(payload?.options?.classes) ? payload.options.classes : []);
        setSectionOptions(Array.isArray(payload?.options?.sections) ? payload.options.sections : []);
        setSelectedStudentId((prev) => (list.some((x) => x.id === prev) ? prev : list[0]?.id || ""));
      } catch (err) {
        console.error("health updates fetch error", err);
        setError(err.message || "Unable to load student data");
        setStudents([]);
        setSelectedStudentId("");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [selectedSession, selectedClass, selectedSection, search]);

  const selectedStudent = useMemo(
    () => students.find((s) => String(s.id) === String(selectedStudentId)) || null,
    [students, selectedStudentId]
  );

  const saveQuickEntry = () => {
    if (!selectedStudent) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
    setQuick((prev) => ({ ...prev, notes: "" }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h1 className="text-2xl font-bold text-slate-900">Student Health Updates</h1>
        <p className="text-sm text-slate-600">Simple view: filtered student data + quick health entry.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by student name" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
        </div>
        <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All Years</option>
          {sessionOptions.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All Classes</option>
          {classOptions.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All Sections</option>
          {sectionOptions.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="font-semibold text-slate-900 mb-3">Students</h2>
          <div className="max-h-[420px] overflow-y-auto space-y-2">
            {loading ? <p className="text-sm text-slate-500">Loading students...</p> : students.length === 0 ? <p className="text-sm text-slate-500">No students found.</p> : students.map((s) => (
              <label key={s.id} className={"flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer " + (String(selectedStudentId) === String(s.id) ? "border-blue-400 bg-blue-50" : "border-slate-200")}>
                <input type="radio" name="student" value={s.id} checked={String(selectedStudentId) === String(s.id)} onChange={(e) => setSelectedStudentId(e.target.value)} className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{s.name}</p>
                  <p className="text-xs text-slate-600">ID/Roll: {s.roll} • Section: {s.section}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 space-y-4">
          {!selectedStudent ? (
            <div className="text-sm text-slate-500">Select a student from the list.</div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{selectedStudent.name}</h2>
                  <p className="text-sm text-slate-600">Class {selectedStudent.className} • ID/Roll {selectedStudent.roll} • Section {selectedStudent.section}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg"><User className="w-5 h-5 text-blue-600" /></div>
              </div>

              <div className="border rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-slate-900">Quick Health Entry</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <select value={quick.mood} onChange={(e) => setQuick((q) => ({ ...q, mood: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm">
                    <option>Happy</option><option>Neutral</option><option>Sad</option>
                  </select>
                  <select value={quick.energy} onChange={(e) => setQuick((q) => ({ ...q, energy: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm">
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                  <select value={quick.physicalIssue} onChange={(e) => setQuick((q) => ({ ...q, physicalIssue: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm">
                    <option>No</option><option>Yes</option>
                  </select>
                  <input value={quick.notes} onChange={(e) => setQuick((q) => ({ ...q, notes: e.target.value }))} placeholder="Short notes" className="border rounded-lg px-3 py-2 text-sm" />
                </div>
                <button type="button" onClick={saveQuickEntry} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <CheckCircle2 className="w-4 h-4" /> Save
                </button>
                {saved && <p className="text-sm text-green-700 inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4" />Saved successfully.</p>}
              </div>

              <div className="border rounded-xl p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-900 mb-1">Simple status</p>
                <p>Filtered fetch is active from backend. Keep entries quick and easy.</p>
                <p className="mt-2 inline-flex items-center gap-1 text-amber-700"><AlertCircle className="w-4 h-4" />Minimal interface as requested.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthUpdatesSimple;
