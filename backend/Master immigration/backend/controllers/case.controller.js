const catchAsync = require('../utils/catchAsync');

const createCase = catchAsync(async (req, res) => {
    console.log('Create case request received:', req.body); // Debug logging
    // Create case logic
    res.status(201).json({ message: 'Case created' });
});

const getCase = catchAsync(async (req, res) => {
    const caseId = req.params.id;
    console.log('Get case request received for ID:', caseId); // Debug logging
    // Get case logic
    res.status(200).json({ message: 'Case retrieved' });
});

module.exports = { createCase, getCase };

