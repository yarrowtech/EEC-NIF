const mongoose = require('mongoose');

const teacherExpenseSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    campusId: { type: String, default: null, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherUser', required: true, index: true },
    teacherName: { type: String, default: '' },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    expenseDate: { type: String, required: true }, // YYYY-MM-DD
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    receiptUrl: { type: String, default: '' },
    receiptName: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    reviewedAt: { type: Date, default: null },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

teacherExpenseSchema.index({ schoolId: 1, campusId: 1, teacherId: 1, expenseDate: 1, category: 1 });

module.exports = mongoose.model('TeacherExpense', teacherExpenseSchema);
