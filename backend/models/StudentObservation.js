const mongoose = require('mongoose');

const observationSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    campusId: { type: String, default: null },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherUser', default: null },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParentUser', default: null },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentUser', required: true },
    studentName: { type: String, default: '' },
    className: { type: String, default: '' },
    section: { type: String, default: '' },
    recordedAt: { type: Date, default: Date.now },
    source: {
      type: String,
      enum: ['teacher', 'parent'],
      default: 'teacher',
    },
    category: { type: String, default: '' },
    observationText: { type: String, default: '' },
    healthObservations: { type: mongoose.Schema.Types.Mixed, default: {} },
    emotionObservations: { type: mongoose.Schema.Types.Mixed, default: {} },
    additionalNotes: { type: String, default: '' },
    behaviorNotes: { type: String, default: '' },
    moodRating: { type: Number, min: 1, max: 5, default: null },
    concernLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'low',
    },
    urgencyLevel: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    followUpRequired: { type: Boolean, default: false },
    parentNotification: { type: Boolean, default: false },
  },
  { timestamps: true }
);

observationSchema.index({ schoolId: 1, teacherId: 1, recordedAt: -1 });
observationSchema.index({ schoolId: 1, studentId: 1, recordedAt: -1 });
observationSchema.index({ schoolId: 1, parentId: 1, recordedAt: -1 });

module.exports = mongoose.model('StudentObservation', observationSchema);
