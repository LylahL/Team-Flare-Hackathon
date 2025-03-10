const Case = require('../models/immigrationCase.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Create a new immigration case
 * @route POST /api/cases
 * @access Private (Attorney, Admin)
 */
exports.createCase = catchAsync(async (req, res, next) => {
  // Check if user is authorized to create cases
  if (!['attorney', 'admin'].includes(req.user.role)) {
    return next(new AppError('Not authorized to create cases', 403));
  }

  // Create new case
  const newCase = await Case.create({
    ...req.body,
    createdBy: req.user.id,
    assignedTo: req.body.assignedTo || req.user.id,
    status: req.body.status || 'draft',
    createdAt: new Date()
  });

  res.status(201).json({
    status: 'success',
    data: {
      case: newCase
    }
  });
});

/**
 * Get all cases (with filtering, sorting, and pagination)
 * @route GET /api/cases
 * @access Private
 */
exports.getAllCases = catchAsync(async (req, res, next) => {
  // BUILD QUERY
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(field => delete queryObj[field]);

  // FILTERING
  // Handle role-based access restrictions
  if (req.user.role === 'client') {
    // Clients can only see their own cases
    queryObj.applicant = req.user.id;
  } else if (req.user.role === 'attorney' || req.user.role === 'paralegal') {
    // Attorneys & paralegals can see cases they're assigned to or created
    queryObj.$or = [
      { assignedTo: req.user.id },
      { createdBy: req.user.id }
    ];
  }
  // Admins can see all cases, so no additional filters needed

  // Advanced filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  let query = Case.find(JSON.parse(queryStr));

  // SORTING
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    // Default sort by creation date (newest first)
    query = query.sort('-createdAt');
  }

  // FIELD LIMITING
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    // Exclude __v field by default
    query = query.select('-__v');
  }

  // PAGINATION
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // Handle pagination edge cases
  if (req.query.page) {
    const numCases = await Case.countDocuments();
    if (skip >= numCases) {
      return next(new AppError('This page does not exist', 404));
    }
  }

  // EXECUTE QUERY
  const cases = await query.populate({
    path: 'assignedTo createdBy applicant',
    select: 'name email role'
  });

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: cases.length,
    data: {
      cases
    }
  });
});

/**
 * Get a single case by ID
 * @route GET /api/cases/:id
 * @access Private
 */
exports.getCase = catchAsync(async (req, res, next) => {
  const caseId = req.params.id;
  
  const foundCase = await Case.findById(caseId).populate({
    path: 'assignedTo createdBy applicant',
    select: 'name email role'
  });
  
  if (!foundCase) {
    return next(new AppError('No case found with that ID', 404));
  }

  // Check authorization
  const isAuthorized = 
    req.user.role === 'admin' || 
    req.user.id === foundCase.createdBy.id || 
    req.user.id === foundCase.assignedTo.id || 
    req.user.id === foundCase.applicant.id;
  
  if (!isAuthorized) {
    return next(new AppError('Not authorized to view this case', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      case: foundCase
    }
  });
});

/**
 * Update a case
 * @route PATCH /api/cases/:id
 * @access Private
 */
exports.updateCase = catchAsync(async (req, res, next) => {
  const caseId = req.params.id;
  
  // Find case without updating yet
  const foundCase = await Case.findById(caseId);
  
  if (!foundCase) {
    return next(new AppError('No case found with that ID', 404));
  }

  // Check authorization
  const canUpdate = 
    req.user.role === 'admin' || 
    req.user.id === foundCase.createdBy.toString() || 
    req.user.id === foundCase.assignedTo.toString();
  
  if (!canUpdate) {
    return next(new AppError('Not authorized to update this case', 403));
  }

  // Create an object with updates, including audit trail
  const updates = {
    ...req.body,
    updatedAt: new Date(),
    lastUpdatedBy: req.user.id,
    // Add to history array
    history: [
      ...foundCase.history || [],
      {
        status: foundCase.status,
        updatedAt: new Date(),
        updatedBy: req.user.id
      }
    ]
  };

  // Update case
  const updatedCase = await Case.findByIdAndUpdate(
    caseId,
    updates,
    {
      new: true, // Return updated document
      runValidators: true // Run validators for update
    }
  ).populate({
    path: 'assignedTo createdBy applicant',
    select: 'name email role'
  });

  res.status(200).json({
    status: 'success',
    data: {
      case: updatedCase
    }
  });
});

/**
 * Delete a case
 * @route DELETE /api/cases/:id
 * @access Private (Admin only)
 */
exports.deleteCase = catchAsync(async (req, res, next) => {
  const caseId = req.params.id;

  // Only admins can delete cases
  if (req.user.role !== 'admin') {
    return next(new AppError('Only administrators can delete cases', 403));
  }
  
  const caseToDelete = await Case.findByIdAndDelete(caseId);
  
  if (!caseToDelete) {
    return next(new AppError('No case found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
 * Get case statistics
 * @route GET /api/cases/stats
 * @access Private (Admin, Attorney)
 */
exports.getCaseStats = catchAsync(async (req, res, next) => {
  // Only admins and attorneys can view stats
  if (!['admin', 'attorney'].includes(req.user.role)) {
    return next(new AppError('Not authorized to view case statistics', 403));
  }

  // Match stage - filter cases based on user role
  const matchStage = {};
  if (req.user.role === 'attorney') {
    matchStage.$or = [
      { assignedTo: req.user.id },
      { createdBy: req.user.id }
    ];
  }

  const stats = await Case.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgProcessingTime: { 
          $avg: { 
            $cond: [
              { $and: [
                { $ne: ['$submittedAt', null] },
                { $ne: ['$updatedAt', null] }
              ]},
              { $subtract: ['$updatedAt', '$submittedAt'] },
              null
            ]
          }
        },
        cases: { $push: { id: '$_id', title: '$title', priority: '$priority' } }
      }
    },
    {
      $project: {
        count: 1,
        avgProcessingTime: { $divide: ['$avgProcessingTime', 24 * 60 * 60 * 1000] }, // Convert to days
        cases: { $slice: ['$cases', 5] } // Only include 5 sample cases per status
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

/**
 * Get all cases due within a specified timeframe
 * @route GET /api/cases/due
 * @access Private
 */
exports.getDueCases = catchAsync(async (req, res, next) => {
  // Parse days from query or default to 30 days
  const days = req.query.days ? parseInt(req.query.days, 10) : 30;
  
  // Calculate date range
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);
  
  // Build base query
  let query = {
    dueDate: { $gte: now, $lte: futureDate },
    status: { $ne: 'completed' }
  };
  
  // Apply role-based restrictions
  if (req.user.role === 'client') {
    query.applicant = req.user.id;
  } else if (req.user.role === 'attorney' || req.user.role === 'paralegal') {
    query.$or = [
      { assignedTo: req.user.id },
      { createdBy: req.user.id }
    ];
  }
  
  // Execute query
  const dueCases = await Case.find(query)
    .sort('dueDate')
    .populate({
      path: 'assignedTo createdBy applicant',
      select: 'name email role'
    });
  
  res.status(200).json({
    status: 'success',
    results: dueCases.length,
    data: {
      cases: dueCases
    }
  });
});

/**
 * Search cases by keyword
 * @route GET /api/cases/search
 * @access Private
 */
exports.searchCases = catchAsync(async (req, res, next) => {
  const { keyword } = req.query;
  
  if (!keyword) {
    return next(new AppError('Search keyword is required', 400));
  }
  
  // Build search query
  let searchQuery = {
    $or: [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { caseNumber: { $regex: keyword, $options: 'i' } },
      { 'applicantInfo.firstName': { $regex: keyword, $options: 'i' } },
      { 'applicantInfo.lastName': { $regex: keyword, $options: 'i' } },
      { notes: { $regex: keyword, $options: 'i' } }
    ]
  };
  
  // Apply role-based restrictions
  if (req.user.role === 'client') {
    searchQuery.applicant = req.user.id;
  } else if (req.user.role === 'attorney' || req.user.role === 'paralegal') {
    searchQuery.$and = [
      searchQuery,
      { $or: [
        { assignedTo: req.user.id },
        { createdBy: req.user.id }
      ]}
    ];
  }
  
  // Execute search
  const cases = await Case.find(searchQuery)
    .sort('-createdAt')
    .populate({
      path: 'assignedTo createdBy applicant',
      select: 'name email role'
    });
  
  res.status(200).json({
    status: 'success',
    results: cases.length,
    data: {
      cases
    }
  });
});

