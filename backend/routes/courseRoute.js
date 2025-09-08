const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const teacherAuth = require('../middleware/authTeacher');
const Course = require("../models/Course")


router.post("/add", adminAuth, async (req, res) => {
    try {
        const { courseName, courseCode, description, duration, credits, department, prerequisites, instructor, startingDate } = req.body
        
        const course = new Course({ 
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
    try {
        const allCourses = await Course.find({})
        res.status(200).json(allCourses)
    } catch(err) {
        res.status(400).json({error: err.message})
    }
})

// Teacher route to create courses
router.post("/teacher/add", teacherAuth, async (req, res) => {
    try {
        const { courseName, courseCode, description, duration, credits, department, prerequisites } = req.body
        
        const course = new Course({ 
            courseName, 
            courseCode, 
            description, 
            duration, 
            credits: credits ? parseInt(credits) : undefined,
            department, 
            prerequisites, 
            instructor: req.teacher.name,
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
    try {
        const teacherCourses = await Course.find({ instructor: req.teacher.name })
        res.status(200).json(teacherCourses)
    } catch(err) {
        res.status(400).json({error: err.message})
    }
})

module.exports = router