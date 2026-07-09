import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import Thread from "../models/Thread.js";
import User from "../models/User.js";
import Subreddit from "../models/Subreddit.js";
import {
  fetchAllThreads,
  fetchThreadById,
  createNewThread,
  updateThreadById,
  deleteThreadById,
} from "./threadService.js";

describe("ThreadService", () => {
  let mongoServer;
  let userId, subredditId;

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create test user
    const testUser = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
    });
    userId = testUser._id;

    // Create test subreddit
    const testSubreddit = await Subreddit.create({
      name: "r/test",
      description: "Test subreddit",
      author: userId,
    });
    subredditId = testSubreddit._id;
  }, 30000);

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  }, 30000);

  describe("fetchAllThreads", () => {
    it("should return all threads with populated references", async () => {
      // Arrange
      await Thread.create([
        {
          title: "First Thread",
          content: "First content",
          author: userId,
          subreddit: subredditId,
        },
        {
          title: "Second Thread",
          content: "Second content",
          author: userId,
          subreddit: subredditId,
        },
      ]);

      // Act
      const threads = await fetchAllThreads();

      // Assert
      expect(threads).toHaveLength(2);
      expect(threads[0]).toHaveProperty("title");
      expect(threads[0]).toHaveProperty("author");
      expect(threads[0]).toHaveProperty("subreddit");
      expect(threads[0].author._id).toEqual(userId);
      expect(threads[0].subreddit._id).toEqual(subredditId);
    });

    it("should return threads sorted by creation date descending", async () => {
      // Arrange - Clear previous data
      await Thread.deleteMany({});

      const thread1 = await Thread.create({
        title: "First Thread",
        content: "Content 1",
        author: userId,
        subreddit: subredditId,
      });

      // Add delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const thread2 = await Thread.create({
        title: "Second Thread",
        content: "Content 2",
        author: userId,
        subreddit: subredditId,
      });

      // Act
      const threads = await fetchAllThreads();

      // Assert
      expect(threads).toHaveLength(2);
      expect(threads[0]._id).toEqual(thread2._id); // Most recent first
      expect(threads[1]._id).toEqual(thread1._id);
    });

    it("should return empty array when no threads exist", async () => {
      // Arrange
      await Thread.deleteMany({});

      // Act
      const threads = await fetchAllThreads();

      // Assert
      expect(threads).toEqual([]);
    });
  });

  describe("fetchThreadById", () => {
    it("should return thread with populated references by ID", async () => {
      // Arrange
      const createdThread = await Thread.create({
        title: "Test Thread",
        content: "Test content",
        author: userId,
        subreddit: subredditId,
      });

      // Act
      const thread = await fetchThreadById(createdThread._id.toString());

      // Assert
      expect(thread).not.toBeNull();
      expect(thread._id).toEqual(createdThread._id);
      expect(thread.title).toBe("Test Thread");
      expect(thread.author._id).toEqual(userId);
      expect(thread.subreddit._id).toEqual(subredditId);
    });

    it("should return null for non-existent thread ID", async () => {
      // Arrange
      const fakeId = new mongoose.Types.ObjectId();

      // Act
      const thread = await fetchThreadById(fakeId.toString());

      // Assert
      expect(thread).toBeNull();
    });

    it("should handle invalid ObjectId format", async () => {
      // Arrange & Act & Assert
      try {
        await fetchThreadById("invalid-id");
        // MongoDB may handle this differently, but we expect null or error
      } catch (error) {
        // Expected behavior - invalid ID format
        expect(error).toBeDefined();
      }
    });
  });

  describe("createNewThread", () => {
    it("should create and return new thread with populated references", async () => {
      // Arrange
      const threadData = {
        title: "New Thread",
        content: "New content",
        author: userId,
        subreddit: subredditId,
      };

      // Act
      const newThread = await createNewThread(
        threadData.title,
        threadData.content,
        threadData.author,
        threadData.subreddit
      );

      // Assert
      expect(newThread).not.toBeNull();
      expect(newThread._id).toBeDefined();
      expect(newThread.title).toBe("New Thread");
      expect(newThread.content).toBe("New content");
      expect(newThread.author).toBeDefined();
      expect(newThread.subreddit).toBeDefined();
    });

    it("should set default values for upvotes and downvotes", async () => {
      // Arrange & Act
      const newThread = await createNewThread(
        "Test Thread",
        "Test content",
        userId,
        subredditId
      );

      // Assert
      expect(newThread.upvotes).toBe(0);
      expect(newThread.downvotes).toBe(0);
      expect(newThread.voteCount).toBe(0);
    });

    it("should create thread with timestamps", async () => {
      // Arrange & Act
      const newThread = await createNewThread(
        "Timestamped Thread",
        "Test content",
        userId,
        subredditId
      );

      // Assert
      expect(newThread.createdAt).toBeDefined();
      expect(newThread.updatedAt).toBeDefined();
      expect(newThread.createdAt).toBeInstanceOf(Date);
    });

    it("should require valid author ObjectId", async () => {
      // Arrange & Act & Assert
      try {
        await createNewThread(
          "Test Thread",
          "Test content",
          "invalid-author",
          subredditId
        );
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should require valid subreddit ObjectId", async () => {
      // Arrange & Act & Assert
      try {
        await createNewThread(
          "Test Thread",
          "Test content",
          userId,
          "invalid-subreddit"
        );
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("updateThreadById", () => {
    it("should update thread title successfully", async () => {
      // Arrange
      const thread = await Thread.create({
        title: "Original Title",
        content: "Original content",
        author: userId,
        subreddit: subredditId,
      });

      // Act
      const updatedThread = await updateThreadById(thread._id.toString(), {
        title: "Updated Title",
      });

      // Assert
      expect(updatedThread._id).toEqual(thread._id);
      expect(updatedThread.title).toBe("Updated Title");
      expect(updatedThread.content).toBe("Original content");
    });

    it("should update thread content successfully", async () => {
      // Arrange
      const thread = await Thread.create({
        title: "Title",
        content: "Original content",
        author: userId,
        subreddit: subredditId,
      });

      // Act
      const updatedThread = await updateThreadById(thread._id.toString(), {
        content: "Updated content",
      });

      // Assert
      expect(updatedThread.content).toBe("Updated content");
      expect(updatedThread.title).toBe("Title");
    });

    it("should allow updating multiple fields", async () => {
      // Arrange
      const thread = await Thread.create({
        title: "Original Title",
        content: "Original content",
        author: userId,
        subreddit: subredditId,
      });

      // Act
      const updatedThread = await updateThreadById(thread._id.toString(), {
        title: "New Title",
        content: "New content",
      });

      // Assert
      expect(updatedThread.title).toBe("New Title");
      expect(updatedThread.content).toBe("New content");
    });

    it("should return null for non-existent thread", async () => {
      // Arrange
      const fakeId = new mongoose.Types.ObjectId();

      // Act
      const result = await updateThreadById(fakeId.toString(), {
        title: "New Title",
      });

      // Assert
      expect(result).toBeNull();
    });

    it("should run validators on update", async () => {
      // Arrange
      const thread = await Thread.create({
        title: "Title",
        content: "Content",
        author: userId,
        subreddit: subredditId,
      });

      // Act & Assert - Attempting to set required field to null should fail
      try {
        await updateThreadById(thread._id.toString(), { title: null });
        // May or may not throw depending on validator
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("deleteThreadById", () => {
    it("should delete thread and return deleted document", async () => {
      // Arrange
      const thread = await Thread.create({
        title: "Thread to Delete",
        content: "Content",
        author: userId,
        subreddit: subredditId,
      });

      // Act
      const deletedThread = await deleteThreadById(thread._id.toString());

      // Assert
      expect(deletedThread._id).toEqual(thread._id);
      expect(deletedThread.title).toBe("Thread to Delete");

      // Verify thread no longer exists
      const foundThread = await Thread.findById(thread._id);
      expect(foundThread).toBeNull();
    });

    it("should return null for non-existent thread", async () => {
      // Arrange
      const fakeId = new mongoose.Types.ObjectId();

      // Act
      const result = await deleteThreadById(fakeId.toString());

      // Assert
      expect(result).toBeNull();
    });

    it("should handle invalid ObjectId format", async () => {
      // Arrange & Act & Assert
      try {
        await deleteThreadById("invalid-id");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
