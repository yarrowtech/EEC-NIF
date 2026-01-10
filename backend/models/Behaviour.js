const mongoose = require("mongoose")
const { questionPaper } = require("../../frontend/src/components/questionPaper")


const behaviourSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    studentClass: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    questionType: String,
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    correct: {
        type: Number,
        required: true
    },
    incorrect: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Behaviour", behaviourSchema)
