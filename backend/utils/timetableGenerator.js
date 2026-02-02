const DEFAULT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_PERIODS = [
  { period: 1, startTime: '08:00', endTime: '08:45', isBreak: false },
  { period: 2, startTime: '08:45', endTime: '09:30', isBreak: false },
  { period: 3, startTime: '09:30', endTime: '10:15', isBreak: false },
  { period: 4, startTime: '10:15', endTime: '10:45', isBreak: true },
  { period: 5, startTime: '10:45', endTime: '11:30', isBreak: false },
  { period: 6, startTime: '11:30', endTime: '12:15', isBreak: false },
];

const shuffle = (list) => {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const buildEmptyGrid = (days, periods) => {
  const grid = {};
  days.forEach((day) => {
    grid[day] = periods.map((period) => ({
      ...period,
      day,
      entry: null,
    }));
  });
  return grid;
};

const cloneTracker = (tracker) => {
  const next = {
    teacherDayPeriods: {},
    teacherDayCounts: {},
  };

  Object.entries(tracker.teacherDayPeriods).forEach(([teacherId, dayMap]) => {
    next.teacherDayPeriods[teacherId] = {};
    Object.entries(dayMap).forEach(([day, periodSet]) => {
      next.teacherDayPeriods[teacherId][day] = new Set(periodSet);
    });
  });

  Object.entries(tracker.teacherDayCounts).forEach(([teacherId, dayMap]) => {
    next.teacherDayCounts[teacherId] = { ...dayMap };
  });

  return next;
};

const initTracker = () => ({
  teacherDayPeriods: {},
  teacherDayCounts: {},
});

const ensureTeacherDay = (tracker, teacherId, day) => {
  if (!tracker.teacherDayPeriods[teacherId]) {
    tracker.teacherDayPeriods[teacherId] = {};
    tracker.teacherDayCounts[teacherId] = {};
  }
  if (!tracker.teacherDayPeriods[teacherId][day]) {
    tracker.teacherDayPeriods[teacherId][day] = new Set();
    tracker.teacherDayCounts[teacherId][day] = 0;
  }
};

const markTeacher = (tracker, teacherId, day, periodIndex) => {
  if (!teacherId) return;
  ensureTeacherDay(tracker, teacherId, day);
  tracker.teacherDayPeriods[teacherId][day].add(periodIndex);
  tracker.teacherDayCounts[teacherId][day] += 1;
};

const unmarkTeacher = (tracker, teacherId, day, periodIndex) => {
  if (!teacherId) return;
  ensureTeacherDay(tracker, teacherId, day);
  if (tracker.teacherDayPeriods[teacherId][day].has(periodIndex)) {
    tracker.teacherDayPeriods[teacherId][day].delete(periodIndex);
    tracker.teacherDayCounts[teacherId][day] = Math.max(
      0,
      (tracker.teacherDayCounts[teacherId][day] || 0) - 1
    );
  }
};

const defaultOptions = {
  maxTeacherPeriodsPerDay: 4,
  maxAttempts: 40,
  preferMorningPeriods: null,
  allowSameSubjectMultiplePerDay: false,
};

const buildSubjectPlan = (subjects, totalSlots, daysCount) => {
  if (!subjects.length) return [];

  const remainingSlots = Math.max(0, totalSlots);
  const base = Math.floor(remainingSlots / subjects.length);
  const extra = remainingSlots % subjects.length;

  return subjects.map((subject, index) => {
    const weeklyCount =
      Number.isFinite(subject.weeklyCount) && subject.weeklyCount > 0
        ? Math.floor(subject.weeklyCount)
        : base + (index < extra ? 1 : 0);

    const maxPerDay =
      Number.isFinite(subject.maxPerDay) && subject.maxPerDay > 0
        ? Math.floor(subject.maxPerDay)
        : Math.max(1, Math.ceil(weeklyCount / Math.max(1, daysCount)));

    return {
      ...subject,
      weeklyCount,
      maxPerDay,
    };
  });
};

const buildTasks = (subjects) => {
  const tasks = [];
  subjects.forEach((subject) => {
    let remaining = subject.weeklyCount || 0;
    if (subject.isLab && remaining > 1) {
      const pairs = Math.floor(remaining / 2);
      for (let i = 0; i < pairs; i += 1) {
        tasks.push({ subject, length: 2, isLab: true });
      }
      remaining -= pairs * 2;
    }
    for (let i = 0; i < remaining; i += 1) {
      tasks.push({ subject, length: 1, isLab: subject.isLab || false });
    }
  });
  return tasks;
};

const estimateSlots = (subject, days, periods, morningLimit, breakIndex) => {
  let count = 0;
  days.forEach((day) => {
    periods.forEach((period, index) => {
      if (period.isBreak) return;
      if (subject.avoidLastPeriod && index === periods.length - 1) return;
      if (subject.preferMorning && morningLimit !== null && index >= morningLimit) return;
      if (subject.afterBreakOnly && breakIndex !== -1 && index <= breakIndex) return;
      count += 1;
    });
  });
  return count;
};

const placeTasks = ({
  grid,
  tasks,
  days,
  periods,
  tracker,
  options,
}) => {
  const subjectDayCount = {};
  const breakIndex = periods.findIndex((period) => period.isBreak);
  const morningLimit = options.preferMorningPeriods ?? (breakIndex > 0 ? breakIndex : Math.ceil(periods.length / 2));

  const canPlace = (subject, day, periodIndex, length) => {
    const period = grid[day][periodIndex];
    if (!period || period.isBreak || period.entry) return false;
    if (subject.avoidLastPeriod && periodIndex === periods.length - 1) return false;
    if (subject.preferMorning && periodIndex >= morningLimit) return false;
    if (subject.afterBreakOnly && breakIndex !== -1 && periodIndex <= breakIndex) return false;

    const dailyKey = `${subject.key}-${day}`;
    const used = subjectDayCount[dailyKey] || 0;
    if (!options.allowSameSubjectMultiplePerDay && used >= subject.maxPerDay) return false;

    if (length === 2) {
      const next = grid[day][periodIndex + 1];
      if (!next || next.isBreak || next.entry) return false;
      if (subject.avoidLastPeriod && periodIndex + 1 === periods.length - 1) return false;
    }

    if (subject.teacherId) {
      ensureTeacherDay(tracker, subject.teacherId, day);
      if (tracker.teacherDayPeriods[subject.teacherId][day].has(periodIndex)) return false;
      const dailyCount = tracker.teacherDayCounts[subject.teacherId][day] || 0;
      if (dailyCount >= options.maxTeacherPeriodsPerDay) return false;
      if (length === 2 && tracker.teacherDayPeriods[subject.teacherId][day].has(periodIndex + 1)) return false;
      if (length === 2 && dailyCount + 1 >= options.maxTeacherPeriodsPerDay) return false;
    }

    return true;
  };

  const place = (task, day, periodIndex) => {
    const { subject, length } = task;
    grid[day][periodIndex].entry = subject;
    markTeacher(tracker, subject.teacherId, day, periodIndex);
    if (length === 2) {
      grid[day][periodIndex + 1].entry = subject;
      markTeacher(tracker, subject.teacherId, day, periodIndex + 1);
    }
    const dailyKey = `${subject.key}-${day}`;
    subjectDayCount[dailyKey] = (subjectDayCount[dailyKey] || 0) + 1;
  };

  const unplace = (task, day, periodIndex) => {
    const { subject, length } = task;
    grid[day][periodIndex].entry = null;
    unmarkTeacher(tracker, subject.teacherId, day, periodIndex);
    if (length === 2) {
      grid[day][periodIndex + 1].entry = null;
      unmarkTeacher(tracker, subject.teacherId, day, periodIndex + 1);
    }
    const dailyKey = `${subject.key}-${day}`;
    subjectDayCount[dailyKey] = Math.max(0, (subjectDayCount[dailyKey] || 1) - 1);
  };

  const sortedTasks = tasks
    .map((task) => ({
      ...task,
      slotEstimate: estimateSlots(task.subject, days, periods, morningLimit, breakIndex),
    }))
    .sort((a, b) => {
      if (a.length !== b.length) return b.length - a.length;
      if (a.slotEstimate !== b.slotEstimate) return a.slotEstimate - b.slotEstimate;
      return (b.subject.weeklyCount || 0) - (a.subject.weeklyCount || 0);
    });

  const attemptPlace = (index) => {
    if (index >= sortedTasks.length) return true;

    const task = sortedTasks[index];
    const candidates = [];
    days.forEach((day) => {
      periods.forEach((period, periodIndex) => {
        if (period.isBreak) return;
        if (canPlace(task.subject, day, periodIndex, task.length)) {
          candidates.push({ day, periodIndex });
        }
      });
    });

    const randomized = shuffle(candidates);
    for (const candidate of randomized) {
      place(task, candidate.day, candidate.periodIndex);
      if (attemptPlace(index + 1)) return true;
      unplace(task, candidate.day, candidate.periodIndex);
    }
    return false;
  };

  return attemptPlace(0);
};

const generateTimetable = ({
  subjects,
  days = DEFAULT_DAYS,
  periods = DEFAULT_PERIODS,
  options = {},
  tracker,
}) => {
  const mergedOptions = { ...defaultOptions, ...options };
  const scheduleGrid = buildEmptyGrid(days, periods);
  const teachingPeriods = periods.filter((period) => !period.isBreak);
  const plan = buildSubjectPlan(subjects, teachingPeriods.length * days.length, days.length);
  const tasks = buildTasks(plan);
  const resultTracker = cloneTracker(tracker);

  for (let attempt = 0; attempt < mergedOptions.maxAttempts; attempt += 1) {
    const grid = buildEmptyGrid(days, periods);
    const attemptTracker = cloneTracker(resultTracker);
    const ok = placeTasks({
      grid,
      tasks,
      days,
      periods,
      tracker: attemptTracker,
      options: mergedOptions,
    });
    if (ok) {
      return { grid, tracker: attemptTracker };
    }
  }

  return { grid: scheduleGrid, tracker: resultTracker, error: 'Unable to fit all subjects with current constraints.' };
};

module.exports = {
  DEFAULT_DAYS,
  DEFAULT_PERIODS,
  initTracker,
  cloneTracker,
  generateTimetable,
};
