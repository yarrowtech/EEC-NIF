const mongoose = require('mongoose');

const teacherAllocationSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    campusId: { type: String, default: null, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherUser', required: true, index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    isClassTeacher: { type: Boolean, default: false },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

teacherAllocationSchema.index(
  { schoolId: 1, campusId: 1, teacherId: 1, classId: 1, sectionId: 1, subjectId: 1 },
  { unique: true, name: 'uniq_teacher_subject_class_section_scope' }
);

module.exports = mongoose.model('TeacherAllocation', teacherAllocationSchema);
