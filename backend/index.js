/**
 * Immigration Platform Backend
 * Entry point for the application
 */

const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: './.env' });

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Import the server
const app = require('./src/server');

// Database connection string with fallback to local database
const DB = process.env.DATABASE_URL || 'mongodb://localhost:27017/immigration-platform';

// Connect to MongoDB
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('🔌 Database connection successful!'))
  .catch((err) => console.error('❌ Database connection error:', err));

// Set port
const port = process.env.PORT || 5000;

// Start the server
const server = app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

// Initialize Socket.io (if it's being used)
const socketService = require('./src/services/socket.service');
socketService.initialize(server);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

