const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const Document = require('../models/document.model');
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

describe('Document Routes', () => {
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
    await Document.deleteMany({});
  });

  test('POST /api/documents/upload - should upload a document', async () => {
    const res = await request(app)
      .post('/api/documents/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', 'test-file.txt');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('document');
  });

  test('DELETE /api/documents/:id - should delete a document', async () => {
    const document = new Document({
      user: mongoose.Types.ObjectId(),
      filename: 'test-file.txt',
    });
    await document.save();

    const res = await request(app)
      .delete(`/api/documents/${document._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });
});

