const express = require('express');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const StudentUser = require('../models/StudentUser');
const adminAuth = require('../middleware/adminAuth');
const teacherAuth = require('../middleware/authTeacher');

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
  // #swagger.tags = ['Exams']
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
  // #swagger.tags = ['Exams']
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

// Create or update exam results (admin/teacher)
router.post("/results", teacherAuth, async (req, res) => {
  // #swagger.tags = ['Exams']
    try {
        const schoolId = req.schoolId || req.user?.schoolId || null;
        if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
        const { examId, studentId, marks, grade, remarks, status } = req.body || {};
        if (!examId || !studentId) {
            return res.status(400).json({ error: 'examId and studentId are required' });
        }
        const exam = await Exam.findOne({ _id: examId, schoolId }).lean();
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        const student = await StudentUser.findOne({ _id: studentId, schoolId }).lean();
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        const score = Number(marks);
        if (!Number.isFinite(score) || score < 0) {
            return res.status(400).json({ error: 'Valid marks are required' });
        }

        const result = await ExamResult.findOneAndUpdate(
            { examId, studentId, schoolId },
            {
                schoolId,
                examId,
                studentId,
                marks: score,
                grade,
                remarks,
                status: status || 'pass',
                createdBy: req.user?.id || req.admin?.id || null,
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// List results for an exam (admin/teacher)
router.get("/results", teacherAuth, async (req, res) => {
  // #swagger.tags = ['Exams']
    try {
        const schoolId = req.schoolId || req.user?.schoolId || null;
        if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
        const { examId, studentId } = req.query || {};
        const filter = { schoolId };
        if (examId) filter.examId = examId;
        if (studentId) filter.studentId = studentId;
        const results = await ExamResult.find(filter)
            .populate('studentId', 'name grade section roll')
            .populate('examId', 'title subject date')
            .lean();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin view of results with enriched student/exam info
router.get("/results/admin", adminAuth, async (req, res) => {
  // #swagger.tags = ['Exams']
  try {
    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;

    const { studentId, examId, grade, section, subject } = req.query || {};
    const filter = { schoolId };
    if (studentId) filter.studentId = studentId;
    if (examId) filter.examId = examId;

    const results = await ExamResult.find(filter)
      .populate({
        path: 'studentId',
        select: 'name grade section roll studentCode schoolId',
        populate: { path: 'schoolId', select: 'name code' },
      })
      .populate('examId', 'title subject date')
      .sort({ createdAt: -1 })
      .lean();

    const filtered = results.filter((result) => {
      const matchesClass = grade ? result.studentId?.grade === grade : true;
      const matchesSection = section ? result.studentId?.section === section : true;
      const resultSubject = result.examId?.subject || result.examId?.title || null;
      const matchesSubject = subject
        ? resultSubject && resultSubject.toLowerCase() === subject.toLowerCase()
        : true;
      return matchesClass && matchesSection && matchesSubject;
    });

    res.json(filtered);
  } catch (err) {
    console.error('Admin results fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Student fetch their results
router.get("/results/me", require('../middleware/authStudent'), async (req, res) => {
  // #swagger.tags = ['Exams']
    try {
        const schoolId = req.schoolId || req.user?.schoolId || null;
        if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
        const results = await ExamResult.find({ schoolId, studentId: req.user.id })
            .populate('examId', 'title subject date')
            .lean();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
