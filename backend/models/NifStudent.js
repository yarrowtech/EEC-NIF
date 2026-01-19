const mongoose = require("mongoose");
const { Schema } = mongoose;

/* ============================================
   Fee Installment Schema (for course mapping)
============================================ */
const feeInstallmentSchema = new Schema(
  {
    label: { type: String, required: true, trim: true }, // e.g. "Registration", "1st Installment"
    amount: { type: Number, required: true, min: 0 },
    dueMonth: { type: String, trim: true }, // e.g. "July", "Aug"
  },
  { _id: false }
);

/* ============================================
   Fee Summary Schema (for quick card display)
   Used in Students.jsx → student.feeSummary
============================================ */
const feeSummarySchema = new Schema(
  {
    totalFee: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["paid", "partial", "due", "overdue", "na"],
      default: "na",
    },
  },
  { _id: false }
);

/* ============================================
   Main NIF Student Schema
============================================ */
const nifStudentSchema = new Schema(
  {
    /* -------- Core identity -------- */
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
      lowercase: true,
    },
    dob: {
      type: Date,
    },

    /* -------- Guardian / emergency -------- */
    guardianName: {
      type: String,
      trim: true,
    },
    guardianEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    guardianPhone: {
      type: String,
      trim: true,
    },

    /* -------- Address -------- */
    address: {
      type: String,
      trim: true,
      default: "",
    },
    pincode: {
      type: String,
      trim: true,
      default: "",
    },

    /* -------- Academic / NIF Details -------- */
    serialNo: {
      type: Number, // Srl No from sheet
    },
    batchCode: {
      type: String, // Batch code like "FD-2024-01"
      required: true,
      trim: true,
    },
    admissionDate: {
      type: Date, // Date of admission
      required: true,
    },
    academicYear: {
      type: String, // e.g. "2024-25"
      trim: true,
    },
    roll: {
      type: String,
      required: true,
      trim: true,
    },
    grade: {
      type: String, // You are using grade as program label (FD, ADV CERT etc.)
      trim: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },

    course: {
      type: String, // human readable course/program name
      required: true,
      trim: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "NifCourse",
    },
    duration: {
      type: String, // e.g. "1 Year", "3 Years"
      trim: true,
    },
    formNo: {
      type: String,
      trim: true,
    },
    enrollmentNo: {
      type: String,
      trim: true,
    },

    /* -------- Program / stream mapping -------- */
    stream: { type: String, trim: true },
    programType: {
      type: String,
      enum: ["ADV_CERT", "B_VOC", "M_VOC", "B_DES"],
    },
    programLabel: { type: String, trim: true },

    /* -------- Fee configuration -------- */
    totalFee: { type: Number, min: 0 },
    feeInstallments: {
      type: [feeInstallmentSchema],
      default: [],
    },

    /* -------- Fee summary (for dashboard display) -------- */
    feeSummary: {
      type: feeSummarySchema,
      default: () => ({}),
    },

    /* -------- Archive control -------- */
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
    },
    passedOutYear: {
      // e.g. "2024" or "2023-24"
      type: String,
    },

    /* -------- Meta -------- */
    status: {
      type: String,
      enum: ["Active", "Inactive", "Alumni", "Dropped"],
      default: "Active",
    },
    source: {
      type: String,
      enum: ["manual", "bulk"],
      default: "manual",
    },
    studentPortalUser: {
      type: Schema.Types.ObjectId,
      ref: "StudentUser",
      default: null,
    },
    portalAccess: {
      enabled: { type: Boolean, default: false },
      username: { type: String, trim: true },
      issuedAt: { type: Date },
      issuedBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
      lastResetAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

nifStudentSchema.index({ roll: 1 }, { unique: false, sparse: true });
nifStudentSchema.index({ email: 1 }, { unique: false, sparse: true });

module.exports = mongoose.model("NifStudent", nifStudentSchema);
