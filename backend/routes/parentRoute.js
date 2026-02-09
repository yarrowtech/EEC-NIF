const express = require('express');
const router = express.Router();
const ParentUser = require('../models/ParentUser');
const StudentUser = require('../models/StudentUser');
const ClassModel = require('../models/Class');
const Timetable = require('../models/Timetable');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminAuth = require('../middleware/adminAuth');
const authParent = require('../middleware/authParent');
const { generateUsername, generatePassword } = require('../utils/generator');
const rateLimit = require('../middleware/rateLimit');
const { isStrongPassword, passwordPolicyMessage } = require('../utils/passwordPolicy');

const normalizeKey = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');

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
const resolveParentPrefix = ({ adminUsername, year }) =>
  `${normalizeOrgPrefix(adminUsername)}-PTA-${String(year).slice(-2)}-`;
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

const buildStudentSchedule = async ({ student, schoolId, campusId }) => {
  const resolvedGrade = String(student?.grade || '').trim();
  const resolvedSection = String(student?.section || '').trim();

  if (!resolvedGrade) {
    return {
      className: '',
      sectionName: resolvedSection,
      schedule: {},
      hasRoutine: false,
    };
  }

  const classFilter = {
    schoolId,
    name: resolvedGrade,
  };
  if (campusId) {
    classFilter.campusId = campusId;
  }

  let classDoc = await ClassModel.findOne(classFilter).lean();
  if (!classDoc) {
    classDoc = await ClassModel.findOne({
      ...classFilter,
      name: { $regex: `^${escapeRegex(resolvedGrade)}$`, $options: 'i' },
    }).lean();
  }

  if (!classDoc) {
    return {
      className: resolvedGrade,
      sectionName: resolvedSection,
      schedule: {},
      hasRoutine: false,
    };
  }

  const timetableFilter = {
    schoolId,
    classId: classDoc._id,
  };
  if (campusId) {
    timetableFilter.campusId = campusId;
  }

  const timetables = await Timetable.find(timetableFilter)
    .populate('sectionId', 'name')
    .populate('entries.subjectId', 'name')
    .populate('entries.teacherId', 'name')
    .lean();

  if (!Array.isArray(timetables) || timetables.length === 0) {
    return {
      className: classDoc.name,
      sectionName: resolvedSection,
      schedule: {},
      hasRoutine: false,
    };
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
    return {
      className: classDoc.name,
      sectionName: timetable?.sectionId?.name || resolvedSection,
      schedule: {},
      hasRoutine: false,
    };
  }

  const resolvedSectionName = timetable?.sectionId?.name || resolvedSection || '';
  const scheduleByDay = {};
  timetable.entries.forEach((entry) => {
    if (!entry?.dayOfWeek) return;
    if (!scheduleByDay[entry.dayOfWeek]) {
      scheduleByDay[entry.dayOfWeek] = [];
    }
    scheduleByDay[entry.dayOfWeek].push({
      time: `${entry.startTime || ''}${entry.endTime ? ` - ${entry.endTime}` : ''}`.trim(),
      subject: entry.subjectId?.name || 'Unknown',
      instructor: entry.teacherId?.name || 'TBA',
      room: entry.room || '',
      period: entry.period,
      className: classDoc.name,
      sectionName: resolvedSectionName,
    });
  });

  Object.keys(scheduleByDay).forEach((day) => {
    scheduleByDay[day].sort((a, b) => (a.period || 0) - (b.period || 0));
  });

  return {
    className: classDoc.name,
    sectionName: resolvedSectionName,
    schedule: scheduleByDay,
    hasRoutine: true,
  };
};

// Parent Registration
router.post('/register', adminAuth, async (req, res) => {
  // #swagger.tags = ['Parents']
  const {
    name,
    schoolId,
    mobile,
    email,
    children,
    grade,
  } = req.body;

  try {
    const fallbackUsername = await generateUsername(name, 'parent');
    const password = generatePassword();
    const resolvedSchoolId = req.schoolId || (req.isSuperAdmin ? schoolId : null);
    const resolvedCampusId = req.campusId || (req.isSuperAdmin ? req.body?.campusId : null);
    if (!resolvedSchoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }
    if (!resolvedCampusId) {
      return res.status(400).json({ error: 'campusId is required' });
    }
    const parentPrefix = resolveParentPrefix({
      adminUsername: req.admin?.username,
      year: new Date().getFullYear(),
    });
    const username = await getNextParentUsername({
      schoolId: resolvedSchoolId,
      campusId: resolvedCampusId,
      prefix: parentPrefix,
    }).catch(() => fallbackUsername);
    const allChild = children.split(',').map(child => child.trim());
    const allGrade = grade.split(',').map(g => g.trim());
    const user = new ParentUser({
      username,
      password,
      schoolId: resolvedSchoolId,
      campusId: resolvedCampusId,
      name,
      mobile,
      email,
      children: allChild,
      grade: allGrade,
    });

    await user.save();
    res.status(201).json({ message: 'Parent registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Parent Login
router.post('/login', rateLimit({ windowMs: 60 * 1000, max: 10 }), async (req, res) => {
  // #swagger.tags = ['Parents']
  const { username, password } = req.body;

  try {
    const user = await ParentUser.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.campusId) {
      return res.status(400).json({ error: 'campusId is required for this account' });
    }
    if (!user.lastLoginAt) {
      return res.json({ requiresPasswordReset: true, username: user.username });
    }

    const token = jwt.sign(
      { id: user._id, userType: 'parent', schoolId: user.schoolId || null, campusId: user.campusId || null },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/profile', authParent, async (req, res) => {
  // #swagger.tags = ['Parents']
  try {
    if (req.userType !== 'parent') {
      return res.status(403).json({ error: 'Forbidden - not a parent' });
    }
    const user = await ParentUser.findById(req.user.id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ error: 'Parent not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/routine', authParent, async (req, res) => {
  // #swagger.tags = ['Parents']
  try {
    if (req.userType !== 'parent') {
      return res.status(403).json({ error: 'Forbidden - not a parent' });
    }

    const parent = await ParentUser.findById(req.user.id)
      .select('schoolId campusId childrenIds children grade')
      .lean();

    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    const schoolId = parent.schoolId || req.schoolId || null;
    const campusId = parent.campusId || req.campusId || null;
    if (!schoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }

    const studentFilter = { schoolId };
    if (campusId) {
      studentFilter.campusId = campusId;
    }

    let students = [];
    if (Array.isArray(parent.childrenIds) && parent.childrenIds.length > 0) {
      students = await StudentUser.find({
        ...studentFilter,
        _id: { $in: parent.childrenIds },
      })
        .select('name grade section')
        .lean();
    }

    if (students.length === 0 && Array.isArray(parent.children) && parent.children.length > 0) {
      const validNames = parent.children.map((name) => String(name || '').trim()).filter(Boolean);
      if (validNames.length > 0) {
        students = await StudentUser.find({
          ...studentFilter,
          name: { $in: validNames },
        })
          .select('name grade section')
          .lean();
      }
    }

    if (students.length === 0) {
      return res.json({
        children: [],
        meta: { childCount: 0, withRoutine: 0 },
      });
    }

    const childRoutines = [];
    for (const student of students) {
      const routine = await buildStudentSchedule({
        student,
        schoolId,
        campusId,
      });

      childRoutines.push({
        studentId: student._id,
        studentName: student.name || 'Student',
        grade: student.grade || '',
        section: student.section || '',
        className: routine.className || '',
        sectionName: routine.sectionName || '',
        schedule: routine.schedule || {},
        hasRoutine: Boolean(routine.hasRoutine),
      });
    }

    const withRoutine = childRoutines.filter((child) =>
      Object.values(child.schedule || {}).some((entries) => Array.isArray(entries) && entries.length > 0)
    ).length;

    res.json({
      children: childRoutines,
      meta: {
        childCount: childRoutines.length,
        withRoutine,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to load parent routine' });
  }
});

router.post('/reset-first-password', rateLimit({ windowMs: 60 * 1000, max: 10 }), async (req, res) => {
  // #swagger.tags = ['Parents']
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

    const user = await ParentUser.findOne({ username: String(username).trim() });
    if (!user) {
      return res.status(404).json({ error: 'Parent not found' });
    }
    if (user.lastLoginAt) {
      return res.status(400).json({ error: 'Password reset already completed' });
    }

    user.password = String(newPassword);
    user.initialPassword = "";
    user.lastLoginAt = new Date();
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
