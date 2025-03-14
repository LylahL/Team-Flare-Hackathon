const { expect } = require('chai');
const sinon = require('sinon');
const winston = require('winston');
const logger = require('../src/utils/logger');
const fs = require('fs');
const path = require('path');

describe('Logger Module', () => {
  let originalConsoleLog;
  let consoleLogStub;
  let winstonAddStub;

  beforeEach(() => {
    // Store original console.log
    originalConsoleLog = console.log;
    // Stub console.log to prevent noise during tests
    consoleLogStub = sinon.stub(console, 'log');
    // Stub winston.createLogger().add to prevent actual logging
    winstonAddStub = sinon.stub(winston.createLogger().constructor.prototype, 'add');
  });

  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog;
    // Restore winston add method
    if (winstonAddStub && winstonAddStub.restore) {
      winstonAddStub.restore();
    }
    // Clean up any stubs
    sinon.restore();
  });

  it('should export a logger object with expected methods', () => {
    expect(logger).to.be.an('object');
    expect(logger.error).to.be.a('function');
    expect(logger.warn).to.be.a('function');
    expect(logger.info).to.be.a('function');
    expect(logger.debug).to.be.a('function');
  });

  it('should have a request logger middleware', () => {
    expect(logger.requestLogger).to.be.a('function');
    expect(logger.request

