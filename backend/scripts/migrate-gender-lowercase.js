const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const NifStudent = require('../models/NifStudent');
const StudentUser = require('../models/StudentUser');

async function migrateGenderToLowercase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/your-database');
    console.log('Connected to MongoDB');

    // Update NifStudent records with capitalized gender values
    const genderMap = {
      'Male': 'male',
      'Female': 'female',
      'Other': 'other'
    };

    let totalNifStudents = 0;
    let totalStudentUsers = 0;

    console.log('\nMigrating NifStudent records...');
    for (const [oldValue, newValue] of Object.entries(genderMap)) {
      const result = await NifStudent.updateMany(
        { gender: oldValue },
        { $set: { gender: newValue } }
      );
      console.log(`  Updated ${result.modifiedCount} NifStudent records from "${oldValue}" to "${newValue}"`);
      totalNifStudents += result.modifiedCount;
    }

    console.log('\nMigrating StudentUser records...');
    for (const [oldValue, newValue] of Object.entries(genderMap)) {
      const result = await StudentUser.updateMany(
        { gender: oldValue },
        { $set: { gender: newValue } }
      );
      console.log(`  Updated ${result.modifiedCount} StudentUser records from "${oldValue}" to "${newValue}"`);
      totalStudentUsers += result.modifiedCount;
    }

    console.log(`\nMigration complete!`);
    console.log(`  NifStudent records updated: ${totalNifStudents}`);
    console.log(`  StudentUser records updated: ${totalStudentUsers}`);
    console.log(`  Total records updated: ${totalNifStudents + totalStudentUsers}`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateGenderToLowercase();
