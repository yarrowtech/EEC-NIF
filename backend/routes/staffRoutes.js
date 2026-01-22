const express = require('express');
const router = express.Router();
const StaffUser = require('../models/StaffUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateUsername, generatePassword } = require('../utils/generator');
const { generateEmployeeCode } = require('../utils/codeGenerator');
const adminAuth = require('../middleware/adminAuth');
const rateLimit = require('../middleware/rateLimit');

// Register Staff (admin only)
router.post('/register', adminAuth, async (req, res) => {
  // #swagger.tags = ['Staff']
  const {
    name,
    schoolId,
    gender,
    email,
    position,
    department,
    qualification,
    experience,
    address,
    pinCode,
    joiningDate,
    joinDate,
    salary,
  } = req.body;
  const mobile = req.body.mobile || req.body.phone;

  try {
    const username = await generateUsername(name || 'staff', 'staff');
    const password = generatePassword();
    const empId = await generateEmpId();
    const resolvedSchoolId = req.schoolId || (req.isSuperAdmin ? schoolId : null);
    if (!resolvedSchoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }
    const resolvedCampusId = req.campusId || (req.isSuperAdmin ? req.body?.campusId : null);
    const employeeCode = await generateEmployeeCode(resolvedSchoolId);

    const user = new StaffUser({
      username,
      password,
      empId,
      schoolId: resolvedSchoolId,
      campusId: resolvedCampusId,
      campusName: req.isSuperAdmin ? req.body?.campusName : req.admin?.campusName,
      campusType: req.isSuperAdmin ? req.body?.campusType : req.admin?.campusType,
      employeeCode,
      name,
      gender,
      mobile,
      email,
      position,
      department,
      qualification,
      experience,
      address,
      pinCode,
      joiningDate: joiningDate || joinDate,
      salary,
    });

    await user.save();
    res.status(201).json({ message: 'Staff registered successfully', username, password, empId, employeeCode });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login Staff
router.post('/login', rateLimit({ windowMs: 60 * 1000, max: 10 }), async (req, res) => {
  // #swagger.tags = ['Staff']
  const { username, password } = req.body;

  try {
    const user = await StaffUser.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.employeeCode && user.schoolId) {
      user.employeeCode = await generateEmployeeCode(user.schoolId);
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, type: 'staff', schoolId: user.schoolId || null, campusId: user.campusId || null },
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
  const user = await StaffUser.findOne({ empId: num });
  if (user) {
    return generateEmpId();
  }
  return num;
}

module.exports = router;
