import express from 'express';
import request from 'supertest';
import pollRoutes from '../src/routes/pollRoutes';
import { prisma } from '../src/db';

const app = express();
app.use(express.json());
app.use('/api/polls', pollRoutes);

describe('Poll API CRUD Operations', () => {
  let createdPollId: string;
  let optionId1: string;
  let optionId2: string;

  beforeAll(async () => {
    await prisma.pollVote.deleteMany();
    await prisma.pollOption.deleteMany();
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
    expect(res.body.options.length).toBe(2);
    
    createdPollId = res.body.id; 
    optionId1 = res.body.options[0].id;
    optionId2 = res.body.options[1].id;
  });

  it('2. GET /api/polls - Should fetch a list of polls', async () => {
    const res = await request(app).get('/api/polls');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('3. GET /api/polls/:id - Should fetch a specific poll', async () => {
    const res = await request(app).get(`/api/polls/${createdPollId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdPollId);
  });

  it('4. GET /api/polls/:id - Should return 404 for missing poll', async () => {
    const res = await request(app).get(`/api/polls/fake-id-123`);
    expect(res.status).toBe(404);
  });

  it('5. GET /api/polls/stats - Should fetch poll stats', async () => {
    const res = await request(app).get('/api/polls/stats');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalPolls');
  });

  it('6. GET /api/polls/user/:userId - Should fetch polls by user', async () => {
    const res = await request(app).get('/api/polls/user/demo-user');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('7. POST /api/polls/vote - Should cast a new vote', async () => {
    const res = await request(app).post('/api/polls/vote').send({
      pollId: createdPollId,
      optionId: optionId1,
      userId: "demo-user"
    });
    expect(res.status).toBe(200);
  });

  it('8. POST /api/polls/vote - Should ignore an identical vote', async () => {
    const res = await request(app).post('/api/polls/vote').send({
      pollId: createdPollId,
      optionId: optionId1, // Same option
      userId: "demo-user"
    });
    expect(res.status).toBe(200);
  });

  it('9. POST /api/polls/vote - Should switch vote to a different option', async () => {
    const res = await request(app).post('/api/polls/vote').send({
      pollId: createdPollId,
      optionId: optionId2, // Different option
      userId: "demo-user"
    });
    expect(res.status).toBe(200);
  });

  it('10. PUT /api/polls/:id - Should update the poll', async () => {
    const res = await request(app)
      .put(`/api/polls/${createdPollId}`)
      .send({ title: "Updated Test Poll?" });
    expect(res.status).toBe(200);
  });

  it('11. PUT /api/polls/:id - Should return 404 for non-existent poll', async () => {
    const res = await request(app).put('/api/polls/fake-id-123').send({ title: "Nope" });
    expect(res.status).toBe(404);
  });

  it('12. DELETE /api/polls/:id - Should delete the poll', async () => {
    const res = await request(app).delete(`/api/polls/${createdPollId}`);
    expect(res.status).toBe(204); 
  });

  it('13. DELETE /api/polls/:id - Should return 404 for non-existent poll', async () => {
    const res = await request(app).delete('/api/polls/fake-id-123');
    expect(res.status).toBe(404);
  });

  describe('Poll API - Sabotage Tests (500 Errors)', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
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
        options: [ { text: "A" }, { text: "B" } ]
      };

      const res = await request(app).post('/api/polls').send(perfectPayload);
      expect(res.status).toBe(500);
    });

    it('Should trigger a 500 error on POST vote', async () => {
      jest.spyOn(prisma.pollVote, 'findUnique').mockRejectedValue(new Error('Simulated Vote Crash'));
      const res = await request(app).post('/api/polls/vote').send({
        pollId: "123", optionId: "123", userId: "123"
      });
      expect(res.status).toBe(500);
    });

    it('POST /api/polls - Should return 400 Validation Error for bad data', async () => {
    const res = await request(app).post('/api/polls').send({ title: "No" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation Failed");
    });
    
  });
});