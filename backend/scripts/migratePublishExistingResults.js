// Script to set all existing results to published
// This is needed after adding the 'published' field to ExamResult model
require('dotenv').config();
const mongoose = require('mongoose');
const ExamResult = require('../models/ExamResult');

async function publishExistingResults() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URL || process.env.MONGO_URI);
    console.log('✓ Connected to database\n');

    // Find all results
    const allResults = await ExamResult.find({});
    console.log(`Total exam results in database: ${allResults.length}\n`);

    // Count how many are currently unpublished
    const unpublishedResults = await ExamResult.find({ published: { $ne: true } });
    console.log(`Unpublished results: ${unpublishedResults.length}`);
    console.log(`Already published: ${allResults.length - unpublishedResults.length}\n`);

    if (unpublishedResults.length === 0) {
      console.log('✓ All results are already published! No migration needed.\n');
      await mongoose.connection.close();
      return;
    }

    console.log('=================================================');
    console.log('MIGRATING EXISTING RESULTS TO PUBLISHED STATUS');
    console.log('=================================================\n');

    // Update all existing results to published: true
    const updateResult = await ExamResult.updateMany(
      {
        $or: [
          { published: { $exists: false } },
          { published: false }
        ]
      },
      {
        $set: {
          published: true,
          publishedAt: new Date()
        }
      }
    );

    console.log('\n✅ Migration completed successfully!');
    console.log('=================================================');
    console.log(`Matched documents: ${updateResult.matchedCount}`);
    console.log(`Modified documents: ${updateResult.modifiedCount}`);
    console.log('=================================================\n');

    console.log('📊 Summary:');
    console.log(`   - All existing ${updateResult.modifiedCount} results are now published`);
    console.log('   - Students can now view all their historical results');
    console.log('   - New results will be unpublished by default\n');

    // Verify the migration
    const verifyPublished = await ExamResult.countDocuments({ published: true });
    const verifyUnpublished = await ExamResult.countDocuments({ published: false });

    console.log('✓ Verification:');
    console.log(`   - Published results: ${verifyPublished}`);
    console.log(`   - Unpublished results: ${verifyUnpublished}\n`);

    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the migration
publishExistingResults();
