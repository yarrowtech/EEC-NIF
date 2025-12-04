// backend/routes/nifFeesRoute.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const NifFeeConfig = require("../models/NifFeeConfig");
const NifFeeRecord = require("../models/NifFeeRecord");
const NifStudent = require("../models/NifStudent");

/* -----------------------------------------------------
   POST /api/nif/fees/config/save
   Body: { programType, stream, course, yearNumber, feeComponents[], discounts? }
------------------------------------------------------ */
router.post("/config/save", async (req, res) => {
  try {
    const {
      programType,
      stream,
      course,
      yearNumber,
      session = "2025-26",
      feeComponents,
      discounts = [],
    } = req.body || {};

    if (!programType || !stream || !course || !yearNumber) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!Array.isArray(feeComponents) || feeComponents.length === 0) {
      return res
        .status(400)
        .json({ message: "feeComponents must be a non-empty array" });
    }

    const cleaned = feeComponents.map((c) => ({
      label: c.label || c.name,
      amount: Number(c.amount || 0),
    }));

    const totalFee = cleaned.reduce((s, c) => s + (c.amount || 0), 0);

    const config = await NifFeeConfig.findOneAndUpdate(
      { session, programType, stream, course, yearNumber },
      {
        session,
        programType,
        stream,
        course,
        yearNumber,
        feeComponents: cleaned,
        totalFee,
        discounts,
        isActive: true,
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, config });
  } catch (err) {
    console.error("Error saving fee config:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------------------------------------
   POST /api/nif/fees/records/init
   Create fee record for a student based on config
   Body: { studentId, programType, stream, course, yearNumber, session? }
------------------------------------------------------ */
router.post("/records/init", async (req, res) => {
  try {
    const {
      studentId,
      programType,
      stream,
      course,
      yearNumber,
      session = "2025-26",
    } = req.body || {};

    if (!studentId || !programType || !course || !yearNumber) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ message: "Invalid studentId" });
    }

    const student = await NifStudent.findById(studentId).lean();
    if (!student) return res.status(404).json({ message: "Student not found" });

    const config = await NifFeeConfig.findOne({
      session,
      programType,
      stream,
      course,
      yearNumber,
    }).lean();

    if (!config) {
      return res
        .status(404)
        .json({ message: "Fee configuration not found for this combo" });
    }

    const totalFee = config.totalFee || 0;

    const record = await NifFeeRecord.findOneAndUpdate(
      {
        student: student._id,
        session,
        programType,
        course,
        yearNumber,
      },
      {
        student: student._id,
        session,
        programType,
        stream,
        course,
        yearNumber,
        totalFee,
        // if existing, keep previous paidAmount & dueAmount
      },
      { new: true, upsert: true }
    );

    // Initialize dueAmount if not set
    if (record.dueAmount == null) {
      record.dueAmount = totalFee - (record.paidAmount || 0);
      await record.save();
    }

    res.status(201).json(record);
  } catch (err) {
    console.error("Error init fee record:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------------------------------------
   GET /api/nif/fees/records/fetch
   Query: programType, course, year, q, studentId
   Used by: FeesCollection, FeesDashboard, StudentFeeDetails
------------------------------------------------------ */
router.get("/records/fetch", async (req, res, next) => {
  try {
    const { programType, course, year, q, studentId } = req.query || {};
    const filter = {};

    if (programType) filter.programType = programType;
    if (course) filter.course = course;
    if (year) filter.yearNumber = Number(year);

    if (studentId && mongoose.isValidObjectId(studentId)) {
      filter.student = studentId;
    }

    const records = await NifFeeRecord.find(filter)
      .populate("student", "name roll email mobile course status")
      .lean();

    const search = (q || "").trim().toLowerCase();

    const mapped = records
      .map((r) => {
        const s = r.student || {};
        const roll =
          s.roll ||
          s.nifRoll ||
          s.rollNumber ||
          s.regNo ||
          "";

        return {
          // IDs
          feeRecordId: r._id.toString(),
          studentId: s._id?.toString(),

          // student info
          name: s.name || "",
          roll,
          email: s.email || "",
          mobile: s.mobile || "",
          studentStatus: s.status || "",

          // course / program info
          session: r.session,
          stream: r.stream,
          programType: r.programType,
          course: s.course || r.course,
          yearNumber: r.yearNumber,

          // money
          totalFee: r.totalFee || 0,
          paidAmount: r.paidAmount || 0,
          dueAmount: r.dueAmount || 0,
          status: r.status || "due",
          lastPayment: r.lastPayment,

          // for StudentFeeDetails payment history
          payments: (r.payments || []).map((p, idx) => ({
            id: `${r._id}-${idx}`,
            amount: p.amount,
            method: p.method,
            date: p.date,
            reference: p.note || "",
          })),
        };
      })
      .filter((row) => {
        if (!search) return true;
        return (
          row.name.toLowerCase().includes(search) ||
          (row.roll && String(row.roll).toLowerCase().includes(search)) ||
          (row.course && row.course.toLowerCase().includes(search))
        );
      });

    res.json(mapped);
  } catch (err) {
    next(err);
  }
});

/* -----------------------------------------------------
   POST /api/nif/fees/records/collect/:id
   Body: { amount, method, note? }
   Used by FeesCollection & StudentFeeDetails
------------------------------------------------------ */
router.post("/records/collect/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method, note } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid feeRecordId" });
    }

    const amt = Number(amount);
    if (!amt || amt <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (!method) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    const record = await NifFeeRecord.findById(id);
    if (!record) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    if (amt > record.dueAmount) {
      return res
        .status(400)
        .json({ message: "Amount cannot exceed due amount" });
    }

    record.paidAmount += amt;
    record.dueAmount -= amt;
    record.lastPayment = new Date();

    if (record.dueAmount === 0) record.status = "paid";
    else if (record.paidAmount > 0) record.status = "partial";
    else record.status = "due";

    record.payments.push({ amount: amt, method, note });
    await record.save();

    res.json({
      id: record._id.toString(),
      paidAmount: record.paidAmount,
      dueAmount: record.dueAmount,
      status: record.status,
      lastPayment: record.lastPayment,
    });
  } catch (err) {
    console.error("Error collecting payment:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------------------------------------
   GET /api/nif/fees/dashboard/summary
   Used by FeesDashboard.jsx (live KPIs)
------------------------------------------------------ */
router.get("/dashboard/summary", async (req, res) => {
  try {
    const records = await NifFeeRecord.find().lean();

    const studentIds = new Set(records.map((r) => String(r.student)));
    const totalStudents = studentIds.size;
    const totalOutstanding = records.reduce(
      (s, r) => s + (r.dueAmount || 0),
      0
    );
    const totalCollected = records.reduce(
      (s, r) => s + (r.paidAmount || 0),
      0
    );

    // compute thisMonthCollection & lastMonthCollection from payments[]
    const allPayments = records.flatMap((r) => r.payments || []);
    const now = new Date();
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();

    const prevMonth = curMonth === 0 ? 11 : curMonth - 1;
    const prevYear = curMonth === 0 ? curYear - 1 : curYear;

    let thisMonthCollection = 0;
    let lastMonthCollection = 0;

    allPayments.forEach((p) => {
      const d = new Date(p.date);
      if (isNaN(d.getTime())) return;
      const m = d.getMonth();
      const y = d.getFullYear();

      if (m === curMonth && y === curYear) {
        thisMonthCollection += p.amount || 0;
      } else if (m === prevMonth && y === prevYear) {
        lastMonthCollection += p.amount || 0;
      }
    });

    const overdueCount = records.filter((r) => r.status === "due").length;

    res.json({
      totalStudents,
      totalCollected,
      totalOutstanding,
      thisMonthCollection,
      lastMonthCollection,
      overdueCount,
    });
  } catch (err) {
    console.error("Error dashboard summary:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
