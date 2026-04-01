const express = require('express');
const mongoose = require('mongoose');
const adminAuth = require('../middleware/adminAuth');
const authStudent = require('../middleware/authStudent');
const authParent = require('../middleware/authParent');

const StudentUser = require('../models/StudentUser');
const TeacherUser = require('../models/TeacherUser');
const ParentUser = require('../models/ParentUser');
const FeeInvoice = require('../models/FeeInvoice');
const ExamResult = require('../models/ExamResult');
const ClassModel = require('../models/Class');
const Section = require('../models/Section');
const AcademicYear = require('../models/AcademicYear');
const School = require('../models/School');
const ReportCardTemplate = require('../models/ReportCardTemplate');

const router = express.Router();

const REPORT_CARD_DEFAULTS = {
  title: 'Report Card',
  subtitle: 'Academic Performance Report',
  schoolNameOverride: '',
  logoUrlOverride: '',
  schoolAddressLine: '',
  schoolContactLine: '',
  accentColor: '#1f2937',
  showPageBorder: true,
  watermarkText: '',
  footerNote: 'This is a computer-generated report card.',
  signatureLabel: 'Class Teacher',
  principalLabel: 'Principal',
};

const normalizeKey = (value) => String(value || '').trim().toLowerCase();

const toDateValue = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const computeGrade = (percentage) => {
  if (!Number.isFinite(percentage)) return '';
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
};

const resolveSchoolId = (req, res) => {
  const schoolId = req.schoolId || req.admin?.schoolId || req.user?.schoolId || null;
  if (!schoolId) {
    res.status(400).json({ error: 'schoolId is required' });
    return null;
  }
  if (!mongoose.isValidObjectId(schoolId)) {
    res.status(400).json({ error: 'Invalid schoolId' });
    return null;
  }
  return schoolId;
};

const resolveCampusId = (req) => req.campusId || req.user?.campusId || null;

const buildStudentScopeFilter = ({ schoolId, campusId }) => ({
  schoolId,
  ...(campusId ? { campusId } : {}),
  isArchived: { $ne: true },
});

const resolveTemplate = async ({ schoolId, campusId }) => {
  let template = null;
  if (campusId) {
    template = await ReportCardTemplate.findOne({
      schoolId,
      $or: [{ campusId }, { campusId: null }, { campusId: { $exists: false } }],
    })
      .sort({ campusId: -1, updatedAt: -1 })
      .lean();
  } else {
    template = await ReportCardTemplate.findOne({ schoolId, campusId: null }).lean();
  }

  const school = await School.findById(schoolId).select('name logo').lean();
  const schoolName = template?.schoolNameOverride || school?.name || '';
  const logoUrl = template?.logoUrlOverride || school?.logo?.secure_url || school?.logo?.url || '';

  return {
    ...REPORT_CARD_DEFAULTS,
    ...(template || {}),
    schoolName,
    logoUrl,
  };
};

const resolveClassAndSection = async ({ schoolId, campusId, classId, sectionId }) => {
  let classDoc = null;
  let sectionDoc = null;

  if (classId) {
    if (!mongoose.isValidObjectId(classId)) {
      return { error: 'Invalid classId' };
    }
    classDoc = await ClassModel.findOne({
      _id: classId,
      schoolId,
      ...(campusId ? { campusId } : {}),
    }).lean();
    if (!classDoc) return { error: 'Class not found' };
  }

  if (sectionId) {
    if (!mongoose.isValidObjectId(sectionId)) {
      return { error: 'Invalid sectionId' };
    }
    sectionDoc = await Section.findOne({
      _id: sectionId,
      schoolId,
      ...(campusId ? { campusId } : {}),
    }).lean();
    if (!sectionDoc) return { error: 'Section not found' };
  }

  if (classDoc && sectionDoc && String(sectionDoc.classId) !== String(classDoc._id)) {
    return { error: 'Section does not belong to selected class' };
  }

  return { classDoc, sectionDoc };
};

const resolveAcademicYear = async ({ schoolId, academicYearId, academicYear }) => {
  if (academicYearId) {
    if (!mongoose.isValidObjectId(academicYearId)) {
      return { error: 'Invalid academicYearId' };
    }
    const yearDoc = await AcademicYear.findOne({ _id: academicYearId, schoolId }).lean();
    if (!yearDoc) return { error: 'Academic year not found' };
    return { yearDoc, academicYearName: yearDoc.name || '' };
  }
  return { yearDoc: null, academicYearName: String(academicYear || '').trim() };
};

const withinAcademicYear = (examDate, yearDoc) => {
  if (!yearDoc) return true;
  const parsedDate = toDateValue(examDate);
  if (!parsedDate) return false;
  const start = toDateValue(yearDoc.startDate);
  const end = toDateValue(yearDoc.endDate);
  if (start && parsedDate < start) return false;
  if (end && parsedDate > end) return false;
  return true;
};

const buildReportCards = async ({
  schoolId,
  campusId,
  students,
  className,
  sectionName,
  academicYearName,
  yearDoc,
  includeUnpublished,
}) => {
  if (!students.length) return [];
  const studentIds = students.map((student) => student._id);
  const results = await ExamResult.find({
    schoolId,
    ...(campusId ? { campusId } : {}),
    studentId: { $in: studentIds },
    ...(includeUnpublished ? {} : { published: true }),
  })
    .populate('examId', 'title subject term date marks grade section classId sectionId')
    .sort({ createdAt: -1 })
    .lean();

  const byStudent = new Map();
  results.forEach((result) => {
    const key = String(result.studentId);
    if (!byStudent.has(key)) byStudent.set(key, []);
    byStudent.get(key).push(result);
  });

  return students.map((student) => {
    const studentResults = byStudent.get(String(student._id)) || [];
    const subjectMap = new Map();
    const examItems = [];

    studentResults.forEach((result) => {
      const exam = result.examId || {};
      const examClassName = String(exam.grade || '').trim();
      const examSectionName = String(exam.section || '').trim();

      if (className && normalizeKey(examClassName) && normalizeKey(examClassName) !== normalizeKey(className)) {
        return;
      }
      if (
        sectionName &&
        normalizeKey(examSectionName) &&
        normalizeKey(examSectionName) !== normalizeKey(sectionName)
      ) {
        return;
      }
      if (yearDoc && !withinAcademicYear(exam.date, yearDoc)) {
        return;
      }

      const subjectName = String(exam.subject || 'Subject').trim() || 'Subject';
      const obtained = Number(result.marks || 0);
      const maxMarks = Number(exam.marks || 0);
      const percentage = maxMarks > 0 ? (obtained / maxMarks) * 100 : 0;

      const existing = subjectMap.get(subjectName) || {
        name: subjectName,
        obtained: 0,
        maxMarks: 0,
        examCount: 0,
      };
      existing.obtained += obtained;
      existing.maxMarks += maxMarks;
      existing.examCount += 1;
      subjectMap.set(subjectName, existing);

      examItems.push({
        examName: exam.title || 'Exam',
        subject: subjectName,
        term: exam.term || '',
        date: exam.date || result.createdAt,
        obtainedMarks: obtained,
        totalMarks: maxMarks,
        percentage: Math.round(percentage),
        status: result.status || 'pass',
        remarks: result.remarks || '',
      });
    });

    const subjects = Array.from(subjectMap.values())
      .map((item) => {
        const percentage = item.maxMarks > 0 ? (item.obtained / item.maxMarks) * 100 : 0;
        return {
          name: item.name,
          obtainedMarks: item.obtained,
          totalMarks: item.maxMarks,
          percentage: Math.round(percentage),
          grade: computeGrade(percentage),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    const totalObtained = subjects.reduce((sum, subject) => sum + Number(subject.obtainedMarks || 0), 0);
    const totalMarks = subjects.reduce((sum, subject) => sum + Number(subject.totalMarks || 0), 0);
    const overallPercentage = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;

    return {
      studentId: student._id,
      studentName: student.name || 'Student',
      studentCode: student.studentCode || '',
      username: student.username || '',
      admissionNumber: student.admissionNumber || '',
      roll: student.roll || '',
      grade: student.grade || '',
      section: student.section || '',
      academicYear: academicYearName || student.academicYear || '',
      totals: {
        obtainedMarks: totalObtained,
        totalMarks,
        percentage: Math.round(overallPercentage * 100) / 100,
        grade: computeGrade(overallPercentage),
      },
      subjects,
      exams: examItems.sort((a, b) => {
        const d1 = toDateValue(a.date)?.getTime() || 0;
        const d2 = toDateValue(b.date)?.getTime() || 0;
        return d2 - d1;
      }),
      generatedAt: new Date(),
    };
  });
};

router.get('/summary', adminAuth, async (req, res) => {
  // #swagger.tags = ['Reports']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    const [studentCount, teacherCount, parentCount] = await Promise.all([
      StudentUser.countDocuments({ schoolId }),
      TeacherUser.countDocuments({ schoolId }),
      ParentUser.countDocuments({ schoolId }),
    ]);

    const feeTotals = await FeeInvoice.aggregate([
      { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
          balanceAmount: { $sum: '$balanceAmount' },
        },
      },
    ]);

    const fee = feeTotals[0] || { totalAmount: 0, paidAmount: 0, balanceAmount: 0 };

    const attendanceTotals = await StudentUser.aggregate([
      { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
      { $unwind: { path: '$attendance', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: null,
          totalMarked: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ['$attendance.status', 'present'] }, 1, 0],
            },
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ['$attendance.status', 'absent'] }, 1, 0],
            },
          },
        },
      },
    ]);

    const attendance = attendanceTotals[0] || { totalMarked: 0, present: 0, absent: 0 };

    res.json({
      users: { students: studentCount, teachers: teacherCount, parents: parentCount },
      fees: fee,
      attendance,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/report-cards/template', adminAuth, async (req, res) => {
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);
    const template = await resolveTemplate({ schoolId, campusId });
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/report-cards/template', adminAuth, async (req, res) => {
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);

    const payload = req.body || {};
    const updates = {
      title: String(payload.title || REPORT_CARD_DEFAULTS.title).trim(),
      subtitle: String(payload.subtitle || REPORT_CARD_DEFAULTS.subtitle).trim(),
      schoolNameOverride: String(payload.schoolNameOverride || '').trim(),
      logoUrlOverride: String(payload.logoUrlOverride || '').trim(),
      schoolAddressLine: String(payload.schoolAddressLine || '').trim(),
      schoolContactLine: String(payload.schoolContactLine || '').trim(),
      accentColor: String(payload.accentColor || REPORT_CARD_DEFAULTS.accentColor).trim(),
      showPageBorder: payload.showPageBorder !== undefined ? Boolean(payload.showPageBorder) : true,
      watermarkText: String(payload.watermarkText || '').trim(),
      footerNote: String(payload.footerNote || REPORT_CARD_DEFAULTS.footerNote).trim(),
      signatureLabel: String(payload.signatureLabel || REPORT_CARD_DEFAULTS.signatureLabel).trim(),
      principalLabel: String(payload.principalLabel || REPORT_CARD_DEFAULTS.principalLabel).trim(),
    };

    await ReportCardTemplate.findOneAndUpdate(
      { schoolId, campusId: campusId || null },
      {
        schoolId,
        campusId: campusId || null,
        ...updates,
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    const template = await resolveTemplate({ schoolId, campusId });
    res.json({ message: 'Report card template saved', template });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/report-cards/bulk', adminAuth, async (req, res) => {
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);

    const {
      classId,
      sectionId,
      academicYearId,
      academicYear,
      includeUnpublished = false,
    } = req.body || {};

    const [scope, yearResult] = await Promise.all([
      resolveClassAndSection({ schoolId, campusId, classId, sectionId }),
      resolveAcademicYear({ schoolId, academicYearId, academicYear }),
    ]);

    if (scope.error) return res.status(400).json({ error: scope.error });
    if (yearResult.error) return res.status(400).json({ error: yearResult.error });

    const className = scope.classDoc?.name || '';
    const sectionName = scope.sectionDoc?.name || '';
    const academicYearName = yearResult.academicYearName || '';

    const studentFilter = buildStudentScopeFilter({ schoolId, campusId });
    if (className) studentFilter.grade = className;
    if (sectionName) studentFilter.section = sectionName;
    if (academicYearName) studentFilter.academicYear = academicYearName;

    const students = await StudentUser.find(studentFilter)
      .select('name roll grade section academicYear admissionNumber username studentCode')
      .sort({ roll: 1, name: 1 })
      .lean();

    const [template, reportCards] = await Promise.all([
      resolveTemplate({ schoolId, campusId }),
      buildReportCards({
        schoolId,
        campusId,
        students,
        className,
        sectionName,
        academicYearName,
        yearDoc: yearResult.yearDoc,
        includeUnpublished: Boolean(includeUnpublished),
      }),
    ]);

    res.json({
      template,
      filters: {
        classId: classId || '',
        sectionId: sectionId || '',
        className,
        sectionName,
        academicYearId: academicYearId || '',
        academicYear: academicYearName,
        includeUnpublished: Boolean(includeUnpublished),
      },
      meta: {
        totalStudents: students.length,
        generatedCards: reportCards.length,
      },
      reportCards,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/report-cards/me', authStudent, async (req, res) => {
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);

    const student = await StudentUser.findOne({
      _id: req.user.id,
      schoolId,
      ...(campusId ? { campusId } : {}),
    })
      .select('name roll grade section academicYear admissionNumber username studentCode')
      .lean();

    if (!student) return res.status(404).json({ error: 'Student not found' });

    const [template, cards] = await Promise.all([
      resolveTemplate({ schoolId, campusId }),
      buildReportCards({
        schoolId,
        campusId,
        students: [student],
        className: student.grade || '',
        sectionName: student.section || '',
        academicYearName: student.academicYear || '',
        yearDoc: null,
        includeUnpublished: false,
      }),
    ]);

    res.json({
      template,
      reportCard: cards[0] || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/report-cards/parent', authParent, async (req, res) => {
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);
    const studentId = req.query?.studentId;

    const parent = await ParentUser.findOne({ _id: req.user.id, schoolId })
      .select('childrenIds children')
      .lean();
    if (!parent) return res.status(404).json({ error: 'Parent not found' });

    const scopeFilter = buildStudentScopeFilter({ schoolId, campusId });
    let students = [];

    if (Array.isArray(parent.childrenIds) && parent.childrenIds.length > 0) {
      students = await StudentUser.find({
        ...scopeFilter,
        _id: { $in: parent.childrenIds },
      })
        .select('name roll grade section academicYear admissionNumber username studentCode')
        .sort({ roll: 1, name: 1 })
        .lean();
    } else if (Array.isArray(parent.children) && parent.children.length > 0) {
      const childNames = parent.children.map((name) => String(name || '').trim()).filter(Boolean);
      if (childNames.length > 0) {
        students = await StudentUser.find({
          ...scopeFilter,
          name: { $in: childNames },
        })
          .select('name roll grade section academicYear admissionNumber username studentCode')
          .sort({ roll: 1, name: 1 })
          .lean();
      }
    }

    if (studentId) {
      students = students.filter((student) => String(student._id) === String(studentId));
      if (!students.length) {
        return res.status(404).json({ error: 'Student not linked to parent account' });
      }
    }

    const [template, reportCards] = await Promise.all([
      resolveTemplate({ schoolId, campusId }),
      buildReportCards({
        schoolId,
        campusId,
        students,
        className: '',
        sectionName: '',
        academicYearName: '',
        yearDoc: null,
        includeUnpublished: false,
      }),
    ]);

    res.json({ template, reportCards });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
