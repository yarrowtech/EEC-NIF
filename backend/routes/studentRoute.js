const express = require('express');
const router = express.Router();
const StudentUser = require('../models/StudentUser');
const NifStudent = require('../models/NifStudent');
const Class = require('../models/Class');
const Timetable = require('../models/Timetable');
const ExamResult = require('../models/ExamResult');
const Exam = require('../models/Exam');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminAuth = require('../middleware/adminAuth');
const { generatePassword } = require('../utils/generator');
const { generateStudentCode } = require('../utils/codeGenerator');
const extractPopulatedDoc = (doc) => {
  if (doc && typeof doc.toJSON === 'function') {
    return doc.toJSON();
  }
  if (doc && typeof doc.toObject === 'function') {
    return doc.toObject();
  }
  return doc || null;
};

const extractSchoolInfo = (school = null) => {
  const payload = extractPopulatedDoc(school);
  if (!payload || typeof payload !== 'object') return null;
  return {
    id: payload._id || payload.id || null,
    name: payload.name || '',
    code: payload.code || '',
    logo: payload.logo?.secure_url || payload.logo?.url || null,
  };
};

const resolvePhotoValue = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.secure_url || value.url || value.path || null;
  }
  return null;
};

const resolveProfilePhoto = (studentDoc) => {
  const direct = resolvePhotoValue(studentDoc?.profilePic);
  if (direct) return direct;
  const nif = extractPopulatedDoc(studentDoc?.nifStudent);
  if (!nif || typeof nif !== 'object') return null;
  const photo =
    resolvePhotoValue(nif.photograph) ||
    resolvePhotoValue(nif.documents?.photograph);
  return photo;
};

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
    const resolvedCampusId = req.campusId || req.admin?.campusId || req.body?.campusId || existingPortalUser?.campusId || null;

    if (!resolvedSchoolId) {
      return res.status(400).json({ error: 'schoolId is required to generate student ID' });
    }

    const resolvedAdmissionDate =
      resolveAdmissionDate(admissionDate || nifStudentDoc?.admissionDate) || undefined;
    const admissionYear = resolveAdmissionYear(
      resolvedAdmissionDate || admissionDate || nifStudentDoc?.admissionDate
    );

    // Use requested password or generate new one
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

    let studentCode = existingPortalUser?.studentCode;
    if (!studentCode) {
      studentCode = await generateStudentCode(resolvedSchoolId, admissionYear);
    }

    const nifPhoto =
      resolvePhotoValue(nifStudentDoc?.photograph) ||
      resolvePhotoValue(nifStudentDoc?.documents?.photograph);

    const payload = {
      username: studentCode,
      password,
      schoolId: resolvedSchoolId,
      campusId: resolvedCampusId,
      campusName: req.isSuperAdmin ? req.body?.campusName : req.admin?.campusName,
      campusType: req.isSuperAdmin ? req.body?.campusType : req.admin?.campusType,
      nifStudent: targetNifId,
      name: resolvedName,
      grade: resolvedGrade,
      section: resolvedSection,
      roll: resolvedRoll,
      gender: resolvedGender,
      dob: dob || nifStudentDoc?.dob,
      admissionDate: resolvedAdmissionDate,
      mobile: resolvedMobile,
      email: resolvedEmail,
      address: address || nifStudentDoc?.address || '',
      pinCode: pinCode || nifStudentDoc?.pincode || '',
      batchCode: resolvedBatchCode,
      studentCode,
    };
    if (!payload.profilePic && nifPhoto) {
      payload.profilePic = nifPhoto;
    }

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
        username: payload.username,
        issuedAt: new Date(),
        issuedBy: req.admin?._id || null,
      };
      await nifStudentDoc.save();
    }

    res.status(201).json({
      message: existingPortalUser ? 'Student credentials updated successfully' : 'Student registered successfully',
      username: payload.username,
      studentCode,
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
  const { username, password, studentId, id } = req.body;
  const identifier = (username || studentId || id || '').trim();

  try {
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Student ID and password are required' });
    }
    const user = await StudentUser.findOne({
      $or: [{ username: identifier }, { studentCode: identifier }],
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.campusId) {
      return res.status(400).json({ error: 'campusId is required for this account' });
    }
    if (!user.studentCode && user.schoolId) {
      const admissionYear = resolveAdmissionYear(user.admissionDate);
      user.studentCode = await generateStudentCode(user.schoolId, admissionYear);
      await user.save();
    }

    const token = jwt.sign(
      {
        id: user._id,
        userType: 'student',
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

// Test endpoint to check if any students exist
router.get('/test/list', adminAuth, async (req, res) => {
  // #swagger.tags = ['Students']
  try {
    const filter = req.schoolId ? { schoolId: req.schoolId } : {};
    if (req.campusId) {
      filter.campusId = req.campusId;
    }
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
      .populate('nifStudent', 'serialNo batchCode course grade section courseId duration status admissionDate photograph documents')
      .populate('schoolId', 'name code logo')
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

    const schoolInfo = extractSchoolInfo(student.schoolId);
    const response = {
      ...student,
      schoolId: schoolInfo?.id || student.schoolId || null,
      schoolInfo,
      schoolName: schoolInfo?.name || '',
      schoolLogo: schoolInfo?.logo || null,
      profilePic: resolveProfilePhoto(student),
      avatar: resolveProfilePhoto(student),
    };
    console.log('✅ Sending profile data to frontend');
    res.json(response);
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
      .populate('nifStudent', 'course grade class section roll batchCode duration status photograph documents serialNo')
      .populate('schoolId', 'name code logo')
      .lean();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const nifStudentData = extractPopulatedDoc(student.nifStudent);

    // Calculate stats
    const totalAttendance = student.attendance?.length || 0;
    const presentDays = student.attendance?.filter(a => a.status === 'present').length || 0;
    const attendancePercentage = totalAttendance > 0 ? Math.round((presentDays / totalAttendance) * 100) : 0;

    const resolvedGrade = nifStudentData?.class || nifStudentData?.grade || student.grade || '';
    const resolvedSection = nifStudentData?.section || student.section || '';
    const resolvedRoll = nifStudentData?.roll || student.roll || '';

    // Get course info from nifStudent
    const courseInfo = nifStudentData ? {
      name: nifStudentData.course || 'Not Assigned',
      grade: resolvedGrade || 'N/A',
      section: resolvedSection || 'N/A',
      roll: resolvedRoll || '',
      batchCode: nifStudentData.batchCode || 'N/A',
      duration: nifStudentData.duration || 'N/A',
      status: nifStudentData.status || 'Active'
    } : null;

    const schoolInfo = extractSchoolInfo(student.schoolId);

    const dashboardData = {
      profile: {
        name: student.name,
        username: student.username,
        email: student.email,
        mobile: student.mobile,
        grade: resolvedGrade,
        section: resolvedSection,
        roll: resolvedRoll,
        className: resolvedGrade,
        sectionName: resolvedSection,
        rollNumber: resolvedRoll,
        profilePic: resolveProfilePhoto(student),
        avatar: resolveProfilePhoto(student),
        campusName: student.campusName || '',
        campusType: student.campusType || '',
        school: schoolInfo,
        schoolName: schoolInfo?.name || '',
        schoolLogo: schoolInfo?.logo || null,
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
      school: schoolInfo,
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
      .select('name grade section schoolId campusId')
      .lean();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Fetch exam results from ExamResult collection (only published results)
    const examResults = await ExamResult.find({
      studentId: req.user.id,
      schoolId: student.schoolId,
      published: true, // Only show published results to students
      ...(student.campusId ? { campusId: student.campusId } : {}),
    })
      .populate('examId', 'title subject date term marks')
      .sort({ createdAt: -1 })
      .lean();

    // Transform to match frontend expectations
    const formattedResults = examResults.map(result => ({
      _id: result._id,
      examName: result.examId?.title || 'Exam',
      subject: result.examId?.subject || '',
      date: result.examId?.date || null,
      type: result.examId?.term || 'general',
      obtainedMarks: result.marks || 0,
      totalMarks: result.examId?.marks || 100,
      percentage: result.examId?.marks ? (result.marks / result.examId.marks) * 100 : 0,
      grade: result.grade || '',
      status: result.status || 'pass',
      remarks: result.remarks || '',
      subjects: [] // Can be expanded if needed
    }));

    res.json({
      results: formattedResults
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
      .select('grade section schoolId campusId nifStudent')
      .populate('nifStudent', 'class grade section')
      .lean();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const normalizeKey = (value) =>
      String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '');
    const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const nifStudent = student.nifStudent || null;
    const resolvedGrade = String(
      nifStudent?.class || nifStudent?.grade || student.grade || ''
    ).trim();
    const resolvedSection = String(
      nifStudent?.section || student.section || ''
    ).trim();

    if (!resolvedGrade) {
      return res.json({ schedule: [] });
    }

    // Find Class by grade/class name (case-insensitive fallback)
    const classFilter = {
      schoolId: student.schoolId,
      name: resolvedGrade,
    };
    if (student.campusId) {
      classFilter.campusId = student.campusId;
    }

    let classDoc = await Class.findOne(classFilter).lean();
    if (!classDoc) {
      classDoc = await Class.findOne({
        ...classFilter,
        name: { $regex: `^${escapeRegex(resolvedGrade)}$`, $options: 'i' },
      }).lean();
    }

    if (!classDoc) {
      return res.json({ schedule: [] });
    }

    // Load timetables for class and resolve section by student credential
    const timetableFilter = {
      schoolId: student.schoolId,
      classId: classDoc._id,
    };
    if (student.campusId) {
      timetableFilter.campusId = student.campusId;
    }

    const timetables = await Timetable.find(timetableFilter)
      .populate('sectionId', 'name')
      .populate('entries.subjectId', 'name')
      .populate('entries.teacherId', 'name')
      .lean();

    if (!Array.isArray(timetables) || timetables.length === 0) {
      return res.json({ schedule: [] });
    }

    let timetable = null;
    if (resolvedSection) {
      const normalizedSection = normalizeKey(resolvedSection);
      timetable = timetables.find((tt) => {
        const sectionName = tt?.sectionId?.name || '';
        return normalizeKey(sectionName) === normalizedSection;
      }) || null;
    }

    if (!timetable) {
      timetable = timetables.find((tt) => !tt.sectionId) || timetables[0];
    }

    if (!timetable || !Array.isArray(timetable.entries) || timetable.entries.length === 0) {
      return res.json({ schedule: [] });
    }

    const resolvedSectionName = timetable?.sectionId?.name || resolvedSection || '';

    // Transform timetable entries to schedule format grouped by day
    const scheduleByDay = {};
    timetable.entries.forEach(entry => {
      if (!scheduleByDay[entry.dayOfWeek]) {
        scheduleByDay[entry.dayOfWeek] = [];
      }
      scheduleByDay[entry.dayOfWeek].push({
        time: `${entry.startTime} - ${entry.endTime}`,
        subject: entry.subjectId?.name || 'Unknown',
        instructor: entry.teacherId?.name || 'TBA',
        room: entry.room || '',
        period: entry.period,
        className: classDoc.name,
        sectionName: resolvedSectionName,
      });
    });

    // Sort periods within each day
    Object.keys(scheduleByDay).forEach(day => {
      scheduleByDay[day].sort((a, b) => a.period - b.period);
    });

    res.json({
      schedule: scheduleByDay
    });
  } catch (err) {
    console.error('Schedule error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
