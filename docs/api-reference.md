# API Reference

Base URL: http://localhost:5000

## Auth
- POST /api/admin/auth/register
- POST /api/admin/auth/login
- POST /api/teacher/auth/register
- POST /api/teacher/auth/login
- POST /api/student/auth/register
- POST /api/student/auth/login
- POST /api/parent/auth/register
- POST /api/parent/auth/login

## Schools (Admin)
- POST /api/schools
- GET /api/schools
- GET /api/schools/:id

## Academic (Admin)
- POST /api/academic/years
- GET /api/academic/years
- POST /api/academic/classes
- GET /api/academic/classes
- POST /api/academic/sections
- GET /api/academic/sections?classId=...
- POST /api/academic/subjects
- GET /api/academic/subjects?classId=...

## Users (Admin)
- POST /api/admin/users/create-user
- POST /api/admin/users/bulk-create-users
- POST /api/admin/users/bulk-import-csv
- GET /api/admin/users/get-students
- GET /api/admin/users/get-teachers
- GET /api/admin/users/get-parents
- GET /api/admin/users/dashboard-stats

## Attendance
- POST /api/attendance/mark
- GET /api/attendance/all
- GET /api/attendance/admin/all

## Student Profile
- POST /api/student/profile/update
- GET /api/student/profile

## Courses/Subjects/Exams/Assignments/Feedback
- POST /api/course
- GET /api/course
- POST /api/subject
- GET /api/subject
- POST /api/exam
- GET /api/exam
- POST /api/assignment
- GET /api/assignment
- POST /api/feedback
- GET /api/feedback

## AI Learning
- POST /api/ai-learning/analyze-weakness/:studentId
- GET /api/ai-learning/weak-students
- POST /api/ai-learning/generate-learning-path/:studentId
- GET /api/ai-learning/learning-path/:studentId/:subject
- PUT /api/ai-learning/update-progress/:studentId/:subject

## Alcove
- POST /api/alcove/posts
- GET /api/alcove/posts
- GET /api/alcove/posts/:id
- PATCH /api/alcove/posts/:id
- GET /api/alcove/posts/:id/comments
- POST /api/alcove/posts/:id/comments

## NIF
- /api/nif/* (students, fees, archive)
- /api/nif/course/*
- /api/nif/students/archived

## Fees (Admin)
- POST /api/fees/structures
- GET /api/fees/structures
- POST /api/fees/invoices
- GET /api/fees/invoices
- POST /api/fees/payments
- GET /api/fees/payments

## Timetable (Admin)
- POST /api/timetable
- GET /api/timetable?classId=...&sectionId=...

## Reports (Admin)
- GET /api/reports/summary

## Notifications
- POST /api/notifications
- GET /api/notifications
- GET /api/notifications/user

## Audit Logs (Admin)
- POST /api/audit-logs
- GET /api/audit-logs
