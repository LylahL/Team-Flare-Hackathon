const mongoose = require('mongoose');
const { expect } = require('chai');
const sinon = require('sinon');
const { MongoMemoryServer } = require('mongodb-memory-server');
const database = require('../src/config/database');

describe('Database Module', () => {
  let mongoServer;
  let consoleLogStub;
  let consoleErrorStub;

  before(async () => {
    // Create a MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGO_URI = mongoUri;

    // Stub console methods to prevent logging during tests
    consoleLogStub = sinon.stub(console, 'log');
    consoleErrorStub = sinon.stub(console, 'error');
  });

  after(async () => {
    // Close the connection and stop MongoDB Memory Server
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }

    // Restore console methods
    consoleLogStub.restore();
    consoleErrorStub.restore();
  });

  it('should connect to the database successfully', async () => {
    await database.connect();
    expect(mongoose.connection.readyState).to.equal(1); // Connected
  });

  it('should handle connection errors gracefully', async () => {
    // Force a connection error
    const originalUri = process.env.MONGO_URI;
    process.env.MONGO_URI = 'mongodb://non-existent-host:27017/test';

    try {
      // This should fail but not throw (handled internally)
      await database.connect();
    } catch (err) {
      // If it reaches here, error wasn't handled properly
      expect.fail('Connection error was not handled gracefully');
    }

    // Restore the original URI
    process.env.MONGO_URI = originalUri;
  });

  it('should disconnect from the database successfully', async () => {
    // Ensure we're connected first
    if (mongoose.connection.readyState !== 1) {
      await database.connect();
    }
    
    await database.disconnect();
    expect(mongoose.connection.readyState).to.equal(0); // Disconnected
  });

  it('should handle reconnection attempts', async () => {
    // Create a spy on mongoose.connect
    const connectSpy = sinon.spy(mongoose, 'connect');
    
    // Connect to the database
    await database.connect();
    
    // Trigger a disconnect event
    mongoose.connection.emit('disconnected');
    
    // Wait a bit for reconnection attempt
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if connect was called again
    expect(connectSpy.calledTwice).to.be.true;
    
    // Clean up
    connectSpy.restore();
  });

  it('should have the proper mongoose options', async () => {
    // Reset connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Spy on mongoose.connect to capture options
    const connectSpy = sinon.spy(mongoose, 'connect');
    
    await database.connect();
    
    // Check if options include expected settings
    const options = connectSpy.firstCall.args[1];
    expect(options).to.have.property('useNewUrlParser', true);
    expect(options).to.have.property('useUnifiedTopology', true);
    
    // Clean up
    connectSpy.restore();
  });
});

