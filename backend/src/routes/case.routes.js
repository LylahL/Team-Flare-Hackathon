const express = require('express');
const router = express.Router();
const caseController = require('../controllers/case.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');
const { validateBody, validateParams } = require('../middleware/validate.middleware');
const { caseValidation } = require('../validations/case.validation');
const { upload } = require('../middleware/upload.middleware');
const rateLimiter = require('../middleware/rateLimit.middleware');

// Apply authentication middleware to all case routes
router.use(authenticate);

/**
 * @route   GET /api/cases
 * @desc    Get all cases (with filtering and pagination)
 * @access  Private (Admin, Attorney, Paralegal)
 */
router.get(
  '/',
  authorize(['admin', 'attorney', 'paralegal']),
  rateLimiter.standardLimits,
  caseController.getAllCases
);

/**
 * @route   GET /api/cases/client/:clientId
 * @desc    Get all cases for a specific client
 * @access  Private (Admin, Attorney, Paralegal, Client)
 */
router.get(
  '/client/:clientId',
  authorize(['admin', 'attorney', 'paralegal', 'client']),
  validateParams(caseValidation.clientId),
  rateLimiter.standardLimits,
  caseController.getCasesByClient
);

/**
 * @route   GET /api/cases/:id
 * @desc    Get case by ID
 * @access  Private (Admin, Attorney, Paralegal, Client - if assigned)
 */
router.get(
  '/:id',
  validateParams(caseValidation.caseId),
  rateLimiter.standardLimits,
  caseController.getCaseById
);

/**
 * @route   POST /api/cases
 * @desc    Create a new case
 * @access  Private (Admin, Attorney, Paralegal)
 */
router.post(
  '/',
  authorize(['admin', 'attorney', 'paralegal']),
  validateBody(caseValidation.createCase),
  rateLimiter.strictLimits,
  caseController.createCase
);

/**
 * @route   PUT /api/cases/:id
 * @desc    Update case details
 * @access  Private (Admin, Attorney, Paralegal)
 */
router.put(
  '/:id',
  authorize(['admin', 'attorney', 'paralegal']),
  validateParams(caseValidation.caseId),
  validateBody(caseValidation.updateCase),
  rateLimiter.strictLimits,
  caseController.updateCase
);

/**
 * @route   DELETE /api/cases/:id
 * @desc    Delete a case
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authorize(['admin']),
  validateParams(caseValidation.caseId),
  rateLimiter.strictLimits,
  caseController.deleteCase
);

/**
 * @route   PATCH /api/cases/:id/status
 * @desc    Update case status
 * @access  Private (Admin, Attorney, Paralegal)
 */
router.patch(
  '/:id/status',
  authorize(['admin', 'attorney', 'paralegal']),
  validateParams(caseValidation.caseId),
  validateBody(caseValidation.updateStatus),
  rateLimiter.strictLimits,
  caseController.updateCaseStatus
);

/**
 * @route   GET /api/cases/:id/timeline
 * @desc    Get case timeline
 * @access  Private (Admin, Attorney, Paralegal, Client - if assigned)
 */
router.get(
  '/:id/timeline',
  validateParams(caseValidation.caseId),
  rateLimiter.standardLimits,
  caseController.getCaseTimeline
);

/**
 * @route   POST /api/cases/:id/documents
 * @desc    Upload document to a case
 * @access  Private (Admin, Attorney, Paralegal)
 */
router.post(
  '/:id/documents',
  authorize(['admin', 'attorney', 'paralegal']),
  validateParams(caseValidation.caseId),
  upload.single('document'),
  validateBody(caseValidation.documentUpload),
  rateLimiter.strictLimits,
  caseController.uploadDocument
);

/**
 * @route   GET /api/cases/:id/documents
 * @desc    Get all documents for a case
 * @access  Private (Admin, Attorney, Paralegal, Client - if assigned)
 */
router.get(
  '/:id/documents',
  validateParams(caseValidation.caseId),
  rateLimiter.standardLimits,
  caseController.getCaseDocuments
);

/**
 * @route   GET /api/cases/:caseId/documents/:documentId
 * @desc    Get document by ID
 * @access  Private (Admin, Attorney, Paralegal, Client - if assigned)
 */
router.get(
  '/:caseId/documents/:documentId',
  validateParams(caseValidation.documentParams),
  rateLimiter.standardLimits,
  caseController.getDocumentById
);

/**
 * @route   DELETE /api/cases/:caseId/documents/:documentId
 * @desc    Delete document
 * @access  Private (Admin, Attorney, Paralegal)
 */
router.delete(
  '/:caseId/documents/:documentId',
  authorize(['admin', 'attorney', 'paralegal']),
  validateParams(caseValidation.documentParams),
  rateLimiter.strictLimits,
  caseController.deleteDocument
);

/**
 * @route   PATCH /api/cases/:id/assignment
 * @desc    Assign/Reassign case to attorney/paralegal
 * @access  Private (Admin, Attorney)
 */
router.patch(
  '/:id/assignment',
  authorize(['admin', 'attorney']),
  validateParams(caseValidation.caseId),
  validateBody(caseValidation.assignCase),
  rateLimiter.strictLimits,
  caseController.assignCase
);

/**
 * @route   POST /api/cases/:id/share
 * @desc    Share case with another user (attorney, paralegal)
 * @access  Private (Admin, Attorney)
 */
router.post(
  '/:id/share',
  authorize(['admin', 'attorney']),
  validateParams(caseValidation.caseId),
  validateBody(caseValidation.shareCase),
  rateLimiter.strictLimits,
  caseController.shareCase
);

/**
 * @route   DELETE /api/cases/:id/share/:userId
 * @desc    Remove user from shared case
 * @access  Private (Admin, Attorney)
 */
router.delete(
  '/:id/share/:userId',
  authorize(['admin', 'attorney']),
  validateParams(caseValidation.shareParams),
  rateLimiter.strictLimits,
  caseController.removeSharedUser
);

/**
 * @route   POST /api/cases/:id/comments
 * @desc    Add comment to case
 * @access  Private (Admin, Attorney, Paralegal)
 */
router.post(
  '/:id/comments',
  authorize(['admin', 'attorney', 'paralegal']),
  validateParams(caseValidation.caseId),
  validateBody(caseValidation.createComment),
  rateLimiter.standardLimits,
  caseController.addComment
);

/**
 * @route   GET /api/cases/:id/comments
 * @desc    Get all comments for a case
 * @access  Private (Admin, Attorney, Paralegal)
 */
router.get(
  '/:id/comments',
  authorize(['admin', 'attorney', 'paralegal']),
  validateParams(caseValidation.caseId),
  rateLimiter.standardLimits,
  caseController.getComments
);

/**
 * @route   DELETE /api/cases/:caseId/comments/:commentId
 * @desc    Delete a comment
 * @access  Private (Admin, Attorney, Paralegal - if comment author)
 */
router.delete(
  '/:caseId/comments/:commentId',
  authorize(['admin', 'attorney', 'paralegal']),
  validateParams(caseValidation.commentParams),
  rateLimiter.standardLimits,
  caseController.deleteComment
);

/**
 * @route   POST /api/cases/:id/notes
 * @desc    Add private note to case (not visible to client)
 * @access  Private (Admin, Attorney, Paralegal)
 */
router.post(
  '/:id/notes',
  authorize(['admin', 'attorney', 'paralegal']),
  validateParams(caseValidation.caseId),
  validateBody(caseValidation.createNote),
  rateLimiter.standardLimits,
  caseController.addNote
);

/**
 * @route   GET /api/cases/:id/notes
 * @desc    Get all private notes for a case
 * @access  Private (Admin, Attorney, Paralegal)
 */
router.get(
  '/:id/notes',
  authorize(['admin', 'attorney', 'paralegal']),
  validateParams(caseValidation.caseId),
  rateLimiter.standardLimits,
  caseController.getNotes
);

/**
 * @route   DELETE /api/cases/:caseId/notes/:noteId
 * @desc    Delete a note
 * @access  Private (Admin, Attorney, Paralegal - if note author)
 */
router.delete(
  '/:caseId/notes/:noteId',
  authorize(['admin', 'attorney', 'paralegal']),
  validateParams(caseValidation.noteParams),
  rateLimiter.standardLimits,
  caseController.deleteNote
);

/**
 * @route   GET /api/cases/types
 * @desc    Get all case types
 * @access  Private (All authenticated users)
 */
router.get(
  '/types',
  rateLimiter.standardLimits,
  caseController.getCaseTypes
);

/**
 * @route   GET /api/cases/statuses
 * @desc    Get all possible case statuses
 * @access  Private (All authenticated users)
 */
router.get(
  '/statuses',
  rateLimiter.standardLimits,
  caseController.getCaseStatuses
);

/**
 * @route   POST /api/cases/:id/uscis-query
 * @desc    Query USCIS API for case status
 * @access  Private (Admin, Attorney, Paralegal)
 */
router.post(
  '/:id/uscis-query',
  authorize(['admin', 'attorney', 'paralegal']),
  validateParams(caseValidation.caseId),
  validateBody(caseValidation.uscisQuery),
  rateLimiter.strictLimits,
  caseController.queryUSCIS
);

module.exports = router;

const express = require('express');
const router = express.Router();
const caseController = require('../controllers/case.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Get all cases (with filtering) - accessible by admin, attorney, paralegal
router.get(
  '/', 
  authenticate, 
  authorize(['admin', 'attorney', 'paralegal']), 
  caseController.getAllCases
);

// Get cases for a specific client - accessible by admin, attorney, paralegal, and the client themselves
router.get(
  '/client/:clientId', 
  authenticate, 
  caseController.getClientCases
);

// Get a single case by ID - accessible by admin, attorney, paralegal, and case owner
router.get(
  '/:id', 
  authenticate, 
  caseController.getCaseById
);

// Create a new case - accessible by admin, attorney
router.post(
  '/', 
  authenticate, 
  authorize(['admin', 'attorney']), 
  caseController.createCase
);

// Update a case - accessible by admin, attorney, paralegal
router.put(
  '/:id', 
  authenticate, 
  authorize(['admin', 'attorney', 'paralegal']), 
  caseController.updateCase
);

// Delete a case - accessible by admin only
router.delete(
  '/:id', 
  authenticate, 
  authorize(['admin']), 
  caseController.deleteCase
);

// Add a document to a case - accessible by admin, attorney, paralegal, and case owner
router.post(
  '/:id/documents', 
  authenticate, 
  caseController.addCaseDocument
);

// Get all documents for a case - accessible by admin, attorney, paralegal, and case owner
router.get(
  '/:id/documents', 
  authenticate, 
  caseController.getCaseDocuments
);

// Change case status - accessible by admin, attorney
router.patch(
  '/:id/status', 
  authenticate, 
  authorize(['admin', 'attorney']), 
  caseController.updateCaseStatus
);

// Assign case to attorney/paralegal - accessible by admin
router.patch(
  '/:id/assign', 
  authenticate, 
  authorize(['admin']), 
  caseController.assignCase
);

// Add case notes - accessible by admin, attorney, paralegal
router.post(
  '/:id/notes', 
  authenticate, 
  authorize(['admin', 'attorney', 'paralegal']), 
  caseController.addCaseNote
);

// Get case notes - accessible by admin, attorney, paralegal
router.get(
  '/:id/notes', 
  authenticate, 
  authorize(['admin', 'attorney', 'paralegal']), 
  caseController.getCaseNotes
);

// Set case priority - accessible by admin, attorney
router.patch(
  '/:id/priority', 
  authenticate, 
  authorize(['admin', 'attorney']), 
  caseController.updateCasePriority
);

// Get case timeline - accessible by admin, attorney, paralegal, and case owner
router.get(
  '/:id/timeline', 
  authenticate, 
  caseController.getCaseTimeline
);

// Get case statistics - accessible by admin
router.get(
  '/statistics', 
  authenticate, 
  authorize(['admin']), 
  caseController.getCaseStatistics
);

module.exports = router;

