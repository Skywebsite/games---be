const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getGames, getGameBySlug, createGame, updateGame, deleteGame } = require('../controllers/gameController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', getGames);
router.get('/:slug', getGameBySlug);
router.post('/', upload.fields([{ name: 'previewGif', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), createGame); // Should add admin auth middleware here
router.put('/:id', upload.fields([{ name: 'previewGif', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), updateGame); // Should add admin auth middleware here
router.delete('/:id', deleteGame); // Should add admin auth middleware here

module.exports = router;
