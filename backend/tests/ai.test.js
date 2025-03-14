const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user.model');
const aiService = require('../src/services/ai.service');

// Mock the AI service
jest.mock('../src/services/ai.service');

let authToken;
let testUser;

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.MONGO_URI_TEST);
  
  // Create a test user
  testUser = await User.create({
    email: 'aitest@example.com',
    password: 'Password123!',
    firstName: 'AI',
    lastName: 'Test',
    role: 'attorney'
  });

  // Get authentication token
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'aitest@example.com',
      password: 'Password123!'
    });
  
  authToken = loginResponse.body.token;
});

afterAll(async () => {
  // Clean up test data
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Document Analysis API', () => {
  beforeEach(() => {
    // Reset mock implementation before each test
    jest.clearAllMocks();
  });

  test('should analyze a document and extract information', async () => {
    // Mock implementation for document analysis
    aiService.analyzeDocument.mockResolvedValue({
      clientName: 'John Doe',
      caseType: 'I-485',
      keyDates: {
        submissionDate: '2023-05-15',
        approvalDate: null,
        priorityDate: '2022-11-10'
      },
      extractedInfo: {
        alienNumber: 'A123456789',
        countryOfBirth: 'Mexico',
        dateOfBirth: '1985-03-21'
      }
    });

    const response = await request(app)
      .post('/api/ai/analyze-document')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('document', Buffer.from('mock document content'), 'test-document.pdf')
      .field('documentType', 'i485')
      .field('extractionPreferences', JSON.stringify({ includePersonalInfo: true }));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('clientName', 'John Doe');
    expect(response.body).toHaveProperty('caseType', 'I-485');
    expect(response.body.keyDates).toHaveProperty('submissionDate', '2023-05-15');
    expect(response.body.extractedInfo).toHaveProperty('alienNumber', 'A123456789');
    expect(aiService.analyzeDocument).toHaveBeenCalledTimes(1);
  });

  test('should return 400 when document is missing', async () => {
    const response = await request(app)
      .post('/api/ai/analyze-document')
      .set('Authorization', `Bearer ${authToken}`)
      .field('documentType', 'i485');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(aiService.analyzeDocument).not.toHaveBeenCalled();
  });

  test('should return 400 when document type is invalid', async () => {
    const response = await request(app)
      .post('/api/ai/analyze-document')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('document', Buffer.from('mock document content'), 'test-document.pdf')
      .field('documentType', 'invalid-type');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(aiService.analyzeDocument).not.toHaveBeenCalled();
  });

  test('should handle AI service errors gracefully', async () => {
    aiService.analyzeDocument.mockRejectedValue(new Error('AI processing failed'));

    const response = await request(app)
      .post('/api/ai/analyze-document')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('document', Buffer.from('mock document content'), 'test-document.pdf')
      .field('documentType', 'i485');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message');
    expect(aiService.analyzeDocument).toHaveBeenCalledTimes(1);
  });
});

describe('Case Recommendation API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should generate case recommendations based on client information', async () => {
    // Mock implementation for case recommendations
    aiService.generateCaseRecommendations.mockResolvedValue({
      eligibleVisaTypes: ['H-1B', 'L-1', 'O-1'],
      recommendedPath: 'H-1B to Green Card',
      timeline: {
        estimatedProcessingTime: '8-12 months',
        keyMilestones: [
          { step: 'Labor Certification', timeframe: '2-3 months' },
          { step: 'I-140 Petition', timeframe: '4-6 months' },
          { step: 'I-485 Adjustment of Status', timeframe: '6-12 months' }
        ]
      },
      riskFactors: ['employment history gaps', 'prior visa violations'],
      confidenceScore: 0.85
    });

    const clientInfo = {
      nationality: 'India',
      education: 'Master\'s in Computer Science',
      workExperience: '7 years as Software Engineer',
      immigrationHistory: 'F-1 student visa, OPT',
      familyStatus: 'Married, spouse is US citizen'
    };

    const response = await request(app)
      .post('/api/ai/case-recommendations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ clientInfo });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('eligibleVisaTypes');
    expect(response.body).toHaveProperty('recommendedPath', 'H-1B to Green Card');
    expect(response.body).toHaveProperty('timeline');
    expect(response.body).toHaveProperty('confidenceScore', 0.85);
    expect(aiService.generateCaseRecommendations).toHaveBeenCalledTimes(1);
    expect(aiService.generateCaseRecommendations).toHaveBeenCalledWith(clientInfo);
  });

  test('should return 400 when client information is incomplete', async () => {
    const response = await request(app)
      .post('/api/ai/case-recommendations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ clientInfo: { nationality: 'India' } });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(aiService.generateCaseRecommendations).not.toHaveBeenCalled();
  });

  test('should handle AI service errors gracefully', async () => {
    aiService.generateCaseRecommendations.mockRejectedValue(new Error('AI processing failed'));

    const clientInfo = {
      nationality: 'India',
      education: 'Master\'s in Computer Science',
      workExperience: '7 years as Software Engineer',
      immigrationHistory: 'F-1 student visa, OPT',
      familyStatus: 'Married, spouse is US citizen'
    };

    const response = await request(app)
      .post('/api/ai/case-recommendations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ clientInfo });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message');
    expect(aiService.generateCaseRecommendations).toHaveBeenCalledTimes(1);
  });
});

describe('Automated Response Generation API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should generate automated responses to client inquiries', async () => {
    // Mock implementation for response generation
    aiService.generateResponse.mockResolvedValue({
      response: 'Based on your case status, your I-485 application is currently in processing. The normal processing time for this type of application is 8-14 months. There are no additional documents needed at this time. We will notify you once USCIS takes further action on your case.',
      suggestedActions: ['Schedule follow-up call in 30 days', 'Confirm current address on file'],
      relevantCaseLaw: ['Matter of Smith v. DHS, 2020'],
      confidenceScore: 0.92
    });

    const inquiry = {
      clientId: testUser._id.toString(),
      caseType: 'I-485',
      question: 'What is the status of my application and do I need to provide any additional documents?',
      caseHistory: {
        filingDate: '2023-01-15',
        lastUpdateDate: '2023-06-20',
        currentStatus: 'Case is being actively reviewed'
      }
    };

    const response = await request(app)
      .post('/api/ai/generate-response')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ inquiry });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('response');
    expect(response.body).toHaveProperty('suggestedActions');
    expect(response.body).toHaveProperty('confidenceScore');
    expect(aiService.generateResponse).toHaveBeenCalledTimes(1);
    expect(aiService.generateResponse).toHaveBeenCalledWith(inquiry);
  });

  test('should return 400 when inquiry details are missing', async () => {
    const response = await request(app)
      .post('/api/ai/generate-response')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ inquiry: { clientId: testUser._id.toString() } });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(aiService.generateResponse).not.toHaveBeenCalled();
  });

  test('should handle AI service errors gracefully', async () => {
    aiService.generateResponse.mockRejectedValue(new Error('AI processing failed'));

    const inquiry = {
      clientId: testUser._id.toString(),
      caseType: 'I-485',
      question: 'What is the status of my application?',
      caseHistory: {
        filingDate: '2023-01-15',
        currentStatus: 'Case is being actively reviewed'
      }
    };

    const response = await request(app)
      .post('/api/ai/generate-response')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ inquiry });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message');
    expect(aiService.generateResponse).toHaveBeenCalledTimes(1);
  });
});

describe('Legal Research Assistance API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should provide legal research assistance based on query', async () => {
    // Mock implementation for legal research
    aiService.performLegalResearch.mockResolvedValue({
      relevantStatutes: [
        { code: '8 U.S.C. § 1255', description: 'Adjustment of status of nonimmigrant to that of person admitted for permanent residence' }
      ],
      caseLaw: [
        { case: 'Matter of Vazquez, 25 I&N Dec. 817 (BIA 2012)', summary: 'Case regarding adjustment of status eligibility for TPS holders' },
        { case: 'INS v. Cardoza-Fonseca, 480 U.S. 421 (1987)', summary: 'Supreme Court case on asylum standard of proof' }
      ],
      uscisPolicy: [
        { document: 'USCIS Policy Manual, Volume 7, Part B', description: 'Guidance on 245(i) eligibility requirements' }
      ],
      analysisAndRecommendations: 'Based on the current interpretation of 8 U.S.C. § 1255 and the precedent established in Matter of Vazquez, your client may be eligible for adjustment of status under section 245(i) if they can demonstrate...',
      references: [
        'https://www.uscis.gov/policy-manual/volume-7-part-b',
        'https://www.justice.gov/eoir/precedent-decisions-volume-25'
      ]
    });

    const researchQuery = {
      caseType: 'Adjustment of Status',
      legalQuestion: 'Is my client eligible for adjustment of status under 245(i) if they entered without inspection but have an approved I-130 petition filed before April 30, 2001?',
      clientDetails: {
        entryStatus: 'EWI',
        petitionFilingDate: '2000-12-15',
        currentStatus: 'Present without authorization'
      },
      jurisdictionInfo: 'Ninth Circuit'
    };

    const response = await request(app)
      .post('/api/ai/legal-research')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ researchQuery });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('relevantStatutes');
    expect(response.body).toHaveProperty('caseLaw');
    expect(response.body).toHaveProperty('uscisPolicy');
    expect(response.body).toHaveProperty('analysisAndRecommendations');
    expect(aiService.performLegalResearch).toHaveBeenCalledTimes(1);
    expect(aiService.performLegalResearch).toHaveBeenCalledWith(researchQuery);
  });

  test('should return 400 when research query is incomplete', async () => {
    const response = await request(app)
      .post('/api/ai/legal-research')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ researchQuery: { caseType: 'Adjustment of Status' } });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(aiService.performLegalResearch).not.toHaveBeenCalled();
  });

  test('should handle AI service errors gracefully', async () => {
    aiService.performLegalResearch.mockRejectedValue(new Error('AI processing failed'));

    const researchQuery = {
      caseType: 'Adjustment of Status',
      legalQuestion: 'Is my client eligible for adjustment of status under 245(i)?',
      clientDetails: {
        entryStatus: 'EWI',
        petitionFilingDate: '2000-12-15'
      },
      jurisdictionInfo: 'Ninth Circuit'
    };

    const response = await request(app)
      .post('/api/ai/legal-research')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ researchQuery });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message');
    expect(aiService.performLegalResearch).toHaveBeenCalledTimes(1);

