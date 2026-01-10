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
