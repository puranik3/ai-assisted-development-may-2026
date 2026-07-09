import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import supertest from "supertest";
import app from "../app.js";
import Thread from "../models/Thread.js";
import User from "../models/User.js";
import Subreddit from "../models/Subreddit.js";

const request = supertest(app);

describe("Threads API Routes", () => {
  let mongoServer;
  let userId, subredditId, validToken, threadId;

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

    // Create JWT token
    validToken = jwt.sign(
      { sub: userId, email: "test@example.com" },
      process.env.JWT_SECRET || "test-secret"
    );

    // Create test subreddit
    const testSubreddit = await Subreddit.create({
      name: "r/test",
      description: "Test subreddit",
      author: userId,
    });
    subredditId = testSubreddit._id;

    // Create test thread
    const testThread = await Thread.create({
      title: "Test Thread",
      content: "Test content",
      author: userId,
      subreddit: subredditId,
    });
    threadId = testThread._id;
  }, 30000);

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  }, 30000);

  describe("GET /api/threads", () => {
    it("should return all threads with 200 status", async () => {
      // Act
      const response = await request
        .get("/api/threads")
        .set("Authorization", `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message", "Threads fetched successfully");
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("should return threads with correct structure", async () => {
      // Act
      const response = await request
        .get("/api/threads")
        .set("Authorization", `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data[0]).toHaveProperty("_id");
      expect(response.body.data[0]).toHaveProperty("title");
      expect(response.body.data[0]).toHaveProperty("content");
      expect(response.body.data[0]).toHaveProperty("author");
      expect(response.body.data[0]).toHaveProperty("subreddit");
    });

    it("should return 401 when missing authorization header", async () => {
      // Act
      const response = await request.get("/api/threads");

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("Unauthorized");
    });

    it("should return 401 with invalid token", async () => {
      // Act
      const response = await request
        .get("/api/threads")
        .set("Authorization", "Bearer invalid-token");

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should return 401 with malformed auth header", async () => {
      // Act
      const response = await request
        .get("/api/threads")
        .set("Authorization", "InvalidFormat");

      // Assert
      expect(response.status).toBe(401);
    });

    it("should populate author and subreddit references", async () => {
      // Act
      const response = await request
        .get("/api/threads")
        .set("Authorization", `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data[0].author).toHaveProperty("_id");
      expect(response.body.data[0].author).toHaveProperty("name");
      expect(response.body.data[0].subreddit).toHaveProperty("_id");
      expect(response.body.data[0].subreddit).toHaveProperty("name");
    });
  });

  describe("GET /api/threads/:id", () => {
    it("should return thread by ID with 200 status", async () => {
      // Act
      const response = await request
        .get(`/api/threads/${threadId}`)
        .set("Authorization", `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message", "Thread fetched successfully");
      expect(response.body.data).toHaveProperty("_id", threadId.toString());
    });

    it("should return thread with correct structure", async () => {
      // Act
      const response = await request
        .get(`/api/threads/${threadId}`)
        .set("Authorization", `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("title", "Test Thread");
      expect(response.body.data).toHaveProperty("content", "Test content");
      expect(response.body.data).toHaveProperty("author");
      expect(response.body.data).toHaveProperty("subreddit");
    });

    it("should return null for non-existent thread ID", async () => {
      // Arrange
      const fakeId = new mongoose.Types.ObjectId();

      // Act
      const response = await request
        .get(`/api/threads/${fakeId}`)
        .set("Authorization", `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
    });

    it("should return 401 without auth token", async () => {
      // Act
      const response = await request.get(`/api/threads/${threadId}`);

      // Assert
      expect(response.status).toBe(401);
    });

    it("should handle invalid ObjectId format gracefully", async () => {
      // Act
      const response = await request
        .get("/api/threads/invalid-id")
        .set("Authorization", `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(200); // MongoDB handles invalid ID as null
      expect(response.body.data).toBeNull();
    });
  });

  describe("POST /api/threads", () => {
    it("should create thread with valid input and return 201", async () => {
      // Arrange
      const newThreadData = {
        title: "New Thread",
        content: "New thread content",
        subreddit: subredditId.toString(),
      };

      // Act
      const response = await request
        .post("/api/threads")
        .set("Authorization", `Bearer ${validToken}`)
        .send(newThreadData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message", "Thread created successfully");
      expect(response.body.data).toHaveProperty("_id");
      expect(response.body.data).toHaveProperty("title", "New Thread");
      expect(response.body.data).toHaveProperty("content", "New thread content");
    });

    it("should set author from authenticated user", async () => {
      // Arrange
      const newThreadData = {
        title: "Another Thread",
        content: "Content from authenticated user",
        subreddit: subredditId.toString(),
      };

      // Act
      const response = await request
        .post("/api/threads")
        .set("Authorization", `Bearer ${validToken}`)
        .send(newThreadData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.data.author._id).toBe(userId.toString());
    });

    it("should return 400 when title is missing", async () => {
      // Arrange
      const invalidThreadData = {
        content: "Content without title",
        subreddit: subredditId.toString(),
      };

      // Act
      const response = await request
        .post("/api/threads")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidThreadData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain("required");
    });

    it("should return 400 when content is missing", async () => {
      // Arrange
      const invalidThreadData = {
        title: "Title without content",
        subreddit: subredditId.toString(),
      };

      // Act
      const response = await request
        .post("/api/threads")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidThreadData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain("required");
    });

    it("should return 400 when subreddit is missing", async () => {
      // Arrange
      const invalidThreadData = {
        title: "Title",
        content: "Content without subreddit",
      };

      // Act
      const response = await request
        .post("/api/threads")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidThreadData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain("required");
    });

    it("should return 401 without auth token", async () => {
      // Arrange
      const newThreadData = {
        title: "New Thread",
        content: "Content",
        subreddit: subredditId.toString(),
      };

      // Act
      const response = await request
        .post("/api/threads")
        .send(newThreadData);

      // Assert
      expect(response.status).toBe(401);
    });

    it("should initialize vote counts to 0", async () => {
      // Arrange
      const newThreadData = {
        title: "Vote Test Thread",
        content: "Testing vote initialization",
        subreddit: subredditId.toString(),
      };

      // Act
      const response = await request
        .post("/api/threads")
        .set("Authorization", `Bearer ${validToken}`)
        .send(newThreadData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.data.upvotes).toBe(0);
      expect(response.body.data.downvotes).toBe(0);
      expect(response.body.data.voteCount).toBe(0);
    });

    it("should create thread with timestamp", async () => {
      // Arrange
      const newThreadData = {
        title: "Timestamp Thread",
        content: "Testing timestamps",
        subreddit: subredditId.toString(),
      };

      // Act
      const response = await request
        .post("/api/threads")
        .set("Authorization", `Bearer ${validToken}`)
        .send(newThreadData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty("createdAt");
      expect(response.body.data).toHaveProperty("updatedAt");
    });
  });

  describe("PUT /api/threads/:id", () => {
    let updateTestThreadId;

    beforeAll(async () => {
      // Create a thread specifically for update tests
      const updateTestThread = await Thread.create({
        title: "Update Test Thread",
        content: "Original content",
        author: userId,
        subreddit: subredditId,
      });
      updateTestThreadId = updateTestThread._id;
    });

    it("should update thread title successfully", async () => {
      // Arrange
      const updateData = { title: "Updated Title" };

      // Act
      const response = await request
        .put(`/api/threads/${updateTestThreadId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message", "Thread updated successfully");
      expect(response.body.data.title).toBe("Updated Title");
    });

    it("should update thread content successfully", async () => {
      // Arrange
      const updateData = { content: "Updated content" };

      // Act
      const response = await request
        .put(`/api/threads/${updateTestThreadId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.content).toBe("Updated content");
    });

    it("should allow partial updates", async () => {
      // Arrange
      const thread = await Thread.create({
        title: "Original",
        content: "Original",
        author: userId,
        subreddit: subredditId,
      });
      const partialUpdate = { title: "Only Title Updated" };

      // Act
      const response = await request
        .put(`/api/threads/${thread._id}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send(partialUpdate);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe("Only Title Updated");
      expect(response.body.data.content).toBe("Original");
    });

    it("should return null for non-existent thread", async () => {
      // Arrange
      const fakeId = new mongoose.Types.ObjectId();

      // Act
      const response = await request
        .put(`/api/threads/${fakeId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ title: "Updated" });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
    });

    it("should return 401 without auth token", async () => {
      // Arrange
      const updateData = { title: "Updated Title" };

      // Act
      const response = await request
        .put(`/api/threads/${updateTestThreadId}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(401);
    });

    it("should handle empty update object", async () => {
      // Arrange
      const thread = await Thread.create({
        title: "Test",
        content: "Test",
        author: userId,
        subreddit: subredditId,
      });

      // Act
      const response = await request
        .put(`/api/threads/${thread._id}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({});

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data._id).toBeDefined();
    });
  });

  describe("DELETE /api/threads/:id", () => {
    let deleteTestThreadId;

    beforeAll(async () => {
      // Create a thread specifically for deletion test
      const deleteTestThread = await Thread.create({
        title: "Delete Test Thread",
        content: "Will be deleted",
        author: userId,
        subreddit: subredditId,
      });
      deleteTestThreadId = deleteTestThread._id;
    });

    it("should delete thread successfully and return deleted document", async () => {
      // Arrange
      const thread = await Thread.create({
        title: "To Delete",
        content: "Content",
        author: userId,
        subreddit: subredditId,
      });

      // Act
      const response = await request
        .delete(`/api/threads/${thread._id}`)
        .set("Authorization", `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message", "Thread deleted successfully");
      expect(response.body.data._id).toBe(thread._id.toString());

      // Verify thread is actually deleted
      const deletedThread = await Thread.findById(thread._id);
      expect(deletedThread).toBeNull();
    });

    it("should return null for non-existent thread", async () => {
      // Arrange
      const fakeId = new mongoose.Types.ObjectId();

      // Act
      const response = await request
        .delete(`/api/threads/${fakeId}`)
        .set("Authorization", `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
    });

    it("should return 401 without auth token", async () => {
      // Act
      const response = await request.delete(
        `/api/threads/${deleteTestThreadId}`
      );

      // Assert
      expect(response.status).toBe(401);
    });

    it("should return 401 with invalid token", async () => {
      // Act
      const response = await request
        .delete(`/api/threads/${deleteTestThreadId}`)
        .set("Authorization", "Bearer invalid-token");

      // Assert
      expect(response.status).toBe(401);
    });

    it("should handle invalid ObjectId format", async () => {
      // Act
      const response = await request
        .delete("/api/threads/invalid-id")
        .set("Authorization", `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
    });
  });

  describe("Edge Cases and Error Scenarios", () => {
    it("should handle concurrent thread creation", async () => {
      // Arrange
      const threadData1 = {
        title: "Concurrent Thread 1",
        content: "Content 1",
        subreddit: subredditId.toString(),
      };
      const threadData2 = {
        title: "Concurrent Thread 2",
        content: "Content 2",
        subreddit: subredditId.toString(),
      };

      // Act
      const [response1, response2] = await Promise.all([
        request
          .post("/api/threads")
          .set("Authorization", `Bearer ${validToken}`)
          .send(threadData1),
        request
          .post("/api/threads")
          .set("Authorization", `Bearer ${validToken}`)
          .send(threadData2),
      ]);

      // Assert
      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.body.data._id).not.toBe(response2.body.data._id);
    });

    it("should handle thread with very long title", async () => {
      // Arrange
      const longTitle = "A".repeat(1000);
      const threadData = {
        title: longTitle,
        content: "Content",
        subreddit: subredditId.toString(),
      };

      // Act
      const response = await request
        .post("/api/threads")
        .set("Authorization", `Bearer ${validToken}`)
        .send(threadData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe(longTitle);
    });

    it("should handle thread with special characters in content", async () => {
      // Arrange
      const specialContent = "Content with @#$%^&*() and émojis 🎉";
      const threadData = {
        title: "Special Characters Test",
        content: specialContent,
        subreddit: subredditId.toString(),
      };

      // Act
      const response = await request
        .post("/api/threads")
        .set("Authorization", `Bearer ${validToken}`)
        .send(threadData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.data.content).toBe(specialContent);
    });
  });
});
