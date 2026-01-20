const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const School = require('../models/School');
const adminAuth = require('../middleware/adminAuth');
const rateLimit = require('../middleware/rateLimit');
const { isStrongPassword, passwordPolicyMessage } = require('../utils/passwordPolicy');

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

// Register
router.post('/register', async (req, res) => {
  // #swagger.tags = ['Admin Auth']
  const { username, password, name, schoolId } = req.body;
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return adminAuth(req, res, async () => {
        if (!req.isSuperAdmin) {
          return res.status(403).json({ error: 'Super admin access required' });
        }
        if (!isStrongPassword(password)) {
          return res.status(400).json({ error: passwordPolicyMessage });
        }
        if (!schoolId) {
          return res.status(400).json({ error: 'schoolId is required for school admin' });
        }
        const resolved = await resolveSchoolIdOrError(schoolId, res);
        if (!resolved) return;
        const admin = new Admin({
          username,
          password,
          name,
          role: 'admin',
          schoolId: resolved,
        });
        await admin.save();
        return res.status(201).json({ message: 'Admin registered' });
      });
    }
    if (schoolId) {
      return res.status(400).json({ error: 'schoolId is not allowed for initial super admin' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: passwordPolicyMessage });
    }
    const admin = new Admin({ username, password, name, role: 'super_admin', schoolId: null });
    await admin.save();
    res.status(201).json({ message: 'Admin registered' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', rateLimit({ windowMs: 60 * 1000, max: 10 }), async (req, res) => {
  // #swagger.tags = ['Admin Auth']
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: admin._id, type: 'admin', schoolId: admin.schoolId || null },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/profile", adminAuth, async (req, res) => {
  // #swagger.tags = ['Admin Auth']
  try {
      const student = await Admin.findById(req.admin.id).select('-password');
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.json(student);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
})

// Create a school admin (super admin only)
const resolveAvatarValue = (avatar) => {
  if (!avatar) return undefined;
  if (typeof avatar === 'string') return avatar;
  if (typeof avatar === 'object') {
    return avatar.secure_url || avatar.url || avatar.path || undefined;
  }
  return undefined;
};

router.post('/school-admins', adminAuth, ensureSuperAdmin, async (req, res) => {
  // #swagger.tags = ['Admin Auth']
  const { username, password, name, schoolId, email, avatar, status } = req.body;
  try {
    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: passwordPolicyMessage });
    }
    const resolved = await resolveSchoolIdOrError(schoolId, res);
    if (!resolved) return;

    const normalizedAvatar = resolveAvatarValue(avatar);
    const existing = await Admin.findOne({ username });
    if (existing) {
      existing.password = password;
      existing.name = name;
      existing.email = email || existing.email;
      if (normalizedAvatar) {
        existing.avatar = normalizedAvatar;
      }
      existing.schoolId = resolved;
      existing.status = status || existing.status;
      existing.role = 'admin';
      await existing.save();
      const updated = await Admin.findById(existing._id)
        .select('-password')
        .populate('schoolId', 'name code')
        .lean();
      return res.status(200).json(updated);
    }

    const admin = new Admin({
      username,
      password,
      name,
      email,
      avatar: normalizedAvatar,
      role: 'admin',
      status: status || 'active',
      schoolId: resolved
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

// List school admins (super admin only)
router.get('/school-admins', adminAuth, ensureSuperAdmin, async (req, res) => {
  // #swagger.tags = ['Admin Auth']
  try {
    const filter = { schoolId: { $ne: null } };
    if (req.query?.schoolId && mongoose.isValidObjectId(req.query.schoolId)) {
      filter.schoolId = req.query.schoolId;
    }
    const admins = await Admin.find(filter).select('-password').populate('schoolId', 'name code').lean();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
