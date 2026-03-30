# Try These Commands Now! 🚀

Copy and paste these commands into your terminal to see tests in action.

---

## 🎯 Quick Start - Try These First

### 1️⃣ See All Your Test Files
```bash
cd "/media/koushik/New Volume/EEC-NIF/frontend"
npm test -- --listTests
```
**What you'll see:** List of all test files in your project

---

### 2️⃣ Run All Tests (Quick Check)
```bash
cd "/media/koushik/New Volume/EEC-NIF/frontend"
npm test
```
**What you'll see:**
```
 PASS  src/__tests__/example.test.jsx
 PASS  src/components/__tests__/LoginForm.test.jsx

Test Suites: 2 passed, 2 total
Tests:       20 passed, 20 total
Snapshots:   0 total
Time:        2.036 s
```

---

### 3️⃣ Run Just One Test File
```bash
cd "/media/koushik/New Volume/EEC-NIF/frontend"
npm test LoginForm
```
**What you'll see:**
```
 PASS  src/components/__tests__/LoginForm.test.jsx
Test Suites: 1 passed, 1 total
Tests:       18 passed, 18 total
```

---

### 4️⃣ Run Tests with Detailed Info
```bash
cd "/media/koushik/New Volume/EEC-NIF/frontend"
npm test -- --verbose
```
**What you'll see:** Each test name and its result in detail

---

### 5️⃣ Filter Tests by Name
```bash
cd "/media/koushik/New Volume/EEC-NIF/frontend"
npm test -- --testNamePattern="validation"
```
**What you'll see:**
```
Test Suites: 1 skipped, 1 passed, 1 of 2 total
Tests:       16 skipped, 4 passed, 20 total
Ran all test suites with tests matching "validation".
```
Only tests with "validation" in their name run!

---

### 6️⃣ Get Coverage Report
```bash
cd "/media/koushik/New Volume/EEC-NIF/frontend"
npm run test:coverage
```
**What you'll see:**
```
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|----------|---------|---------|-------------------
All files           |    1.31 |     0.37 |    1.22 |    1.43 |
 LoginForm.jsx      |   85.20 |    70.58 |   88.88 |   86.11 | 145-152,201-205
--------------------|---------|----------|---------|---------|-------------------
```
Shows which code is tested and which isn't!

---

## 🎮 Interactive Watch Mode

### 7️⃣ Start Watch Mode (Best for Development!)
```bash
cd "/media/koushik/New Volume/EEC-NIF/frontend"
npm run test:watch
```

**You'll see an interactive menu:**
```
Watch Usage
 › Press a to run all tests.
 › Press f to run only failed tests.
 › Press p to filter by a filename regex pattern.
 › Press t to filter by a test name regex pattern.
 › Press q to quit watch mode.
 › Press Enter to trigger a test run.
```

**Try this:**
1. Press `p`
2. Type `Login`
3. Now only LoginForm tests will run
4. Edit `src/components/LoginForm.jsx` and save
5. Watch tests auto-run!
6. Press `q` to quit

---

## 🔍 Filter Specific Test Groups

### 8️⃣ Run Only Form Validation Tests
```bash
cd "/media/koushik/New Volume/EEC-NIF/frontend"
npm test -- --testNamePattern="Form Validation"
```

### 9️⃣ Run Only API Tests
```bash
cd "/media/koushik/New Volume/EEC-NIF/frontend"
npm test -- --testNamePattern="API"
```

### 🔟 Run Only Rendering Tests
```bash
cd "/media/koushik/New Volume/EEC-NIF/frontend"
npm test -- --testNamePattern="Rendering"
```

---

## 🐛 Debugging Commands

### Run Tests with Full Error Details
```bash
cd "/media/koushik/New Volume/EEC-NIF/frontend"
npm test -- --verbose --expand
```

### Run Tests One at a Time (Easier to Debug)
```bash
cd "/media/koushik/New Volume/EEC-NIF/frontend"
npm test -- --runInBand
```

### See All Console Logs
```bash
cd "/media/koushik/New Volume/EEC-NIF/frontend"
npm test -- --verbose --silent=false
```

---

## 🎯 Backend Testing

### Run All Backend Tests
```bash
cd "/media/koushik/New Volume/EEC-NIF/backend"
npm test
```

### Backend Tests with Verbose Output
```bash
cd "/media/koushik/New Volume/EEC-NIF/backend"
npm test -- --verbose
```

### Backend Coverage
```bash
cd "/media/koushik/New Volume/EEC-NIF/backend"
npm run test:coverage
```

---

## 📊 Understanding the Output

### ✅ When Tests Pass
```
 PASS  src/components/__tests__/LoginForm.test.jsx
  LoginForm Component
    Rendering
      ✓ renders login form with all essential elements (45 ms)
      ✓ displays welcome message in login mode (12 ms)
```
- Green `PASS` = All tests in file passed
- ✓ = Individual test passed
- (45 ms) = Time it took

---

### ❌ When Tests Fail
```
 FAIL  src/components/__tests__/LoginForm.test.jsx
  LoginForm Component
    ✕ some test that failed (67 ms)

  ● LoginForm Component › some test that failed

    expect(received).toBe(expected)

    Expected: "Welcome"
    Received: "Hello"
```
- Red `FAIL` = Some tests failed
- ✕ = Failed test
- Shows what was expected vs what it got

---

### 📈 Coverage Report Explained
```
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|----------|---------|---------|-------------------
LoginForm.jsx       |   85.2  |   70.5   |   88.9  |   86.1  | 145-152,201-205
--------------------|---------|----------|---------|---------|-------------------
```

- **% Stmts**: 85.2% of code statements were executed in tests
- **% Branch**: 70.5% of if/else branches were tested
- **% Funcs**: 88.9% of functions were called
- **% Lines**: 86.1% of lines were run
- **Uncovered**: Lines 145-152 and 201-205 weren't tested

---

## 🎓 Practice Exercise

Try this sequence to get comfortable:

```bash
# 1. Go to frontend
cd "/media/koushik/New Volume/EEC-NIF/frontend"

# 2. Run all tests
npm test

# 3. Run just LoginForm tests
npm test LoginForm

# 4. Filter for validation tests only
npm test -- --testNamePattern="validation"

# 5. Get coverage report
npm run test:coverage

# 6. Start watch mode
npm run test:watch
# Press 'p', type 'Login', watch it run
# Press 'q' to quit

# 7. Run backend tests
cd "/media/koushik/New Volume/EEC-NIF/backend"
npm test
```

---

## 💡 Pro Tips

### Tip 1: Use Watch Mode While Coding
```bash
npm run test:watch
```
Tests run automatically when you save files!

### Tip 2: Test One Thing at a Time
```bash
npm test LoginForm
```
Faster than running all tests.

### Tip 3: Check Coverage Often
```bash
npm run test:coverage
```
See what needs testing.

### Tip 4: Filter by What You're Working On
```bash
npm test -- --testNamePattern="login"
```
Only run related tests.

---

## 🚀 Most Useful Commands (Bookmark These!)

```bash
# Frontend
cd "/media/koushik/New Volume/EEC-NIF/frontend"
npm test                                    # Run all
npm test LoginForm                          # Run specific file
npm run test:watch                          # Watch mode (best!)
npm run test:coverage                       # Coverage
npm test -- --testNamePattern="validation"  # Filter tests

# Backend
cd "/media/koushik/New Volume/EEC-NIF/backend"
npm test                    # Run all
npm test -- --verbose       # Detailed output
npm run test:coverage       # Coverage
```

---

## 🎯 Your First Testing Session

**Copy and paste these commands one by one:**

```bash
# Step 1: Navigate to frontend
cd "/media/koushik/New Volume/EEC-NIF/frontend"

# Step 2: See what tests you have
npm test -- --listTests

# Step 3: Run all tests
npm test

# Step 4: Run with details
npm test -- --verbose

# Step 5: Check coverage
npm run test:coverage

# Step 6: Try watch mode (press 'q' to quit when done)
npm run test:watch
```

**Congratulations! You've manually tested your application! 🎉**

---

## Need Help?

- **Tests won't run?** Make sure you're in the right directory:
  - Frontend: `cd "/media/koushik/New Volume/EEC-NIF/frontend"`
  - Backend: `cd "/media/koushik/New Volume/EEC-NIF/backend"`

- **Want to see more details?** Add `--verbose`:
  ```bash
  npm test -- --verbose
  ```

- **Tests running slow?** Run specific tests:
  ```bash
  npm test LoginForm
  ```

- **Stuck in watch mode?** Press `q` to quit

---

## What's Next?

1. ✅ You now know how to run tests manually
2. ✅ Try the commands above
3. ✅ Use watch mode while developing
4. ✅ Check the TESTING_GUIDE.md to learn how to write more tests
5. ✅ Start testing your other components!

Happy Testing! 🧪✨
