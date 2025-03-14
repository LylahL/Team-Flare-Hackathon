const express = require('express');
const router = express.Router();
const Assistant = require('../models/assistant.model');

// Assistant query route
router.post('/query', (req, res) => {
  res.status(200).json({ message: 'Query processed successfully' });
});

// Assistant session route
router.get('/session/:id', (req, res) => {
  res.status(200).json({ message: 'Session retrieved successfully' });
});

module.exports = router;

