const login = (req, res, next) => {
    console.log('Login request received:', req.body); // Debug logging
    // Login logic
    res.status(200).json({ message: 'Login successful' });
};

const register = (req, res, next) => {
    console.log('Register request received:', req.body); // Debug logging
    // Register logic
    res.status(201).json({ message: 'User registered' });
};

module.exports = { login, register };

