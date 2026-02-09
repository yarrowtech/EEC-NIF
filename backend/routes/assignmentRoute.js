const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const adminAuth = require('../middleware/adminAuth');
const authStudent = require('../middleware/authStudent');
const authTeacher = require('../middleware/authTeacher');
const StudentProgress = require('../models/StudentProgress');
const StudentUser = require('../models/StudentUser');
const NotificationService = require('../utils/notificationService');
const Timetable = require('../models/Timetable');
const Class = require('../models/Class');
const Section = require('../models/Section');

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

// ========== TEACHER ROUTES ==========

// Teachers get their class/section assignments (for creating assignments)
router.get("/teacher/my-classes", authTeacher, async (req, res) => {
  // #swagger.tags = ['Assignments']
    try {
        const schoolId = req.schoolId || req.teacher?.schoolId || null;
        if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });

        const campusId = req.campusId || null;

        // The authTeacher middleware puts the decoded token in req.user and req.teacher
        // The token contains { id, userType, schoolId, campusId, ... }
        const teacherId = req.user?.id || req.teacher?.id;
        if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });

        console.log('Teacher my-classes request:', { teacherId, schoolId, campusId });

        // Find all timetables where this teacher is assigned
        const timetables = await Timetable.find({
            schoolId,
            'entries.teacherId': teacherId
        })
        .populate('classId', 'name')
        .populate('sectionId', 'name')
        .lean();

        console.log('Found timetables:', timetables.length);

        // Extract unique class-section combinations
        const classSections = [];
        const seen = new Set();

        timetables.forEach(timetable => {
            const key = `${timetable.classId?._id}-${timetable.sectionId?._id}`;
            if (!seen.has(key) && timetable.classId && timetable.sectionId) {
                seen.add(key);
                classSections.push({
                    classId: timetable.classId._id,
                    className: timetable.classId.name,
                    sectionId: timetable.sectionId._id,
                    sectionName: timetable.sectionId.name
                });
            }
        });

        // If no timetables found, fallback to all classes in the school/campus
        if (classSections.length === 0) {
            console.log('No timetables found, fetching all class-section combinations');

            const filter = { schoolId };
            if (campusId) {
                filter.campusId = campusId;
            }

            const classes = await Class.find(filter).lean();

            for (const classDoc of classes) {
                const sections = await Section.find({
                    schoolId,
                    classId: classDoc._id,
                    ...(campusId ? { campusId } : {})
                }).lean();

                sections.forEach(section => {
                    classSections.push({
                        classId: classDoc._id,
                        className: classDoc.name,
                        sectionId: section._id,
                        sectionName: section.name
                    });
                });
            }
        }

        console.log('Unique class-sections:', classSections);
        res.json(classSections);
    } catch (err) {
        console.error('Error in teacher/my-classes:', err);
        res.status(500).json({ error: err.message });
    }
});

// Teachers create assignment
router.post("/teacher/create", authTeacher, async (req, res) => {
  // #swagger.tags = ['Assignments']
    try {
        const { title, description, subject, classId, sectionId, marks, dueDate, status, attachments } = req.body;
        const schoolId = req.schoolId || req.teacher?.schoolId || null;
        if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });

        const teacherId = req.teacher?.id || req.user?.id;
        if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });

        // Validate that class and section exist and belong to the same school
        const classDoc = await Class.findOne({ _id: classId, schoolId });
        if (!classDoc) {
            return res.status(404).json({ error: 'Class not found' });
        }

        const sectionDoc = await Section.findOne({ _id: sectionId, schoolId, classId });
        if (!sectionDoc) {
            return res.status(404).json({ error: 'Section not found or does not belong to this class' });
        }

        const assignment = new Assignment({
            schoolId,
            campusId: req.campusId || null,
            teacherId,
            title,
            description: description || '',
            subject,
            class: classDoc.name || '',
            classId,
            sectionId,
            marks: marks || 100,
            attachments: attachments || [],
            status: status || 'draft',
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
                    createdBy: teacherId
                });
            } catch (notifErr) {
                console.error('Failed to create assignment notification:', notifErr);
            }
        }

        res.status(201).json({ message: "Assignment created successfully", assignment });
    } catch (err) {
        console.error('Create assignment error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Teachers get their own assignments
router.get("/teacher/my-assignments", authTeacher, async (req, res) => {
  // #swagger.tags = ['Assignments']
    try {
        const schoolId = req.schoolId || req.teacher?.schoolId || null;
        if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });

        const teacherId = req.teacher?.id || req.user?.id;
        if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });

        const filter = { schoolId, teacherId };
        if (req.campusId) {
            filter.$or = [
                { campusId: req.campusId },
                { campusId: { $exists: false } },
                { campusId: null }
            ];
        }

        const assignments = await Assignment.find(filter)
            .populate('classId', 'name')
            .populate('sectionId', 'name')
            .sort({ createdAt: -1 });

        res.json(assignments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Teachers update assignment
router.put("/teacher/update/:id", authTeacher, async (req, res) => {
  // #swagger.tags = ['Assignments']
    try {
        const { id } = req.params;
        const schoolId = req.schoolId || req.teacher?.schoolId || null;
        if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });

        const teacherId = req.teacher?.id || req.user?.id;
        if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });

        const assignment = await Assignment.findOne({ _id: id, schoolId, teacherId });
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found or unauthorized' });
        }

        const { title, description, subject, marks, dueDate, status, attachments } = req.body;

        if (title) assignment.title = title;
        if (description !== undefined) assignment.description = description;
        if (subject) assignment.subject = subject;
        if (marks !== undefined) assignment.marks = marks;
        if (dueDate) assignment.dueDate = dueDate;
        if (status) assignment.status = status;
        if (attachments !== undefined) assignment.attachments = attachments;

        await assignment.save();

        res.json({ message: "Assignment updated successfully", assignment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Teachers delete assignment
router.delete("/teacher/delete/:id", authTeacher, async (req, res) => {
  // #swagger.tags = ['Assignments']
    try {
        const { id } = req.params;
        const schoolId = req.schoolId || req.teacher?.schoolId || null;
        if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });

        const teacherId = req.teacher?.id || req.user?.id;
        if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });

        const assignment = await Assignment.findOneAndDelete({ _id: id, schoolId, teacherId });
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found or unauthorized' });
        }

        res.json({ message: "Assignment deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Teachers grade assignment submission
router.post("/teacher/grade", authTeacher, async (req, res) => {
  // #swagger.tags = ['Assignments']
    try {
        const { studentId, assignmentId, score, feedback } = req.body;
        const schoolId = req.schoolId || req.teacher?.schoolId || null;
        if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });

        const teacherId = req.teacher?.id || req.user?.id;
        if (!teacherId) return res.status(400).json({ error: 'teacherId is required' });

        // Verify assignment belongs to this teacher
        const assignment = await Assignment.findOne({ _id: assignmentId, schoolId, teacherId });
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found or unauthorized' });
        }

        // Update student progress
        const progress = await StudentProgress.findOne({ studentId, schoolId });
        if (!progress) {
            return res.status(404).json({ error: 'Student progress not found' });
        }

        const submissionIndex = progress.submissions.findIndex(
            sub => sub.assignmentId.toString() === assignmentId
        );

        if (submissionIndex === -1) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        progress.submissions[submissionIndex].score = score;
        progress.submissions[submissionIndex].feedback = feedback || '';
        progress.submissions[submissionIndex].status = 'graded';
        progress.lastUpdated = new Date();

        await progress.save();

        res.json({ message: "Assignment graded successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== STUDENT ROUTES ==========

// Students get assignments for their class/section
router.get("/student/assignments", authStudent, async (req, res) => {
  // #swagger.tags = ['Assignments']
    try {
        const schoolId = req.schoolId || req.user?.schoolId || null;
        if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });

        const studentId = req.student?.id || req.user?.id;
        if (!studentId) return res.status(400).json({ error: 'studentId is required' });

        // Get student details
        const student = await StudentUser.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Find class by grade
        const classDoc = await Class.findOne({
            schoolId,
            name: student.grade,
            campusId: student.campusId
        });

        if (!classDoc) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // Find section by name and classId
        const sectionDoc = await Section.findOne({
            schoolId,
            classId: classDoc._id,
            name: student.section
        });

        if (!sectionDoc) {
            return res.status(404).json({ error: 'Section not found' });
        }

        // Get assignments for this class and section
        const filter = {
            schoolId,
            classId: classDoc._id,
            sectionId: sectionDoc._id,
            status: 'active'
        };

        if (req.campusId) {
            filter.$or = [
                { campusId: req.campusId },
                { campusId: { $exists: false } },
                { campusId: null }
            ];
        }

        const assignments = await Assignment.find(filter)
            .populate('teacherId', 'name')
            .sort({ createdAt: -1 });

        // Get student's submission status for each assignment
        const progress = await StudentProgress.findOne({ studentId, schoolId });
        const submissions = progress?.submissions || [];

        const assignmentsWithStatus = assignments.map(assignment => {
            const submission = submissions.find(
                sub => sub.assignmentId.toString() === assignment._id.toString()
            );
            return {
                ...assignment.toObject(),
                submissionStatus: submission?.status || 'not_submitted',
                submittedAt: submission?.submittedAt,
                score: submission?.score,
                feedback: submission?.feedback
            };
        });

        res.json(assignmentsWithStatus);
    } catch (err) {
        console.error('Student assignments error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Student submits assignment
router.post("/submit", authStudent, async (req, res) => {
  // #swagger.tags = ['Assignments']
    try {
        const { assignmentId, submissionText, attachmentUrl } = req.body || {};
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

        const submissionData = {
            submittedAt: new Date(),
            status,
            submissionText: submissionText || '',
            attachmentUrl: attachmentUrl || ''
        };

        if (existingIndex >= 0) {
            progress.submissions[existingIndex] = {
                ...progress.submissions[existingIndex],
                ...submissionData
            };
        } else {
            progress.submissions.push({
                assignmentId,
                ...submissionData
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
