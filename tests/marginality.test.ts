/// <reference types="jest" />

import request from "supertest";
import app from "../src/index";
import { resetDatabase, marginalityTestsTable, marginalityResponsesTable } from "../src/models/db";

beforeEach(() => {
  resetDatabase();
});

describe("Marginality API Endpoints", () => {
  describe("POST /api/marginality", () => {
    it("should create a new test when data is valid", async () => {
      const newTest = {
        title: "Tech Preferences",
        topic: "Technology",
        description: "A test about tech.",
        categoryDefinitions: [
          { key: "ageGroup", label: "Age Group", inputType: "select" }
        ],
        questions: [
          { id: "q1", text: "I love coding." }
        ]
      };

      const response = await request(app).post("/api/marginality").send(newTest);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe("Tech Preferences");
      expect(marginalityTestsTable.length).toBe(1);
    });

    it("should return 400 when Zod validation fails", async () => {
      const badTest = { title: "Short" };
      const response = await request(app).post("/api/marginality").send(badTest);
      expect(response.status).toBe(400);
      expect(marginalityTestsTable.length).toBe(0);
    });
  });

  describe("GET /api/marginality", () => {

    it("should use default pagination values when no query params are provided", async () => {
      const response = await request(app).get("/api/marginality");
      expect(response.status).toBe(200);
      expect(response.body.meta.currentPage).toBe(1);
      expect(response.body.meta.itemsPerPage).toBe(10);
    });

    it("should return paginated tests", async () => {
      marginalityTestsTable.push(
        { id: "1", title: "Test 1", topic: "A", description: "", categoryDefinitions: [], questions: [], createdAt: new Date() },
        { id: "2", title: "Test 2", topic: "B", description: "", categoryDefinitions: [], questions: [], createdAt: new Date() }
      );
      const response = await request(app).get("/api/marginality?page=1&limit=1");
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.meta.totalItems).toBe(2);
    });
  });

  describe("GET /api/marginality/:id", () => {
    it("should return a test if it exists", async () => {
      marginalityTestsTable.push({ id: "99", title: "Target Test", topic: "A", description: "", categoryDefinitions: [], questions: [], createdAt: new Date() });
      const response = await request(app).get("/api/marginality/99");
      expect(response.status).toBe(200);
      expect(response.body.id).toBe("99");
    });

    it("should return 404 if test does not exist", async () => {
      const response = await request(app).get("/api/marginality/fake-id");
      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/marginality/:id", () => {
    it("should delete a test if it exists", async () => {
      marginalityTestsTable.push({ id: "99", title: "Target Test", topic: "A", description: "", categoryDefinitions: [], questions: [], createdAt: new Date() });
      const response = await request(app).delete("/api/marginality/99");
      expect(response.status).toBe(204);
      expect(marginalityTestsTable.length).toBe(0);
    });

    it("should return 404 if trying to delete a non-existent test", async () => {
      const response = await request(app).delete("/api/marginality/fake-id");
      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/marginality/responses", () => {
    it("should create a new response", async () => {
      const newResponse = {
        testId: "test-1",
        userId: "user-1",
        categoryValues: { "ageGroup": "GenZ" },
        votes: [{ questionId: "q1", agreement: 5 }]
      };
      const response = await request(app).post("/api/marginality/responses").send(newResponse);
      expect(response.status).toBe(201);
      expect(marginalityResponsesTable.length).toBe(1);
    });

    it("should update an existing response if the user votes again", async () => {
      marginalityResponsesTable.push({
        id: "resp-1", testId: "test-1", userId: "user-1", categoryValues: {}, votes: [{ questionId: "q1", agreement: 1 }], submittedAt: new Date()
      });

      const updatedResponse = {
        testId: "test-1",
        userId: "user-1",
        categoryValues: { "ageGroup": "GenZ" },
        votes: [{ questionId: "q1", agreement: 5 }]
      };

      const response = await request(app).post("/api/marginality/responses").send(updatedResponse);
      expect(response.status).toBe(201);
      expect(marginalityResponsesTable.length).toBe(1);
      expect(marginalityResponsesTable[0]?.votes[0]?.agreement).toBe(5);    
    });
  });
});