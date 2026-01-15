const mongoose = require('mongoose');
require('dotenv').config();

async function fixGenderValues() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Fix NifStudent collection
    console.log('\n--- Checking NifStudent collection ---');
    const nifStudentCollection = db.collection('nifstudents');

    // Find all records with gender field
    const nifStudents = await nifStudentCollection.find({ gender: { $exists: true } }).toArray();
    console.log(`Found ${nifStudents.length} NifStudent records with gender field`);

    if (nifStudents.length > 0) {
      // Show sample before
      console.log('\nSample records BEFORE update:');
      nifStudents.slice(0, 3).forEach((s, i) => {
        console.log(`  ${i + 1}. name: ${s.name}, gender: "${s.gender}"`);
      });

      // Update all records - convert gender to lowercase
      const nifResult = await nifStudentCollection.updateMany(
        { gender: { $exists: true } },
        [{ $set: { gender: { $toLower: "$gender" } } }]
      );
      console.log(`\n✓ Updated ${nifResult.modifiedCount} NifStudent records`);
    }

    // Fix StudentUser collection
    console.log('\n--- Checking StudentUser collection ---');
    const studentUserCollection = db.collection('studentusers');

    const studentUsers = await studentUserCollection.find({ gender: { $exists: true } }).toArray();
    console.log(`Found ${studentUsers.length} StudentUser records with gender field`);

    if (studentUsers.length > 0) {
      // Show sample before
      console.log('\nSample records BEFORE update:');
      studentUsers.slice(0, 3).forEach((s, i) => {
        console.log(`  ${i + 1}. name: ${s.name}, gender: "${s.gender}"`);
      });

      // Update all records - convert gender to lowercase
      const userResult = await studentUserCollection.updateMany(
        { gender: { $exists: true } },
        [{ $set: { gender: { $toLower: "$gender" } } }]
      );
      console.log(`\n✓ Updated ${userResult.modifiedCount} StudentUser records`);
    }

    // Verify the fix
    console.log('\n--- Verification ---');
    const verifyNif = await nifStudentCollection.find({ gender: { $exists: true } }).limit(3).toArray();
    console.log('\nNifStudent records AFTER update:');
    verifyNif.forEach((s, i) => {
      console.log(`  ${i + 1}. name: ${s.name}, gender: "${s.gender}"`);
    });

    const verifyUser = await studentUserCollection.find({ gender: { $exists: true } }).limit(3).toArray();
    if (verifyUser.length > 0) {
      console.log('\nStudentUser records AFTER update:');
      verifyUser.forEach((s, i) => {
        console.log(`  ${i + 1}. name: ${s.name}, gender: "${s.gender}"`);
      });
    }

    console.log('\n✓ Migration complete!');

    // Close connection
    await mongoose.connection.close();
    console.log('✓ Database connection closed\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
fixGenderValues();
