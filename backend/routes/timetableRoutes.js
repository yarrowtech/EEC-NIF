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

module.exports = router;
