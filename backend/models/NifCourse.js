// backend/models/NifCourse.js
const mongoose = require("mongoose");

const { Schema } = mongoose;

const nifCourseSchema = new Schema(
  {
    // what your cards render
    title: { type: String, required: true, trim: true },          // e.g., "1 Year Certificate Program"
    department: { type: String, required: true, trim: true },      // e.g., "Fashion Design" | "Interior Design"

    // optional details the cards may show
    desc: { type: String, default: "" },
    duration: { type: String, required: true, trim: true },        // e.g., "1 year", "6 months"
    fees: { type: Number, required: true, min: 0 },                // INR
    instructor: { type: String, default: "" },
    totalStudents: { type: Number, default: 0, min: 0 },
    startingDate: { type: Date },

    // lifecycle
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },

    // audit
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

// Avoid duplicate course names within the same department
nifCourseSchema.index({ title: 1, department: 1 }, { unique: true });
// Quick filters
nifCourseSchema.index({ department: 1, status: 1 });

module.exports =
  mongoose.models.NifCourse || mongoose.model("NifCourse", nifCourseSchema);
