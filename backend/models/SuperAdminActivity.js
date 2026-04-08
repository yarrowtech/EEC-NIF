const mongoose = require('mongoose');

const superAdminActivitySchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['incident', 'approval', 'broadcast', 'compliance', 'other'],
      default: 'other',
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

superAdminActivitySchema.index({ timestamp: -1, createdAt: -1 });

module.exports = mongoose.model('SuperAdminActivity', superAdminActivitySchema);

