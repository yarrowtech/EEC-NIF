const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  courseName: { type: String, required: true },
  courseCode: { type: String, required: true, unique: true },
  description: String,
  duration: String,
  credits: Number,
  department: { type: String, required: true },
  prerequisites: String,
  instructor: String,
  startingDate: String,
  totalStudents: { type: Number, default: 0 },
  status: { type: String, default: 'Active', enum: ['Active', 'Inactive', 'Draft'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Course", courseSchema)
