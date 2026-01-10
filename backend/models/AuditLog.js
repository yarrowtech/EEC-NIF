const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId },
    actorType: { type: String, trim: true },
    action: { type: String, required: true, trim: true },
    entity: { type: String, trim: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    meta: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
