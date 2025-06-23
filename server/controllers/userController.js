// userController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const SECRET_KEY = 'supersecretkey'; // in production, use env vars!

// Register
const db = require('./db');

const registerUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [existing] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    await db.promise().query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
};


// Login
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await db.promise().query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    const user = users[0];

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

module.exports = { registerUser, loginUser };
