const express = require('express');
const { 
  register, 
  login, 
  logout, 
  getMe: getProfile, 
  updateMe: updateProfile, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/auth.controller');

const router = express.Router();

// Register user
router.post('/register', register);

// Login user
router.post('/login', login);

// Logout user
router.get('/logout', logout);

// Get user profile
router.get('/profile', getProfile);

// Update user profile
router.put('/profile', updateProfile);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);

module.exports = router;
