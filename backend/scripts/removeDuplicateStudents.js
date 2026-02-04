// Script to remove duplicate students from the database
// Keeps the most complete/recent record and deletes the others
require('dotenv').config();
const mongoose = require('mongoose');
const StudentUser = require('../models/StudentUser');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

// Score a student record based on completeness and recency
function scoreRecord(student) {
  let score = 0;


  // Prioritize records with schoolId and campusId
  if (student.schoolId) score += 50;
  if (student.campusId) score += 30;

  // Prioritize more recent updates
  if (student.updatedAt) {
    score += Math.floor(new Date(student.updatedAt).getTime() / 100000000);
  }

  // Prioritize records with more complete data
  if (student.email) score += 5;
  if (student.mobile) score += 5;
  if (student.studentCode) score += 10;

  return score;
}

async function removeDuplicateStudents(dryRun = true) {
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

    if (duplicates.length === 0) {
      console.log('✓ No duplicate students found! Database is clean.\n');
      await mongoose.connection.close();
      rl.close();
      return;
    }

    console.log('=================================================');
    console.log(dryRun ? 'DRY RUN - PREVIEW OF CHANGES' : 'REMOVING DUPLICATE STUDENTS');
    console.log('=================================================\n');

    console.log(`Found ${duplicates.length} duplicate student groups\n`);

    let totalToDelete = 0;
    const deletionPlan = [];

    duplicates.forEach((dup, index) => {
      console.log(`\n--- Duplicate Group ${index + 1}: ${dup.key} ---`);
      console.log(`Total records: ${dup.students.length}\n`);

      // Score each record
      const scoredStudents = dup.students.map(student => ({
        ...student,
        score: scoreRecord(student)
      }));

      // Sort by score (highest first)
      scoredStudents.sort((a, b) => b.score - a.score);

      // Keep the first one (highest score), delete the rest
      const toKeep = scoredStudents[0];
      const toDelete = scoredStudents.slice(1);

      console.log(`  ✓ KEEPING (Score: ${toKeep.score}):`);
      console.log(`    _id: ${toKeep._id}`);
      console.log(`    Name: ${toKeep.name}`);
      console.log(`    Username: ${toKeep.username}`);
      console.log(`    SchoolId: ${toKeep.schoolId || 'None'}`);
      console.log(`    CampusId: ${toKeep.campusId || 'None'}`);
      console.log(`    Updated: ${toKeep.updatedAt}`);

      console.log(`\n  ✗ DELETING:`);
      toDelete.forEach((student, idx) => {
        console.log(`    ${idx + 1}. _id: ${student._id} (Score: ${student.score}) - Username: ${student.username}`);
        deletionPlan.push(student._id);
        totalToDelete++;
      });
    });

    console.log('\n=================================================');
    console.log('SUMMARY');
    console.log('=================================================');
    console.log(`Duplicate groups found: ${duplicates.length}`);
    console.log(`Records to keep: ${duplicates.length}`);
    console.log(`Records to delete: ${totalToDelete}`);
    console.log('=================================================\n');

    if (dryRun) {
      console.log('ℹ️  This was a DRY RUN. No changes were made.');
      console.log('   To actually delete the duplicates, run with --execute flag.\n');
    } else {
      // Actually delete the duplicates
      console.log('⚠️  DELETING DUPLICATE RECORDS...\n');

      for (const id of deletionPlan) {
        await StudentUser.findByIdAndDelete(id);
        console.log(`  ✓ Deleted: ${id}`);
      }

      console.log(`\n✓ Successfully deleted ${totalToDelete} duplicate records!\n`);
    }

    await mongoose.connection.close();
    console.log('✓ Database connection closed');
    rl.close();
  } catch (error) {
    console.error('❌ Error:', error);
    rl.close();
    process.exit(1);
  }
}

// Main execution
(async () => {
  const args = process.argv.slice(2);
  const executeMode = args.includes('--execute');

  if (executeMode) {
    console.log('\n⚠️  WARNING: You are about to DELETE duplicate student records!');
    console.log('This action CANNOT be undone.\n');

    const answer = await askQuestion('Type "DELETE" to confirm, or anything else to cancel: ');

    if (answer.trim() === 'DELETE') {
      console.log('\nProceeding with deletion...\n');
      await removeDuplicateStudents(false);
    } else {
      console.log('❌ Deletion cancelled.\n');
      rl.close();
      process.exit(0);
    }
  } else {
    await removeDuplicateStudents(true);
  }
})();
