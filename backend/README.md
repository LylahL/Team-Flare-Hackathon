# Immigration Platform Backend

## Overview

This is the backend for the Immigration Platform application, providing API endpoints and services for managing immigration cases, user authentication, document management, and AI-powered immigration assistance.

## Features

- **User Authentication** - JWT-based authentication with role-based access control
- **USCIS Case Tracking** - Track and manage immigration cases
- **Document Management** - Store and organize immigration-related documents (AWS S3)
- **AI-Powered Immigration Assistant** - OpenAI-powered assistant for immigration queries
- **Payment Processing** - Subscription and one-time payment processing with Stripe
- **Notifications** - Real-time notifications using Socket.io
- **Multilingual Support** - API support for multiple languages

## Technology Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **OpenAI API** - AI assistant functionality
- **Stripe API** - Payment processing
- **AWS S3** - Document storage
- **Socket.io** - Real-time notifications

## Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- AWS Account (for S3)
- Stripe Account
- OpenAI API key

## Installation

1. Clone the repository
```bash
git clone git@github.com:Ryan-ai-champ/Team-Flare-Hackathon.git
cd Team-Flare-Hackathon/backend
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/immigration-platform

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# USCIS API
USCIS_API_KEY=your_uscis_api_key
USCIS_BASE_URL=https://api.uscis.gov/api/v1

# Email
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=your_email@gmail.com
```

4. Start the development server
```bash
npm run dev
```

## API Documentation

### Authentication Endpoints

- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Login and get authentication token
- **POST /api/auth/forgot-password** - Request password reset
- **POST /api/auth/reset-password** - Reset password with token
- **GET /api/auth/profile** - Get user profile
- **PUT /api/auth/profile** - Update user profile

### Immigration Case Endpoints

- **GET /api/cases** - Get all cases (with filtering)
- **POST /api/cases** - Create a new case
- **GET /api/cases/:id** - Get a specific case
- **PUT /api/cases/:id** - Update a specific case
- **DELETE /api/cases/:id** - Delete a specific case
- **GET /api/cases/:id/documents** - Get documents for a case
- **POST /api/cases/:id/documents** - Upload documents to a case

### AI Assistant Endpoints

- **POST /api/assistant/conversations** - Create a new conversation
- **GET /api/assistant/conversations** - Get all conversations
- **GET /api/assistant/conversations/:id** - Get a specific conversation
- **POST /api/assistant/conversations/:id/messages** - Send a message
- **GET /api/assistant/form-help/:formId** - Get help for a specific form
- **POST /api/assistant/eligibility** - Check eligibility for immigration benefits
- **POST /api/assistant/quick-answer** - Get a quick answer to an immigration question

### Payment Endpoints

- **POST /api/payment/create-checkout-session** - Create a Stripe checkout session
- **GET /api/payment/subscription** - Get current subscription
- **POST /api/payment/cancel-subscription** - Cancel subscription
- **POST /api/payment/reactivate-subscription** - Reactivate subscription
- **POST /api/payment/one-time** - Make a one-time payment
- **GET /api/payment/history** - Get payment history
- **POST /api/payment/webhook** - Stripe webhook endpoint

### Notification Endpoints

- **GET /api/notifications** - Get all notifications for a user
- **PUT /api/notifications/:id/read** - Mark a notification as read
- **DELETE /api/notifications/:id** - Delete a notification

## Database Schema

### User
- **_id** - ObjectId
- **email** - String (required, unique)
- **password** - String (required)
- **firstName** - String
- **lastName** - String
- **role** - String (admin, attorney, paralegal, client)
- **createdAt** - Date
- **updatedAt** - Date

### ImmigrationCase
- **_id** - ObjectId
- **caseNumber** - String (unique)
- **caseType** - String (green card, citizenship, visa)
- **status** - String (draft, submitted, in review, etc.)
- **priority** - String (low, medium, high)
- **dueDate** - Date
- **applicant** - ObjectId (ref: User)
- **assignedTo** - ObjectId (ref: User)
- **description** - String
- **notes** - String
- **createdAt** - Date
- **updatedAt** - Date

### Document
- **_id** - ObjectId
- **name** - String
- **description** - String
- **fileKey** - String (S3 key)
- **fileUrl** - String
- **fileType** - String
- **fileSize** - Number
- **case** - ObjectId (ref: ImmigrationCase)
- **uploadedBy** - ObjectId (ref: User)
- **createdAt** - Date
- **updatedAt** - Date

### Subscription
- **_id** - ObjectId
- **user** - ObjectId (ref: User)
- **stripeCustomerId** - String
- **stripeSubscriptionId** - String
- **plan** - String (basic, premium, enterprise)
- **status** - String (active, canceled, past_due)
- **currentPeriodStart** - Date
- **currentPeriodEnd** - Date
- **createdAt** - Date
- **updatedAt** - Date

### Payment
- **_id** - ObjectId
- **user** - ObjectId (ref: User)
- **stripePaymentId** - String
- **amount** - Number
- **currency** - String
- **status** - String (succeeded, failed, pending)
- **description** - String
- **createdAt** - Date

### Conversation
- **_id** - ObjectId
- **user** - ObjectId (ref: User)
- **title** - String
- **createdAt** - Date
- **updatedAt** - Date

### Message
- **_id** - ObjectId
- **conversation** - ObjectId (ref: Conversation)
- **role** - String (user, assistant)
- **content** - String
- **createdAt** - Date

## Error Handling

The API uses a consistent error handling approach with appropriate HTTP status codes:

- **400** - Bad Request (validation error)
- **401** - Unauthorized (authentication error)
- **403** - Forbidden (authorization error)
- **404** - Not Found
- **500** - Internal Server Error

## Testing

Run the automated tests with:

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:payment
npm run test:assistant
npm run test:socket
```

## Development

Start the development server with hot reloading:

```bash
npm run dev
```

## Production Deployment

Build and start the server in production mode:

```bash
npm run build
npm start
```

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add some amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

