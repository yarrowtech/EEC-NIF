// const express = require("express");
// const router = express.Router();
// const NifStudent = require("../models/NifStudent");
// const adminAuth = require("../middleware/adminAuth");

// // POST /api/nif/students (Add NIF student)
// router.post("/students", adminAuth, async (req, res) => {
//   try {
//     const nifStudent = new NifStudent(req.body);
//     const saved = await nifStudent.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     console.error("NIF student create error:", err);
//     res.status(400).json({ message: "Failed to create NIF student", error: err.message });
//   }
// });

// // GET /api/nif/students (List NIF students)
// router.get("/students", adminAuth, async (req, res) => {
//   try {
//     const students = await NifStudent.find().sort({ createdAt: -1 });
//     res.json(students);
//   } catch (err) {
//     console.error("NIF students fetch error:", err);
//     res.status(500).json({ message: "Failed to fetch NIF students" });
//   }
// });

// module.exports = router;
// backend/routes/nifStudentRoute.js
const express = require('express');
const router = express.Router();
const NifStudent = require('../models/NifStudent');
const NifFeeRecord = require('../models/NifFeeRecord');
const adminAuth = require('../middleware/adminAuth');

// helper to map grade string -> normalized program info
function mapGradeToProgramInfo(grade) {
  // grade examples from your Students.jsx:
  // "Fashion Design - 1 year Certificate Program"
  // "Fashion Design - 2 year Advanced Certificate"
  // "Fashion Design - 3 year B Voc Program"
  // "Fashion Design - 4 year B Des Program"
  // "Fashion Design - 2 Year M Voc program"
  if (!grade) return null;
  const lower = grade.toLowerCase();

  let programType = 'ADV_CERT';
  let course = lower.includes('interior') ? 'Interior Design' : 'Fashion Design';
  let durationYears = 1;
  let currentYear = 1;

  if (lower.includes('1 year')) durationYears = 1;
  if (lower.includes('2 year')) durationYears = 2;
  if (lower.includes('3 year')) durationYears = 3;
  if (lower.includes('4 year')) durationYears = 4;

  if (lower.includes('b voc')) programType = 'B_VOC';
  else if (lower.includes('m voc')) programType = 'M_VOC';
  else programType = 'ADV_CERT';

  return {
    programType,
    course,
    durationYears,
    currentYear: 1, // always start at Year 1; can update later
  };
}

// POST /api/nif/students  (Add NIF student from Students.jsx)
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
      grade,
      address,
      pincode,
      academicYear,
    } = req.body;

    const mapped = mapGradeToProgramInfo(grade);
    if (!mapped) {
      return res.status(400).json({ message: 'Invalid program/grade' });
    }

    const student = await NifStudent.create({
      name,
      email,
      mobile,
      dob,
      gender,
      roll,
      section,
      program: grade,
      programType: mapped.programType,
      course: mapped.course,
      durationYears: mapped.durationYears,
      currentYear: mapped.currentYear,
      academicYear: academicYear || '2025-26',
      address,
      pincode,
    });

    // Auto create fee record for currentYear
    await NifFeeRecord.createForStudent({
      student,
      yearNumber: mapped.currentYear,
    });

    res.status(201).json(student);
  } catch (err) {
    console.error('Create NIF student error:', err);
    res.status(400).json({ message: err.message });
  }
});

// GET /api/nif/students?programType=&course=&year=
router.get('/students', adminAuth, async (req, res) => {
  try {
    const { programType, course, year } = req.query;
    const query = {};
    if (programType) query.programType = programType;
    if (course) query.course = course;
    if (year) query.currentYear = Number(year);

    const students = await NifStudent.find(query).lean();
    res.json(students);
  } catch (err) {
    console.error('List NIF students error:', err);
    res.status(500).json({ message: 'Failed to fetch NIF students' });
  }
});

module.exports = router;
