// Legacy bootstrap block retained for reference.
// (Use the active block below.)

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
let swaggerDocument;

dotenv.config();

const adminAuthRoutes = require('./routes/adminRoutes');
const teacherAuthRoutes = require('./routes/teacherRoute');
const teacherDashboardRoutes = require('./routes/teacherDashboardRoutes');
const staffAuthRoutes = require('./routes/staffRoutes');
const studentAuthRoutes = require('./routes/studentRoute');
const parentAuthRoutes = require('./routes/parentRoute');
const principalAuthRoutes = require('./routes/principalRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const adminUserManagementRoutes = require('./routes/adminUserManagement');
const subjectRouter = require("./routes/subjectRoute");
const examRouter = require("./routes/examRoute");
const feedbackRouter = require("./routes/feedbackRoute");
const assignmentRouter = require("./routes/assignmentRoute");
const behaviourRouter = require("./routes/behaviourRoute");
const progressRouter = require("./routes/progressRoute");
const aiLearningRouter = require("./routes/aiLearningRoute");
const studentAILearningRouter = require("./routes/studentAILearningRoute");
const alcoveRouter = require("./routes/alcoveRoute");

const uploadRoutes = require("./routes/uploadRoutes");
const schoolRoutes = require("./routes/schoolRoutes");
const schoolRegistrationRoutes = require("./routes/schoolRegistrationRoutes");
const academicRoutes = require("./routes/academicRoutes");
const feeRoutes = require("./routes/feeRoutes");
const reportRoutes = require("./routes/reportRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const supportRoutes = require('./routes/supportRoutes');
const issueRoutes = require('./routes/issueRoutes');
const Principal = require('./models/Principal');
const Admin = require('./models/Admin');
const { isStrongPassword } = require('./utils/passwordPolicy');
const principalDashboardRoutes = require('./routes/principalDashboardRoutes');


const seedSuperAdmin = async () => {
  const username = process.env.SUPER_ADMIN_USERNAME;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';
  if (!username || !password) {
    return;
  }
  if (!isStrongPassword(password)) {
    console.warn('Super admin seed password does not meet policy requirements.');
    return;
  }
  const normalizedUsername = String(username).trim();
  if (!normalizedUsername) {
    return;
  }
  try {
    const existing = await Admin.findOne({ username: normalizedUsername });
    if (existing) {
      existing.password = password;
      existing.name = name;
      existing.role = 'super_admin';
      existing.schoolId = null;
      await existing.save();
      console.log(`Updated super admin user: ${normalizedUsername}`);
      return;
    }
    const admin = new Admin({
      username: normalizedUsername,
      password,
      name,
      role: 'super_admin',
      schoolId: null,
    });
    await admin.save();
    console.log(`Seeded super admin user: ${normalizedUsername}`);
  } catch (err) {
    console.error('Failed to seed super admin user:', err.message);
  }
};

const ensureAdminRoles = async () => {
  try {
    await Admin.updateMany({ role: { $exists: false }, schoolId: { $ne: null } }, { $set: { role: 'admin' } });
    await Admin.updateMany({ role: { $exists: false }, schoolId: null }, { $set: { role: 'super_admin' } });
  } catch (err) {
    console.error('Failed to backfill admin roles:', err.message);
  }
};

const seedPrincipal = async () => {
  const principalEmail = process.env.PRINCIPAL_EMAIL;
  const principalPassword = process.env.PRINCIPAL_PASSWORD;
  const principalSchoolId = process.env.PRINCIPAL_SCHOOL_ID;
  if (!principalEmail || !principalPassword) {
    return;
  }
  const resolvedSchoolId =
    principalSchoolId && mongoose.isValidObjectId(principalSchoolId)
      ? principalSchoolId
      : null;
  if (!isStrongPassword(principalPassword)) {
    console.warn('Principal seed password does not meet policy requirements.');
    return;
  }
  const normalizedEmail = String(principalEmail).trim().toLowerCase();
  try {
    const existing = await Principal.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedEmail }],
    });
    if (existing) {
      existing.email = normalizedEmail;
      existing.username = normalizedEmail;
      existing.password = principalPassword;
      if (resolvedSchoolId) {
        existing.schoolId = resolvedSchoolId;
      }
      await existing.save();
      console.log(`Updated principal user: ${normalizedEmail}`);
      return;
    }

    const fallback = await Principal.findOne({});
    if (fallback) {
      fallback.email = normalizedEmail;
      fallback.username = normalizedEmail;
      fallback.password = principalPassword;
      if (resolvedSchoolId) {
        fallback.schoolId = resolvedSchoolId;
      }
      await fallback.save();
      console.log(`Reassigned principal user to: ${normalizedEmail}`);
      return;
    }

    const principal = new Principal({
      username: normalizedEmail,
      email: normalizedEmail,
      password: principalPassword,
      name: 'Principal',
      schoolId: resolvedSchoolId,
    });
    await principal.save();
    console.log(`Seeded principal user: ${normalizedEmail}`);
  } catch (err) {
    console.error('Failed to seed principal user:', err.message);
  }
};

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : null;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!allowedOrigins || allowedOrigins.length === 0) {
        return callback(null, true);
      }
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json());

try {
  swaggerDocument = require('./swagger-output.json');
} catch (err) {
  swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'Electronic Educare API',
      version: '1.0.0',
      description: 'Swagger output not generated yet. Run `npm run swagger:gen`.',
    },
    paths: {},
  };
}

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    swaggerOptions: {
      docExpansion: 'list',
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      persistAuthorization: true,
      tryItOutEnabled: true,
      displayRequestDuration: true,
    },
    customSiteTitle: 'Electronic Educare API Docs',
    customCss: '.swagger-ui .topbar { background-color: #0f172a; }',
  })
);
app.get('/api/docs.json', (_req, res) => {
  res.json(swaggerDocument);
});

// Mongo connect
mongoose
  .connect(process.env.MONGODB_URL)
  .then(async () => {
    console.log('MongoDB Connected');
    await ensureAdminRoles();
    await seedSuperAdmin();
    await seedPrincipal();
  })
  .catch((err) => console.log(err));

// Health
app.get("/", (req, res) => {
  // #swagger.tags = ['System']
  res.send("Welcome to the Electronic Educare API ..");
});
app.get("/health", (req, res) => {
  // #swagger.tags = ['System']
  res.json({ ok: true });
});

// Auth & core routes (unchanged)
app.use('/api/admin/users', adminUserManagementRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/teacher/auth', teacherAuthRoutes);
app.use('/api/teacher/dashboard', teacherDashboardRoutes);
app.use('/api/staff/auth', staffAuthRoutes);
app.use('/api/student/auth', studentAuthRoutes);
app.use('/api/parent/auth', parentAuthRoutes);
app.use('/api/principal/auth', principalAuthRoutes);
app.use('/api/principal', principalDashboardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/student', require('./routes/student'));
app.use('/api/subject', subjectRouter);
app.use('/api/exam', examRouter);
app.use('/api/assignment', assignmentRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/behaviour', behaviourRouter);
app.use('/api/progress', progressRouter);
app.use('/api/ai-learning', aiLearningRouter);
app.use('/api/student-ai-learning', studentAILearningRouter);
app.use('/api/alcove', alcoveRouter);



app.use('/api/schools', schoolRoutes);
app.use('/api/school-registration', schoolRegistrationRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/issues', issueRoutes);


app.use("/api/uploads", uploadRoutes);


app.use((err, _req, res, _next) => {
  console.error("ERR:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
