const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  title: String,
  subject: String,
  class: String,
  marks: Number,
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
