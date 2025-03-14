const express = require('express');
const { login, register } = require('../controllers/auth.controller');
const router = express.Router();

console.log('Auth Routes loaded');
console.log('Login Function:', login);
console.log('Register Function:', register);

router.post('/login', (req, res, next) => {
    console.log('Login route triggered:', req.body); // Debug logging
    login(req, res, next);
});

router.post('/register', (req, res, next) => {
    console.log('Register route triggered:', req.body); // Debug logging
    register(req, res, next);
});

module.exports = router;

