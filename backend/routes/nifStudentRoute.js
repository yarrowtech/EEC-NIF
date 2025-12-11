
// // backend/routes/nifStudentRoute.js
// const express = require("express");
// const mongoose = require("mongoose");
// const router = express.Router();

// const NifStudent = require("../models/NifStudent");
// // const authAnyUser = require("../middleware/authAnyUser"); // optional

// /* ---------------------- Utils ---------------------- */
// const isISODate = (s) =>
//   typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

// const toDate = (v) => {
//   if (v instanceof Date) return v;
//   if (typeof v === "string" && isISODate(v)) return new Date(v);
//   const d = new Date(v);
//   return isNaN(d.getTime()) ? null : d;
// };

// const REQUIRED = [
//   "name",
//   "roll",
//   "grade",
//   "section",
//   "gender",
//   "mobile",
//   "email",
//   "dob",
// ];

// /* ====================================================
//    LIST / SEARCH
//    GET /api/nif/students?q=...
// ==================================================== */
// router.get("/", async (req, res, next) => {
//   try {
//     const q = (req.query.q || "").trim();

//     const filter = q
//       ? {
//           $or: [
//             { name: { $regex: q, $options: "i" } },
//             { roll: { $regex: q, $options: "i" } },
//             { email: { $regex: q, $options: "i" } },
//           ],
//         }
//       : {};

//     const students = await NifStudent.find(filter)
//       .sort({ createdAt: -1 })
//       .lean();

//     res.json(students);
//   } catch (err) {
//     next(err);
//   }
// });

// /* ====================================================
//    SINGLE REGISTER (for Add Student form)
//    POST /api/nif/students/register
// ==================================================== */
// router.post("/register", async (req, res, next) => {
//   try {
//     const payload = { ...(req.body || {}) };

//     // Required fields check
//     for (const f of REQUIRED) {
//       if (!payload[f] || String(payload[f]).trim() === "") {
//         return res.status(400).json({ message: `Missing field: ${f}` });
//       }
//     }

//     const dob = toDate(payload.dob);
//     if (!dob) {
//       return res
//         .status(400)
//         .json({ message: "Invalid dob (use YYYY-MM-DD)" });
//     }
//     payload.dob = dob;

//     payload.email = payload.email.toLowerCase().trim();

//     // Unique roll / email
//     const conflict = await NifStudent.findOne({
//       $or: [{ roll: payload.roll }, { email: payload.email }],
//     }).lean();
//     if (conflict) {
//       return res
//         .status(409)
//         .json({ message: "Student with same roll or email exists" });
//     }

//     const created = await NifStudent.create(payload);
//     res.status(201).json({ id: created._id });
//   } catch (err) {
//     if (err?.code === 11000) {
//       return res.status(409).json({
//         message: "Duplicate key",
//         key: err.keyPattern,
//         value: err.keyValue,
//       });
//     }
//     next(err);
//   }
// });

// /* ====================================================
//    BULK IMPORT + CSV TEMPLATE
//    POST /api/nif/students/bulk
//    GET  /api/nif/students/csv-template  (optional)
// ==================================================== */
// router.post("/bulk", async (req, res, next) => {
//   try {
//     const items = Array.isArray(req.body?.students) ? req.body.students : [];
//     if (!items.length) {
//       return res.status(400).json({ message: "Provide students array" });
//     }

//     const prepared = [];
//     const errors = [];

//     for (let i = 0; i < items.length; i++) {
//       const s = items[i] || {};
//       const missing = REQUIRED.filter(
//         (k) => !s[k] || String(s[k]).trim() === ""
//       );
//       if (missing.length) {
//         errors.push({ index: i, message: `Missing: ${missing.join(", ")}` });
//         continue;
//       }

//       const dob = toDate(s.dob);
//       if (!dob) {
//         errors.push({ index: i, message: "Invalid dob" });
//         continue;
//       }

//       prepared.push({
//         name: String(s.name).trim(),
//         roll: String(s.roll).trim(),
//         grade: String(s.grade).trim(),
//         section: String(s.section).trim(),
//         gender: String(s.gender).trim(),
//         mobile: String(s.mobile).trim(),
//         email: String(s.email).toLowerCase().trim(),
//         address: (s.address || "").trim(),
//         dob,
//         pincode: (s.pincode || "").trim(),
//         course: (s.course || "").trim(),
//         status:
//           s.status &&
//           ["Active", "Inactive", "Alumni", "Dropped"].includes(s.status)
//             ? s.status
//             : "Active",
//       });
//     }

//     let inserted = 0;
//     try {
//       if (prepared.length) {
//         const result = await NifStudent.insertMany(prepared, {
//           ordered: false,
//         });
//         inserted = result.length;
//       }
//     } catch (e) {
//       if (e?.writeErrors?.length) {
//         inserted =
//           (e.insertedDocs || []).length ||
//           Math.max(0, prepared.length - e.writeErrors.length);

//         e.writeErrors.forEach((we) => {
//           errors.push({
//             index: we.index,
//             message: we.errmsg || "Duplicate/validation error",
//           });
//         });
//       } else {
//         throw e;
//       }
//     }

//     res.json({ imported: inserted, failed: errors.length, errors });
//   } catch (err) {
//     next(err);
//   }
// });

// router.get("/csv-template", (_req, res) => {
//   const headers = [
//     "name",
//     "roll",
//     "grade",
//     "section",
//     "gender",
//     "mobile",
//     "email",
//     "dob",
//     "address",
//     "pincode",
//     "course",
//     "status",
//   ];
//   res.setHeader("Content-Type", "text/csv");
//   res.send(headers.join(",") + "\n");
// });

// /* ====================================================
//    READ ONE / UPDATE / DELETE
//    GET    /api/nif/students/:id
//    PATCH  /api/nif/students/:id
//    DELETE /api/nif/students/:id
// ==================================================== */
// router.get("/:id", async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.isValidObjectId(id))
//       return res.status(400).json({ message: "Invalid id" });

//     const doc = await NifStudent.findById(id).lean();
//     if (!doc) return res.status(404).json({ message: "Not found" });

//     res.json(doc);
//   } catch (err) {
//     next(err);
//   }
// });

// router.patch("/:id", async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.isValidObjectId(id))
//       return res.status(400).json({ message: "Invalid id" });

//     const updates = { ...(req.body || {}) };

//     if (updates.dob) {
//       const d = toDate(updates.dob);
//       if (!d) return res.status(400).json({ message: "Invalid dob" });
//       updates.dob = d;
//     }

//     if (updates.email) {
//       updates.email = updates.email.toLowerCase().trim();
//     }

//     if (updates.roll || updates.email) {
//       const or = [];
//       if (updates.roll) or.push({ roll: updates.roll });
//       if (updates.email) or.push({ email: updates.email });

//       if (or.length) {
//         const conflict = await NifStudent.findOne({
//           _id: { $ne: id },
//           $or: or,
//         }).lean();

//         if (conflict) {
//           return res
//             .status(409)
//             .json({ message: "Student with same roll or email exists" });
//         }
//       }
//     }

//     const updated = await NifStudent.findByIdAndUpdate(id, updates, {
//       new: true,
//       runValidators: true,
//     }).lean();

//     if (!updated) return res.status(404).json({ message: "Not found" });

//     res.json(updated);
//   } catch (err) {
//     if (err?.code === 11000) {
//       return res.status(409).json({
//         message: "Duplicate key",
//         key: err.keyPattern,
//         value: err.keyValue,
//       });
//     }
//     next(err);
//   }
// });

// router.delete("/:id", async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.isValidObjectId(id))
//       return res.status(400).json({ message: "Invalid id" });

//     const deleted = await NifStudent.findByIdAndDelete(id).lean();
//     if (!deleted) return res.status(404).json({ message: "Not found" });

//     res.json({ ok: true });
//   } catch (err) {
//     next(err);
//   }
// });

// /* ====================================================
//    ATTENDANCE
//    POST /api/nif/students/:id/attendance
//    GET  /api/nif/students/:id/attendance
// ==================================================== */
// router.post("/:id/attendance", async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.isValidObjectId(id))
//       return res.status(400).json({ message: "Invalid id" });

//     const { status, date, remarks } = req.body || {};
//     if (!["present", "absent", "leave"].includes(status)) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     const d = toDate(date || new Date());
//     if (!d) return res.status(400).json({ message: "Invalid date" });

//     const start = new Date(d);
//     start.setHours(0, 0, 0, 0);
//     const end = new Date(d);
//     end.setHours(23, 59, 59, 999);

//     const student = await NifStudent.findById(id);
//     if (!student) return res.status(404).json({ message: "Not found" });

//     student.attendance = (student.attendance || []).filter(
//       (a) => !(a.date >= start && a.date <= end)
//     );

//     student.attendance.push({
//       date: start,
//       status,
//       remarks: remarks || "",
//       markedBy: req.user?._id,
//     });

//     await student.save();

//     res.status(201).json({ ok: true, attendance: student.attendance });
//   } catch (err) {
//     next(err);
//   }
// });

// router.get("/:id/attendance", async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.isValidObjectId(id))
//       return res.status(400).json({ message: "Invalid id" });

//     const from = req.query.from ? toDate(req.query.from) : null;
//     const to = req.query.to ? toDate(req.query.to) : null;
//     if (req.query.from && !from)
//       return res.status(400).json({ message: "Invalid from" });
//     if (req.query.to && !to)
//       return res.status(400).json({ message: "Invalid to" });

//     const student = await NifStudent.findById(id).lean();
//     if (!student) return res.status(404).json({ message: "Not found" });

//     let result = student.attendance || [];
//     if (from) result = result.filter((a) => new Date(a.date) >= from);
//     if (to) result = result.filter((a) => new Date(a.date) <= to);

//     res.json(result);
//   } catch (err) {
//     next(err);
//   }
// });

// module.exports = router;



// backend/routes/nifStudentRoute.js
const express = require("express");
const router = express.Router();

const NifStudent = require("../models/NifStudent");
const NifArchivedStudent = require("../models/NifArchivedStudent");
const NifFeeRecord = require("../models/NifFeeRecord");

/**
 * GET /api/nif/students
 * Return only NON-ARCHIVED students for Student Management page
 */
router.get("/", async (req, res) => {
  try {
    const { q } = req.query || {};

    const baseFilter = {
      $or: [{ isArchived: { $exists: false } }, { isArchived: false }],
    };

    const filter = { ...baseFilter };

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      // search by name, roll, email, mobile, course, batch, etc.
      filter.$and = [
        {
          $or: [
            { name: regex },
            { email: regex },
            { mobile: regex },
            { roll: regex },
            { grade: regex },
            { batchCode: regex },
            { course: regex },
          ],
        },
      ];
    }

    const students = await NifStudent.find(filter).sort({ createdAt: -1 });

    res.json(students);
  } catch (err) {
    console.error("Error fetching NIF students:", err);
    res.status(500).json({ message: "Failed to fetch NIF students" });
  }
});

/**
 * POST /api/nif/students
 * Create a new student (used by Add Student modal in Students.jsx)
 */
router.post("/", async (req, res) => {
  try {
    const payload = {
      ...(req.body || {}),
      source: req.body?.source || "manual",
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
 * Used by CSV import in Students.jsx
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
      } catch (err) {
        failed++;
        errors.push({
          row,
          reason: err.message || "Validation failed",
        });
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

/**
 * PUT /api/nif/students/:id/archive
 * Archive one student (called from Students.jsx handleArchiveStudent)
 */
router.put("/:id/archive", async (req, res) => {
  try {
    const { id } = req.params;

    const student = await NifStudent.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.isArchived) {
      return res.status(400).json({ message: "Student already archived" });
    }

    // Collect fee records snapshot if using NifFeeRecord
    const feeRecords = await NifFeeRecord.find({ studentId: id }).lean();

    const totalPaid = feeRecords.reduce(
      (sum, r) => sum + (r.paidAmount || 0),
      0
    );
    const totalFee = feeRecords.reduce(
      (sum, r) => sum + (r.totalFee || 0),
      0
    );
    const totalDue = totalFee - totalPaid;

    const now = new Date();

    // Create archive document
    await NifArchivedStudent.create({
      originalStudentId: student._id,
      studentName: student.name,
      email: student.email,
      mobile: student.mobile,
      gender: student.gender,
      dob: student.dob,

      roll: student.roll,
      grade: student.grade,
      section: student.section,
      batchCode: student.batchCode,
      course: student.course,
      courseId: student.courseId,
      duration: student.duration,
      admissionDate: student.admissionDate,

      archiveStatus: "passed",
      passedOutYear: student.passedOutYear || String(now.getFullYear()),
      archivedBy: "admin", // later use req.user?.name

      feeSummary: {
        totalFee,
        totalPaid,
        totalDue,
      },
      feeRecords,
      snapshot: student.toObject(),
      archivedAt: now,
    });

    // Mark original as archived
    student.isArchived = true;
    student.archivedAt = now;
    if (!student.passedOutYear) {
      student.passedOutYear = String(now.getFullYear());
    }
    await student.save();

    res.json({ message: "Student archived successfully" });
  } catch (err) {
    console.error("Error archiving student", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
