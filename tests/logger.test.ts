import express from 'express';
import request from 'supertest';
import { actionLoggerAndDetector } from '../src/middlewares/loggerMiddleware';
import { prisma } from '../src/db';

const app = express();
app.use(express.json());
// Mount the middleware globally
app.use(actionLoggerAndDetector);
// Mount a dummy route to trigger the middleware
app.get('/api/dummy', (req, res) => res.status(200).json({ success: true }));

describe('Logger Middleware & Detector', () => {
  const dummyUserId = "logger-test-user";

  beforeAll(async () => {
    await prisma.logEntry.deleteMany();
    await prisma.observationList.deleteMany();
    await prisma.user.upsert({
      where: { id: dummyUserId },
      update: {},
      create: {
        id: dummyUserId,
        email: "logger@test.local",
        username: "Logger Test",
        passwordHash: "hash",
        avatarUrl: "/logo.png"
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. Should ignore requests without an x-user-id header', async () => {
    const res = await request(app).get('/api/dummy');
    expect(res.status).toBe(200);
    // Should not create a log entry if no user ID
    const count = await prisma.logEntry.count({ where: { userId: dummyUserId } });
    expect(count).toBe(0);
  });

  it('2. Should log a valid request and eventually flag spam', async () => {
    // Fire 11 rapid requests to trigger the 10-request spam detector limit
    for (let i = 0; i < 11; i++) {
      await request(app).get('/api/dummy').set('x-user-id', dummyUserId);
    }

    // Verify logs were created
    const logCount = await prisma.logEntry.count({ where: { userId: dummyUserId } });
    expect(logCount).toBe(11);

    // Verify the user was added to the Observation List
    const observation = await prisma.observationList.findUnique({ where: { userId: dummyUserId } });
    expect(observation).not.toBeNull();
    expect(observation?.reason).toContain("API Spamming");
  });

  it('3. Should catch and log errors silently without breaking the request', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Force Prisma to crash when the middleware tries to find the user
    jest.spyOn(prisma.user, 'findUnique').mockRejectedValue(new Error('Middleware DB Crash'));
    
    const res = await request(app).get('/api/dummy').set('x-user-id', dummyUserId);
    
    // The middleware should catch the error, log it, and call next(), allowing the route to succeed
    expect(res.status).toBe(200);
    jest.restoreAllMocks();
  });
});