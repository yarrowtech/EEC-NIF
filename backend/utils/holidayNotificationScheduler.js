const Holiday = require('../models/Holiday');
const Notification = require('../models/Notification');

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_INTERVAL_MS = Number(process.env.HOLIDAY_REMINDER_CHECK_INTERVAL_MS || 6 * 60 * 60 * 1000);

const toUtcDateStart = (value) => {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
};

const formatHolidayDateLabel = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate || startDate);
  if (Number.isNaN(start.getTime())) return '';

  const dayFmt = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const shortFmt = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  if (Number.isNaN(end.getTime()) || start.toISOString().slice(0, 10) === end.toISOString().slice(0, 10)) {
    return dayFmt.format(start);
  }
  return `${shortFmt.format(start)} to ${shortFmt.format(end)}`;
};

const buildReminderTypeLabel = (holiday) => {
  const start = new Date(holiday.startDate || holiday.date);
  const startIso = Number.isNaN(start.getTime()) ? 'invalid-date' : start.toISOString().slice(0, 10);
  return `holiday_reminder:${holiday._id}:${startIso}`;
};

const dispatchUpcomingHolidayReminders = async () => {
  const todayUtc = toUtcDateStart(new Date());
  if (!todayUtc) return { scanned: 0, created: 0, skipped: 0 };
  const tomorrowUtc = new Date(todayUtc.getTime() + DAY_MS);
  const dayAfterUtc = new Date(tomorrowUtc.getTime() + DAY_MS);

  const holidays = await Holiday.find({
    startDate: {
      $gte: tomorrowUtc,
      $lt: dayAfterUtc,
    },
  })
    .select('_id schoolId campusId name startDate endDate date')
    .lean();

  let created = 0;
  let skipped = 0;

  for (const holiday of holidays) {
    if (!holiday?.schoolId) {
      skipped += 1;
      continue;
    }

    const typeLabel = buildReminderTypeLabel(holiday);
    const existing = await Notification.findOne({
      schoolId: holiday.schoolId,
      ...(holiday.campusId ? { campusId: holiday.campusId } : {}),
      typeLabel,
    })
      .select('_id audience')
      .lean();

    if (existing) {
      if (String(existing.audience || '').toLowerCase() !== 'all') {
        await Notification.updateOne(
          { _id: existing._id },
          { $set: { audience: 'All' } }
        );
      }
      skipped += 1;
      continue;
    }

    const holidayName = String(holiday.name || 'Holiday').trim();
    const dateLabel = formatHolidayDateLabel(holiday.startDate || holiday.date, holiday.endDate || holiday.startDate || holiday.date);

    await Notification.create({
      schoolId: holiday.schoolId,
      campusId: holiday.campusId || null,
      title: `Upcoming Holiday: ${holidayName}`,
      message: `Upcoming holiday on ${dateLabel}. Reason: ${holidayName}.`,
      audience: 'All',
      type: 'announcement',
      typeLabel,
      priority: 'medium',
      category: 'events',
      createdByType: 'admin',
      createdByName: 'System',
      expiresAt: holiday.endDate || holiday.startDate || holiday.date || null,
    });
    created += 1;
  }

  return {
    scanned: holidays.length,
    created,
    skipped,
  };
};

const startHolidayReminderScheduler = () => {
  const runOnce = async () => {
    try {
      const stats = await dispatchUpcomingHolidayReminders();
      console.log(
        `[holiday-reminder] scanned=${stats.scanned}, created=${stats.created}, skipped=${stats.skipped}`
      );
    } catch (err) {
      console.error(`[holiday-reminder] failed: ${err.message}`);
    }
  };

  runOnce();

  const intervalMs = Number.isFinite(DEFAULT_INTERVAL_MS) && DEFAULT_INTERVAL_MS > 0
    ? DEFAULT_INTERVAL_MS
    : 6 * 60 * 60 * 1000;

  const timer = setInterval(runOnce, intervalMs);
  if (typeof timer.unref === 'function') {
    timer.unref();
  }
  console.log(`[holiday-reminder] scheduler started. intervalMs=${intervalMs}`);
};

module.exports = {
  dispatchUpcomingHolidayReminders,
  startHolidayReminderScheduler,
};
