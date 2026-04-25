import request from "supertest";
import app from "../src/index";
import { resetDatabase, pollsTable } from "../src/models/db";

beforeEach(() => {
  resetDatabase();
});

describe("Poll API Endpoints", () => {
  
  describe("POST /api/polls", () => {
    it("should create a new poll when data is valid", async () => {
      const newPoll = {
        title: "Who is the GOAT?",
        category: "Sports",
        description: "Messi vs Ronaldo",
        options: [{ text: "Messi" }, { text: "Ronaldo" }]
      };

      const response = await request(app).post("/api/polls").send(newPoll);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe("Who is the GOAT?");
      expect(pollsTable.length).toBe(1); 
    });

    it("should return 400 when Zod validation fails (missing title)", async () => {
      const badPoll = {
        category: "Sports",
        options: [{ text: "Messi" }]
      };

      const response = await request(app).post("/api/polls").send(badPoll);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation Failed");
      expect(pollsTable.length).toBe(0); 
    });
  });

  describe("GET /api/polls", () => {

    it("should use default pagination values when no query params are provided", async () => {
      const response = await request(app).get("/api/polls");
      expect(response.status).toBe(200);
      expect(response.body.meta.currentPage).toBe(1);
      expect(response.body.meta.itemsPerPage).toBe(10);
    });

    it("should return paginated polls", async () => {
      pollsTable.push(
        { id: "1", title: "Test 1", category: "A", description: "", imageUrl: "", options: [], dateCreated: new Date(), interactionCount: 0 },
        { id: "2", title: "Test 2", category: "B", description: "", imageUrl: "", options: [], dateCreated: new Date(), interactionCount: 0 }
      );

      const response = await request(app).get("/api/polls?page=1&limit=1");

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.meta.totalItems).toBe(2);
      expect(response.body.meta.totalPages).toBe(2);
    });
  });

  describe("GET /api/polls/stats", () => {

    it("should handle stats when there are no polls in the database", async () => {
      const response = await request(app).get("/api/polls/stats");
      expect(response.status).toBe(200);
      expect(response.body.totalPolls).toBe(0);
      expect(response.body.mostPopularPollId).toBeNull();
    });

    it("should return correct statistics", async () => {
      pollsTable.push(
        { id: "1", title: "A", category: "A", description: "", imageUrl: "", options: [], dateCreated: new Date(), interactionCount: 5 },
        { id: "2", title: "B", category: "B", description: "", imageUrl: "", options: [], dateCreated: new Date(), interactionCount: 20 } // Most popular
      );

      const response = await request(app).get("/api/polls/stats");

      expect(response.status).toBe(200);
      expect(response.body.totalPolls).toBe(2);
      expect(response.body.totalInteractions).toBe(25);
      expect(response.body.mostPopularPollId).toBe("2");
    });
  });
  
  describe("GET /api/polls/:id", () => {
    it("should return a poll if it exists", async () => {
      pollsTable.push(
        { id: "99", title: "Target Poll", category: "A", description: "", imageUrl: "", options: [], dateCreated: new Date(), interactionCount: 0 }
      );

      const response = await request(app).get("/api/polls/99");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe("99");
      expect(response.body.title).toBe("Target Poll");
    });

    it("should return 404 if poll does not exist", async () => {
      const response = await request(app).get("/api/polls/fake-id-123");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Poll not found");
    });
  });

  describe("DELETE /api/polls/:id", () => {
    it("should delete a poll if it exists", async () => {
      pollsTable.push(
        { id: "99", title: "Target Poll", category: "A", description: "", imageUrl: "", options: [], dateCreated: new Date(), interactionCount: 0 }
      );

      const response = await request(app).delete("/api/polls/99");

      expect(response.status).toBe(204); 
      expect(pollsTable.length).toBe(0);
    });

    it("should return 404 if trying to delete a non-existent poll", async () => {
      const response = await request(app).delete("/api/polls/fake-id-123");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Poll not found");
    });
  });
});