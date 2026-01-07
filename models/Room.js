const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ["waiting", "playing"],
        default: "waiting"
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
