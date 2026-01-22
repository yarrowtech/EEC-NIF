const mongoose = require('mongoose');
const School = require('../models/School');
const StudentUser = require('../models/StudentUser');
const TeacherUser = require('../models/TeacherUser');
const StaffUser = require('../models/StaffUser');

const padNumber = (value, size) => String(value).padStart(size, '0');
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeSchoolCode = (code) => {
  const cleaned = String(code || '').trim().toUpperCase();
  if (!cleaned) return '';
  return cleaned.replace(/^EEC[-_]/, '');
};

const getSchoolCode = async (schoolId) => {
  if (!mongoose.isValidObjectId(schoolId)) {
    throw new Error('Valid schoolId is required');
  }
  const school = await School.findById(schoolId).select('code').lean();
  const code = school?.code ? String(school.code).trim().toUpperCase() : '';
  if (!code) {
    throw new Error('School code is required for code generation');
  }
  return code;
};

const getSchoolShortCode = async (schoolId) => {
  const fullCode = await getSchoolCode(schoolId);
  const shortCode = normalizeSchoolCode(fullCode);
  if (!shortCode) {
    throw new Error('School code is required for code generation');
  }
  return shortCode;
};

const getNextStudentSequence = async (schoolId, year) => {
  const schoolCode = await getSchoolCode(schoolId);
  const prefix = `${schoolCode}${year}`;
  const lastStudent = await StudentUser.findOne({
    schoolId,
    studentCode: { $regex: `^${escapeRegex(prefix)}` },
  })
    .sort({ studentCode: -1 })
    .select('studentCode')
    .lean();
  const lastSeq = lastStudent?.studentCode
    ? Number(String(lastStudent.studentCode).slice(prefix.length))
    : 0;
  return { schoolCode, nextSequence: lastSeq + 1 };
};

const getNextEmployeeSequence = async (schoolId) => {
  const schoolCode = await getSchoolCode(schoolId);
  const prefix = `${schoolCode}EMP`;
  const [lastTeacher, lastStaff] = await Promise.all([
    TeacherUser.findOne({
      schoolId,
      employeeCode: { $regex: `^${escapeRegex(prefix)}` },
    })
      .sort({ employeeCode: -1 })
      .select('employeeCode')
      .lean(),
    StaffUser.findOne({
      schoolId,
      employeeCode: { $regex: `^${escapeRegex(prefix)}` },
    })
      .sort({ employeeCode: -1 })
      .select('employeeCode')
      .lean(),
  ]);
  const seqFromCode = (value) =>
    value && String(value).startsWith(prefix)
      ? Number(String(value).slice(prefix.length))
      : 0;
  const lastSeq = Math.max(
    seqFromCode(lastTeacher?.employeeCode),
    seqFromCode(lastStaff?.employeeCode)
  );
  return { schoolCode, nextSequence: lastSeq + 1 };
};

const buildStudentCode = (schoolCode, year, sequence) =>
  `${schoolCode}${year}${padNumber(sequence, 3)}`;

const buildEmployeeCode = (schoolCode, sequence) =>
  `${schoolCode}EMP${padNumber(sequence, 4)}`;

const buildTeacherCode = (schoolCode, sequence) =>
  `${schoolCode}-TEA-${padNumber(sequence, 3)}`;

const normalizeAdminCode = (username) => {
  if (!username) return '';
  const cleaned = String(username).trim().toUpperCase();
  if (!cleaned) return '';
  if (cleaned.startsWith('EEC-')) {
    return cleaned.slice(4);
  }
  return cleaned;
};

const getTeacherPrefix = async ({ adminUsername, schoolId }) => {
  const adminCode = normalizeAdminCode(adminUsername);
  if (adminCode) {
    return adminCode;
  }
  return getSchoolShortCode(schoolId);
};

const getNextTeacherSequenceByPrefix = async (schoolId, prefix) => {
  const prefixText = `${prefix}-TEA-`;
  const lastTeacher = await TeacherUser.findOne({
    schoolId,
    employeeCode: { $regex: `^${escapeRegex(prefixText)}` },
  })
    .sort({ employeeCode: -1 })
    .select('employeeCode')
    .lean();
  const lastSeq = lastTeacher?.employeeCode
    ? Number(String(lastTeacher.employeeCode).slice(prefixText.length))
    : 0;
  return { prefix: prefixText, nextSequence: lastSeq + 1 };
};

const getNextTeacherSequence = async (schoolId) => {
  const schoolCode = await getSchoolShortCode(schoolId);
  const prefix = `${schoolCode}-TEA-`;
  const lastTeacher = await TeacherUser.findOne({
    schoolId,
    employeeCode: { $regex: `^${escapeRegex(prefix)}` },
  })
    .sort({ employeeCode: -1 })
    .select('employeeCode')
    .lean();
  const lastSeq = lastTeacher?.employeeCode
    ? Number(String(lastTeacher.employeeCode).slice(prefix.length))
    : 0;
  return { schoolCode, nextSequence: lastSeq + 1 };
};

const generateStudentCode = async (schoolId, year) => {
  const { schoolCode, nextSequence } = await getNextStudentSequence(schoolId, year);
  return buildStudentCode(schoolCode, year, nextSequence);
};

const generateEmployeeCode = async (schoolId) => {
  const { schoolCode, nextSequence } = await getNextEmployeeSequence(schoolId);
  return buildEmployeeCode(schoolCode, nextSequence);
};

const generateTeacherCode = async (schoolId) => {
  const { schoolCode, nextSequence } = await getNextTeacherSequence(schoolId);
  return buildTeacherCode(schoolCode, nextSequence);
};

const generateTeacherCodeForAdmin = async (schoolId, adminUsername) => {
  const teacherPrefix = await getTeacherPrefix({ adminUsername, schoolId });
  const { nextSequence } = await getNextTeacherSequenceByPrefix(schoolId, teacherPrefix);
  return buildTeacherCode(teacherPrefix, nextSequence);
};

module.exports = {
  getSchoolCode,
  getNextStudentSequence,
  getNextEmployeeSequence,
  getNextTeacherSequence,
  getNextTeacherSequenceByPrefix,
  buildStudentCode,
  buildEmployeeCode,
  buildTeacherCode,
  getTeacherPrefix,
  generateStudentCode,
  generateEmployeeCode,
  generateTeacherCode,
  generateTeacherCodeForAdmin,
};
