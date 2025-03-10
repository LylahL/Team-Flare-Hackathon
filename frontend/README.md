# Immigration Platform - Lawfully

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Overview

Lawfully is a comprehensive immigration platform designed to assist immigrants and their attorneys through the complex U.S. immigration process. The platform provides case tracking, document management, AI-powered assistance, and community support to make immigration processes more accessible and manageable.

## Features

- **User Authentication**: Secure login and registration with JWT authentication
- **USCIS Case Tracking**: Real-time updates and notifications on case status
- **Document Management**: Secure storage and organization of immigration documents using AWS S3
- **AI-Powered Immigration Assistant**: Get answers to immigration questions using OpenAI integration
- **Community Forum**: Connect with others going through similar immigration processes
- **Progress Tracker**: Visual representation of where you are in your immigration journey
- **Multilingual Support**: Access the platform in multiple languages
- **Freemium Model**: Basic features are free with premium features available via subscription (Stripe integration)
- **Live Notifications**: Real-time updates using Socket.io

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose ODM)
- JSON Web Tokens (JWT) for authentication
- AWS S3 for document storage
- OpenAI API for AI assistant
- Socket.io for real-time notifications
- Stripe for payment processing

### Frontend
- React.js
- Redux for state management
- Material-UI for responsive design
- Axios for API requests
- React Router for navigation
- Formik & Yup for form validation

## Project Structure

```
immigration-platform/
├── backend/                # Node.js Express API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── .env.example        # Example environment variables
│   ├── index.js            # Entry point
│   └── package.json        # Dependencies
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service calls
│   │   ├── store/          # Redux store
│   │   ├── utils/          # Utility functions
│   │   ├── App.js          # Main component
│   │   └── index.js        # Entry point
│   ├── public/             # Static files
│   └── package.json        # Dependencies
├── deploy.sh               # Deployment script
└── README.md               # Project documentation
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB instance
- AWS account with S3 access
- OpenAI API key
- Stripe account for payments

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your credentials:
   ```
   # Server configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB connection
   MONGODB_URI=mongodb://localhost:27017/immigration-platform

   # JWT configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=90d

   # AWS S3 configuration
   AWS_ACCESS_KEY=your_aws_access_key
   AWS_SECRET_KEY=your_aws_secret_key
   AWS_BUCKET_NAME=your_bucket_name
   AWS_REGION=us-east-1

   # OpenAI configuration
   OPENAI_API_KEY=your_openai_api_key

   # Stripe configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   # USCIS API configuration
   USCIS_API_KEY=your_uscis_api_key
   ```

5. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```
   npm start
   ```

## Deployment Process

### Manual Deployment
1. Build the frontend:
   ```
   cd frontend
   npm run build
   ```

2. Start the production server:
   ```
   cd backend
   npm start
   ```

### Using the Deployment Script
1. Make the script executable:
   ```
   chmod +x deploy.sh
   ```

2. Run the deployment script:
   ```
   ./deploy.sh
   ```

### Docker Deployment
1. Build the Docker images:
   ```
   docker-compose build
   ```

2. Start the containers:
   ```
   docker-compose up -d
   ```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Case Endpoints
- `GET /api/cases` - Get all cases for the authenticated user
- `POST /api/cases` - Create a new case
- `GET /api/cases/:id` - Get case details
- `PUT /api/cases/:id` - Update case details
- `DELETE /api/cases/:id` - Delete a case
- `GET /api/cases/:id/status` - Get case status from USCIS

### Document Endpoints
- `GET /api/documents` - Get all documents
- `POST /api/documents` - Upload a new document
- `GET /api/documents/:id` - Download a document
- `DELETE /api/documents/:id` - Delete a document

### AI Assistant Endpoints
- `POST /api/assistant/message` - Send a message to the AI assistant
- `GET /api/assistant/conversations` - Get all conversations
- `GET /api/assistant/conversations/:id` - Get a specific conversation

### Payment Endpoints
- `POST /api/payments/create-checkout-session` - Create a Stripe checkout session
- `GET /api/payments/subscriptions` - Get user's subscription status
- `POST /api/payments/cancel-subscription` - Cancel subscription
- `POST /api/payments/webhook` - Stripe webhook endpoint

## Testing

### Backend Tests
```
cd backend
npm test
```

### Frontend Tests
```
cd frontend
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project Team - Team Flare - [your-email@example.com](mailto:your-email@example.com)

## Acknowledgements
- [OpenAI](https://openai.com/)
- [USCIS](https://www.uscis.gov/)
- [Stripe](https://stripe.com/)
- [AWS](https://aws.amazon.com/)

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
