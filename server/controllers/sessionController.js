const db = require('../db');

// Log a focus session (minutes or hours)
const logSession = async (req, res) => {
  try {
    const { duration_minutes, habit_name } = req.body;
    const userId = req.user.id;

    if (!duration_minutes || duration_minutes <= 0) {
      return res.status(400).json({ error: 'Valid duration in minutes is required' });
    }

    const result = await db.query(
      'INSERT INTO focus_sessions (user_id, duration_minutes) VALUES ($1, $2) RETURNING *',
      [userId, Math.round(duration_minutes)]
    );

    res.status(201).json({
      message: 'Focus session recorded successfully',
      session: result.rows[0],
    });
  } catch (error) {
    console.error('Log Session Error:', error.message);
    res.status(500).json({ error: 'Server error while logging session' });
  }
};

// Get today's total focus hours and stats
const getTodayFocus = async (req, res) => {
  try {
    const userId = req.user.id;

    const todayResult = await db.query(
      `SELECT COALESCE(SUM(duration_minutes), 0) as total_minutes, COUNT(*) as session_count
       FROM focus_sessions
       WHERE user_id = $1 AND DATE(completed_at) = CURRENT_DATE`,
      [userId]
    );

    const totalMinutes = parseInt(todayResult.rows[0].total_minutes, 10) || 0;
    const totalHours = parseFloat((totalMinutes / 60).toFixed(1));

    // Daily goal is 2 hours (120 minutes)
    const goalHours = 2.0;
    const progressPercent = Math.min(100, Math.round((totalHours / goalHours) * 100));

    res.json({
      totalMinutes,
      totalHours,
      sessionCount: parseInt(todayResult.rows[0].session_count, 10) || 0,
      goalHours,
      progressPercent,
    });
  } catch (error) {
    console.error('Get Today Focus Error:', error.message);
    res.status(500).json({ error: 'Server error while fetching focus stats' });
  }
};

// Get recent focus sessions
const getRecentSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT id, duration_minutes, completed_at
       FROM focus_sessions
       WHERE user_id = $1
       ORDER BY completed_at DESC
       LIMIT 10`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get Recent Sessions Error:', error.message);
    res.status(500).json({ error: 'Server error while fetching recent sessions' });
  }
};

module.exports = {
  logSession,
  getTodayFocus,
  getRecentSessions,
};
