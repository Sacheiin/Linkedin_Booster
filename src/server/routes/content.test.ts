import request from 'supertest';
import { app } from '../index';
import { connectDB, disconnectDB } from '../models/mongo.test';

describe('Content API Endpoints', () => {
  beforeAll(async () => await connectDB());
  afterAll(async () => await disconnectDB());

  test('POST /generate-ideas returns 3 ideas', async () => {
    const response = await request(app)
      .post('/api/content/generate-ideas')
      .send({
        userProfile: {
          industry: 'Technology',
          role: 'Software Developer',
          interests: ['AI', 'Web Development']
        },
        preferences: { contentTone: 'professional' }
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.ideas.length).toBe(3);
    expect(response.body.ideas[0]).toMatch(/AI|Web Development/i);
  });

  test('POST /schedule stores post in DB', async () => {
    const testContent = 'Test scheduled post';
    const response = await request(app)
      .post('/api/content/schedule')
      .send({
        userId: 'test-user',
        content: testContent,
        scheduledTime: new Date(Date.now() + 3600000)
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.postId).toBeDefined();
    expect(response.body.message).toContain('scheduled');
  });
});