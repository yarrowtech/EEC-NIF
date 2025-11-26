// backend/models/nifFeeStructures.js
const mongoose = require('mongoose');

const ScheduleItemSchema = new mongoose.Schema(
  { label: { type: String, required: true }, amount: { type: Number, required: true, min: 0 } },
  { _id: false }
);

const YearScheduleSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true, min: 1 },
    items: { type: [ScheduleItemSchema], default: [] },
    totalYear: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const AdditionalChargeSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    frequency: { type: String, default: 'per annum' }, // e.g., 'one-time', 'per annum'
    payableTo: { type: String, default: '' },
  },
  { _id: false }
);

const NifFeeStructureSchema = new mongoose.Schema(
  {
    courseName: { type: String, required: true, index: true }, // matches your UI 'grade'
    session: { type: String, required: true, index: true },    // e.g., '2025-26'
    durationYears: { type: Number, required: true, min: 1 },
    schedule: { type: [YearScheduleSchema], default: [] },
    additionalCharges: { type: [AdditionalChargeSchema], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

NifFeeStructureSchema.index({ courseName: 1, session: 1 }, { unique: true });

module.exports =
  mongoose.models.NifFeeStructure || mongoose.model('NifFeeStructure', NifFeeStructureSchema);
