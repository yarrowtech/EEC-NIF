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
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const items = await Notification.find({ schoolId }).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Any user fetch their notifications
router.get('/user', authAnyUser, async (req, res) => {
  try {
    const schoolId = req.schoolId;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    const userType = req.userType;

    const filter = { schoolId, $or: [{ audience: 'All' }, { audience: userType }] };
    const items = await Notification.find(filter).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
