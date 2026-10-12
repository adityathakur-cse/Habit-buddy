const express = require('express');
const router = express.Router();
const { createReview, getReviews } = require('../controllers/reviewController');
const verifyToken = require('../middleware/authMiddleware');

// Get reviews is open to everyone
router.get('/', getReviews);

// Submitting a review requires auth
router.post('/', verifyToken, createReview);

module.exports = router;
