const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const hashPasswordIfNeeded = async (password) => {
  if (!password || typeof password !== 'string') return password;
  if (password.startsWith('$2a$') || password.startsWith('$2b$') || password.startsWith('$2y$')) {
    return password;
  }
  return bcrypt.hash(password, 10);
};

const parentUserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  initialPassword: { type: String, default: "" },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
  campusId: { type: String, default: null, index: true },
  name: String,
  mobile: String,
  email: String,
  relationship: { type: String, default: 'Parent' },
  occupation: { type: String, default: '' },
  address: { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  contactPreference: { type: String, default: '' },
  communicationStatus: { type: String, default: '' },
  engagementLevel: { type: String, default: '' },
  engagementMetrics: {
    communicationRate: { type: Number, default: 0 },
    eventAttendance: { type: Number, default: 0 },
    meetingParticipation: { type: Number, default: 0 },
    responsiveness: { type: Number, default: 0 },
    totalInteractions: { type: Number, default: 0 },
    lastContactDays: { type: Number, default: null },
  },
  recentActivities: [{ type: String }],
  lastLoginAt: { type: Date, default: null },
  childrenIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudentUser' }],
  children: [String],
  grade: [String],
}, { timestamps: true });

parentUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


parentUserSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() || {};
  const nextPassword = update.password || (update.$set && update.$set.password);
  if (!nextPassword) return next();

  const hashed = await hashPasswordIfNeeded(nextPassword);
  if (update.password) update.password = hashed;
  if (update.$set && update.$set.password) update.$set.password = hashed;
  this.setUpdate(update);
  next();
});

module.exports = mongoose.model('ParentUser', parentUserSchema);
