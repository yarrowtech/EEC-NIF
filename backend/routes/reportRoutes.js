const express = require('express');
const mongoose = require('mongoose');
const adminAuth = require('../middleware/adminAuth');

const StudentUser = require('../models/StudentUser');
const TeacherUser = require('../models/TeacherUser');
const ParentUser = require('../models/ParentUser');
const FeeInvoice = require('../models/FeeInvoice');

const router = express.Router();

const resolveSchoolId = (req, res) => {
  const schoolId = req.schoolId || req.admin?.schoolId || null;
  if (!schoolId) {
    res.status(400).json({ error: 'schoolId is required' });
    return null;
  }
  if (!mongoose.isValidObjectId(schoolId)) {
    res.status(400).json({ error: 'Invalid schoolId' });
    return null;
  }
  return schoolId;
};

router.get('/summary', adminAuth, async (req, res) => {
  // #swagger.tags = ['Reports']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    const [studentCount, teacherCount, parentCount] = await Promise.all([
      StudentUser.countDocuments({ schoolId }),
      TeacherUser.countDocuments({ schoolId }),
      ParentUser.countDocuments({ schoolId }),
    ]);

    const feeTotals = await FeeInvoice.aggregate([
      { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
          balanceAmount: { $sum: '$balanceAmount' },
        },
      },
    ]);

    const fee = feeTotals[0] || { totalAmount: 0, paidAmount: 0, balanceAmount: 0 };

    const attendanceTotals = await StudentUser.aggregate([
      { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
      { $unwind: { path: '$attendance', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: null,
          totalMarked: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ['$attendance.status', 'present'] }, 1, 0],
            },
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ['$attendance.status', 'absent'] }, 1, 0],
            },
          },
        },
      },
    ]);

    const attendance = attendanceTotals[0] || { totalMarked: 0, present: 0, absent: 0 };

    res.json({
      users: { students: studentCount, teachers: teacherCount, parents: parentCount },
      fees: fee,
      attendance: attendance,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
