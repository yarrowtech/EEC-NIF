const mongoose = require('mongoose');

const seenBySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  seenAt: { type: Date, default: Date.now },
}, { _id: false });

const chatMessageSchema = new mongoose.Schema({
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatThread', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  senderType: { type: String, enum: ['student', 'teacher'], required: true },
  senderName: { type: String, default: '' },
  text: { type: String, required: true, trim: true },
  seenBy: [seenBySchema],
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  campusId: { type: String, required: true },
}, { timestamps: true });

chatMessageSchema.index({ threadId: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
