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
const mongoose = require("mongoose");
const { Schema } = mongoose;

/* ---------- Attendance Subdocument ---------- */
const attendanceSchema = new Schema(
  {
    date: { type: Date, required: true },
    status: { type: String, enum: ["present", "absent", "leave"], required: true },
    remarks: { type: String, default: "" },
    markedBy: { type: Schema.Types.ObjectId, ref: "TeacherUser" },
  },
  { _id: false }
);

/* ---------- Fees Subdocument (future-ready) ---------- */
const feesSchema = new Schema(
  {
    totalDue: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    nextDueDate: { type: Date },
    status: { type: String, enum: ["paid", "partial", "due"], default: "due" },
    lastPaymentDate: { type: Date },
  },
  { _id: false }
);

/* ---------- Wellbeing Subdocument (future-ready) ---------- */
const wellbeingSchema = new Schema(
  {
    mood: { type: String, enum: ["excellent", "good", "neutral", "concerning", "critical"], default: "neutral" },
    socialEngagement: { type: Number, min: 1, max: 10, default: 5 },
    academicStress: { type: Number, min: 1, max: 10, default: 5 },
    behaviorChanges: { type: Boolean, default: false },
    notes: { type: String, default: "" },
    interventions: [{ type: String }],
    counselingSessions: { type: Number, default: 0 },
    parentNotifications: { type: Number, default: 0 },
    lastAssessment: { type: Date },
  },
  { _id: false }
);

/* ---------- Main NIF Student Schema ---------- */
const nifStudentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    roll: { type: String, required: true, trim: true, unique: true, index: true },
    grade: { type: String, required: true },          // program label (UI)
    section: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
    address: { type: String, default: "" },
    dob: { type: Date, required: true },
    pincode: { type: String, default: "" },
    course: { type: String, default: "" },            // (optional) link later to Course
    status: { type: String, enum: ["Active", "Inactive", "Alumni", "Dropped"], default: "Active" },

    healthStatus: { type: String, enum: ["healthy", "sick", "injured", "absent-sick", "other"], default: "healthy" },
    attendance: { type: [attendanceSchema], default: [] },
    fees: feesSchema,
    wellbeing: wellbeingSchema,

    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

// common quick filters
nifStudentSchema.index({ name: "text", grade: 1, section: 1 });

module.exports = mongoose.models.NifStudent || mongoose.model("NifStudent", nifStudentSchema);
