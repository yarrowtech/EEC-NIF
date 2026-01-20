const path = require('path');
const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const toPosix = (filePath) => filePath.split(path.sep).join('/');

const outputFile = toPosix(path.join(__dirname, 'swagger-output.json'));
const endpointsFiles = [toPosix(path.join(__dirname, 'index.js'))];

const serverUrl =
  process.env.SWAGGER_SERVER_URL ||
  `http://localhost:${process.env.PORT || 5000}`;

const doc = {
  info: {
    title: 'Electronic Educare API',
    description: 'API documentation for the Electronic Educare backend.',
    version: '1.0.0',
  },
  servers: [{ url: serverUrl }],
  tags: [
    { name: 'Admin Auth', description: 'Admin authentication and profile.' },
    { name: 'Admin Users', description: 'Admin user management and bulk tools.' },
    { name: 'Teachers', description: 'Teacher authentication and management.' },
    { name: 'Students', description: 'Student authentication and portal.' },
    { name: 'Student Profile', description: 'Student profile uploads and data.' },
    { name: 'Parents', description: 'Parent authentication and child links.' },
    { name: 'Principals', description: 'Principal authentication and setup.' },
    { name: 'Principal Dashboard', description: 'Principal dashboard data.' },
    { name: 'Schools', description: 'School CRUD and settings.' },
    { name: 'School Registration', description: 'Public school registration.' },
    { name: 'Academics', description: 'Academic years, classes, sections, subjects.' },
    { name: 'Courses', description: 'Course management.' },
    { name: 'Subjects', description: 'Subject management.' },
    { name: 'Exams', description: 'Exam and results management.' },
    { name: 'Assignments', description: 'Assignments and submissions.' },
    { name: 'Attendance', description: 'Attendance marking and reports.' },
    { name: 'Progress', description: 'Student progress and analytics.' },
    { name: 'Fees', description: 'Fee structures, invoices, payments.' },
    { name: 'Reports', description: 'Reporting endpoints.' },
    { name: 'Timetable', description: 'Timetable management.' },
    { name: 'Notifications', description: 'Notification management.' },
    { name: 'Audit Logs', description: 'Audit logging and history.' },
    { name: 'Uploads', description: 'File uploads (Cloudinary).' },
    { name: 'Feedback', description: 'Feedback submission and listing.' },
    { name: 'Behaviour', description: 'Behaviour tracking.' },
    { name: 'Wellbeing', description: 'Student wellbeing records.' },
    { name: 'AI Learning', description: 'Admin AI learning insights.' },
    { name: 'Student AI Learning', description: 'Student AI learning content.' },
    { name: 'Alcove', description: 'Posts and comments.' },
    { name: 'NIF', description: 'NIF module endpoints.' },
    { name: 'NIF Students', description: 'NIF student management.' },
    { name: 'NIF Student Archive', description: 'NIF archived students.' },
    { name: 'NIF Courses', description: 'NIF course management.' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log(`Swagger doc generated at ${outputFile}`);
});
