const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeInvoice', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentUser', required: true },
    transactionId: { type: String, default: null, trim: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR', trim: true },
    method: { type: String, default: 'cash' },
    paidOn: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
    initiatedByType: { type: String, default: null, trim: true },
    initiatedById: { type: mongoose.Schema.Types.ObjectId, default: null },
    gateway: { type: String, default: null },
    gatewayOrderId: { type: String, default: null },
    gatewayPaymentId: { type: String, default: null },
    gatewaySignature: { type: String, default: null },
    gatewayStatus: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

feePaymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
feePaymentSchema.index({ gatewayPaymentId: 1 }, { unique: true, sparse: true });
feePaymentSchema.index({ gatewayOrderId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('FeePayment', feePaymentSchema);
