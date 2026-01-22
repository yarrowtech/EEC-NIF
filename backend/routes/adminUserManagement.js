const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const adminAuth = require('../middleware/adminAuth'); // Protect the route
const StudentUser = require('../models/StudentUser');
const TeacherUser = require('../models/TeacherUser');
const ParentUser = require('../models/ParentUser');
const StaffUser = require('../models/StaffUser');
const Principal = require('../models/Principal');
const Admin = require('../models/Admin');
const { generatePassword } = require('../utils/generator');
const {
  getNextStudentSequence,
  getNextEmployeeSequence,
  getNextTeacherSequence,
  getNextTeacherSequenceByPrefix,
  buildStudentCode,
  buildEmployeeCode,
  buildTeacherCode,
  generateTeacherCode,
  generateTeacherCodeForAdmin,
  getTeacherPrefix,
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

const resolveCampusValue = (req, payloadCampusId) => {
  if (req.campusId) {
    return {
      campusId: req.campusId,
      campusName: req.admin?.campusName || null,
      campusType: req.admin?.campusType || null,
    };
  }
  if (req.isSuperAdmin) {
    return {
      campusId: payloadCampusId || null,
      campusName: req.body?.campusName || null,
      campusType: req.body?.campusType || null,
    };
  }
  return { campusId: null, campusName: null, campusType: null };
};

const resolveAdminUsername = async (req) => {
  if (req.admin?.username) return req.admin.username;
  if (req.admin?.id) {
    const adminUser = await Admin.findById(req.admin.id).select('username').lean();
    return adminUser?.username || '';
  }
  return '';
};

const buildScopedFilter = (req) => {
  const filter = {};
  if (req.schoolId) {
    filter.schoolId = req.schoolId;
  }
  if (req.campusId) {
    filter.$or = [
      { campusId: req.campusId },
      { campusId: { $exists: false } },
      { campusId: null },
    ];
  }
  if (req.isSuperAdmin) {
    if (req.query?.schoolId) {
      filter.schoolId = req.query.schoolId;
    }
    if (req.query?.campusId) {
      filter.campusId = req.query.campusId;
      delete filter.$or;
    }
  }
  return filter;
};

const buildScopedIdFilter = (req, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }
  const filter = buildScopedFilter(req);
  filter._id = id;
  return filter;
};

// Utility to get the right model based on role
const getModelByRole = (role) => {
  switch (role) {
    case 'student': return StudentUser;
    case 'teacher': return TeacherUser;
    case 'parent': return ParentUser;
    case 'staff': return StaffUser;
    case 'principal': return Principal;
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
    if (role === 'principal' && !email) {
      return res.status(400).json({ error: 'email is required for principal' });
    }
    const campusContext = resolveCampusValue(req, req.body?.campusId);
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
      campusId: campusContext.campusId,
      campusName: campusContext.campusName,
      campusType: campusContext.campusType,
    };
    if (role === 'student') {
      const admissionYear = resolveAdmissionYear(req.body?.admissionDate);
      const { schoolCode, nextSequence } = await getNextStudentSequence(resolvedSchoolId, admissionYear);
      payload.studentCode = buildStudentCode(schoolCode, admissionYear, nextSequence);
    }
    if (role === 'teacher') {
      const adminUsername =
        req.body?.teacherAdminUsername ||
        req.body?.adminUsername ||
        (await resolveAdminUsername(req));
      payload.employeeCode = await generateTeacherCodeForAdmin(resolvedSchoolId, adminUsername);
      payload.username = payload.employeeCode;
    }
    if (role === 'staff') {
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
  const campusContext = resolveCampusValue(req, req.body?.campusId);

  const results = {
    created: 0,
    failed: 0,
    errors: [],
  };

  const studentSequenceByYear = new Map();
  let employeeSequenceState = null;
  let teacherSequenceState = null;
  if (role === 'staff') {
    employeeSequenceState = await getNextEmployeeSequence(resolvedSchoolId);
  }
  if (role === 'teacher') {
    const adminUsername =
      req.body?.teacherAdminUsername ||
      req.body?.adminUsername ||
      (await resolveAdminUsername(req));
    const teacherPrefix = await getTeacherPrefix({ adminUsername, schoolId: resolvedSchoolId });
    const seqState = await getNextTeacherSequenceByPrefix(resolvedSchoolId, teacherPrefix);
    teacherSequenceState = {
      schoolCode: teacherPrefix,
      nextSequence: seqState.nextSequence,
    };
  }

  for (let i = 0; i < users.length; i += 1) {
    const user = users[i] || {};
    if (!user.password || (!user.username && role !== 'teacher')) {
      results.failed += 1;
      results.errors.push({ index: i, error: 'username and password are required' });
      continue;
    }
    if (role === 'principal' && !user.email) {
      results.failed += 1;
      results.errors.push({ index: i, error: 'email is required for principal' });
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
        campusId: campusContext.campusId,
        campusName: campusContext.campusName,
        campusType: campusContext.campusType,
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
      if (role === 'teacher' && teacherSequenceState) {
        payload.employeeCode = buildTeacherCode(
          teacherSequenceState.schoolCode,
          teacherSequenceState.nextSequence
        );
        teacherSequenceState.nextSequence += 1;
        payload.username = payload.employeeCode;
      }
      if (role === 'staff' && employeeSequenceState) {
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
  const campusContext = resolveCampusValue(req, req.body?.campusId);

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
  let teacherSequenceState = null;
  if (role === 'staff') {
    employeeSequenceState = await getNextEmployeeSequence(resolvedSchoolId);
  }
  if (role === 'teacher') {
    const adminUsername =
      req.body?.teacherAdminUsername ||
      req.body?.adminUsername ||
      (await resolveAdminUsername(req));
    const teacherPrefix = await getTeacherPrefix({ adminUsername, schoolId: resolvedSchoolId });
    const seqState = await getNextTeacherSequenceByPrefix(resolvedSchoolId, teacherPrefix);
    teacherSequenceState = {
      schoolCode: teacherPrefix,
      nextSequence: seqState.nextSequence,
    };
  }

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i] || {};
    if (!row.password || (!row.username && role !== 'teacher')) {
      results.failed += 1;
      results.errors.push({ index: i, error: 'username and password are required' });
      continue;
    }
    if (role === 'principal' && !row.email) {
      results.failed += 1;
      results.errors.push({ index: i, error: 'email is required for principal' });
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
        campusId: campusContext.campusId,
        campusName: campusContext.campusName,
        campusType: campusContext.campusType,
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
      if (role === 'teacher' && teacherSequenceState) {
        payload.employeeCode = buildTeacherCode(
          teacherSequenceState.schoolCode,
          teacherSequenceState.nextSequence
        );
        teacherSequenceState.nextSequence += 1;
        payload.username = payload.employeeCode;
      }
      if (role === 'staff' && employeeSequenceState) {
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
    const filter = buildScopedFilter(req);
    const students = await StudentUser.find(filter);
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-teachers", adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  try {
    const filter = buildScopedFilter(req);
    const teachers = await TeacherUser.find(filter);
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-parents", adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  try {
    const filter = buildScopedFilter(req);
    const parents = await ParentUser.find(filter);
    res.status(200).json(parents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-staff", adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  try {
    const filter = buildScopedFilter(req);
    const staff = await StaffUser.find(filter);
    res.status(200).json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-principals", adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  try {
    const filter = buildScopedFilter(req);
    const principals = await Principal.find(filter);
    res.status(200).json(principals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const sanitizeUpdatePayload = (req) => {
  const payload = { ...req.body };
  delete payload._id;
  delete payload.id;
  if (!req.isSuperAdmin) {
    if (req.schoolId) {
      payload.schoolId = req.schoolId;
    }
    if (req.campusId) {
      payload.campusId = req.campusId;
      payload.campusName = req.admin?.campusName || payload.campusName;
      payload.campusType = req.admin?.campusType || payload.campusType;
    }
  }
  return payload;
};

const updateByScope = async (Model, req, res) => {
  const filter = buildScopedIdFilter(req, req.params.id);
  if (!filter) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const payload = sanitizeUpdatePayload(req);
  const updated = await Model.findOneAndUpdate(filter, payload, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    return res.status(404).json({ error: 'Record not found' });
  }
  return res.json(updated);
};

const deleteByScope = async (Model, req, res) => {
  const filter = buildScopedIdFilter(req, req.params.id);
  if (!filter) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const removed = await Model.findOneAndDelete(filter);
  if (!removed) {
    return res.status(404).json({ error: 'Record not found' });
  }
  return res.json({ message: 'Deleted successfully' });
};

router.put('/teachers/:id', adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  try {
    await updateByScope(TeacherUser, req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/teachers/:id/credentials', adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  try {
    const filter = buildScopedIdFilter(req, req.params.id);
    if (!filter) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const teacher = await TeacherUser.findOne(filter);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    const password = generatePassword();
    teacher.password = password;
    teacher.lastLoginAt = null;
    await teacher.save();
    res.json({
      teacherId: teacher._id,
      username: teacher.username,
      employeeCode: teacher.employeeCode,
      password
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/teachers/:id', adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  try {
    await deleteByScope(TeacherUser, req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/students/:id', adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  try {
    await updateByScope(StudentUser, req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/students/:id', adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  try {
    await deleteByScope(StudentUser, req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/staff/:id', adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  try {
    await updateByScope(StaffUser, req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/staff/:id', adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  try {
    await deleteByScope(StaffUser, req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/principals/:id', adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  try {
    await updateByScope(Principal, req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/principals/:id', adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  try {
    await deleteByScope(Principal, req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Live dashboard statistics endpoint
router.get("/dashboard-stats", adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Users']
  try {
    const filter = buildScopedFilter(req);
    // Fetch counts from all user types
    const [studentCount, teacherCount, parentCount, staffCount, principalCount] = await Promise.all([
      StudentUser.countDocuments(filter),
      TeacherUser.countDocuments(filter),
      ParentUser.countDocuments(filter),
      StaffUser.countDocuments(filter),
      Principal.countDocuments(filter)
    ]);

    // Calculate additional stats
    const totalUsers = studentCount + teacherCount + parentCount + staffCount + principalCount;

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentStudents, recentTeachers, recentParents, recentStaff, recentPrincipals] = await Promise.all([
      StudentUser.countDocuments({ ...filter, createdAt: { $gte: thirtyDaysAgo } }),
      TeacherUser.countDocuments({ ...filter, createdAt: { $gte: thirtyDaysAgo } }),
      ParentUser.countDocuments({ ...filter, createdAt: { $gte: thirtyDaysAgo } }),
      StaffUser.countDocuments({ ...filter, createdAt: { $gte: thirtyDaysAgo } }),
      Principal.countDocuments({ ...filter, createdAt: { $gte: thirtyDaysAgo } })
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
      staff: {
        total: staffCount,
        recent: recentStaff
      },
      principals: {
        total: principalCount,
        recent: recentPrincipals
      },
      totalUsers,
      recentTotal: recentStudents + recentTeachers + recentParents + recentStaff + recentPrincipals,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
