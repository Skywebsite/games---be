const Game = require('../models/Game');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.getGames = async (req, res) => {
    try {
        const games = await Game.find({}).sort({ createdAt: -1 });
        res.json(games);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.searchGames = async (req, res) => {
    try {
        const { search, limit } = req.query;
        if (!search) {
            return res.json([]);
        }
        
        // Use MongoDB text search for better performance
        const query = Game.find(
            { $text: { $search: search } },
            { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' }, createdAt: -1 });
        
        // Apply limit if provided
        const games = limit ? await query.limit(parseInt(limit)) : await query;
        
        res.json(games);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateGame = async (req, res) => {
    console.log("updateGame Request Body:", req.body);
    console.log("updateGame Request Files:", req.files);

    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        const uploadToCloudinary = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: "auto", folder: "skygames_previews" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(fileBuffer);
            });
        };

        let { title, description, category, gameUrl, slug } = req.body;

        if (title !== undefined) game.title = title;
        if (description !== undefined) game.description = description;
        if (category !== undefined) game.category = category;
        if (gameUrl !== undefined) game.gameUrl = gameUrl;

        if (req.files) {
            if (req.files.previewGif) {
                const result = await uploadToCloudinary(req.files.previewGif[0].buffer);
                game.previewGif = result.secure_url;
            }
            if (req.files.thumbnail) {
                const result = await uploadToCloudinary(req.files.thumbnail[0].buffer);
                game.thumbnail = result.secure_url;
            }
        }

        if (!slug && title !== undefined) {
            slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        if (slug && slug !== game.slug) {
            const existingGame = await Game.findOne({ slug });
            if (existingGame && existingGame._id.toString() !== game._id.toString()) {
                slug = `${slug}-${Date.now()}`;
            }
            game.slug = slug;
        }

        const updatedGame = await game.save();
        res.json(updatedGame);
    } catch (error) {
        console.error("Error updating game:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getGameBySlug = async (req, res) => {
    try {
        const game = await Game.findOne({ slug: req.params.slug });
        if (game) {
            res.json(game);
        } else {
            res.status(404).json({ message: 'Game not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createGame = async (req, res) => {
    console.log("createGame Request Body:", req.body);
    console.log("createGame Request Files:", req.files);
    let { title, description, category, gameUrl, thumbnail, previewGif } = req.body;

    try {
        const uploadToCloudinary = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: "auto", folder: "skygames_previews" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(fileBuffer);
            });
        };

        if (req.files) {
            if (req.files.previewGif) {
                const result = await uploadToCloudinary(req.files.previewGif[0].buffer);
                previewGif = result.secure_url;
            }
            if (req.files.thumbnail) {
                const result = await uploadToCloudinary(req.files.thumbnail[0].buffer);
                thumbnail = result.secure_url;
            }
        }

        // Unique slug generation
        let slug = req.body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const existingGame = await Game.findOne({ slug });
        if (existingGame) {
            slug = `${slug}-${Date.now()}`;
        }

        const game = new Game({
            title,
            slug,
            description,
            category,
            gameUrl,
            thumbnail,
            previewGif
        });

        const createdGame = await game.save();
        res.status(201).json(createdGame);
    } catch (error) {
        console.error("Error creating game:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.deleteGame = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (game) {
            await game.deleteOne();
            res.json({ message: 'Game removed' });
        } else {
            res.status(404).json({ message: 'Game not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
