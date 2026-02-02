// Script to check for duplicate students in the database
require('dotenv').config();
const mongoose = require('mongoose');
const StudentUser = require('../models/StudentUser');

async function checkDuplicateStudents() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URL || process.env.MONGO_URI);
    console.log('✓ Connected to database\n');

    // Find all students
    const allStudents = await StudentUser.find({}).lean();
    console.log(`Total students in database: ${allStudents.length}\n`);

    // Group students by name, roll, and grade
    const studentGroups = new Map();

    allStudents.forEach(student => {
      const key = `${(student.name || '').toLowerCase().trim()}-${student.roll}-${(student.grade || '').toLowerCase().trim()}`;

      if (!studentGroups.has(key)) {
        studentGroups.set(key, []);
      }
      studentGroups.get(key).push(student);
    });

    // Find duplicates (groups with more than 1 student)
    const duplicates = [];
    studentGroups.forEach((students, key) => {
      if (students.length > 1) {
        duplicates.push({ key, students });
      }
    });

    console.log('=================================================');
    console.log('DUPLICATE STUDENTS FOUND');
    console.log('=================================================\n');

    if (duplicates.length === 0) {
      console.log('✓ No duplicate students found! Database is clean.\n');
    } else {
      console.log(`⚠ Found ${duplicates.length} duplicate student groups:\n`);

      duplicates.forEach((dup, index) => {
        console.log(`\n--- Duplicate Group ${index + 1} ---`);
        console.log(`Key: ${dup.key}`);
        console.log(`Count: ${dup.students.length} records\n`);

        dup.students.forEach((student, idx) => {
          console.log(`  Record ${idx + 1}:`);
          console.log(`    _id: ${student._id}`);
          console.log(`    Name: ${student.name}`);
          console.log(`    Roll: ${student.roll}`);
          console.log(`    Grade: ${student.grade}`);
          console.log(`    Section: ${student.section}`);
          console.log(`    Username: ${student.username}`);
          console.log(`    StudentCode: ${student.studentCode}`);
          console.log(`    Email: ${student.email || 'N/A'}`);
          console.log(`    Mobile: ${student.mobile || 'N/A'}`);
          console.log(`    SchoolId: ${student.schoolId || 'N/A'}`);
          console.log(`    CampusId: ${student.campusId || 'N/A'}`);
          console.log(`    NifStudent: ${student.nifStudent || 'N/A'}`);
          console.log(`    Created: ${student.createdAt}`);
          console.log(`    Updated: ${student.updatedAt}`);
          console.log('');
        });
      });

      console.log('\n=================================================');
      console.log('SUMMARY');
      console.log('=================================================');
      console.log(`Total duplicate groups: ${duplicates.length}`);
      console.log(`Total duplicate records: ${duplicates.reduce((sum, dup) => sum + dup.students.length, 0)}`);
      console.log(`Records that should be removed: ${duplicates.reduce((sum, dup) => sum + dup.students.length - 1, 0)}`);
      console.log('\n💡 TIP: You can remove duplicates by keeping the oldest/newest record');
      console.log('   and deleting the others based on _id or createdAt timestamp.\n');
    }

    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
checkDuplicateStudents();
