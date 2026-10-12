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

// Get current user profile and stats
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userResult = await db.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const habitsCount = await db.query(
      'SELECT COUNT(*) as count FROM habits WHERE user_id = $1',
      [userId]
    );

    const focusHours = await db.query(
      'SELECT COALESCE(SUM(duration_minutes), 0) as total_minutes FROM focus_sessions WHERE user_id = $1',
      [userId]
    );

    const logsCount = await db.query(
      'SELECT COUNT(*) as count FROM daily_logs WHERE user_id = $1 AND status = $2',
      [userId, 'completed']
    );

    res.json({
      user: userResult.rows[0],
      stats: {
        totalHabits: parseInt(habitsCount.rows[0].count, 10),
        totalCompletedDays: parseInt(logsCount.rows[0].count, 10),
        totalFocusMinutes: parseInt(focusHours.rows[0].total_minutes, 10),
        totalFocusHours: (parseInt(focusHours.rows[0].total_minutes, 10) / 60).toFixed(1),
      }
    });
  } catch (error) {
    console.error('Get Profile Error:', error.message);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
};

// Update profile info
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    // Check conflict
    const conflict = await db.query(
      'SELECT id FROM users WHERE (email = $1 OR username = $2) AND id != $3',
      [email, username, userId]
    );

    if (conflict.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already in use by another account' });
    }

    const result = await db.query(
      'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email, created_at',
      [username, email, userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete Account Error:', error.message);
    res.status(500).json({ error: 'Server error while deleting account' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  deleteAccount,
};
