
const mongoose = require('mongoose');
const { app } = require('../app');
const request = require('supertest');
const Document = require('../models/Document');

describe('Document Routes', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/documents', () => {
    it('should fetch documents', async () => {
      const res = await request(app).get('/api/documents');
      expect(res.statusCode).toEqual(200);
    });

    it('should return 404 on invalid document id', async () => {
      const res = await request(app).get('/documents/invalid-id');
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('POST /documents/upload', () => {
    it('should return 200 on successful document upload', async () => {
      const res = await request(app).post('/documents/upload').send({ name: 'test.pdf', data: 'base64encodeddata' });
      expect(res.statusCode).toEqual(200);
    });
  });
});

