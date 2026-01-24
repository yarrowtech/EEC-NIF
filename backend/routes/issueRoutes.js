const express = require('express');
const mongoose = require('mongoose');
const adminAuth = require('../middleware/adminAuth');
const Issue = require('../models/Issue');
const Admin = require('../models/Admin');

const router = express.Router();

const ensureSuperAdmin = (req, res, next) => {
  if (!req.isSuperAdmin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  return next();
};

const sanitizeIssue = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject({ virtuals: false }) : doc;
  const sanitized = {
    ...obj,
    id: obj._id ? obj._id.toString() : undefined,
    reportedAt: obj.createdAt
  };
  delete sanitized.__v;
  return sanitized;
};

// Get all issues (super admin only)
router.get('/', adminAuth, ensureSuperAdmin, async (req, res) => {
  try {
    const { status, severity, schoolId, limit } = req.query || {};
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (severity) {
      filter.severity = severity;
    }
    if (schoolId) {
      if (!mongoose.isValidObjectId(schoolId)) {
        return res.status(400).json({ error: 'Invalid schoolId' });
      }
      filter.schoolId = schoolId;
    }

    const query = Issue.find(filter).sort({ createdAt: -1 });
    const parsedLimit = Number(limit);
    if (parsedLimit && parsedLimit > 0) {
      query.limit(parsedLimit);
    }

    const results = await query.lean();
    res.json(results.map(sanitizeIssue));
  } catch (err) {
    console.error('Failed to fetch issues', err);
    res.status(500).json({ error: err.message || 'Unable to fetch issues' });
  }
});

// Get a single issue by ID (super admin only)
router.get('/:id', adminAuth, ensureSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid issue id' });
    }

    const issue = await Issue.findById(id).lean();
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json(sanitizeIssue(issue));
  } catch (err) {
    console.error('Failed to fetch issue', err);
    res.status(500).json({ error: err.message || 'Unable to fetch issue' });
  }
});

// Create a new issue (super admin only)
router.post('/', adminAuth, ensureSuperAdmin, async (req, res) => {
  try {
    const { title, severity, reportedBy, schoolId, schoolName, description, owner } = req.body || {};

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (schoolId && !mongoose.isValidObjectId(schoolId)) {
      return res.status(400).json({ error: 'Invalid schoolId' });
    }

    const issue = await Issue.create({
      title,
      severity: severity || 'medium',
      reportedBy,
      schoolId: schoolId || null,
      schoolName,
      description,
      owner: owner || 'Support',
      status: 'open'
    });

    res.status(201).json(sanitizeIssue(issue));
  } catch (err) {
    console.error('Failed to create issue', err);
    res.status(500).json({ error: err.message || 'Unable to create issue' });
  }
});

// Update an issue (super admin only)
router.patch('/:id', adminAuth, ensureSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid issue id' });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const { status, severity, owner, description, resolutionNotes } = req.body || {};

    if (status) {
      issue.status = status;
    }
    if (severity) {
      issue.severity = severity;
    }
    if (owner !== undefined) {
      issue.owner = owner;
    }
    if (description !== undefined) {
      issue.description = description;
    }
    if (resolutionNotes !== undefined) {
      issue.resolutionNotes = resolutionNotes;
    }

    if (status === 'resolved') {
      const actor = await Admin.findById(req.admin.id).select('name username').lean();
      issue.resolvedAt = new Date();
      issue.resolvedBy = req.admin.id;
      issue.resolvedByName = actor?.name || actor?.username || 'Super Admin';
    } else if (status && status !== 'resolved') {
      issue.resolvedAt = undefined;
      issue.resolvedBy = undefined;
      issue.resolvedByName = undefined;
    }

    await issue.save();
    res.json(sanitizeIssue(issue));
  } catch (err) {
    console.error('Failed to update issue', err);
    res.status(500).json({ error: err.message || 'Unable to update issue' });
  }
});

// Delete an issue (super admin only)
router.delete('/:id', adminAuth, ensureSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid issue id' });
    }

    const issue = await Issue.findByIdAndDelete(id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({ message: 'Issue deleted successfully', id });
  } catch (err) {
    console.error('Failed to delete issue', err);
    res.status(500).json({ error: err.message || 'Unable to delete issue' });
  }
});

module.exports = router;
