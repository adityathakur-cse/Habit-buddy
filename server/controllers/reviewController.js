const db = require('../db');

// Submit a review
const createReview = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const userId = req.user.id;

    if (!feedback || feedback.trim().length === 0) {
      return res.status(400).json({ error: 'Review feedback cannot be empty' });
    }

    const numericRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));

    const result = await db.query(
      `INSERT INTO reviews (user_id, rating, feedback) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [userId, numericRating, feedback.trim()]
    );

    // Fetch with username
    const reviewWithUser = await db.query(
      `SELECT r.*, u.username 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({
      message: 'Review submitted successfully',
      review: reviewWithUser.rows[0],
    });
  } catch (error) {
    console.error('Create Review Error:', error.message);
    res.status(500).json({ error: 'Server error while submitting review' });
  }
};

// Get all reviews (public or authenticated)
const getReviews = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.id, r.user_id, r.rating, r.feedback, r.created_at, u.username 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       ORDER BY r.created_at DESC 
       LIMIT 50`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get Reviews Error:', error.message);
    res.status(500).json({ error: 'Server error while fetching reviews' });
  }
};

module.exports = {
  createReview,
  getReviews,
};
