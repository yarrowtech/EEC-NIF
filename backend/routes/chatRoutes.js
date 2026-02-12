const express = require('express');
const mongoose = require('mongoose');
const authAnyUser = require('../middleware/authAnyUser');
const ChatThread = require('../models/ChatThread');
const ChatMessage = require('../models/ChatMessage');
const StudentUser = require('../models/StudentUser');
const TeacherUser = require('../models/TeacherUser');
const ParentUser = require('../models/ParentUser');
const Timetable = require('../models/Timetable');
const ClassModel = require('../models/Class');
const Section = require('../models/Section');
const TeacherAllocation = require('../models/TeacherAllocation');

const router = express.Router();
router.use(authAnyUser);

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalizeValue = (value = '') => String(value || '').trim();
const isTeacherRequest = (req) => (req.user?.userType || '').toLowerCase() === 'teacher';
const buildCampusCondition = (campusId) => (
  campusId
    ? {
        $or: [
          { campusId },
          { campusId: { $exists: false } },
          { campusId: null },
        ],
      }
    : null
);

const findTeacherAllocations = async ({ teacherId, schoolId, campusId }) => {
  if (!teacherId || !schoolId) return [];
  let teacherObjectId;
  try {
    teacherObjectId = new mongoose.Types.ObjectId(teacherId);
  } catch {
    return [];
  }

  const allocationFilter = { schoolId, teacherId: teacherObjectId };
  if (campusId) {
    allocationFilter.$or = [
      { campusId },
      { campusId: { $exists: false } },
      { campusId: null },
    ];
  }

  const allocations = await TeacherAllocation.find(allocationFilter)
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .lean();

  const combosMap = new Map();
  allocations.forEach((alloc) => {
    const className = normalizeValue(alloc.classId?.name);
    if (!className) return;
    const sectionName = normalizeValue(alloc.sectionId?.name);
    const key = `${className.toLowerCase()}|${sectionName.toLowerCase()}`;
    combosMap.set(
      key,
      combosMap.get(key) || {
        grade: className,
        section: sectionName || '',
      }
    );
  });

  if (combosMap.size > 0) return Array.from(combosMap.values());

  const timetableFilter = {
    schoolId,
    'entries.teacherId': teacherObjectId,
  };
  if (campusId) {
    timetableFilter.$or = [
      { campusId },
      { campusId: { $exists: false } },
      { campusId: null },
    ];
  }

  const timetables = await Timetable.find(timetableFilter)
    .select('classId sectionId')
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .lean();

  timetables.forEach((tt) => {
    const className = normalizeValue(tt.classId?.name);
    if (!className) return;
    const sectionName = normalizeValue(tt.sectionId?.name);
    const key = `${className.toLowerCase()}|${sectionName.toLowerCase()}`;
    if (!combosMap.has(key)) {
      combosMap.set(key, {
        grade: className,
        section: sectionName || '',
      });
    }
  });

  return Array.from(combosMap.values());
};

const getTeacherCombos = async (req) => {
  if (!isTeacherRequest(req)) return null;
  if (!req._teacherClassCombos) {
    req._teacherClassCombos = await findTeacherAllocations({
      teacherId: req.user?.id || req.user?._id,
      schoolId: req.schoolId || req.user?.schoolId,
      campusId: (req.campusId ?? req.user?.campusId) ?? null,
    });
  }
  return req._teacherClassCombos || [];
};

const fetchParentStudents = async ({ parent, schoolId, campusId }) => {
  if (!parent || !schoolId) return [];
  const filter = { schoolId };
  const campusCondition = buildCampusCondition(campusId);
  if (campusCondition) {
    filter.$or = campusCondition.$or;
  }

  let students = [];
  if (Array.isArray(parent.childrenIds) && parent.childrenIds.length > 0) {
    students = await StudentUser.find({
      ...filter,
      _id: { $in: parent.childrenIds },
    })
      .select('name grade section campusId')
      .lean();
  }

  if ((!students || students.length === 0) && Array.isArray(parent.children) && parent.children.length > 0) {
    const names = parent.children.map((name) => String(name || '').trim()).filter(Boolean);
    if (names.length > 0) {
      students = await StudentUser.find({
        ...filter,
        name: { $in: names },
      })
        .select('name grade section campusId')
        .lean();
    }
  }

  return students || [];
};

const findClassTeacherForStudent = async ({ student, schoolId }) => {
  if (!student || !schoolId) return null;

  const classDoc = student.grade
    ? await ClassModel.findOne({ schoolId, name: student.grade }).lean()
    : null;
  if (!classDoc) return null;

  let sectionDoc = null;
  if (student.section) {
    sectionDoc = await Section.findOne({
      schoolId,
      classId: classDoc._id,
      name: student.section,
    }).lean();
  }

  const baseFilter = {
    schoolId,
    classId: classDoc._id,
    isClassTeacher: true,
  };
  if (sectionDoc) baseFilter.sectionId = sectionDoc._id;

  let allocation = await TeacherAllocation.findOne(baseFilter)
    .populate('teacherId', 'name subject employeeCode profilePic email')
    .lean();

  if (!allocation) {
    allocation = await TeacherAllocation.findOne({
      schoolId,
      classId: classDoc._id,
      ...(sectionDoc ? { sectionId: sectionDoc._id } : {}),
    })
      .populate('teacherId', 'name subject employeeCode profilePic email')
      .lean();
  }

  if (allocation?.teacherId) {
    return allocation.teacherId;
  }

  const timetable = await Timetable.findOne({
    schoolId,
    classId: classDoc._id,
    ...(sectionDoc ? { sectionId: sectionDoc._id } : {}),
  })
    .populate('entries.teacherId', 'name subject employeeCode profilePic email')
    .lean();

  if (timetable?.entries?.length) {
    const entryWithTeacher = timetable.entries.find((entry) => entry.teacherId);
    if (entryWithTeacher?.teacherId) {
      return entryWithTeacher.teacherId;
    }
  }

  return null;
};

const getStudentTeachers = async ({ student, schoolId }) => {
  if (!student || !schoolId) return [];

  const classDoc = student.grade
    ? await ClassModel.findOne({ schoolId, name: student.grade }).lean()
    : null;
  if (!classDoc) return [];

  let sectionDoc = null;
  if (student.section) {
    sectionDoc = await Section.findOne({
      schoolId,
      classId: classDoc._id,
      name: student.section,
    }).lean();
  }

  const timetableFilter = {
    schoolId,
    classId: classDoc._id,
  };
  if (sectionDoc) {
    timetableFilter.sectionId = sectionDoc._id;
  }

  const timetables = await Timetable.find(timetableFilter)
    .populate('entries.teacherId', 'name subject employeeCode profilePic email')
    .populate('entries.subjectId', 'name code')
    .lean();

  const teacherSubjectMap = new Map();
  timetables.forEach((tt) => {
    (tt.entries || []).forEach((entry) => {
      const teacher = entry.teacherId;
      if (!teacher) return;
      const teacherId = String(teacher._id);
      if (!teacherSubjectMap.has(teacherId)) {
        teacherSubjectMap.set(teacherId, {
          teacher,
          subjects: new Set(),
        });
      }
      const subjectName = entry.subjectId?.name || entry.subjectId?.code || '';
      if (subjectName) {
        teacherSubjectMap.get(teacherId).subjects.add(subjectName);
      }
    });
  });

  return Array.from(teacherSubjectMap.values());
};

const getParentTeacherContacts = async ({ parent, schoolId, campusId }) => {
  if (!parent || !schoolId) return new Map();
  const students = await fetchParentStudents({ parent, schoolId, campusId });
  if (!students.length) return new Map();

  const teacherMap = new Map();

  for (const student of students) {
    const classLabel = student.grade
      ? `${student.grade}${student.section ? ` - ${student.section}` : ''}`
      : 'Class Teacher';

    const teachers = await getStudentTeachers({ student, schoolId });
    if (!teachers.length) {
      const classTeacher = await findClassTeacherForStudent({ student, schoolId });
      if (classTeacher) {
        teachers.push({ teacher: classTeacher, subjects: new Set() });
      }
    }

    teachers.forEach(({ teacher, subjects }) => {
      if (!teacher) return;
      const teacherId = String(teacher._id);
      if (!teacherMap.has(teacherId)) {
        teacherMap.set(teacherId, {
          teacher,
          classes: new Set(),
          subjects: new Set(),
        });
      }
      const entry = teacherMap.get(teacherId);
      entry.classes.add(classLabel);
      (subjects ? Array.from(subjects) : []).forEach((subjectName) => entry.subjects.add(subjectName));
    });
  }

  return teacherMap;
};

const buildStudentGradeConditions = (combos = []) =>
  combos
    .map(({ grade, section }) => {
      const gradeValue = normalizeValue(grade);
      if (!gradeValue) return null;
      const condition = {
        grade: new RegExp(`^${escapeRegex(gradeValue)}$`, 'i'),
      };
      const sectionValue = normalizeValue(section);
      if (sectionValue) {
        condition.section = new RegExp(`^${escapeRegex(sectionValue)}$`, 'i');
      }
      return condition;
    })
    .filter(Boolean);

const studentMatchesCombos = (student, combos = []) => {
  const studentGrade = normalizeValue(student?.grade);
  if (!studentGrade) return false;
  const studentSection = normalizeValue(student?.section);
  const studentGradeLower = studentGrade.toLowerCase();

  return combos.some(({ grade, section }) => {
    const comboGrade = normalizeValue(grade);
    if (!comboGrade) return false;
    if (studentGradeLower !== comboGrade.toLowerCase()) return false;
    const comboSection = normalizeValue(section);
    if (!comboSection) return true;
    return studentSection && studentSection.toLowerCase() === comboSection.toLowerCase();
  });
};

const ensureTeacherCanAccessStudent = async (req, studentOrId) => {
  if (!isTeacherRequest(req)) return true;
  const combos = await getTeacherCombos(req);
  if (!combos?.length) return false;

  let studentDoc = studentOrId;
  if (!studentDoc || !studentDoc.grade) {
    const studentId = studentOrId?._id || studentOrId;
    if (!studentId) return false;
    studentDoc = await StudentUser.findById(studentId)
      .select('_id grade section campusId')
      .lean();
  }
  if (!studentDoc) return false;

  const campusId = (req.campusId ?? req.user?.campusId) ?? null;
  if (campusId && studentDoc.campusId && studentDoc.campusId !== campusId) {
    return false;
  }

  return studentMatchesCombos(studentDoc, combos);
};

const ensureTeacherAccessToThread = async (req, thread) => {
  if (!isTeacherRequest(req)) return true;
  if (!thread) return false;
  const myId = String(req.user?.id || req.user?._id || '');
  const other = thread.participants?.find(
    (p) => p.userId?.toString() !== myId
  );
  if (!other || other.userType !== 'student') return true;
  return ensureTeacherCanAccessStudent(req, other.userId);
};

// GET /api/chat/me — current user's display info
router.get('/me', async (req, res) => {
  try {
    const { id, userType, schoolId, campusId } = req.user;
    let name = '';
    let avatar = null;
    if (userType === 'student') {
      const u = await StudentUser.findById(id).select('name username studentCode profilePic').lean();
      name = u?.name || u?.username || u?.studentCode || 'Student';
      avatar = u?.profilePic || null;
    } else if (userType === 'teacher') {
      const u = await TeacherUser.findById(id).select('name employeeCode profilePic').lean();
      name = u?.name || u?.employeeCode || 'Teacher';
      avatar = u?.profilePic || null;
    } else if (userType === 'parent') {
      const u = await ParentUser.findById(id).select('name username profilePic').lean();
      name = u?.name || u?.username || 'Parent';
      avatar = u?.profilePic || null;
    }
    res.json({ id, userType, name, avatar, schoolId, campusId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/contacts — list people you can message
// Students see teachers, teachers see students
router.get('/contacts', async (req, res) => {
  try {
    const { userType } = req.user;
    const schoolId = req.schoolId || req.user?.schoolId;
    const campusId = (req.campusId ?? req.user?.campusId) ?? null;

    if (userType === 'student') {
      const teachers = await TeacherUser.find({ schoolId, campusId })
        .select('_id name subject employeeCode profilePic')
        .lean();
      return res.json(teachers.map(t => ({
        _id: t._id,
        name: t.name || t.employeeCode || 'Teacher',
        subtitle: t.subject || 'Teacher',
        userType: 'teacher',
        avatar: t.profilePic || null,
      })));
    }

    if (userType === 'parent') {
      const parent = await ParentUser.findById(req.user.id)
        .select('childrenIds children schoolId campusId')
        .lean();
      if (!parent) return res.status(404).json({ error: 'Parent account not found' });
      const resolvedSchoolId = parent.schoolId || schoolId;
      if (!resolvedSchoolId) {
        return res.status(400).json({ error: 'schoolId is required' });
      }
      const teacherMap = await getParentTeacherContacts({
        parent,
        schoolId: resolvedSchoolId,
        campusId: campusId || parent.campusId || null,
      });
      const contacts = Array.from(teacherMap.values()).map(({ teacher, classes, subjects }) => ({
        _id: teacher._id,
        name: teacher.name || teacher.employeeCode || 'Teacher',
        subtitle: classes.size
          ? `Class ${Array.from(classes).join(', ')}`
          : teacher.subject || 'Teacher',
        detail: subjects && subjects.size ? `Subjects: ${Array.from(subjects).join(', ')}` : '',
        userType: 'teacher',
        avatar: teacher.profilePic || null,
      }));
      return res.json(contacts);
    }

    if (userType === 'teacher') {
      const combos = await getTeacherCombos(req);
      if (!combos?.length) {
        return res.json([]);
      }
      const gradeConditions = buildStudentGradeConditions(combos);
      if (!gradeConditions.length) {
        return res.json([]);
      }

      const andConditions = [{ $or: gradeConditions }];
      if (campusId) {
        andConditions.push({
          $or: [
            { campusId },
            { campusId: { $exists: false } },
            { campusId: null },
          ],
        });
      }

      const filter = { schoolId };
      if (andConditions.length === 1) Object.assign(filter, andConditions[0]);
      else filter.$and = andConditions;

      const students = await StudentUser.find(filter)
        .select('_id name username studentCode profilePic grade section campusId')
        .lean();

      const items = students.map(s => ({
        _id: s._id,
        name: s.name || s.username || s.studentCode || 'Student',
        subtitle: s.grade ? `Grade ${s.grade}${s.section ? ' - ' + s.section : ''}` : 'Student',
        userType: 'student',
        avatar: s.profilePic || null,
      }));
      return res.json(items);
    }

    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/threads — list all threads for current user
router.get('/threads', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const schoolId = req.schoolId || req.user?.schoolId;
    const campusId = (req.campusId ?? req.user?.campusId) ?? null;

    const threads = await ChatThread.find({
      schoolId,
      campusId,
      'participants.userId': userId,
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    const result = threads.map(t => {
      const unreadEntry = t.unreadCounts?.find(u => u.userId?.toString() === userId.toString());
      const other = t.participants?.find(p => p.userId?.toString() !== userId.toString());
      return {
        _id: t._id,
        participants: t.participants,
        otherParticipant: other || null,
        lastMessage: t.lastMessage || '',
        lastMessageAt: t.lastMessageAt,
        unreadCount: unreadEntry?.count || 0,
        updatedAt: t.updatedAt,
      };
    });

    if (!isTeacherRequest(req)) {
      return res.json(result);
    }

    const combos = await getTeacherCombos(req);
    if (!combos?.length) {
      return res.json([]);
    }

    const studentThreads = result.filter(t => t.otherParticipant?.userType === 'student');
    const studentIds = Array.from(
      new Set(
        studentThreads
          .map(t => (t.otherParticipant?.userId ? String(t.otherParticipant.userId) : null))
          .filter(Boolean)
      )
    );
    let studentMap = new Map();
    if (studentIds.length) {
      const students = await StudentUser.find({ _id: { $in: studentIds } })
        .select('_id grade section')
        .lean();
      studentMap = new Map(students.map(s => [String(s._id), s]));
    }

    const filtered = result.filter(t => {
      if (t.otherParticipant?.userType !== 'student') return true;
      const student = studentMap.get(String(t.otherParticipant.userId));
      if (!student) return false;
      return studentMatchesCombos(student, combos);
    });

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/threads/direct — get or create a 1:1 thread
router.post('/threads/direct', async (req, res) => {
  try {
    const { targetId, targetType } = req.body;
    if (!targetId || !targetType) {
      return res.status(400).json({ error: 'targetId and targetType required' });
    }

    const myId = new mongoose.Types.ObjectId(req.user.id);
    const otherId = new mongoose.Types.ObjectId(targetId);
    const { userType, schoolId } = req.user;
    const campusId = (req.campusId ?? req.user?.campusId) ?? null;
    const normalizedUserType = String(userType || '').toLowerCase();
    const normalizedTargetType = String(targetType || '').toLowerCase();
    const { id: _myId, ..._ } = req.user;

    // Verify the other user exists
    let otherUser = null;
    let myName = '';
    if (normalizedTargetType === 'teacher') {
      otherUser = await TeacherUser.findOne({ _id: otherId, schoolId, campusId }).select('name subject employeeCode profilePic').lean();
    } else if (normalizedTargetType === 'student') {
      otherUser = await StudentUser.findOne({ _id: otherId, schoolId, campusId }).select('name username studentCode grade section campusId').lean();
    } else if (normalizedTargetType === 'parent') {
      otherUser = await ParentUser.findOne({ _id: otherId, schoolId, campusId }).select('name username').lean();
    }
    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (normalizedUserType === 'teacher' && normalizedTargetType === 'student') {
      const allowed = await ensureTeacherCanAccessStudent(req, otherUser);
      if (!allowed) {
        return res.status(403).json({ error: 'Student is not assigned to you' });
      }
    }

    if (normalizedUserType === 'parent' && normalizedTargetType === 'teacher') {
      const parent = await ParentUser.findById(req.user.id)
        .select('childrenIds children schoolId campusId')
        .lean();
      if (!parent) return res.status(404).json({ error: 'Parent account not found' });
      const resolvedSchoolId = parent.schoolId || schoolId;
      if (!resolvedSchoolId) {
        return res.status(400).json({ error: 'schoolId is required' });
      }
      const teacherMap = await getParentTeacherContacts({
        parent,
        schoolId: resolvedSchoolId,
        campusId: campusId || parent.campusId || null,
      });
      if (!teacherMap.has(String(otherId))) {
        return res.status(403).json({ error: 'Teacher is not assigned to your child' });
      }
    }

    // Get my name
    if (normalizedUserType === 'student') {
      const me = await StudentUser.findById(myId).select('name username studentCode').lean();
      myName = me?.name || me?.username || me?.studentCode || 'Student';
    } else if (normalizedUserType === 'teacher') {
      const me = await TeacherUser.findById(myId).select('name employeeCode').lean();
      myName = me?.name || me?.employeeCode || 'Teacher';
    } else if (normalizedUserType === 'parent') {
      const me = await ParentUser.findById(myId).select('name username').lean();
      myName = me?.name || me?.username || 'Parent';
    }

    const otherName = otherUser.name || otherUser.username || otherUser.employeeCode || otherUser.studentCode || 'User';

    let threadCampusId = campusId;
    if (!threadCampusId) {
      threadCampusId = otherUser.campusId || null;
    }
    if (!threadCampusId && normalizedTargetType === 'teacher') {
      const teacherDoc = await TeacherUser.findById(otherId).select('campusId').lean();
        threadCampusId = teacherDoc?.campusId ?? threadCampusId ?? null;
    }
    if (!threadCampusId && normalizedTargetType === 'student') {
      const studentDoc = await StudentUser.findById(otherId).select('campusId').lean();
      threadCampusId = studentDoc?.campusId ?? threadCampusId ?? null;
    }

    // Check if thread already exists with these 2 participants
    let thread = await ChatThread.findOne({
      schoolId,
      campusId: threadCampusId,
      'participants.userId': { $all: [myId, otherId] },
      $expr: { $eq: [{ $size: '$participants' }, 2] },
    }).lean();

    if (!thread) {
      thread = await ChatThread.create({
        schoolId,
        campusId: threadCampusId,
        participants: [
          { userId: myId, userType: normalizedUserType, name: myName },
          { userId: otherId, userType: normalizedTargetType, name: otherName },
        ],
        unreadCounts: [
          { userId: myId, count: 0 },
          { userId: otherId, count: 0 },
        ],
      });
      thread = thread.toObject();
    }

    const other = thread.participants?.find(p => p.userId?.toString() !== myId.toString());
    res.json({
      _id: thread._id,
      participants: thread.participants,
      otherParticipant: other || null,
      lastMessage: thread.lastMessage || '',
      lastMessageAt: thread.lastMessageAt,
      unreadCount: 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/threads/:threadId/messages
router.get('/threads/:threadId/messages', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { schoolId } = req.user;
    const campusId = (req.campusId ?? req.user?.campusId) ?? null;
    const { threadId } = req.params;

    const thread = await ChatThread.findOne({
      _id: threadId,
      schoolId,
      ...(campusId !== null ? { campusId } : {}),
      'participants.userId': userId,
    }).lean();

    if (!thread) return res.status(404).json({ error: 'Thread not found' });

    const allowed = await ensureTeacherAccessToThread(req, thread);
    if (!allowed) return res.status(403).json({ error: 'Access denied' });

    const messages = await ChatMessage.find({
      threadId,
      schoolId,
      ...(campusId !== null ? { campusId } : {}),
    })
      .sort({ createdAt: 1 })
      .lean();

    // Auto-mark as read
    await ChatThread.updateOne(
      { _id: threadId, 'unreadCounts.userId': userId },
      { $set: { 'unreadCounts.$.count': 0 } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/threads/:threadId/messages — send a message
router.post('/threads/:threadId/messages', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { userType, schoolId } = req.user;
    const campusId = (req.campusId ?? req.user?.campusId) ?? null;
    const { threadId } = req.params;
    const { text } = req.body;

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    const thread = await ChatThread.findOne({
      _id: threadId,
      schoolId,
      ...(campusId !== null ? { campusId } : {}),
      'participants.userId': userId,
    }).lean();

    if (!thread) return res.status(404).json({ error: 'Thread not found' });

    const allowed = await ensureTeacherAccessToThread(req, thread);
    if (!allowed) return res.status(403).json({ error: 'Access denied' });

    const myParticipant = thread.participants?.find(p => p.userId?.toString() === userId.toString());
    const senderName = myParticipant?.name || (userType === 'teacher' ? 'Teacher' : userType === 'parent' ? 'Parent' : 'Student');

    const msg = await ChatMessage.create({
      threadId,
      senderId: userId,
      senderType: userType,
      senderName,
      text: String(text).trim(),
      schoolId,
      campusId,
      seenBy: [{ userId, seenAt: new Date() }],
    });

    // Update thread last message and increment unread for others
    const bulkOps = [];
    for (const p of thread.participants) {
      if (p.userId?.toString() === userId.toString()) continue;
      bulkOps.push({
        updateOne: {
          filter: { _id: threadId, 'unreadCounts.userId': p.userId },
          update: { $inc: { 'unreadCounts.$.count': 1 } },
        },
      });
    }

    await Promise.all([
      ChatThread.updateOne(
        { _id: threadId },
        {
          $set: {
            lastMessage: msg.text,
            lastMessageAt: msg.createdAt,
            lastSenderId: userId,
          },
        }
      ),
      bulkOps.length ? ChatThread.bulkWrite(bulkOps) : Promise.resolve(),
    ]);

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/chat/threads/:threadId/seen — mark thread as read
router.put('/threads/:threadId/seen', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const schoolId = req.schoolId || req.user?.schoolId;
    const campusId = req.campusId || req.user?.campusId;
    const { threadId } = req.params;

    const thread = await ChatThread.findOne({
      _id: threadId,
      schoolId,
      campusId,
      'participants.userId': userId,
    }).lean();

    if (!thread) return res.status(404).json({ error: 'Thread not found' });

    const allowed = await ensureTeacherAccessToThread(req, thread);
    if (!allowed) return res.status(403).json({ error: 'Access denied' });

    await ChatThread.updateOne(
      { _id: threadId, 'unreadCounts.userId': userId },
      { $set: { 'unreadCounts.$.count': 0 } }
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
