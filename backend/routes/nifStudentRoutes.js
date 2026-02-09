const express = require('express');
const mongoose = require('mongoose');
const adminAuth = require('../middleware/adminAuth');
const StudentUser = require('../models/StudentUser');
const ParentUser = require('../models/ParentUser');
const { generatePassword } = require('../utils/generator');

const router = express.Router();

const resolveSchoolId = (req, res) => {
  const schoolId = req.schoolId || req.admin?.schoolId || null;
  if (!schoolId) {
    res.status(400).json({ error: 'schoolId is required' });
    return null;
  }
  if (!mongoose.isValidObjectId(schoolId)) {
    res.status(400).json({ error: 'Invalid schoolId' });
    return null;
  }
  return schoolId;
};

const resolveCampusId = (req) => req.campusId || req.admin?.campusId || null;

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

const resolveAdmissionDate = (value) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
};

const resolveAdmissionYear = (value) => {
  if (!value) return new Date().getFullYear();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().getFullYear();
  }
  return parsed.getFullYear();
};

const getNextStudentSequenceByPrefix = async ({ schoolId, campusId, prefix }) => {
  const regex = new RegExp(`^${escapeRegex(prefix)}\\d+$`);
  const filter = { schoolId, username: { $regex: regex } };
  if (campusId) filter.campusId = campusId;
  const users = await StudentUser.find(filter).select('username').lean();
  let maxSequence = 0;
  users.forEach((user) => {
    const value = String(user?.username || '');
    const match = value.match(/(\d+)$/);
    const seq = match ? Number(match[1]) : 0;
    if (Number.isFinite(seq) && seq > maxSequence) maxSequence = seq;
  });
  return maxSequence + 1;
};

const getNextParentSequenceByPrefix = async ({ schoolId, campusId, prefix }) => {
  const regex = new RegExp(`^${escapeRegex(prefix)}\\d+$`);
  const filter = { schoolId, username: { $regex: regex } };
  if (campusId) filter.campusId = campusId;
  const users = await ParentUser.find(filter).select('username').lean();
  let maxSequence = 0;
  users.forEach((user) => {
    const value = String(user?.username || '');
    const match = value.match(/(\d+)$/);
    const seq = match ? Number(match[1]) : 0;
    if (Number.isFinite(seq) && seq > maxSequence) maxSequence = seq;
  });
  return maxSequence + 1;
};

router.post('/students/bulk', adminAuth, async (req, res) => {
  // #swagger.tags = ['Students']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);

    const { students } = req.body || {};
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'students array is required' });
    }

    const results = {
      imported: 0,
      failed: 0,
      errors: [],
    };

    const sequenceByPrefix = new Map();
    const parentSequenceByPrefix = new Map();

    for (let i = 0; i < students.length; i += 1) {
      const row = students[i] || {};
      try {
        const admissionDate = resolveAdmissionDate(row.admissionDate);
        const admissionYear = resolveAdmissionYear(admissionDate || row.admissionDate);
        const prefix = resolveStudentPrefix({
          adminUsername: req.admin?.username,
          admissionYear,
        });

        if (!sequenceByPrefix.has(prefix)) {
          const nextSeq = await getNextStudentSequenceByPrefix({
            schoolId,
            campusId,
            prefix,
          });
          sequenceByPrefix.set(prefix, nextSeq);
        }
        const nextSequence = sequenceByPrefix.get(prefix);
        const username = `${prefix}${padNumber(nextSequence)}`;
        sequenceByPrefix.set(prefix, nextSequence + 1);

        const password = generatePassword();

        const payload = {
          username,
          studentCode: username,
          password,
          initialPassword: password,
          schoolId,
          campusId,
          campusName: req.isSuperAdmin ? req.body?.campusName : req.admin?.campusName,
          campusType: req.isSuperAdmin ? req.body?.campusType : req.admin?.campusType,
          name: row.name || 'Student',
          grade: row.grade || row.course || '',
          section: row.section || '',
          roll: row.roll ? Number(row.roll) : undefined,
          gender: String(row.gender || 'male').toLowerCase(),
          dob: row.dob || '',
          admissionDate,
          admissionNumber: row.admissionNumber || row.formNo || '',
          academicYear: row.academicYear || row.batchCode || '',
          batchCode: row.batchCode || '',
          course: row.course || '',
          courseId: row.courseId || '',
          duration: row.duration || '',
          formNo: row.formNo || '',
          enrollmentNo: row.enrollmentNo || '',
          serialNo: row.serialNo || '',
          status: row.status || 'Active',
          mobile: row.mobile || '',
          email: row.email || '',
          address: row.address || '',
          permanentAddress: row.permanentAddress || '',
          pinCode: row.pincode || row.pinCode || '',
          bloodGroup: row.bloodGroup || '',
          nationality: row.nationality || '',
          religion: row.religion || '',
          category: row.category || '',
          guardianName: row.guardianName || '',
          guardianPhone: row.guardianPhone || '',
          guardianEmail: row.guardianEmail || '',
          fatherName: row.fatherName || '',
          fatherPhone: row.fatherPhone || '',
          motherName: row.motherName || '',
          motherPhone: row.motherPhone || '',
        };

        const studentUser = await StudentUser.create(payload);

        const parentName =
          row.guardianName ||
          row.fatherName ||
          row.motherName ||
          (row.name ? `Parent of ${row.name}` : '');
        const parentMobile = row.guardianPhone || row.fatherPhone || row.motherPhone || '';
        const parentEmail = row.guardianEmail || '';
        if (parentName && (parentMobile || parentEmail)) {
          const parentFilter = {
            schoolId,
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
            if (!parentSequenceByPrefix.has(parentPrefix)) {
              const nextSeq = await getNextParentSequenceByPrefix({
                schoolId,
                campusId,
                prefix: parentPrefix,
              });
              parentSequenceByPrefix.set(parentPrefix, nextSeq);
            }
            const nextParentSeq = parentSequenceByPrefix.get(parentPrefix);
            const parentUsername = `${parentPrefix}${padNumber(nextParentSeq)}`;
            parentSequenceByPrefix.set(parentPrefix, nextParentSeq + 1);
            const parentPassword = generatePassword();
            parentUser = await ParentUser.create({
              username: parentUsername,
              password: parentPassword,
              initialPassword: parentPassword,
              schoolId,
              campusId,
              name: parentName,
              mobile: parentMobile,
              email: parentEmail,
              childrenIds: [studentUser._id],
              children: [row.name || payload.name],
              grade: [payload.grade || ''],
            });
          } else {
            const existingIds = new Set((parentUser.childrenIds || []).map((id) => String(id)));
            if (!existingIds.has(String(studentUser._id))) {
              parentUser.childrenIds = [...(parentUser.childrenIds || []), studentUser._id];
            }
            const existingChildren = new Set(parentUser.children || []);
            const childName = row.name || payload.name;
            if (childName && !existingChildren.has(childName)) {
              parentUser.children = [...(parentUser.children || []), childName];
            }
            const existingGrades = new Set(parentUser.grade || []);
            if (payload.grade && !existingGrades.has(payload.grade)) {
              parentUser.grade = [...(parentUser.grade || []), payload.grade];
            }
            await parentUser.save();
          }
        }
        results.imported += 1;
      } catch (err) {
        results.failed += 1;
        results.errors.push({
          index: i,
          message: err.message || 'Failed to import row',
        });
      }
    }

    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unable to import students' });
  }
});

router.get('/students/archived', adminAuth, async (req, res) => {
  // #swagger.tags = ['Students']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);

    const filter = { schoolId, isArchived: true };
    if (campusId) filter.campusId = campusId;

    const students = await StudentUser.find(filter).sort({ archivedAt: -1 }).lean();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to load archived students' });
  }
});

router.put('/students/:id/archive', adminAuth, async (req, res) => {
  // #swagger.tags = ['Students']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);
    const { id } = req.params || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid student id' });
    }

    const filter = { _id: id, schoolId };
    if (campusId) filter.campusId = campusId;

    const updated = await StudentUser.findOneAndUpdate(
      filter,
      { $set: { isArchived: true, archivedAt: new Date() } },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ ok: true, student: updated });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to archive student' });
  }
});

router.patch('/students/:id/unarchive', adminAuth, async (req, res) => {
  // #swagger.tags = ['Students']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);
    const { id } = req.params || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid student id' });
    }

    const filter = { _id: id, schoolId };
    if (campusId) filter.campusId = campusId;

    const updated = await StudentUser.findOneAndUpdate(
      filter,
      { $set: { isArchived: false, archivedAt: null } },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ ok: true, student: updated });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to restore student' });
  }
});

module.exports = router;
