// Script to delete all NIF course entries
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const NifCourse = require("../models/NifCourse");

async function deleteAllCourses() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");

    const courseCount = await NifCourse.countDocuments({});
    console.log(`\nCurrent courses: ${courseCount}`);

    if (courseCount === 0) {
      console.log("No course documents found. Nothing to delete.");
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log("Deleting all courses...");
    const deletion = await NifCourse.deleteMany({});
    console.log(`✓ Deleted ${deletion.deletedCount} course documents`);

    const remaining = await NifCourse.countDocuments({});
    console.log(`Remaining courses: ${remaining}`);

    if (remaining === 0) {
      console.log("\n✅ All courses removed successfully!");
    } else {
      console.log("\n⚠️ Some courses may still remain. Please verify manually.");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error deleting courses:", error);
    process.exit(1);
  }
}

deleteAllCourses();
