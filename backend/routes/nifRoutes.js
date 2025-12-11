// backend/routes/nifRoutes.js
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const NifStudent = require('../models/NifStudent');
const NifFeeRecord = require('../models/NifFeeRecord');
const NifCourse = require('../models/NifCourse');
const adminAuth = require('../middleware/adminAuth');

const PROGRAM_LABELS = {
  ADV_CERT: 'Advance Certificate',
  B_VOC: 'B.Voc',
  M_VOC: 'M.Voc',
  B_DES: 'B.Des',
};

const sanitizeString = (value) =>
  typeof value === 'string' ? value.trim() : undefined;

const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const parseDate = (value) => {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

const PROGRAM_DEFAULT_TOTALS = {
  ADV_CERT: 155000,
  B_VOC: 191000,
  M_VOC: 205000,
  B_DES: 203000,
};

const inferProgramTypeFromText = (text = '') => {
  const lower = text.toLowerCase();
  if (lower.includes('b.des') || lower.includes('b des') || lower.includes('4 year')) {
    return 'B_DES';
  }
  if (lower.includes('m.voc') || lower.includes('m voc') || lower.includes('2 year m')) {
    return 'M_VOC';
  }
  if (lower.includes('b.voc') || lower.includes('b voc') || lower.includes('3 year')) {
    return 'B_VOC';
  }
  return 'ADV_CERT';
};

const inferStreamFromText = (text = '') => {
  const lower = text.toLowerCase();
  return lower.includes('interior') ? 'Interior Design' : 'Fashion Design';
};

const deriveProgramMeta = (body = {}, courseDoc = {}) => {
  const gradeText = sanitizeString(body.grade) || '';
  const title = courseDoc.title || gradeText || '';
  const combined = `${title} ${gradeText}`.toLowerCase();
  const stream =
    courseDoc.department ||
    (combined.includes('interior') ? 'Interior Design' : 'Fashion Design');

  let programType =
    courseDoc.programType ||
    (combined.includes('b.des') ||
    combined.includes('b des') ||
    combined.includes('4 year')
      ? 'B_DES'
      : combined.includes('m.voc') ||
        combined.includes('m voc') ||
        combined.includes('2 year m')
      ? 'M_VOC'
      : combined.includes('b.voc') ||
        combined.includes('b voc') ||
        combined.includes('3 year')
      ? 'B_VOC'
      : 'ADV_CERT');

  if (!PROGRAM_DEFAULT_TOTALS[programType]) {
    programType = 'ADV_CERT';
  }

  const programLabel =
    courseDoc.programLabel ||
    (gradeText || PROGRAM_LABELS[programType] || title || stream);

  const totalFee =
    typeof courseDoc.fees === 'number'
      ? courseDoc.fees
      : PROGRAM_DEFAULT_TOTALS[programType];

  const installments = Array.isArray(courseDoc.installments)
    ? courseDoc.installments
    : [];

  return {
    programType,
    programLabel,
    stream,
    courseName: courseDoc.title || title || stream,
    totalFee,
    installments,
  };
};

const buildStudentDoc = (body, courseDoc) => {
  const meta = deriveProgramMeta(body, courseDoc);

  const studentDoc = {
    name: sanitizeString(body.name),
    guardianName: sanitizeString(body.guardianName),
    guardianEmail: sanitizeString(body.guardianEmail)?.toLowerCase(),
    guardianPhone: sanitizeString(body.guardianPhone),
    email: sanitizeString(body.email)?.toLowerCase(),
    mobile: sanitizeString(body.mobile),
    gender: sanitizeString(body.gender) || 'Other',
    dob: parseDate(body.dob),
    address: sanitizeString(body.address) || '',
    pincode: sanitizeString(body.pincode) || '',

    serialNo: parseNumber(body.serialNo),
    batchCode: sanitizeString(body.batchCode),
    admissionDate: parseDate(body.admissionDate),
    academicYear: sanitizeString(body.academicYear) || '2025-26',
    roll: sanitizeString(body.roll),
    grade: sanitizeString(body.grade) || meta.programLabel,
    section: sanitizeString(body.section),
    course: meta.courseName,
    duration: sanitizeString(body.duration) || courseDoc.duration,
    formNo: sanitizeString(body.formNo),
    enrollmentNo: sanitizeString(body.enrollmentNo),

    courseId: courseDoc._id,
    stream: meta.stream,
    programType: meta.programType,
    programLabel: meta.programLabel,
    totalFee: meta.totalFee,
    feeInstallments: meta.installments,

    status: sanitizeString(body.status) || 'Active',
    source: sanitizeString(body.source) || 'manual',
  };

  return { studentDoc, programMeta: meta };
};

const ensureFeeRecordForStudent = async (student) => {
  const existing = await NifFeeRecord.findOne({ student: student._id }).lean();
  if (existing) return existing;

  let courseDoc = null;
  if (student.courseId && mongoose.isValidObjectId(student.courseId)) {
    courseDoc = await NifCourse.findById(student.courseId).lean();
  }

  let programType =
    student.programType ||
    (courseDoc?.programType ||
      inferProgramTypeFromText(student.grade || student.course || ''));

  if (!PROGRAM_DEFAULT_TOTALS[programType]) {
    programType = 'ADV_CERT';
  }

  const programLabel =
    student.programLabel ||
    student.grade ||
    courseDoc?.programLabel ||
    PROGRAM_LABELS[programType];

  const stream =
    student.stream ||
    courseDoc?.department ||
    inferStreamFromText(student.course || student.grade || '');

  const totalFee =
    typeof student.totalFee === 'number' && student.totalFee > 0
      ? student.totalFee
      : typeof courseDoc?.fees === 'number'
      ? courseDoc.fees
      : PROGRAM_DEFAULT_TOTALS[programType];

  const record = await NifFeeRecord.create({
    student: student._id,
    programType,
    programLabel,
    courseId: student.courseId || courseDoc?._id,
    course: stream,
    courseName: student.course || courseDoc?.title || programLabel,
    academicYear: student.academicYear || '2025-26',
    yearNumber: 1,
    totalFee,
    paidAmount: 0,
    dueAmount: totalFee,
    status: 'due',
    installmentsSnapshot: student.feeInstallments || courseDoc?.installments || [],
  });

  return record.toObject();
};

const getFeeSummary = (record) => ({
  totalFee: record?.totalFee || 0,
  paidAmount: record?.paidAmount || 0,
  dueAmount: record?.dueAmount || 0,
  status: record?.status || 'due',
  lastPayment: record?.lastPayment,
});

/* ========== 1) ADD NIF STUDENT + CREATE YEAR-1 FEE ========== */
router.post('/students', adminAuth, async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.name || !body.mobile || !body.courseId) {
      return res.status(400).json({
        message: 'name, mobile and courseId are required',
      });
    }

    if (!mongoose.isValidObjectId(body.courseId)) {
      return res.status(400).json({ message: 'Invalid courseId' });
    }

    const course = await NifCourse.findById(body.courseId).lean();
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const { studentDoc, programMeta } = buildStudentDoc(body, course);
    const student = await NifStudent.create(studentDoc);

    await NifFeeRecord.createForStudentYear(student, 1, {
      totalFee: programMeta.totalFee,
      stream: programMeta.stream,
      courseId: course._id,
      courseName: programMeta.courseName,
      programLabel: student.programLabel || programMeta.programLabel,
      programType: programMeta.programType,
      academicYear: student.academicYear,
      installments: programMeta.installments,
    });

    res.status(201).json(student.toJSON());
  } catch (err) {
    console.error('NIF student create error:', err);
    res.status(400).json({ message: err.message });
  }
});

/* ========== 2) BULK IMPORT STUDENTS ========== */
router.post('/students/bulk', adminAuth, async (req, res) => {
  try {
    const rows = Array.isArray(req.body?.students) ? req.body.students : [];
    if (!rows.length) {
      return res.status(400).json({ message: 'students array required' });
    }

    const courses = await NifCourse.find().lean();
    const courseById = new Map();
    const courseByTitle = new Map();

    courses.forEach((course) => {
      courseById.set(String(course._id), course);
      courseByTitle.set(course.title.toLowerCase(), course);
    });

    const errors = [];
    let imported = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] || {};

      if (!row.name || !row.mobile) {
        errors.push({ index: i, message: 'Missing name or mobile' });
        continue;
      }

      let course = row.courseId
        ? courseById.get(String(row.courseId))
        : null;

      if (!course && row.course) {
        course = courseByTitle.get(String(row.course).toLowerCase());
      }

      if (!course && row.courseName) {
        course = courseByTitle.get(String(row.courseName).toLowerCase());
      }

      if (!course) {
        errors.push({
          index: i,
          message: 'Course not found for row',
        });
        continue;
      }

      try {
        const { studentDoc, programMeta } = buildStudentDoc(
          { ...row, courseId: course._id },
          course
        );
        const student = await NifStudent.create(studentDoc);
        await NifFeeRecord.createForStudentYear(student, 1, {
          totalFee: programMeta.totalFee,
          stream: programMeta.stream,
          courseId: course._id,
          courseName: programMeta.courseName,
          programLabel: student.programLabel || programMeta.programLabel,
          programType: programMeta.programType,
          academicYear: studentDoc.academicYear,
          installments: programMeta.installments,
        });
        imported += 1;
      } catch (err) {
        console.error('bulk import error', err);
        errors.push({ index: i, message: err.message });
      }
    }

    res.json({ imported, failed: errors.length, errors });
  } catch (err) {
    console.error('NIF students bulk error:', err);
    res.status(500).json({ message: 'Bulk import failed' });
  }
});

/* ========== 3) LIST NIF STUDENTS (searchable) ========== */
router.get('/students', adminAuth, async (req, res) => {
  try {
    const q = sanitizeString(req.query.q);
    const filter = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { roll: { $regex: q, $options: 'i' } },
        { course: { $regex: q, $options: 'i' } },
      ];
    }

    const students = await NifStudent.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    const ids = students.map((s) => s._id);

    const feeRecords = await NifFeeRecord.find({
      student: { $in: ids },
      yearNumber: 1,
    })
      .select('student totalFee paidAmount dueAmount status lastPayment')
      .lean();

    const feeByStudent = new Map(
      feeRecords.map((record) => [String(record.student), record])
    );

    const missing = students.filter(
      (student) => !feeByStudent.has(String(student._id))
    );

    if (missing.length) {
      const createdRecords = await Promise.all(
        missing.map((student) => ensureFeeRecordForStudent(student))
      );
      createdRecords.forEach((record) => {
        feeByStudent.set(String(record.student), record);
      });
    }

    const mapped = students.map((s) => ({
      ...s,
      id: s._id,
      feeSummary: getFeeSummary(feeByStudent.get(String(s._id))),
    }));

    res.json(mapped);
  } catch (err) {
    console.error('NIF students list error:', err);
    res.status(500).json({ message: 'Failed to fetch NIF students' });
  }
});

/* ========== 4) GET SINGLE STUDENT WITH FEES ========== */
router.get('/students/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const student = await NifStudent.findById(id).lean();
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const feeRecords = await NifFeeRecord.find({ student: id })
      .sort({ yearNumber: 1 })
      .lean();

    res.json({
      ...student,
      id: student._id,
      feeRecords,
    });
  } catch (err) {
    console.error('NIF student detail error:', err);
    res.status(500).json({ message: 'Failed to fetch student' });
  }
});

/* ========== 5) LIST FEE RECORDS (for Fees Collection UI) ========== */
router.get('/fees', adminAuth, async (req, res) => {
  try {
    const allStudents = await NifStudent.find().lean();
    const studentsWithRecords = await NifFeeRecord.find(
      {},
      { student: 1 }
    ).lean();
    const withRecordSet = new Set(
      studentsWithRecords.map((rec) => String(rec.student))
    );
    const missingStudents = allStudents.filter(
      (student) => !withRecordSet.has(String(student._id))
    );
    if (missingStudents.length) {
      await Promise.all(
        missingStudents.map((student) => ensureFeeRecordForStudent(student))
      );
    }

    const { programType, course, year } = req.query;
    const filter = {};

    if (programType && programType !== 'ALL') {
      filter.programType = programType;
    }

    if (course && course !== 'ALL') {
      filter.course = course;
    }

    if (year && year !== 'ALL') {
      const yearNumber = Number(year);
      if (!Number.isFinite(yearNumber)) {
        return res.status(400).json({ message: 'Invalid year filter' });
      }
      filter.yearNumber = yearNumber;
    }

    const records = await NifFeeRecord.find(filter)
      .populate('student')
      .sort({ createdAt: -1 })
      .lean();

    const result = records.map((r) => ({
      feeRecordId: r._id,
      studentId: r.student?._id,
      name: r.student?.name,
      roll: r.student?.roll,
      program: r.programLabel || r.student?.grade,
      section: r.student?.section,
      course: r.course, // stream
      courseName: r.courseName || r.student?.course,
      academicYear: r.academicYear,
      totalFee: r.totalFee,
      paidAmount: r.paidAmount,
      dueAmount: r.dueAmount,
      lastPayment: r.lastPayment,
      status: r.status,
      installments: r.installmentsSnapshot || [],
    }));

    res.json(result);
  } catch (err) {
    console.error('NIF fees list error:', err);
    res.status(500).json({ message: 'Failed to fetch NIF fees' });
  }
});

/* ========== 6) FEE RECORD DETAILS ========== */
router.get('/fees/details/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const record = await NifFeeRecord.findById(id)
      .populate('student')
      .lean();

    if (!record) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    res.json({
      feeRecordId: record._id,
      student: record.student,
      totalFee: record.totalFee,
      paidAmount: record.paidAmount,
      dueAmount: record.dueAmount,
      status: record.status,
      academicYear: record.academicYear,
      payments: (record.payments || []).sort(
        (a, b) => new Date(b.paidOn) - new Date(a.paidOn)
      ),
      installments: record.installmentsSnapshot || [],
      lastPayment: record.lastPayment,
    });
  } catch (err) {
    console.error('NIF fee details error:', err);
    res.status(500).json({ message: 'Failed to fetch fee details' });
  }
});

/* ========== 7) COLLECT FEES ========== */
router.post('/fees/collect/:id', adminAuth, async (req, res) => {
  try {
    const { amount, method } = req.body;
    const feeRecord = await NifFeeRecord.findById(req.params.id);
    if (!feeRecord) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    const amt = Number(amount);
    if (!amt || amt <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    if (amt > feeRecord.dueAmount) {
      return res.status(400).json({ message: 'Amount exceeds due' });
    }

    feeRecord.paidAmount += amt;
    feeRecord.dueAmount -= amt;
    feeRecord.lastPayment = new Date();
    feeRecord.status = feeRecord.dueAmount === 0 ? 'paid' : 'partial';
    feeRecord.payments.push({
      amount: amt,
      method: method || 'cash',
    });

    await feeRecord.save();
    res.json(feeRecord.toJSON());
  } catch (err) {
    console.error('NIF fee collect error:', err);
    res.status(500).json({ message: 'Failed to collect payment' });
  }
});

module.exports = router;
