import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAllThreads,
  getThreadByID,
  createThread,
  updateThread,
  deleteThread,
} from "./threadController.js";
import * as threadService from "../services/threadService.js";
import { createAppError } from "../utils/createAppError.js";

// Mock the threadService module
vi.mock("../services/threadService.js");

describe("ThreadController", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe("getAllThreads", () => {
    it("should fetch all threads successfully", async () => {
      // Arrange
      const mockThreads = [
        {
          _id: "thread1",
          title: "Test Thread 1",
          content: "Content 1",
          author: { _id: "user1", name: "John" },
          subreddit: { _id: "sub1", name: "r/test" },
        },
        {
          _id: "thread2",
          title: "Test Thread 2",
          content: "Content 2",
          author: { _id: "user2", name: "Jane" },
          subreddit: { _id: "sub1", name: "r/test" },
        },
      ];
      mockReq = {};
      threadService.fetchAllThreads.mockResolvedValue(mockThreads);

      // Act
      await getAllThreads(mockReq, mockRes);

      // Assert
      expect(threadService.fetchAllThreads).toHaveBeenCalledOnce();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Threads fetched successfully",
        data: mockThreads,
      });
    });

    it("should handle empty thread list", async () => {
      // Arrange
      mockReq = {};
      threadService.fetchAllThreads.mockResolvedValue([]);

      // Act
      await getAllThreads(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Threads fetched successfully",
        data: [],
      });
    });
  });

  describe("getThreadByID", () => {
    it("should fetch thread by ID successfully", async () => {
      // Arrange
      const mockThread = {
        _id: "thread1",
        title: "Test Thread",
        content: "Test content",
        author: { _id: "user1", name: "John" },
        subreddit: { _id: "sub1", name: "r/test" },
      };
      mockReq = { params: { id: "thread1" } };
      threadService.fetchThreadById.mockResolvedValue(mockThread);

      // Act
      await getThreadByID(mockReq, mockRes);

      // Assert
      expect(threadService.fetchThreadById).toHaveBeenCalledWith("thread1");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Thread fetched successfully",
        data: mockThread,
      });
    });

    it("should return null when thread not found", async () => {
      // Arrange
      mockReq = { params: { id: "nonexistent" } };
      threadService.fetchThreadById.mockResolvedValue(null);

      // Act
      await getThreadByID(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Thread fetched successfully",
        data: null,
      });
    });
  });

  describe("createThread", () => {
    it("should create thread successfully with valid input", async () => {
      // Arrange
      const mockThread = {
        _id: "thread1",
        title: "New Thread",
        content: "New content",
        author: { _id: "user1", name: "John" },
        subreddit: { _id: "sub1", name: "r/test" },
      };
      mockReq = {
        body: {
          title: "New Thread",
          content: "New content",
          subreddit: "sub1",
        },
        user: { userId: "user1" },
      };
      threadService.createNewThread.mockResolvedValue(mockThread);

      // Act
      await createThread(mockReq, mockRes);

      // Assert
      expect(threadService.createNewThread).toHaveBeenCalledWith(
        "New Thread",
        "New content",
        "user1",
        "sub1"
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Thread created successfully",
        data: mockThread,
      });
    });

    it("should throw error when title is missing", async () => {
      // Arrange
      mockReq = {
        body: {
          content: "New content",
          subreddit: "sub1",
        },
        user: { userId: "user1" },
      };

      // Act & Assert
      try {
        await createThread(mockReq, mockRes);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.message).toBe("Title, content, and subreddit are required.");
        expect(error.statusCode).toBe(400);
      }
    });

    it("should throw error when content is missing", async () => {
      // Arrange
      mockReq = {
        body: {
          title: "New Thread",
          subreddit: "sub1",
        },
        user: { userId: "user1" },
      };

      // Act & Assert
      try {
        await createThread(mockReq, mockRes);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.message).toBe("Title, content, and subreddit are required.");
        expect(error.statusCode).toBe(400);
      }
    });

    it("should throw error when subreddit is missing", async () => {
      // Arrange
      mockReq = {
        body: {
          title: "New Thread",
          content: "New content",
        },
        user: { userId: "user1" },
      };

      // Act & Assert
      try {
        await createThread(mockReq, mockRes);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error.message).toBe("Title, content, and subreddit are required.");
        expect(error.statusCode).toBe(400);
      }
    });
  });

  describe("updateThread", () => {
    it("should update thread successfully", async () => {
      // Arrange
      const updateData = { title: "Updated Title" };
      const mockUpdatedThread = {
        _id: "thread1",
        title: "Updated Title",
        content: "Original content",
        author: { _id: "user1", name: "John" },
        subreddit: { _id: "sub1", name: "r/test" },
      };
      mockReq = { params: { id: "thread1" }, body: updateData };
      threadService.updateThreadById.mockResolvedValue(mockUpdatedThread);

      // Act
      await updateThread(mockReq, mockRes);

      // Assert
      expect(threadService.updateThreadById).toHaveBeenCalledWith(
        "thread1",
        updateData
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Thread updated successfully",
        data: mockUpdatedThread,
      });
    });

    it("should return null when thread not found for update", async () => {
      // Arrange
      mockReq = {
        params: { id: "nonexistent" },
        body: { title: "Updated Title" },
      };
      threadService.updateThreadById.mockResolvedValue(null);

      // Act
      await updateThread(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Thread updated successfully",
        data: null,
      });
    });

    it("should allow partial updates", async () => {
      // Arrange
      const updateData = { content: "Updated content only" };
      const mockUpdatedThread = {
        _id: "thread1",
        title: "Original Title",
        content: "Updated content only",
        author: { _id: "user1", name: "John" },
        subreddit: { _id: "sub1", name: "r/test" },
      };
      mockReq = { params: { id: "thread1" }, body: updateData };
      threadService.updateThreadById.mockResolvedValue(mockUpdatedThread);

      // Act
      await updateThread(mockReq, mockRes);

      // Assert
      expect(threadService.updateThreadById).toHaveBeenCalledWith(
        "thread1",
        updateData
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Thread updated successfully",
        })
      );
    });
  });

  describe("deleteThread", () => {
    it("should delete thread successfully", async () => {
      // Arrange
      const mockDeletedThread = {
        _id: "thread1",
        title: "Deleted Thread",
        content: "Deleted content",
        author: { _id: "user1", name: "John" },
        subreddit: { _id: "sub1", name: "r/test" },
      };
      mockReq = { params: { id: "thread1" } };
      threadService.deleteThreadById.mockResolvedValue(mockDeletedThread);

      // Act
      await deleteThread(mockReq, mockRes);

      // Assert
      expect(threadService.deleteThreadById).toHaveBeenCalledWith("thread1");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Thread deleted successfully",
        data: mockDeletedThread,
      });
    });

    it("should return null when thread not found for deletion", async () => {
      // Arrange
      mockReq = { params: { id: "nonexistent" } };
      threadService.deleteThreadById.mockResolvedValue(null);

      // Act
      await deleteThread(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Thread deleted successfully",
        data: null,
      });
    });
  });
});
