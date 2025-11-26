// backend/routes/nifStudentRoute.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const NifStudent = require('../models/NifStudent');
const authAnyUser = require('../middleware/authAnyUser');

// GET /api/nif/students?q=...
router.get('/nif/students', authAnyUser, async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const filter = q
      ? { $or: [{ name: { $regex: q, $options: 'i' } }, { roll: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }] }
      : {};
    const students = await NifStudent.find(filter).sort({ createdAt: -1 }).lean();
    res.json(students);
  } catch (err) { next(err); }
});

// POST /api/student/auth/register
router.post('/student/auth/register', authAnyUser, async (req, res, next) => {
  try {
    const payload = { ...(req.body || {}) };
    const required = ['name', 'roll', 'grade', 'section', 'gender', 'mobile', 'email', 'dob'];
    for (const f of required) if (!payload[f]) return res.status(400).json({ message: `Missing field: ${f}` });

    if (typeof payload.dob === 'string') {
      const dt = new Date(payload.dob);
      if (Number.isNaN(dt.getTime())) return res.status(400).json({ message: 'Invalid dob' });
      payload.dob = dt;
    }

    const exists = await NifStudent.findOne({ $or: [{ roll: payload.roll }, { email: payload.email }] }).lean();
    if (exists) return res.status(409).json({ message: 'Student with same roll or email exists' });

    const created = await NifStudent.create(payload);
    res.status(201).json({ id: created._id });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: 'Duplicate key', key: err.keyPattern, value: err.keyValue });
    next(err);
  }
});

// GET /api/nif/student/:id
router.get('/nif/student/:id', authAnyUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });
    const doc = await NifStudent.findById(id).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) { next(err); }
});

// PATCH /api/nif/student/:id
router.patch('/nif/student/:id', authAnyUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });

    const updates = { ...req.body };
    if (typeof updates.dob === 'string') {
      const dt = new Date(updates.dob);
      if (Number.isNaN(dt.getTime())) return res.status(400).json({ message: 'Invalid dob' });
      updates.dob = dt;
    }

    if (updates.roll || updates.email) {
      const conflict = await NifStudent.findOne({
        _id: { $ne: id },
        $or: [{ roll: updates.roll }, { email: updates.email }],
      }).lean();
      if (conflict) return res.status(409).json({ message: 'Student with same roll or email exists' });
    }

    const updated = await NifStudent.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: 'Duplicate key', key: err.keyPattern, value: err.keyValue });
    next(err);
  }
});

// DELETE /api/nif/student/:id
router.delete('/nif/student/:id', authAnyUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });
    const deleted = await NifStudent.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// POST /api/nif/student/:id/attendance  { date?: 'YYYY-MM-DD', status: 'present'|'absent' }
router.post('/nif/student/:id/attendance', authAnyUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });
    if (!['present', 'absent'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const dateStr = req.body?.date || new Date().toISOString().slice(0, 10);
    const day = new Date(dateStr);
    if (Number.isNaN(day.getTime())) return res.status(400).json({ message: 'Invalid date' });
    const start = new Date(day); start.setHours(0, 0, 0, 0);
    const end = new Date(day); end.setHours(23, 59, 59, 999);

    const student = await NifStudent.findById(id);
    if (!student) return res.status(404).json({ message: 'Not found' });

    student.attendance = (student.attendance || []).filter(a => !(a.date >= start && a.date <= end));
    student.attendance.push({ date: start, status });
    await student.save();

    res.status(201).json({ ok: true, attendance: student.attendance });
  } catch (err) { next(err); }
});

// GET /api/nif/student/:id/attendance?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/nif/student/:id/attendance', authAnyUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });

    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;
    if (from && Number.isNaN(from.getTime())) return res.status(400).json({ message: 'Invalid from' });
    if (to && Number.isNaN(to.getTime())) return res.status(400).json({ message: 'Invalid to' });

    const student = await NifStudent.findById(id).lean();
    if (!student) return res.status(404).json({ message: 'Not found' });

    let result = student.attendance || [];
    if (from) result = result.filter((a) => new Date(a.date) >= from);
    if (to) result = result.filter((a) => new Date(a.date) <= to);

    res.json(result);
  } catch (err) { next(err); }
});

module.exports = router;
