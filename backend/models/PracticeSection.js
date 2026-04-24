const mongoose = require('mongoose');

const practiceSectionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeacherUser',
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      example: 'Chapter 5 Practice', // Organizational label
    },
    description: {
      type: String,
      default: '',
      example: 'Practice questions covering Chapter 5 concepts',
    },
    icon: {
      type: String,
      default: 'folder-open',
      enum: ['folder-open', 'book', 'target', 'zap', 'award', 'star', 'trophy', 'checkmark'],
    },
    color: {
      type: String,
      default: 'bg-blue-100',
      enum: [
        'bg-blue-100',
        'bg-green-100',
        'bg-red-100',
        'bg-purple-100',
        'bg-yellow-100',
        'bg-pink-100',
        'bg-indigo-100',
      ],
    },
    order: {
      type: Number,
      default: 0,
      index: true, // For sorting sections in order
    },

    // Metadata
    paperCount: {
      type: Number,
      default: 0,
      // Automatically updated when papers are added/removed
    },
    papers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PracticePaper',
      },
    ],

    // Statistics
    totalAttempts: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    passRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Status
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
practiceSectionSchema.index({ schoolId: 1, classId: 1, status: 1 });
practiceSectionSchema.index({ teacherId: 1, status: 1, createdAt: -1 });
practiceSectionSchema.index({ schoolId: 1, subjectId: 1, status: 1 });

// Pre-save middleware to update timestamp
practiceSectionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PracticeSection', practiceSectionSchema);
