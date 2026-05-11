import express from 'express';
import request from 'supertest';
import { getLists, createList, updateList, deleteList, assignPollToList } from '../src/controllers/listController';
import { prisma } from '../src/db';

const app = express();
app.use(express.json());
app.get('/api/lists', getLists);
app.post('/api/lists', createList);
app.put('/api/lists/:id', updateList);
app.delete('/api/lists/:id', deleteList);
app.post('/api/lists/assign', assignPollToList);

describe('List API CRUD Operations', () => {
  let createdListId: string;
  let dummyPollId: string;

  beforeAll(async () => {
    await prisma.poll.deleteMany();
    await prisma.pollList.deleteMany();
    await prisma.user.upsert({
      where: { id: "demo-user" },
      update: {},
      create: {
        id: "demo-user",
        email: "demo@system.local",
        username: "Test User",
        passwordHash: "hash",
        avatarUrl: "/logo.png"
      }
    });

    // Create a dummy poll to test assignment
    const poll = await prisma.poll.create({
      data: { 
        title: "Dummy Poll", 
        category: "Test", 
        description: "Test", 
        ownerId: "demo-user", 
        interactionCount: 0,
        imageUrl: "/logo.png"
      }
    });
    dummyPollId = poll.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. POST /api/lists - Should create a new list', async () => {
    const newList = { name: "Test List", description: "Created by Jest", ownerId: "demo-user" };
    const res = await request(app).post('/api/lists').send(newList);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe("Test List");
    createdListId = res.body.id;
  });

  it('2. GET /api/lists - Should fetch all lists', async () => {
    const res = await request(app).get('/api/lists');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('3. PUT /api/lists/:id - Should update the list', async () => {
    const res = await request(app).put(`/api/lists/${createdListId}`).send({ name: "Updated List" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated List");
  });

  it('4. POST /api/lists/assign - Should assign a poll to the list', async () => {
    const res = await request(app).post('/api/lists/assign').send({ pollId: dummyPollId, listId: createdListId });
    expect(res.status).toBe(200);
    expect(res.body.listId).toBe(createdListId);
  });

  it('5. DELETE /api/lists/:id - Should delete the list', async () => {
    const res = await request(app).delete(`/api/lists/${createdListId}`);
    expect(res.status).toBe(204);
  });

  it('6. PUT /api/lists/:id - Should return 404 for non-existent list', async () => {
    const res = await request(app).put('/api/lists/fake-list-id-123').send({ name: "Ghost List" });
    expect(res.status).toBe(404);
  });

  it('7. DELETE /api/lists/:id - Should return 404 for non-existent list', async () => {
    const res = await request(app).delete('/api/lists/fake-list-id-123');
    expect(res.status).toBe(404);
  });

  it('8. POST /api/lists/assign - Should return 404 for non-existent poll', async () => {
    const res = await request(app).post('/api/lists/assign').send({ pollId: "fake-poll-123", listId: "fake-list" });
    expect(res.status).toBe(404);
  });

  describe('List API - Sabotage Tests (500 Errors)', () => {
    afterEach(() => jest.restoreAllMocks());

    it('Should trigger a 500 error on GET lists', async () => {
      jest.spyOn(prisma.pollList, 'findMany').mockRejectedValue(new Error('Crash'));
      const res = await request(app).get('/api/lists');
      expect(res.status).toBe(500);
    });
  });
});