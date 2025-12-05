// routes/nifStudentRoute.js
const express = require("express");
const router = express.Router();

const NifStudent = require("../models/NifStudent");

/**
 * GET /api/nif/students
 * List all NIF students
 */
router.get("/", async (req, res) => {
  try {
    const students = await NifStudent.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    console.error("Error fetching NIF students:", err);
    res.status(500).json({ message: "Failed to fetch NIF students" });
  }
});

/**
 * POST /api/nif/students
 * Create single NIF student (from form)
 */
router.post("/", async (req, res) => {
  try {
    const payload = {
      ...req.body,
      source: req.body.source || "manual",
    };

    if (!payload.name || !payload.mobile) {
      return res
        .status(400)
        .json({ message: "Name and mobile are required." });
    }

    const student = await NifStudent.create(payload);
    res.status(201).json(student);
  } catch (err) {
    console.error("Error creating NIF student:", err);
    res.status(400).json({
      message: err.message || "Invalid data",
    });
  }
});

/**
 * POST /api/nif/students/bulk
 * Bulk import NIF students
 * Body: { students: [ {...}, {...} ] }
 */
router.post("/bulk", async (req, res) => {
  try {
    const { students } = req.body || {};
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: "No students provided" });
    }

    let imported = 0;
    let failed = 0;
    const errors = [];
    const docsToInsert = [];

    for (const row of students) {
      try {
        if (!row.name || !row.mobile) {
          failed++;
          errors.push({ row, reason: "Missing name or mobile" });
          continue;
        }

        docsToInsert.push({
          ...row,
          source: "bulk",
        });
        imported++;
      } catch (e) {
        failed++;
        errors.push({ row, reason: e.message });
      }
    }

    if (docsToInsert.length) {
      await NifStudent.insertMany(docsToInsert);
    }

    res.json({ imported, failed, errors });
  } catch (err) {
    console.error("Bulk import error:", err);
    res.status(500).json({
      message: "Bulk import failed",
      details: err.message,
    });
  }
});

module.exports = router;
