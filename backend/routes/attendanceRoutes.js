const express = require('express');
const router = express.Router();
const StudentUser = require('../models/StudentUser');
const ParentUser = require('../models/ParentUser');
const Timetable = require('../models/Timetable');
const authStudent = require('../middleware/authStudent');
const authTeacher = require('../middleware/authTeacher');
const authParent = require('../middleware/authParent');
const adminAuth = require('../middleware/adminAuth');

const VALID_STATUSES = new Set(['present', 'absent']);

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

const resolveStudentSession = (student) => {
  const date = parseDateValue(student?.admissionDate) || parseDateValue(student?.createdAt);
  if (!date) return '';
  const year = date.getFullYear();
  const next = String((year + 1) % 100).padStart(2, '0');
  return `${year}-${next}`;
};

const resolveStudentClass = (student) => normalizeText(student?.grade);

const resolveStudentSection = (student) => normalizeText(student?.section);

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
  if (!scope?.hasAssignment) return true;
  const className = resolveStudentClass(student).toLowerCase();
  const sectionName = resolveStudentSection(student).toLowerCase();
  if (!className) return false;
  return scope.classSectionKeys.has(`${className}::*`) || scope.classSectionKeys.has(`${className}::${sectionName}`);
};

const buildStudentAttendancePayload = (student, monthRange, selectedDate) => {
  const attendance = Array.isArray(student?.attendance) ? student.attendance : [];
  const monthEntries = attendance.filter((entry) => {
    const entryDate = parseDateValue(entry.date);
    return entryDate && entryDate >= monthRange.start && entryDate <= monthRange.end;
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
  const dayIndex = findAttendanceIndexByDate(attendance, selectedDate);
  const selectedRecord = dayIndex >= 0 ? attendance[dayIndex] : null;

  return {
    _id: student._id,
    name: student?.name || 'Student',
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
    } = req.query || {};
    const monthRange = resolveMonthRange(month);
    const selectedDate = parseDateValue(date) || new Date();
    const requestedClass = normalizeText(className) || normalizeText(classParam);

    const baseFilter = { schoolId };
    if (campusId) baseFilter.campusId = campusId;

    const scopeStudents = await StudentUser.find(baseFilter)
      .select('name grade section roll attendance admissionDate createdAt')
      .lean();

    const scope = await buildClassSectionScope({ schoolId, campusId, teacherId });
    const scopedStudents = scopeStudents.filter((student) => isStudentAllowedForScope(student, scope));
    const normalized = scopedStudents.map((student) =>
      buildStudentAttendancePayload(student, monthRange, selectedDate)
    );

    const sessionSet = new Set(normalized.map((student) => normalizeText(student.session)).filter(Boolean));
    const classSet = new Set(normalized.map((student) => normalizeText(student.className)).filter(Boolean));
    const sectionSet = new Set(normalized.map((student) => normalizeText(student.section)).filter(Boolean));

    const result = normalized
      .filter((student) => {
        if (session && normalizeText(student.session) !== normalizeText(session)) return false;
        if (requestedClass && normalizeText(student.className) !== requestedClass) return false;
        if (section && normalizeText(student.section) !== normalizeText(section)) return false;
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

    if (!targetDate) return res.status(400).json({ error: 'Valid date is required' });
    if (!entries.length) return res.status(400).json({ error: 'entries are required' });

    const stats = { updated: 0, created: 0, skipped: 0 };
    const scope = await buildClassSectionScope({ schoolId, campusId, teacherId });

    for (const item of entries) {
      const studentId = item?.studentId;
      const status = normalizeStatus(item?.status);
      const subject = String(item?.subject || '').trim();

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
      if (!isStudentAllowedForScope(student, scope)) {
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
      await student.save();
    }

    res.json({
      message: 'Attendance saved successfully',
      date: targetDate.toISOString(),
      ...stats,
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
    const { studentId, entryId } = req.params || {};
    const status = normalizeStatus(req.body?.status);
    const subject = String(req.body?.subject || '').trim();
    const date = parseDateValue(req.body?.date);

    if (!VALID_STATUSES.has(status)) {
      return res.status(400).json({ error: 'status must be present or absent' });
    }

    const filter = { _id: studentId, schoolId };
    if (campusId) filter.campusId = campusId;

    const student = await StudentUser.findOne(filter);
    if (!student) return res.status(404).json({ error: 'Student not found' });

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
    const { studentId, entryId } = req.params || {};

    const filter = { _id: studentId, schoolId };
    if (campusId) filter.campusId = campusId;

    const student = await StudentUser.findOne(filter);
    if (!student) return res.status(404).json({ error: 'Student not found' });

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
        .select('name grade section roll attendance')
        .lean();
    }

    if ((!students || students.length === 0) && Array.isArray(parent.children) && parent.children.length > 0) {
      const validNames = parent.children.map((name) => String(name || '').trim()).filter(Boolean);
      if (validNames.length > 0) {
        students = await StudentUser.find({
          ...studentFilter,
          name: { $in: validNames },
        })
          .select('name grade section roll attendance')
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
      .select('name grade section roll attendance admissionDate createdAt')
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
      await student.save();
    }

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

