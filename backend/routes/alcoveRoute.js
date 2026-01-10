const express = require('express');
const router = express.Router();
const AlcovePost = require('../models/AlcovePost');
const AlcoveComment = require('../models/AlcoveComment');
const teacherAuth = require('../middleware/authTeacher');
const authAnyUser = require('../middleware/authAnyUser');

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

// Comments: list
router.get('/posts/:id/comments', authAnyUser, async (req, res) => {
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

module.exports = router;

