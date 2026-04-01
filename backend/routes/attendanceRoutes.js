const express = require('express');
const router = express.Router();
const StudentUser = require('../models/StudentUser');
const ParentUser = require('../models/ParentUser');
const Timetable = require('../models/Timetable');
const LessonPlan = require('../models/LessonPlan');
const LessonPlanCompletion = require('../models/LessonPlanCompletion');
const Notification = require('../models/Notification');
const authStudent = require('../middleware/authStudent');
const authTeacher = require('../middleware/authTeacher');
const authParent = require('../middleware/authParent');
const adminAuth = require('../middleware/adminAuth');

const VALID_STATUSES = new Set(['present', 'absent']);
const SUBSTITUTE_SUBJECT_PREFIX = 'general::';
const LOW_ATTENDANCE_THRESHOLD = 75;
const LOW_ATTENDANCE_NOTIFICATION_TITLE = 'Low Attendance Alert';
const LOW_ATTENDANCE_NOTIFICATION_WINDOW_DAYS = 7;

const normalizeStatus = (value) => String(value || '').trim().toLowerCase();

const parseDateValue = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfDay = (value) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const isoDateKey = (value) => new Date(value).toISOString().slice(0, 10);

const findAttendanceIndexByDate = (attendance = [], dateValue) => {
  const dayStart = startOfDay(dateValue);
  const dayEnd = endOfDay(dateValue);
  return attendance.findIndex((entry) => {
    if (!entry?.date) return false;
    const entryDate = new Date(entry.date);
    return entryDate >= dayStart && entryDate <= dayEnd;
  });
};

const findAttendanceIndexByDateAndSubject = (attendance = [], dateValue, subjectValue = '') => {
  const dayStart = startOfDay(dateValue);
  const dayEnd = endOfDay(dateValue);
  const targetSubject = normalizeSubject(subjectValue);
  return attendance.findIndex((entry) => {
    if (!entry?.date) return false;
    const entryDate = new Date(entry.date);
    if (!(entryDate >= dayStart && entryDate <= dayEnd)) return false;
    if (!targetSubject) return true;
    return normalizeSubject(entry?.subject) === targetSubject;
  });
};

const buildSummary = (attendance = []) => {
  const totalClasses = attendance.length;
  const presentDays = attendance.filter((item) => item.status === 'present').length;
  const absentDays = attendance.filter((item) => item.status === 'absent').length;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentDays / totalClasses) * 100) : 0;
  return {
    totalClasses,
    presentDays,
    absentDays,
    attendancePercentage,
  };
};

const resolveMonthRange = (monthParam) => {
  if (!monthParam || !/^\d{4}-\d{2}$/.test(String(monthParam))) {
    const now = new Date();
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
      key: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    };
  }
  const [year, month] = String(monthParam).split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  return {
    start,
    end: new Date(year, month, 0, 23, 59, 59, 999),
    key: `${year}-${String(month).padStart(2, '0')}`,
  };
};


const normalizeText = (value) => String(value || '').trim();
const normalizeSubject = (value) => normalizeText(value).toLowerCase();
const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const parseBoolean = (value) => ['1', 'true', 'yes', 'y'].includes(String(value || '').trim().toLowerCase());

const normalizeSessionToken = (value) => {
  const text = normalizeText(value);
  const match = text.match(/^(\d{4})-(\d{2,4})$/);
  if (!match) return text.toLowerCase();
  const startYear = match[1];
  const endPart = match[2];
  const endToken = endPart.length === 2 ? endPart : endPart.slice(-2);
  return `${startYear}-${endToken}`;
};

const areSessionsEquivalent = (a, b) => {
  if (!a || !b) return false;
  return normalizeSessionToken(a) === normalizeSessionToken(b);
};

const encodeSubstituteSubject = (value) => {
  const subjectToken = normalizeSubject(value) || 'general';
  return `${SUBSTITUTE_SUBJECT_PREFIX}${subjectToken}`;
};

const isSubstituteSubjectEntry = (value) => normalizeSubject(value).startsWith(SUBSTITUTE_SUBJECT_PREFIX);

const matchesSubjectForView = ({ entrySubject, requestedSubject, substituteMode = false }) => {
  const entryNormalized = normalizeSubject(entrySubject);
  const requestedNormalized = normalizeSubject(requestedSubject);

  if (!requestedNormalized) return true;
  if (!substituteMode) return entryNormalized === requestedNormalized;

  // Legacy substitute rows may still be stored as plain "General".
  if (entryNormalized === 'general') return requestedNormalized === 'general';
  if (!isSubstituteSubjectEntry(entrySubject)) return false;
  return entryNormalized === encodeSubstituteSubject(requestedNormalized);
};

const resolveStudentSession = (student) => {
  const date = parseDateValue(student?.admissionDate) || parseDateValue(student?.createdAt);
  if (!date) return '';
  const year = date.getFullYear();
  const next = String((year + 1) % 100).padStart(2, '0');
  return `${year}-${next}`;
};

const resolveStudentClass = (student) => normalizeText(student?.grade);

const resolveStudentSection = (student) => normalizeText(student?.section);

const getTeacherAllocatedSubjects = async ({ schoolId, campusId, teacherId, className, sectionName }) => {
  const baseFilter = { schoolId, 'entries.teacherId': teacherId };
  const primaryFilter = campusId ? { ...baseFilter, campusId } : baseFilter;

  let timetables = await Timetable.find(primaryFilter)
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .populate('entries.subjectId', 'name')
    .lean();

  if (campusId && (!Array.isArray(timetables) || timetables.length === 0)) {
    timetables = await Timetable.find(baseFilter)
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('entries.subjectId', 'name')
      .lean();
  }

  const requestedClass = normalizeText(className).toLowerCase();
  const requestedSection = normalizeText(sectionName).toLowerCase();
  const subjectSet = new Set();

  (timetables || []).forEach((tt) => {
    const ttClass = normalizeText(tt?.classId?.name).toLowerCase();
    const ttSection = normalizeText(tt?.sectionId?.name).toLowerCase();
    if (requestedClass && ttClass !== requestedClass) return;
    if (requestedSection && ttSection !== requestedSection) return;

    (Array.isArray(tt?.entries) ? tt.entries : []).forEach((entry) => {
      if (String(entry?.teacherId || '') !== String(teacherId || '')) return;
      const subjectName = normalizeText(entry?.subjectId?.name);
      if (subjectName) subjectSet.add(subjectName);
    });
  });

  return [...subjectSet].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
};

const getClassSectionSubjects = async ({ schoolId, campusId, className, sectionName }) => {
  const baseFilter = { schoolId };
  const primaryFilter = campusId ? { ...baseFilter, campusId } : baseFilter;

  let timetables = await Timetable.find(primaryFilter)
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .populate('entries.subjectId', 'name')
    .lean();

  if (campusId && (!Array.isArray(timetables) || timetables.length === 0)) {
    timetables = await Timetable.find(baseFilter)
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('entries.subjectId', 'name')
      .lean();
  }

  const requestedClass = normalizeText(className).toLowerCase();
  const requestedSection = normalizeText(sectionName).toLowerCase();
  if (!requestedClass) return [];

  const subjectSet = new Set();
  (timetables || []).forEach((tt) => {
    const ttClass = normalizeText(tt?.classId?.name).toLowerCase();
    const ttSection = normalizeText(tt?.sectionId?.name).toLowerCase();
    if (ttClass !== requestedClass) return;
    if (requestedSection && ttSection !== requestedSection) return;

    (Array.isArray(tt?.entries) ? tt.entries : []).forEach((entry) => {
      const subjectName = normalizeText(entry?.subjectId?.name);
      if (subjectName) subjectSet.add(subjectName);
    });
  });

  return [...subjectSet].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
};

const buildClassSectionScope = async ({ schoolId, campusId, teacherId }) => {
  const baseFilter = {
    schoolId,
    'entries.teacherId': teacherId,
  };
  const primaryFilter = campusId
    ? { ...baseFilter, campusId }
    : baseFilter;

  let timetables = await Timetable.find(primaryFilter)
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .lean();

  if (campusId && (!Array.isArray(timetables) || timetables.length === 0)) {
    timetables = await Timetable.find(baseFilter)
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .lean();
  }

  const classSectionKeys = new Set();
  (timetables || []).forEach((tt) => {
    const className = normalizeText(tt?.classId?.name);
    const sectionName = normalizeText(tt?.sectionId?.name);
    if (!className) return;
    classSectionKeys.add(`${className.toLowerCase()}::${sectionName ? sectionName.toLowerCase() : '*'}`);
  });

  return {
    hasAssignment: classSectionKeys.size > 0,
    classSectionKeys,
  };
};

const isStudentAllowedForScope = (student, scope) => {
  if (!scope?.hasAssignment) return false;
  const className = resolveStudentClass(student).toLowerCase();
  const sectionName = resolveStudentSection(student).toLowerCase();
  if (!className) return false;
  return scope.classSectionKeys.has(`${className}::*`) || scope.classSectionKeys.has(`${className}::${sectionName}`);
};

const teacherHasRoutineScope = (scope) =>
  Boolean(scope?.hasAssignment && scope?.classSectionKeys instanceof Set && scope.classSectionKeys.size > 0);

const notifyParentsForLowAttendance = async ({ schoolId, campusId, studentIds = [] }) => {
  const uniqueStudentIds = [...new Set((studentIds || []).map((id) => String(id || '')).filter(Boolean))];
  if (!uniqueStudentIds.length) return;

  const studentFilter = { schoolId, _id: { $in: uniqueStudentIds } };
  if (campusId) studentFilter.campusId = campusId;
  const students = await StudentUser.find(studentFilter)
    .select('name grade section attendance')
    .lean();
  if (!students.length) return;

  const parentFilter = { schoolId };
  if (campusId) parentFilter.campusId = campusId;
  const parents = await ParentUser.find(parentFilter)
    .select('_id childrenIds children')
    .lean();

  const parentIdsByStudentId = new Map();
  students.forEach((student) => {
    const sid = String(student._id);
    parentIdsByStudentId.set(sid, new Set());
  });

  parents.forEach((parent) => {
    const parentId = String(parent?._id || '');
    if (!parentId) return;
    const linkedIds = Array.isArray(parent?.childrenIds) ? parent.childrenIds.map((id) => String(id)) : [];
    linkedIds.forEach((sid) => {
      if (parentIdsByStudentId.has(sid)) parentIdsByStudentId.get(sid).add(parentId);
    });
  });

  // Fallback matching by child name if childrenIds relation is missing.
  parents.forEach((parent) => {
    const parentId = String(parent?._id || '');
    if (!parentId) return;
    const childNames = Array.isArray(parent?.children)
      ? parent.children.map((name) => normalizeText(name).toLowerCase()).filter(Boolean)
      : [];
    if (!childNames.length) return;
    students.forEach((student) => {
      const studentName = normalizeText(student?.name).toLowerCase();
      if (studentName && childNames.includes(studentName)) {
        parentIdsByStudentId.get(String(student._id))?.add(parentId);
      }
    });
  });

  const windowStart = new Date(Date.now() - (LOW_ATTENDANCE_NOTIFICATION_WINDOW_DAYS * 24 * 60 * 60 * 1000));

  for (const student of students) {
    const summary = buildSummary(Array.isArray(student?.attendance) ? student.attendance : []);
    if (summary.attendancePercentage >= LOW_ATTENDANCE_THRESHOLD) continue;

    const targetParentIds = [...(parentIdsByStudentId.get(String(student._id)) || new Set())];
    if (!targetParentIds.length) continue;

    const existing = await Notification.findOne({
      schoolId,
      ...(campusId ? { campusId } : {}),
      audience: 'Parent',
      title: LOW_ATTENDANCE_NOTIFICATION_TITLE,
      'relatedEntity.entityType': 'result',
      'relatedEntity.entityId': student._id,
      createdAt: { $gte: windowStart },
    }).lean();
    if (existing) continue;

    await Notification.create({
      schoolId,
      campusId: campusId || null,
      title: LOW_ATTENDANCE_NOTIFICATION_TITLE,
      message: `${student.name || 'Student'} attendance is ${summary.attendancePercentage}% (${summary.presentDays}/${summary.totalClasses} classes). This is below 75%.`,
      audience: 'Parent',
      className: normalizeText(student?.grade),
      sectionName: normalizeText(student?.section),
      type: 'general',
      typeLabel: 'Weekly Attendance Alert',
      priority: 'high',
      category: 'academic',
      relatedEntity: {
        entityType: 'result',
        entityId: student._id,
      },
      targetUserIds: targetParentIds,
    });
  }
};

const resolveLessonPlansForAttendance = async ({
  schoolId,
  campusId,
  targetDate,
  className,
  sectionName,
  subject,
}) => {
  const normalizedClass = normalizeText(className);
  const normalizedSection = normalizeText(sectionName);
  const normalizedSubjectText = normalizeText(subject);
  if (
    !normalizedClass ||
    !normalizedSection ||
    !normalizedSubjectText ||
    normalizeSubject(normalizedSubjectText) === 'general'
  ) {
    return [];
  }

  const filter = {
    schoolId,
    className: { $regex: `^${escapeRegex(normalizedClass)}$`, $options: 'i' },
    sectionName: { $regex: `^${escapeRegex(normalizedSection)}$`, $options: 'i' },
    subject: { $regex: `^${escapeRegex(normalizedSubjectText)}$`, $options: 'i' },
    date: { $gte: startOfDay(targetDate), $lte: endOfDay(targetDate) },
  };
  if (campusId) filter.campusId = campusId;

  let plans = await LessonPlan.find(filter).sort({ createdAt: 1, _id: 1 }).lean();
  if ((!Array.isArray(plans) || plans.length === 0) && campusId) {
    const fallbackFilter = { ...filter };
    delete fallbackFilter.campusId;
    plans = await LessonPlan.find(fallbackFilter).sort({ createdAt: 1, _id: 1 }).lean();
  }
  return plans || [];
};

const buildLessonPlanContext = async ({
  schoolId,
  campusId,
  targetDate,
  className,
  sectionName,
  subject,
}) => {
  const plans = await resolveLessonPlansForAttendance({
    schoolId,
    campusId,
    targetDate,
    className,
    sectionName,
    subject,
  });

  const context = {
    date: targetDate.toISOString(),
    subject: normalizeText(subject),
    className: normalizeText(className),
    section: normalizeText(sectionName),
    plans: [],
  };
  if (!plans.length) return context;

  const completionFilter = {
    schoolId,
    lessonPlanId: { $in: plans.map((plan) => plan._id) },
    date: { $gte: startOfDay(targetDate), $lte: endOfDay(targetDate) },
  };
  if (campusId) completionFilter.campusId = campusId;
  let completions = await LessonPlanCompletion.find(completionFilter).lean();
  if ((!Array.isArray(completions) || completions.length === 0) && campusId) {
    const fallbackFilter = { ...completionFilter };
    delete fallbackFilter.campusId;
    completions = await LessonPlanCompletion.find(fallbackFilter).lean();
  }
  const completionByPlanId = new Map((completions || []).map((item) => [String(item.lessonPlanId), item]));

  context.plans = plans.map((plan) => {
    const completion = completionByPlanId.get(String(plan._id));
    return {
      id: String(plan._id),
      title: plan.title || '',
      subject: plan.subject || '',
      date: plan.date,
      status: completion?.status || 'pending',
      completionPercent: Number.isFinite(Number(completion?.completionPercent))
        ? Number(completion.completionPercent)
        : 0,
    };
  });
  return context;
};

const buildStudentAttendancePayload = (
  student,
  monthRange,
  selectedDate,
  selectedSubject = '',
  { substituteMode = false } = {}
) => {
  const attendance = Array.isArray(student?.attendance) ? student.attendance : [];
  const monthEntries = attendance.filter((entry) => {
    const entryDate = parseDateValue(entry.date);
    if (!(entryDate && entryDate >= monthRange.start && entryDate <= monthRange.end)) return false;
    return matchesSubjectForView({
      entrySubject: entry?.subject,
      requestedSubject: selectedSubject,
      substituteMode,
    });
  });

  const attendanceByDate = {};
  monthEntries.forEach((entry) => {
    attendanceByDate[isoDateKey(entry.date)] = {
      id: entry._id,
      date: entry.date,
      status: entry.status,
      subject: entry.subject || '',
    };
  });

  const monthlySummary = buildSummary(monthEntries);
  const overallSummary = buildSummary(attendance);
  const dayStart = startOfDay(selectedDate);
  const dayEnd = endOfDay(selectedDate);
  const selectedRecord = attendance.find((entry) => {
    const entryDate = parseDateValue(entry?.date);
    if (!entryDate || !(entryDate >= dayStart && entryDate <= dayEnd)) return false;
    return matchesSubjectForView({
      entrySubject: entry?.subject,
      requestedSubject: selectedSubject,
      substituteMode,
    });
  }) || null;

  return {
    _id: student._id,
    name: student?.name || 'Student',
    username: normalizeText(student?.username) || normalizeText(student?.studentCode),
    session: resolveStudentSession(student),
    className: resolveStudentClass(student),
    section: resolveStudentSection(student),
    roll: student?.roll || null,
    attendanceByDate,
    selectedDateRecord: selectedRecord
      ? {
        id: selectedRecord._id,
        status: selectedRecord.status,
        subject: selectedRecord.subject || '',
        date: selectedRecord.date,
      }
      : null,
    monthlySummary,
    overallSummary,
  };
};

// === Student marks attendance ===
router.post('/mark', authStudent, async (req, res) => {
  // #swagger.tags = ['Attendance']
  try {
    const status = normalizeStatus(req.body?.status);
    const subject = req.body?.subject;
    if (!VALID_STATUSES.has(status)) {
      return res.status(400).json({ error: 'status must be present or absent' });
    }
    const schoolId = req.schoolId || req.user?.schoolId || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    const student = await StudentUser.findOne({ _id: req.user.id, schoolId });

    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Optional: prevent multiple entries for the same day
    const today = new Date().toDateString();
    const alreadyMarked = student.attendance.some(entry =>
      new Date(entry.date).toDateString() === today
    );
    if (alreadyMarked) {
      return res.status(400).json({ error: 'Attendance already marked for today' });
    }

    student.attendance.push({ status, subject });
    await student.save();
    res.status(200).json({ message: 'Attendance marked' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// === Teacher can view students with monthly attendance summary ===
router.get('/teacher/students', authTeacher, async (req, res) => {
  // #swagger.tags = ['Attendance']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    const campusId = req.campusId || req.user?.campusId || null;
    const teacherId = req.user?.id || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });

    const {
      session,
      className,
      class: classParam,
      section,
      studentId,
      search,
      month,
      date,
      subject,
      substitute,
    } = req.query || {};
    const monthRange = resolveMonthRange(month);
    const selectedDate = parseDateValue(date) || new Date();
    const requestedClass = normalizeText(className) || normalizeText(classParam);
    const requestedSection = normalizeText(section);
    const isSubstituteMode = parseBoolean(substitute);

    const baseFilter = { schoolId };
    if (campusId) baseFilter.campusId = campusId;

    const scopeStudents = await StudentUser.find(baseFilter)
      .select('name username studentCode grade section roll attendance admissionDate createdAt')
      .lean();

    let scopedStudents = scopeStudents;
    if (!isSubstituteMode) {
      const scope = await buildClassSectionScope({ schoolId, campusId, teacherId });
      if (!teacherHasRoutineScope(scope)) {
        return res.status(403).json({ error: 'Attendance access denied. You are not allocated in routine for any class/section.' });
      }
      scopedStudents = scopeStudents.filter((student) => isStudentAllowedForScope(student, scope));
    }
    const normalized = scopedStudents.map((student) =>
      buildStudentAttendancePayload(
        student,
        monthRange,
        selectedDate,
        subject,
        { substituteMode: isSubstituteMode }
      )
    );

    const sessionSet = new Set(normalized.map((student) => normalizeText(student.session)).filter(Boolean));
    const classSet = new Set(normalized.map((student) => normalizeText(student.className)).filter(Boolean));
    const sectionSet = new Set(normalized.map((student) => normalizeText(student.section)).filter(Boolean));
    const subjectOptions = isSubstituteMode
      ? await getClassSectionSubjects({
        schoolId,
        campusId,
        className: requestedClass,
        sectionName: requestedSection,
      })
      : await getTeacherAllocatedSubjects({
        schoolId,
        campusId,
        teacherId,
        className: requestedClass,
        sectionName: requestedSection,
      });

    const result = normalized
      .filter((student) => {
        if (session && normalizeText(student.session) !== normalizeText(session)) return false;
        if (requestedClass && normalizeText(student.className) !== requestedClass) return false;
        if (requestedSection && normalizeText(student.section) !== requestedSection) return false;
        if (studentId && String(student._id) !== String(studentId)) return false;
        if (search && !normalizeText(student.name).toLowerCase().includes(normalizeText(search).toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        const classCompare = String(a.className || '').localeCompare(String(b.className || ''), undefined, { numeric: true });
        if (classCompare !== 0) return classCompare;
        const sectionCompare = String(a.section || '').localeCompare(String(b.section || ''), undefined, { numeric: true });
        if (sectionCompare !== 0) return sectionCompare;
        return String(a.name || '').localeCompare(String(b.name || ''));
      });

    const lessonPlanContext = (!isSubstituteMode && requestedClass && requestedSection && normalizeText(subject))
      ? await buildLessonPlanContext({
        schoolId,
        campusId,
        targetDate: selectedDate,
        className: requestedClass,
        sectionName: requestedSection,
        subject: normalizeText(subject),
      })
      : null;

    res.json({
      month: monthRange.key,
      selectedDate: selectedDate.toISOString(),
      filters: {
        session: normalizeText(session),
        className: requestedClass,
        section: requestedSection,
        studentId: normalizeText(studentId),
        search: normalizeText(search),
        subject: normalizeText(subject),
        substitute: isSubstituteMode,
      },
      options: {
        sessions: [...sessionSet].sort((a, b) => b.localeCompare(a, undefined, { numeric: true })),
        classes: [...classSet].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
        sections: [...sectionSet].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
        subjects: subjectOptions,
        students: normalized
          .map((student) => ({ _id: student._id, name: student.name }))
          .sort((a, b) => normalizeText(a.name).localeCompare(normalizeText(b.name))),
      },
      lessonPlanContext,
      students: result,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Teacher upserts attendance in bulk for selected date ===
router.post('/teacher/bulk-upsert', authTeacher, async (req, res) => {
  // #swagger.tags = ['Attendance']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    const campusId = req.campusId || req.user?.campusId || null;
    const teacherId = req.user?.id || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });

    const targetDate = parseDateValue(req.body?.date);
    const entries = Array.isArray(req.body?.entries) ? req.body.entries : [];
    const isSubstituteMode = parseBoolean(req.body?.substitute);
    const requestSubject = normalizeText(req.body?.subject);
    const substituteSession = normalizeText(req.body?.session);
    const substituteClassName = normalizeText(req.body?.className || req.body?.class);
    const substituteSection = normalizeText(req.body?.section);

    if (!targetDate) return res.status(400).json({ error: 'Valid date is required' });
    if (!entries.length) return res.status(400).json({ error: 'entries are required' });
    if (isSubstituteMode && (!substituteSession || !substituteClassName || !substituteSection)) {
      return res.status(400).json({ error: 'Substitute mode requires session, className and section.' });
    }

    const stats = { updated: 0, created: 0, skipped: 0 };
    const changedStudentIds = new Set();
    const lessonPlanMeta = {
      lessonPlansMatched: 0,
      lessonPlansCompleted: 0,
      lessonPlansSkipped: 0,
      lessonPlanIds: [],
    };
    let scope = null;
    if (!isSubstituteMode) {
      scope = await buildClassSectionScope({ schoolId, campusId, teacherId });
      if (!teacherHasRoutineScope(scope)) {
        return res.status(403).json({ error: 'Attendance access denied. You are not allocated in routine for any class/section.' });
      }
    }

    const classSectionSubjectMap = new Map();
    for (const item of entries) {
      const studentId = item?.studentId;
      const status = normalizeStatus(item?.status);
      const concreteSubject = normalizeText(item?.subject) || requestSubject;
      const subject = isSubstituteMode ? encodeSubstituteSubject(concreteSubject) : concreteSubject;

      if (!studentId || !VALID_STATUSES.has(status)) {
        stats.skipped += 1;
        continue;
      }

      const filter = { _id: studentId, schoolId };
      if (campusId) filter.campusId = campusId;
      const student = await StudentUser.findOne(filter);
      if (!student) {
        stats.skipped += 1;
        continue;
      }
      if (isSubstituteMode) {
        const studentSession = normalizeText(resolveStudentSession(student));
        const studentClass = normalizeText(resolveStudentClass(student));
        const studentSection = normalizeText(resolveStudentSection(student));
        if (
          !areSessionsEquivalent(studentSession, substituteSession) ||
          studentClass.toLowerCase() !== substituteClassName.toLowerCase() ||
          studentSection.toLowerCase() !== substituteSection.toLowerCase()
        ) {
          stats.skipped += 1;
          continue;
        }
      } else if (!isStudentAllowedForScope(student, scope)) {
        stats.skipped += 1;
        continue;
      }

      const index = findAttendanceIndexByDateAndSubject(student.attendance || [], targetDate, subject);
      if (index >= 0) {
        student.attendance[index].status = status;
        student.attendance[index].subject = subject;
        stats.updated += 1;
      } else {
        student.attendance.push({
          date: targetDate,
          status,
          subject,
        });
        stats.created += 1;
      }
      changedStudentIds.add(String(student._id));
      const normalizedSubjectText = normalizeSubject(subject);
      if (normalizedSubjectText && normalizedSubjectText !== 'general') {
        const studentClass = normalizeText(resolveStudentClass(student));
        const studentSection = normalizeText(resolveStudentSection(student));
        if (studentClass && studentSection) {
          const mapKey = `${studentClass.toLowerCase()}::${studentSection.toLowerCase()}::${normalizedSubjectText}`;
          if (!classSectionSubjectMap.has(mapKey)) {
            classSectionSubjectMap.set(mapKey, {
              className: studentClass,
              sectionName: studentSection,
              subject,
            });
          }
        }
      }
      await student.save();
    }

    if (isSubstituteMode || classSectionSubjectMap.size === 0) {
      lessonPlanMeta.lessonPlansSkipped = 1;
    } else {
      const completedIds = new Set();
      for (const scopeValue of classSectionSubjectMap.values()) {
        const matchedPlans = await resolveLessonPlansForAttendance({
          schoolId,
          campusId,
          targetDate,
          className: scopeValue.className,
          sectionName: scopeValue.sectionName,
          subject: scopeValue.subject,
        });

        lessonPlanMeta.lessonPlansMatched += matchedPlans.length;
        matchedPlans.forEach((plan) => lessonPlanMeta.lessonPlanIds.push(String(plan._id)));

        for (const plan of matchedPlans) {
          await LessonPlanCompletion.findOneAndUpdate(
            {
              schoolId,
              lessonPlanId: plan._id,
              date: { $gte: startOfDay(targetDate), $lte: endOfDay(targetDate) },
            },
            {
              $set: {
                campusId: campusId || null,
                classId: plan.classId,
                sectionId: plan.sectionId,
                teacherId: plan.teacherId,
                subjectId: plan.subjectId,
                className: plan.className || scopeValue.className,
                sectionName: plan.sectionName || scopeValue.sectionName,
                teacherName: plan.teacherName || 'Teacher',
                subject: plan.subject || scopeValue.subject,
                title: plan.title || '',
                date: startOfDay(targetDate),
                status: 'completed',
                isCompleted: true,
                completionPercent: 100,
                remarks: 'Auto-completed from attendance',
              },
              $setOnInsert: {
                schoolId,
                lessonPlanId: plan._id,
              },
            },
            { upsert: true, new: true }
          );
          completedIds.add(String(plan._id));
        }
      }
      lessonPlanMeta.lessonPlansCompleted = completedIds.size;
    }
    lessonPlanMeta.lessonPlansSkipped = Math.max(
      lessonPlanMeta.lessonPlansSkipped,
      Math.max(lessonPlanMeta.lessonPlansMatched - lessonPlanMeta.lessonPlansCompleted, 0)
    );
    lessonPlanMeta.lessonPlanIds = [...new Set(lessonPlanMeta.lessonPlanIds)];
    await notifyParentsForLowAttendance({
      schoolId,
      campusId,
      studentIds: [...changedStudentIds],
    });

    res.json({
      message: 'Attendance saved successfully',
      date: targetDate.toISOString(),
      substitute: isSubstituteMode,
      ...stats,
      ...lessonPlanMeta,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Teacher updates one attendance entry ===
router.put('/teacher/student/:studentId/entry/:entryId', authTeacher, async (req, res) => {
  // #swagger.tags = ['Attendance']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    const campusId = req.campusId || req.user?.campusId || null;
    const teacherId = req.user?.id || null;
    const { studentId, entryId } = req.params || {};
    const status = normalizeStatus(req.body?.status);
    const subject = String(req.body?.subject || '').trim();
    const date = parseDateValue(req.body?.date);

    if (!VALID_STATUSES.has(status)) {
      return res.status(400).json({ error: 'status must be present or absent' });
    }
    if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });

    const scope = await buildClassSectionScope({ schoolId, campusId, teacherId });
    if (!teacherHasRoutineScope(scope)) {
      return res.status(403).json({ error: 'Attendance access denied. You are not allocated in routine for any class/section.' });
    }

    const filter = { _id: studentId, schoolId };
    if (campusId) filter.campusId = campusId;

    const student = await StudentUser.findOne(filter);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (!isStudentAllowedForScope(student, scope)) {
      return res.status(403).json({ error: 'Attendance access denied for this class/section.' });
    }

    const record = (student.attendance || []).id(entryId);
    if (!record) return res.status(404).json({ error: 'Attendance record not found' });

    record.status = status;
    record.subject = subject;
    if (date) record.date = date;

    await student.save();
    res.json({ message: 'Attendance updated', record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Teacher deletes one attendance entry ===
router.delete('/teacher/student/:studentId/entry/:entryId', authTeacher, async (req, res) => {
  // #swagger.tags = ['Attendance']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    const campusId = req.campusId || req.user?.campusId || null;
    const teacherId = req.user?.id || null;
    const { studentId, entryId } = req.params || {};
    if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });

    const scope = await buildClassSectionScope({ schoolId, campusId, teacherId });
    if (!teacherHasRoutineScope(scope)) {
      return res.status(403).json({ error: 'Attendance access denied. You are not allocated in routine for any class/section.' });
    }

    const filter = { _id: studentId, schoolId };
    if (campusId) filter.campusId = campusId;

    const student = await StudentUser.findOne(filter);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (!isStudentAllowedForScope(student, scope)) {
      return res.status(403).json({ error: 'Attendance access denied for this class/section.' });
    }

    const record = (student.attendance || []).id(entryId);
    if (!record) return res.status(404).json({ error: 'Attendance record not found' });

    record.deleteOne();
    await student.save();
    res.json({ message: 'Attendance deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Parent views attendance for linked children ===
router.get('/parent/children', authParent, async (req, res) => {
  // #swagger.tags = ['Attendance']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    const campusId = req.campusId || req.user?.campusId || null;
    const parentId = req.user?.id;
    const monthRange = resolveMonthRange(req.query?.month);
    const requestedStudentId = req.query?.studentId ? String(req.query.studentId) : '';

    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    if (!parentId) return res.status(400).json({ error: 'parentId is required' });

    const parent = await ParentUser.findById(parentId)
      .select('childrenIds children schoolId campusId')
      .lean();
    if (!parent) return res.status(404).json({ error: 'Parent not found' });

    const studentFilter = { schoolId };
    if (campusId) studentFilter.campusId = campusId;

    let students = [];
    if (Array.isArray(parent.childrenIds) && parent.childrenIds.length > 0) {
      students = await StudentUser.find({
        ...studentFilter,
        _id: { $in: parent.childrenIds },
      })
        .select('name grade section roll studentCode admissionNumber username attendance')
        .lean();
    }

    if ((!students || students.length === 0) && Array.isArray(parent.children) && parent.children.length > 0) {
      const validNames = parent.children.map((name) => String(name || '').trim()).filter(Boolean);
      if (validNames.length > 0) {
        students = await StudentUser.find({
          ...studentFilter,
          name: { $in: validNames },
        })
          .select('name grade section roll studentCode admissionNumber username attendance')
          .lean();
      }
    }

    if (requestedStudentId) {
      students = students.filter((student) => String(student._id) === requestedStudentId);
    }

    const children = students.map((student) => {
      const attendance = Array.isArray(student.attendance) ? student.attendance : [];
      const monthAttendance = attendance
        .filter((item) => {
          const date = parseDateValue(item.date);
          return date && date >= monthRange.start && date <= monthRange.end;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      return {
        student: {
          _id: student._id,
          name: student.name || 'Student',
          grade: student.grade || '',
          section: student.section || '',
          roll: student.roll || null,
          studentCode: student.studentCode || '',
          username: student.username || '',
          admissionNumber: student.admissionNumber || '',
        },
        month: monthRange.key,
        summary: buildSummary(attendance),
        monthlySummary: buildSummary(monthAttendance),
        attendance: monthAttendance,
      };
    });

    res.json({
      month: monthRange.key,
      children,
      totalChildren: children.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Teacher views all student attendance ===
router.get('/all', authTeacher, async (req, res) => {
  // #swagger.tags = ['Attendance']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    const filter = { schoolId };
    if (req.campusId) {
      filter.campusId = req.campusId;
    }
    const students = await StudentUser.find(filter, 'name email attendance');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// === Admin can view students with attendance + session/class/section filters ===
router.get('/admin/students', adminAuth, async (req, res) => {
  // #swagger.tags = ['Attendance']
  try {
    const schoolId = req.schoolId || req.admin?.schoolId || null;
    const campusId = req.campusId || req.admin?.campusId || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });

    const {
      session,
      className,
      class: classParam,
      section,
      studentId,
      search,
      month,
      date,
    } = req.query || {};

    const requestedClass = normalizeText(className) || normalizeText(classParam);
    const monthRange = resolveMonthRange(month);
    const selectedDate = parseDateValue(date) || new Date();

    const baseFilter = { schoolId };
    if (campusId) baseFilter.campusId = campusId;

    const scopeStudents = await StudentUser.find(baseFilter)
      .select('name username studentCode grade section roll attendance admissionDate createdAt')
      .lean();

    const normalized = scopeStudents.map((student) => buildStudentAttendancePayload(student, monthRange, selectedDate));

    const sessionSet = new Set(normalized.map((student) => normalizeText(student.session)).filter(Boolean));
    const classSet = new Set(normalized.map((student) => normalizeText(student.className)).filter(Boolean));
    const sectionSet = new Set(normalized.map((student) => normalizeText(student.section)).filter(Boolean));

    const filteredStudents = normalized
      .filter((student) => {
        if (session && normalizeText(student.session) !== normalizeText(session)) return false;
        if (requestedClass && normalizeText(student.className) !== requestedClass) return false;
        if (section && normalizeText(student.section) !== normalizeText(section)) return false;
        if (studentId && String(student._id) !== String(studentId)) return false;
        if (search && !normalizeText(student.name).toLowerCase().includes(normalizeText(search).toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        const classCompare = normalizeText(a.className).localeCompare(normalizeText(b.className), undefined, { numeric: true });
        if (classCompare !== 0) return classCompare;
        const sectionCompare = normalizeText(a.section).localeCompare(normalizeText(b.section), undefined, { numeric: true });
        if (sectionCompare !== 0) return sectionCompare;
        return normalizeText(a.name).localeCompare(normalizeText(b.name));
      });

    res.json({
      month: monthRange.key,
      selectedDate: selectedDate.toISOString(),
      filters: {
        session: normalizeText(session),
        className: requestedClass,
        section: normalizeText(section),
        studentId: normalizeText(studentId),
        search: normalizeText(search),
      },
      options: {
        sessions: [...sessionSet].sort((a, b) => b.localeCompare(a, undefined, { numeric: true })),
        classes: [...classSet].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
        sections: [...sectionSet].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
        students: normalized
          .map((student) => ({ _id: student._id, name: student.name }))
          .sort((a, b) => normalizeText(a.name).localeCompare(normalizeText(b.name))),
      },
      students: filteredStudents,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Admin upserts attendance in bulk for selected date ===
router.post('/admin/bulk-upsert', adminAuth, async (req, res) => {
  // #swagger.tags = ['Attendance']
  try {
    const schoolId = req.schoolId || req.admin?.schoolId || null;
    const campusId = req.campusId || req.admin?.campusId || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });

    const targetDate = parseDateValue(req.body?.date);
    const entries = Array.isArray(req.body?.entries) ? req.body.entries : [];

    if (!targetDate) return res.status(400).json({ error: 'Valid date is required' });
    if (!entries.length) return res.status(400).json({ error: 'entries are required' });

    const stats = { updated: 0, created: 0, skipped: 0 };

    for (const item of entries) {
      const currentStudentId = item?.studentId;
      const status = normalizeStatus(item?.status);
      const subject = String(item?.subject || '').trim();

      if (!currentStudentId || !VALID_STATUSES.has(status)) {
        stats.skipped += 1;
        continue;
      }

      const filter = { _id: currentStudentId, schoolId };
      if (campusId) filter.campusId = campusId;
      const student = await StudentUser.findOne(filter);
      if (!student) {
        stats.skipped += 1;
        continue;
      }

      const index = findAttendanceIndexByDate(student.attendance || [], targetDate);
      if (index >= 0) {
        student.attendance[index].status = status;
        student.attendance[index].subject = subject;
        stats.updated += 1;
      } else {
        student.attendance.push({
          date: targetDate,
          status,
          subject,
        });
        stats.created += 1;
      }
      changedStudentIds.add(String(student._id));
      await student.save();
    }
    await notifyParentsForLowAttendance({
      schoolId,
      campusId,
      studentIds: [...changedStudentIds],
    });

    res.json({
      message: 'Attendance saved successfully',
      date: targetDate.toISOString(),
      ...stats,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Admin views all attendance ===
router.get('/admin/all', adminAuth, async (req, res) => {
  // #swagger.tags = ['Attendance']
  try {
    const schoolId = req.schoolId || req.admin?.schoolId || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    const students = await StudentUser.find({ schoolId }, 'name email attendance');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
