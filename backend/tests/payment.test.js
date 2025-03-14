const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Payment = require('../src/models/payment.model');
const Subscription = require('../src/models/subscription.model');
const stripe = require('stripe');

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      customers: {
        create: jest.fn().mockResolvedValue({ id: 'cus_mock12345' }),
        retrieve: jest.fn().mockResolvedValue({ id: 'cus_mock12345', name: 'Test User' }),
        update: jest.fn().mockResolvedValue({ id: 'cus_mock12345' }),
      },
      subscriptions: {
        create: jest.fn().mockResolvedValue({ 
          id: 'sub_mock12345', 
          status: 'active',
          current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          items: { data: [{ price: { product: 'prod_mock' } }] }
        }),
        update: jest.fn().mockResolvedValue({ id: 'sub_mock12345', status: 'active' }),
        del: jest.fn().mockResolvedValue({ id: 'sub_mock12345', status: 'canceled' }),
        list: jest.fn().mockResolvedValue({ 
          data: [{ 
            id: 'sub_mock12345', 
            status: 'active',
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
          }] 
        }),
      },
      paymentMethods: {
        attach: jest.fn().mockResolvedValue({ id: 'pm_mock12345' }),
        detach: jest.fn().mockResolvedValue({ id: 'pm_mock12345' }),
        list: jest.fn().mockResolvedValue({ data: [{ id: 'pm_mock12345', card: { last4: '4242' } }] }),
      },
      invoices: {
        create: jest.fn().mockResolvedValue({ id: 'in_mock12345', status: 'paid' }),
        list: jest.fn().mockResolvedValue({ data: [{ id: 'in_mock12345', status: 'paid', amount_paid: 1999 }] }),
        retrieve: jest.fn().mockResolvedValue({ id: 'in_mock12345', status: 'paid', amount_paid: 1999 }),
        sendInvoice: jest.fn().mockResolvedValue({ id: 'in_mock12345', status: 'paid' }),
      },
      setupIntents: {
        create: jest.fn().mockResolvedValue({ client_secret: 'seti_mock_secret_12345' }),
      },
      webhooks: {
        constructEvent: jest.fn().mockReturnValue({
          type: 'invoice.payment_succeeded',
          data: { object: { id: 'in_mock12345', subscription: 'sub_mock12345', customer: 'cus_mock12345' } }
        }),
      },
      prices: {
        list: jest.fn().mockResolvedValue({ 
          data: [
            { id: 'price_mock_monthly', product: 'prod_mock', unit_amount: 1999, recurring: { interval: 'month' } },
            { id: 'price_mock_yearly', product: 'prod_mock', unit_amount: 19990, recurring: { interval: 'year' } }
          ] 
        }),
      },
      products: {
        list: jest.fn().mockResolvedValue({ 
          data: [{ id: 'prod_mock', name: 'Premium Plan', metadata: { features: 'All features' } }]
        }),
      }
    };
  });
});

describe('Payment Module', () => {
  let testUser;
  let authToken;
  let stripeInstance;

  // Setup before tests
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST);
    
    // Create test user
    testUser = await User.create({
      email: 'payment-test@example.com',
      password: 'Password123!',
      firstName: 'Payment',
      lastName: 'Tester',
      role: 'user'
    });

    // Get auth token for test user
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'payment-test@example.com', password: 'Password123!' });
    
    authToken = loginResponse.body.token;
    
    // Initialize mocked Stripe instance
    stripeInstance = stripe();
  });

  // Clean up after tests
  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Payment.deleteMany({});
    await Subscription.deleteMany({});
    
    // Disconnect from test database
    await mongoose.connection.close();
  });

  // Subscription tests
  describe('Subscription Management', () => {
    test('Should get available subscription plans', async () => {
      const response = await request(app)
        .get('/api/payments/plans')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.plans).toBeDefined();
      expect(response.body.plans.length).toBeGreaterThan(0);
      expect(response.body.plans[0]).toHaveProperty('id');
      expect(response.body.plans[0]).toHaveProperty('name');
      expect(response.body.plans[0]).toHaveProperty('price');
    });

    test('Should create a new subscription', async () => {
      const response = await request(app)
        .post('/api/payments/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          priceId: 'price_mock_monthly',
          paymentMethodId: 'pm_mock12345'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.subscription).toBeDefined();
      expect(response.body.subscription.id).toBe('sub_mock12345');
      expect(response.body.subscription.status).toBe('active');
      
      // Verify Stripe was called
      expect(stripeInstance.subscriptions.create).toHaveBeenCalled();
    });

    test('Should get user subscription details', async () => {
      const response = await request(app)
        .get('/api/payments/subscriptions')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.subscription).toBeDefined();
      expect(response.body.subscription.id).toBe('sub_mock12345');
      expect(response.body.subscription.status).toBe('active');
      expect(response.body.subscription.currentPeriodEnd).toBeDefined();
    });

    test('Should update subscription plan', async () => {
      const response = await request(app)
        .put('/api/payments/subscriptions/sub_mock12345')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          priceId: 'price_mock_yearly'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.subscription).toBeDefined();
      expect(response.body.subscription.id).toBe('sub_mock12345');
      
      // Verify Stripe was called
      expect(stripeInstance.subscriptions.update).toHaveBeenCalled();
    });

    test('Should cancel subscription', async () => {
      const response = await request(app)
        .delete('/api/payments/subscriptions/sub_mock12345')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
      expect(response.body.message).toContain('canceled');
      
      // Verify Stripe was called
      expect(stripeInstance.subscriptions.del).toHaveBeenCalled();
    });
  });

  // Payment processing tests
  describe('Payment Processing', () => {
    test('Should create a setup intent for adding payment method', async () => {
      const response = await request(app)
        .post('/api/payments/setup-intent')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.clientSecret).toBeDefined();
      expect(response.body.clientSecret).toBe('seti_mock_secret_12345');
      
      // Verify Stripe was called
      expect(stripeInstance.setupIntents.create).toHaveBeenCalled();
    });

    test('Should add a payment method to user', async () => {
      const response = await request(app)
        .post('/api/payments/payment-methods')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentMethodId: 'pm_mock12345'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.paymentMethod).toBeDefined();
      expect(response.body.paymentMethod.id).toBe('pm_mock12345');
      
      // Verify Stripe was called
      expect(stripeInstance.paymentMethods.attach).toHaveBeenCalled();
    });

    test('Should get user payment methods', async () => {
      const response = await request(app)
        .get('/api/payments/payment-methods')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.paymentMethods).toBeDefined();
      expect(response.body.paymentMethods.length).toBeGreaterThan(0);
      expect(response.body.paymentMethods[0]).toHaveProperty('id');
      expect(response.body.paymentMethods[0]).toHaveProperty('card');
    });

    test('Should delete a payment method', async () => {
      const response = await request(app)
        .delete('/api/payments/payment-methods/pm_mock12345')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted');
      
      // Verify Stripe was called
      expect(stripeInstance.paymentMethods.detach).toHaveBeenCalled();
    });
  });

  // Invoice tests
  describe('Invoice Management', () => {
    test('Should get user invoices', async () => {
      const response = await request(app)
        .get('/api/payments/invoices')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.invoices).toBeDefined();
      expect(response.body.invoices.length).toBeGreaterThan(0);
      expect(response.body.invoices[0]).toHaveProperty('id');
      expect(response.body.invoices[0]).toHaveProperty('status');
      expect(response.body.invoices[0]).toHaveProperty('amount');
    });

    test('Should get a specific invoice', async () => {
      const response = await request(app)
        .get('/api/payments/invoices/in_mock12345')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.invoice).toBeDefined();
      expect(response.body.invoice.id).toBe('in_mock12345');
      expect(response.body.invoice.status).toBe('paid');
      
      // Verify Stripe was called
      expect(stripeInstance.invoices.retrieve).toHaveBeenCalled();
    });

    test('Should generate a new invoice for extra services', async () => {
      const response = await request(app)
        .post('/api/payments/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 4999,
          description: 'Document review services',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      
      expect(response.status).toBe(201);
      expect(response.body.invoice).toBeDefined();
      expect(response.body.invoice.id).toBe('in_mock12345');
      expect(response.body.invoice.status).toBe('paid');
      
      // Verify Stripe was called
      expect(stripeInstance.invoices.create).toHaveBeenCalled();
    });

    test('Should manually send an invoice', async () => {
      const response = await request(app)
        .post('/api/payments/invoices/in_mock12345/send')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('sent');
      
      // Verify Stripe was called
      expect(stripeInstance.invoices.sendInvoice).toHaveBeenCalled();
    });
  });

  // Webhook tests
  describe('Webhook Processing', () => {
    test('Should process a webhook event successfully', async () => {
      const mockWebhookPayload = JSON.stringify({
        id: 'evt_mock12345',
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_mock12345',
            subscription: 'sub_mock12345',
            customer: 'cus_mock12345'
          }
        }
      });

      const response = await request(app)
        .post('/api/payments/webhook')
        .set('Content-Type', 'application/json')
        .set('Stripe-Signature', 'mock_signature')
        .send(mockWebhookPayload);
      
      expect(response.status).toBe(200);
      expect(response.body.received).toBe(true);
      
      // Verify Stripe webhook verification was called
      expect(stripeInstance.webhooks.constructEvent).toHaveBeenCalled();
    });

    test('Should handle invalid webhook signature', async () => {
      // Mock webhook validation to throw an error
      stripeInstance.webhooks.constructEvent.mockImplementationOnce(() => {
        throw new Error('Invalid signature');
      });

      const mockWebhookPayload = JSON.stringify({
        id: 'evt_mock12345',
        type: 'invoice.payment_succeeded'
      });

      const response = await request(app)
        .post('/api/payments/webhook')
        .set('Content-Type', 'application/json')
        .set('Stripe-Signature', 'invalid_signature')
        .send(mockWebhookPayload);
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('signature');
    });
  });
});

