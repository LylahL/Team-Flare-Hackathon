const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Route for user login
router.post('/login', authController.login);

// Route for user registration
router.post('/register', authController.register);

module.exports = router;

