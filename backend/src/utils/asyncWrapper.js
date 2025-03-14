/**
 * @fileoverview Utility function to wrap async route handlers and controllers.
 * Eliminates the need for try-catch blocks in every controller method.
 * Automatically passes any errors to the Express error handler middleware.
 */

/**
 * Wraps an async function and handles promise rejections,
 * forwarding errors to Express error handler middleware.
 * 
 * @template P Parameters type
 * @template R Return type
 * @param {function(...P): Promise<R>} fn - The async function to wrap
 * @returns {function(...P): Promise<R>} A wrapped function that forwards errors to Express
 */
const asyncWrapper = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Wraps an async service function that doesn't use Express objects.
 * Throws errors for handling at a higher level.
 * 
 * @template P Parameters type
 * @template R Return type
 * @param {function(...P): Promise<R>} fn - The service function to wrap
 * @returns {function(...P): Promise<R>} A wrapped function that properly handles async errors
 */
const serviceWrapper = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      // For service functions, rethrow the error for handling at controller level
      throw error;
    }
  };
};

module.exports = {
  asyncWrapper,
  serviceWrapper
};

/* USAGE EXAMPLES:

// In a controller file:
const { asyncWrapper } = require('../utils/asyncWrapper');

// Example controller with asyncWrapper
exports.getUser = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  res.status(200).json({ success: true, data: user });
});

// In a service file:
const { serviceWrapper } = require('../utils/asyncWrapper');

// Example service with serviceWrapper
exports.findUserById = serviceWrapper(async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
});

*/

