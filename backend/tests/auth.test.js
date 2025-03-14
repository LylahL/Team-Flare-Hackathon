const request = require('supertest');
const mongoose = require('mongoose');
const { hashSync } = require('bcryptjs');
const app = require('../src/app');
const User = require('../src/models/user.model');
const { generateToken } = require('../src/utils/token.utils');

describe('Authentication API', () => {
  beforeEach(async () => {
    // Create a test user
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashSync('Password123!', 10),
      role: 'user',
      isVerified: true
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('email', 'newuser@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should not register a user with existing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate User',
          email: 'test@example.com', // Existing email
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should validate password requirements', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Weak Password User',
          email: 'weakpass@example.com',
          password: 'weak', // Too weak
          confirmPassword: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('user');
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should generate new tokens with valid refresh token', async () => {
      // First login to get refresh token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      const refreshToken = loginResponse.body.data.refreshToken;

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should not refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/auth/verify-email/:token', () => {
    it('should verify email with valid token', async () => {
      // Create an unverified user
      const unverifiedUser = await User.create({
        name: 'Unverified User',
        email: 'unverified@example.com',
        password: hashSync('Password123!', 10),
        role: 'user',
        isVerified: false
      });

      // Generate verification token
      const token = generateToken(
        { id: unverifiedUser._id },
        process.env.JWT_SECRET,
        '1h'
      );

      const response = await request(app)
        .get(`/api/auth/verify-email/${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);

      // Check user is now verified
      const updatedUser = await User.findById(unverifiedUser._id);
      expect(updatedUser.isVerified).toBe(true);
    });

    it('should reject invalid verification tokens', async () => {
      const response = await request(app)
        .get('/api/auth/verify-email/invalid-token');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should still return success for non-existent email (security)', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/auth/reset-password/:token', () => {
    it('should reset password with valid token', async () => {
      const user = await User.findOne({ email: 'test@example.com' });
      
      // Generate reset token
      const token = generateToken(
        { id: user._id },
        process.env.JWT_SECRET,
        '1h'
      );

      const response = await request(app)
        .post(`/api/auth/reset-password/${token}`)
        .send({
          password: 'NewPassword123!',
          confirmPassword: 'NewPassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);

      // Try logging in with new password

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/user.model');
const { hashPassword } = require('../src/utils/password');
const config = require('../src/config/config');
const emailService = require('../src/services/email.service');

// Mock email service
jest.mock('../src/services/email.service');

let mongoServer;

beforeAll(async () => {
  // Setup in-memory MongoDB for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear the database before each test
  await User.deleteMany({});
  
  // Reset all mocks
  jest.clearAllMocks();
});

describe('Authentication API', () => {
  // Test data
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'Password123!',
    role: 'user'
  };
  
  const adminUser = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'AdminPass123!',
    role: 'admin'
  };

  describe('User Registration', () => {
    test('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body).toHaveProperty('token');
      
      // Verify email was sent
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        testUser.email,
        'Welcome to Immigration Portal',
        expect.any(String),
        expect.any(String)
      );
    });

    test('should not register a user with an email that already exists', async () => {
      // Create the user first
      await User.create({
        ...testUser,
        password: await hashPassword(testUser.password),
        isEmailVerified: false
      });

      // Try to register again with the same email
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Email already in use');
    });

    test('should not register a user with invalid data', async () => {
      const invalidUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'invalid-email', // Invalid email
        password: '123', // Too short password
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('errors');
      expect(Array.isArray(res.body.errors)).toBe(true);
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await User.create({
        ...testUser,
        password: await hashPassword(testUser.password),
        isEmailVerified: true
      });
    });

    test('should login a user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body).toHaveProperty('token');
    });

    test('should not login a user with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    test('should not login a non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password
        })
        .expect(401);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    test('should not login an unverified user', async () => {
      // Create an unverified user
      await User.create({
        firstName: 'Unverified',
        lastName: 'User',
        email: 'unverified@example.com',
        password: await hashPassword('Password123!'),
        isEmailVerified: false
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unverified@example.com',
          password: 'Password123!'
        })
        .expect(403);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Email not verified');
    });
  });

  describe('Password Reset', () => {
    beforeEach(async () => {
      // Create a test user for password reset tests
      await User.create({
        ...testUser,
        password: await hashPassword(testUser.password),
        isEmailVerified: true
      });
    });

    test('should send a password reset email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testUser.email
        })
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Password reset email sent');
      
      // Verify email was sent
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        testUser.email,
        'Reset Your Password',
        expect.any(String),
        expect.any(String)
      );
    });

    test('should not send a password reset email to a non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        })
        .expect(404);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'User not found');
    });

    test('should reset password with valid token', async () => {
      // Create a valid reset token
      const user = await User.findOne({ email: testUser.email });
      const resetToken = jwt.sign(
        { id: user._id },
        config.jwt.resetSecret,
        { expiresIn: '15m' }
      );
      
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 900000; // 15 minutes
      await user.save();

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'NewPassword123!'
        })
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Password has been reset');

      // Check if password was actually changed
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.resetPasswordToken).toBeUndefined();
      expect(updatedUser.resetPasswordExpires).toBeUndefined();
      
      // Should be able to login with new password
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'NewPassword123!'
        })
        .expect(200);

      expect(loginRes.body).toHaveProperty('success', true);
    });

    test('should not reset password with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalidtoken',
          password: 'NewPassword123!'
        })
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Invalid or expired token');
    });

    test('should not reset password with expired token', async () => {
      // Create an expired reset token
      const user = await User.findOne({ email: testUser.email });
      const resetToken = jwt.sign(
        { id: user._id },
        config.jwt.resetSecret,
        { expiresIn: '15m' }
      );
      
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() - 1; // Already expired
      await user.save();

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'NewPassword123!'
        })
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Invalid or expired token');
    });
  });

  describe('Email Verification', () => {
    let verificationToken;
    let userId;

    beforeEach(async () => {
      // Create an unverified user
      const user = await User.create({
        ...testUser,
        password: await hashPassword(testUser.password),
        isEmailVerified: false
      });
      
      userId = user._id;
      
      // Generate verification token
      verificationToken = jwt.sign(
        { id: userId },
        config.jwt.emailSecret,
        { expiresIn: '1d' }
      );
      
      user.emailVerificationToken = verificationToken;
      await user.save();
    });

    test('should verify email with valid token', async () => {
      const res = await request(app)
        .get(`/api/auth/verify-email?token=${verificationToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Email verified successfully');

      // Check if user is now verified
      const updatedUser = await User.findById(userId);
      expect(updatedUser.isEmailVerified).toBe(true);
      expect(updatedUser.emailVerificationToken).toBeUndefined();
    });

    test('should not verify email with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/verify-email?token=invalidtoken')
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Invalid or expired token');

      // Check if user is still unverified
      const updatedUser = await User.findById(userId);
      expect(updatedUser.isEmailVerified).toBe(false);
    });

    test('should send a new verification email', async () => {
      const res = await request(app)
        .post('/api/auth/resend-verification')
        .send({
          email: testUser.email
        })
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Verification email sent');
      
      // Verify email was sent
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        testUser.email,
        'Verify Your Email',
        expect.any(String),
        expect.any(String)
      );
    });

    test('should not send verification email to already verified user', async () => {
      // Verify the user first
      const user = await User.findById(userId);
      user.isEmailVerified = true;
      await user.save();

      const res = await request(app)
        .post('/api/auth/resend-verification')
        .send({
          email: testUser.email
        })
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Email already verified');
    });
  });

  describe('Token Refresh', () => {
    let refreshToken;
    
    beforeEach(async () => {
      // Create a verified user
      const user = await User.create({
        ...testUser,
        password: await hashPassword(testUser.password),
        isEmailVerified: true
      });
      
      // Generate refresh token
      refreshToken = jwt.sign(
        { id: user._id },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiration }
      );
      
      user.refreshToken = refreshToken;
      await user.save();
    });

    test('should refresh access token with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('accessToken');
      expect(typeof res.body.accessToken).toBe('string');
    });

    test('should not refresh token with invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalidtoken' })
        .expect(401);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Invalid refresh token');
    });

    test('should not refresh token if user no longer exists', async () => {
      // Delete the user
      await User.deleteMany({});
      
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect(401);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Invalid refresh token');
    });
  });

  describe('Session Management', () => {
    let accessToken;
    let userId;

    beforeEach(async () => {
      // Create a verified user
      const user = await User.create({
        ...testUser,
        password: await hashPassword(testUser.password),
        isEmailVerified: true
      });
      
      userId = user._id;
      
      // Generate access token
      

