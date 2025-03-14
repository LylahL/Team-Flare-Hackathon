const express = require('express');
const { createCase, getCase } = require('../controllers/case.controller');
const router = express.Router();

router.post('/', (req, res, next) => {
    console.log('Create case route triggered:', req.body); // Debug logging
    createCase(req, res, next);
});

router.get('/:id', (req, res, next) => {
    console.log('Get case route triggered for ID:', req.params.id); // Debug logging
    getCase(req, res, next);
});

module.exports = router;

