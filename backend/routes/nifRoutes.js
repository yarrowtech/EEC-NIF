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

const mapInstallments = (items = []) =>
  items.map((inst) => ({
    label: inst.label,
    amount: inst.amount,
    dueMonth: inst.dueMonth,
    status: inst.status || 'due',
    paid: inst.paid || 0,
    outstanding:
      inst.outstanding != null ? inst.outstanding : inst.amount - (inst.paid || 0),
    paidOn: inst.paidOn,
    method: inst.method,
    discountImpact: inst.discountImpact || 0,
  }));

const applyDiscountToInstallments = (items = [], discountAmount = 0) => {
  const normalized = items.map((inst) => {
    const amount = Number(inst.amount || 0);
    const paid = Number(inst.paid || 0);
    const outstanding =
      inst.outstanding != null
        ? Math.max(0, Number(inst.outstanding))
        : Math.max(0, amount - paid);
    return {
      ...inst,
      amount,
      paid,
      outstanding,
      discountImpact: 0,
    };
  });

  let remainingDiscount = Math.max(0, Number(discountAmount || 0));
  if (!remainingDiscount) {
    return normalized;
  }

  for (let idx = normalized.length - 1; idx >= 0; idx -= 1) {
    if (remainingDiscount <= 0) break;
    const inst = normalized[idx];
    if (inst.outstanding <= 0) continue;
    const reduction = Math.min(inst.outstanding, remainingDiscount);
    if (reduction <= 0) continue;

    const newOutstanding = inst.outstanding - reduction;
    inst.outstanding = newOutstanding;
    inst.amount = inst.paid + newOutstanding;
    inst.discountImpact += reduction;

    if (newOutstanding === 0) {
      inst.status = inst.paid > 0 ? 'paid' : 'discounted';
    } else if (inst.status === 'paid' || inst.status === 'due') {
      inst.status = 'partial';
    }

    remainingDiscount -= reduction;
  }

  return normalized;
};

const computeDueAmount = (record = {}) => {
  const total = Number(record.totalFee || 0);
  const discount = Number(record.discountAmount || 0);
  const paid = Number(record.paidAmount || 0);
  return Math.max(0, total - discount - paid);
};

const recomputeDueAndStatus = (record) => {
  record.dueAmount = computeDueAmount(record);
  if (record.dueAmount === 0) {
    if (record.paidAmount > 0) {
      record.status = 'paid';
    } else if (Number(record.discountAmount || 0) > 0) {
      record.status = 'discounted';
    } else {
      record.status = 'paid';
    }
  } else {
    record.status = record.paidAmount > 0 ? 'partial' : 'due';
  }
  return record.dueAmount;
};

const PROGRAM_INSTALLMENTS = {
  ADV_CERT: [
    { label: 'Admission Fee', amount: 22000, dueMonth: 'Admission' },
    { label: 'Batch Commencement', amount: 19000, dueMonth: 'Commencement' },
    { label: 'Registration Part 1', amount: 5000, dueMonth: 'Week 1' },
    { label: 'Registration Part 2', amount: 17000, dueMonth: 'Month 1' },
    { label: 'Registration Part 3', amount: 17000, dueMonth: 'Month 3' },
    { label: 'Installment 1', amount: 7500, dueMonth: 'Month 1' },
    { label: 'Installment 2', amount: 7500, dueMonth: 'Month 2' },
    { label: 'Installment 3', amount: 7500, dueMonth: 'Month 3' },
    { label: 'Installment 4', amount: 7500, dueMonth: 'Month 4' },
    { label: 'Installment 5', amount: 7500, dueMonth: 'Month 5' },
    { label: 'Installment 6', amount: 7500, dueMonth: 'Month 6' },
    { label: 'Installment 7', amount: 7500, dueMonth: 'Month 7' },
    { label: 'Installment 8', amount: 7500, dueMonth: 'Month 8' },
    { label: 'Installment 9', amount: 7500, dueMonth: 'Month 9' },
    { label: 'Installment 10', amount: 7500, dueMonth: 'Month 10' },
  ],
  B_VOC: [
    { label: 'Admission Fee', amount: 22000, dueMonth: 'Admission' },
    { label: 'MSU Fee (Odd Sem)', amount: 18000, dueMonth: 'Sem 1' },
    { label: 'Batch Commencement', amount: 19000, dueMonth: 'Commencement' },
    { label: 'Registration Part 1', amount: 5000, dueMonth: 'Week 1' },
    { label: 'Registration Part 2', amount: 17000, dueMonth: 'Month 1' },
    { label: 'Registration Part 3', amount: 17000, dueMonth: 'Month 3' },
    { label: 'MSU Fee (Even Sem)', amount: 18000, dueMonth: 'Sem 2' },
    { label: 'Installment 1', amount: 7500, dueMonth: 'Month 1' },
    { label: 'Installment 2', amount: 7500, dueMonth: 'Month 2' },
    { label: 'Installment 3', amount: 7500, dueMonth: 'Month 3' },
    { label: 'Installment 4', amount: 7500, dueMonth: 'Month 4' },
    { label: 'Installment 5', amount: 7500, dueMonth: 'Month 5' },
    { label: 'Installment 6', amount: 7500, dueMonth: 'Month 6' },
    { label: 'Installment 7', amount: 7500, dueMonth: 'Month 7' },
    { label: 'Installment 8', amount: 7500, dueMonth: 'Month 8' },
    { label: 'Installment 9', amount: 7500, dueMonth: 'Month 9' },
    { label: 'Installment 10', amount: 7500, dueMonth: 'Month 10' },
  ],
  M_VOC: [
    { label: 'Admission Fee', amount: 22000, dueMonth: 'Admission' },
    { label: 'MSU Fee (Odd Sem)', amount: 24000, dueMonth: 'Semester 1' },
    { label: 'Batch Commencement', amount: 19000, dueMonth: 'Commencement' },
    { label: 'Registration Part 1', amount: 5000, dueMonth: 'Week 1' },
    { label: 'Registration Part 2', amount: 24000, dueMonth: 'Month 1' },
    { label: 'Registration Part 3', amount: 24000, dueMonth: 'Month 3' },
    { label: 'Installment 1', amount: 7500, dueMonth: 'Month 1' },
    { label: 'Installment 2', amount: 7500, dueMonth: 'Month 2' },
    { label: 'Installment 3', amount: 7500, dueMonth: 'Month 3' },
    { label: 'Installment 4', amount: 7500, dueMonth: 'Month 4' },
    { label: 'Installment 5', amount: 7500, dueMonth: 'Month 5' },
    { label: 'Installment 6', amount: 7500, dueMonth: 'Month 6' },
    { label: 'Installment 7', amount: 7500, dueMonth: 'Month 7' },
    { label: 'Installment 8', amount: 7500, dueMonth: 'Month 8' },
    { label: 'Installment 9', amount: 7500, dueMonth: 'Month 9' },
    { label: 'Installment 10', amount: 7500, dueMonth: 'Month 10' },
  ],
  B_DES: [
    { label: 'Admission Fee', amount: 22000, dueMonth: 'Admission' },
    { label: 'MSU Fee (Odd Sem)', amount: 24000, dueMonth: 'Odd Sem' },
    { label: 'Batch Commencement', amount: 19000, dueMonth: 'Commencement' },
    { label: 'Registration Part 1', amount: 5000, dueMonth: 'Week 1' },
    { label: 'Registration Part 2', amount: 17000, dueMonth: 'Month 1' },
    { label: 'Registration Part 3', amount: 17000, dueMonth: 'Month 3' },
    { label: 'MSU Fee (Even Sem)', amount: 24000, dueMonth: 'Even Sem' },
    { label: 'Installment 1', amount: 7500, dueMonth: 'Month 1' },
    { label: 'Installment 2', amount: 7500, dueMonth: 'Month 2' },
    { label: 'Installment 3', amount: 7500, dueMonth: 'Month 3' },
    { label: 'Installment 4', amount: 7500, dueMonth: 'Month 4' },
    { label: 'Installment 5', amount: 7500, dueMonth: 'Month 5' },
    { label: 'Installment 6', amount: 7500, dueMonth: 'Month 6' },
    { label: 'Installment 7', amount: 7500, dueMonth: 'Month 7' },
    { label: 'Installment 8', amount: 7500, dueMonth: 'Month 8' },
    { label: 'Installment 9', amount: 7500, dueMonth: 'Month 9' },
    { label: 'Installment 10', amount: 7500, dueMonth: 'Month 10' },
  ],
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

  const installments =
    Array.isArray(courseDoc.installments) && courseDoc.installments.length
      ? courseDoc.installments
      : PROGRAM_INSTALLMENTS[programType] || [];

  return {
    programType,
    programLabel,
    stream,
    courseName: courseDoc.title || title || stream,
    totalFee,
    installments: mapInstallments(installments),
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

  let installments =
    (student.feeInstallments && student.feeInstallments.length
      ? student.feeInstallments
      : courseDoc?.installments) || [];
  if (!installments.length) {
    installments = PROGRAM_INSTALLMENTS[programType] || [];
  }
  installments = mapInstallments(installments);

  const initialStatus = totalFee === 0 ? 'paid' : 'due';

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
    discountAmount: 0,
    paidAmount: 0,
    dueAmount: totalFee,
    status: initialStatus,
    installmentsSnapshot: installments,
    archived: student.archived || false,
  });

  return record.toObject();
};

const getFeeSummary = (record) => ({
  totalFee: record?.totalFee || 0,
  paidAmount: record?.paidAmount || 0,
  dueAmount: record?.dueAmount || 0,
  discountAmount: record?.discountAmount || 0,
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

    const record = await NifFeeRecord.findById(id).populate('student');

    if (!record) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    let installments = record.installmentsSnapshot || [];
    if (!installments.length) {
      let fallbackInstallments = [];
      if (record.courseId && mongoose.isValidObjectId(record.courseId)) {
        const courseDoc = await NifCourse.findById(record.courseId).lean();
        if (courseDoc?.installments?.length) {
          fallbackInstallments = courseDoc.installments;
        }
      }
      if (!fallbackInstallments.length && record.student?.feeInstallments?.length) {
        fallbackInstallments = record.student.feeInstallments;
      }
      if (!fallbackInstallments.length) {
        fallbackInstallments = PROGRAM_INSTALLMENTS[record.programType] || [];
      }
      installments = mapInstallments(fallbackInstallments);
      record.installmentsSnapshot = installments;
      record.markModified('installmentsSnapshot');
      try {
        await record.save();
      } catch (saveErr) {
        console.warn('Could not persist installmentsSnapshot', saveErr);
      }
    }

    const discountToApply = Number(record.discountAmount || 0);
    if (discountToApply > 0) {
      const adjusted = applyDiscountToInstallments(installments, discountToApply);
      const changed =
        adjusted.length !== installments.length ||
        adjusted.some((inst, idx) => {
          const original = installments[idx];
          return (
            Number(inst.outstanding || 0) !== Number(original.outstanding || 0) ||
            Number(inst.amount || 0) !== Number(original.amount || 0) ||
            Number(inst.discountImpact || 0) !== Number(original.discountImpact || 0) ||
            (inst.status || '') !== (original.status || '')
          );
        });

      if (changed) {
        record.installmentsSnapshot = adjusted;
        record.markModified('installmentsSnapshot');
        installments = adjusted;
        try {
          await record.save();
        } catch (saveErr) {
          console.warn('Could not persist discounted installments', saveErr);
        }
      } else {
        installments = adjusted;
      }
    }

    const obj = record.toObject();

    res.json({
      feeRecordId: obj._id,
      student: obj.student,
      totalFee: obj.totalFee,
      paidAmount: obj.paidAmount,
      dueAmount: obj.dueAmount,
      discountAmount: obj.discountAmount || 0,
      discountNote: obj.discountNote || '',
      status: obj.status,
      academicYear: obj.academicYear,
      payments: (obj.payments || []).sort((a, b) => new Date(b.paidOn) - new Date(a.paidOn)),
      installments,
      lastPayment: obj.lastPayment,
    });
  } catch (err) {
    console.error('NIF fee details error:', err);
    res.status(500).json({ message: 'Failed to fetch fee details' });
  }
});

/* ========== 7) COLLECT FEES ========== */
router.post('/fees/discount/:id', adminAuth, async (req, res) => {
  try {
    const { amount, note } = req.body || {};
    const record = await NifFeeRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    if (amount === undefined || amount === null) {
      return res.status(400).json({ message: 'Discount amount is required' });
    }

    const discount = Number(amount);
    if (!Number.isFinite(discount) || discount < 0) {
      return res.status(400).json({ message: 'Invalid discount amount' });
    }
    if (discount > record.totalFee) {
      return res.status(400).json({ message: 'Discount exceeds total fee' });
    }

    record.discountAmount = discount;
    record.discountNote = note ? String(note).trim() : '';
    recomputeDueAndStatus(record);

    let installments = record.installmentsSnapshot || [];
    if (!installments.length) {
      let fallbackInstallments = [];
      if (record.courseId && mongoose.isValidObjectId(record.courseId)) {
        const courseDoc = await NifCourse.findById(record.courseId).lean();
        if (courseDoc?.installments?.length) {
          fallbackInstallments = courseDoc.installments;
        }
      }
      if (!fallbackInstallments.length && record.student?.feeInstallments?.length) {
        fallbackInstallments = record.student.feeInstallments;
      }
      if (!fallbackInstallments.length) {
        fallbackInstallments = PROGRAM_INSTALLMENTS[record.programType] || [];
      }
      installments = mapInstallments(fallbackInstallments);
    }
    const adjustedInstallments = applyDiscountToInstallments(
      installments,
      record.discountAmount
    );
    record.installmentsSnapshot = adjustedInstallments;
    record.markModified('installmentsSnapshot');

    await record.save();
    res.json(record.toJSON());
  } catch (err) {
    console.error('NIF discount error:', err);
    res.status(500).json({ message: 'Failed to update discount' });
  }
});

router.post('/fees/installments/pay/:id', adminAuth, async (req, res) => {
  try {
    const { installmentIndex, method } = req.body || {};
    const record = await NifFeeRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    if (
      !Number.isInteger(installmentIndex) ||
      installmentIndex < 0 ||
      installmentIndex >= record.installmentsSnapshot.length
    ) {
      return res.status(400).json({ message: 'Invalid installment index' });
    }

    const installment = record.installmentsSnapshot[installmentIndex];
    const alreadyPaid = Number(installment.paid || 0);
    const amount = Number(installment.amount || 0);
    const snapshotOutstanding =
      installment.outstanding != null
        ? Number(installment.outstanding)
        : null;
    let outstanding = Math.max(0, amount - alreadyPaid);
    if (!outstanding && snapshotOutstanding > 0) {
      outstanding = snapshotOutstanding;
    }
    if (
      !outstanding &&
      installment.status !== 'paid' &&
      amount > 0 &&
      alreadyPaid <= 0
    ) {
      // Snapshot might be stale (e.g. imported record) – fall back to full amount
      outstanding = amount;
    }

    if (!outstanding) {
      return res.status(400).json({ message: 'Installment already paid' });
    }

    installment.paid = alreadyPaid + outstanding;
    installment.outstanding = 0;
    installment.status = 'paid';
    installment.paidOn = new Date();
    installment.method = method || 'cash';

    record.paidAmount += outstanding;
    recomputeDueAndStatus(record);
    record.lastPayment = new Date();
    record.payments.push({
      amount: outstanding,
      method: method || 'cash',
    });

    await record.save();
    res.json(record.toJSON());
  } catch (err) {
    console.error('Installment pay error:', err);
    res.status(500).json({ message: 'Failed to mark installment as paid' });
  }
});

// Mark a specific installment as paid (uses sequential allocation logic)
router.post('/fees/installments/pay/:id', adminAuth, async (req, res) => {
  try {
    const { installmentIndex, method } = req.body;
    const record = await NifFeeRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    const installments = record.installmentsSnapshot || [
      {
        label: 'Program Fee',
        amount: record.totalFee,
        dueMonth: record.academicYear,
      },
    ];

    const idx = Number(installmentIndex);
    if (!Number.isInteger(idx) || idx < 0 || idx >= installments.length) {
      return res.status(400).json({ message: 'Invalid installment index' });
    }

    // Compute outstanding for the target installment based on paidAmount allocation
    let remainingPaid = Number(record.paidAmount || 0);
    let outstandingForTarget = 0;
    installments.forEach((inst, i) => {
      const amt = Number(inst.amount || 0);
      if (i < idx) {
        remainingPaid = Math.max(0, remainingPaid - Math.min(amt, remainingPaid));
      } else if (i === idx) {
        const paidHere = Math.min(amt, remainingPaid);
        remainingPaid = Math.max(0, remainingPaid - paidHere);
        outstandingForTarget = Math.max(0, amt - paidHere);
      }
    });

    if (outstandingForTarget <= 0) {
      return res.status(400).json({ message: 'Installment already paid' });
    }

    const currentDue = computeDueAmount(record);
    if (outstandingForTarget > currentDue) {
      return res
        .status(400)
        .json({ message: 'Payment exceeds outstanding balance' });
    }

    record.paidAmount += outstandingForTarget;
    recomputeDueAndStatus(record);
    record.lastPayment = new Date();
    record.payments.push({
      amount: outstandingForTarget,
      method: method || 'cash',
      notes: `Installment ${idx + 1} marked as paid`,
    });

    await record.save();
    res.json(record.toJSON());
  } catch (err) {
    console.error('NIF installment pay error:', err);
    res.status(500).json({ message: 'Failed to mark installment as paid' });
  }
});

module.exports = router;
