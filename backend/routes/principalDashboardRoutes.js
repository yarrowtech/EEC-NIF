const express = require('express');
const principalAuth = require('../middleware/principalAuth');
const StudentUser = require('../models/StudentUser');
const TeacherUser = require('../models/TeacherUser');
const ParentUser = require('../models/ParentUser');
const ClassModel = require('../models/Class');
const Subject = require('../models/Subject');
const StudentProgress = require('../models/StudentProgress');
const FeeInvoice = require('../models/FeeInvoice');
const FeePayment = require('../models/FeePayment');

const router = express.Router();

const getSchoolFilter = (req) => {
  const filter = { schoolId: req.schoolId };
  if (req.campusId) {
    filter.$or = [
      { campusId: req.campusId },
      { campusId: { $exists: false } },
      { campusId: null },
    ];
  }
  return filter;
};

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
  // #swagger.tags = ['Principal Dashboard']
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

router.get('/teachers', principalAuth, async (req, res) => {
  // #swagger.tags = ['Principal Dashboard']
  try {
    const schoolFilter = getSchoolFilter(req);
    const teachers = await TeacherUser.find(schoolFilter).select('-password').lean();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/financial', principalAuth, async (req, res) => {
  // #swagger.tags = ['Principal Dashboard']
  try {
    const schoolFilter = getSchoolFilter(req);

    // Get all students for the school/campus
    const students = await StudentUser.find(schoolFilter)
      .select('name grade section')
      .lean();
    const studentIds = students.map((s) => s._id);
    const studentMap = new Map(students.map((s) => [String(s._id), s]));

    // Build invoice filter
    const invoiceFilter = { ...schoolFilter };
    if (studentIds.length > 0) {
      invoiceFilter.studentId = { $in: studentIds };
    }

    // Get all invoices
    const invoices = await FeeInvoice.find(invoiceFilter).lean();

    // Calculate totals
    const totals = invoices.reduce(
      (acc, inv) => {
        acc.totalInvoiced += Number(inv.totalAmount || 0);
        acc.totalCollected += Number(inv.paidAmount || 0);
        acc.totalOutstanding += Number(inv.balanceAmount || 0);
        return acc;
      },
      {
        totalOutstanding: 0,
        totalCollected: 0,
        totalInvoiced: 0,
      }
    );

    // Calculate overdue invoices
    const today = new Date();
    const overdueInvoices = invoices.filter(
      (inv) => inv.dueDate && new Date(inv.dueDate) < today && Number(inv.balanceAmount || 0) > 0
    ).length;

    // Get recent payments
    const payments = await FeePayment.find(invoiceFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const recentPayments = payments.map((payment) => {
      const student = studentMap.get(String(payment.studentId));
      return {
        id: payment._id,
        studentName: student?.name || 'Student',
        className: student?.grade || '',
        section: student?.section || '',
        amount: payment.amount,
        paidOn: payment.paidOn || payment.createdAt,
        method: payment.method || 'cash',
        status: 'paid',
      };
    });

    // Calculate monthly revenue trend (last 8 months)
    const monthlyData = {};
    const now = new Date();

    // Initialize last 8 months
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthlyData[key] = {
        month: monthNames[d.getMonth()],
        revenue: 0,
        expenses: 0,
      };
    }

    // Aggregate payments by month
    payments.forEach((payment) => {
      const date = new Date(payment.paidOn || payment.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key]) {
        monthlyData[key].revenue += Number(payment.amount || 0);
      }
    });

    const revenueData = Object.values(monthlyData);

    // Calculate expense breakdown (mock percentages for now, can be enhanced)
    const expenseData = [
      { name: 'Salaries', value: 45, color: '#3B82F6' },
      { name: 'Infrastructure', value: 25, color: '#10B981' },
      { name: 'Equipment', value: 15, color: '#F59E0B' },
      { name: 'Utilities', value: 10, color: '#EF4444' },
      { name: 'Others', value: 5, color: '#8B5CF6' },
    ];

    res.json({
      totals: {
        totalRevenue: Math.round(totals.totalCollected),
        totalExpenses: Math.round(totals.totalCollected * 0.6), // Estimate 60% as expenses
        totalInvoiced: Math.round(totals.totalInvoiced),
        totalOutstanding: Math.round(totals.totalOutstanding),
        netProfit: Math.round(totals.totalCollected * 0.4), // 40% profit margin estimate
        budgetUtilization: totals.totalInvoiced > 0
          ? Math.round((totals.totalCollected / totals.totalInvoiced) * 100)
          : 0,
        overdueInvoices,
      },
      revenueData,
      expenseData,
      recentPayments,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
