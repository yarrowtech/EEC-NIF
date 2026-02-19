const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const adminAuth = require('../middleware/adminAuth');
const StudentUser = require('../models/StudentUser');
const PromotionHistory = require('../models/PromotionHistory');

const resolveSchoolId = (req, res) => {
  const schoolId = req.schoolId || req.admin?.schoolId || null;
  if (!schoolId) {
    res.status(400).json({ error: 'schoolId is required' });
    return null;
  }
  if (!mongoose.isValidObjectId(schoolId)) {
    res.status(400).json({ error: 'Invalid schoolId' });
    return null;
  }
  return schoolId;
};

const resolveCampusId = (req) => req.campusId || null;

// ─────────────────────────────────────────────────────────────
// POST /api/promotion/preview
// Returns students that match the filter criteria (for preview before promotion)
// Body: { fromClass, fromSection?, fromAcademicYear? }
// ─────────────────────────────────────────────────────────────
router.post('/preview', adminAuth, async (req, res) => {
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);

    const { fromClass, fromSection, fromAcademicYear } = req.body;
    if (!fromClass) {
      return res.status(400).json({ error: 'fromClass is required' });
    }

    const filter = {
      schoolId,
      isArchived: { $ne: true },
      grade: fromClass,
    };

    // Exclude students already marked as leaving/left
    filter.status = { $nin: ['Leaving', 'Left', 'Expelled'] };

    if (campusId) filter.campusId = campusId;
    if (fromSection) filter.section = fromSection;
    if (fromAcademicYear) filter.academicYear = fromAcademicYear;

    const students = await StudentUser.find(filter)
      .select('_id name grade section roll academicYear studentCode status email mobile')
      .sort({ section: 1, roll: 1, name: 1 })
      .lean();

    res.json({ students, count: students.length });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to preview students' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/promotion/execute
// Executes the promotion — updates grade/section on selected students
// Body: {
//   studentIds: [...],
//   toClass: 'Class 6',
//   toSection?: 'A',
//   toAcademicYear?: '2025-26',
//   fromClass, fromSection?, fromAcademicYear?,
//   type: 'bulk' | 'manual',
//   notes?: ''
// }
// ─────────────────────────────────────────────────────────────
router.post('/execute', adminAuth, async (req, res) => {
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);

    const {
      studentIds,
      toClass,
      toSection,
      toAcademicYear,
      fromClass,
      fromSection,
      fromAcademicYear,
      type = 'manual',
      notes = '',
    } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'studentIds array is required' });
    }
    if (!toClass) {
      return res.status(400).json({ error: 'toClass is required' });
    }

    const validIds = studentIds.filter((id) => mongoose.isValidObjectId(id));
    if (validIds.length === 0) {
      return res.status(400).json({ error: 'No valid student IDs provided' });
    }

    // Build the update payload
    const updateFields = { grade: toClass };
    if (toSection) updateFields.section = toSection;
    if (toAcademicYear) updateFields.academicYear = toAcademicYear;

    const updateResult = await StudentUser.updateMany(
      { _id: { $in: validIds }, schoolId },
      { $set: updateFields }
    );

    // Record promotion history
    const history = await PromotionHistory.create({
      schoolId,
      campusId: campusId || null,
      fromClass: fromClass || '',
      toClass,
      fromSection: fromSection || null,
      toSection: toSection || null,
      fromAcademicYear: fromAcademicYear || null,
      toAcademicYear: toAcademicYear || null,
      studentIds: validIds,
      studentCount: updateResult.modifiedCount,
      type,
      promotedBy: req.admin?._id || null,
      notes,
    });

    res.json({
      success: true,
      promoted: updateResult.modifiedCount,
      historyId: history._id,
      message: `${updateResult.modifiedCount} student(s) promoted to ${toClass}${toSection ? ' - ' + toSection : ''}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to execute promotion' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/promotion/history
// Returns promotion history for the school/campus
// ─────────────────────────────────────────────────────────────
router.get('/history', adminAuth, async (req, res) => {
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);

    const filter = { schoolId };
    if (campusId) filter.campusId = campusId;

    const history = await PromotionHistory.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load history' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/promotion/leaving-students
// Returns students with status Leaving or Left
// Query: classFilter?, sectionFilter?
// ─────────────────────────────────────────────────────────────
router.get('/leaving-students', adminAuth, async (req, res) => {
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);

    const filter = {
      schoolId,
      status: { $in: ['Leaving', 'Left'] },
    };
    if (campusId) filter.campusId = campusId;

    const { classFilter, sectionFilter } = req.query;
    if (classFilter) filter.grade = classFilter;
    if (sectionFilter) filter.section = sectionFilter;

    const students = await StudentUser.find(filter)
      .select(
        '_id name grade section roll academicYear studentCode status email mobile fatherName guardianPhone reasonForLeaving transferCertificateNo transferCertificateDate remarks updatedAt'
      )
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ students, count: students.length });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load leaving students' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/promotion/mark-leaving
// Mark one or more students as "Leaving"
// Body: {
//   studentIds: [...],
//   leavingDate?,
//   reasonForLeaving?,
//   transferCertificateNo?,
//   transferCertificateDate?,
//   remarks?
// }
// ─────────────────────────────────────────────────────────────
router.post('/mark-leaving', adminAuth, async (req, res) => {
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    const {
      studentIds,
      leavingDate,
      reasonForLeaving,
      transferCertificateNo,
      transferCertificateDate,
      remarks,
    } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'studentIds array is required' });
    }
    if (!reasonForLeaving) {
      return res.status(400).json({ error: 'reasonForLeaving is required' });
    }

    const validIds = studentIds.filter((id) => mongoose.isValidObjectId(id));
    if (validIds.length === 0) {
      return res.status(400).json({ error: 'No valid student IDs provided' });
    }

    const updateFields = { status: 'Leaving' };
    if (reasonForLeaving) updateFields.reasonForLeaving = reasonForLeaving;
    if (transferCertificateNo) updateFields.transferCertificateNo = transferCertificateNo;
    // Use explicit TC date if provided, fall back to leaving date
    if (transferCertificateDate) {
      updateFields.transferCertificateDate = transferCertificateDate;
    } else if (leavingDate) {
      updateFields.transferCertificateDate = leavingDate;
    }
    // Store leaving date + remarks in remarks field for reference
    const remarksNote = [
      leavingDate ? `Leaving Date: ${leavingDate}` : '',
      remarks || '',
    ]
      .filter(Boolean)
      .join(' | ');
    if (remarksNote) updateFields.remarks = remarksNote;

    const result = await StudentUser.updateMany(
      { _id: { $in: validIds }, schoolId },
      { $set: updateFields }
    );

    res.json({
      success: true,
      updated: result.modifiedCount,
      message: `${result.modifiedCount} student(s) marked as leaving`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to mark students as leaving' });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/promotion/restore-student/:id
// Restore a leaving student back to Active
// ─────────────────────────────────────────────────────────────
router.put('/restore-student/:id', adminAuth, async (req, res) => {
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const student = await StudentUser.findOneAndUpdate(
      { _id: id, schoolId },
      {
        $set: {
          status: 'Active',
          reasonForLeaving: '',
          transferCertificateNo: '',
          transferCertificateDate: '',
          remarks: '',
        },
      },
      { new: true }
    ).select('name grade section status');

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ success: true, student, message: `${student.name} restored to Active` });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to restore student' });
  }
});

module.exports = router;
