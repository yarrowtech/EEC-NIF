const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  campusId: { type: String, default: null },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherUser', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  subject: String,
  type: { type: String, default: 'Assignment' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  class: String,
  section: { type: String, default: '' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  marks: { type: Number, default: 100 },
  attachments: [{
    name: { type: String },
    url: { type: String },
    type: { type: String, default: 'pdf' }
  }],
  submissionFormat: {
    type: String,
    enum: ['text', 'pdf'],
    default: 'text'
  },
  status: {
    type: String,
    enum: ["draft", "active"],
    default: "draft",
  },
  dueDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model("Assignment", assignmentSchema);
