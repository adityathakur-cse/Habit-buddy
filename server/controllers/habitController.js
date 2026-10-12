const db = require('../db');

// Create a new habit
const createHabit = async (req, res) => {
  try {
    const { title, description, category, reminder_time } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newHabit = await db.query(
      'INSERT INTO habits (user_id, title, description, category, reminder_time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, title, description, category, reminder_time]
    );

    res.status(201).json(newHabit.rows[0]);
  } catch (error) {
    console.error('Create Habit Error:', error.message);
    res.status(500).json({ error: 'Server error while creating habit' });
  }
};

// Get all habits for the logged-in user
const getHabits = async (req, res) => {
  try {
    const userId = req.user.id;
    const habits = await db.query(
      'SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(habits.rows);
  } catch (error) {
    console.error('Get Habits Error:', error.message);
    res.status(500).json({ error: 'Server error while fetching habits' });
  }
};

// Update a habit
const updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, reminder_time, archived } = req.body;
    const userId = req.user.id;

    const updatedHabit = await db.query(
      `UPDATE habits 
       SET title = $1, description = $2, category = $3, reminder_time = $4, archived = $5 
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [title, description, category, reminder_time, archived, id, userId]
    );

    if (updatedHabit.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found or unauthorized' });
    }

    res.json(updatedHabit.rows[0]);
  } catch (error) {
    console.error('Update Habit Error:', error.message);
    res.status(500).json({ error: 'Server error while updating habit' });
  }
};

// Delete a habit
const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deletedHabit = await db.query(
      'DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (deletedHabit.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found or unauthorized' });
    }

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Delete Habit Error:', error.message);
    res.status(500).json({ error: 'Server error while deleting habit' });
  }
};

module.exports = {
  createHabit,
  getHabits,
  updateHabit,
  deleteHabit,
};
