const express = require('express');
const mongoose = require('mongoose');
const authTeacher = require('../middleware/authTeacher');
const StudentUser = require('../models/StudentUser');
const StudentProgress = require('../models/StudentProgress');
const Assignment = require('../models/Assignment');
const Timetable = require('../models/Timetable');
const Subject = require('../models/Subject');
const ClassModel = require('../models/Class');
const Section = require('../models/Section');
const TeacherUser = require('../models/TeacherUser');
const TeacherAttendance = require('../models/TeacherAttendance');
const TeacherLeave = require('../models/TeacherLeave');
const TeacherExpense = require('../models/TeacherExpense');

const router = express.Router();
const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_LOOKUP = WEEK_DAYS.reduce((acc, day) => {
  acc[day.toLowerCase()] = day;
  return acc;
}, {});

const normalizeDayLabel = (value) => {
  if (!value) return null;
  return DAY_LOOKUP[String(value).trim().toLowerCase()] || null;
};

const extractId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value._id ? String(value._id) : null;
  return null;
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

const toDateKey = (value = new Date()) => {
  const date = new Date(value);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const toTimeLabel = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

const isLateCheckIn = (value) => {
  if (!value) return false;
  const date = new Date(value);
  return date.getHours() > 9 || (date.getHours() === 9 && date.getMinutes() > 0);
};

const buildMonthRange = (month) => {
  const fallback = new Date();
  const [yearStr, monthStr] = String(month || '').split('-');
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const base = Number.isInteger(year) && Number.isInteger(monthIndex) && monthIndex >= 0 && monthIndex <= 11
    ? new Date(year, monthIndex, 1)
    : new Date(fallback.getFullYear(), fallback.getMonth(), 1);
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
  return {
    from: toDateKey(base),
    to: toDateKey(end),
    year: base.getFullYear(),
    monthIndex: base.getMonth(),
  };
};

const countWeekdaysInMonth = (year, monthIndex, upToDate = null) => {
  const start = new Date(year, monthIndex, 1);
  const end = upToDate || new Date(year, monthIndex + 1, 0);
  let weekdays = 0;
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const day = date.getDay();
    if (day !== 0 && day !== 6) weekdays += 1;
  }
  return weekdays;
};

router.get('/', authTeacher, async (req, res) => {
  // #swagger.tags = ['Teacher Dashboard']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    if (!schoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }

    const campusId = req.campusId || req.user?.campusId || null;
    const teacherId = req.user?.id;
    const teacher = teacherId
      ? await TeacherUser.findById(teacherId).select('name campusName campusType').lean()
      : null;

    const studentFilter = { schoolId };
    if (campusId) {
      studentFilter.campusId = campusId;
    }
    if (campusId) {
      studentFilter.campusId = campusId;
    }
    const students = await StudentUser.find(studentFilter)
      .select('name grade section attendance')
      .lean();
    const studentIds = students.map((student) => student._id);

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    let attendanceMarked = 0;
    let attendancePresent = 0;

    students.forEach((student) => {
      const todays = (student.attendance || []).filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= todayStart && entryDate <= todayEnd;
      });
      if (todays.length > 0) {
        attendanceMarked += 1;
        const hasPresent = todays.some((entry) => entry.status === 'present');
        if (hasPresent) {
          attendancePresent += 1;
        }
      }
    });

    const attendanceRate = attendanceMarked > 0
      ? Math.round((attendancePresent / attendanceMarked) * 1000) / 10
      : 0;

    const progressDocs = studentIds.length > 0
      ? await StudentProgress.find({ schoolId, studentId: { $in: studentIds } }).lean()
      : [];

    let pendingEvaluations = 0;
    const submissionItems = [];
    progressDocs.forEach((doc) => {
      (doc.submissions || []).forEach((submission) => {
        if (submission.status === 'submitted' || submission.status === 'late') {
          pendingEvaluations += 1;
        }
        if (submission.submittedAt) {
          submissionItems.push({
            studentId: doc.studentId,
            assignmentId: submission.assignmentId,
            submittedAt: submission.submittedAt,
            status: submission.status,
          });
        }
      });
    });

    const assignmentIds = [
      ...new Set(submissionItems.map((item) => String(item.assignmentId)).filter(Boolean)),
    ];
    const assignments = assignmentIds.length > 0
      ? await Assignment.find({ _id: { $in: assignmentIds } })
        .select('title subject dueDate')
        .lean()
      : [];
    const assignmentMap = new Map(assignments.map((a) => [String(a._id), a]));
    const studentMap = new Map(students.map((s) => [String(s._id), s]));

    submissionItems.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    const recentActivities = submissionItems.slice(0, 5).map((item, idx) => {
      const assignment = assignmentMap.get(String(item.assignmentId));
      const student = studentMap.get(String(item.studentId));
      const assignmentTitle = assignment?.title || 'Assignment';
      const studentName = student?.name || 'Student';
      const actionText = item.status === 'graded' ? 'graded' : 'submitted';
      return {
        id: `${item.assignmentId}-${idx}`,
        type: 'assignment',
        message: `${studentName} ${actionText} ${assignmentTitle}`,
        time: new Date(item.submittedAt).toISOString(),
        status: item.status,
      };
    });

    const performanceBucket = new Map();
    progressDocs.forEach((doc) => {
      (doc.progressMetrics || []).forEach((metric) => {
        if (!metric.subject) return;
        const key = metric.subject;
        const entry = performanceBucket.get(key) || { total: 0, count: 0 };
        entry.total += metric.averageScore || 0;
        entry.count += 1;
        performanceBucket.set(key, entry);
      });
    });
    const performanceMetrics = [...performanceBucket.entries()]
      .map(([subject, data]) => ({
        subject,
        average: data.count ? Math.round(data.total / data.count) : 0,
        trend: 'neutral',
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 4);

    const topStudents = progressDocs
      .map((doc) => {
        const metrics = doc.progressMetrics || [];
        const avg = metrics.length > 0
          ? Math.round(metrics.reduce((sum, m) => sum + (m.averageScore || 0), 0) / metrics.length)
          : 0;
        const student = studentMap.get(String(doc.studentId));
        const grade = student?.grade || '-';
        const section = student?.section ? `-${student.section}` : '';
        return {
          name: student?.name || 'Student',
          grade: `${grade}${section}`,
          score: avg,
          improvement: doc.improvementTrend || 'stable',
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
    const timetables = teacherId
      ? await Timetable.find({
        schoolId,
        ...(campusId ? { campusId } : {}),
        'entries.teacherId': teacherId,
      }).lean()
      : [];

    const subjectIds = new Set();
    const classIds = new Set();
    const sectionIds = new Set();

    timetables.forEach((timetable) => {
      if (timetable.classId) classIds.add(String(timetable.classId));
      if (timetable.sectionId) sectionIds.add(String(timetable.sectionId));
      (timetable.entries || []).forEach((entry) => {
        if (String(entry.teacherId) !== String(teacherId)) return;
        if (entry.dayOfWeek !== weekday) return;
        if (entry.subjectId) subjectIds.add(String(entry.subjectId));
      });
    });

    const subjectFilter = subjectIds.size ? { _id: { $in: [...subjectIds] } } : null;
    const classFilter = classIds.size ? { _id: { $in: [...classIds] } } : null;
    const sectionFilter = sectionIds.size ? { _id: { $in: [...sectionIds] } } : null;
    if (campusId) {
      if (subjectFilter) subjectFilter.campusId = campusId;
      if (classFilter) classFilter.campusId = campusId;
      if (sectionFilter) sectionFilter.campusId = campusId;
    }

    const [subjects, classes, sections] = await Promise.all([
      subjectFilter
        ? Subject.find(subjectFilter).select('name').lean()
        : [],
      classFilter
        ? ClassModel.find(classFilter).select('name').lean()
        : [],
      sectionFilter
        ? Section.find(sectionFilter).select('name classId').lean()
        : [],
    ]);

    const subjectMap = new Map(subjects.map((s) => [String(s._id), s.name]));
    const classMap = new Map(classes.map((c) => [String(c._id), c.name]));
    const sectionMap = new Map(sections.map((s) => [String(s._id), s.name]));

    const upcomingClasses = [];
    timetables.forEach((timetable) => {
      const className = classMap.get(String(timetable.classId)) || 'Class';
      const sectionName = timetable.sectionId
        ? sectionMap.get(String(timetable.sectionId)) || ''
        : '';
      const classLabel = sectionName ? `${className}-${sectionName}` : className;

      (timetable.entries || []).forEach((entry) => {
        if (String(entry.teacherId) !== String(teacherId)) return;
        if (entry.dayOfWeek !== weekday) return;
        const subjectName = subjectMap.get(String(entry.subjectId)) || 'Subject';
        upcomingClasses.push({
          id: `${timetable._id}-${entry.period}`,
          subject: subjectName,
          class: classLabel,
          time: entry.startTime && entry.endTime
            ? `${entry.startTime} - ${entry.endTime}`
            : `Period ${entry.period}`,
          room: entry.room || 'TBA',
          status: 'upcoming',
        });
      });
    });
    upcomingClasses.sort((a, b) => a.time.localeCompare(b.time));

    const assignmentFilter = { schoolId, dueDate: { $gte: today } };
    if (campusId) {
      assignmentFilter.campusId = campusId;
    }
    const upcomingDeadlines = await Assignment.find(assignmentFilter)
      .sort({ dueDate: 1 })
      .limit(3)
      .select('title class subject dueDate')
      .lean();

    res.json({
      teacher: {
        name: teacher?.name || 'Teacher',
        campusName: teacher?.campusName || null,
        campusType: teacher?.campusType || null,
      },
      stats: {
        totalStudents: students.length,
        attendanceRate,
        pendingEvaluations,
        upcomingEvents: upcomingClasses.length,
      },
      upcomingClasses,
      recentActivities,
      performanceMetrics,
      topStudents,
      upcomingDeadlines: upcomingDeadlines.map((item) => ({
        title: item.title,
        class: item.class || '',
        subject: item.subject || '',
        dueDate: item.dueDate,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to load dashboard data' });
  }
});

router.get('/students', authTeacher, async (req, res) => {
  // #swagger.tags = ['Teacher Dashboard']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    const campusId = req.campusId || req.user?.campusId || null;
    const teacherId = req.user?.id || null;

    if (!schoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }
    if (!teacherId) {
      return res.status(400).json({ error: 'teacherId is required' });
    }

    // Get teacher details to understand their assigned classes
    const teacher = await TeacherUser.findById(teacherId)
      .select('name className class grade sectionName section assignedClasses assignedSections classes sections')
      .lean();

    // Build student filter based on campus
    const studentFilter = { schoolId };
    if (campusId) {
      studentFilter.campusId = campusId;
    }

    // Fetch students
    const students = await StudentUser.find(studentFilter)
      .select('name username rollNumber grade section className sectionName campusId campusName attendance profilePic')
      .sort({ grade: 1, section: 1, rollNumber: 1 })
      .lean();

    // Fetch all classes and sections for filtering options
    const classFilter = { schoolId };
    if (campusId) {
      classFilter.campusId = campusId;
    }

    const [classes, sections] = await Promise.all([
      ClassModel.find(classFilter).select('name').lean(),
      Section.find(classFilter).select('name classId').lean(),
    ]);

    // Format students with their class-section labels
    const formattedStudents = students.map(student => {
      const className = student.className || student.grade || '';
      const sectionName = student.sectionName || student.section || '';
      const classLabel = sectionName ? `${className}-${sectionName}` : className;

      return {
        _id: student._id,
        name: student.name,
        username: student.username,
        rollNumber: student.rollNumber,
        grade: student.grade,
        section: student.section,
        className: student.className,
        sectionName: student.sectionName,
        classLabel,
        campusId: student.campusId,
        campusName: student.campusName,
        profilePic: student.profilePic,
        attendance: student.attendance || []
      };
    });

    res.json({
      students: formattedStudents,
      teacher: teacher || null,
      classes: classes.map(c => c.name),
      sections: sections.map(s => ({ name: s.name, classId: s.classId }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to load students' });
  }
});

router.post('/attendance', authTeacher, async (req, res) => {
  // #swagger.tags = ['Teacher Dashboard']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    const teacherId = req.user?.id || null;
    const { date, attendanceData } = req.body || {};

    if (!schoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }
    if (!teacherId) {
      return res.status(400).json({ error: 'teacherId is required' });
    }
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }
    if (!attendanceData || typeof attendanceData !== 'object') {
      return res.status(400).json({ error: 'attendanceData is required' });
    }

    const attendanceDate = new Date(date);
    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Update attendance for each student
    const updates = [];
    for (const [studentId, status] of Object.entries(attendanceData)) {
      if (!mongoose.isValidObjectId(studentId)) continue;
      if (!['present', 'absent'].includes(status)) continue;

      updates.push(
        StudentUser.findByIdAndUpdate(
          studentId,
          {
            $pull: {
              attendance: {
                date: { $gte: startOfDay, $lte: endOfDay }
              }
            }
          }
        ).then(() =>
          StudentUser.findByIdAndUpdate(
            studentId,
            {
              $push: {
                attendance: {
                  date: attendanceDate,
                  status: status,
                  markedBy: teacherId
                }
              }
            }
          )
        )
      );
    }

    await Promise.all(updates);

    res.json({
      success: true,
      message: 'Attendance saved successfully',
      count: updates.length,
      date: attendanceDate
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to save attendance' });
  }
});

router.get('/work-attendance', authTeacher, async (req, res) => {
  // #swagger.tags = ['Teacher Dashboard']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    const campusId = req.campusId || req.user?.campusId || null;
    const teacherId = req.user?.id || null;
    const { month } = req.query || {};

    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });

    const range = buildMonthRange(month);
    const query = {
      schoolId,
      teacherId,
      dateKey: { $gte: range.from, $lte: range.to },
    };
    if (campusId) query.campusId = campusId;

    const records = await TeacherAttendance.find(query).sort({ dateKey: -1 }).lean();
    const presentDays = records.filter((r) => Boolean(r.checkInAt)).length;
    const lateDays = records.filter((r) => isLateCheckIn(r.checkInAt)).length;

    const today = new Date();
    const sameMonthAsToday = today.getFullYear() === range.year && today.getMonth() === range.monthIndex;
    const upToDate = sameMonthAsToday ? today : null;
    const workingDays = countWeekdaysInMonth(range.year, range.monthIndex, upToDate);
    const absentDays = Math.max(workingDays - presentDays, 0);
    const attendanceRate = workingDays > 0
      ? Math.round(((presentDays + lateDays) / workingDays) * 100)
      : 0;

    const todayKey = toDateKey();
    const todayRecord = records.find((record) => record.dateKey === todayKey) || null;

    res.json({
      records: records.map((record) => ({
        id: record._id,
        date: record.dateKey,
        checkIn: toTimeLabel(record.checkInAt),
        checkOut: toTimeLabel(record.checkOutAt),
        status: record.status || (isLateCheckIn(record.checkInAt) ? 'Late' : 'Present'),
        workingMinutes: record.workingMinutes || 0,
      })),
      today: todayRecord
        ? {
          date: todayRecord.dateKey,
          checkIn: toTimeLabel(todayRecord.checkInAt),
          checkOut: toTimeLabel(todayRecord.checkOutAt),
          hasCheckedIn: Boolean(todayRecord.checkInAt),
          hasCheckedOut: Boolean(todayRecord.checkOutAt),
          status: todayRecord.status || (isLateCheckIn(todayRecord.checkInAt) ? 'Late' : 'Present'),
        }
        : {
          date: todayKey,
          checkIn: '-',
          checkOut: '-',
          hasCheckedIn: false,
          hasCheckedOut: false,
          status: 'Absent',
        },
      stats: {
        presentDays,
        lateDays,
        absentDays,
        attendanceRate,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to load work attendance' });
  }
});

router.post('/work-attendance/check-in', authTeacher, async (req, res) => {
  // #swagger.tags = ['Teacher Dashboard']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    const campusId = req.campusId || req.user?.campusId || null;
    const teacherId = req.user?.id || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });

    const now = new Date();
    const dateKey = toDateKey(now);
    const existing = await TeacherAttendance.findOne({ schoolId, campusId: campusId || null, teacherId, dateKey });
    if (existing?.checkInAt) {
      return res.status(400).json({ error: 'Check-in already recorded for today' });
    }

    const status = isLateCheckIn(now) ? 'Late' : 'Present';
    const record = existing
      ? await TeacherAttendance.findByIdAndUpdate(
        existing._id,
        { $set: { checkInAt: now, status } },
        { new: true, runValidators: true }
      )
      : await TeacherAttendance.create({
        schoolId,
        campusId: campusId || null,
        teacherId,
        dateKey,
        checkInAt: now,
        status,
      });

    res.json({
      message: 'Check-in successful',
      record: {
        date: record.dateKey,
        checkIn: toTimeLabel(record.checkInAt),
        checkOut: toTimeLabel(record.checkOutAt),
        status: record.status,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to check in' });
  }
});

router.post('/work-attendance/check-out', authTeacher, async (req, res) => {
  // #swagger.tags = ['Teacher Dashboard']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    const campusId = req.campusId || req.user?.campusId || null;
    const teacherId = req.user?.id || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });

    const now = new Date();
    const dateKey = toDateKey(now);
    const record = await TeacherAttendance.findOne({ schoolId, campusId: campusId || null, teacherId, dateKey });
    if (!record || !record.checkInAt) {
      return res.status(400).json({ error: 'Please check in first' });
    }
    if (record.checkOutAt) {
      return res.status(400).json({ error: 'Check-out already recorded for today' });
    }

    const workingMinutes = Math.max(Math.round((now.getTime() - new Date(record.checkInAt).getTime()) / 60000), 0);
    record.checkOutAt = now;
    record.workingMinutes = workingMinutes;
    await record.save();

    res.json({
      message: 'Check-out successful',
      record: {
        date: record.dateKey,
        checkIn: toTimeLabel(record.checkInAt),
        checkOut: toTimeLabel(record.checkOutAt),
        status: record.status,
        workingMinutes,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to check out' });
  }
});

router.get('/leave-requests', authTeacher, async (req, res) => {
  // #swagger.tags = ['Teacher Dashboard']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    const campusId = req.campusId || req.user?.campusId || null;
    const teacherId = req.user?.id || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });

    const query = { schoolId, teacherId };
    if (campusId) query.campusId = campusId;
    if (req.query?.status) query.status = String(req.query.status);

    const leaves = await TeacherLeave.find(query).sort({ createdAt: -1 }).lean();
    res.json({
      leaves: leaves.map((leave) => ({
        id: leave._id,
        type: leave.type,
        startDate: leave.startDate,
        endDate: leave.endDate,
        status: leave.status,
        reason: leave.reason,
        adminNote: leave.adminNote || '',
        createdAt: leave.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to load leave requests' });
  }
});

router.post('/leave-requests', authTeacher, async (req, res) => {
  // #swagger.tags = ['Teacher Dashboard']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    const campusId = req.campusId || req.user?.campusId || null;
    const teacherId = req.user?.id || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });

    const { type, startDate, endDate, reason } = req.body || {};
    if (!type || !String(type).trim()) return res.status(400).json({ error: 'Leave type is required' });
    if (!startDate) return res.status(400).json({ error: 'Start date is required' });
    if (!endDate) return res.status(400).json({ error: 'End date is required' });
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ error: 'Start date cannot be after end date' });
    }

    const teacher = await TeacherUser.findById(teacherId).select('name').lean();
    const created = await TeacherLeave.create({
      schoolId,
      campusId: campusId || null,
      teacherId,
      teacherName: teacher?.name || 'Teacher',
      type: String(type).trim(),
      startDate: String(startDate),
      endDate: String(endDate),
      reason: String(reason || '').trim(),
      status: 'Pending',
    });

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leave: {
        id: created._id,
        type: created.type,
        startDate: created.startDate,
        endDate: created.endDate,
        status: created.status,
        reason: created.reason,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to submit leave request' });
  }
});

router.patch('/leave-requests/:id', authTeacher, async (req, res) => {
  // #swagger.tags = ['Teacher Dashboard']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    const campusId = req.campusId || req.user?.campusId || null;
    const teacherId = req.user?.id || null;
    const { id } = req.params || {};
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid leave request id' });

    const filter = { _id: id, schoolId, teacherId };
    if (campusId) filter.campusId = campusId;

    const existing = await TeacherLeave.findOne(filter);
    if (!existing) return res.status(404).json({ error: 'Leave request not found' });
    if (existing.status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending requests can be edited' });
    }

    const { type, startDate, endDate, reason } = req.body || {};
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ error: 'Start date cannot be after end date' });
    }

    if (type !== undefined) existing.type = String(type).trim();
    if (startDate !== undefined) existing.startDate = String(startDate);
    if (endDate !== undefined) existing.endDate = String(endDate);
    if (reason !== undefined) existing.reason = String(reason).trim();

    await existing.save();
    res.json({
      message: 'Leave request updated successfully',
      leave: {
        id: existing._id,
        type: existing.type,
        startDate: existing.startDate,
        endDate: existing.endDate,
        status: existing.status,
        reason: existing.reason,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to update leave request' });
  }
});

router.delete('/leave-requests/:id', authTeacher, async (req, res) => {
  // #swagger.tags = ['Teacher Dashboard']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    const campusId = req.campusId || req.user?.campusId || null;
    const teacherId = req.user?.id || null;
    const { id } = req.params || {};
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid leave request id' });

    const filter = { _id: id, schoolId, teacherId };
    if (campusId) filter.campusId = campusId;

    const existing = await TeacherLeave.findOne(filter).lean();
    if (!existing) return res.status(404).json({ error: 'Leave request not found' });
    if (existing.status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending requests can be deleted' });
    }

    await TeacherLeave.deleteOne({ _id: id });
    res.json({ message: 'Leave request deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to delete leave request' });
  }
});

router.get('/expenses', authTeacher, async (req, res) => {
  // #swagger.tags = ['Teacher Dashboard']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    const campusId = req.campusId || req.user?.campusId || null;
    const teacherId = req.user?.id || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });

    const query = { schoolId, teacherId };
    if (campusId) query.campusId = campusId;
    if (req.query?.status) query.status = String(req.query.status).trim();

    const expenses = await TeacherExpense.find(query).sort({ expenseDate: -1, createdAt: -1 }).lean();
    res.json({
      expenses: expenses.map((expense) => ({
        id: expense._id,
        category: expense.category,
        amount: expense.amount,
        description: expense.description || '',
        date: expense.expenseDate,
        status: expense.status,
        receiptUrl: expense.receiptUrl || '',
        receiptName: expense.receiptName || '',
        adminNote: expense.adminNote || '',
        createdAt: expense.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to load expenses' });
  }
});

router.post('/expenses', authTeacher, async (req, res) => {
  // #swagger.tags = ['Teacher Dashboard']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    const campusId = req.campusId || req.user?.campusId || null;
    const teacherId = req.user?.id || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });

    const { category, amount, description, date, receiptUrl, receiptName } = req.body || {};
    if (!category || !String(category).trim()) return res.status(400).json({ error: 'Category is required' });
    if (amount === undefined || amount === null || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    const expenseDate = date ? String(date) : toDateKey();

    const teacher = await TeacherUser.findById(teacherId).select('name').lean();
    const created = await TeacherExpense.create({
      schoolId,
      campusId: campusId || null,
      teacherId,
      teacherName: teacher?.name || 'Teacher',
      category: String(category).trim(),
      amount: Number(amount),
      description: String(description || '').trim(),
      expenseDate,
      status: 'Pending',
      receiptUrl: String(receiptUrl || '').trim(),
      receiptName: String(receiptName || '').trim(),
    });

    res.status(201).json({
      message: 'Expense submitted successfully',
      expense: {
        id: created._id,
        category: created.category,
        amount: created.amount,
        description: created.description,
        date: created.expenseDate,
        status: created.status,
        receiptUrl: created.receiptUrl,
        receiptName: created.receiptName,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to submit expense' });
  }
});

router.patch('/expenses/:id', authTeacher, async (req, res) => {
  // #swagger.tags = ['Teacher Dashboard']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    const campusId = req.campusId || req.user?.campusId || null;
    const teacherId = req.user?.id || null;
    const { id } = req.params || {};
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid expense id' });

    const filter = { _id: id, schoolId, teacherId };
    if (campusId) filter.campusId = campusId;
    const existing = await TeacherExpense.findOne(filter);
    if (!existing) return res.status(404).json({ error: 'Expense not found' });
    if (existing.status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending expenses can be edited' });
    }

    const { category, amount, description, date, receiptUrl, receiptName } = req.body || {};
    if (amount !== undefined && Number(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }
    if (category !== undefined) existing.category = String(category).trim();
    if (amount !== undefined) existing.amount = Number(amount);
    if (description !== undefined) existing.description = String(description).trim();
    if (date !== undefined) existing.expenseDate = String(date);
    if (receiptUrl !== undefined) existing.receiptUrl = String(receiptUrl || '').trim();
    if (receiptName !== undefined) existing.receiptName = String(receiptName || '').trim();

    await existing.save();
    res.json({
      message: 'Expense updated successfully',
      expense: {
        id: existing._id,
        category: existing.category,
        amount: existing.amount,
        description: existing.description,
        date: existing.expenseDate,
        status: existing.status,
        receiptUrl: existing.receiptUrl,
        receiptName: existing.receiptName,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to update expense' });
  }
});

router.delete('/expenses/:id', authTeacher, async (req, res) => {
  // #swagger.tags = ['Teacher Dashboard']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    const campusId = req.campusId || req.user?.campusId || null;
    const teacherId = req.user?.id || null;
    const { id } = req.params || {};
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid expense id' });

    const filter = { _id: id, schoolId, teacherId };
    if (campusId) filter.campusId = campusId;
    const existing = await TeacherExpense.findOne(filter).lean();
    if (!existing) return res.status(404).json({ error: 'Expense not found' });
    if (existing.status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending expenses can be deleted' });
    }

    await TeacherExpense.deleteOne({ _id: id });
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to delete expense' });
  }
});

router.get('/routine', authTeacher, async (req, res) => {
  // #swagger.tags = ['Teacher Dashboard']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    const campusId = req.campusId || req.user?.campusId || null;
    const teacherId = req.user?.id || null;

    if (!schoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }
    if (!teacherId) {
      return res.status(400).json({ error: 'teacherId is required' });
    }

    // Build timetable filter - campusId is optional
    const timetableFilter = {
      schoolId,
      'entries.teacherId': teacherId,
    };

    if (campusId) {
      timetableFilter.campusId = campusId;
    }

    const timetables = await Timetable.find(timetableFilter)
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('entries.subjectId', 'name')
      .lean();

    // Fallback for legacy records that may not have campusId set
    if (campusId && (!Array.isArray(timetables) || timetables.length === 0)) {
      timetables = await Timetable.find(baseFilter)
        .populate('classId', 'name')
        .populate('sectionId', 'name')
        .populate('entries.subjectId', 'name')
        .lean();
      routineSource = 'school-fallback';
    }

    const schedule = {};
    const assignedClassLabels = new Set();
    WEEK_DAYS.forEach((day) => {
      schedule[day] = [];
    });

    timetables.forEach((tt) => {
      const className = tt.classId?.name || 'Class';
      const sectionName = tt.sectionId?.name || '';
      const classLabel = sectionName ? `${className}-${sectionName}` : className;
      assignedClassLabels.add(classLabel);

      (tt.entries || []).forEach((entry) => {
        if (extractId(entry.teacherId) !== String(teacherId)) return;
        const normalizedDay = normalizeDayLabel(entry.dayOfWeek);
        if (!normalizedDay || !schedule[normalizedDay]) return;

        schedule[normalizedDay].push({
          subject: entry.subjectId?.name || 'Subject',
          className,
          sectionName,
          classLabel,
          room: entry.room || 'TBA',
          startTime: entry.startTime || '',
          endTime: entry.endTime || '',
          period: entry.period || null,
        });
      });
    });

    WEEK_DAYS.forEach((day) => {
      schedule[day].sort((a, b) => {
        if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
        if (a.period && b.period) return a.period - b.period;
        return 0;
      });
    });

    // Fetch teacher profile for credential-based filtering on frontend
    const teacher = await TeacherUser.findById(teacherId)
      .select('name className class grade sectionName section assignedClasses assignedSections classes sections')
      .lean();

    res.json({
      schedule,
      teacher: teacher || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to load teacher routine' });
  }
});

module.exports = router;
