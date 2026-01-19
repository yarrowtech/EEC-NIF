const express = require('express');
const router = express.Router();
const StudentUser = require('../models/StudentUser');
const authStudent = require('../middleware/authStudent');
const authTeacher = require('../middleware/authTeacher');
const adminAuth = require('../middleware/adminAuth');

// === Student marks attendance ===
router.post('/mark', authStudent, async (req, res) => {
  // #swagger.tags = ['Attendance']
  try {
    const { status, subject } = req.body;
    const schoolId = req.schoolId || req.user?.schoolId || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    const student = await StudentUser.findOne({ _id: req.user.id, schoolId });

    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Optional: prevent multiple entries for the same day
    const today = new Date().toDateString();
    const alreadyMarked = student.attendance.some(entry =>
      new Date(entry.date).toDateString() === today
    );
    if (alreadyMarked) {
      return res.status(400).json({ error: 'Attendance already marked for today' });
    }

    student.attendance.push({ status, subject });
    await student.save();
    res.status(200).json({ message: 'Attendance marked' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// === Teacher views all student attendance ===
router.get('/all', authTeacher, async (req, res) => {
  // #swagger.tags = ['Attendance']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    const students = await StudentUser.find({ schoolId }, 'name email attendance');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Admin views all attendance ===
router.get('/admin/all', adminAuth, async (req, res) => {
  // #swagger.tags = ['Attendance']
  try {
    const schoolId = req.schoolId || req.admin?.schoolId || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    const students = await StudentUser.find({ schoolId }, 'name email attendance');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;

