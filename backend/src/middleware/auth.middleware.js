const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Middleware to protect routes by verifying JWT token
 * @returns {Function} Express middleware
 */
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token from Authorization header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    // Alternative: check for token in cookies
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access.', 401)
    );
  }

  // 2) Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please log in again.', 401)
    );
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

/**
 * Middleware to restrict access based on user roles
 * @param  {...String} roles - Allowed roles
 * @returns {Function} Express middleware
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Access to req.user is granted by the protect middleware
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

/**
 * Middleware to check if user is authenticated but doesn't throw error if not
 * Useful for optional authentication
 * @returns {Function} Express middleware
 */
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies?.jwt) {
    try {
      // 1) Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // User is logged in
      req.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
});

/**
 * Middleware to refresh the JWT token
 * @returns {Function} Express middleware
 */
exports.refreshToken = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  req.user.password = undefined; // Remove password from output
  
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: req.user,
    },
  });
});

/**
 * Middleware to verify API key for external service integrations
 * @returns {Function} Express middleware
 */
exports.verifyApiKey = catchAsync(async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return next(new AppError('API key is required', 401));
  }
  
  // Validate API key - this could be against a database of valid keys
  if (apiKey !== process.env.API_KEY) {
    return next(new AppError('Invalid API key', 401));
  }
  
  next();
});

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * Middleware to protect routes by verifying JWT tokens
 * Extracts token from Authorization header and verifies its validity
 */
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token from request headers
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    // Also check for token in cookies for web clients
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access.', 401)
    );
  }

  // 2) Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please log in again.', 401)
    );
  }

  // Grant access to protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

/**
 * Middleware to restrict access to certain routes based on user roles
 * @param  {...String} roles - Array of roles that have permission
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array e.g. ['admin', 'attorney']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

/**
 * Middleware to refresh JWT token if it's about to expire
 * Extends user sessions for active users
 */
exports.refreshToken = catchAsync(async (req, res, next) => {
  if (req.user) {
    // Calculate token expiration (from the decoded iat and default expiry time)
    const tokenExp = req.user.iat + process.env.JWT_EXPIRES_IN * 60 * 60;
    const now = Math.floor(Date.now() / 1000);
    
    // If token is about to expire (less than 1 hour left), refresh it
    if (tokenExp - now < 3600) {
      const newToken = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN
        }
      );
      
      // Send the new token in response header
      res.set('Authorization', `Bearer ${newToken}`);
      
      // Also set as cookie if using cookies
      if (req.cookies && req.cookies.jwt) {
        res.cookie('jwt', newToken, {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
          ),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production'
        });
      }
    }
  }
  
  next();
});

/**
 * Optional middleware that checks for a token but doesn't require one
 * Used for routes that work for both authenticated and unauthenticated users
 */
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies && req.cookies.jwt) {
    try {
      // Verify the token
      const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

      // Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // There is a logged in user
      req.user = currentUser;
      res.locals.user = currentUser;
    } catch (err) {
      // If error, no user is logged in
    }
  }
  
  next();
});

