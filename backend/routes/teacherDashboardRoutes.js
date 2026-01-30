const express = require('express');
const authTeacher = require('../middleware/authTeacher');
const StudentUser = require('../models/StudentUser');
const StudentProgress = require('../models/StudentProgress');
const Assignment = require('../models/Assignment');
const Timetable = require('../models/Timetable');
const Subject = require('../models/Subject');
const ClassModel = require('../models/Class');
const Section = require('../models/Section');
const TeacherUser = require('../models/TeacherUser');

const router = express.Router();

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

module.exports = router;
