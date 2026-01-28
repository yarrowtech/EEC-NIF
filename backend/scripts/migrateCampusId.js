// Migration script to set campusId for existing students
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const NifStudent = require('../models/NifStudent');
const NifFeeRecord = require('../models/NifFeeRecord');
const NifArchivedStudent = require('../models/NifArchivedStudent');

async function migrateCampusId() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    // Example: Update students based on criteria
    // You'll need to modify this based on how you want to identify which campus students belong to

    // Option 1: Update all existing students to a specific campus
    const defaultCampusId = 'brainware-barasat-main'; // Change this as needed

    console.log('\nUpdating NIF Students...');
    const studentUpdate = await NifStudent.updateMany(
      {
        $or: [
          { campusId: null },
          { campusId: { $exists: false } }
        ]
      },
      {
        $set: { campusId: defaultCampusId }
      }
    );
    console.log(`Updated ${studentUpdate.modifiedCount} students with campusId: ${defaultCampusId}`);

    console.log('\nUpdating NIF Fee Records...');
    const feeUpdate = await NifFeeRecord.updateMany(
      {
        $or: [
          { campusId: null },
          { campusId: { $exists: false } }
        ]
      },
      {
        $set: { campusId: defaultCampusId }
      }
    );
    console.log(`Updated ${feeUpdate.modifiedCount} fee records with campusId: ${defaultCampusId}`);

    console.log('\nUpdating Archived Students...');
    const archivedUpdate = await NifArchivedStudent.updateMany(
      {
        $or: [
          { campusId: null },
          { campusId: { $exists: false } }
        ]
      },
      {
        $set: { campusId: defaultCampusId }
      }
    );
    console.log(`Updated ${archivedUpdate.modifiedCount} archived students with campusId: ${defaultCampusId}`);

    // Option 2: Update based on specific criteria (commented out - modify as needed)
    /*
    // Example: Update students from a specific batch to NIF campus
    await NifStudent.updateMany(
      {
        batchCode: { $regex: /NIF/i },
        $or: [{ campusId: null }, { campusId: { $exists: false } }]
      },
      { $set: { campusId: 'nif-campus' } }
    );

    // Example: Update students from Brainware
    await NifStudent.updateMany(
      {
        batchCode: { $regex: /BW|BRAINWARE/i },
        $or: [{ campusId: null }, { campusId: { $exists: false } }]
      },
      { $set: { campusId: 'brainware-barasat-main' } }
    );
    */

    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

// Run migration
migrateCampusId();
