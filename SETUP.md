# Frontend Setup Guide

This guide will walk you through setting up the Microblog frontend application from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git**
- **Rails API Backend** running on `http://localhost:3000`

### Verify Prerequisites

```bash
# Check Node.js version
node --version  # Should be v18 or higher

# Check npm version
npm --version

# Check if backend is running
curl http://localhost:3000/up
```

## Step-by-Step Setup

### 1. Navigate to Frontend Directory

```bash
cd /Users/davidslv/projects/microblog-frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React and React DOM
- React Router DOM
- Axios
- Tailwind CSS
- Vite
- Testing libraries (Vitest, Playwright)
- And more...

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env if needed (default should work for local development)
# VITE_API_URL=http://localhost:3000/api/v1
```

The default configuration assumes:
- Backend API is running on `http://localhost:3000`
- API endpoints are under `/api/v1`

### 4. Start the Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or the next available port).

You should see output like:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 5. Verify the Setup

1. **Open your browser** and navigate to `http://localhost:5173`
2. You should see the Microblog homepage
3. The navigation should show "Login" and "Sign Up" buttons
4. Check the browser console for any errors

## Development Workflow

### Running Both Frontend and Backend

You'll need two terminal windows:

**Terminal 1 - Backend (Rails API):**
```bash
cd /Users/davidslv/projects/microblog
bin/rails server -p 3000
```

**Terminal 2 - Frontend (React):**
```bash
cd /Users/davidslv/projects/microblog-frontend
npm run dev
```

### Hot Module Replacement (HMR)

Vite provides instant hot module replacement. When you save changes to any file:
- The browser will automatically refresh
- Component state is preserved when possible
- Changes appear instantly without full page reload

## Testing Setup

### Unit Tests (Vitest)

```bash
# Run tests once
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui
```

### End-to-End Tests (Playwright)

**First-time setup:**
```bash
# Install Playwright browsers
npx playwright install
```

**Run E2E tests:**
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

**Note:** Make sure both backend and frontend are running before executing E2E tests.

## Common Issues and Solutions

### Issue: `npm: command not found`

**Solution:** Install Node.js from [nodejs.org](https://nodejs.org/)

### Issue: Port 5173 already in use

**Solution:** Vite will automatically use the next available port, or you can specify one:
```bash
npm run dev -- --port 3001
```

### Issue: CORS errors in browser console

**Solution:** Ensure the Rails backend has CORS configured correctly:
- Check `config/initializers/cors.rb` in the backend
- Verify `VITE_API_URL` matches the backend URL
- Ensure backend is running

### Issue: Cannot connect to API

**Solution:**
1. Verify backend is running: `curl http://localhost:3000/up`
2. Check `VITE_API_URL` in `.env` file
3. Check browser network tab for actual API requests
4. Verify CORS configuration in backend

### Issue: `node_modules` errors

**Solution:**
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Tailwind CSS not working

**Solution:**
1. Verify `tailwind.config.js` exists
2. Check `postcss.config.js` exists
3. Ensure `src/index.css` imports Tailwind directives
4. Restart the dev server

## Production Build

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

## Docker Setup

### Build Docker Image

```bash
docker build -t microblog-frontend .
```

### Run with Docker

```bash
docker run -p 3001:80 microblog-frontend
```

The frontend will be available at `http://localhost:3001`

### Docker Compose

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Project Structure Overview

```
microblog-frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page-level components
│   ├── services/        # API communication layer
│   ├── context/         # React Context providers
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── e2e/                 # End-to-end tests
├── public/              # Static assets
├── config/              # Configuration files
│   └── deploy.yml       # Kamal deployment config
├── Dockerfile           # Production Docker image
├── docker-compose.yml   # Docker Compose config
└── package.json         # Dependencies and scripts
```

## Next Steps

1. ✅ Complete this setup
2. ✅ Verify frontend loads in browser
3. ✅ Test login/signup functionality
4. ✅ Create a test post
5. ✅ Navigate through the application
6. ✅ Run E2E tests

## Getting Help

- Check the main [README.md](./README.md) for detailed documentation
- Review browser console for errors
- Check network tab for API request/response issues
- Verify backend logs for server-side errors

## Troubleshooting Checklist

- [ ] Node.js v18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Backend API running on port 3000
- [ ] `.env` file configured (or using defaults)
- [ ] No port conflicts
- [ ] CORS properly configured in backend
- [ ] Browser console shows no errors
- [ ] Network requests are successful

