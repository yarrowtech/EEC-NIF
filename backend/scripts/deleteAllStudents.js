// Script to delete all student data
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const NifStudent = require('../models/NifStudent');
const NifFeeRecord = require('../models/NifFeeRecord');
const NifArchivedStudent = require('../models/NifArchivedStudent');

async function deleteAllStudents() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    // Count before deletion
    const studentCount = await NifStudent.countDocuments({});
    const feeCount = await NifFeeRecord.countDocuments({});
    const archivedCount = await NifArchivedStudent.countDocuments({});

    console.log('\nCurrent data:');
    console.log(`- Students: ${studentCount}`);
    console.log(`- Fee Records: ${feeCount}`);
    console.log(`- Archived Students: ${archivedCount}`);

    console.log('\nDeleting all student data...');

    // Delete all students
    const studentDelete = await NifStudent.deleteMany({});
    console.log(`✓ Deleted ${studentDelete.deletedCount} students`);

    // Delete all fee records
    const feeDelete = await NifFeeRecord.deleteMany({});
    console.log(`✓ Deleted ${feeDelete.deletedCount} fee records`);

    // Delete all archived students
    const archivedDelete = await NifArchivedStudent.deleteMany({});
    console.log(`✓ Deleted ${archivedDelete.deletedCount} archived students`);

    // Verify deletion
    const remainingStudents = await NifStudent.countDocuments({});
    const remainingFees = await NifFeeRecord.countDocuments({});
    const remainingArchived = await NifArchivedStudent.countDocuments({});

    console.log('\nVerification:');
    console.log(`- Remaining students: ${remainingStudents}`);
    console.log(`- Remaining fee records: ${remainingFees}`);
    console.log(`- Remaining archived students: ${remainingArchived}`);

    if (remainingStudents === 0 && remainingFees === 0 && remainingArchived === 0) {
      console.log('\n✅ All student data successfully deleted!');
    } else {
      console.log('\n⚠️ Some data may still remain. Please check manually.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error deleting student data:', error);
    process.exit(1);
  }
}

// Run deletion
deleteAllStudents();
