const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    campusId: { type: String, default: null, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    audience: { type: String, enum: ['Admin', 'Teacher', 'Student', 'Parent', 'All'], default: 'All' },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    createdByType: { type: String, enum: ['admin', 'teacher'], default: 'admin' },
    createdByTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherUser', default: null },
    createdByName: { type: String, default: '' },
    className: { type: String, default: '' },
    sectionName: { type: String, default: '' },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    subjectName: { type: String, default: '' },

    // Notification metadata
    type: {
      type: String,
      enum: ['notice', 'class_note', 'assignment', 'exam', 'result', 'fee', 'general', 'announcement', 'other'],
      default: 'general',
      index: true
    },
    typeLabel: { type: String, default: '' },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true
    },
    category: {
      type: String,
      enum: ['academic', 'events', 'transport', 'general'],
      default: 'general'
    },

    // Related entity reference
    relatedEntity: {
      entityType: { type: String, enum: ['assignment', 'exam', 'fee', 'result', null] },
      entityId: { type: mongoose.Schema.Types.ObjectId }
    },
    attachments: [
      {
        name: { type: String, default: '' },
        url: { type: String, default: '' },
        size: { type: Number, default: 0 },
        type: { type: String, default: '' },
      },
    ],

    // Read tracking
    readBy: [{
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      readAt: { type: Date, default: Date.now }
    }],

    // Dismiss tracking
    dismissedBy: [{
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      dismissedAt: { type: Date, default: Date.now }
    }],

    // Expiration
    expiresAt: { type: Date, index: true }
  },
  { timestamps: true }
);

// Add compound indexes for efficient queries
notificationSchema.index({ schoolId: 1, audience: 1, createdAt: -1 });
notificationSchema.index({ schoolId: 1, campusId: 1, audience: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
