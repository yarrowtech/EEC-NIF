const mongoose = require('mongoose');

const AlcovePostSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, index: true, trim: true },
    chapter: { type: String, required: true, index: true, trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium', index: true },
    problemText: { type: String, required: true },
    solutionText: { type: String, required: true },
    highlighted: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherUser' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AlcovePost', AlcovePostSchema);

