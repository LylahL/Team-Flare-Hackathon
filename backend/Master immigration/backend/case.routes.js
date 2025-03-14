const express = require('express');
const router = express.Router();
const caseController = require('../controllers/case.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Route for creating a case
router.post('/create', authMiddleware.verifyToken, caseController.createCase);

module.exports = router;

