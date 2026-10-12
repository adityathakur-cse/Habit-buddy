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
    const { title, description, category, reminder_time, archived, days_of_week } = req.body;
    const userId = req.user.id;

    const updatedHabit = await db.query(
      `UPDATE habits 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           category = COALESCE($3, category), 
           reminder_time = COALESCE($4, reminder_time), 
           archived = COALESCE($5, archived),
           days_of_week = COALESCE($6, days_of_week)
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [title, description, category, reminder_time, archived, days_of_week, id, userId]
    ).catch(async () => {
      // Fallback if days_of_week column not yet added
      return await db.query(
        `UPDATE habits 
         SET title = COALESCE($1, title), 
             description = COALESCE($2, description), 
             category = COALESCE($3, category), 
             reminder_time = COALESCE($4, reminder_time), 
             archived = COALESCE($5, archived)
         WHERE id = $6 AND user_id = $7 RETURNING *`,
        [title, description, category, reminder_time, archived, id, userId]
      );
    });

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

// Toggle habit completion for a specific date (defaults to today)
const toggleHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const logDate = req.body.date || new Date().toLocaleDateString('en-CA');

    // Check if habit belongs to user
    const habitCheck = await db.query('SELECT id FROM habits WHERE id = $1 AND user_id = $2', [id, userId]);
    if (habitCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found or unauthorized' });
    }

    // Check existing log for this day
    const existingLog = await db.query(
      'SELECT id, status FROM daily_logs WHERE habit_id = $1 AND log_date = $2::DATE',
      [id, logDate]
    );

    if (existingLog.rows.length > 0) {
      if (existingLog.rows[0].status === 'completed') {
        // Unmark / toggle off
        await db.query('DELETE FROM daily_logs WHERE id = $1', [existingLog.rows[0].id]);
        return res.json({ completed: false, message: 'Habit unmarked for today' });
      } else {
        await db.query('UPDATE daily_logs SET status = $1 WHERE id = $2', ['completed', existingLog.rows[0].id]);
        return res.json({ completed: true, message: 'Habit marked as completed' });
      }
    } else {
      await db.query(
        'INSERT INTO daily_logs (habit_id, user_id, log_date, status) VALUES ($1, $2, $3::DATE, $4)',
        [id, userId, logDate, 'completed']
      );
      return res.json({ completed: true, message: 'Habit marked as completed' });
    }
  } catch (error) {
    console.error('Toggle Habit Error:', error.message);
    res.status(500).json({ error: 'Server error while toggling habit' });
  }
};

// Quick date check-in / calendar toggle (works even with 0 pre-created habits)
const quickCheckIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetDate = req.body.date || new Date().toLocaleDateString('en-CA');

    let habit = await db.query('SELECT id FROM habits WHERE user_id = $1 LIMIT 1', [userId]);
    let habitId;
    if (habit.rows.length === 0) {
      const newHabit = await db.query(
        'INSERT INTO habits (user_id, title, description, category) VALUES ($1, $2, $3, $4) RETURNING id',
        [userId, 'Daily Consistency', 'Daily consistency check-in', 'General']
      );
      habitId = newHabit.rows[0].id;
    } else {
      habitId = habit.rows[0].id;
    }

    const existing = await db.query(
      'SELECT id, status FROM daily_logs WHERE user_id = $1 AND log_date = $2::DATE',
      [userId, targetDate]
    );

    if (existing.rows.length > 0) {
      await db.query('DELETE FROM daily_logs WHERE user_id = $1 AND log_date = $2::DATE', [userId, targetDate]);
      return res.json({ completed: false, message: 'Unmarked for ' + targetDate });
    } else {
      await db.query(
        'INSERT INTO daily_logs (habit_id, user_id, log_date, status) VALUES ($1, $2, $3::DATE, $4)',
        [habitId, userId, targetDate, 'completed']
      );
      return res.json({ completed: true, message: 'Marked consistent for ' + targetDate });
    }
  } catch (error) {
    console.error('Quick Checkin Error:', error.message);
    res.status(500).json({ error: 'Server error while checking in' });
  }
};

// Get consistency board data (heatmap logs over last 150 days)
const getConsistencyBoard = async (req, res) => {
  try {
    const userId = req.user.id;
    const clientDate = req.query.date || new Date().toLocaleDateString('en-CA');

    const logs = await db.query(
      `SELECT TO_CHAR(log_date, 'YYYY-MM-DD') as log_date, COUNT(*) as count 
       FROM daily_logs 
       WHERE user_id = $1 AND status = 'completed' AND log_date >= ($2::DATE - INTERVAL '150 days')
       GROUP BY log_date 
       ORDER BY log_date ASC`,
      [userId, clientDate]
    );

    // Also get today's completed habit IDs
    const todayLogs = await db.query(
      `SELECT habit_id FROM daily_logs 
       WHERE user_id = $1 AND log_date = $2::DATE AND status = 'completed'`,
      [userId, clientDate]
    );

    const completedHabitIds = todayLogs.rows.map(r => r.habit_id);

    // Calculate current streak
    const distinctDatesResult = await db.query(
      `SELECT DISTINCT TO_CHAR(log_date, 'YYYY-MM-DD') as log_date
       FROM daily_logs
       WHERE user_id = $1 AND status = 'completed'
       ORDER BY log_date DESC`,
      [userId]
    );

    const dates = distinctDatesResult.rows.map(r => r.log_date);
    let streak = 0;
    const checkDate = new Date(clientDate);
    const todayStr = clientDate;

    const yesterdayDate = new Date(checkDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toLocaleDateString('en-CA');

    let startDate = null;
    if (dates.includes(todayStr)) {
      startDate = new Date(checkDate);
    } else if (dates.includes(yesterdayStr)) {
      startDate = new Date(yesterdayDate);
    }

    if (startDate) {
      let curr = new Date(startDate);
      while (true) {
        const currStr = curr.toLocaleDateString('en-CA');
        if (dates.includes(currStr)) {
          streak++;
          curr.setDate(curr.getDate() - 1);
        } else {
          break;
        }
      }
    }

    res.json({
      heatmap: logs.rows,
      todayCompleted: completedHabitIds,
      currentStreak: streak,
      totalCompletions: dates.length,
    });
  } catch (error) {
    console.error('Get Consistency Board Error:', error.message);
    res.status(500).json({ error: 'Server error while fetching consistency board' });
  }
};

module.exports = {
  createHabit,
  getHabits,
  updateHabit,
  deleteHabit,
  toggleHabit,
  quickCheckIn,
  getConsistencyBoard,
};
