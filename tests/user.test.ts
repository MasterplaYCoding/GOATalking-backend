/// <reference types="jest" />

import request from "supertest";
import app from "../src/index"; 
import { resetDatabase, usersTable } from "../src/models/db";

beforeEach(() => {
  resetDatabase();
});

describe("User API Endpoints", () => {
  
  describe("POST /api/users", () => {
    it("should create a new user when data is valid", async () => {
      const newUser = {
        username: "testuser",
        email: "test@example.com",
        passwordHash: "supersecret123"
      };

      const response = await request(app).post("/api/users").send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.username).toBe("testuser");
      expect(usersTable.length).toBe(1);
    });

    it("should return 400 when Zod validation fails (invalid email)", async () => {
      const badUser = {
        username: "testuser",
        email: "not-an-email", 
        passwordHash: "123"
      };

      const response = await request(app).post("/api/users").send(badUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation Failed");
      expect(usersTable.length).toBe(0);
    });
  });

  describe("GET /api/users", () => {

    it("should use default pagination values when no query params are provided", async () => {
      const response = await request(app).get("/api/users");
      expect(response.status).toBe(200);
      expect(response.body.meta.currentPage).toBe(1);
      expect(response.body.meta.itemsPerPage).toBe(10);
    });

    it("should return paginated users", async () => {
      usersTable.push(
        { id: "1", username: "User1", email: "1@test.com", avatarUrl: "", passwordHash: "hash" },
        { id: "2", username: "User2", email: "2@test.com", avatarUrl: "", passwordHash: "hash" }
      );

      const response = await request(app).get("/api/users?page=1&limit=1");

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.meta.totalItems).toBe(2);
    });
  });

  describe("GET /api/users/stats", () => {
    it("should return user statistics", async () => {
      usersTable.push(
        { id: "1", username: "User1", email: "1@test.com", avatarUrl: "", passwordHash: "hash" },
        { id: "2", username: "User2", email: "2@test.com", avatarUrl: "", passwordHash: "hash" }
      );

      const response = await request(app).get("/api/users/stats");

      expect(response.status).toBe(200);
      expect(response.body.totalUsers).toBe(2);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return a user if it exists", async () => {
      usersTable.push(
        { id: "99", username: "Target", email: "target@test.com", avatarUrl: "", passwordHash: "hash" }
      );

      const response = await request(app).get("/api/users/99");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe("99");
    });

    it("should return 404 if user does not exist", async () => {
      const response = await request(app).get("/api/users/fake-id-123");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete a user if it exists", async () => {
      usersTable.push(
        { id: "99", username: "Target", email: "target@test.com", avatarUrl: "", passwordHash: "hash" }
      );

      const response = await request(app).delete("/api/users/99");

      expect(response.status).toBe(204); 
      expect(usersTable.length).toBe(0); 
    });

    it("should return 404 if trying to delete a non-existent user", async () => {
      const response = await request(app).delete("/api/users/fake-id-123");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });
  });
});