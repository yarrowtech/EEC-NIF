// backend/routes/nifRoutes.js
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const NifStudent = require('../models/NifStudent');
const NifFeeRecord = require('../models/NifFeeRecord');
const NifCourse = require('../models/NifCourse');
const StudentUser = require('../models/StudentUser');
const ParentUser = require('../models/ParentUser');
const School = require('../models/School');
const adminAuth = require('../middleware/adminAuth');
const { generatePassword } = require('../utils/generator');

router.use(adminAuth);

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

const optionalUniqueString = (value) => {
  const normalized = sanitizeString(value);
  return normalized ? normalized : undefined;
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const padNumber = (value, size = 3) => String(value).padStart(size, '0');

const resolveSessionYear = (admissionDateValue, academicYearValue) => {
  if (academicYearValue && typeof academicYearValue === 'string') {
    const startYearMatch = academicYearValue.match(/(\d{4})/);
    if (startYearMatch) return startYearMatch[1].slice(-2);
    const twoDigitMatch = academicYearValue.match(/(\d{2})/);
    if (twoDigitMatch) return twoDigitMatch[1];
  }

  const parsedAdmission = parseDate(admissionDateValue);
  const fallbackYear = parsedAdmission ? parsedAdmission.getFullYear() : new Date().getFullYear();
  return String(fallbackYear).slice(-2);
};

const sanitizeSchoolCode = (value) => {
  const code = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '');
  return code || 'SCH';
};

const normalizeOrgPrefix = ({ adminUsername, schoolCode }) => {
  const fromAdmin = String(adminUsername || '')
    .trim()
    .toUpperCase()
    .replace(/^EEC[-_]?/, '')
    .replace(/[^A-Z0-9-]/g, '');
  if (fromAdmin) return fromAdmin;
  return sanitizeSchoolCode(schoolCode);
};

const getNextIdSequence = async ({ Model, field, schoolId, campusId, prefix }) => {
  const regex = new RegExp(`^${escapeRegex(prefix)}\\d+$`);
  const filter = {
    schoolId,
    [field]: { $regex: regex },
  };
  if (campusId) {
    filter.campusId = campusId;
  }

  const existing = await Model.find(filter).select(field).lean();
  let maxSequence = 0;
  existing.forEach((row) => {
    const value = row?.[field] ? String(row[field]) : '';
    const match = value.match(/(\d+)$/);
    const seq = match ? Number(match[1]) : 0;
    if (Number.isFinite(seq) && seq > maxSequence) {
      maxSequence = seq;
    }
  });
  return maxSequence + 1;
};

const pickParentPayload = (body = {}) => {
  if (body.fatherName && String(body.fatherName).trim()) {
    return {
      relation: 'father',
      name: String(body.fatherName).trim(),
      mobile: sanitizeString(body.fatherPhone) || sanitizeString(body.guardianPhone) || '',
      email: sanitizeString(body.guardianEmail)?.toLowerCase() || '',
    };
  }

  if (body.motherName && String(body.motherName).trim()) {
    return {
      relation: 'mother',
      name: String(body.motherName).trim(),
      mobile: sanitizeString(body.motherPhone) || sanitizeString(body.guardianPhone) || '',
      email: sanitizeString(body.guardianEmail)?.toLowerCase() || '',
    };
  }

  if (body.guardianName && String(body.guardianName).trim()) {
    return {
      relation: 'guardian',
      name: String(body.guardianName).trim(),
      mobile: sanitizeString(body.guardianPhone) || '',
      email: sanitizeString(body.guardianEmail)?.toLowerCase() || '',
    };
  }

  return null;
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

const syncTotalsFromInstallments = (record, installments = []) => {
  if (!record || !Array.isArray(installments) || !installments.length) {
    return false;
  }

  let totalPaidFromInstallments = 0;
  installments.forEach((inst) => {
    const amount = Math.max(0, Number(inst.amount || 0));
    let paid = Number(inst.paid || 0);
    if (
      paid <= 0 &&
      typeof inst.status === 'string' &&
      inst.status.toLowerCase() === 'paid'
    ) {
      paid = amount;
    }
    totalPaidFromInstallments += Math.min(amount, Math.max(0, paid));
  });

  const normalizedPaid = Math.min(
    Number(record.totalFee || 0),
    totalPaidFromInstallments
  );

  const prevPaid = Number(record.paidAmount || 0);
  if (Math.abs(normalizedPaid - prevPaid) < 0.5) {
    return false;
  }

  record.paidAmount = normalizedPaid;
  recomputeDueAndStatus(record);
  return true;
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

const isObjectEmpty = (obj = {}) => Object.keys(obj).length === 0;

const buildSchoolClause = (req) => {
  if (!req.schoolId) return null;
  return {
    $or: [
      { schoolId: req.schoolId },
      { schoolId: null },
      { schoolId: { $exists: false } },
    ],
  };
};

const resolveSchoolIdForWrite = (req, res) => {
  if (!req.isSuperAdmin) {
    if (!req.schoolId) {
      res.status(403).json({ message: 'School context required' });
      return null;
    }
    return req.schoolId;
  }

  const candidate =
    req.schoolId || req.body?.schoolId || req.query?.schoolId || null;

  if (!candidate) {
    res.status(400).json({ message: 'schoolId is required for this operation' });
    return null;
  }

  if (!mongoose.isValidObjectId(candidate)) {
    res.status(400).json({ message: 'Invalid schoolId' });
    return null;
  }

  return candidate;
};

const matchesSchoolScope = (doc, req) => {
  if (!doc) return false;
  if (!req.schoolId) return true;
  if (!doc.schoolId) return true;
  return String(doc.schoolId) === String(req.schoolId);
};

const buildCampusClause = (req) => {
  // Only apply campus filter if admin has a campusId AND we want strict filtering
  // For now, we're lenient to allow existing students without campusId to be visible
  if (!req.campusId) return null;

  // If admin has a campusId, show students from that campus OR students without campusId (backward compatibility)
  return {
    $or: [
      { campusId: req.campusId },
      { campusId: null },
      { campusId: { $exists: false } },
    ],
  };
};

const withSchoolAndCampusScope = (filter = {}, req) => {
  const schoolClause = buildSchoolClause(req);
  const campusClause = buildCampusClause(req);

  if (!schoolClause && !campusClause) return filter;

  const clauses = [];
  if (schoolClause) clauses.push(schoolClause);
  if (campusClause) clauses.push(campusClause);

  // Combine clauses
  let combined;
  if (clauses.length === 0) {
    combined = filter;
  } else if (clauses.length === 1) {
    combined = isObjectEmpty(filter) ? clauses[0] : { $and: [filter, clauses[0]] };
  } else {
    // When combining school and campus, use $and
    combined = isObjectEmpty(filter) ? { $and: clauses } : { $and: [filter, ...clauses] };
  }

  return combined;
};

const resolveCampusIdForWrite = (req, res) => {
  const candidate =
    req.campusId || req.body?.campusId || req.query?.campusId || req.headers['x-campus-id'] || null;

  if (!candidate) {
    return null;
  }

  return candidate;
};

const matchesCampusScope = (doc, req) => {
  if (!doc) return false;
  if (!req.campusId) return true;
  if (!doc.campusId) return true;
  return String(doc.campusId) === String(req.campusId);
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

const purgeNamelessStudents = async (req) => {
  if (!req?.isSuperAdmin) return 0;
  const namelessQuery = {
    $or: [
      { name: { $exists: false } },
      { name: null },
      { name: '' },
      { name: { $regex: /^\s*$/ } },
    ],
  };
  const nameless = await NifStudent.find(namelessQuery).select('_id').lean();
  if (!nameless.length) return 0;
  const ids = nameless.map((doc) => doc._id);
  await Promise.all([
    NifStudent.deleteMany({ _id: { $in: ids } }),
    NifFeeRecord.deleteMany({ student: { $in: ids } }),
  ]);
  return ids.length;
};

const purgeOrphanFeeRecords = async (req) => {
  if (!req?.isSuperAdmin) return 0;
  const validStudentIds = await NifStudent.find()
    .distinct('_id')
    .catch(() => []);
  if (!validStudentIds || !validStudentIds.length) {
    const result = await NifFeeRecord.deleteMany({});
    return result.deletedCount || 0;
  }
  const result = await NifFeeRecord.deleteMany({
    $or: [
      { student: { $exists: false } },
      { student: null },
      { student: { $nin: validStudentIds } },
    ],
  });
  return result.deletedCount || 0;
};

const buildStudentDoc = (body, courseDoc, schoolId, campusId = null) => {
  const meta = deriveProgramMeta(body, courseDoc);

  const studentDoc = {
    schoolId,
    campusId,
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
    schoolId: student.schoolId || null,
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
  // #swagger.tags = ['NIF']
  try {
    const body = req.body || {};
    if (!body.name || !body.mobile || !body.class) {
      return res.status(400).json({
        message: 'name, mobile and class are required',
      });
    }

    const schoolId = resolveSchoolIdForWrite(req, res);
    if (!schoolId) {
      return;
    }

    const campusId = resolveCampusIdForWrite(req, res);
    const schoolDoc = await School.findById(schoolId).select('name code').lean();
    const schoolCode = sanitizeSchoolCode(schoolDoc?.code);
    const orgPrefix = normalizeOrgPrefix({
      adminUsername: req.admin?.username,
      schoolCode: schoolDoc?.code,
    });
    const schoolName = schoolDoc?.name || '';
    const sessionYear = resolveSessionYear(body.admissionDate, body.academicYear);

    const generatedAdmissionPrefix = `${orgPrefix}-STU-${sessionYear}-`;
    const generatedAdmissionSeq = await getNextIdSequence({
      Model: NifStudent,
      field: 'admissionNumber',
      schoolId,
      campusId,
      prefix: generatedAdmissionPrefix,
    });
    const generatedAdmissionNumber = `${generatedAdmissionPrefix}${padNumber(generatedAdmissionSeq)}`;

    const generatedSerialNo = await (async () => {
      const serialFilter = { schoolId };
      if (campusId) serialFilter.campusId = campusId;
      const latestBySerial = await NifStudent.findOne({
        ...serialFilter,
        serialNo: { $type: 'number' },
      })
        .sort({ serialNo: -1 })
        .select('serialNo')
        .lean();
      const current = Number(latestBySerial?.serialNo || 0);
      return current + 1;
    })();

    // Build student document directly without course dependency
    const studentDoc = {
      schoolId,
      campusId,
      name: sanitizeString(body.name),
      email: sanitizeString(body.email)?.toLowerCase(),
      mobile: sanitizeString(body.mobile),
      gender: sanitizeString(body.gender) || 'other',
      dob: parseDate(body.dob),

      // Address
      address: sanitizeString(body.address) || '',
      permanentAddress: sanitizeString(body.permanentAddress) || '',
      pincode: sanitizeString(body.pincode) || '',

      // Extended Personal
      birthPlace: sanitizeString(body.birthPlace),
      nationality: sanitizeString(body.nationality) || 'Indian',
      religion: sanitizeString(body.religion),
      caste: sanitizeString(body.caste),
      category: sanitizeString(body.category),
      photograph: sanitizeString(body.photograph),

      // Guardian/Parent
      guardianName: sanitizeString(body.guardianName),
      guardianEmail: sanitizeString(body.guardianEmail)?.toLowerCase(),
      guardianPhone: sanitizeString(body.guardianPhone),
      fatherName: sanitizeString(body.fatherName),
      fatherOccupation: sanitizeString(body.fatherOccupation),
      fatherPhone: sanitizeString(body.fatherPhone),
      motherName: sanitizeString(body.motherName),
      motherOccupation: sanitizeString(body.motherOccupation),
      motherPhone: sanitizeString(body.motherPhone),

      // Emergency Contact
      emergencyContactName: sanitizeString(body.emergencyContactName),
      emergencyContactPhone: sanitizeString(body.emergencyContactPhone),
      emergencyContactRelation: sanitizeString(body.emergencyContactRelation),

      // Academic History
      previousSchoolName: sanitizeString(body.previousSchoolName),
      previousClass: sanitizeString(body.previousClass),
      previousPercentage: parseNumber(body.previousPercentage),
      transferCertificateNo: sanitizeString(body.transferCertificateNo),
      transferCertificateDate: parseDate(body.transferCertificateDate),
      reasonForLeaving: sanitizeString(body.reasonForLeaving),

      // Medical
      bloodGroup: sanitizeString(body.bloodGroup),
      knownHealthIssues: sanitizeString(body.knownHealthIssues),
      allergies: sanitizeString(body.allergies),
      immunizationStatus: sanitizeString(body.immunizationStatus),
      learningDisabilities: sanitizeString(body.learningDisabilities),

      // Documents
      aadharNumber: sanitizeString(body.aadharNumber),
      birthCertificateNo: sanitizeString(body.birthCertificateNo),

      // Office Use
      applicationId: optionalUniqueString(body.applicationId),
      applicationDate: parseDate(body.applicationDate),
      approvalStatus: sanitizeString(body.approvalStatus) || 'Pending',
      remarks: sanitizeString(body.remarks),

      // Academic Details
      serialNo: parseNumber(body.serialNo) || generatedSerialNo,
      academicYear: sanitizeString(body.academicYear),
      admissionDate: parseDate(body.admissionDate) || new Date(),
      admissionNumber: sanitizeString(body.admissionNumber) || generatedAdmissionNumber,
      roll: sanitizeString(body.roll),
      class: sanitizeString(body.class),
      section: sanitizeString(body.section),

      status: sanitizeString(body.status) || 'Active',
      source: 'manual',
    };

    const student = await NifStudent.create(studentDoc);

    const generatedStudentPrefix = `${orgPrefix}-STD-${sessionYear}-`;
    const generatedStudentSeq = await getNextIdSequence({
      Model: StudentUser,
      field: 'username',
      schoolId,
      campusId,
      prefix: generatedStudentPrefix,
    });
    const generatedStudentUsername = `${generatedStudentPrefix}${padNumber(generatedStudentSeq)}`;
    const generatedStudentPassword = generatePassword();

    const studentUser = await StudentUser.create({
      username: generatedStudentUsername,
      password: generatedStudentPassword,
      schoolId,
      campusId,
      campusName: req.isSuperAdmin ? body?.campusName || null : req.admin?.campusName || null,
      campusType: req.isSuperAdmin ? body?.campusType || null : req.admin?.campusType || null,
      studentCode: generatedStudentUsername,
      nifStudent: student._id,
      name: student.name,
      grade: student.class || student.grade || '',
      section: student.section || '',
      roll: student.roll || '',
      gender: student.gender || 'other',
      dob: student.dob || undefined,
      admissionDate: student.admissionDate || undefined,
      mobile: student.mobile || '',
      email: student.email || '',
      address: student.address || '',
      pinCode: student.pincode || '',
      batchCode: student.batchCode || '',
      lastLoginAt: null,
    });

    student.studentPortalUser = studentUser._id;
    student.portalAccess = {
      enabled: true,
      username: generatedStudentUsername,
      issuedAt: new Date(),
      issuedBy: req.admin?._id || req.admin?.id || null,
    };
    await student.save();

    let parentCredentialPayload = null;
    const parentInfo = pickParentPayload(body);
    if (parentInfo) {
      const parentLookupOr = [];
      if (parentInfo.mobile) parentLookupOr.push({ mobile: parentInfo.mobile });
      if (parentInfo.email) parentLookupOr.push({ email: parentInfo.email });

      let parentUser = null;
      if (parentLookupOr.length) {
        parentUser = await ParentUser.findOne({
          schoolId,
          campusId,
          $or: parentLookupOr,
        });
      }

      if (!parentUser) {
        const parentPrefix = `${orgPrefix}-PRA-${sessionYear}-`;
        const nextParentSequence = await getNextIdSequence({
          Model: ParentUser,
          field: 'username',
          schoolId,
          campusId,
          prefix: parentPrefix,
        });
        const parentUsername = `${parentPrefix}${padNumber(nextParentSequence)}`;
        const parentPassword = generatePassword();
        const studentClass = sanitizeString(body.class) || sanitizeString(body.grade) || '';

        parentUser = await ParentUser.create({
          username: parentUsername,
          password: parentPassword,
          schoolId,
          campusId,
          name: parentInfo.name,
          mobile: parentInfo.mobile,
          email: parentInfo.email,
          childrenIds: [studentUser._id],
          children: [student.name],
          grade: studentClass ? [studentClass] : [],
          lastLoginAt: null,
        });

        parentCredentialPayload = {
          relation: parentInfo.relation,
          userId: parentUsername,
          password: parentPassword,
          schoolName,
        };
      } else {
        const children = new Set(
          Array.isArray(parentUser.children)
            ? parentUser.children.filter((item) => typeof item === 'string' && item.trim())
            : []
        );
        children.add(student.name);
        parentUser.children = Array.from(children);

        const grades = new Set(
          Array.isArray(parentUser.grade)
            ? parentUser.grade.filter((item) => typeof item === 'string' && item.trim())
            : []
        );
        const studentClass = sanitizeString(body.class) || sanitizeString(body.grade);
        if (studentClass) grades.add(studentClass);
        parentUser.grade = Array.from(grades);

        if (!parentUser.name && parentInfo.name) parentUser.name = parentInfo.name;
        if (!parentUser.mobile && parentInfo.mobile) parentUser.mobile = parentInfo.mobile;
        if (!parentUser.email && parentInfo.email) parentUser.email = parentInfo.email;
        const childIds = new Set(
          Array.isArray(parentUser.childrenIds)
            ? parentUser.childrenIds.map((id) => String(id))
            : []
        );
        childIds.add(String(studentUser._id));
        parentUser.childrenIds = Array.from(childIds);
        await parentUser.save();
        parentCredentialPayload = {
          relation: parentInfo.relation,
          userId: parentUser.username,
          password: null,
          schoolName,
        };
      }
    }

    res.status(201).json({
      ...student.toJSON(),
      generatedStudentId: student.admissionNumber,
      studentCredentials: {
        userId: generatedStudentUsername,
        password: generatedStudentPassword,
      },
      parentCredentials: parentCredentialPayload,
    });
  } catch (err) {
    console.error('Student create error:', err);
    res.status(400).json({ message: err.message });
  }
});

/* ========== UPDATE STUDENT ========== */
router.put('/students/:id', adminAuth, async (req, res) => {
  // #swagger.tags = ['NIF']
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid student id' });
    }

    const student = await NifStudent.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!matchesSchoolScope(student, req) || !matchesCampusScope(student, req)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = {};

    // Core fields
    if (req.body.name !== undefined) updateData.name = sanitizeString(req.body.name);
    if (req.body.email !== undefined) updateData.email = sanitizeString(req.body.email);
    if (req.body.mobile !== undefined) updateData.mobile = sanitizeString(req.body.mobile);
    if (req.body.gender !== undefined) updateData.gender = sanitizeString(req.body.gender);
    if (req.body.dob !== undefined) updateData.dob = parseDate(req.body.dob);
    if (req.body.address !== undefined) updateData.address = sanitizeString(req.body.address);
    if (req.body.permanentAddress !== undefined) updateData.permanentAddress = sanitizeString(req.body.permanentAddress);
    if (req.body.pincode !== undefined) updateData.pincode = sanitizeString(req.body.pincode);
    if (req.body.status !== undefined) updateData.status = sanitizeString(req.body.status);

    // Personal Details Extended
    if (req.body.birthPlace !== undefined) updateData.birthPlace = sanitizeString(req.body.birthPlace);
    if (req.body.nationality !== undefined) updateData.nationality = sanitizeString(req.body.nationality);
    if (req.body.religion !== undefined) updateData.religion = sanitizeString(req.body.religion);
    if (req.body.caste !== undefined) updateData.caste = sanitizeString(req.body.caste);
    if (req.body.category !== undefined) updateData.category = sanitizeString(req.body.category);
    if (req.body.photograph !== undefined) updateData.photograph = sanitizeString(req.body.photograph);

    // Guardian/Parent Info
    if (req.body.guardianName !== undefined) updateData.guardianName = sanitizeString(req.body.guardianName);
    if (req.body.guardianEmail !== undefined) updateData.guardianEmail = sanitizeString(req.body.guardianEmail);
    if (req.body.guardianPhone !== undefined) updateData.guardianPhone = sanitizeString(req.body.guardianPhone);
    if (req.body.fatherName !== undefined) updateData.fatherName = sanitizeString(req.body.fatherName);
    if (req.body.fatherOccupation !== undefined) updateData.fatherOccupation = sanitizeString(req.body.fatherOccupation);
    if (req.body.fatherPhone !== undefined) updateData.fatherPhone = sanitizeString(req.body.fatherPhone);
    if (req.body.motherName !== undefined) updateData.motherName = sanitizeString(req.body.motherName);
    if (req.body.motherOccupation !== undefined) updateData.motherOccupation = sanitizeString(req.body.motherOccupation);
    if (req.body.motherPhone !== undefined) updateData.motherPhone = sanitizeString(req.body.motherPhone);

    // Emergency Contact
    if (req.body.emergencyContactName !== undefined) updateData.emergencyContactName = sanitizeString(req.body.emergencyContactName);
    if (req.body.emergencyContactPhone !== undefined) updateData.emergencyContactPhone = sanitizeString(req.body.emergencyContactPhone);
    if (req.body.emergencyContactRelation !== undefined) updateData.emergencyContactRelation = sanitizeString(req.body.emergencyContactRelation);

    // Academic History
    if (req.body.previousSchoolName !== undefined) updateData.previousSchoolName = sanitizeString(req.body.previousSchoolName);
    if (req.body.previousClass !== undefined) updateData.previousClass = sanitizeString(req.body.previousClass);
    if (req.body.previousPercentage !== undefined) updateData.previousPercentage = sanitizeString(req.body.previousPercentage);
    if (req.body.transferCertificateNo !== undefined) updateData.transferCertificateNo = sanitizeString(req.body.transferCertificateNo);
    if (req.body.transferCertificateDate !== undefined) updateData.transferCertificateDate = parseDate(req.body.transferCertificateDate);
    if (req.body.reasonForLeaving !== undefined) updateData.reasonForLeaving = sanitizeString(req.body.reasonForLeaving);

    // Medical Info
    if (req.body.bloodGroup !== undefined) updateData.bloodGroup = sanitizeString(req.body.bloodGroup);
    if (req.body.knownHealthIssues !== undefined) updateData.knownHealthIssues = sanitizeString(req.body.knownHealthIssues);
    if (req.body.allergies !== undefined) updateData.allergies = sanitizeString(req.body.allergies);
    if (req.body.immunizationStatus !== undefined) updateData.immunizationStatus = sanitizeString(req.body.immunizationStatus);
    if (req.body.learningDisabilities !== undefined) updateData.learningDisabilities = sanitizeString(req.body.learningDisabilities);

    // Documents
    if (req.body.aadharNumber !== undefined) updateData.aadharNumber = sanitizeString(req.body.aadharNumber);
    if (req.body.birthCertificateNo !== undefined) updateData.birthCertificateNo = sanitizeString(req.body.birthCertificateNo);

    // Office Use
    if (req.body.applicationId !== undefined) updateData.applicationId = sanitizeString(req.body.applicationId);
    if (req.body.applicationDate !== undefined) updateData.applicationDate = parseDate(req.body.applicationDate);
    if (req.body.approvalStatus !== undefined) updateData.approvalStatus = sanitizeString(req.body.approvalStatus);
    if (req.body.remarks !== undefined) updateData.remarks = sanitizeString(req.body.remarks);

    // Academic fields
    if (req.body.serialNo !== undefined) updateData.serialNo = parseNumber(req.body.serialNo);
    if (req.body.academicYear !== undefined) updateData.academicYear = sanitizeString(req.body.academicYear);
    if (req.body.admissionDate !== undefined) updateData.admissionDate = parseDate(req.body.admissionDate);
    if (req.body.admissionNumber !== undefined) updateData.admissionNumber = sanitizeString(req.body.admissionNumber);
    if (req.body.roll !== undefined) updateData.roll = sanitizeString(req.body.roll);
    if (req.body.class !== undefined) updateData.class = sanitizeString(req.body.class);
    if (req.body.section !== undefined) updateData.section = sanitizeString(req.body.section);

    // Update the student
    Object.keys(updateData).forEach(key => {
      student[key] = updateData[key];
    });

    await student.save();
    res.json(student.toJSON());
  } catch (err) {
    console.error('Student update error:', err);
    res.status(400).json({ message: err.message });
  }
});

router.delete('/students/:id', adminAuth, async (req, res) => {
  // #swagger.tags = ['NIF']
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid student id' });
    }

    const student = await NifStudent.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    if (!matchesSchoolScope(student, req) || !matchesCampusScope(student, req)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Promise.all([
      NifFeeRecord.deleteMany({ student: id }),
      NifStudent.findByIdAndDelete(id),
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error('NIF delete student error:', err);
    res.status(500).json({ message: 'Failed to delete student' });
  }
});

/* ========== 2) BULK IMPORT STUDENTS ========== */
router.post('/students/bulk', adminAuth, async (req, res) => {
  // #swagger.tags = ['NIF']
  try {
    const rows = Array.isArray(req.body?.students) ? req.body.students : [];
    if (!rows.length) {
      return res.status(400).json({ message: 'students array required' });
    }

    const schoolId = resolveSchoolIdForWrite(req, res);
    if (!schoolId) {
      return;
    }

    const campusId = resolveCampusIdForWrite(req, res);

    console.log('NIF Routes - Bulk import received:', rows.length, 'students');
    console.log('First student:', JSON.stringify(rows[0], null, 2));

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

      // Try to find course by ID or name
      let course = row.courseId ? courseById.get(String(row.courseId)) : null;

      if (!course && row.course) {
        course = courseByTitle.get(String(row.course).toLowerCase());
      }

      if (!course && row.courseName) {
        course = courseByTitle.get(String(row.courseName).toLowerCase());
      }

      // If no course found in database, create a minimal course object with the course name
      if (!course) {
        console.log(`Row ${i}: No course found in DB for "${row.course}", using name directly`);
        course = {
          _id: null,
          title: row.course || 'Unknown Course',
          department: row.course?.toLowerCase().includes('interior') ? 'Interior Design' : 'Fashion Design',
          programType: 'ADV_CERT',
          fees: 155000,
          installments: [],
        };
      }

      try {
        const { studentDoc, programMeta } = buildStudentDoc(
          { ...row, courseId: course._id },
          course,
          schoolId,
          campusId
        );
        const student = await NifStudent.create(studentDoc);

        // Only create fee record if we have course integration enabled
        if (course._id) {
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
        }

        imported += 1;
      } catch (err) {
        console.error('bulk import error', err);
        errors.push({ index: i, message: err.message });
      }
    }

    console.log(`Bulk import complete: ${imported} imported, ${errors.length} failed`);
    res.json({ imported, failed: errors.length, errors });
  } catch (err) {
    console.error('NIF students bulk error:', err);
    res.status(500).json({ message: 'Bulk import failed' });
  }
});

/* ========== 3) LIST NIF STUDENTS (searchable) ========== */
router.get('/students', adminAuth, async (req, res) => {
  // #swagger.tags = ['NIF']
  try {
    await purgeNamelessStudents(req).catch((err) =>
      console.warn('Failed to purge nameless students', err)
    );
    await purgeOrphanFeeRecords(req).catch((err) =>
      console.warn('Failed to purge orphan fee records', err)
    );
    const q = sanitizeString(req.query.q);
    const filter = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { roll: { $regex: q, $options: 'i' } },
        { course: { $regex: q, $options: 'i' } },
      ];
    }

    const students = await NifStudent.find(withSchoolAndCampusScope(filter, req))
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
  // #swagger.tags = ['NIF']
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const student = await NifStudent.findById(id).lean();
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    if (!matchesSchoolScope(student, req) || !matchesCampusScope(student, req)) {
      return res.status(403).json({ message: 'Access denied' });
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
  // #swagger.tags = ['NIF']
  try {
    await purgeNamelessStudents(req).catch((err) =>
      console.warn('Failed to purge nameless students', err)
    );
    await purgeOrphanFeeRecords(req).catch((err) =>
      console.warn('Failed to purge orphan fee records', err)
    );
    const scopedStudentFilter = withSchoolAndCampusScope({}, req);
    const allStudents = await NifStudent.find(scopedStudentFilter).lean();
    const studentsWithRecords = await NifFeeRecord.find(
      withSchoolAndCampusScope({}, req),
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

    const records = await NifFeeRecord.find(withSchoolAndCampusScope(filter, req))
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

router.get('/fees/dashboard-summary', adminAuth, async (req, res) => {
  // #swagger.tags = ['NIF']
  try {
    const scopedRecordFilter = withSchoolAndCampusScope({}, req);
    const [feeRecords, students] = await Promise.all([
      NifFeeRecord.find(scopedRecordFilter)
        .populate('student', 'name course grade section programLabel')
        .lean(),
      NifStudent.find(withSchoolAndCampusScope({}, req))
        .select('course grade programLabel')
        .lean(),
    ]);

    const totalOutstanding = feeRecords.reduce(
      (sum, rec) => sum + Number(rec.dueAmount || 0),
      0
    );
    const totalCollected = feeRecords.reduce(
      (sum, rec) => sum + Number(rec.paidAmount || 0),
      0
    );
    const overduePayments = feeRecords.filter((rec) =>
      ['due', 'partial'].includes(rec.status)
    ).length;
    const totalEnrolled = students.length;

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    let monthlyCollection = 0;
    const paymentRecords = [];

    feeRecords.forEach((rec) => {
      const programName =
        rec.programLabel ||
        rec.student?.grade ||
        rec.student?.course ||
        'Program';
      (rec.payments || []).forEach((payment) => {
        const amount = Number(payment.amount || 0);
        const paidOn = payment.paidOn ? new Date(payment.paidOn) : null;
        paymentRecords.push({
          studentName: rec.student?.name || 'Unnamed Student',
          program: programName,
          amount,
          paidOn,
          method: payment.method || 'cash',
        });
        if (paidOn && paidOn >= thirtyDaysAgo) {
          monthlyCollection += amount;
        }
      });
    });

    const enrollmentMap = students.reduce((acc, student) => {
      const key = student.course || student.grade || 'Unassigned';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const enrollment = Object.entries(enrollmentMap).map(
      ([program, count]) => ({
        program,
        students: count,
        percentage: totalEnrolled
          ? Math.round((count / totalEnrolled) * 100)
          : 0,
      })
    );

    const outstandingTotals = feeRecords.reduce((acc, rec) => {
      const key =
        rec.course || rec.programLabel || rec.student?.course || 'Program';
      acc[key] = (acc[key] || 0) + Number(rec.dueAmount || 0);
      return acc;
    }, {});

    const outstandingTotalAmount =
      Object.values(outstandingTotals).reduce((sum, val) => sum + val, 0) || 1;

    const outstandingSegments = Object.entries(outstandingTotals)
      .map(([label, amount]) => ({
        label,
        amount,
        percentage: Math.round((amount / outstandingTotalAmount) * 100),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    const recentPayments = paymentRecords
      .filter((payment) => payment.paidOn)
      .sort((a, b) => b.paidOn - a.paidOn)
      .slice(0, 8)
      .map((payment) => ({
        studentName: payment.studentName,
        program: payment.program,
        amount: payment.amount,
        paidOn: payment.paidOn,
        method: payment.method,
        status: 'Paid',
      }));

    res.json({
      totals: {
        totalOutstanding,
        totalCollected,
        monthlyCollection,
        overduePayments,
        totalEnrolled,
      },
      enrollment,
      outstandingSegments,
      recentPayments,
    });
  } catch (err) {
    console.error('NIF fees dashboard summary error:', err);
    res.status(500).json({ message: 'Failed to fetch fees dashboard data' });
  }
});

/* ========== 6) FEE RECORD DETAILS ========== */
router.get('/fees/details/:id', adminAuth, async (req, res) => {
  // #swagger.tags = ['NIF']
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const record = await NifFeeRecord.findById(id).populate('student');

    if (!record) {
      return res.status(404).json({ message: 'Fee record not found' });
    }
    if (!matchesSchoolScope(record, req)) {
      return res.status(403).json({ message: 'Access denied' });
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
    } else {
      installments = mapInstallments(installments);
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

    const totalsUpdated = syncTotalsFromInstallments(record, installments);
    if (totalsUpdated) {
      try {
        await record.save();
      } catch (saveErr) {
        console.warn('Could not persist totals sync', saveErr);
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
  // #swagger.tags = ['NIF']
  try {
    const { amount, note } = req.body || {};
    const record = await NifFeeRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Fee record not found' });
    }
    if (!matchesSchoolScope(record, req)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (!matchesSchoolScope(record, req)) {
      return res.status(403).json({ message: 'Access denied' });
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
    const totalsUpdated = syncTotalsFromInstallments(
      record,
      adjustedInstallments
    );

    if (totalsUpdated) {
      record.markModified('installmentsSnapshot');
    }

    await record.save();
    res.json(record.toJSON());
  } catch (err) {
    console.error('NIF discount error:', err);
    res.status(500).json({ message: 'Failed to update discount' });
  }
});

router.post('/fees/installments/pay/:id', adminAuth, async (req, res) => {
  // #swagger.tags = ['NIF']
  try {
    const { installmentIndex, method } = req.body || {};
    const record = await NifFeeRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Fee record not found' });
    }
    if (!matchesSchoolScope(record, req)) {
      return res.status(403).json({ message: 'Access denied' });
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
  // #swagger.tags = ['NIF']
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

/* ========== 8) ARCHIVE STUDENT ========== */
router.put('/students/:id/archive', adminAuth, async (req, res) => {
  // #swagger.tags = ['NIF']
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    const student = await NifStudent.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    if (!matchesSchoolScope(student, req) || !matchesCampusScope(student, req)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get fee record for the student
    const feeRecord = await NifFeeRecord.findOne({ student: id }).lean();
    
    const NifArchivedStudent = require('../models/NifArchivedStudent');
    
    // Create archived student record
    const archivedStudent = await NifArchivedStudent.create({
      originalStudentId: student._id,
      schoolId: student.schoolId || null,
      campusId: student.campusId || null,
      studentName: student.name,
      email: student.email,
      mobile: student.mobile,
      gender: student.gender,
      dob: student.dob,
      roll: student.roll,
      grade: student.grade,
      section: student.section,
      batchCode: student.batchCode,
      course: student.course,
      courseId: student.courseId,
      duration: student.duration,
      admissionDate: student.admissionDate,
      archiveStatus: 'passed',
      passedOutYear: new Date().getFullYear().toString(),
      archivedAt: new Date(),
      archivedBy: req.user?.name || 'Admin',
      feeSummary: feeRecord ? {
        totalFee: feeRecord.totalFee || 0,
        totalPaid: feeRecord.paidAmount || 0,
        totalDue: feeRecord.dueAmount || 0,
      } : {},
      feeRecords: feeRecord ? [feeRecord] : [],
      snapshot: student.toObject ? student.toObject() : student,
    });

    // Delete original student and fee records
    await Promise.all([
      NifStudent.findByIdAndDelete(id),
      NifFeeRecord.deleteMany({ student: id })
    ]);

    res.json({ 
      success: true, 
      message: 'Student archived successfully',
      archivedStudent: archivedStudent
    });

  } catch (err) {
    console.error('Archive student error:', err);
    res.status(500).json({ message: 'Failed to archive student' });
  }
});

/* ========== 9) UNARCHIVE STUDENT ========== */
router.patch('/students/:id/unarchive', adminAuth, async (req, res) => {
  // #swagger.tags = ['NIF']
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid archived student ID' });
    }

    const NifArchivedStudent = require('../models/NifArchivedStudent');
    const archivedStudent = await NifArchivedStudent.findById(id);
    
    if (!archivedStudent) {
      return res.status(404).json({ message: 'Archived student not found' });
    }
    if (!matchesSchoolScope(archivedStudent, req) || !matchesCampusScope(archivedStudent, req)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Restore student from snapshot
    const studentData = {
      schoolId: archivedStudent.schoolId || req.schoolId || null,
      campusId: archivedStudent.campusId || req.campusId || null,
      name: archivedStudent.studentName,
      email: archivedStudent.email,
      mobile: archivedStudent.mobile,
      gender: archivedStudent.gender,
      dob: archivedStudent.dob,
      roll: archivedStudent.roll,
      grade: archivedStudent.grade,
      section: archivedStudent.section,
      batchCode: archivedStudent.batchCode,
      course: archivedStudent.course,
      courseId: archivedStudent.courseId,
      duration: archivedStudent.duration,
      admissionDate: archivedStudent.admissionDate,
      status: 'Active',
      // Add any other fields from snapshot if needed
      ...(archivedStudent.snapshot || {})
    };

    // Remove _id from snapshot to avoid conflicts
    delete studentData._id;
    delete studentData.id;

    const restoredStudent = await NifStudent.create(studentData);

    // Restore fee records if they exist
    if (archivedStudent.feeRecords && archivedStudent.feeRecords.length > 0) {
      for (const feeData of archivedStudent.feeRecords) {
        const feeRecord = {
          ...feeData,
          student: restoredStudent._id,
        };
        delete feeRecord._id;
        delete feeRecord.id;
        feeRecord.schoolId =
          restoredStudent.schoolId || feeRecord.schoolId || null;
        feeRecord.campusId =
          restoredStudent.campusId || feeRecord.campusId || null;

        await NifFeeRecord.create(feeRecord);
      }
    } else {
      // Create a new fee record using the standard logic
      await ensureFeeRecordForStudent(restoredStudent);
    }

    // Delete the archived record
    await NifArchivedStudent.findByIdAndDelete(id);

    res.json({ 
      success: true, 
      message: 'Student restored successfully',
      student: restoredStudent
    });

  } catch (err) {
    console.error('Unarchive student error:', err);
    res.status(500).json({ message: 'Failed to restore student' });
  }
});

module.exports = router;
