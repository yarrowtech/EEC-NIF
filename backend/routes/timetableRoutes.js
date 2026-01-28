const express = require('express');
const mongoose = require('mongoose');
const adminAuth = require('../middleware/adminAuth');
const Timetable = require('../models/Timetable');

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

// Create or update timetable (admin only)
router.post('/', adminAuth, async (req, res) => {
  // #swagger.tags = ['Timetable']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
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

    const payload = {
      schoolId,
      classId,
      sectionId: sectionId || undefined,
      academicYearId: academicYearId || undefined,
      entries: Array.isArray(entries) ? entries : [],
    };

    const updated = await Timetable.findOneAndUpdate(
      { schoolId, classId, sectionId: sectionId || null },
      payload,
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get timetable
router.get('/', adminAuth, async (req, res) => {
  // #swagger.tags = ['Timetable']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const { classId, sectionId } = req.query || {};
    if (!classId || !mongoose.isValidObjectId(classId)) {
      return res.status(400).json({ error: 'Valid classId is required' });
    }
    const filter = { schoolId, classId };
    if (sectionId && mongoose.isValidObjectId(sectionId)) {
      filter.sectionId = sectionId;
    } else {
      filter.sectionId = null;
    }

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

    const timetables = await Timetable.find({ schoolId })
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
      schoolId,
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
      schoolId
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

    // Helper function to check if two time ranges overlap
    const timesOverlap = (start1, end1, start2, end2) => {
      return start1 < end2 && start2 < end1;
    };

    // Fetch all existing timetables for this school (excluding current if editing)
    const filter = { schoolId };
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
