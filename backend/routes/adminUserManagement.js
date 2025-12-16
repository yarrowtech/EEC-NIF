const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth'); // Protect the route
const StudentUser = require('../models/StudentUser');
const TeacherUser = require('../models/TeacherUser');
const ParentUser = require('../models/ParentUser');

// Utility to get the right model based on role
const getModelByRole = (role) => {
  switch (role) {
    case 'student': return StudentUser;
    case 'teacher': return TeacherUser;
    case 'parent': return ParentUser;
    default: return null;
  }
};

// Admin creates a user (student/teacher/parent)
router.post('/create-user', adminAuth, async (req, res) => {
  const { role, username, password, name, mobile, email, city, address, state, pinCode } = req.body;

  const Model = getModelByRole(role);
  if (!Model) return res.status(400).json({ error: 'Invalid user role' });

  try {
    const newUser = new Model({ username, password, name, mobile, email, city, address, state, pinCode });
    await newUser.save();
    res.status(201).json({ message: `${role} user created successfully` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/get-students", adminAuth, async (req, res) => {
  try {
    const students = await StudentUser.find();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-teachers", adminAuth, async (req, res) => {
  try {
    const teachers = await TeacherUser.find();
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-parents", adminAuth, async (req, res) => {
  try {
    const teachers = await ParentUser.find();
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Live dashboard statistics endpoint
router.get("/dashboard-stats", adminAuth, async (req, res) => {
  try {
    // Fetch counts from all user types
    const [studentCount, teacherCount, parentCount] = await Promise.all([
      StudentUser.countDocuments(),
      TeacherUser.countDocuments(),
      ParentUser.countDocuments()
    ]);

    // Calculate additional stats
    const totalUsers = studentCount + teacherCount + parentCount;

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentStudents, recentTeachers, recentParents] = await Promise.all([
      StudentUser.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      TeacherUser.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      ParentUser.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    res.status(200).json({
      students: {
        total: studentCount,
        recent: recentStudents
      },
      teachers: {
        total: teacherCount,
        recent: recentTeachers
      },
      parents: {
        total: parentCount,
        recent: recentParents
      },
      totalUsers,
      recentTotal: recentStudents + recentTeachers + recentParents,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
