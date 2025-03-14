const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Case = require('../src/models/case.model');
const Document = require('../src/models/document.model');
const { createTestUser, createTestCase } = require('./testUtils');

let adminToken, clientToken, attorneyToken;
let adminUser, clientUser, attorneyUser;
let testCase, testCaseId;

// Setup test database
beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/immigration-app-test';
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  // Clear test collections
  await User.deleteMany({});
  await Case.deleteMany({});
  await Document.deleteMany({});

  // Create test users with different roles
  adminUser = await createTestUser('admin@example.com', 'Admin123!', 'admin');
  clientUser = await createTestUser('client@example.com', 'Client123!', 'client');
  attorneyUser = await createTestUser('attorney@example.com', 'Attorney123!', 'attorney');
  
  // Get tokens for each user
  const adminResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'Admin123!' });
  adminToken = adminResponse.body.token;
  
  const clientResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'client@example.com', password: 'Client123!' });
  clientToken = clientResponse.body.token;
  
  const attorneyResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'attorney@example.com', password: 'Attorney123!' });
  attorneyToken = attorneyResponse.body.token;
  
  // Create a test case
  testCase = await createTestCase(clientUser._id, attorneyUser._id);
  testCaseId = testCase._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Case API Endpoints', () => {
  describe('GET /api/cases', () => {
    it('should retrieve all cases for admin users', async () => {
      const response = await request(app)
        .get('/api/cases')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data.cases)).toBe(true);
    });

    it('should not allow clients to access all cases', async () => {
      const response = await request(app)
        .get('/api/cases')
        .set('Authorization', `Bearer ${clientToken}`);
      
      expect(response.status).toBe(403);
    });

    it('should filter cases by status', async () => {
      const response = await request(app)
        .get('/api/cases?status=pending')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.cases)).toBe(true);
      
      // All cases should have status 'pending'
      response.body.data.cases.forEach(kase => {
        expect(kase.status).toBe('pending');
      });
    });
  });

  describe('GET /api/cases/:id', () => {
    it('should retrieve a specific case', async () => {
      const response = await request(app)
        .get(`/api/cases/${testCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.case._id.toString()).toBe(testCaseId.toString());
    });

    it('should allow clients to access their own cases', async () => {
      const response = await request(app)
        .get(`/api/cases/${testCaseId}`)
        .set('Authorization', `Bearer ${clientToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.case._id.toString()).toBe(testCaseId.toString());
    });

    it('should return 404 for non-existent case', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/cases/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/cases', () => {
    it('should create a new case', async () => {
      const newCase = {
        title: 'New Immigration Case',
        clientId: clientUser._id,
        caseType: 'Green Card',
        description: 'Application for permanent residency',
        priority: 'medium'
      };
      
      const response = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer ${attorneyToken}`)
        .send(newCase);
      
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.case.title).toBe(newCase.title);
    });

    it('should validate required fields', async () => {
      const invalidCase = {
        // Missing required fields
        clientId: clientUser._id
      };
      
      const response = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer ${attorneyToken}`)
        .send(invalidCase);
      
      expect(response.status).toBe(400);
    });

    it('should not allow clients to create cases', async () => {
      const newCase = {
        title: 'Unauthorized Case',
        clientId: clientUser._id,
        caseType: 'Visa',
        description: 'This should fail'
      };
      
      const response = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(newCase);
      
      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/cases/:id', () => {
    it('should update a case', async () => {
      const updatedData = {
        title: 'Updated Case Title',
        description: 'Updated case description'
      };
      
      const response = await request(app)
        .put(`/api/cases/${testCaseId}`)
        .set('Authorization', `Bearer ${attorneyToken}`)
        .send(updatedData);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.case.title).toBe(updatedData.title);
      expect(response.body.data.case.description).toBe(updatedData.description);
    });

    it('should prevent clients from updating cases', async () => {
      const updatedData = {
        title: 'Client Update Attempt'
      };
      
      const response = await request(app)
        .put(`/api/cases/${testCaseId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(updatedData);
      
      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/cases/:id/status', () => {
    it('should update case status', async () => {
      const statusUpdate = {
        status: 'in-progress',
        notes: 'Case is now being processed'
      };
      
      const response = await request(app)
        .patch(`/api/cases/${testCaseId}/status`)
        .set('Authorization', `Bearer ${attorneyToken}`)
        .send(statusUpdate);
      
      expect(response.status).toBe(200);
      expect(response.body.data.case.status).toBe(statusUpdate.status);
    });
  });

  describe('POST /api/cases/:id/notes', () => {
    it('should add a note to a case', async () => {
      const note = {
        content: 'Important note about this case',
        visibility: 'internal'
      };
      
      const response = await request(app)
        .post(`/api/cases/${testCaseId}/notes`)
        .set('Authorization', `Bearer ${attorneyToken}`)
        .send(note);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.note.content).toBe(note.content);
    });
  });

  describe('GET /api/cases/:id/timeline', () => {
    it('should retrieve the case timeline', async () => {
      const response = await request(app)
        .get(`/api/cases/${testCaseId}/timeline`)
        .set('Authorization', `Bearer ${attorneyToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data.timeline)).toBe(true);
    });
  });
});

describe('Document API Endpoints', () => {
  describe('POST /api/documents/upload', () => {
    it('should upload a document', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${clientToken}`)
        .attach('document', Buffer.from('test file content'), 'test-document.pdf')
        .field('caseId', testCaseId)
        .field('documentType', 'identification')
        .field('description', 'Test document upload');
      
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.document.originalName).toBe('test-document.pdf');
    });

    it('should validate document type', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${clientToken}`)
        .attach('document', Buffer.from('test file content'), 'test-document.pdf')
        .field('caseId', testCaseId)
        .field('documentType', 'invalid-type') // Invalid document type
        .field('description', 'Test document validation');
      
      expect(response.status).toBe(400);
    });

    it('should enforce file size limits', async () => {
      // Create a buffer larger than the file size limit (assuming 5MB limit)
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
      
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${clientToken}`)
        .attach('document', largeBuffer, 'large-document.pdf')
        .field('caseId', testCaseId)
        .field('documentType', 'identification')
        .field('description', 'Large document test');
      
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/documents/:id', () => {
    let documentId;
    
    beforeAll(async () => {
      // Create a document to delete
      const uploadResponse = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${clientToken}`)
        .attach('document', Buffer.from('deletable content'), 'deletable.pdf')
        .field('caseId', testCaseId)
        .field('documentType', 'identification')
        .field('description', 'Document to be deleted');
      
      documentId = uploadResponse.body.data.document._id;
    });
    
    it('should delete a document', async () => {
      const response = await request(app)
        .delete(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${clientToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should return 404 for non-existent document', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/documents/${fakeId}`)
        .set('Authorization', `Bearer ${clientToken}`);
      
      expect(response.status).toBe(404);
    });
  });
});

describe('AI Assistant API Endpoints', () => {
  describe('POST /api/assistant/query', () => {
    it('should handle assistant queries', async () => {
      const query = {
        text: 'What documents do I need for a green card application?',
        conversationId: 'new'
      };
      
      const response = await request(app)
        .post('/api/assistant/query')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(query);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.response).toBeDefined();
    });
  });

  describe('GET /api/assistant/conversations', () => {
    it('should retrieve user conversations', async () => {
      const response = await request(app)
        .get('/api/assistant/conversations')
        .set('Authorization', `Bearer ${clientToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data.conversations)).toBe(true);
    });
  });
});

describe('Response Format Tests', () => {
  it('should return consistent success response format', async () => {
    const response = await request(app)
      .get(`/api/cases/${testCaseId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('data');
  });

  it('should return consistent error response format', async () => {
    const fakeId = 'invalid-id';
    const response = await request(app)
      .get(`/api/cases/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('message');
  });
});

describe('Error Handling Tests', () => {
  it('should handle 404 routes properly', async () => {
    const response = await request(app)
      .get('/api/non-existent-route')
      .set('Authorization', `Bearer ${

