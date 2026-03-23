import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, Eye } from "lucide-react";
import { formatStudentDisplay } from "../utils/studentDisplay";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const SCORE_OPTIONS = ["High", "Medium", "Low"];
const ATTITUDE_OPTIONS = ["Excellent", "Good", "Average", "Needs Support"];
const BEHAVIOR_OPTIONS = ["Excellent", "Good", "Average", "Needs Improvement"];
const SOCIAL_OPTIONS = ["Strong", "Good", "Developing", "Needs Support"];
const COMM_OPTIONS = ["Excellent", "Good", "Fair", "Needs Support"];
const TRAIT_OPTIONS = ["Strong", "Good", "Developing", "Needs Support"];
const EMOTIONAL_OPTIONS = ["Stable", "Mostly Stable", "Fluctuating", "Needs Support"];
const PHYSICAL_OPTIONS = ["Active", "Moderately Active", "Low Activity", "Needs Encouragement"];
const CREATIVITY_OPTIONS = ["High", "Moderate", "Emerging", "Low"];
const ROUTINE_OPTIONS = ["Consistent", "Mostly Consistent", "Inconsistent", "Needs Improvement"];
const field = (label, options = SCORE_OPTIONS) => ({ label, options });

const SECTION_FIELDS = [
  {
    title: "1. Learning & Attitude",
    group: "emotion",
    fields: [
      field("Attention span", ["High", "Medium", "Low"]),
      field("Curiosity level", ATTITUDE_OPTIONS),
      field("Willingness to learn", ATTITUDE_OPTIONS),
      field("Ability to follow instructions", ATTITUDE_OPTIONS),
      field("Initiative", ATTITUDE_OPTIONS),
    ],
  },
  {
    title: "2. Classroom Behavior",
    group: "emotion",
    fields: [
      field("Discipline", BEHAVIOR_OPTIONS),
      field("Respect towards teachers", BEHAVIOR_OPTIONS),
      field("Listening skills", BEHAVIOR_OPTIONS),
      field("Rule-following behavior", BEHAVIOR_OPTIONS),
      field("Time management", BEHAVIOR_OPTIONS),
    ],
  },
  {
    title: "3. Social Behavior",
    group: "emotion",
    fields: [
      field("Interaction with peers", SOCIAL_OPTIONS),
      field("Teamwork", SOCIAL_OPTIONS),
      field("Leadership qualities", SOCIAL_OPTIONS),
      field("Helping nature", SOCIAL_OPTIONS),
      field("Conflict resolution skills", SOCIAL_OPTIONS),
    ],
  },
  {
    title: "4. Communication Skills",
    group: "emotion",
    fields: [
      field("Verbal communication", COMM_OPTIONS),
      field("Confidence in speaking", COMM_OPTIONS),
      field("Clarity of expression", COMM_OPTIONS),
      field("Body language", COMM_OPTIONS),
      field("Listening to others", COMM_OPTIONS),
    ],
  },
  {
    title: "5. Personal Traits",
    group: "emotion",
    fields: [
      field("Confidence level", TRAIT_OPTIONS),
      field("Responsibility", TRAIT_OPTIONS),
      field("Honesty / integrity", TRAIT_OPTIONS),
      field("Patience", TRAIT_OPTIONS),
      field("Adaptability", TRAIT_OPTIONS),
    ],
  },
  {
    title: "6. Emotional & Mental State",
    group: "health",
    fields: [
      field("Emotional control", EMOTIONAL_OPTIONS),
      field("Stress handling", EMOTIONAL_OPTIONS),
      field("Motivation level", EMOTIONAL_OPTIONS),
      field("Mood stability", EMOTIONAL_OPTIONS),
      field("Self-esteem", EMOTIONAL_OPTIONS),
    ],
  },
  {
    title: "7. Physical & Activity Participation",
    group: "health",
    fields: [
      field("Participation in sports", PHYSICAL_OPTIONS),
      field("Energy level", PHYSICAL_OPTIONS),
      field("Interest in physical activities", PHYSICAL_OPTIONS),
      field("Coordination / fitness", PHYSICAL_OPTIONS),
    ],
  },
  {
    title: "8. Creativity & Interests",
    group: "emotion",
    fields: [
      field("Creative thinking", CREATIVITY_OPTIONS),
      field("Artistic interest", CREATIVITY_OPTIONS),
      field("Innovation / idea generation", CREATIVITY_OPTIONS),
      field("Hobby engagement", CREATIVITY_OPTIONS),
    ],
  },
  {
    title: "9. Discipline & Routine",
    group: "emotion",
    fields: [
      field("Punctuality", ROUTINE_OPTIONS),
      field("Daily routine consistency", ROUTINE_OPTIONS),
      field("Task completion habits", ROUTINE_OPTIONS),
      field("Responsibility towards duties", ROUTINE_OPTIONS),
    ],
  },
];

const NOTES_FIELDS = [
  "Behavioral changes",
  "Unique strengths",
  "Areas of concern",
  "Any incidents worth noting",
];

const buildInitialRatings = () => {
  const out = {};
  SECTION_FIELDS.forEach((section) => {
    section.fields.forEach((fieldDef) => {
      out[fieldDef.label] = "";
    });
  });
  return out;
};

const buildInitialNotes = () => {
  const out = {};
  NOTES_FIELDS.forEach((field) => {
    out[field] = "";
  });
  return out;
};

const parseSortableNumber = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return Number.POSITIVE_INFINITY;
  const n = Number(text);
  if (Number.isFinite(n)) return n;
  const m = text.match(/\d+/);
  return m ? Number(m[0]) : Number.POSITIVE_INFINITY;
};

const getOptionEmoji = (option) => {
  const value = String(option || "").toLowerCase();
  if (value.includes("excellent") || value.includes("strong") || value.includes("active") || value.includes("high")) return "😀";
  if (value.includes("good") || value.includes("stable") || value.includes("moderate") || value.includes("medium")) return "🙂";
  if (value.includes("average") || value.includes("developing") || value.includes("mostly")) return "😐";
  if (value.includes("low") || value.includes("needs") || value.includes("inconsistent") || value.includes("fluctuating")) return "😟";
  return "🙂";
};

const StudentObservationOverview = () => {
  const [students, setStudents] = useState([]);
  const [studentIdSet, setStudentIdSet] = useState(new Set());
  const [observations, setObservations] = useState([]);
  const [sessionOptions, setSessionOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [ratings, setRatings] = useState(buildInitialRatings);
  const [notes, setNotes] = useState(buildInitialNotes);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [observationsLoading, setObservationsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadStudents = async () => {
      setStudentsLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const userType = localStorage.getItem("userType");
        if (!token || userType !== "Teacher") {
          throw new Error("Teacher session not found. Please log in again.");
        }

        const query = new URLSearchParams();
        if (selectedSession) query.set("session", selectedSession);
        if (selectedClass) query.set("className", selectedClass);
        if (selectedSection) query.set("section", selectedSection);

        const headers = { Authorization: `Bearer ${token}` };
        const studentsRes = await fetch(
          `${API_BASE_URL}/api/attendance/teacher/students?${query.toString()}`,
          { headers }
        );
        const studentsPayload = await studentsRes.json().catch(() => ({}));
        if (!studentsRes.ok) throw new Error(studentsPayload?.error || "Unable to load students");

        const scopedStudents = Array.isArray(studentsPayload?.students) ? studentsPayload.students : [];
        const allowedIds = new Set(scopedStudents.map((s) => String(s?._id || s?.id || "")));

        setSessionOptions(Array.isArray(studentsPayload?.options?.sessions) ? studentsPayload.options.sessions : []);
        setClassOptions(Array.isArray(studentsPayload?.options?.classes) ? studentsPayload.options.classes : []);
        setSectionOptions(Array.isArray(studentsPayload?.options?.sections) ? studentsPayload.options.sections : []);
        setStudents(scopedStudents);
        setStudentIdSet(allowedIds);
        if (!allowedIds.has(String(selectedStudentId || ""))) {
          setSelectedStudentId("");
        }
      } catch (err) {
        console.error("Load students error:", err);
        setError(err.message || "Unable to load data");
        setStudents([]);
        setStudentIdSet(new Set());
      } finally {
        setStudentsLoading(false);
      }
    };

    loadStudents();
  }, [selectedSession, selectedClass, selectedSection]);

  useEffect(() => {
    const loadObservations = async () => {
      setObservationsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const userType = localStorage.getItem("userType");
        if (!token || userType !== "Teacher") return;
        const res = await fetch(`${API_BASE_URL}/api/observations/teacher?limit=30`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload?.error || "Unable to load observations");
        setObservations(Array.isArray(payload?.observations) ? payload.observations.slice(0, 10) : []);
      } catch (err) {
        console.error("Load observations error:", err);
      } finally {
        setObservationsLoading(false);
      }
    };
    loadObservations();
  }, []);

  const selectedCount = useMemo(
    () => Object.values(ratings).filter(Boolean).length,
    [ratings]
  );

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const idA = parseSortableNumber(a?.roll ?? a?.rollNo ?? a?.rollNumber ?? a?.studentCode);
      const idB = parseSortableNumber(b?.roll ?? b?.rollNo ?? b?.rollNumber ?? b?.studentCode);
      if (idA !== idB) return idA - idB;
      return String(a?.name || "").localeCompare(String(b?.name || ""), undefined, { numeric: true });
    });
  }, [students]);

  const handleRatingChange = (field, value) => {
    setRatings((prev) => ({ ...prev, [field]: value }));
  };

  const handleRatingDrop = (field, options, droppedValue) => {
    if (!options.includes(droppedValue)) return;
    handleRatingChange(field, droppedValue);
  };

  const handleNoteChange = (field, value) => {
    setNotes((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => {
    const healthObservations = {};
    const emotionObservations = {};

    SECTION_FIELDS.forEach((section) => {
      section.fields.forEach((fieldDef) => {
        if (!ratings[fieldDef.label]) return;
        if (section.group === "health") healthObservations[fieldDef.label] = ratings[fieldDef.label];
        else emotionObservations[fieldDef.label] = ratings[fieldDef.label];
      });
    });

    const concernText = notes["Areas of concern"] || "";
    const urgencyLevel = concernText.trim() ? "high" : "normal";
    const followUpRequired = Boolean(concernText.trim());
    const noteLines = NOTES_FIELDS.map((field) => `${field}: ${notes[field] || "-"}`);

    return {
      studentId: selectedStudentId,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
      healthObservations,
      emotionObservations,
      additionalNotes: noteLines.join("\n"),
      urgencyLevel,
      followUpRequired,
      parentNotification: false,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (!selectedStudentId) {
        throw new Error("Please select a student.");
      }
      if (!studentIdSet.has(String(selectedStudentId))) {
        throw new Error("Selected student is not in your academic allocation.");
      }

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Teacher session not found. Please log in again.");

      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/api/observations/teacher`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildPayload()),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || "Unable to save observation");

      setObservations((prev) => [payload, ...prev].slice(0, 10));
      setRatings(buildInitialRatings());
      setNotes(buildInitialNotes());
      setSelectedStudentId("");
      setSuccess("Observation saved successfully.");
    } catch (err) {
      console.error("Observation save error:", err);
      setError(err.message || "Unable to save observation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Observations (Non-Academic)</h1>
              <p className="text-sm text-gray-600">
                Select students by Academic Year, Class and Section filters.
              </p>
            </div>
          </div>
        </div>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}
        {success && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  disabled={studentsLoading || saving}
                >
                  <option value="">All Years</option>
                  {sessionOptions.map((session) => (
                    <option key={session} value={session}>
                      {session}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSection("");
                  }}
                  disabled={studentsLoading || saving}
                >
                  <option value="">All Classes</option>
                  {classOptions.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={studentsLoading || saving}
                >
                  <option value="">All Sections</option>
                  {sectionOptions.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Students</h3>
                <p className="text-xs text-gray-600">
                  Selected ratings: <span className="font-semibold text-gray-900">{selectedCount}</span>
                </p>
              </div>
              {studentsLoading ? (
                <p className="text-sm text-gray-500">Loading students...</p>
              ) : sortedStudents.length === 0 ? (
                <p className="text-sm text-gray-500">No students found for selected filters.</p>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-2">
                  {sortedStudents.map((student) => {
                    const id = String(student._id || student.id || "");
                    const checked = String(selectedStudentId) === id;
                    return (
                      <label
                        key={id}
                        className={`flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer ${
                          checked ? "border-blue-400 bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedStudent"
                          value={id}
                          checked={checked}
                          onChange={(e) => setSelectedStudentId(e.target.value)}
                          className="h-4 w-4 text-blue-600"
                          disabled={saving}
                          required
                        />
                        <span className="text-sm text-gray-800">{formatStudentDisplay(student)}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {SECTION_FIELDS.map((section) => (
              <div key={section.title} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{section.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {section.fields.map((fieldDef) => (
                    <label key={fieldDef.label} className="block">
                      <span className="block text-xs font-medium text-gray-700 mb-1">{fieldDef.label}</span>
                      <div
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const droppedValue = e.dataTransfer.getData("text/plain");
                          handleRatingDrop(fieldDef.label, fieldDef.options, droppedValue);
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-500">
                            {ratings[fieldDef.label] ? `Selected: ${ratings[fieldDef.label]}` : "Click or drag emoji option"}
                          </p>
                          {ratings[fieldDef.label] && (
                            <button
                              type="button"
                              className="text-xs text-red-600 hover:text-red-700"
                              onClick={() => handleRatingChange(fieldDef.label, "")}
                              disabled={saving}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {fieldDef.options.map((opt) => {
                            const active = ratings[fieldDef.label] === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                draggable={!saving}
                                onDragStart={(e) => e.dataTransfer.setData("text/plain", opt)}
                                onClick={() => handleRatingChange(fieldDef.label, opt)}
                                disabled={saving}
                                className={`inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs border transition ${
                                  active
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                                }`}
                                title="Click to select, or drag and drop"
                              >
                                <span className="text-sm">{getOptionEmoji(opt)}</span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">10. Special Observations / Notes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {NOTES_FIELDS.map((field) => (
                  <label key={field} className="block">
                    <span className="block text-xs font-medium text-gray-700 mb-1">{field}</span>
                    <textarea
                      rows="3"
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={notes[field]}
                      onChange={(e) => handleNoteChange(field, e.target.value)}
                      disabled={saving}
                    />
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || studentsLoading}
              className={`w-full py-3 rounded-lg text-white font-medium ${saving || studentsLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {saving ? "Saving..." : "Save Observation"}
            </button>
          </form>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Observations</h2>
            <div className="space-y-3">
              {observationsLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : observations.length === 0 ? (
                <p className="text-sm text-gray-500">No observations available.</p>
              ) : (
                observations.map((entry) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900">{entry.studentName || "Student"}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {entry.recordedAt ? new Date(entry.recordedAt).toLocaleDateString() : "-"}
                    </p>
                    {entry.additionalNotes && (
                      <p className="text-xs text-gray-700 mt-2 line-clamp-3 whitespace-pre-line">{entry.additionalNotes}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentObservationOverview;
