const express = require('express');
const { login, register } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/login', (req, res, next) => {
    console.log('Login route triggered'); // Debug logging
    login(req, res, next);
});

router.post('/register', (req, res, next) => {
    console.log('Register route triggered'); // Debug logging
    register(req, res, next);
});

module.exports = router;
