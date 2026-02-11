const mongoose = require('mongoose');

const lessonPlanCompletionSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    campusId: { type: String, default: null, index: true },
    lessonPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'LessonPlan', required: true, index: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherUser', required: true, index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    className: { type: String, default: '' },
    sectionName: { type: String, default: '' },
    teacherName: { type: String, default: '' },
    subject: { type: String, default: '' },
    title: { type: String, default: '' },
    date: { type: Date, required: true, index: true },
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    completionPercent: { type: Number, min: 0, max: 100, default: 0 },
    isCompleted: { type: Boolean, default: false },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

lessonPlanCompletionSchema.index({ lessonPlanId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('LessonPlanCompletion', lessonPlanCompletionSchema);
