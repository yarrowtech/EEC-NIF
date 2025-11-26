// backend/routes/nifStudentRoute.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const NifStudent = require("../models/NifStudent");//const authAnyUser = require("../middleware/authAnyUser"); // keep your existing auth

/* ---------------------- Utils ---------------------- */
const isISODate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const toDate = (v) => {
  if (v instanceof Date) return v;
  if (typeof v === "string" && isISODate(v)) return new Date(v);
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

const REQUIRED = ["name", "roll", "grade", "section", "gender", "mobile", "email", "dob"];

/* ---------------------- Read/Query ---------------------- */
// GET /api/nif/students?q=
router.get("/nif/students",  async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const filter = q
      ? { $or: [{ name: { $regex: q, $options: "i" } }, { roll: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }] }
      : {};
    const students = await NifStudent.find(filter).sort({ createdAt: -1 }).lean();
    res.json(students);
  } catch (err) { next(err); }
});

// GET /api/nif/student/:id
router.get("/nif/student/:id",  async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const doc = await NifStudent.findById(id).lean();
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) { next(err); }
});

/* ---------------------- Create/Update/Delete ---------------------- */
// POST /api/student/auth/register  (kept for your existing frontend)
router.post("/student/auth/register",  async (req, res, next) => {
  try {
    const payload = { ...(req.body || {}) };

    for (const f of REQUIRED) {
      if (!payload[f] || String(payload[f]).trim() === "") {
        return res.status(400).json({ message: `Missing field: ${f}` });
      }
    }

    const dob = toDate(payload.dob);
    if (!dob) return res.status(400).json({ message: "Invalid dob (YYYY-MM-DD)" });
    payload.dob = dob;

    // unique constraints
    const conflict = await NifStudent.findOne({ $or: [{ roll: payload.roll }, { email: payload.email.toLowerCase() }] }).lean();
    if (conflict) return res.status(409).json({ message: "Student with same roll or email exists" });

    const created = await NifStudent.create(payload);
    res.status(201).json({ id: created._id });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: "Duplicate key", key: err.keyPattern, value: err.keyValue });
    next(err);
  }
});

// PATCH /api/nif/student/:id
router.patch("/nif/student/:id",  async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const updates = { ...req.body };
    if (updates.dob) {
      const d = toDate(updates.dob);
      if (!d) return res.status(400).json({ message: "Invalid dob" });
      updates.dob = d;
    }

    if (updates.roll || updates.email) {
      const conflict = await NifStudent.findOne({
        _id: { $ne: id },
        $or: [{ roll: updates.roll }, { email: updates.email?.toLowerCase() }],
      }).lean();
      if (conflict) return res.status(409).json({ message: "Student with same roll or email exists" });
    }

    const updated = await NifStudent.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: "Duplicate key", key: err.keyPattern, value: err.keyValue });
    next(err);
  }
});

// DELETE /api/nif/student/:id
router.delete("/nif/student/:id",  async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const deleted = await NifStudent.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

/* ---------------------- Attendance ---------------------- */
// POST /api/nif/student/:id/attendance { date?: 'YYYY-MM-DD', status: 'present'|'absent'|'leave', remarks? }
router.post("/nif/student/:id/attendance",  async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const { status, date, remarks } = req.body || {};
    if (!["present", "absent", "leave"].includes(status)) return res.status(400).json({ message: "Invalid status" });

    const d = toDate(date || new Date());
    if (!d) return res.status(400).json({ message: "Invalid date" });

    const start = new Date(d); start.setHours(0,0,0,0);
    const end = new Date(d);   end.setHours(23,59,59,999);

    const student = await NifStudent.findById(id);
    if (!student) return res.status(404).json({ message: "Not found" });

    // remove any existing mark for the day, then push
    student.attendance = (student.attendance || []).filter(a => !(a.date >= start && a.date <= end));
    student.attendance.push({ date: start, status, remarks: remarks || "", markedBy: req.user?._id });
    await student.save();

    res.status(201).json({ ok: true, attendance: student.attendance });
  } catch (err) { next(err); }
});

// GET /api/nif/student/:id/attendance?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/nif/student/:id/attendance",  async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    const from = req.query.from ? toDate(req.query.from) : null;
    const to = req.query.to ? toDate(req.query.to) : null;
    if (req.query.from && !from) return res.status(400).json({ message: "Invalid from" });
    if (req.query.to && !to) return res.status(400).json({ message: "Invalid to" });

    const student = await NifStudent.findById(id).lean();
    if (!student) return res.status(404).json({ message: "Not found" });

    let result = student.attendance || [];
    if (from) result = result.filter(a => new Date(a.date) >= from);
    if (to) result = result.filter(a => new Date(a.date) <= to);

    res.json(result);
  } catch (err) { next(err); }
});

/* ---------------------- Bulk Import ---------------------- */
// GET /api/nif/students/csv-template  (optional helper)
router.get("/nif/students/csv-template",  (_req, res) => {
  const headers = ["name","roll","grade","section","gender","mobile","email","dob","address","pincode","course","status"];
  res.setHeader("Content-Type", "text/csv");
  res.send(headers.join(",") + "\n");
});

// POST /api/nif/students/bulk { students: [...] }
router.post("/nif/students/bulk",  async (req, res, next) => {
  try {
    const items = Array.isArray(req.body?.students) ? req.body.students : [];
    if (!items.length) return res.status(400).json({ message: "Provide students array" });

    const prepared = [];
    const errors = [];
    for (let i = 0; i < items.length; i++) {
      const s = items[i] || {};
      const missing = REQUIRED.filter((k) => !s[k] || String(s[k]).trim() === "");
      if (missing.length) { errors.push({ index: i, message: `Missing: ${missing.join(", ")}` }); continue; }

      const dob = toDate(s.dob);
      if (!dob) { errors.push({ index: i, message: "Invalid dob" }); continue; }

      prepared.push({
        name: String(s.name).trim(),
        roll: String(s.roll).trim(),
        grade: String(s.grade).trim(),
        section: String(s.section).trim(),
        gender: String(s.gender).trim(),
        mobile: String(s.mobile).trim(),
        email: String(s.email).toLowerCase().trim(),
        address: (s.address || "").trim(),
        dob,
        pincode: (s.pincode || "").trim(),
        course: (s.course || "").trim(),
        status: s.status && ["Active","Inactive","Alumni","Dropped"].includes(s.status) ? s.status : "Active",
      });
    }

    // insert, skip duplicates by unique keys
    // ordered:false => continues on duplicate errors
    let inserted = 0;
    try {
      if (prepared.length) {
        const result = await NifStudent.insertMany(prepared, { ordered: false });
        inserted = result.length;
      }
    } catch (e) {
      // collect duplicate errors (bulk)
      if (e?.writeErrors?.length) {
        inserted = (e.insertedDocs || []).length || Math.max(0, prepared.length - e.writeErrors.length);
        e.writeErrors.forEach((we) => {
          errors.push({ index: we.index, message: we.errmsg || "Duplicate/validation error" });
        });
      } else {
        throw e;
      }
    }

    res.json({ imported: inserted, failed: errors.length, errors });
  } catch (err) { next(err); }
});

module.exports = router;
