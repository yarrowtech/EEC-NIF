const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    campusId: { type: String, default: null, index: true },
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, default: '', index: true },
    description: { type: String, default: '', trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true }
);

departmentSchema.pre('validate', function setNormalizedName(next) {
  this.normalizedName = String(this.name || '').trim().toLowerCase();
  next();
});

departmentSchema.index(
  { schoolId: 1, campusId: 1, normalizedName: 1 },
  { unique: true, name: 'unique_department_per_scope' }
);

module.exports = mongoose.model('Department', departmentSchema);
