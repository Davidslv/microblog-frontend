# CORS Troubleshooting Guide

## Overview

This document details the CORS (Cross-Origin Resource Sharing) issue encountered during frontend deployment and the complete troubleshooting process. This serves as a reference for diagnosing and fixing similar issues in the future.

## Date

November 7, 2025

## Problem Description

### Symptoms

After successfully deploying both the frontend (`https://microblog.davidslv.uk`) and backend (`https://microblog-be.davidslv.uk`), the React application was loading correctly, but all API calls were failing with a "Network Error" message.

### User Experience

- Frontend page loaded successfully
- React application rendered correctly
- Navigation and UI elements were visible
- **All actions (loading posts, authentication, etc.) showed "Network Error"**
- No data was being fetched from the backend API

## Diagnosis Process

### Step 1: Browser Console Inspection

Using browser developer tools, we identified the root cause:

**Browser Console Error:**
```
Access to XMLHttpRequest at 'https://microblog-be.davidslv.uk/api/v1/posts?filter=timeline'
from origin 'https://microblog.davidslv.uk' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Key Indicators:**
- CORS policy blocking the request
- Missing `Access-Control-Allow-Origin` header
- Request was being sent but blocked by browser security

### Step 2: Network Request Analysis

**Failed Request:**
```
[GET] https://microblog-be.davidslv.uk/api/v1/posts?filter=timeline
Status: (blocked by CORS)
```

**What This Told Us:**
- The frontend was correctly configured to call the backend API
- The backend URL was correct
- The request was being made, but the browser was blocking it due to CORS

### Step 3: Backend CORS Configuration Review

We examined the backend's CORS configuration:

**File:** `microblog-backend/config/initializers/cors.rb`

```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Allow requests from frontend origins
    if Rails.env.development?
      origins ['http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174']
    else
      # In production, use explicit FRONTEND_URL or default to empty array
      frontend_url = ENV.fetch('FRONTEND_URL', nil)
      origins frontend_url ? [frontend_url] : []
    end

    resource '/api/*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,
      expose: ['Authorization']
  end
end
```

**Critical Finding:**
- In production, the CORS configuration requires the `FRONTEND_URL` environment variable
- If `FRONTEND_URL` is not set, `origins` defaults to an empty array `[]`
- An empty origins array means **no origins are allowed**, causing all CORS requests to fail

### Step 4: Deployment Configuration Check

**File:** `microblog-backend/config/deploy.yml`

**Problem Found:**
The `FRONTEND_URL` environment variable was **not configured** in the deployment configuration.

**Before (Missing Configuration):**
```yaml
env:
  secret:
    - RAILS_MASTER_KEY
    - SECRET_KEY_BASE
  clear:
    RAILS_ENV: production
    # ... other variables ...
    # ❌ FRONTEND_URL was missing!
```

## Root Cause

The backend's CORS configuration requires the `FRONTEND_URL` environment variable to be set in production. Without it, the CORS middleware allows no origins, causing all cross-origin requests from the frontend to be blocked by the browser.

**Why This Happened:**
1. The CORS configuration was correctly set up to use `FRONTEND_URL`
2. The deployment configuration (`deploy.yml`) was missing this environment variable
3. When the backend started, `FRONTEND_URL` was `nil`, resulting in an empty origins array
4. The browser's same-origin policy blocked all API requests

## Solution

### Step 1: Update Backend Deployment Configuration

**File:** `microblog-backend/config/deploy.yml`

**Added:**
```yaml
env:
  secret:
    - RAILS_MASTER_KEY
    - SECRET_KEY_BASE
  clear:
    RAILS_ENV: production
    # Frontend URL for CORS configuration
    FRONTEND_URL: <%= ENV.fetch("FRONTEND_URL", "https://microblog.davidslv.uk") %>
    # ... other variables ...
```

**Why This Works:**
- Sets `FRONTEND_URL` to the frontend domain
- Uses ERB template to allow override via environment variable
- Provides a sensible default (`https://microblog.davidslv.uk`)

### Step 2: Redeploy Backend

```bash
cd microblog-backend
export BACKEND_HOST=microblog-be.davidslv.uk
export FRONTEND_URL=https://microblog.davidslv.uk
kamal deploy
```

**What Happens:**
- Kamal builds a new Docker image with the updated configuration
- The new container starts with `FRONTEND_URL` environment variable set
- CORS middleware now allows requests from `https://microblog.davidslv.uk`

### Step 3: Verify CORS Headers

**Test CORS Preflight Request:**
```bash
curl -v -H "Origin: https://microblog.davidslv.uk" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://microblog-be.davidslv.uk/api/v1/posts
```

**Expected Response Headers:**
```
HTTP/2 200
access-control-allow-credentials: true
access-control-allow-methods: GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD
access-control-allow-origin: https://microblog.davidslv.uk
access-control-expose-headers: Authorization
access-control-max-age: 7200
```

**Key Headers Explained:**
- `access-control-allow-origin`: The frontend origin that's allowed
- `access-control-allow-credentials: true`: Allows cookies/credentials
- `access-control-allow-methods`: HTTP methods allowed
- `access-control-expose-headers`: Headers the frontend can read

## Verification

### Browser Console Check

After the fix, the browser console should show:
- ✅ No CORS errors
- ✅ Successful API requests
- ✅ Data loading correctly

### Network Tab Check

**Before Fix:**
```
[GET] https://microblog-be.davidslv.uk/api/v1/posts?filter=timeline
Status: (blocked by CORS)
```

**After Fix:**
```
[GET] https://microblog-be.davidslv.uk/api/v1/posts?filter=timeline
Status: 200 OK
```

### Functional Test

The frontend should now:
- ✅ Load posts from the API
- ✅ Display user data
- ✅ Allow authentication
- ✅ Enable all interactive features

## Prevention: Deployment Checklist

To prevent this issue in the future, ensure the following when deploying:

### Backend Deployment Checklist

- [ ] `FRONTEND_URL` is set in `config/deploy.yml`
- [ ] `FRONTEND_URL` matches the actual frontend domain
- [ ] Backend is redeployed after adding `FRONTEND_URL`
- [ ] CORS headers are verified after deployment

### Frontend Deployment Checklist

- [ ] `VITE_API_URL` is correctly set during build
- [ ] Frontend domain matches what's configured in backend CORS
- [ ] Both frontend and backend are using HTTPS (or both HTTP in dev)

### Testing Checklist

- [ ] Test API calls from browser console
- [ ] Check browser Network tab for CORS errors
- [ ] Verify CORS headers with `curl` OPTIONS request
- [ ] Test actual functionality (load posts, login, etc.)

## Configuration Reference

### Backend CORS Configuration

**File:** `microblog-backend/config/initializers/cors.rb`

```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    if Rails.env.development?
      origins ['http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174']
    else
      frontend_url = ENV.fetch('FRONTEND_URL', nil)
      origins frontend_url ? [frontend_url] : []
    end

    resource '/api/*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,
      expose: ['Authorization']
  end
end
```

### Backend Deployment Configuration

**File:** `microblog-backend/config/deploy.yml`

```yaml
env:
  clear:
    RAILS_ENV: production
    FRONTEND_URL: <%= ENV.fetch("FRONTEND_URL", "https://microblog.davidslv.uk") %>
    # ... other variables ...
```

### Frontend API Configuration

**Build-time Environment Variable:**
```bash
export VITE_API_URL=https://microblog-be.davidslv.uk/api/v1
npm run build
```

**Or in `config/deploy.yml` (if using Kamal for frontend):**
```yaml
builder:
  args:
    VITE_API_URL: <%= ENV.fetch("VITE_API_URL", "https://microblog-be.davidslv.uk/api/v1") %>
```

## Common CORS Issues and Solutions

### Issue 1: "No 'Access-Control-Allow-Origin' header"

**Cause:** Backend not sending CORS headers
**Solution:** Ensure `FRONTEND_URL` is set in backend deployment

### Issue 2: "Credentials flag is true, but Access-Control-Allow-Credentials is not 'true'"

**Cause:** Backend CORS config missing `credentials: true`
**Solution:** Verify `credentials: true` in `config/initializers/cors.rb`

### Issue 3: "Method not allowed"

**Cause:** HTTP method not in allowed methods list
**Solution:** Add method to `methods:` array in CORS config

### Issue 4: "Preflight request doesn't pass"

**Cause:** OPTIONS request failing
**Solution:** Ensure `:options` is in the `methods:` array

## Debugging Commands

### Test CORS Preflight
```bash
curl -v -H "Origin: https://microblog.davidslv.uk" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://microblog-be.davidslv.uk/api/v1/posts
```

### Test Actual Request
```bash
curl -v -H "Origin: https://microblog.davidslv.uk" \
     -H "Cookie: session=..." \
     https://microblog-be.davidslv.uk/api/v1/posts
```

### Check Environment Variables in Container
```bash
# SSH into server
ssh root@microblog-be.davidslv.uk

# Check environment variables
docker exec microblog-web-<version> env | grep FRONTEND_URL
```

### View Backend Logs
```bash
cd microblog-backend
kamal app logs -f
```

## Lessons Learned

1. **Environment Variables Are Critical**: Missing environment variables can cause silent failures in production
2. **CORS Requires Explicit Configuration**: The browser enforces CORS strictly; both frontend and backend must be configured correctly
3. **Browser DevTools Are Essential**: Console and Network tabs provide immediate feedback on CORS issues
4. **Test After Deployment**: Always verify API connectivity after deploying either frontend or backend
5. **Documentation Saves Time**: Having this guide will help diagnose similar issues faster in the future

## Related Documentation

- Frontend Deployment: `docs/003_DEPLOYMENT_SETUP.md`
- Backend CORS Config: `microblog-backend/config/initializers/cors.rb`
- Backend Deployment: `microblog-backend/config/deploy.yml`

## Additional Resources

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Rack::Cors Documentation](https://github.com/cyu/rack-cors)
- [Kamal Deployment Guide](https://kamal-deploy.org/)





