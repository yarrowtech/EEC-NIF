const express = require('express');
const mongoose = require('mongoose');
const adminAuth = require('../middleware/adminAuth');

const AcademicYear = require('../models/AcademicYear');
const ClassModel = require('../models/Class');
const Section = require('../models/Section');
const Subject = require('../models/Subject');

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

// Academic Years
router.post('/years', adminAuth, async (req, res) => {
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const { name, startDate, endDate, isActive } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Academic year name is required' });
    }

    const created = await AcademicYear.create({
      schoolId,
      name: String(name).trim(),
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      isActive: Boolean(isActive),
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/years', adminAuth, async (req, res) => {
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const items = await AcademicYear.find({ schoolId }).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Classes
router.post('/classes', adminAuth, async (req, res) => {
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const { name, academicYearId, order } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Class name is required' });
    }
    if (academicYearId && !mongoose.isValidObjectId(academicYearId)) {
      return res.status(400).json({ error: 'Invalid academicYearId' });
    }

    const created = await ClassModel.create({
      schoolId,
      name: String(name).trim(),
      academicYearId: academicYearId || undefined,
      order: Number.isFinite(Number(order)) ? Number(order) : 0,
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/classes', adminAuth, async (req, res) => {
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const items = await ClassModel.find({ schoolId }).sort({ order: 1, name: 1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sections
router.post('/sections', adminAuth, async (req, res) => {
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const { name, classId } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Section name is required' });
    }
    if (!classId || !mongoose.isValidObjectId(classId)) {
      return res.status(400).json({ error: 'Valid classId is required' });
    }

    const created = await Section.create({
      schoolId,
      classId,
      name: String(name).trim(),
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/sections', adminAuth, async (req, res) => {
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const filter = { schoolId };
    if (req.query.classId && mongoose.isValidObjectId(req.query.classId)) {
      filter.classId = req.query.classId;
    }
    const items = await Section.find(filter).sort({ name: 1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Subjects
router.post('/subjects', adminAuth, async (req, res) => {
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const { name, code, classId } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Subject name is required' });
    }
    if (classId && !mongoose.isValidObjectId(classId)) {
      return res.status(400).json({ error: 'Invalid classId' });
    }

    const created = await Subject.create({
      schoolId,
      classId: classId || undefined,
      name: String(name).trim(),
      code: code ? String(code).trim() : undefined,
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/subjects', adminAuth, async (req, res) => {
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const filter = { schoolId };
    if (req.query.classId && mongoose.isValidObjectId(req.query.classId)) {
      filter.classId = req.query.classId;
    }
    const items = await Subject.find(filter).sort({ name: 1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
