<<<<<<< HEAD
const express = require('express');
const mongoose = require('mongoose');
const School = require('../models/School');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

const ensureSuperAdmin = (req, res, next) => {
  if (!req.isSuperAdmin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  return next();
};

/**
 * @openapi
 * components:
 *   schemas:
 *     School:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         address:
 *           type: string
 *         contactEmail:
 *           type: string
 *           format: email
 *         contactPhone:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required: [name, code]
 * tags:
 *   - name: Schools
 *     description: School administration
 */

/**
 * @openapi
 * /api/schools:
 *   post:
 *     summary: Create school
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code]
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               address:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *                 format: email
 *               contactPhone:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/School'
 *       400:
 *         description: Validation error
 *       409:
 *         description: School code already exists
 */
// Create school (admin only)
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

/**
 * @openapi
 * /api/schools:
 *   get:
 *     summary: List schools
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/School'
 *       500:
 *         description: Server error
 */
// List schools (admin only)
router.get('/', adminAuth, ensureSuperAdmin, async (_req, res) => {
  // #swagger.tags = ['Schools']
  try {
    const schools = await School.find().sort({ createdAt: -1 }).lean();
    res.json(schools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/schools/{id}:
 *   get:
 *     summary: Get school by id
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/School'
 *       400:
 *         description: Invalid school id
 *       404:
 *         description: School not found
 *       500:
 *         description: Server error
 */
// Get a single school (admin only)
router.get('/:id', adminAuth, ensureSuperAdmin, async (req, res) => {
  // #swagger.tags = ['Schools']
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
=======
const express = require('express');
const mongoose = require('mongoose');
const School = require('../models/School');
const adminAuth = require('../middleware/adminAuth');

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
>>>>>>> 692c283aa64992261a83dd41142ba8207a54b7f7
