const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const teacherUserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
  employeeCode: { type: String, unique: true, sparse: true },
  empId: Number,
  name: String,
  email: String,
  mobile: String,
  subject: String,
  department: String,
  experience: String,
  qualification: String,
  joiningDate: String,
  address: String,
  gender: { type: String, enum: ["male", "female", "other"], default: "male" },
  pinCode: String,
  profilePic: { type: String, default: "" },
}, { timestamps: true });

teacherUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('TeacherUser', teacherUserSchema);
