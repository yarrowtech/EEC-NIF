  const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs');

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['present', 'absent'], required: true },
  subject: { type: String }, // Optional, for subject-specific attendance
});

const studentUserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
  studentCode: { type: String, unique: true, sparse: true },
  name: String,
  grade: String,
  section: String,
  roll: Number,
  gender: { type: String, enum: ["male", "female", "other"], default: "male" },
  dob: String,
  admissionDate: Date,
  mobile:  String,
  email: String,
  address: String,
  pinCode: String,
  profilePic: { type: String, default: "" },


  // Embedded attendance array
  attendance: [attendanceSchema],
}, { timestamps: true });

studentUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('StudentUser', studentUserSchema);  
