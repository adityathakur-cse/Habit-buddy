const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getProfile, 
  updateProfile, 
  deleteAccount 
} = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private profile routes
router.get('/me', verifyToken, (req, res) => {
  res.json({
    message: 'Token is valid',
    user: req.user,
  });
});
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.delete('/profile', verifyToken, deleteAccount);

module.exports = router;

