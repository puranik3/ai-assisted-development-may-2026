# Plan: 3-Phase Thread Endpoints Implementation

## TL;DR
Implement all 5 Thread endpoints split across 3 phases by HTTP method. Each phase adds new service methods and controller handlers following the Subreddit pattern. GET endpoints include populate relationships and filtering; POST validates subreddit exists; PUT allows updating title, content, votes; DELETE is simple removal without authorization.

---

## Phase 1: GET Endpoints

### Endpoints to Implement
- `GET /api/threads` — Fetch all threads with optional subreddit filter
- `GET /api/threads/:id` — Fetch single thread by ID with populated author and subreddit

### Required Files to Modify
- `src/services/threadService.js` — Add 2 new service methods
- `src/controllers/threadController.js` — Add 2 new controller handlers
- `src/routes/threads.js` — Add 2 GET route handlers
- `src/app.js` — Uncomment line 2 (wire up threads route)

### Key Considerations

**Service Layer** (`threadService.js`)
- `fetchAllThreads(subredditFilter = null)`
  - If subredditFilter provided: `.find({ subreddit: subredditFilter })`
  - If null: `.find({})`
  - Always: `.populate('author').populate('subreddit').sort({ createdAt: -1 })`
  - Return array or empty array if none found
  
- `fetchThreadById(id)`
  - `Thread.findById(id).populate('author').populate('subreddit')`
  - Return thread object or null if not found

**Controller Layer** (`threadController.js`)
- `getAllThreads(req, res)`
  - Extract `?subreddit=ID` from query params (optional)
  - Call service method
  - Return 200 with array data
  - Handle errors with 500
  
- `getThreadById(req, res)`
  - Extract `req.params.id`
  - Call service method
  - Return 200 if found, 404 if not found
  - Return standard response format: `{ success, message, data }`

**Routes** (`threads.js`)
- `router.get('/', getAllThreads)`
- `router.get('/:id', getThreadById)`

**Error Handling**
- Invalid ObjectId format → 400 Bad Request
- Thread not found → 404 Not Found
- Database errors → 500 Internal Server Error

---

## Phase 2: POST and PUT Endpoints

### Endpoints to Implement
- `POST /api/threads` — Create new thread
- `PUT /api/threads/:id` — Update existing thread

### Required Files to Modify
- `src/services/threadService.js` — Add 3 new service methods
- `src/controllers/threadController.js` — Add 2 new controller handlers
- `src/routes/threads.js` — Add 2 route handlers (POST and PUT)

### Key Considerations

**Service Layer** (`threadService.js`)
- `validateSubredditExists(subredditId)`
  - `Subreddit.findById(subredditId)`
  - Return boolean (true/false)
  
- `createThread(threadData)` — receives `{ title, content, author, subreddit }`
  - Validate all required fields present (title, content, author, subreddit)
  - Call `validateSubredditExists()` — throw error if false
  - Create new Thread instance
  - Save and populate before returning
  - Populate: `.populate('author').populate('subreddit')`
  
- `updateThread(id, updateData)` — receives `{ title, content, upvotes, downvotes }`
  - Only allow updates to: title, content, upvotes, downvotes (filter other fields)
  - `Thread.findByIdAndUpdate(id, updateData, { new: true })`
  - Populate result before returning
  - Return updated thread or null if not found

**Controller Layer** (`threadController.js`)
- `createThread(req, res)`
  - Extract: title, content, author, subreddit from req.body
  - Validate all required fields present → 400 if missing
  - Call service.createThread()
  - Return 201 Created on success
  - Return 404 if subreddit doesn't exist
  - Return 500 on database errors
  
- `updateThread(req, res)`
  - Extract id from req.params
  - Extract allowed fields from req.body (title, content, upvotes, downvotes)
  - Call service.updateThread(id, cleanData)
  - Return 200 on success
  - Return 404 if thread not found
  - Return 400 for invalid ID format

**Routes** (`threads.js`)
- `router.post('/', createThread)` — *depends on Phase 1 completion*
- `router.put('/:id', updateThread)` — *depends on Phase 1 completion*

**Validation Rules**
- title: required, non-empty string
- content: required, non-empty string
- author: required, valid ObjectId
- subreddit: required, valid ObjectId + must exist in database
- upvotes/downvotes: optional, numeric values only

**Error Handling**
- Missing required fields → 400 Bad Request
- Subreddit not found → 404 Not Found
- Invalid ObjectId → 400 Bad Request
- Database errors → 500 Internal Server Error
- Duplicate thread title in same subreddit → 409 Conflict (optional enhancement)

---

## Phase 3: DELETE Endpoint

### Endpoints to Implement
- `DELETE /api/threads/:id` — Delete thread by ID

### Required Files to Modify
- `src/services/threadService.js` — Add 1 new service method
- `src/controllers/threadController.js` — Add 1 new controller handler
- `src/routes/threads.js` — Add 1 DELETE route handler

### Key Considerations

**Service Layer** (`threadService.js`)
- `deleteThread(id)`
  - `Thread.findByIdAndDelete(id)`
  - Return deleted thread object (for confirmation) or null if not found

**Controller Layer** (`threadController.js`)
- `deleteThread(req, res)`
  - Extract id from req.params
  - Call service.deleteThread(id)
  - Return 200 with message "Thread deleted successfully" if successful
  - Return 404 if thread not found
  - Return 400 for invalid ID format
  - No authorization checks (any user can delete)

**Routes** (`threads.js`)
- `router.delete('/:id', deleteThread)` — *depends on Phase 1 & 2 completion*

**Error Handling**
- Invalid ObjectId → 400 Bad Request
- Thread not found → 404 Not Found
- Database errors → 500 Internal Server Error

---

## Implementation Sequence & Dependencies

```
Phase 1 (GET endpoints)
├── Create threadService methods
├── Create threadController methods
├── Wire routes
└── Uncomment app.js line 2 ✅ Ready for testing

Phase 2 (POST/PUT endpoints)
├── *depends on Phase 1* ← Service methods for both threads
├── Create additional threadService methods (validate, create, update)
├── Create threadController methods
└── Wire routes ✅ Ready for testing

Phase 3 (DELETE endpoint)
├── *depends on Phase 1 & 2* ← Full thread infrastructure
├── Create threadService delete method
├── Create threadController delete method
└── Wire route ✅ Ready for testing
```

**Parallelization**: Within each phase, all service methods can be written in parallel (no interdependencies). Controllers can be implemented in parallel once services are done. Routes are wired last.

---

## Verification Steps

**Phase 1 Verification**
1. Use Postman/REST client:
   - `GET /api/threads` → returns array of threads with author/subreddit populated
   - `GET /api/threads/:validId` → returns single thread with nested author/subreddit
   - `GET /api/threads/:invalidId` → returns 404
   - `GET /api/threads?subreddit=SUBID` → filters threads by subreddit
2. Check response format matches: `{ success, message, data }`

**Phase 2 Verification**
1. `POST /api/threads` with valid payload → creates thread, returns 201
2. `POST /api/threads` with missing required fields → returns 400
3. `POST /api/threads` with non-existent subreddit → returns 404
4. `PUT /api/threads/:id` with title/content update → updates and returns 200
5. `PUT /api/threads/:id` with upvotes/downvotes → updates votes
6. `PUT /api/threads/:invalidId` → returns 404

**Phase 3 Verification**
1. `DELETE /api/threads/:id` with valid ID → deletes thread, returns 200
2. `DELETE /api/threads/:invalidId` → returns 404
3. Verify deleted thread no longer appears in GET /api/threads

---

## Critical Architecture References

**Response Format** (standardized across all endpoints):
```javascript
{ success: true/false, message: "...", data: { /* payload */ } }
```

**Populate Pattern** (from subredditController.js):
```javascript
.populate('author').populate('subreddit')
```

**Service Method Pattern** (from subredditService.js):
- Accept minimal parameters (id, data)
- Perform DB operations with error handling
- Return data or null
- Let controller handle HTTP responses

**Error Response Pattern** (from subredditController.js):
```javascript
if (!resource) {
  return res.status(404).json({ success: false, message: "Not found" });
}
return res.status(500).json({ success: false, message: error.message });
```

---

## Files Involved (Full Paths)

- `src/services/threadService.js` — +6 new exported functions
- `src/controllers/threadController.js` — +5 new exported functions
- `src/routes/threads.js` — +5 new route handlers
- `src/app.js` — uncomment 1 line (route import)

---

## Decisions & Scope

**Included:**
- All 5 Thread endpoints (GET all, GET one, POST, PUT, DELETE)
- Full relationship population (author, subreddit details)
- Subreddit existence validation on CREATE
- Query parameter filtering on GET all
- Vote field updates in PUT endpoint
- Standard error handling with appropriate HTTP codes

**Explicitly Excluded:**
- Authorization/authentication (any user can create/delete)
- Duplicate thread detection
- Vote/like system implementation (fields exist, but no endpoint logic)
- Comment/reply functionality
- Pagination for GET /api/threads
- Input sanitization (rely on Mongoose validation)

**Assumptions:**
- All required user/subreddit references already exist in database
- No middleware authentication layer needed for MVP
- Thread author can be any valid User ID (no session check)
