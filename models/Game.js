const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    gameUrl: {
        type: String,
        required: true,
        comment: "URL for iframe or redirection"
    },
    thumbnail: {
        type: String, // URL to image
        required: true
    },
    previewGif: {
        type: String, // URL to GIF
        default: ""
    },
    plays: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);
