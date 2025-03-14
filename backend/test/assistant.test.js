
const mongoose = require('mongoose');
const { app } = require('../app');
const request = require('supertest');
const Assistant = require('../models/Assistant');

describe('Assistant Routes', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/assistant', () => {
    it('should handle assistant queries', async () => {
      const res = await request(app).post('/api/assistant').send({ query: 'How to apply?' });
      expect(res.statusCode).toEqual(200);
    });

    it('should return 400 on empty request', async () => {
      const res = await request(app).post('/api/assistant').send({});
      expect(res.statusCode).toEqual(400);
    });
  });
});

