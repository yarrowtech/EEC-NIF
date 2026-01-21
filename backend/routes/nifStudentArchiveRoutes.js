// backend/routes/nifStudentArchiveRoutes.js
const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");

const NifArchivedStudent = require("../models/NifArchivedStudent");

const buildSchoolFilter = (req) => {
  if (!req.schoolId) return {};
  return {
    $or: [
      { schoolId: req.schoolId },
      { schoolId: { $exists: false } },
      { schoolId: null },
    ],
  };
};

router.use(adminAuth);

/**
 * GET /api/nif/students/archived
 * List archived students (for ArchivedStudents.jsx table)
 */
router.get("/", async (req, res) => {
  // #swagger.tags = ['NIF Student Archive']
  try {
    console.log("Fetching archived students...");
    const archived = await NifArchivedStudent.find(buildSchoolFilter(req))
      .sort({ archivedAt: -1 })
      .lean();

    console.log(`Found ${archived.length} archived students`);
    res.json(archived);
  } catch (err) {
    console.error("Error fetching archived students", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/nif/students/archived/export
 * Download CSV of archived students
 */
router.get("/export", async (req, res) => {
  // #swagger.tags = ['NIF Student Archive']
  try {
    const archived = await NifArchivedStudent.find(buildSchoolFilter(req)).sort({
      archivedAt: -1,
    });

    const headers = [
      "Student Name",
      "Roll",
      "Grade",
      "Batch",
      "Course",
      "Passed Out Year",
      "Total Fee",
      "Total Paid",
      "Total Due",
      "Archived At",
    ];

    const csvRows = [];
    csvRows.push(headers.join(","));

    archived.forEach((s) => {
      const fs = s.feeSummary || {};
      const row = [
        s.studentName || "",
        s.roll || "",
        s.grade || "",
        s.batchCode || "",
        s.course || "",
        s.passedOutYear || "",
        fs.totalFee ?? "",
        fs.totalPaid ?? "",
        fs.totalDue ?? "",
        s.archivedAt ? s.archivedAt.toISOString() : "",
      ].map((val) => {
        const str = String(val ?? "");
        if (str.includes(",") || str.includes("\n") || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });

      csvRows.push(row.join(","));
    });

    const csv = csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=archived_students.csv"
    );
    res.send(csv);
  } catch (err) {
    console.error("Error exporting archived students CSV", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * (Optional) PUT /api/nif/students/archived/:id/restore
 * Restore a student from archive back to active (for future use)
 */
router.put("/:id/restore", async (req, res) => {
  // #swagger.tags = ['NIF Student Archive']
  try {
    // Implementation in future if you want restore feature
    return res.status(501).json({ message: "Restore not implemented yet" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
