const express = require('express');
const router = express.Router();
const StudentUser = require('../models/StudentUser');
const ParentUser = require('../models/ParentUser');
const Class = require('../models/Class');
const Timetable = require('../models/Timetable');
const ExamResult = require('../models/ExamResult');
const Exam = require('../models/Exam');
const StudentProgress = require('../models/StudentProgress');
const Assignment = require('../models/Assignment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminAuth = require('../middleware/adminAuth');
const { generatePassword } = require('../utils/generator');
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
  return null;
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
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const padNumber = (value, size = 3) => String(value).padStart(size, '0');
const normalizeOrgPrefix = (adminUsername) => {
  const normalized = String(adminUsername || '')
    .trim()
    .toUpperCase()
    .replace(/^EEC[-_]?/, '')
    .replace(/[^A-Z0-9-]/g, '');
  return normalized || 'SCH';
};
const resolveStudentPrefix = ({ adminUsername, admissionYear }) =>
  `${normalizeOrgPrefix(adminUsername)}-STD-${String(admissionYear).slice(-2)}-`;
const resolveParentPrefix = ({ adminUsername, admissionYear }) =>
  `${normalizeOrgPrefix(adminUsername)}-PTA-${String(admissionYear).slice(-2)}-`;
const getNextStudentUsername = async ({ schoolId, campusId, prefix }) => {
  const regex = new RegExp(`^${escapeRegex(prefix)}\\d+$`);
  const filter = {
    schoolId,
    username: { $regex: regex },
  };
  if (campusId) filter.campusId = campusId;
  const users = await StudentUser.find(filter).select('username').lean();
  let maxSequence = 0;
  users.forEach((user) => {
    const value = String(user?.username || '');
    const match = value.match(/(\d+)$/);
    const seq = match ? Number(match[1]) : 0;
    if (Number.isFinite(seq) && seq > maxSequence) maxSequence = seq;
  });
  return `${prefix}${padNumber(maxSequence + 1)}`;
};
const getNextParentUsername = async ({ schoolId, campusId, prefix }) => {
  const regex = new RegExp(`^${escapeRegex(prefix)}\\d+$`);
  const filter = {
    schoolId,
    username: { $regex: regex },
  };
  if (campusId) filter.campusId = campusId;
  const users = await ParentUser.find(filter).select('username').lean();
  let maxSequence = 0;
  users.forEach((user) => {
    const value = String(user?.username || '');
    const match = value.match(/(\d+)$/);
    const seq = match ? Number(match[1]) : 0;
    if (Number.isFinite(seq) && seq > maxSequence) maxSequence = seq;
  });
  return `${prefix}${padNumber(maxSequence + 1)}`;
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
    admissionNumber,
    academicYear,
    serialNo,
    status,
    mobile,
    email,
    address,
    permanentAddress,
    pinCode,
    profilePic,
    birthPlace,
    bloodGroup,
    caste,
    fatherName,
    fatherPhone,
    fatherOccupation,
    motherName,
    motherPhone,
    motherOccupation,
    guardianName,
    guardianPhone,
    guardianEmail,
    nationality,
    religion,
    category,
    knownHealthIssues,
    allergies,
    immunizationStatus,
    learningDisabilities,
    aadharNumber,
    birthCertificateNo,
    previousSchoolName,
    previousClass,
    previousPercentage,
    transferCertificateNo,
    transferCertificateDate,
    reasonForLeaving,
    applicationId,
    applicationDate,
    approvalStatus,
    remarks,
    password: requestedPassword
  } = req.body;

  try {
    const resolvedSchoolId = req.admin?.schoolId || schoolId || null;
    const resolvedCampusId = req.campusId || req.admin?.campusId || req.body?.campusId || null;

    if (!resolvedSchoolId) {
      return res.status(400).json({ error: 'schoolId is required to generate student ID' });
    }

    const resolvedAdmissionDate = resolveAdmissionDate(admissionDate) || undefined;
    const admissionYear = resolveAdmissionYear(resolvedAdmissionDate || admissionDate);

    let password = requestedPassword;
    if (password) {
      if (!isStrongPassword(password)) {
        return res.status(400).json({ error: passwordPolicyMessage });
      }
    } else {
      password = generatePassword();
    }

    const resolvedName = name || 'Student';
    const resolvedGrade = grade || '';
    const resolvedSection = section || '';
    const resolvedGender = (gender || 'male').toLowerCase();
    const resolvedRoll = roll || undefined;
    const resolvedMobile = mobile || '';
    const resolvedEmail = email || '';

    const prefix = resolveStudentPrefix({
      adminUsername: req.admin?.username,
      admissionYear,
    });
    const studentCode = await getNextStudentUsername({
      schoolId: resolvedSchoolId,
      campusId: resolvedCampusId,
      prefix,
    });

    const payload = {
      username: studentCode,
      password,
      initialPassword: password,
      schoolId: resolvedSchoolId,
      campusId: resolvedCampusId,
      campusName: req.isSuperAdmin ? req.body?.campusName : req.admin?.campusName,
      campusType: req.isSuperAdmin ? req.body?.campusType : req.admin?.campusType,
      name: resolvedName,
      grade: resolvedGrade,
      section: resolvedSection,
      roll: resolvedRoll,
      gender: resolvedGender,
      dob,
      admissionDate: resolvedAdmissionDate,
      admissionNumber: admissionNumber || '',
      academicYear: academicYear || '',
      serialNo: serialNo || '',
      status: status || 'Active',
      mobile: resolvedMobile,
      email: resolvedEmail,
      address: address || '',
      permanentAddress: permanentAddress || '',
      pinCode: pinCode || '',
      profilePic: profilePic || '',
      birthPlace: birthPlace || '',
      bloodGroup: bloodGroup || '',
      caste: caste || '',
      fatherName: fatherName || '',
      fatherPhone: fatherPhone || '',
      fatherOccupation: fatherOccupation || '',
      motherName: motherName || '',
      motherPhone: motherPhone || '',
      motherOccupation: motherOccupation || '',
      guardianName: guardianName || '',
      guardianPhone: guardianPhone || '',
      guardianEmail: guardianEmail || '',
      nationality: nationality || '',
      religion: religion || '',
      category: category || '',
      knownHealthIssues: knownHealthIssues || '',
      allergies: allergies || '',
      immunizationStatus: immunizationStatus || '',
      learningDisabilities: learningDisabilities || '',
      aadharNumber: aadharNumber || '',
      birthCertificateNo: birthCertificateNo || '',
      previousSchoolName: previousSchoolName || '',
      previousClass: previousClass || '',
      previousPercentage: previousPercentage || '',
      transferCertificateNo: transferCertificateNo || '',
      transferCertificateDate: transferCertificateDate || '',
      reasonForLeaving: reasonForLeaving || '',
      applicationId: applicationId || '',
      applicationDate: applicationDate || '',
      approvalStatus: approvalStatus || '',
      remarks: remarks || '',
      studentCode,
    };

    const studentUser = await StudentUser.create(payload);

    let parentCredentials = null;
    const parentName =
      guardianName ||
      fatherName ||
      motherName ||
      (resolvedName ? `Parent of ${resolvedName}` : '');
    const parentMobile = guardianPhone || fatherPhone || motherPhone || '';
    const parentEmail = guardianEmail || '';
    if (parentName && (parentMobile || parentEmail)) {
      const parentFilter = {
        schoolId: resolvedSchoolId,
        $or: [
          parentEmail ? { email: parentEmail } : null,
          parentMobile ? { mobile: parentMobile } : null,
        ].filter(Boolean),
      };
      let parentUser = null;
      if (parentFilter.$or.length) {
        parentUser = await ParentUser.findOne(parentFilter);
      }
      if (!parentUser) {
        const parentPrefix = resolveParentPrefix({
          adminUsername: req.admin?.username,
          admissionYear,
        });
        const parentUsername = await getNextParentUsername({
          schoolId: resolvedSchoolId,
          campusId: resolvedCampusId,
          prefix: parentPrefix,
        });
        const parentPassword = generatePassword();
        parentUser = await ParentUser.create({
          username: parentUsername,
          password: parentPassword,
          initialPassword: parentPassword,
          schoolId: resolvedSchoolId,
          campusId: resolvedCampusId,
          name: parentName,
          mobile: parentMobile,
          email: parentEmail,
          childrenIds: [studentUser._id],
          children: [resolvedName],
          grade: [resolvedGrade],
        });
        parentCredentials = {
          userId: parentUser.username,
          password: parentPassword,
        };
      } else {
        const existingIds = new Set(
          (parentUser.childrenIds || []).map((id) => String(id))
        );
        if (!existingIds.has(String(studentUser._id))) {
          parentUser.childrenIds = [...(parentUser.childrenIds || []), studentUser._id];
        }
        const existingChildren = new Set(parentUser.children || []);
        if (resolvedName && !existingChildren.has(resolvedName)) {
          parentUser.children = [...(parentUser.children || []), resolvedName];
        }
        const existingGrades = new Set(parentUser.grade || []);
        if (resolvedGrade && !existingGrades.has(resolvedGrade)) {
          parentUser.grade = [...(parentUser.grade || []), resolvedGrade];
        }
        await parentUser.save();
      }
    }

    res.status(201).json({
      message: 'Student registered successfully',
      username: payload.username,
      studentCode,
      password,
      userId: studentUser._id,
      parentCredentials,
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
    if (!user.lastLoginAt) {
      return res.json({ requiresPasswordReset: true, username: user.username || user.studentCode });
    }
    if (!user.studentCode) {
      user.studentCode = user.username;
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

router.post('/reset-first-password', rateLimit({ windowMs: 60 * 1000, max: 10 }), async (req, res) => {
  // #swagger.tags = ['Students']
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

    const user = await StudentUser.findOne({
      $or: [
        { username: String(username).trim() },
        { studentCode: String(username).trim() },
      ],
    });
    if (!user) {
      return res.status(404).json({ error: 'Student not found' });
    }
    if (user.lastLoginAt) {
      return res.status(400).json({ error: 'Password reset already completed' });
    }

    user.password = String(newPassword);
    user.initialPassword = "";
    user.lastLoginAt = new Date();
    if (!user.studentCode) {
      user.studentCode = user.username;
    }
    await user.save();
    res.json({ message: 'Password reset successful' });
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
            .populate('schoolId', 'name code logo')
      .lean();

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Calculate stats
    const totalAttendance = student.attendance?.length || 0;
    const presentDays = student.attendance?.filter(a => a.status === 'present').length || 0;
    const attendancePercentage = totalAttendance > 0 ? Math.round((presentDays / totalAttendance) * 100) : 0;

    const resolvedGrade = student.grade || '';
    const resolvedSection = student.section || '';
    const resolvedRoll = student.roll || '';

    const courseInfo = null;

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

    // Transform exam results
    const formattedResults = examResults.map(result => ({
      _id: result._id,
      examName: result.examId?.title || 'Exam',
      subject: result.examId?.subject || '',
      date: result.examId?.date || null,
      type: result.examId?.term || 'general',
      resultType: 'exam',
      obtainedMarks: result.marks || 0,
      totalMarks: result.examId?.marks || 100,
      percentage: result.examId?.marks ? Math.round((result.marks / result.examId.marks) * 100) : 0,
      grade: result.grade || '',
      status: result.status || 'pass',
      remarks: result.remarks || '',
      subjects: []
    }));

    // Fetch graded assignment results from StudentProgress
    const progress = await StudentProgress.findOne({
      studentId: req.user.id,
      schoolId: student.schoolId
    }).lean();

    const gradedSubmissions = (progress?.submissions || []).filter(
      sub => sub.status === 'graded' && sub.score !== undefined && sub.score !== null
    );

    let assignmentResults = [];
    if (gradedSubmissions.length > 0) {
      const assignmentIds = gradedSubmissions.map(s => s.assignmentId);
      const assignments = await Assignment.find({ _id: { $in: assignmentIds } })
        .select('title subject marks dueDate')
        .lean();
      const aMap = {};
      assignments.forEach(a => { aMap[String(a._id)] = a; });

      assignmentResults = gradedSubmissions.map(sub => {
        const a = aMap[String(sub.assignmentId)] || {};
        const total = a.marks || 100;
        const obtained = sub.score;
        return {
          _id: sub._id,
          examName: a.title || 'Assignment',
          subject: a.subject || '',
          date: sub.submittedAt || null,
          type: 'assignment',
          resultType: 'assignment',
          obtainedMarks: obtained,
          totalMarks: total,
          percentage: Math.round((obtained / total) * 100),
          grade: obtained >= total * 0.9 ? 'A+' : obtained >= total * 0.8 ? 'A' : obtained >= total * 0.7 ? 'B' : obtained >= total * 0.6 ? 'C' : obtained >= total * 0.5 ? 'D' : 'F',
          status: obtained >= total * 0.4 ? 'pass' : 'fail',
          remarks: sub.feedback || '',
          subjects: []
        };
      });
    }

    res.json({
      results: [...formattedResults, ...assignmentResults]
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
      .select('grade section schoolId campusId')
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

    const resolvedGrade = String(student.grade || '').trim();
    const resolvedSection = String(student.section || '').trim();

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
