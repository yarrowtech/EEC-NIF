const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    reportedBy: { type: String },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
    schoolName: { type: String },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved'],
      default: 'open'
    },
    owner: { type: String, default: 'Support' },
    description: { type: String },
    resolutionNotes: { type: String },
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    resolvedByName: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Issue', issueSchema);
