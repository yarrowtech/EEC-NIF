const mongoose = require('mongoose');

const AlcoveCommentSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'AlcovePost', required: true, index: true },
    authorId: { type: String },
    authorType: { type: String, enum: ['student', 'teacher', 'parent', 'unknown'], default: 'unknown' },
    authorName: { type: String, default: 'Anonymous' },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AlcoveComment', AlcoveCommentSchema);

