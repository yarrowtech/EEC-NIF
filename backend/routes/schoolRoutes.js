const express = require('express');
const mongoose = require('mongoose');
const School = require('../models/School');
const adminAuth = require('../middleware/adminAuth');
const { logSecurityEvent } = require('../utils/securityEventLogger');
const { logBusinessEvent } = require('../utils/businessEventLogger');

const router = express.Router();

const ensureSuperAdmin = (req, res, next) => {
  if (!req.isSuperAdmin) {
    logSecurityEvent(req, {
      action: 'security.rbac_violation',
      outcome: 'blocked',
      severity: 'high',
      attack_type: 'rbac_violation',
      riskScore: 82,
      reason: 'Super admin role required for school route',
      statusCode: 403,
      requiredRole: 'super_admin',
    });
    return res.status(403).json({ error: 'Super admin access required' });
  }
   return next();
};

// Create school (super admin only)
router.post('/', adminAuth, ensureSuperAdmin, async (req, res) => {
  // #swagger.tags = ['Schools']
  try {
    const { name, code, address, contactEmail, contactPhone, status } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'School name is required' });
    }
    if (!code || !String(code).trim()) {
      return res.status(400).json({ error: 'School code is required' });
    }

    const created = await School.create({
      name: name.trim(),
      code: String(code).trim().toUpperCase(),
      address: address ? String(address).trim() : undefined,
      contactEmail: contactEmail ? String(contactEmail).trim() : undefined,
      contactPhone: contactPhone ? String(contactPhone).trim() : undefined,
      status: status === 'inactive' ? 'inactive' : 'active',
    });

    res.status(201).json(created);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'School code already exists' });
    }
    res.status(400).json({ error: err.message });
  }
});

// List schools (admin only; scoped for school admins)
router.get('/', adminAuth, async (req, res) => {
  // #swagger.tags = ['Schools']
  try {
    const filter = {};
    if (!req.isSuperAdmin) {
      filter._id = req.schoolId;
    } else if (req.schoolId) {
      filter._id = req.schoolId;
    }
    const schools = await School.find(filter).sort({ createdAt: -1 }).lean();
    res.json(schools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending registrations (super admin only) - must be before /:id
router.get('/registrations/pending', adminAuth, ensureSuperAdmin, async (req, res) => {
  // #swagger.tags = ['School Registration']
  try {
    const schools = await School.find({
      registrationStatus: 'pending'
    })
    .sort({ submittedAt: -1 })
    .lean();

    logBusinessEvent(req, {
      action: 'school_registration.pending_fetch',
      outcome: 'success',
      entity: 'school_registration',
      statusCode: 200,
      resultCount: schools.length,
      adminId: req.admin?.id || req.admin?._id,
    });
    res.json(schools);
  } catch (err) {
    logBusinessEvent(req, {
      action: 'school_registration.pending_fetch',
      outcome: 'failure',
      entity: 'school_registration',
      statusCode: 500,
      reason: err.message,
      adminId: req.admin?.id || req.admin?._id,
    });
    res.status(500).json({ error: err.message });
  }
});

// Approve all pending registrations (super admin only) - must be before /:id
router.put('/registrations/approve-all', adminAuth, ensureSuperAdmin, async (req, res) => {
  // #swagger.tags = ['School Registration']
  try {
    const note =
      typeof req.body?.adminNotes === 'string' && req.body.adminNotes.trim()
        ? req.body.adminNotes.trim()
        : null;

    const pendingCount = await School.countDocuments({
      registrationStatus: 'pending',
    });
    if (pendingCount === 0) {
      return res.json({ message: 'No pending registrations to approve', updated: 0 });
    }

    const update = {
      registrationStatus: 'approved',
      status: 'active',
      reviewedAt: new Date(),
      reviewedBy: req.admin.id || req.admin._id,
    };
    if (note) {
      update.adminNotes = note;
    }

    const result = await School.updateMany(
      { registrationStatus: 'pending' },
      { $set: update }
    );

    res.json({
      message: 'Approved all pending registrations',
      matched: result.matchedCount ?? result.n ?? 0,
      updated: result.modifiedCount ?? result.nModified ?? 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single registration details (super admin only) - must be before /:id
router.get('/registrations/:id', adminAuth, ensureSuperAdmin, async (req, res) => {
  // #swagger.tags = ['School Registration']
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

// Approve registration (super admin only) - must be before /:id
router.put('/registrations/:id/approve', adminAuth, ensureSuperAdmin, async (req, res) => {
  // #swagger.tags = ['School Registration']
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid school id' });
    }

    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    if (school.registrationStatus !== 'pending') {
      return res.status(400).json({
        error: `School registration has already been ${school.registrationStatus}` 
      });
    }

    school.registrationStatus = 'approved';
    school.status = 'active';
    school.reviewedAt = new Date();
    school.reviewedBy = req.admin.id || req.admin._id;
    school.adminNotes = adminNotes || undefined;

    await school.save();
    logBusinessEvent(req, {
      action: 'school_registration.approve',
      outcome: 'success',
      entity: 'school',
      entityId: school._id,
      statusCode: 200,
      schoolId: school._id,
      adminId: req.admin?.id || req.admin?._id,
      transition: 'pending_to_approved_active',
    });

    res.json({
      message: 'School registration approved successfully',
      school
    });
  } catch (err) {
    logBusinessEvent(req, {
      action: 'school_registration.approve',
      outcome: 'failure',
      entity: 'school',
      entityId: req.params?.id,
      statusCode: 500,
      reason: err.message,
      adminId: req.admin?.id || req.admin?._id,
    });
    res.status(500).json({ error: err.message });
  }
});

// Reject registration (super admin only) - must be before /:id
router.put('/registrations/:id/reject', adminAuth, ensureSuperAdmin, async (req, res) => {
  // #swagger.tags = ['School Registration']
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid school id' });
    }

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    if (school.registrationStatus !== 'pending') {
      return res.status(400).json({
        error: `School registration has already been ${school.registrationStatus}`
      });
    }

    school.registrationStatus = 'rejected';
    school.status = 'inactive';
    school.reviewedAt = new Date();
    school.reviewedBy = req.admin.id || req.admin._id;
    school.rejectionReason = rejectionReason.trim();

    await school.save();
    logBusinessEvent(req, {
      action: 'school_registration.reject',
      outcome: 'success',
      entity: 'school',
      entityId: school._id,
      statusCode: 200,
      schoolId: school._id,
      adminId: req.admin?.id || req.admin?._id,
      transition: 'pending_to_rejected_inactive',
    });

    res.json({
      message: 'School registration rejected',
      school
    });
  } catch (err) {
    logBusinessEvent(req, {
      action: 'school_registration.reject',
      outcome: 'failure',
      entity: 'school',
      entityId: req.params?.id,
      statusCode: 500,
      reason: err.message,
      adminId: req.admin?.id || req.admin?._id,
    });
    res.status(500).json({ error: err.message });
  }
});

// Get a single school (admin only) - generic route, must be after specific routes
router.get('/:id', adminAuth, async (req, res) => {
  // #swagger.tags = ['Schools']
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid school id' });
    }
    if (!req.isSuperAdmin && req.schoolId && String(req.schoolId) !== String(id)) {
      return res.status(403).json({ error: 'Access denied' });
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

module.exports = router;
