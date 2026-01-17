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

router.put('/years/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    const { name, startDate, endDate, isActive } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Academic year name is required' });
    }

    // Verify ownership
    const existing = await AcademicYear.findOne({ _id: id, schoolId }).lean();
    if (!existing) {
      return res.status(404).json({ error: 'Academic year not found' });
    }

    const updated = await AcademicYear.findByIdAndUpdate(
      id,
      {
        name: String(name).trim(),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive: Boolean(isActive),
      },
      { new: true, runValidators: true }
    ).lean();

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/years/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    // Verify ownership
    const existing = await AcademicYear.findOne({ _id: id, schoolId }).lean();
    if (!existing) {
      return res.status(404).json({ error: 'Academic year not found' });
    }

    // Check for dependent classes
    const dependentClasses = await ClassModel.countDocuments({
      schoolId,
      academicYearId: id,
    });

    if (dependentClasses > 0) {
      return res.status(409).json({
        error: `Cannot delete: ${dependentClasses} class(es) are linked to this academic year`,
        dependentCount: dependentClasses,
      });
    }

    await AcademicYear.findByIdAndDelete(id);
    res.json({ ok: true, message: 'Academic year deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
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

router.put('/classes/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    const { name, academicYearId, order } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Class name is required' });
    }
    if (academicYearId && !mongoose.isValidObjectId(academicYearId)) {
      return res.status(400).json({ error: 'Invalid academicYearId' });
    }

    // Verify ownership
    const existing = await ClassModel.findOne({ _id: id, schoolId }).lean();
    if (!existing) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const updated = await ClassModel.findByIdAndUpdate(
      id,
      {
        name: String(name).trim(),
        academicYearId: academicYearId || undefined,
        order: Number.isFinite(Number(order)) ? Number(order) : 0,
      },
      { new: true, runValidators: true }
    ).lean();

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/classes/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { cascade } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    // Verify ownership
    const existing = await ClassModel.findOne({ _id: id, schoolId }).lean();
    if (!existing) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Count dependent records
    const dependentSections = await Section.countDocuments({ schoolId, classId: id });
    const dependentSubjects = await Subject.countDocuments({ schoolId, classId: id });

    if ((dependentSections > 0 || dependentSubjects > 0) && cascade !== 'true') {
      return res.status(409).json({
        error: `Cannot delete: ${dependentSections} section(s) and ${dependentSubjects} subject(s) are linked to this class`,
        dependentSections,
        dependentSubjects,
        hint: 'Use cascade=true to delete all dependent records',
      });
    }

    // Perform cascading delete if requested
    if (cascade === 'true') {
      await Section.deleteMany({ schoolId, classId: id });
      await Subject.deleteMany({ schoolId, classId: id });
    }

    await ClassModel.findByIdAndDelete(id);
    res.json({
      ok: true,
      message: 'Class deleted successfully',
      deletedSections: cascade === 'true' ? dependentSections : 0,
      deletedSubjects: cascade === 'true' ? dependentSubjects : 0,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
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

router.put('/sections/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    const { name, classId } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Section name is required' });
    }
    if (!classId || !mongoose.isValidObjectId(classId)) {
      return res.status(400).json({ error: 'Valid classId is required' });
    }

    // Verify ownership
    const existing = await Section.findOne({ _id: id, schoolId }).lean();
    if (!existing) {
      return res.status(404).json({ error: 'Section not found' });
    }

    const updated = await Section.findByIdAndUpdate(
      id,
      {
        name: String(name).trim(),
        classId,
      },
      { new: true, runValidators: true }
    ).lean();

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/sections/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    // Verify ownership
    const existing = await Section.findOne({ _id: id, schoolId }).lean();
    if (!existing) {
      return res.status(404).json({ error: 'Section not found' });
    }

    await Section.findByIdAndDelete(id);
    res.json({ ok: true, message: 'Section deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
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

router.put('/subjects/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    const { name, code, classId } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Subject name is required' });
    }
    if (classId && !mongoose.isValidObjectId(classId)) {
      return res.status(400).json({ error: 'Invalid classId' });
    }

    // Verify ownership
    const existing = await Subject.findOne({ _id: id, schoolId }).lean();
    if (!existing) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const updated = await Subject.findByIdAndUpdate(
      id,
      {
        name: String(name).trim(),
        code: code ? String(code).trim() : undefined,
        classId: classId || undefined,
      },
      { new: true, runValidators: true }
    ).lean();

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/subjects/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    // Verify ownership
    const existing = await Subject.findOne({ _id: id, schoolId }).lean();
    if (!existing) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    await Subject.findByIdAndDelete(id);
    res.json({ ok: true, message: 'Subject deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
