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
const authTeacher = require('../middleware/authTeacher');

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
    if (!user.campusId) {
      return res.status(400).json({ error: 'campusId is required for this account' });
    }
    if (!user.employeeCode && user.schoolId) {
      user.employeeCode = await generateTeacherCode(user.schoolId);
      await user.save();
    }
    if (!user.lastLoginAt) {
      return res.json({ requiresPasswordReset: true, username: user.username });
    }

    user.lastLoginAt = new Date();
    await user.save();
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

router.post('/reset-first-password', rateLimit({ windowMs: 60 * 1000, max: 10 }), async (req, res) => {
  // #swagger.tags = ['Teachers']
  const { username, newPassword } = req.body || {};
  try {
    if (!username || !String(username).trim()) {
      return res.status(400).json({ error: 'Username is required' });
    }
    if (!newPassword || !String(newPassword).trim()) {
      return res.status(400).json({ error: 'New password is required' });
    }
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ error: passwordPolicyMessage });
    }

    const user = await TeacherUser.findOne({
      $or: [{ username: String(username).trim() }, { employeeCode: String(username).trim() }],
    });
    if (!user) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    if (user.lastLoginAt) {
      return res.status(400).json({ error: 'Password reset already completed' });
    }

    user.password = String(newPassword);
    user.lastLoginAt = new Date();
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/profile', authTeacher, async (req, res) => {
  // #swagger.tags = ['Teachers']
  try {
    if (req.user?.userType !== 'teacher') {
      return res.status(403).json({ error: 'Forbidden - not a teacher' });
    }

    const teacher = await TeacherUser.findById(req.user.id).select('-password').lean();
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({
      ...teacher,
      employeeId: teacher.username || teacher.employeeCode || '',
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/profile', authTeacher, async (req, res) => {
  // #swagger.tags = ['Teachers']
  try {
    if (req.user?.userType !== 'teacher') {
      return res.status(403).json({ error: 'Forbidden - not a teacher' });
    }

    const allowedUpdates = [
      'name',
      'email',
      'mobile',
      'subject',
      'department',
      'qualification',
      'experience',
      'joiningDate',
      'address',
      'emergencyContact',
      'gender',
      'pinCode',
      'profilePic',
    ];

    const payload = {};
    allowedUpdates.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
        payload[key] = req.body[key];
      }
    });

    const teacher = await TeacherUser.findByIdAndUpdate(
      req.user.id,
      { $set: payload },
      { new: true, runValidators: true, context: 'query' }
    )
      .select('-password')
      .lean();

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      teacher: {
        ...teacher,
        employeeId: teacher.username || teacher.employeeCode || '',
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
