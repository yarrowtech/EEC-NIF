const mongoose = require('mongoose');

const chatKeySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    userType: { type: String, enum: ['student', 'teacher', 'parent'], required: true, index: true },
    publicKey: { type: String, required: true },
    privateKey: { type: String, default: '' },
  },
  { timestamps: true }
);

chatKeySchema.index({ userId: 1, userType: 1 }, { unique: true });

module.exports = mongoose.model('ChatKey', chatKeySchema);
