// backend/models/NifArchivedStudent.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const feeSummarySchema = new Schema(
  {
    totalFee: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    totalDue: { type: Number, default: 0 },
  },
  { _id: false }
);

const NifArchivedStudentSchema = new Schema(
  {
    originalStudentId: { type: Schema.Types.ObjectId, ref: "NifStudent" },
    schoolId: { type: Schema.Types.ObjectId, ref: "School", index: true },

    // Student identity
    studentName: String,
    email: String,
    mobile: String,
    gender: String,
    dob: Date,

    // Academic
    roll: String,
    grade: String,
    section: String,
    batchCode: String,
    course: String,
    courseId: { type: Schema.Types.ObjectId, ref: "NifCourse" },
    duration: String,
    admissionDate: Date,

    // Archive info
    archiveStatus: {
      type: String,
      enum: ["passed", "dropout", "transfer", "discontinued"],
      default: "passed",
    },
    passedOutYear: String, // e.g. "2024" or "2023-24"
    archivedAt: { type: Date, default: Date.now },
    archivedBy: String,

    // Fee Snapshot
    feeSummary: {
      type: feeSummarySchema,
      default: () => ({}),
    },

    // All fee records snapshot (optional)
    feeRecords: {
      type: Array,
      default: [],
    },

    // Full original document snapshot (for audit)
    snapshot: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NifArchivedStudent", NifArchivedStudentSchema);
