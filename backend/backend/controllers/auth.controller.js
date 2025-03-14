const login = (req, res, next) => {
    console.log('Login request received:', req.body); // Debug logging
    res.status(200).json({ message: 'Login successful' }); // Example response
};

const register = (req, res, next) => {
    console.log('Register request received:', req.body); // Debug logging
    res.status(201).json({ message: 'User registered' }); // Example response
};

module.exports = { login, register };

