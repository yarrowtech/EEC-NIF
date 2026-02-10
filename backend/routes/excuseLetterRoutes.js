const express = require('express');
const mongoose = require('mongoose');
const authStudent = require('../middleware/authStudent');
const authTeacher = require('../middleware/authTeacher');

const ExcuseLetter = require('../models/ExcuseLetter');
const StudentUser = require('../models/StudentUser');
const TeacherAllocation = require('../models/TeacherAllocation');
const ClassModel = require('../models/Class');
const Section = require('../models/Section');

const router = express.Router();

const resolveClassCandidates = (raw) => {
  const value = String(raw || '').trim();
  const set = new Set();
  if (!value) return [];
  set.add(value);
  if (/^\d+$/i.test(value)) set.add(`Class ${value}`);
  if (/^class\s+/i.test(value)) set.add(value.replace(/^class\s+/i, '').trim());
  return Array.from(set);
};

// Student: list own letters
router.get('/student', authStudent, async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const campusId = req.campusId || null;
    const studentId = req.user?.id;
    if (!schoolId || !studentId) return res.status(400).json({ error: 'schoolId and studentId are required' });

    const items = await ExcuseLetter.find({
      schoolId,
      ...(campusId ? { campusId } : {}),
      studentId,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json(items);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Student: create letter
router.post('/student', authStudent, async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const campusId = req.campusId || null;
    const studentId = req.user?.id;
    if (!schoolId || !studentId) return res.status(400).json({ error: 'schoolId and studentId are required' });

    const { dateFrom, dateTo, reason, reasonType, additionalNotes, emergencyContact } = req.body || {};
    if (!dateFrom || !dateTo || !reason) {
      return res.status(400).json({ error: 'dateFrom, dateTo and reason are required' });
    }

    const student = await StudentUser.findById(studentId).lean();
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const classCandidates = resolveClassCandidates(student.grade);
    const classDoc = classCandidates.length
      ? await ClassModel.findOne({
          schoolId,
          ...(campusId ? { campusId } : {}),
          name: { $in: classCandidates },
        }).select('_id name').lean()
      : null;
    if (!classDoc) return res.status(400).json({ error: 'Class not found for student' });

    const sectionName = String(student.section || '').trim();
    const sectionDoc = sectionName
      ? await Section.findOne({
          schoolId,
          ...(campusId ? { campusId } : {}),
          classId: classDoc._id,
          name: sectionName,
        }).select('_id name').lean()
      : null;
    if (!sectionDoc) return res.status(400).json({ error: 'Section not found for student' });

    const parentName = student.guardianName || student.fatherName || student.motherName || '';
    const parentPhone = student.guardianPhone || student.fatherPhone || student.motherPhone || '';
    const parentEmail = student.guardianEmail || student.email || '';

    const created = await ExcuseLetter.create({
      schoolId,
      campusId,
      studentId,
      studentName: student.name || 'Student',
      rollNumber: student.roll ? String(student.roll) : '',
      classId: classDoc._id,
      sectionId: sectionDoc._id,
      className: classDoc.name || '',
      sectionName: sectionDoc.name || '',
      parentName,
      parentEmail,
      parentPhone,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      reason: String(reason).trim(),
      reasonType: String(reasonType || 'other'),
      additionalNotes: String(additionalNotes || ''),
      emergencyContact: String(emergencyContact || ''),
      status: 'pending',
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Teacher: list letters for their class sections (class teacher only)
router.get('/teacher', authTeacher, async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const campusId = req.campusId || null;
    const teacherId = req.user?.id;
    if (!schoolId || !teacherId) return res.status(400).json({ error: 'schoolId and teacherId are required' });

    const allocations = await TeacherAllocation.find({
      schoolId,
      ...(campusId ? { campusId } : {}),
      teacherId,
      isClassTeacher: true,
    }).select('classId sectionId').lean();

    if (!allocations.length) return res.json([]);

    const pairs = allocations.map((a) => ({
      classId: a.classId,
      sectionId: a.sectionId,
    }));

    const items = await ExcuseLetter.find({
      schoolId,
      ...(campusId ? { campusId } : {}),
      $or: pairs,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json(items);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Teacher: approve/reject
router.patch('/teacher/:id', authTeacher, async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const campusId = req.campusId || null;
    const teacherId = req.user?.id;
    const { id } = req.params;
    const { status } = req.body || {};
    if (!schoolId || !teacherId) return res.status(400).json({ error: 'schoolId and teacherId are required' });
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'status must be approved or rejected' });
    }

    const allocations = await TeacherAllocation.find({
      schoolId,
      ...(campusId ? { campusId } : {}),
      teacherId,
      isClassTeacher: true,
    }).select('classId sectionId').lean();
    if (!allocations.length) return res.status(403).json({ error: 'Not a class teacher' });

    const letter = await ExcuseLetter.findOne({
      _id: id,
      schoolId,
      ...(campusId ? { campusId } : {}),
    }).lean();
    if (!letter) return res.status(404).json({ error: 'Not found' });

    const allowed = allocations.some(
      (a) => String(a.classId) === String(letter.classId) && String(a.sectionId) === String(letter.sectionId)
    );
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const updated = await ExcuseLetter.findByIdAndUpdate(
      id,
      { $set: { status, reviewedBy: teacherId, reviewedAt: new Date() } },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
