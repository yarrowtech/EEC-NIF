const express = require('express');
const router = express.Router();
const ParentUser = require('../models/ParentUser');
const StudentUser = require('../models/StudentUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminAuth = require('../middleware/adminAuth');
const authParent = require('../middleware/authParent');
const { generateUsername, generatePassword } = require('../utils/generator');
const rateLimit = require('../middleware/rateLimit');
const { isStrongPassword, passwordPolicyMessage } = require('../utils/passwordPolicy');

const mergeUnique = (target = [], additions = []) => {
  const set = new Set(target.filter(Boolean));
  additions.filter(Boolean).forEach((val) => set.add(val));
  return Array.from(set);
};

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
    if (!resolvedSchoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }
    const allChild = children.split(',').map(child => child.trim());
    const allGrade = grade.split(',').map(g => g.trim());
    const user = new ParentUser({
      username,
      password,
      schoolId: resolvedSchoolId,
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

    const token = jwt.sign(
      { id: user._id, userType: 'parent', schoolId: user.schoolId || null },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Link parent to students (admin only)
router.post('/link-children', adminAuth, async (req, res) => {
  // #swagger.tags = ['Parents']
  try {
    const { parentId, studentIds } = req.body || {};
    const schoolId = req.schoolId || (req.isSuperAdmin ? req.body?.schoolId : null);
    if (!schoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }
    if (!parentId || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'parentId and studentIds are required' });
    }

    const parent = await ParentUser.findOne({ _id: parentId, schoolId });
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    const students = await StudentUser.find({ _id: { $in: studentIds }, schoolId })
      .select('name grade')
      .lean();
    if (!students.length) {
      return res.status(404).json({ error: 'No matching students found' });
    }

    const childNames = students.map((s) => s.name).filter(Boolean);
    const grades = students.map((s) => s.grade).filter(Boolean);

    parent.childrenIds = mergeUnique(parent.childrenIds, students.map((s) => s._id));
    parent.children = mergeUnique(parent.children, childNames);
    parent.grade = mergeUnique(parent.grade, grades);

    await parent.save();
    res.json({ message: 'Parent linked to students', parent });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Parent fetch linked students
router.get('/me/children', authParent, async (req, res) => {
  // #swagger.tags = ['Parents']
  try {
    const schoolId = req.schoolId || null;
    if (!schoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }

    const parent = await ParentUser.findOne({ _id: req.user.id, schoolId })
      .populate('childrenIds', 'name grade section roll')
      .lean();
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    res.json({
      children: parent.childrenIds || [],
      childNames: parent.children || [],
      grades: parent.grade || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
