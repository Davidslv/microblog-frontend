# Microblog Frontend

React-based single-page application for the Microblog platform. This is the **Presentation Layer** of the three-layer architecture.

**Repository**: [https://github.com/Davidslv/microblog-frontend](https://github.com/Davidslv/microblog-frontend)
**Backend API**: [https://github.com/Davidslv/microblog](https://github.com/Davidslv/microblog)

## 📋 Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development](#development)
- [Testing](#testing)
- [Building for Production](#building-for-production)
- [Docker](#docker)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Authentication Flow](#authentication-flow)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Architecture

This frontend application is part of a three-layer architecture:

```
┌─────────────────────────────────────────────────────────────┐
│              PRESENTATION LAYER (This App)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React SPA (Port 5173 - Dev)                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │  │
│  │  │Components│→ │ Services │→ │   API    │          │  │
│  │  └──────────┘  └──────────┘  └────┬─────┘          │  │
│  └────────────────────────────────────┼──────────────────┘  │
└───────────────────────────────────────┼──────────────────────┘
                                        │ HTTP/REST
                                        │ JWT Token
┌───────────────────────────────────────┼──────────────────────┐
│         APPLICATION LAYER (Backend)   │                      │
│  ┌───────────────────────────────────▼──────────────────┐  │
│  │  Rails API (Port 3000)                               │  │
│  │  /api/v1/*                                           │  │
│  │  - Authentication (JWT)                               │  │
│  │  - Posts, Users, Follows                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

The frontend communicates with the Rails API backend via REST endpoints using JWT token-based authentication.

**📚 Learn more**: See the [backend documentation](https://github.com/Davidslv/microblog/blob/main/docs/048_THREE_LAYER_ARCHITECTURE_IMPLEMENTATION.md) for architecture details.

---

## Features

### Core Functionality
- ✅ User authentication (Login/Signup)
- ✅ JWT token-based authentication with automatic refresh
- ✅ Feed with filters (Timeline, Mine, Following)
- ✅ Create posts and replies (nested threading)
- ✅ User profiles with stats (posts, followers, following)
- ✅ Follow/Unfollow users
- ✅ Account settings (description, password, delete account)
- ✅ Post moderation (report posts)
- ✅ Silent redaction (redacted posts automatically hidden)
- ✅ Cursor-based pagination
- ✅ Responsive design with Tailwind CSS

### User Experience
- ✅ Real-time character counter for posts (200 char limit)
- ✅ Smooth pagination with "Load More"
- ✅ Loading states and error handling
- ✅ Protected routes (authentication required)
- ✅ Automatic token refresh on 401 errors

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and npm (check with `node --version`)
- **Git** for cloning the repository
- **Rails API Backend** running on `http://localhost:3000` (see [backend setup](https://github.com/Davidslv/microblog#installation))

### Verify Prerequisites

```bash
# Check Node.js version
node --version  # Should be v18 or higher

# Check npm version
npm --version

# Check if backend is running
curl http://localhost:3000/up
```

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Davidslv/microblog-frontend.git
cd microblog-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy the example environment file (if it exists)
cp .env.example .env

# Or create .env with:
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env
```

The default configuration assumes:
- Backend API is running on `http://localhost:3000`
- API endpoints are under `/api/v1`

### 4. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

**📚 For detailed setup instructions**, see [SETUP.md](./SETUP.md).

---

## Development

### Development Workflow

You'll need **two terminal windows**:

**Terminal 1 - Backend API:**
```bash
cd /path/to/microblog  # Backend repository
DISABLE_RACK_ATTACK=true bin/rails server -p 3000

# If using Solid Queue in separate process (macOS):
# Terminal 1a: Rails server
DISABLE_RACK_ATTACK=true bin/rails server -p 3000

# Terminal 1b: Solid Queue workers
SOLID_QUEUE_WORKER=true bin/jobs
```

**Terminal 2 - Frontend:**
```bash
cd /path/to/microblog-frontend  # This repository
npm run dev
```

### Hot Module Replacement (HMR)

Vite provides instant hot module replacement:
- Browser automatically refreshes on file changes
- Component state is preserved when possible
- Changes appear instantly without full page reload

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm test                 # Run unit tests (Vitest)
npm test -- --watch      # Run tests in watch mode
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run E2E tests (Playwright)
npm run test:e2e:ui      # Run E2E tests with UI

# Code Quality
npm run lint             # Run ESLint
```

---

## Testing

### Unit Tests (Vitest)

Unit tests cover services, components, context, and utilities:

```bash
# Run all tests
npm test

# Run tests in watch mode
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

**📚 See [Testing Plan](./docs/001_TESTING_PLAN.md) for comprehensive testing strategy.**

### End-to-End Tests (Playwright)

E2E tests simulate complete user workflows:

```bash
# First-time setup: Install Playwright browsers
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

**E2E Test Coverage:**
- ✅ User signup and login
- ✅ Post creation and editing
- ✅ Following/unfollowing users
- ✅ Replying to posts (including nested replies)
- ✅ User profile navigation
- ✅ Complete user journey

**Note:** Make sure both backend and frontend are running before executing E2E tests.

---

## Building for Production

### Build Command

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory with:
- Minified JavaScript and CSS
- Tree-shaking (unused code removed)
- Code splitting for optimal loading
- Asset optimization

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing before deployment.

---

## Docker

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

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

**Note:** The `docker-compose.yml` uses an external network `microblog-network`. Create it first:
```bash
docker network create microblog-network
```

Or use the backend's `docker-compose.yml` which includes the network definition.

---

## Deployment

### Kamal Deployment (Recommended)

Kamal is a deployment tool for containerized applications. The frontend can be deployed independently from the backend.

**Prerequisites:**
- Docker installed
- SSH access to deployment server
- Domain name configured (optional)

**1. Configure Environment Variables:**

```bash
export FRONTEND_HOST=frontend.yourdomain.com
export VITE_API_URL=https://api.yourdomain.com/api/v1
export DOCKER_USERNAME=your-docker-username
export DOCKER_PASSWORD=your-docker-password
```

**2. Deploy:**

```bash
kamal deploy
```

**📚 See [Deployment Guide](../microblog/docs/055_DEPLOYMENT_GUIDE.md) in the backend repository for comprehensive deployment instructions.**

### Alternative: Static Hosting

The frontend can be deployed to any static hosting provider:

**Vercel/Netlify/CloudFront:**

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` directory** to your hosting provider.

3. **Configure environment variables** in your hosting provider:
   - `VITE_API_URL`: Your production API URL (e.g., `https://api.yourdomain.com/api/v1`)

**Note:** For Vite apps, environment variables must be prefixed with `VITE_` and are embedded at build time.

---

## Project Structure

```
microblog-frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Post.jsx        # Individual post display
│   │   ├── PostList.jsx    # List of posts with pagination
│   │   ├── PostForm.jsx    # Create post/reply form
│   │   ├── Navigation.jsx   # Navigation bar
│   │   ├── Loading.jsx     # Loading spinner
│   │   ├── ReportButton.jsx # Report post button
│   │   └── ReportModal.jsx  # Report post modal
│   ├── pages/              # Page-level components
│   │   ├── Home.jsx        # Feed page with filters
│   │   ├── Login.jsx       # Login page
│   │   ├── Signup.jsx      # Signup page
│   │   ├── PostDetail.jsx  # Post detail with replies
│   │   ├── UserProfile.jsx # User profile page
│   │   └── Settings.jsx    # User settings page
│   ├── services/           # API communication layer
│   │   ├── api.js          # Axios instance with interceptors
│   │   ├── auth.js         # Authentication service
│   │   ├── posts.js        # Posts API service
│   │   ├── users.js        # Users API service
│   │   └── reports.js      # Reports API service
│   ├── context/            # React Context providers
│   │   └── AuthContext.jsx # Authentication context
│   ├── utils/              # Utility functions
│   │   └── formatDate.js   # Date formatting utility
│   ├── test/               # Test configuration
│   │   └── setup.js        # Vitest setup file
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles (Tailwind)
├── e2e/                    # End-to-end tests (Playwright)
│   ├── auth.spec.js        # Authentication tests
│   ├── posts.spec.js       # Post creation tests
│   ├── social.spec.js      # Follow/unfollow tests
│   ├── replies.spec.js     # Reply tests
│   ├── complete-journey.spec.js  # Full user journey
│   ├── helpers/            # E2E test helpers
│   └── fixtures/           # Test data fixtures
├── docs/                   # Documentation
│   ├── 001_TESTING_PLAN.md
│   └── 002_SETTINGS_PAGE_IMPLEMENTATION.md
├── public/                 # Static assets
├── config/
│   └── deploy.yml          # Kamal deployment config
├── Dockerfile              # Production Docker image
├── docker-compose.yml      # Docker Compose configuration
├── nginx.conf              # Nginx configuration for production
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── vitest.config.js        # Vitest configuration
└── playwright.config.js    # Playwright configuration
```

---

## API Integration

The frontend communicates with the Rails API using the following endpoints:

### Authentication
- `POST /api/v1/login` - User login
- `POST /api/v1/refresh` - Refresh JWT token
- `DELETE /api/v1/logout` - User logout
- `GET /api/v1/me` - Get current user

### Posts
- `GET /api/v1/posts` - Get posts feed (with filters: timeline, mine, following)
- `POST /api/v1/posts` - Create post
- `GET /api/v1/posts/:id` - Get post detail with replies
- `POST /api/v1/posts/:id/report` - Report a post

### Users
- `GET /api/v1/users/:id` - Get user profile
- `PATCH /api/v1/users/:id` - Update user (description, password)
- `DELETE /api/v1/users/:id` - Delete user account
- `POST /api/v1/users/:id/follow` - Follow user
- `DELETE /api/v1/users/:id/follow` - Unfollow user

**📚 See [backend API documentation](https://github.com/Davidslv/microblog#api-integration) for detailed API specifications.**

---

## Authentication Flow

1. **User logs in** via `POST /api/v1/login`
2. **JWT token** is received and stored in `localStorage`
3. **Token is automatically added** to all API requests via Axios interceptor
4. **On 401 error**, token refresh is attempted via `POST /api/v1/refresh`
5. **If refresh fails**, user is redirected to login page
6. **On logout**, token is removed from `localStorage` and API is called

### Token Storage

- **Storage**: `localStorage.getItem('jwt_token')`
- **Header**: `Authorization: Bearer <token>`
- **Refresh**: Automatic on 401 responses

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for the Rails API | `http://localhost:3000/api/v1` |

**Note:** Vite requires the `VITE_` prefix for environment variables. These are embedded at build time.

---

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure the Rails API has CORS configured correctly:
- Check `config/initializers/cors.rb` in the backend
- Verify `VITE_API_URL` matches the backend URL
- Ensure backend is running

**Backend CORS Configuration:**
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

### API Connection Issues

1. **Verify backend is running:**
   ```bash
   curl http://localhost:3000/up
   ```

2. **Check `VITE_API_URL` in `.env` file**

3. **Check browser network tab** for actual API requests and responses

4. **Verify CORS configuration** in backend

### Build Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Clear build output
rm -rf dist
```

### Port Already in Use

Vite will automatically use the next available port, or specify one:
```bash
npm run dev -- --port 3001
```

### Tailwind CSS Not Working

1. Verify `tailwind.config.js` exists
2. Check `postcss.config.js` exists
3. Ensure `src/index.css` imports Tailwind directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
4. Restart the dev server

### E2E Tests Failing

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

4. **Check Playwright configuration** in `playwright.config.js`

---

## Contributing

### Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Write code following React best practices
   - Add tests for new features
   - Update documentation if needed

3. **Run tests:**
   ```bash
   npm test
   npm run test:e2e
   ```

4. **Check code quality:**
   ```bash
   npm run lint
   ```

5. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: Add feature description"
   ```

6. **Push and create pull request:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style

- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Use meaningful variable and function names
- Add comments for complex logic

### Testing

- Write unit tests for services and utilities
- Write component tests for UI components
- Write E2E tests for user workflows
- Aim for >80% code coverage

### Documentation

- Update README if adding features
- Add docs to `docs/` for complex features
- Document API changes
- Keep code comments up to date

---

## Related Resources

- **Backend Repository**: [https://github.com/Davidslv/microblog](https://github.com/Davidslv/microblog)
- **Backend Documentation**: [https://github.com/Davidslv/microblog/tree/main/docs](https://github.com/Davidslv/microblog/tree/main/docs)
- **Three-Layer Architecture**: [Backend Architecture Docs](https://github.com/Davidslv/microblog/blob/main/docs/048_THREE_LAYER_ARCHITECTURE_IMPLEMENTATION.md)
- **Frontend Setup Guide**: [SETUP.md](./SETUP.md)
- **Testing Plan**: [docs/001_TESTING_PLAN.md](./docs/001_TESTING_PLAN.md)

---

## License

Same as the main microblog project.

---

**Happy coding! 🚀**
