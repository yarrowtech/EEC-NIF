// backend/models/NifFeeConfig.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const FeeComponentSchema = new Schema({
  label: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
});

const DiscountSchema = new Schema({
  type: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
  value: { type: Number, required: true, min: 0 },
  description: { type: String },
  applicableCategories: [String],
});

const NifFeeConfigSchema = new Schema(
  {
    session: { type: String, default: "2025-26", trim: true },

    programType: { type: String, required: true, trim: true }, // ADV_CERT, B_VOC, etc
    stream: { type: String, required: true, trim: true }, // Fashion / Interior
    course: { type: String, required: true, trim: true }, // "Fashion Design"
    yearNumber: { type: Number, required: true, min: 1 },

    feeComponents: [FeeComponentSchema],
    totalFee: { type: Number, required: true, min: 0 },

    discounts: [DiscountSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

NifFeeConfigSchema.index(
  { session: 1, programType: 1, stream: 1, course: 1, yearNumber: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.NifFeeConfig ||
  mongoose.model("NifFeeConfig", NifFeeConfigSchema);
