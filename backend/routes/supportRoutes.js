const express = require('express');
const mongoose = require('mongoose');
const adminAuth = require('../middleware/adminAuth');
const SupportRequest = require('../models/SupportRequest');
const Admin = require('../models/Admin');
const School = require('../models/School');
const TeacherUser = require('../models/TeacherUser');
const ParentUser = require('../models/ParentUser');
const StudentUser = require('../models/StudentUser');
const Principal = require('../models/Principal');
const { isStrongPassword, passwordPolicyMessage } = require('../utils/passwordPolicy');

const router = express.Router();

const roleModelMap = {
  teacher: TeacherUser,
  staff: TeacherUser,
  parent: ParentUser,
  student: StudentUser,
  principal: Principal,
  admin: Admin
};

const ensureSuperAdmin = (req, res, next) => {
  if (!req.isSuperAdmin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  return next();
};

const sanitizeSupportRequest = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject({ virtuals: false }) : doc;
  const sanitized = {
    ...obj,
    id: obj._id ? obj._id.toString() : undefined
  };
  delete sanitized.__v;
  return sanitized;
};

const safeRegex = (value) => {
  if (!value) return null;
  const escaped = String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}$`, 'i');
};

const derivePriority = (supportType, payload = {}) => {
  if (supportType === 'password-reset') {
    switch (payload.urgency) {
      case 'critical':
      case 'high':
        return 'high';
      default:
        return 'medium';
    }
  }
  if (supportType === 'complaint') {
    switch (payload.impactLevel) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      default:
        return 'low';
    }
  }
  return payload.priority || 'low';
};

const deriveSubject = (supportType, payload = {}) => {
  if (payload.subject) return payload.subject;
  if (supportType === 'password-reset') {
    return `Password reset • ${payload.staffName || payload.email || 'Account'}`;
  }
  if (supportType === 'complaint') {
    return `Complaint • ${payload.topic || payload.category || 'General'}`;
  }
  if (supportType === 'feedback') {
    return payload.subject || `Feedback • ${payload.category || 'General'}`;
  }
  return 'Support request';
};

const deriveMessage = (supportType, payload = {}) => {
  if (payload.message) return payload.message;
  if (supportType === 'complaint') {
    return payload.description || payload.details || '';
  }
  if (supportType === 'password-reset') {
    return payload.details || `Reset request for ${payload.role || 'user'}`;
  }
  return payload.details || payload.description || '';
};

const generateTicketNumber = () => {
  const randomSegment = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SR-${Date.now().toString(36).toUpperCase()}-${randomSegment}`;
};

const performPasswordReset = async (request, newPassword) => {
  const targetRole = (request.targetRole || request.requestDetails?.role || '').toLowerCase();
  const targetEmail = request.targetEmail || request.requestDetails?.email || request.requestDetails?.username;

  if (!targetRole || !targetEmail) {
    return { success: false, message: 'Missing role or email for password reset' };
  }

  const Model = roleModelMap[targetRole];
  if (!Model) {
    return { success: false, message: 'Role not supported for automated password reset' };
  }

  const regex = safeRegex(targetEmail);
  const query = {
    $or: [{ email: regex }, { username: regex }]
  };
  if (Model.schema.path('schoolId') && request.schoolId) {
    query.schoolId = request.schoolId;
  }

  const user = await Model.findOne(query);
  if (!user) {
    return { success: false, message: 'Account not found for the supplied email or username' };
  }
  user.password = newPassword;
  await user.save();
  return { success: true, userId: user._id, message: 'Password reset successfully' };
};

router.post('/requests', adminAuth, async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.supportType) {
      return res.status(400).json({ error: 'supportType is required' });
    }

    const admin = await Admin.findById(req.admin.id).lean();
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const resolvedSchoolId = admin.schoolId || req.admin.schoolId || payload.schoolId || null;
    let schoolDoc = null;
    if (resolvedSchoolId) {
      if (!mongoose.isValidObjectId(resolvedSchoolId)) {
        return res.status(400).json({ error: 'Invalid schoolId' });
      }
      schoolDoc = await School.findById(resolvedSchoolId).select('name campusType').lean();
      if (!schoolDoc) {
        return res.status(404).json({ error: 'School not found' });
      }
    } else if (!req.isSuperAdmin) {
      return res.status(400).json({ error: 'School context is required' });
    }

    const ticketNumber = generateTicketNumber();
    const supportRequest = await SupportRequest.create({
      ticketNumber,
      supportType: payload.supportType,
      category: payload.category || payload.supportType,
      subject: deriveSubject(payload.supportType, payload),
      message: deriveMessage(payload.supportType, payload),
      priority: derivePriority(payload.supportType, payload),
      status: 'open',
      owner: payload.owner || 'Support Desk',
      schoolId: schoolDoc?._id || null,
      schoolName: schoolDoc?.name || payload.schoolName || 'Unknown School',
      campusType: schoolDoc?.campusType || admin.campusType || null,
      createdBy: admin._id,
      createdByName: admin.name || admin.username || 'Admin',
      createdByRole: admin.role || 'admin',
      contactEmail: payload.email || admin.email,
      contactPhone: payload.contactNumber || payload.phone,
      targetRole: payload.role || payload.targetRole,
      targetEmail: payload.email || payload.targetEmail,
      requestDetails: payload,
      auditTrail: [
        {
          status: 'open',
          note: `Ticket created (${payload.supportType})`,
          changedBy: admin._id,
          changedByName: admin.name || admin.username || 'Admin'
        }
      ],
      passwordReset:
        payload.supportType === 'password-reset'
          ? { status: 'pending' }
          : undefined
    });

    res.status(201).json(sanitizeSupportRequest(supportRequest));
  } catch (err) {
    console.error('Failed to create support request', err);
    res.status(500).json({ error: err.message || 'Unable to create support request' });
  }
});

router.get('/requests', adminAuth, async (req, res) => {
  try {
    const { status, supportType, schoolId, limit } = req.query || {};
    const filter = {};

    if (!req.isSuperAdmin) {
      if (!req.admin.schoolId) {
        return res.status(400).json({ error: 'School context missing for admin' });
      }
      filter.schoolId = req.admin.schoolId;
    } else if (schoolId) {
      if (!mongoose.isValidObjectId(schoolId)) {
        return res.status(400).json({ error: 'Invalid schoolId' });
      }
      filter.schoolId = schoolId;
    }

    if (status) {
      filter.status = status;
    }
    if (supportType) {
      filter.supportType = supportType;
    }

    const query = SupportRequest.find(filter).sort({ createdAt: -1 });
    const parsedLimit = Number(limit);
    if (parsedLimit && parsedLimit > 0) {
      query.limit(parsedLimit);
    }
    const results = await query.lean();
    res.json(results.map(sanitizeSupportRequest));
  } catch (err) {
    console.error('Failed to fetch support requests', err);
    res.status(500).json({ error: err.message || 'Unable to fetch support requests' });
  }
});

router.get('/requests/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid request id' });
    }

    const request = await SupportRequest.findById(id).lean();
    if (!request) {
      return res.status(404).json({ error: 'Support request not found' });
    }

    if (!req.isSuperAdmin && (!req.admin.schoolId || request.schoolId?.toString() !== req.admin.schoolId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(sanitizeSupportRequest(request));
  } catch (err) {
    console.error('Failed to fetch support request', err);
    res.status(500).json({ error: err.message || 'Unable to fetch support request' });
  }
});

router.patch('/requests/:id', adminAuth, ensureSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid request id' });
    }

    const request = await SupportRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Support request not found' });
    }

    const updates = {};
    const { status, owner, priority, resolutionNotes, newPassword, action } = req.body || {};
    if (status) {
      updates.status = status;
    }
    if (owner !== undefined) {
      updates.owner = owner;
    }
    if (priority) {
      updates.priority = priority;
    }
    if (resolutionNotes !== undefined) {
      updates.resolutionNotes = resolutionNotes;
    }

    Object.assign(request, updates);

    const actor = await Admin.findById(req.admin.id).select('name username').lean();
    const actorName = actor?.name || actor?.username || 'Super Admin';

    request.auditTrail.push({
      status: request.status,
      note: resolutionNotes,
      changedBy: req.admin.id,
      changedByName: actorName
    });

    if (request.status === 'resolved') {
      request.resolvedAt = new Date();
      request.resolvedBy = req.admin.id;
      request.resolvedByName = actorName;
    } else if (status && status !== 'resolved') {
      request.resolvedAt = undefined;
      request.resolvedBy = undefined;
      request.resolvedByName = undefined;
    }

    if ((action === 'reset_password' || newPassword) && request.supportType === 'password-reset') {
      if (!newPassword) {
        return res.status(400).json({ error: 'newPassword is required to reset password' });
      }
      if (!isStrongPassword(newPassword)) {
        return res.status(400).json({ error: passwordPolicyMessage });
      }
      const resetResult = await performPasswordReset(request, newPassword);
      request.passwordReset = {
        performedAt: new Date(),
        performedBy: req.admin.id,
        performedByName: actorName,
        status: resetResult.success ? 'completed' : 'failed',
        targetUserId: resetResult.userId || null,
        message: resetResult.message
      };
      if (resetResult.success && !resolutionNotes) {
        request.resolutionNotes = `Password reset completed: ${resetResult.message}`;
      }
    }

    await request.save();
    res.json(sanitizeSupportRequest(request));
  } catch (err) {
    console.error('Failed to update support request', err);
    res.status(500).json({ error: err.message || 'Unable to update support request' });
  }
});

module.exports = router;
