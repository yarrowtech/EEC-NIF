const mongoose = require('mongoose');

const studentJournalEntrySchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentUser', required: true, index: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    campusId: { type: String, required: true, index: true },
    title: { type: String, default: 'Untitled' },
    content: { type: String, default: '' },
    tags: [{ type: String }],
    mood: { type: String, default: 'Neutral' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentJournalEntry', studentJournalEntrySchema);
