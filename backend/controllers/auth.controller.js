const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Admin and test users with hashed passwords
const preDefinedUsers = [
  {
    email: 'admin1@example.com',
    password: '$2b$10$exampleHash1', // Replace with actual hashed password
    role: 'admin'
  },
  {
    email: 'admin2@example.com',
    password: '$2b$10$exampleHash2', // Replace with actual hashed password
    role: 'admin'
  },
  {
    email: 'admin3@example.com',
    password: '$2b$10$exampleHash3', // Replace with actual hashed password
    role: 'admin'
  },
  {
    email: 'admin4@example.com',
    password: '$2b$10$exampleHash4', // Replace with actual hashed password
    role: 'admin'
  },
  {
    email: 'test1@example.com',
    password: '$2b$10$exampleHash5', // Replace with actual hashed password
    role: 'user'
  },
  {
    email: 'test2@example.com',
    password: '$2b$10$exampleHash6', // Replace with actual hashed password
    role: 'user'
  },
  {
    email: 'test3@example.com',
    password: '$2b$10$exampleHash7', // Replace with actual hashed password
    role: 'user'
  },
  {
    email: 'test4@example.com',
    password: '$2b$10$exampleHash8', // Replace with actual hashed password
    role: 'user'
  },
  {
    email: 'test5@example.com',
    password: '$2b$10$exampleHash9', // Replace with actual hashed password
    role: 'user'
  },
  {
    email: 'test6@example.com',
    password: '$2b$10$exampleHash10', // Replace with actual hashed password
    role: 'user'
  }
];

// Initialize predefined users in the database
const initializeUsers = async () => {
  for (const user of preDefinedUsers) {
    const existingUser = await User.findOne({ email: user.email });
    if (!existingUser) {
      const newUser = new User(user);
      await newUser.save();
    }
  }
};

initializeUsers();

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token, user: { email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const register = async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Email, password, and confirmation are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, role: 'user' });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: { email } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { login, register };
