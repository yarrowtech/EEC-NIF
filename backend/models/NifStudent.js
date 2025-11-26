// // backend/models/NifStudent.js
// const mongoose = require("mongoose");

// const { Schema } = mongoose;

// /* ---------- Attendance Subdocument ---------- */
// // used by: getTodayAttendance(student)
// const attendanceSchema = new Schema(
//   {
//     date: {
//       type: Date,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["present", "absent", "leave"],
//       required: true,
//     },
//     remarks: {
//       type: String,
//       default: "",
//     },
//     markedBy: {
//       type: Schema.Types.ObjectId,
//       ref: "TeacherUser", // or "Admin" – up to you
//     },
//   },
//   { _id: false }
// );

// /* ---------- Fees Subdocument ---------- */
// // will back your getFeesStatus() logic later
// const feesSchema = new Schema(
//   {
//     totalDue: {
//       type: Number,
//       default: 0,
//     },
//     totalPaid: {
//       type: Number,
//       default: 0,
//     },
//     nextDueDate: {
//       type: Date,
//     },
//     status: {
//       type: String,
//       enum: ["paid", "partial", "due"],
//       default: "due",
//     },
//     lastPaymentDate: {
//       type: Date,
//     },
//   },
//   { _id: false }
// );

// /* ---------- Emotional Wellbeing Subdocument ---------- */
// // will power the wellbeing modal
// const wellbeingSchema = new Schema(
//   {
//     mood: {
//       type: String,
//       enum: ["excellent", "good", "neutral", "concerning", "critical"],
//       default: "neutral",
//     },
//     socialEngagement: {
//       type: Number,
//       min: 1,
//       max: 10,
//       default: 5,
//     },
//     academicStress: {
//       type: Number,
//       min: 1,
//       max: 10,
//       default: 5,
//     },
//     behaviorChanges: {
//       type: Boolean,
//       default: false,
//     },
//     notes: {
//       type: String,
//       default: "",
//     },
//     interventions: [
//       {
//         type: String, // e.g. "Counseling session", "Mentor support"
//       },
//     ],
//     counselingSessions: {
//       type: Number,
//       default: 0,
//     },
//     parentNotifications: {
//       type: Number,
//       default: 0,
//     },
//     lastAssessment: {
//       type: Date,
//     },
//   },
//   { _id: false }
// );

// /* ---------- Main NIF Student Schema ---------- */
// // 🔴 IMPORTANT: field names match your frontend newStudent object
// const nifStudentSchema = new Schema(
//   {
//     // From Add Student frontend
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     roll: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     grade: {
//       // you're using program text like "Fashion Design - 1 year Certificate Program"
//       type: String,
//       required: true,
//     },
//     section: {
//       type: String,
//       required: true,
//     },
//     gender: {
//       type: String,
//       enum: ["Male", "Female", "Other"],
//       required: true,
//     },
//     mobile: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       lowercase: true,
//       trim: true,
//     },
//     address: {
//       type: String,
//       default: "",
//     },
//     dob: {
//       type: Date,
//       required: true,
//     },
//     pincode: {
//       type: String,
//       default: "",
//     },
//     course: {
//       type: String, // you can later convert to ObjectId ref: "Course"
//       default: "",
//     },
//     status: {
//       type: String,
//       enum: ["Active", "Inactive", "Alumni", "Dropped"],
//       default: "Active",
//     },

//     // NIF-specific only, does NOT touch existing StudentUser
//     healthStatus: {
//       type: String,
//       enum: ["healthy", "sick", "injured", "absent-sick", "other"],
//       default: "healthy",
//     },

//     attendance: [attendanceSchema],
//     fees: feesSchema,
//     wellbeing: wellbeingSchema,

//     // optional: link to your Admin / Institute if needed
//     createdBy: {
//       type: Schema.Types.ObjectId,
//       ref: "Admin",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("NifStudent", nifStudentSchema);



// backend/models/NifStudent.js
const mongoose = require('mongoose');

const NifStudentSchema = new mongoose.Schema(
  {
    // Basic info
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobile: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },

    // Academic identity used in your frontend
    roll: { type: String, required: true, unique: true }, // "roll"
    section: { type: String, default: 'A' },

    // This is your "grade" select text (program label)
    program: { type: String, required: true }, // e.g. "Fashion Design - 1 year Certificate Program"

    // Normalized for fees logic
    programType: {
      type: String,
      enum: ['ADV_CERT', 'B_VOC', 'M_VOC'],
      required: true,
    },
    course: {
      type: String,
      enum: ['Fashion Design', 'Interior Design'],
      required: true,
    },
    durationYears: { type: Number, enum: [1, 2, 3, 4], required: true },
    currentYear: { type: Number, enum: [1, 2, 3, 4], required: true },

    academicYear: { type: String, default: '2025-26' },

    // Address
    address: String,
    pincode: String,

    status: {
      type: String,
      enum: ['Active', 'Alumni', 'Dropped'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

NifStudentSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('NifStudent', NifStudentSchema);
