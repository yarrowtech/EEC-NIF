const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const NifFeeConfig = require("../models/NifFeeConfig");
const NifFeeRecord = require("../models/NifFeeRecord");
const NifStudent = require("../models/NifStudent");

// ------------------------------
// SAVE FEE CONFIG (FeeConfiguration.jsx)
// ------------------------------
router.post("/config/save", async (req, res) => {
  try {
    const {
      programType,
      stream,
      course,
      yearNumber,
      feeComponents,
      discounts = [],
    } = req.body;

    if (!programType || !stream || !course || !yearNumber) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const cleaned = feeComponents.map((c) => ({
      label: c.label || c.name,
      amount: Number(c.amount),
    }));

    const totalFee = cleaned.reduce((s, c) => s + c.amount, 0);

    const config = await NifFeeConfig.findOneAndUpdate(
      { programType, stream, course, yearNumber },
      {
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
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------
// GET STUDENTS WITH FEE RECORD (FeesCollection.jsx)
// ------------------------------
router.get("/", async (req, res) => {
  try {
    const { programType, course, year } = req.query;

    const records = await NifFeeRecord.find({
      programType,
      course,
      yearNumber: Number(year),
    })
      .populate("student")
      .lean();

    // FEES COLLECTION EXPECTS THIS SHAPE FROM FRONTEND
    const mapped = records.map((r) => ({
      feeRecordId: r._id,
      name: r.student?.name,
      roll: r.student?.roll,
      program: r.programType,
      course: r.course,
      stream: r.stream,
      totalFee: r.totalFee,
      paidAmount: r.paidAmount,
      dueAmount: r.dueAmount,
      status: r.status,
      lastPayment: r.lastPayment,
    }));

    res.json(mapped);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------
// COLLECT FEES (POST) — FeesCollection.jsx uses this
// ------------------------------
router.post("/collect/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    const record = await NifFeeRecord.findById(id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    if (amount > record.dueAmount)
      return res
        .status(400)
        .json({ message: "Amount cannot exceed due amount" });

    record.paidAmount += amount;
    record.dueAmount -= amount;
    record.lastPayment = new Date();

    if (record.dueAmount === 0) record.status = "paid";
    else if (record.paidAmount > 0) record.status = "partial";
    else record.status = "due";

    record.payments.push({ amount, method });
    await record.save();

    res.json({
      id: record._id,
      paidAmount: record.paidAmount,
      dueAmount: record.dueAmount,
      status: record.status,
      lastPayment: record.lastPayment,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------
// FEES DASHBOARD SUMMARY (FeesDashboard.jsx)
// ------------------------------
router.get("/dashboard/summary", async (req, res) => {
  try {
    const records = await NifFeeRecord.find().lean();

    const totalStudents = records.length;
    const totalOutstanding = records.reduce((s, r) => s + r.dueAmount, 0);
    const totalCollected = records.reduce((s, r) => s + r.paidAmount, 0);

    const allPayments = records.flatMap((r) => r.payments);

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    const monthlyCollection = allPayments
      .filter((p) => {
        const d = new Date(p.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      })
      .reduce((s, p) => s + p.amount, 0);

    res.json({
      totalOutstanding,
      monthlyCollection,
      overduePayments: records.filter((r) => r.status === "due").length,
      totalEnrolled: totalStudents,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
