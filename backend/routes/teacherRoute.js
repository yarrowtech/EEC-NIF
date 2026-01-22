const express = require('express');
const router = express.Router();
const TeacherUser = require('../models/TeacherUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generatePassword } = require('../utils/generator');
const { generateTeacherCode, generateTeacherCodeForAdmin } = require('../utils/codeGenerator');
const adminAuth = require('../middleware/adminAuth');
const rateLimit = require('../middleware/rateLimit');
const { isStrongPassword, passwordPolicyMessage } = require('../utils/passwordPolicy');
const School = require('../models/School');
const Admin = require('../models/Admin');
const { sendTeacherCredentialsEmail } = require('../utils/mailer');

// Register Teacher
router.post('/register', adminAuth, async (req, res) => {
  // #swagger.tags = ['Teachers']
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
    joiningDate,
    joinDate
  } = req.body;

  try {

    const password = generatePassword();
    const resolvedSchoolId = req.schoolId || (req.isSuperAdmin ? schoolId : null);
    if (!resolvedSchoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }
    const resolvedCampusId = req.campusId || (req.isSuperAdmin ? req.body?.campusId : null);

    let adminUsername = req.admin?.username || '';
    if (!adminUsername && req.admin?.id) {
      const adminUser = await Admin.findById(req.admin.id).select('username').lean();
      adminUsername = adminUser?.username || '';
    }
    const employeeCode = await generateTeacherCodeForAdmin(resolvedSchoolId, adminUsername);
    const username = employeeCode;
    const user = new TeacherUser({
      username,
      password,
      schoolId: resolvedSchoolId,
      campusId: resolvedCampusId,
      campusName: req.isSuperAdmin ? req.body?.campusName : req.admin?.campusName,
      campusType: req.isSuperAdmin ? req.body?.campusType : req.admin?.campusType,
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
      joiningDate: joiningDate || joinDate
    });

    await user.save();

    let emailSent = false;
    if (email) {
      try {
        const school = await School.findById(resolvedSchoolId).select('name').lean();
        const loginUrl = process.env.TEACHER_APP_URL || process.env.APP_URL || process.env.FRONTEND_URL || '';
        await sendTeacherCredentialsEmail({
          to: email,
          schoolName: school?.name,
          teacherName: name,
          username,
          password,
          employeeCode,
          loginUrl
        });
        emailSent = true;
      } catch (mailErr) {
        console.error('Failed to send teacher credentials email:', mailErr.message);
      }
    }

    res.status(201).json({
      message: 'Teacher registered successfully',
      username,
      password,
      employeeCode,
      emailSent
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login Teacher
router.post('/login', rateLimit({ windowMs: 60 * 1000, max: 10 }), async (req, res) => {
  // #swagger.tags = ['Teachers']
  const { username, password } = req.body;

  try {
    const user = await TeacherUser.findOne({
      $or: [{ username }, { employeeCode: username }],
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.employeeCode && user.schoolId) {
      user.employeeCode = await generateTeacherCode(user.schoolId);
      await user.save();
    }

    const token = jwt.sign(
      {
        id: user._id,
        userType: 'teacher',
        schoolId: user.schoolId || null,
        campusId: user.campusId || null,
      },
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
module.exports = router;
