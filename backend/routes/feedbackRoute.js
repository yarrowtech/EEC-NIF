const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const adminAuth = require('../middleware/adminAuth');

const resolveSchoolId = (req, res) => {
    const schoolId = req.schoolId || req.admin?.schoolId || req.body?.schoolId || req.query?.schoolId || null;
    if (!schoolId) {
        res.status(400).json({ error: 'schoolId is required' });
        return null;
    }
    return schoolId;
};

router.get('/fetch', adminAuth, async (req, res) => {
  // #swagger.tags = ['Feedback']
    try {
        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const feedbacks = await Feedback.find({ schoolId });
        res.status(200).json(feedbacks);
    } catch(err) {
        res.status(500).json({
            message: 'Error fetching feedback'})
    }
})

router.post("/add", async (req, res) => {
  // #swagger.tags = ['Feedback']
    const { role, name, schoolName, phone, consent, email, class: className, rating, feedback, schoolId } = req.body;

    if (!role || !name || !schoolName || !phone || !rating || !feedback) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const resolvedSchoolId = resolveSchoolId(req, res);
        if (!resolvedSchoolId) return;
        const newFeedback = new Feedback({
            schoolId: resolvedSchoolId,
            role,
            name,
            schoolName,
            phone,
            email,
            class: className,
            consent,
            rating,
            feedback
        });

        await newFeedback.save();
        res.status(201).json({ message: 'Feedback added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error adding feedback' });
    }
})

module.exports = router;
