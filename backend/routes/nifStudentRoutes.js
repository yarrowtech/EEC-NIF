const express = require('express');
const mongoose = require('mongoose');
const adminAuth = require('../middleware/adminAuth');
const StudentUser = require('../models/StudentUser');

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
