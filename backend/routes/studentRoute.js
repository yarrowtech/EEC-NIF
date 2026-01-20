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
const authStudent = require('../middleware/authStudent');

// Register Student
router.post('/register', adminAuth, async (req, res) => {
  // #swagger.tags = ['Students']
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
    batchCode,
  } = req.body;

  try {
    // Get the NifStudent reference (studentId is the NifStudent _id)
    const targetNifId = studentId || nifStudentId || null;
    let nifStudentDoc = null;
    let existingPortalUser = null;

    if (targetNifId) {
      nifStudentDoc = await NifStudent.findById(targetNifId);
      if (!nifStudentDoc) {
        return res.status(404).json({ error: 'NIF student not found' });
      }
      if (nifStudentDoc.studentPortalUser) {
        existingPortalUser = await StudentUser.findById(nifStudentDoc.studentPortalUser);
        if (!existingPortalUser) {
          nifStudentDoc.studentPortalUser = null;
        }
      }
    }

    const resolvedSchoolId = req.admin?.schoolId || schoolId || existingPortalUser?.schoolId || null;

    // Use requested credentials or generate new ones
    let username = (requestedUsername || '').trim();
    if (username) {
      const query = { username };
      if (existingPortalUser?._id) {
        query._id = { $ne: existingPortalUser._id };
      }
      const usernameConflict = await StudentUser.findOne(query);
      if (usernameConflict) {
        return res.status(409).json({ error: 'Username already exists. Please choose another.' });
      }
    } else {
      username = await generateUsername(name || nifStudentDoc?.name || 'Student', 'student');
    }

    let password = requestedPassword;
    if (password) {
      if (!isStrongPassword(password)) {
        return res.status(400).json({ error: passwordPolicyMessage });
      }
    } else {
      password = generatePassword();
    }

    const resolvedName = name || nifStudentDoc?.name || 'Student';
    const resolvedGrade = grade || nifStudentDoc?.grade || '';
    const resolvedSection = section || nifStudentDoc?.section || '';
    const resolvedGender = (gender || nifStudentDoc?.gender || 'male').toLowerCase();
    const resolvedRoll = roll || nifStudentDoc?.roll || undefined;
    const resolvedMobile = mobile || nifStudentDoc?.mobile || '';
    const resolvedEmail = email || nifStudentDoc?.email || '';
    const resolvedBatchCode = batchCode || nifStudentDoc?.batchCode || '';

    const payload = {
      username,
      password,
      schoolId: resolvedSchoolId,
      nifStudent: targetNifId,
      name: resolvedName,
      grade: resolvedGrade,
      section: resolvedSection,
      roll: resolvedRoll,
      gender: resolvedGender,
      dob: dob || nifStudentDoc?.dob,
      mobile: resolvedMobile,
      email: resolvedEmail,
      address: address || nifStudentDoc?.address || '',
      pinCode: pinCode || nifStudentDoc?.pincode || '',
      batchCode: resolvedBatchCode,
    };

    let studentUser;
    if (existingPortalUser) {
      // Update existing portal user
      studentUser = await StudentUser.findByIdAndUpdate(
        existingPortalUser._id,
        payload,
        { new: true, runValidators: true }
      );
    } else {
      // Create new portal user
      studentUser = await StudentUser.create(payload);
    }

    // Link back to NifStudent
    if (nifStudentDoc) {
      nifStudentDoc.studentPortalUser = studentUser._id;
      nifStudentDoc.portalAccess = {
        enabled: true,
        username: username,
        issuedAt: new Date(),
        issuedBy: req.admin?._id || null,
      };
      await nifStudentDoc.save();
    }

    res.status(201).json({
      message: existingPortalUser ? 'Student credentials updated successfully' : 'Student registered successfully',
      username,
      password,
      userId: studentUser._id,
      nifStudentId: nifStudentDoc?._id || null,
    });
  } catch (err) {
    console.error('Student register error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Login Student
router.post('/login', rateLimit({ windowMs: 60 * 1000, max: 10 }), async (req, res) => {
  // #swagger.tags = ['Students']
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

// Test endpoint to check if any students exist
router.get('/test/list', adminAuth, async (req, res) => {
  // #swagger.tags = ['Students']
  try {
    const filter = req.schoolId ? { schoolId: req.schoolId } : {};
    const students = await StudentUser.find(filter).select('username name grade section').limit(5).lean();
    res.json({
      total: await StudentUser.countDocuments(filter),
      sample: students
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Student Profile
router.get('/profile', authStudent, async (req, res) => {
  // #swagger.tags = ['Students']
  try {
    console.log('📥 Profile request received');
    console.log('User ID from token:', req.user.id);
    console.log('User type:', req.userType);

    const student = await StudentUser.findById(req.user.id)
      .select('-password')
      .populate('nifStudent', 'serialNo batchCode course grade section courseId duration status admissionDate')
      .lean();

    console.log('Student found:', student ? 'YES' : 'NO');
    if (student) {
      console.log('Student name:', student.name);
      console.log('Student username:', student.username);
      console.log('Student grade:', student.grade);
      console.log('Student section:', student.section);
    }

    if (!student) {
      console.log('❌ Student not found in database');
      return res.status(404).json({ error: 'Student not found' });
    }

    console.log('✅ Sending profile data to frontend');
    res.json(student);
  } catch (err) {
    console.error('❌ Get profile error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get Student Dashboard Data (stats, courses, etc.)
router.get('/dashboard', authStudent, async (req, res) => {
  // #swagger.tags = ['Students']
  try {
    const student = await StudentUser.findById(req.user.id)
      .populate('nifStudent')
      .lean();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Calculate stats
    const totalAttendance = student.attendance?.length || 0;
    const presentDays = student.attendance?.filter(a => a.status === 'present').length || 0;
    const attendancePercentage = totalAttendance > 0 ? Math.round((presentDays / totalAttendance) * 100) : 0;

    // Get course info from nifStudent
    const courseInfo = student.nifStudent ? {
      name: student.nifStudent.course || 'Not Assigned',
      grade: student.nifStudent.grade || student.grade || 'N/A',
      section: student.nifStudent.section || student.section || 'N/A',
      batchCode: student.nifStudent.batchCode || 'N/A',
      duration: student.nifStudent.duration || 'N/A',
      status: student.nifStudent.status || 'Active'
    } : null;

    const dashboardData = {
      profile: {
        name: student.name,
        username: student.username,
        email: student.email,
        mobile: student.mobile,
        grade: student.grade,
        section: student.section,
        roll: student.roll,
        profilePic: student.profilePic,
      },
      stats: {
        attendancePercentage,
        totalClasses: totalAttendance,
        presentDays,
        absentDays: totalAttendance - presentDays,
        activeCourses: courseInfo ? 1 : 0,
        achievements: 0, // Can be enhanced later
        studyHours: 0, // Can be enhanced later
        overallProgress: attendancePercentage, // Use attendance as proxy for now
      },
      course: courseInfo,
      recentAttendance: student.attendance?.slice(-10) || [],
    };

    res.json(dashboardData);
  } catch (err) {
    console.error('Dashboard data error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get Student Attendance
router.get('/attendance', authStudent, async (req, res) => {
  // #swagger.tags = ['Students']
  try {
    const student = await StudentUser.findById(req.user.id)
      .select('attendance name grade section')
      .lean();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const attendance = student.attendance || [];
    const totalClasses = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const leaveDays = attendance.filter(a => a.status === 'leave').length;
    const attendancePercentage = totalClasses > 0 ? Math.round((presentDays / totalClasses) * 100) : 0;

    res.json({
      attendance: attendance.sort((a, b) => new Date(b.date) - new Date(a.date)),
      summary: {
        totalClasses,
        presentDays,
        absentDays,
        leaveDays,
        attendancePercentage
      }
    });
  } catch (err) {
    console.error('Attendance error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get Student Assignments
router.get('/assignments', authStudent, async (req, res) => {
  // #swagger.tags = ['Students']
  try {
    const student = await StudentUser.findById(req.user.id)
      .select('assignments name grade section')
      .lean();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      assignments: student.assignments || []
    });
  } catch (err) {
    console.error('Assignments error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get Student Results
router.get('/results', authStudent, async (req, res) => {
  // #swagger.tags = ['Students']
  try {
    const student = await StudentUser.findById(req.user.id)
      .select('results name grade section')
      .lean();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      results: student.results || []
    });
  } catch (err) {
    console.error('Results error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get Student Schedule/Routine
router.get('/schedule', authStudent, async (req, res) => {
  // #swagger.tags = ['Students']
  try {
    const student = await StudentUser.findById(req.user.id)
      .select('schedule grade section')
      .lean();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      schedule: student.schedule || []
    });
  } catch (err) {
    console.error('Schedule error:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
