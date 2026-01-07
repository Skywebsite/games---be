const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: ""
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    currentlyPlaying: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        default: null
    },
    recentlyPlayed: [{
        game: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game',
            required: true
        },
        playedAt: {
            type: Date,
            default: Date.now
        }
    }],
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
