# Component Architecture - EEC-NIF System

## 1. Backend Component Architecture

```mermaid
graph TB
    subgraph "Backend Application"
        subgraph "Entry Layer"
            SERVER[index.js - Server Entry]
        end

        subgraph "Middleware Layer"
            CORS_MW[CORS Middleware]
            JSON_MW[JSON Parser]
            RATE_MW[Rate Limiter]

            subgraph "Authentication Middleware"
                ADMIN_AUTH[adminAuth.js]
                TEACHER_AUTH[authTeacher.js]
                STUDENT_AUTH[authStudent.js]
                PARENT_AUTH[authParent.js]
                ANY_AUTH[authAnyUser.js]
            end
        end

        subgraph "Route Layer"
            AUTH_ROUTES[Authentication Routes]
            SCHOOL_ROUTES[School Routes]
            ACADEMIC_ROUTES[Academic Routes]
            USER_ROUTES[User Management Routes]
            FEE_ROUTES[Fee Routes]
            TIMETABLE_ROUTES[Timetable Routes]
            NOTIF_ROUTES[Notification Routes]
            REPORT_ROUTES[Report Routes]
            AUDIT_ROUTES[Audit Routes]
            AI_ROUTES[AI Learning Routes]
            NIF_ROUTES[NIF Routes]
            ALCOVE_ROUTES[Alcove Routes]
        end

        subgraph "Controller Layer"
            AUTH_CTRL[Auth Controllers]
            USER_CTRL[User Controllers]
            ACADEMIC_CTRL[Academic Controllers]
            FEE_CTRL[Fee Controllers]
            AI_CTRL[AI Learning Controllers]
            NIF_CTRL[NIF Controllers]
        end

        subgraph "Model Layer"
            USER_MODELS[User Models]
            ACADEMIC_MODELS[Academic Models]
            FEE_MODELS[Fee Models]
            PROGRESS_MODELS[Progress Models]
            NIF_MODELS[NIF Models]
            SYSTEM_MODELS[System Models]
        end

        subgraph "Utility Layer"
            CLOUDINARY[Cloudinary Utils]
            PASSWORD[Password Policy]
            FILE_UPLOAD[File Upload Utils]
            HELPERS[Helper Functions]
        end

        subgraph "External Services"
            MONGO[(MongoDB)]
            CLOUDINARY_CDN[Cloudinary CDN]
        end
    end

    SERVER --> CORS_MW
    CORS_MW --> JSON_MW
    JSON_MW --> RATE_MW

    RATE_MW --> AUTH_ROUTES
    RATE_MW --> SCHOOL_ROUTES
    RATE_MW --> ACADEMIC_ROUTES

    AUTH_ROUTES --> ADMIN_AUTH
    SCHOOL_ROUTES --> ADMIN_AUTH
    ACADEMIC_ROUTES --> ADMIN_AUTH
    USER_ROUTES --> ADMIN_AUTH
    FEE_ROUTES --> ADMIN_AUTH
    TIMETABLE_ROUTES --> ADMIN_AUTH
    REPORT_ROUTES --> ADMIN_AUTH
    AUDIT_ROUTES --> ADMIN_AUTH
    AI_ROUTES --> TEACHER_AUTH
    NIF_ROUTES --> ADMIN_AUTH
    ALCOVE_ROUTES --> TEACHER_AUTH
    NOTIF_ROUTES --> ANY_AUTH

    ADMIN_AUTH --> AUTH_CTRL
    ADMIN_AUTH --> USER_CTRL
    ADMIN_AUTH --> ACADEMIC_CTRL
    ADMIN_AUTH --> FEE_CTRL
    ADMIN_AUTH --> NIF_CTRL

    TEACHER_AUTH --> AI_CTRL
    TEACHER_AUTH --> ALCOVE_ROUTES

    AUTH_CTRL --> USER_MODELS
    USER_CTRL --> USER_MODELS
    ACADEMIC_CTRL --> ACADEMIC_MODELS
    FEE_CTRL --> FEE_MODELS
    AI_CTRL --> PROGRESS_MODELS
    NIF_CTRL --> NIF_MODELS

    USER_MODELS --> MONGO
    ACADEMIC_MODELS --> MONGO
    FEE_MODELS --> MONGO
    PROGRESS_MODELS --> MONGO
    NIF_MODELS --> MONGO
    SYSTEM_MODELS --> MONGO

    FILE_UPLOAD --> CLOUDINARY
    CLOUDINARY --> CLOUDINARY_CDN
```

## 2. Backend Module Breakdown

### 2.1 Authentication Module

```mermaid
graph TB
    subgraph "Authentication Flow"
        REG_ROUTE[Registration Route]
        LOGIN_ROUTE[Login Route]
        PROFILE_ROUTE[Profile Route]

        VALIDATE[Password Validation]
        HASH[bcrypt Hashing]
        JWT_GEN[JWT Generator]
        JWT_VERIFY[JWT Verifier]

        USER_MODEL[User Model]
    end

    REG_ROUTE --> VALIDATE
    VALIDATE --> HASH
    HASH --> USER_MODEL
    USER_MODEL --> JWT_GEN

    LOGIN_ROUTE --> USER_MODEL
    USER_MODEL --> HASH
    HASH --> JWT_GEN

    PROFILE_ROUTE --> JWT_VERIFY
    JWT_VERIFY --> USER_MODEL
```

**Components:**
- **Routes:** `/routes/adminAuth.js`, `/routes/teacherAuth.js`, `/routes/studentAuth.js`, `/routes/parentAuth.js`
- **Middleware:** `/middleware/adminAuth.js`, `/middleware/authTeacher.js`, etc.
- **Models:** `Admin`, `TeacherUser`, `StudentUser`, `ParentUser`
- **Utils:** `/utils/passwordPolicy.js`

**Responsibilities:**
- User registration with password policy enforcement
- User login with rate limiting
- JWT token generation and verification
- Role-based authentication

### 2.2 Academic Module

```mermaid
graph TB
    subgraph "Academic Management"
        YEAR_ROUTE[Academic Year Routes]
        CLASS_ROUTE[Class Routes]
        SECTION_ROUTE[Section Routes]
        SUBJECT_ROUTE[Subject Routes]
        TIMETABLE_ROUTE[Timetable Routes]

        YEAR_MODEL[AcademicYear Model]
        CLASS_MODEL[Class Model]
        SECTION_MODEL[Section Model]
        SUBJECT_MODEL[Subject Model]
        TIMETABLE_MODEL[Timetable Model]

        VALIDATE_HIERARCHY[Hierarchy Validator]
    end

    YEAR_ROUTE --> YEAR_MODEL
    CLASS_ROUTE --> VALIDATE_HIERARCHY
    VALIDATE_HIERARCHY --> CLASS_MODEL
    SECTION_ROUTE --> VALIDATE_HIERARCHY
    VALIDATE_HIERARCHY --> SECTION_MODEL
    SUBJECT_ROUTE --> SUBJECT_MODEL
    TIMETABLE_ROUTE --> TIMETABLE_MODEL

    YEAR_MODEL -.->|References| CLASS_MODEL
    CLASS_MODEL -.->|References| SECTION_MODEL
    CLASS_MODEL -.->|References| SUBJECT_MODEL
```

**Components:**
- **Routes:** `/routes/academicRoutes.js`
- **Models:** `AcademicYear`, `Class`, `Section`, `Subject`, `Timetable`

**Responsibilities:**
- Academic year configuration
- Class/Section hierarchy management
- Subject assignment
- Timetable scheduling

### 2.3 Fee Management Module

```mermaid
graph TB
    subgraph "Fee Management"
        STRUCTURE_ROUTE[Fee Structure Routes]
        INVOICE_ROUTE[Invoice Routes]
        PAYMENT_ROUTE[Payment Routes]

        STRUCTURE_MODEL[FeeStructure Model]
        INVOICE_MODEL[FeeInvoice Model]
        PAYMENT_MODEL[FeePayment Model]

        FEE_CALCULATOR[Fee Calculator]
        STATUS_UPDATER[Status Updater]
    end

    STRUCTURE_ROUTE --> STRUCTURE_MODEL

    INVOICE_ROUTE --> FEE_CALCULATOR
    FEE_CALCULATOR --> INVOICE_MODEL

    PAYMENT_ROUTE --> STATUS_UPDATER
    STATUS_UPDATER --> INVOICE_MODEL
    STATUS_UPDATER --> PAYMENT_MODEL

    STRUCTURE_MODEL -.->|Template| INVOICE_MODEL
    INVOICE_MODEL -.->|Tracks| PAYMENT_MODEL
```

**Components:**
- **Routes:** `/routes/feeRoutes.js`
- **Models:** `FeeStructure`, `FeeInvoice`, `FeePayment`

**Responsibilities:**
- Fee structure definition
- Invoice generation
- Payment processing
- Status tracking (due/partial/paid)

### 2.4 User Management Module

```mermaid
graph TB
    subgraph "User Management"
        CREATE_ROUTE[Create User Route]
        BULK_ROUTE[Bulk Create Route]
        CSV_ROUTE[CSV Import Route]
        LIST_ROUTE[List Users Route]
        STATS_ROUTE[Stats Route]

        CSV_PARSER[CSV Parser]
        VALIDATOR[User Validator]
        BULK_PROCESSOR[Bulk Processor]

        STUDENT_MODEL[StudentUser Model]
        TEACHER_MODEL[TeacherUser Model]
        PARENT_MODEL[ParentUser Model]
    end

    CREATE_ROUTE --> VALIDATOR
    VALIDATOR --> STUDENT_MODEL
    VALIDATOR --> TEACHER_MODEL
    VALIDATOR --> PARENT_MODEL

    BULK_ROUTE --> BULK_PROCESSOR
    BULK_PROCESSOR --> VALIDATOR

    CSV_ROUTE --> CSV_PARSER
    CSV_PARSER --> BULK_PROCESSOR

    LIST_ROUTE --> STUDENT_MODEL
    LIST_ROUTE --> TEACHER_MODEL
    LIST_ROUTE --> PARENT_MODEL

    STATS_ROUTE --> STUDENT_MODEL
    STATS_ROUTE --> TEACHER_MODEL
    STATS_ROUTE --> PARENT_MODEL
```

**Components:**
- **Routes:** `/routes/adminUserRoutes.js`
- **Models:** `StudentUser`, `TeacherUser`, `ParentUser`
- **Utils:** Custom CSV parser

**Responsibilities:**
- Single user creation
- Bulk user creation
- CSV import with error reporting
- User listing with filters
- Dashboard statistics

### 2.5 AI Learning Module

```mermaid
graph TB
    subgraph "AI Learning System"
        ANALYZE_ROUTE[Analyze Weakness Route]
        GENERATE_ROUTE[Generate Path Route]
        PROGRESS_ROUTE[Update Progress Route]
        WEAK_ROUTE[List Weak Students Route]

        PROGRESS_MODEL[StudentProgress Model]

        ANALYZER[Weakness Analyzer]
        PATH_GENERATOR[Learning Path Generator]
        METRIC_CALCULATOR[Metrics Calculator]
    end

    ANALYZE_ROUTE --> PROGRESS_MODEL
    PROGRESS_MODEL --> ANALYZER
    ANALYZER --> METRIC_CALCULATOR
    METRIC_CALCULATOR --> PROGRESS_MODEL

    GENERATE_ROUTE --> PROGRESS_MODEL
    PROGRESS_MODEL --> PATH_GENERATOR
    PATH_GENERATOR --> PROGRESS_MODEL

    PROGRESS_ROUTE --> PROGRESS_MODEL

    WEAK_ROUTE --> PROGRESS_MODEL
```

**Components:**
- **Routes:** `/routes/aiLearningRoutes.js`
- **Models:** `StudentProgress`, `Assignment`, `Behaviour`

**Responsibilities:**
- Weakness analysis
- Learning path generation
- Progress tracking
- Intervention detection
- Resource recommendation

### 2.6 NIF Module

```mermaid
graph TB
    subgraph "NIF Management"
        STUDENT_ROUTE[NIF Student Routes]
        COURSE_ROUTE[NIF Course Routes]
        FEE_ROUTE[NIF Fee Routes]
        BULK_ROUTE[Bulk Import Routes]
        ARCHIVE_ROUTE[Archive Routes]

        STUDENT_MODEL[NifStudent Model]
        COURSE_MODEL[NifCourse Model]
        FEE_MODEL[NifFees Model]
        RECORD_MODEL[NifFeeRecord Model]
        ARCHIVED_MODEL[NifArchivedStudent Model]

        FEE_CALCULATOR[NIF Fee Calculator]
        ARCHIVER[Student Archiver]
    end

    STUDENT_ROUTE --> STUDENT_MODEL
    COURSE_ROUTE --> COURSE_MODEL

    FEE_ROUTE --> FEE_CALCULATOR
    FEE_CALCULATOR --> FEE_MODEL
    FEE_CALCULATOR --> RECORD_MODEL

    BULK_ROUTE --> COURSE_MODEL
    BULK_ROUTE --> STUDENT_MODEL

    ARCHIVE_ROUTE --> ARCHIVER
    ARCHIVER --> STUDENT_MODEL
    ARCHIVER --> ARCHIVED_MODEL

    COURSE_MODEL -.->|Enrolls| STUDENT_MODEL
    STUDENT_MODEL -.->|Owes| FEE_MODEL
    FEE_MODEL -.->|Tracks| RECORD_MODEL
```

**Components:**
- **Routes:** `/routes/nifRoutes.js`
- **Models:** `NifStudent`, `NifCourse`, `NifFees`, `NifFeeRecord`, `NifArchivedStudent`

**Responsibilities:**
- NIF student management
- Course management (ADV_CERT, B_VOC, M_VOC, B_DES)
- Fee calculation and tracking
- Installment management
- Student archival (graduation)

### 2.7 Notification & Audit Module

```mermaid
graph TB
    subgraph "System Services"
        NOTIF_ROUTE[Notification Routes]
        AUDIT_ROUTE[Audit Routes]

        NOTIF_MODEL[Notification Model]
        AUDIT_MODEL[AuditLog Model]

        AUDIENCE_FILTER[Audience Filter]
        AUDIT_LOGGER[Audit Logger]
    end

    NOTIF_ROUTE --> AUDIENCE_FILTER
    AUDIENCE_FILTER --> NOTIF_MODEL

    AUDIT_ROUTE --> AUDIT_LOGGER
    AUDIT_LOGGER --> AUDIT_MODEL
```

**Components:**
- **Routes:** `/routes/notificationRoutes.js`, `/routes/auditLogRoutes.js`
- **Models:** `Notification`, `AuditLog`

**Responsibilities:**
- Broadcast notifications
- Audience targeting
- Audit log creation
- Compliance tracking

## 3. Frontend Component Architecture

```mermaid
graph TB
    subgraph "Frontend Application"
        subgraph "Entry Layer"
            MAIN[main.jsx]
            APP[App.jsx]
        end

        subgraph "Routing Layer"
            ROUTER[React Router]
            PROTECTED[ProtectedRoute]
        end

        subgraph "Portal Layer"
            STUDENT[Student Portal]
            TEACHER[Teacher Portal]
            PARENT[Parent Portal]
            ADMIN[Admin Portal]
            PRINCIPAL[Principal Portal]
        end

        subgraph "Layout Layer"
            ADMIN_LAYOUT[Admin Layout]
            STUDENT_LAYOUT[Student Layout]
            TEACHER_LAYOUT[Teacher Layout]
            PARENT_LAYOUT[Parent Layout]

            HEADER[Header Component]
            SIDEBAR[Sidebar Component]
            BREADCRUMB[Breadcrumb Component]
        end

        subgraph "Feature Components"
            DASHBOARD[Dashboard Components]
            USER_MGMT[User Management]
            ACADEMIC_MGMT[Academic Management]
            FEE_MGMT[Fee Management]
            ATTENDANCE[Attendance Components]
            REPORTS[Report Components]
            AI_LEARNING[AI Learning Components]
            NIF_COMPONENTS[NIF Components]
        end

        subgraph "Shared Components"
            FORMS[Form Components]
            TABLES[Table Components]
            CHARTS[Chart Components]
            MODALS[Modal Components]
            ALERTS[Alert Components]
        end

        subgraph "Context Layer"
            THEME_CTX[Theme Context]
            AUTH_CTX[Auth Context]
        end

        subgraph "Service Layer"
            API_CLIENT[API Client]
            AUTH_SERVICE[Auth Service]
            STORAGE[Local Storage Service]
        end
    end

    MAIN --> APP
    APP --> ROUTER
    ROUTER --> PROTECTED

    PROTECTED --> STUDENT
    PROTECTED --> TEACHER
    PROTECTED --> PARENT
    PROTECTED --> ADMIN
    PROTECTED --> PRINCIPAL

    STUDENT --> STUDENT_LAYOUT
    TEACHER --> TEACHER_LAYOUT
    PARENT --> PARENT_LAYOUT
    ADMIN --> ADMIN_LAYOUT

    ADMIN_LAYOUT --> HEADER
    ADMIN_LAYOUT --> SIDEBAR
    ADMIN_LAYOUT --> BREADCRUMB

    STUDENT_LAYOUT --> DASHBOARD
    ADMIN_LAYOUT --> USER_MGMT
    ADMIN_LAYOUT --> ACADEMIC_MGMT
    ADMIN_LAYOUT --> FEE_MGMT
    STUDENT_LAYOUT --> ATTENDANCE
    ADMIN_LAYOUT --> REPORTS
    STUDENT_LAYOUT --> AI_LEARNING
    ADMIN_LAYOUT --> NIF_COMPONENTS

    DASHBOARD --> FORMS
    USER_MGMT --> TABLES
    REPORTS --> CHARTS
    FEE_MGMT --> MODALS
    DASHBOARD --> ALERTS

    APP --> THEME_CTX
    APP --> AUTH_CTX

    PROTECTED --> AUTH_SERVICE
    DASHBOARD --> API_CLIENT
    USER_MGMT --> API_CLIENT
    ACADEMIC_MGMT --> API_CLIENT

    AUTH_SERVICE --> STORAGE
    API_CLIENT --> STORAGE
```

## 4. Frontend Module Breakdown

### 4.1 Authentication Module

```mermaid
graph TB
    subgraph "Auth Components"
        LOGIN[LoginForm.jsx]
        SIGNUP[SignupForm.jsx]
        PROTECTED[ProtectedRoute.jsx]

        AUTH_SVC[Auth Service]
        STORAGE[LocalStorage]
        API[API Client]
    end

    LOGIN --> AUTH_SVC
    SIGNUP --> AUTH_SVC
    AUTH_SVC --> API
    API --> STORAGE
    PROTECTED --> STORAGE
```

**Components:**
- `LoginForm.jsx` - Multi-role login
- `SignupForm.jsx` - User registration
- `ProtectedRoute.jsx` - Route guard

**Responsibilities:**
- User login/logout
- Token management
- Role-based routing
- Session persistence

### 4.2 Student Portal Module

```mermaid
graph TB
    subgraph "Student Portal"
        DASHBOARD[Dashboard.jsx]
        ACADEMICS[Academics.jsx]
        ASSIGNMENTS[Assignments.jsx]
        ATTENDANCE[Attendance.jsx]
        AI_LEARNING[AILearning.jsx]
        ALCOVE[Alcove.jsx]
        RESULTS[Results.jsx]
        PROFILE[Profile.jsx]
        WELLNESS[Wellness.jsx]
        GAMES[Games.jsx]
    end

    DASHBOARD --> API_CLIENT[API Client]
    ACADEMICS --> API_CLIENT
    ASSIGNMENTS --> API_CLIENT
    ATTENDANCE --> API_CLIENT
    AI_LEARNING --> API_CLIENT
    ALCOVE --> API_CLIENT
    RESULTS --> API_CLIENT
    PROFILE --> API_CLIENT
```

**Key Features:**
- Personal dashboard with stats
- Academic progress tracking
- Assignment submission
- Attendance marking
- AI-powered learning paths
- Academic collaboration (Alcove)
- Wellness tracking
- Educational games

### 4.3 Admin Portal Module

```mermaid
graph TB
    subgraph "Admin Portal"
        ADMIN_DASH[Dashboard.jsx]
        USERS[User Management]
        ACADEMIC[Academic Setup]
        FEES[Fee Management]
        ATTENDANCE_MGMT[Attendance Management]
        REPORTS[Reports & Analytics]
        TIMETABLE[Timetable Management]
        NOTIFICATIONS[Notifications]
        NIF[NIF Management]
    end

    subgraph "User Management"
        STUDENTS[Students.jsx]
        TEACHERS[Teachers.jsx]
        PARENTS[Parents.jsx]
        STAFF[Staff.jsx]
        BULK_UPLOAD[BulkUpload.jsx]
    end

    subgraph "Academic Setup"
        YEARS[AcademicYears.jsx]
        CLASSES[Classes.jsx]
        SECTIONS[Sections.jsx]
        SUBJECTS[Subjects.jsx]
    end

    subgraph "Fee Management"
        FEE_DASH[FeeDashboard.jsx]
        FEE_STRUCTURE[FeeStructure.jsx]
        FEE_COLLECTION[FeeCollection.jsx]
        FEE_REPORTS[FeeReports.jsx]
    end

    ADMIN_DASH --> API_CLIENT[API Client]
    USERS --> STUDENTS
    USERS --> TEACHERS
    USERS --> PARENTS
    USERS --> BULK_UPLOAD

    STUDENTS --> API_CLIENT
    TEACHERS --> API_CLIENT
    BULK_UPLOAD --> API_CLIENT

    ACADEMIC --> YEARS
    ACADEMIC --> CLASSES
    ACADEMIC --> SECTIONS

    YEARS --> API_CLIENT
    CLASSES --> API_CLIENT

    FEES --> FEE_DASH
    FEES --> FEE_STRUCTURE
    FEES --> FEE_COLLECTION

    FEE_DASH --> API_CLIENT
    FEE_STRUCTURE --> API_CLIENT
```

**Key Features:**
- Comprehensive dashboard
- User management (CRUD + bulk import)
- Academic configuration
- Fee management
- Attendance monitoring
- Report generation
- Timetable creation
- Notification broadcasting
- NIF-specific management

### 4.4 Teacher Portal Module

```mermaid
graph TB
    subgraph "Teacher Portal"
        TEACHER_DASH[Dashboard.jsx]
        ASSIGNMENTS_MGT[Assignment Management]
        ATTENDANCE_MARK[Attendance Marking]
        PROGRESS_TRACK[Student Progress]
        AI_TEACH[AI Teaching Tools]
        ALCOVE_TEACH[Teacher Alcove]
        LESSON_PLAN[Lesson Planning]
        PARENT_MEET[Parent Meetings]
    end

    TEACHER_DASH --> API_CLIENT[API Client]
    ASSIGNMENTS_MGT --> API_CLIENT
    ATTENDANCE_MARK --> API_CLIENT
    PROGRESS_TRACK --> API_CLIENT
    AI_TEACH --> API_CLIENT
    ALCOVE_TEACH --> API_CLIENT
    LESSON_PLAN --> API_CLIENT
```

**Key Features:**
- Teacher dashboard
- Assignment creation & evaluation
- Attendance marking
- Student progress tracking
- AI-powered teaching recommendations
- Academic collaboration (Alcove)
- Lesson plan management
- Parent communication

### 4.5 Parent Portal Module

```mermaid
graph TB
    subgraph "Parent Portal"
        PARENT_DASH[Dashboard.jsx]
        CHILDREN[Children Overview]
        ATTENDANCE_VIEW[Attendance View]
        RESULTS_VIEW[Results View]
        FEE_PAY[Fee Payment]
        COMMUNICATION[Communication]
        HEALTH[Health Reports]
    end

    PARENT_DASH --> API_CLIENT[API Client]
    CHILDREN --> API_CLIENT
    ATTENDANCE_VIEW --> API_CLIENT
    RESULTS_VIEW --> API_CLIENT
    FEE_PAY --> API_CLIENT
    COMMUNICATION --> API_CLIENT
```

**Key Features:**
- Parent dashboard
- Multiple children tracking
- Attendance monitoring
- Academic performance view
- Fee payment
- Teacher communication
- Health reports

### 4.6 Shared Component Library

```mermaid
graph TB
    subgraph "Shared Components"
        subgraph "Form Components"
            INPUT[Input]
            SELECT[Select]
            TEXTAREA[TextArea]
            CHECKBOX[Checkbox]
            FILE_UPLOAD[FileUpload]
        end

        subgraph "Data Display"
            TABLE[DataTable]
            CARD[Card]
            STATS[StatCard]
            LIST[List]
        end

        subgraph "Charts"
            LINE[LineChart]
            BAR[BarChart]
            PIE[PieChart]
            DONUT[DonutChart]
        end

        subgraph "Feedback"
            TOAST[Toast]
            ALERT[Alert]
            MODAL[Modal]
            CONFIRM[Confirm Dialog]
        end

        subgraph "Navigation"
            TABS[Tabs]
            BREADCRUMB_C[Breadcrumb]
            PAGINATION[Pagination]
        end
    end
```

**Component Library:**
- Form controls with validation
- Data tables with sorting/filtering
- Chart components (Chart.js + Recharts)
- Notification system (toast/alert)
- Modal dialogs
- Navigation components

## 5. State Management Architecture

```mermaid
graph TB
    subgraph "State Management"
        subgraph "Global State"
            THEME[Theme Context]
            AUTH[Auth State]
        end

        subgraph "Component State"
            LOCAL[useState Hooks]
            FORM[Form State]
        end

        subgraph "Server State"
            API_CACHE[API Response Cache]
            OPTIMISTIC[Optimistic Updates]
        end

        subgraph "Persistent State"
            LOCALSTORAGE[LocalStorage]
            SESSION[SessionStorage]
        end
    end

    THEME --> LOCALSTORAGE
    AUTH --> LOCALSTORAGE
    LOCAL --> FORM
    API_CACHE --> OPTIMISTIC
```

**State Strategy:**
- **Global State:** Context API for theme and auth
- **Component State:** useState hooks for local state
- **Server State:** Direct API calls, no global cache (future: React Query)
- **Persistent State:** LocalStorage for token, userType, theme

## 6. API Client Architecture

```mermaid
graph TB
    subgraph "API Client"
        FETCH[Fetch API]
        AXIOS[Axios]

        subgraph "Interceptors"
            AUTH_INT[Auth Interceptor]
            ERROR_INT[Error Interceptor]
        end

        subgraph "API Modules"
            AUTH_API[Auth API]
            USER_API[User API]
            ACADEMIC_API[Academic API]
            FEE_API[Fee API]
            AI_API[AI API]
            NIF_API[NIF API]
        end
    end

    FETCH --> AUTH_INT
    AXIOS --> AUTH_INT
    AUTH_INT --> ERROR_INT

    ERROR_INT --> AUTH_API
    ERROR_INT --> USER_API
    ERROR_INT --> ACADEMIC_API
    ERROR_INT --> FEE_API
    ERROR_INT --> AI_API
    ERROR_INT --> NIF_API
```

**API Client Pattern:**
```javascript
// Common pattern used
const response = await fetch(`${API_URL}/api/endpoint`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify(data)
});

const result = await response.json();

if (!response.ok) {
  toast.error(result.error || 'Operation failed');
  return;
}

toast.success('Operation successful');
```

## 7. File Upload Architecture

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Multer
    participant Backend
    participant Cloudinary
    participant CDN

    User->>Frontend: Select File
    Frontend->>Frontend: Validate (size, type)
    Frontend->>Backend: POST /api/uploads (multipart/form-data)
    Backend->>Multer: Process file upload
    Multer->>Multer: Store in memory buffer
    Multer->>Backend: Pass buffer to handler
    Backend->>Cloudinary: Upload buffer stream
    Cloudinary->>CDN: Store file
    CDN->>Cloudinary: Return URL
    Cloudinary->>Backend: Return URL
    Backend->>Frontend: Return { url }
    Frontend->>User: Display uploaded file
```

**Components:**
- **Frontend:** File input, preview
- **Backend:** Multer middleware (memory storage)
- **Utility:** `uploadBufferToCloudinary` (stream-based)
- **Storage:** Cloudinary CDN

## 8. Component Communication Patterns

### Pattern 1: Parent-Child Props

```jsx
// Parent
<StudentTable students={students} onEdit={handleEdit} />

// Child
function StudentTable({ students, onEdit }) {
  return (
    <table>
      {students.map(s => (
        <tr key={s._id}>
          <td>{s.name}</td>
          <td><button onClick={() => onEdit(s)}>Edit</button></td>
        </tr>
      ))}
    </table>
  );
}
```

### Pattern 2: Context API

```jsx
// Context Provider
<ThemeContext.Provider value={{ theme, setTheme }}>
  <App />
</ThemeContext.Provider>

// Consumer
const { theme } = useContext(ThemeContext);
```

### Pattern 3: Event Emitter (Custom Events)

```jsx
// Emit
window.dispatchEvent(new CustomEvent('userUpdated', { detail: user }));

// Listen
useEffect(() => {
  const handler = (e) => console.log(e.detail);
  window.addEventListener('userUpdated', handler);
  return () => window.removeEventListener('userUpdated', handler);
}, []);
```

## 9. Error Handling Architecture

```mermaid
graph TB
    subgraph "Error Handling"
        ERROR[Error Occurs]

        subgraph "Frontend Error Handling"
            TRY_CATCH[Try-Catch Block]
            ERROR_BOUNDARY[Error Boundary]
            TOAST_ERROR[Toast Notification]
            FALLBACK[Fallback UI]
        end

        subgraph "Backend Error Handling"
            VALIDATION[Validation Error]
            DB_ERROR[Database Error]
            AUTH_ERROR[Auth Error]
            ERROR_MIDDLEWARE[Error Middleware]
            LOG[Error Logger]
        end
    end

    ERROR --> TRY_CATCH
    ERROR --> ERROR_BOUNDARY
    TRY_CATCH --> TOAST_ERROR
    ERROR_BOUNDARY --> FALLBACK

    ERROR --> VALIDATION
    ERROR --> DB_ERROR
    ERROR --> AUTH_ERROR
    VALIDATION --> ERROR_MIDDLEWARE
    DB_ERROR --> ERROR_MIDDLEWARE
    AUTH_ERROR --> ERROR_MIDDLEWARE
    ERROR_MIDDLEWARE --> LOG
```

**Error Handling Strategy:**
- **Frontend:** Try-catch + toast notifications
- **Backend:** Centralized error middleware
- **Validation:** Schema validation + custom validators
- **Logging:** Console logs (future: structured logging)

## 10. Component Lifecycle

```mermaid
graph LR
    MOUNT[Component Mount] --> FETCH[Fetch Data]
    FETCH --> RENDER[Render UI]
    RENDER --> INTERACT[User Interaction]
    INTERACT --> UPDATE[Update State]
    UPDATE --> RE_RENDER[Re-render]
    RE_RENDER --> INTERACT
    INTERACT --> UNMOUNT[Component Unmount]
    UNMOUNT --> CLEANUP[Cleanup Effects]
```

**Lifecycle Pattern:**
```jsx
function Component() {
  const [data, setData] = useState([]);

  // Mount: Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  // Interaction: Handle events
  const handleAction = async () => {
    await apiCall();
    fetchData(); // Re-fetch
  };

  // Unmount: Cleanup
  useEffect(() => {
    return () => {
      // Cleanup
    };
  }, []);

  return <UI data={data} onAction={handleAction} />;
}
```

---

**Document Version:** 1.0
**Last Updated:** 2026-01-12
**Author:** Component Architecture Team
