# Microblog Frontend Testing Plan

## Overview

This document outlines the comprehensive testing strategy for the Microblog Frontend application. The testing approach includes unit tests, integration tests, and end-to-end (E2E) tests to ensure reliability, maintainability, and user experience quality.

## Testing Goals

1. **Coverage Target**: Achieve >80% code coverage across all modules
2. **E2E Coverage**: Test complete user workflows from signup to post interactions
3. **Regression Prevention**: Catch bugs before they reach production
4. **Documentation**: Tests serve as living documentation of expected behavior

## Test Structure

```
microblog-frontend/
├── src/
│   ├── components/
│   │   └── __tests__/          # Component unit tests
│   ├── pages/
│   │   └── __tests__/           # Page component tests
│   ├── services/
│   │   └── __tests__/           # Service/API tests
│   ├── context/
│   │   └── __tests__/           # Context tests
│   ├── utils/
│   │   └── __tests__/           # Utility function tests
│   └── test/
│       └── setup.js             # Test configuration
├── e2e/
│   ├── app.spec.js              # Basic navigation (existing)
│   ├── auth.spec.js             # Authentication flows
│   ├── posts.spec.js            # Post creation and interaction
│   ├── social.spec.js           # Follow/unfollow flows
│   └── replies.spec.js          # Reply and threading flows
└── coverage/                    # Coverage reports (gitignored)
```

## Unit Tests

### 1. Services (`src/services/__tests__/`)

#### `auth.test.js`
- ✅ `login()` - successful login, token storage, error handling
- ✅ `signup()` - successful signup, error handling
- ✅ `logout()` - token removal, API call
- ✅ `getCurrentUser()` - successful fetch, error handling
- ✅ `refreshToken()` - token refresh, storage update
- ✅ `isAuthenticated()` - token presence check
- ✅ `getToken()` - token retrieval

#### `posts.test.js`
- ✅ `getPosts()` - fetch with filters (timeline, mine, following)
- ✅ `getPosts()` - cursor pagination
- ✅ `getPost()` - single post fetch
- ✅ `createPost()` - post creation, parent_id handling
- ✅ `getReplies()` - replies fetch

#### `users.test.js`
- ✅ `getUser()` - user profile fetch
- ✅ `updateUser()` - user update
- ✅ `deleteUser()` - user deletion
- ✅ `followUser()` - follow action
- ✅ `unfollowUser()` - unfollow action

#### `api.test.js`
- ✅ Request interceptor - JWT token injection
- ✅ Response interceptor - 401 handling, token refresh
- ✅ Error handling - network errors, API errors
- ✅ Base URL configuration

### 2. Utils (`src/utils/__tests__/`)

#### `formatDate.test.js`
- ✅ "just now" (< 60 seconds)
- ✅ Minutes ago (1-59 minutes)
- ✅ Hours ago (1-23 hours)
- ✅ Days ago (1-6 days)
- ✅ Date format (> 7 days)
- ✅ Edge cases (null, invalid dates)

### 3. Components (`src/components/__tests__/`)

#### `Post.test.jsx`
- ✅ Renders post content
- ✅ Displays author information
- ✅ Shows formatted date
- ✅ Displays reply count
- ✅ Links to post detail
- ✅ Links to user profile
- ✅ Handles null/undefined post
- ✅ Shows "View thread" for replies

#### `PostForm.test.jsx`
- ✅ Renders form fields
- ✅ Character counter (200 max)
- ✅ Validation (empty, too long)
- ✅ Submit handler called
- ✅ Loading state
- ✅ Error display
- ✅ Reply mode vs post mode
- ✅ Success callback

#### `PostList.test.jsx`
- ✅ Renders list of posts
- ✅ Empty state
- ✅ Loading state
- ✅ "Load More" button visibility
- ✅ Pagination handler

#### `Navigation.test.jsx`
- ✅ Renders navigation links
- ✅ Shows login/signup when not authenticated
- ✅ Shows user info when authenticated
- ✅ Logout functionality

#### `Loading.test.jsx`
- ✅ Renders loading indicator

### 4. Context (`src/context/__tests__/`)

#### `AuthContext.test.jsx`
- ✅ Initial state (loading, no user)
- ✅ Authentication check on mount
- ✅ Successful login flow
- ✅ Failed login flow
- ✅ Signup flow with auto-login
- ✅ Logout flow
- ✅ Token refresh on mount
- ✅ Error handling (invalid token)

### 5. Pages (`src/pages/__tests__/`)

#### `Login.test.jsx`
- ✅ Form rendering
- ✅ Input handling
- ✅ Successful login redirect
- ✅ Error display
- ✅ Loading state
- ✅ Navigation to signup

#### `Signup.test.jsx`
- ✅ Form rendering
- ✅ Input handling
- ✅ Successful signup redirect
- ✅ Error display (validation, API errors)
- ✅ Loading state
- ✅ Navigation to login

#### `Home.test.jsx`
- ✅ Feed rendering
- ✅ Filter buttons (timeline, mine, following)
- ✅ Post creation form (when authenticated)
- ✅ Post list display
- ✅ Pagination
- ✅ Error handling

#### `PostDetail.test.jsx`
- ✅ Post rendering
- ✅ Replies display
- ✅ Reply form (when authenticated)
- ✅ Parent post link
- ✅ Loading state
- ✅ Error handling (not found)

#### `UserProfile.test.jsx`
- ✅ User info display
- ✅ Posts list
- ✅ Follow/unfollow button
- ✅ Own profile (no follow button)
- ✅ Pagination
- ✅ Loading state
- ✅ Error handling

## End-to-End Tests

### Test Environment Setup

**Prerequisites:**
- Backend API running on `http://localhost:3000`
- Test database seeded with known test data
- Frontend running on `http://localhost:5173`

**Test Data:**
- User 1: `testuser1` / `password123`
- User 2: `testuser2` / `password123`
- User 3: `testuser3` / `password123`

### E2E Test Suites

#### 1. Authentication Flow (`e2e/auth.spec.js`)

**Test: User Signup**
1. Navigate to signup page
2. Fill in username, password, description
3. Submit form
4. Verify redirect to home page
5. Verify user is logged in
6. Verify user info in navigation

**Test: User Login**
1. Navigate to login page
2. Enter valid credentials
3. Submit form
4. Verify redirect to home page
5. Verify user is logged in

**Test: Login with Invalid Credentials**
1. Navigate to login page
2. Enter invalid credentials
3. Submit form
4. Verify error message displayed
5. Verify user remains on login page

**Test: Logout**
1. Login as user
2. Click logout button
3. Verify redirect to home page
4. Verify user is logged out
5. Verify login/signup links visible

**Test: Protected Routes**
1. Try to access home page without login
2. Verify redirect to login (or public view)
3. Login
4. Verify access to protected routes

#### 2. Post Creation and Interaction (`e2e/posts.spec.js`)

**Test: Create New Post**
1. Login as user
2. Navigate to home page
3. Enter post content (< 200 chars)
4. Submit post
5. Verify post appears in feed
6. Verify post content is correct
7. Verify author is current user

**Test: Post Character Limit**
1. Login as user
2. Navigate to home page
3. Enter post content (200+ chars)
4. Verify character counter shows limit
5. Verify submit button is disabled
6. Reduce to 200 chars
7. Verify submit button enabled
8. Submit and verify success

**Test: View Post Detail**
1. Login as user
2. Navigate to home page
3. Click on a post
4. Verify post detail page loads
5. Verify post content displayed
6. Verify author information
7. Verify replies section visible

**Test: Feed Filters**
1. Login as user
2. Navigate to home page
3. Click "Timeline" filter
4. Verify timeline posts displayed
5. Click "My Posts" filter
6. Verify only user's posts displayed
7. Click "Following" filter
8. Verify only followed users' posts displayed

**Test: Pagination**
1. Login as user
2. Navigate to home page
3. Scroll to bottom
4. Click "Load More" button
5. Verify additional posts loaded
6. Verify posts appended (not replaced)

#### 3. Social Features (`e2e/social.spec.js`)

**Test: Follow Another User**
1. Login as User 1
2. Navigate to User 2's profile
3. Click "Follow" button
4. Verify button changes to "Unfollow"
5. Verify follower count updates (if displayed)
6. Navigate to "Following" feed
7. Verify User 2's posts appear

**Test: Unfollow User**
1. Login as User 1 (already following User 2)
2. Navigate to User 2's profile
3. Click "Unfollow" button
4. Verify button changes to "Follow"
5. Navigate to "Following" feed
6. Verify User 2's posts no longer appear

**Test: View User Profile**
1. Login as user
2. Click on a username in a post
3. Verify user profile page loads
4. Verify user information displayed
5. Verify user's posts listed
6. Verify follow/unfollow button (if not own profile)

**Test: Own Profile**
1. Login as User 1
2. Navigate to own profile
3. Verify no follow button displayed
4. Verify own posts listed
5. Verify profile information correct

**Test: Being Followed**
1. Login as User 1
2. Note follower count
3. Login as User 2
4. Follow User 1
5. Login as User 1
6. Verify follower count increased (if displayed)

#### 4. Replies and Threading (`e2e/replies.spec.js`)

**Test: Reply to Another User's Post**
1. Login as User 1
2. Navigate to home page
3. Click on User 2's post
4. Verify post detail page loads
5. Enter reply content
6. Submit reply
7. Verify reply appears in replies section
8. Verify reply author is User 1
9. Verify reply links to parent post

**Test: Reply to Another User's Reply**
1. Login as User 1
2. Navigate to a post with existing replies
3. Click on a reply by User 2
4. Verify post detail page loads (reply context)
5. Enter reply to the reply
6. Submit reply
7. Verify reply appears in replies section
8. Verify reply shows "View thread" link
9. Click "View thread" link
10. Verify parent post displayed

**Test: View Thread**
1. Login as user
2. Navigate to a post with replies
3. Click "View thread" on a reply
4. Verify parent post displayed
5. Verify reply displayed below parent
6. Verify thread structure is clear

**Test: Reply Count Display**
1. Login as user
2. Navigate to home page
3. Verify posts show reply count
4. Create a reply to a post
5. Navigate back to home
6. Verify reply count increased

**Test: Nested Replies**
1. Login as User 1
2. Reply to User 2's post
3. Login as User 2
4. Reply to User 1's reply
5. Login as User 1
6. Navigate to original post
7. Verify both replies displayed
8. Verify reply hierarchy is clear

#### 5. Complete User Journey (`e2e/complete-journey.spec.js`)

**Test: Complete User Workflow**
1. **Signup**: Create new account (User 4)
2. **Login**: Login with new account
3. **Create Post**: Post "Hello world!"
4. **View Profile**: Navigate to own profile, verify post
5. **Follow User**: Follow User 1
6. **View Following Feed**: Verify User 1's posts appear
7. **Reply to Post**: Reply to User 1's post
8. **View Thread**: Click on reply, verify thread structure
9. **View Another Profile**: Navigate to User 2's profile
10. **Follow Another User**: Follow User 2
11. **Create Another Post**: Post "Second post!"
12. **View Timeline**: Verify all posts from followed users appear
13. **Logout**: Logout and verify session cleared

## Coverage Configuration

### Vitest Coverage Setup

Add to `vitest.config.js`:
```javascript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  exclude: [
    'node_modules/',
    'src/test/',
    '**/*.config.js',
    '**/main.jsx',
    '**/App.jsx',
  ],
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80,
  },
}
```

### Coverage Reports

- **Text**: Console output during test runs
- **JSON**: `coverage/coverage-summary.json` for CI/CD
- **HTML**: `coverage/index.html` for detailed browser view

## Test Execution

### Unit Tests
```bash
# Run all unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test -- src/services/__tests__/auth.test.js
```

### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific test file
npm run test:e2e -- e2e/auth.spec.js

# Run in headed mode (see browser)
npm run test:e2e -- --headed
```

### CI/CD Integration

**GitHub Actions Example:**
```yaml
- name: Run unit tests
  run: npm test -- --coverage

- name: Run E2E tests
  run: npm run test:e2e
  env:
    VITE_API_URL: http://localhost:3000/api/v1
```

## Test Data Management

### E2E Test Fixtures

Create `e2e/fixtures/users.js`:
```javascript
export const testUsers = {
  user1: { username: 'testuser1', password: 'password123' },
  user2: { username: 'testuser2', password: 'password123' },
  user3: { username: 'testuser3', password: 'password123' },
};
```

### Test Helpers

Create `e2e/helpers/auth.js`:
```javascript
export async function loginAs(page, username, password) {
  await page.goto('/login');
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
}
```

## Implementation Priority

### Phase 1: Foundation (Week 1)
1. ✅ Setup coverage reporting
2. ✅ Unit tests for services (auth, posts, users, api)
3. ✅ Unit tests for utils (formatDate)
4. ✅ Basic E2E tests (auth flow)

### Phase 2: Components (Week 2)
1. ✅ Unit tests for all components
2. ✅ Unit tests for context (AuthContext)
3. ✅ Unit tests for pages
4. ✅ E2E tests for posts

### Phase 3: Complete Coverage (Week 3)
1. ✅ E2E tests for social features
2. ✅ E2E tests for replies
3. ✅ Complete user journey E2E test
4. ✅ Coverage reports and documentation

## Maintenance

### Regular Tasks
- Review and update tests when features change
- Monitor coverage reports (aim to maintain >80%)
- Update E2E tests when UI changes
- Add tests for bug fixes (regression tests)

### Best Practices
- Write tests before fixing bugs (TDD approach)
- Keep tests independent and isolated
- Use descriptive test names
- Mock external dependencies (API calls in unit tests)
- Use real API calls in E2E tests
- Clean up test data after E2E tests

## Success Metrics

- **Coverage**: >80% code coverage
- **E2E Coverage**: All critical user flows tested
- **Test Speed**: Unit tests < 30s, E2E tests < 5min
- **Reliability**: Tests pass consistently (>95% pass rate)
- **Maintainability**: Tests are readable and well-organized

## Notes

- E2E tests require backend API to be running
- Test data should be isolated (use test database)
- Consider using test factories for consistent test data
- Mock API responses in unit tests for faster execution
- Use Playwright's auto-waiting features for reliable E2E tests

