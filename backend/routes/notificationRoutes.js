const express = require('express');
const mongoose = require('mongoose');
const adminAuth = require('../middleware/adminAuth');
const authAnyUser = require('../middleware/authAnyUser');
const Notification = require('../models/Notification');

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

// Admin creates a notification
router.post('/', adminAuth, async (req, res) => {
  // #swagger.tags = ['Notifications']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const { title, message, audience, classId, sectionId } = req.body || {};
    if (!title || !String(title).trim() || !message || !String(message).trim()) {
      return res.status(400).json({ error: 'title and message are required' });
    }

    const created = await Notification.create({
      schoolId,
      title: String(title).trim(),
      message: String(message).trim(),
      audience: audience || 'All',
      classId: classId || undefined,
      sectionId: sectionId || undefined,
      createdBy: req.admin?.id || null,
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin list all notifications
router.get('/', adminAuth, async (req, res) => {
  // #swagger.tags = ['Notifications']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const items = await Notification.find({ schoolId }).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin update a notification
router.patch('/:id', adminAuth, async (req, res) => {
  // #swagger.tags = ['Notifications']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const { id } = req.params;
    const updates = req.body || {};
    const updated = await Notification.findOneAndUpdate(
      { _id: id, schoolId },
      updates,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin delete a notification
router.delete('/:id', adminAuth, async (req, res) => {
  // #swagger.tags = ['Notifications']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const { id } = req.params;
    const deleted = await Notification.findOneAndDelete({ _id: id, schoolId });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Any user fetch their notifications
router.get('/user', authAnyUser, async (req, res) => {
  // #swagger.tags = ['Notifications']
  try {
    const schoolId = req.schoolId;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    const userType = req.userType;
    const normalizedAudience = userType
      ? userType.charAt(0).toUpperCase() + userType.slice(1)
      : 'unknown';

    const filter = { schoolId, $or: [{ audience: 'All' }, { audience: normalizedAudience }] };
    const items = await Notification.find(filter).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
