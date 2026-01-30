const mongoose = require('mongoose');

const {
  MONGODB_URI,
  MONGO_URI,
  DATABASE_URL,
} = process.env;

const resolveMongoUri = () => MONGODB_URI || MONGO_URI || DATABASE_URL || '';

const parseArg = (key) => {
  const prefix = `--${key}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : null;
};

const campusId = parseArg('campusId');
const schoolId = parseArg('schoolId');
const dryRun = parseArg('dryRun') === 'true';

if (!campusId) {
  console.error('Missing --campusId=... argument');
  process.exit(1);
}

const uri = resolveMongoUri();
if (!uri) {
  console.error('Missing MongoDB connection string in env (MONGODB_URI/MONGO_URI/DATABASE_URL)');
  process.exit(1);
}

const buildFilter = () => {
  const filter = { $or: [{ campusId: null }, { campusId: { $exists: false } }] };
  if (schoolId && mongoose.isValidObjectId(schoolId)) {
    filter.schoolId = schoolId;
  }
  return filter;
};

const runUpdate = async (Model, name) => {
  const filter = buildFilter();
  const update = { $set: { campusId } };
  if (dryRun) {
    const count = await Model.countDocuments(filter);
    console.log(`${name}: ${count} documents would be updated`);
    return;
  }
  const result = await Model.updateMany(filter, update);
  console.log(`${name}: matched ${result.matchedCount}, modified ${result.modifiedCount}`);
};

const main = async () => {
  await mongoose.connect(uri, { dbName: process.env.DB_NAME });

  const models = [
    ['StudentUser', require('../models/StudentUser')],
    ['TeacherUser', require('../models/TeacherUser')],
    ['ParentUser', require('../models/ParentUser')],
    ['Class', require('../models/Class')],
    ['Section', require('../models/Section')],
    ['Subject', require('../models/Subject')],
    ['Timetable', require('../models/Timetable')],
    ['Exam', require('../models/Exam')],
    ['ExamResult', require('../models/ExamResult')],
    ['Notification', require('../models/Notification')],
  ];

  for (const [name, Model] of models) {
    await runUpdate(Model, name);
  }

  await mongoose.disconnect();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
