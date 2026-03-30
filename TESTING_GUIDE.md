# Testing Guide for EEC Project

This guide explains how to test different modules in your project with practical examples.

## Table of Contents
1. [Frontend Testing](#frontend-testing)
2. [Backend Testing](#backend-testing)
3. [Running Tests](#running-tests)
4. [Best Practices](#best-practices)

---

## Frontend Testing

### 1. Testing React Components

#### Basic Component Test Structure
```javascript
import { render, screen } from '@testing-library/react';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
  test('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

#### Testing Components with Router
Many components use `useNavigate` or `useLocation`. Wrap them with `BrowserRouter`:

```javascript
import { BrowserRouter } from 'react-router-dom';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

test('component with routing', () => {
  renderWithRouter(<YourComponent />);
});
```

#### Testing User Interactions
```javascript
import userEvent from '@testing-library/user-event';

test('handles button click', async () => {
  const user = userEvent.setup();
  render(<Button />);

  const button = screen.getByRole('button', { name: /click me/i });
  await user.click(button);

  expect(button).toHaveTextContent('Clicked');
});

test('handles text input', async () => {
  const user = userEvent.setup();
  render(<Input />);

  const input = screen.getByPlaceholderText('Enter text');
  await user.type(input, 'Hello World');

  expect(input).toHaveValue('Hello World');
});
```

### 2. Testing Forms

Example: Testing a registration form
```javascript
describe('RegistrationForm', () => {
  test('validates required fields', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);

    // Try to submit without filling fields
    await user.click(screen.getByRole('button', { name: /submit/i }));

    // Check for error messages
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  test('validates email format', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    await user.type(emailInput, 'invalid-email');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();

    render(<RegistrationForm onSubmit={mockSubmit} />);

    await user.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
});
```

### 3. Mocking API Calls

#### Mocking fetch
```javascript
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

test('fetches and displays data', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ name: 'John Doe', age: 30 }),
  });

  render(<UserProfile userId="123" />);

  expect(await screen.findByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('Age: 30')).toBeInTheDocument();

  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/users/123'),
    expect.any(Object)
  );
});

test('handles API errors', async () => {
  fetch.mockRejectedValueOnce(new Error('Network error'));

  render(<UserProfile userId="123" />);

  expect(await screen.findByText(/error/i)).toBeInTheDocument();
});
```

#### Mocking axios
```javascript
import axios from 'axios';
jest.mock('axios');

test('fetches data with axios', async () => {
  axios.get.mockResolvedValueOnce({
    data: { users: [{ id: 1, name: 'Alice' }] }
  });

  render(<UserList />);

  expect(await screen.findByText('Alice')).toBeInTheDocument();
});
```

### 4. Testing Context and State Management

```javascript
import { render, screen } from '@testing-library/react';
import { AuthContext } from '../contexts/AuthContext';

const mockAuthValue = {
  user: { name: 'John', role: 'admin' },
  login: jest.fn(),
  logout: jest.fn(),
};

const renderWithAuth = (component) => {
  return render(
    <AuthContext.Provider value={mockAuthValue}>
      {component}
    </AuthContext.Provider>
  );
};

test('displays user info from context', () => {
  renderWithAuth(<Dashboard />);
  expect(screen.getByText('Welcome, John')).toBeInTheDocument();
});
```

### 5. Testing Components with Navigation

```javascript
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

test('navigates to dashboard on success', async () => {
  render(<LoginForm />);

  // ... fill form and submit

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
```

---

## Backend Testing

### 1. Testing API Endpoints

Create tests in `backend/__tests__/api/` directory:

```javascript
const request = require('supertest');
const app = require('../../index'); // Export your Express app
const mongoose = require('mongoose');

describe('User API', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.TEST_DATABASE_URL);
  });

  afterAll(async () => {
    // Cleanup and close connection
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Clear database after each test
    await User.deleteMany({});
  });

  test('GET /api/users returns all users', async () => {
    // Create test data
    await User.create([
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
    ]);

    const response = await request(app)
      .get('/api/users')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0].name).toBe('Alice');
  });

  test('POST /api/users creates a new user', async () => {
    const newUser = {
      name: 'Charlie',
      email: 'charlie@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/users')
      .send(newUser)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Charlie');

    // Verify it was saved in database
    const savedUser = await User.findOne({ email: 'charlie@example.com' });
    expect(savedUser).toBeTruthy();
  });

  test('POST /api/users validates required fields', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'John' }) // Missing email and password
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});
```

### 2. Testing Authentication Endpoints

```javascript
describe('Authentication', () => {
  test('POST /api/auth/login with valid credentials', async () => {
    // Create a test user
    const user = await User.create({
      username: 'testuser',
      password: await bcrypt.hash('password123', 10),
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'password123' })
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('userType');
  });

  test('POST /api/auth/login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'wrong', password: 'wrong' })
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });

  test('protected route requires authentication', async () => {
    const response = await request(app)
      .get('/api/protected')
      .expect(401);

    expect(response.body.error).toMatch(/unauthorized/i);
  });

  test('protected route works with valid token', async () => {
    const token = generateValidToken(); // Your token generation logic

    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
```

### 3. Testing Middleware

```javascript
const authMiddleware = require('../../middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('calls next() with valid token', () => {
    req.headers.authorization = 'Bearer valid-token';
    // Mock jwt.verify to return user data

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });

  test('returns 401 without token', () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
  });
});
```

### 4. Testing Utility Functions

```javascript
const { validateEmail, hashPassword } = require('../../utils/helpers');

describe('Utility Functions', () => {
  describe('validateEmail', () => {
    test('returns true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    test('returns false for invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('hashPassword', () => {
    test('hashes password correctly', async () => {
      const password = 'myPassword123';
      const hashed = await hashPassword(password);

      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(20);
    });
  });
});
```

### 5. Testing Database Models

```javascript
const User = require('../../models/User');

describe('User Model', () => {
  test('creates user with valid data', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const user = await User.create(userData);

    expect(user._id).toBeDefined();
    expect(user.username).toBe('testuser');
    expect(user.email).toBe('test@example.com');
  });

  test('requires username field', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
    });

    await expect(user.save()).rejects.toThrow();
  });

  test('enforces unique email', async () => {
    await User.create({
      username: 'user1',
      email: 'duplicate@example.com',
      password: 'pass',
    });

    const duplicate = new User({
      username: 'user2',
      email: 'duplicate@example.com',
      password: 'pass',
    });

    await expect(duplicate.save()).rejects.toThrow();
  });
});
```

---

## Running Tests

### Frontend Tests
```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test LoginForm.test.jsx

# Run tests matching a pattern
npm test -- --testNamePattern="login"
```

### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test __tests__/api.test.js
```

---

## Best Practices

### 1. Test Organization
- Create `__tests__` folders next to the code you're testing
- Name test files: `ComponentName.test.jsx` or `functionName.test.js`
- Group related tests using `describe()` blocks

### 2. What to Test
✅ **DO Test:**
- User interactions (clicks, typing, form submissions)
- Component rendering with different props
- API calls and responses
- Error handling
- Validation logic
- Navigation behavior
- Conditional rendering

❌ **DON'T Test:**
- Implementation details (internal state, private methods)
- Third-party libraries (they have their own tests)
- CSS styling (use visual regression testing tools instead)

### 3. Test Independence
- Each test should be independent
- Use `beforeEach()` to set up fresh state
- Use `afterEach()` to clean up
- Don't rely on test execution order

### 4. Meaningful Test Names
```javascript
// ❌ Bad
test('test 1', () => { ... });

// ✅ Good
test('displays error message when login fails', () => { ... });
test('redirects to dashboard after successful login', () => { ... });
```

### 5. Arrange-Act-Assert Pattern
```javascript
test('adds item to cart', () => {
  // Arrange - Set up test data
  const item = { id: 1, name: 'Product' };

  // Act - Perform the action
  addToCart(item);

  // Assert - Verify the result
  expect(getCart()).toContain(item);
});
```

### 6. Use Testing Library Queries Properly
```javascript
// Priority order (from most to least preferred):
screen.getByRole('button', { name: /submit/i })  // ✅ Best
screen.getByLabelText('Email')                   // ✅ Good
screen.getByPlaceholderText('Enter email')       // ✅ Good
screen.getByText('Submit')                       // ⚠️ OK
screen.getByTestId('submit-button')              // ⚠️ Last resort
```

### 7. Async Testing
Always use `waitFor` or `findBy` for async operations:
```javascript
// ❌ Bad - might fail due to timing
test('loads data', () => {
  render(<DataComponent />);
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});

// ✅ Good
test('loads data', async () => {
  render(<DataComponent />);
  expect(await screen.findByText('Data loaded')).toBeInTheDocument();
});
```

### 8. Mock External Dependencies
- Mock API calls to avoid real network requests
- Mock timers for time-based functionality
- Mock third-party services

### 9. Test Coverage Goals
- Aim for 70-80% coverage
- Focus on critical paths first
- 100% coverage doesn't mean bug-free code

### 10. Keep Tests Fast
- Use test databases (in-memory when possible)
- Mock heavy operations
- Run unit tests frequently, integration tests less often

---

## Common Testing Patterns

### Testing Loading States
```javascript
test('shows loading spinner while fetching', async () => {
  render(<DataComponent />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});
```

### Testing Error Boundaries
```javascript
test('catches and displays errors', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
```

### Testing Conditional Rendering
```javascript
test('shows admin panel for admin users', () => {
  render(<Dashboard user={{ role: 'admin' }} />);
  expect(screen.getByText('Admin Panel')).toBeInTheDocument();
});

test('hides admin panel for regular users', () => {
  render(<Dashboard user={{ role: 'user' }} />);
  expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
});
```

---

## Next Steps

1. Check the example test: `frontend/src/components/__tests__/LoginForm.test.jsx`
2. Run the tests to see them pass
3. Start writing tests for your other components
4. Set up CI/CD to run tests automatically on commits

For more information:
- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
