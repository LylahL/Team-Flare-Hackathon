const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const createCase = catchAsync(async (req, res, next) => {
  const { title, description } = req.body;
  const newCase = await Case.create({ title, description, user: req.user._id });
  res.status(201).json({ case: newCase });
});

const getCases = catchAsync(async (req, res, next) => {
  const cases = await Case.find({ user: req.user._id });
  res.status(200).json({ cases });
});

module.exports = { createCase, getCases };

