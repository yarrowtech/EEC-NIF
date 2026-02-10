import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Plus,
  Trash2,
  BookOpen,
  FlaskConical,
  Layers,
  PenLine,
  GraduationCap,
  Gamepad2,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
} from "lucide-react";
import PointsBadge from "./PointsBadge";
import Assignment from "./Assignment";
import Tryout from "./Tryout";

/* ═══════════════ TOUR STEPS CONFIG ═══════════════ */
const TOUR_STEPS = [
  {
    target: "tour-welcome",
    title: "Welcome to Your Learning Journal!",
    description: "This is your personal space to record what you learn every day. Let\u2019s take a quick tour to get you started.",
    emoji: "\u{1F4D6}",
    position: "center",
  },
  {
    target: "tour-timeline",
    title: "Your Timeline",
    description: "All your journal entries appear here, organized by day. You can scroll through your past entries and click any one to revisit it.",
    emoji: "\u{1F4C5}",
    position: "right",
  },
  {
    target: "tour-new-entry",
    title: "Start a New Day",
    description: "Click \u201CAdd New Day\u201D to begin writing a fresh journal entry. Each entry represents one day of your learning journey.",
    emoji: "\u2795",
    position: "right",
  },
  {
    target: "tour-title",
    title: "Give It a Title",
    description: "Write a short title for today\u2019s entry \u2014 something like \u201CDiscovered photosynthesis\u201D or \u201CMath breakthrough!\u201D",
    emoji: "\u270F\uFE0F",
    position: "left",
  },
  {
    target: "tour-content",
    title: "Write Your Notes",
    description: "This is the main writing area with lined paper. Describe what you learned, questions you have, or anything interesting from your day.",
    emoji: "\u{1F4DD}",
    position: "left",
  },
  {
    target: "tour-mood-tags",
    title: "Track Your Mood & Tags",
    description: "Add tags to organize entries (like \u201Cscience\u201D, \u201Cmath\u201D) and pick an emoji that matches how you felt today.",
    emoji: "\u{1F3F7}\uFE0F",
    position: "top",
  },
  {
    target: "tour-save",
    title: "Auto-Save & Manual Save",
    description: "Your journal auto-saves as you type! You can also click \u201CSave Entry\u201D anytime. Look for the status indicator next to the button.",
    emoji: "\u{1F4BE}",
    position: "top",
  },
  {
    target: "tour-done",
    title: "You\u2019re All Set!",
    description: "Start writing your first entry now. The more you journal, the better you\u2019ll understand your learning journey. Happy writing!",
    emoji: "\u{1F389}",
    position: "center",
  },
];

const TOUR_STORAGE_KEY = "journal_tour_completed";

const AssignmentView = ({ defaultType = "school" }) => {
  const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
  const [filter, setFilter] = useState("all");
  const [assignmentType, setAssignmentType] = useState(defaultType);

  // Journal state
  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [journalTags, setJournalTags] = useState("");
  const [journalMood, setJournalMood] = useState("Neutral");
  const [journalEntries, setJournalEntries] = useState([]);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [autosaveLabel, setAutosaveLabel] = useState("Saved");
  const [journalLoading, setJournalLoading] = useState(false);
  const skipAutosaveRef = useRef(false);

  // Tour state
  const [tourStep, setTourStep] = useState(-1); // -1 = not showing
  const [tourDismissed, setTourDismissed] = useState(() => {
    try { return localStorage.getItem(TOUR_STORAGE_KEY) === "true"; } catch { return false; }
  });

  useEffect(() => { setAssignmentType(defaultType); }, [defaultType]);

  useEffect(() => {
    if (assignmentType !== "journal") return;
    loadJournalEntries();
  }, [assignmentType]);

  // Auto-start tour when journal loads and not previously dismissed
  useEffect(() => {
    if (assignmentType === "journal" && !tourDismissed && tourStep === -1) {
      const timer = setTimeout(() => setTourStep(0), 600);
      return () => clearTimeout(timer);
    }
  }, [assignmentType, tourDismissed]);

  /* ─── Tour helpers ─── */
  const tourNext = useCallback(() => {
    setTourStep((s) => (s < TOUR_STEPS.length - 1 ? s + 1 : s));
  }, []);

  const tourPrev = useCallback(() => {
    setTourStep((s) => (s > 0 ? s - 1 : s));
  }, []);

  const tourFinish = useCallback(() => {
    setTourStep(-1);
    setTourDismissed(true);
    try { localStorage.setItem(TOUR_STORAGE_KEY, "true"); } catch {}
  }, []);

  const tourSkip = tourFinish;

  const restartTour = useCallback(() => {
    setTourDismissed(false);
    setTourStep(0);
    try { localStorage.removeItem(TOUR_STORAGE_KEY); } catch {}
  }, []);

  /* ─── Auth ─── */
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  };

  /* ─── Journal helpers ─── */
  const normalizeEntry = (entry) => ({
    id: entry?._id || entry?.id,
    title: entry?.title || "",
    content: entry?.content || "",
    tags: Array.isArray(entry?.tags) ? entry.tags : [],
    mood: entry?.mood || "Neutral",
    createdAt: entry?.createdAt,
    updatedAt: entry?.updatedAt,
  });

  const loadJournalEntries = async () => {
    const headers = getAuthHeaders();
    if (!headers) { setAutosaveLabel("Login required"); setJournalEntries([]); return; }
    setJournalLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/student/auth/journal`, { headers });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.error || "Unable to load journal entries"); }
      const payload = await res.json();
      setJournalEntries((Array.isArray(payload?.entries) ? payload.entries : []).map(normalizeEntry));
      setAutosaveLabel("Saved");
    } catch (err) {
      console.error("Journal load error:", err);
      setAutosaveLabel("Not saved");
    } finally {
      setJournalLoading(false);
    }
  };

  const resetJournalForm = () => {
    setSelectedEntryId(null);
    setJournalTitle("");
    setJournalContent("");
    setJournalTags("");
    setJournalMood("Neutral");
  };

  const handleSaveDraft = async () => {
    const headers = getAuthHeaders();
    if (!headers) { setAutosaveLabel("Login required"); return; }
    if (!journalTitle.trim() && !journalContent.trim()) return;
    setAutosaveLabel("Saving\u2026");
    const payload = {
      title: journalTitle.trim() || "Untitled",
      content: journalContent,
      tags: (journalTags || "").split(",").map((t) => t.trim()).filter(Boolean),
      mood: journalMood,
    };
    try {
      if (selectedEntryId) {
        const res = await fetch(`${API_BASE}/api/student/auth/journal/${selectedEntryId}`, { method: "PUT", headers, body: JSON.stringify(payload) });
        if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.error || "Unable to update journal entry"); }
        const data = await res.json();
        const entry = normalizeEntry(data?.entry || data);
        setJournalEntries((prev) => prev.map((e) => (e.id === selectedEntryId ? entry : e)));
      } else {
        const res = await fetch(`${API_BASE}/api/student/auth/journal`, { method: "POST", headers, body: JSON.stringify(payload) });
        if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.error || "Unable to create journal entry"); }
        const data = await res.json();
        const entry = normalizeEntry(data?.entry || data);
        setJournalEntries((prev) => [entry, ...prev]);
        setSelectedEntryId(entry.id);
      }
      setAutosaveLabel("Saved");
    } catch (err) {
      console.error("Journal save error:", err);
      setAutosaveLabel("Not saved");
    }
  };

  const handleDeleteEntry = async (id) => {
    const headers = getAuthHeaders();
    if (!headers) { setAutosaveLabel("Login required"); return; }
    try {
      const res = await fetch(`${API_BASE}/api/student/auth/journal/${id}`, { method: "DELETE", headers });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.error || "Unable to delete journal entry"); }
      setJournalEntries((prev) => prev.filter((e) => e.id !== id));
      if (selectedEntryId === id) resetJournalForm();
      setAutosaveLabel("Saved");
    } catch (err) {
      console.error("Journal delete error:", err);
      setAutosaveLabel("Not saved");
    }
  };

  const loadEntry = (entry) => {
    skipAutosaveRef.current = true;
    setSelectedEntryId(entry.id);
    setJournalTitle(entry.title || "");
    setJournalContent(entry.content || "");
    setJournalTags((entry.tags || []).join(", "));
    setJournalMood(entry.mood || "Neutral");
  };

  // Autosave debounce
  useEffect(() => {
    if (assignmentType !== "journal") return;
    if (skipAutosaveRef.current) { skipAutosaveRef.current = false; return; }
    if (!journalTitle.trim() && !journalContent.trim()) { setAutosaveLabel("Saved"); return; }
    setAutosaveLabel("Saving\u2026");
    const t = setTimeout(() => handleSaveDraft(), 1200);
    return () => clearTimeout(t);
  }, [journalTitle, journalContent, journalTags, journalMood, assignmentType]);

  /* ─── Type tabs config ─── */
  const typeTabs = [
    { key: "school", label: "School", icon: BookOpen },
    { key: "eec", label: "Practice", icon: GraduationCap },
    { key: "tryout", label: "Tryout", icon: Gamepad2 },
    { key: "lab", label: "Lab", icon: FlaskConical },
    { key: "flashcard", label: "FlashCard", icon: Layers },
  ];

  const moodOptions = ["Happy", "Neutral", "Curious", "Challenged", "Excited"];
  const moodEmojis = { Happy: "\u{1F60A}", Neutral: "\u{1F610}", Curious: "\u{1F914}", Challenged: "\u{1F4AA}", Excited: "\u{1F389}" };

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <div className="w-full min-h-screen bg-slate-50 px-3 sm:px-6 md:px-8 py-5 space-y-5 overflow-x-hidden">

      {/* ─── Header ─── */}
      {assignmentType !== "journal" && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your assignments and submissions</p>
          </div>
          <PointsBadge />
        </div>
      )}

      {/* ─── Type Tabs ─── */}
      {assignmentType !== "journal" && (
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
          {typeTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setAssignmentType(t.key)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                assignmentType === t.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ═══════════════ JOURNAL (Notebook Style) ═══════════════ */}
      {assignmentType === "journal" && (
        <div
          data-tour-root
          className="relative mx-auto max-w-7xl rounded-2xl p-3 shadow-2xl sm:p-5 lg:p-6"
          style={{ background: "linear-gradient(135deg, #f3e8d7 0%, #e8dcc6 50%, #ddd0bb 100%)" }}
        >
          {/* Notebook Header */}
          <div className="mb-4 flex items-center justify-between sm:mb-5">
            <div className="text-center flex-1">
              <h1
                className="text-2xl font-bold sm:text-3xl lg:text-4xl"
                style={{ color: "#8B4513", fontFamily: "Georgia, serif" }}
              >
                My Learning Journal
              </h1>
              <div className="mx-auto mt-1.5 h-0.5 w-24 rounded sm:w-32" style={{ backgroundColor: "#D2691E" }} />
            </div>
            <div className="flex items-center gap-3">
              {tourDismissed && (
                <button
                  onClick={restartTour}
                  className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition hover:bg-amber-50"
                  style={{ borderColor: "#D2691E", color: "#8B4513" }}
                >
                  <Sparkles className="h-3 w-3" /> Tour
                </button>
              )}
              <span className="text-xs" style={{ color: "#8B7355" }}>{autosaveLabel}</span>
              <PointsBadge />
            </div>
          </div>

          {/* Notebook Body */}
          <div
            className="relative overflow-hidden rounded-lg border-[3px] shadow-inner"
            style={{
              backgroundColor: "#fefcf8",
              borderColor: "#8B7355",
              height: "calc(100vh - 200px)",
              minHeight: "520px",
              maxHeight: "820px",
            }}
          >
            {/* Spiral Binding */}
            <div
              className="absolute left-1/2 top-0 bottom-0 z-10 hidden w-7 -translate-x-1/2 lg:block"
              style={{ background: "linear-gradient(to right, #666 0%, #999 50%, #666 100%)" }}
            >
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 h-2.5 w-5 -translate-x-1/2 rounded-full border"
                  style={{ top: `${i * 5.2 + 2}%`, borderColor: "#555" }}
                />
              ))}
            </div>

            <div className="flex h-full flex-col lg:grid lg:grid-cols-2">
              {/* ─── Left Page: Timeline ─── */}
              <div
                data-tour="tour-timeline"
                className="flex flex-col border-b-2 p-4 lg:border-b-0 lg:border-r-2 lg:p-6"
                style={{ borderColor: "#8B7355" }}
              >
                <h2
                  className="mb-4 text-center text-lg font-bold underline sm:text-xl"
                  style={{ color: "#8B4513", fontFamily: "Georgia, serif" }}
                >
                  Timeline
                </h2>

                {/* New Entry */}
                <button
                  data-tour="tour-new-entry"
                  onClick={resetJournalForm}
                  className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-2 text-sm transition hover:bg-yellow-50"
                  style={{ borderColor: "#B8860B", color: "#8B4513" }}
                >
                  <Plus className="h-4 w-4" /> Add New Day
                </button>

                {/* Entries */}
                <div
                  className="flex-1 space-y-2.5 overflow-y-auto pr-1"
                  style={{ maxHeight: "calc(100% - 100px)" }}
                >
                  {journalLoading && (
                    <div className="py-8 text-center text-sm" style={{ color: "#8B7355" }}>Loading entries...</div>
                  )}

                  {!journalLoading && journalEntries.map((entry, index) => (
                    <div
                      key={entry.id}
                      onClick={() => loadEntry(entry)}
                      className="group cursor-pointer rounded-lg border p-3 transition-all"
                      style={{
                        backgroundColor: selectedEntryId === entry.id ? "#fef3c7" : "#fffbeb",
                        borderColor: selectedEntryId === entry.id ? "#f59e0b" : "#fde68a",
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                              style={{ backgroundColor: "#fbbf24", color: "#92400e" }}
                            >
                              {journalEntries.length - index}
                            </span>
                            <span className="font-semibold text-sm" style={{ color: "#8B4513" }}>
                              Day {journalEntries.length - index}
                            </span>
                          </div>
                          <div className="mt-1 pl-8 text-xs text-gray-500">
                            {new Date(entry.updatedAt || entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            {entry.mood && entry.mood !== "Neutral" && (
                              <span className="ml-2">{moodEmojis[entry.mood] || ""}</span>
                            )}
                          </div>
                          <div className="mt-1 pl-8 text-xs text-gray-400 line-clamp-1">
                            {entry.title || "Untitled"}
                          </div>
                        </div>
                        <button
                          onClick={(ev) => { ev.stopPropagation(); handleDeleteEntry(entry.id); }}
                          className="shrink-0 rounded p-1 text-red-400 opacity-0 transition hover:bg-red-100 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {!journalLoading && journalEntries.length === 0 && (
                    <div className="flex flex-col items-center py-10" style={{ color: "#8B7355" }}>
                      <PenLine className="mb-2 h-8 w-8" />
                      <p className="text-sm">No entries yet.</p>
                      <p className="mt-1 text-xs">Start by adding your first day!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ─── Right Page: Notes ─── */}
              <div className="flex flex-1 flex-col p-4 lg:p-6">
                <h2
                  className="mb-3 text-center text-lg font-bold underline sm:text-xl"
                  style={{ color: "#8B4513", fontFamily: "Georgia, serif" }}
                >
                  Notes
                </h2>

                {/* Date */}
                <div className="mb-3 text-center text-xs" style={{ color: "#8B7355" }}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </div>

                <div className="flex flex-1 flex-col space-y-3 overflow-hidden">
                  {/* Title */}
                  <input
                    data-tour="tour-title"
                    type="text"
                    value={journalTitle}
                    onChange={(e) => setJournalTitle(e.target.value)}
                    placeholder="Today I learned..."
                    className="w-full border-0 border-b bg-transparent px-0 py-1.5 text-base placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-lg"
                    style={{ borderBottomColor: "#B8860B", color: "#8B4513", fontFamily: "Georgia, serif" }}
                  />

                  {/* Content - Lined paper */}
                  <div data-tour="tour-content" className="min-h-0 flex-1">
                    <textarea
                      value={journalContent.replace(/<[^>]*>/g, "")}
                      onChange={(e) => setJournalContent(e.target.value)}
                      placeholder="Write about what you learned today..."
                      className="h-full w-full resize-none border-0 bg-transparent p-0 text-sm placeholder-gray-400 focus:outline-none focus:ring-0"
                      style={{
                        color: "#4B5563",
                        fontFamily: "Georgia, serif",
                        backgroundImage: "repeating-linear-gradient(transparent, transparent 23px, #e5e7eb 23px, #e5e7eb 24px)",
                        lineHeight: "24px",
                      }}
                    />
                  </div>

                  {/* Tags and Mood */}
                  <div data-tour="tour-mood-tags" className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium" style={{ color: "#8B7355" }}>Tags</label>
                      <input
                        type="text"
                        value={journalTags}
                        onChange={(e) => setJournalTags(e.target.value)}
                        placeholder="learning, reflection"
                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                        style={{ backgroundColor: "#fffbeb" }}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium" style={{ color: "#8B7355" }}>Mood</label>
                      <div className="flex gap-1">
                        {moodOptions.map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setJournalMood(m)}
                            className={`flex-1 rounded border px-1 py-1.5 text-center transition ${
                              journalMood === m
                                ? "border-amber-400 bg-amber-50 shadow-sm"
                                : "border-gray-200 hover:bg-yellow-50"
                            }`}
                            style={{ backgroundColor: journalMood === m ? "#fef3c7" : "#fffbeb" }}
                            title={m}
                          >
                            <span className="text-sm">{moodEmojis[m]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Save */}
                  <div data-tour="tour-save" className="flex shrink-0 items-center justify-end gap-3 pt-2">
                    <span className="text-xs text-gray-500">{autosaveLabel}</span>
                    <button
                      onClick={handleSaveDraft}
                      className="rounded-lg px-5 py-2 text-sm font-medium text-white shadow-lg transition hover:brightness-110"
                      style={{ backgroundColor: "#D97706" }}
                    >
                      Save Entry
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notebook Bottom Edge */}
            <div
              className="absolute bottom-0 left-0 right-0 h-3"
              style={{ background: "linear-gradient(to right, #d4d4d4, #b0b0b0, #d4d4d4)" }}
            />
          </div>

          {/* Paper Texture Overlay */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.02'%3E%3Cpath d='m20 20v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* ═══════════════ TOUR OVERLAY ═══════════════ */}
          {tourStep >= 0 && tourStep < TOUR_STEPS.length && (() => {
            const step = TOUR_STEPS[tourStep];
            const isCentered = step.position === "center";
            const targetEl = !isCentered ? document.querySelector(`[data-tour="${step.target}"]`) : null;
            const rect = targetEl?.getBoundingClientRect();
            const parentRect = targetEl?.closest("[data-tour-root]")?.getBoundingClientRect();

            // Relative position within the notebook container
            const relTop = rect && parentRect ? rect.top - parentRect.top : 0;
            const relLeft = rect && parentRect ? rect.left - parentRect.left : 0;

            return (
              <div className="absolute inset-0 z-50 rounded-2xl overflow-hidden">
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
                  onClick={tourSkip}
                />

                {/* Spotlight highlight on target element */}
                {targetEl && rect && parentRect && (
                  <div
                    className="absolute rounded-lg ring-4 ring-amber-400/60 shadow-lg shadow-amber-300/30"
                    style={{
                      top: relTop - 4,
                      left: relLeft - 4,
                      width: rect.width + 8,
                      height: rect.height + 8,
                      backgroundColor: "rgba(255,255,255,0.15)",
                      pointerEvents: "none",
                    }}
                  />
                )}

                {/* Tooltip Card */}
                <div
                  className={`absolute flex flex-col rounded-xl border border-amber-200 bg-white p-5 shadow-2xl ${
                    isCentered ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" : ""
                  }`}
                  style={{
                    width: "min(340px, 85vw)",
                    zIndex: 60,
                    ...(!isCentered && rect && parentRect
                      ? {
                          top: step.position === "top"
                            ? Math.max(10, relTop - 180)
                            : Math.min(Math.max(10, relTop + 10), parentRect.height - 220),
                          left: Math.max(10, Math.min(
                            step.position === "right"
                              ? relLeft + rect.width + 16
                              : step.position === "left"
                              ? relLeft - 356
                              : relLeft,
                            parentRect.width - 360
                          )),
                        }
                      : {}),
                  }}
                >
                  {/* Close button */}
                  <button
                    onClick={tourSkip}
                    className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Emoji + Title */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{step.emoji}</span>
                    <h3 className="text-base font-bold text-gray-900 pr-6">{step.title}</h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {step.description}
                  </p>

                  {/* Progress dots + navigation */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {TOUR_STEPS.map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 rounded-full transition-all ${
                            i === tourStep ? "w-5 bg-amber-500" : i < tourStep ? "w-2 bg-amber-300" : "w-2 bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {tourStep > 0 && (
                        <button
                          onClick={tourPrev}
                          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
                        >
                          <ChevronLeft className="h-3 w-3" /> Back
                        </button>
                      )}
                      {tourStep < TOUR_STEPS.length - 1 ? (
                        <button
                          onClick={tourNext}
                          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow transition hover:brightness-110"
                          style={{ backgroundColor: "#D97706" }}
                        >
                          Next <ChevronRight className="h-3 w-3" />
                        </button>
                      ) : (
                        <button
                          onClick={tourFinish}
                          className="flex items-center gap-1 rounded-lg px-4 py-1.5 text-xs font-medium text-white shadow transition hover:brightness-110"
                          style={{ backgroundColor: "#16a34a" }}
                        >
                          Start Writing!
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Step counter */}
                  <div className="mt-2 text-center text-[10px] text-gray-400">
                    {tourStep + 1} of {TOUR_STEPS.length}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ═══════════════ ASSIGNMENT (School, EEC, Lab, Flashcard) ═══════════════ */}
      {["school", "eec", "lab", "flashcard"].includes(assignmentType) && (
        <Assignment assignmentType={assignmentType} filter={filter} setFilter={setFilter} />
      )}

      {/* ═══════════════ TRYOUT ═══════════════ */}
      {assignmentType === "tryout" && <Tryout />}
    </div>
  );
};

export default AssignmentView;
