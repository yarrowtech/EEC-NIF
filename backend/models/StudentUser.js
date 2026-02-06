  const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs');

const hashPasswordIfNeeded = async (password) => {
  if (!password || typeof password !== 'string') return password;
  if (password.startsWith('$2a$') || password.startsWith('$2b$') || password.startsWith('$2y$')) {
    return password;
  }
  return bcrypt.hash(password, 10);
};

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['present', 'absent'], required: true },
  subject: { type: String }, // Optional, for subject-specific attendance
});

const studentUserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
  campusId: { type: String, default: null },
  campusName: { type: String, default: null },
  campusType: { type: String, default: null },
  studentCode: { type: String, unique: true, sparse: true },
  name: String,
  grade: String,
  section: String,
  roll: Number,
  gender: { type: String, enum: ["male", "female", "other"], default: "male" },
  dob: String,
  admissionDate: Date,
  admissionNumber: String,
  academicYear: String,
  serialNo: String,
  status: { type: String, default: "Active" },
  mobile:  String,
  email: String,
  address: String,
  permanentAddress: String,
  pinCode: String,
  profilePic: { type: String, default: "" },
  birthPlace: String,
  bloodGroup: String,
  caste: String,
  category: String,
  nationality: String,
  religion: String,
  fatherName: String,
  fatherPhone: String,
  fatherOccupation: String,
  motherName: String,
  motherPhone: String,
  motherOccupation: String,
  guardianName: String,
  guardianPhone: String,
  guardianEmail: String,
  knownHealthIssues: String,
  allergies: String,
  immunizationStatus: String,
  learningDisabilities: String,
  aadharNumber: String,
  birthCertificateNo: String,
  previousSchoolName: String,
  previousClass: String,
  previousPercentage: String,
  transferCertificateNo: String,
  transferCertificateDate: String,
  reasonForLeaving: String,
  applicationId: String,
  applicationDate: String,
  approvalStatus: String,
  remarks: String,
  lastLoginAt: { type: Date, default: null },


  // Embedded attendance array
  attendance: [attendanceSchema],
}, { timestamps: true });

studentUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

studentUserSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() || {};
  const nextPassword = update.password || (update.$set && update.$set.password);
  if (!nextPassword) return next();
  const hashed = await hashPasswordIfNeeded(nextPassword);
  if (update.password) update.password = hashed;
  if (update.$set && update.$set.password) update.$set.password = hashed;
  this.setUpdate(update);
  next();
});

module.exports = mongoose.model('StudentUser', studentUserSchema);  
