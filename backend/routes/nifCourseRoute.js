// backend/routes/nifCourseRoute.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const NifCourse = require("../models/NifCourse");
// const authAdmin = require("../middleware/authAdmin"); // enable later if needed

const PROGRAM_LABELS = {
  ADV_CERT: "Advance Certificate",
  B_VOC: "B.Voc",
  M_VOC: "M.Voc",
  B_DES: "B.Des",
};

const PROGRAM_TYPE_ALIASES = {
  ADV_CERT: "ADV_CERT",
  "ADVANCED CERTIFICATE": "ADV_CERT",
  "2 YEAR ADVANCED CERTIFICATE": "ADV_CERT",
  "1 YEAR CERTIFICATE": "ADV_CERT",
  B_VOC: "B_VOC",
  "3 YEAR B VOC": "B_VOC",
  BVOC: "B_VOC",
  M_VOC: "M_VOC",
  "2 YEAR M VOC": "M_VOC",
  MVOC: "M_VOC",
  B_DES: "B_DES",
  "4 YEAR B DES": "B_DES",
  BDES: "B_DES",
};

const normalizeProgramType = (value = "") => {
  if (!value) return null;
  const key = String(value).trim().toUpperCase().replace(/\./g, "");
  return PROGRAM_TYPE_ALIASES[key] || null;
};

const sanitizeInstallments = (items) => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      const label = String(item?.label || item?.name || "").trim();
      const amount = Number(item?.amount ?? item?.value);
      if (!label || Number.isNaN(amount) || amount < 0) return null;
      return {
        label,
        amount,
        dueMonth: item?.dueMonth ? String(item.dueMonth).trim() : "",
      };
    })
    .filter(Boolean);
};

/* -----------------------------------------------------
   GET /api/nif/course/fetch
   Query: q, department, status, page, limit, sort
   Used by CourseManagement.jsx to list courses
------------------------------------------------------ */
router.get("/fetch", async (req, res, next) => {
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

    const [items /*, total */] = await Promise.all([
      NifCourse.find(filter)
        .sort(sort)
        .skip((pg - 1) * lim)
        .limit(lim)
        .lean(),
      NifCourse.countDocuments(filter),
    ]);

    res.json(items); // simple array (no pagination meta needed now)
  } catch (err) {
    next(err);
  }
});

/* -----------------------------------------------------
   POST /api/nif/course/add
   Body from UI: { stream, name, duration, fees, description? }
   Map: stream -> department, name -> title
------------------------------------------------------ */
router.post("/add", /* authAdmin, */ async (req, res, next) => {
  try {
    const body = req.body || {};

    const title = (body.name || "").trim();
    const department = (body.stream || "").trim();
    const duration = (body.duration || "").trim();
    const fees = Number(body.fees);
    const programType = (body.programType || "").trim();
    const programLabel =
      (body.programLabel || "").trim() || PROGRAM_LABELS[programType];

    if (
      !title ||
      !department ||
      !duration ||
      Number.isNaN(fees) ||
      !programType ||
      !PROGRAM_LABELS[programType]
    ) {
      return res.status(400).json({
        message:
          "Missing/invalid fields. Required: stream, name, duration, fees, programType",
      });
    }

    // totalStudents safe parse (optional)
    let totalStudents = 0;
    if (body.totalStudents != null) {
      const ts = Number(body.totalStudents);
      if (!Number.isFinite(ts) || ts < 0) {
        return res
          .status(400)
          .json({ message: "Invalid totalStudents (must be >= 0 number)" });
      }
      totalStudents = ts;
    }

    const doc = {
      title,
      department,
      duration,
      fees,
      programType,
      programLabel,
      installments: sanitizeInstallments(body.installments),
      desc: body.desc || body.description || "",
      instructor: body.instructor || "",
      totalStudents,
      startingDate: body.startingDate ? new Date(body.startingDate) : undefined,
      createdBy: req.user?.id,
    };

    // prevent duplicates within same department
    const exists = await NifCourse.findOne({
      title: doc.title,
      department: doc.department,
    }).lean();

    if (exists) {
      return res.status(409).json({
        message:
          "A course with the same title already exists in this department",
      });
    }

    const created = await NifCourse.create(doc);
    res.status(201).json(created);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Duplicate course" });
    }
    next(err);
  }
});

/* -----------------------------------------------------
   GET /api/nif/course/:id
------------------------------------------------------ */
router.get("/fee-structure", async (req, res, next) => {
  try {
    const { programType, stream, courseId } = req.query || {};

    let course = null;
    if (courseId && mongoose.isValidObjectId(courseId)) {
      course = await NifCourse.findById(courseId).lean();
    }

    const normalizedProgram = normalizeProgramType(programType);
    const normalizedStream = typeof stream === "string" ? stream.trim() : "";

    if (!course) {
      if (!normalizedProgram || !normalizedStream) {
        return res
          .status(400)
          .json({ message: "programType and stream are required" });
      }

      course = await NifCourse.findOne({
        programType: normalizedProgram,
        department: normalizedStream,
      }).lean();
    }

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found for the provided selection" });
    }

    const installments = Array.isArray(course.installments)
      ? course.installments
      : [];
    const totalFee =
      typeof course.fees === "number"
        ? course.fees
        : installments.reduce((sum, inst) => sum + Number(inst.amount || 0), 0);

    res.json({
      courseId: course._id,
      title: course.title,
      programType: course.programType,
      stream: course.department,
      totalFee,
      installments,
    });
  } catch (err) {
    next(err);
  }
});

/* -----------------------------------------------------
   POST /api/nif/course/fee-structure
   Body: { programType, stream, courseId?, components: [] }
------------------------------------------------------ */
router.post("/fee-structure", async (req, res, next) => {
  try {
    const { programType, stream, courseId, components } = req.body || {};

    const normalizedProgram = normalizeProgramType(programType);
    const normalizedStream = typeof stream === "string" ? stream.trim() : "";

    if (!normalizedProgram || !normalizedStream) {
      return res
        .status(400)
        .json({ message: "programType and stream are required" });
    }

    let course = null;
    if (courseId && mongoose.isValidObjectId(courseId)) {
      course = await NifCourse.findById(courseId);
    }
    if (!course) {
      course = await NifCourse.findOne({
        programType: normalizedProgram,
        department: normalizedStream,
      });
    }

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found for the provided selection" });
    }

    const sanitized = sanitizeInstallments(components);
    if (!sanitized.length) {
      return res
        .status(400)
        .json({ message: "At least one valid fee component is required" });
    }

    const totalFee = sanitized.reduce(
      (sum, inst) => sum + Number(inst.amount || 0),
      0
    );

    course.installments = sanitized;
    course.fees = totalFee;
    course.programType = normalizedProgram;
    course.programLabel =
      course.programLabel || PROGRAM_LABELS[normalizedProgram];
    await course.save();

    res.json({
      courseId: course._id,
      totalFee: course.fees,
      installments: course.installments,
      programType: course.programType,
      stream: course.department,
    });
  } catch (err) {
    next(err);
  }
});

/* -----------------------------------------------------
   GET /api/nif/course/:id
------------------------------------------------------ */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const doc = await NifCourse.findById(id).lean();
    if (!doc) return res.status(404).json({ message: "Not found" });

    res.json(doc);
  } catch (err) {
    next(err);
  }
});

/* -----------------------------------------------------
   PATCH /api/nif/course/:id
   Allows editing from admin panel
------------------------------------------------------ */
router.patch("/:id", /* authAdmin, */ async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const updates = { ...(req.body || {}) };

    // FE ↔ BE naming map
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
      if (Number.isNaN(f)) {
        return res.status(400).json({ message: "Invalid fees" });
      }
      updates.fees = f;
    }

    if (typeof updates.programType !== "undefined") {
      if (!PROGRAM_LABELS[updates.programType]) {
        return res.status(400).json({ message: "Invalid programType" });
      }
      updates.programLabel =
        updates.programLabel || PROGRAM_LABELS[updates.programType];
    }

    if (typeof updates.installments !== "undefined") {
      updates.installments = sanitizeInstallments(updates.installments);
    }

    if (typeof updates.totalStudents !== "undefined") {
      const ts = Number(updates.totalStudents);
      if (!Number.isFinite(ts) || ts < 0) {
        return res
          .status(400)
          .json({ message: "Invalid totalStudents (must be >= 0 number)" });
      }
      updates.totalStudents = ts;
    }

    if (updates.startingDate) {
      const d = new Date(updates.startingDate);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ message: "Invalid startingDate" });
      }
      updates.startingDate = d;
    }

    updates.updatedBy = req.user?.id;

    // prevent duplicate (title, department) on update
    if (updates.title || updates.department) {
      const current = await NifCourse.findById(id).lean();
      if (!current) {
        return res.status(404).json({ message: "Not found" });
      }

      const nextTitle = updates.title ?? current.title;
      const nextDept = updates.department ?? current.department;

      const conflict = await NifCourse.findOne({
        _id: { $ne: id },
        title: nextTitle,
        department: nextDept,
      }).lean();

      if (conflict) {
        return res.status(409).json({
          message:
            "Another course with this title already exists in this department",
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

/* -----------------------------------------------------
   GET /api/nif/course/fee-structure
   Query: programType, stream, courseId(optional)
------------------------------------------------------ */
/* -----------------------------------------------------
   DELETE /api/nif/course/:id
------------------------------------------------------ */
router.delete("/:id", /* authAdmin, */ async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const del = await NifCourse.findByIdAndDelete(id).lean();
    if (!del) return res.status(404).json({ message: "Not found" });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
