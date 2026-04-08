const mongoose = require('mongoose');

const superAdminComplianceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    owner: { type: String, default: '', trim: true },
    dueDate: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  },
  { timestamps: true }
);

superAdminComplianceSchema.index({ createdAt: -1 });
superAdminComplianceSchema.index({ status: 1 });

module.exports = mongoose.model('SuperAdminCompliance', superAdminComplianceSchema);

