# Detailed Backend API File Map - Teacher Portal URLs

Teacher portal base URLs:
- `http://localhost:5173/teacher/*`
- (`/teachers/*` is redirected to `/teacher/*` by frontend logic)

Core route host files:
- `frontend/src/App.jsx`
- `frontend/src/teachers/TeacherPortal.jsx`

---

## URL: http://localhost:5173/teacher/dashboard
1. Entry server + route mounts
`backend/index.js`
Mounted APIs used by this page:
- `/api/teacher/dashboard` -> `backend/routes/teacherDashboardRoutes.js`

2. Auth + access control middleware
`backend/middleware/authTeacher.js`

3. Route endpoint handlers used by this page
`backend/routes/teacherDashboardRoutes.js`

4. Global request correlation/logging
`backend/middleware/requestLogger.js`

5. Structured logger implementation (Pino)
`backend/utils/logger.js`

6. Database models used by these APIs
`backend/models/TeacherUser.js`
`backend/models/TeacherAllocation.js`
`backend/models/StudentUser.js`
`backend/models/Timetable.js`

7. API docs mapping (reference)
`backend/swagger.js` (expected by script, currently not present)
`backend/swagger-output.json` (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
`backend/scripts/validateRuntimeLogs.js`
`backend/scripts/productionSecurityAttackSuite.js`

Endpoints directly connected:
- `GET /api/teacher/dashboard`
- `GET /api/teacher/dashboard/allocations`

Frontend file:
- `frontend/src/teachers/TeacherDashboard.jsx`

---

## URL: http://localhost:5173/teacher/my-work-portal
1. Entry server + route mounts
`backend/index.js`
Mounted APIs used by this page:
- `/api/teacher/dashboard` -> `backend/routes/teacherDashboardRoutes.js`
- `/api/teacher/auth` -> `backend/routes/teacherRoute.js`
- `/api/uploads` -> `backend/routes/uploadRoutes.js`

2. Auth + access control middleware
`backend/middleware/authTeacher.js`

3. Route endpoint handlers used by this page
`backend/routes/teacherDashboardRoutes.js`
`backend/routes/teacherRoute.js`
`backend/routes/uploadRoutes.js`

4. Global request correlation/logging
`backend/middleware/requestLogger.js`

5. Structured logger implementation (Pino)
`backend/utils/logger.js`

6. Database models used by these APIs
`backend/models/TeacherAttendance.js`
`backend/models/TeacherLeave.js`
`backend/models/TeacherExpense.js`
`backend/models/TeacherUser.js`

7. API docs mapping (reference)
`backend/swagger.js` (expected by script, currently not present)
`backend/swagger-output.json` (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
`backend/scripts/validateRuntimeLogs.js`

Endpoints directly connected:
- `GET /api/teacher/dashboard/work-attendance`
- `POST /api/teacher/dashboard/work-attendance/check-in`
- `POST /api/teacher/dashboard/work-attendance/check-out`
- `GET /api/teacher/dashboard/leave-requests`
- `POST /api/teacher/dashboard/leave-requests`
- `PATCH /api/teacher/dashboard/leave-requests/:id`
- `DELETE /api/teacher/dashboard/leave-requests/:id`
- `GET /api/teacher/dashboard/expenses`
- `POST /api/teacher/dashboard/expenses`
- `PATCH /api/teacher/dashboard/expenses/:id`
- `DELETE /api/teacher/dashboard/expenses/:id`
- `GET /api/teacher/auth/profile`
- `PUT /api/teacher/auth/profile`
- `POST /api/uploads/cloudinary/single`

Frontend file:
- `frontend/src/teachers/MyWorkPortal.jsx`

---

## URL: http://localhost:5173/teacher/class-routine
1. Entry server + route mounts
`backend/index.js`
Mounted APIs used by this page:
- `/api/teacher/dashboard` -> `backend/routes/teacherDashboardRoutes.js`

2. Auth + access control middleware
`backend/middleware/authTeacher.js`

3. Route endpoint handlers used by this page
`backend/routes/teacherDashboardRoutes.js`

4. Global request correlation/logging
`backend/middleware/requestLogger.js`

5. Structured logger implementation (Pino)
`backend/utils/logger.js`

6. Database models used by these APIs
`backend/models/Timetable.js`
`backend/models/TeacherAllocation.js`
`backend/models/School.js`

7. API docs mapping (reference)
`backend/swagger.js` (expected by script, currently not present)
`backend/swagger-output.json` (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
`backend/scripts/validateRuntimeLogs.js`

Endpoints directly connected:
- `GET /api/teacher/dashboard/routine`
- `GET /api/teacher/dashboard`

Frontend file:
- `frontend/src/teachers/ClassRoutine.jsx`

---

## URL: http://localhost:5173/teacher/holidays
1. Entry server + route mounts
`backend/index.js`
Mounted APIs used by this page:
- `/api/holidays` -> `backend/routes/holidayRoutes.js`
- `/api/teacher/dashboard` -> `backend/routes/teacherDashboardRoutes.js`

2. Auth + access control middleware
`backend/middleware/authTeacher.js`

3. Route endpoint handlers used by this page
`backend/routes/holidayRoutes.js`
`backend/routes/teacherDashboardRoutes.js`

4. Global request correlation/logging
`backend/middleware/requestLogger.js`

5. Structured logger implementation (Pino)
`backend/utils/logger.js`

6. Database models used by these APIs
`backend/models/Holiday.js`
`backend/models/Timetable.js`
`backend/models/TeacherAllocation.js`

7. API docs mapping (reference)
`backend/swagger.js` (expected by script, currently not present)
`backend/swagger-output.json` (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
`backend/scripts/validateRuntimeLogs.js`

Endpoints directly connected:
- `GET /api/holidays/teacher`
- `GET /api/teacher/dashboard/routine`
- `GET /api/teacher/dashboard`

Frontend file:
- `frontend/src/teachers/HolidayList.jsx`

---

## URL: http://localhost:5173/teacher/attendance
1. Entry server + route mounts
`backend/index.js`
Mounted API used by this page:
- `/api/attendance` -> `backend/routes/attendanceRoutes.js`

2. Auth + access control middleware
`backend/middleware/authTeacher.js`

3. Route endpoint handlers used by this page
`backend/routes/attendanceRoutes.js`

4. Global request correlation/logging
`backend/middleware/requestLogger.js`

5. Structured logger implementation (Pino)
`backend/utils/logger.js`

6. Database models used by these APIs
`backend/models/StudentUser.js`
`backend/models/Timetable.js`
`backend/models/LessonPlan.js`
`backend/models/LessonPlanCompletion.js`

7. API docs mapping (reference)
`backend/swagger.js` (expected by script, currently not present)
`backend/swagger-output.json` (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
`backend/scripts/validateRuntimeLogs.js`

Endpoints directly connected:
- `GET /api/attendance/teacher/students`
- `POST /api/attendance/teacher/bulk-upsert`

Frontend file:
- `frontend/src/teachers/AttendanceManagement.jsx`

---

## URL: http://localhost:5173/teacher/student-analytics
1. Entry server + route mounts
`backend/index.js`
Mounted APIs used by this page:
- `/api/progress` -> `backend/routes/progressRoute.js`
- `/api/teacher/dashboard` -> `backend/routes/teacherDashboardRoutes.js`
- `/api/ai-learning` -> `backend/routes/aiLearningRoute.js`

2. Auth + access control middleware
`backend/middleware/authTeacher.js`
`backend/middleware/adminAuth.js` (used by several `/api/progress` and `/api/ai-learning` endpoints)

3. Route endpoint handlers used by this page
`backend/routes/progressRoute.js`
`backend/routes/teacherDashboardRoutes.js`
`backend/routes/aiLearningRoute.js`

4. Global request correlation/logging
`backend/middleware/requestLogger.js`

5. Structured logger implementation (Pino)
`backend/utils/logger.js`

6. Database models used by these APIs
`backend/models/StudentProgress.js`
`backend/models/StudentUser.js`
`backend/models/Assignment.js`

7. API docs mapping (reference)
`backend/swagger.js` (expected by script, currently not present)
`backend/swagger-output.json` (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
`backend/scripts/validateRuntimeLogs.js`

Endpoints directly connected:
- `GET /api/progress/students`
- `GET /api/progress/analytics`
- `GET /api/progress/student/:studentId`
- `GET /api/teacher/dashboard/students` (fallback)
- `POST /api/ai-learning/analyze-weakness/:studentId`
- `POST /api/ai-learning/generate-learning-path/:studentId`

Important implementation note:
- `backend/routes/progressRoute.js` protects `GET /students`, `GET /analytics`, and `GET /student/:studentId` with `adminAuth` (not teacher auth).
- `backend/routes/aiLearningRoute.js` teacher-used endpoints are currently `adminAuth` protected.

Frontend file:
- `frontend/src/teachers/StudentAnalyticsPortal.jsx`

---

## URL: http://localhost:5173/teacher/ai-powered-teaching
1. Entry server + route mounts
`backend/index.js`
Mounted API used by this page:
- `/api/ai-learning` -> `backend/routes/aiLearningRoute.js`

2. Auth + access control middleware
`backend/middleware/adminAuth.js` (current backend)

3. Route endpoint handlers used by this page
`backend/routes/aiLearningRoute.js`

4. Global request correlation/logging
`backend/middleware/requestLogger.js`

5. Structured logger implementation (Pino)
`backend/utils/logger.js`

6. Database models used by these APIs
`backend/models/StudentProgress.js`
`backend/models/StudentUser.js`

7. API docs mapping (reference)
`backend/swagger.js` (expected by script, currently not present)
`backend/swagger-output.json` (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
`backend/scripts/validateRuntimeLogs.js`

Endpoints directly connected:
- `GET /api/ai-learning/weak-students`
- `POST /api/ai-learning/analyze-weakness/:studentId`
- `POST /api/ai-learning/generate-learning-path/:studentId`

Important implementation note:
- Current backend guard for these endpoints is `adminAuth`, while this page is in teacher portal.

Frontend files:
- `frontend/src/teachers/AIPoweredTeaching.jsx`
- `frontend/src/teachers/WeakStudentIdentification.jsx`

---

## URL: http://localhost:5173/teacher/health-updates
## URL: http://localhost:5173/teacher/student-observations
1. Entry server + route mounts
`backend/index.js`
Mounted APIs used by this page:
- `/api/attendance` -> `backend/routes/attendanceRoutes.js`
- `/api/observations` -> `backend/routes/studentObservationRoutes.js`

2. Auth + access control middleware
`backend/middleware/authTeacher.js`

3. Route endpoint handlers used by this page
`backend/routes/attendanceRoutes.js`
`backend/routes/studentObservationRoutes.js`

4. Global request correlation/logging
`backend/middleware/requestLogger.js`

5. Structured logger implementation (Pino)
`backend/utils/logger.js`

6. Database models used by these APIs
`backend/models/StudentObservation.js`
`backend/models/StudentUser.js`
`backend/models/ParentUser.js`
`backend/models/TeacherAllocation.js`

7. API docs mapping (reference)
`backend/swagger.js` (expected by script, currently not present)
`backend/swagger-output.json` (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
`backend/scripts/validateRuntimeLogs.js`

Endpoints directly connected:
- `GET /api/attendance/teacher/students`
- `GET /api/observations/teacher`
- `POST /api/observations/teacher`
- `GET /api/observations/teacher/parent-insights`

Frontend files:
- `frontend/src/teachers/HealthUpdatesAdvanced.jsx`
- `frontend/src/teachers/StudentObservationOverview.jsx`
- `frontend/src/teachers/StudentObservation.jsx`

---

## URL: http://localhost:5173/teacher/parent-meetings
1. Entry server + route mounts
`backend/index.js`
Mounted API used by this page:
- `/api/meeting` -> `backend/routes/meetingRoute.js`

2. Auth + access control middleware
`backend/middleware/authTeacher.js`

3. Route endpoint handlers used by this page
`backend/routes/meetingRoute.js`

4. Global request correlation/logging
`backend/middleware/requestLogger.js`

5. Structured logger implementation (Pino)
`backend/utils/logger.js`

6. Database models used by these APIs
`backend/models/ParentMeeting.js`
`backend/models/StudentUser.js`
`backend/models/ParentUser.js`

7. API docs mapping (reference)
`backend/swagger.js` (expected by script, currently not present)
`backend/swagger-output.json` (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
`backend/scripts/validateRuntimeLogs.js`

Endpoints directly connected:
- `GET /api/meeting/teacher/my-meetings`
- `GET /api/meeting/teacher/students`
- `GET /api/meeting/teacher/student/:studentId/parent`
- `POST /api/meeting/teacher/create`
- `DELETE /api/meeting/teacher/delete/:id`

Frontend file:
- `frontend/src/teachers/ParentMeetings.jsx`

---

## URL: http://localhost:5173/teacher/assignments
1. Entry server + route mounts
`backend/index.js`
Mounted APIs used by this page:
- `/api/assignment` -> `backend/routes/assignmentRoute.js`
- `/api/uploads` -> `backend/routes/uploadRoutes.js`

2. Auth + access control middleware
`backend/middleware/authTeacher.js`

3. Route endpoint handlers used by this page
`backend/routes/assignmentRoute.js`
`backend/routes/uploadRoutes.js`

4. Global request correlation/logging
`backend/middleware/requestLogger.js`

5. Structured logger implementation (Pino)
`backend/utils/logger.js`

6. Database models used by these APIs
`backend/models/Assignment.js`
`backend/models/StudentProgress.js`
`backend/models/StudentUser.js`
`backend/models/Timetable.js`
`backend/models/Class.js`
`backend/models/Section.js`

7. API docs mapping (reference)
`backend/swagger.js` (expected by script, currently not present)
`backend/swagger-output.json` (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
`backend/scripts/validateRuntimeLogs.js`

Endpoints directly connected:
- `GET /api/assignment/teacher/my-classes`
- `GET /api/assignment/teacher/my-assignments`
- `PUT /api/assignment/teacher/update/:id`
- `POST /api/uploads/cloudinary/single`
- `POST /api/assignment/teacher/create`
- `DELETE /api/assignment/teacher/delete/:id`
- `GET /api/assignment/teacher/submissions`
- `POST /api/assignment/teacher/grade`

Frontend file:
- `frontend/src/teachers/AssignmentPortal.jsx`

---

## URL: http://localhost:5173/teacher/practice-questions
1. Entry server + route mounts
`backend/index.js`
Mounted APIs used by this page:
- `/api/practice` -> `backend/routes/practiceRoutes.js`
- `/api/teacher/dashboard` -> `backend/routes/teacherDashboardRoutes.js`

2. Auth + access control middleware
`backend/middleware/authTeacher.js`

3. Route endpoint handlers used by this page
`backend/routes/practiceRoutes.js`
`backend/routes/teacherDashboardRoutes.js`

4. Global request correlation/logging
`backend/middleware/requestLogger.js`

5. Structured logger implementation (Pino)
`backend/utils/logger.js`

6. Database models used by these APIs
`backend/models/PracticeQuestion.js`
`backend/models/PracticeAttempt.js`
`backend/models/TeacherAllocation.js`
`backend/models/StudentUser.js`

7. API docs mapping (reference)
`backend/swagger.js` (expected by script, currently not present)
`backend/swagger-output.json` (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
`backend/scripts/validateRuntimeLogs.js`

Endpoints directly connected:
- `GET /api/teacher/dashboard/allocations`
- `GET /api/practice/teacher/questions`
- `POST /api/practice/teacher/questions`
- `PUT /api/practice/teacher/questions/:id`
- `DELETE /api/practice/teacher/questions/:id`

Frontend file:
- `frontend/src/teachers/PracticeQuestions.jsx`

---

## URL: http://localhost:5173/teacher/chat
1. Entry server + route mounts
`backend/index.js`
Mounted API used by this page:
- `/api/chat` -> `backend/routes/chatRoutes.js`

2. Auth + access control middleware
`backend/middleware/authAnyUser.js` (inside chat route stack)

3. Route endpoint handlers used by this page
`backend/routes/chatRoutes.js`

4. Global request correlation/logging
`backend/middleware/requestLogger.js`

5. Structured logger implementation (Pino)
`backend/utils/logger.js`

6. Database models used by these APIs
`backend/models/ChatThread.js`
`backend/models/ChatMessage.js`
`backend/models/ChatKey.js`
`backend/models/StudentUser.js`
`backend/models/ParentUser.js`
`backend/models/TeacherUser.js`

7. API docs mapping (reference)
`backend/swagger.js` (expected by script, currently not present)
`backend/swagger-output.json` (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
`backend/scripts/validateRuntimeLogs.js`

Endpoints directly connected:
- `GET /api/chat/me`
- `GET /api/chat/threads`
- `GET /api/chat/threads/:threadId/presence`
- `GET /api/chat/threads/:threadId/messages`
- `GET /api/chat/students/:studentId/profile`
- `GET /api/chat/parents/:parentId/profile`
- `GET /api/chat/contacts`
- `POST /api/chat/threads/direct`
- `POST /api/chat/threads/:threadId/messages`

Frontend file:
- `frontend/src/teachers/TeacherChat.jsx`

---

## URL: http://localhost:5173/teacher/lesson-plans
1. Entry server + route mounts
`backend/index.js`
Mounted API used by this page:
- `/api/lesson-plans` -> `backend/routes/lessonPlanRoutes.js`

2. Auth + access control middleware
`backend/middleware/authTeacher.js`

3. Route endpoint handlers used by this page
`backend/routes/lessonPlanRoutes.js`

4. Global request correlation/logging
`backend/middleware/requestLogger.js`

5. Structured logger implementation (Pino)
`backend/utils/logger.js`

6. Database models used by these APIs
`backend/models/LessonPlan.js`
`backend/models/LessonPlanCompletion.js`
`backend/models/Class.js`
`backend/models/Section.js`
`backend/models/Timetable.js`

7. API docs mapping (reference)
`backend/swagger.js` (expected by script, currently not present)
`backend/swagger-output.json` (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
`backend/scripts/validateRuntimeLogs.js`

Endpoints directly connected:
- `GET /api/lesson-plans/teacher/my`
- `GET /api/lesson-plans/teacher/options`
- `GET /api/lesson-plans/teacher/:lessonPlanId/status`
- `POST /api/lesson-plans/teacher/:lessonPlanId/status`
- `PUT /api/lesson-plans/teacher/:lessonPlanId/status/:statusId`
- `DELETE /api/lesson-plans/teacher/:lessonPlanId/status/:statusId`
- `POST /api/lesson-plans/teacher`
- `PUT /api/lesson-plans/teacher/:id`
- `DELETE /api/lesson-plans/teacher/:id`

Frontend file:
- `frontend/src/teachers/LessonPlanDashboard.jsx`

---

## URL: http://localhost:5173/teacher/class-notes
1. Entry server + route mounts
`backend/index.js`
Mounted APIs used by this page:
- `/api/teacher/dashboard` -> `backend/routes/teacherDashboardRoutes.js`
- `/api/notifications` -> `backend/routes/notificationRoutes.js`
- `/api/uploads` -> `backend/routes/uploadRoutes.js`

2. Auth + access control middleware
`backend/middleware/authTeacher.js`

3. Route endpoint handlers used by this page
`backend/routes/teacherDashboardRoutes.js`
`backend/routes/notificationRoutes.js`
`backend/routes/uploadRoutes.js`

4. Global request correlation/logging
`backend/middleware/requestLogger.js`

5. Structured logger implementation (Pino)
`backend/utils/logger.js`

6. Database models used by these APIs
`backend/models/TeacherAllocation.js`
`backend/models/Notification.js`
`backend/models/Class.js`
`backend/models/Section.js`

7. API docs mapping (reference)
`backend/swagger.js` (expected by script, currently not present)
`backend/swagger-output.json` (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
`backend/scripts/validateRuntimeLogs.js`

Endpoints directly connected:
- `GET /api/teacher/dashboard/allocations`
- `GET /api/notifications/teacher`
- `POST /api/notifications/teacher`
- `DELETE /api/notifications/teacher/:id`
- `POST /api/uploads/cloudinary/single`

Frontend file:
- `frontend/src/teachers/ClassNotes.jsx`

---

## URL: http://localhost:5173/teacher/exams
1. Entry server + route mounts
`backend/index.js`
Mounted APIs used by this page:
- `/api/exam` -> `backend/routes/examRoute.js`
- `/api/teacher/dashboard` -> `backend/routes/teacherDashboardRoutes.js`

2. Auth + access control middleware
`backend/middleware/authTeacher.js`

3. Route endpoint handlers used by this page
`backend/routes/examRoute.js`
`backend/routes/teacherDashboardRoutes.js`

4. Global request correlation/logging
`backend/middleware/requestLogger.js`

5. Structured logger implementation (Pino)
`backend/utils/logger.js`

6. Database models used by these APIs
`backend/models/Exam.js`
`backend/models/ExamGroup.js`
`backend/models/TeacherUser.js`
`backend/models/TeacherAllocation.js`

7. API docs mapping (reference)
`backend/swagger.js` (expected by script, currently not present)
`backend/swagger-output.json` (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
`backend/scripts/validateRuntimeLogs.js`

Endpoints directly connected:
- `GET /api/exam/teacher/manage`
- `POST /api/exam/teacher/add`
- `PUT /api/exam/teacher/:id`
- `DELETE /api/exam/teacher/:id`
- `GET /api/teacher/dashboard/allocations`

Frontend file:
- `frontend/src/teachers/ExamManagement.jsx`

---

## URL: http://localhost:5173/teacher/result-management
1. Entry server + route mounts
`backend/index.js`
Mounted API used by this page:
- `/api/exam` -> `backend/routes/examRoute.js`

2. Auth + access control middleware
`backend/middleware/authTeacher.js` (via adminOrTeacherAuth in exam routes)

3. Route endpoint handlers used by this page
`backend/routes/examRoute.js`

4. Global request correlation/logging
`backend/middleware/requestLogger.js`

5. Structured logger implementation (Pino)
`backend/utils/logger.js`

6. Database models used by these APIs
`backend/models/ExamResult.js`
`backend/models/Exam.js`
`backend/models/StudentUser.js`
`backend/models/TeacherUser.js`

7. API docs mapping (reference)
`backend/swagger.js` (expected by script, currently not present)
`backend/swagger-output.json` (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
`backend/scripts/validateRuntimeLogs.js`

Endpoints directly connected:
- `GET /api/exam/results/exam-options`
- `GET /api/exam/results/exam-students`
- `GET /api/exam/results`
- `POST /api/exam/results`
- `PUT /api/exam/results/:id`
- `DELETE /api/exam/results/:id`

Frontend file:
- `frontend/src/teachers/ResultManagement.jsx`

---

## URL: http://localhost:5173/teacher/excuse-letters
1. Entry server + route mounts
`backend/index.js`
Mounted API used by this page:
- `/api/excuse-letters` -> `backend/routes/excuseLetterRoutes.js`

2. Auth + access control middleware
`backend/middleware/authTeacher.js`

3. Route endpoint handlers used by this page
`backend/routes/excuseLetterRoutes.js`

4. Global request correlation/logging
`backend/middleware/requestLogger.js`

5. Structured logger implementation (Pino)
`backend/utils/logger.js`

6. Database models used by these APIs
`backend/models/ExcuseLetter.js`
`backend/models/StudentUser.js`
`backend/models/TeacherAllocation.js`

7. API docs mapping (reference)
`backend/swagger.js` (expected by script, currently not present)
`backend/swagger-output.json` (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
`backend/scripts/validateRuntimeLogs.js`

Endpoints directly connected:
- `GET /api/excuse-letters/teacher`
- `PATCH /api/excuse-letters/teacher/:id`

Frontend file:
- `frontend/src/teachers/ExcuseLetters.jsx`

---

## URL: http://localhost:5173/teacher/feedback
1. Entry server + route mounts
`backend/index.js`
Mounted API used by this page:
- `/api/teacher/dashboard` -> `backend/routes/teacherDashboardRoutes.js`

2. Auth + access control middleware
`backend/middleware/authTeacher.js`

3. Route endpoint handlers used by this page
`backend/routes/teacherDashboardRoutes.js`

4. Global request correlation/logging
`backend/middleware/requestLogger.js`

5. Structured logger implementation (Pino)
`backend/utils/logger.js`

6. Database models used by these APIs
`backend/models/TeacherFeedback.js`
`backend/models/SupportRequest.js`
`backend/models/TeacherUser.js`

7. API docs mapping (reference)
`backend/swagger.js` (expected by script, currently not present)
`backend/swagger-output.json` (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
`backend/scripts/validateRuntimeLogs.js`

Endpoints directly connected:
- `GET /api/teacher/dashboard/feedback`
- `GET /api/teacher/dashboard/complaints`
- `PUT /api/teacher/dashboard/complaints/:id/status`

Frontend file:
- `frontend/src/teachers/TeacherFeedbackPortal.jsx`

---

## URL: http://localhost:5173/teacher/ai-learning/:studentId/:subject
1. Entry server + route mounts
`backend/index.js`
Mounted API used by this page:
- `/api/ai-learning` -> `backend/routes/aiLearningRoute.js`

2. Auth + access control middleware
`backend/middleware/adminAuth.js` (current backend guard)

3. Route endpoint handlers used by this page
`backend/routes/aiLearningRoute.js`

4. Global request correlation/logging
`backend/middleware/requestLogger.js`

5. Structured logger implementation (Pino)
`backend/utils/logger.js`

6. Database models used by these APIs
`backend/models/StudentProgress.js`
`backend/models/StudentUser.js`

7. API docs mapping (reference)
`backend/swagger.js` (expected by script, currently not present)
`backend/swagger-output.json` (loaded when present, currently not present)

8. Verification / simulation layer (current files in repo)
`backend/scripts/validateRuntimeLogs.js`

Endpoints directly connected:
- `GET /api/ai-learning/learning-path/:studentId/:subject`
- `PUT /api/ai-learning/update-progress/:studentId/:subject`

Important implementation note:
- Backend for these endpoints currently uses `adminAuth`; teacher portal calls these endpoints directly.

Frontend file:
- `frontend/src/teachers/AILearningPath.jsx`

---

## Global teacher-portal cross-cutting backend files
- `backend/index.js` (route mounts)
- `backend/middleware/requestLogger.js` (requestId/traceId/start-end logging)
- `backend/utils/logger.js` (Pino logger)
- `backend/middleware/authTeacher.js` (teacher token auth)
- `backend/middleware/rateLimit.js` (used in teacher login/reset auth routes)

---

## Notes
- Endpoint mapping is based on current teacher frontend calls in `frontend/src/teachers/*` and backend mounts in `backend/index.js`.
- `backend/swagger.js` and `backend/swagger-output.json` are referenced in backend flow but are not present in this workspace currently.
- Teacher portal alias routes that redirect:
  - `/teacher/progress` -> `/teacher/student-analytics`
  - `/teacher/weak-students` -> `/teacher/student-analytics`
  - `/teacher/evaluation` -> `/teacher/assignments`
  - `/teacher/results` -> `/teacher/result-management`
