const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const adminAuth = require('../middleware/adminAuth');

const resolveSchoolId = (req, res) => {
    const schoolId = req.schoolId || req.admin?.schoolId || null;
    if (!schoolId) {
        res.status(400).json({ error: 'schoolId is required' });
        return null;
    }
    return schoolId;
};

router.get("/fetch", adminAuth, async (req, res) => {
    try {
        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const assignments = await Assignment.find({ schoolId });
        res.status(200).json(assignments);
    } catch(err) {
        res.status(500).json({ error: "Internal server error" });
    }
})
router.post("/add", adminAuth, async (req, res) => {
    try {
        const { title, subject, class: className, marks, status, dueDate } = req.body;
        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const assignment = new Assignment({
            schoolId,
            title,
            subject,
            class: className,
            marks,
            status,
            dueDate
        });
        await assignment.save();
        res.status(201).json({ message: "Assignment created successfully" });
    } catch(err) {
        res.status(500).json({ error: "Internal server error" });
    }
})

module.exports = router;
