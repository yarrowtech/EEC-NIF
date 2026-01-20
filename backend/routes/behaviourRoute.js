const express = require('express');
const router = express.Router();
const Behaviour = require('../models/Behaviour');
const adminAuth = require('../middleware/adminAuth');

const resolveSchoolId = (req, res) => {
    const schoolId = req.schoolId || req.admin?.schoolId || null;
    if (!schoolId) {
        res.status(400).json({ error: 'schoolId is required' });
        return null;
    }
    return schoolId;
};

router.post('/submit', adminAuth, async (req, res) => {
  // #swagger.tags = ['Behaviour']
    try {
        const { studentClass, subject, questionType, startTime, endTime, correct, incorrect } = req.body;
        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const behaviourData = new Behaviour({
            schoolId,
            studentClass,
            subject,
            questionType,
            startTime,
            endTime,
            correct,
            incorrect
        });
        await behaviourData.save();
        res.status(201).json({ message: 'Behaviour data saved successfully' });
    } catch(err) {
        console.log(err)
        res.status(500).json({ error: 'Server error' });
    }
})

module.exports = router;
