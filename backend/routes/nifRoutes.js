// backend/routes/nifRoutes.js
const express = require('express');
const router = express.Router();

const NifStudent = require('../models/NifStudent');
const NifFeeRecord = require('../models/NifFeeRecord');
const adminAuth = require('../middleware/adminAuth');

// Map your "grade" string -> normalized program info
function mapGradeToProgramInfo(grade) {
  if (!grade) return null;

  const isInterior = grade.toLowerCase().includes('interior');
  const course = isInterior ? 'Interior Design' : 'Fashion Design';

  let programType = 'ADV_CERT';
  let durationYears = 1;

  if (grade.includes('1 year Certificate')) {
    programType = 'ADV_CERT';
    durationYears = 1;
  } else if (grade.includes('2 year Advanced Certificate')) {
    programType = 'ADV_CERT';
    durationYears = 2;
  } else if (grade.includes('3 year B Voc')) {
    programType = 'B_VOC';
    durationYears = 3;
  } else if (grade.includes('4 year B Des')) {
    // If you later add exact B.Des fees, adjust programType
    programType = 'B_VOC'; // TEMP mapping
    durationYears = 4;
  } else if (grade.includes('2 Year M Voc')) {
    programType = 'M_VOC';
    durationYears = 2;
  }

  return {
    programType,
    course,
    durationYears,
    currentYear: 1,
  };
}

/* ========== 1) ADD NIF STUDENT + CREATE YEAR-1 FEE ========== */
// POST /api/nif/students
router.post('/students', adminAuth, async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      dob,
      gender,
      roll,
      section,
      grade, // this is what your frontend calls "grade"
      address,
      pincode,
      academicYear,
    } = req.body;

    const map = mapGradeToProgramInfo(grade);
    if (!map) {
      return res.status(400).json({ message: 'Invalid NIF program selection' });
    }

    const student = await NifStudent.create({
      name,
      email,
      mobile,
      dob,
      gender,
      roll,
      section: section || 'A',
      program: grade,
      programType: map.programType,
      course: map.course,
      durationYears: map.durationYears,
      currentYear: map.currentYear,
      academicYear: academicYear || '2025-26',
      address,
      pincode,
    });

    // Year 1 fee record
    await NifFeeRecord.createForStudentYear(student, map.currentYear);

    res.status(201).json(student.toJSON());
  } catch (err) {
    console.error('NIF student create error:', err);
    res.status(400).json({ message: err.message });
  }
});

/* ========== 2) LIST NIF STUDENTS (for Student Management UI) ========== */
// GET /api/nif/students
router.get('/students', adminAuth, async (req, res) => {
  try {
    const students = await NifStudent.find().lean();
    const mapped = students.map((s) => ({
      ...s,
      id: s._id, // so your frontend can use student.id
    }));
    res.json(mapped);
  } catch (err) {
    console.error('NIF students list error:', err);
    res.status(500).json({ message: 'Failed to fetch NIF students' });
  }
});

/* ========== 3) LIST FEE RECORDS (for Fees Collection UI) ========== */
// GET /api/nif/fees?programType=ADV_CERT&course=Fashion%20Design&year=1
router.get('/fees', adminAuth, async (req, res) => {
  try {
    const { programType, course, year } = req.query;
    if (!programType || !course || !year) {
      return res
        .status(400)
        .json({ message: 'programType, course, year are required' });
    }

    const yearNumber = Number(year);

    const records = await NifFeeRecord.find({
      programType,
      course,
      yearNumber,
    })
      .populate('student')
      .lean();

    const result = records.map((r) => ({
      feeRecordId: r._id,
      studentId: r.student._id,
      name: r.student.name,
      roll: r.student.roll,
      program: r.student.program,
      section: r.student.section,
      academicYear: r.academicYear,
      totalFee: r.totalFee,
      paidAmount: r.paidAmount,
      dueAmount: r.dueAmount,
      lastPayment: r.lastPayment,
      status: r.status,
    }));

    res.json(result);
  } catch (err) {
    console.error('NIF fees list error:', err);
    res.status(500).json({ message: 'Failed to fetch NIF fees' });
  }
});

/* ========== 4) COLLECT FEES ========== */
// POST /api/nif/fees/collect/:id
router.post('/fees/collect/:id', adminAuth, async (req, res) => {
  try {
    const { amount, method } = req.body;
    const feeRecord = await NifFeeRecord.findById(req.params.id);
    if (!feeRecord) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    const amt = Number(amount);
    if (!amt || amt <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    if (amt > feeRecord.dueAmount) {
      return res.status(400).json({ message: 'Amount exceeds due' });
    }

    feeRecord.paidAmount += amt;
    feeRecord.dueAmount -= amt;
    feeRecord.lastPayment = new Date();
    feeRecord.status = feeRecord.dueAmount === 0 ? 'paid' : 'partial';
    feeRecord.payments.push({
      amount: amt,
      method: method || 'cash',
    });

    await feeRecord.save();
    res.json(feeRecord.toJSON());
  } catch (err) {
    console.error('NIF fee collect error:', err);
    res.status(500).json({ message: 'Failed to collect payment' });
  }
});

module.exports = router;
