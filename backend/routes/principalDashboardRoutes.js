const express = require('express');
const principalAuth = require('../middleware/principalAuth');
const StudentUser = require('../models/StudentUser');
const TeacherUser = require('../models/TeacherUser');
const ParentUser = require('../models/ParentUser');
const ClassModel = require('../models/Class');
const Subject = require('../models/Subject');
const StudentProgress = require('../models/StudentProgress');
const FeeInvoice = require('../models/FeeInvoice');

const router = express.Router();

const getSchoolFilter = (req) => ({ schoolId: req.schoolId });

const buildAttendanceTrend = (students, monthsBack = 6) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);
  const bucket = new Map();

  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    bucket.set(key, { total: 0, present: 0, label: date.toLocaleString('en-US', { month: 'short' }) });
  }

  students.forEach((student) => {
    (student.attendance || []).forEach((entry) => {
      const entryDate = new Date(entry.date);
      if (entryDate < start) return;
      const key = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;
      if (!bucket.has(key)) return;
      const data = bucket.get(key);
      data.total += 1;
      if (entry.status === 'present') {
        data.present += 1;
      }
    });
  });

  return Array.from(bucket.values()).map((item) => ({
    month: item.label,
    rate: item.total ? Number(((item.present / item.total) * 100).toFixed(1)) : 0,
  }));
};

router.get('/overview', principalAuth, async (req, res) => {
  try {
    const schoolFilter = getSchoolFilter(req);

    const [
      totalStudents,
      totalTeachers,
      totalParents,
      totalClasses,
      totalSubjects,
      studentProgress,
      feeSummary,
    ] = await Promise.all([
      StudentUser.countDocuments(schoolFilter),
      TeacherUser.countDocuments(schoolFilter),
      ParentUser.countDocuments(schoolFilter),
      ClassModel.countDocuments(schoolFilter),
      Subject.countDocuments(schoolFilter),
      StudentProgress.find(schoolFilter, 'overallGrade').lean(),
      FeeInvoice.aggregate([
        { $match: schoolFilter },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$totalAmount' },
            paidAmount: { $sum: '$paidAmount' },
            balanceAmount: { $sum: '$balanceAmount' },
          },
        },
      ]),
    ]);

    const students = await StudentUser.find(schoolFilter, 'attendance').lean();
    let present = 0;
    let total = 0;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    students.forEach((student) => {
      (student.attendance || []).forEach((entry) => {
        const entryDate = new Date(entry.date);
        if (entryDate < cutoff) return;
        total += 1;
        if (entry.status === 'present') {
          present += 1;
        }
      });
    });

    const attendanceRate = total ? Number(((present / total) * 100).toFixed(1)) : 0;
    const attendanceTrend = buildAttendanceTrend(students, 6);

    const gradeMap = studentProgress.reduce((acc, curr) => {
      const grade = curr.overallGrade || 'C';
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});

    const gradeDistribution = Object.entries(gradeMap).map(([grade, count]) => ({
      grade,
      count,
    }));

    const feeTotals = feeSummary[0] || { totalAmount: 0, paidAmount: 0, balanceAmount: 0 };

    res.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalParents,
        totalClasses,
        totalSubjects,
      },
      attendance: {
        rate: attendanceRate,
        present,
        total,
        trend: attendanceTrend,
      },
      fees: {
        totalAmount: feeTotals.totalAmount || 0,
        paidAmount: feeTotals.paidAmount || 0,
        balanceAmount: feeTotals.balanceAmount || 0,
      },
      performance: {
        gradeDistribution,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
