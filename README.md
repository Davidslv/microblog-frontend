# Microblog Frontend

React-based single-page application for the Microblog platform. This is the Presentation Layer of the three-layer architecture.

## Architecture

This frontend application communicates with the Rails API backend (`/api/v1/*`) and provides a modern, responsive user interface for the microblog platform.

```
┌─────────────────────────────────────┐
│     React Frontend (Port 5173)      │
│  ┌──────────┐  ┌──────────┐        │
│  │Components│→ │ Services │        │
│  └──────────┘  └────┬─────┘        │
└─────────────────────┼───────────────┘
                      │ HTTP/REST
                      │ JWT Token
┌─────────────────────┼───────────────┐
│   Rails API (Port 3000)             │
│   /api/v1/*                         │
└─────────────────────────────────────┘
```

## Features

- ✅ User authentication (Login/Signup)
- ✅ JWT token-based authentication
- ✅ Feed with filters (Timeline, Mine, Following)
- ✅ Create posts and replies
- ✅ User profiles
- ✅ Follow/Unfollow users
- ✅ Cursor-based pagination
- ✅ Responsive design with Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- Rails API backend running on `http://localhost:3000`

## Installation

1. **Clone the repository:**
   ```bash
   cd /Users/davidslv/projects/microblog-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and set VITE_API_URL if needed
   ```

## Development

### Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Development Workflow

**Terminal 1 - Backend API:**
```bash
cd /Users/davidslv/projects/microblog
bin/rails server -p 3000
```

**Terminal 2 - Frontend:**
```bash
cd /Users/davidslv/projects/microblog-frontend
npm run dev
```

## Project Structure

```
microblog-frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Post.jsx
│   │   ├── PostList.jsx
│   │   ├── PostForm.jsx
│   │   ├── Navigation.jsx
│   │   └── Loading.jsx
│   ├── pages/            # Page-level components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── PostDetail.jsx
│   │   └── UserProfile.jsx
│   ├── services/         # API communication
│   │   ├── api.js        # Axios instance with interceptors
│   │   ├── auth.js       # Authentication service
│   │   ├── posts.js      # Posts API service
│   │   └── users.js      # Users API service
│   ├── context/          # React Context providers
│   │   └── AuthContext.jsx
│   ├── utils/            # Utility functions
│   │   └── formatDate.js
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── e2e/                  # End-to-end tests (Playwright)
├── public/               # Static assets
├── Dockerfile            # Production Docker image
├── docker-compose.yml    # Docker Compose configuration
├── config/
│   └── deploy.yml        # Kamal deployment config
└── package.json
```

## Testing

### Unit Tests (Vitest)

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui
```

### End-to-End Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

**Note:** Make sure the backend API is running before running E2E tests.

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Docker

### Build Docker Image

```bash
docker build -t microblog-frontend .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

The frontend will be available at `http://localhost:3001`

### Docker Compose with Backend

To run both frontend and backend together, you can extend the backend's `docker-compose.yml`:

```yaml
services:
  frontend:
    build:
      context: ../microblog-frontend
      dockerfile: Dockerfile
    ports:
      - "3001:80"
    environment:
      - VITE_API_URL=http://web:3000/api/v1
    networks:
      - microblog-network
```

## Deployment

### Kamal Deployment

1. **Configure environment variables:**
   ```bash
   export FRONTEND_HOST=frontend.yourdomain.com
   export VITE_API_URL=https://api.yourdomain.com/api/v1
   export DOCKER_USERNAME=your-docker-username
   export DOCKER_PASSWORD=your-docker-password
   ```

2. **Deploy:**
   ```bash
   kamal deploy
   ```

### Alternative: Static Hosting (Vercel, Netlify, CloudFront)

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` directory** to your static hosting provider.

3. **Configure environment variables** in your hosting provider:
   - `VITE_API_URL`: Your production API URL

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for the Rails API | `http://localhost:3000/api/v1` |

## API Integration

The frontend communicates with the Rails API using the following endpoints:

- `POST /api/v1/login` - User login
- `POST /api/v1/refresh` - Refresh JWT token
- `DELETE /api/v1/logout` - User logout
- `GET /api/v1/me` - Get current user
- `GET /api/v1/posts` - Get posts feed
- `POST /api/v1/posts` - Create post
- `GET /api/v1/posts/:id` - Get post detail
- `GET /api/v1/users/:id` - Get user profile
- `POST /api/v1/users/:id/follow` - Follow user
- `DELETE /api/v1/users/:id/follow` - Unfollow user

## Authentication Flow

1. User logs in via `POST /api/v1/login`
2. JWT token is stored in `localStorage`
3. Token is automatically added to all API requests via Axios interceptor
4. On 401 error, token refresh is attempted
5. If refresh fails, user is redirected to login

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ support required

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure the Rails API has CORS configured correctly in `config/initializers/cors.rb`.

### API Connection Issues

- Verify the backend API is running on the correct port
- Check `VITE_API_URL` environment variable
- Verify network connectivity

### Build Issues

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

## License

Same as the main microblog project.
