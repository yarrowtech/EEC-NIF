const Admin = require('../models/Admin');
const AcademicYear = require('../models/AcademicYear');
const AlcoveComment = require('../models/AlcoveComment');
const AlcovePost = require('../models/AlcovePost');
const AlcoveSubmission = require('../models/AlcoveSubmission');
const Assignment = require('../models/Assignment');
const AuditLog = require('../models/AuditLog');
const Behaviour = require('../models/Behaviour');
const Building = require('../models/Building');
const ChatMessage = require('../models/ChatMessage');
const ChatThread = require('../models/ChatThread');
const ClassModel = require('../models/Class');
const Department = require('../models/Department');
const Exam = require('../models/Exam');
const ExamGroup = require('../models/ExamGroup');
const ExamResult = require('../models/ExamResult');
const ExcuseLetter = require('../models/ExcuseLetter');
const FeeInvoice = require('../models/FeeInvoice');
const FeePayment = require('../models/FeePayment');
const FeeStructure = require('../models/FeeStructure');
const Feedback = require('../models/Feedback');
const Floor = require('../models/Floor');
const Holiday = require('../models/Holiday');
const Issue = require('../models/Issue');
const LessonPlan = require('../models/LessonPlan');
const LessonPlanCompletion = require('../models/LessonPlanCompletion');
const Notification = require('../models/Notification');
const ParentMeeting = require('../models/ParentMeeting');
const ParentUser = require('../models/ParentUser');
const PracticeAttempt = require('../models/PracticeAttempt');
const PracticeQuestion = require('../models/PracticeQuestion');
const Principal = require('../models/Principal');
const PromotionHistory = require('../models/PromotionHistory');
const ReportCardTemplate = require('../models/ReportCardTemplate');
const Room = require('../models/Room');
const Section = require('../models/Section');
const StaffUser = require('../models/StaffUser');
const StudentJournalEntry = require('../models/StudentJournalEntry');
const StudentObservation = require('../models/StudentObservation');
const StudentProgress = require('../models/StudentProgress');
const StudentUser = require('../models/StudentUser');
const Subject = require('../models/Subject');
const SupportRequest = require('../models/SupportRequest');
const TeacherAllocation = require('../models/TeacherAllocation');
const TeacherAttendance = require('../models/TeacherAttendance');
const TeacherExpense = require('../models/TeacherExpense');
const TeacherFeedback = require('../models/TeacherFeedback');
const TeacherLeave = require('../models/TeacherLeave');
const TeacherUser = require('../models/TeacherUser');
const Timetable = require('../models/Timetable');
const Wellbeing = require('../models/Wellbeing');

const SCHOOL_SCOPED_COLLECTIONS = [
  { name: 'AcademicYear', model: AcademicYear },
  { name: 'Admin', model: Admin },
  { name: 'AlcoveComment', model: AlcoveComment },
  { name: 'AlcovePost', model: AlcovePost },
  { name: 'AlcoveSubmission', model: AlcoveSubmission },
  { name: 'Assignment', model: Assignment },
  { name: 'AuditLog', model: AuditLog },
  { name: 'Behaviour', model: Behaviour },
  { name: 'Building', model: Building },
  { name: 'ChatMessage', model: ChatMessage },
  { name: 'ChatThread', model: ChatThread },
  { name: 'Class', model: ClassModel },
  { name: 'Department', model: Department },
  { name: 'Exam', model: Exam },
  { name: 'ExamGroup', model: ExamGroup },
  { name: 'ExamResult', model: ExamResult },
  { name: 'ExcuseLetter', model: ExcuseLetter },
  { name: 'FeeInvoice', model: FeeInvoice },
  { name: 'FeePayment', model: FeePayment },
  { name: 'FeeStructure', model: FeeStructure },
  { name: 'Feedback', model: Feedback },
  { name: 'Floor', model: Floor },
  { name: 'Holiday', model: Holiday },
  { name: 'Issue', model: Issue },
  { name: 'LessonPlan', model: LessonPlan },
  { name: 'LessonPlanCompletion', model: LessonPlanCompletion },
  { name: 'Notification', model: Notification },
  { name: 'ParentMeeting', model: ParentMeeting },
  { name: 'ParentUser', model: ParentUser },
  { name: 'PracticeAttempt', model: PracticeAttempt },
  { name: 'PracticeQuestion', model: PracticeQuestion },
  { name: 'Principal', model: Principal },
  { name: 'PromotionHistory', model: PromotionHistory },
  { name: 'ReportCardTemplate', model: ReportCardTemplate },
  { name: 'Room', model: Room },
  { name: 'Section', model: Section },
  { name: 'StaffUser', model: StaffUser },
  { name: 'StudentJournalEntry', model: StudentJournalEntry },
  { name: 'StudentObservation', model: StudentObservation },
  { name: 'StudentProgress', model: StudentProgress },
  { name: 'StudentUser', model: StudentUser },
  { name: 'Subject', model: Subject },
  { name: 'SupportRequest', model: SupportRequest },
  { name: 'TeacherAllocation', model: TeacherAllocation },
  { name: 'TeacherAttendance', model: TeacherAttendance },
  { name: 'TeacherExpense', model: TeacherExpense },
  { name: 'TeacherFeedback', model: TeacherFeedback },
  { name: 'TeacherLeave', model: TeacherLeave },
  { name: 'TeacherUser', model: TeacherUser },
  { name: 'Timetable', model: Timetable },
  { name: 'Wellbeing', model: Wellbeing },
];

async function deleteSchoolScopedData(schoolId) {
  const deletions = await Promise.all(
    SCHOOL_SCOPED_COLLECTIONS.map(async ({ name, model }) => {
      const result = await model.deleteMany({ schoolId });
      return { name, deletedCount: result?.deletedCount || 0 };
    })
  );

  return deletions.reduce((acc, item) => {
    acc[item.name] = item.deletedCount;
    return acc;
  }, {});
}

module.exports = {
  deleteSchoolScopedData,
};
