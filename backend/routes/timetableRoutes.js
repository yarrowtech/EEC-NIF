const express = require('express');
const mongoose = require('mongoose');
const adminAuth = require('../middleware/adminAuth');
const Timetable = require('../models/Timetable');
const ClassModel = require('../models/Class');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const TeacherUser = require('../models/TeacherUser');

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

const resolveCampusId = (req) => req.campusId || null;

const buildCampusFilter = (schoolId, campusId) => {
  const filter = { schoolId };
  if (campusId) {
    filter.campusId = campusId;
  }
  return filter;
};

const resolveSectionId = (sectionId) => {
  if (!sectionId) return null;
  return mongoose.isValidObjectId(sectionId) ? sectionId : null;
};

const resolveDayOfWeek = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value.trim();
};

const ensureClassExists = async (schoolId, campusId, classId) => {
  const classDoc = await ClassModel.findOne(buildCampusFilter(schoolId, campusId))
    .where({ _id: classId })
    .lean();
  return classDoc;
};

const ensureSectionExists = async (schoolId, campusId, classId, sectionId) => {
  if (!sectionId) return null;
  const sectionDoc = await Section.findOne(buildCampusFilter(schoolId, campusId))
    .where({ _id: sectionId, classId })
    .lean();
  return sectionDoc;
};

const extractIds = (entries, key) => {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => entry?.[key])
    .filter((id) => id && mongoose.isValidObjectId(id))
    .map((id) => String(id));
};

const ensureSubjectsExist = async (schoolId, campusId, classId, entries) => {
  const subjectIds = [...new Set(extractIds(entries, 'subjectId'))];
  if (subjectIds.length === 0) return true;
  const subjects = await Subject.find({
    _id: { $in: subjectIds },
    ...buildCampusFilter(schoolId, campusId),
  })
    .select('_id classId')
    .lean();
  if (subjects.length !== subjectIds.length) return false;
  if (classId) {
    const subjectClassIds = subjects
      .map((s) => (s.classId ? String(s.classId) : null))
      .filter(Boolean);
    if (subjectClassIds.some((id) => id !== String(classId))) {
      return false;
    }
  }
  return true;
};

const ensureTeachersExist = async (schoolId, campusId, entries) => {
  const teacherIds = [...new Set(extractIds(entries, 'teacherId'))];
  if (teacherIds.length === 0) return true;
  const teachers = await TeacherUser.find({
    _id: { $in: teacherIds },
    ...buildCampusFilter(schoolId, campusId),
  })
    .select('_id')
    .lean();
  return teachers.length === teacherIds.length;
};

// Create or update timetable (admin only)
router.post('/', adminAuth, async (req, res) => {
  // #swagger.tags = ['Timetable']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);
    const { classId, sectionId, academicYearId, entries } = req.body || {};
    if (!classId || !mongoose.isValidObjectId(classId)) {
      return res.status(400).json({ error: 'Valid classId is required' });
    }
    if (sectionId && !mongoose.isValidObjectId(sectionId)) {
      return res.status(400).json({ error: 'Invalid sectionId' });
    }
    if (academicYearId && !mongoose.isValidObjectId(academicYearId)) {
      return res.status(400).json({ error: 'Invalid academicYearId' });
    }
    const classDoc = await ensureClassExists(schoolId, campusId, classId);
    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found for this school' });
    }
    if (sectionId) {
      const sectionDoc = await ensureSectionExists(schoolId, campusId, classId, sectionId);
      if (!sectionDoc) {
        return res.status(404).json({ error: 'Section not found for this class' });
      }
    }
    if (!(await ensureSubjectsExist(schoolId, campusId, classId, entries))) {
      return res.status(400).json({ error: 'Invalid subject selection' });
    }
    if (!(await ensureTeachersExist(schoolId, campusId, entries))) {
      return res.status(400).json({ error: 'Invalid teacher selection' });
    }

    const payload = {
      schoolId,
      campusId: campusId || null,
      classId,
      sectionId: resolveSectionId(sectionId) || undefined,
      academicYearId: academicYearId || undefined,
      entries: Array.isArray(entries) ? entries : [],
    };

    const updated = await Timetable.findOneAndUpdate(
      { ...buildCampusFilter(schoolId, campusId), classId, sectionId: resolveSectionId(sectionId) },
      payload,
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create or update timetable entries for a single day
router.post('/day', adminAuth, async (req, res) => {
  // #swagger.tags = ['Timetable']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);
    const { classId, sectionId, dayOfWeek, entries } = req.body || {};

    if (!classId || !mongoose.isValidObjectId(classId)) {
      return res.status(400).json({ error: 'Valid classId is required' });
    }

    const normalizedDay = resolveDayOfWeek(dayOfWeek);
    if (!normalizedDay) {
      return res.status(400).json({ error: 'dayOfWeek is required' });
    }

    if (!Array.isArray(entries)) {
      return res.status(400).json({ error: 'entries must be an array' });
    }
    if (entries.length === 0) {
      return res.status(400).json({ error: 'entries cannot be empty for day update' });
    }
    const classDoc = await ensureClassExists(schoolId, campusId, classId);
    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found for this school' });
    }
    if (sectionId) {
      const sectionDoc = await ensureSectionExists(schoolId, campusId, classId, sectionId);
      if (!sectionDoc) {
        return res.status(404).json({ error: 'Section not found for this class' });
      }
    }
    if (!(await ensureSubjectsExist(schoolId, campusId, classId, entries))) {
      return res.status(400).json({ error: 'Invalid subject selection' });
    }
    if (!(await ensureTeachersExist(schoolId, campusId, entries))) {
      return res.status(400).json({ error: 'Invalid teacher selection' });
    }

    const normalizedSectionId = resolveSectionId(sectionId);
    const dayEntries = entries.map((entry) => ({
      ...entry,
      dayOfWeek: normalizedDay,
    }));

    const existing = await Timetable.findOne({
      ...buildCampusFilter(schoolId, campusId),
      classId,
      sectionId: normalizedSectionId,
    });

    if (!existing) {
      const created = await Timetable.create({
        schoolId,
        campusId: campusId || null,
        classId,
        sectionId: normalizedSectionId || undefined,
        entries: dayEntries,
      });
      return res.json(created);
    }

    const remainingEntries = (existing.entries || []).filter(
      (entry) => entry.dayOfWeek !== normalizedDay
    );
    existing.entries = [...remainingEntries, ...dayEntries];
    await existing.save();

    res.json(existing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete timetable entries for a single day
router.delete('/day', adminAuth, async (req, res) => {
  // #swagger.tags = ['Timetable']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);

    const { classId, sectionId, dayOfWeek } = req.body || {};
    if (!classId || !mongoose.isValidObjectId(classId)) {
      return res.status(400).json({ error: 'Valid classId is required' });
    }

    const normalizedDay = resolveDayOfWeek(dayOfWeek);
    if (!normalizedDay) {
      return res.status(400).json({ error: 'dayOfWeek is required' });
    }

    const normalizedSectionId = resolveSectionId(sectionId);
    const existing = await Timetable.findOne({
      ...buildCampusFilter(schoolId, campusId),
      classId,
      sectionId: normalizedSectionId,
    });

    if (!existing) {
      return res.status(404).json({ error: 'Timetable not found' });
    }

    const remainingEntries = (existing.entries || []).filter(
      (entry) => entry.dayOfWeek !== normalizedDay
    );

    if (remainingEntries.length === 0) {
      await Timetable.findByIdAndDelete(existing._id);
      return res.json({ message: 'Day removed and timetable deleted', deleted: true });
    }

    existing.entries = remainingEntries;
    await existing.save();

    res.json({ message: 'Day removed', deleted: false, timetable: existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get timetable
router.get('/', adminAuth, async (req, res) => {
  // #swagger.tags = ['Timetable']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);
    const { classId, sectionId } = req.query || {};
    if (!classId || !mongoose.isValidObjectId(classId)) {
      return res.status(400).json({ error: 'Valid classId is required' });
    }
    const filter = { ...buildCampusFilter(schoolId, campusId), classId };
    filter.sectionId = resolveSectionId(sectionId);

    const timetable = await Timetable.findOne(filter).lean();
    if (!timetable) {
      return res.status(404).json({ error: 'Timetable not found' });
    }
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all timetables for school
router.get('/all', adminAuth, async (req, res) => {
  // #swagger.tags = ['Timetable']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);

    const timetables = await Timetable.find(buildCampusFilter(schoolId, campusId))
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('entries.subjectId', 'name')
      .populate('entries.teacherId', 'name')
      .lean();

    res.json(timetables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get teacher's schedule
router.get('/teacher/:teacherId', adminAuth, async (req, res) => {
  // #swagger.tags = ['Timetable']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    const { teacherId } = req.params;
    if (!mongoose.isValidObjectId(teacherId)) {
      return res.status(400).json({ error: 'Invalid teacherId' });
    }

    const timetables = await Timetable.find({
      ...buildCampusFilter(schoolId, campusId),
      'entries.teacherId': teacherId
    })
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('entries.subjectId', 'name')
      .populate('entries.teacherId', 'name')
      .lean();

    res.json(timetables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete timetable
router.delete('/:id', adminAuth, async (req, res) => {
  // #swagger.tags = ['Timetable']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid timetable ID' });
    }

    const deleted = await Timetable.findOneAndDelete({
      _id: id,
      ...buildCampusFilter(schoolId, campusId),
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Timetable not found' });
    }

    res.json({ message: 'Timetable deleted successfully', deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Validate conflicts
router.post('/validate-conflicts', adminAuth, async (req, res) => {
  // #swagger.tags = ['Timetable']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    const { classId, sectionId, entries, excludeTimetableId } = req.body || {};

    if (!classId || !mongoose.isValidObjectId(classId)) {
      return res.status(400).json({ error: 'Valid classId is required' });
    }

    if (!Array.isArray(entries)) {
      return res.status(400).json({ error: 'entries must be an array' });
    }
    const classDoc = await ensureClassExists(schoolId, campusId, classId);
    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found for this school' });
    }
    if (sectionId) {
      const sectionDoc = await ensureSectionExists(schoolId, campusId, classId, sectionId);
      if (!sectionDoc) {
        return res.status(404).json({ error: 'Section not found for this class' });
      }
    }
    if (!(await ensureSubjectsExist(schoolId, campusId, classId, entries))) {
      return res.status(400).json({ error: 'Invalid subject selection' });
    }
    if (!(await ensureTeachersExist(schoolId, campusId, entries))) {
      return res.status(400).json({ error: 'Invalid teacher selection' });
    }

    // Helper function to check if two time ranges overlap
    const timesOverlap = (start1, end1, start2, end2) => {
      return start1 < end2 && start2 < end1;
    };

    // Fetch all existing timetables for this school (excluding current if editing)
    const filter = buildCampusFilter(schoolId, campusId);
    if (excludeTimetableId && mongoose.isValidObjectId(excludeTimetableId)) {
      filter._id = { $ne: excludeTimetableId };
    }

    const existingTimetables = await Timetable.find(filter)
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('entries.teacherId', 'name')
      .lean();

    const conflicts = [];

    // Check each entry for conflicts
    entries.forEach((entry, index) => {
      if (!entry.teacherId || !entry.dayOfWeek || !entry.startTime || !entry.endTime) {
        return;
      }

      // Check against all existing timetables
      existingTimetables.forEach(tt => {
        tt.entries.forEach(existingEntry => {
          // Teacher conflict check
          if (existingEntry.teacherId &&
              existingEntry.teacherId._id.toString() === entry.teacherId.toString() &&
              existingEntry.dayOfWeek === entry.dayOfWeek &&
              timesOverlap(entry.startTime, entry.endTime, existingEntry.startTime, existingEntry.endTime)) {
            conflicts.push({
              type: 'teacher',
              entryIndex: index,
              teacher: existingEntry.teacherId.name,
              teacherId: existingEntry.teacherId._id,
              day: entry.dayOfWeek,
              time: `${entry.startTime} - ${entry.endTime}`,
              conflictingClass: tt.classId.name,
              conflictingSection: tt.sectionId?.name || 'N/A',
              message: `Teacher ${existingEntry.teacherId.name} is already scheduled in ${tt.classId.name}${tt.sectionId ? '-' + tt.sectionId.name : ''} at ${entry.startTime}-${entry.endTime} on ${entry.dayOfWeek}`
            });
          }

          // Room conflict check
          if (entry.room &&
              existingEntry.room &&
              existingEntry.room === entry.room &&
              existingEntry.dayOfWeek === entry.dayOfWeek &&
              timesOverlap(entry.startTime, entry.endTime, existingEntry.startTime, existingEntry.endTime)) {
            conflicts.push({
              type: 'room',
              entryIndex: index,
              room: entry.room,
              day: entry.dayOfWeek,
              time: `${entry.startTime} - ${entry.endTime}`,
              conflictingClass: tt.classId.name,
              conflictingSection: tt.sectionId?.name || 'N/A',
              message: `Room ${entry.room} is already booked for ${tt.classId.name}${tt.sectionId ? '-' + tt.sectionId.name : ''} at ${entry.startTime}-${entry.endTime} on ${entry.dayOfWeek}`
            });
          }
        });
      });
    });

    res.json({
      hasConflicts: conflicts.length > 0,
      conflicts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
