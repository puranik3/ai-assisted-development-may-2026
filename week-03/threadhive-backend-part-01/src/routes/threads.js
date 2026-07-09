import express from "express";
import {
  getAllThreads,
  getThreadById,
  createThreadHandler,
  updateThreadHandler,
  deleteThreadHandler,
} from "../controllers/threadController.js";

const router = express.Router();

/**
 * Thread Routes:
 *
 * GET  /       → getAllThreads       (list all threads, supports ?subreddit=ID filter)
 * GET  /:id    → getThreadById       (get one thread with populated author and subreddit)
 * POST /       → createThreadHandler (create new thread)
 * PUT  /:id    → updateThreadHandler (update thread)
 * DELETE /:id  → deleteThreadHandler (delete thread)
 *
 * All phases complete: Phase 1, 2, and 3
 */

// GET all threads with optional subreddit filter
// http://localhost:3000/api/threads
// http://localhost:3000/api/threads?subreddit=SUBID
router.get("/", getAllThreads);

// POST create new thread
// http://localhost:3000/api/threads
router.post("/", createThreadHandler);

// GET single thread by ID
// http://localhost:3000/api/threads/6a36acd175f18946a9f46baa
router.get("/:id", getThreadById);

// PUT update thread
// http://localhost:3000/api/threads/6a36acd175f18946a9f46baa
router.put("/:id", updateThreadHandler);

// DELETE thread
// http://localhost:3000/api/threads/6a36acd175f18946a9f46baa
router.delete("/:id", deleteThreadHandler);

export default router;