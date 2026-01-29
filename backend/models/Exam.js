const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    title: String,
    subject: String,
    term: {
        type: String,
        enum: ['Term 1', 'Term 2', 'Term 3', 'Class Test'],
        default: 'Term 1'
    },
    instructor: String,
    venue: String,
    date: String,
    time: String,
    duration: Number,
    marks: Number,
    noOfStudents: Number,
    status: String,
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    grade: String,
    section: String,
    published: { type: Boolean, default: false },
    publishedAt: { type: Date }
})

module.exports = mongoose.model('Exam', examSchema);
