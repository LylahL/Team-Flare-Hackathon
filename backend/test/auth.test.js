describe('Auth Routes', () => {
  let request;
  let app;
  let User;

  beforeAll(() => {
    request = require('supertest');
    app = require('../app');
    User = require('../models/User');
  });

  describe('POST /auth/login', () => {
    it('should return 200 on successful login', async () => {
      const res = await request(app).post('/auth/login').send({ email: 'test@example.com', password: 'password123' });
      expect(res.statusCode).toBe(200);
    });

    it('should return 400 on invalid login', async () => {
      const res = await request(app).post('/auth/login').send({ email: 'invalid@example.com', password: 'invalid' });
      expect(res.statusCode).toBe(400);
    });
  });


describe('POST /auth/register', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should return 400 if passwords do not match', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Passwords do not match');
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await User.create({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should return 401 with invalid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toEqual('Invalid credentials');
  });
});

describe('GET /auth/profile', () => {
  let token;

  beforeEach(async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123'
    });
    token = user.generateAuthToken();
  });

  it('should return user profile with valid token', async () => {
    const res = await request(app)
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.email).toEqual('test@example.com');
  });

  it('should return 401 without valid token', async () => {
    const res = await request(app)
      .get('/auth/profile');

    expect(res.statusCode).toEqual(401);
  });
});

