const express = require('express');
const router = express.Router();
const {
  handleQuery,
  getConversations,
} = require('../controllers/assistant.controller');
const { authenticate } = require('../middleware/auth.middleware');

// AI Assistant Routes
router.post('/query', authenticate, handleQuery);
router.get('/conversations', authenticate, getConversations);

module.exports = router;

