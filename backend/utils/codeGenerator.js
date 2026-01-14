const mongoose = require('mongoose');
const School = require('../models/School');
const StudentUser = require('../models/StudentUser');
const TeacherUser = require('../models/TeacherUser');

const padNumber = (value, size) => String(value).padStart(size, '0');
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
  const lastEmployee = await TeacherUser.findOne({
    schoolId,
    employeeCode: { $regex: `^${escapeRegex(prefix)}` },
  })
    .sort({ employeeCode: -1 })
    .select('employeeCode')
    .lean();
  const lastSeq = lastEmployee?.employeeCode
    ? Number(String(lastEmployee.employeeCode).slice(prefix.length))
    : 0;
  return { schoolCode, nextSequence: lastSeq + 1 };
};

const buildStudentCode = (schoolCode, year, sequence) =>
  `${schoolCode}${year}${padNumber(sequence, 3)}`;

const buildEmployeeCode = (schoolCode, sequence) =>
  `${schoolCode}EMP${padNumber(sequence, 4)}`;

const generateStudentCode = async (schoolId, year) => {
  const { schoolCode, nextSequence } = await getNextStudentSequence(schoolId, year);
  return buildStudentCode(schoolCode, year, nextSequence);
};

const generateEmployeeCode = async (schoolId) => {
  const { schoolCode, nextSequence } = await getNextEmployeeSequence(schoolId);
  return buildEmployeeCode(schoolCode, nextSequence);
};

module.exports = {
  getSchoolCode,
  getNextStudentSequence,
  getNextEmployeeSequence,
  buildStudentCode,
  buildEmployeeCode,
  generateStudentCode,
  generateEmployeeCode,
};
