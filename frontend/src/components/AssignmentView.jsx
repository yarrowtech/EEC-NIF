import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  Plus, Trash2, BookOpen, FlaskConical, Layers, PenLine, GraduationCap,
  Gamepad2, ChevronRight, ChevronLeft, X, Sparkles, Save, Clock,
} from "lucide-react";
import PointsBadge from "./PointsBadge";
import Assignment from "./Assignment";
import Tryout from "./Tryout";

/* ═══════════════ TOUR STEPS CONFIG ═══════════════ */
const TOUR_STEPS = [
  { target: "tour-welcome", title: "Welcome to Your Learning Journal!", description: "This is your personal space to record what you learn every day. Let\u2019s take a quick tour!", emoji: "\u{1F4D6}", position: "center" },
  { target: "tour-timeline", title: "Your Pages", description: "All your journal entries appear here as pages. Click any page to revisit it.", emoji: "\u{1F4C5}", position: "right" },
  { target: "tour-new-entry", title: "Start a New Page", description: "Click \u201CNew Page\u201D to begin a fresh journal entry for today.", emoji: "\u2795", position: "right" },
  { target: "tour-title", title: "Give It a Title", description: "Write a short title \u2014 like \u201CDiscovered photosynthesis\u201D or \u201CMath breakthrough!\u201D", emoji: "\u270F\uFE0F", position: "left" },
  { target: "tour-content", title: "Write Your Notes", description: "This is your lined paper. Describe what you learned, questions you have, or anything interesting.", emoji: "\u{1F4DD}", position: "left" },
  { target: "tour-mood-tags", title: "Mood & Tags", description: "Add tags to organize entries and pick an emoji that matches how you felt.", emoji: "\u{1F3F7}\uFE0F", position: "top" },
  { target: "tour-save", title: "Auto-Save & Manual Save", description: "Your journal auto-saves as you type! You can also click Save anytime.", emoji: "\u{1F4BE}", position: "top" },
  { target: "tour-done", title: "You\u2019re All Set!", description: "Start writing your first entry now. Happy writing!", emoji: "\u{1F389}", position: "center" },
];
const TOUR_STORAGE_KEY = "journal_tour_completed";

const AssignmentView = ({ defaultType = "school" }) => {
  const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
  const [filter, setFilter] = useState("all");
  const [assignmentType, setAssignmentType] = useState(defaultType);

  /* Journal state */
  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [journalTags, setJournalTags] = useState("");
  const [journalMood, setJournalMood] = useState("Neutral");
  const [journalEntries, setJournalEntries] = useState([]);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [autosaveLabel, setAutosaveLabel] = useState("Saved");
  const [journalLoading, setJournalLoading] = useState(false);
  const skipAutosaveRef = useRef(false);
  const [showMobileIndex, setShowMobileIndex] = useState(false);

  /* Tour state */
  const [tourStep, setTourStep] = useState(-1);
  const [tourDismissed, setTourDismissed] = useState(() => {
    try { return localStorage.getItem(TOUR_STORAGE_KEY) === "true"; } catch { return false; }
  });

  useEffect(() => { setAssignmentType(defaultType); }, [defaultType]);
  useEffect(() => { if (assignmentType === "journal") loadJournalEntries(); }, [assignmentType]);
  useEffect(() => {
    if (assignmentType === "journal" && !tourDismissed && tourStep === -1) {
      const t = setTimeout(() => setTourStep(0), 600);
      return () => clearTimeout(t);
    }
  }, [assignmentType, tourDismissed]);

  /* Tour helpers */
  const tourNext = useCallback(() => setTourStep((s) => Math.min(s + 1, TOUR_STEPS.length - 1)), []);
  const tourPrev = useCallback(() => setTourStep((s) => Math.max(s - 1, 0)), []);
  const tourFinish = useCallback(() => { setTourStep(-1); setTourDismissed(true); try { localStorage.setItem(TOUR_STORAGE_KEY, "true"); } catch {} }, []);
  const tourSkip = tourFinish;
  const restartTour = useCallback(() => { setTourDismissed(false); setTourStep(0); try { localStorage.removeItem(TOUR_STORAGE_KEY); } catch {} }, []);

  /* Auth */
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  };

  /* Journal CRUD */
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
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.error || "Unable to load"); }
      const payload = await res.json();
      setJournalEntries((Array.isArray(payload?.entries) ? payload.entries : []).map(normalizeEntry));
      setAutosaveLabel("Saved");
    } catch (err) {
      console.error("Journal load error:", err);
      setAutosaveLabel("Not saved");
    } finally { setJournalLoading(false); }
  };

  const resetJournalForm = () => { setSelectedEntryId(null); setJournalTitle(""); setJournalContent(""); setJournalTags(""); setJournalMood("Neutral"); };

  const handleSaveDraft = async () => {
    const headers = getAuthHeaders();
    if (!headers) { setAutosaveLabel("Login required"); return; }
    if (!journalTitle.trim() && !journalContent.trim()) return;
    setAutosaveLabel("Saving\u2026");
    const payload = { title: journalTitle.trim() || "Untitled", content: journalContent, tags: (journalTags || "").split(",").map((t) => t.trim()).filter(Boolean), mood: journalMood };
    try {
      if (selectedEntryId) {
        const res = await fetch(`${API_BASE}/api/student/auth/journal/${selectedEntryId}`, { method: "PUT", headers, body: JSON.stringify(payload) });
        if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.error || "Unable to update"); }
        const data = await res.json();
        const entry = normalizeEntry(data?.entry || data);
        setJournalEntries((prev) => prev.map((e) => (e.id === selectedEntryId ? entry : e)));
      } else {
        const res = await fetch(`${API_BASE}/api/student/auth/journal`, { method: "POST", headers, body: JSON.stringify(payload) });
        if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.error || "Unable to create"); }
        const data = await res.json();
        const entry = normalizeEntry(data?.entry || data);
        setJournalEntries((prev) => [entry, ...prev]);
        setSelectedEntryId(entry.id);
      }
      setAutosaveLabel("Saved");
    } catch (err) { console.error("Journal save error:", err); setAutosaveLabel("Not saved"); }
  };

  const handleDeleteEntry = async (id) => {
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      const res = await fetch(`${API_BASE}/api/student/auth/journal/${id}`, { method: "DELETE", headers });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.error || "Unable to delete"); }
      setJournalEntries((prev) => prev.filter((e) => e.id !== id));
      if (selectedEntryId === id) resetJournalForm();
    } catch (err) { console.error("Journal delete error:", err); }
  };

  const loadEntry = (entry) => {
    skipAutosaveRef.current = true;
    setSelectedEntryId(entry.id);
    setJournalTitle(entry.title || "");
    setJournalContent(entry.content || "");
    setJournalTags((entry.tags || []).join(", "));
    setJournalMood(entry.mood || "Neutral");
    setShowMobileIndex(false);
  };

  /* Autosave debounce */
  useEffect(() => {
    if (assignmentType !== "journal") return;
    if (skipAutosaveRef.current) { skipAutosaveRef.current = false; return; }
    if (!journalTitle.trim() && !journalContent.trim()) { setAutosaveLabel("Saved"); return; }
    setAutosaveLabel("Saving\u2026");
    const t = setTimeout(() => handleSaveDraft(), 1200);
    return () => clearTimeout(t);
  }, [journalTitle, journalContent, journalTags, journalMood, assignmentType]);

  /* Type tabs */
  const typeTabs = [
    { key: "school", label: "School", icon: BookOpen },
    { key: "eec", label: "Practice", icon: GraduationCap },
    { key: "tryout", label: "Tryout", icon: Gamepad2 },
    { key: "lab", label: "Lab", icon: FlaskConical },
    { key: "flashcard", label: "FlashCard", icon: Layers },
  ];

  const moodOptions = ["Happy", "Neutral", "Curious", "Challenged", "Excited"];
  const moodEmojis = { Happy: "\u{1F60A}", Neutral: "\u{1F610}", Curious: "\u{1F914}", Challenged: "\u{1F4AA}", Excited: "\u{1F389}" };

  const entriesWithIndex = useMemo(() => {
    const counts = {};
    journalEntries.forEach((e) => {
      const d = new Date(e.updatedAt || e.createdAt);
      const k = Number.isNaN(d.getTime()) ? "unknown" : d.toISOString().slice(0, 10);
      counts[k] = (counts[k] || 0) + 1;
    });
    const indices = {};
    return journalEntries.map((e) => {
      const d = new Date(e.updatedAt || e.createdAt);
      const ok = !Number.isNaN(d.getTime());
      const k = ok ? d.toISOString().slice(0, 10) : "unknown";
      const label = ok ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Unknown";
      const idx = (indices[k] = (indices[k] || 0) + 1);
      return { ...e, _dateLabel: label, _dateIndex: idx, _dateTotal: counts[k] || 1 };
    });
  }, [journalEntries]);

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <div className="w-full min-h-screen bg-slate-50 px-3 sm:px-6 md:px-8 py-5 space-y-5 overflow-x-hidden">

      {/* Header (non-journal) */}
      {assignmentType !== "journal" && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your assignments and submissions</p>
          </div>
          <PointsBadge />
        </div>
      )}

      {/* Type Tabs (non-journal) */}
      {assignmentType !== "journal" && (
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
          {typeTabs.map((t) => (
            <button key={t.key} onClick={() => setAssignmentType(t.key)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                assignmentType === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ═══════════════ JOURNAL - REAL NOTEBOOK ═══════════════ */}
      {assignmentType === "journal" && (
        <div data-tour-root className="relative mx-auto max-w-7xl">

          {/* ── Notebook Cover ── */}
          <div className="rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #5c3d2e 0%, #4a2f20 40%, #3d2518 100%)",
              boxShadow: "0 25px 60px -12px rgba(60,30,15,0.5), 0 0 0 1px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}>

            {/* Cover texture overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-20"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.15'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E\")" }} />

            {/* ── Notebook Top Bar (Cover) ── */}
            <div className="relative px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-600/30 backdrop-blur-sm border border-amber-500/30">
                  <BookOpen className="h-4.5 w-4.5 text-amber-300" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-amber-100" style={{ fontFamily: "'Georgia', serif" }}>
                    My Learning Journal
                  </h1>
                  <p className="text-[11px] text-amber-300/60">Personal Notebook</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {tourDismissed && (
                  <button onClick={restartTour}
                    className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-600/20 px-2.5 py-1 text-[11px] font-medium text-amber-300 hover:bg-amber-600/30 transition">
                    <Sparkles className="h-3 w-3" /> Tour
                  </button>
                )}
                <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  autosaveLabel === "Saved" ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                    : autosaveLabel.includes("Saving") ? "bg-amber-600/20 text-amber-300 border border-amber-500/30"
                    : "bg-rose-600/20 text-rose-300 border border-rose-500/30"
                }`}>
                  {autosaveLabel === "Saved" ? <Save className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {autosaveLabel}
                </div>
                <PointsBadge />
              </div>
            </div>

            {/* ── Notebook Inner Pages ── */}
            <div className="relative h-auto min-h-[400px] sm:min-h-[520px] lg:h-[calc(100vh-180px)] lg:max-h-[860px]"
              style={{ background: "#faf6ef" }}>

              {/* Spine shadow */}
              <div className="absolute left-0 top-0 bottom-0 w-3 z-10 pointer-events-none hidden lg:block"
                style={{ background: "linear-gradient(to right, rgba(0,0,0,0.08), transparent)" }} />
              <div className="absolute right-0 top-0 bottom-0 w-2 z-10 pointer-events-none hidden lg:block"
                style={{ background: "linear-gradient(to left, rgba(0,0,0,0.04), transparent)" }} />

              {/* Center binding line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px z-10 hidden lg:block"
                style={{ background: "rgba(0,0,0,0.06)" }} />

              <div className="flex h-full flex-col lg:grid lg:grid-cols-[340px_1fr]">

                {/* ─── Left: Page Index (like a notebook index page) ─── */}
                <div data-tour="tour-timeline"
                  className="flex flex-col border-b lg:border-b-0 lg:border-r"
                  style={{ borderColor: "rgba(0,0,0,0.08)", background: "#f7f2e8" }}>

                  {/* Mobile toggle bar */}
                  <button className="lg:hidden flex items-center justify-between w-full px-4 py-3"
                    onClick={() => setShowMobileIndex(prev => !prev)}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" style={{ color: "#6b4c3b" }} />
                      <span className="text-sm font-bold" style={{ color: "#6b4c3b", fontFamily: "'Georgia', serif" }}>
                        Index
                      </span>
                      {journalEntries.length > 0 && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "#e8dcc8", color: "#6b4c3b" }}>
                          {journalEntries.length}
                        </span>
                      )}
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${showMobileIndex ? 'rotate-90' : ''}`} style={{ color: "#a08060" }} />
                  </button>

                  {/* Index content — collapsible on mobile, always visible on lg */}
                  <div className={`${showMobileIndex ? 'flex' : 'hidden'} lg:flex flex-col flex-1 p-4 lg:p-5`}>

                  {/* Index header (desktop only, mobile has toggle bar) */}
                  <div className="mb-4 text-center hidden lg:block">
                    <h2 className="text-base font-bold tracking-wide uppercase" style={{ color: "#6b4c3b", fontFamily: "'Georgia', serif", letterSpacing: "0.15em" }}>
                      Index
                    </h2>
                    <div className="mx-auto mt-1 h-px w-16" style={{ background: "#c9a96e" }} />
                  </div>

                  {/* New Page button */}
                  <button data-tour="tour-new-entry" onClick={() => { resetJournalForm(); setShowMobileIndex(false); }}
                    className="group mb-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-2.5 text-sm font-semibold transition hover:shadow-sm"
                    style={{ borderColor: "#c9a96e", color: "#6b4c3b", background: "rgba(201,169,110,0.06)" }}>
                    <Plus className="h-4 w-4 transition group-hover:rotate-90" /> New Page
                  </button>

                  {/* Entry list */}
                  <div className="flex-1 space-y-1.5 overflow-y-auto pr-1 max-h-[280px] sm:max-h-[360px] lg:max-h-none custom-scrollbar">
                    {journalLoading && (
                      <div className="flex items-center justify-center py-12" style={{ color: "#a08060" }}>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-700/30 border-t-amber-700" />
                        <span className="ml-2 text-sm">Loading...</span>
                      </div>
                    )}

                    {!journalLoading && entriesWithIndex.map((entry) => {
                      const isSelected = selectedEntryId === entry.id;
                      return (
                        <div key={entry.id} onClick={() => loadEntry(entry)}
                          className="group relative cursor-pointer rounded-lg px-3 py-2.5 transition-all"
                          style={{
                            background: isSelected ? "#fef3c7" : "transparent",
                            borderLeft: isSelected ? "3px solid #d97706" : "3px solid transparent",
                          }}>
                          {/* Page number tab */}
                          <div className="flex items-start gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                              style={{
                                background: isSelected ? "#d97706" : "#e8dcc8",
                                color: isSelected ? "#fff" : "#6b4c3b",
                              }}>
                              {entry._dateIndex}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold truncate" style={{ color: "#4a3425" }}>
                                {entry.title || "Untitled"}
                              </p>
                              <p className="text-[11px] mt-0.5" style={{ color: "#a08060" }}>
                                {entry._dateLabel}
                                {entry.mood && entry.mood !== "Neutral" && (
                                  <span className="ml-1.5">{moodEmojis[entry.mood] || ""}</span>
                                )}
                              </p>
                              {entry.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {entry.tags.slice(0, 3).map((tag) => (
                                    <span key={tag} className="rounded px-1.5 py-0.5 text-[9px] font-medium"
                                      style={{ background: "#e8dcc8", color: "#6b4c3b" }}>
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button onClick={(ev) => { ev.stopPropagation(); handleDeleteEntry(entry.id); }}
                              className="shrink-0 rounded p-1 text-red-400 transition hover:bg-red-50">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {!journalLoading && journalEntries.length === 0 && (
                      <div className="flex flex-col items-center py-12" style={{ color: "#a08060" }}>
                        <PenLine className="mb-2 h-8 w-8 opacity-50" />
                        <p className="text-sm font-medium">No pages yet</p>
                        <p className="mt-1 text-xs opacity-70">Start by adding your first page!</p>
                      </div>
                    )}
                  </div>

                  {/* Page count */}
                  {journalEntries.length > 0 && (
                    <div className="mt-3 text-center text-[10px] font-medium" style={{ color: "#a08060" }}>
                      {journalEntries.length} page{journalEntries.length !== 1 ? "s" : ""}
                    </div>
                  )}
                  </div>{/* end collapsible wrapper */}
                </div>

                {/* ─── Right: Writing Page (realistic notebook paper) ─── */}
                <div className="flex flex-1 flex-col relative overflow-hidden" style={{ background: "#fefcf8" }}>

                  {/* Red margin line */}
                  <div className="absolute top-0 bottom-0 w-px z-5 pointer-events-none"
                    style={{ left: "48px", background: "rgba(220,80,80,0.25)" }} />

                  {/* Top punched holes */}
                  <div className="absolute top-0 left-0 right-0 h-8 z-5 pointer-events-none hidden lg:flex items-center justify-center gap-20">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-3 w-3 rounded-full border" style={{ background: "#f0ebe0", borderColor: "#ccc4b5" }} />
                    ))}
                  </div>

                  <div className="flex flex-1 flex-col p-4 sm:p-5 lg:pl-16 lg:pr-6 lg:pt-10">

                    {/* Date header */}
                    <div className="mb-3 flex items-center gap-3">
                      <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#a08060" }}>
                        {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      </div>
                    </div>

                    {/* Title */}
                    <input
                      data-tour="tour-title"
                      type="text"
                      value={journalTitle}
                      onChange={(e) => setJournalTitle(e.target.value)}
                      placeholder="Title this page..."
                      className="w-full border-0 border-b-2 bg-transparent px-0 py-2 text-xl font-bold placeholder-gray-300 focus:outline-none focus:ring-0"
                      style={{
                        borderBottomColor: "#c9a96e",
                        color: "#3d2518",
                        fontFamily: "'Georgia', serif",
                      }}
                    />

                    {/* Content - Lined notebook paper */}
                    <div data-tour="tour-content" className="min-h-0 flex-1 mt-2">
                      <textarea
                        value={journalContent.replace(/<[^>]*>/g, "")}
                        onChange={(e) => setJournalContent(e.target.value)}
                        placeholder="Write about what you learned today..."
                        className="h-full min-h-[220px] sm:min-h-[280px] w-full resize-none border-0 bg-transparent p-0 placeholder-gray-300 focus:outline-none focus:ring-0"
                        style={{
                          color: "#374151",
                          fontFamily: "'Georgia', serif",
                          fontSize: "15px",
                          backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #d6cfc4 27px, #d6cfc4 28px)",
                          lineHeight: "28px",
                          backgroundPosition: "0 -1px",
                        }}
                      />
                    </div>

                    {/* Bottom area: Tags + Mood + Save */}
                    <div className="shrink-0 mt-3 space-y-3 border-t pt-3" style={{ borderColor: "#e8dcc8" }}>

                      {/* Tags & Mood row */}
                      <div data-tour="tour-mood-tags" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#a08060" }}>Tags</label>
                          <input
                            type="text"
                            value={journalTags}
                            onChange={(e) => setJournalTags(e.target.value)}
                            placeholder="e.g. science, math, reflection"
                            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:ring-amber-400 focus:border-amber-400 transition"
                            style={{ background: "#faf6ef", borderColor: "#e0d5c0", color: "#4a3425" }}
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#a08060" }}>Mood</label>
                          <div className="flex gap-1.5">
                            {moodOptions.map((m) => (
                              <button key={m} type="button" onClick={() => setJournalMood(m)}
                                className={`flex-1 rounded-lg border py-2 text-center transition ${
                                  journalMood === m ? "shadow-sm" : "hover:shadow-sm"
                                }`}
                                style={{
                                  background: journalMood === m ? "#fef3c7" : "#faf6ef",
                                  borderColor: journalMood === m ? "#d97706" : "#e0d5c0",
                                }}
                                title={m}>
                                <span className="text-base">{moodEmojis[m]}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Save button */}
                      <div data-tour="tour-save" className="flex items-center justify-end gap-3">
                        <button onClick={handleSaveDraft}
                          className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg active:scale-[0.98]"
                          style={{ background: "linear-gradient(135deg, #92400e 0%, #78350f 100%)" }}>
                          <Save className="h-4 w-4" /> Save Entry
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Page curl effect (bottom right) */}
                  <div className="absolute bottom-0 right-0 w-12 h-12 pointer-events-none hidden lg:block"
                    style={{
                      background: "linear-gradient(315deg, #e8dcc8 0%, #e8dcc8 50%, transparent 50%)",
                      borderTopLeftRadius: "8px",
                    }} />
                </div>
              </div>
            </div>

            {/* ── Notebook Bottom Edge ── */}
            <div className="h-2 relative" style={{ background: "linear-gradient(145deg, #4a2f20, #3d2518)" }}>
              <div className="absolute inset-x-4 top-0 h-px bg-white/5" />
            </div>
          </div>

          {/* ═══════════════ TOUR OVERLAY ═══════════════ */}
          {tourStep >= 0 && tourStep < TOUR_STEPS.length && (() => {
            const step = TOUR_STEPS[tourStep];
            const isCentered = step.position === "center";
            const targetEl = !isCentered ? document.querySelector(`[data-tour="${step.target}"]`) : null;
            const rect = targetEl?.getBoundingClientRect();
            const parentRect = targetEl?.closest("[data-tour-root]")?.getBoundingClientRect();
            const relTop = rect && parentRect ? rect.top - parentRect.top : 0;
            const relLeft = rect && parentRect ? rect.left - parentRect.left : 0;

            return (
              <div className="absolute inset-0 z-50 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={tourSkip} />
                {targetEl && rect && parentRect && (
                  <div className="absolute rounded-lg ring-4 ring-amber-400/60 shadow-lg shadow-amber-300/30"
                    style={{ top: relTop - 4, left: relLeft - 4, width: rect.width + 8, height: rect.height + 8, backgroundColor: "rgba(255,255,255,0.15)", pointerEvents: "none" }} />
                )}
                <div className={`absolute flex flex-col rounded-xl border border-amber-200 bg-white p-5 shadow-2xl ${isCentered ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" : ""}`}
                  style={{
                    width: "min(340px, 85vw)", zIndex: 60,
                    ...(!isCentered && rect && parentRect ? {
                      top: step.position === "top" ? Math.max(10, relTop - 180) : Math.min(Math.max(10, relTop + 10), parentRect.height - 220),
                      left: Math.max(10, Math.min(step.position === "right" ? relLeft + rect.width + 16 : step.position === "left" ? relLeft - 356 : relLeft, parentRect.width - 360)),
                    } : {}),
                  }}>
                  <button onClick={tourSkip} className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                    <X className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{step.emoji}</span>
                    <h3 className="text-base font-bold text-gray-900 pr-6">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{step.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {TOUR_STEPS.map((_, i) => (
                        <div key={i} className={`h-2 rounded-full transition-all ${i === tourStep ? "w-5 bg-amber-500" : i < tourStep ? "w-2 bg-amber-300" : "w-2 bg-gray-200"}`} />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      {tourStep > 0 && (
                        <button onClick={tourPrev} className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                          <ChevronLeft className="h-3 w-3" /> Back
                        </button>
                      )}
                      {tourStep < TOUR_STEPS.length - 1 ? (
                        <button onClick={tourNext} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow transition hover:brightness-110"
                          style={{ backgroundColor: "#D97706" }}>
                          Next <ChevronRight className="h-3 w-3" />
                        </button>
                      ) : (
                        <button onClick={tourFinish} className="flex items-center gap-1 rounded-lg px-4 py-1.5 text-xs font-medium text-white shadow transition hover:brightness-110"
                          style={{ backgroundColor: "#16a34a" }}>
                          Start Writing!
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-center text-[10px] text-gray-400">{tourStep + 1} of {TOUR_STEPS.length}</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Assignment types */}
      {["school", "eec", "lab", "flashcard"].includes(assignmentType) && (
        <Assignment assignmentType={assignmentType} filter={filter} setFilter={setFilter} />
      )}
      {assignmentType === "tryout" && <Tryout />}
    </div>
  );
};

export default AssignmentView;
