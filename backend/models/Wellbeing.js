const mongoose = require('mongoose');

const WellbeingSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentUser',
    required: true,
    unique: true,
  },
  mood: {
    type: String,
    enum: ['excellent', 'good', 'neutral', 'concerning', 'critical'],
    default: 'neutral',
  },
  socialEngagement: {
    type: Number,
    min: 1,
    max: 10,
    default: 5,
  },
  academicStress: {
    type: Number,
    min: 1,
    max: 10,
    default: 5,
  },
  behaviorChanges: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    default: '',
  },
  interventions: [{
    type: String,
  }],
  counselingSessions: {
    type: Number,
    default: 0,
  },
  parentNotifications: {
    type: Number,
    default: 0,
  },
  lastAssessment: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Wellbeing', WellbeingSchema);
