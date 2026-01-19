const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const teacherAuth = require('../middleware/authTeacher');
const TeacherUser = require('../models/TeacherUser');
const Course = require("../models/Course")

const resolveSchoolId = (req, res) => {
    const schoolId = req.schoolId || req.admin?.schoolId || req.user?.schoolId || null;
    if (!schoolId) {
        res.status(400).json({ error: 'schoolId is required' });
        return null;
    }
    return schoolId;
};

router.post("/add", adminAuth, async (req, res) => {
  // #swagger.tags = ['Courses']
    try {
        const { courseName, courseCode, description, duration, credits, department, prerequisites, instructor, startingDate } = req.body
        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const course = new Course({ 
            schoolId,
            courseName, 
            courseCode, 
            description, 
            duration, 
            credits: credits ? parseInt(credits) : undefined,
            department, 
            prerequisites, 
            instructor, 
            startingDate,
            updatedAt: new Date()
        })
        
        await course.save()
        res.status(201).json({
            message: "Course created successfully", 
            course: course
        })
    } catch(err) {
        if (err.code === 11000) {
            res.status(400).json({error: "Course code already exists"})
        } else {
            res.status(400).json({error: err.message})
        }
    }
})

router.get("/fetch", adminAuth, async (req, res) => {
  // #swagger.tags = ['Courses']
    try {
        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const allCourses = await Course.find({ schoolId })
        res.status(200).json(allCourses)
    } catch(err) {
        res.status(400).json({error: err.message})
    }
})

// Teacher route to create courses
router.post("/teacher/add", teacherAuth, async (req, res) => {
  // #swagger.tags = ['Courses']
    try {
        const { courseName, courseCode, description, duration, credits, department, prerequisites } = req.body
        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const teacher = await TeacherUser.findById(req.user?.id).select('name').lean();
        const instructorName = teacher?.name || req.user?.name || 'Teacher';
        const course = new Course({ 
            schoolId,
            courseName, 
            courseCode, 
            description, 
            duration, 
            credits: credits ? parseInt(credits) : undefined,
            department, 
            prerequisites, 
            instructor: instructorName,
            updatedAt: new Date()
        })
        
        await course.save()
        res.status(201).json({
            message: "Course created successfully", 
            course: course
        })
    } catch(err) {
        if (err.code === 11000) {
            res.status(400).json({error: "Course code already exists"})
        } else {
            res.status(400).json({error: err.message})
        }
    }
})

// Teacher route to fetch courses they created
router.get("/teacher/fetch", teacherAuth, async (req, res) => {
  // #swagger.tags = ['Courses']
    try {
        const schoolId = resolveSchoolId(req, res);
        if (!schoolId) return;
        const teacher = await TeacherUser.findById(req.user?.id).select('name').lean();
        const teacherNameForQuery = teacher?.name || req.user?.name || 'Teacher';
        const teacherCourses = await Course.find({ schoolId, instructor: teacherNameForQuery })
        res.status(200).json(teacherCourses)
    } catch(err) {
        res.status(400).json({error: err.message})
    }
})

module.exports = router
