const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert into DB
    const newUser = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, passwordHash]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    let errorMessage = 'Server error during registration';
    if (error.code === '28P01') {
      errorMessage = 'Database authentication failed: incorrect PostgreSQL password in server/.env';
    } else if (error.code === '3D000') {
      errorMessage = 'Database "habitbuddy" does not exist in PostgreSQL. Please run CREATE DATABASE habitbuddy;';
    } else if (error.code === '42P01') {
      errorMessage = 'Table "users" does not exist. Please run schema.sql in your database.';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'PostgreSQL is not running or not reachable on port 5432.';
    }
    res.status(500).json({ error: errorMessage });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    let errorMessage = 'Server error during login';
    if (error.code === '28P01') {
      errorMessage = 'Database authentication failed: incorrect PostgreSQL password in server/.env';
    } else if (error.code === '3D000') {
      errorMessage = 'Database "habitbuddy" does not exist in PostgreSQL. Please run CREATE DATABASE habitbuddy;';
    } else if (error.code === '42P01') {
      errorMessage = 'Table "users" does not exist. Please run schema.sql in your database.';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'PostgreSQL is not running or not reachable on port 5432.';
    }
    res.status(500).json({ error: errorMessage });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
