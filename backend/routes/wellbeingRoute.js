const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { updateWellbeing, getWellbeing } = require('../controllers/wellbeingController');

// @route   GET /api/wellbeing/:studentId
// @desc    Get student wellbeing
// @access  Admin
router.get('/:studentId', adminAuth, async (req, res, next) => {
  // #swagger.tags = ['Wellbeing']
  return getWellbeing(req, res, next);
});

// @route   PUT /api/wellbeing/:studentId
// @desc    Update student wellbeing
// @access  Admin
router.put('/:studentId', adminAuth, async (req, res, next) => {
  // #swagger.tags = ['Wellbeing']
  return updateWellbeing(req, res, next);
});

module.exports = router;
