# Detailed Backend API File Map - School Admin URLs

## URL: http://localhost:5173/admin/dashboard
1. Entry server + route mounts
backend/index.js
Mounted APIs used by this page:
- /api/admin/users -> backend/routes/adminUserManagement.js
- /api/fees -> backend/routes/feeRoutes.js
- /api/audit-logs -> backend/routes/auditLogRoutes.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/adminUserManagement.js
backend/routes/feeRoutes.js
backend/routes/auditLogRoutes.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/Admin.js
backend/models/StudentUser.js
backend/models/TeacherUser.js
backend/models/FeeInvoice.js
backend/models/FeePayment.js
backend/models/AuditLog.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js
backend/scripts/productionSecurityAttackSuite.js

Endpoints directly connected:
- GET /api/admin/users/dashboard-stats
- GET /api/fees/invoices
- GET /api/fees/payments
- GET /api/audit-logs

---

## URL: http://localhost:5173/admin/analytics
1. Entry server + route mounts
backend/index.js
Mounted APIs used by this page:
- /api/academic -> backend/routes/academicRoutes.js
- /api/progress -> backend/routes/progressRoute.js
- /api/reports -> backend/routes/reportRoutes.js
- /api/fees -> backend/routes/feeRoutes.js
- /api/audit-logs -> backend/routes/auditLogRoutes.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/academicRoutes.js
backend/routes/progressRoute.js
backend/routes/reportRoutes.js
backend/routes/feeRoutes.js
backend/routes/auditLogRoutes.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/AcademicYear.js
backend/models/Class.js
backend/models/Section.js
backend/models/StudentProgress.js
backend/models/FeeInvoice.js
backend/models/AuditLog.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js
backend/scripts/productionSecurityAttackSuite.js

Endpoints directly connected:
- GET /api/academic/years
- GET /api/academic/classes
- GET /api/academic/sections
- GET /api/progress/analytics
- GET /api/reports/summary
- GET /api/fees/invoices
- GET /api/audit-logs

---

## URL: http://localhost:5173/admin/teachers
1. Entry server + route mounts
backend/index.js
Mounted APIs used by this page:
- /api/admin/users -> backend/routes/adminUserManagement.js
- /api/teacher/auth -> backend/routes/teacherRoute.js
- /api/timetable -> backend/routes/timetableRoutes.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/adminUserManagement.js
backend/routes/teacherRoute.js
backend/routes/timetableRoutes.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/TeacherUser.js
backend/models/Principal.js
backend/models/TeacherAttendance.js
backend/models/TeacherLeave.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js
backend/scripts/productionSecurityAttackSuite.js

Endpoints directly connected:
- GET /api/admin/users/get-teachers
- GET /api/admin/users/get-principals
- GET /api/admin/users/teacher-attendance
- GET /api/admin/users/teacher-leaves
- GET /api/timetable/all
- POST /api/teacher/auth/register
- PUT /api/admin/users/teachers/:id
- DELETE /api/admin/users/teachers/:id
- GET /api/admin/users/teachers/:id/credentials
- POST /api/admin/users/teachers/:id/credentials
- POST /api/admin/users/teachers/:id/make-principal
- POST /api/admin/users/bulk-create-users

---

## URL: http://localhost:5173/admin/students
1. Entry server + route mounts
backend/index.js
Mounted APIs used by this page:
- /api/admin/users -> backend/routes/adminUserManagement.js
- /api/student/auth -> backend/routes/studentRoute.js
- /api/academic -> backend/routes/academicRoutes.js
- /api/attendance -> backend/routes/attendanceRoutes.js
- /api/fees -> backend/routes/feeRoutes.js
- /api/nif -> backend/routes/nifStudentRoutes.js
- /api/admin/auth -> backend/routes/adminRoutes.js
- /api/schools -> backend/routes/schoolRoutes.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/adminUserManagement.js
backend/routes/studentRoute.js
backend/routes/academicRoutes.js
backend/routes/attendanceRoutes.js
backend/routes/feeRoutes.js
backend/routes/nifStudentRoutes.js
backend/routes/adminRoutes.js
backend/routes/schoolRoutes.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/StudentUser.js
backend/models/ParentUser.js
backend/models/Class.js
backend/models/Section.js
backend/models/AcademicYear.js
backend/models/FeeInvoice.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js
backend/scripts/productionSecurityAttackSuite.js

Endpoints directly connected:
- GET /api/admin/users/get-students
- GET /api/admin/users/get-parents
- PUT /api/admin/users/students/:id
- DELETE /api/admin/users/students/:id
- POST /api/student/auth/register
- GET /api/academic/years
- GET /api/academic/classes
- GET /api/academic/sections
- GET /api/attendance/admin/students
- GET /api/fees/invoices
- GET /api/nif/students/archived
- PUT /api/nif/students/:id/archive
- PATCH /api/nif/students/:id/unarchive
- POST /api/nif/students/bulk
- POST /api/admin/auth/profile
- GET /api/schools

---

## URL: http://localhost:5173/admin/attendance
1. Entry server + route mounts
backend/index.js
Mounted API used by this page:
- /api/attendance -> backend/routes/attendanceRoutes.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/attendanceRoutes.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/StudentUser.js
backend/models/ParentUser.js
backend/models/Timetable.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET /api/attendance/admin/students
- POST /api/attendance/admin/bulk-upsert

---

## URL: http://localhost:5173/admin/parents
1. Entry server + route mounts
backend/index.js
Mounted API used by this page:
- /api/admin/users -> backend/routes/adminUserManagement.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/adminUserManagement.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/ParentUser.js
backend/models/StudentUser.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET /api/admin/users/get-parents
- PUT /api/admin/users/parents/:id
- DELETE /api/admin/users/parents/:id
- PUT /api/admin/users/students/:id

---

## URL: http://localhost:5173/admin/academics
1. Entry server + route mounts
backend/index.js
Mounted APIs used by this page:
- /api/academic -> backend/routes/academicRoutes.js
- /api/teacher-allocations -> backend/routes/teacherAllocationRoutes.js
- /api/admin/users -> backend/routes/adminUserManagement.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/academicRoutes.js
backend/routes/teacherAllocationRoutes.js
backend/routes/adminUserManagement.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/AcademicYear.js
backend/models/Class.js
backend/models/Section.js
backend/models/Subject.js
backend/models/TeacherAllocation.js
backend/models/TeacherUser.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET /api/academic/hierarchy
- GET/POST/PUT/DELETE /api/academic/years
- GET/POST/PUT/DELETE /api/academic/classes
- GET/POST/PUT/DELETE /api/academic/sections
- GET/POST/PUT/DELETE /api/academic/subjects
- GET /api/admin/users/get-teachers
- GET/POST/PUT/DELETE /api/teacher-allocations

---

## URL: http://localhost:5173/admin/examination
1. Entry server + route mounts
backend/index.js
Mounted APIs used by this page:
- /api/exam -> backend/routes/examRoute.js
- /api/academic -> backend/routes/academicRoutes.js
- /api/admin/users -> backend/routes/adminUserManagement.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/examRoute.js
backend/routes/academicRoutes.js
backend/routes/adminUserManagement.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/Exam.js
backend/models/ExamGroup.js
backend/models/ExamResult.js
backend/models/Subject.js
backend/models/TeacherUser.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET/POST/PUT/DELETE /api/exam/groups
- GET /api/exam/fetch
- POST /api/exam/add
- PUT/DELETE /api/exam/:id
- GET /api/academic/classes
- GET /api/academic/sections
- GET /api/academic/subjects
- GET /api/academic/buildings
- GET /api/academic/floors
- GET /api/academic/rooms
- GET /api/admin/users/get-teachers

---

## URL: http://localhost:5173/admin/result
1. Entry server + route mounts
backend/index.js
Mounted APIs used by this page:
- /api/exam -> backend/routes/examRoute.js
- /api/admin/users -> backend/routes/adminUserManagement.js
- /api/academic -> backend/routes/academicRoutes.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/examRoute.js
backend/routes/adminUserManagement.js
backend/routes/academicRoutes.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/ExamResult.js
backend/models/Exam.js
backend/models/ExamGroup.js
backend/models/StudentUser.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET /api/exam/results/admin
- POST /api/exam/results
- PUT /api/exam/results/:id
- DELETE /api/exam/results/:id
- PUT /api/exam/results/:id/publish
- PUT /api/exam/results/bulk-publish
- POST /api/exam/results/bulk-upload
- GET /api/exam/fetch
- GET /api/exam/groups
- GET /api/admin/users/get-students
- GET /api/academic/classes
- GET /api/academic/sections

---

## URL: http://localhost:5173/admin/report-cards
1. Entry server + route mounts
backend/index.js
Mounted APIs used by this page:
- /api/reports -> backend/routes/reportRoutes.js
- /api/academic -> backend/routes/academicRoutes.js
- /api/exam -> backend/routes/examRoute.js
- /api/uploads -> backend/routes/uploadRoutes.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/reportRoutes.js
backend/routes/academicRoutes.js
backend/routes/examRoute.js
backend/routes/uploadRoutes.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/ReportCardTemplate.js
backend/models/ExamResult.js
backend/models/ExamGroup.js
backend/models/Class.js
backend/models/Section.js
backend/models/AcademicYear.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET/PUT /api/reports/report-cards/template
- GET /api/reports/report-cards/signatories
- POST /api/reports/report-cards/bulk
- GET /api/academic/classes
- GET /api/academic/sections
- GET /api/academic/years
- GET /api/exam/groups
- POST /api/uploads/cloudinary/single

---

## URL: http://localhost:5173/admin/fees/collection (and /admin/fees)
1. Entry server + route mounts
backend/index.js
Mounted APIs used by this page:
- /api/fees -> backend/routes/feeRoutes.js
- /api/admin/users -> backend/routes/adminUserManagement.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/feeRoutes.js
backend/routes/adminUserManagement.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/FeeStructure.js
backend/models/FeeInvoice.js
backend/models/FeePayment.js
backend/models/StudentUser.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET /api/fees/admin/filters
- GET /api/fees/admin/invoices
- POST /api/fees/admin/invoices/bulk
- GET /api/admin/users/get-students
- GET /api/fees/structures
- POST /api/fees/invoices
- POST /api/fees/admin/razorpay/order
- POST /api/fees/admin/razorpay/verify

---

## URL: http://localhost:5173/admin/fees/manage
1. Entry server + route mounts
backend/index.js
Mounted API used by this page:
- /api/fees -> backend/routes/feeRoutes.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/feeRoutes.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/FeeStructure.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET /api/fees/admin/filters
- GET /api/fees/structures
- POST /api/fees/structures
- PUT /api/fees/structures/:id
- DELETE /api/fees/structures/:id

---

## URL: http://localhost:5173/admin/fees/dashboard
1. Entry server + route mounts
backend/index.js
Mounted API used by this page:
- /api/fees -> backend/routes/feeRoutes.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/feeRoutes.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/FeeInvoice.js
backend/models/FeePayment.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET /api/fees/admin/summary

---

## URL: http://localhost:5173/admin/hr
1. Entry server + route mounts
backend/index.js
Mounted API used by this page:
- /api/admin/users -> backend/routes/adminUserManagement.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/adminUserManagement.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/TeacherLeave.js
backend/models/TeacherExpense.js
backend/models/TeacherAttendance.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET /api/admin/users/teacher-leaves
- PATCH /api/admin/users/teacher-leaves/:id/status
- GET /api/admin/users/teacher-expenses
- PATCH /api/admin/users/teacher-expenses/:id/status
- GET /api/admin/users/teacher-attendance
- GET/PUT /api/admin/users/teacher-attendance-settings
- GET/PUT /api/admin/users/teacher-leave-policy

---

## URL: http://localhost:5173/admin/support
1. Entry server + route mounts
backend/index.js
Mounted APIs used by this page:
- /api/support -> backend/routes/supportRoutes.js
- /api/admin/users -> backend/routes/adminUserManagement.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/supportRoutes.js
backend/routes/adminUserManagement.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/SupportRequest.js
backend/models/SupportSetting.js
backend/models/Admin.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/productionSecurityAttackSuite.js
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET /api/support/requests
- POST /api/support/requests
- GET /api/support/settings
- GET /api/admin/users/password-reset/users
- POST /api/admin/users/password-reset/reset

---

## URL: http://localhost:5173/admin/notices
1. Entry server + route mounts
backend/index.js
Mounted APIs used by this page:
- /api/notifications -> backend/routes/notificationRoutes.js
- /api/academic -> backend/routes/academicRoutes.js
- /api/uploads -> backend/routes/uploadRoutes.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/notificationRoutes.js
backend/routes/academicRoutes.js
backend/routes/uploadRoutes.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/Notification.js
backend/models/Class.js
backend/models/Section.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET /api/academic/classes
- GET /api/academic/sections
- GET/POST /api/notifications
- DELETE /api/notifications/:id
- POST /api/uploads/cloudinary/single

---

## URL: http://localhost:5173/admin/holidays
1. Entry server + route mounts
backend/index.js
Mounted API used by this page:
- /api/holidays -> backend/routes/holidayRoutes.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/holidayRoutes.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/Holiday.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET /api/holidays/admin
- POST /api/holidays
- PUT /api/holidays/:id
- DELETE /api/holidays/:id

---

## URL: http://localhost:5173/admin/settings
1. Entry server + route mounts
backend/index.js
Mounted APIs used by this page:
- /api/admin/auth -> backend/routes/adminRoutes.js
- /api/uploads -> backend/routes/uploadRoutes.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/adminRoutes.js
backend/routes/uploadRoutes.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/Admin.js
backend/models/School.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET /api/admin/auth/settings
- PUT /api/admin/auth/settings
- POST /api/uploads/cloudinary/single

---

## URL: http://localhost:5173/admin/wellbeing
1. Entry server + route mounts
backend/index.js
Expected API used by this page:
- /api/wellbeing -> backend/routes/wellbeingRoute.js
Actual current mount status:
- backend/routes/wellbeingRoute.js exists, but /api/wellbeing is not mounted in backend/index.js.

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/wellbeingRoute.js
backend/routes/adminUserManagement.js (student list)

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/StudentUser.js
backend/models/Wellbeing.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET /api/admin/users/get-students
- GET /api/wellbeing/:studentId
- PUT /api/wellbeing/:studentId

---

## URL: http://localhost:5173/admin/promotion
1. Entry server + route mounts
backend/index.js
Mounted APIs used by this page:
- /api/promotion -> backend/routes/promotionRoutes.js
- /api/academic -> backend/routes/academicRoutes.js
- /api/admin/users -> backend/routes/adminUserManagement.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/promotionRoutes.js
backend/routes/academicRoutes.js
backend/routes/adminUserManagement.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/PromotionHistory.js
backend/models/StudentUser.js
backend/models/Class.js
backend/models/Section.js
backend/models/AcademicYear.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET /api/academic/classes
- GET /api/academic/years
- GET /api/academic/sections
- GET /api/admin/users/get-students
- POST /api/promotion/preview
- POST /api/promotion/preview-marks
- POST /api/promotion/execute
- GET /api/promotion/history
- GET /api/promotion/leaving-students
- POST /api/promotion/mark-leaving
- PUT /api/promotion/restore-student/:id
- PUT /api/promotion/mark-left/:id

---

## URL: http://localhost:5173/admin/routine
1. Entry server + route mounts
backend/index.js
Mounted APIs used by this page:
- /api/timetable -> backend/routes/timetableRoutes.js
- /api/academic -> backend/routes/academicRoutes.js
- /api/teacher-allocations -> backend/routes/teacherAllocationRoutes.js
- /api/admin/users -> backend/routes/adminUserManagement.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/timetableRoutes.js
backend/routes/academicRoutes.js
backend/routes/teacherAllocationRoutes.js
backend/routes/adminUserManagement.js
frontend/src/admin/utils/timetableApi.js (frontend API wrapper used by routine pages)

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/Timetable.js
backend/models/TeacherAllocation.js
backend/models/Subject.js
backend/models/TeacherUser.js
backend/models/Class.js
backend/models/Section.js
backend/models/Floor.js
backend/models/Room.js
backend/models/Building.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET /api/timetable/all
- GET /api/timetable
- POST /api/timetable
- POST /api/timetable/day
- DELETE /api/timetable/day
- DELETE /api/timetable/:id
- POST /api/timetable/validate-conflicts
- POST /api/timetable/auto-generate
- GET /api/timetable/teacher/:teacherId
- GET /api/academic/classes
- GET /api/academic/sections
- GET /api/academic/subjects
- GET /api/academic/buildings
- GET /api/academic/floors
- GET /api/academic/rooms
- GET /api/admin/users/get-teachers
- GET /api/teacher-allocations
- POST /api/teacher-allocations
- PUT /api/teacher-allocations/:id
- DELETE /api/teacher-allocations/:id

---

## URL: http://localhost:5173/admin/routines
1. Entry server + route mounts
backend/index.js
Mounted APIs used by this page:
- /api/timetable -> backend/routes/timetableRoutes.js
- /api/academic -> backend/routes/academicRoutes.js
- /api/teacher-allocations -> backend/routes/teacherAllocationRoutes.js
- /api/admin/users -> backend/routes/adminUserManagement.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/timetableRoutes.js
backend/routes/academicRoutes.js
backend/routes/teacherAllocationRoutes.js
backend/routes/adminUserManagement.js
frontend/src/admin/utils/timetableApi.js (frontend API wrapper used by routine pages)

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/Timetable.js
backend/models/TeacherAllocation.js
backend/models/Subject.js
backend/models/TeacherUser.js
backend/models/Class.js
backend/models/Section.js
backend/models/Floor.js
backend/models/Room.js
backend/models/Building.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- same backend endpoint family as `/admin/routine`

---

## URL: http://localhost:5173/admin/floor-rooms
1. Entry server + route mounts
backend/index.js
Mounted APIs used by this page:
- /api/academic -> backend/routes/academicRoutes.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/academicRoutes.js
frontend/src/admin/utils/timetableApi.js (frontend API wrapper used by this page)

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/Building.js
backend/models/Floor.js
backend/models/Room.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET /api/academic/buildings
- POST /api/academic/buildings
- DELETE /api/academic/buildings/:id
- GET /api/academic/floors
- POST /api/academic/floors
- PUT /api/academic/floors/:id
- DELETE /api/academic/floors/:id
- GET /api/academic/rooms
- POST /api/academic/rooms
- PUT /api/academic/rooms/:id
- DELETE /api/academic/rooms/:id

---

## URL: http://localhost:5173/admin/timetable
1. Entry server + route mounts
backend/index.js
Mounted APIs used by this page:
- /api/admin/auth -> backend/routes/adminRoutes.js
- /api/schools -> backend/routes/schoolRoutes.js
- /api/timetable -> backend/routes/timetableRoutes.js
- /api/academic -> backend/routes/academicRoutes.js
- /api/admin/users -> backend/routes/adminUserManagement.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/adminRoutes.js
backend/routes/schoolRoutes.js
backend/routes/timetableRoutes.js
backend/routes/academicRoutes.js
backend/routes/adminUserManagement.js
frontend/src/admin/utils/timetableApi.js (frontend API wrapper used by this page)

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/Admin.js
backend/models/School.js
backend/models/Timetable.js
backend/models/TeacherUser.js
backend/models/Class.js
backend/models/Section.js
backend/models/Subject.js
backend/models/Building.js
backend/models/Floor.js
backend/models/Room.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- POST /api/admin/auth/profile
- GET /api/schools
- GET /api/timetable/all
- GET /api/timetable
- POST /api/timetable
- POST /api/timetable/day
- DELETE /api/timetable/day
- DELETE /api/timetable/:id
- POST /api/timetable/validate-conflicts
- POST /api/timetable/auto-generate
- GET /api/timetable/teacher/:teacherId
- GET /api/academic/classes
- GET /api/academic/sections
- GET /api/academic/subjects
- GET /api/academic/buildings
- GET /api/academic/floors
- GET /api/academic/rooms
- GET /api/admin/users/get-teachers

---

## URL: http://localhost:5173/admin/lesson-plans
1. Entry server + route mounts
backend/index.js
Mounted API used by this page:
- /api/lesson-plans -> backend/routes/lessonPlanRoutes.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/lessonPlanRoutes.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/LessonPlan.js
backend/models/LessonPlanCompletion.js
backend/models/TeacherAllocation.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET /api/lesson-plans/admin
- GET /api/lesson-plans/admin/options
- POST /api/lesson-plans/admin
- PUT /api/lesson-plans/admin/:id
- DELETE /api/lesson-plans/admin/:id

---

## URL: http://localhost:5173/admin/fees/student-details
1. Entry server + route mounts
backend/index.js
Mounted API used by this page:
- /api/fees -> backend/routes/feeRoutes.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/feeRoutes.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/FeeInvoice.js
backend/models/FeePayment.js
backend/models/FeeStructure.js
backend/models/StudentUser.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET /api/fees/admin/invoices/:id
- GET /api/fees/payments
- POST /api/fees/admin/razorpay/order
- POST /api/fees/admin/razorpay/verify
- POST /api/fees/admin/discount
- GET /api/fees/payments/:paymentId/receipt

---

## URL: http://localhost:5173/admin/staff
1. Entry server + route mounts
backend/index.js
Mounted APIs used by this page:
- /api/admin/users -> backend/routes/adminUserManagement.js
- /api/staff/auth -> backend/routes/staffRoutes.js

2. Auth + access control middleware
backend/middleware/adminAuth.js

3. Route endpoint handlers used by this page
backend/routes/adminUserManagement.js
backend/routes/staffRoutes.js

4. Global request correlation/logging
backend/middleware/requestLogger.js

5. Structured logger implementation (Pino)
backend/utils/logger.js

6. Database models used by these APIs
backend/models/StaffUser.js
backend/models/Admin.js

7. API docs mapping (reference)
backend/swagger.js (expected by script, currently not present)
backend/swagger-output.json (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
backend/scripts/validateRuntimeLogs.js

Endpoints directly connected:
- GET /api/admin/users/get-staff
- POST /api/staff/auth/register
- PUT /api/admin/users/staff/:id
- DELETE /api/admin/users/staff/:id
- POST /api/admin/users/staff/:id/credentials

Notes:
- Super-admin-only URLs excluded from school-admin map: /admin/schools, /admin/school-admins, /admin/school-registrations.
- Endpoint mapping is based on current frontend calls in frontend/src/admin/* and backend mounts in backend/index.js.
