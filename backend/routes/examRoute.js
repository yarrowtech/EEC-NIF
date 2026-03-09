const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const StudentUser = require('../models/StudentUser');
const TeacherUser = require('../models/TeacherUser');
const ParentUser = require('../models/ParentUser');
const Notification = require('../models/Notification');
const ClassModel = require('../models/Class');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const adminAuth = require('../middleware/adminAuth');
const teacherAuth = require('../middleware/authTeacher');
const NotificationService = require('../utils/notificationService');

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

const resolveAcademicContext = async ({ schoolId, campusId, classId, sectionId, subjectId }) => {
  if (!classId || !mongoose.isValidObjectId(classId)) {
    return { error: 'Valid classId is required' };
  }
  if (!sectionId || !mongoose.isValidObjectId(sectionId)) {
    return { error: 'Valid sectionId is required' };
  }
  if (!subjectId || !mongoose.isValidObjectId(subjectId)) {
    return { error: 'Valid subjectId is required' };
  }

  const baseFilter = { schoolId, ...(campusId ? { campusId } : {}) };
  const [classDoc, sectionDoc, subjectDoc] = await Promise.all([
    ClassModel.findOne({ _id: classId, ...baseFilter }).lean(),
    Section.findOne({ _id: sectionId, ...baseFilter }).lean(),
    Subject.findOne({ _id: subjectId, ...baseFilter }).lean(),
  ]);

  if (!classDoc) return { error: 'Class not found' };
  if (!sectionDoc) return { error: 'Section not found' };
  if (!subjectDoc) return { error: 'Subject not found' };
  if (String(sectionDoc.classId) !== String(classDoc._id)) {
    return { error: 'Section does not belong to the selected class' };
  }
  if (subjectDoc.classId && String(subjectDoc.classId) !== String(classDoc._id)) {
    return { error: 'Subject does not belong to the selected class' };
  }

  return {
    classDoc,
    sectionDoc,
    subjectDoc,
  };
};



const router = express.Router();


router.get("/fetch", adminAuth, async (req, res) => {
  // #swagger.tags = ['Exams']
    try {
        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const campusId = resolveCampusId(req);
        const filter = { schoolId, ...(campusId ? { campusId } : {}) };
        const exams = await Exam.find(filter)
          .populate('classId', 'name')
          .populate('sectionId', 'name classId')
          .populate('subjectId', 'name code classId')
          .sort({ date: -1, createdAt: -1 })
          .lean();
        res.status(200).json(exams);
    } catch(err) {
        res.status(400).json({error: err.message});
    }
})

router.post("/add", adminAuth, async (req, res) => {
  // #swagger.tags = ['Exams']
    try {
        const {
            title,
            term,
            instructor,
            venue,
            date,
            time,
            duration,
            marks,
            noOfStudents,
            status,
            classId,
            sectionId,
            subjectId,
            published
        } = req.body || {};
        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const campusId = resolveCampusId(req);
        const academicContext = await resolveAcademicContext({ schoolId, campusId, classId, sectionId, subjectId });
        if (academicContext.error) {
          return res.status(400).json({ error: academicContext.error });
        }
        const { classDoc, sectionDoc, subjectDoc } = academicContext;
        const exam = await Exam.create({
            schoolId,
            campusId: campusId || null,
            title,
            subject: subjectDoc.name,
            term: term || 'Term 1',
            instructor,
            venue,
            date,
            time,
            duration,
            marks,
            noOfStudents,
            status,
            classId: classDoc._id,
            sectionId: sectionDoc._id,
            subjectId: subjectDoc._id,
            grade: classDoc.name || '',
            section: sectionDoc.name || '',
            published: Boolean(published),
            publishedAt: published ? new Date() : null,
        });

        // Create notification for students
        try {
            await NotificationService.notifyExamScheduled({
                schoolId,
                campusId: campusId || null,
                exam,
                createdBy: req.admin?.id || null
            });
        } catch (notifErr) {
            console.error('Failed to create exam notification:', notifErr);
            // Don't fail the entire request if notification fails
        }

        res.status(201).json({message: "Exam added successfully", exam});
    } catch(err) {
        res.status(400).json({error: err.message});
    }
})

// Update exam (admin)
router.put("/:id", adminAuth, async (req, res) => {
  // #swagger.tags = ['Exams']
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid exam id' });
    }

    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);

    const {
      title,
      term,
      instructor,
      venue,
      date,
      time,
      duration,
      marks,
      noOfStudents,
      status,
      classId,
      sectionId,
      subjectId,
      published
    } = req.body || {};

    let academicUpdates = {};
    if (classId !== undefined || sectionId !== undefined || subjectId !== undefined) {
      const existingExam = await Exam.findOne({ _id: id, schoolId, ...(campusId ? { campusId } : {}) }).lean();
      if (!existingExam) {
        return res.status(404).json({ error: 'Exam not found' });
      }
      const academicContext = await resolveAcademicContext({
        schoolId,
        campusId,
        classId: classId || existingExam.classId,
        sectionId: sectionId || existingExam.sectionId,
        subjectId: subjectId || existingExam.subjectId,
      });
      if (academicContext.error) {
        return res.status(400).json({ error: academicContext.error });
      }
      const { classDoc, sectionDoc, subjectDoc } = academicContext;
      academicUpdates = {
        classId: classDoc._id,
        sectionId: sectionDoc._id,
        subjectId: subjectDoc._id,
        grade: classDoc.name || '',
        section: sectionDoc.name || '',
        subject: subjectDoc.name || '',
      };
    }

    const updates = {
      ...(title !== undefined ? { title } : {}),
      ...(term !== undefined ? { term } : {}),
      ...(instructor !== undefined ? { instructor } : {}),
      ...(venue !== undefined ? { venue } : {}),
      ...(date !== undefined ? { date } : {}),
      ...(time !== undefined ? { time } : {}),
      ...(duration !== undefined ? { duration } : {}),
      ...(marks !== undefined ? { marks } : {}),
      ...(noOfStudents !== undefined ? { noOfStudents } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(published !== undefined ? { published: Boolean(published), publishedAt: published ? new Date() : null } : {}),
      ...academicUpdates,
    };

    const exam = await Exam.findOneAndUpdate(
      { _id: id, schoolId, ...(campusId ? { campusId } : {}) },
      updates,
      { new: true, runValidators: true }
    );

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.status(200).json({ message: 'Exam updated successfully', exam });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete exam and linked results (admin)
router.delete("/:id", adminAuth, async (req, res) => {
  // #swagger.tags = ['Exams']
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid exam id' });
    }

    const schoolId = resolveSchoolId(req, res);
    if (!schoolId) return;
    const campusId = resolveCampusId(req);

    const filter = { _id: id, schoolId, ...(campusId ? { campusId } : {}) };
    const exam = await Exam.findOne(filter).lean();
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    await Promise.all([
      Exam.deleteOne(filter),
      ExamResult.deleteMany({ examId: id, schoolId, ...(campusId ? { campusId } : {}) }),
    ]);

    res.status(200).json({ message: 'Exam and linked results deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
        if (exam.grade && String(student.grade || '').trim() !== String(exam.grade || '').trim()) {
            return res.status(400).json({ error: 'Student does not belong to exam class' });
        }
        if (exam.section && String(student.section || '').trim() !== String(exam.section || '').trim()) {
            return res.status(400).json({ error: 'Student does not belong to exam section' });
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
router.get("/results", adminOrTeacherAuth, async (req, res) => {
  // #swagger.tags = ['Exams']
    try {
        const schoolId = req.schoolId || req.user?.schoolId || null;
        if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
        const campusId = req.campusId || null;
        const { examId, studentId, grade, section, subject } = req.query || {};
        const filter = { schoolId, ...(campusId ? { campusId } : {}) };
        if (examId) filter.examId = examId;
        if (studentId) filter.studentId = studentId;
        const results = await ExamResult.find(filter)
            .populate('studentId', 'name grade section roll')
            .populate('examId', 'title subject date term grade section classId sectionId subjectId')
            .lean();

        const filtered = results.filter((result) => {
          const studentGrade = result.studentId?.grade || '';
          const studentSection = result.studentId?.section || '';
          const examSubject = result.examId?.subject || '';
          const matchesGrade = grade ? String(studentGrade) === String(grade) : true;
          const matchesSection = section ? String(studentSection) === String(section) : true;
          const matchesSubject = subject
            ? String(examSubject).toLowerCase() === String(subject).toLowerCase()
            : true;
          return matchesGrade && matchesSection && matchesSubject;
        });

        res.json(filtered);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// List exams for exam management (admin only)
router.get("/fetch/manage", adminAuth, async (req, res) => {
  // #swagger.tags = ['Exams']
  try {
    const schoolId = req.schoolId || req.admin?.schoolId || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    const campusId = req.campusId || null;
    const exams = await Exam.find({ schoolId, ...(campusId ? { campusId } : {}) })
      .populate('classId', 'name')
      .populate('sectionId', 'name classId')
      .populate('subjectId', 'name code classId')
      .sort({ date: -1, createdAt: -1 })
      .lean();
    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read-only exam options for result management (admin/teacher)
router.get("/results/exam-options", adminOrTeacherAuth, async (req, res) => {
  // #swagger.tags = ['Exams']
  try {
    const schoolId = req.schoolId || req.user?.schoolId || req.admin?.schoolId || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    const campusId = req.campusId || null;

    const exams = await Exam.find({ schoolId, ...(campusId ? { campusId } : {}) })
      .select('title subject term date time marks grade section status classId sectionId subjectId')
      .populate('classId', 'name')
      .populate('sectionId', 'name classId')
      .populate('subjectId', 'name code classId')
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.status(200).json(exams);
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
      .populate('examId', 'title subject date term grade section classId sectionId subjectId')
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
            .populate('examId', 'title subject date term grade section classId sectionId subjectId')
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
        const campusId = resolveCampusId(req);

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

// Update individual result (admin/teacher)
router.put("/results/:id", adminOrTeacherAuth, async (req, res) => {
  // #swagger.tags = ['Exams']
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid result id' });
    }

    const schoolId = req.schoolId || req.user?.schoolId || req.admin?.schoolId || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    const campusId = req.campusId || null;

    const current = await ExamResult.findOne({
      _id: id,
      schoolId,
      ...(campusId ? { campusId } : {}),
    });

    if (!current) {
      return res.status(404).json({ error: 'Result not found' });
    }

    const { examId, studentId, marks, grade, remarks, status, published } = req.body || {};
    const targetExamId = examId || current.examId;
    const targetStudentId = studentId || current.studentId;

    if (!mongoose.isValidObjectId(targetExamId) || !mongoose.isValidObjectId(targetStudentId)) {
      return res.status(400).json({ error: 'Valid examId and studentId are required' });
    }

    const [exam, student] = await Promise.all([
      Exam.findOne({ _id: targetExamId, schoolId, ...(campusId ? { campusId } : {}) }).lean(),
      StudentUser.findOne({ _id: targetStudentId, schoolId, ...(campusId ? { campusId } : {}) }).lean(),
    ]);

    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (exam.grade && String(student.grade || '').trim() !== String(exam.grade || '').trim()) {
      return res.status(400).json({ error: 'Student does not belong to exam class' });
    }
    if (exam.section && String(student.section || '').trim() !== String(exam.section || '').trim()) {
      return res.status(400).json({ error: 'Student does not belong to exam section' });
    }

    const updates = {
      ...(examId ? { examId } : {}),
      ...(studentId ? { studentId } : {}),
      ...(grade !== undefined ? { grade } : {}),
      ...(remarks !== undefined ? { remarks } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(published !== undefined ? { published: Boolean(published), publishedAt: published ? new Date() : null } : {}),
      createdBy: req.user?.id || req.admin?.id || current.createdBy || null,
    };

    if (marks !== undefined) {
      const score = Number(marks);
      if (!Number.isFinite(score) || score < 0) {
        return res.status(400).json({ error: 'Valid marks are required' });
      }
      updates.marks = score;
    }

    const duplicate = await ExamResult.findOne({
      _id: { $ne: id },
      schoolId,
      examId: updates.examId || current.examId,
      studentId: updates.studentId || current.studentId,
      ...(campusId ? { campusId } : {}),
    }).lean();

    if (duplicate) {
      return res.status(409).json({ error: 'A result already exists for this exam and student' });
    }

    const updated = await ExamResult.findOneAndUpdate(
      { _id: id, schoolId, ...(campusId ? { campusId } : {}) },
      updates,
      { new: true, runValidators: true }
    )
      .populate('studentId', 'name grade section roll')
      .populate('examId', 'title subject date term grade section classId sectionId subjectId')
      .lean();

    res.status(200).json({ message: 'Result updated successfully', result: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete individual result (admin/teacher)
router.delete("/results/:id", adminOrTeacherAuth, async (req, res) => {
  // #swagger.tags = ['Exams']
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid result id' });
    }

    const schoolId = req.schoolId || req.user?.schoolId || req.admin?.schoolId || null;
    if (!schoolId) return res.status(400).json({ error: 'schoolId is required' });
    const campusId = req.campusId || null;

    const deleted = await ExamResult.findOneAndDelete({
      _id: id,
      schoolId,
      ...(campusId ? { campusId } : {}),
    }).lean();

    if (!deleted) {
      return res.status(404).json({ error: 'Result not found' });
    }

    res.status(200).json({ message: 'Result deleted successfully' });
  } catch (err) {
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

        // Create notification using NotificationService
        const sectionText = section ? ` Section ${section}` : '';

        try {
            // Create notification for students
            await NotificationService.notifyResultPublished({
                schoolId,
                campusId: campusId || null,
                grade,
                section,
                createdBy: req.admin?.id || null
            });

            // Create notifications for teachers
            await Notification.create({
                schoolId,
                campusId: campusId || null,
                title: `Results Published - ${grade}${sectionText}`,
                message: `The examination results for ${grade}${sectionText} have been published.`,
                audience: 'Teacher',
                type: 'result',
                priority: 'high',
                category: 'academic',
                createdBy: req.admin?.id || null,
            });

            // Create notifications for parents
            await Notification.create({
                schoolId,
                campusId: campusId || null,
                title: `Results Published - ${grade}${sectionText}`,
                message: `The examination results for ${grade}${sectionText} have been published. Please check your child's results.`,
                audience: 'Parent',
                type: 'result',
                priority: 'high',
                category: 'academic',
                createdBy: req.admin?.id || null,
            });
        } catch (notifErr) {
            console.error('Failed to create result notifications:', notifErr);
            // Don't fail the entire request if notification fails
        }

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

// Publish/Unpublish individual result
router.put("/results/:id/publish", adminAuth, async (req, res) => {
  // #swagger.tags = ['Exams']
    try {
        const { id } = req.params;
        const { published } = req.body;

        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const campusId = resolveCampusId(req);

        const filter = {
            _id: id,
            schoolId,
            ...(campusId ? { campusId } : {})
        };

        const result = await ExamResult.findOne(filter);

        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }

        result.published = published;
        result.publishedAt = published ? new Date() : null;
        await result.save();

        res.status(200).json({
            success: true,
            message: `Result ${published ? 'published' : 'unpublished'} successfully`,
            result
        });
    } catch (err) {
        console.error('Publish/unpublish result error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Bulk publish/unpublish results by IDs
router.put("/results/bulk-publish", adminAuth, async (req, res) => {
  // #swagger.tags = ['Exams']
    try {
        const { resultIds, published } = req.body;

        if (!Array.isArray(resultIds) || resultIds.length === 0) {
            return res.status(400).json({ error: 'resultIds array is required' });
        }

        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const campusId = resolveCampusId(req);

        const filter = {
            _id: { $in: resultIds },
            schoolId,
            ...(campusId ? { campusId } : {})
        };

        const updateData = {
            published,
            publishedAt: published ? new Date() : null
        };

        const updateResult = await ExamResult.updateMany(filter, updateData);

        res.status(200).json({
            success: true,
            message: `${updateResult.modifiedCount} result(s) ${published ? 'published' : 'unpublished'} successfully`,
            modifiedCount: updateResult.modifiedCount
        });
    } catch (err) {
        console.error('Bulk publish/unpublish results error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
