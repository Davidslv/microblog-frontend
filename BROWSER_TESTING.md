# Browser Testing Guide

This guide provides step-by-step instructions for manually testing the frontend application in a browser to ensure all functionality works correctly end-to-end.

## Prerequisites

Before starting browser testing:

1. ✅ Backend API is running on `http://localhost:3000`
2. ✅ Frontend is running on `http://localhost:5173`
3. ✅ Database has test data (users, posts, follows)

### Quick Start

```bash
# Terminal 1 - Start Backend
cd /Users/davidslv/projects/microblog
bin/rails server -p 3000

# Terminal 2 - Start Frontend
cd /Users/davidslv/projects/microblog-frontend
npm run dev
```

## Test Scenarios

### 1. Initial Page Load (Unauthenticated)

**Steps:**
1. Open browser and navigate to `http://localhost:5173`
2. Check the page loads without errors

**Expected Results:**
- ✅ Page title shows "Microblog"
- ✅ Navigation bar is visible with "Login" and "Sign Up" buttons
- ✅ Feed section is visible
- ✅ Public posts are displayed (if any exist)
- ✅ No console errors in browser DevTools
- ✅ No network errors in Network tab

**Check Browser Console:**
- Open DevTools (F12 or Cmd+Option+I)
- Check Console tab for errors
- Check Network tab - should see successful API calls to `/api/v1/posts`

---

### 2. User Registration (Sign Up)

**Steps:**
1. Click "Sign Up" button in navigation
2. Fill in the form:
   - Username: `testuser123`
   - Password: `password123`
   - Description (optional): `Test user description`
3. Click "Sign Up" button

**Expected Results:**
- ✅ Form submits successfully
- ✅ User is automatically logged in
- ✅ Redirected to home page (`/`)
- ✅ Navigation shows username instead of "Login"
- ✅ Post form is visible (user can now create posts)
- ✅ JWT token is stored in localStorage (check DevTools → Application → Local Storage)

**Verify in Browser:**
- Open DevTools → Application → Local Storage
- Should see `jwt_token` key with a token value
- Check Network tab - should see successful `POST /api/v1/users` and `POST /api/v1/login`

---

### 3. User Login

**Steps:**
1. Click "Logout" (if logged in) or navigate to `/login`
2. Enter credentials:
   - Username: `testuser123` (or existing user)
   - Password: `password123`
3. Click "Login" button

**Expected Results:**
- ✅ Login form submits successfully
- ✅ User is authenticated
- ✅ Redirected to home page
- ✅ Navigation shows username
- ✅ Post form is visible
- ✅ JWT token stored in localStorage

**Verify API Response:**
- Check Network tab → `POST /api/v1/login`
- Response should include:
  ```json
  {
    "user": { "id": 1, "username": "testuser123", ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

### 4. Create a Post

**Steps:**
1. Ensure you're logged in
2. Scroll to the post form at the top of the feed
3. Type a post: `This is my first post from the React frontend!`
4. Watch the character counter (should show remaining characters)
5. Click "Post" button

**Expected Results:**
- ✅ Post form submits successfully
- ✅ Post appears immediately in the feed (at the top)
- ✅ Character counter resets
- ✅ Post shows your username and timestamp
- ✅ Post is clickable (links to post detail page)

**Verify in Network Tab:**
- Should see `POST /api/v1/posts` with status 201
- Request payload: `{ "content": "...", "parent_id": null }`
- Response should include the created post

**Verify in Database (Optional):**
```bash
cd /Users/davidslv/projects/microblog
bin/rails console
Post.last
# Should show the newly created post
```

---

### 5. View Post Detail

**Steps:**
1. Click on any post in the feed
2. Should navigate to `/posts/:id`

**Expected Results:**
- ✅ Post detail page loads
- ✅ Full post content is displayed
- ✅ Author information is visible
- ✅ Reply form is visible (if logged in)
- ✅ Replies section is visible (if post has replies)
- ✅ "Back to Feed" link works

**Verify API Call:**
- Check Network tab → `GET /api/v1/posts/:id`
- Response should include:
  ```json
  {
    "post": { ... },
    "replies": [ ... ],
    "pagination": { ... }
  }
  ```

---

### 6. Create a Reply

**Steps:**
1. Navigate to a post detail page
2. Scroll to the reply form
3. Type a reply: `This is a reply to the post!`
4. Click "Reply" button

**Expected Results:**
- ✅ Reply form submits successfully
- ✅ Reply appears in the replies section
- ✅ Reply shows your username and timestamp
- ✅ Reply is indented (visually nested)
- ✅ Character counter resets

**Verify API Call:**
- Should see `POST /api/v1/posts` with `parent_id` in payload
- Response should include the created reply

---

### 7. Feed Filters (Timeline, Mine, Following)

**Prerequisites:**
- You must be logged in
- You should have created some posts
- You should follow at least one user who has posts

**Steps:**
1. On the home page, you should see three filter buttons:
   - Timeline
   - My Posts
   - Following
2. Click each filter button and observe the feed

**Expected Results:**

**Timeline Filter:**
- ✅ Shows posts from you AND users you follow
- ✅ Posts are sorted by creation date (newest first)
- ✅ Button is highlighted (blue background)

**My Posts Filter:**
- ✅ Shows ONLY your posts
- ✅ No posts from other users
- ✅ Button is highlighted

**Following Filter:**
- ✅ Shows ONLY posts from users you follow
- ✅ Your own posts are NOT shown
- ✅ Button is highlighted

**Verify API Calls:**
- Check Network tab for `GET /api/v1/posts?filter=timeline`
- Check Network tab for `GET /api/v1/posts?filter=mine`
- Check Network tab for `GET /api/v1/posts?filter=following`
- Each should return appropriate posts

---

### 8. Pagination (Load More)

**Prerequisites:**
- Feed should have more than 20 posts (default page size)

**Steps:**
1. Scroll to the bottom of the feed
2. Click "Load More" button (if visible)
3. Observe new posts loading

**Expected Results:**
- ✅ "Load More" button appears when there are more posts
- ✅ Clicking loads additional posts
- ✅ New posts are appended to the list (not replacing)
- ✅ Loading indicator shows while fetching
- ✅ Button disappears when all posts are loaded

**Verify API Call:**
- Should see `GET /api/v1/posts?cursor=:cursor_id`
- Response should include pagination info:
  ```json
  {
    "posts": [ ... ],
    "pagination": {
      "cursor": 123,
      "has_next": true
    }
  }
  ```

---

### 9. User Profile

**Steps:**
1. Click on a username (e.g., `@username`) in any post
2. Should navigate to `/users/:id`

**Expected Results:**
- ✅ User profile page loads
- ✅ Username and description are displayed
- ✅ Post count is shown
- ✅ User's posts are listed
- ✅ "Follow" or "Unfollow" button is visible (if not your own profile)
- ✅ Your own profile doesn't show follow button

**Verify API Call:**
- Should see `GET /api/v1/users/:id`
- Response should include user info and posts

---

### 10. Follow/Unfollow User

**Steps:**
1. Navigate to another user's profile
2. Click "Follow" button
3. Navigate back to home page
4. Click "Following" filter
5. Verify the user's posts appear
6. Go back to user profile
7. Click "Unfollow" button

**Expected Results:**
- ✅ Follow button changes to "Unfollow" after clicking
- ✅ User's posts appear in "Following" filter
- ✅ Unfollow button changes back to "Follow"
- ✅ User's posts disappear from "Following" filter

**Verify API Calls:**
- Should see `POST /api/v1/users/:id/follow` (status 201)
- Should see `DELETE /api/v1/users/:id/follow` (status 200)

---

### 11. Logout

**Steps:**
1. Click "Logout" button in navigation
2. Observe the page

**Expected Results:**
- ✅ User is logged out
- ✅ Redirected to login page (or home page)
- ✅ Navigation shows "Login" and "Sign Up" buttons
- ✅ Post form is hidden
- ✅ JWT token removed from localStorage
- ✅ Protected routes redirect to login

**Verify:**
- Check DevTools → Application → Local Storage
- `jwt_token` should be removed
- Check Network tab → `DELETE /api/v1/logout` (status 200)

---

### 12. Protected Routes

**Steps:**
1. Logout (if logged in)
2. Try to access protected routes:
   - Try to create a post (should redirect to login)
   - Try to view your profile (should show public view or redirect)
   - Try to follow a user (should require login)

**Expected Results:**
- ✅ Unauthenticated users cannot perform authenticated actions
- ✅ Appropriate redirects to login page
- ✅ Error messages are clear

---

### 13. Error Handling

**Test Invalid Login:**
1. Go to login page
2. Enter incorrect username/password
3. Click "Login"

**Expected Results:**
- ✅ Error message appears: "Invalid username or password"
- ✅ User is NOT logged in
- ✅ Form remains on login page

**Test Post Validation:**
1. Try to create a post with more than 200 characters
2. Try to create an empty post

**Expected Results:**
- ✅ Character limit enforced (200 max)
- ✅ Empty post shows error message
- ✅ Submit button is disabled when invalid

**Test Network Errors:**
1. Stop the backend server
2. Try to load the feed or create a post

**Expected Results:**
- ✅ Error message is displayed to user
- ✅ Application doesn't crash
- ✅ User can retry after backend is restarted

---

### 14. Token Refresh

**Steps:**
1. Login and wait (or manually expire token)
2. Perform actions that require authentication
3. Observe token refresh behavior

**Expected Results:**
- ✅ Token is automatically refreshed when expired
- ✅ User doesn't notice the refresh
- ✅ No interruption in user experience

**Verify:**
- Check Network tab for `POST /api/v1/refresh` calls
- Should happen automatically on 401 errors

---

### 15. Responsive Design

**Steps:**
1. Open browser DevTools
2. Toggle device toolbar (Cmd+Shift+M)
3. Test on different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)

**Expected Results:**
- ✅ Layout adapts to screen size
- ✅ Navigation is usable on mobile
- ✅ Forms are readable and usable
- ✅ Posts are readable
- ✅ Buttons are appropriately sized

---

## Browser Compatibility Testing

Test in multiple browsers:

- ✅ **Chrome/Edge** (Chromium)
- ✅ **Firefox**
- ✅ **Safari** (if on macOS)
- ✅ **Mobile browsers** (iOS Safari, Chrome Mobile)

---

## Performance Testing

### Check Network Performance

1. Open DevTools → Network tab
2. Reload the page
3. Check:
   - ✅ API response times (< 200ms for cached, < 500ms for uncached)
   - ✅ No failed requests
   - ✅ Images/assets load quickly

### Check Console for Warnings

1. Open DevTools → Console
2. Look for:
   - ⚠️ React warnings
   - ⚠️ Deprecation warnings
   - ⚠️ Performance warnings

---

## Checklist Summary

Use this checklist to ensure all functionality is tested:

- [ ] Page loads without errors
- [ ] User can sign up
- [ ] User can login
- [ ] User can create posts
- [ ] User can view post details
- [ ] User can create replies
- [ ] Feed filters work (Timeline, Mine, Following)
- [ ] Pagination works (Load More)
- [ ] User profiles display correctly
- [ ] Follow/Unfollow works
- [ ] Logout works
- [ ] Protected routes redirect properly
- [ ] Error handling works
- [ ] Token refresh works
- [ ] Responsive design works
- [ ] No console errors
- [ ] No network errors
- [ ] Performance is acceptable

---

## Troubleshooting

### Issue: Posts not loading

**Check:**
1. Backend is running: `curl http://localhost:3000/up`
2. CORS is configured correctly
3. Browser console for errors
4. Network tab for failed requests

### Issue: Login not working

**Check:**
1. API endpoint: `POST /api/v1/login`
2. Request payload includes username and password
3. Response includes token
4. Token is stored in localStorage

### Issue: CORS errors

**Check:**
1. Backend CORS configuration in `config/initializers/cors.rb`
2. `VITE_API_URL` matches backend URL
3. Credentials are properly configured

### Issue: Styling not working

**Check:**
1. Tailwind CSS is configured
2. `src/index.css` imports Tailwind directives
3. Dev server was restarted after config changes

---

## Next Steps After Testing

Once all browser tests pass:

1. ✅ Run automated E2E tests: `npm run test:e2e`
2. ✅ Run unit tests: `npm test`
3. ✅ Document any issues found
4. ✅ Fix any bugs discovered
5. ✅ Re-test after fixes

---

## Notes

- Keep browser DevTools open during testing to catch errors early
- Test with real data (not just empty states)
- Test edge cases (empty feeds, long content, special characters)
- Test with multiple users (create test accounts)
- Verify data persists (refresh page, check database)

