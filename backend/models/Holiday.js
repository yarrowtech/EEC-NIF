const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    campusId: { type: String, default: null, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    date: { type: Date, required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true }
);

holidaySchema.index({ schoolId: 1, campusId: 1, date: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Holiday', holidaySchema);
