# Frontend Setup Guide

This guide will walk you through setting up the Microblog frontend application from scratch.

**Repository**: [https://github.com/Davidslv/microblog-frontend](https://github.com/Davidslv/microblog-frontend)
**Backend Repository**: [https://github.com/Davidslv/microblog](https://github.com/Davidslv/microblog)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download](https://git-scm.com/)
- **Rails API Backend** running on `http://localhost:3000`

### Verify Prerequisites

```bash
# Check Node.js version
node --version  # Should be v18 or higher

# Check npm version
npm --version

# Check Git version
git --version

# Check if backend is running
curl http://localhost:3000/up
```

If the backend is not running, you'll need to set it up first. See the [backend setup guide](https://github.com/Davidslv/microblog#installation).

---

## Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/Davidslv/microblog-frontend.git
cd microblog-frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React and React DOM
- React Router DOM (routing)
- Axios (HTTP client)
- Tailwind CSS (styling)
- Vite (build tool)
- Testing libraries (Vitest, Playwright)
- And more...

**Expected output:**
```
added 500+ packages, and audited 600+ packages in 30s
```

### Step 3: Configure Environment Variables

```bash
# Check if .env.example exists
ls -la .env.example

# If it exists, copy it
cp .env.example .env

# If it doesn't exist, create .env manually
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env
```

**Environment Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for the Rails API | `http://localhost:3000/api/v1` |

**Note:** For production, you'll need to set `VITE_API_URL` to your production API URL (e.g., `https://api.yourdomain.com/api/v1`).

### Step 4: Verify Backend is Running

Before starting the frontend, ensure the backend API is running:

```bash
# Test backend health endpoint
curl http://localhost:3000/up

# Expected response: {"status":"ok"}
```

If the backend is not running, start it:

```bash
# Navigate to backend directory
cd /path/to/microblog  # Backend repository

# Start backend server
DISABLE_RACK_ATTACK=true bin/rails server -p 3000

# Or if using Docker:
docker compose up -d
```

**📚 See [backend setup guide](https://github.com/Davidslv/microblog#running-the-application) for detailed instructions.**

### Step 5: Start the Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or the next available port).

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 6: Verify the Setup

1. **Open your browser** and navigate to `http://localhost:5173`
2. You should see the Microblog homepage
3. The navigation should show "Login" and "Sign Up" buttons
4. **Check the browser console** (F12) for any errors
5. **Check the network tab** to verify API requests are being made

**Common Issues:**
- If you see CORS errors, check backend CORS configuration
- If API requests fail, verify backend is running and `VITE_API_URL` is correct
- If the page is blank, check browser console for JavaScript errors

---

## Development Workflow

### Running Both Frontend and Backend

You'll need **multiple terminal windows**:

**Terminal 1 - Backend (Rails API):**
```bash
cd /path/to/microblog  # Backend repository
DISABLE_RACK_ATTACK=true bin/rails server -p 3000
```

**Terminal 2 - Frontend (React):**
```bash
cd /path/to/microblog-frontend  # This repository
npm run dev
```

**Terminal 3 - Solid Queue Workers (Optional, macOS):**
```bash
cd /path/to/microblog  # Backend repository
SOLID_QUEUE_WORKER=true bin/jobs
```

**Note:** On macOS, Solid Queue should run in a separate process to avoid fork issues. See [backend Solid Queue docs](https://github.com/Davidslv/microblog/blob/main/README_SOLID_QUEUE.md).

### Hot Module Replacement (HMR)

Vite provides instant hot module replacement. When you save changes to any file:
- The browser will automatically refresh
- Component state is preserved when possible
- Changes appear instantly without full page reload

**Try it:**
1. Open `src/components/Navigation.jsx`
2. Change some text
3. Save the file
4. Watch the browser update instantly!

---

## Testing Setup

### Unit Tests (Vitest)

**First-time setup:**
No additional setup required. Vitest is already configured.

**Run tests:**
```bash
# Run tests once
npm test

# Run tests in watch mode (recommended for development)
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

**Coverage Goals:**
- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

**Test Structure:**
```
src/
├── services/__tests__/     # API service tests
├── components/__tests__/  # Component tests
├── pages/__tests__/       # Page component tests
├── context/__tests__/     # Context tests
└── utils/__tests__/       # Utility function tests
```

### End-to-End Tests (Playwright)

**First-time setup:**
```bash
# Install Playwright browsers (one-time)
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browsers (~300MB).

**Run E2E tests:**
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI (recommended for debugging)
npm run test:e2e:ui
```

**E2E Test Structure:**
```
e2e/
├── auth.spec.js              # Authentication flows
├── posts.spec.js             # Post creation and interaction
├── social.spec.js            # Follow/unfollow flows
├── replies.spec.js           # Reply and threading flows
├── complete-journey.spec.js  # Full user journey
├── helpers/                  # Test helper functions
└── fixtures/                 # Test data fixtures
```

**Important:** Make sure both backend and frontend are running before executing E2E tests.

**📚 See [Testing Plan](./docs/001_TESTING_PLAN.md) for comprehensive testing strategy.**

---

## Common Issues and Solutions

### Issue: `npm: command not found`

**Solution:** Install Node.js from [nodejs.org](https://nodejs.org/)

**Verify installation:**
```bash
node --version  # Should be v18 or higher
npm --version
```

### Issue: Port 5173 already in use

**Solution:** Vite will automatically use the next available port, or you can specify one:
```bash
npm run dev -- --port 3001
```

### Issue: CORS errors in browser console

**Error message:**
```
Access to XMLHttpRequest at 'http://localhost:3000/api/v1/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:** Ensure the Rails backend has CORS configured correctly:

1. **Check backend CORS configuration:**
   ```bash
   # In backend repository
   cat config/initializers/cors.rb
   ```

2. **Verify CORS allows frontend origin:**
   ```ruby
   # config/initializers/cors.rb
   Rails.application.config.middleware.insert_before 0, Rack::Cors do
     allow do
       origins 'http://localhost:5173'  # Frontend URL
       resource '*',
         headers: :any,
         methods: [:get, :post, :put, :patch, :delete, :options, :head],
         credentials: false
     end
   end
   ```

3. **Restart backend server** after making changes

4. **Verify `VITE_API_URL` matches the backend URL**

### Issue: Cannot connect to API

**Symptoms:**
- Network requests fail
- 404 or connection refused errors
- Blank pages or loading spinners that never finish

**Solution:**

1. **Verify backend is running:**
   ```bash
   curl http://localhost:3000/up
   # Expected: {"status":"ok"}
   ```

2. **Check `VITE_API_URL` in `.env` file:**
   ```bash
   cat .env
   # Should contain: VITE_API_URL=http://localhost:3000/api/v1
   ```

3. **Check browser network tab:**
   - Open DevTools (F12)
   - Go to Network tab
   - Look for failed requests
   - Check request URL and response

4. **Verify CORS configuration** (see above)

5. **Check backend logs** for errors:
   ```bash
   # In backend terminal
   # Look for error messages
   ```

### Issue: `node_modules` errors

**Symptoms:**
- Module not found errors
- Package installation failures
- Inconsistent behavior

**Solution:**
```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install
```

### Issue: Tailwind CSS not working

**Symptoms:**
- Styles not applying
- Plain HTML without styling
- Console errors about Tailwind

**Solution:**

1. **Verify `tailwind.config.js` exists:**
   ```bash
   ls -la tailwind.config.js
   ```

2. **Check `postcss.config.js` exists:**
   ```bash
   ls -la postcss.config.js
   ```

3. **Ensure `src/index.css` imports Tailwind directives:**
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

4. **Restart the dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

5. **Clear Vite cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### Issue: E2E tests failing

**Symptoms:**
- Playwright tests timeout
- Tests can't find elements
- Browser doesn't start

**Solution:**

1. **Ensure backend is running:**
   ```bash
   curl http://localhost:3000/up
   ```

2. **Ensure frontend is running:**
   ```bash
   curl http://localhost:5173
   ```

3. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

4. **Check Playwright configuration:**
   ```bash
   cat playwright.config.js
   ```

5. **Run tests with UI to see what's happening:**
   ```bash
   npm run test:e2e:ui
   ```

6. **Check for rate limiting:**
   - If backend has `Rack::Attack` enabled, disable it for testing:
     ```bash
     # In backend terminal
     DISABLE_RACK_ATTACK=true bin/rails server -p 3000
     ```

### Issue: Build fails

**Symptoms:**
- `npm run build` fails
- Type errors or syntax errors
- Missing dependencies

**Solution:**

1. **Check for syntax errors:**
   ```bash
   npm run lint
   ```

2. **Clear build cache:**
   ```bash
   rm -rf dist node_modules/.vite
   ```

3. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Check Node.js version:**
   ```bash
   node --version  # Should be v18 or higher
   ```

---

## Production Build

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory with:
- Minified JavaScript and CSS
- Tree-shaking (unused code removed)
- Code splitting for optimal loading
- Asset optimization

**Build output:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
```

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing before deployment.

**Note:** The preview server runs on a different port (usually 4173). Check the terminal output for the exact URL.

---

## Docker Setup

### Build Docker Image

```bash
docker build -t microblog-frontend .
```

### Run with Docker

```bash
docker run -p 3001:80 \
  -e VITE_API_URL=http://localhost:3000/api/v1 \
  microblog-frontend
```

The frontend will be available at `http://localhost:3001`

### Docker Compose

**Note:** The `docker-compose.yml` uses an external network `microblog-network`. Create it first:

```bash
docker network create microblog-network
```

Or use the backend's `docker-compose.yml` which includes the network definition.

**Start with Docker Compose:**
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Project Structure Overview

```
microblog-frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Post.jsx
│   │   ├── PostList.jsx
│   │   ├── PostForm.jsx
│   │   ├── Navigation.jsx
│   │   └── Loading.jsx
│   ├── pages/           # Page-level components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── PostDetail.jsx
│   │   ├── UserProfile.jsx
│   │   └── Settings.jsx
│   ├── services/        # API communication layer
│   │   ├── api.js       # Axios instance with interceptors
│   │   ├── auth.js      # Authentication service
│   │   ├── posts.js     # Posts API service
│   │   └── users.js     # Users API service
│   ├── context/         # React Context providers
│   │   └── AuthContext.jsx
│   ├── utils/           # Utility functions
│   │   └── formatDate.js
│   ├── test/            # Test configuration
│   │   └── setup.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles (Tailwind)
├── e2e/                 # End-to-end tests
│   ├── auth.spec.js
│   ├── posts.spec.js
│   ├── social.spec.js
│   ├── replies.spec.js
│   ├── complete-journey.spec.js
│   ├── helpers/         # Test helpers
│   └── fixtures/        # Test data
├── docs/                # Documentation
│   ├── 001_TESTING_PLAN.md
│   └── 002_SETTINGS_PAGE_IMPLEMENTATION.md
├── public/              # Static assets
├── config/              # Configuration files
│   └── deploy.yml       # Kamal deployment config
├── Dockerfile           # Production Docker image
├── docker-compose.yml   # Docker Compose config
├── nginx.conf           # Nginx configuration
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── vitest.config.js     # Vitest configuration
└── playwright.config.js # Playwright configuration
```

---

## Next Steps

After completing this setup:

1. ✅ **Verify frontend loads in browser** - Navigate to `http://localhost:5173`
2. ✅ **Test login/signup functionality** - Create an account and log in
3. ✅ **Create a test post** - Verify post creation works
4. ✅ **Navigate through the application** - Explore all pages
5. ✅ **Run unit tests** - `npm test`
6. ✅ **Run E2E tests** - `npm run test:e2e` (with backend running)
7. ✅ **Read the documentation** - Check `docs/` folder for detailed guides

---

## Getting Help

### Documentation

- **Main README**: [README.md](./README.md) - Comprehensive overview
- **Testing Plan**: [docs/001_TESTING_PLAN.md](./docs/001_TESTING_PLAN.md) - Testing strategy
- **Settings Page**: [docs/002_SETTINGS_PAGE_IMPLEMENTATION.md](./docs/002_SETTINGS_PAGE_IMPLEMENTATION.md) - Settings implementation

### Backend Documentation

- **Backend Repository**: [https://github.com/Davidslv/microblog](https://github.com/Davidslv/microblog)
- **Backend README**: [Backend README](https://github.com/Davidslv/microblog#readme)
- **Three-Layer Architecture**: [Architecture Docs](https://github.com/Davidslv/microblog/blob/main/docs/048_THREE_LAYER_ARCHITECTURE_IMPLEMENTATION.md)

### Debugging

1. **Check browser console** (F12) for JavaScript errors
2. **Check network tab** for API request/response issues
3. **Check backend logs** for server-side errors
4. **Check terminal output** for build/compilation errors

### Troubleshooting Checklist

Before asking for help, verify:

- [ ] Node.js v18+ installed
- [ ] Dependencies installed (`npm install` completed successfully)
- [ ] Backend API running on port 3000
- [ ] `.env` file configured with correct `VITE_API_URL`
- [ ] No port conflicts
- [ ] CORS properly configured in backend
- [ ] Browser console shows no errors
- [ ] Network requests are successful (check Network tab)
- [ ] Backend logs show no errors

---

## Additional Resources

- **Vite Documentation**: [https://vitejs.dev/](https://vitejs.dev/)
- **React Documentation**: [https://react.dev/](https://react.dev/)
- **Tailwind CSS**: [https://tailwindcss.com/](https://tailwindcss.com/)
- **Vitest**: [https://vitest.dev/](https://vitest.dev/)
- **Playwright**: [https://playwright.dev/](https://playwright.dev/)

---

**Happy coding! 🚀**
