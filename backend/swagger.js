const fs = require('fs');
const path = require('path');
const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const toPosix = (filePath) => filePath.split(path.sep).join('/');

const outputFile = toPosix(path.join(__dirname, 'swagger-output.json'));
const endpointsFiles = [toPosix(path.join(__dirname, 'index.js'))];

const serverUrl =
  process.env.SWAGGER_SERVER_URL ||
  `http://localhost:${process.env.PORT || 5000}`;

const toTitle = (value) =>
  String(value || '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

const TAG_METADATA = [
  { name: 'System', description: 'Service health and root endpoints.' },
  { name: 'API Docs', description: 'Swagger UI and OpenAPI document endpoints.' },
  { name: 'Auth', description: 'Unified multi-role authentication.' },
  { name: 'Admin Auth', description: 'Admin authentication and profile.' },
  { name: 'Super Admin', description: 'System-wide administration.' },
  { name: 'Admin Users', description: 'Admin user management and bulk tools.' },
  { name: 'Teachers', description: 'Teacher authentication and management.' },
  { name: 'Teacher Dashboard', description: 'Teacher dashboard data and actions.' },
  { name: 'Staff', description: 'Staff authentication and management.' },
  { name: 'Students', description: 'Student authentication and portal.' },
  { name: 'Student Profile', description: 'Student profile uploads and data.' },
  { name: 'Parents', description: 'Parent authentication and child links.' },
  { name: 'Principals', description: 'Principal authentication and setup.' },
  { name: 'Principal Dashboard', description: 'Principal dashboard data.' },
  { name: 'Schools', description: 'School CRUD and settings.' },
  { name: 'School Registration', description: 'Public school registration.' },
  { name: 'Academics', description: 'Academic years, classes, sections, subjects.' },
  { name: 'Promotion', description: 'Student promotion and leaving workflows.' },
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
  { name: 'Meetings', description: 'Teacher-parent meeting scheduling and updates.' },
  { name: 'Observations', description: 'Teacher and parent student observation logs.' },
  { name: 'Support', description: 'Support settings and support requests.' },
  { name: 'Issues', description: 'Issue/ticket tracking and resolution.' },
  { name: 'Teacher Allocations', description: 'Teacher allocation and sync actions.' },
  { name: 'Practice', description: 'Practice questions and attempts.' },
  { name: 'Excuse Letters', description: 'Student excuse letter lifecycle.' },
  { name: 'Lesson Plans', description: 'Lesson plan authoring and completion status.' },
  { name: 'Chat', description: 'Secure in-app chat and key management.' },
  { name: 'NIF', description: 'NIF-specific student and academic endpoints.' },
];

const TAG_BY_PREFIX = [
  { prefix: '/api/docs', tag: 'API Docs' },
  { prefix: '/api/auth', tag: 'Auth' },
  { prefix: '/api/promotion', tag: 'Promotion' },
  { prefix: '/api/teacher/dashboard', tag: 'Teacher Dashboard' },
  { prefix: '/api/admin/users', tag: 'Admin Users' },
  { prefix: '/api/admin/auth', tag: 'Admin Auth' },
  { prefix: '/api/teacher/auth', tag: 'Teachers' },
  { prefix: '/api/staff/auth', tag: 'Staff' },
  { prefix: '/api/student/auth', tag: 'Students' },
  { prefix: '/api/student', tag: 'Student Profile' },
  { prefix: '/api/parent/auth', tag: 'Parents' },
  { prefix: '/api/principal/auth', tag: 'Principals' },
  { prefix: '/api/principal', tag: 'Principal Dashboard' },
  { prefix: '/api/attendance', tag: 'Attendance' },
  { prefix: '/api/subject', tag: 'Subjects' },
  { prefix: '/api/exam', tag: 'Exams' },
  { prefix: '/api/assignment', tag: 'Assignments' },
  { prefix: '/api/feedback', tag: 'Feedback' },
  { prefix: '/api/behaviour', tag: 'Behaviour' },
  { prefix: '/api/progress', tag: 'Progress' },
  { prefix: '/api/ai-learning', tag: 'AI Learning' },
  { prefix: '/api/student-ai-learning', tag: 'Student AI Learning' },
  { prefix: '/api/alcove', tag: 'Alcove' },
  { prefix: '/api/meeting', tag: 'Meetings' },
  { prefix: '/api/observations', tag: 'Observations' },
  { prefix: '/api/schools', tag: 'Schools' },
  { prefix: '/api/school-registration', tag: 'School Registration' },
  { prefix: '/api/academic', tag: 'Academics' },
  { prefix: '/api/fees', tag: 'Fees' },
  { prefix: '/api/reports', tag: 'Reports' },
  { prefix: '/api/timetable', tag: 'Timetable' },
  { prefix: '/api/notifications', tag: 'Notifications' },
  { prefix: '/api/audit-logs', tag: 'Audit Logs' },
  { prefix: '/api/super-admin', tag: 'Super Admin' },
  { prefix: '/api/support', tag: 'Support' },
  { prefix: '/api/issues', tag: 'Issues' },
  { prefix: '/api/teacher-allocations', tag: 'Teacher Allocations' },
  { prefix: '/api/practice', tag: 'Practice' },
  { prefix: '/api/excuse-letters', tag: 'Excuse Letters' },
  { prefix: '/api/nif', tag: 'NIF' },
  { prefix: '/api/lesson-plans', tag: 'Lesson Plans' },
  { prefix: '/api/chat', tag: 'Chat' },
];

const inferTag = (routePath) => {
  const matched = TAG_BY_PREFIX.find((entry) => routePath.startsWith(entry.prefix));
  return matched ? matched.tag : 'System';
};

const summarizeOperation = (method, routePath) => {
  const actionMap = {
    GET: 'Fetch',
    POST: 'Create',
    PUT: 'Update',
    PATCH: 'Modify',
    DELETE: 'Delete',
    HEAD: 'Inspect',
    OPTIONS: 'Describe options for',
  };
  const action = actionMap[method] || 'Handle';
  const parts = routePath
    .replace(/^\/api\/?/, '')
    .split('/')
    .filter(Boolean)
    .filter((part) => !/^\{.+\}$/.test(part))
    .map((part) => toTitle(part));
  const target = parts.length ? parts.join(' / ') : 'System';
  return `${action} ${target}`;
};

const postProcessSwagger = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  const spec = JSON.parse(raw);
  const paths = spec.paths || {};
  const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

  for (const [routePath, ops] of Object.entries(paths)) {
    for (const method of methods) {
      const operation = ops?.[method];
      if (!operation) continue;

      if (!Array.isArray(operation.tags) || operation.tags.length === 0 || operation.tags[0] === 'Untagged') {
        operation.tags = [inferTag(routePath)];
      }

      const methodUpper = method.toUpperCase();
      const summary = operation.summary || summarizeOperation(methodUpper, routePath);
      operation.summary = summary;
      if (!operation.description || operation.description.trim() === '') {
        operation.description = `${summary}.`;
      }
      if (!operation.operationId) {
        operation.operationId = `${method}_${routePath.replace(/[^\w]+/g, '_').replace(/^_+|_+$/g, '')}`;
      }
    }
  }

  const discoveredTags = new Set();
  for (const ops of Object.values(paths)) {
    for (const method of methods) {
      const op = ops?.[method];
      if (!op?.tags?.length) continue;
      discoveredTags.add(op.tags[0]);
    }
  }

  const tagLookup = new Map(TAG_METADATA.map((tag) => [tag.name, tag]));
  spec.tags = [...discoveredTags]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => tagLookup.get(name) || { name, description: `${name} endpoints.` });

  fs.writeFileSync(filePath, `${JSON.stringify(spec, null, 2)}\n`, 'utf8');
};

const doc = {
  info: {
    title: 'Electronic Educare API',
    description: 'API documentation for the Electronic Educare backend.',
    version: '1.0.0',
  },
  servers: [{ url: serverUrl }],
  tags: TAG_METADATA,
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

swaggerAutogen(outputFile, endpointsFiles, doc)
  .then(() => {
    postProcessSwagger(outputFile);
    console.log(`Swagger doc generated at ${outputFile}`);
  })
  .catch((err) => {
    console.error('Failed to generate swagger docs:', err);
    process.exit(1);
  });
