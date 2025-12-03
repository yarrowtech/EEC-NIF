
const mongoose = require("mongoose");
const { Schema } = mongoose;

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
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },

    /* -------- NIF academic / admission details -------- */
    serialNo: {
      type: Number, // Srl No from sheet (optional)
    },
    batchCode: {
      type: String, // Batch Code
      trim: true,
    },
    admissionDate: {
      type: Date, // Date of Adm
    },
    roll: {
      type: String,
      trim: true,
    },
    grade: {
      type: String, // Program (B.Voc / Certificate etc.)
      trim: true,
    },
    section: {
      type: String,
      trim: true,
    },
    course: {
      type: String, // Course Name from sheet
      trim: true,
    },
    duration: {
      type: String, // Duration from sheet
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

    /* -------- Personal / address -------- */
    dob: {
      type: Date,
    },
    address: {
      type: String,
      default: "",
    },
    pincode: {
      type: String,
      default: "",
    },

    /* -------- Meta -------- */
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    source: {
      type: String,
      enum: ["manual", "bulk"],
      default: "manual",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("NifStudent", nifStudentSchema);
