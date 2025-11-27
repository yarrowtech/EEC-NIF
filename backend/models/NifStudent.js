
// // backend/models/NifStudent.js
// const mongoose = require("mongoose");
// const { Schema } = mongoose;

// const attendanceSchema = new Schema(
//   {
//     date: { type: Date, required: true },
//     status: {
//       type: String,
//       enum: ["present", "absent", "leave"],
//       required: true,
//     },
//     remarks: { type: String, default: "" },
//     markedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
//   },
//   { _id: false }
// );

// const nifStudentSchema = new Schema(
//   {
//     // Basic identity
//     name: { type: String, required: true, trim: true },
//     roll: { type: String, required: true, trim: true }, // unique per student
//     gender: {
//       type: String,
//       enum: ["Male", "Female", "Other"],
//       required: true,
//     },

//     // Academic / Program (you’re using `grade` as “Program” in UI)
//     grade: { type: String, required: true, trim: true },   // e.g. "Fashion Design - 1 year Certificate Program"
//     section: { type: String, required: true, trim: true }, // A/B/C/D

//     // Contact
//     mobile: { type: String, required: true, trim: true },
//     email: { type: String, required: true, trim: true, lowercase: true },
//     address: { type: String, default: "" },
//     pincode: { type: String, default: "" },

//     // NIF specific
//     course: { type: String, default: "" }, // optional, can map to NifCourse in future
//     dob: { type: Date, required: true },

//     status: {
//       type: String,
//       enum: ["Active", "Inactive", "Alumni", "Dropped"],
//       default: "Active",
//     },

//     // Embedded attendance records
//     attendance: { type: [attendanceSchema], default: [] },
//   },
//   { timestamps: true }
// );

// // Uniqueness
// nifStudentSchema.index({ roll: 1 }, { unique: true });
// nifStudentSchema.index({ email: 1 }, { unique: true });

// module.exports =
//   mongoose.models.NifStudent || mongoose.model("NifStudent", nifStudentSchema);


// models/NifStudent.js
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
