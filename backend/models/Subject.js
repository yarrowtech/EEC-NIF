const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    campusId: { type: String, default: null, index: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    stream: {
      type: String,
      enum: ['science', 'commerce', 'arts', 'mixed'],
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
