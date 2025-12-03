const mongoose = require("mongoose");
const { Schema } = mongoose;

const PaymentEntrySchema = new Schema({
  amount: Number,
  method: {
    type: String,
    enum: ["cash", "card", "upi", "bank_transfer", "cheque"],
    required: true,
  },
  date: { type: Date, default: Date.now },
});

const NifFeeRecordSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "NifStudent", required: true },

    programType: String,
    stream: String,
    course: String,
    yearNumber: Number,
    session: { type: String, default: "2025-26" },

    totalFee: Number,
    paidAmount: { type: Number, default: 0 },
    dueAmount: Number,
    status: { type: String, enum: ["paid", "partial", "due"], default: "due" },

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

module.exports = mongoose.model("NifFeeRecord", NifFeeRecordSchema);
