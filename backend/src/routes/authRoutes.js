import express from 'express';
import { register, login, logout, getProfile, updateProfile, forgotPassword, resetPassword } from '../controllers/authController.js';

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

export default router;

