const express = require('express');
const router = express.Router();
const StudentUser = require('../models/StudentUser');
const NifStudent = require('../models/NifStudent');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminAuth = require('../middleware/adminAuth');
const { generateUsername, generatePassword } = require('../utils/generator');
const { generateStudentCode } = require('../utils/codeGenerator');

const resolveAdmissionYear = (value) => {
  if (!value) return new Date().getFullYear();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().getFullYear();
  }
  return parsed.getFullYear();
};

const resolveAdmissionDate = (value) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed;
};
const rateLimit = require('../middleware/rateLimit');
const { isStrongPassword, passwordPolicyMessage } = require('../utils/passwordPolicy');

// Register Student
router.post('/register', adminAuth, async (req, res) => {
    const {
    name,
    schoolId,
    grade,
    section,
    roll,
    gender,
    dob,
    admissionDate,
    mobile,
    email,
    address,
    pinCode,
    username: requestedUsername,
    password: requestedPassword,
    studentId,
    nifStudentId,
  } = req.body;

  try {
    const username = await generateUsername(name, 'student');
    const password = generatePassword();
    const resolvedSchoolId = req.schoolId || (req.isSuperAdmin ? schoolId : null);
    if (!resolvedSchoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }
    const admissionYear = resolveAdmissionYear(admissionDate);
    const resolvedAdmissionDate = resolveAdmissionDate(admissionDate);
    const studentCode = await generateStudentCode(resolvedSchoolId, admissionYear);
    const user = new StudentUser({
      username, password,
      schoolId: resolvedSchoolId,
      studentCode,
      name,
      grade,
      section,
      roll,
      gender,
      dob,
      admissionDate: resolvedAdmissionDate,
      mobile,
      email,
      address,
      pinCode,
    });

    await user.save();
    res.status(201).json({ message: 'Student registered successfully', username, password, studentCode });
  } catch (err) {
    console.error('Student register error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Login Student
router.post('/login', rateLimit({ windowMs: 60 * 1000, max: 10 }), async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await StudentUser.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.studentCode && user.schoolId) {
      const admissionYear = resolveAdmissionYear(user.admissionDate);
      user.studentCode = await generateStudentCode(user.schoolId, admissionYear);
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, userType: 'student', schoolId: user.schoolId || null },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
