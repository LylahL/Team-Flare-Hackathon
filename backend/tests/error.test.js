const { expect } = require('chai');
const httpStatus = require('http-status');
const { ApiError } = require('../src/utils/ApiError');
const errorHandler = require('../src/middleware/errorHandler');
const sinon = require('sinon');

describe('Error Handling', () => {
  describe('ApiError', () => {
    it('should create an error with the correct properties', () => {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = 'Bad Request';
      const isOperational = true;
      const stack = 'Error stack';
      
      const error = new ApiError(statusCode, message, isOperational, stack);
      
      expect(error).to.be.instanceOf(Error);
      expect(error.statusCode).to.equal(statusCode);
      expect(error.message).to.equal(message);
      expect(error.isOperational).to.equal(isOperational);
      expect(error.stack).to.equal(stack);
    });

    it('should create an operational error by default', () => {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = 'Bad Request';
      
      const error = new ApiError(statusCode, message);
      
      expect(error.isOperational).to.be.true;
    });

    it('should capture stack trace if stack is not provided', () => {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = 'Bad Request';
      
      const error = new ApiError(statusCode, message);
      
      expect(error.stack).to.not.be.undefined;
      expect(error.stack).to.include('ApiError');
    });
  });

  describe('Error Middleware', () => {
    let req, res, next;
    
    beforeEach(() => {
      req = {};
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub().returnsThis(),
        locals: {}
      };
      next = sinon.stub();
    });

    it('should convert non-ApiError to ApiError and handle it', () => {
      const error = new Error('Some error');
      
      errorHandler(error, req, res, next);
      
      expect(res.status.calledOnce).to.be.true;
      expect(res.status.firstCall.args[0]).to.equal(httpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.include({
        code: httpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error'
      });
    });

    it('should handle ApiError correctly', () => {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = 'Bad Request Error';
      const error = new ApiError(statusCode, message);
      
      errorHandler(error, req, res, next);
      
      expect(res.status.calledOnce).to.be.true;
      expect(res.status.firstCall.args[0]).to.equal(statusCode);
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.include({
        code: statusCode,
        message: message
      });
    });

    it('should include stack trace in development mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const error = new Error('Development Error');
      
      errorHandler(error, req, res, next);
      
      expect(res.json.firstCall.args[0]).to.have.property('stack');
      
      // Restore environment
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should exclude stack trace in production mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = new Error('Production Error');
      
      errorHandler(error, req, res, next);
      
      expect(res.json.firstCall.args[0]).to.not.have.property('stack');
      
      // Restore environment
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should handle validation errors correctly', () => {
      const validationError = {
        name: 'ValidationError',
        errors: {
          name: {
            message: 'Name is required'
          },
          email: {
            message: 'Email is invalid'
          }
        }
      };
      
      errorHandler(validationError, req, res, next);
      
      expect(res.status.calledOnce).to.be.true;
      expect(res.status.firstCall.args[0]).to.equal(httpStatus.BAD_REQUEST);
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.have.property('message');
      expect(res.json.firstCall.args[0].message).to.include('Name is required');
      expect(res.json.firstCall.args[0].message).to.include('Email is invalid');
    });
  });
});

