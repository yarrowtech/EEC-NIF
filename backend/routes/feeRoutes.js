const express = require('express');
const mongoose = require('mongoose');
const adminAuth = require('../middleware/adminAuth');

const FeeStructure = require('../models/FeeStructure');
const FeeInvoice = require('../models/FeeInvoice');
const FeePayment = require('../models/FeePayment');
const StudentUser = require('../models/StudentUser');

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

const recomputeInvoiceStatus = (invoice) => {
  const paid = Number(invoice.paidAmount || 0);
  const total = Number(invoice.totalAmount || 0);
  const balance = Math.max(0, total - paid);
  invoice.balanceAmount = balance;
  if (balance === 0) {
    invoice.status = 'paid';
  } else if (paid > 0) {
    invoice.status = 'partial';
  } else {
    invoice.status = 'due';
  }
};

// Fee Structures
router.post('/structures', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const { name, totalAmount, academicYearId, classId, installments } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Structure name is required' });
    }
    const total = Number(totalAmount);
    if (!Number.isFinite(total) || total < 0) {
      return res.status(400).json({ error: 'Valid totalAmount is required' });
    }

    const created = await FeeStructure.create({
      schoolId,
      academicYearId: academicYearId || undefined,
      classId: classId || undefined,
      name: String(name).trim(),
      totalAmount: total,
      installments: Array.isArray(installments) ? installments : [],
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/structures', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const filter = { schoolId };
    if (req.query.classId && mongoose.isValidObjectId(req.query.classId)) {
      filter.classId = req.query.classId;
    }
    const items = await FeeStructure.find(filter).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fee Invoices
router.post('/invoices', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const { studentId, feeStructureId, title, totalAmount, dueDate, academicYearId, classId } = req.body || {};
    if (!studentId || !mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ error: 'Valid studentId is required' });
    }

    const student = await StudentUser.findOne({ _id: studentId, schoolId }).lean();
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    let structure = null;
    if (feeStructureId && mongoose.isValidObjectId(feeStructureId)) {
      structure = await FeeStructure.findOne({ _id: feeStructureId, schoolId }).lean();
    }

    const resolvedTotal = Number.isFinite(Number(totalAmount))
      ? Number(totalAmount)
      : structure?.totalAmount;
    if (!Number.isFinite(resolvedTotal)) {
      return res.status(400).json({ error: 'totalAmount is required' });
    }

    const created = await FeeInvoice.create({
      schoolId,
      academicYearId: academicYearId || structure?.academicYearId,
      classId: classId || structure?.classId,
      studentId,
      feeStructureId: structure?._id,
      title: title ? String(title).trim() : structure?.name || 'Fee Invoice',
      totalAmount: resolvedTotal,
      paidAmount: 0,
      balanceAmount: resolvedTotal,
      status: 'due',
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/invoices', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const filter = { schoolId };
    if (req.query.studentId && mongoose.isValidObjectId(req.query.studentId)) {
      filter.studentId = req.query.studentId;
    }
    const items = await FeeInvoice.find(filter).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Payments
router.post('/payments', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const { invoiceId, amount, method, notes, paidOn } = req.body || {};
    if (!invoiceId || !mongoose.isValidObjectId(invoiceId)) {
      return res.status(400).json({ error: 'Valid invoiceId is required' });
    }
    const paymentAmount = Number(amount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    const invoice = await FeeInvoice.findOne({ _id: invoiceId, schoolId });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    invoice.paidAmount = Number(invoice.paidAmount || 0) + paymentAmount;
    recomputeInvoiceStatus(invoice);
    await invoice.save();

    const created = await FeePayment.create({
      schoolId,
      invoiceId: invoice._id,
      studentId: invoice.studentId,
      amount: paymentAmount,
      method: method || 'cash',
      notes: notes ? String(notes).trim() : undefined,
      paidOn: paidOn ? new Date(paidOn) : undefined,
    });

    res.status(201).json({ payment: created, invoice });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/payments', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const filter = { schoolId };
    if (req.query.invoiceId && mongoose.isValidObjectId(req.query.invoiceId)) {
      filter.invoiceId = req.query.invoiceId;
    }
    const items = await FeePayment.find(filter).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
