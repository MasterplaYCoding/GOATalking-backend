import express from 'express';
import request from 'supertest';
import { createUser, getUsers, getUserById, deleteUser, getUserStats, loginUser, getObservationList } from '../src/controllers/userController';
import { prisma } from '../src/db';
import { usersTable } from '../src/models/db'; // Adjust path if needed!

const app = express();
app.use(express.json());
app.post('/api/users/login', loginUser);
app.get('/api/users/observations', getObservationList);
app.get('/api/users/stats', getUserStats);
app.post('/api/users', createUser);
app.get('/api/users', getUsers);
app.get('/api/users/:id', getUserById);
app.delete('/api/users/:id', deleteUser);

describe('User API Operations', () => {
  let createdUserId: string;

  beforeAll(async () => {
    // Clear the in-memory array for a clean test
    usersTable.length = 0; 
    
    // Ensure our Prisma demo user exists for login tests
    await prisma.user.upsert({
      where: { email: "test-login@system.local" },
      update: { passwordHash: "secret" },
      create: {
        id: "test-login-user",
        email: "test-login@system.local",
        username: "Login Tester",
        passwordHash: "secret",
        avatarUrl: "/logo.png"
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. POST /api/users - Should create an in-memory user', async () => {
    const res = await request(app).post('/api/users').send({
      username: "JestUser", email: "jest@test.com", passwordHash: "pass"
    });
    expect(res.status).toBe(201);
    expect(res.body.username).toBe("JestUser");
    createdUserId = res.body.id;
  });

  it('2. GET /api/users - Should fetch paginated users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('3. GET /api/users/:id - Should fetch a specific user', async () => {
    const res = await request(app).get(`/api/users/${createdUserId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdUserId);
  });

  it('4. GET /api/users/stats - Should fetch user stats', async () => {
    const res = await request(app).get('/api/users/stats');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalUsers');
  });

  it('5. POST /api/users/login - Should login real Prisma user', async () => {
    const res = await request(app).post('/api/users/login').send({ email: "test-login@system.local", password: "secret" });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("test-login@system.local");
  });

  it('6. GET /api/users/observations - Should fetch observation list', async () => {
    const res = await request(app).get('/api/users/observations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('7. DELETE /api/users/:id - Should delete the in-memory user', async () => {
    const res = await request(app).delete(`/api/users/${createdUserId}`);
    expect(res.status).toBe(204);
  });

  it('8. GET /api/users/:id - Should return 404 for non-existent user', async () => {
    const res = await request(app).get('/api/users/fake-user-id-123');
    expect(res.status).toBe(404);
  });

  it('9. DELETE /api/users/:id - Should return 404 for non-existent user', async () => {
    const res = await request(app).delete('/api/users/fake-user-id-123');
    expect(res.status).toBe(404);
  });

  it('POST /api/users/login - Should return 401 for wrong password', async () => {
    const res = await request(app).post('/api/users/login').send({ email: "test-login@system.local", password: "wrong!" });
    expect(res.status).toBe(401);
  });

  it('POST /api/users/login - Should return 401 for non-existent user', async () => {
    const res = await request(app).post('/api/users/login').send({ email: "ghost@system.local", password: "secret" });
    expect(res.status).toBe(401);
  });
});