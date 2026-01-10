const express = require('express');
const Subject = require('../models/Subject');
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
        const subjects = await Subject.find({ schoolId })
        res.status(200).json(subjects);
    } catch(err) {
        res.status(400).json({error: err.message});
    }
})

router.post("/add", adminAuth, async (req, res) => {
    try {
        const { subjectName, name, code, classId } = req.body;
        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const resolvedName = subjectName || name;
        if (!resolvedName || !String(resolvedName).trim()) {
            return res.status(400).json({ error: 'Subject name is required' });
        }
        const subject = new Subject({
            schoolId,
            name: String(resolvedName).trim(),
            code: code ? String(code).trim() : undefined,
            classId: classId || undefined
        });
        await subject.save();
        res.status(201).json({message: "Subject added successfully"});
    } catch(err) {
        res.status(400).json({error: err.message});
    }
})

module.exports = router;
