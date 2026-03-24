import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import { CalendarDays, Download, Loader2 } from 'lucide-react';
import { useStudentDashboard } from './StudentDashboardContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatDate = (value) => {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
};

const formatCompactDate = (value) => {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatWeekday = (value) => {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString(undefined, { weekday: 'long' });
};

const toBase64Image = async (url) => {
  if (!url) return null;
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const overlapsYear = (startValue, endValue, year) => {
  const start = new Date(startValue);
  const end = new Date(endValue || startValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);
  return end >= yearStart && start <= yearEnd;
};

const formatDateRange = (startValue, endValue) => {
  const start = formatDate(startValue);
  const end = formatDate(endValue || startValue);
  if (start === end) return start;
  return `${start} to ${end}`;
};

const getHolidayDuration = (startValue, endValue) => {
  const start = new Date(startValue);
  const end = new Date(endValue || startValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.floor((end - start) / dayMs) + 1);
};

const isPastHoliday = (startValue, endValue) => {
  const dt = new Date(endValue || startValue);
  if (Number.isNaN(dt.getTime())) return false;
  const holidayDay = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return holidayDay < today;
};

const getHolidayStatus = (startValue, endValue) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(startValue);
  const end = new Date(endValue || startValue);
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  if (Number.isNaN(startDay.getTime()) || Number.isNaN(endDay.getTime())) return 'Unknown';
  if (today < startDay) return 'Upcoming';
  if (today > endDay) return 'Past';
  return 'Ongoing';
};

const toSortableDate = (value) => {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return Number.MAX_SAFE_INTEGER;
  return dt.getTime();
};

const HolidayListView = () => {
  const { profile } = useStudentDashboard();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const sortedHolidays = [...holidays].sort((a, b) => {
    const aDate = toSortableDate(a.startDate || a.date);
    const bDate = toSortableDate(b.startDate || b.date);
    return aDate - bDate;
  });

  const stats = sortedHolidays.reduce(
    (acc, item) => {
      const start = item.startDate || item.date;
      const end = item.endDate || item.startDate || item.date;
      const status = getHolidayStatus(start, end);
      acc.total += 1;
      if (status === 'Upcoming') acc.upcoming += 1;
      if (status === 'Ongoing') acc.ongoing += 1;
      if (status === 'Past') acc.past += 1;
      return acc;
    },
    { total: 0, upcoming: 0, ongoing: 0, past: 0 }
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/holidays/student`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          throw new Error(data?.error || 'Unable to load holidays');
        }
        setHolidays(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Unable to load holidays');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDownloadPdf = async () => {
    if (!sortedHolidays.length || downloading) return;
    setDownloading(true);
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const schoolName = profile?.schoolName || profile?.school?.name || profile?.campusName || 'School';
      const schoolAddress = profile?.schoolAddress || profile?.school?.address || profile?.address || '';
      const logoUrl = profile?.schoolLogo || profile?.school?.logo?.secure_url || profile?.school?.logo || '';
      const logoData = await toBase64Image(logoUrl);

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const PW = 210;
      const PH = 297;
      const ML = 14;
      const MR = 14;
      const CONTENT_W = PW - ML - MR;

      let y = 14;

      if (logoData) {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(ML, y, 20, 20, 2, 2, 'F');
        try {
          doc.addImage(logoData, ML + 2, y + 2, 16, 16);
        } catch {
          // no-op if logo decode fails
        }
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42);
      doc.text(schoolName, PW / 2, y + 7, { align: 'center' });

      if (schoolAddress) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(String(schoolAddress).slice(0, 100), PW / 2, y + 12.5, { align: 'center' });
      }

      y += 24;
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.35);
      doc.line(ML, y, PW - MR, y);
      y += 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(17, 24, 39);
      doc.text(`Holiday Calendar ${currentYear}`, PW / 2, y, { align: 'center' });
      y += 7;

      const yearRows = sortedHolidays.filter((item) =>
        overlapsYear(item.startDate || item.date, item.endDate || item.startDate || item.date, currentYear)
      );
      const rows = yearRows.length ? yearRows : sortedHolidays;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Prepared on ${now.toLocaleDateString()}`, ML, y);
      doc.text(`Total holidays ${rows.length}`, PW - MR, y, { align: 'right' });
      y += 7;

      const col = {
        sl: 12,
        name: 64,
        date: 44,
        day: 40,
        days: 22,
      };
      const rowMinH = 8;

      const drawHeaderRow = (top) => {
        doc.setFillColor(226, 232, 240);
        doc.roundedRect(ML, top, CONTENT_W, rowMinH, 1.2, 1.2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text('#', ML + col.sl / 2, top + 5.3, { align: 'center' });
        doc.text('Holiday', ML + col.sl + 2, top + 5.3);
        doc.text('Date', ML + col.sl + col.name + 2, top + 5.3);
        doc.text('Day', ML + col.sl + col.name + col.date + col.day / 2, top + 5.3, { align: 'center' });
        doc.text('Days', ML + col.sl + col.name + col.date + col.day + col.days / 2, top + 5.3, { align: 'center' });
      };

      drawHeaderRow(y);
      y += rowMinH;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      rows.forEach((item, idx) => {
        const start = item.startDate || item.date;
        const end = item.endDate || item.startDate || item.date;
        const compactStart = formatCompactDate(start);
        const compactEnd = formatCompactDate(end);
        const dateLabel = compactStart === compactEnd ? compactStart : `${compactStart} to ${compactEnd}`;
        const dayLabel = formatWeekday(start);
        const days = getHolidayDuration(start, end);

        const nameLines = doc.splitTextToSize(String(item.name || 'Untitled holiday'), col.name - 4);
        const dateLines = doc.splitTextToSize(dateLabel, col.date - 4);
        const maxLines = Math.max(nameLines.length, dateLines.length, 1);
        const rowH = Math.max(rowMinH, maxLines * 4 + 3.2);

        if (y + rowH > PH - 16) {
          doc.addPage();
          y = 14;
          drawHeaderRow(y);
          y += rowMinH;
          doc.setFont('helvetica', 'normal');
        }

        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(ML, y, CONTENT_W, rowH, 'F');
        }

        doc.setDrawColor(226, 232, 240);
        doc.rect(ML, y, CONTENT_W, rowH);
        doc.setTextColor(51, 65, 85);
        doc.text(String(idx + 1), ML + col.sl / 2, y + 5.2, { align: 'center' });
        doc.text(nameLines, ML + col.sl + 2, y + 5.2);
        doc.text(dateLines, ML + col.sl + col.name + 2, y + 5.2);
        doc.text(dayLabel, ML + col.sl + col.name + col.date + col.day / 2, y + 5.2, { align: 'center' });
        doc.text(String(days), ML + col.sl + col.name + col.date + col.day + col.days / 2, y + 5.2, { align: 'center' });
        y += rowH;
      });

      const totalPages = doc.getNumberOfPages();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      for (let page = 1; page <= totalPages; page += 1) {
        doc.setPage(page);
        doc.setTextColor(100, 116, 139);
        doc.line(ML, PH - 12, PW - MR, PH - 12);
        doc.text('System generated holiday calendar', ML, PH - 7.5);
        doc.text(`Page ${page} of ${totalPages}`, PW - MR, PH - 7.5, { align: 'right' });
      }

      doc.save(`holiday-list-${currentYear}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-sky-50/70 p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Holiday Calendar</h1>
            <p className="text-xs text-slate-500">Track upcoming and completed holidays in one place</p>
          </div>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={loading || !sortedHolidays.length || downloading}
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            {downloading ? 'Preparing...' : 'Download PDF'}
          </button>
        </div>

        {!loading && !error && sortedHolidays.length > 0 && (
          <div className="mb-4 grid gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white/90 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Upcoming</p>
              <p className="mt-1 text-xl font-bold text-emerald-900">{stats.upcoming}</p>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-700">Ongoing</p>
              <p className="mt-1 text-xl font-bold text-sky-900">{stats.ongoing}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-100 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">Past</p>
              <p className="mt-1 text-xl font-bold text-slate-800">{stats.past}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading holidays...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-medium text-rose-700">{error}</p>
          </div>
        ) : sortedHolidays.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">No holidays announced yet.</p>
            <p className="mt-3 text-sm font-semibold text-slate-700">Total Holidays: 0</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white sm:block">
              <table className="min-w-full text-sm text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-3 py-2.5">Holiday</th>
                    <th className="px-3 py-2.5">Date Range</th>
                    <th className="px-3 py-2.5 text-center">Days</th>
                    <th className="px-3 py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHolidays.map((item) => {
                    const start = item.startDate || item.date;
                    const end = item.endDate || item.startDate || item.date;
                    const status = getHolidayStatus(start, end);
                    const isPast = isPastHoliday(start, end);
                    return (
                      <tr key={item._id} className="border-b border-slate-100 last:border-b-0">
                        <td className={`px-3 py-3 font-semibold ${isPast ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {item.name}
                        </td>
                        <td className={`px-3 py-3 ${isPast ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                          {formatDateRange(start, end)}
                        </td>
                        <td className="px-3 py-3 text-center font-medium text-slate-700">
                          {getHolidayDuration(start, end)}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                              status === 'Upcoming'
                                ? 'bg-emerald-100 text-emerald-700'
                                : status === 'Ongoing'
                                  ? 'bg-sky-100 text-sky-700'
                                  : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-2 sm:hidden">
              {sortedHolidays.map((item) => {
                const start = item.startDate || item.date;
                const end = item.endDate || item.startDate || item.date;
                const status = getHolidayStatus(start, end);
                const isPast = isPastHoliday(start, end);
                const duration = getHolidayDuration(start, end);
                return (
                  <div key={item._id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`text-sm font-semibold ${isPast ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{item.name}</p>
                        <p className={`mt-1 text-xs ${isPast ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                          {formatDateRange(start, end)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                          status === 'Upcoming'
                            ? 'bg-emerald-100 text-emerald-700'
                            : status === 'Ongoing'
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] font-medium text-slate-500">
                      Duration: {duration} day{duration > 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="text-sm font-semibold text-slate-700">Total Holidays: {sortedHolidays.length}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HolidayListView;
