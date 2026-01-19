const express = require('express');
const router = express.Router();
const StudentUser = require('../models/StudentUser');
const auth = require('../middleware/authStudent');
const multer = require('multer');

// Setup multer for file uploads (in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST request to update student profile
router.post('/profile/update', auth, upload.single('profilePic'), async (req, res) => {
  // #swagger.tags = ['Student Profile']
  try {
    const updates = req.body;
    const schoolId = req.schoolId || req.user?.schoolId || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });

    // Handle profilePic if included
    if (req.file) {
      updates.profilePic = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const updatedStudent = await StudentUser.findOneAndUpdate(
      { _id: req.user.id, schoolId },
      updates,
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profile updated successfully', student: updatedStudent });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/profile', auth, async (req, res) => {
  // #swagger.tags = ['Student Profile']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    const student = await StudentUser.findOne({ _id: req.user.id, schoolId }).select('-password');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
