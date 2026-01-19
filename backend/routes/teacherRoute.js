const express = require('express');
const router = express.Router();
const TeacherUser = require('../models/TeacherUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateUsername, generatePassword } = require('../utils/generator');
const { generateEmployeeCode } = require('../utils/codeGenerator');
const adminAuth = require('../middleware/adminAuth');
const rateLimit = require('../middleware/rateLimit');
const { isStrongPassword, passwordPolicyMessage } = require('../utils/passwordPolicy');

// Register Teacher
router.post('/register', adminAuth, async (req, res) => {
  const {
    name,
    schoolId,
    gender,
    mobile,
    email,
    subject,
    department,
    qualification,
    experience,
    address,
    pinCode,
    joiningDate
  } = req.body;

  try {

    const username = await generateUsername(name, "teacher")
    const password = generatePassword();
    const empId = await generateEmpId();
    const resolvedSchoolId = req.schoolId || (req.isSuperAdmin ? schoolId : null);
    if (!resolvedSchoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }

    const employeeCode = await generateEmployeeCode(resolvedSchoolId);
    const user = new TeacherUser({
      username,
      password,
      empId,
      schoolId: resolvedSchoolId,
      employeeCode,
      name,
      gender,
      mobile,
      email,
      subject,
      department,
      qualification,
      experience,
      address,
      pinCode,
      joiningDate
    });

    await user.save();
    res.status(201).json({ message: 'Teacher registered successfully', username, password, empId, employeeCode });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login Teacher
router.post('/login', rateLimit({ windowMs: 60 * 1000, max: 10 }), async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await TeacherUser.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.employeeCode && user.schoolId) {
      user.employeeCode = await generateEmployeeCode(user.schoolId);
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, userType: 'teacher', schoolId: user.schoolId || null },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Generate a random empid
 * @returns {number} - Random 3-digit employee ID
 */
async function generateEmpId() {
  const num = Math.floor(Math.random() * 1000);
  const user = await TeacherUser.findOne({ empId: num });
  if (user) {
    return generateEmpId(); // Recursively generate a new ID if it already exists
  }
  return num;
}

module.exports = router;
