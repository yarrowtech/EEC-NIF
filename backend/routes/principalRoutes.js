const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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
    const principalEmail = normalize(email || username);
    if (!principalEmail) {
      return res.status(400).json({ error: 'email or username is required' });
    }

    const principal = new Principal({
      username: normalize(username || principalEmail),
      email: principalEmail,
      password,
      name: name || 'Principal',
      schoolId: schoolId || null,
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
