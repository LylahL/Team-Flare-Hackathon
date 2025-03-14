# Case Management System API Documentation

## Overview
This document provides detailed information about the Case Management System API endpoints, authentication, and data structures.

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.casemanagement.com/api
```

## Authentication
The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Login
```
POST /auth/login
```
Request Body:
```json
{
  "email": "string",
  "password": "string"
}
```
Response:
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string"
  }
}
```

### Cases

#### Get All Cases
```
GET /cases
```
Query Parameters:
- `type` (optional): Filter by case type
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority
- `search` (optional): Search in case number or applicant name
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

Response:
```json
{
  "items": [
    {
      "id": "string",
      "caseNumber": "string",
      "caseType": "string",
      "applicant": "string",
      "status": "string",
      "priority": "string",
      "submissionDate": "string",
      "dueDate": "string"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

#### Get Case by ID
```
GET /cases/:id
```
Response:
```json
{
  "id": "string",
  "caseNumber": "string",
  "caseType": "string",
  "applicant": "string",
  "status": "string",
  "priority": "string",
  "submissionDate": "string",
  "dueDate": "string",
  "documents": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "uploadedAt": "string",
      "url": "string"
    }
  ]
}
```

#### Create New Case
```
POST /cases
```
Request Body:
```json
{
  "caseType": "string",
  "applicant": "string",
  "priority": "string",
  "dueDate": "string"
}
```
Response: Returns the created case object

#### Update Case
```
PUT /cases/:id
```
Request Body:
```json
{
  "caseType": "string",
  "applicant": "string",
  "status": "string",
  "priority": "string",
  "dueDate": "string"
}
```
Response: Returns the updated case object

#### Delete Case
```
DELETE /cases/:id
```
Response:
```json
{
  "message": "Case deleted successfully"
}
```

## Error Handling
The API uses standard HTTP status codes and returns error messages in the following format:
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)"
  }
}
```

Common Error Codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Data Types

### Case Types
- Green Card
- Work Visa
- Family Petition
- Citizenship
- Asylum

### Status Types
- Pending
- In Review
- Approved
- Rejected
- On Hold

### Priority Levels
- High
- Medium
- Low

## Rate Limiting
The API implements rate limiting to ensure fair usage:
- 100 requests per minute per API key
- 1000 requests per hour per API key

## Versioning
The API version is included in the URL path:
```
/api/v1/cases
```

## Best Practices
1. Always include error handling in your applications
2. Use appropriate HTTP methods for operations
3. Implement proper token refresh mechanisms
4. Cache responses when appropriate
5. Use compression for large payloads

## Support
For API support, contact:
- Email: api-support@casemanagement.com
- Documentation: https://docs.casemanagement.com
- Status Page: https://status.casemanagement.com

