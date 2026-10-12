const express = require('express');
const router = express.Router();
const { 
  createHabit, 
  getHabits, 
  updateHabit, 
  deleteHabit, 
  toggleHabit, 
  getConsistencyBoard 
} = require('../controllers/habitController');
const verifyToken = require('../middleware/authMiddleware');

// All habit routes require authentication
router.use(verifyToken);

// Consistency board & logs
router.get('/board', getConsistencyBoard);

// Habit CRUD
router.post('/', createHabit);
router.get('/', getHabits);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/toggle', toggleHabit);

module.exports = router;

