const ChatThread = require('../models/ChatThread');
const ChatMessage = require('../models/ChatMessage');
const TeacherUser = require('../models/TeacherUser');
const StudentUser = require('../models/StudentUser');
const Subject = require('../models/Subject');
const ClassModel = require('../models/Class');
const Section = require('../models/Section');
const TeacherAllocation = require('../models/TeacherAllocation');

const buildCampusOr = (campusId) => (
  campusId
    ? [{ campusId }, { campusId: null }, { campusId: { $exists: false } }]
    : null
);

const addParticipant = (map, userId, userType, name) => {
  if (!userId) return;
  const key = String(userId);
  if (!key || map.has(key)) return;
  map.set(key, { userId, userType, name: String(name || '').trim() });
};

const yy = () => String(new Date().getFullYear()).slice(-2);

const ensureAllocationGroupThread = async ({
  schoolId,
  campusId,
  teacherId,
  subjectId,
  classId,
  sectionId,
}) => {
  if (!schoolId || !teacherId || !subjectId || !classId || !sectionId) return null;

  const campusCondition = buildCampusOr(campusId);
  const [teacher, subject, classDoc, sectionDoc] = await Promise.all([
    TeacherUser.findOne({
      _id: teacherId,
      schoolId,
      ...(campusCondition ? { $or: campusCondition } : {}),
    }).select('_id name employeeCode').lean(),
    Subject.findOne({
      _id: subjectId,
      schoolId,
      ...(campusCondition ? { $or: campusCondition } : {}),
    }).select('_id name code').lean(),
    ClassModel.findOne({
      _id: classId,
      schoolId,
      ...(campusCondition ? { $or: campusCondition } : {}),
    }).select('_id name').lean(),
    Section.findOne({
      _id: sectionId,
      schoolId,
      ...(campusCondition ? { $or: campusCondition } : {}),
    }).select('_id name classId').lean(),
  ]);

  if (!teacher || !subject || !classDoc || !sectionDoc) return null;

  const className = String(classDoc.name || '').trim();
  const sectionName = String(sectionDoc.name || '').trim();
  const subjectName = String(subject.name || subject.code || '').trim();
  if (!className || !sectionName || !subjectName) return null;

  const groupYear = yy();
  const groupName = `${subjectName} ${className}-${sectionName} ${groupYear}`;
  const groupKey = `alloc:${String(schoolId)}:${String(campusId || 'global')}:${String(teacherId)}:${String(subjectId)}:${String(classId)}:${String(sectionId)}`;

  const studentFilter = {
    schoolId,
    grade: className,
    section: sectionName,
  };
  if (campusCondition) studentFilter.$or = campusCondition;
  const students = await StudentUser.find(studentFilter)
    .select('_id name username studentCode')
    .lean();

  const participantsMap = new Map();
  addParticipant(participantsMap, teacher._id, 'teacher', teacher.name || teacher.employeeCode || 'Teacher');
  students.forEach((student) => {
    addParticipant(participantsMap, student._id, 'student', student.name || student.username || student.studentCode || 'Student');
  });

  const participants = Array.from(participantsMap.values());
  if (participants.length < 2) return null;

  let thread = await ChatThread.findOne({
    schoolId,
    campusId,
    groupKey,
  });

  const existingUnreadMap = new Map(
    (thread?.unreadCounts || []).map((u) => [String(u.userId), Number(u.count || 0)])
  );
  const unreadCounts = participants.map((p) => ({
    userId: p.userId,
    count: existingUnreadMap.get(String(p.userId)) || 0,
  }));

  if (!thread) {
    thread = await ChatThread.create({
      schoolId,
      campusId,
      threadType: 'group',
      groupName,
      groupKey,
      groupMeta: {
        teacherId,
        subjectId,
        classId,
        sectionId,
        year: groupYear,
      },
      participants,
      unreadCounts,
    });

    const now = new Date();
    const systemText = `System added you to ${groupName}`;
    await ChatMessage.create({
      threadId: thread._id,
      senderId: teacher._id,
      senderType: 'system',
      senderName: 'System',
      text: systemText,
      schoolId,
      campusId,
      seenBy: [],
    });

    await ChatThread.updateOne(
      { _id: thread._id },
      {
        $set: {
          lastMessage: systemText,
          lastMessageAt: now,
          lastSenderId: teacher._id,
        },
      }
    );
  } else {
    const updateSet = {
      groupName,
      threadType: 'group',
      participants,
      unreadCounts,
      groupMeta: {
        teacherId,
        subjectId,
        classId,
        sectionId,
        year: groupYear,
      },
    };
    await ChatThread.updateOne({ _id: thread._id }, { $set: updateSet });
  }

  return thread?._id || null;
};

const syncAllocationGroupThreads = async ({ schoolId = null, campusId = null } = {}) => {
  const filter = {};
  if (schoolId) filter.schoolId = schoolId;
  if (campusId !== null && campusId !== undefined) filter.campusId = campusId;

  const allocations = await TeacherAllocation.find(filter)
    .select('schoolId campusId teacherId subjectId classId sectionId')
    .lean();

  let createdOrUpdated = 0;
  for (const allocation of allocations) {
    const threadId = await ensureAllocationGroupThread({
      schoolId: allocation.schoolId,
      campusId: allocation.campusId || null,
      teacherId: allocation.teacherId,
      subjectId: allocation.subjectId,
      classId: allocation.classId,
      sectionId: allocation.sectionId,
    });
    if (threadId) createdOrUpdated += 1;
  }

  return { scanned: allocations.length, createdOrUpdated };
};

module.exports = { ensureAllocationGroupThread, syncAllocationGroupThreads };
