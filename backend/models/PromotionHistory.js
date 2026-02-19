const mongoose = require('mongoose');

const promotionHistorySchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
    campusId: { type: String, default: null },
    fromClass: { type: String, required: true },
    toClass: { type: String, required: true },
    fromSection: { type: String, default: null },
    toSection: { type: String, default: null },
    fromAcademicYear: { type: String, default: null },
    toAcademicYear: { type: String, default: null },
    studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentUser' }],
    studentCount: { type: Number, default: 0 },
    type: { type: String, enum: ['bulk', 'manual'], default: 'manual' },
    promotedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PromotionHistory', promotionHistorySchema);
