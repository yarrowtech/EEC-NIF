const mongoose = require('mongoose');

const superAdminAnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    audience: { type: String, default: 'All schools', trim: true },
    status: { type: String, enum: ['scheduled', 'sent', 'failed'], default: 'sent' },
    targetSchools: { type: Number, default: 0 },
    notificationsCreated: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    createdByName: { type: String, default: '' },
  },
  { timestamps: true }
);

superAdminAnnouncementSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SuperAdminAnnouncement', superAdminAnnouncementSchema);

