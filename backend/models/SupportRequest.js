const mongoose = require('mongoose');

const auditEntrySchema = new mongoose.Schema(
  {
    status: { type: String, default: 'open' },
    note: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    changedByName: String
  },
  { _id: false }
);

const passwordResetSchema = new mongoose.Schema(
  {
    performedAt: Date,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    performedByName: String,
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    targetUserId: { type: mongoose.Schema.Types.ObjectId },
    message: String
  },
  { _id: false }
);

const supportRequestSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, unique: true },
    supportType: {
      type: String,
      enum: ['password-reset', 'feedback', 'complaint', 'other'],
      required: true
    },
    category: { type: String, default: 'Support' },
    subject: String,
    message: String,
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved'],
      default: 'open'
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
    owner: { type: String, default: 'Support Desk' },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
    schoolName: String,
    campusType: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    createdByName: String,
    createdByRole: String,
    contactEmail: String,
    contactPhone: String,
    targetRole: String,
    targetEmail: String,
    requestDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
    resolutionNotes: String,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    resolvedByName: String,
    resolvedAt: Date,
    passwordReset: passwordResetSchema,
    auditTrail: { type: [auditEntrySchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportRequest', supportRequestSchema);
