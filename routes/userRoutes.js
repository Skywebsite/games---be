const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMe, addRecentlyPlayed } = require('../controllers/userController');

router.get('/me', protect, getMe);
router.post('/recently-played', protect, addRecentlyPlayed);

module.exports = router;
