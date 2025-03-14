const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/auth.controller');

console.log('Login Function:', login); // Debug logging
console.log('Register Function:', register); // Debug logging

router.post('/login', (req, res, next) => {
    console.log('Login route triggered:', req.body); // Debug logging
    login(req, res, next);
});

router.post('/register', (req, res, next) => {
    console.log('Register route triggered:', req.body); // Debug logging
    register(req, res, next);
});

module.exports = router;

