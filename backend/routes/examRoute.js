const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const StudentUser = require('../models/StudentUser');
const TeacherUser = require('../models/TeacherUser');
const ParentUser = require('../models/ParentUser');
const Notification = require('../models/Notification');
const adminAuth = require('../middleware/adminAuth');
const teacherAuth = require('../middleware/authTeacher');

// Configure multer for CSV upload
const upload = multer({ dest: 'uploads/' });

const resolveSchoolId = (req, res) => {
    const schoolId = req.schoolId || req.admin?.schoolId || null;
    if (!schoolId) {
        res.status(400).json({ error: 'schoolId is required' });
        return null;
    }
    return schoolId;
};

const resolveCampusId = (req) => req.campusId || null;



const router = express.Router();


router.get("/fetch", adminAuth, async (req, res) => {
  // #swagger.tags = ['Exams']
    try {
        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const campusId = resolveCampusId(req);
        const filter = { schoolId, ...(campusId ? { campusId } : {}) };
        const exams = await Exam.find(filter).lean();
        res.status(200).json(exams);
    } catch(err) {
        res.status(400).json({error: err.message});
    }
})

router.post("/add", adminAuth, async (req, res) => {
  // #swagger.tags = ['Exams']
    try {
        const { title, subject, term, instructor, venue, date, time, duration, marks, noOfStudents, status } = req.body;
        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const campusId = resolveCampusId(req);
        const exam = await Exam.create({
            schoolId,
            campusId: campusId || null,
            title,
            subject,
            term: term || 'Term 1',
            instructor,
            venue,
            date,
            time,
            duration,
            marks,
            noOfStudents,
            status
        });
        res.status(201).json({message: "Exam added successfully", exam});
    } catch(err) {
        res.status(400).json({error: err.message});
    }
})

// Create or update exam results (admin/teacher)
// Combined middleware to accept both admin and teacher
const adminOrTeacherAuth = async (req, res, next) => {
    // Try admin auth first
    const adminToken = req.headers.authorization?.split(' ')[1];
    if (adminToken) {
        try {
            const decoded = require('jsonwebtoken').verify(adminToken, process.env.JWT_SECRET);
            if (decoded.type === 'admin') {
                req.admin = decoded;
                req.schoolId = decoded.schoolId;
                req.campusId = decoded.campusId || null;
                req.userType = 'Admin';
                if (!req.campusId) {
                  return res.status(400).json({ error: 'campusId is required' });
                }
                return next();
            }
        } catch (err) {
            // Token invalid or not admin, try teacher auth
        }
    }
    // Fall back to teacher auth
    return teacherAuth(req, res, next);
};

router.post("/results", adminOrTeacherAuth, async (req, res) => {
  // #swagger.tags = ['Exams']
    try {
        const schoolId = req.schoolId || req.user?.schoolId || req.admin?.schoolId || null;
        if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
        const campusId = req.campusId || null;
        const { examId, studentId, marks, grade, remarks, status } = req.body || {};
        if (!examId || !studentId) {
            return res.status(400).json({ error: 'examId and studentId are required' });
        }
        const exam = await Exam.findOne({ _id: examId, schoolId, ...(campusId ? { campusId } : {}) }).lean();
        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        const student = await StudentUser.findOne({ _id: studentId, schoolId, ...(campusId ? { campusId } : {}) }).lean();
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        if (campusId && student.campusId && String(student.campusId) !== String(campusId)) {
            return res.status(400).json({ error: 'Student does not belong to this campus' });
        }
        const score = Number(marks);
        if (!Number.isFinite(score) || score < 0) {
            return res.status(400).json({ error: 'Valid marks are required' });
        }

        const result = await ExamResult.findOneAndUpdate(
            { examId, studentId, schoolId, ...(campusId ? { campusId } : {}) },
            {
                schoolId,
                campusId: campusId || null,
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
        const campusId = req.campusId || null;
        const { examId, studentId } = req.query || {};
        const filter = { schoolId, ...(campusId ? { campusId } : {}) };
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
        const campusId = req.campusId || null;
        const results = await ExamResult.find({
          schoolId,
          studentId: req.user.id,
          ...(campusId ? { campusId } : {}),
        })
            .populate('examId', 'title subject date')
            .lean();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bulk upload results via CSV
router.post("/results/bulk-upload", adminAuth, upload.single('file'), async (req, res) => {
  // #swagger.tags = ['Exams']
    const filePath = req.file?.path;

    try {
        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;

        if (!filePath) {
            return res.status(400).json({ error: 'CSV file is required' });
        }

        const results = [];
        const errors = [];

        // Read and parse CSV
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => {
                    results.push(row);
                })
                .on('end', resolve)
                .on('error', reject);
        });

        let successCount = 0;
        let errorCount = 0;

        // Process each row
        for (let i = 0; i < results.length; i++) {
            const row = results[i];
            try {
                const { examId, studentId, marks, grade, remarks, status } = row;

                if (!examId || !studentId || !marks) {
                    errors.push(`Row ${i + 2}: Missing required fields (examId, studentId, marks)`);
                    errorCount++;
                    continue;
                }

                // Verify exam exists
                const exam = await Exam.findOne({ _id: examId, schoolId, ...(campusId ? { campusId } : {}) }).lean();
                if (!exam) {
                    errors.push(`Row ${i + 2}: Exam not found`);
                    errorCount++;
                    continue;
                }

                // Verify student exists
                const student = await StudentUser.findOne({ _id: studentId, schoolId, ...(campusId ? { campusId } : {}) }).lean();
                if (!student) {
                    errors.push(`Row ${i + 2}: Student not found`);
                    errorCount++;
                    continue;
                }
                if (campusId && student.campusId && String(student.campusId) !== String(campusId)) {
                    errors.push(`Row ${i + 2}: Student does not belong to this campus`);
                    errorCount++;
                    continue;
                }

                const score = Number(marks);
                if (!Number.isFinite(score) || score < 0) {
                    errors.push(`Row ${i + 2}: Invalid marks value`);
                    errorCount++;
                    continue;
                }

                // Upsert result
                await ExamResult.findOneAndUpdate(
                    { examId, studentId, schoolId, ...(campusId ? { campusId } : {}) },
                    {
                        schoolId,
                        campusId: campusId || null,
                        examId,
                        studentId,
                        marks: score,
                        grade: grade || '',
                        remarks: remarks || '',
                        status: status || 'pass',
                        createdBy: req.admin?.id || null,
                    },
                    { new: true, upsert: true, runValidators: true }
                );

                successCount++;
            } catch (err) {
                errors.push(`Row ${i + 2}: ${err.message}`);
                errorCount++;
            }
        }

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.status(200).json({
            success: true,
            count: successCount,
            errors: errorCount > 0 ? errors : undefined,
            message: `Successfully uploaded ${successCount} results${errorCount > 0 ? `, ${errorCount} failed` : ''}`
        });
    } catch (err) {
        // Clean up file on error
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        console.error('Bulk upload error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Publish results for a specific class/section
router.post("/results/publish", adminAuth, async (req, res) => {
  // #swagger.tags = ['Exams']
    try {
        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const campusId = resolveCampusId(req);

        const { grade, section } = req.body || {};
        if (!grade) {
            return res.status(400).json({ error: 'grade (class) is required' });
        }

        // Find all students in this class/section
        const studentFilter = { schoolId, grade, ...(campusId ? { campusId } : {}) };
        if (section) studentFilter.section = section;

        const students = await StudentUser.find(studentFilter).select('_id grade section').lean();

        if (students.length === 0) {
            return res.status(404).json({ error: 'No students found for this class/section' });
        }

        const studentIds = students.map(s => s._id);

        // Find all teachers who teach this class (teachers with same grade in subject or department field)
        // Note: This is a simplified approach. You might need to adjust based on your teacher-class assignment logic
        const teachers = await TeacherUser.find({ schoolId, ...(campusId ? { campusId } : {}) })
          .select('_id name email')
          .lean();

        // Find all parents of these students
        const parents = await ParentUser.find({
            schoolId,
            ...(campusId ? { campusId } : {}),
            childrenIds: { $in: studentIds }
        }).select('_id name email').lean();

        // Create notification message
        const sectionText = section ? ` Section ${section}` : '';
        const notificationTitle = `Results Published - ${grade}${sectionText}`;
        const notificationMessage = `The examination results for ${grade}${sectionText} have been published. Please check your results.`;

        // Create notifications for students
        await Notification.create({
            schoolId,
            campusId: campusId || null,
            title: notificationTitle,
            message: notificationMessage,
            audience: 'Student',
            createdBy: req.admin?.id || null,
        });

        // Create notifications for teachers
        await Notification.create({
            schoolId,
            campusId: campusId || null,
            title: notificationTitle,
            message: `The examination results for ${grade}${sectionText} have been published.`,
            audience: 'Teacher',
            createdBy: req.admin?.id || null,
        });

        // Create notifications for parents
        await Notification.create({
            schoolId,
            campusId: campusId || null,
            title: notificationTitle,
            message: `The examination results for ${grade}${sectionText} have been published. Please check your child's results.`,
            audience: 'Parent',
            createdBy: req.admin?.id || null,
        });

        res.status(200).json({
            success: true,
            message: `Results published successfully for ${grade}${sectionText}`,
            studentsNotified: students.length,
            teachersNotified: teachers.length,
            parentsNotified: parents.length
        });
    } catch (err) {
        console.error('Publish results error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
