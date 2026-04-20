const express = require('express');
const mongoose = require('mongoose');
const authTeacher = require('../middleware/authTeacher');
const StudentUser = require('../models/StudentUser');
const TeacherAllocation = require('../models/TeacherAllocation');
const ClassModel = require('../models/Class');
const Section = require('../models/Section');

const router = express.Router();

const normalize = (value = '') => String(value || '').trim();
const normalizeLower = (value = '') => normalize(value).toLowerCase();

const buildClassCandidates = (rawClassName) => {
  const value = normalize(rawClassName);
  const candidates = new Set();
  if (!value) return [];
  candidates.add(value);
  if (/^\d+$/i.test(value)) candidates.add(`Class ${value}`);
  if (/^class\s+/i.test(value)) candidates.add(value.replace(/^class\s+/i, '').trim());
  return Array.from(candidates);
};

const resolveClassTeacherAuthorization = async ({ schoolId, campusId, teacherId, student }) => {
  const classCandidates = buildClassCandidates(student.grade || student.className || student.class);
  const sectionName = normalize(student.section || student.sectionName);
  if (!classCandidates.length || !sectionName) {
    return { error: 'Student class/section is missing' };
  }

  const classDoc = await ClassModel.findOne({
    schoolId,
    ...(campusId ? { campusId } : {}),
    name: { $in: classCandidates },
  }).select('_id name').lean();

  if (!classDoc) {
    return { error: 'Student class could not be resolved' };
  }

  const sectionDoc = await Section.findOne({
    schoolId,
    ...(campusId ? { campusId } : {}),
    classId: classDoc._id,
    name: sectionName,
  }).select('_id name').lean();

  if (!sectionDoc) {
    return { error: 'Student section could not be resolved' };
  }

  const allocation = await TeacherAllocation.findOne({
    schoolId,
    ...(campusId
      ? { $or: [{ campusId }, { campusId: null }, { campusId: { $exists: false } }] }
      : {}),
    teacherId,
    classId: classDoc._id,
    sectionId: sectionDoc._id,
    isClassTeacher: true,
  }).lean();

  if (!allocation) {
    return { error: 'Only class teacher can manage achievements for this student', statusCode: 403 };
  }

  return { classDoc, sectionDoc, allocation };
};

router.get('/teacher/list', authTeacher, async (req, res) => {
  try {
    const schoolId = req.schoolId || req.teacher?.schoolId || null;
    const campusId = req.campusId || null;
    const teacherId = req.teacher?.id || req.user?.id || null;
    if (!schoolId || !teacherId) {
      return res.status(400).json({ error: 'schoolId and teacherId are required' });
    }

    const session = normalize(req.query?.session);
    const className = normalize(req.query?.className);
    const section = normalize(req.query?.section);
    const studentId = normalize(req.query?.studentId);

    const allocations = await TeacherAllocation.find({
      schoolId,
      ...(campusId
        ? { $or: [{ campusId }, { campusId: null }, { campusId: { $exists: false } }] }
        : {}),
      teacherId,
      isClassTeacher: true,
    })
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .lean();

    const allocationPairs = allocations.map((item) => ({
      className: normalizeLower(item?.classId?.name),
      sectionName: normalizeLower(item?.sectionId?.name),
    }));

    const studentFilter = {
      schoolId,
      ...(campusId ? { campusId } : {}),
      ...(studentId && mongoose.isValidObjectId(studentId) ? { _id: studentId } : {}),
    };
    const students = await StudentUser.find(studentFilter)
      .select('name grade section academicYear achievements')
      .sort({ name: 1 })
      .lean();

    const filteredStudents = students.filter((student) => {
      const studentSession = normalizeLower(student?.academicYear);
      const studentClassValue = normalize(student?.grade || student?.className || student?.class);
      const studentSectionValue = normalizeLower(student?.section || student?.sectionName);
      const studentClassCandidates = buildClassCandidates(studentClassValue).map((v) => normalizeLower(v));
      const hasAllocation = allocationPairs.some((pair) =>
        pair.sectionName === studentSectionValue &&
        studentClassCandidates.includes(pair.className)
      );
      if (!hasAllocation) return false;
      if (session && studentSession !== normalizeLower(session)) return false;
      if (className && !studentClassCandidates.includes(normalizeLower(className))) return false;
      if (section && studentSectionValue !== normalizeLower(section)) return false;
      return true;
    });

    const achievements = filteredStudents.flatMap((student) => {
      const items = Array.isArray(student.achievements) ? student.achievements : [];
      return items.map((achievement) => ({
        studentId: student._id,
        studentName: student.name || 'Student',
        className: student.grade || '',
        sectionName: student.section || '',
        achievementId: achievement?._id,
        title: achievement?.title || '',
        date: achievement?.date || null,
        description: achievement?.description || '',
        category: achievement?.category || 'Academic',
      }));
    });

    achievements.sort((a, b) => new Date(b?.date || 0) - new Date(a?.date || 0));
    res.json({ achievements });
  } catch (err) {
    console.error('Teacher achievement list error:', err);
    res.status(500).json({ error: err.message || 'Unable to load achievements' });
  }
});

router.post('/teacher/upload', authTeacher, async (req, res) => {
  try {
    const schoolId = req.schoolId || req.teacher?.schoolId || null;
    const campusId = req.campusId || null;
    const teacherId = req.teacher?.id || req.user?.id || null;
    if (!schoolId || !teacherId) {
      return res.status(400).json({ error: 'schoolId and teacherId are required' });
    }

    const studentId = req.body?.studentId;
    const title = normalize(req.body?.title);
    const dateValue = req.body?.date;
    const description = normalize(req.body?.description);
    const category = normalize(req.body?.category) || 'Academic';

    if (!studentId || !mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ error: 'Valid studentId is required' });
    }
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!dateValue) {
      return res.status(400).json({ error: 'Achievement date is required' });
    }

    const achievementDate = new Date(dateValue);
    if (Number.isNaN(achievementDate.getTime())) {
      return res.status(400).json({ error: 'Invalid achievement date' });
    }

    const student = await StudentUser.findOne({
      _id: studentId,
      schoolId,
      ...(campusId ? { campusId } : {}),
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const authz = await resolveClassTeacherAuthorization({ schoolId, campusId, teacherId, student });
    if (authz?.error) {
      return res.status(authz.statusCode || 400).json({ error: authz.error });
    }

    student.achievements = Array.isArray(student.achievements) ? student.achievements : [];
    const achievement = {
      title,
      date: achievementDate,
      description,
      category: ['Academic', 'Extra-Curricular', 'Sports', 'Other'].includes(category) ? category : 'Academic',
      awardType: 'Achievement',
      issuer: 'Class Teacher',
    };
    student.achievements.push(achievement);
    await student.save();

    const created = student.achievements[student.achievements.length - 1];
    res.status(201).json({
      message: 'Achievement uploaded successfully',
      achievement: created,
    });
  } catch (err) {
    console.error('Teacher achievement upload error:', err);
    res.status(500).json({ error: err.message || 'Unable to upload achievement' });
  }
});

router.delete('/teacher/:studentId/:achievementId', authTeacher, async (req, res) => {
  try {
    const schoolId = req.schoolId || req.teacher?.schoolId || null;
    const campusId = req.campusId || null;
    const teacherId = req.teacher?.id || req.user?.id || null;
    const studentId = req.params?.studentId;
    const achievementId = req.params?.achievementId;

    if (!schoolId || !teacherId) {
      return res.status(400).json({ error: 'schoolId and teacherId are required' });
    }
    if (!studentId || !mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ error: 'Valid studentId is required' });
    }
    if (!achievementId || !mongoose.isValidObjectId(achievementId)) {
      return res.status(400).json({ error: 'Valid achievementId is required' });
    }

    const student = await StudentUser.findOne({
      _id: studentId,
      schoolId,
      ...(campusId ? { campusId } : {}),
    });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const authz = await resolveClassTeacherAuthorization({ schoolId, campusId, teacherId, student });
    if (authz?.error) {
      return res.status(authz.statusCode || 400).json({ error: authz.error });
    }

    const list = Array.isArray(student.achievements) ? student.achievements : [];
    const index = list.findIndex((item) => String(item?._id) === String(achievementId));
    if (index === -1) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    list.splice(index, 1);
    student.achievements = list;
    await student.save();

    res.json({ message: 'Achievement deleted successfully' });
  } catch (err) {
    console.error('Teacher achievement delete error:', err);
    res.status(500).json({ error: err.message || 'Unable to delete achievement' });
  }
});

router.put('/teacher/:studentId/:achievementId', authTeacher, async (req, res) => {
  try {
    const schoolId = req.schoolId || req.teacher?.schoolId || null;
    const campusId = req.campusId || null;
    const teacherId = req.teacher?.id || req.user?.id || null;
    const studentId = req.params?.studentId;
    const achievementId = req.params?.achievementId;

    if (!schoolId || !teacherId) {
      return res.status(400).json({ error: 'schoolId and teacherId are required' });
    }
    if (!studentId || !mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ error: 'Valid studentId is required' });
    }
    if (!achievementId || !mongoose.isValidObjectId(achievementId)) {
      return res.status(400).json({ error: 'Valid achievementId is required' });
    }

    const title = normalize(req.body?.title);
    const dateValue = req.body?.date;
    const description = normalize(req.body?.description);
    const category = normalize(req.body?.category) || 'Academic';

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!dateValue) {
      return res.status(400).json({ error: 'Achievement date is required' });
    }
    const achievementDate = new Date(dateValue);
    if (Number.isNaN(achievementDate.getTime())) {
      return res.status(400).json({ error: 'Invalid achievement date' });
    }

    const student = await StudentUser.findOne({
      _id: studentId,
      schoolId,
      ...(campusId ? { campusId } : {}),
    });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const authz = await resolveClassTeacherAuthorization({ schoolId, campusId, teacherId, student });
    if (authz?.error) {
      return res.status(authz.statusCode || 400).json({ error: authz.error });
    }

    const list = Array.isArray(student.achievements) ? student.achievements : [];
    const index = list.findIndex((item) => String(item?._id) === String(achievementId));
    if (index === -1) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    list[index].title = title;
    list[index].date = achievementDate;
    list[index].description = description;
    list[index].category = ['Academic', 'Extra-Curricular', 'Sports', 'Other'].includes(category) ? category : 'Academic';

    student.achievements = list;
    await student.save();

    const updated = student.achievements.find((item) => String(item?._id) === String(achievementId)) || null;
    res.json({ message: 'Achievement updated successfully', achievement: updated });
  } catch (err) {
    console.error('Teacher achievement update error:', err);
    res.status(500).json({ error: err.message || 'Unable to update achievement' });
  }
});

module.exports = router;
