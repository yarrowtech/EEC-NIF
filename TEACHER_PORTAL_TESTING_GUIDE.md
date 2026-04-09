# Teacher Portal Testing Guide - Complete Walkthrough

## Prerequisites
- **Frontend URL:** http://localhost:5173/teacher/dashboard
- **Backend API:** http://localhost:5000/api (assumed)
- **Tools needed:**
  - Browser DevTools (Network tab for API monitoring)
  - Postman/Thunder Client (optional for API testing)
  - MongoDB Compass (optional for database verification)

## Test User Setup
1. Login as a teacher with valid credentials
2. Ensure the teacher has:
   - Class allocations
   - Assigned students
   - Subject assignments
   - Proper role permissions

---

## 1. AUTHENTICATION & PROFILE (Priority: HIGH)

### 1.1 Teacher Login
**Frontend:** `/teacher/login` (if redirected when not authenticated)

**Steps:**
1. Navigate to http://localhost:5173/teacher/dashboard
2. If not logged in, you'll be redirected to login page
3. Enter teacher credentials
4. Click "Login"

**Backend API Check:**
- `POST /api/teacher/auth/login`
- Check Network tab for successful 200 response
- Verify JWT token is stored (localStorage/cookies)

**Expected Result:**
- ✅ Successful login redirects to dashboard
- ✅ Token saved in browser storage
- ✅ User role verified as TEACHER

### 1.2 View Profile
**Frontend:** Check if profile section exists in sidebar/header

**Steps:**
1. Look for profile/settings option
2. Click to view teacher profile

**Backend API Check:**
- `GET /api/teacher/auth/profile`

**Expected Result:**
- ✅ Profile displays: name, email, mobile, subject, department, qualification, experience, joining date

### 1.3 Update Profile
**Steps:**
1. Click "Edit Profile" or similar button
2. Update fields (name, mobile, address, etc.)
3. Save changes

**Backend API Check:**
- `PUT /api/teacher/auth/profile`

**Expected Result:**
- ✅ Success message displayed
- ✅ Changes reflected immediately
- ✅ Database updated

### 1.4 First-Time Password Reset
**Steps:**
1. If first-time login, system should prompt password reset
2. Enter new password and confirm
3. Submit

**Backend API Check:**
- `POST /api/teacher/auth/reset-first-password`

**Expected Result:**
- ✅ Password updated successfully
- ✅ User can login with new password

---

## 2. DASHBOARD OVERVIEW (Priority: HIGH)

### 2.1 Main Dashboard
**Frontend:** `/teacher/dashboard`

**Steps:**
1. Navigate to http://localhost:5173/teacher/dashboard
2. Observe dashboard layout

**Backend API Check:**
- `GET /api/teacher/dashboard/`
- `GET /api/teacher/dashboard/allocations`

**Expected Result:**
- ✅ Greeting displayed (Good morning/afternoon/evening)
- ✅ Class allocations shown
- ✅ Student count displayed
- ✅ Pending work items visible
- ✅ Quick stats cards present
- ✅ Class teacher status shown (if applicable)

### 2.2 Class Allocations
**Steps:**
1. View "My Classes" or "Allocations" section
2. Check each class details

**Backend API Check:**
- `GET /api/teacher/dashboard/allocations`

**Expected Result:**
- ✅ All allocated classes listed
- ✅ Class name, grade, section displayed
- ✅ Student count per class shown
- ✅ Class teacher indicator visible

### 2.3 Students List
**Steps:**
1. Click "My Students" or view students section
2. Browse student list

**Backend API Check:**
- `GET /api/teacher/dashboard/students`

**Expected Result:**
- ✅ All assigned students listed
- ✅ Student name, class, roll number shown
- ✅ Filtering/sorting works

---

## 3. ATTENDANCE MANAGEMENT (Priority: HIGH)

### 3.1 Mark Student Attendance
**Frontend:** `/teacher/attendance`

**Steps:**
1. Navigate to Attendance section
2. Select date (today or specific date)
3. Select class
4. Mark attendance for each student (Present/Absent/Late)
5. Add remarks if needed
6. Submit attendance

**Backend API Check:**
- `GET /api/teacher/dashboard/students` (to load students)
- `POST /api/teacher/dashboard/attendance`
- `POST /api/attendance/teacher/bulk-upsert`

**Expected Result:**
- ✅ Student list loads correctly
- ✅ Attendance marked successfully
- ✅ Success notification displayed
- ✅ Can view previously marked attendance
- ✅ Database updated with attendance records

### 3.2 Update Attendance
**Steps:**
1. View already marked attendance
2. Click edit on specific student
3. Change status or remarks
4. Save changes

**Backend API Check:**
- `PUT /api/attendance/teacher/student/:studentId/entry/:entryId`

**Expected Result:**
- ✅ Attendance updated successfully
- ✅ Changes reflected in history

### 3.3 Delete Attendance Entry
**Steps:**
1. Find attendance entry to delete
2. Click delete/remove
3. Confirm deletion

**Backend API Check:**
- `DELETE /api/attendance/teacher/student/:studentId/entry/:entryId`

**Expected Result:**
- ✅ Entry removed
- ✅ Confirmation message shown

### 3.4 View Attendance History
**Steps:**
1. Navigate to attendance history/reports
2. Select date range
3. View attendance records

**Backend API Check:**
- `GET /api/attendance/all`

**Expected Result:**
- ✅ Historical attendance displayed
- ✅ Filtering by date/class works
- ✅ Export option available (if implemented)

---

## 4. MY WORK PORTAL (Priority: HIGH)

### 4.1 Work Attendance Check-In
**Frontend:** `/teacher/my-work-portal`

**Steps:**
1. Navigate to My Work Portal
2. Click "Check In" button at start of day
3. Note the check-in time

**Backend API Check:**
- `POST /api/teacher/dashboard/work-attendance/check-in`

**Expected Result:**
- ✅ Check-in recorded with timestamp
- ✅ Late arrival detected if after grace period
- ✅ Cannot check in twice same day

### 4.2 Work Attendance Check-Out
**Steps:**
1. At end of day, click "Check Out" button
2. Note the check-out time

**Backend API Check:**
- `POST /api/teacher/dashboard/work-attendance/check-out`

**Expected Result:**
- ✅ Check-out recorded
- ✅ Total working hours calculated
- ✅ Cannot check out without checking in

### 4.3 View Work Attendance Records
**Steps:**
1. Navigate to work attendance history
2. View past check-in/check-out records

**Backend API Check:**
- `GET /api/teacher/dashboard/work-attendance`

**Expected Result:**
- ✅ All attendance records displayed
- ✅ Late arrivals highlighted
- ✅ Working hours shown per day

### 4.4 Leave Request Management
**Steps:**
1. Click "Apply for Leave"
2. Fill leave form:
   - Leave type (casual, sick, etc.)
   - Start date
   - End date
   - Reason
3. Submit request

**Backend API Check:**
- `POST /api/teacher/dashboard/leave-requests`

**Expected Result:**
- ✅ Leave request submitted
- ✅ Pending approval status shown
- ✅ Leave balance updated (if applicable)

### 4.5 View Leave Requests
**Steps:**
1. Navigate to "My Leave Requests"
2. View all submitted requests

**Backend API Check:**
- `GET /api/teacher/dashboard/leave-requests`

**Expected Result:**
- ✅ All leave requests listed
- ✅ Status shown (Pending/Approved/Rejected)
- ✅ Can filter by status/date

### 4.6 Update Leave Request
**Steps:**
1. Find pending leave request
2. Click edit
3. Modify dates or reason
4. Save changes

**Backend API Check:**
- `PATCH /api/teacher/dashboard/leave-requests/:id`

**Expected Result:**
- ✅ Leave request updated
- ✅ Changes saved to database

### 4.7 Cancel Leave Request
**Steps:**
1. Find pending leave request
2. Click cancel/delete
3. Confirm cancellation

**Backend API Check:**
- `DELETE /api/teacher/dashboard/leave-requests/:id`

**Expected Result:**
- ✅ Request removed
- ✅ Leave balance restored (if deducted)

### 4.8 Expense Management
**Steps:**
1. Click "Add Expense"
2. Fill expense form:
   - Category
   - Amount
   - Date
   - Description
   - Receipt/proof (optional file upload)
3. Submit

**Backend API Check:**
- `POST /api/teacher/dashboard/expenses`

**Expected Result:**
- ✅ Expense recorded
- ✅ Pending approval status shown
- ✅ File uploaded (if provided)

### 4.9 View Expenses
**Backend API Check:**
- `GET /api/teacher/dashboard/expenses`

**Expected Result:**
- ✅ All expenses listed
- ✅ Status tracking works
- ✅ Can edit/delete pending expenses

---

## 5. ASSIGNMENT MANAGEMENT (Priority: HIGH)

### 5.1 View My Classes for Assignments
**Frontend:** `/teacher/assignments`

**Steps:**
1. Navigate to Assignments section
2. View list of classes you teach

**Backend API Check:**
- `GET /api/assignment/teacher/my-classes`

**Expected Result:**
- ✅ All teaching classes displayed
- ✅ Class details correct

### 5.2 Create New Assignment
**Steps:**
1. Click "Create Assignment"
2. Fill assignment form:
   - Title
   - Description
   - Subject
   - Class/Section
   - Due date
   - Total marks
   - Rubric/criteria
   - Attachments (optional)
3. Publish assignment

**Backend API Check:**
- `POST /api/assignment/teacher/create`

**Expected Result:**
- ✅ Assignment created successfully
- ✅ Visible to selected students
- ✅ Notification sent to students (if enabled)

### 5.3 View My Assignments
**Steps:**
1. Navigate to "My Assignments" tab
2. Browse created assignments

**Backend API Check:**
- `GET /api/assignment/teacher/my-assignments`

**Expected Result:**
- ✅ All created assignments listed
- ✅ Status shown (Published/Draft/Archived)
- ✅ Submission count displayed
- ✅ Due dates highlighted

### 5.4 Update Assignment
**Steps:**
1. Click edit on an assignment
2. Modify details
3. Save changes

**Backend API Check:**
- `PUT /api/assignment/teacher/update/:id`

**Expected Result:**
- ✅ Assignment updated
- ✅ Changes reflected immediately
- ✅ Students notified of changes (if applicable)

### 5.5 Delete Assignment
**Steps:**
1. Select assignment to delete
2. Click delete
3. Confirm deletion

**Backend API Check:**
- `DELETE /api/assignment/teacher/delete/:id`

**Expected Result:**
- ✅ Assignment removed
- ✅ Submissions handled appropriately

### 5.6 View Student Submissions
**Steps:**
1. Click "View Submissions" on an assignment
2. Browse submitted work

**Backend API Check:**
- `GET /api/assignment/teacher/submissions?assignmentId=xxx`

**Expected Result:**
- ✅ All submissions listed
- ✅ Student name, submission date shown
- ✅ Can download attachments
- ✅ Submission status (Submitted/Pending/Late)

### 5.7 Grade Student Submissions
**Steps:**
1. Open a student submission
2. Review submitted work
3. Enter marks/grade
4. Add feedback/comments
5. Submit grade

**Backend API Check:**
- `POST /api/assignment/teacher/grade`

**Expected Result:**
- ✅ Grade recorded
- ✅ Feedback saved
- ✅ Student notified of grade (if enabled)
- ✅ Grade visible to student

### 5.8 Bulk Grade Submissions
**Steps:**
1. Select multiple submissions
2. Enter grades in bulk interface
3. Submit all grades at once

**Expected Result:**
- ✅ All grades saved
- ✅ Error handling for invalid grades
- ✅ Confirmation shown

---

## 6. LESSON PLANNING (Priority: MEDIUM)

### 6.1 View Lesson Plan Options
**Frontend:** `/teacher/lesson-plans`

**Steps:**
1. Navigate to Lesson Plans section
2. View available options

**Backend API Check:**
- `GET /api/lesson-plans/teacher/options`

**Expected Result:**
- ✅ Subjects and classes loaded
- ✅ Can select options for new plan

### 6.2 Create Lesson Plan
**Steps:**
1. Click "Create Lesson Plan"
2. Fill form:
   - Subject
   - Class
   - Topic/Unit
   - Learning objectives
   - Activities
   - Resources needed
   - Duration
   - Date range
3. Save plan

**Backend API Check:**
- `POST /api/lesson-plans/teacher`

**Expected Result:**
- ✅ Lesson plan created
- ✅ Added to "My Lesson Plans"
- ✅ Can be tracked for completion

### 6.3 View My Lesson Plans
**Steps:**
1. Navigate to "My Lesson Plans" tab
2. Browse all created plans

**Backend API Check:**
- `GET /api/lesson-plans/teacher/my`

**Expected Result:**
- ✅ All lesson plans listed
- ✅ Completion percentage shown
- ✅ Status indicators (Planned/In Progress/Completed)
- ✅ Can filter by subject/class/date

### 6.4 Track Lesson Completion Status
**Steps:**
1. Open a lesson plan
2. Click "Log Progress" or "Mark Completion"
3. Enter:
   - Date
   - Percentage completed
   - Remarks/notes
   - Adjustments made
4. Save status

**Backend API Check:**
- `POST /api/lesson-plans/teacher/:lessonPlanId/status`

**Expected Result:**
- ✅ Progress logged
- ✅ Percentage updated
- ✅ Timeline/history shown

### 6.5 View Lesson Completion History
**Steps:**
1. Open lesson plan details
2. View completion status timeline

**Backend API Check:**
- `GET /api/lesson-plans/teacher/:lessonPlanId/status`

**Expected Result:**
- ✅ All progress entries shown
- ✅ Daily/weekly progress visible
- ✅ Can edit recent entries

### 6.6 Update Lesson Plan
**Steps:**
1. Click edit on a lesson plan
2. Modify details
3. Save changes

**Backend API Check:**
- `PUT /api/lesson-plans/teacher/:id`

**Expected Result:**
- ✅ Plan updated successfully
- ✅ Completion status preserved

### 6.7 Delete Lesson Plan
**Steps:**
1. Select lesson plan
2. Click delete
3. Confirm

**Backend API Check:**
- `DELETE /api/lesson-plans/teacher/:id`

**Expected Result:**
- ✅ Plan deleted
- ✅ Associated status entries removed

---

## 7. EXAM MANAGEMENT (Priority: HIGH)

### 7.1 View Exam Management Dashboard
**Frontend:** `/teacher/exams`

**Steps:**
1. Navigate to Exams section
2. View exam dashboard

**Backend API Check:**
- `GET /api/exam/teacher/manage`

**Expected Result:**
- ✅ Upcoming exams listed
- ✅ Past exams shown
- ✅ Can filter by subject/class

### 7.2 Create New Exam
**Steps:**
1. Click "Schedule Exam"
2. Fill exam form:
   - Exam name
   - Subject
   - Class
   - Date and time
   - Duration
   - Total marks
   - Syllabus/topics
3. Save exam

**Backend API Check:**
- `POST /api/exam/teacher/add`

**Expected Result:**
- ✅ Exam created
- ✅ Students notified (if enabled)
- ✅ Visible in exam calendar

### 7.3 Update Exam
**Steps:**
1. Click edit on an exam
2. Modify details
3. Save changes

**Backend API Check:**
- `PUT /api/exam/teacher/:id`

**Expected Result:**
- ✅ Exam updated
- ✅ Students notified of changes

### 7.4 Delete Exam
**Steps:**
1. Select exam to delete
2. Click delete
3. Confirm deletion

**Backend API Check:**
- `DELETE /api/exam/teacher/:id`

**Expected Result:**
- ✅ Exam removed
- ✅ Results handled appropriately

---

## 8. RESULT MANAGEMENT (Priority: HIGH)

### 8.1 Access Result Entry Page
**Frontend:** `/teacher/result-management` or `/teacher/results`

**Steps:**
1. Navigate to Results section
2. View result entry interface

**Backend API Check:**
- `GET /api/exam/results/exam-options`

**Expected Result:**
- ✅ Exam list loaded
- ✅ Can select exam for result entry

### 8.2 Load Students for Result Entry
**Steps:**
1. Select an exam
2. Select class/section
3. Load student list

**Backend API Check:**
- `GET /api/exam/results/exam-students?examId=xxx&classId=xxx`

**Expected Result:**
- ✅ All students in class loaded
- ✅ Student details correct
- ✅ Previous results shown (if any)

### 8.3 Enter Exam Results
**Steps:**
1. For each student, enter:
   - Marks obtained
   - Total marks
   - Grade (if applicable)
   - Remarks
2. Save results

**Backend API Check:**
- `POST /api/exam/results`

**Expected Result:**
- ✅ Results saved
- ✅ Grades calculated automatically
- ✅ Students notified (if enabled)

### 8.4 Update Exam Results
**Steps:**
1. View existing results
2. Click edit on a result
3. Modify marks/grade
4. Save changes

**Backend API Check:**
- `PUT /api/exam/results/:id`

**Expected Result:**
- ✅ Result updated
- ✅ Grade recalculated
- ✅ Change logged (audit trail)

### 8.5 Delete Exam Result
**Steps:**
1. Select a result to delete
2. Click delete
3. Confirm deletion

**Backend API Check:**
- `DELETE /api/exam/results/:id`

**Expected Result:**
- ✅ Result removed
- ✅ Can re-enter if needed

### 8.6 View Results Summary
**Steps:**
1. View results dashboard
2. Check statistics and analytics

**Backend API Check:**
- `GET /api/exam/results?examId=xxx`

**Expected Result:**
- ✅ Class average displayed
- ✅ Highest/lowest scores shown
- ✅ Grade distribution visible
- ✅ Can export results

---

## 9. STUDENT ANALYTICS (Priority: MEDIUM)

### 9.1 View Student Analytics Dashboard
**Frontend:** `/teacher/student-analytics`

**Steps:**
1. Navigate to Student Analytics
2. View analytics dashboard

**Expected Result:**
- ✅ Student performance overview
- ✅ Charts and graphs displayed
- ✅ Weak student identification
- ✅ Progress trends visible

### 9.2 View Individual Student Analytics
**Steps:**
1. Select a student from list
2. View detailed analytics

**Expected Result:**
- ✅ Attendance percentage
- ✅ Assignment completion rate
- ✅ Exam performance trends
- ✅ Subject-wise breakdown
- ✅ Comparison with class average

### 9.3 Identify Weak Students
**Steps:**
1. Navigate to "Weak Students" section
2. View students needing attention

**Expected Result:**
- ✅ Students with low performance highlighted
- ✅ Specific weak areas identified
- ✅ Recommended interventions shown

---

## 10. STUDENT OBSERVATIONS (Priority: MEDIUM)

### 10.1 Create Student Observation
**Frontend:** `/teacher/student-observations`

**Steps:**
1. Click "Add Observation"
2. Fill form:
   - Select student
   - Date
   - Observation type (Academic/Behavioral/Social)
   - Details/description
   - Severity/category
   - Action taken
3. Save observation

**Backend API Check:**
- `POST /api/observations/teacher`

**Expected Result:**
- ✅ Observation recorded
- ✅ Visible in student profile
- ✅ Parents notified (if configured)

### 10.2 View All Observations
**Steps:**
1. Navigate to observations list
2. Browse all recorded observations

**Backend API Check:**
- `GET /api/observations/teacher`

**Expected Result:**
- ✅ All observations listed
- ✅ Can filter by student/date/type
- ✅ Search functionality works

### 10.3 View Parent Insights from Observations
**Steps:**
1. Click "Parent Insights" section
2. View summary of observations

**Backend API Check:**
- `GET /api/observations/teacher/parent-insights`

**Expected Result:**
- ✅ Common behavioral patterns shown
- ✅ Areas of concern highlighted
- ✅ Positive observations featured

---

## 11. HEALTH UPDATES (Priority: MEDIUM)

### 11.1 View Student Health Dashboard
**Frontend:** `/teacher/health-updates`

**Steps:**
1. Navigate to Health Updates section
2. View health tracking interface

**Expected Result:**
- ✅ Student list with health status
- ✅ Recent health updates visible
- ✅ Can filter by class

### 11.2 Record Health Update
**Steps:**
1. Select a student
2. Click "Add Health Update"
3. Enter:
   - Date
   - Health concern/observation
   - Temperature (if fever)
   - Symptoms
   - Action taken
4. Save update

**Expected Result:**
- ✅ Health update recorded
- ✅ Parents notified (if configured)
- ✅ Visible in student health history

### 11.3 View Health History
**Steps:**
1. Select a student
2. View health history timeline

**Expected Result:**
- ✅ All health updates shown chronologically
- ✅ Can identify patterns
- ✅ Medical notes visible (if any)

---

## 12. AI-POWERED TEACHING (Priority: MEDIUM)

### 12.1 Access AI Teaching Suggestions
**Frontend:** `/teacher/ai-powered-teaching`

**Steps:**
1. Navigate to AI-Powered Teaching
2. View AI suggestions interface

**Expected Result:**
- ✅ AI suggestions displayed
- ✅ Lesson ideas generated
- ✅ Teaching strategies recommended

### 12.2 Generate Lesson Suggestions
**Steps:**
1. Enter topic/subject
2. Select class/level
3. Click "Generate Suggestions"
4. Review AI-generated content

**Expected Result:**
- ✅ Relevant lesson ideas generated
- ✅ Activities suggested
- ✅ Resources recommended
- ✅ Can save suggestions to lesson plan

### 12.3 AI Learning Path for Students
**Frontend:** `/teacher/ai-learning/:studentId/:subject`

**Steps:**
1. Select a student
2. Select subject
3. Navigate to AI Learning Path
4. Review personalized learning recommendations

**Backend API Check:**
- Related to AI learning routes

**Expected Result:**
- ✅ Personalized learning path generated
- ✅ Weak areas identified
- ✅ Resources recommended
- ✅ Progress tracking available

---

## 13. PRACTICE QUESTIONS (Priority: MEDIUM)

### 13.1 View Practice Questions
**Frontend:** `/teacher/practice-questions`

**Steps:**
1. Navigate to Practice Questions
2. View question bank

**Backend API Check:**
- `GET /api/practice/fetch`

**Expected Result:**
- ✅ Question bank displayed
- ✅ Can filter by subject/topic/difficulty
- ✅ Questions categorized properly

### 13.2 Create Practice Question Set
**Steps:**
1. Click "Create Question Set"
2. Fill form:
   - Title
   - Subject
   - Topic
   - Questions with answers
   - Difficulty level
   - Target class
3. Save question set

**Backend API Check:**
- `POST /api/practice/add`

**Expected Result:**
- ✅ Question set created
- ✅ Can assign to students
- ✅ Visible in question bank

### 13.3 Assign Practice Questions
**Steps:**
1. Select question set
2. Choose students/class
3. Set deadline (optional)
4. Assign

**Expected Result:**
- ✅ Questions assigned to students
- ✅ Students notified
- ✅ Submission tracking enabled

---

## 14. CLASS NOTES (Priority: MEDIUM)

### 14.1 Create Class Notes
**Frontend:** `/teacher/class-notes`

**Steps:**
1. Navigate to Class Notes
2. Click "Create Note"
3. Fill form:
   - Title
   - Subject
   - Class
   - Content/description
   - Attachments (PDFs, images)
   - Tags
4. Publish note

**Expected Result:**
- ✅ Note created and published
- ✅ Visible to selected students
- ✅ Files uploaded successfully
- ✅ Students notified

### 14.2 View My Class Notes
**Steps:**
1. Browse created notes
2. View notes by class/subject

**Expected Result:**
- ✅ All notes listed
- ✅ Can filter and search
- ✅ Edit/delete options available

### 14.3 Update Class Note
**Steps:**
1. Click edit on a note
2. Modify content
3. Save changes

**Expected Result:**
- ✅ Note updated
- ✅ Version history maintained (if implemented)
- ✅ Students notified of update

---

## 15. CLASS ROUTINE / TIMETABLE (Priority: MEDIUM)

### 15.1 View Class Routine
**Frontend:** `/teacher/class-routine`

**Steps:**
1. Navigate to Class Routine
2. View weekly schedule

**Backend API Check:**
- `GET /api/teacher/dashboard/routine`

**Expected Result:**
- ✅ Weekly timetable displayed
- ✅ Shows all assigned classes
- ✅ Time slots and subjects correct
- ✅ Can view different weeks

### 15.2 View Daily Schedule
**Steps:**
1. Select today's date
2. View classes for the day

**Expected Result:**
- ✅ Today's classes highlighted
- ✅ Upcoming classes shown first
- ✅ Class details (time, room, subject) correct

---

## 16. COMMUNICATION - CHAT (Priority: HIGH)

### 16.1 Access Chat Interface
**Frontend:** `/teacher/chat`

**Steps:**
1. Navigate to Chat section
2. View chat interface

**Backend API Check:**
- `GET /api/chat/me` (current user)
- `GET /api/chat/threads` (chat threads)

**Expected Result:**
- ✅ Chat interface loads
- ✅ Conversation list visible
- ✅ Can see online/offline status

### 16.2 View Chat Threads
**Steps:**
1. Browse list of conversations
2. Check thread details

**Expected Result:**
- ✅ All conversations listed
- ✅ Unread count shown
- ✅ Last message preview visible
- ✅ Sorted by recent activity

### 16.3 Start Direct Message
**Steps:**
1. Click "New Message" or "Start Chat"
2. Select recipient (student/parent/teacher)
3. Type message
4. Send

**Backend API Check:**
- `POST /api/chat/threads/direct` (create thread)
- `POST /api/chat/threads/:threadId/messages` (send message)

**Expected Result:**
- ✅ New thread created
- ✅ Message sent successfully
- ✅ Real-time delivery (if recipient online)
- ✅ Notification sent to recipient

### 16.4 Send Message in Existing Thread
**Steps:**
1. Open existing conversation
2. Type message
3. Send

**Backend API Check:**
- `GET /api/chat/threads/:threadId/messages` (load messages)
- `POST /api/chat/threads/:threadId/messages` (send)

**Expected Result:**
- ✅ Message appears in chat
- ✅ Real-time updates work
- ✅ Delivered/seen status shown

### 16.5 Mark Messages as Seen
**Steps:**
1. Open conversation with unread messages
2. Messages should auto-mark as seen

**Backend API Check:**
- `PUT /api/chat/threads/:threadId/seen`

**Expected Result:**
- ✅ Unread count decreases
- ✅ Messages marked as read
- ✅ Sender sees "seen" status

### 16.6 Check Online Presence
**Steps:**
1. View chat list
2. Check online/offline indicators

**Backend API Check:**
- `GET /api/chat/threads/:threadId/presence`
- WebSocket connection for real-time presence

**Expected Result:**
- ✅ Online status shown accurately
- ✅ Updates in real-time
- ✅ Last seen time displayed for offline users

### 16.7 Test End-to-End Encryption (if enabled)
**Steps:**
1. Send messages with sensitive content
2. Verify encryption indicators

**Expected Result:**
- ✅ Encryption status shown
- ✅ Messages encrypted in transit and storage
- ✅ Only sender and recipient can read

---

## 17. PARENT MEETINGS (Priority: MEDIUM)

### 17.1 Schedule Parent Meeting
**Frontend:** `/teacher/parent-meetings`

**Steps:**
1. Navigate to Parent Meetings
2. Click "Schedule Meeting"
3. Fill form:
   - Select student/parent
   - Date and time
   - Duration
   - Purpose/agenda
   - Location/mode (in-person/virtual)
4. Send invitation

**Expected Result:**
- ✅ Meeting scheduled
- ✅ Parent notified via email/SMS
- ✅ Calendar entry created

### 17.2 View Scheduled Meetings
**Steps:**
1. View meetings calendar
2. Browse upcoming and past meetings

**Expected Result:**
- ✅ All meetings listed
- ✅ Status shown (Scheduled/Completed/Cancelled)
- ✅ Can filter by date/student

### 17.3 Update Meeting
**Steps:**
1. Click edit on a meeting
2. Modify details
3. Save changes

**Expected Result:**
- ✅ Meeting updated
- ✅ Parent notified of changes

### 17.4 Cancel Meeting
**Steps:**
1. Select meeting to cancel
2. Click cancel
3. Add cancellation reason
4. Confirm

**Expected Result:**
- ✅ Meeting cancelled
- ✅ Parent notified
- ✅ Calendar updated

### 17.5 Mark Meeting as Completed
**Steps:**
1. After meeting, click "Mark Complete"
2. Add meeting notes/summary
3. Save

**Expected Result:**
- ✅ Meeting marked complete
- ✅ Notes saved
- ✅ Visible in history

---

## 18. EXCUSE LETTERS (Priority: MEDIUM)

### 18.1 View Submitted Excuse Letters
**Frontend:** `/teacher/excuse-letters`

**Steps:**
1. Navigate to Excuse Letters
2. View list of letters

**Backend API Check:**
- `GET /api/excuse-letters/teacher`

**Expected Result:**
- ✅ All excuse letters listed
- ✅ Shows student name, date, reason
- ✅ Status shown (Pending/Approved/Rejected)

### 18.2 Review Excuse Letter
**Steps:**
1. Click on an excuse letter
2. Read details and reason

**Expected Result:**
- ✅ Full letter content displayed
- ✅ Attachments viewable (if any)
- ✅ Student and parent details shown

### 18.3 Approve Excuse Letter
**Steps:**
1. Open pending excuse letter
2. Click "Approve"
3. Add comments (optional)
4. Confirm approval

**Backend API Check:**
- `PATCH /api/excuse-letters/teacher/:id`

**Expected Result:**
- ✅ Letter status changed to Approved
- ✅ Parent/student notified
- ✅ Attendance adjusted (if configured)

### 18.4 Reject Excuse Letter
**Steps:**
1. Open pending excuse letter
2. Click "Reject"
3. Add reason for rejection
4. Confirm

**Backend API Check:**
- `PATCH /api/excuse-letters/teacher/:id`

**Expected Result:**
- ✅ Letter status changed to Rejected
- ✅ Reason sent to parent/student
- ✅ Notification sent

---

## 19. FEEDBACK PORTAL (Priority: MEDIUM)

### 19.1 View Feedback Dashboard
**Frontend:** `/teacher/feedback`

**Steps:**
1. Navigate to Feedback section
2. View feedback overview

**Backend API Check:**
- `GET /api/teacher/dashboard/feedback`

**Expected Result:**
- ✅ Received feedback displayed
- ✅ Can filter by date/type
- ✅ Ratings/compliments visible

### 19.2 Provide Feedback to Students
**Steps:**
1. Select a student
2. Click "Give Feedback"
3. Fill form:
   - Subject area
   - Feedback type (Positive/Constructive)
   - Comments
   - Areas for improvement
   - Strengths
4. Submit feedback

**Expected Result:**
- ✅ Feedback sent to student
- ✅ Parent notified (if configured)
- ✅ Visible in student profile

### 19.3 View Received Feedback
**Steps:**
1. Check "Feedback Received" section
2. Read feedback from admin/parents

**Expected Result:**
- ✅ All feedback shown
- ✅ Can respond to feedback (if allowed)

---

## 20. NOTIFICATIONS (Priority: MEDIUM)

### 20.1 View Notifications
**Frontend:** Check notification bell/icon in header

**Steps:**
1. Click notification icon
2. View notification list

**Backend API Check:**
- `GET /api/notifications/teacher`

**Expected Result:**
- ✅ All notifications listed
- ✅ Unread count displayed
- ✅ Recent notifications shown first

### 20.2 View Unread Count
**Backend API Check:**
- `GET /api/notifications/user/unread-count`

**Expected Result:**
- ✅ Accurate unread count shown
- ✅ Updates in real-time

### 20.3 Mark Notification as Read
**Steps:**
1. Click on a notification
2. Should auto-mark as read

**Backend API Check:**
- `PATCH /api/notifications/user/:id/read`

**Expected Result:**
- ✅ Notification marked as read
- ✅ Unread count decreases
- ✅ Visual indicator changes

### 20.4 Dismiss Notification
**Steps:**
1. Find notification to dismiss
2. Click dismiss/close button

**Backend API Check:**
- `PATCH /api/notifications/user/:id/dismiss`

**Expected Result:**
- ✅ Notification removed from list

### 20.5 Mark All as Read
**Steps:**
1. Click "Mark all as read" button
2. Confirm

**Backend API Check:**
- `POST /api/notifications/user/read-all`

**Expected Result:**
- ✅ All notifications marked as read
- ✅ Unread count set to 0

---

## 21. HOLIDAYS CALENDAR (Priority: LOW)

### 21.1 View Holidays
**Frontend:** `/teacher/holidays`

**Steps:**
1. Navigate to Holidays section
2. View holiday calendar

**Backend API Check:**
- `GET /api/holidays/teacher`

**Expected Result:**
- ✅ All holidays listed
- ✅ Calendar view available
- ✅ Holiday details (name, date, type) shown
- ✅ Can filter by month

---

## 22. COMPLAINTS (Priority: MEDIUM)

### 22.1 View Related Complaints
**Steps:**
1. Navigate to complaints section (if available in UI)
2. View complaints involving you

**Backend API Check:**
- `GET /api/teacher/dashboard/complaints`

**Expected Result:**
- ✅ Complaints listed
- ✅ Status shown (Open/In Progress/Resolved)
- ✅ Complaint details visible

### 22.2 Update Complaint Status
**Steps:**
1. Open a complaint
2. Update status or add response
3. Save

**Backend API Check:**
- `PUT /api/teacher/dashboard/complaints/:id/status`

**Expected Result:**
- ✅ Status updated
- ✅ Response recorded
- ✅ Relevant parties notified

---

## 23. ACADEMIC ALCOVE (Priority: LOW)

### 23.1 View Alcove Posts
**Frontend:** `/teacher/alcove` (Teacher Academic Alcove)

**Steps:**
1. Navigate to Academic Alcove
2. Browse posts

**Backend API Check:**
- `GET /api/alcove/posts`

**Expected Result:**
- ✅ All posts displayed
- ✅ Can filter by subject/topic
- ✅ Author information shown

### 23.2 Create Alcove Post
**Steps:**
1. Click "Create Post"
2. Fill form:
   - Title
   - Content/description
   - Subject/tags
   - Attachments (files, links)
3. Publish post

**Backend API Check:**
- `POST /api/alcove/posts`

**Expected Result:**
- ✅ Post created and published
- ✅ Visible to other teachers
- ✅ Notifications sent (if configured)

### 23.3 Update Alcove Post
**Steps:**
1. Find your post
2. Click edit
3. Modify content
4. Save changes

**Backend API Check:**
- `PATCH /api/alcove/posts/:id`

**Expected Result:**
- ✅ Post updated
- ✅ Edit timestamp shown

### 23.4 Delete Alcove Post
**Steps:**
1. Find post to delete
2. Click delete
3. Confirm deletion

**Backend API Check:**
- `DELETE /api/alcove/posts/:id`

**Expected Result:**
- ✅ Post removed
- ✅ Comments/submissions handled

### 23.5 Comment on Posts
**Steps:**
1. Open a post
2. Scroll to comments section
3. Write comment
4. Submit

**Backend API Check:**
- `POST /api/alcove/posts/:id/comments`

**Expected Result:**
- ✅ Comment added
- ✅ Post author notified
- ✅ Comment visible to others

### 23.6 Submit Alcove Assignment (if applicable)
**Steps:**
1. If post is an assignment, submit work
2. Upload files
3. Submit

**Backend API Check:**
- `POST /api/alcove/posts/:postId/submissions`

**Expected Result:**
- ✅ Submission recorded
- ✅ Files uploaded

---

## 24. INTEGRATION & REAL-TIME TESTING

### 24.1 WebSocket Connection
**Steps:**
1. Open browser DevTools
2. Check WebSocket connections
3. Verify real-time features work

**Expected Result:**
- ✅ WebSocket connected
- ✅ Real-time chat works
- ✅ Live presence updates
- ✅ Notification popups appear instantly

### 24.2 File Upload Testing
**Steps:**
1. Test file uploads in various features:
   - Assignment creation
   - Profile picture
   - Class notes
   - Expense receipts
2. Upload different file types and sizes

**Expected Result:**
- ✅ Files upload successfully
- ✅ Progress indicator shown
- ✅ File size limits enforced
- ✅ File type validation works
- ✅ Can download uploaded files

### 24.3 Pagination Testing
**Steps:**
1. Navigate to pages with long lists
2. Test pagination controls
3. Try different page sizes

**Expected Result:**
- ✅ Pagination works correctly
- ✅ Page numbers accurate
- ✅ "Next" and "Previous" functional
- ✅ Can jump to specific page

### 24.4 Search & Filter Testing
**Steps:**
1. Test search functionality across modules:
   - Student search
   - Assignment search
   - Attendance filters
2. Try different search terms

**Expected Result:**
- ✅ Search returns relevant results
- ✅ Filters work correctly
- ✅ Can combine multiple filters
- ✅ Clear filters option works

---

## 25. EDGE CASES & ERROR HANDLING

### 25.1 Network Errors
**Steps:**
1. Disconnect internet temporarily
2. Try to perform actions
3. Reconnect

**Expected Result:**
- ✅ Proper error messages shown
- ✅ Retry mechanisms work
- ✅ Data not lost on reconnect
- ✅ Offline indicators displayed

### 25.2 Invalid Data Submission
**Steps:**
1. Try submitting forms with invalid data:
   - Empty required fields
   - Invalid dates
   - Negative numbers for marks
   - Oversized files
2. Check validation

**Expected Result:**
- ✅ Form validation prevents submission
- ✅ Clear error messages shown
- ✅ Fields highlighted correctly
- ✅ No API call made for invalid data

### 25.3 Duplicate Entries
**Steps:**
1. Try creating duplicate records:
   - Mark attendance twice for same day
   - Double submit assignment
2. Check handling

**Expected Result:**
- ✅ System prevents duplicates
- ✅ Appropriate warning shown
- ✅ Option to update existing record

### 25.4 Unauthorized Access
**Steps:**
1. Try accessing resources without permission
2. Check role-based access control

**Expected Result:**
- ✅ Access denied messages
- ✅ Redirect to appropriate page
- ✅ No sensitive data exposed

### 25.5 Session Expiry
**Steps:**
1. Wait for session to expire (or manually clear token)
2. Try to perform an action

**Expected Result:**
- ✅ Redirected to login page
- ✅ Session expiry message shown
- ✅ Can login and resume work

---

## 26. PERFORMANCE TESTING

### 26.1 Page Load Times
**Steps:**
1. Use browser DevTools (Network tab)
2. Measure page load times
3. Check for performance bottlenecks

**Expected Result:**
- ✅ Dashboard loads < 2 seconds
- ✅ List pages load < 3 seconds
- ✅ No unnecessary API calls
- ✅ Assets cached properly

### 26.2 Large Data Handling
**Steps:**
1. Test with large datasets:
   - Class with 100+ students
   - 500+ assignments
   - Long chat history
2. Check performance

**Expected Result:**
- ✅ Pagination handles large datasets
- ✅ No browser freezing
- ✅ Smooth scrolling
- ✅ Virtual scrolling (if implemented)

### 26.3 Concurrent Operations
**Steps:**
1. Open multiple tabs
2. Perform actions in different tabs simultaneously
3. Check data consistency

**Expected Result:**
- ✅ Data stays consistent across tabs
- ✅ Real-time updates in all tabs
- ✅ No conflicts or race conditions

---

## 27. MOBILE RESPONSIVENESS (If applicable)

### 27.1 Mobile View Testing
**Steps:**
1. Open in mobile browser or use DevTools mobile view
2. Test key features on mobile:
   - Dashboard navigation
   - Attendance marking
   - Assignment grading
   - Chat interface

**Expected Result:**
- ✅ Responsive design works
- ✅ Touch interactions smooth
- ✅ No horizontal scrolling
- ✅ Mobile-friendly menus

---

## BACKEND API TESTING CHECKLIST

### Using Postman/Thunder Client:

1. **Authentication Flow**
   - Test login with valid credentials
   - Test login with invalid credentials
   - Test token refresh
   - Test logout

2. **Authorization Testing**
   - Test protected routes without token
   - Test with expired token
   - Test with wrong role token
   - Test cross-user data access

3. **CRUD Operations**
   - Test all Create operations
   - Test all Read operations
   - Test all Update operations
   - Test all Delete operations
   - Verify cascade deletes work correctly

4. **Validation Testing**
   - Test with missing required fields
   - Test with invalid data types
   - Test with out-of-range values
   - Test SQL injection attempts
   - Test XSS attempts

5. **Rate Limiting (if implemented)**
   - Test API rate limits
   - Verify 429 responses for excessive requests

6. **File Upload Testing**
   - Test valid file uploads
   - Test oversized files
   - Test invalid file types
   - Test upload without authentication

---

## DATABASE VERIFICATION

### Using MongoDB Compass:

1. **Data Integrity**
   - Verify records created correctly
   - Check foreign key references
   - Validate data types
   - Check indexes

2. **Cascading Operations**
   - Delete teacher, verify related data handled
   - Update class, verify allocations updated
   - Check orphaned records

3. **Audit Trail**
   - Verify createdAt timestamps
   - Verify updatedAt timestamps
   - Check audit logs (if implemented)

---

## REPORTING ISSUES

When you find a bug, document:
1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Screenshots/console errors**
5. **Browser and version**
6. **API endpoint (if backend issue)**
7. **Network tab details**

---

## TESTING PRIORITY ORDER

**Phase 1 - Critical Features (Day 1):**
1. Authentication & Profile
2. Dashboard Overview
3. Attendance Management
4. Assignment Management
5. Exam & Result Management

**Phase 2 - Core Features (Day 2):**
6. My Work Portal (Leave, Expenses, Work Attendance)
7. Lesson Planning
8. Student Analytics
9. Chat/Communication
10. Notifications

**Phase 3 - Secondary Features (Day 3):**
11. Student Observations
12. Health Updates
13. Practice Questions
14. Class Notes
15. Parent Meetings

**Phase 4 - Additional Features (Day 4):**
16. Excuse Letters
17. Feedback Portal
18. AI-Powered Teaching
19. Class Routine
20. Holidays
21. Academic Alcove

**Phase 5 - Edge Cases & Performance (Day 5):**
22. Error handling
23. Edge cases
24. Performance testing
25. Security testing
26. Mobile responsiveness

---

## AUTOMATED TESTING SUGGESTIONS

Consider writing automated tests for:
1. **Unit Tests:** Individual component testing
2. **Integration Tests:** API endpoint testing
3. **E2E Tests:** Full user flow testing (using Cypress/Playwright)
4. **Load Tests:** Performance under load (using k6/JMeter)

---

## CONCLUSION

This testing guide covers all major functionality in the teacher portal. Follow the phases systematically and document all findings. Good luck with testing!

**Total Features to Test:** 100+ distinct features across 27 main pages
**Estimated Testing Time:** 4-5 days for comprehensive testing
**Backend Endpoints:** 100+ API routes to verify