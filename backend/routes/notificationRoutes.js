const express = require('express');
const mongoose = require('mongoose');
const adminAuth = require('../middleware/adminAuth');
const authAnyUser = require('../middleware/authAnyUser');
const authTeacher = require('../middleware/authTeacher');
const Notification = require('../models/Notification');
const TeacherAllocation = require('../models/TeacherAllocation');
const TeacherUser = require('../models/TeacherUser');
const StudentUser = require('../models/StudentUser');
const ParentUser = require('../models/ParentUser');
const ClassModel = require('../models/Class');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
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

const resolveClassNames = async ({ schoolId, campusId, classId, sectionId }) => {
  let className = '';
  let sectionName = '';
  if (classId) {
    const classDoc = await ClassModel.findOne({
      _id: classId,
      schoolId,
      ...(campusId ? { campusId } : {}),
    })
      .select('name')
      .lean();
    className = classDoc?.name || '';
  }
  if (sectionId) {
    const sectionDoc = await Section.findOne({
      _id: sectionId,
      schoolId,
      ...(campusId ? { campusId } : {}),
    })
      .select('name')
      .lean();
    sectionName = sectionDoc?.name || '';
  }
  return { className, sectionName };
};

// Admin creates a notification
router.post('/', adminAuth, async (req, res) => {
  // #swagger.tags = ['Notifications']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = req.campusId || null;
    const { title, message, audience, classId, sectionId, type, typeLabel, priority, category, expiresAt, attachments, subjectId } = req.body || {};
    if (!title || !String(title).trim() || !message || !String(message).trim()) {
      return res.status(400).json({ error: 'title and message are required' });
    }

    const normalizedType = type ? String(type).trim().toLowerCase() : 'general';
    const allowedTypes = ['notice', 'class_note', 'assignment', 'exam', 'result', 'fee', 'general', 'announcement', 'other'];
    const safeType = allowedTypes.includes(normalizedType) ? normalizedType : 'general';
    const resolvedAudience =
      safeType === 'class_note'
        ? (audience && ['Student', 'Parent'].includes(audience) ? audience : 'Student')
        : (audience || 'All');

    const { className, sectionName } = await resolveClassNames({
      schoolId,
      campusId,
      classId,
      sectionId,
    });
    let subjectName = '';
    if (subjectId && mongoose.isValidObjectId(subjectId)) {
      const subjectDoc = await Subject.findOne({
        _id: subjectId,
        schoolId,
        ...(campusId ? { campusId } : {}),
      }).select('name').lean();
      subjectName = subjectDoc?.name || '';
    }

    const created = await Notification.create({
      schoolId,
      campusId: campusId || null,
      title: String(title).trim(),
      message: String(message).trim(),
      audience: resolvedAudience,
      classId: classId || undefined,
      sectionId: sectionId || undefined,
      createdBy: req.admin?.id || null,
      createdByType: 'admin',
      createdByName: req.admin?.name || req.admin?.username || '',
      type: safeType,
      typeLabel: typeLabel ? String(typeLabel).trim() : '',
      priority: priority || undefined,
      category: category || undefined,
      className,
      sectionName,
      subjectId: subjectId || undefined,
      subjectName,
      attachments: Array.isArray(attachments) ? attachments : [],
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Teacher creates a class note
router.post('/teacher', authTeacher, async (req, res) => {
  // #swagger.tags = ['Notifications']
  try {
    const schoolId = req.schoolId;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    const campusId = req.campusId || null;
    const { title, message, classId, sectionId, typeLabel, priority, category, expiresAt, attachments, subjectId } = req.body || {};

    if (!title || !String(title).trim() || !message || !String(message).trim()) {
      return res.status(400).json({ error: 'title and message are required' });
    }
    if (!classId || !mongoose.isValidObjectId(classId)) {
      return res.status(400).json({ error: 'classId is required' });
    }
    if (!sectionId || !mongoose.isValidObjectId(sectionId)) {
      return res.status(400).json({ error: 'sectionId is required' });
    }

    const teacherId = req.user?.id;
    if (!teacherId) return res.status(401).json({ error: 'Unauthorized' });

    const allocationFilter = {
      schoolId,
      ...(campusId
        ? { $or: [{ campusId }, { campusId: null }, { campusId: { $exists: false } }] }
        : {}),
      teacherId,
      classId,
      sectionId,
    };
    if (subjectId && mongoose.isValidObjectId(subjectId)) {
      allocationFilter.subjectId = subjectId;
    }
    let allocation = await TeacherAllocation.findOne(allocationFilter).lean();
    if (!allocation) {
      const timetableFilter = {
        schoolId,
        ...(campusId ? { campusId } : {}),
        classId,
        sectionId,
        'entries.teacherId': teacherId,
      };
      const timetable = await Timetable.findOne(timetableFilter)
        .select('entries')
        .populate('entries.subjectId', '_id')
        .lean();
      const hasMatch = (timetable?.entries || []).some((entry) => {
        if (String(entry.teacherId) !== String(teacherId)) return false;
        if (subjectId && mongoose.isValidObjectId(subjectId)) {
          return String(entry.subjectId?._id || entry.subjectId) === String(subjectId);
        }
        return true;
      });
      if (!hasMatch) {
        return res.status(403).json({ error: 'You are not assigned to this class/section' });
      }
      allocation = { fallback: true };
    }

    const teacher = await TeacherUser.findById(teacherId).select('name').lean();
    const { className, sectionName } = await resolveClassNames({
      schoolId,
      campusId,
      classId,
      sectionId,
    });
    let subjectName = '';
    if (subjectId && mongoose.isValidObjectId(subjectId)) {
      const subjectDoc = await Subject.findOne({
        _id: subjectId,
        schoolId,
        ...(campusId ? { campusId } : {}),
      }).select('name').lean();
      subjectName = subjectDoc?.name || '';
    }

    const created = await Notification.create({
      schoolId,
      campusId: campusId || null,
      title: String(title).trim(),
      message: String(message).trim(),
      audience: 'Student',
      classId,
      sectionId,
      createdByType: 'teacher',
      createdByTeacherId: teacherId,
      createdByName: teacher?.name || '',
      type: 'class_note',
      typeLabel: typeLabel ? String(typeLabel).trim() : '',
      priority: priority || undefined,
      category: category || undefined,
      className,
      sectionName,
      subjectId: subjectId || undefined,
      subjectName,
      attachments: Array.isArray(attachments) ? attachments : [],
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
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

// Teacher list their class notes
router.get('/teacher', authTeacher, async (req, res) => {
  // #swagger.tags = ['Notifications']
  try {
    const schoolId = req.schoolId;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    const campusId = req.campusId || null;
    const teacherId = req.user?.id;
    const items = await Notification.find({
      schoolId,
      ...(campusId
        ? { $or: [{ campusId }, { campusId: null }, { campusId: { $exists: false } }] }
        : {}),
      createdByType: 'teacher',
      createdByTeacherId: teacherId,
      type: 'class_note',
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher delete their class note
router.delete('/teacher/:id', authTeacher, async (req, res) => {
  // #swagger.tags = ['Notifications']
  try {
    const schoolId = req.schoolId;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    const campusId = req.campusId || null;
    const teacherId = req.user?.id;
    const { id } = req.params;

    const deleted = await Notification.findOneAndDelete({
      _id: id,
      schoolId,
      ...(campusId
        ? { $or: [{ campusId }, { campusId: null }, { campusId: { $exists: false } }] }
        : {}),
      createdByType: 'teacher',
      createdByTeacherId: teacherId,
      type: 'class_note',
    });
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

    if (normalizedAudience === 'Student') {
      const student = await StudentUser.findById(userId).select('grade section').lean();
      const className = student?.grade || '';
      const sectionName = student?.section || '';
      let classId = null;
      let sectionId = null;
      if (className) {
        const classDoc = await ClassModel.findOne({
          schoolId,
          ...(campusId ? { campusId } : {}),
          name: className
        }).select('_id').lean();
        classId = classDoc?._id || null;
      }
      if (classId && sectionName) {
        const sectionDoc = await Section.findOne({
          schoolId,
          ...(campusId ? { campusId } : {}),
          classId,
          name: sectionName
        }).select('_id').lean();
        sectionId = sectionDoc?._id || null;
      }

      filter.$and.push({
        $or: [
          { classId: { $exists: false } },
          { classId: null },
          classId ? { classId } : null,
          className ? { className } : null,
        ].filter(Boolean),
      });
      if (sectionId || sectionName) {
        filter.$and.push({
          $or: [
            { sectionId: { $exists: false } },
            { sectionId: null },
            sectionId ? { sectionId } : null,
            sectionName ? { sectionName } : null,
          ].filter(Boolean),
        });
      }
    }

    if (normalizedAudience === 'Parent') {
      const parent = await ParentUser.findById(userId).select('childrenIds').lean();
      const childrenIds = Array.isArray(parent?.childrenIds) ? parent.childrenIds : [];
      const children = childrenIds.length
        ? await StudentUser.find({ _id: { $in: childrenIds } })
            .select('grade section')
            .lean()
        : [];
      const classNames = Array.from(new Set(children.map((c) => c.grade).filter(Boolean)));
      const sectionNames = Array.from(new Set(children.map((c) => c.section).filter(Boolean)));

      const classDocs = classNames.length
        ? await ClassModel.find({
            schoolId,
            ...(campusId ? { campusId } : {}),
            name: { $in: classNames },
          }).select('_id').lean()
        : [];
      const classIds = classDocs.map((c) => c._id);

      filter.$and.push({
        $or: [
          { classId: { $exists: false } },
          { classId: null },
          classIds.length ? { classId: { $in: classIds } } : null,
          classNames.length ? { className: { $in: classNames } } : null,
        ].filter(Boolean),
      });

      if (sectionNames.length) {
        filter.$and.push({
          $or: [
            { sectionId: { $exists: false } },
            { sectionId: null },
            { sectionName: { $in: sectionNames } },
          ],
        });
      }
    }

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
