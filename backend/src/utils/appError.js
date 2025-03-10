/**
 * Custom Error class for application errors
 * Extends the built-in Error class with additional properties
 */
class AppError extends Error {
  /**
   * Create a new AppError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error class for validation errors
 */
class ValidationError extends AppError {
  /**
   * Create a new ValidationError
   * @param {string} message - Error message
   * @param {object} errors - Validation errors object
   */
  constructor(message, errors = {}) {
    super(message, 400);
    this.errors = errors;
    this.name = 'ValidationError';
  }
}

/**
 * Error class for authentication errors
 */
class AuthenticationError extends AppError {
  /**
   * Create a new AuthenticationError
   * @param {string} message - Error message
   */
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Error class for authorization errors
 */
class AuthorizationError extends AppError {
  /**
   * Create a new AuthorizationError
   * @param {string} message - Error message
   */
  constructor(message = 'Not authorized to access this resource') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Error class for not found errors
 */
class NotFoundError extends AppError {
  /**
   * Create a new NotFoundError
   * @param {string} message - Error message
   */
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Error class for duplicate resource errors
 */
class DuplicateError extends AppError {
  /**
   * Create a new DuplicateError
   * @param {string} message - Error message
   */
  constructor(message = 'Duplicate resource') {
    super(message, 409);
    this.name = 'DuplicateError';
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DuplicateError
};

