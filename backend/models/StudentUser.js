<<<<<<< HEAD
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
=======
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
>>>>>>> 692c283aa64992261a83dd41142ba8207a54b7f7
