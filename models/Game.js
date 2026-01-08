const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true
    },
    description: {
        type: String,
        required: true,
        index: true
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

// Create text indexes for better search performance
gameSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Game', gameSchema);
