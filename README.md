# EEC ERP/LMS - Comprehensive Technical Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Frontend Components](#frontend-components)
- [Backend Architecture](#backend-architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Caching Strategy](#caching-strategy)
- [Authentication & Authorization](#authentication--authorization)
- [Real-time Features](#real-time-features)
- [File Upload System](#file-upload-system)
- [Roles & Permissions](#roles--permissions)
- [Data Flow](#data-flow)
- [Setup & Installation](#setup--installation)

---

## Overview

EEC ERP/LMS is a comprehensive Educational Resource Planning and Learning Management System designed for multi-tenant school management. The system provides role-based access for administrators, teachers, students, and parents with features including attendance tracking, assignment management, AI-powered teaching tools, real-time communication, and analytics.

### Key Features
- **Multi-tenant Architecture** - Support for multiple schools
- **Role-based Access Control** - 8+ distinct user roles
- **Real-time Communication** - Chat, notifications, and updates
- **AI Integration** - AI-powered teaching tools and student progress analysis
- **Cloud Storage** - Cloudinary integration for file management
- **Responsive Design** - Mobile-first UI/UX
- **Caching Layer** - Client-side and server-side caching
- **RESTful API** - Well-structured API endpoints

---

## Technology Stack

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.2
- **Routing**: React Router DOM 6.26.1
- **State Management**: React Context API + Local State
- **HTTP Client**: Axios 1.7.7
- **UI Components**: Lucide React (Icons)
- **3D Graphics**: Three.js + GLTFLoader
- **Styling**: Tailwind CSS 3.4.1
- **Date Handling**: Custom utilities

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer + Cloudinary SDK
- **Real-time**: Socket.io (for chat)
- **Environment**: dotenv

### Cloud Services
- **File Storage**: Cloudinary
- **Database Hosting**: MongoDB Atlas (production)
- **Image Optimization**: Cloudinary transformations

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌────────────┬────────────┬────────────┬─────────────┐     │
│  │  Student   │  Teacher   │   Admin    │   Parent    │     │
│  │  Portal    │  Portal    │  Portal    │   Portal    │     │
│  └────────────┴────────────┴────────────┴─────────────┘     │
│           │              │              │              │     │
│           └──────────────┴──────────────┴──────────────┘     │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  API Gateway   │
                    │  (Express.js)  │
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼──────┐
│ Authentication │  │   Business     │  │   File      │
│   Middleware   │  │     Logic      │  │  Upload     │
└───────┬────────┘  └───────┬────────┘  └──────┬──────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼────────┐      ┌──────▼────────┐
        │   MongoDB      │      │   Cloudinary  │
        │   Database     │      │   CDN         │
        └────────────────┘      └───────────────┘
```

### Component Architecture

```
Frontend (React)
│
├── Components/
│   ├── Student Portal
│   │   ├── Dashboard.jsx (Main layout)
│   │   ├── DashboardHome.jsx (Home page)
│   │   ├── AssignmentView.jsx (Assignments)
│   │   ├── AttendanceView.jsx (Attendance)
│   │   ├── StudyMaterials.jsx (Materials)
│   │   ├── StudentChat.jsx (Chat)
│   │   └── NoticeBoard.jsx (Notices)
│   │
│   ├── Teacher Portal
│   │   ├── TeacherPortal.jsx (Main layout)
│   │   ├── TeacherDashboard.jsx (Dashboard)
│   │   ├── AssignmentManagement.jsx (Create assignments)
│   │   ├── AssignmentEvaluation.jsx (Grade submissions)
│   │   ├── AttendanceManagement.jsx (Mark attendance)
│   │   ├── ClassNotes.jsx (Upload materials)
│   │   ├── TeacherChat.jsx (Communication)
│   │   └── StudentProgress.jsx (Analytics)
│   │
│   ├── Admin Portal
│   │   ├── AdminApp.jsx (Main layout)
│   │   ├── StudentPromotion.jsx (Promote students)
│   │   └── [Other admin components]
│   │
│   └── Shared Components
│       ├── Sidebar.jsx (Navigation)
│       ├── Header.jsx (Top bar)
│       └── [Reusable components]
│
└── Utils/
    ├── authSession.js (Authentication)
    ├── studentCache.js (Client-side caching)
    └── points.js (Gamification)
```

---

## Frontend Components

### Student Portal Components

#### 1. **Dashboard (`Dashboard.jsx`)**
- **Purpose**: Main application container with routing
- **Features**:
  - Sidebar navigation
  - Header with user profile
  - Dynamic route rendering
  - Responsive layout
- **State Management**: useState for sidebar toggle
- **Routes**:
  - `/student` → DashboardHome
  - `/student/assignments` → AssignmentView
  - `/student/attendance` → AttendanceView
  - `/student/study-materials` → StudyMaterials
  - `/student/chat` → StudentChat
  - `/student/noticeboard` → NoticeBoard

#### 2. **DashboardHome (`DashboardHome.jsx`)**
- **Purpose**: Student dashboard landing page
- **Features**:
  - Welcome card with greeting
  - Quick stats (attendance, assignments, etc.)
  - Course progress visualization
  - Calendar widget
  - Achievement cards
  - Interactive pet system (gamification)
- **API Calls**: None (child components fetch data)
- **State**: Pet management, container bounds

#### 3. **AssignmentView (`AssignmentView.jsx`)**
- **Purpose**: View and submit assignments
- **Features**:
  - School assignments list
  - Journal entries (learning log)
  - Practice questions (EEC)
  - PDF upload for submissions
  - Text submission
  - Assignment filters (pending, completed, overdue)
  - Rich text editor for journal
- **API Integration**:
  - `GET /api/assignment/student/assignments` - Fetch assignments
  - `POST /api/assignment/submit` - Submit assignment
  - `POST /api/uploads/cloudinary/single` - Upload PDF
  - `GET /api/student/auth/journal` - Fetch journal entries
  - `POST /api/student/auth/journal` - Create journal entry
  - `PUT /api/student/auth/journal/:id` - Update journal entry
  - `DELETE /api/student/auth/journal/:id` - Delete journal entry
- **Caching**: Journal entries cached locally
- **State Management**:
  - Assignment list
  - Selected assignment
  - Submission data
  - Upload progress
  - Journal entries

#### 4. **AttendanceView (`AttendanceView.jsx`)**
- **Purpose**: View attendance records and statistics
- **Features**:
  - Calendar view with color-coded dates
  - Daily attendance list
  - Weekly breakdown
  - Overall statistics
  - Subject-wise attendance
  - Current streak tracking
  - Learning materials modal (click on date)
- **API Integration**:
  - `GET /api/student/auth/attendance` - Fetch attendance
  - `GET /api/notifications/user` - Fetch materials for date
- **Caching**:
  - Cache Key: `studentAttendanceCacheV1`
  - TTL: 5 minutes
  - Auto-refresh on cache expiry
- **State Management**:
  - Attendance records
  - Statistics
  - Selected date
  - Materials modal state
  - Tab selection (overview/calendar/daily/weekly)

#### 5. **StudyMaterials (`StudyMaterials.jsx`)**
- **Purpose**: Browse and download learning materials
- **Features**:
  - Subject-based filtering
  - Search functionality
  - Material preview
  - File download
  - Priority badges
  - Teacher information display
- **API Integration**:
  - `GET /api/notifications/user` - Fetch all materials
- **Filtering**: Client-side filtering by subject and search
- **State Management**:
  - Materials list
  - Search query
  - Subject filter
  - Expanded material ID

#### 6. **StudentChat (`StudentChat.jsx`)**
- **Purpose**: Real-time messaging with teachers
- **Features**:
  - Real-time chat
  - Message history
  - Online status
  - Typing indicators
- **API Integration**:
  - Socket.io connection
  - Real-time message events
- **State Management**:
  - Message list
  - Connection status
  - Active chat

#### 7. **NoticeBoard (`NoticeBoard.jsx`)**
- **Purpose**: View announcements and notices
- **Features**:
  - Priority-based display
  - Attachment downloads
  - Read/unread status
  - Filter by type
  - Search functionality
- **API Integration**:
  - `GET /api/notifications/user` - Fetch notifications
- **State Management**:
  - Notifications list
  - Filters
  - Search query

### Teacher Portal Components

#### 1. **TeacherPortal (`TeacherPortal.jsx`)**
- **Purpose**: Main teacher application container
- **Features**:
  - Collapsible sidebar
  - Role-based navigation
  - Profile dropdown
  - Greeting message
  - Route management
- **State Management**:
  - Sidebar state
  - Profile data
  - Active menu groups
- **Routes**:
  - `/teacher/dashboard` → TeacherDashboard
  - `/teacher/assignments` → AssignmentManagement
  - `/teacher/evaluation` → AssignmentEvaluation
  - `/teacher/attendance` → AttendanceManagement
  - `/teacher/class-notes` → ClassNotes
  - `/teacher/progress` → StudentProgress

#### 2. **TeacherDashboard (`TeacherDashboard.jsx`)**
- **Purpose**: Teacher overview and statistics
- **Features**:
  - Quick stats (students, attendance, assignments)
  - Today's schedule
  - Recent activities
  - Performance overview
  - Top students
  - Upcoming deadlines
- **API Integration**:
  - Dashboard API endpoint
- **State Management**:
  - Dashboard data
  - Loading states

#### 3. **AssignmentManagement (`AssignmentManagement.jsx`)**
- **Purpose**: Create and manage assignments
- **Features**:
  - Create new assignments
  - Edit existing assignments
  - Set due dates
  - Attach files
  - Assign to classes/sections
  - Submission format selection (text/PDF)
- **API Integration**:
  - `POST /api/assignment/create` - Create assignment
  - `GET /api/assignment/teacher/assignments` - List assignments
  - `PUT /api/assignment/:id` - Update assignment
  - `DELETE /api/assignment/:id` - Delete assignment
- **State Management**:
  - Assignment form data
  - Assignment list
  - Class/section selection

#### 4. **AssignmentEvaluation (`AssignmentEvaluation.jsx`)**
- **Purpose**: Grade student submissions
- **Features**:
  - Submission list with filters
  - PDF preview (opt-in)
  - PDF download
  - Text answer display
  - Grading interface
  - Feedback system
  - Statistics dashboard
  - Sort by date
  - Status filters (pending/graded)
- **API Integration**:
  - `GET /api/assignment/teacher/submissions` - Fetch submissions
  - `POST /api/assignment/teacher/grade` - Submit grade
- **State Management**:
  - Submissions list
  - Selected submission
  - Marks and feedback
  - PDF preview toggle
  - Filters (search, status, assignment)
  - Sort order
- **Caching**: No caching (always fresh data)

#### 5. **AttendanceManagement (`AttendanceManagement.jsx`)**
- **Purpose**: Mark student attendance
- **Features**:
  - Bulk attendance marking
  - Date selection
  - Class/section selection
  - Individual student toggle
  - Quick filters (all present/absent)
- **API Integration**:
  - `POST /api/attendance/mark` - Submit attendance
  - `GET /api/attendance/class` - Get class list
- **State Management**:
  - Student list
  - Attendance status per student
  - Selected date and class

#### 6. **ClassNotes (`ClassNotes.jsx`)**
- **Purpose**: Upload and share learning materials
- **Features**:
  - Multiple file upload (PDF, images, documents)
  - Material categorization
  - Class/section assignment
  - Priority setting
  - File preview
  - Delete materials
- **API Integration**:
  - `POST /api/notifications/create` - Create note
  - `POST /api/uploads/cloudinary/single` - Upload file
  - `DELETE /api/notifications/:id` - Delete note
- **Supported File Types**:
  - PDF (application/pdf)
  - Images (JPEG, PNG, GIF)
  - Word (.doc, .docx)
  - Excel (.xls, .xlsx)
  - PowerPoint (.ppt, .pptx)
  - Text (.txt)
- **State Management**:
  - Notes list
  - Form data
  - Attachments array
  - Upload progress

#### 7. **StudentProgress (`StudentProgress.jsx`)**
- **Purpose**: Track and analyze student performance
- **Features**:
  - Individual student reports
  - Class-wide analytics
  - Subject-wise performance
  - Progress charts
  - Weak student identification
- **API Integration**:
  - Progress analytics endpoint
- **State Management**:
  - Student data
  - Performance metrics
  - Chart data

---

## Backend Architecture

### Directory Structure

```
backend/
├── models/
│   ├── Student.js
│   ├── Teacher.js
│   ├── Admin.js
│   ├── Assignment.js
│   ├── Submission.js
│   ├── Attendance.js
│   ├── Notification.js
│   ├── Journal.js
│   └── PromotionHistory.js
├── routes/
│   ├── assignmentRoutes.js
│   ├── attendanceRoutes.js
│   ├── notificationRoutes.js
│   ├── uploadRoutes.js
│   ├── studentRoutes.js
│   ├── teacherRoutes.js
│   ├── adminRoutes.js
│   └── promotionRoutes.js
├── middleware/
│   ├── authMiddleware.js
│   └── uploadMiddleware.js
├── config/
│   ├── db.js
│   └── cloudinary.js
└── server.js
```

### Middleware

#### 1. **Authentication Middleware (`authMiddleware.js`)**
```javascript
// JWT verification
// Role-based access control
// Token extraction from headers
// User context injection
```

#### 2. **Upload Middleware (`uploadMiddleware.js`)**
```javascript
// Multer configuration
// File type validation
// File size limits
// Temporary storage handling
```

---

## Database Schema

### MongoDB Collections

#### 1. **Students Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  rollNumber: String,
  className: String,
  sectionName: String,
  grade: String,
  section: String,
  campusName: String,
  campusType: String,
  schoolName: String,
  schoolLogo: String,
  profilePic: String,
  dateOfBirth: Date,
  parentContact: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **Teachers Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  department: String,
  subjects: [String],
  classes: [{
    className: String,
    section: String
  }],
  profilePic: String,
  contactNumber: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. **Assignments Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  subject: String,
  teacherId: ObjectId (ref: Teacher),
  className: String,
  section: String,
  dueDate: Date,
  marks: Number,
  submissionFormat: String, // 'text' or 'pdf'
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. **Submissions Collection**
```javascript
{
  _id: ObjectId,
  assignmentId: ObjectId (ref: Assignment),
  studentId: ObjectId (ref: Student),
  submissionText: String,
  attachmentUrl: String,
  submittedAt: Date,
  status: String, // 'submitted', 'graded', 'late'
  score: Number,
  feedback: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 5. **Attendance Collection**
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: Student),
  date: Date,
  status: String, // 'present', 'absent'
  subject: String,
  teacherId: ObjectId (ref: Teacher),
  className: String,
  section: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 6. **Notifications Collection**
```javascript
{
  _id: ObjectId,
  type: String, // 'class_note', 'announcement', 'notice'
  title: String,
  message: String,
  priority: String, // 'high', 'medium', 'low'
  createdByType: String, // 'teacher', 'admin'
  createdByName: String,
  createdById: ObjectId,
  className: String,
  sectionName: String,
  subjectName: String,
  typeLabel: String,
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  recipients: [{
    userId: ObjectId,
    userType: String,
    readAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### 7. **Journal Collection**
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: Student),
  title: String,
  content: String,
  tags: [String],
  mood: String, // 'Happy', 'Neutral', 'Curious', etc.
  createdAt: Date,
  updatedAt: Date
}
```

#### 8. **PromotionHistory Collection**
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: Student),
  fromClass: String,
  fromSection: String,
  toClass: String,
  toSection: String,
  academicYear: String,
  promotedBy: ObjectId (ref: Admin),
  promotionDate: Date,
  remarks: String,
  createdAt: Date
}
```

### Database Indexes

```javascript
// Performance optimization indexes
Students:
  - { email: 1 } (unique)
  - { rollNumber: 1, className: 1, sectionName: 1 }

Teachers:
  - { email: 1 } (unique)
  - { subjects: 1 }

Assignments:
  - { teacherId: 1, className: 1, section: 1 }
  - { dueDate: 1 }

Submissions:
  - { assignmentId: 1, studentId: 1 } (compound unique)
  - { studentId: 1, submittedAt: -1 }

Attendance:
  - { studentId: 1, date: 1 } (compound unique)
  - { className: 1, section: 1, date: 1 }

Notifications:
  - { type: 1, createdAt: -1 }
  - { className: 1, sectionName: 1 }
```

---

## API Reference

### Authentication Endpoints

#### Student Authentication
```http
POST /api/student/auth/login
POST /api/student/auth/register
GET  /api/student/auth/profile
PUT  /api/student/auth/profile
```

#### Teacher Authentication
```http
POST /api/teacher/auth/login
POST /api/teacher/auth/register
GET  /api/teacher/auth/profile
PUT  /api/teacher/auth/profile
```

### Assignment Endpoints

#### Student APIs
```http
GET  /api/assignment/student/assignments
     Response: Array of assignments for logged-in student
     Headers: Authorization: Bearer <token>

POST /api/assignment/submit
     Body: {
       assignmentId: String,
       submissionText: String,
       attachmentUrl: String (optional)
     }
     Response: Submission object
```

#### Teacher APIs
```http
POST /api/assignment/create
     Body: {
       title: String,
       description: String,
       subject: String,
       className: String,
       section: String,
       dueDate: Date,
       marks: Number,
       submissionFormat: 'text' | 'pdf',
       attachments: Array
     }

GET  /api/assignment/teacher/assignments
     Response: Array of teacher's assignments

GET  /api/assignment/teacher/submissions
     Response: Array of student submissions
     Query Params: assignmentId (optional)

POST /api/assignment/teacher/grade
     Body: {
       studentId: String,
       assignmentId: String,
       score: Number,
       feedback: String
     }
```

### Attendance Endpoints

```http
GET  /api/student/auth/attendance
     Response: {
       summary: {
         totalClasses: Number,
         presentDays: Number,
         absentDays: Number,
         attendancePercentage: Number
       },
       attendance: Array<{
         date: Date,
         subject: String,
         status: 'present' | 'absent'
       }>
     }

POST /api/attendance/mark
     Body: {
       date: Date,
       className: String,
       section: String,
       attendance: [{
         studentId: String,
         status: 'present' | 'absent'
       }]
     }
```

### Notification Endpoints

```http
GET  /api/notifications/user
     Response: Array of notifications for user
     Filter: type === 'class_note' for study materials

POST /api/notifications/create
     Body: {
       type: String,
       title: String,
       message: String,
       priority: String,
       className: String,
       sectionName: String,
       subjectName: String,
       attachments: Array
     }

DELETE /api/notifications/:id
```

### Journal Endpoints

```http
GET    /api/student/auth/journal
       Response: { entries: Array }

POST   /api/student/auth/journal
       Body: {
         title: String,
         content: String,
         tags: [String],
         mood: String
       }

PUT    /api/student/auth/journal/:id
       Body: { title, content, tags, mood }

DELETE /api/student/auth/journal/:id
```

### Upload Endpoints

```http
POST /api/uploads/cloudinary/single
     Headers:
       Authorization: Bearer <token>
       Content-Type: multipart/form-data
     Body:
       file: Binary
       folder: String (optional)
       tags: String (optional)

     Response: {
       files: [{
         secure_url: String,
         originalName: String,
         bytes: Number,
         format: String
       }]
     }
```

### Promotion Endpoints

```http
GET  /api/promotion/history/:studentId
POST /api/promotion/promote
     Body: {
       studentIds: [String],
       fromClass: String,
       fromSection: String,
       toClass: String,
       toSection: String
     }
```

---

## Caching Strategy

### Client-Side Caching

#### 1. **Attendance Cache (`studentCache.js`)**
```javascript
// Cache Implementation
const CACHE_KEY = 'studentAttendanceCacheV1';
const TTL = 5 * 60 * 1000; // 5 minutes

// Functions
writeCacheEntry(key, data, ttl)
readCacheEntry(key)
clearCacheEntry(key)

// Storage: localStorage
// Format: {
//   data: Object,
//   timestamp: Number
// }

// Usage in AttendanceView:
- On mount: Check cache → Use if valid → Fetch in background
- On fetch: Write to cache
- On expiry: Auto-fetch and update
```

#### 2. **Session Storage**
```javascript
// Used for:
- Authentication tokens
- User type
- Temporary form data
```

### Server-Side Caching

#### 1. **In-Memory Caching** (Planned)
```javascript
// Redis integration for:
- Session management
- Frequently accessed data
- API response caching
```

#### 2. **Database Query Optimization**
```javascript
// Techniques:
- Lean queries (return plain objects)
- Select only required fields
- Index-backed queries
- Aggregation pipelines for complex queries
```

### CDN Caching (Cloudinary)

```javascript
// Cloudinary automatic caching:
- Image transformations cached
- Optimized delivery via CDN
- Automatic format selection (WebP, etc.)
- Lazy loading support
```

---

## Authentication & Authorization

### JWT Implementation

#### Token Structure
```javascript
{
  header: {
    alg: 'HS256',
    typ: 'JWT'
  },
  payload: {
    userId: String,
    userType: 'Student' | 'Teacher' | 'Admin',
    email: String,
    iat: Number,
    exp: Number
  },
  signature: String
}
```

#### Authentication Flow

```
1. Login Request
   ├─→ POST /api/student/auth/login
   ├─→ Verify credentials (bcrypt.compare)
   ├─→ Generate JWT token
   └─→ Return { token, user }

2. Subsequent Requests
   ├─→ Client sends: Authorization: Bearer <token>
   ├─→ Middleware verifies token
   ├─→ Inject user context to req.user
   └─→ Proceed to route handler

3. Token Refresh
   ├─→ Check token expiry
   ├─→ Auto-logout on expiry
   └─→ Redirect to login
```

### Role-Based Access Control

```javascript
// Middleware implementation
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }
    next();
  };
};

// Usage
router.get('/admin/students',
  authMiddleware,
  authorize(['Admin']),
  getStudents
);
```

### Session Management

```javascript
// Session storage: localStorage
localStorage.setItem('token', jwtToken);
localStorage.setItem('userType', 'Student');

// Session validation
const validateSession = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decoded = jwt.decode(token);
    return decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};
```

---

## Real-time Features

### Socket.io Integration

#### Server Setup
```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  // Authentication
  socket.on('authenticate', (token) => {
    // Verify JWT
    // Join user-specific room
  });

  // Chat events
  socket.on('message', (data) => {
    // Broadcast to recipients
  });

  // Typing indicators
  socket.on('typing', (data) => {
    // Broadcast typing status
  });
});
```

#### Client Integration (StudentChat.jsx)
```javascript
useEffect(() => {
  const socket = io(API_URL);

  socket.emit('authenticate', token);

  socket.on('message', (message) => {
    setMessages(prev => [...prev, message]);
  });

  return () => socket.disconnect();
}, []);
```

---

## File Upload System

### Cloudinary Integration

#### Configuration
```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
```

#### Upload Flow

```
1. Client Request
   ├─→ Select file via <input type="file">
   ├─→ FormData with file
   └─→ POST /api/uploads/cloudinary/single

2. Server Processing
   ├─→ Multer middleware (temp storage)
   ├─→ File validation (type, size)
   ├─→ Upload to Cloudinary
   ├─→ Delete temp file
   └─→ Return secure_url

3. Database Storage
   ├─→ Save URL in document
   └─→ Attachment object with metadata
```

#### File Type Validation

```javascript
// AssignmentEvaluation: PDF only
accept: 'application/pdf'
maxSize: 20MB

// ClassNotes: Multiple types
accept: [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain'
]
maxSize: 10MB
```

#### Error Handling

```javascript
try {
  // Upload
} catch (error) {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large'
    });
  }
  if (error.code === 'INVALID_TYPE') {
    return res.status(400).json({
      error: 'Invalid file type'
    });
  }
  // Generic error
}
```

---

## Roles & Permissions

### User Roles

| Role | Permissions |
|------|-------------|
| **Student** | View own data, Submit assignments, View attendance, Access study materials, Chat with teachers |
| **Teacher** | Create assignments, Grade submissions, Mark attendance, Upload materials, View student progress, Chat with students |
| **Class Teacher** | All Teacher permissions + Promote students, View class analytics |
| **Admin** | Manage users, View all data, System configuration, Reports, Promote students |
| **Principal** | View academics, Teacher management, Reports (read-only) |
| **Parent** | View child's data, Fee payment, Attendance view, Chat with teachers |
| **Accountant** | Fee management, Payment records |
| **Super Admin** | Multi-tenant management, All system access |

### Access Control Matrix

```javascript
const permissions = {
  'Student': {
    assignments: ['read', 'submit'],
    attendance: ['read'],
    materials: ['read', 'download'],
    chat: ['read', 'write']
  },
  'Teacher': {
    assignments: ['create', 'read', 'update', 'delete', 'grade'],
    attendance: ['create', 'read', 'update'],
    materials: ['create', 'read', 'delete'],
    students: ['read'],
    chat: ['read', 'write']
  },
  'Admin': {
    '*': ['create', 'read', 'update', 'delete']
  }
};
```

---

## Data Flow

### Assignment Submission Flow

```
┌─────────────┐
│   Student   │
└──────┬──────┘
       │ 1. View Assignment
       ▼
┌─────────────────────┐
│ AssignmentView.jsx  │
│ GET /assignments    │
└──────┬──────────────┘
       │ 2. Upload PDF (if required)
       ▼
┌─────────────────────┐
│  Upload API         │
│  POST /uploads      │
│  → Cloudinary       │
└──────┬──────────────┘
       │ 3. Submit with URL
       ▼
┌─────────────────────┐
│ Submission API      │
│ POST /submit        │
│ → MongoDB           │
└──────┬──────────────┘
       │ 4. Notification
       ▼
┌─────────────┐
│   Teacher   │
└──────┬──────┘
       │ 5. View & Grade
       ▼
┌──────────────────────┐
│ AssignmentEvaluation │
│ GET /submissions     │
│ POST /grade          │
└──────┬───────────────┘
       │ 6. Update Score
       ▼
┌─────────────────┐
│   Database      │
│ Update Record   │
└─────────────────┘
```

### Attendance Marking Flow

```
┌─────────────┐
│   Teacher   │
└──────┬──────┘
       │ 1. Select Class & Date
       ▼
┌──────────────────────┐
│ AttendanceManagement │
│ GET /class/students  │
└──────┬───────────────┘
       │ 2. Mark Present/Absent
       ▼
┌─────────────────────┐
│  Attendance API     │
│  POST /mark         │
│  → Bulk Insert      │
└──────┬──────────────┘
       │ 3. Store Records
       ▼
┌─────────────────┐
│   MongoDB       │
│ Attendance Coll │
└──────┬──────────┘
       │ 4. Notify Students
       ▼
┌─────────────┐
│  Students   │
│ (Auto-sync) │
└─────────────┘
```

### Study Materials Distribution

```
┌─────────────┐
│   Teacher   │
└──────┬──────┘
       │ 1. Create Note
       ▼
┌─────────────────┐
│  ClassNotes.jsx │
│  Upload Files   │
└──────┬──────────┘
       │ 2. Upload to Cloud
       ▼
┌─────────────────┐
│   Cloudinary    │
│  Return URLs    │
└──────┬──────────┘
       │ 3. Create Notification
       ▼
┌──────────────────────┐
│  Notification API    │
│  POST /create        │
│  → Type: class_note  │
└──────┬───────────────┘
       │ 4. Save with Attachments
       ▼
┌─────────────────┐
│   MongoDB       │
│ Notifications   │
└──────┬──────────┘
       │ 5. Students Access
       ▼
┌──────────────────────┐
│  StudyMaterials.jsx  │
│  GET /notifications  │
│  Filter: class_note  │
└──────────────────────┘
```

---

## Setup & Installation

### Prerequisites
```bash
- Node.js >= 16.x
- MongoDB >= 5.x
- npm or yarn
- Cloudinary account
```

### Environment Variables

#### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/eec-erp
MONGODB_ATLAS_URI=mongodb+srv://...

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CLIENT_URL=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

### Installation Steps

#### 1. Clone Repository
```bash
git clone <repository-url>
cd EEC-NIF
```

#### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 3. Setup Database
```bash
# Start MongoDB locally
mongod --dbpath /path/to/data

# Or use MongoDB Atlas
# Update MONGODB_URI in .env
```

#### 4. Configure Cloudinary
```bash
# Get credentials from cloudinary.com
# Add to backend/.env
```

#### 5. Run Development Servers
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

#### 6. Access Application
```
Frontend: http://localhost:5173
Backend API: http://localhost:5000
```

### Production Deployment

#### Build Frontend
```bash
cd frontend
npm run build
# Outputs to frontend/dist
```

#### Deploy Backend
```bash
# Using PM2
pm2 start backend/server.js --name eec-api

# Or Docker
docker build -t eec-backend .
docker run -p 5000:5000 eec-backend
```

#### Environment Setup
```bash
# Production .env
NODE_ENV=production
MONGODB_URI=<production-mongodb-uri>
JWT_SECRET=<strong-secret>
CLIENT_URL=https://your-domain.com
```

---

## Performance Optimizations

### 1. **Database Optimization**
- Compound indexes for frequent queries
- Lean queries (no Mongoose overhead)
- Aggregation pipelines for analytics
- Connection pooling

### 2. **Frontend Optimization**
- Code splitting with React.lazy
- Memoization (useMemo, useCallback)
- Virtual scrolling for long lists
- Image lazy loading
- Bundle size optimization (Vite)

### 3. **Caching Strategy**
- Client-side: 5-minute TTL for attendance
- Browser caching for static assets
- CDN caching for images (Cloudinary)
- API response caching (planned)

### 4. **Network Optimization**
- Gzip compression
- Cloudinary image optimization
- Parallel API calls
- Debounced search inputs
- Pagination for large datasets

---

## Security Measures

### 1. **Authentication Security**
- JWT with expiration
- bcrypt password hashing (10 rounds)
- HTTP-only cookies (recommended)
- CORS configuration

### 2. **API Security**
- Rate limiting (planned)
- Input validation
- SQL injection prevention (MongoDB)
- XSS protection
- CSRF tokens (for forms)

### 3. **File Upload Security**
- File type validation
- File size limits
- Virus scanning (planned)
- Cloudinary secure URLs

### 4. **Data Privacy**
- Role-based data access
- Encrypted sensitive data
- GDPR compliance measures
- Audit logs (planned)

---

## Testing Strategy

### Unit Tests
```bash
# Backend
npm test

# Frontend
cd frontend && npm test
```

### Integration Tests
```javascript
// API endpoint testing
// Database operations
// File upload flow
```

### E2E Tests
```javascript
// User flows
// Assignment submission
// Grading workflow
```

---

## Monitoring & Logging

### Application Logs
```javascript
// Winston logger integration
logger.info('User logged in', { userId, userType });
logger.error('Assignment submission failed', { error });
```

### Performance Monitoring
```javascript
// Response time tracking
// API endpoint metrics
// Database query performance
```

### Error Tracking
```javascript
// Sentry integration (recommended)
// Error reporting
// Stack trace analysis
```

---

## Future Enhancements

### Planned Features
1. **Real-time Notifications** - Push notifications
2. **Video Conferencing** - Integrated video classes
3. **Mobile Apps** - React Native apps
4. **Offline Support** - PWA capabilities
5. **Advanced Analytics** - ML-based insights
6. **Multi-language Support** - i18n integration
7. **Parent Portal** - Dedicated parent interface
8. **Fee Management** - Payment gateway integration
9. **Library Management** - Book tracking
10. **Transport Management** - Bus tracking

### Technical Improvements
1. **Redis Caching** - Server-side caching
2. **GraphQL API** - Alternative to REST
3. **Microservices** - Service-oriented architecture
4. **Docker Compose** - Development environment
5. **CI/CD Pipeline** - Automated deployment
6. **Load Balancing** - Horizontal scaling
7. **Database Sharding** - Data distribution
8. **API Gateway** - Request routing

---

## Support & Documentation

### Additional Resources
- **API Documentation**: `/docs/api-reference.md`
- **Component Guide**: `/docs/components.md`
- **Database Schema**: `/docs/database-schema.md`
- **Deployment Guide**: `/docs/deployment.md`

### Contributing
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

### License
[Specify License]

### Contact
- **Technical Support**: tech@eec-erp.com
- **Documentation**: docs@eec-erp.com

---

**Last Updated**: February 2026
**Version**: 1.0.0
**Maintained By**: EEC Development Team
