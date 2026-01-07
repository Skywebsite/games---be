const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createRoom, joinRoom, getFriendsActiveRooms } = require('../controllers/roomController');

router.post('/create', protect, createRoom);
router.post('/join', protect, joinRoom);
router.get('/friends-active', protect, getFriendsActiveRooms);

module.exports = router;
