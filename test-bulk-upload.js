// Test script to verify bulk upload works
// Run with: node test-bulk-upload.js

const testData = {
  students: [
    {
      name: "Test Student 1",
      mobile: "1234567890",
      gender: "Male",
      batchCode: "TEST-2024",
      admissionDate: "2024-01-15",
      roll: "T001",
      section: "A",
      course: "Test Course",
      email: "test1@example.com"
    },
    {
      name: "Test Student 2",
      mobile: "0987654321",
      gender: "Female",
      batchCode: "TEST-2024",
      admissionDate: "2024-01-20",
      roll: "T002",
      section: "A",
      course: "Test Course",
      email: "test2@example.com"
    }
  ]
};

console.log('Test data prepared:');
console.log(JSON.stringify(testData, null, 2));
console.log('\nTo test manually:');
console.log('1. Make sure backend is running');
console.log('2. Use this curl command:\n');
console.log('curl -X POST http://localhost:5000/api/nif/students/bulk \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\');
console.log('  -d \'' + JSON.stringify(testData) + '\'');
console.log('\nOr upload via the frontend after:');
console.log('1. Restart backend server');
console.log('2. Hard refresh browser (Ctrl+Shift+R)');
console.log('3. Upload your CSV file');
