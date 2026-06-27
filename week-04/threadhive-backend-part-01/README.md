# ThreadHive Backend

A Reddit-inspired community discussion platform backend built with Node.js, Express, and MongoDB. ThreadHive allows users to create communities (subreddits), post threads, comment, and vote — all through a RESTful API secured with JWT authentication.

---

## Features

- **User Authentication** — Register and login with JWT-based session management
- **Subreddits** — Create and browse topic-based communities
- **Threads** — Create, read, update, and delete posts within subreddits
- **Comments** — Add comments to any thread
- **Voting** — Upvote and downvote both threads and comments
- **Security** — Helmet headers, CORS, rate limiting (100 req / 15 min per IP), and bcrypt password hashing
- **Seeding** — Built-in database seeding script for development

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Database | MongoDB + Mongoose 8 |
| Authentication | JSON Web Tokens (`jsonwebtoken`) |
| Password Hashing | `bcryptjs` |
| Security | `helmet`, `express-rate-limit`, `cors` |
| Testing | Vitest + Supertest + `mongodb-memory-server` |
| Dev Tooling | Nodemon, Prettier |

---

## Architecture

The codebase follows a **layered architecture**:

```
HTTP Request
     ↓
  Routes          (src/routes/)       — URL definitions, middleware wiring
     ↓
Controllers       (src/controllers/)  — Request parsing, response formatting
     ↓
  Services        (src/services/)     — Business logic, database queries
     ↓
  Models          (src/models/)       — Mongoose schemas
```

**Key middleware:**
- `src/middleware/authHandler.js` — JWT verification, populates `req.user`
- `src/middleware/errorHandler.js` — Centralised error response formatting

---

## Project Structure

```
threadhive-backend/
├── main.js                     # Entry point — loads env, starts app
├── server.js                   # HTTP server lifecycle (start/stop)
├── db.js                       # MongoDB connect/disconnect helpers
├── src/
│   ├── app.js                  # Express app setup, middleware, routes
│   ├── controllers/            # Thin request handlers
│   │   ├── authController.js
│   │   ├── commentController.js
│   │   ├── subredditController.js
│   │   ├── threadController.js
│   │   ├── userController.js
│   │   └── voteController.js
│   ├── services/               # Business logic (no HTTP concerns)
│   │   ├── authService.js
│   │   ├── commentService.js
│   │   ├── subredditService.js
│   │   ├── threadService.js
│   │   └── voteService.js
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Thread.js
│   │   ├── Comment.js
│   │   └── Subreddit.js
│   ├── routes/                 # Express routers
│   │   ├── auth.js
│   │   ├── threads.js
│   │   ├── subreddits.js
│   │   ├── comments.js
│   │   └── votes.js
│   ├── middleware/
│   │   ├── authHandler.js
│   │   └── errorHandler.js
│   ├── utils/
│   │   └── createAppError.js   # Custom error factory
│   └── scripts/
│       ├── populate_db.js      # Database seeding script
│       └── seed-data.js        # Seed data definitions
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** running locally or a MongoDB Atlas connection string

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd threadhive-backend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/threadhive
JWT_SECRET=your-strong-secret-key-here
NODE_ENV=development
PORT=5000
```

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWT tokens |
| `NODE_ENV` | ✅ | `development` or `production` |
| `PORT` | Optional | Server port (defaults to `3000`) |

### Seed the Database

```bash
npm run populate
```

### Running the App

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will start at `http://localhost:5000` (or your configured `PORT`).

---

## API Reference

All protected routes require the header:
```
Authorization: Bearer <token>
```

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login and receive a JWT token | No |

**Register request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Login request body:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Login response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "token": "<jwt>"
  }
}
```

---

### Subreddits

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/subreddits` | List all subreddits | ✅ |
| `POST` | `/api/subreddits` | Create a subreddit | ✅ |
| `GET` | `/api/subreddits/:id` | Get a subreddit with its threads | ✅ |

**Create subreddit request body:**
```json
{
  "name": "programming",
  "description": "A community for programmers"
}
```

---

### Threads

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/threads` | List all threads | ✅ |
| `GET` | `/api/threads/:id` | Get a single thread | ✅ |
| `POST` | `/api/threads` | Create a thread | ✅ |
| `PUT` | `/api/threads/:id` | Update a thread | ✅ |
| `DELETE` | `/api/threads/:id` | Delete a thread | ✅ |

**Create thread request body:**
```json
{
  "title": "What is your favourite programming language?",
  "content": "Mine is JavaScript. What about you?",
  "subreddit": "<subreddit_id>"
}
```

---

### Comments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/comments/thread/:threadId` | Get all comments for a thread | ✅ |
| `POST` | `/api/comments` | Add a comment to a thread | ✅ |

**Add comment request body:**
```json
{
  "thread": "<thread_id>",
  "content": "Great question!"
}
```

---

### Votes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/threads/:id/upvote` | Upvote a thread | ✅ |
| `POST` | `/api/threads/:id/downvote` | Downvote a thread | ✅ |
| `POST` | `/api/comments/:id/upvote` | Upvote a comment | ✅ |
| `POST` | `/api/comments/:id/downvote` | Downvote a comment | ✅ |

> Duplicate votes are idempotent — voting the same way twice has no effect. Voting in the opposite direction automatically removes the previous vote.

---

## Data Models

### User
| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `email` | String | Required, unique |
| `password` | String | Required, bcrypt-hashed, never returned in responses |

### Thread
| Field | Type | Notes |
|-------|------|-------|
| `title` | String | Required |
| `content` | String | Required |
| `author` | ObjectId | Ref: User |
| `subreddit` | ObjectId | Ref: Subreddit |
| `upvotes` / `downvotes` | Number | Computed from voter arrays |
| `voteCount` | Number | `upvotes - downvotes` |
| `upvotedBy` / `downvotedBy` | [ObjectId] | Ref: User |

### Comment
| Field | Type | Notes |
|-------|------|-------|
| `thread` | ObjectId | Ref: Thread |
| `user` | ObjectId | Ref: User |
| `content` | String | Required |
| `upvotedBy` / `downvotedBy` | [ObjectId] | Ref: User |
| `voteCount` | Number | `upvotes - downvotes` |

### Subreddit
| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required, unique |
| `description` | String | |
| `author` | ObjectId | Ref: User |

---

## Running Tests

```bash
npm test
```

Tests use an in-memory MongoDB instance (`mongodb-memory-server`) so no database connection is required. Test files are colocated with their source files (e.g., `authService.test.js` next to `authService.js`).

---

## Error Handling

All errors follow a consistent response format:

```json
{
  "success": false,
  "message": "Error description"
}
```

In `development` mode, a `stack` trace is also included. HTTP status codes used:

| Code | Meaning |
|------|---------|
| `400` | Bad request / validation error |
| `401` | Unauthenticated |
| `403` | Forbidden |
| `404` | Resource not found |
| `409` | Conflict (e.g., duplicate email) |
| `500` | Internal server error |

---

## Security

- **Helmet** — Sets secure HTTP response headers
- **Rate Limiting** — 100 requests per 15 minutes per IP
- **CORS** — Enabled (configure allowed origins in `src/app.js` for production)
- **Password Hashing** — bcryptjs with salt factor 10
- **JWT Tokens** — HS256, expire after 1 hour
- **Input Whitelisting** — Controllers destructure only expected fields from `req.body`
- **Schema-Level Password Protection** — `password` field has `select: false` in the User schema; never leaked through populate calls

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with auto-reload (nodemon) |
| `npm start` | Start production server |
| `npm test` | Run test suite (Vitest) |
| `npm run populate` | Seed the database with sample data |
| `npm run format` | Format all source files with Prettier |

---

## License

ISC
