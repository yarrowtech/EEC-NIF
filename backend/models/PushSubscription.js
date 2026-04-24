const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    campusId: { type: String, default: null, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    userType: {
      type: String,
      enum: ['Admin', 'Teacher', 'Student', 'Parent', 'Principal'],
      required: true,
      index: true,
    },
    endpoint: { type: String, required: true, unique: true, index: true },
    expirationTime: { type: Date, default: null },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: { type: String, default: '' },
    disabled: { type: Boolean, default: false, index: true },
    lastSuccessAt: { type: Date, default: null },
    lastFailureAt: { type: Date, default: null },
    failureCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

pushSubscriptionSchema.index({ schoolId: 1, userId: 1, endpoint: 1 }, { unique: true });

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);

