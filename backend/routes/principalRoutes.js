<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Principal = require('../models/Principal');
const School = require('../models/School');
const rateLimit = require('../middleware/rateLimit');
const { isStrongPassword, passwordPolicyMessage } = require('../utils/passwordPolicy');
const adminAuth = require('../middleware/adminAuth');

const normalize = (value = '') => String(value).trim().toLowerCase();

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

router.post('/register', adminAuth, async (req, res) => {
  // #swagger.tags = ['Principals']
  const { username, email, password, name, schoolId } = req.body || {};
  try {
    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: passwordPolicyMessage });
    }
    const resolvedSchoolId = req.schoolId || (req.isSuperAdmin ? schoolId : null);
    const validatedSchoolId = await resolveSchoolIdOrError(resolvedSchoolId, res);
    if (!validatedSchoolId) return;
    const principalEmail = normalize(email || username);
    if (!principalEmail) {
      return res.status(400).json({ error: 'email or username is required' });
    }

    const principal = new Principal({
      username: normalize(username || principalEmail),
      email: principalEmail,
      password,
      name: name || 'Principal',
      schoolId: validatedSchoolId,
    });

    await principal.save();
    const created = await Principal.findById(principal._id)
      .select('-password')
      .populate('schoolId', 'name code')
      .lean();
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', rateLimit({ windowMs: 60 * 1000, max: 10 }), async (req, res) => {
  // #swagger.tags = ['Principals']
  const { username, email, password } = req.body || {};
  try {
    const identifier = normalize(username || email);
    if (!identifier || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }
    const principal = await Principal.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });
    if (!principal || !(await bcrypt.compare(password, principal.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: principal._id, type: 'principal', schoolId: principal.schoolId || null },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
=======
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Principal = require('../models/Principal');
const rateLimit = require('../middleware/rateLimit');
const { isStrongPassword, passwordPolicyMessage } = require('../utils/passwordPolicy');

const normalize = (value = '') => String(value).trim().toLowerCase();

router.post('/register', async (req, res) => {
  const { username, email, password, name, schoolId } = req.body || {};
  try {
    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: passwordPolicyMessage });
    }
    const resolvedSchoolId =
      schoolId && mongoose.isValidObjectId(schoolId) ? schoolId : null;
    const principalEmail = normalize(email || username);
    if (!principalEmail) {
      return res.status(400).json({ error: 'email or username is required' });
    }

    const principal = new Principal({
      username: normalize(username || principalEmail),
      email: principalEmail,
      password,
      name: name || 'Principal',
      schoolId: resolvedSchoolId,
    });

    await principal.save();
    res.status(201).json({ message: 'Principal registered' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', rateLimit({ windowMs: 60 * 1000, max: 10 }), async (req, res) => {
  const { username, email, password } = req.body || {};
  try {
    const identifier = normalize(username || email);
    if (!identifier || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }
    const principal = await Principal.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });
    if (!principal || !(await bcrypt.compare(password, principal.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: principal._id, type: 'principal', schoolId: principal.schoolId || null },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
>>>>>>> 692c283aa64992261a83dd41142ba8207a54b7f7
