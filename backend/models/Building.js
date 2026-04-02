const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    campusId: { type: String, default: null, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    key: { type: String, required: true, trim: true, lowercase: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

buildingSchema.index(
  { schoolId: 1, campusId: 1, key: 1 },
  { unique: true, name: 'uniq_building_per_campus' }
);

buildingSchema.index(
  { schoolId: 1, campusId: 1, code: 1 },
  { unique: true, name: 'uniq_building_code_per_campus' }
);

module.exports = mongoose.model('Building', buildingSchema);
