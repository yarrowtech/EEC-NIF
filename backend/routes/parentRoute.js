const express = require('express');
const router = express.Router();
const ParentUser = require('../models/ParentUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminAuth = require('../middleware/adminAuth');
const { generateUsername, generatePassword } = require('../utils/generator');
const rateLimit = require('../middleware/rateLimit');
const { isStrongPassword, passwordPolicyMessage } = require('../utils/passwordPolicy');

// Parent Registration
router.post('/register', adminAuth, async (req, res) => {
  // #swagger.tags = ['Parents']
  const {
    name,
    schoolId,
    mobile,
    email,
    children,
    grade,
  } = req.body;

  try {
    const username = await generateUsername(name, 'parent');
    const password = generatePassword();
    const resolvedSchoolId = req.schoolId || (req.isSuperAdmin ? schoolId : null);
    const resolvedCampusId = req.campusId || (req.isSuperAdmin ? req.body?.campusId : null);
    if (!resolvedSchoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }
    if (!resolvedCampusId) {
      return res.status(400).json({ error: 'campusId is required' });
    }
    const allChild = children.split(',').map(child => child.trim());
    const allGrade = grade.split(',').map(g => g.trim());
    const user = new ParentUser({
      username,
      password,
      schoolId: resolvedSchoolId,
      campusId: resolvedCampusId,
      name,
      mobile,
      email,
      children: allChild,
      grade: allGrade,
    });

    await user.save();
    res.status(201).json({ message: 'Parent registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Parent Login
router.post('/login', rateLimit({ windowMs: 60 * 1000, max: 10 }), async (req, res) => {
  // #swagger.tags = ['Parents']
  const { username, password } = req.body;

  try {
    const user = await ParentUser.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.campusId) {
      return res.status(400).json({ error: 'campusId is required for this account' });
    }

    const token = jwt.sign(
      { id: user._id, userType: 'parent', schoolId: user.schoolId || null, campusId: user.campusId || null },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
