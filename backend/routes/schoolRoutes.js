const express = require('express');
const mongoose = require('mongoose');
const School = require('../models/School');
const adminAuth = require('../middleware/adminAuth');
const { sendWebhook, WEBHOOK_EVENTS } = require('../utils/webhookSender');

const router = express.Router();

// Create school (admin only)
router.post('/', adminAuth, async (req, res) => {
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

// List schools (admin only)
router.get('/', adminAuth, async (_req, res) => {
  try {
    const schools = await School.find().sort({ createdAt: -1 }).lean();
    res.json(schools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending registrations (admin only) - must be before /:id
router.get('/registrations/pending', adminAuth, async (req, res) => {
  try {
    const schools = await School.find({
      registrationStatus: 'pending'
    })
    .sort({ submittedAt: -1 })
    .lean();

    res.json(schools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single registration details (admin only) - must be before /:id
router.get('/registrations/:id', adminAuth, async (req, res) => {
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

// Approve registration (admin only) - must be before /:id
router.put('/registrations/:id/approve', adminAuth, async (req, res) => {
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

    res.json({
      message: 'School registration approved successfully',
      school
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject registration (admin only) - must be before /:id
router.put('/registrations/:id/reject', adminAuth, async (req, res) => {
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

    res.json({
      message: 'School registration rejected',
      school
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single school (admin only) - generic route, must be after specific routes
router.get('/:id', adminAuth, async (req, res) => {
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

module.exports = router;
