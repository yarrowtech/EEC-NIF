import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { Calendar, Clock, MapPin, BookOpen, AlertCircle, Users, School, RefreshCw, Download } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_LOOKUP = DAYS.reduce((acc, day) => {
  acc[day.toLowerCase()] = day;
  return acc;
}, {});

const to12Hour = (value) => {
  if (!value) return '';
  const [hh, mm] = String(value).split(':');
  const hours = Number(hh);
  if (Number.isNaN(hours)) return value;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${mm || '00'} ${suffix}`;
};

const formatSlot = (entry) => {
  if (entry.startTime && entry.endTime) {
    return `${to12Hour(entry.startTime)} - ${to12Hour(entry.endTime)}`;
  }
  if (entry.startTime) return to12Hour(entry.startTime);
  return entry.period ? `Period ${entry.period}` : 'TBD';
};

const normalizeDayLabel = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  return DAY_LOOKUP[normalized] || null;
};

const normalizeSchedule = (rawSchedule) => {
  const base = DAYS.reduce((acc, day) => {
    acc[day] = [];
    return acc;
  }, {});

  if (!rawSchedule || typeof rawSchedule !== 'object') {
    return base;
  }

  Object.entries(rawSchedule).forEach(([day, entries]) => {
    const dayKey = normalizeDayLabel(day);
    if (!dayKey) return;
    base[dayKey] = Array.isArray(entries) ? entries : [];
  });

  return base;
};

const normalizeValue = (value) => String(value || '').trim().toLowerCase();

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [value];
};

const getCredentialValues = (teacherProfile, keys) =>
  keys
    .flatMap((key) => toArray(teacherProfile?.[key]))
    .filter(Boolean)
    .map((value) => normalizeValue(value));

const getCredentialDisplayValues = (teacherProfile, keys) =>
  Array.from(
    new Set(
      keys
        .flatMap((key) => toArray(teacherProfile?.[key]))
        .filter(Boolean)
        .map((value) => String(value).trim())
    )
  );

const getEntryValues = (entry, keys) =>
  keys
    .map((key) => entry?.[key])
    .filter(Boolean)
    .flatMap((value) => toArray(value))
    .map((value) => normalizeValue(value));

const matchesCredential = (entryValues, credentialValues) => {
  if (!credentialValues.length) return true;
  if (!entryValues.length) return true;
  return entryValues.some((entryValue) =>
    credentialValues.some(
      (credentialValue) =>
        entryValue === credentialValue ||
        entryValue.includes(credentialValue) ||
        credentialValue.includes(entryValue)
    )
  );
};

const toScopeLabel = (scope) => {
  if (scope === 'campus') return 'Campus matched';
  if (scope === 'school-fallback') return 'School fallback';
  if (scope === 'dashboard-fallback') return 'Dashboard fallback';
  return 'School matched';
};

const CLASS_COLORS = [
  { border: 'border-l-blue-500', bg: 'bg-blue-50/80', text: 'text-blue-600' },
  { border: 'border-l-violet-500', bg: 'bg-violet-50/80', text: 'text-violet-600' },
  { border: 'border-l-emerald-500', bg: 'bg-emerald-50/80', text: 'text-emerald-600' },
  { border: 'border-l-amber-500', bg: 'bg-amber-50/80', text: 'text-amber-600' },
  { border: 'border-l-rose-500', bg: 'bg-rose-50/80', text: 'text-rose-600' },
  { border: 'border-l-teal-500', bg: 'bg-teal-50/80', text: 'text-teal-600' },
];

const ClassRoutine = () => {
  const [schedule, setSchedule] = useState({});
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [routineMeta, setRoutineMeta] = useState({ campusScoped: true, timetableCount: 0, filterSource: 'campus' });
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [viewMode] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRoutine = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');
      if (!token || (userType !== 'Teacher' && userType !== 'teacher')) {
        setError('Only teachers can view this routine.');
        return;
      }

      const routineResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/teacher/dashboard/routine`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (routineResponse.ok) {
        const data = await routineResponse.json().catch(() => ({}));
        setSchedule(normalizeSchedule(data.schedule));
        setRoutineMeta({
          campusScoped: Boolean(data?.meta?.campusScoped),
          timetableCount: Number(data?.meta?.timetableCount || 0),
          filterSource: data?.meta?.filterSource || (data?.meta?.campusScoped ? 'campus' : 'school'),
        });
        if (data.teacher) {
          setTeacherProfile(data.teacher);
        }
      } else {
        const dashboardResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/teacher/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!dashboardResponse.ok) {
          const data = await dashboardResponse.json().catch(() => ({}));
          throw new Error(data.error || 'Unable to load teacher routine.');
        }

        const dashboardData = await dashboardResponse.json().catch(() => ({}));
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const fallbackSchedule = normalizeSchedule({
          [today]: (dashboardData?.upcomingClasses || []).map((item, index) => ({
            subject: item.subject || 'Subject',
            className: item.class || '',
            sectionName: '',
            classLabel: item.class || '',
            room: item.room || 'TBA',
            startTime: item.time || '',
            endTime: '',
            period: index + 1,
          })),
        });
        setSchedule(fallbackSchedule);
        setRoutineMeta({
          campusScoped: true,
          timetableCount: Number((dashboardData?.upcomingClasses || []).length > 0 ? 1 : 0),
          filterSource: 'dashboard-fallback',
        });
        setTeacherProfile(dashboardData?.teacher || null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load routine');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoutine();
  }, [loadRoutine]);

  const teacherClassValues = useMemo(
    () =>
      getCredentialValues(teacherProfile, [
        'className',
        'class',
        'grade',
        'standard',
        'assignedClass',
        'assignedClasses',
        'assignedClassLabels',
        'classes',
      ]),
    [teacherProfile]
  );
  const teacherClassLabels = useMemo(
    () =>
      getCredentialDisplayValues(teacherProfile, [
        'className',
        'class',
        'grade',
        'standard',
        'assignedClass',
        'assignedClasses',
        'assignedClassLabels',
        'classes',
      ]),
    [teacherProfile]
  );

  const teacherSectionValues = useMemo(
    () =>
      getCredentialValues(teacherProfile, [
        'sectionName',
        'section',
        'division',
        'assignedSection',
        'assignedSections',
        'sections',
      ]),
    [teacherProfile]
  );
  const teacherSectionLabels = useMemo(
    () =>
      getCredentialDisplayValues(teacherProfile, [
        'sectionName',
        'section',
        'division',
        'assignedSection',
        'assignedSections',
        'sections',
      ]),
    [teacherProfile]
  );

  const filteredSchedule = useMemo(
    () =>
      DAYS.reduce((acc, day) => {
        const entries = schedule[day] || [];
        acc[day] = entries.filter((entry) => {
          const entryClassValues = getEntryValues(entry, ['className', 'class', 'grade', 'standard', 'classLabel']);
          const entrySectionValues = getEntryValues(entry, ['sectionName', 'section', 'division', 'classLabel']);
          const classMatch = matchesCredential(entryClassValues, teacherClassValues);
          const sectionMatch = matchesCredential(entrySectionValues, teacherSectionValues);
          return classMatch && sectionMatch;
        });
        return acc;
      }, {}),
    [schedule, teacherClassValues, teacherSectionValues]
  );

  const filteredTotalClasses = useMemo(
    () => DAYS.reduce((sum, day) => sum + ((filteredSchedule[day] || []).length), 0),
    [filteredSchedule]
  );

  const effectiveSchedule = useMemo(() => {
    // If strict class/section filter removes everything, fallback to teacher-scoped schedule.
    if (filteredTotalClasses > 0) return filteredSchedule;
    return schedule;
  }, [filteredSchedule, schedule, filteredTotalClasses]);

  useEffect(() => {
    const firstAvailableDay = DAYS.find((day) => (effectiveSchedule[day] || []).length > 0);
    if (firstAvailableDay) {
      setSelectedDay(firstAvailableDay);
    }
  }, [effectiveSchedule]);

  const totalClasses = useMemo(
    () => DAYS.reduce((sum, day) => sum + ((effectiveSchedule[day] || []).length), 0),
    [effectiveSchedule]
  );
  const todayClasses = effectiveSchedule[selectedDay] || [];
  const weeklySlots = useMemo(() => {
    const slotMap = new Map();
    DAYS.forEach((day) => {
      (effectiveSchedule[day] || []).forEach((entry, index) => {
        const slot = formatSlot(entry) || `Period ${entry.period || index + 1}`;
        const order = Number(entry.period || 999);
        if (!slotMap.has(slot)) {
          slotMap.set(slot, { slot, order });
        } else if (order < slotMap.get(slot).order) {
          slotMap.set(slot, { slot, order });
        }
      });
    });
    return Array.from(slotMap.values()).sort((a, b) =>
      a.order === b.order ? a.slot.localeCompare(b.slot) : a.order - b.order
    );
  }, [effectiveSchedule]);
  const weeklyMatrix = useMemo(() => {
    const matrix = {};
    DAYS.forEach((day) => {
      matrix[day] = {};
      (effectiveSchedule[day] || []).forEach((entry, index) => {
        const slot = formatSlot(entry) || `Period ${entry.period || index + 1}`;
        matrix[day][slot] = entry;
      });
    });
    return matrix;
  }, [effectiveSchedule]);

  const downloadPDF = useCallback(() => {
    const generate = async () => {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const PW = 297, PH = 210, ML = 14, MR = 14;
      const UW = PW - ML - MR; // 269 mm usable width

      const schoolName    = teacherProfile?.schoolName || teacherProfile?.school?.name || teacherProfile?.campusName || 'School';
      const schoolAddress = teacherProfile?.schoolAddress || teacherProfile?.school?.address || teacherProfile?.campusAddress || teacherProfile?.address || '';
      const teacherName   = teacherProfile?.name || teacherProfile?.fullName || '';
      const subject       = teacherProfile?.subject || '';
      const logoUrl       = teacherProfile?.schoolLogo || '';

      // ── Load school logo as base64 ───────────────────────────────────────
      let logoDataUrl = null;
      if (logoUrl) {
        try {
          const resp = await fetch(logoUrl);
          const blob = await resp.blob();
          logoDataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload  = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch { /* skip logo if fetch fails */ }
      }

      const activeDays  = DAYS.filter(d => (effectiveSchedule[d] || []).length > 0);
      const displayDays = activeDays.length > 0 ? activeDays : DAYS.slice(0, 6);

      const TIME_W   = 30;
      const COL_W    = (UW - TIME_W) / displayDays.length;
      const HDR_H    = 9;
      const LOGO_SZ  = 22;   // logo size in mm
      const HEADER_H = logoDataUrl ? 38 : 30; // taller header when logo present
      const BRK_H    = 8;    // break row height

      const infoItems = [
        teacherName && `Teacher: ${teacherName}`,
        subject && `Subject: ${subject}`,
        teacherClassLabels.length > 0 && `Class: ${teacherClassLabels.join(', ')}`,
        teacherSectionLabels.length > 0 && `Section: ${teacherSectionLabels.join(', ')}`,
        teacherProfile?.campusName && `Campus: ${teacherProfile.campusName}`,
      ].filter(Boolean);
      const INFO_H = infoItems.length > 0 ? 10 : 0;

      // ── Break detection between consecutive time slots ───────────────────
      const timeToMins = (t) => {
        if (!t) return null;
        const m = t.trim().match(/^(\d+):(\d+)\s*(AM|PM)$/i);
        if (!m) return null;
        let h = parseInt(m[1]), mn = parseInt(m[2]);
        if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
        if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
        return h * 60 + mn;
      };

      const pdfRows = [];
      weeklySlots.forEach((slot, si) => {
        pdfRows.push({ slot: slot.slot, isBreak: false, si });
        if (si < weeklySlots.length - 1) {
          const parts     = slot.slot.split(' - ');
          const nextParts = weeklySlots[si + 1].slot.split(' - ');
          const endMins   = timeToMins(parts[1]?.trim());
          const nextMins  = timeToMins(nextParts[0]?.trim());
          if (endMins !== null && nextMins !== null && nextMins - endMins >= 10) {
            const dur = nextMins - endMins;
            pdfRows.push({
              slot: `${parts[1]?.trim()} - ${nextParts[0]?.trim()}`,
              isBreak: true,
              breakLabel: `Break  (${dur} min)`,
              si: -1,
            });
          }
        }
      });

      const breakCount = pdfRows.filter(r => r.isBreak).length;
      const dataCount  = pdfRows.filter(r => !r.isBreak).length;
      // Available height for data rows
      const availH = PH - HEADER_H - INFO_H - 5 - HDR_H - breakCount * BRK_H - 12;
      const ROW_H  = Math.min(20, Math.max(12, Math.floor(availH / Math.max(dataCount, 1))));

      const TABLE_W = TIME_W + displayDays.length * COL_W;
      const trunc   = (str, n) => { const s = String(str || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

      // ── HEADER BLOCK ──────────────────────────────────────────────────────
      doc.setFillColor(67, 56, 202);      // indigo-700
      doc.rect(0, 0, PW, HEADER_H, 'F');

      // School logo — left side, vertically centered in header (above accent strip)
      const logoAreaH = HEADER_H - 10; // exclude bottom accent strip
      if (logoDataUrl) {
        const logoX = 8;
        const logoY = (logoAreaH - LOGO_SZ) / 2;
        // White circle bg behind logo
        doc.setFillColor(255, 255, 255);
        doc.circle(logoX + LOGO_SZ / 2, logoY + LOGO_SZ / 2, LOGO_SZ / 2 + 1.5, 'F');
        try { doc.addImage(logoDataUrl, logoX, logoY, LOGO_SZ, LOGO_SZ); } catch { /* skip */ }
      }

      // School name — centered
      const nameY = logoDataUrl ? 12 : 11;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text(trunc(schoolName, 55), PW / 2, nameY, { align: 'center' });

      // School address
      if (schoolAddress) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(199, 210, 254);  // indigo-200
        doc.text(trunc(schoolAddress, 90), PW / 2, nameY + 8, { align: 'center' });
      }

      // CLASS ROUTINE accent strip at bottom of header
      doc.setFillColor(79, 70, 229);      // indigo-600
      doc.rect(0, HEADER_H - 10, PW, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(224, 231, 255);    // indigo-100
      doc.text('CLASS ROUTINE', PW / 2, HEADER_H - 3.5, { align: 'center' });

      let y = HEADER_H + 4;

      // ── TEACHER INFO BAR ──────────────────────────────────────────────────
      if (infoItems.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(75, 85, 99);
        doc.text(infoItems.join('   ·   '), PW / 2, y, { align: 'center' });
        y += 5;
      }

      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(ML, y, PW - MR, y);
      y += 5;

      const TABLE_Y = y;

      // ── TABLE HEADER ──────────────────────────────────────────────────────
      doc.setFillColor(243, 244, 246);
      doc.rect(ML, y, TIME_W, HDR_H, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(107, 114, 128);
      doc.text('TIME', ML + TIME_W / 2, y + 5.5, { align: 'center' });

      displayDays.forEach((day, di) => {
        const cx = ML + TIME_W + di * COL_W;
        doc.setFillColor(238, 242, 255);  // indigo-50
        doc.rect(cx, y, COL_W, HDR_H, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(67, 56, 202);    // indigo-700
        doc.text(day.toUpperCase(), cx + COL_W / 2, y + 5.5, { align: 'center' });
      });

      y += HDR_H;

      // ── TABLE ROWS (class rows + break rows) ─────────────────────────────
      const FILLS   = [[239,246,255],[245,243,255],[236,253,245],[255,251,235],[255,241,242],[240,253,250]];
      const ACCENTS = [[59,130,246],[139,92,246],[16,185,129],[245,158,11],[244,63,94],[20,184,166]];
      const subMaxCh = Math.max(8, Math.floor(COL_W / 2.1));

      pdfRows.forEach((row) => {
        if (row.isBreak) {
          // ── BREAK ROW ────────────────────────────────────────────────────
          // Full-width amber strip
          doc.setFillColor(255, 251, 235);          // amber-50
          doc.rect(ML, y, TABLE_W, BRK_H, 'F');
          // Left accent stripe
          doc.setFillColor(245, 158, 11);            // amber-500
          doc.rect(ML, y, 2.5, BRK_H, 'F');
          // Time span (left column)
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5.5);
          doc.setTextColor(161, 98, 7);              // amber-700
          doc.text(row.slot, ML + TIME_W / 2, y + BRK_H / 2 + 1.5, { align: 'center' });
          // "Break (X min)" label — centered over day columns
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(161, 98, 7);
          const breakCenterX = ML + TIME_W + (TABLE_W - TIME_W) / 2;
          doc.text(row.breakLabel, breakCenterX, y + BRK_H / 2 + 1.5, { align: 'center' });
          y += BRK_H;
        } else {
          // ── CLASS ROW ────────────────────────────────────────────────────
          const si = row.si;
          const [fr, fg, fb] = FILLS[si % FILLS.length];
          const [ar, ag, ab] = ACCENTS[si % ACCENTS.length];
          const midY = y + ROW_H / 2;

          // Time cell
          doc.setFillColor(249, 250, 251);
          doc.rect(ML, y, TIME_W, ROW_H, 'F');
          const parts = row.slot.split(' - ');
          if (parts.length === 2) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            doc.setTextColor(55, 65, 81);
            doc.text(parts[0], ML + TIME_W / 2, midY - 2, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6);
            doc.setTextColor(107, 114, 128);
            doc.text(parts[1], ML + TIME_W / 2, midY + 3, { align: 'center' });
          } else {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            doc.setTextColor(55, 65, 81);
            doc.text(row.slot, ML + TIME_W / 2, midY + 1, { align: 'center' });
          }

          // Day cells
          displayDays.forEach((day, di) => {
            const cx    = ML + TIME_W + di * COL_W;
            const entry = weeklyMatrix[day]?.[row.slot];
            if (entry) {
              doc.setFillColor(fr, fg, fb);
              doc.roundedRect(cx + 1.5, y + 1.5, COL_W - 3, ROW_H - 3, 1.5, 1.5, 'F');
              // Accent dot
              doc.setFillColor(ar, ag, ab);
              doc.circle(cx + 5, y + ROW_H * 0.28, 1.4, 'F');
              // Subject
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(7.5);
              doc.setTextColor(17, 24, 39);
              doc.text(trunc(entry.subject || 'Subject', subMaxCh), cx + COL_W / 2, midY - 1.5, { align: 'center' });
              // Class
              const cls = entry.classLabel || entry.className || entry.class || '';
              if (cls) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(6.5);
                doc.setTextColor(ar, ag, ab);
                doc.text(trunc(cls, 18), cx + COL_W / 2, midY + 3.5, { align: 'center' });
              }
              // Room
              doc.setFontSize(6);
              doc.setTextColor(156, 163, 175);
              doc.text(trunc(entry.room || 'TBA', 16), cx + COL_W / 2, y + ROW_H * 0.85, { align: 'center' });
            } else {
              doc.setFillColor(250, 250, 250);
              doc.rect(cx, y, COL_W, ROW_H, 'F');
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(10);
              doc.setTextColor(209, 213, 219);
              doc.text('—', cx + COL_W / 2, midY + 1, { align: 'center' });
            }
          });

          y += ROW_H;
        }
      });

      const TABLE_END_Y = y;

      // ── GRID LINES ────────────────────────────────────────────────────────
      doc.setDrawColor(209, 213, 219);
      doc.setLineWidth(0.35);
      doc.rect(ML, TABLE_Y, TABLE_W, TABLE_END_Y - TABLE_Y);

      doc.setLineWidth(0.2);
      doc.setDrawColor(229, 231, 235);

      // Horizontal lines between rows
      let ly = TABLE_Y + HDR_H;
      pdfRows.forEach((row) => {
        doc.line(ML, ly, ML + TABLE_W, ly);
        ly += row.isBreak ? BRK_H : ROW_H;
      });

      // Vertical lines drawn in segments — break rows are skipped so they
      // appear as a single full-width colspan cell with no dividers inside.
      const vSegs = [];
      let vy = TABLE_Y;
      vSegs.push({ y1: vy, y2: vy + HDR_H });   // header row segment
      vy += HDR_H;
      pdfRows.forEach((row) => {
        if (!row.isBreak) {
          const last = vSegs[vSegs.length - 1];
          if (last && last.y2 === vy) { last.y2 = vy + ROW_H; }  // extend
          else                        { vSegs.push({ y1: vy, y2: vy + ROW_H }); }
          vy += ROW_H;
        } else {
          vy += BRK_H;  // skip — no vertical lines drawn through break row
        }
      });

      const vLineXs = [ML + TIME_W];
      for (let i = 1; i < displayDays.length; i++) vLineXs.push(ML + TIME_W + i * COL_W);
      vLineXs.forEach(lx => vSegs.forEach(seg => doc.line(lx, seg.y1, lx, seg.y2)));

      // ── FOOTER ────────────────────────────────────────────────────────────
      const genDate = new Date().toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.5);
      doc.setTextColor(156, 163, 175);
      doc.text(`Generated: ${genDate}`, ML, PH - 5);
      doc.text(trunc(schoolName, 50), PW - MR, PH - 5, { align: 'right' });

      doc.save(`class-routine-${(teacherProfile?.name || 'teacher').replace(/\s+/g, '-').toLowerCase()}.pdf`);
    };
    generate();
  }, [effectiveSchedule, weeklySlots, weeklyMatrix, teacherProfile, teacherClassLabels, teacherSectionLabels]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-14 bg-white rounded-2xl animate-pulse" />
        <div className="h-64 bg-white rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Teacher context pills */}
      {(teacherClassLabels.length > 0 || teacherSectionLabels.length > 0 || teacherProfile?.subject) && (
        <div className="flex flex-wrap items-center gap-2">
          {teacherProfile?.subject && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium">
              <BookOpen size={12} />
              {teacherProfile.subject}
            </span>
          )}
          {teacherClassLabels.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium">
              <Users size={12} />
              Class {teacherClassLabels.join(', ')}
            </span>
          )}
          {teacherSectionLabels.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium">
              Section {teacherSectionLabels.join(', ')}
            </span>
          )}
          {teacherProfile?.campusName && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">
              <School size={12} />
              {teacherProfile.campusName}
            </span>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Weekly Classes', value: totalClasses, icon: Calendar, gradient: 'from-blue-500 to-indigo-500' },
          { label: `${selectedDay} Classes`, value: todayClasses.length, icon: Clock, gradient: 'from-violet-500 to-purple-500' },
          { label: 'Timetable', value: routineMeta.campusScoped ? 'Campus' : 'School', icon: School, gradient: 'from-emerald-500 to-teal-500', sub: `${toScopeLabel(routineMeta.filterSource)} · ${routineMeta.timetableCount} matched` },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 truncate">{stat.label}</p>
                {stat.sub && <p className="text-[10px] text-gray-400 truncate">{stat.sub}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Controls */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 space-y-3">
        <div className="flex items-center justify-end gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={downloadPDF}
              disabled={totalClasses === 0}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={13} />
              Download PDF
            </button>
            <button
              onClick={loadRoutine}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <RefreshCw size={13} />
              Reload
            </button>
          </div>
        </div>

        {/* Day selector pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {DAYS.map((day) => {
            const count = (effectiveSchedule[day] || []).length;
            const active = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="sm:hidden">{day.slice(0, 3)}</span>
                <span className="hidden sm:inline">{day}</span>
                {count > 0 && (
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white/20' : 'bg-gray-200/80 text-gray-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule Content */}
      {error ? (
        <div className="bg-red-50 rounded-2xl p-4 flex items-center gap-3 border border-red-100">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <AlertCircle size={16} className="text-red-500" />
          </div>
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      ) : totalClasses === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Calendar size={24} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">No classes assigned yet</p>
          <p className="text-xs text-gray-400 mt-1">Check back later or contact administration</p>
        </div>
      ) : viewMode === 'weekly' ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-5 py-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Weekly Timetable</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse">
              <thead>
                <tr>
                  <th className="text-left px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/80">
                    Time
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={`head-${day}`}
                      className={`text-left px-3 py-3 text-[11px] font-bold uppercase tracking-wider bg-gray-50/80 ${
                        selectedDay === day ? 'text-indigo-600' : 'text-gray-400'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeklySlots.map((slot, si) => (
                  <tr key={`slot-${slot.slot}`} className="border-t border-gray-50">
                    <td className="px-3 py-2.5 text-xs font-semibold text-gray-600 bg-gray-50/40 whitespace-nowrap">
                      {slot.slot}
                    </td>
                    {DAYS.map((day) => {
                      const entry = weeklyMatrix[day]?.[slot.slot];
                      const color = CLASS_COLORS[si % CLASS_COLORS.length];
                      return (
                        <td key={`cell-${day}-${slot.slot}`} className={`px-2 py-2 ${selectedDay === day ? 'bg-indigo-50/30' : ''}`}>
                          {entry ? (
                            <div className={`rounded-lg ${color.bg} border border-gray-100 px-2.5 py-2`}>
                              <p className="text-xs font-bold text-gray-900 truncate">{entry.subject || 'Subject'}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5 truncate">{entry.classLabel || entry.className || 'Class'}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5 truncate">{entry.room || 'TBA'}</p>
                            </div>
                          ) : (
                            <div className="rounded-lg border border-dashed border-gray-100 px-2.5 py-2.5 text-center">
                              <span className="text-[10px] text-gray-300">&mdash;</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">{selectedDay} Schedule</h2>
            <span className="text-xs text-gray-400">{todayClasses.length} class{todayClasses.length !== 1 ? 'es' : ''}</span>
          </div>
          {todayClasses.length > 0 ? (
            todayClasses.map((entry, index) => {
              const color = CLASS_COLORS[index % CLASS_COLORS.length];
              return (
                <div
                  key={`${selectedDay}-${index}`}
                  className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className={`border-l-[3px] ${color.border} p-4`}>
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg ${color.bg} flex items-center justify-center`}>
                          <BookOpen size={14} className={color.text} />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900">{entry.subject || 'Subject'}</h3>
                      </div>
                      {entry.period && (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          P{entry.period}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={12} className={color.text} />
                        {formatSlot(entry)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={12} className={color.text} />
                        {entry.room || 'TBA'}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users size={12} className={color.text} />
                        {entry.className}{entry.sectionName ? ` - ${entry.sectionName}` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-14 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                <Calendar size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">No classes on {selectedDay}</p>
              <p className="text-xs text-gray-400 mt-1">Select a different day to view schedule</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassRoutine;
