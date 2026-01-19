# System Diagram

```text
Institution Head (Super Admin)
  - Schools (multi-tenant)
      - School Admin
          - Academic Setup
              - Academic Year
              - Class -> Section
              - Subject
          - User Setup
              - Staff (Principal/Teachers)
              - Students
              - Parents (linked to Students)
          - Operations
              - Attendance
              - Assignments + Submissions
              - Exams + Results
              - Fees (Structure -> Invoice -> Payment)
              - Notices/Chat
          - Reports
      - Principal (views academics + reports)
```

## Workflow (Follow This Order)

1) Institution Head (Super Admin)
   - Login as admin.
   - Create schools (multi-tenant).

2) School Admin (per school)
   - Login with a school-scoped admin token.
   - Academic setup:
     - Academic Year
     - Class -> Section
     - Subject
   - User setup:
     - Principal and Teachers
     - Students
     - Parents (linked to Students)

3) Operations (school day-to-day)
   - Attendance
   - Assignments + Submissions
   - Exams + Results
   - Fees (Structure -> Invoice -> Payment)
   - Notices/Chat

4) Reports
   - School admin reports
   - Principal views academics + reports

## Backend Route Map (Reference)

1) Institution Head (Super Admin)
   - Admin login: `POST /api/admin/auth/login` (backend/routes/adminRoutes.js)
   - Schools: `POST /api/schools`, `GET /api/schools`, `GET /api/schools/:id` (backend/routes/schoolRoutes.js)

2) School Admin
   - Academic setup:
     - Academic years: `POST /api/academic/years`, `GET /api/academic/years`
     - Classes: `POST /api/academic/classes`, `GET /api/academic/classes`
     - Sections: `POST /api/academic/sections`, `GET /api/academic/sections`
     - Subjects: `POST /api/academic/subjects`, `GET /api/academic/subjects`
   - User setup:
     - Principal: `POST /api/principal/auth/register`, `POST /api/principal/auth/login`
     - Teachers: `POST /api/teacher/auth/register`, `POST /api/teacher/auth/login`
     - Students: `POST /api/student/auth/register`, `POST /api/student/auth/login`
     - Parents: `POST /api/parent/auth/register`, `POST /api/parent/auth/login`
     - Bulk users: `POST /api/admin/users/bulk-create-users`, `POST /api/admin/users/bulk-import-csv`

3) Operations
   - Attendance: `POST /api/attendance/mark`, `GET /api/attendance/all`, `GET /api/attendance/admin/all`
   - Assignments: `POST /api/assignment/add`, `GET /api/assignment/fetch`
   - Exams: `POST /api/exam/add`, `GET /api/exam/fetch`
   - Fees:
     - Structures: `POST /api/fees/structures`, `GET /api/fees/structures`
     - Invoices: `POST /api/fees/invoices`, `GET /api/fees/invoices`
     - Payments: `POST /api/fees/payments`, `GET /api/fees/payments`
   - Notices: `POST /api/notifications`, `GET /api/notifications`, `GET /api/notifications/user`
   - Alcove (Q&A): `POST /api/alcove/posts`, `GET /api/alcove/posts`, `POST /api/alcove/posts/:id/comments`

4) Reports
   - Summary: `GET /api/reports/summary`
   - Principal dashboard: `GET /api/principal/overview`
