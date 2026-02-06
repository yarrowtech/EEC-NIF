const mongoose = require('mongoose');

const teacherAllocationSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus', default: null },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherUser', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    isClassTeacher: { type: Boolean, default: false },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

teacherAllocationSchema.index(
  { schoolId: 1, campusId: 1, teacherId: 1, subjectId: 1, classId: 1, sectionId: 1 },
  { unique: true, name: 'unique_teacher_allocation' }
);

module.exports = mongoose.model('TeacherAllocation', teacherAllocationSchema);
