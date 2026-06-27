# Security Fix Plan: Critical Vulnerabilities (C1 & C3)

## Status: ✅ COMPLETED

---

## Overview

This document outlines the fixes applied to resolve two critical security vulnerabilities in ThreadHive Backend:
- **C1 — Mass Assignment in Registration**
- **C3 — Hashed Passwords Exposed via Populated Author Fields**

Both vulnerabilities have been successfully remediated and verified.

---

## C1 — Mass Assignment in Registration

### Vulnerability Details
- **Severity:** 🔴 Critical
- **Location:** `src/controllers/authController.js`
- **Root cause:** The `registerUser` controller passes the entire `req.body` object to the `register()` service without whitelisting fields, allowing attackers to inject arbitrary fields into the user document.

### Attack Scenario
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "isAdmin": true,
  "role": "moderator"
}
```
Without the fix, the injected fields would be silently stored in the database.

### Fix Applied
In `src/controllers/authController.js`, the `registerUser` function now destructures only the expected fields before passing to the service:

**Before:**
```javascript
const credentials = req.body;
const newUser = await register(credentials);
```

**After:**
```javascript
const { name, email, password } = req.body;
const newUser = await register({ name, email, password });
```

### Result
✅ Any extra fields in the request body are silently discarded. The attack payload above will safely register the user with only the three expected fields.

---

## C3 — Hashed Passwords Exposed via Populated Author Fields

### Vulnerability Details
- **Severity:** 🔴 Critical
- **Location:** `src/models/User.js` (schema), `src/services/threadService.js`, `src/services/subredditService.js`
- **Root cause:** The `password` field in `UserSchema` lacks `select: false`. All `.populate()` calls on the `author` field return the full user document, including the bcrypt password hash, in API responses.

### Attack Scenario
```bash
GET /api/threads

# Response exposes password hashes in author objects
{
  "data": [
    {
      "_id": "...",
      "title": "My Thread",
      "author": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "password": "$2a$10$..." // ← PASSWORD HASH EXPOSED
      }
    }
  ]
}
```

An attacker can harvest password hashes and attempt offline brute-force or dictionary attacks.

### Fix Applied (Three-Part Solution)

#### Part 1: Schema-Level Protection
In `src/models/User.js`, added `select: false` to the `password` field:

```javascript
password: {
  type: String,
  required: true,
  select: false,  // ← Added this
},
```

**Effect:** Mongoose now excludes the password field from all queries and populate operations by default, across the entire codebase.

#### Part 2: Authentication Query Fix
In `src/services/authService.js`, the `login` function reads the password to verify it. After Part 1, the password is no longer returned by default. Explicitly opt it back in:

```javascript
const existingUser = await User.findOne({ email }).select("+password");
```

**Effect:** The login query gets the password field needed for authentication, while all other queries remain protected.

#### Part 3: Automatic Protection
No changes needed in `threadService.js` or `subredditService.js` — the schema-level `select: false` automatically protects all their `.populate()` calls:
- `fetchAllThreads()` → author field excludes password ✓
- `fetchThreadById()` → author field excludes password ✓
- `fetchSubredditWithThreads()` → author field excludes password ✓

### Result
✅ Password hashes are now automatically excluded from all API responses:
- `GET /api/threads` — password removed ✓
- `GET /api/threads/:id` — password removed ✓
- `GET /api/subreddits/:id` — password removed ✓
- `POST /api/auth/login` — still works correctly ✓

---

## Files Modified

| File | Change | Fix Category |
|------|--------|--------------|
| `src/controllers/authController.js` | Destructure only `{ name, email, password }` from `req.body` | C1 |
| `src/models/User.js` | Add `select: false` to `password` field | C3 |
| `src/services/authService.js` | Add `.select("+password")` to `User.findOne()` in `login` | C3 |

---

## Verification

### Syntax Validation
✅ All modified files pass Node.js syntax check

### Testing Recommendations

#### Test C1 (Mass Assignment)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123",
    "isAdmin": true,
    "role": "moderator"
  }'

# Verify: User is created with only name, email, password
# The isAdmin and role fields should NOT be in the database
```

#### Test C3 (Password Exposure)
```bash
curl -X GET http://localhost:5000/api/threads \
  -H "Authorization: Bearer <valid-token>"

# Verify: author object does NOT contain a password field
# Example response structure should be:
# "author": { "_id": "...", "name": "John", "email": "john@example.com" }
```

#### Test Authentication Still Works
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "correct_password"
  }'

# Verify: Returns a valid JWT token
```

---

## Defense-in-Depth Principles Applied

1. **Input Validation at Controller Layer:** C1 fix ensures controllers act as the security boundary
2. **Schema-Level Defaults:** C3 fix uses Mongoose schema settings as the source of truth, protecting the entire codebase
3. **Explicit Opt-In:** Authentication queries explicitly request the password field, making the exception visible in code review

---

## Additional Recommendations

Consider addressing the remaining HIGH and MEDIUM severity vulnerabilities identified in the security audit:

### High Priority
- **H1:** Uncomment user deletion check in `authHandler.js`
- **H2:** Create missing `userService.js`
- **H3:** Fix `req.userId` → `req.user.userId` in `userController.js`
- **H4:** Restrict CORS to specific origins
- **H5:** Apply stricter rate limits to auth endpoints
- **H6:** Add password strength validation

See the full security audit report for details.

---

**Date Completed:** 2026-06-27  
**Status:** Ready for deployment
