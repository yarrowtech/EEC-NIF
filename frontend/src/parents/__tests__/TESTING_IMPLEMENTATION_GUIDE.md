# Parents Portal Testing Implementation Guide

## Overview
This document provides a comprehensive testing strategy and implementation guide for all components in the Parents Portal (`frontend/src/parents`).

## Test Infrastructure

### ✅ Completed Setup
1. **Test Utilities** (`__utils__/testUtils.js`)
   - Custom render functions with Router wrapper
   - Mock fetch implementation
   - Mock Socket.io implementation
   - Mock Razorpay, Jitsi, jsPDF utilities
   - Helper functions for common test scenarios

2. **Mock Data** (`__mocks__/mockData.js`)
   - Parent profiles
   - Attendance records
   - Report cards
   - Invoices and payments
   - Meetings
   - Complaints
   - Chat threads and messages
   - Class routines
   - Holidays
   - Achievements
   - Observations

3. **Completed Test Files**
   - ✅ **ParentPortal.test.jsx** - 20 passing tests (6 skipped for async fixes)
   - ✅ **FeesPayment.test.jsx** - 5 passing tests (19 pending async fixes)

---

## Component-by-Component Testing Guide

### 1. ParentDashboard.jsx

**Test File:** `ParentDashboard.test.jsx`

**Test Cases to Implement:**

#### Render Tests
- [ ] Renders without crashing
- [ ] Displays welcome message with correct greeting (Morning/Afternoon/Evening)
- [ ] Shows current time that updates every 60 seconds

#### Metrics Display Tests
- [ ] Displays average attendance percentage across all children
- [ ] Shows upcoming PTM count
- [ ] Shows number of linked children
- [ ] Displays open invoices count

#### Ward Overview Tests
- [ ] Renders ward cards for each child
- [ ] Shows attendance percentage per child
- [ ] Displays child name and ID correctly
- [ ] Shows "No children linked" when children array is empty

#### Data Loading Tests
- [ ] Fetches attendance data on mount
- [ ] Fetches meetings data on mount
- [ ] Fetches parent profile on mount
- [ ] Handles API errors gracefully with error messages

#### Dynamic Updates Tests
- [ ] Time updates every 60 seconds
- [ ] Greeting changes based on current time of day

#### Edge Cases
- [ ] Handles zero attendance records
- [ ] Handles zero upcoming meetings
- [ ] Handles undefined or null children data
- [ ] Displays fallback UI when data is loading

**Implementation Template:**
```javascript
describe('ParentDashboard', () => {
  beforeEach(() => {
    // Setup mocks for attendance, meetings, profile APIs
  });

  test('displays welcome message with correct greeting', () => {
    // Mock current time
    // Render component
    // Assert correct greeting appears
  });

  test('calculates average attendance correctly', async () => {
    // Mock attendance data for multiple children
    // Render component
    // Wait for data to load
    // Assert correct average is displayed
  });
});
```

---

### 2. AttendanceReport.jsx

**Test File:** `AttendanceReport.test.jsx`

**Test Cases:**

#### Render Tests
- [ ] Renders without crashing
- [ ] Displays month selector
- [ ] Shows child selection dropdown
- [ ] Renders attendance summary cards

#### Month Filter Tests
- [ ] Month selector shows current month by default
- [ ] Selecting different month triggers API call with correct parameter
- [ ] Month change updates displayed attendance records

#### Child Selection Tests
- [ ] Dropdown shows all linked children
- [ ] Selecting child filters attendance to that child
- [ ] Child selection triggers API call with correct studentId

#### Attendance Display Tests
- [ ] Shows attendance percentage
- [ ] Displays present days count
- [ ] Displays absent days count
- [ ] Shows total sessions count
- [ ] Renders attendance table with date, time, status

#### Status Indicators Tests
- [ ] Present status shows green badge
- [ ] Absent status shows red badge
- [ ] Late status (if applicable) shows yellow badge

#### Edge Cases
- [ ] Handles future months (no data)
- [ ] Handles months with no attendance records
- [ ] Validates month input format
- [ ] Handles partial month data (current month)

**Mock Data Required:**
```javascript
const mockMonthlyAttendance = {
  student: 'student1',
  month: '2025-01',
  attendance: [
    { date: '2025-01-15', status: 'present', session: 'Morning' },
    { date: '2025-01-16', status: 'absent', session: 'Morning' },
  ],
  summary: {
    percentage: 75,
    present: 15,
    absent: 5,
    total: 20,
  },
};
```

---

### 3. AcademicReport.jsx & ResultsView.jsx

**Test Files:** `AcademicReport.test.jsx`, `ResultsView.test.jsx`

**Test Cases:**

#### Render Tests
- [ ] Component renders without errors
- [ ] Shows child selection dropdown
- [ ] Displays report card when data is available

#### Report Card Display Tests
- [ ] Shows exam name and date
- [ ] Displays overall percentage
- [ ] Shows overall grade
- [ ] Displays total marks and obtained marks

#### Subject List Tests
- [ ] Renders all subjects
- [ ] Shows marks for each subject
- [ ] Displays percentage for each subject
- [ ] Shows grade for each subject
- [ ] Grade badges have correct colors (A+ green, F red, etc.)

#### View Toggle Tests
- [ ] Switches between detailed and summary view
- [ ] Detailed view shows all subject information
- [ ] Summary view shows condensed information

#### PDF Export Tests
- [ ] Export button is visible
- [ ] Clicking export triggers `downloadSingleReportCardPdf()`
- [ ] PDF is generated with correct data

#### Edge Cases
- [ ] Handles no report cards scenario
- [ ] Handles missing subject data
- [ ] Handles invalid/non-standard grades
- [ ] Handles subjects with 0 marks

**Mock PDF Function:**
```javascript
jest.mock('../../utils/pdfUtils', () => ({
  downloadSingleReportCardPdf: jest.fn(),
}));
```

---

### 4. ParentChat.jsx (P0 CRITICAL)

**Test File:** `ParentChat.test.jsx`

**Priority:** HIGH - Real-time communication with E2EE

**Test Cases:**

#### Render Tests
- [ ] Component renders without crashing
- [ ] Shows thread list
- [ ] Displays message input
- [ ] Shows send button

#### Socket Connection Tests
- [ ] Socket connects on component mount
- [ ] Socket disconnects on component unmount
- [ ] Handles connection errors gracefully
- [ ] Reconnects after network failure

#### Thread Management Tests
- [ ] Fetches and displays all conversation threads
- [ ] Shows last message in each thread
- [ ] Displays unread count for threads
- [ ] Clicking thread loads messages

#### Message Display Tests
- [ ] Messages display in chronological order
- [ ] Sender's messages align right
- [ ] Receiver's messages align left
- [ ] Shows message timestamp
- [ ] Displays sender name

#### Send Message Tests
- [ ] Typing in input updates draft state
- [ ] Clicking send emits message via socket
- [ ] Message appears in chat after sending
- [ ] Input clears after sending
- [ ] Prevents sending empty messages

#### Encryption Tests (E2EE)
- [ ] Messages are encrypted before sending
- [ ] Received messages are decrypted
- [ ] Encryption key is generated if not exists
- [ ] Private keys stored securely in localStorage
- [ ] No plaintext messages in network logs

#### Typing Indicator Tests
- [ ] Shows "typing..." when other user is typing
- [ ] Typing indicator has debounce
- [ ] Typing indicator disappears after timeout

#### Online Status Tests
- [ ] Shows green dot for online users
- [ ] Shows "Last seen at" for offline users
- [ ] Online status updates via socket events

#### Theme & Wallpaper Tests
- [ ] 6 theme options available
- [ ] Selecting theme changes chat colors
- [ ] 6 wallpaper options available
- [ ] Selecting wallpaper changes background

#### Cache Tests
- [ ] Reads from cache before API call (15min TTL)
- [ ] Writes to cache after successful API call
- [ ] Cache cleared after 15 minutes
- [ ] Correct cache keys generated per thread

#### Message Delivery Tests
- [ ] Shows "sent" status initially
- [ ] Updates to "delivered" when received by server
- [ ] Updates to "seen" when read by recipient

#### Edge Cases
- [ ] Handles empty thread list
- [ ] Handles thread with no messages
- [ ] Handles long messages (>500 characters)
- [ ] Emoji support in messages
- [ ] Handles concurrent typing from multiple users

**Mock Socket Implementation:**
```javascript
const mockSocket = {
  on: jest.fn((event, handler) => {
    eventHandlers[event] = handler;
  }),
  emit: jest.fn(),
  disconnect: jest.fn(),
  connected: true,
};

global.io = jest.fn(() => mockSocket);
```

---

### 5. PTMPortal.jsx

**Test File:** `PTMPortal.test.jsx`

**Test Cases:**

#### Render Tests
- [ ] Component renders successfully
- [ ] Shows meeting tabs (Upcoming, Past, Pending)
- [ ] Displays meeting list

#### Meeting List Tests
- [ ] Fetches meetings on mount
- [ ] Displays all parent-teacher meetings
- [ ] Shows meeting status (Pending, Confirmed, Scheduled)
- [ ] Shows meeting type icons (In-Person, Phone, Video)

#### Meeting Status Tests
- [ ] Pending meetings show confirm button
- [ ] Confirmed meetings show details
- [ ] Scheduled meetings show join button (for video)
- [ ] Past meetings show feedback option

#### Meeting Confirmation Tests
- [ ] Clicking confirm button calls API
- [ ] Meeting status updates after confirmation
- [ ] Shows success message after confirmation
- [ ] Handles confirmation error

#### Reschedule Functionality Tests
- [ ] Reschedule form appears when requested
- [ ] Form has date and time selectors
- [ ] Submitting form calls reschedule API
- [ ] Form closes after successful reschedule

#### Feedback Form Tests
- [ ] Feedback form shows for completed meetings
- [ ] Form has rating and comment fields
- [ ] Submitting feedback calls API
- [ ] Shows success message after submission

#### Jitsi Video Integration Tests
- [ ] Video room launches for video meetings
- [ ] Jitsi iframe loads correctly
- [ ] Meeting link is generated correctly
- [ ] Copy link button works
- [ ] Leaving meeting closes iframe

#### Tab Filtering Tests
- [ ] Upcoming tab shows future meetings
- [ ] Past tab shows completed meetings
- [ ] Pending tab shows unconfirmed meetings

#### Edge Cases
- [ ] Handles no meetings scenario
- [ ] Handles overlapping meeting times
- [ ] Validates feedback for past meetings only
- [ ] Handles invalid video meeting URLs

**Mock Jitsi:**
```javascript
global.JitsiMeetExternalAPI = jest.fn(function(domain, options) {
  this.dispose = jest.fn();
  this.executeCommand = jest.fn();
});
```

---

### 6. ComplaintManagementSystem.jsx

**Test File:** `ComplaintManagementSystem.test.jsx`

**Test Cases:**

#### Render Tests
- [ ] Component renders without errors
- [ ] Shows complaint submission form
- [ ] Displays complaint history list

#### Form Display Tests
- [ ] Category dropdown shows all 7 categories
- [ ] Priority levels (Low, Medium, High, Critical) available
- [ ] Description textarea is present
- [ ] Submit button is visible

#### Form Submission Tests
- [ ] Submitting form calls POST API
- [ ] Form data sent correctly
- [ ] Form resets after successful submission
- [ ] Shows success message after submission

#### Smart Routing Tests
- [ ] Academic complaints linked to student
- [ ] Academic complaints sent to class teacher
- [ ] Non-academic complaints sent to admin
- [ ] Category determines routing correctly

#### Complaint List Tests
- [ ] Fetches complaints on mount
- [ ] Displays all submitted complaints
- [ ] Shows complaint status (Open, In Progress, Resolved)
- [ ] Displays complaint category, priority, date

#### Status Badges Tests
- [ ] Open status shows blue badge
- [ ] In Progress shows yellow badge
- [ ] Resolved shows green badge

#### Search and Filter Tests
- [ ] Search box filters complaints by keyword
- [ ] Filter by category works
- [ ] Filter by status works
- [ ] Filter by priority works

#### Validation Tests
- [ ] Validates required fields (category, description)
- [ ] Prevents submission with empty description
- [ ] Validates description length (<1000 characters)

#### Edge Cases
- [ ] Handles no complaints scenario
- [ ] Handles long descriptions (>1000 chars)
- [ ] Handles special characters in description

---

### 7. ClassRoutine.jsx & HolidayList.jsx

**Test Files:** `ClassRoutine.test.jsx`, `HolidayList.test.jsx`

#### ClassRoutine Tests

##### Grid Display Tests
- [ ] Timetable renders with 7 columns (Mon-Sun)
- [ ] Time slots render as rows
- [ ] Today's column is highlighted

##### Class Details Tests
- [ ] Shows subject name for each slot
- [ ] Displays instructor name
- [ ] Shows room number
- [ ] Empty slots show "-"

##### Child Filter Tests
- [ ] Dropdown shows all linked children
- [ ] Selecting child fetches their routine
- [ ] Routine updates when child selection changes

##### Refresh Tests
- [ ] Refresh button triggers API call
- [ ] Routine data reloads

##### Edge Cases
- [ ] Handles empty timetable
- [ ] Handles invalid time slots
- [ ] Handles classes with no instructor

#### HolidayList Tests

##### Display Tests
- [ ] Shows all holidays with date ranges
- [ ] Calculates holiday duration correctly
- [ ] Displays holiday name and description

##### PDF Export Tests
- [ ] PDF export button is visible
- [ ] Clicking export generates PDF
- [ ] PDF includes school logo and header
- [ ] PDF has proper formatting with borders

##### Year Filter Tests
- [ ] Filters holidays by selected year
- [ ] Shows current year holidays by default

##### Styling Tests
- [ ] Past holidays have different styling
- [ ] Future holidays highlighted

##### Edge Cases
- [ ] Handles no holidays scenario
- [ ] Handles single-day holidays
- [ ] Handles multi-week holidays

---

### 8. ParentObservationNonAcademic.jsx

**Test File:** `ParentObservationNonAcademic.test.jsx`

**Test Cases:**

#### Render Tests
- [ ] All 9 assessment sections render
- [ ] Child selection dropdown is visible
- [ ] Submit button is present

#### Assessment Sections Tests
1. **Home Behavior**
   - [ ] Obedience rating options displayed
   - [ ] Respect rating options displayed
   - [ ] Discipline rating options displayed

2. **Communication**
   - [ ] Openness rating displayed
   - [ ] Confidence rating displayed
   - [ ] Listening rating displayed

3. **Emotional State**
   - [ ] Mood rating displayed
   - [ ] Stress level rating displayed
   - [ ] Happiness rating displayed

4. **Social Skills**
   - [ ] Sibling relations rating
   - [ ] Friend relations rating
   - [ ] Conflict handling rating

5. **Habits**
   - [ ] Task completion rating
   - [ ] Time management rating

6. **Lifestyle**
   - [ ] Sleep quality rating
   - [ ] Eating habits rating
   - [ ] Physical activity rating

7. **Hobbies & Interests**
   - [ ] Text area for hobbies

8. **Personality Traits**
   - [ ] Multi-choice personality traits

9. **Key Concerns**
   - [ ] Behavioral concerns checkbox
   - [ ] Addiction concerns checkbox
   - [ ] Anxiety concerns checkbox

#### Emoji Indicators Tests
- [ ] Correct emojis for each rating level
- [ ] Emojis change when rating selected

#### Concern Level Tests
- [ ] Calculates Low concern level correctly
- [ ] Calculates Medium concern level correctly
- [ ] Calculates High concern level correctly

#### Progress Bar Tests
- [ ] Shows form completion percentage
- [ ] Updates as fields are filled

#### Submit Tests
- [ ] Validates required fields
- [ ] Calls POST API with form data
- [ ] Shows success message after submission
- [ ] Form resets after submission

#### History Tests
- [ ] Displays recent observations
- [ ] Shows observation date
- [ ] Displays concern level

#### Edge Cases
- [ ] Handles partial form completion
- [ ] Validates remark length (>500 chars)
- [ ] Handles multiple observations for same child

---

### 9. AchievementsView.jsx

**Test File:** `AchievementsView.jsx`

**Test Cases:**

#### Render Tests
- [ ] Component renders successfully
- [ ] Achievement cards display

#### Category Filter Tests
- [ ] Filter by Academic works
- [ ] Filter by Sports works
- [ ] Filter by Extra-Curricular works
- [ ] "All" filter shows all achievements

#### Achievement Display Tests
- [ ] Shows achievement title
- [ ] Displays description
- [ ] Shows achievement date
- [ ] Displays category
- [ ] Shows award type (Trophy, Medal, Certificate)
- [ ] Displays issuer

#### Timeline View Tests
- [ ] Achievements sorted chronologically
- [ ] Recent achievements at top

#### Certificate Download Tests
- [ ] Download link visible for achievements with certificates
- [ ] Clicking link downloads certificate
- [ ] Handles achievements without certificates

#### Statistics Tests
- [ ] Shows count per category
- [ ] Shows total achievements count

#### Category Icons Tests
- [ ] Academic achievements have correct emoji/icon
- [ ] Sports achievements have correct emoji/icon
- [ ] Extra-curricular have correct emoji/icon

#### Edge Cases
- [ ] Handles no achievements scenario
- [ ] Handles achievements with missing fields
- [ ] Handles broken certificate URLs

---

## Security & Performance Tests

### Security Tests (All Components)

#### XSS Prevention
- [ ] User input sanitized in all forms
- [ ] HTML injection prevented
- [ ] Script injection prevented

#### CSRF Protection
- [ ] API calls include CSRF tokens where applicable
- [ ] Tokens validated on backend

#### Token Handling
- [ ] Expired JWT handled gracefully
- [ ] Token refresh mechanism works
- [ ] No tokens logged to console

#### SQL Injection
- [ ] API inputs validated on backend
- [ ] Parameterized queries used

#### Sensitive Data
- [ ] No passwords in logs
- [ ] No tokens in network logs
- [ ] Sensitive data encrypted (E2EE in chat)

### Performance Tests

#### Load Time Tests
- [ ] Dashboard loads <3 seconds
- [ ] Components render without lag
- [ ] Large data sets handled efficiently

#### Socket Latency Tests
- [ ] Chat messages delivered <500ms
- [ ] Real-time updates appear promptly

#### API Response Tests
- [ ] All APIs respond <2 seconds
- [ ] Timeouts handled gracefully

#### Memory Leak Tests
- [ ] No memory leaks after 10 minutes of use
- [ ] Components unmount cleanly
- [ ] Event listeners removed

### Accessibility Tests

#### Keyboard Navigation
- [ ] All interactive elements accessible via Tab
- [ ] Enter key works on buttons
- [ ] Escape key closes modals

#### Screen Reader Support
- [ ] ARIA labels present on critical elements
- [ ] Form fields have labels
- [ ] Error messages announced

#### Color Contrast
- [ ] Text meets WCAG AA standards
- [ ] Button colors have sufficient contrast
- [ ] Status badges are distinguishable

---

## Running Tests

### Run All Tests
```bash
cd frontend
npm test
```

### Run Specific Test File
```bash
npm test -- ParentPortal.test.jsx
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Run in Watch Mode
```bash
npm test -- --watch
```

### Coverage Goals
- **Minimum:** 80% code coverage
- **Target:** 90% code coverage
- **Critical Components (P0):** 95% coverage
  - FeesPayment.jsx
  - ParentChat.jsx
  - PTMPortal.jsx

---

## Test Debugging Tips

### Common Issues

1. **Async Timing Issues**
   - Use `waitFor()` with increased timeout
   - Use `act()` for state updates
   - Mock timers with `jest.useFakeTimers()`

2. **Mock Not Working**
   - Ensure mock is defined before import
   - Use `jest.mock()` at top of file
   - Clear mocks in `afterEach()`

3. **Component Not Rendering**
   - Check console for errors
   - Verify all required props passed
   - Ensure mocks are set up correctly

4. **Tests Flaky**
   - Add explicit waits
   - Use `findBy` queries instead of `getBy`
   - Avoid testing implementation details

### Debugging Commands
```bash
# Run single test
npm test -- -t "test name"

# Show console logs
npm test -- --verbose

# Debug in Node
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## Next Steps

1. **Implement Remaining Test Files**
   - ParentDashboard.test.jsx
   - AttendanceReport.test.jsx
   - AcademicReport.test.jsx
   - ResultsView.test.jsx
   - ParentChat.test.jsx (HIGH PRIORITY)
   - PTMPortal.test.jsx
   - ComplaintManagementSystem.test.jsx
   - ClassRoutine.test.jsx
   - HolidayList.test.jsx
   - ParentObservationNonAcademic.test.jsx
   - AchievementsView.test.jsx

2. **Fix Skipped Tests**
   - Async timing issues in ParentPortal.test.jsx
   - Razorpay integration in FeesPayment.test.jsx

3. **Integration Tests**
   - Full user flows (login → view fees → pay)
   - Cross-component navigation
   - Data consistency across components

4. **E2E Tests (Cypress/Playwright)**
   - Complete payment flow
   - Chat conversation flow
   - PTM booking and joining

5. **Performance Monitoring**
   - Add performance benchmarks
   - Monitor bundle size
   - Track API response times

---

## Test Coverage Report

| Component | Status | Tests | Coverage |
|-----------|--------|-------|----------|
| ParentPortal | ✅ Done | 20/26 passing | ~75% |
| FeesPayment | 🟡 Partial | 5/27 passing | ~30% |
| ParentDashboard | ⏳ Pending | 0 | 0% |
| AttendanceReport | ⏳ Pending | 0 | 0% |
| AcademicReport | ⏳ Pending | 0 | 0% |
| ResultsView | ⏳ Pending | 0 | 0% |
| ParentChat | ⏳ Pending | 0 | 0% |
| PTMPortal | ⏳ Pending | 0 | 0% |
| ComplaintSystem | ⏳ Pending | 0 | 0% |
| ClassRoutine | ⏳ Pending | 0 | 0% |
| HolidayList | ⏳ Pending | 0 | 0% |
| ParentObservation | ⏳ Pending | 0 | 0% |
| AchievementsView | ⏳ Pending | 0 | 0% |

**Overall Progress:** 2/13 components tested (15%)
