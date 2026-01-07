const Room = require('../models/Room');
const User = require('../models/User');

const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SKY-${code}`;
};

exports.createRoom = async (req, res) => {
    const { gameId } = req.body;

    if (!gameId) {
        return res.status(400).json({ message: 'gameId is required' });
    }

    try {
        let roomCode;
        for (let i = 0; i < 5; i++) {
            roomCode = generateRoomCode();
            const exists = await Room.findOne({ roomCode });
            if (!exists) break;
            roomCode = null;
        }

        if (!roomCode) {
            return res.status(500).json({ message: 'Failed to generate unique room code' });
        }

        const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

        const room = await Room.create({
            roomCode,
            gameId,
            host: req.user._id,
            players: [req.user._id],
            status: 'waiting',
            expiresAt
        });

        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.joinRoom = async (req, res) => {
    const { roomCode } = req.body;

    if (!roomCode) {
        return res.status(400).json({ message: 'roomCode is required' });
    }

    try {
        const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (room.expiresAt && room.expiresAt.getTime() < Date.now()) {
            return res.status(400).json({ message: 'Room expired' });
        }

        const already = room.players.some((p) => p.toString() === req.user._id.toString());
        if (!already) {
            room.players.push(req.user._id);
        }

        await room.save();
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFriendsActiveRooms = async (req, res) => {
    try {
        const me = await User.findById(req.user._id).select('friends');
        const friends = me?.friends || [];

        if (!friends.length) {
            return res.json([]);
        }

        const rooms = await Room.find({
            host: { $in: friends },
            expiresAt: { $gt: new Date() }
        })
            .sort({ createdAt: -1 })
            .populate('host', 'username avatar')
            .populate('gameId', 'title thumbnail category slug');

        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
