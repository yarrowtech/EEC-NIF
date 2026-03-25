const mongoose = require('mongoose');
const { Schema } = mongoose;

const alcoveSubmissionSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'AlcovePost',
    required: true,
    index: true  // For efficient queries by post
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'StudentUser',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  answerText: {
    type: String,
    required: true,
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true  // For school isolation
  },
  grade: String,      // Student's class (for context)
  section: String     // Student's section (for context)
}, {
  timestamps: true
});

// Compound index: prevent duplicate submissions from same student for same post
alcoveSubmissionSchema.index({ postId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('AlcoveSubmission', alcoveSubmissionSchema);
