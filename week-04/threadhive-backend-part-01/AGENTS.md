---
agents:
  - backend-testing-agent
  - readme-generator
---

# ThreadHive Backend - AI Agent Guidelines

ThreadHive is a Reddit-like backend service built with Node.js, Express, and MongoDB. This document helps AI coding agents be immediately productive in this codebase.

## Quick Start Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server with auto-reload
npm start            # Start production server
npm test             # Run tests with Vitest
npm run populate     # Seed database with initial data
npm run format       # Format code with Prettier
```

## Architecture Overview

The codebase follows a **layered architecture** pattern:

```
routes (express routers)
   ↓
controllers (request handlers)
   ↓
services (business logic)
   ↓
models (MongoDB schemas & Mongoose)
```

**Layer responsibilities:**

| Layer | Location | Purpose | Key Principle |
|-------|----------|---------|---------------|
| **Routes** | `src/routes/*.js` | API endpoint definitions, HTTP method routing | Wire controllers to HTTP verbs |
| **Controllers** | `src/controllers/*.js` | Request validation, delegate to services, respond | Thin layer—no business logic |
| **Services** | `src/services/*.js` | Core business logic, database queries, transformations | Reusable, testable, no HTTP concerns |
| **Models** | `src/models/*.js` | Mongoose schemas, validation, relationships | Schema definition only |

**Middleware:**
- `src/middleware/authHandler.js` - JWT token verification
- `src/middleware/errorHandler.js` - Centralized error responses

**Utilities:**
- `src/utils/createAppError.js` - Custom error factory with status codes

## Key Conventions

### Error Handling
- Always use `createAppError(message, statusCode)` from `src/utils/createAppError.js` for throwing errors
- Controllers should `await` service calls and let error handler catch exceptions
- Status codes: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 409 (conflict), 500 (server error)

**Example:**
```javascript
if (!user) {
  throw createAppError("User not found", 404);
}
```

### Authentication
- JWT tokens signed with `process.env.JWT_SECRET`
- Token expiration: 1 hour
- Auth payload: `{ sub: userId, email: userEmail }`
- Middleware extracts token from `Authorization: Bearer <token>` header

### Database
- MongoDB connection via `connectToDB()` / `disconnectFromDB()` from `db.js`
- All models use Mongoose schemas with timestamps
- Database seeding via `src/scripts/populate_db.js`

### Service Layer Pattern
Services export async functions that:
1. Accept business parameters (not req/res)
2. Perform database operations and validation
3. Return plain objects (no Mongoose docs in final return)
4. Throw `createAppError` for validation/business failures

**Example from `authService.js`:**
```javascript
export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw createAppError("Bad credentials", 401);
  // ... validation ...
  return { ...user, token }; // Plain object
};
```

### Testing
- Test framework: **Vitest**
- Test files: Colocated with source (e.g., `authService.test.js` next to `authService.js`)
- In-memory MongoDB: `mongodb-memory-server` for isolated tests
- HTTP testing: **Supertest** for integration tests
- Run: `npm test` (watch mode available)

## File Organization

```
src/
├── app.js                 # Express app setup (not entry point)
├── controllers/           # Route handlers
├── models/                # Mongoose schemas
├── routes/                # Express routers
├── services/              # Business logic (testable)
├── middleware/            # Auth, error handling
├── scripts/               # DB seeding, setup
└── utils/                 # Helper functions

db.js                       # MongoDB connection
main.js                     # Entry point (dotenv, startup)
server.js                   # Server lifecycle
```

## Common Tasks for AI Agents

### Adding a New Feature
1. Define Mongoose schema in `src/models/`
2. Create service functions in `src/services/`
3. Write controller handler in `src/controllers/`
4. Define Express router in `src/routes/`
5. Mount router in `src/app.js`
6. Write tests (service unit tests + route integration tests)

### Writing Tests
- Import test utilities: `import { describe, it, expect, beforeAll, afterAll } from 'vitest'`
- Use `mongodb-memory-server` for DB setup in `beforeAll` / `afterAll`
- Mock external services; test service functions directly
- For route tests, use `supertest(app)` to test full HTTP flow
- See `resources/backend-testing-agent.agent.md` for detailed test patterns

### Fixing Errors
1. Check `createAppError` calls have correct status codes
2. Ensure services don't accept `req`/`res` objects
3. Verify database connection/disconnection in lifecycle
4. Check JWT secret is defined in `.env`

## Environment Variables

Required (add to `.env`):
```
MONGODB_URI=mongodb://localhost:27017/threadhive
JWT_SECRET=your-secret-key-here
NODE_ENV=development
PORT=5000
```

## Security & Performance Notes

- **Helmet**: Enabled by default (sets security headers)
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Password Hashing**: bcryptjs with salt factor 10
- **CORS**: Enabled (configure in `src/app.js` if needed)

## Debugging Tips

- Enable debug logs: Set `DEBUG=*` environment variable
- Check `.env` file for missing required variables
- Use `npm run populate` to seed test data
- MongoDB errors often indicate connection issues—check `MONGODB_URI`
- JWT errors: verify `JWT_SECRET` matches signing key

## Related Custom Agents

- **backend-testing-agent**: Generate unit & integration tests for routes, controllers, services
- **readme-generator**: Generate or update project README

Use these agents via `/backend-testing-agent` or `/readme-generator` slash commands in VS Code.

## Pitfalls to Avoid

❌ **Don't:** Return Mongoose documents directly from services  
✅ **Do:** Call `.toObject()` and remove sensitive fields (e.g., `delete user.password`)

❌ **Don't:** Mix business logic in controllers  
✅ **Do:** Keep controllers thin—validate input, call service, respond

❌ **Don't:** Forget to use `createAppError` with proper status codes  
✅ **Do:** Always throw errors with appropriate HTTP status codes

❌ **Don't:** Hardcode environment variables  
✅ **Do:** Use `process.env.VARIABLE_NAME` and define in `.env`

---

**Last Updated:** 2026-06-27  
**Stack:** Node.js + Express + MongoDB + Vitest
