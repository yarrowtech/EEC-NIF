const express = require('express');
const router = express.Router();
const PracticeSection = require('../models/PracticeSection');
const PracticePaper = require('../models/PracticePaper');
const authTeacher = require('../middleware/authTeacher');
const authStudent = require('../middleware/authStudent');

// ===== TEACHER ROUTES =====

// CREATE: Create new practice section
router.post('/', authTeacher, async (req, res, next) => {
  try {
    const {
      classId,
      sectionId,
      subjectId,
      name,
      description,
      icon,
      color,
      order,
    } = req.body;

    // Validate required fields
    if (!name || !classId) {
      return res.status(400).json({
        success: false,
        message: 'Name and classId are required',
      });
    }

    const sectionData = {
      schoolId: req.schoolId,
      classId,
      sectionId,
      subjectId,
      teacherId: req.userId,
      name: name.trim(),
      description: description || '',
      icon: icon || 'folder-open',
      color: color || 'bg-blue-100',
      order: order !== undefined ? order : 0,
      status: 'active',
    };

    const practiceSection = new PracticeSection(sectionData);
    await practiceSection.save();

    res.status(201).json({
      success: true,
      message: 'Practice section created successfully',
      section: practiceSection,
    });
  } catch (error) {
    console.error('Error creating practice section:', error);
    next(error);
  }
});

// LIST: Get teacher's practice sections
router.get('/teacher', authTeacher, async (req, res, next) => {
  try {
    const { classId, subjectId, status = 'active', page = 1, limit = 20 } = req.query;

    const filters = {
      schoolId: req.schoolId,
      teacherId: req.userId,
    };

    if (status !== 'all') filters.status = status;
    if (classId) filters.classId = classId;
    if (subjectId) filters.subjectId = subjectId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sections = await PracticeSection.find(filters)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('papers', 'title totalQuestions totalMarks status');

    const total = await PracticeSection.countDocuments(filters);

    res.json({
      success: true,
      sections,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    next(error);
  }
});

// GET SINGLE: Get practice section by ID
router.get('/:id', authTeacher, async (req, res, next) => {
  try {
    const section = await PracticeSection.findOne({
      _id: req.params.id,
      schoolId: req.schoolId,
    }).populate('papers');

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Practice section not found',
      });
    }

    res.json({
      success: true,
      section,
    });
  } catch (error) {
    console.error('Error fetching section:', error);
    next(error);
  }
});

// UPDATE: Update practice section
router.patch('/:id', authTeacher, async (req, res, next) => {
  try {
    const { name, description, icon, color, order, status } = req.body;

    const section = await PracticeSection.findOne({
      _id: req.params.id,
      schoolId: req.schoolId,
      teacherId: req.userId,
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Practice section not found',
      });
    }

    // Update allowed fields
    if (name) section.name = name.trim();
    if (description !== undefined) section.description = description;
    if (icon) section.icon = icon;
    if (color) section.color = color;
    if (order !== undefined) section.order = order;
    if (status) section.status = status;

    await section.save();

    res.json({
      success: true,
      message: 'Practice section updated successfully',
      section,
    });
  } catch (error) {
    console.error('Error updating section:', error);
    next(error);
  }
});

// DELETE: Delete practice section
router.delete('/:id', authTeacher, async (req, res, next) => {
  try {
    const section = await PracticeSection.findOneAndDelete({
      _id: req.params.id,
      schoolId: req.schoolId,
      teacherId: req.userId,
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Practice section not found',
      });
    }

    // Optionally: Move papers from deleted section to a default section or unlink them
    await PracticePaper.updateMany(
      { sectionId: req.params.id },
      { $unset: { sectionId: 1 } }
    );

    res.json({
      success: true,
      message: 'Practice section deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting section:', error);
    next(error);
  }
});

// ADD PAPER TO SECTION
router.post('/:sectionId/add-paper/:paperId', authTeacher, async (req, res, next) => {
  try {
    const section = await PracticeSection.findOne({
      _id: req.params.sectionId,
      schoolId: req.schoolId,
      teacherId: req.userId,
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Practice section not found',
      });
    }

    // Add paper to section if not already present
    if (!section.papers.includes(req.params.paperId)) {
      section.papers.push(req.params.paperId);
      section.paperCount = section.papers.length;
      await section.save();
    }

    // Update paper with section reference
    await PracticePaper.findByIdAndUpdate(
      req.params.paperId,
      { sectionId: req.params.sectionId }
    );

    res.json({
      success: true,
      message: 'Paper added to section',
      section,
    });
  } catch (error) {
    console.error('Error adding paper to section:', error);
    next(error);
  }
});

// REMOVE PAPER FROM SECTION
router.post('/:sectionId/remove-paper/:paperId', authTeacher, async (req, res, next) => {
  try {
    const section = await PracticeSection.findOne({
      _id: req.params.sectionId,
      schoolId: req.schoolId,
      teacherId: req.userId,
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Practice section not found',
      });
    }

    // Remove paper from section
    section.papers = section.papers.filter(
      (p) => p.toString() !== req.params.paperId
    );
    section.paperCount = section.papers.length;
    await section.save();

    // Update paper to remove section reference
    await PracticePaper.findByIdAndUpdate(
      req.params.paperId,
      { $unset: { sectionId: 1 } }
    );

    res.json({
      success: true,
      message: 'Paper removed from section',
      section,
    });
  } catch (error) {
    console.error('Error removing paper from section:', error);
    next(error);
  }
});

// ===== STUDENT ROUTES =====

// LIST: Get available practice sections (grouped by section/subject)
router.get('/student/sections', authStudent, async (req, res, next) => {
  try {
    const { classId, subjectId, page = 1, limit = 20 } = req.query;

    const filters = {
      schoolId: req.schoolId,
      status: 'active',
    };

    if (classId) filters.classId = classId;
    if (subjectId) filters.subjectId = subjectId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sections = await PracticeSection.find(filters)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'papers',
        match: { status: 'published' },
        select: 'title totalQuestions totalMarks difficulty',
      });

    const total = await PracticeSection.countDocuments(filters);

    res.json({
      success: true,
      sections,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    next(error);
  }
});

// GET SINGLE: Get practice section details with papers (student view)
router.get('/student/sections/:id', authStudent, async (req, res, next) => {
  try {
    const section = await PracticeSection.findOne({
      _id: req.params.id,
      schoolId: req.schoolId,
      status: 'active',
    }).populate({
      path: 'papers',
      match: { status: 'published' },
      select: 'title description totalQuestions totalMarks difficulty duration',
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Practice section not found',
      });
    }

    res.json({
      success: true,
      section,
    });
  } catch (error) {
    console.error('Error fetching section:', error);
    next(error);
  }
});

module.exports = router;
