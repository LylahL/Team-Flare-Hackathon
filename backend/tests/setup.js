const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dotenv = require('dotenv');

// Load environment variables from .env.test if it exists
dotenv.config({ path: '.env.test' });

// Setup global test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test-db';

// In-memory MongoDB instance
let mongoServer;

// Setup and teardown for MongoDB tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Set the MongoDB URI to the in-memory server
  process.env.MONGODB_URI = mongoUri;
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clean up after tests
afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Clear the database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Global mocks
jest.mock('../src/services/email.service', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
  sendVerificationEmail: jest.fn().mockResolvedValue({ success: true }),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true }),
  sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true }),
}));

// Stripe mock
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn().mockResolvedValue({ id: 'cus_mock123' }),
      retrieve: jest.fn().mockResolvedValue({ id: 'cus_mock123' }),
    },
    subscriptions: {
      create: jest.fn().mockResolvedValue({ id: 'sub_mock123', status: 'active' }),
      update: jest.fn().mockResolvedValue({ id: 'sub_mock123' }),
      cancel: jest.fn().mockResolvedValue({ id: 'sub_mock123', status: 'canceled' }),
    },
    paymentMethods: {
      attach: jest.fn().mockResolvedValue({ id: 'pm_mock123' }),
      detach: jest.fn().mockResolvedValue({ id: 'pm_mock123' }),
    },
    charges: {
      create: jest.fn().mockResolvedValue({ id: 'ch_mock123', status: 'succeeded' }),
    },
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ id: 'cs_mock123', url: 'https://checkout.stripe.com/mock' }),
      },
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({ type: 'payment_intent.succeeded', data: { object: {} } }),
    },
  }));
});

// AWS S3 mock
jest.mock('aws-sdk', () => {
  return {
    S3: jest.fn().mockImplementation(() => ({
      upload: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Location: 'https://s3.example.com/test-file.pdf' }),
      }),
      getObject: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({ Body: Buffer.from('test file content') }),
      }),
      deleteObject: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      }),
    })),
    config: {
      update: jest.fn(),
    },
  };
});

// OpenAI API mock
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'Mocked AI response' } }],
          }),
        },
      },
      embeddings: {
        create: jest.fn().mockResolvedValue({
          data: [{ embedding: [0.1, 0.2, 0.3] }],
        }),
      },
    })),
  };
});

// Express request and response mocks
global.mockRequest = () => {
  const req = {};
  req.body = {};
  req.params = {};
  req.query = {};
  req.cookies = {};
  req.headers = {};
  req.user = {
    id: 'user123',
    email: 'test@example.com',
    role: 'user',
  };
  return req;
};

global.mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

global.mockNext = jest.fn();

/**
 * Jest setup file for backend tests
 * This file runs before each test file
 */

// Import environment variables from .env.test if it exists
require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock logging for tests
jest.mock('../src/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
}));

// Setup global test database
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clean up database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Disconnect and stop MongoDB after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Global test helpers
global.createTestUser = async (userData = {}) => {
  const User = require('../src/models/user.model');
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123!',
    role: 'user',
    isVerified: true,
  };
  
  return await User.create({ ...defaultUser, ...userData });
};

// Global mocks for common functions
global.mockRequest = () => {
  const req = {};
  req.body = jest.fn().mockReturnValue(req);
  req.params = jest.fn().mockReturnValue(req);
  req.query = jest.fn().mockReturnValue(req);
  req.headers = jest.fn().mockReturnValue(req);
  req.user = jest.fn().mockReturnValue(req);
  return req;
};

global.mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

global.mockNext = jest.fn();

