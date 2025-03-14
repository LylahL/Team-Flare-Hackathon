const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const Assistant = require('../models/assistant.model');
const { User } = require('../models/user.model');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('AI Assistant Routes', () => {
  let token;

  beforeAll(async () => {
    // Create a test user and generate a token
    const user = new User({
      email: 'testuser@example.com',
      password: 'testpassword',
    });
    await user.save();
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'testpassword',
      });
    token = res.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Assistant.deleteMany({});
  });

  test('POST /api/assistant/query - should handle an AI query', async () => {
    const res = await request(app)
      .post('/api/assistant/query')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: 'How can I apply for a visa?',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('response');
  });

  test('GET /api/assistant/conversations - should fetch conversation history', async () => {
    await Assistant.create({
      query: 'How can I apply for a visa?',
      response: 'You can apply for a visa by...',
      user: mongoose.Types.ObjectId(),
    });

    const res = await request(app)
      .get('/api/assistant/conversations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('conversations');
  });
});

