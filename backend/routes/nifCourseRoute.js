// backend/routes/nifCourseRoute.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const NifCourse = require("../models/NifCourse");
// const authAdmin = require("../middleware/authAdmin"); // ADMIN-ONLY access

/* ---------------------------
   GET /api/course/fetch
   Query: q, department, status, page, limit, sort
   Used by your CourseManagement.jsx
---------------------------- */
router.get("/course/fetch", async (req, res, next) => {
  try {
    const {
      q = "",
      department,
      status,
      page = 1,
      limit = 100,
      sort = "-createdAt",
    } = req.query;

    const filter = {};
    if (q.trim()) {
      filter.$or = [
        { title: { $regex: q.trim(), $options: "i" } },
        { department: { $regex: q.trim(), $options: "i" } },
        { desc: { $regex: q.trim(), $options: "i" } },
      ];
    }
    if (department) filter.department = department;
    if (status) filter.status = status;

    const pg = Math.max(parseInt(page, 10) || 1, 1);
    const lim = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 200);

    const [items, total] = await Promise.all([
      NifCourse.find(filter).sort(sort).skip((pg - 1) * lim).limit(lim).lean(),
      NifCourse.countDocuments(filter),
    ]);

    // Frontend expects fields like: _id, title, department, desc, duration, fees, instructor, totalStudents, startingDate
    res.json(items); // (your UI doesn’t need pagination meta right now)
  } catch (err) {
    next(err);
  }
});

/* ---------------------------
   POST /api/course/add
   Body from UI: { stream, name, duration, fees }
   We map: stream -> department, name -> title
---------------------------- */
router.post("/course/add",  async (req, res, next) => {
  try {
    const body = req.body || {};
    const title = (body.name || "").trim();
    const department = (body.stream || "").trim();
    const duration = (body.duration || "").trim();
    const fees = Number(body.fees);

    if (!title || !department || !duration || Number.isNaN(fees)) {
      return res.status(400).json({
        message:
          "Missing/invalid fields. Required: stream (department), name (title), duration, fees",
      });
    }

    const doc = {
      title,
      department,
      duration,
      fees,
      // optional fields if you send them now or later
      desc: body.desc || "",
      instructor: body.instructor || "",
      totalStudents: Number.isFinite(body.totalStudents)
        ? Number(body.totalStudents)
        : 0,
      startingDate: body.startingDate ? new Date(body.startingDate) : undefined,
      createdBy: req.user?.id,
    };

    const exists = await NifCourse.findOne({
      title: doc.title,
      department: doc.department,
    }).lean();
    if (exists) {
      return res.status(409).json({
        message: "A course with the same title already exists in this department",
      });
    }

    const created = await NifCourse.create(doc);
    res.status(201).json({ id: created._id });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Duplicate course" });
    }
    next(err);
  }
});

/* ---------------------------
   GET /api/course/:id
---------------------------- */
router.get("/course/:id",  async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const doc = await NifCourse.findById(id).lean();
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

/* ---------------------------
   PATCH /api/course/:id
   Allows editing from admin panel
---------------------------- */
router.patch("/course/:id",  async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const updates = { ...(req.body || {}) };

    // keep the FE↔BE naming map consistent if they send `name/stream`
    if (typeof updates.name === "string") {
      updates.title = updates.name.trim();
      delete updates.name;
    }
    if (typeof updates.stream === "string") {
      updates.department = updates.stream.trim();
      delete updates.stream;
    }
    if (typeof updates.fees !== "undefined") {
      const f = Number(updates.fees);
      if (Number.isNaN(f)) return res.status(400).json({ message: "Invalid fees" });
      updates.fees = f;
    }
    if (typeof updates.totalStudents !== "undefined") {
      const ts = Number(updates.totalStudents);
      if (!Number.isFinite(ts) || ts < 0)
        return res.status(400).json({ message: "Invalid totalStudents" });
      updates.totalStudents = ts;
    }
    if (updates.startingDate) {
      const d = new Date(updates.startingDate);
      if (Number.isNaN(d.getTime()))
        return res.status(400).json({ message: "Invalid startingDate" });
      updates.startingDate = d;
    }

    updates.updatedBy = req.user?.id;

    // prevent duplicate (title, department) on update
    if (updates.title || updates.department) {
      const nextTitle = updates.title ?? (await NifCourse.findById(id).lean())?.title;
      const nextDept =
        updates.department ?? (await NifCourse.findById(id).lean())?.department;

      if (!nextTitle || !nextDept) {
        return res.status(400).json({ message: "title/department required" });
      }

      const conflict = await NifCourse.findOne({
        _id: { $ne: id },
        title: nextTitle,
        department: nextDept,
      }).lean();
      if (conflict) {
        return res.status(409).json({
          message: "Another course with this title already exists in department",
        });
      }
    }

    const updated = await NifCourse.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Duplicate course" });
    }
    next(err);
  }
});

/* ---------------------------
   DELETE /api/course/:id
---------------------------- */
router.delete("/course/:id",  async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const del = await NifCourse.findByIdAndDelete(id).lean();
    if (!del) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
