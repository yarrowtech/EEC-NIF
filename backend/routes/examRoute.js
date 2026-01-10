const express = require('express');
const Exam = require('../models/Exam');
const adminAuth = require('../middleware/adminAuth');

const resolveSchoolId = (req, res) => {
    const schoolId = req.schoolId || req.admin?.schoolId || null;
    if (!schoolId) {
        res.status(400).json({ error: 'schoolId is required' });
        return null;
    }
    return schoolId;
};



const router = express.Router();


router.get("/fetch", adminAuth, async (req, res) => {
    try {
        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const subjects = await Exam.find({ schoolId })
        res.status(200).json(subjects);
    } catch(err) {
        res.status(400).json({error: err.message});
    }
})

router.post("/add", adminAuth, async (req, res) => {
    try {
        const { title, subject, instructor, venue, date, time, duration, marks, noOfStudents, status } = req.body;
        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const exam = new Exam({
            schoolId,
            title,
            subject,
            instructor,
            venue,
            date,
            time,
            duration,
            marks,
            noOfStudents,
            status
        });
        await exam.save();
        res.status(201).json({message: "Exam added successfully"});
    } catch(err) {
        res.status(400).json({error: err.message});
    }
})

module.exports = router;
