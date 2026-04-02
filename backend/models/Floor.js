const mongoose = require('mongoose');

const floorSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    campusId: { type: String, default: null, index: true },
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true, index: true },
    name: { type: String, required: true, trim: true },
    floorCode: { type: String, required: true, trim: true, uppercase: true },
    codeKey: { type: String, required: true, trim: true, lowercase: true },
    key: { type: String, required: true, trim: true, lowercase: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

floorSchema.index(
  { schoolId: 1, campusId: 1, buildingId: 1, key: 1 },
  { unique: true, name: 'uniq_floor_name_per_building' }
);

floorSchema.index(
  { schoolId: 1, campusId: 1, buildingId: 1, codeKey: 1 },
  { unique: true, name: 'uniq_floor_code_per_building' }
);

module.exports = mongoose.model('Floor', floorSchema);
