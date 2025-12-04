// backend/models/NifFeeRecord.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const PaymentEntrySchema = new Schema({
  amount: { type: Number, required: true, min: 0 },
  method: {
    type: String,
    enum: ["cash", "card", "upi", "bank_transfer", "cheque"],
    required: true,
  },
  date: { type: Date, default: Date.now },
  note: { type: String, trim: true },
});

const NifFeeRecordSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "NifStudent",
      required: true,
    },

    session: { type: String, default: "2025-26", trim: true },
    programType: { type: String, required: true, trim: true },
    stream: { type: String, trim: true },
    course: { type: String, required: true, trim: true },
    yearNumber: { type: Number, required: true, min: 1 },

    totalFee: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    dueAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["paid", "partial", "due"],
      default: "due",
    },

    feeConfig: { type: Schema.Types.ObjectId, ref: "NifFeeConfig" },

    payments: [PaymentEntrySchema],
    lastPayment: Date,
  },
  { timestamps: true }
);

NifFeeRecordSchema.index(
  { student: 1, programType: 1, course: 1, yearNumber: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.NifFeeRecord ||
  mongoose.model("NifFeeRecord", NifFeeRecordSchema);
