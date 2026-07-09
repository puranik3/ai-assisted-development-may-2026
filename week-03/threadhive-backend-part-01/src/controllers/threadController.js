import {
  fetchAllThreads,
  fetchThreadById,
  createThread,
  updateThread,
  deleteThread,
} from "../services/threadService.js";

/**
 * Get all threads, optionally filtered by subreddit
 * Supports query parameter: ?subreddit=ID
 */
export const getAllThreads = async (req, res) => {
  try {
    const { subreddit } = req.query;
    const threads = await fetchAllThreads(subreddit || null);

    res.status(200).json({
      success: true,
      message: "Threads fetched successfully",
      data: threads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * Get a single thread by ID with populated author and subreddit
 */
export const getThreadById = async (req, res) => {
  try {
    const { id } = req.params;
    const thread = await fetchThreadById(id);

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: "Thread not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Thread fetched successfully",
      data: thread,
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid thread ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * Create a new thread
 * POST /api/threads
 */
export const createThreadHandler = async (req, res) => {
  try {
    const { title, content, author, subreddit } = req.body;

    // Validate required fields
    if (!title || !content || !author || !subreddit) {
      return res.status(400).json({
        success: false,
        message:
          "Title, content, author, and subreddit are required",
      });
    }

    const createdThread = await createThread({
      title,
      content,
      author,
      subreddit,
    });

    res.status(201).json({
      success: true,
      message: "Thread created successfully",
      data: createdThread,
    });
  } catch (error) {
    // Check if error is due to subreddit not found
    if (error.message === "Subreddit not found") {
      return res.status(404).json({
        success: false,
        message: "Subreddit not found",
      });
    }

    // Handle validation errors
    if (error.message.includes("Missing required fields")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * Update a thread
 * PUT /api/threads/:id
 */
export const updateThreadHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate that at least one field is provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }

    const updatedThread = await updateThread(id, updateData);

    if (!updatedThread) {
      return res.status(404).json({
        success: false,
        message: "Thread not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Thread updated successfully",
      data: updatedThread,
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid thread ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * Delete a thread
 * DELETE /api/threads/:id
 */
export const deleteThreadHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedThread = await deleteThread(id);

    if (!deletedThread) {
      return res.status(404).json({
        success: false,
        message: "Thread not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Thread deleted successfully",
      data: deletedThread,
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid thread ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};