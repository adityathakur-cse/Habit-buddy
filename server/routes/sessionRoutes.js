const express = require('express');
const router = express.Router();
const { logSession, getTodayFocus, getRecentSessions } = require('../controllers/sessionController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/', logSession);
router.get('/today', getTodayFocus);
router.get('/history', getRecentSessions);

module.exports = router;
