const express = require('express');
const router = express.Router();
const { createHabit, getHabits, updateHabit, deleteHabit } = require('../controllers/habitController');
const verifyToken = require('../middleware/authMiddleware');

// All habit routes require authentication
router.use(verifyToken);

// @route   POST /api/habits
router.post('/', createHabit);

// @route   GET /api/habits
router.get('/', getHabits);

// @route   PUT /api/habits/:id
router.put('/:id', updateHabit);

// @route   DELETE /api/habits/:id
router.delete('/:id', deleteHabit);

module.exports = router;
