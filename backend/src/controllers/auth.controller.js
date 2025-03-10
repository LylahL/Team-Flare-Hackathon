const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendEmail } = require('../utils/email');

// Helper function to create and send JWT token
const createSendToken = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check if email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('Email already registered', 400));
  }

  // Create user with restricted role assignment (clients only for public registration)
  const user = await User.create({
    name,
    email,
    password,
    role: role === 'client' ? 'client' : 'client', // Force client role for security
  });

  createSendToken(user, 201, res);
});

/**
 * @desc    Register an admin, attorney, or paralegal (protected)
 * @route   POST /api/auth/register-staff
 * @access  Private/Admin
 */
exports.registerStaff = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check if email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('Email already registered', 400));
  }

  // Create staff user with specified role
  const user = await User.create({
    name,
    email,
    password,
    role: ['admin', 'attorney', 'paralegal'].includes(role) ? role : 'paralegal',
  });

  createSendToken(user, 201, res);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  createSendToken(user, 200, res);
});

/**
 * @desc    Logout user / clear cookie
 * @route   GET /api/auth/logout
 * @access  Private
 */
exports.logout = catchAsync(async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = catchAsync(async (req, res, next) => {
  // User is already available in req.user due to protect middleware
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

/**
 * @desc    Update user profile
 * @route   PATCH /api/auth/updateme
 * @access  Private
 */
exports.updateMe = catchAsync(async (req, res, next) => {
  // Check if user is trying to update password
  if (req.body.password) {
    return next(new AppError('This route is not for password updates. Please use /updatepassword', 400));
  }

  // Filter out unwanted fields that shouldn't be updated
  const filteredBody = filterObj(req.body, 'name', 'email', 'phone', 'address');

  // Update user
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

/**
 * @desc    Update password
 * @route   PATCH /api/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // Check if posted current password is correct
  if (!(await user.matchPassword(currentPassword))) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Log user in with new password
  createSendToken(user, 200, res);
});

/**
 * @desc    Forgot password - send reset token
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  // Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send token to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

/**
 * @desc    Reset password using token
 * @route   PATCH /api/auth/resetpassword/:token
 * @access  Public
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // If token has not expired and there is a user, set new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Log the user in
  createSendToken(user, 200, res);
});

// Helper function to filter allowed fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

