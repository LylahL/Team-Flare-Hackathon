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

