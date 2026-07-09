import Thread from "../models/Thread.js";
import Subreddit from "../models/Subreddit.js";

/**
 * Fetch all threads, optionally filtered by subreddit
 * @param {string} subredditFilter - Optional subreddit ID to filter threads
 * @returns {Promise<Array>} Array of threads with populated author and subreddit
 */
export const fetchAllThreads = async (subredditFilter = null) => {
  try {
    let query = Thread.find();

    // Apply subreddit filter if provided
    if (subredditFilter) {
      query = Thread.find({ subreddit: subredditFilter });
    }

    const threads = await query
      .populate("author", "name email")
      .populate("subreddit")
      .sort({ createdAt: -1 });

    return threads;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch a single thread by ID with populated author and subreddit
 * @param {string} id - Thread ID
 * @returns {Promise<Object|null>} Thread object or null if not found
 */
export const fetchThreadById = async (id) => {
  try {
    const thread = await Thread.findById(id)
      .populate("author", "name email")
      .populate("subreddit");

    return thread;
  } catch (error) {
    throw error;
  }
};

/**
 * Validate if a subreddit exists by ID
 * @param {string} subredditId - Subreddit ID
 * @returns {Promise<boolean>} True if subreddit exists, false otherwise
 */
export const validateSubredditExists = async (subredditId) => {
  try {
    const subreddit = await Subreddit.findById(subredditId);
    return !!subreddit;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new thread
 * @param {Object} threadData - Thread data { title, content, author, subreddit }
 * @returns {Promise<Object>} Created thread with populated author and subreddit
 */
export const createThread = async (threadData) => {
  try {
    const { title, content, author, subreddit } = threadData;

    // Validate required fields
    if (!title || !content || !author || !subreddit) {
      throw new Error("Missing required fields: title, content, author, subreddit");
    }

    // Validate subreddit exists
    const subredditExists = await validateSubredditExists(subreddit);
    if (!subredditExists) {
      throw new Error("Subreddit not found");
    }

    const newThread = new Thread({
      title,
      content,
      author,
      subreddit,
    });

    const createdThread = await newThread.save();

    // Populate before returning
    const populatedThread = await Thread.findById(createdThread._id)
      .populate("author", "name email")
      .populate("subreddit");

    return populatedThread;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a thread (only title, content, upvotes, downvotes)
 * @param {string} id - Thread ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated thread or null if not found
 */
export const updateThread = async (id, updateData) => {
  try {
    // Only allow updates to specific fields
    const allowedFields = ["title", "content", "upvotes", "downvotes"];
    const cleanData = {};

    allowedFields.forEach((field) => {
      if (updateData.hasOwnProperty(field)) {
        cleanData[field] = updateData[field];
      }
    });

    const updatedThread = await Thread.findByIdAndUpdate(id, cleanData, {
      new: true,
    })
      .populate("author", "name email")
      .populate("subreddit");

    return updatedThread;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a thread by ID
 * @param {string} id - Thread ID
 * @returns {Promise<Object|null>} Deleted thread or null if not found
 */
export const deleteThread = async (id) => {
  try {
    const deletedThread = await Thread.findByIdAndDelete(id);
    return deletedThread;
  } catch (error) {
    throw error;
  }
};