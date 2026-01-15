
// backend/routes/nifStudentRoute.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const NifStudent = require("../models/NifStudent");
// const authAnyUser = require("../middleware/authAnyUser"); // optional

/* ---------------------- Utils ---------------------- */                                                                                                                             
const isISODate = (s) =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

const toDate = (v) => {
  if (v instanceof Date) return v;
  if (typeof v === "string" && isISODate(v)) return new Date(v);
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

// Match the NifStudent model required fields
const REQUIRED = [
  "name",
  "mobile",
  "gender",
  "batchCode",
  "admissionDate",
  "roll",
  "section",
  "course",
];

/* ====================================================
   LIST / SEARCH
   GET /api/nif/students?q=...
==================================================== */
router.get("/", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();

    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { roll: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const students = await NifStudent.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json(students);
  } catch (err) {
    next(err);
  }
});

/* ====================================================
   SINGLE REGISTER (for Add Student form)
   POST /api/nif/students/register
==================================================== */
router.post("/register", async (req, res, next) => {
  try {
    const payload = { ...(req.body || {}) };

    // Required fields check
    for (const f of REQUIRED) {
      if (!payload[f] || String(payload[f]).trim() === "") {
        return res.status(400).json({ message: `Missing field: ${f}` });
      }
    }

    // Parse dates
    const admissionDate = toDate(payload.admissionDate);
    if (!admissionDate) {
      return res.status(400).json({ message: "Invalid admissionDate (use YYYY-MM-DD)" });
    }
    payload.admissionDate = admissionDate;

    if (payload.dob) {
      const dob = toDate(payload.dob);
      if (dob) {
        payload.dob = dob;
      }
    }

    if (payload.email) {
      payload.email = payload.email.toLowerCase().trim();
    }

    // Normalize gender to lowercase
    if (payload.gender) {
      payload.gender = payload.gender.toLowerCase().trim();
    }

    // Unique roll / email check (if email provided)
    const orConditions = [{ roll: payload.roll }];
    if (payload.email) {
      orConditions.push({ email: payload.email });
    }

    const conflict = await NifStudent.findOne({ $or: orConditions }).lean();
    if (conflict) {
      return res.status(409).json({ message: "Student with same roll or email exists" });
    }

    const created = await NifStudent.create(payload);
    res.status(201).json({ id: created._id });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        message: "Duplicate key",
        key: err.keyPattern,
        value: err.keyValue,
      });
    }
    next(err);
  }
});

/* ====================================================
   BULK IMPORT + CSV TEMPLATE
   POST /api/nif/students/bulk
   GET  /api/nif/students/csv-template  (optional)
==================================================== */
router.post("/bulk", async (req, res, next) => {
  try {
    const items = Array.isArray(req.body?.students) ? req.body.students : [];
    if (!items.length) {
      return res.status(400).json({ message: "Provide students array" });
    }

    // Debug: Log first student received
    console.log("Backend received - First student:", JSON.stringify(items[0], null, 2));

    const prepared = [];
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      const s = items[i] || {};

      // Debug: Check what fields are present
      if (i === 0) {
        console.log("Student fields:", Object.keys(s));
        console.log("Course value:", s.course);
      }

      const missing = REQUIRED.filter(
        (k) => !s[k] || String(s[k]).trim() === ""
      );
      if (missing.length) {
        console.log(`Row ${i}: Missing fields:`, missing);
        errors.push({ index: i, message: `Missing: ${missing.join(", ")}` });
        continue;
      }

      // Parse dates
      const dob = s.dob ? toDate(s.dob) : null;
      const admissionDate = toDate(s.admissionDate);

      if (!admissionDate) {
        errors.push({ index: i, message: "Invalid admissionDate" });
        continue;
      }

      const doc = {
        // Required fields
        name: String(s.name).trim(),
        mobile: String(s.mobile).trim(),
        gender: String(s.gender).toLowerCase().trim(),
        batchCode: String(s.batchCode).trim(),
        admissionDate,
        roll: String(s.roll).trim(),
        section: String(s.section).trim(),
        course: String(s.course).trim(),

        // Optional fields
        email: s.email ? String(s.email).toLowerCase().trim() : "",
        dob,
        address: (s.address || "").trim(),
        pincode: (s.pincode || "").trim(),
        grade: (s.grade || "").trim(),
        duration: (s.duration || "").trim(),

        // Guardian info
        guardianName: (s.guardianName || "").trim(),
        guardianEmail: s.guardianEmail ? String(s.guardianEmail).toLowerCase().trim() : "",
        guardianPhone: (s.guardianPhone || "").trim(),

        // IDs
        serialNo: s.serialNo ? Number(s.serialNo) : undefined,
        formNo: (s.formNo || "").trim(),
        enrollmentNo: (s.enrollmentNo || "").trim(),
        courseId: s.courseId || undefined,

        // Status
        status: s.status && ["Active", "Inactive", "Alumni", "Dropped"].includes(s.status)
            ? s.status : "Active",

        source: "bulk",
      };

      prepared.push(doc);
    }

    let inserted = 0;

    console.log(`Attempting to insert ${prepared.length} students`);

    try {
      if (prepared.length) {
        const result = await NifStudent.insertMany(prepared, {
          ordered: false,
        });
        inserted = result.length;
        console.log(`Successfully inserted ${inserted} students`);
      }
    } catch (e) {
      console.error("Insert error:", e.message);
      if (e?.writeErrors?.length) {
        console.log(`Write errors: ${e.writeErrors.length}`);
        inserted =
          (e.insertedDocs || []).length ||
          Math.max(0, prepared.length - e.writeErrors.length);

        e.writeErrors.forEach((we) => {
          console.log(`Write error at index ${we.index}:`, we.errmsg);
          errors.push({
            index: we.index,
            message: we.errmsg || "Duplicate/validation error",
          });
        });
      } else {
        console.error("Full error:", e);
        throw e;
      }
    }

    console.log(`Final result: ${inserted} inserted, ${errors.length} failed`);
    res.json({ imported: inserted, failed: errors.length, errors });
  } catch (err) {
    next(err);
  }
});

router.get("/csv-template", (_req, res) => {
  const headers = [
    "name",
    "roll",
    "grade",
    "section",
    "gender",
    "mobile",
    "email",
    "dob",
    "address",
    "pincode",
    "course",
    "status",
  ];
  res.setHeader("Content-Type", "text/csv");
  res.send(headers.join(",") + "\n");
});

/* ====================================================
   READ ONE / UPDATE / DELETE
   GET    /api/nif/students/:id
   PATCH  /api/nif/students/:id
   DELETE /api/nif/students/:id
==================================================== */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const doc = await NifStudent.findById(id).lean();
    if (!doc) return res.status(404).json({ message: "Not found" });

    res.json(doc);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const updates = { ...(req.body || {}) };

    if (updates.dob) {
      const d = toDate(updates.dob);
      if (!d) return res.status(400).json({ message: "Invalid dob" });
      updates.dob = d;
    }

    if (updates.email) {
      updates.email = updates.email.toLowerCase().trim();
    }

    // Normalize gender to lowercase
    if (updates.gender) {
      updates.gender = updates.gender.toLowerCase().trim();
    }

    if (updates.roll || updates.email) {
      const or = [];
      if (updates.roll) or.push({ roll: updates.roll });
      if (updates.email) or.push({ email: updates.email });

      if (or.length) {
        const conflict = await NifStudent.findOne({
          _id: { $ne: id },
          $or: or,
        }).lean();

        if (conflict) {
          return res
            .status(409)
            .json({ message: "Student with same roll or email exists" });
        }
      }
    }

    const updated = await NifStudent.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) return res.status(404).json({ message: "Not found" });

    res.json(updated);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        message: "Duplicate key",
        key: err.keyPattern,
        value: err.keyValue,
      });
    }
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const deleted = await NifStudent.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ message: "Not found" });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ====================================================
   ATTENDANCE
   POST /api/nif/students/:id/attendance
   GET  /api/nif/students/:id/attendance
==================================================== */
router.post("/:id/attendance", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const { status, date, remarks } = req.body || {};
    if (!["present", "absent", "leave"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const d = toDate(date || new Date());
    if (!d) return res.status(400).json({ message: "Invalid date" });

    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);

    const student = await NifStudent.findById(id);
    if (!student) return res.status(404).json({ message: "Not found" });

    student.attendance = (student.attendance || []).filter(
      (a) => !(a.date >= start && a.date <= end)
    );

    student.attendance.push({
      date: start,
      status,
      remarks: remarks || "",
      markedBy: req.user?._id,
    });

    await student.save();

    res.status(201).json({ ok: true, attendance: student.attendance });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/attendance", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const from = req.query.from ? toDate(req.query.from) : null;
    const to = req.query.to ? toDate(req.query.to) : null;
    if (req.query.from && !from)
      return res.status(400).json({ message: "Invalid from" });
    if (req.query.to && !to)
      return res.status(400).json({ message: "Invalid to" });

    const student = await NifStudent.findById(id).lean();
    if (!student) return res.status(404).json({ message: "Not found" });

    let result = student.attendance || [];
    if (from) result = result.filter((a) => new Date(a.date) >= from);
    if (to) result = result.filter((a) => new Date(a.date) <= to);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;