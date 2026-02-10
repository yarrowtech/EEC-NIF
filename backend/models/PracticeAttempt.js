const mongoose = require('mongoose');

const practiceAttemptSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    campusId: { type: String, default: null, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentUser', required: true, index: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PracticeQuestion', required: true, index: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    answer: { type: String, default: '' },
    isCorrect: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PracticeAttempt', practiceAttemptSchema);
