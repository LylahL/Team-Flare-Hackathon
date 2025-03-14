const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  deleteDocument,
} = require('../services/document.service');
const { authenticate } = require('../middleware/auth.middleware');

// Document Routes
router.post('/upload', authenticate, uploadDocument);
router.delete('/:id', authenticate, deleteDocument);

module.exports = router;

