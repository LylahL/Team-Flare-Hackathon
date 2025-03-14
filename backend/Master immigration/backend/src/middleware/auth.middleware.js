const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user.model');

const verifyToken = catchAsync(async (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return next(new AppError('No token provided.', 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('User not found.', 404));
  }
  req.user = user;
  next();
});

module.exports = { verifyToken };

