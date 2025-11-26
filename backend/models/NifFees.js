// backend/models/NifFees.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank_transfer', 'cheque'],
      required: true,
    },
    date: { type: Date, default: Date.now },
    transactionId: { type: String },
    remarks: { type: String },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { _id: false }
);

const nifFeesSchema = new mongoose.Schema(
  {
    // 🔗 NIF student reference
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NifStudent',
      required: true,
    },

    // e.g. "2025-26"
    academicYear: { type: String, required: true },

    // Term-wise if you need, but main table is annual
    term: {
      type: String,
      enum: ['Term 1', 'Term 2', 'Annual', 'Semester 1', 'Semester 2'],
      default: 'Annual',
    },

    // Stream + duration based on your NIF courses
    program: { type: String, required: true }, // e.g. "Fashion Design - 1 Year ACP"
    section: { type: String, required: true }, // A / B / C / D

    // ⭐ NEW: only 1-year / 2-year NIF courses
    courseDuration: {
      type: String,
      enum: ['1 Year', '2 Years'],
      required: true,
    },
    // for 2-year course: 1 or 2; for 1-year course: always 1
    yearNumber: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },

    // ===== Fee structure specific to your sheet (per year) =====
    // Table shows 1,55,000 per year with 10 instalments + registration parts. 
    timeOfAdmissionFee: { type: Number, default: 22000 },
    timeOfBatchCommencementFee: { type: Number, default: 19000 },

    registrationPart1: { type: Number, default: 5000 },
    registrationPart2: { type: Number, default: 17000 },
    registrationPart3: { type: Number, default: 17000 },

    instalment1: { type: Number, default: 7500 },
    instalment2: { type: Number, default: 7500 },
    instalment3: { type: Number, default: 7500 },
    instalment4: { type: Number, default: 7500 },
    instalment5: { type: Number, default: 7500 },
    instalment6: { type: Number, default: 7500 },
    instalment7: { type: Number, default: 7500 },
    instalment8: { type: Number, default: 7500 },
    instalment9: { type: Number, default: 7500 },
    instalment10: { type: Number, default: 7500 },

    // Extra yearly subscription (Voice of Fashion – 3,540 per annum) 
    voiceOfFashionSubscription: { type: Number, default: 3540 },

    // ===== Aggregates (used by frontend) =====
    totalDue: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, required: true },

    overdueFine: { type: Number, default: 0 },

    dueDate: { type: Date },
    lastPayment: { type: Date },

    status: {
      type: String,
      enum: ['paid', 'partial', 'due'],
      default: 'due',
    },

    payments: [paymentSchema],
  },
  { timestamps: true }
);

// Compute yearly total & status for 1-year / 2-year courses
nifFeesSchema.pre('save', function (next) {
  // sum exactly what’s on the sheet (without the Voice of Fashion subscription, which is extra)
  const baseYearlyTotal =
    (this.timeOfAdmissionFee || 0) +
    (this.timeOfBatchCommencementFee || 0) +
    (this.registrationPart1 || 0) +
    (this.registrationPart2 || 0) +
    (this.registrationPart3 || 0) +
    (this.instalment1 || 0) +
    (this.instalment2 || 0) +
    (this.instalment3 || 0) +
    (this.instalment4 || 0) +
    (this.instalment5 || 0) +
    (this.instalment6 || 0) +
    (this.instalment7 || 0) +
    (this.instalment8 || 0) +
    (this.instalment9 || 0) +
    (this.instalment10 || 0);

  // The table total is 1,55,000 per year; if someone forgets to pass amounts, enforce that. 
  const enforcedYearlyTotal = baseYearlyTotal || 155000;

  if (!this.totalDue || this.totalDue === 0) {
    this.totalDue = enforcedYearlyTotal;
  }
  if (this.dueAmount == null) {
    this.dueAmount = this.totalDue - this.paidAmount;
  }

  if (this.dueAmount <= 0) {
    this.dueAmount = 0;
    this.status = 'paid';
  } else if (this.paidAmount > 0 && this.dueAmount > 0) {
    this.status = 'partial';
  } else {
    this.status = 'due';
  }

  next();
});

module.exports = mongoose.model('NifFees', nifFeesSchema);
