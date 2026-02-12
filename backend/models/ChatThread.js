const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userType: { type: String, enum: ['student', 'teacher', 'parent'], required: true },
  name: { type: String, default: '' },
}, { _id: false });

const unreadCountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  count: { type: Number, default: 0 },
}, { _id: false });

const chatThreadSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  campusId: { type: String, required: true },
  participants: [participantSchema],
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: null },
  lastSenderId: { type: mongoose.Schema.Types.ObjectId, default: null },
  unreadCounts: [unreadCountSchema],
}, { timestamps: true });

// Unique thread per pair of participants in same campus
chatThreadSchema.index({ schoolId: 1, campusId: 1, 'participants.userId': 1 });

module.exports = mongoose.model('ChatThread', chatThreadSchema);
