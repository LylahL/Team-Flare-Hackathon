const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/auth.controller');

console.log('Login Function:', login);
console.log('Register Function:', register);

router.post('/login', (req, res, next) => {
    console.log('Login route triggered:', req.body);
    login(req, res, next);
});

router.post('/register', (req, res, next) => {
    console.log('Register route triggered:', req.body);
    register(req, res, next);
});

module.exports = router;

