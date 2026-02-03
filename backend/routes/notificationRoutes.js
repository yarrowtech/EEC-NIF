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
    const campusId = req.campusId || null;
    const { title, message, audience, classId, sectionId } = req.body || {};
    if (!title || !String(title).trim() || !message || !String(message).trim()) {
      return res.status(400).json({ error: 'title and message are required' });
    }

    const created = await Notification.create({
      schoolId,
      campusId: campusId || null,
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
    const campusId = req.campusId || null;
    const items = await Notification.find({
      schoolId,
      ...(campusId ? { campusId } : {}),
    })
      .sort({ createdAt: -1 })
      .lean();
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
    const campusId = req.campusId || null;
    const { id } = req.params;
    const updates = req.body || {};
    const updated = await Notification.findOneAndUpdate(
      { _id: id, schoolId, ...(campusId ? { campusId } : {}) },
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
    const campusId = req.campusId || null;
    const { id } = req.params;
    const deleted = await Notification.findOneAndDelete({ _id: id, schoolId, ...(campusId ? { campusId } : {}) });
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
    const campusId = req.campusId || null;
    const userType = req.userType;
    const userId = req.user?.id;
    const normalizedAudience = userType
      ? userType.charAt(0).toUpperCase() + userType.slice(1)
      : 'unknown';

    const filter = {
      schoolId,
      ...(campusId ? { campusId } : {}),
      'dismissedBy.userId': { $ne: userId },
      $and: [
        { $or: [{ audience: 'All' }, { audience: normalizedAudience }] },
        {
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
          ]
        }
      ]
    };

    const items = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Add isRead flag for each notification
    const itemsWithReadStatus = items.map(item => ({
      ...item,
      isRead: item.readBy?.some(r => r.userId.toString() === userId) || false
    }));

    res.json(itemsWithReadStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.patch('/user/:id/read', authAnyUser, async (req, res) => {
  // #swagger.tags = ['Notifications']
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Check if already read by this user
    const alreadyRead = notification.readBy.some(r => r.userId.toString() === userId);
    if (!alreadyRead) {
      notification.readBy.push({ userId, readAt: new Date() });
      await notification.save();
    }

    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dismiss notification (hide from view)
router.patch('/user/:id/dismiss', authAnyUser, async (req, res) => {
  // #swagger.tags = ['Notifications']
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const alreadyDismissed = notification.dismissedBy.some(d => d.userId.toString() === userId);
    if (!alreadyDismissed) {
      notification.dismissedBy.push({ userId, dismissedAt: new Date() });
      await notification.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all as read
router.post('/user/read-all', authAnyUser, async (req, res) => {
  // #swagger.tags = ['Notifications']
  try {
    const userId = req.user?.id;
    const schoolId = req.schoolId;
    const campusId = req.campusId || null;
    const userType = req.userType;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const normalizedAudience = userType
      ? userType.charAt(0).toUpperCase() + userType.slice(1)
      : 'unknown';

    const filter = {
      schoolId,
      ...(campusId ? { campusId } : {}),
      $or: [{ audience: 'All' }, { audience: normalizedAudience }],
      'readBy.userId': { $ne: userId },
      'dismissedBy.userId': { $ne: userId }
    };

    await Notification.updateMany(
      filter,
      { $push: { readBy: { userId, readAt: new Date() } } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread count
router.get('/user/unread-count', authAnyUser, async (req, res) => {
  // #swagger.tags = ['Notifications']
  try {
    const userId = req.user?.id;
    const schoolId = req.schoolId;
    const campusId = req.campusId || null;
    const userType = req.userType;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const normalizedAudience = userType
      ? userType.charAt(0).toUpperCase() + userType.slice(1)
      : 'unknown';

    const filter = {
      schoolId,
      ...(campusId ? { campusId } : {}),
      $or: [{ audience: 'All' }, { audience: normalizedAudience }],
      'readBy.userId': { $ne: userId },
      'dismissedBy.userId': { $ne: userId }
    };

    const count = await Notification.countDocuments(filter);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
