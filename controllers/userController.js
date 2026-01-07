const User = require('../models/User');

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('friends', 'username avatar')
            .populate('recentlyPlayed.game', 'title thumbnail previewGif category slug');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Sort recently played desc (mongoose doesn't guarantee order after populate)
        const userObj = user.toObject();
        userObj.recentlyPlayed = (userObj.recentlyPlayed || [])
            .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
            .slice(0, 10);

        res.json(userObj);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addRecentlyPlayed = async (req, res) => {
    const { gameId } = req.body;

    if (!gameId) {
        return res.status(400).json({ message: 'gameId is required' });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.currentlyPlaying = gameId;

        const existingIndex = (user.recentlyPlayed || []).findIndex(
            (item) => item.game && item.game.toString() === gameId
        );

        if (existingIndex !== -1) {
            user.recentlyPlayed.splice(existingIndex, 1);
        }

        user.recentlyPlayed.unshift({ game: gameId, playedAt: new Date() });
        user.recentlyPlayed = user.recentlyPlayed.slice(0, 10);

        await user.save();

        res.json({ message: 'Recently played updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
