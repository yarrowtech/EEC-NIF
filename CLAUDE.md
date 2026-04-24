# EEC-NIF Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Available Commands](#available-commands)
5. [Environment Variables](#environment-variables)
6. [Conventions & Rules](#conventions--rules)
7. [Important Patterns](#important-patterns)
8. [API Documentation](#api-documentation)
9. [Testing Guidelines](#testing-guidelines)
10. [Deployment](#deployment)

---

## Project Overview

**Project Name:** EEC (Electronic Educare)

**Purpose:** A comprehensive, multi-role educational management system designed to serve students, parents, teachers, administrators, principals, and super administrators in a school/educational institution.

**Type:** Full-stack web application with real-time communication capabilities

### Key Features

**Academic Management:**
- Class and section management
- Subject assignment
- Exam groups and scheduling
- Grade/result entry and tracking
- Report card generation
- Student progress monitoring
- Lesson planning with completion tracking

**Attendance:**
- Daily attendance marking
- Absence tracking
- Attendance reports
- Excuse letter processing
- Parent notification

**Financial Management:**
- Fee structure configuration
- Invoice generation
- Payment processing (Razorpay)
- Payment tracking and history
- Receipt generation

**Communication:**
- Real-time Socket.IO chat
- Group chat for classes/allocations
- Notification system with priorities
- Email notifications (Nodemailer)
- School announcements and alerts

**AI-Powered Learning:**
- AI tutoring system
- Smart quiz generation
- Problem solver
- Summary generation
- Mind map generation
- Flashcard creation
- AI course recommendations

**Infrastructure:**
- Building and floor management
- Room allocation
- Department management
- Timetable generation and management
- Holiday scheduling with notifications

**Reporting:**
- Academic performance reports
- Financial reports
- Attendance reports
- Custom report generation
- Data export (CSV, Excel, PDF)

---

## Tech Stack

### Frontend
- **Framework:** React 18.2.0
- **Build Tool:** Vite 6.3.5
- **Styling:** TailwindCSS 4.1.10
- **Routing:** React Router DOM 7.6.2
- **State Management:** React Hooks & Context API
- **UI Components:** Lucide React (icons)
- **Charts & Data Viz:**
  - Chart.js 4.5.0
  - React ChartJS 2 5.3.0
  - Recharts 2.15.0
- **Real-time:** Socket.IO Client 4.8.3
- **3D Graphics:** Three.js 0.171.0
- **PDF Generation:** JSPDF 3.0.2, html2canvas 1.4.1
- **Spreadsheet:** XLSX 0.18.5
- **UI Notifications:** React Hot Toast 2.6.0, SweetAlert2 11.26.3
- **Rich Text Editor:** Quill 1.3.7
- **HTTP Client:** Axios 1.13.2

### Backend
- **Runtime:** Node.js
- **Framework:** Express 5.1.0
- **Database:** MongoDB (Mongoose ODM 8.15.1)
- **Real-time Communication:** Socket.IO 4.8.3
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Hashing:** bcryptjs 3.0.2
- **Email:** Nodemailer 6.9.13
- **File Upload:** Multer 2.0.2, Cloudinary 2.8.0
- **Data Parsing:** CSV Parser 3.2.0, XLSX 0.18.5
- **API Documentation:** Swagger/OpenAPI (swagger-autogen 2.23.7, swagger-ui-express 5.0.1)
- **Environment:** Dotenv 16.5.0
- **CORS:** 2.8.5
- **Rate Limiting:** express-rate-limit 8.2.1
- **Logging:** Pino 10.3.1
- **HTTP Client:** Axios 1.13.2
- **Payment Gateway:** Razorpay 2.9.8

### Testing
- **Framework:** Jest 30.3.0
- **Frontend:** @testing-library/react 16.3.2, @testing-library/jest-dom 6.9.1
- **Backend:** Supertest 7.2.2
- **E2E Testing:** Jest environment JSDOM (frontend)

### Database
- **Type:** MongoDB Atlas (Cloud-hosted)
- **Connection String:** MongoDB+SRV connection with authentication
- **Models:** 57+ Mongoose models covering all entities

---

## Folder Structure

```
EEC-NIF/
├── backend/                           # Express.js API server
│   ├── index.js                      # Main application entry point
│   ├── package.json                  # Backend dependencies & scripts
│   ├── .env                          # Environment variables (secrets)
│   ├── swagger.js                    # API documentation generation
│   ├── jest.config.js                # Jest test configuration
│   │
│   ├── routes/                       # API route handlers (47 route files)
│   │   ├── studentRoute.js           # Student auth & portal endpoints
│   │   ├── teacherRoute.js           # Teacher auth endpoints
│   │   ├── teacherDashboardRoutes.js # Teacher dashboard data endpoints
│   │   ├── parentRoute.js            # Parent portal endpoints
│   │   ├── principalRoutes.js        # Principal auth endpoints
│   │   ├── principalDashboardRoutes.js # Principal dashboard endpoints
│   │   ├── superAdminRoutes.js       # Super admin management
│   │   ├── adminRoutes.js            # School admin endpoints
│   │   ├── adminUserManagement.js    # User management
│   │   ├── academicRoutes.js         # Academic data (classes, subjects)
│   │   ├── attendanceRoutes.js       # Attendance management
│   │   ├── examRoute.js              # Exam management
│   │   ├── feeRoutes.js              # Fee & payment processing
│   │   ├── assignmentRoute.js        # Assignment management
│   │   ├── chatRoutes.js             # Real-time messaging
│   │   ├── notificationRoutes.js     # Notification system
│   │   ├── lessonPlanRoutes.js       # Lesson planning
│   │   ├── aiLearningRoute.js        # AI-powered learning features
│   │   ├── studentAILearningRoute.js # Student AI learning endpoints
│   │   ├── alcoveRoute.js            # Academic discussion platform
│   │   ├── timetableRoutes.js        # Class scheduling
│   │   ├── reportRoutes.js           # Report generation
│   │   ├── schoolRoutes.js           # School management
│   │   ├── schoolRegistrationRoutes.js # School onboarding
│   │   └── ... (20+ more route files)
│   │
│   ├── models/                       # MongoDB Mongoose schemas (57 models)
│   │   ├── StudentUser.js            # Student profile & data
│   │   ├── TeacherUser.js            # Teacher profile
│   │   ├── ParentUser.js             # Parent profile
│   │   ├── Principal.js              # Principal account
│   │   ├── Admin.js                  # Admin account
│   │   ├── School.js                 # School entity
│   │   ├── Assignment.js             # Assignment schema
│   │   ├── Exam.js                   # Exam schema
│   │   ├── FeeStructure.js           # Fee configuration
│   │   ├── FeeInvoice.js             # Fee billing
│   │   ├── FeePayment.js             # Payment records
│   │   ├── ChatThread.js             # Chat conversations
│   │   ├── ChatMessage.js            # Chat messages
│   │   ├── Notification.js           # System notifications
│   │   ├── LessonPlan.js             # Lesson planning
│   │   ├── TeacherAllocation.js      # Teacher-class assignments
│   │   ├── Timetable.js              # Class schedules
│   │   ├── StudentProgress.js        # Academic progress tracking
│   │   └── ... (39 more models)
│   │
│   ├── middleware/                   # Express middleware
│   │   ├── authStudent.js            # Student JWT authentication
│   │   ├── authTeacher.js            # Teacher JWT authentication
│   │   ├── authParent.js             # Parent JWT authentication
│   │   ├── authStaff.js              # Staff JWT authentication
│   │   ├── adminAuth.js              # Admin authentication
│   │   ├── superAdminAuth.js         # Super admin authentication
│   │   ├── principalAuth.js          # Principal authentication
│   │   ├── authAnyUser.js            # Generic user authentication
│   │   ├── requestLogger.js          # HTTP request logging with correlation IDs
│   │   ├── tokenReplayTelemetry.js   # Token usage tracking
│   │   ├── adminActionLogger.js      # Admin action audit logging
│   │   └── rateLimit.js              # API rate limiting
│   │
│   ├── utils/                        # Utility functions & services
│   │   ├── logger.js                 # Pino structured logging
│   │   ├── securityEventLogger.js    # Security event tracking
│   │   ├── authEventLogger.js        # Auth event logging
│   │   ├── businessEventLogger.js    # Business logic events
│   │   ├── studentPortalLogger.js    # Student-specific logging
│   │   ├── mailer.js                 # Email service (Nodemailer)
│   │   ├── notificationService.js    # Notification dispatch
│   │   ├── chatGroupProvisioning.js  # Chat group setup/sync
│   │   ├── chatPresence.js           # User online/offline tracking
│   │   ├── cloudinary.js             # Image hosting integration
│   │   ├── cloudinaryUpload.js       # File upload wrapper
│   │   ├── paymentGatewayService.js  # Razorpay integration
│   │   ├── passwordPolicy.js         # Password strength validation
│   │   ├── holidayNotificationScheduler.js # Scheduled notifications
│   │   ├── timetableGenerator.js     # Timetable scheduling algorithm
│   │   ├── deleteSchoolCascade.js    # Data cleanup on school deletion
│   │   ├── feeHeadPolicy.js          # Fee calculation rules
│   │   └── ... (12+ more utilities)
│   │
│   ├── logs/                         # Application log files
│   ├── uploads/                      # File upload storage (local)
│   ├── __tests__/                    # Backend unit/integration tests
│   └── scripts/                      # Utility scripts
│       ├── productionSecurityAttackSuite.js # Security testing
│       └── validateRuntimeLogs.js    # Log validation
│
├── frontend/                          # React + Vite application
│   ├── src/
│   │   ├── main.jsx                  # React app entry point
│   │   ├── App.jsx                   # Main routing configuration
│   │   ├── App.css                   # Global styles
│   │   ├── index.css                 # Base stylesheet
│   │
│   │   ├── components/               # Shared UI components (40+ files)
│   │   │   ├── LoginForm.jsx         # Authentication UI
│   │   │   ├── SignupForm.jsx        # Registration UI
│   │   │   ├── Dashboard.jsx         # Main dashboard router
│   │   │   ├── Header.jsx            # Navigation header
│   │   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   │   ├── ProtectedRoute.jsx    # Route access control
│   │   │   ├── StudentChat.jsx       # Real-time messaging
│   │   │   ├── Assignment.jsx        # Assignment management UI
│   │   │   ├── AssignmentHub.jsx     # Assignment discovery
│   │   │   ├── StudyMaterials.jsx    # Learning resources
│   │   │   ├── AcademicAlcove.jsx    # Discussion forum
│   │   │   ├── AILearningDashboard.jsx # AI tutor interface
│   │   │   ├── AttendanceView.jsx    # Attendance display
│   │   │   ├── ResultsView.jsx       # Grade viewing
│   │   │   ├── FloatingPetButton.jsx # Interactive mascot
│   │   │   ├── NoticeBoard.jsx       # Announcements
│   │   │   ├── SchoolRegistrationForm.jsx # Onboarding
│   │   │   ├── ProfileUpdate.jsx     # User profile management
│   │   │   └── ... (24+ more components)
│   │
│   │   ├── admin/                    # Admin portal (20+ components)
│   │   │   ├── AdminApp.jsx          # Admin routing
│   │   │   ├── AdminLayout.jsx       # Admin layout
│   │   │   ├── AdminDashboard.jsx    # Admin home
│   │   │   ├── Dashboard.jsx         # Admin metrics
│   │   │   ├── Students.jsx          # Student management
│   │   │   ├── Teachers.jsx          # Teacher management
│   │   │   ├── Staff.jsx             # Staff management
│   │   │   ├── Routines.jsx          # Timetable management
│   │   │   ├── Analytics.jsx         # Data analytics
│   │   │   └── ... (12+ more)
│   │
│   │   ├── teachers/                 # Teacher portal (28+ components)
│   │   │   ├── TeacherPortal.jsx     # Teacher routing
│   │   │   ├── TeacherDashboard.jsx  # Teacher home
│   │   │   ├── AssignmentPortal.jsx  # Assignment creation/grading
│   │   │   ├── AssignmentManagement.jsx # Assignment workflows
│   │   │   ├── ExamManagement.jsx    # Exam administration
│   │   │   ├── AttendanceManagement.jsx # Attendance marking
│   │   │   ├── StudentAnalyticsPortal.jsx # Performance analysis
│   │   │   ├── ClassNotes.jsx        # Study material creation
│   │   │   ├── LessonPlanDashboard.jsx # Lesson planning
│   │   │   ├── ResultManagement.jsx  # Grade assignment
│   │   │   ├── AIPoweredTeaching.jsx # AI teaching tools
│   │   │   └── ... (18+ more)
│   │
│   │   ├── parents/                  # Parent portal (6+ components)
│   │   │   ├── ParentPortal.jsx      # Parent routing
│   │   │   ├── ParentDashboard.jsx   # Parent home
│   │   │   ├── ComplaintManagementSystem.jsx # Issue tracking
│   │   │   └── ... (3+ more)
│   │
│   │   ├── principal/                # Principal portal (10+ components)
│   │   │   ├── PrincipalDashboard.jsx # Principal home
│   │   │   └── ... (9+ more components)
│   │
│   │   ├── Super Admin/              # System administration (5+ components)
│   │   │   ├── SuperAdminApp.jsx     # Super admin routing
│   │   │   └── ... (4+ more)
│   │
│   │   ├── pages/                    # Standalone pages
│   │   │   ├── FeedbackPage.jsx
│   │   │   ├── MeetTheDeveloper.jsx
│   │   │   └── FeedbackThankYou.jsx
│   │
│   │   ├── games/                    # Educational games
│   │   │   └── GamesPage.jsx
│   │
│   │   ├── utils/                    # Frontend utilities
│   │   ├── contexts/                 # React Context providers
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── models/                   # Frontend data models
│   │   ├── __tests__/                # Frontend unit tests
│   │   └── tryout/                   # Demo/tryout features
│   │
│   ├── public/                        # Static assets
│   ├── index.html                     # HTML template
│   ├── vite.config.js                 # Vite configuration
│   ├── jest.config.js                 # Jest test configuration
│   ├── jest.setup.js                  # Jest setup file
│   ├── babel.config.cjs               # Babel transpilation config
│   ├── eslint.config.js               # Linting rules
│   ├── package.json                   # Frontend dependencies
│   ├── .env                           # Frontend environment variables
│   └── dist/                          # Production build output
│
├── docs/                              # API documentation
│   ├── student-portal-api-map.md
│   ├── teacher-portal-api-map.md
│   ├── school-admin-api-map.md
│   └── super-admin-api-map.md
│
├── AGENTS.md                          # Developer guidelines & conventions
├── TESTING_GUIDE.md                   # Test writing standards
├── TEACHER_PORTAL_TESTING_GUIDE.md    # Teacher feature testing
├── MANUAL_TESTING_COMMANDS.md         # CLI testing reference
├── TRY_THESE_COMMANDS.md              # Quick start commands
└── README.md                          # Project README
```

---

## Available Commands

### Backend Commands

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Generate API documentation
npm run swagger:gen

# Run security test suite
npm run security:suite

# Validate runtime logs
npm run validate:logs
```

### Frontend Commands

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Development mode (Vite dev server on port 5173)
npm run dev

# Production build (outputs to dist/)
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Root Level Commands

```bash
# Install dependencies for both frontend and backend
npm install

# See package.json for additional scripts
```

---

## Environment Variables

### Backend (.env)

Located at: `/backend/.env`

```env
# Database Configuration
MONGODB_URL=mongodb+srv://[user]:[password]@cluster.mongodb.net/?appName=Cluster0

# JWT Configuration
JWT_SECRET=<32-character hex key>
JWT_EXPIRES_IN=24H

# Server Configuration
PORT=5000

# Default Credentials
PRINCIPAL_EMAIL=principal
PRINCIPAL_PASSWORD=Pass@123
SUPER_ADMIN_USERNAME=<configurable>
SUPER_ADMIN_PASSWORD=<configurable>

# Cloudinary Configuration (Image Hosting)
CLOUDINARY_CLOUD_NAME=<cloud ID>
CLOUDINARY_API_KEY=<API key>
CLOUDINARY_API_SECRET=<secret>

# Razorpay Configuration (Payment Gateway)
RAZORPAY_KEY_ID=rzp_test_<test key>
RAZORPAY_KEY_SECRET=<secret>

# Email Configuration
EMAIL_HOST=<SMTP host>
EMAIL_PORT=<SMTP port>
EMAIL_USER=<email username>
EMAIL_PASSWORD=<email password>

# Security Configuration
CORS_ORIGINS=<comma-separated allowed origins>
TRUST_PROXY=<proxy configuration>

# Logging
LOG_LEVEL=info
```

### Frontend (.env)

Located at: `/frontend/.env`

```env
# Backend API URL
VITE_API_URL=http://localhost:5000

# Razorpay Public Key
VITE_RAZORPAY_KEY_ID=rzp_test_<test key>
```

**Important Notes:**
- Never commit `.env` files to version control
- Use `.env.example` files to document required variables
- Vite environment variables must be prefixed with `VITE_`
- Backend environment variables are accessed via `process.env`

---

## Conventions & Rules

### Code Style

**General:**
- Use ES6+ JavaScript features
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks
- Use async/await over raw promises
- Use template literals for string interpolation

**Frontend (React):**
- Components: PascalCase (e.g., `StudentDashboard.jsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAdminAuth.js`)
- Files: Use `.jsx` extension for components
- Props: Destructure in function parameters
- State: Use hooks (useState, useEffect, etc.)

**Backend (Express):**
- Route files: `resourceRoute.js` or `resourceRoutes.js`
- Models: PascalCase (e.g., `StudentUser.js`)
- Middleware: Descriptive names (e.g., `authStudent.js`)
- Utilities: camelCase (e.g., `chatGroupProvisioning.js`)
- Controllers: Logic often inline in route handlers

### Git Workflow

**Branch Naming:**
- Feature: `feature/feature-name`
- Bug fix: `fix/bug-description`
- Hotfix: `hotfix/critical-issue`
- Release: `release/version-number`

**Commit Messages:**
- Use imperative mood ("Add feature" not "Added feature")
- First line: brief summary (50 chars max)
- Body: detailed explanation if needed
- Reference issues: "Fixes #123"

### File Organization

**Frontend:**
- Shared components → `/frontend/src/components/`
- Role-specific components → `/frontend/src/{role}/`
- Utilities → `/frontend/src/utils/`
- Contexts → `/frontend/src/contexts/`
- Hooks → `/frontend/src/hooks/`

**Backend:**
- Routes → `/backend/routes/`
- Models → `/backend/models/`
- Middleware → `/backend/middleware/`
- Utilities → `/backend/utils/`
- Tests → `/backend/__tests__/`

### Security Rules

1. **Never commit sensitive data:**
   - No `.env` files
   - No API keys or secrets
   - No hardcoded passwords

2. **Authentication:**
   - Always use appropriate auth middleware on protected routes
   - Validate JWT tokens on every request
   - Hash passwords with bcrypt (min 10 rounds)
   - Implement password strength requirements

3. **Input Validation:**
   - Validate all user inputs
   - Sanitize data before database operations
   - Use Mongoose schema validation

4. **Rate Limiting:**
   - Apply rate limiting to auth endpoints
   - Protect against brute force attacks

5. **CORS:**
   - Configure CORS with specific origins
   - Don't use wildcard (*) in production

6. **Logging:**
   - Log security events (failed logins, unauthorized access)
   - Don't log sensitive data (passwords, tokens)
   - Use correlation IDs for request tracing

### Database Rules

1. **Naming:**
   - Collections: Pluralized PascalCase (e.g., `StudentUsers`)
   - Fields: camelCase (e.g., `firstName`)
   - References: Use `ObjectId` with `ref` to model name

2. **Indexes:**
   - Add unique indexes for usernames/emails
   - Add compound indexes for frequent queries
   - Use sparse indexes for optional fields

3. **Relationships:**
   - Use references (ObjectId) for relationships
   - Implement cascade deletion where appropriate
   - Use population for related data

4. **Validation:**
   - Define schema validation rules
   - Use enums for fixed values
   - Validate required fields

---

## Important Patterns

### 1. Authentication & Authorization

**Pattern:** Role-based access control with JWT tokens

```javascript
// Backend: Protect routes with middleware
router.get('/dashboard', authStudent, (req, res) => {
  // req.userId and req.schoolId available from middleware
  // Handler logic here
});

// Frontend: Store token in localStorage
localStorage.setItem('token', token);

// Frontend: Include token in requests
axios.get('/api/student/dashboard', {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Token Structure:**
```json
{
  "userId": "ObjectId",
  "role": "student|teacher|parent|admin|principal|superadmin",
  "schoolId": "ObjectId"
}
```

**Middleware Chain:**
- `authStudent.js` - Validates student tokens
- `authTeacher.js` - Validates teacher tokens
- `authParent.js` - Validates parent tokens
- `authStaff.js` - Validates staff tokens
- `adminAuth.js` - Validates admin tokens
- `principalAuth.js` - Validates principal tokens
- `superAdminAuth.js` - Validates super admin tokens
- `authAnyUser.js` - Validates any authenticated user

### 2. API Architecture

**Pattern:** RESTful API with Express routes

```
Request → Middleware (auth, logging, rate limiting)
        → Route Handler
        → Database Query
        → Response
```

**Example Route:**
```javascript
// routes/studentRoute.js
const express = require('express');
const router = express.Router();
const { authStudent } = require('../middleware/authStudent');

router.get('/dashboard', authStudent, async (req, res) => {
  try {
    const student = await StudentUser.findById(req.userId);
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
```

### 3. Logging Strategy

**Framework:** Pino (structured JSON logging)

**Log Types:**
- Request logs (correlation IDs)
- Security events (auth failures, unauthorized access)
- Auth events (login, logout)
- Business events (operations)
- Error logs

**Example:**
```javascript
const logger = require('../utils/logger');

// Info log
logger.info({ userId, action: 'login' }, 'User logged in');

// Error log
logger.error({ error, userId }, 'Failed to fetch data');

// Security event
securityEventLogger.warn({
  event: 'unauthorized_access',
  userId,
  resource: '/admin/dashboard'
}, 'Unauthorized access attempt');
```

### 4. Frontend State Management

**Pattern:** React Context API + Hooks

**Auth Context Example:**
```javascript
// contexts/AuthContext.jsx
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Validate token and fetch user
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Usage in components
const { user, token } = useContext(AuthContext);
```

### 5. Real-time Communication

**Framework:** Socket.IO

**Server Setup:**
```javascript
const io = require('socket.io')(server, {
  cors: { origin: process.env.CORS_ORIGINS }
});

io.on('connection', (socket) => {
  socket.on('join_chat', ({ threadId, userId }) => {
    socket.join(threadId);
  });

  socket.on('send_message', async (data) => {
    const message = await ChatMessage.create(data);
    io.to(data.threadId).emit('new_message', message);
  });
});
```

**Client Setup:**
```javascript
import io from 'socket.io-client';

const socket = io(process.env.VITE_API_URL);

socket.on('connect', () => {
  socket.emit('join_chat', { threadId, userId });
});

socket.on('new_message', (message) => {
  // Update UI with new message
});
```

### 6. File Upload

**Local Storage (Multer):**
```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), (req, res) => {
  // req.file contains uploaded file
});
```

**Cloud Storage (Cloudinary):**
```javascript
const cloudinary = require('../utils/cloudinary');

const result = await cloudinary.uploader.upload(filePath, {
  folder: 'eec/assignments',
  resource_type: 'auto'
});

// result.secure_url contains the CDN URL
```

### 7. Payment Processing

**Pattern:** Razorpay integration

**Backend:**
```javascript
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const order = await razorpay.orders.create({
  amount: amount * 100, // Convert to paise
  currency: 'INR',
  receipt: `receipt_${invoiceId}`
});
```

**Frontend:**
```javascript
const options = {
  key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  amount: order.amount,
  currency: order.currency,
  name: 'School Name',
  order_id: order.id,
  handler: async (response) => {
    // Verify payment on backend
  }
};

const rzp = new window.Razorpay(options);
rzp.open();
```

### 8. Error Handling

**Backend:**
```javascript
// Centralized error handler
app.use((err, req, res, next) => {
  logger.error({ error: err, correlationId: req.correlationId });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Try-catch in async routes
router.get('/data', authStudent, async (req, res, next) => {
  try {
    const data = await fetchData();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});
```

**Frontend:**
```javascript
// Axios interceptor for error handling
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## API Documentation

### Access API Documentation

**Swagger UI:**
- URL: `http://localhost:5000/api/docs`
- Interactive API explorer
- Auto-generated from code annotations

**Generate Documentation:**
```bash
cd backend
npm run swagger:gen
```

### Available API Maps

Located in `/docs/`:
- `student-portal-api-map.md` - Student endpoints
- `teacher-portal-api-map.md` - Teacher endpoints
- `school-admin-api-map.md` - Admin endpoints
- `super-admin-api-map.md` - Super admin endpoints

### API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Optional error details"
}
```

### Common Headers

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## Testing Guidelines

### Testing Framework

**Backend:** Jest + Supertest
**Frontend:** Jest + React Testing Library

### Running Tests

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test
npm run test:coverage
```

### Test Structure

**Pattern:** Arrange-Act-Assert (AAA)

```javascript
describe('Feature/Component Name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something', async () => {
    // Arrange
    const data = { ... };

    // Act
    const result = await performAction(data);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### Backend Testing

**API Endpoint Testing:**
```javascript
const request = require('supertest');
const app = require('../index');

describe('Student Routes', () => {
  it('should login student with valid credentials', async () => {
    const response = await request(app)
      .post('/api/student/login')
      .send({ username: 'test', password: 'Test@123' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });
});
```

### Frontend Testing

**Component Testing:**
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../LoginForm';

describe('LoginForm', () => {
  it('should render login form', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should submit form with credentials', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Test@123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'Test@123'
    });
  });
});
```

### Coverage Requirements

- **Target:** 70-80% code coverage
- **Critical paths:** 90%+ coverage (auth, payments, data integrity)
- **Run coverage:** `npm run test:coverage`

### Test Documentation

See detailed testing guides:
- `TESTING_GUIDE.md` - General testing standards
- `TEACHER_PORTAL_TESTING_GUIDE.md` - Teacher portal testing
- `MANUAL_TESTING_COMMANDS.md` - Manual testing procedures

---

## Deployment

### Development Environment

**Backend:**
```bash
cd backend
npm run dev  # Runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm run dev  # Runs on http://localhost:5173
```

### Production Build

**Frontend:**
```bash
cd frontend
npm run build  # Outputs to dist/
npm run preview  # Preview production build
```

**Backend:**
```bash
cd backend
npm start  # Production mode (no auto-reload)
```

### Environment Checklist

Before deployment, ensure:
- [ ] All `.env` variables are configured
- [ ] MongoDB connection string is valid
- [ ] JWT secret is secure (32+ characters)
- [ ] CORS origins are properly set
- [ ] Cloudinary credentials are configured
- [ ] Razorpay keys are set (live keys for production)
- [ ] Email SMTP settings are correct
- [ ] Rate limiting is enabled
- [ ] Logging is configured
- [ ] Tests are passing
- [ ] Security audit completed

### Deployment Platforms

**Recommended:**
- **Frontend:**AWS S3 + CloudFront
- **Backend:** AWS EC2,
- **Database:** MongoDB Atlas (already configured)
- **File Storage:** Cloudinary (already configured)

### Production Considerations

1. **Security:**
   - Use HTTPS for all connections
   - Enable rate limiting
   - Set secure cookie flags
   - Implement CSRF protection
   - Use helmet.js for security headers

2. **Performance:**
   - Enable gzip compression
   - Use CDN for static assets
   - Implement caching strategies
   - Optimize database queries
   - Use connection pooling

3. **Monitoring:**
   - Set up error tracking (Sentry)
   - Configure uptime monitoring
   - Monitor database performance
   - Track API response times
   - Set up log aggregation

4. **Backup:**
   - Regular database backups
   - Backup uploaded files
   - Disaster recovery plan
   - Version control all code

---

## Support & Documentation

**Additional Documentation:**
- `README.md` - Project overview
- `AGENTS.md` - Developer guidelines
- `docs/` - API reference guides

**Issue Tracking:**
- Use GitHub Issues for bug reports
- Use GitHub Projects for feature planning
- Tag issues appropriately (bug, feature, enhancement)

**Contact:**
- See `MeetTheDeveloper.jsx` for developer information
- Use `FeedbackPage.jsx` for user feedback

---

## Version Information

**Last Updated:** 2026-04-23
**Project Version:** See `package.json` in root directory
**Node Version:** 16+ required
**npm Version:** 8+ required

---

## License

See LICENSE file in project root.

---

**Note:** This documentation is auto-generated and maintained for AI assistants (Claude) and developers working on the EEC project. Keep this file updated as the project evolves.
