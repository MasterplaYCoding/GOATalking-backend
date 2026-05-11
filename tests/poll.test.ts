import express from 'express';
import request from 'supertest';
import pollRoutes from '../src/routes/pollRoutes';
import { prisma } from '../src/db';

const app = express();
app.use(express.json());
app.use('/api/polls', pollRoutes);

describe('Poll API CRUD Operations', () => {
  let createdPollId: string;

  beforeAll(async () => {
    await prisma.poll.deleteMany();
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
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. POST /api/polls - Should create a new poll', async () => {
    const newPoll = {
      title: "Test Poll?",
      category: "Testing",
      description: "A poll made by Jest.",
      imageUrl: "/test.png",
      ownerId: "demo-user",
      options: [
        { text: "Option A" },
        { text: "Option B" }
      ]
    };

    const res = await request(app).post('/api/polls').send(newPoll);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe("Test Poll?");
    expect(res.body.options.length).toBe(2);
    
    createdPollId = res.body.id; 
  });

  it('2. GET /api/polls - Should fetch a list of polls', async () => {
    const res = await request(app).get('/api/polls');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].id).toBe(createdPollId);
  });

  it('3. PUT /api/polls/:id - Should update the poll', async () => {
    const res = await request(app)
      .put(`/api/polls/${createdPollId}`)
      .send({ title: "Updated Test Poll?" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated Test Poll?");
  });

  it('4. DELETE /api/polls/:id - Should delete the poll', async () => {
    const res = await request(app).delete(`/api/polls/${createdPollId}`);
    
    expect(res.status).toBe(204); 

    const fetchRes = await request(app).get(`/api/polls/${createdPollId}`);
    expect(fetchRes.status).toBe(404);
  });

 describe('Poll API - Sabotage Tests (500 Errors)', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('Should trigger a 500 error on GET all polls', async () => {
      jest.spyOn(prisma.poll, 'findMany').mockRejectedValue(new Error('Simulated Database Failure'));

      const res = await request(app).get('/api/polls');
      expect(res.status).toBe(500);
    });

    it('Should trigger a 500 error on POST poll', async () => {
      jest.spyOn(prisma.poll, 'create').mockRejectedValue(new Error('Simulated Crash'));
      
      const perfectPayload = {
        title: "Test Poll?",
        category: "Testing",
        description: "A poll made by Jest.",
        imageUrl: "/test.png",
        ownerId: "demo-user",
        options: [
          { text: "Option A" },
          { text: "Option B" }
        ]
      };

      const res = await request(app).post('/api/polls').send(perfectPayload);
      expect(res.status).toBe(500);
    });
  });
});