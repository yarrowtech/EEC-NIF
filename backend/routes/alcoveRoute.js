const express = require('express');
const router = express.Router();
const AlcovePost = require('../models/AlcovePost');
const AlcoveComment = require('../models/AlcoveComment');
const AlcoveSubmission = require('../models/AlcoveSubmission');
const StudentUser = require('../models/StudentUser');
const teacherAuth = require('../middleware/authTeacher');
const authAnyUser = require('../middleware/authAnyUser');
const authStudent = require('../middleware/authStudent');

const resolveSchoolId = (req, res) => {
  const schoolId = req.schoolId || req.user?.schoolId || null;
  if (!schoolId) {
    res.status(400).json({ error: 'schoolId is required' });
    return null;
  }
  return schoolId;
};

// Create a new post (Teacher only)
router.post('/posts', teacherAuth, async (req, res) => {
  // #swagger.tags = ['Alcove']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const { title, subject, chapter, difficulty = 'medium', problemText, solutionText, tags = [], highlighted = false } = req.body;
    const post = await AlcovePost.create({
      schoolId,
      title,
      subject,
      chapter,
      difficulty,
      problemText,
      solutionText,
      tags,
      highlighted,
      author: req.user?.id || undefined,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List posts with filters/search/pagination
router.get('/posts', authAnyUser, async (req, res) => {
  // #swagger.tags = ['Alcove']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const { subject, chapter, difficulty, q, page = 1, limit = 20 } = req.query;
    const filter = { schoolId };
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (difficulty) filter.difficulty = difficulty;
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { title: regex },
        { problemText: regex },
        { solutionText: regex },
        { tags: regex },
        { chapter: regex },
        { subject: regex },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      AlcovePost.find(filter).sort({ highlighted: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      AlcovePost.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get single post
router.get('/posts/:id', authAnyUser, async (req, res) => {
  // #swagger.tags = ['Alcove']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const post = await AlcovePost.findOne({ _id: req.params.id, schoolId });
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a post (Teacher only; no author check here for brevity)
router.patch('/posts/:id', teacherAuth, async (req, res) => {
  // #swagger.tags = ['Alcove']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const updates = req.body;
    const post = await AlcovePost.findOneAndUpdate(
      { _id: req.params.id, schoolId },
      updates,
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a post (Teacher/admin)
router.delete('/posts/:id', teacherAuth, async (req, res) => {
  // #swagger.tags = ['Alcove']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const post = await AlcovePost.findOneAndDelete({ _id: req.params.id, schoolId });
    if (!post) return res.status(404).json({ error: 'Not found' });
    await AlcoveComment.deleteMany({ post: req.params.id, schoolId });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Comments: list
router.get('/posts/:id/comments', authAnyUser, async (req, res) => {
  // #swagger.tags = ['Alcove']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const items = await AlcoveComment.find({ post: req.params.id, schoolId }).sort({ createdAt: 1 });
    res.json(items);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Comments: create (any logged-in user)
router.post('/posts/:id/comments', authAnyUser, async (req, res) => {
  // #swagger.tags = ['Alcove']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const { text, authorName } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Text is required' });
    const comment = await AlcoveComment.create({
      schoolId,
      post: req.params.id,
      text: text.trim(),
      authorId: req.user?.id || undefined,
      authorType: req.userType || 'unknown',
      authorName: authorName?.trim() || 'Anonymous',
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Comments: delete (author or admin/teacher)
router.delete('/posts/:id/comments/:commentId', authAnyUser, async (req, res) => {
  // #swagger.tags = ['Alcove']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const comment = await AlcoveComment.findOne({ _id: req.params.commentId, schoolId, post: req.params.id });
    if (!comment) return res.status(404).json({ error: 'Not found' });

    const isAdmin = req.userType === 'Admin';
    const isTeacher = req.userType === 'teacher';
    const isAuthor = comment.authorId && req.user?.id && comment.authorId === req.user.id;
    if (!isAdmin && !isTeacher && !isAuthor) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await comment.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Submissions: submit answer (Student only)
router.post('/posts/:postId/submissions', authStudent, async (req, res) => {
  // #swagger.tags = ['Alcove']
  try {
    const { postId } = req.params;
    const { answerText } = req.body;
    const studentId = req.user.id;
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    // Validate answer text
    if (!answerText || !answerText.trim()) {
      return res.status(400).json({ error: 'Answer text is required' });
    }

    // Verify post exists and belongs to same school
    const post = await AlcovePost.findOne({ _id: postId, schoolId });
    if (!post) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Get student details
    const student = await StudentUser.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Create or update submission (upsert pattern)
    const submission = await AlcoveSubmission.findOneAndUpdate(
      { postId, studentId },
      {
        answerText: answerText.trim(),
        studentName: student.name,
        grade: student.grade,
        section: student.section,
        schoolId,
        submittedAt: new Date()
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.status(201).json({
      message: 'Answer submitted successfully',
      submission
    });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error (shouldn't happen with findOneAndUpdate)
      res.status(400).json({ error: 'You have already submitted an answer' });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
});

// Submissions: get all submissions for a post (Any authenticated user)
router.get('/posts/:postId/submissions', authAnyUser, async (req, res) => {
  // #swagger.tags = ['Alcove']
  try {
    const { postId } = req.params;
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    // Verify post exists
    const post = await AlcovePost.findOne({ _id: postId, schoolId });
    if (!post) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Fetch all submissions for this post (public visibility)
    const submissions = await AlcoveSubmission.find({
      postId,
      schoolId
    })
    .sort({ submittedAt: -1 })  // Most recent first
    .select('studentId studentName answerText submittedAt grade section')
    .lean();

    res.json(submissions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Submissions: get student's own submission for a post (Student only)
router.get('/posts/:postId/my-submission', authStudent, async (req, res) => {
  // #swagger.tags = ['Alcove']
  try {
    const { postId } = req.params;
    const studentId = req.user.id;
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    const submission = await AlcoveSubmission.findOne({
      postId,
      studentId,
      schoolId
    });

    res.json(submission || null);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Submissions: teacher view all submissions for their posts (Teacher only)
router.get('/teacher/submissions', teacherAuth, async (req, res) => {
  // #swagger.tags = ['Alcove']
  try {
    const teacherId = req.teacher?.id || req.user?.id;
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    // Get all posts created by this teacher
    const posts = await AlcovePost.find({
      author: teacherId,
      schoolId
    }).select('_id title subject');

    const postIds = posts.map(p => p._id);

    // Get all submissions for these posts
    const submissions = await AlcoveSubmission.find({
      postId: { $in: postIds },
      schoolId
    })
    .populate('postId', 'title subject')
    .sort({ submittedAt: -1 })
    .lean();

    res.json(submissions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

