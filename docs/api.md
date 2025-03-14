# Immigration Case Management System API Documentation

## Overview

This document provides detailed information about the Immigration Case Management System API endpoints, including authentication requirements, request formats, and response examples.

## Base URL

All API endpoints are relative to the base URL:

```
https://api.immigrationapp.com/v1
```

## Authentication

Most endpoints require authentication using JSON Web Tokens (JWT). Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

To obtain a token, use the authentication endpoints described below.

## Rate Limiting

API requests are subject to rate limiting:
- Authenticated users: 100 requests per minute
- Unauthenticated users: 20 requests per minute

When a rate limit is exceeded, the API will return a 429 Too Many Requests response.

---

## 1. Authentication Endpoints

### 1.1 Register a new user

**Endpoint:** `POST /auth/register`

**Authentication Required:** No

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@example.com",
  "password": "SecurePassword123!",
  "phone": "+14155552671",
  "role": "client"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "userId": "60a6c3bde6d8a20015b6edca",
    "email": "jane.doe@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "client",
    "createdAt": "2023-05-20T15:43:41.452Z"
  }
}
```

### 1.2 Login

**Endpoint:** `POST /auth/login`

**Authentication Required:** No

**Request Body:**
```json
{
  "email": "jane.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "60a6c3bde6d8a20015b6edca",
      "email": "jane.doe@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "client"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}
```

### 1.3 Refresh Token

**Endpoint:** `POST /auth/refresh-token`

**Authentication Required:** No

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

### 1.4 Logout

**Endpoint:** `POST /auth/logout`

**Authentication Required:** Yes

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 1.5 Request Password Reset

**Endpoint:** `POST /auth/forgot-password`

**Authentication Required:** No

**Request Body:**
```json
{
  "email": "jane.doe@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### 1.6 Reset Password

**Endpoint:** `POST /auth/reset-password`

**Authentication Required:** No

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "password": "NewSecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

### 1.7 Verify Email

**Endpoint:** `GET /auth/verify-email/:token`

**Authentication Required:** No

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## 2. Case Management Endpoints

### 2.1 Create New Case

**Endpoint:** `POST /cases`

**Authentication Required:** Yes

**Request Body:**
```json
{
  "clientId": "60a6c3bde6d8a20015b6edca",
  "caseType": "I-485",
  "title": "Adjustment of Status Application",
  "description": "Application for permanent residency based on marriage to US citizen",
  "priority": "high",
  "tags": ["family-based", "marriage"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "caseId": "60b7d9c1a5f98b001f95e2d3",
    "clientId": "60a6c3bde6d8a20015b6edca",
    "caseType": "I-485",
    "title": "Adjustment of Status Application",
    "description": "Application for permanent residency based on marriage to US citizen",
    "status": "open",
    "priority": "high",
    "tags": ["family-based", "marriage"],
    "createdAt": "2023-05-22T09:14:25.123Z",
    "updatedAt": "2023-05-22T09:14:25.123Z"
  }
}
```

### 2.2 Get All Cases

**Endpoint:** `GET /cases`

**Authentication Required:** Yes

**Query Parameters:**
- `page` (optional): page number for pagination
- `limit` (optional): number of cases per page
- `status` (optional): filter by case status
- `caseType` (optional): filter by case type
- `priority` (optional): filter by priority
- `search` (optional): search in title and description

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "caseId": "60b7d9c1a5f98b001f95e2d3",
        "clientId": "60a6c3bde6d8a20015b6edca",
        "caseType": "I-485",
        "title": "Adjustment of Status Application",
        "status": "open",
        "priority": "high",
        "createdAt": "2023-05-22T09:14:25.123Z",
        "updatedAt": "2023-05-22T09:14:25.123Z"
      },
      {
        "caseId": "60b7d9d1a5f98b001f95e2d4",
        "clientId": "60a6c3bde6d8a20015b6edca",
        "caseType": "I-130",
        "title": "Petition for Alien Relative",
        "status": "pending",
        "priority": "medium",
        "createdAt": "2023-05-21T14:22:33.456Z",
        "updatedAt": "2023-05-21T16:45:12.789Z"
      }
    ],
    "pagination": {
      "total": 12,
      "limit": 10,
      "page": 1,
      "pages": 2
    }
  }
}
```

### 2.3 Get Case Details

**Endpoint:** `GET /cases/:caseId`

**Authentication Required:** Yes

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "caseId": "60b7d9c1a5f98b001f95e2d3",
    "clientId": "60a6c3bde6d8a20015b6edca",
    "clientName": "Jane Doe",
    "caseType": "I-485",
    "title": "Adjustment of Status Application",
    "description": "Application for permanent residency based on marriage to US citizen",
    "status": "open",
    "priority": "high",
    "tags": ["family-based", "marriage"],
    "assignedTo": "60a6c3cde6d8a20015b6edcb",
    "assignedToName": "John Smith",
    "uscisReceiptNumber": "MSC2190123456",
    "timeline": [
      {
        "date": "2023-05-22T09:14:25.123Z",
        "action": "Case created",
        "userId": "60a6c3cde6d8a20015b6edcb",
        "userName": "John Smith"
      },
      {
        "date": "2023-05-23T11:30:15.789Z",
        "action": "Documents requested",
        "userId": "60a6c3cde6d8a20015b6edcb",
        "userName": "John Smith"
      }
    ],
    "createdAt": "2023-05-22T09:14:25.123Z",
    "updatedAt": "2023-05-23T11:30:15.789Z"
  }
}
```

### 2.4 Update Case

**Endpoint:** `PATCH /cases/:caseId`

**Authentication Required:** Yes

**Request Body:**
```json
{
  "status": "pending",
  "priority": "medium",
  "assignedTo": "60a6c3cde6d8a20015b6edcb",
  "uscisReceiptNumber": "MSC2190123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "caseId": "60b7d9c1a5f98b001f95e2d3",
    "status": "pending",
    "priority": "medium",
    "assignedTo": "60a6c3cde6d8a20015b6edcb",
    "uscisReceiptNumber": "MSC2190123456",
    "updatedAt": "2023-05-24T10:25:36.789Z"
  }
}
```

### 2.5 Delete Case

**Endpoint:** `DELETE /cases/:caseId`

**Authentication Required:** Yes

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Case deleted successfully"
}
```

### 2.6 Add Case Note

**Endpoint:** `POST /cases/:caseId/notes`

**Authentication Required:** Yes

**Request Body:**
```json
{
  "content": "Client submitted additional evidence for I-485",
  "visibility": "internal" // "internal" or "client-visible"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "noteId": "60c1f2a3b4d5e6f7g8h9i0j1",
    "caseId": "60b7d9c1a5f98b001f95e2d3",
    "content": "Client submitted additional evidence for I-485",
    "visibility": "internal",
    "createdBy": "60a6c3cde6d8a20015b6edcb",
    "createdByName": "John Smith",
    "createdAt": "2023-05-25T14:22:33.456Z"
  }
}
```

### 2.7 Get USCIS Case Status

**Endpoint:** `GET /cases/:caseId/uscis-status`

**Authentication Required:** Yes

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "caseId": "60b7d9c1a5f98b001f95e2d3",
    "uscisReceiptNumber": "MSC2190123456",
    "status": "Case Was Received",
    "statusDate": "2023-05-15T00:00:00.000Z",
    "estimatedProcessingTime": "10.5 to 13.5 months",
    "lastChecked": "2023-05-25T15:30:45.789Z",
    "history": [
      {
        "status": "Case Was Received",
        "date": "2023-05-15T00:00:00.000Z",
        "description": "On May 15, 2023, we received your Form I-485, Application to Register Permanent Residence or Adjust Status, and mailed you a receipt notice."
      }
    ]
  }
}
```

---

## 3. Document Handling Endpoints

### 3.1 Upload Document

**Endpoint:** `POST /documents`

**Authentication Required:** Yes

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file`: The document file (PDF, JPEG, PNG)
- `caseId`: Associated case ID
- `documentType`: Type of document (e.g., "passport", "birthCertificate")
- `description`: Description of the document
- `isConfidential`: Whether the document is confidential (true/false)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "documentId": "60d1e2f3a4b5c6d7e8f9a0b1",
    "fileName": "passport_jane_doe.pdf",
    "fileSize": 1245678,
    "fileType": "application/pdf",
    "documentType": "passport",
    "description": "Client passport, expires 2028",
    "caseId": "60b7d9c1a5f98b001f95e2d3",
    "isConfidential": false,
    "uploadedBy": "60a6c3cde6d8a20015b6edcb",
    "uploadedByName": "John Smith",
    "downloadUrl": "https://api.immigrationapp.com/v1/documents/60d1e2f3a4b5c6d7e8f9a0b1/download",
    "uploadedAt": "2023-05-26T09:10:11.123Z"
  }
}
```

### 3.2 Get Document Metadata

**Endpoint:** `GET /documents/:documentId`

**Authentication Required:** Yes

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "documentId": "60d1e2f3a4b5c6d7e8f

# API Documentation

## Overview

This document provides detailed information about the RESTful API endpoints available in the Immigration Case Management System. The API follows RESTful principles and uses JSON for request and response payloads.

## Base URL

```
Development: http://localhost:5000/api
Staging: https://staging-api.immigrationapp.com/api
Production: https://api.immigrationapp.com/api
```

## Authentication

Most API endpoints require authentication using JWT (JSON Web Tokens). Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Authentication Endpoints

#### Register a new user

```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "client" // Optional, defaults to "client"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "client",
    "isEmailVerified": false,
    "createdAt": "2023-06-21T10:30:00Z"
  }
}
```

#### Login

```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "client"
  }
}
```

#### Refresh Token

```
POST /auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout

```
POST /auth/logout
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Reset Password - Request

```
POST /auth/request-password-reset
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If your email exists in our system, you will receive a password reset link"
}
```

#### Reset Password - Confirm

```
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

## Case Management Endpoints

### Cases

#### Get All Cases

```
GET /cases
```

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of results per page (default: 10)
- `sortBy` (optional): Field to sort by (default: createdAt)
- `sortOrder` (optional): Sort order (asc/desc, default: desc)
- `status` (optional): Filter by case status

**Response:**
```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "id": "60d21b4667d0d8992e610c85",
        "title": "I-485 Application",
        "caseNumber": "CASE-12345",
        "client": {
          "id": "60d21b4667d0d8992e610c85",
          "name": "John Doe"
        },
        "status": "in-progress",
        "createdAt": "2023-06-21T10:30:00Z",
        "updatedAt": "2023-06-21T10:30:00Z",
        "description": "Adjustment of Status application"
      }
    ],
    "totalCount": 45,
    "totalPages": 5,
    "currentPage": 1
  }
}
```

#### Get Case by ID

```
GET /cases/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "60d21b4667d0d8992e610c85",
    "title": "I-485 Application",
    "caseNumber": "CASE-12345",
    "client": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-123-4567"
    },
    "assignedTo": {
      "id": "60d21b4667d0d8992e610c86",
      "name": "Jane Smith"
    },
    "status": "in-progress",
    "createdAt": "2023-06-21T10:30:00Z",
    "updatedAt": "2023-06-21T10:30:00Z",
    "description": "Adjustment of Status application",
    "notes": [
      {
        "id": "60d21b4667d0d8992e610c87",
        "content": "Initial consultation completed",
        "createdBy": "60d21b4667d0d8992e610c86",
        "createdAt": "2023-06-21T10:30:00Z"
      }
    ],
    "documents": [
      {
        "id": "60d21b4667d0d8992e610c88",
        "name": "Passport.pdf",
        "type": "identification",
        "size": 1204567,
        "uploadedBy": "60d21b4667d0d8992e610c85",
        "uploadedAt": "2023-06-21T10:30:00Z",
        "url": "https://storage.immigrationapp.com/documents/passport-12345.pdf"
      }
    ],
    "timeline": [
      {
        "date": "2023-06-21T10:30:00Z",
        "action": "Case created",
        "performedBy": "System"
      },
      {
        "date": "2023-06-22T14:45:00Z",
        "action": "Document uploaded: Passport.pdf",
        "performedBy": "John Doe"
      }
    ]
  }
}
```

#### Create a New Case

```
POST /cases
```

**Request Body:**
```json
{
  "title": "I-485 Application",
  "clientId": "60d21b4667d0d8992e610c85",
  "assignedToId": "60d21b4667d0d8992e610c86",
  "description": "Adjustment of Status application",
  "status": "new",
  "caseType": "adjustment-of-status"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "60d21b4667d0d8992e610c89",
    "title": "I-485 Application",
    "caseNumber": "CASE-12346",
    "client": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "John Doe"
    },
    "assignedTo": {
      "id": "60d21b4667d0d8992e610c86",
      "name": "Jane Smith"
    },
    "status": "new",
    "createdAt": "2023-06-23T15:45:00Z",
    "updatedAt": "2023-06-23T15:45:00Z",
    "description": "Adjustment of Status application"
  }
}
```

#### Update a Case

```
PUT /cases/:id
```

**Request Body:**
```json
{
  "title": "I-485 Application - Updated",
  "assignedToId": "60d21b4667d0d8992e610c86",
  "description": "Adjustment of Status application with additional benefits",
  "status": "in-progress"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "60d21b4667d0d8992e610c89",
    "title": "I-485 Application - Updated",
    "caseNumber": "CASE-12346",
    "client": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "John Doe"
    },
    "assignedTo": {
      "id": "60d21b4667d0d8992e610c86",
      "name": "Jane Smith"
    },
    "status": "in-progress",
    "createdAt": "2023-06-23T15:45:00Z",
    "updatedAt": "2023-06-23T16:00:00Z",
    "description": "Adjustment of Status application with additional benefits"
  }
}
```

#### Delete a Case

```
DELETE /cases/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Case deleted successfully"
}
```

### Case Documents

#### Upload a Document

```
POST /cases/:caseId/documents
```

**Form Data:**
- `file`: The document file (multipart/form-data)
- `type`: Document type (e.g., identification, evidence, application)
- `description`: Optional description

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "60d21b4667d0d8992e610c90",
    "name": "Birth-Certificate.pdf",
    "type": "identification",
    "size": 1204567,
    "uploadedBy": "60d21b4667d0d8992e610c85",
    "uploadedAt": "2023-06-23T16:30:00Z",
    "url": "https://storage.immigrationapp.com/documents/birth-certificate-12345.pdf",
    "description": "Client's birth certificate"
  }
}
```

#### Get All Documents for a Case

```
GET /cases/:caseId/documents
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "60d21b4667d0d8992e610c88",
        "name": "Passport.pdf",
        "type": "identification",
        "size": 1204567,
        "uploadedBy": "60d21b4667d0d8992e610c85",
        "uploadedAt": "2023-06-21T10:30:00Z",
        "url": "https://storage.immigrationapp.com/documents/passport-12345.pdf"
      },
      {
        "id": "60d21b4667d0d8992e610c90",
        "name": "Birth-Certificate.pdf",
        "type": "identification",
        "size": 1204567,
        "uploadedBy": "60d21b4667d0d8992e610c85",
        "uploadedAt": "2023-06-23T16:30:00Z",
        "url": "https://storage.immigrationapp.com/documents/birth-certificate-12345.pdf",
        "description": "Client's birth certificate"
      }
    ]
  }
}
```

#### Delete a Document

```
DELETE /cases/:caseId/documents/:documentId
```

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

## USCIS Integration Endpoints

#### Check Case Status

```
GET /uscis/cases/:receiptNumber
```

**Response:**
```json
{
  "success": true,
  "data": {
    "receiptNumber": "MSC2190123456",
    "status": "Case Was Received",
    "formType": "I-485",
    "lastUpdated": "2023-06-15T00:00:00Z",
    "description": "On June 15, 2023, we received your Form I-485, Application to Register Permanent Residence or Adjust Status, Receipt Number MSC2190123456, and sent you a receipt notice. We mailed the notice to the address you provided."
  }
}
```

#### Submit Form

```
POST /uscis/forms/:formType
```

**Request Body:**
```json
{
  "caseId": "60d21b4667d0d8992e610c89",
  "formData": {
    "applicantName": "John Doe",
    "dateOfBirth": "1980-01-01",
    "alienNumber": "A123456789",
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zip": "90210"
    },
    "questions": [
      {
        "id": "q1",
        "question": "Have you ever been arrested?",
        "answer": "No"
      }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submissionId": "60d21b4667d0d8992e610c91",
    "formType": "I-485",
    "status": "pending",
    "submittedAt": "2023-06-23T17:00:00Z",
    "estimatedProcessingTime": "8-14 months"
  }
}
```

## Payment Processing Endpoints

#### Get Subscription Plans

```
GET /payments/plans
```

**Response:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "plan_basic",
        "name": "Basic",
        "description": "For individual clients with simple cases",
        "price": 9.99,
        "currency": "USD",
        "interval": "month",
        "features": [
          "Up to 2 active cases",
          "Document storage (100MB)",
          "Email support"
        ]
      

