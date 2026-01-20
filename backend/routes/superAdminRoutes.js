const express = require('express');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const School = require('../models/School');
const StudentUser = require('../models/StudentUser');
const TeacherUser = require('../models/TeacherUser');
const ParentUser = require('../models/ParentUser');
const Principal = require('../models/Principal');
const AuditLog = require('../models/AuditLog');
const adminAuth = require('../middleware/adminAuth');
const { isStrongPassword, passwordPolicyMessage } = require('../utils/passwordPolicy');

const router = express.Router();

const ensureSuperAdmin = (req, res, next) => {
  if (!req.isSuperAdmin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  return next();
};

const resolveSchoolIdOrError = async (schoolId, res) => {
  if (!schoolId || !mongoose.isValidObjectId(schoolId)) {
    res.status(400).json({ error: 'Valid schoolId is required' });
    return null;
  }
  const exists = await School.exists({ _id: schoolId });
  if (!exists) {
    res.status(404).json({ error: 'School not found' });
    return null;
  }
  return schoolId;
};

// Overview counts (super admin only)
router.get('/overview', adminAuth, ensureSuperAdmin, async (_req, res) => {
  // #swagger.tags = ['Super Admin']
  try {
    const [
      schoolTotal,
      schoolActive,
      schoolInactive,
      pendingRegistrations,
      approvedRegistrations,
      rejectedRegistrations,
      superAdmins,
      schoolAdmins,
      students,
      teachers,
      parents,
      principals,
    ] = await Promise.all([
      School.countDocuments(),
      School.countDocuments({ status: 'active' }),
      School.countDocuments({ status: 'inactive' }),
      School.countDocuments({ registrationStatus: 'pending' }),
      School.countDocuments({ registrationStatus: 'approved' }),
      School.countDocuments({ registrationStatus: 'rejected' }),
      Admin.countDocuments({ schoolId: null }),
      Admin.countDocuments({ schoolId: { $ne: null } }),
      StudentUser.countDocuments(),
      TeacherUser.countDocuments(),
      ParentUser.countDocuments(),
      Principal.countDocuments(),
    ]);

    res.json({
      schools: {
        total: schoolTotal,
        active: schoolActive,
        inactive: schoolInactive,
        registrations: {
          pending: pendingRegistrations,
          approved: approvedRegistrations,
          rejected: rejectedRegistrations,
        },
      },
      admins: {
        superAdmins,
        schoolAdmins,
      },
      users: {
        students,
        teachers,
        parents,
        principals,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List schools (super admin only)
router.get('/schools', adminAuth, ensureSuperAdmin, async (req, res) => {
  // #swagger.tags = ['Super Admin']
  try {
    const { status, registrationStatus, q } = req.query || {};
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (registrationStatus) {
      filter.registrationStatus = registrationStatus;
    }
    if (q && String(q).trim()) {
      const query = String(q).trim();
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { code: { $regex: query, $options: 'i' } },
        { officialEmail: { $regex: query, $options: 'i' } },
      ];
    }

    const schools = await School.find(filter).sort({ createdAt: -1 }).lean();
    res.json(schools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get school details (super admin only)
router.get('/schools/:id', adminAuth, ensureSuperAdmin, async (req, res) => {
  // #swagger.tags = ['Super Admin']
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid school id' });
    }
    const school = await School.findById(id).lean();
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }
    res.json(school);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update school status (super admin only)
router.patch('/schools/:id/status', adminAuth, ensureSuperAdmin, async (req, res) => {
  // #swagger.tags = ['Super Admin']
  try {
    const { id } = req.params;
    const { status, suspensionReason } = req.body || {};
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid school id' });
    }
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'status must be active or inactive' });
    }

    const update = { status };
    if (status === 'inactive') {
      update.subscriptionStatus = 'suspended';
      update.suspendedAt = new Date();
      update.suspendedBy = req.admin.id || req.admin._id;
      update.suspensionReason = suspensionReason ? String(suspensionReason).trim() : undefined;
    } else {
      update.subscriptionStatus = 'active';
      update.suspendedAt = undefined;
      update.suspendedBy = undefined;
      update.suspensionReason = undefined;
    }

    const school = await School.findByIdAndUpdate(id, update, { new: true });
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }
    res.json(school);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update subscription (super admin only)
router.patch('/schools/:id/subscription', adminAuth, ensureSuperAdmin, async (req, res) => {
  // #swagger.tags = ['Super Admin']
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid school id' });
    }

    const update = {};
    const fields = [
      'subscriptionPlan',
      'subscriptionStatus',
      'subscriptionStartDate',
      'subscriptionEndDate',
      'paymentStatus',
      'paymentAmount',
      'invoiceNumber',
      'commercialStatus',
      'superAdminNotes',
    ];

    fields.forEach((field) => {
      if (req.body?.[field] !== undefined) {
        update[field] = req.body[field];
      }
    });

    const school = await School.findByIdAndUpdate(id, update, { new: true });
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }
    res.json(school);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create school admin (super admin only)
router.post('/admins', adminAuth, ensureSuperAdmin, async (req, res) => {
  // #swagger.tags = ['Super Admin']
  const { username, password, name, schoolId } = req.body || {};
  try {
    if (!username || !String(username).trim()) {
      return res.status(400).json({ error: 'username is required' });
    }
    if (!password || !String(password).trim()) {
      return res.status(400).json({ error: 'password is required' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: passwordPolicyMessage });
    }
    const resolved = await resolveSchoolIdOrError(schoolId, res);
    if (!resolved) return;

    const admin = new Admin({
      username: String(username).trim(),
      password: String(password).trim(),
      name: name ? String(name).trim() : undefined,
      schoolId: resolved,
    });
    await admin.save();

    const created = await Admin.findById(admin._id)
      .select('-password')
      .populate('schoolId', 'name code')
      .lean();
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List admins (super admin only)
router.get('/admins', adminAuth, ensureSuperAdmin, async (req, res) => {
  // #swagger.tags = ['Super Admin']
  try {
    const { schoolId, scope } = req.query || {};
    const filter = {};
    if (scope === 'super') {
      filter.schoolId = null;
    } else if (scope === 'school') {
      filter.schoolId = { $ne: null };
    }
    if (schoolId && mongoose.isValidObjectId(schoolId)) {
      filter.schoolId = schoolId;
    }
    const admins = await Admin.find(filter)
      .select('-password')
      .populate('schoolId', 'name code')
      .lean();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update admin (super admin only)
router.patch('/admins/:id', adminAuth, ensureSuperAdmin, async (req, res) => {
  // #swagger.tags = ['Super Admin']
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid admin id' });
    }

    const existing = await Admin.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const update = {};
    if (req.body?.name !== undefined) {
      update.name = String(req.body.name).trim();
    }
    if (req.body?.password !== undefined) {
      if (!isStrongPassword(req.body.password)) {
        return res.status(400).json({ error: passwordPolicyMessage });
      }
      update.password = req.body.password;
    }
    if (req.body?.schoolId !== undefined) {
      if (existing.schoolId === null) {
        return res.status(400).json({ error: 'Cannot change schoolId for super admin' });
      }
      const resolved = await resolveSchoolIdOrError(req.body.schoolId, res);
      if (!resolved) return;
      update.schoolId = resolved;
    }

    const updated = await Admin.findByIdAndUpdate(id, update, { new: true })
      .select('-password')
      .populate('schoolId', 'name code')
      .lean();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete admin (super admin only)
router.delete('/admins/:id', adminAuth, ensureSuperAdmin, async (req, res) => {
  // #swagger.tags = ['Super Admin']
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid admin id' });
    }

    const existing = await Admin.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    if (existing.schoolId === null) {
      return res.status(400).json({ error: 'Cannot delete super admin' });
    }

    await Admin.deleteOne({ _id: id });
    res.json({ message: 'Admin deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Global audit logs (super admin only)
router.get('/audit-logs', adminAuth, ensureSuperAdmin, async (req, res) => {
  // #swagger.tags = ['Super Admin']
  try {
    const { schoolId, limit } = req.query || {};
    const filter = {};
    if (schoolId && mongoose.isValidObjectId(schoolId)) {
      filter.schoolId = schoolId;
    }
    const max = Math.min(Number(limit) || 200, 500);
    const items = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(max).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
