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
    /* -------- Tenant scope -------- */
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      index: true,
    },
    campusId: {
      type: String,
      index: true,
      default: null,
    },

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
    permanentAddress: {
      type: String,
      trim: true,
      default: "",
    },
    pincode: {
      type: String,
      trim: true,
      default: "",
    },

    /* -------- Personal Details (Extended) -------- */
    birthPlace: {
      type: String,
      trim: true,
    },
    nationality: {
      type: String,
      trim: true,
      default: "Indian",
    },
    religion: {
      type: String,
      trim: true,
    },
    caste: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ["General", "OBC", "SC", "ST", "EWS", "Other"],
      trim: true,
    },
    photograph: {
      type: String, // URL to uploaded photo
      trim: true,
    },

    /* -------- Emergency Contact -------- */
    emergencyContactName: {
      type: String,
      trim: true,
    },
    emergencyContactPhone: {
      type: String,
      trim: true,
    },
    emergencyContactRelation: {
      type: String,
      trim: true,
    },

    /* -------- Parent/Guardian Details (Extended) -------- */
    fatherName: {
      type: String,
      trim: true,
    },
    fatherOccupation: {
      type: String,
      trim: true,
    },
    fatherPhone: {
      type: String,
      trim: true,
    },
    motherName: {
      type: String,
      trim: true,
    },
    motherOccupation: {
      type: String,
      trim: true,
    },
    motherPhone: {
      type: String,
      trim: true,
    },

    /* -------- Academic History -------- */
    previousSchoolName: {
      type: String,
      trim: true,
    },
    previousClass: {
      type: String,
      trim: true,
    },
    previousPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    transferCertificateNo: {
      type: String,
      trim: true,
    },
    transferCertificateDate: {
      type: Date,
    },
    reasonForLeaving: {
      type: String,
      trim: true,
    },

    /* -------- Medical Information -------- */
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
      default: "Unknown",
    },
    knownHealthIssues: {
      type: String,
      trim: true,
    },
    allergies: {
      type: String,
      trim: true,
    },
    immunizationStatus: {
      type: String,
      trim: true,
    },
    learningDisabilities: {
      type: String,
      trim: true,
    },

    /* -------- Documents -------- */
    aadharNumber: {
      type: String,
      trim: true,
    },
    birthCertificateNo: {
      type: String,
      trim: true,
    },
    documents: {
      aadharCard: { type: String, trim: true }, // URL
      birthCertificate: { type: String, trim: true }, // URL
      transferCertificate: { type: String, trim: true }, // URL
      photograph: { type: String, trim: true }, // URL
      other: [{ name: String, url: String }],
    },

    /* -------- Declarations -------- */
    parentDeclaration: {
      agreed: { type: Boolean, default: false },
      agreedAt: { type: Date },
      agreedBy: { type: String, trim: true }, // Name of parent/guardian
    },

    /* -------- Office Use -------- */
    applicationId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    applicationDate: {
      type: Date,
    },
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Under Review"],
      default: "Pending",
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    approvedAt: {
      type: Date,
    },
    remarks: {
      type: String,
      trim: true,
    },

    /* -------- Academic Details -------- */
    serialNo: {
      type: Number, // Serial number
    },
    academicYear: {
      type: String, // e.g. "2024-25"
      trim: true,
    },
    admissionDate: {
      type: Date, // Date of admission
      required: true,
    },
    admissionNumber: {
      type: String, // Admission/Registration number
      trim: true,
      unique: true,
      sparse: true,
    },
    roll: {
      type: String,
      required: true,
      trim: true,
    },
    class: {
      type: String, // Class/Grade (e.g., "1", "2", "10", "11 Science")
      required: true,
      trim: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },

    /* -------- Optional NIF/Program Fields (for institutions that use them) -------- */
    batchCode: {
      type: String, // Optional batch code
      trim: true,
    },
    course: {
      type: String, // Optional course/program name
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
    stream: { type: String, trim: true },
    programType: {
      type: String,
      enum: ["ADV_CERT", "B_VOC", "M_VOC", "B_DES"],
    },
    programLabel: { type: String, trim: true },
    grade: {
      type: String, // Alternative to 'class' field
      trim: true,
    },

    /* -------- Fee Information -------- */
    totalFee: { type: Number, min: 0 },
    feeInstallments: {
      type: [feeInstallmentSchema],
      default: [],
    },
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
nifStudentSchema.index({ schoolId: 1, campusId: 1, createdAt: -1 });

module.exports = mongoose.model("NifStudent", nifStudentSchema);
