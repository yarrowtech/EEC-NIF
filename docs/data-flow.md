# Data Flow

## Setup
```text
Super Admin
  -> Create School
  -> Assign School Admin

School Admin
  -> Create Academic Year
  -> Create Classes/Sections
  -> Create Subjects
  -> Create Staff
  -> Create Students + Parents
  -> Enroll Students into Class/Section
  -> Assign Teachers to Subjects/Classes
```

## Attendance
```text
Teacher
  -> Mark Attendance (Class/Section/Date)
  -> Attendance Record (per Student)
Principal/Admin
  -> View Reports
Student/Parent
  -> View Only
```

## Assignments
```text
Teacher
  -> Create Assignment (Class/Subject)
Student
  -> Submit Work
Teacher
  -> Review/Grade
Student/Parent
  -> View Result
```

## Exams and Results
```text
Admin/Teacher
  -> Create Exam Schedule
Teacher
  -> Enter Marks
System
  -> Publish Results
Student/Parent
  -> View Results
```

## Fees
```text
Admin/Accountant
  -> Define Fee Structure
System
  -> Generate Invoice (per Student/Term)
Parent/Student
  -> Pay Fee
System
  -> Update Due/Receipt
Admin
  -> Reports
```
Added multi‑tenant School model/routes and schoolId to core user models + tokens
Built Academic setup APIs (years, classes, sections, subjects)
Built Fees, Reports, Timetable, Notifications, Audit Logs APIs
Added CSV bulk import for users
Hardened security (strong passwords, policy, rate limit, CORS) and tenant‑scoped core routes