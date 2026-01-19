const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth'); // Protect the route
const StudentUser = require('../models/StudentUser');
const TeacherUser = require('../models/TeacherUser');
const ParentUser = require('../models/ParentUser');
const Principal = require('../models/Principal');
const {
  getNextStudentSequence,
  getNextEmployeeSequence,
  buildStudentCode,
  buildEmployeeCode,
} = require('../utils/codeGenerator');

const parseCsvLine = (line = '') => {
  const out = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      out.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out.map((val) => val.trim());
};

const parseCsv = (csvText = '') => {
  const lines = String(csvText)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (!lines.length) return { headers: [], rows: [] };
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });
    return row;
  });
  return { headers, rows };
};

const resolveAdmissionYear = (value) => {
  if (!value) return new Date().getFullYear();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().getFullYear();
  }
  return parsed.getFullYear();
};

// Utility to get the right model based on role
const getModelByRole = (role) => {
  switch (role) {
    case 'student': return StudentUser;
    case 'teacher': return TeacherUser;
    case 'parent': return ParentUser;
    default: return null;
  }
};

// Admin creates a user (student/teacher/parent)
router.post('/create-user', adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  const { role, username, password, name, mobile, email, city, address, state, pinCode, schoolId } = req.body;

  const Model = getModelByRole(role);
  if (!Model) return res.status(400).json({ error: 'Invalid user role' });

  try {
    const { isStrongPassword, passwordPolicyMessage } = require('../utils/passwordPolicy');
    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: passwordPolicyMessage });
    }
    const resolvedSchoolId = req.schoolId || (req.isSuperAdmin ? schoolId : null);
    if (!resolvedSchoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }
    const payload = {
      username,
      password,
      name,
      mobile,
      email,
      city,
      address,
      state,
      pinCode,
      schoolId: resolvedSchoolId,
    };
    if (role === 'student') {
      const admissionYear = resolveAdmissionYear(req.body?.admissionDate);
      const { schoolCode, nextSequence } = await getNextStudentSequence(resolvedSchoolId, admissionYear);
      payload.studentCode = buildStudentCode(schoolCode, admissionYear, nextSequence);
    }
    if (role === 'teacher') {
      const { schoolCode, nextSequence } = await getNextEmployeeSequence(resolvedSchoolId);
      payload.employeeCode = buildEmployeeCode(schoolCode, nextSequence);
    }
    const newUser = new Model(payload);
    await newUser.save();
    res.status(201).json({ message: `${role} user created successfully` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Bulk create users for a role (admin only)
router.post('/bulk-create-users', adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  const { role, users, schoolId } = req.body || {};
  const Model = getModelByRole(role);
  if (!Model) return res.status(400).json({ error: 'Invalid user role' });
  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ error: 'users array is required' });
  }

  const resolvedSchoolId = req.schoolId || (req.isSuperAdmin ? schoolId : null);
  if (!resolvedSchoolId) {
    return res.status(400).json({ error: 'schoolId is required' });
  }

  const results = {
    created: 0,
    failed: 0,
    errors: [],
  };

  const studentSequenceByYear = new Map();
  let employeeSequenceState = null;
  if (role === 'teacher') {
    employeeSequenceState = await getNextEmployeeSequence(resolvedSchoolId);
  }

  for (let i = 0; i < users.length; i += 1) {
    const user = users[i] || {};
    if (!user.username || !user.password) {
      results.failed += 1;
      results.errors.push({ index: i, error: 'username and password are required' });
      continue;
    }

    try {
      const { isStrongPassword, passwordPolicyMessage } = require('../utils/passwordPolicy');
      if (!isStrongPassword(user.password)) {
        results.failed += 1;
        results.errors.push({ index: i, error: passwordPolicyMessage });
        continue;
      }
      const payload = {
        ...user,
        schoolId: resolvedSchoolId,
      };
      delete payload._id;
      delete payload.id;
      if (role === 'student') {
        const admissionYear = resolveAdmissionYear(user.admissionDate);
        if (!studentSequenceByYear.has(admissionYear)) {
          const sequenceState = await getNextStudentSequence(resolvedSchoolId, admissionYear);
          studentSequenceByYear.set(admissionYear, sequenceState);
        }
        const sequenceState = studentSequenceByYear.get(admissionYear);
        payload.studentCode = buildStudentCode(
          sequenceState.schoolCode,
          admissionYear,
          sequenceState.nextSequence
        );
        sequenceState.nextSequence += 1;
      }
      if (role === 'teacher' && employeeSequenceState) {
        payload.employeeCode = buildEmployeeCode(
          employeeSequenceState.schoolCode,
          employeeSequenceState.nextSequence
        );
        employeeSequenceState.nextSequence += 1;
      }

      const newUser = new Model(payload);
      await newUser.save();
      results.created += 1;
    } catch (err) {
      results.failed += 1;
      results.errors.push({ index: i, error: err.message });
    }
  }

  res.status(200).json(results);
});

// Bulk import users from CSV (admin only)
router.post('/bulk-import-csv', adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  const { role, csv, schoolId } = req.body || {};
  const Model = getModelByRole(role);
  if (!Model) return res.status(400).json({ error: 'Invalid user role' });
  if (!csv || !String(csv).trim()) {
    return res.status(400).json({ error: 'csv is required' });
  }

  const resolvedSchoolId = req.schoolId || (req.isSuperAdmin ? schoolId : null);
  if (!resolvedSchoolId) {
    return res.status(400).json({ error: 'schoolId is required' });
  }

  const { rows } = parseCsv(csv);
  if (!rows.length) {
    return res.status(400).json({ error: 'No rows found in csv' });
  }

  const results = {
    created: 0,
    failed: 0,
    errors: [],
  };

  const studentSequenceByYear = new Map();
  let employeeSequenceState = null;
  if (role === 'teacher') {
    employeeSequenceState = await getNextEmployeeSequence(resolvedSchoolId);
  }

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i] || {};
    if (!row.username || !row.password) {
      results.failed += 1;
      results.errors.push({ index: i, error: 'username and password are required' });
      continue;
    }
    try {
      const { isStrongPassword, passwordPolicyMessage } = require('../utils/passwordPolicy');
      if (!isStrongPassword(row.password)) {
        results.failed += 1;
        results.errors.push({ index: i, error: passwordPolicyMessage });
        continue;
      }
      const payload = {
        ...row,
        schoolId: resolvedSchoolId,
      };
      delete payload._id;
      delete payload.id;
      if (role === 'student') {
        const admissionYear = resolveAdmissionYear(row.admissionDate);
        if (!studentSequenceByYear.has(admissionYear)) {
          const sequenceState = await getNextStudentSequence(resolvedSchoolId, admissionYear);
          studentSequenceByYear.set(admissionYear, sequenceState);
        }
        const sequenceState = studentSequenceByYear.get(admissionYear);
        payload.studentCode = buildStudentCode(
          sequenceState.schoolCode,
          admissionYear,
          sequenceState.nextSequence
        );
        sequenceState.nextSequence += 1;
      }
      if (role === 'teacher' && employeeSequenceState) {
        payload.employeeCode = buildEmployeeCode(
          employeeSequenceState.schoolCode,
          employeeSequenceState.nextSequence
        );
        employeeSequenceState.nextSequence += 1;
      }
      const newUser = new Model(payload);
      await newUser.save();
      results.created += 1;
    } catch (err) {
      results.failed += 1;
      results.errors.push({ index: i, error: err.message });
    }
  }

  return res.status(200).json(results);
});

router.get("/get-students", adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  try {
    const filter = req.schoolId ? { schoolId: req.schoolId } : {};
    const students = await StudentUser.find(filter);
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-teachers", adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  try {
    const filter = req.schoolId ? { schoolId: req.schoolId } : {};
    const teachers = await TeacherUser.find(filter);
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-parents", adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  try {
    const filter = req.schoolId ? { schoolId: req.schoolId } : {};
    const parents = await ParentUser.find(filter);
    res.status(200).json(parents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-principals", adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  try {
    const filter = req.schoolId ? { schoolId: req.schoolId } : {};
    const principals = await Principal.find(filter)
      .select('-password')
      .populate('schoolId', 'name code');
    res.status(200).json(principals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Live dashboard statistics endpoint
router.get("/dashboard-stats", adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  try {
    const filter = req.schoolId ? { schoolId: req.schoolId } : {};
    // Fetch counts from all user types
    const [studentCount, teacherCount, parentCount] = await Promise.all([
      StudentUser.countDocuments(filter),
      TeacherUser.countDocuments(filter),
      ParentUser.countDocuments(filter)
    ]);

    // Calculate additional stats
    const totalUsers = studentCount + teacherCount + parentCount;

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentStudents, recentTeachers, recentParents] = await Promise.all([
      StudentUser.countDocuments({ ...filter, createdAt: { $gte: thirtyDaysAgo } }),
      TeacherUser.countDocuments({ ...filter, createdAt: { $gte: thirtyDaysAgo } }),
      ParentUser.countDocuments({ ...filter, createdAt: { $gte: thirtyDaysAgo } })
    ]);

    res.status(200).json({
      students: {
        total: studentCount,
        recent: recentStudents
      },
      teachers: {
        total: teacherCount,
        recent: recentTeachers
      },
      parents: {
        total: parentCount,
        recent: recentParents
      },
      totalUsers,
      recentTotal: recentStudents + recentTeachers + recentParents,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
