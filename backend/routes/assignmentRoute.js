const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const adminAuth = require('../middleware/adminAuth');
const authStudent = require('../middleware/authStudent');
const authTeacher = require('../middleware/authTeacher');
const StudentProgress = require('../models/StudentProgress');
const StudentUser = require('../models/StudentUser');
const NotificationService = require('../utils/notificationService');

const resolveSchoolId = (req, res) => {
    const schoolId = req.schoolId || req.admin?.schoolId || null;
    if (!schoolId) {
        res.status(400).json({ error: 'schoolId is required' });
        return null;
    }
    return schoolId;
};

router.get("/fetch", adminAuth, async (req, res) => {
  // #swagger.tags = ['Assignments']
    try {
        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const filter = { schoolId };
        if (req.campusId) {
            filter.$or = [
                { campusId: req.campusId },
                { campusId: { $exists: false } },
                { campusId: null }
            ];
        }
        const assignments = await Assignment.find(filter);
        res.status(200).json(assignments);
    } catch(err) {
        res.status(500).json({ error: "Internal server error" });
    }
})
router.post("/add", adminAuth, async (req, res) => {
  // #swagger.tags = ['Assignments']
    try {
        const { title, subject, class: className, marks, status, dueDate } = req.body;
        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const assignment = new Assignment({
            schoolId,
            campusId: req.campusId || null,
            title,
            subject,
            class: className,
            marks,
            status,
            dueDate
        });
        await assignment.save();

        // Create notification for students if assignment is active
        if (status === 'active') {
            try {
                await NotificationService.notifyAssignmentCreated({
                    schoolId,
                    campusId: req.campusId || null,
                    assignment,
                    createdBy: req.admin?.id || null
                });
            } catch (notifErr) {
                console.error('Failed to create assignment notification:', notifErr);
                // Don't fail the entire request if notification fails
            }
        }

        res.status(201).json({ message: "Assignment created successfully" });
    } catch(err) {
        res.status(500).json({ error: "Internal server error" });
    }
})

// Student submits assignment
router.post("/submit", authStudent, async (req, res) => {
  // #swagger.tags = ['Assignments']
    try {
        const { assignmentId } = req.body || {};
        const schoolId = req.schoolId || req.user?.schoolId || null;
        if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
        if (!assignmentId) return res.status(400).json({ error: 'assignmentId is required' });

        const assignment = await Assignment.findOne({ _id: assignmentId, schoolId }).lean();
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

        let progress = await StudentProgress.findOne({ studentId: req.user.id, schoolId });
        if (!progress) {
            progress = new StudentProgress({ studentId: req.user.id, schoolId, submissions: [] });
        }

        const isLate = assignment.dueDate && new Date() > new Date(assignment.dueDate);
        const status = isLate ? 'late' : 'submitted';

        const existingIndex = progress.submissions.findIndex(
            (sub) => sub.assignmentId.toString() === String(assignmentId)
        );

        if (existingIndex >= 0) {
            progress.submissions[existingIndex].submittedAt = new Date();
            progress.submissions[existingIndex].status = status;
        } else {
            progress.submissions.push({
                assignmentId,
                submittedAt: new Date(),
                status,
            });
        }

        progress.lastUpdated = new Date();
        await progress.save();

        res.status(201).json({ message: 'Assignment submitted', status });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// List submissions (admin/teacher)
router.get("/submissions", authTeacher, async (req, res) => {
  // #swagger.tags = ['Assignments']
    try {
        const schoolId = req.schoolId || req.user?.schoolId || null;
        if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
        const { assignmentId, studentId } = req.query || {};

        const filter = { schoolId };
        if (studentId) {
            filter.studentId = studentId;
        } else if (req.campusId) {
            const campusStudents = await StudentUser.find({ schoolId, campusId: req.campusId })
                .select('_id')
                .lean();
            const campusIds = campusStudents.map((student) => student._id);
            filter.studentId = { $in: campusIds };
        }

        const progressDocs = await StudentProgress.find(filter)
            .populate('studentId', 'name grade section roll')
            .populate('submissions.assignmentId', 'title subject dueDate marks')
            .lean();

        const items = progressDocs.map((doc) => {
            let submissions = doc.submissions || [];
            if (assignmentId) {
                submissions = submissions.filter(
                    (sub) => String(sub.assignmentId?._id || sub.assignmentId) === String(assignmentId)
                );
            }
            return {
                student: doc.studentId,
                submissions,
            };
        }).filter((item) => item.submissions.length > 0);

        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Student fetch own submissions
router.get("/my-submissions", authStudent, async (req, res) => {
  // #swagger.tags = ['Assignments']
    try {
        const schoolId = req.schoolId || req.user?.schoolId || null;
        if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
        const progress = await StudentProgress.findOne({ studentId: req.user.id, schoolId })
            .populate('submissions.assignmentId', 'title subject dueDate marks')
            .lean();
        res.json(progress?.submissions || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
