// backend/models/NifFeeRecord.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// 🔁 Put your exact values from PDFs here:
const NIF_FEE_TOTALS = {
  ADV_CERT: {
    1: 155000, // 1-year OR Year 1 of 2-year
    2: 155000, // Year 2 of 2-year (if used)
  },
  B_VOC: {
    1: 191000,
    2: 191000,
    3: 191000,
  },
  M_VOC: {
    1: 205000,
    2: 205000,
  },
  B_DES: {
    1: 203000,
    2: 203000,
    3: 203000,
    4: 203000,
  },
};

function getNifFeeTotal(programType, yearNumber) {
  const type = NIF_FEE_TOTALS[programType];
  if (!type) return null;
  return type[yearNumber] || null;
}

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank_transfer', 'cheque'],
      default: 'cash',
    },
    paidOn: { type: Date, default: Date.now },
    reference: String,
    notes: String,
  },
  { _id: false }
);

const installmentSnapshotSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    dueMonth: { type: String },
    status: {
      type: String,
      enum: ['paid', 'partial', 'due'],
      default: 'due',
    },
    paid: { type: Number, default: 0, min: 0 },
    outstanding: { type: Number, default: 0, min: 0 },
    paidOn: { type: Date },
    method: { type: String },
  },
  { _id: false }
);

const NifFeeRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NifStudent',
      required: true,
    },

    programType: {
      type: String,
      enum: ['ADV_CERT', 'B_VOC', 'M_VOC', 'B_DES'],
      required: true,
    },
    programLabel: { type: String },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'NifCourse' },
    course: { type: String, required: true }, // Stream
    courseName: { type: String },

    academicYear: { type: String, required: true }, // "2025-26"
    yearNumber: { type: Number, enum: [1, 2, 3, 4], required: true },

    totalFee: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, required: true },

    lastPayment: { type: Date },
    status: {
      type: String,
      enum: ['paid', 'partial', 'due'],
      default: 'due',
    },

    payments: [paymentSchema],
    installmentsSnapshot: { type: [installmentSnapshotSchema], default: [] },
  },
  { timestamps: true }
);

NifFeeRecordSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

// Create a record for a given student + year
NifFeeRecordSchema.statics.createForStudentYear = async function (
  student,
  yearNumber,
  options = {}
) {
  const total =
    typeof options.totalFee === 'number'
      ? options.totalFee
      : typeof student.totalFee === 'number'
      ? student.totalFee
      : getNifFeeTotal(
          options.programType || student.programType,
          yearNumber
        );
  if (!total) throw new Error('No NIF fee total for this program/year');

  return this.create({
    student: student._id,
    programType: options.programType || student.programType,
    programLabel: options.programLabel || student.programLabel,
    courseId: options.courseId || student.courseId,
    course: options.stream || student.stream || student.course,
    courseName: options.courseName || student.course,
    academicYear:
      options.academicYear || student.academicYear || '2025-26',
    yearNumber,
    totalFee: total,
    paidAmount: 0,
    dueAmount: total,
    status: 'due',
    installmentsSnapshot:
      options.installments || student.feeInstallments || [],
  });
};

module.exports = mongoose.model('NifFeeRecord', NifFeeRecordSchema);
