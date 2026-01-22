const mongoose = require('mongoose');
const TeacherUser = require('../models/TeacherUser');
const Admin = require('../models/Admin');
const School = require('../models/School');

const normalizeAdminCode = (username) => {
  if (!username) return '';
  const cleaned = String(username).trim().toUpperCase();
  if (!cleaned) return '';
  if (cleaned.startsWith('EEC-')) {
    return cleaned.slice(4);
  }
  return cleaned;
};

const normalizeSchoolCode = (code) => {
  const cleaned = String(code || '').trim().toUpperCase();
  if (!cleaned) return '';
  return cleaned.replace(/^EEC[-_]/, '');
};

const padNumber = (value, size) => String(value).padStart(size, '0');

const buildTeacherCode = (prefix, sequence) => `${prefix}-TEA-${padNumber(sequence, 3)}`;

const resolvePrefix = async ({ adminByCampusKey, schoolById, teacher }) => {
  const schoolId = String(teacher.schoolId || '');
  const campusId = String(teacher.campusId || '');
  const campusKey = `${schoolId}:${campusId || 'none'}`;
  const admin = adminByCampusKey.get(campusKey);
  if (admin?.username) {
    const adminCode = normalizeAdminCode(admin.username);
    if (adminCode) return adminCode;
  }
  const school = schoolById.get(schoolId);
  if (school?.code) {
    const schoolCode = normalizeSchoolCode(school.code);
    if (schoolCode) return schoolCode;
  }
  return '';
};

const run = async () => {
  const mongoUrl = process.env.MONGODB_URL;
  if (!mongoUrl) {
    throw new Error('MONGODB_URL is required');
  }
  await mongoose.connect(mongoUrl);

  const [admins, schools, teachers] = await Promise.all([
    Admin.find({ role: 'admin' }).select('username schoolId campusId createdAt').lean(),
    School.find({}).select('code').lean(),
    TeacherUser.find({}).select('schoolId campusId createdAt employeeCode').lean()
  ]);

  const schoolById = new Map(schools.map((s) => [String(s._id), s]));

  const adminByCampusKey = new Map();
  admins
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .forEach((admin) => {
      const schoolId = String(admin.schoolId || '');
      const campusId = String(admin.campusId || '');
      const key = `${schoolId}:${campusId || 'none'}`;
      if (!adminByCampusKey.has(key)) {
        adminByCampusKey.set(key, admin);
      }
    });

  const grouped = new Map();
  for (const teacher of teachers) {
    const prefix = await resolvePrefix({ adminByCampusKey, schoolById, teacher });
    if (!prefix) continue;
    if (!grouped.has(prefix)) grouped.set(prefix, []);
    grouped.get(prefix).push(teacher);
  }

  const updates = [];
  for (const [prefix, list] of grouped.entries()) {
    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    list.forEach((teacher, idx) => {
      const nextCode = buildTeacherCode(prefix, idx + 1);
      if (teacher.employeeCode === nextCode) return;
      updates.push({
        updateOne: {
          filter: { _id: teacher._id },
          update: { $set: { employeeCode: nextCode } }
        }
      });
    });
  }

  if (updates.length) {
    const result = await TeacherUser.bulkWrite(updates);
    console.log(`Updated ${result.modifiedCount || 0} teachers.`);
  } else {
    console.log('No teacher codes needed updates.');
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exitCode = 1;
});
