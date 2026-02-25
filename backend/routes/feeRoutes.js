const express = require('express');
const mongoose = require('mongoose');
const adminAuth = require('../middleware/adminAuth');
const authParent = require('../middleware/authParent');
const authStudent = require('../middleware/authStudent');

const FeeStructure = require('../models/FeeStructure');
const FeeInvoice = require('../models/FeeInvoice');
const FeePayment = require('../models/FeePayment');
const StudentUser = require('../models/StudentUser');
const ParentUser = require('../models/ParentUser');
const ClassModel = require('../models/Class');
const Section = require('../models/Section');
const AcademicYear = require('../models/AcademicYear');
const NotificationService = require('../utils/notificationService');
const {
  buildRazorpayReceipt,
  createRazorpayOrder,
  verifyRazorpaySignature,
  buildTransactionId,
} = require('../utils/paymentGatewayService');

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
  const total = Math.max(
    0,
    Number(invoice.totalAmount || 0) - Number(invoice.discountAmount || 0)
  );
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

const normalizeName = (value) => String(value || '').trim();

const resolveParentStudents = async ({ parent, schoolId, campusId }) => {
  const filter = { schoolId };
  if (campusId) filter.campusId = campusId;

  if (Array.isArray(parent?.childrenIds) && parent.childrenIds.length > 0) {
    return StudentUser.find({
      ...filter,
      _id: { $in: parent.childrenIds },
    })
      .select('name grade section')
      .lean();
  }

  const names = Array.isArray(parent?.children)
    ? parent.children.map(normalizeName).filter(Boolean)
    : [];
  if (names.length === 0) return [];

  return StudentUser.find({
    ...filter,
    name: { $in: names },
  })
    .select('name grade section')
    .lean();
};

const buildPaymentsByInvoice = (payments = []) => {
  return payments.reduce((acc, payment) => {
    const key = String(payment.invoiceId || '');
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(payment);
    return acc;
  }, {});
};

const normalizeFeeHeads = (feeHeads) => {
  if (!Array.isArray(feeHeads)) return [];
  return feeHeads
    .map((head) => ({
      label: String(head?.label || '').trim(),
      amount: Number(head?.amount || 0),
    }))
    .filter((head) => head.label && Number.isFinite(head.amount) && head.amount >= 0);
};

const normalizeInstallments = (installments) => {
  if (!Array.isArray(installments)) return [];
  return installments
    .map((inst) => ({
      label: String(inst?.label || '').trim(),
      amount: Number(inst?.amount || 0),
      dueDate: inst?.dueDate ? new Date(inst.dueDate) : undefined,
    }))
    .filter((inst) => inst.label && Number.isFinite(inst.amount) && inst.amount >= 0);
};

const sumAmounts = (items) =>
  items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

const buildCampusFilter = (schoolId, campusId) => {
  const filter = { schoolId };
  if (campusId) {
    filter.campusId = campusId;
  }
  return filter;
};

const fetchCampusStudentIds = async (schoolId, campusId) => {
  if (!campusId) return null;
  const students = await StudentUser.find({ schoolId, campusId })
    .select('_id')
    .lean();
  return students.map((student) => student._id);
};

const ensureClassAccessible = async (schoolId, campusId, classId) => {
  if (!campusId) return true;
  if (!classId || !mongoose.isValidObjectId(classId)) return false;
  const exists = await ClassModel.findOne({ _id: classId, schoolId, campusId })
    .select('_id')
    .lean();
  return Boolean(exists);
};

const requireCampusId = (req, res) => {
  if (!req.campusId) {
    res.status(400).json({ error: 'campusId is required' });
    return false;
  }
  return true;
};

const ensureInvoiceCampusAccess = async ({ invoice, schoolId, campusId }) => {
  if (!campusId) return true;
  const student = await StudentUser.findOne({ _id: invoice.studentId, schoolId })
    .select('campusId')
    .lean();
  return Boolean(student && String(student.campusId || '') === String(campusId));
};


// Fee Structures
router.post('/structures', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    if (!requireCampusId(req, res)) return;
    const {
      name,
      totalAmount,
      academicYearId,
      classId,
      className,
      installments,
      feeHeads,
      board,
    } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Structure name is required' });
    }
    if (req.campusId && classId) {
      const classAllowed = await ensureClassAccessible(schoolId, req.campusId, classId);
      if (!classAllowed) {
        return res.status(403).json({ error: 'Class not available for this campus' });
      }
    }
    const normalizedFeeHeads = normalizeFeeHeads(feeHeads);
    const headsTotal = sumAmounts(normalizedFeeHeads);
    const total =
      Number.isFinite(Number(totalAmount)) && Number(totalAmount) >= 0
        ? Number(totalAmount)
        : headsTotal;
    if (!Number.isFinite(total) || total < 0) {
      return res.status(400).json({ error: 'Valid totalAmount is required' });
    }
    const normalizedInstallments = normalizeInstallments(installments);

    const created = await FeeStructure.create({
      schoolId,
      academicYearId: academicYearId || undefined,
      classId: classId || undefined,
      className: className ? String(className).trim() : undefined,
      board: board ? String(board).trim() : 'GENERAL',
      name: String(name).trim(),
      totalAmount: total,
      feeHeads: normalizedFeeHeads,
      installments: normalizedInstallments,
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
    if (!requireCampusId(req, res)) return;
    const filter = { schoolId };
    let campusClassIds = null;
    if (req.campusId) {
      const classDocs = await ClassModel.find(buildCampusFilter(schoolId, req.campusId))
        .select('_id')
        .lean();
      campusClassIds = classDocs.map((doc) => doc._id);
      if (campusClassIds.length === 0) {
        return res.json([]);
      }
      filter.classId = { $in: campusClassIds };
    }
    if (req.query.classId && mongoose.isValidObjectId(req.query.classId)) {
      if (campusClassIds && !campusClassIds.some((id) => String(id) === String(req.query.classId))) {
        return res.json([]);
      }
      filter.classId = req.query.classId;
    }
    if (req.query.className) {
      filter.className = String(req.query.className).trim();
    }
    const items = await FeeStructure.find(filter).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/structures/:id', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    if (!requireCampusId(req, res)) return;
    const structureId = req.params.id;
    if (!mongoose.isValidObjectId(structureId)) {
      return res.status(400).json({ error: 'Invalid structure id' });
    }

    const existing = await FeeStructure.findOne({ _id: structureId, schoolId });
    if (!existing) {
      return res.status(404).json({ error: 'Fee structure not found' });
    }

    if (req.campusId) {
      const currentAllowed = await ensureClassAccessible(schoolId, req.campusId, existing.classId);
      if (!currentAllowed) {
        return res.status(403).json({ error: 'Fee structure not available for this campus' });
      }
    }

    const {
      name,
      totalAmount,
      academicYearId,
      classId,
      className,
      installments,
      feeHeads,
      board,
      isActive,
    } = req.body || {};

    if (typeof name !== 'undefined' && !String(name).trim()) {
      return res.status(400).json({ error: 'Structure name is required' });
    }

    if (classId && req.campusId) {
      const classAllowed = await ensureClassAccessible(schoolId, req.campusId, classId);
      if (!classAllowed) {
        return res.status(403).json({ error: 'Class not available for this campus' });
      }
    }

    const updates = {};
    if (typeof name !== 'undefined') updates.name = String(name).trim();
    if (typeof board !== 'undefined') updates.board = String(board).trim() || 'GENERAL';
    if (typeof academicYearId !== 'undefined') updates.academicYearId = academicYearId || undefined;
    if (typeof classId !== 'undefined') updates.classId = classId || undefined;
    if (typeof className !== 'undefined') updates.className = className ? String(className).trim() : undefined;
    if (typeof isActive !== 'undefined') updates.isActive = Boolean(isActive);

    let normalizedFeeHeads = null;
    if (typeof feeHeads !== 'undefined') {
      normalizedFeeHeads = normalizeFeeHeads(feeHeads);
      updates.feeHeads = normalizedFeeHeads;
    }

    let normalizedInstallments = null;
    if (typeof installments !== 'undefined') {
      normalizedInstallments = normalizeInstallments(installments);
      updates.installments = normalizedInstallments;
    }

    if (typeof totalAmount !== 'undefined' || normalizedFeeHeads) {
      const headsTotal = normalizedFeeHeads ? sumAmounts(normalizedFeeHeads) : Number(existing.totalAmount || 0);
      const total =
        Number.isFinite(Number(totalAmount)) && Number(totalAmount) >= 0
          ? Number(totalAmount)
          : headsTotal;
      if (!Number.isFinite(total) || total < 0) {
        return res.status(400).json({ error: 'Valid totalAmount is required' });
      }
      updates.totalAmount = total;
    }

    Object.assign(existing, updates);
    await existing.save();
    res.json(existing);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Unable to update structure' });
  }
});

router.delete('/structures/:id', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    if (!requireCampusId(req, res)) return;
    const structureId = req.params.id;
    if (!mongoose.isValidObjectId(structureId)) {
      return res.status(400).json({ error: 'Invalid structure id' });
    }

    const existing = await FeeStructure.findOne({ _id: structureId, schoolId });
    if (!existing) {
      return res.status(404).json({ error: 'Fee structure not found' });
    }

    if (req.campusId) {
      const currentAllowed = await ensureClassAccessible(schoolId, req.campusId, existing.classId);
      if (!currentAllowed) {
        return res.status(403).json({ error: 'Fee structure not available for this campus' });
      }
    }

    const hasInvoices = await FeeInvoice.exists({ schoolId, feeStructureId: structureId });
    if (hasInvoices) {
      return res.status(400).json({ error: 'Cannot delete structure with invoices' });
    }

    await FeeStructure.deleteOne({ _id: structureId, schoolId });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Unable to delete structure' });
  }
});

// Fee Invoices
router.post('/invoices', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    if (!requireCampusId(req, res)) return;
    const {
      studentId,
      feeStructureId,
      title,
      totalAmount,
      dueDate,
      academicYearId,
      classId,
    } = req.body || {};
    if (!studentId || !mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ error: 'Valid studentId is required' });
    }

    const student = await StudentUser.findOne({ _id: studentId, schoolId }).lean();
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    if (req.campusId && String(student.campusId || '') !== String(req.campusId)) {
      return res.status(403).json({ error: 'Student not available for this campus' });
    }

    let structure = null;
    if (feeStructureId && mongoose.isValidObjectId(feeStructureId)) {
      structure = await FeeStructure.findOne({ _id: feeStructureId, schoolId }).lean();
    }
    if (structure && req.campusId && structure.classId) {
      const campusClass = await ClassModel.findOne({
        _id: structure.classId,
        schoolId,
        campusId: req.campusId,
      })
        .select('_id')
        .lean();
      if (!campusClass) {
        return res.status(403).json({ error: 'Fee structure not available for this campus' });
      }
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
      className: student?.grade || structure?.className || '',
      section: student?.section || '',
      studentId,
      feeStructureId: structure?._id,
      title: title ? String(title).trim() : structure?.name || 'Fee Invoice',
      totalAmount: resolvedTotal,
      paidAmount: 0,
      balanceAmount: resolvedTotal,
      discountAmount: 0,
      discountNote: '',
      feeHeadsSnapshot: structure?.feeHeads || [],
      installmentsSnapshot: structure?.installments || [],
      status: 'due',
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    // Create notification if due date is within 7 days
    if (created.dueDate) {
      const daysUntilDue = Math.ceil((new Date(created.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

      if (daysUntilDue <= 7 && daysUntilDue >= 0) {
        try {
          await NotificationService.notifyFeeReminder({
            schoolId,
            campusId: req.campusId || null,
            invoice: created,
            createdBy: req.admin?.id || null
          });
        } catch (notifErr) {
          console.error('Failed to create fee notification:', notifErr);
          // Don't fail the entire request if notification fails
        }
      }
    }

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
    if (!requireCampusId(req, res)) return;
    const filter = { schoolId };
    let campusStudentIds = null;
    if (req.campusId) {
      campusStudentIds = await fetchCampusStudentIds(schoolId, req.campusId);
      if (campusStudentIds.length === 0) {
        return res.json([]);
      }
      filter.studentId = { $in: campusStudentIds };
    }
    if (req.query.studentId && mongoose.isValidObjectId(req.query.studentId)) {
      if (campusStudentIds && !campusStudentIds.some((id) => String(id) === String(req.query.studentId))) {
        return res.json([]);
      }
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
    if (!requireCampusId(req, res)) return;
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
    const hasInvoiceAccess = await ensureInvoiceCampusAccess({
      invoice,
      schoolId,
      campusId: req.campusId,
    });
    if (!hasInvoiceAccess) {
      return res.status(403).json({ error: 'Invoice not available for this campus' });
    }

    const balance = Math.max(
      0,
      Number(invoice.totalAmount || 0) - Number(invoice.discountAmount || 0) - Number(invoice.paidAmount || 0)
    );
    if (paymentAmount > balance) {
      return res.status(400).json({ error: 'Payment amount exceeds balance' });
    }

    invoice.paidAmount = Number(invoice.paidAmount || 0) + paymentAmount;
    recomputeInvoiceStatus(invoice);
    await invoice.save();

    const created = await FeePayment.create({
      schoolId,
      invoiceId: invoice._id,
      studentId: invoice.studentId,
      transactionId: buildTransactionId('ADM'),
      amount: paymentAmount,
      currency: 'INR',
      method: method || 'cash',
      notes: notes ? String(notes).trim() : undefined,
      paidOn: paidOn ? new Date(paidOn) : undefined,
      initiatedByType: 'admin',
      initiatedById: req.admin?.id || null,
      metadata: {
        source: 'admin_manual',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      payment: created,
      invoice,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/payments', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    if (!requireCampusId(req, res)) return;
    const filter = { schoolId };
    let campusStudentIds = null;
    if (req.campusId) {
      campusStudentIds = await fetchCampusStudentIds(schoolId, req.campusId);
      if (campusStudentIds.length === 0) {
        return res.json([]);
      }
      filter.studentId = { $in: campusStudentIds };
    }
    if (req.query.invoiceId && mongoose.isValidObjectId(req.query.invoiceId)) {
      filter.invoiceId = req.query.invoiceId;
    }
    const items = await FeePayment.find(filter).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/payments/:paymentId/receipt', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    if (!requireCampusId(req, res)) return;
    const paymentId = req.params.paymentId;
    if (!paymentId || !mongoose.isValidObjectId(paymentId)) {
      return res.status(400).json({ error: 'Valid paymentId is required' });
    }

    const payment = await FeePayment.findOne({ _id: paymentId, schoolId }).lean();
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    const invoice = await FeeInvoice.findOne({ _id: payment.invoiceId, schoolId }).lean();
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found for this payment' });
    }

    const hasInvoiceAccess = await ensureInvoiceCampusAccess({
      invoice,
      schoolId,
      campusId: req.campusId,
    });
    if (!hasInvoiceAccess) {
      return res.status(403).json({ error: 'Payment not available for this campus' });
    }

    const student = await StudentUser.findOne({ _id: payment.studentId, schoolId })
      .select('name grade section roll admissionNumber')
      .lean();

    res.json({
      receipt: {
        paymentId: payment._id,
        transactionId: payment.transactionId || '',
        generatedAt: new Date().toISOString(),
      },
      payment,
      invoice,
      student: student || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to load payment receipt' });
  }
});

router.post('/admin/razorpay/order', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    if (!requireCampusId(req, res)) return;

    const { invoiceId, amount, notes } = req.body || {};
    if (!invoiceId || !mongoose.isValidObjectId(invoiceId)) {
      return res.status(400).json({ error: 'Valid invoiceId is required' });
    }

    const invoice = await FeeInvoice.findOne({ _id: invoiceId, schoolId }).lean();
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const hasInvoiceAccess = await ensureInvoiceCampusAccess({
      invoice,
      schoolId,
      campusId: req.campusId,
    });
    if (!hasInvoiceAccess) {
      return res.status(403).json({ error: 'Invoice not available for this campus' });
    }

    const balance = Math.max(
      0,
      Number(invoice.totalAmount || 0) - Number(invoice.discountAmount || 0) - Number(invoice.paidAmount || 0)
    );
    if (balance <= 0) {
      return res.status(400).json({ error: 'Invoice is already paid' });
    }

    const paymentAmount = Number.isFinite(Number(amount)) ? Number(amount) : balance;
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    if (paymentAmount > balance) {
      return res.status(400).json({ error: 'Payment amount exceeds balance' });
    }

    const amountPaise = Math.round(paymentAmount * 100);
    const receipt = buildRazorpayReceipt('adminfee', invoiceId);
    const { order, keyId } = await createRazorpayOrder({
      amountPaise,
      receipt,
      notes: {
        invoiceId: String(invoiceId),
        studentId: String(invoice.studentId),
        source: 'admin',
        note: String(notes || '').trim().slice(0, 120),
      },
    });

    res.json({
      success: true,
      message: 'Razorpay order created',
      order,
      keyId,
      amount: paymentAmount,
      currency: order.currency || 'INR',
      invoiceId,
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Unable to create Razorpay order' });
  }
});

router.post('/admin/razorpay/verify', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    if (!requireCampusId(req, res)) return;

    const {
      invoiceId,
      amount,
      notes,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body || {};

    if (!invoiceId || !mongoose.isValidObjectId(invoiceId)) {
      return res.status(400).json({ error: 'Valid invoiceId is required' });
    }
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'Missing Razorpay payment details' });
    }

    const invoice = await FeeInvoice.findOne({ _id: invoiceId, schoolId });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const hasInvoiceAccess = await ensureInvoiceCampusAccess({
      invoice,
      schoolId,
      campusId: req.campusId,
    });
    if (!hasInvoiceAccess) {
      return res.status(403).json({ error: 'Invoice not available for this campus' });
    }

    const isValidSignature = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature,
    });
    if (!isValidSignature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const existingPayment = await FeePayment.findOne({
      schoolId,
      $or: [{ gatewayPaymentId: paymentId }, { gatewayOrderId: orderId }],
    }).lean();

    if (existingPayment) {
      return res.json({
        success: true,
        message: 'Payment already verified',
        payment: existingPayment,
        invoice,
      });
    }

    const paymentAmount = Number(amount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    const balance = Math.max(
      0,
      Number(invoice.totalAmount || 0) - Number(invoice.discountAmount || 0) - Number(invoice.paidAmount || 0)
    );
    if (paymentAmount > balance) {
      return res.status(400).json({ error: 'Payment amount exceeds balance' });
    }

    invoice.paidAmount = Number(invoice.paidAmount || 0) + paymentAmount;
    recomputeInvoiceStatus(invoice);
    await invoice.save();

    const payment = await FeePayment.create({
      schoolId,
      invoiceId: invoice._id,
      studentId: invoice.studentId,
      transactionId: buildTransactionId('ADM'),
      amount: paymentAmount,
      currency: 'INR',
      method: 'razorpay',
      notes: notes ? String(notes).trim() : undefined,
      paidOn: new Date(),
      initiatedByType: 'admin',
      initiatedById: req.admin?.id || null,
      gateway: 'razorpay',
      gatewayOrderId: orderId,
      gatewayPaymentId: paymentId,
      gatewaySignature: signature,
      gatewayStatus: 'captured',
      metadata: {
        source: 'admin_online',
      },
    });

    res.json({
      success: true,
      message: 'Payment verified and captured',
      payment,
      invoice,
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Unable to verify payment' });
  }
});

// Admin dashboard + CBSE support
router.get('/admin/filters', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    if (!requireCampusId(req, res)) return;
    const campusId = req.campusId || null;
    const [classDocs, sectionDocs, yearDocs] = await Promise.all([
      ClassModel.find(buildCampusFilter(schoolId, campusId)).sort({ order: 1, name: 1 }).lean(),
      Section.find(buildCampusFilter(schoolId, campusId)).sort({ name: 1 }).lean(),
      AcademicYear.find({ schoolId }).sort({ createdAt: -1 }).lean(),
    ]);

    res.json({
      classes: classDocs.map((cls) => ({
        id: cls._id,
        name: cls.name,
        academicYearId: cls.academicYearId || null,
        order: cls.order || 0,
      })),
      sections: sectionDocs.map((sec) => ({
        id: sec._id,
        name: sec.name,
        classId: sec.classId || null,
      })),
      academicYears: yearDocs.map((year) => ({
        id: year._id,
        name: year.name,
        isActive: Boolean(year.isActive),
        startDate: year.startDate || null,
        endDate: year.endDate || null,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to load filters' });
  }
});

router.get('/admin/summary', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    if (!requireCampusId(req, res)) return;

    const studentFilter = { schoolId };
    if (req.campusId) {
      studentFilter.campusId = req.campusId;
    }
    const students = await StudentUser.find(studentFilter)
      .select('name grade section roll admissionNumber')
      .lean();
    const studentIds = students.map((s) => s._id);
    const studentMap = new Map(students.map((s) => [String(s._id), s]));

    const invoiceFilter = { schoolId };
    if (req.campusId && studentIds.length === 0) {
      return res.json({
        totals: {
          totalOutstanding: 0,
          totalCollected: 0,
          totalInvoiced: 0,
          totalStudents: 0,
          overdueInvoices: 0,
        },
        enrollment: [],
        outstandingSegments: [],
        recentPayments: [],
      });
    }
    if (studentIds.length > 0) {
      invoiceFilter.studentId = { $in: studentIds };
    }
    const invoices = await FeeInvoice.find(invoiceFilter).lean();

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
        totalStudents: new Set(invoices.map((inv) => String(inv.studentId))).size,
      }
    );

    const today = new Date();
    const overdueInvoices = invoices.filter(
      (inv) => inv.dueDate && new Date(inv.dueDate) < today && Number(inv.balanceAmount || 0) > 0
    ).length;

    const classBuckets = new Map();
    invoices.forEach((inv) => {
      const student = studentMap.get(String(inv.studentId));
      const className = inv.className || student?.grade || 'Unassigned';
      if (!classBuckets.has(className)) {
        classBuckets.set(className, { students: new Set(), outstanding: 0 });
      }
      const bucket = classBuckets.get(className);
      bucket.students.add(String(inv.studentId));
      bucket.outstanding += Number(inv.balanceAmount || 0);
    });

    const enrollment = Array.from(classBuckets.entries()).map(([label, data]) => ({
      label,
      students: data.students.size,
    }));
    const totalEnrollment = enrollment.reduce((sum, row) => sum + row.students, 0) || 1;
    const enrollmentNormalized = enrollment.map((row) => ({
      ...row,
      percentage: Math.round((row.students / totalEnrollment) * 100),
    }));

    const outstandingSegments = Array.from(classBuckets.entries()).map(([label, data]) => ({
      label,
      amount: Math.round(data.outstanding),
    }));
    const totalOutstanding = outstandingSegments.reduce((sum, row) => sum + row.amount, 0) || 1;
    const outstandingNormalized = outstandingSegments.map((row) => ({
      ...row,
      percentage: Math.round((row.amount / totalOutstanding) * 100),
    }));

    const payments = await FeePayment.find(invoiceFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    const recentPayments = payments.map((payment) => {
      const student = studentMap.get(String(payment.studentId));
      return {
        studentName: student?.name || 'Student',
        className: student?.grade || '',
        section: student?.section || '',
        amount: payment.amount,
        paidOn: payment.paidOn || payment.createdAt,
        method: payment.method || 'cash',
        status: 'Paid',
      };
    });

    res.json({
      totals: {
        totalOutstanding: Math.round(totals.totalOutstanding),
        totalCollected: Math.round(totals.totalCollected),
        totalInvoiced: Math.round(totals.totalInvoiced),
        totalStudents: totals.totalStudents,
        overdueInvoices,
      },
      enrollment: enrollmentNormalized,
      outstandingSegments: outstandingNormalized,
      recentPayments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to load summary' });
  }
});

router.get('/admin/invoices', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    if (!requireCampusId(req, res)) return;

    const {
      classId,
      className,
      section,
      status,
      search,
      overdue,
      studentId,
    } = req.query || {};

    const studentFilter = { schoolId };
    if (req.campusId) {
      studentFilter.campusId = req.campusId;
    }
    let resolvedClassName = className ? String(className).trim() : '';
    if (classId && mongoose.isValidObjectId(classId)) {
      const classDoc = await ClassModel.findOne({
        _id: classId,
        schoolId,
        ...(req.campusId ? { campusId: req.campusId } : {}),
      })
        .select('name')
        .lean();
      if (!classDoc) {
        return res.json([]);
      }
      if (resolvedClassName && resolvedClassName !== classDoc.name) {
        return res.json([]);
      }
      resolvedClassName = classDoc.name;
    }
    if (resolvedClassName) {
      studentFilter.grade = resolvedClassName;
    }
    if (section) {
      studentFilter.section = String(section).trim();
    }
    if (search) {
      const q = String(search).trim();
      if (mongoose.isValidObjectId(q)) {
        studentFilter._id = q;
      } else {
        const numericRoll = Number(q);
        studentFilter.$or = [
          { name: new RegExp(q, 'i') },
          { admissionNumber: new RegExp(q, 'i') },
          ...(Number.isFinite(numericRoll) ? [{ roll: numericRoll }] : []),
        ];
      }
    }

    let studentIds = null;
    if (studentId && mongoose.isValidObjectId(studentId)) {
      const student = await StudentUser.findOne({
        _id: studentId,
        schoolId,
        ...(req.campusId ? { campusId: req.campusId } : {}),
      })
        .select('name grade section roll admissionNumber')
        .lean();
      if (!student) {
        return res.json([]);
      }
      if (resolvedClassName && String(student.grade || '') !== resolvedClassName) {
        return res.json([]);
      }
      if (section && String(student.section || '') !== String(section).trim()) {
        return res.json([]);
      }
      studentIds = [student._id];
    } else if (req.campusId || className || section || search) {
      const students = await StudentUser.find(studentFilter)
        .select('name grade section roll admissionNumber')
        .lean();
      studentIds = students.map((s) => s._id);
      if (studentIds.length === 0) {
        return res.json([]);
      }
    }

    const invoiceFilter = { schoolId };
    if (studentIds) {
      invoiceFilter.studentId = { $in: studentIds };
    }
    if (status) {
      invoiceFilter.status = String(status).trim();
    }
    if (String(overdue || '') === 'true') {
      invoiceFilter.balanceAmount = { $gt: 0 };
      invoiceFilter.dueDate = { $lt: new Date() };
    }

    const invoices = await FeeInvoice.find(invoiceFilter).sort({ createdAt: -1 }).lean();
    const uniqueStudentIds = [...new Set(invoices.map((inv) => String(inv.studentId)))];
    const students = uniqueStudentIds.length
      ? await StudentUser.find({ _id: { $in: uniqueStudentIds } })
          .select('name grade section roll admissionNumber')
          .lean()
      : [];
    const studentMap = new Map(students.map((s) => [String(s._id), s]));

    const payload = invoices.map((inv) => {
      const student = studentMap.get(String(inv.studentId));
      return {
        id: inv._id,
        invoiceId: inv._id,
        studentId: inv.studentId,
        studentName: student?.name || 'Student',
        admissionNumber: student?.admissionNumber || '',
        roll: student?.roll || '',
        classId: inv.classId || null,
        className: inv.className || student?.grade || '',
        section: inv.section || student?.section || '',
        title: inv.title,
        totalAmount: inv.totalAmount,
        paidAmount: inv.paidAmount,
        balanceAmount: inv.balanceAmount,
        status: inv.status,
        dueDate: inv.dueDate,
        updatedAt: inv.updatedAt,
      };
    });

    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to load invoices' });
  }
});

router.post('/admin/invoices/bulk', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    if (!requireCampusId(req, res)) return;

    const { classId, section, dueDate, title } = req.body || {};
    if (!classId || !mongoose.isValidObjectId(classId)) {
      return res.status(400).json({ error: 'Valid classId is required' });
    }

    const classAllowed = await ensureClassAccessible(schoolId, req.campusId, classId);
    if (!classAllowed) {
      return res.status(403).json({ error: 'Class not available for this campus' });
    }

    const classDoc = await ClassModel.findOne({ _id: classId, schoolId, campusId: req.campusId })
      .select('name')
      .lean();
    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const activeYear = await AcademicYear.findOne({ schoolId, isActive: true })
      .sort({ createdAt: -1 })
      .lean();
    if (!activeYear) {
      return res.status(400).json({ error: 'Active academic year not found' });
    }

    const structure = await FeeStructure.findOne({
      schoolId,
      classId,
      academicYearId: activeYear._id,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();
    if (!structure) {
      return res.status(400).json({ error: 'Fee structure not found for active academic year' });
    }

    const studentFilter = {
      schoolId,
      campusId: req.campusId,
      grade: classDoc.name,
      isArchived: false,
    };
    if (section) {
      studentFilter.section = String(section).trim();
    }
    const students = await StudentUser.find(studentFilter)
      .select('_id name grade section')
      .lean();
    if (students.length === 0) {
      return res.json({ createdCount: 0, skippedCount: 0, totalStudents: 0 });
    }

    const studentIds = students.map((student) => student._id);
    const existingInvoices = await FeeInvoice.find({
      schoolId,
      feeStructureId: structure._id,
      studentId: { $in: studentIds },
    })
      .select('studentId')
      .lean();
    const existingSet = new Set(existingInvoices.map((inv) => String(inv.studentId)));

    const invoicesToCreate = students
      .filter((student) => !existingSet.has(String(student._id)))
      .map((student) => ({
        schoolId,
        academicYearId: structure.academicYearId || activeYear._id,
        classId: structure.classId,
        className: student.grade || classDoc.name || structure.className || '',
        section: student.section || '',
        studentId: student._id,
        feeStructureId: structure._id,
        title: title ? String(title).trim() : structure.name || 'Fee Invoice',
        totalAmount: structure.totalAmount,
        paidAmount: 0,
        balanceAmount: structure.totalAmount,
        discountAmount: 0,
        discountNote: '',
        feeHeadsSnapshot: structure.feeHeads || [],
        installmentsSnapshot: structure.installments || [],
        status: 'due',
        dueDate: dueDate ? new Date(dueDate) : undefined,
      }));

    if (invoicesToCreate.length > 0) {
      await FeeInvoice.insertMany(invoicesToCreate);
    }

    res.json({
      createdCount: invoicesToCreate.length,
      skippedCount: students.length - invoicesToCreate.length,
      totalStudents: students.length,
      structureId: structure._id,
      className: classDoc.name,
      section: section || '',
      academicYearId: activeYear._id,
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Unable to generate invoices' });
  }
});

router.get('/admin/invoices/:id', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    if (!requireCampusId(req, res)) return;
    const invoiceId = req.params.id;
    if (!mongoose.isValidObjectId(invoiceId)) {
      return res.status(400).json({ error: 'Invalid invoiceId' });
    }

    const invoice = await FeeInvoice.findOne({ _id: invoiceId, schoolId }).lean();
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const student = await StudentUser.findOne({ _id: invoice.studentId, schoolId })
      .select('name grade section roll admissionNumber guardianName guardianPhone guardianEmail mobile email campusId')
      .lean();
    if (req.campusId && (!student || String(student.campusId || '') !== String(req.campusId))) {
      return res.status(403).json({ error: 'Invoice not available for this campus' });
    }

    const payments = await FeePayment.find({ schoolId, invoiceId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      invoice,
      student,
      payments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to load invoice detail' });
  }
});

router.post('/admin/discount', adminAuth, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    if (!requireCampusId(req, res)) return;
    const { invoiceId, amount, note } = req.body || {};
    if (!invoiceId || !mongoose.isValidObjectId(invoiceId)) {
      return res.status(400).json({ error: 'Valid invoiceId is required' });
    }
    const discountAmount = Number(amount);
    if (!Number.isFinite(discountAmount) || discountAmount < 0) {
      return res.status(400).json({ error: 'Valid discount amount is required' });
    }

    const invoice = await FeeInvoice.findOne({ _id: invoiceId, schoolId });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    if (discountAmount > Number(invoice.totalAmount || 0)) {
      return res.status(400).json({ error: 'Discount cannot exceed total amount' });
    }

    invoice.discountAmount = discountAmount;
    invoice.discountNote = String(note || '').trim();
    recomputeInvoiceStatus(invoice);
    await invoice.save();

    res.json({ invoice });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Unable to apply discount' });
  }
});

// Parent fees (view + pay)
router.get('/parent/children', authParent, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const parent = await ParentUser.findById(req.user.id)
      .select('childrenIds children schoolId campusId')
      .lean();
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    const schoolId = parent.schoolId || req.schoolId || null;
    if (!schoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }

    const campusId = parent.campusId || req.campusId || null;
    const students = await resolveParentStudents({ parent, schoolId, campusId });
    const linkedStudents = students.map((student) => ({
      id: student._id,
      name: student.name || 'Student',
      grade: student.grade || '',
      section: student.section || '',
      linked: true,
    }));

    if (linkedStudents.length > 0) {
      return res.json({ children: linkedStudents });
    }

    const fallbackNames = Array.isArray(parent.children)
      ? parent.children.map(normalizeName).filter(Boolean)
      : [];
    const fallbackChildren = fallbackNames.map((name) => ({
      id: null,
      name,
      grade: '',
      section: '',
      linked: false,
    }));

    return res.json({ children: fallbackChildren });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to load children' });
  }
});

router.get('/parent/invoices', authParent, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const parent = await ParentUser.findById(req.user.id)
      .select('childrenIds children schoolId campusId')
      .lean();
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    const schoolId = parent.schoolId || req.schoolId || null;
    if (!schoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }

    const { studentId } = req.query || {};
    if (!studentId || !mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ error: 'Valid studentId is required' });
    }

    const campusId = parent.campusId || req.campusId || null;
    const students = await resolveParentStudents({ parent, schoolId, campusId });
    const student = students.find((item) => String(item._id) === String(studentId));
    if (!student) {
      return res.status(403).json({ error: 'Student not linked to this parent' });
    }

    const invoices = await FeeInvoice.find({
      schoolId,
      studentId,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (invoices.length === 0) {
      return res.json({ student, invoices: [], paymentsByInvoice: {} });
    }

    const invoiceIds = invoices.map((invoice) => invoice._id);
    const payments = await FeePayment.find({
      schoolId,
      invoiceId: { $in: invoiceIds },
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      student,
      invoices,
      paymentsByInvoice: buildPaymentsByInvoice(payments),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to load invoices' });
  }
});

router.post('/parent/razorpay/order', authParent, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const parent = await ParentUser.findById(req.user.id)
      .select('childrenIds children schoolId campusId')
      .lean();
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    const schoolId = parent.schoolId || req.schoolId || null;
    if (!schoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }

    const { invoiceId, amount } = req.body || {};
    if (!invoiceId || !mongoose.isValidObjectId(invoiceId)) {
      return res.status(400).json({ error: 'Valid invoiceId is required' });
    }

    const invoice = await FeeInvoice.findOne({ _id: invoiceId, schoolId }).lean();
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const campusId = parent.campusId || req.campusId || null;
    const students = await resolveParentStudents({ parent, schoolId, campusId });
    const isLinkedStudent = students.some((item) => String(item._id) === String(invoice.studentId));
    if (!isLinkedStudent) {
      return res.status(403).json({ error: 'Student not linked to this parent' });
    }

    const balance = Math.max(
      0,
      Number(invoice.totalAmount || 0) - Number(invoice.discountAmount || 0) - Number(invoice.paidAmount || 0)
    );
    if (balance <= 0) {
      return res.status(400).json({ error: 'Invoice is already paid' });
    }

    const paymentAmount = Number.isFinite(Number(amount)) ? Number(amount) : balance;
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    if (paymentAmount > balance) {
      return res.status(400).json({ error: 'Payment amount exceeds balance' });
    }

    const amountPaise = Math.round(paymentAmount * 100);
    const receipt = buildRazorpayReceipt('parentfee', invoiceId);
    const { order, keyId } = await createRazorpayOrder({
      amountPaise,
      receipt,
      notes: {
        invoiceId: String(invoiceId),
        studentId: String(invoice.studentId),
      },
    });

    res.json({
      success: true,
      message: 'Razorpay order created',
      order,
      keyId,
      amount: paymentAmount,
      currency: order.currency || 'INR',
      invoiceId,
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Unable to create Razorpay order' });
  }
});

router.post('/parent/razorpay/verify', authParent, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const parent = await ParentUser.findById(req.user.id)
      .select('childrenIds children schoolId campusId')
      .lean();
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    const schoolId = parent.schoolId || req.schoolId || null;
    if (!schoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }

    const {
      invoiceId,
      amount,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body || {};

    if (!invoiceId || !mongoose.isValidObjectId(invoiceId)) {
      return res.status(400).json({ error: 'Valid invoiceId is required' });
    }
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'Missing Razorpay payment details' });
    }

    const invoice = await FeeInvoice.findOne({ _id: invoiceId, schoolId });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const campusId = parent.campusId || req.campusId || null;
    const students = await resolveParentStudents({ parent, schoolId, campusId });
    const isLinkedStudent = students.some((item) => String(item._id) === String(invoice.studentId));
    if (!isLinkedStudent) {
      return res.status(403).json({ error: 'Student not linked to this parent' });
    }

    const isValidSignature = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature,
    });
    if (!isValidSignature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const existingPayment = await FeePayment.findOne({
      schoolId,
      $or: [{ gatewayPaymentId: paymentId }, { gatewayOrderId: orderId }],
    }).lean();

    if (existingPayment) {
      return res.json({
        success: true,
        message: 'Payment already verified',
        payment: existingPayment,
        invoice,
      });
    }

    const paymentAmount = Number(amount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    const balance = Math.max(
      0,
      Number(invoice.totalAmount || 0) - Number(invoice.discountAmount || 0) - Number(invoice.paidAmount || 0)
    );
    if (paymentAmount > balance) {
      return res.status(400).json({ error: 'Payment amount exceeds balance' });
    }

    invoice.paidAmount = Number(invoice.paidAmount || 0) + paymentAmount;
    recomputeInvoiceStatus(invoice);
    await invoice.save();

    const payment = await FeePayment.create({
      schoolId,
      invoiceId: invoice._id,
      studentId: invoice.studentId,
      transactionId: buildTransactionId('PRT'),
      amount: paymentAmount,
      currency: 'INR',
      method: 'razorpay',
      paidOn: new Date(),
      initiatedByType: 'parent',
      initiatedById: parent._id,
      gateway: 'razorpay',
      gatewayOrderId: orderId,
      gatewayPaymentId: paymentId,
      gatewaySignature: signature,
      gatewayStatus: 'captured',
      metadata: {
        source: 'parent_online',
      },
    });

    res.json({
      success: true,
      message: 'Payment verified and captured',
      payment,
      invoice,
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Unable to verify payment' });
  }
});

// Student fees (view-only)
router.get('/student/invoices', authStudent, async (req, res) => {
  // #swagger.tags = ['Fees']
  try {
    const schoolId = req.schoolId || null;
    if (!schoolId) {
      return res.status(400).json({ error: 'schoolId is required' });
    }

    const studentId = req.user.id;
    const invoices = await FeeInvoice.find({
      schoolId,
      studentId,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (invoices.length === 0) {
      return res.json({ invoices: [], paymentsByInvoice: {} });
    }

    const invoiceIds = invoices.map((invoice) => invoice._id);
    const payments = await FeePayment.find({
      schoolId,
      invoiceId: { $in: invoiceIds },
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      invoices,
      paymentsByInvoice: buildPaymentsByInvoice(payments),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to load invoices' });
  }
});

module.exports = router;
