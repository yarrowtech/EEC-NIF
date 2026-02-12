const express = require('express');
const mongoose = require('mongoose');
const authAnyUser = require('../middleware/authAnyUser');
const ChatThread = require('../models/ChatThread');
const ChatMessage = require('../models/ChatMessage');
const StudentUser = require('../models/StudentUser');
const TeacherUser = require('../models/TeacherUser');

const router = express.Router();
router.use(authAnyUser);

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
    const { userType, schoolId, campusId } = req.user;
    const scopedFilter = { schoolId, campusId };

    if (userType === 'student') {
      const teachers = await TeacherUser.find(scopedFilter)
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

    if (userType === 'teacher') {
      const students = await StudentUser.find(scopedFilter)
        .select('_id name username studentCode profilePic grade section')
        .lean();
      return res.json(students.map(s => ({
        _id: s._id,
        name: s.name || s.username || s.studentCode || 'Student',
        subtitle: s.grade ? `Grade ${s.grade}${s.section ? ' - ' + s.section : ''}` : 'Student',
        userType: 'student',
        avatar: s.profilePic || null,
      })));
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
    const { schoolId, campusId } = req.user;

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

    res.json(result);
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
    const { userType, schoolId, campusId } = req.user;
    const { id: _myId, ..._ } = req.user;

    // Verify the other user exists
    let otherUser = null;
    let myName = '';
    if (targetType === 'teacher') {
      otherUser = await TeacherUser.findOne({ _id: otherId, schoolId, campusId }).select('name subject employeeCode').lean();
    } else if (targetType === 'student') {
      otherUser = await StudentUser.findOne({ _id: otherId, schoolId, campusId }).select('name username studentCode grade section').lean();
    }
    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get my name
    if (userType === 'student') {
      const me = await StudentUser.findById(myId).select('name username studentCode').lean();
      myName = me?.name || me?.username || me?.studentCode || 'Student';
    } else if (userType === 'teacher') {
      const me = await TeacherUser.findById(myId).select('name employeeCode').lean();
      myName = me?.name || me?.employeeCode || 'Teacher';
    }

    const otherName = otherUser.name || otherUser.username || otherUser.employeeCode || otherUser.studentCode || 'User';

    // Check if thread already exists with these 2 participants
    let thread = await ChatThread.findOne({
      schoolId,
      campusId,
      'participants.userId': { $all: [myId, otherId] },
      $expr: { $eq: [{ $size: '$participants' }, 2] },
    }).lean();

    if (!thread) {
      thread = await ChatThread.create({
        schoolId,
        campusId,
        participants: [
          { userId: myId, userType, name: myName },
          { userId: otherId, userType: targetType, name: otherName },
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
    const { schoolId, campusId } = req.user;
    const { threadId } = req.params;

    const thread = await ChatThread.findOne({
      _id: threadId,
      schoolId,
      campusId,
      'participants.userId': userId,
    }).lean();

    if (!thread) return res.status(404).json({ error: 'Thread not found' });

    const messages = await ChatMessage.find({ threadId, schoolId, campusId })
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
    const { userType, schoolId, campusId } = req.user;
    const { threadId } = req.params;
    const { text } = req.body;

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    const thread = await ChatThread.findOne({
      _id: threadId,
      schoolId,
      campusId,
      'participants.userId': userId,
    }).lean();

    if (!thread) return res.status(404).json({ error: 'Thread not found' });

    const myParticipant = thread.participants?.find(p => p.userId?.toString() === userId.toString());
    const senderName = myParticipant?.name || (userType === 'teacher' ? 'Teacher' : 'Student');

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
    const { schoolId, campusId } = req.user;
    const { threadId } = req.params;

    await ChatThread.updateOne(
      { _id: threadId, schoolId, campusId, 'unreadCounts.userId': userId },
      { $set: { 'unreadCounts.$.count': 0 } }
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
