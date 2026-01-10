const mongoose = require('mongoose');


const feedbackSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    role: String,
    name: String,
    schoolName: String,
    phone: String,
    email: String,
    class: String,
    consent: Boolean,
    rating: Number,
    feedback: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Feedback', feedbackSchema);
