const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const TeacherUser = require('../models/TeacherUser');
const StudentUser = require('../models/StudentUser');
const ParentUser = require('../models/ParentUser');
const Principal = require('../models/Principal');
const StaffUser = require('../models/StaffUser');
const School = require('../models/School');
const rateLimit = require('../middleware/rateLimit');
const { generateTeacherCode } = require('../utils/codeGenerator');

const router = express.Router();

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const normalize = (value = '') => String(value).trim().toLowerCase();

const signToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const tryAdmin = async ({ username, password }) => {
  const admin = await Admin.findOne({ username });
  if (!admin) return null;
  if (!(await bcrypt.compare(password, admin.password))) return null;
  if (admin.status === 'inactive') {
    return { errorStatus: 403, error: 'Account inactive. Contact EEC admin.' };
  }
  if (admin.role === 'admin') {
    const school = await School.findById(admin.schoolId).select('status').lean();
    if (!school || school.status === 'inactive') {
      return { errorStatus: 403, error: 'School inactive. Contact EEC admin.' };
    }
  }
  if (admin.role === 'admin' && !admin.lastLoginAt) {
    return { requiresPasswordReset: true, username: admin.username, userType: 'Admin' };
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = signToken({
    id: admin._id,
    type: 'admin',
    username: admin.username,
    schoolId: admin.schoolId || null,
    campusId: admin.campusId || null,
    campusName: admin.campusName || null,
    campusType: admin.campusType || null,
  });

  return {
    token,
    userType: admin.role === 'super_admin' ? 'SuperAdmin' : 'Admin',
  };
};

const tryTeacher = async ({ username, password }) => {
  const user = await TeacherUser.findOne({
    $or: [{ username }, { employeeCode: username }],
  });
  if (!user) return null;
  if (!(await bcrypt.compare(password, user.password))) return null;
  if (!user.campusId) return { errorStatus: 400, error: 'campusId is required for this account' };
  if (!user.employeeCode && user.schoolId) {
    user.employeeCode = await generateTeacherCode(user.schoolId);
    await user.save();
  }
  if (!user.lastLoginAt) {
    return { requiresPasswordReset: true, username: user.username, userType: 'Teacher' };
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({
    id: user._id,
    userType: 'teacher',
    schoolId: user.schoolId || null,
    campusId: user.campusId || null,
  });

  return { token, userType: 'Teacher' };
};

const tryStudent = async ({ username, password }) => {
  const user = await StudentUser.findOne({
    $or: [{ username }, { studentCode: username }],
  });
  if (!user) return null;
  if (!(await bcrypt.compare(password, user.password))) return null;
  if (user.isArchived) {
    return { errorStatus: 403, error: 'You have been blocked by your organization.' };
  }
  if (!user.campusId) return { errorStatus: 400, error: 'campusId is required for this account' };
  if (!user.lastLoginAt) {
    return { requiresPasswordReset: true, username: user.username || user.studentCode, userType: 'Student' };
  }
  if (!user.studentCode) {
    user.studentCode = user.username;
    await user.save();
  }

  const token = signToken({
    id: user._id,
    userType: 'student',
    schoolId: user.schoolId || null,
    campusId: user.campusId || null,
  });

  return { token, userType: 'Student' };
};

const tryParent = async ({ username, password }) => {
  const user = await ParentUser.findOne({ username });
  if (!user) return null;
  if (!(await bcrypt.compare(password, user.password))) return null;
  if (!user.campusId) return { errorStatus: 400, error: 'campusId is required for this account' };
  if (!user.lastLoginAt) {
    return { requiresPasswordReset: true, username: user.username, userType: 'Parent' };
  }

  const token = signToken({
    id: user._id,
    userType: 'parent',
    schoolId: user.schoolId || null,
    campusId: user.campusId || null,
  });

  return { token, userType: 'Parent' };
};

const tryPrincipal = async ({ username, password }) => {
  const identifier = normalize(username);
  if (!identifier) return null;
  const principal = await Principal.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  });
  if (!principal) return null;
  if (!(await bcrypt.compare(password, principal.password))) return null;

  const token = signToken({
    id: principal._id,
    type: 'principal',
    schoolId: principal.schoolId || null,
    campusId: principal.campusId || null,
    campusName: principal.campusName || null,
    campusType: principal.campusType || null,
  });

  return { token, userType: 'Principal' };
};

const tryStaff = async ({ username, password }) => {
  const user = await StaffUser.findOne({ username });
  if (!user) return null;
  if (!(await bcrypt.compare(password, user.password))) return null;

  const token = signToken({
    id: user._id,
    type: 'staff',
    schoolId: user.schoolId || null,
    campusId: user.campusId || null,
  });

  return { token, userType: 'Staff' };
};

router.post('/login', rateLimit({ windowMs: 60 * 1000, max: 10 }), async (req, res) => {
  const username = String(req.body?.username || '').trim();
  const password = req.body?.password;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const resolvers = [tryAdmin, tryTeacher, tryPrincipal, tryStudent, tryParent, tryStaff];
    for (const resolver of resolvers) {
      const result = await resolver({ username, password });
      if (!result) continue;

      if (result.errorStatus) {
        return res.status(result.errorStatus).json({ error: result.error });
      }
      return res.json(result);
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
