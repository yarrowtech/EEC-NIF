const mongoose = require("mongoose");
const { Schema } = mongoose;

const FeeComponentSchema = new Schema({
  label: { type: String, required: true },
  amount: { type: Number, required: true },
});

const DiscountSchema = new Schema({
  type: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
  value: { type: Number, required: true },
  description: { type: String },
  applicableCategories: [String],
});

const NifFeeConfigSchema = new Schema(
  {
    programType: { type: String, required: true }, // ADV_CERT, B_VOC, M_VOC
    stream: { type: String, required: true }, // Fashion / Interior
    course: { type: String, required: true }, // Fashion Design
    yearNumber: { type: Number, required: true },
    session: { type: String, default: "2025-26" },

    feeComponents: [FeeComponentSchema],
    totalFee: { type: Number, required: true },

    discounts: [DiscountSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

NifFeeConfigSchema.index(
  { programType: 1, stream: 1, course: 1, yearNumber: 1, session: 1 },
  { unique: true }
);

module.exports = mongoose.model("NifFeeConfig", NifFeeConfigSchema);
